import { Hospital, WaitTimeRecord, SCORING_WEIGHTS } from '@medwait/shared';

export interface ScoredHospital {
    hospital: Hospital;
    latestRecord: WaitTimeRecord | null;
    travelMinutes: number;
    score: number;
    status: 'HIGH' | 'MEDIUM' | 'LOW' | 'NO_DATA';
}

export function calculateScore(
    hospital: Hospital,
    latestRecord: WaitTimeRecord | null,
    travelMinutes: number
): number {
    let score = travelMinutes;

    if (!latestRecord || latestRecord.status !== 'OK' || latestRecord.wait_minutes === null) {
        // Penalty for no data
        return score + 1000;
    }

    // Adjusted wait (simplified MVP: 1.0 factor)
    const adjustedWait = latestRecord.wait_minutes * SCORING_WEIGHTS.wait_time;
    score += adjustedWait;

    // Freshness penalty
    const minutesSinceFetched = (Date.now() - new Date(latestRecord.fetched_at).getTime()) / 60000;
    let freshnessPenalty = 0;

    if (latestRecord.last_updated_at) {
        const minutesSinceUpdated = (Date.now() - new Date(latestRecord.last_updated_at).getTime()) / 60000;
        freshnessPenalty = Math.max(0, minutesSinceUpdated - 30) * SCORING_WEIGHTS.freshness_penalty_factor;
    } else {
        freshnessPenalty = minutesSinceFetched * 0.3 + SCORING_WEIGHTS.lack_of_timestamp_penalty;
    }
    score += freshnessPenalty;

    // Confidence penalty
    const confidencePenalty = (1 - latestRecord.parse_confidence) * SCORING_WEIGHTS.confidence_penalty_factor;
    score += confidencePenalty;

    return score;
}

export function getStatus(score: number, latestRecord: WaitTimeRecord | null): ScoredHospital['status'] {
    if (!latestRecord || latestRecord.status !== 'OK' || latestRecord.wait_minutes === null) return 'NO_DATA';
    if (latestRecord.parse_confidence < 0.5) return 'LOW';
    if (latestRecord.parse_confidence < 0.8) return 'MEDIUM';
    return 'HIGH';
}
