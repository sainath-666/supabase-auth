import { Pool } from 'pg';
import { config } from '../config/index.js';
export const pool = new Pool({
    connectionString: config.databaseUrl,
    // For local development, disable SSL if using localhost, but enable or keep optional for Supabase
    ssl: config.databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false }
});
pool.on('connect', () => {
    console.log('[Database]: Pool connected successfully');
});
pool.on('error', (err) => {
    console.error('[Database Error]: Unexpected error on idle database client', err);
});
