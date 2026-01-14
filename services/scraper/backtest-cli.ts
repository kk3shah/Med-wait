import { BacktestService } from './lib/backtest';

async function main() {
    const service = new BacktestService();
    await service.runBacktest();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
