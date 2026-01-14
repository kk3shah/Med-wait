import fastify from 'fastify';
import cors from '@fastify/cors';
import { db, hospitals, waitTimes } from '@medwait/db';
import { desc, eq, inArray } from 'drizzle-orm';
import { calculateScore, getStatus, ScoredHospital } from './scoring';
import { z } from 'zod';

const server = fastify({ logger: true });

server.register(cors, { origin: '*' });

const RecommendationsQuery = z.object({
    lat: z.string().transform(Number),
    lng: z.string().transform(Number),
    mode: z.enum(['drive', 'transit']).default('drive')
});

server.get('/api/recommendations', async (request, reply) => {
    const result = RecommendationsQuery.safeParse(request.query);
    if (!result.success) {
        return reply.status(400).send(result.error);
    }

    const { lat, lng } = result.data;

    // 1. Fetch all active hospitals
    const activeHospitals = await db.select().from(hospitals).where(eq(hospitals.active, true));

    // 2. Fetch latest wait time for each
    const hospitalIds = activeHospitals.map(h => h.id);
    // This is an MVP simplification: we'll just get the latest record for each hospital
    // Ideally use a specialized query or lateral join
    const latestRecordsRaw = await db.select().from(waitTimes)
        .where(inArray(waitTimes.hospitalId, hospitalIds))
        .orderBy(desc(waitTimes.fetchedAt));

    const latestRecordsMap = new Map();
    for (const record of latestRecordsRaw) {
        if (!latestRecordsMap.has(record.hospitalId)) {
            latestRecordsMap.set(record.hospitalId, record);
        }
    }

    // 3. Calculate scores and rank
    const recommendations: ScoredHospital[] = activeHospitals.map(h => {
        const latest = latestRecordsMap.get(h.id) || null;

        // MVP: Haversine distance stub (1.2x factor for actual road distance approx)
        const distanceKm = haversine(lat, lng, h.lat, h.lng);
        const travelMinutes = distanceKm * 1.5; // Average speed estimate

        const score = calculateScore(h as any, latest as any, travelMinutes);

        return {
            hospital: h as any,
            latestRecord: latest as any,
            travelMinutes,
            score,
            status: getStatus(score, latest as any)
        };
    });

    // Sort by score (lower is better)
    recommendations.sort((a, b) => a.score - b.score);

    return recommendations;
});

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const start = async () => {
    try {
        await server.listen({ port: 3001, host: '0.0.0.0' });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
