export const GLOBAL_RATE_LIMIT = 60; // req/min
export const DOMAIN_RATE_LIMIT = 10; // req/min
export const SCRAPE_INTERVAL_MINUTES = 15;
export const STALENESS_THRESHOLD_MINUTES = 30;

export const SCORING_WEIGHTS = {
    wait_time: 1.0,
    travel_time: 1.0,
    freshness_penalty_factor: 0.5,
    lack_of_timestamp_penalty: 15,
    confidence_penalty_factor: 20
};
