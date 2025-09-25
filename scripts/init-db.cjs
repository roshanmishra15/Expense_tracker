// Create target database and enable pgcrypto extension (CommonJS)
const { Client } = require('pg');

async function ensureDatabase() {
	const adminConnectionString = 'postgresql://postgres:admin@localhost:5432/postgres';
	const targetDbName = 'expensetracker_db';

	const admin = new Client({ connectionString: adminConnectionString });
	await admin.connect();
	try {
		const existsRes = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDbName]);
		if (existsRes.rowCount === 0) {
			await admin.query(`CREATE DATABASE ${targetDbName}`);
			console.log(`Created database ${targetDbName}`);
		} else {
			console.log(`Database ${targetDbName} already exists`);
		}
	} finally {
		await admin.end();
	}

	const db = new Client({ connectionString: `postgresql://postgres:admin@localhost:5432/${targetDbName}` });
	await db.connect();
	try {
		await db.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
		console.log('Ensured pgcrypto extension');
	} finally {
		await db.end();
	}

	console.log('Database ready.');
}

ensureDatabase().catch((err) => {
	console.error(err);
	process.exit(1);
});
