import { ScraperService } from './scraper';
import { db, backtestResults, hospitals } from '@medwait/db';
import fs from 'fs';
import path from 'path';

export class BacktestService {
    private scraper = new ScraperService();

    async runBacktest() {
        console.log('Starting backtest...');

        const hList = await db.select().from(hospitals);

        for (const hospital of hList) {
            const fixturePath = path.resolve(__dirname, `../../../fixtures/${hospital.adapter_key}/latest.html`);

            if (!fs.existsSync(fixturePath)) {
                console.warn(`No fixture found for ${hospital.name} (${hospital.adapter_key})`);
                continue;
            }

            const rawHtml = fs.readFileSync(fixturePath, 'utf-8');
            // Logic to run adapter.parse(rawHtml) directly and compare with expected
            // For MVP, we'll just run the scrape logic but with a mocked fetcher
            // This requires slight refactoring or specialized test adapters
        }

        console.log('Backtest completed.');
    }
}
