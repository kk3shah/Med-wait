import { BaseAdapter, ScrapeContext } from './base';
import { WaitTimeRecord, ParseMethod } from '@medwait/shared';
import { fetch } from 'undici';

export class JsonEndpointAdapter extends BaseAdapter {
    key = 'json_endpoint';
    method: ParseMethod = 'json_api';

    constructor(
        private paths: {
            waitTime: string; // lodash-style path or simple key
            lastUpdated?: string;
        }
    ) {
        super();
    }

    protected async fetch(url: string): Promise<string> {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();
    }

    protected async parse(rawData: string, ctx: ScrapeContext): Promise<Partial<WaitTimeRecord>> {
        const data = JSON.parse(rawData);

        // Simple implementation of property access
        const getVal = (obj: any, path: string) => path.split('.').reduce((o, i) => o?.[i], obj);

        const waitValue = getVal(data, this.paths.waitTime);
        const waitMinutes = typeof waitValue === 'number' ? waitValue : parseInt(String(waitValue));

        let lastUpdated: Date | null = null;
        if (this.paths.lastUpdated) {
            const updatedValue = getVal(data, this.paths.lastUpdated);
            lastUpdated = updatedValue ? new Date(updatedValue) : null;
        }

        return {
            wait_minutes: isNaN(waitMinutes) ? null : waitMinutes,
            last_updated_at: lastUpdated,
            parse_confidence: !isNaN(waitMinutes) ? 1.0 : 0.1,
            raw_excerpt: rawData.substring(0, 100),
        };
    }
}
