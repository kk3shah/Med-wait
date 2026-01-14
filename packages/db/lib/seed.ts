import { db } from './index';
import { hospitals } from './schema';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

interface HospitalRecord {
    name: string;
    address: string;
    lat: string;
    lng: string;
    region: string;
    website: string;
    waittime_source_url: string;
    adapter_key: string;
    funding_rank: string;
}

async function seed() {
    const csvFilePath = path.resolve(__dirname, '../../../../data/ontario_hospitals_seed.csv');
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
    }) as HospitalRecord[];

    console.log(`Seeding ${records.length} hospitals...`);

    for (const record of records) {
        await db.insert(hospitals).values({
            name: record.name,
            address: record.address,
            lat: parseFloat(record.lat),
            lng: parseFloat(record.lng),
            region: record.region,
            website: record.website,
            waittime_source_url: record.waittime_source_url,
            adapter_key: record.adapter_key,
            active: true,
            funding_rank: parseInt(record.funding_rank),
        }).onConflictDoUpdate({
            target: hospitals.name,
            set: {
                address: record.address,
                lat: parseFloat(record.lat),
                lng: parseFloat(record.lng),
                region: record.region,
                website: record.website,
                waittime_source_url: record.waittime_source_url,
                adapter_key: record.adapter_key,
                funding_rank: parseInt(record.funding_rank),
            }
        });
    }

    console.log('Seeding completed.');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
