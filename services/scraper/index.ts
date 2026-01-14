import { ScraperService } from './lib/scraper';

async function main() {
    const service = new ScraperService();
    await service.startSchedule();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
