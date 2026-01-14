import { WaitTimeRecord, ParseMethod, MetricType, ScrapeStatus } from '@medwait/shared';
import { pino } from 'pino';
import * as crypto from 'crypto';

export interface ScrapeContext {
    hospitalId: string;
    sourceUrl: string;
    logger: pino.Logger;
}

export abstract class BaseAdapter {
    abstract key: string;
    abstract method: ParseMethod;

    async scrape(ctx: ScrapeContext): Promise<Partial<WaitTimeRecord>> {
        const startTime = Date.now();
        try {
            const rawData = await this.fetch(ctx.sourceUrl);
            const hash = crypto.createHash('sha256').update(rawData).digest('hex');

            const result = await this.parse(rawData, ctx);

            return {
                ...result,
                hospital_id: ctx.hospitalId,
                source_url: ctx.sourceUrl,
                fetched_at: new Date(),
                raw_hash: hash,
                parse_method: this.method,
                status: 'OK' as ScrapeStatus,
            };
        } catch (error) {
            ctx.logger.error({ error, hospitalId: ctx.hospitalId }, 'Scrape failed');
            return {
                hospital_id: ctx.hospitalId,
                source_url: ctx.sourceUrl,
                fetched_at: new Date(),
                status: 'FETCH_FAIL' as ScrapeStatus,
                error_message: (error as Error).message,
            };
        }
    }

    protected abstract fetch(url: string): Promise<string>;
    protected abstract parse(rawData: string, ctx: ScrapeContext): Promise<Partial<WaitTimeRecord>>;
}
