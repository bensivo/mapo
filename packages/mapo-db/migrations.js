const pg = require('pg');
// const postgres = require('postgres');
const dotenv = require('dotenv');


async function main() {
    dotenv.config();

    const connectionString = process.env.POSTGRES_CONNECTION_STRING;

    const client = new pg.Client({
        connectionString: connectionString,
    })
    await client.connect();


    // Create the migrations table
    let res = await client.query(`
        CREATE TABLE IF NOT EXISTS migrations (
            name TEXT PRIMARY KEY,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);


    // Get existing migrations
    const existingMigrations = await client.query('SELECT * FROM migrations');

    const migrations = [
        {
            name: '001-create-mindmaps-table',
            sql: `
                CREATE TABLE mindmaps (
                    id SERIAL PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `
        },
        {
            name: '002-mindmaps-enable-row-level-security',
            sql: `
                ALTER TABLE mindmaps ENABLE ROW LEVEL SECURITY;
            `
        },
        {
            // TODO: in the future, we will not want to allow public access on mindmaps
            name: '003-mindmaps-allow-public-access',
            sql: `
                CREATE POLICY "Allow public access" on mindmaps FOR SELECT TO anon USING (true);
            `,
        },
    ];

    for (const migration of migrations) {
        const existingMigration = existingMigrations.rows.find(row => row.name === migration.name);
        if (existingMigration) {
            console.log('Migration already run: ', migration.name);
            continue;
        }

        console.log(`Running migration: ${migration.name} ${migration.sql}`);
        try {
            await client.query('BEGIN');
            await client.query(migration.sql);
            await client.query('INSERT INTO migrations (name) VALUES ($1)', [migration.name]);
            await client.query('COMMIT');
        } catch (e) {
            console.error('Migration failed: ', migration.name, e);
            await client.query('ROLLBACK');
        }
    }

    await client.end();
}

main();