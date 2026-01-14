import { db, waitTimes, scrapeRuns, hospitals } from '@medwait/db';
import { AdapterRegistry } from './registry';
import { pino } from 'pino';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';
import { ScrapeStatus } from '@medwait/shared';

export class ScraperService {
    private registry = new AdapterRegistry();
    private logger = pino({
        level: process.env.LOG_LEVEL || 'info',
        transport: {
            target: 'pino-pretty'
        }
    });

    async runAll() {
        this.logger.info('Starting scrape run for all active hospitals');

        const activeHospitals = await db.select().from(hospitals).where(eq(hospitals.active, true));

        for (const hospital of activeHospitals) {
            try {
                await this.scrapeHospital(hospital.id, hospital.waittime_source_url, hospital.adapter_key);
            } catch (err) {
                this.logger.error({ hospitalId: hospital.id, err }, 'Failed to scrape hospital');
            }
        }

        this.logger.info('Finished all scrape runs');
    }

    async startSchedule(intervalMs: number = 30 * 60 * 1000) {
        this.logger.info({ intervalMs }, 'Starting scraper schedule');

        const run = async () => {
            await this.runAll();
            this.logger.info({ nextRunIn: intervalMs }, 'Sleeping until next run');
            setTimeout(run, intervalMs);
        };

        run();
    }

    async scrapeHospital(hospitalId: string, url: string | null, adapterKey: string) {
        if (!url) {
            this.logger.warn({ hospitalId }, 'No source URL provided for hospital');
            return;
        }

        const adapter = this.registry.get(adapterKey);
        if (!adapter) {
            this.logger.error({ adapterKey, hospitalId }, 'No adapter found for hospital');
            return;
        }

        const startTime = new Date();
        const runId = crypto.randomUUID();

        this.logger.info({ hospitalId, adapterKey }, 'Scraping hospital');

        const result = await adapter.scrape({
            hospitalId,
            sourceUrl: url,
            logger: this.logger
        });

        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        // Persist wait time
        if (result.status === 'OK') {
            await db.insert(waitTimes).values({
                hospitalId: result.hospital_id!,
                metricType: result.metric_type || 'ED_WAIT',
                waitMinutes: result.wait_minutes,
                lastUpdatedAt: result.last_updated_at,
                fetchedAt: result.fetched_at!,
                sourceUrl: result.source_url!,
                parseConfidence: result.parse_confidence!,
                parseMethod: result.parse_method!,
                rawExcerpt: result.raw_excerpt,
                rawHash: result.raw_hash!,
                status: result.status as string,
                errorMessage: result.error_message
            });
        }

        // Log scrape run
        await db.insert(scrapeRuns).values({
            hospitalId,
            startedAt: startTime,
            finishedAt: endTime,
            status: result.status as string,
            fetchMs: duration, // Simplification: including parse time here
            httpStatus: result.status === 'FETCH_FAIL' ? 500 : 200,
            error: result.error_message,
            rawHash: result.raw_hash
        });
    }
}
