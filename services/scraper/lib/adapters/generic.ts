import { BaseAdapter, ScrapeContext } from './base';
import { WaitTimeRecord, ParseMethod } from '@medwait/shared';
import * as cheerio from 'cheerio';
import { fetch } from 'undici';

export class GenericSelectorAdapter extends BaseAdapter {
    key = 'generic_selector';
    method: ParseMethod = 'dom_selector';

    constructor(
        private selectors: {
            waitTime: string;
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
        const $ = cheerio.load(rawData);

        const waitText = $(this.selectors.waitTime).text().trim();
        const waitMinutes = this.parseWaitMinutes(waitText);

        let lastUpdated: Date | null = null;
        if (this.selectors.lastUpdated) {
            const updatedText = $(this.selectors.lastUpdated).text().trim();
            lastUpdated = this.parseDate(updatedText);
        }

        return {
            wait_minutes: waitMinutes,
            last_updated_at: lastUpdated,
            parse_confidence: waitMinutes !== null ? 0.9 : 0.1,
            raw_excerpt: waitText.substring(0, 100),
        };
    }

    private parseWaitMinutes(text: string): number | null {
        const match = text.match(/(\d+)/);
        return match ? parseInt(match[1]) : null;
    }

    private parseDate(text: string): Date | null {
        const date = new Date(text);
        return isNaN(date.getTime()) ? null : date;
    }
}
