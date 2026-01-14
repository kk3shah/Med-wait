import { db, hospitals, scrapeRuns } from '@medwait/db';
import { desc, eq, lt } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function tune() {
    console.log('Generating Tuning Report...');

    // 1. Identify top failures
    const failures = await db.select().from(scrapeRuns)
        .where(eq(scrapeRuns.status, 'PARSE_FAIL'))
        .orderBy(desc(scrapeRuns.startedAt))
        .limit(10);

    const report = {
        generatedAt: new Date().toISOString(),
        topFailures: failures.map(f => ({
            hospitalId: f.hospitalId,
            error: f.error,
            finishedAt: f.finishedAt
        }))
    };

    const reportPath = path.resolve(__dirname, '../../../reports/top_failures.json');
    if (!fs.existsSync(path.dirname(reportPath))) {
        fs.mkdirSync(path.dirname(reportPath));
    }
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`Report generated: ${reportPath}`);
    console.log('\n--- GUIDED CHECKLIST ---');
    console.log('1. Check if the hospital DOM structure changed.');
    console.log('2. Update selectors in services/scraper/lib/registry.ts.');
    console.log('3. Capture new HTML fixture for backtesting.');
    console.log('4. Re-run npm run backtest.');
}

tune().catch(console.error);
