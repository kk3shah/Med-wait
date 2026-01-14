import { pgTable, text, integer, timestamp, boolean, doublePrecision, uuid, varchar } from 'drizzle-orm/pg-core';

export const hospitals = pgTable('hospitals', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull().unique(),
    address: text('address').notNull(),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    region: text('region').notNull(),
    website: text('website'),
    waittime_source_url: text('waittime_source_url'),
    adapter_key: text('adapter_key').notNull(),
    active: boolean('active').default(true).notNull(),
    notes: text('notes'),
    funding_rank: integer('funding_rank'), // For the user's specific ranking request
});

export const waitTimes = pgTable('wait_times', {
    id: uuid('id').defaultRandom().primaryKey(),
    hospitalId: uuid('hospital_id').references(() => hospitals.id).notNull(),
    metricType: varchar('metric_type', { length: 50 }).notNull(),
    waitMinutes: integer('wait_minutes'),
    lastUpdatedAt: timestamp('last_updated_at'),
    fetchedAt: timestamp('fetched_at').defaultNow().notNull(),
    sourceUrl: text('source_url').notNull(),
    parseConfidence: doublePrecision('parse_confidence').notNull(),
    parseMethod: varchar('parse_method', { length: 50 }).notNull(),
    rawExcerpt: text('raw_excerpt'),
    rawHash: varchar('raw_hash', { length: 64 }).notNull(),
    status: varchar('status', { length: 20 }).notNull(),
    errorMessage: text('error_message'),
});

export const scrapeRuns = pgTable('scrape_runs', {
    id: uuid('id').defaultRandom().primaryKey(),
    hospitalId: uuid('hospital_id').references(() => hospitals.id).notNull(),
    startedAt: timestamp('started_at').notNull(),
    finishedAt: timestamp('finished_at').notNull(),
    status: varchar('status', { length: 20 }).notNull(),
    fetchMs: integer('fetch_ms'),
    parseMs: integer('parse_ms'),
    httpStatus: integer('http_status'),
    error: text('error'),
    rawHash: varchar('raw_hash', { length: 64 }),
});

export const backtestResults = pgTable('backtest_results', {
    id: uuid('id').defaultRandom().primaryKey(),
    hospitalId: uuid('hospital_id').references(() => hospitals.id).notNull(),
    dateRangeStart: timestamp('date_range_start').notNull(),
    dateRangeEnd: timestamp('date_range_end').notNull(),
    successRate: doublePrecision('success_rate').notNull(),
    parseFailRate: doublePrecision('parse_fail_rate').notNull(),
    stalenessRate: doublePrecision('staleness_rate').notNull(),
    medianWaitDelta: integer('median_wait_delta'),
    confidenceMean: doublePrecision('confidence_mean').notNull(),
});
