import { ScraperService } from './lib/scraper';

async function main() {
    const service = new ScraperService();
    await service.runAll();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
