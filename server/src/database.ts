import { Pool } from 'pg';

export const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'america1927',
    database: 'CONTROL_EQUIPOS',
    port: 5432
});
