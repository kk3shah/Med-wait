import { BaseAdapter, ScrapeContext } from './base';
import { WaitTimeRecord, ParseMethod } from '@medwait/shared';
import { fetch } from 'undici';

export class RegexAdapter extends BaseAdapter {
    key = 'regex_pattern';
    method: ParseMethod = 'html_regex';

    constructor(
        private patterns: {
            waitTime: RegExp;
            lastUpdated?: RegExp;
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
        const waitMatch = rawData.match(this.patterns.waitTime);
        const waitMinutes = waitMatch ? parseInt(waitMatch[1]) : null;

        let lastUpdated: Date | null = null;
        if (this.patterns.lastUpdated) {
            const updatedMatch = rawData.match(this.patterns.lastUpdated);
            lastUpdated = updatedMatch ? new Date(updatedMatch[1]) : null;
        }

        return {
            wait_minutes: waitMinutes,
            last_updated_at: lastUpdated && !isNaN(lastUpdated.getTime()) ? lastUpdated : null,
            parse_confidence: waitMinutes !== null ? 0.7 : 0.1,
            raw_excerpt: waitMatch ? waitMatch[0] : null,
        };
    }
}
