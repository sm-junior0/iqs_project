const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://iqs_user:aI3UuOLH9SoUlDBugrAtxLZYlEU88ulU@dpg-d1sjku24d50c739f1q1g-a.oregon-postgres.render.com/iqs?sslmode=require',
});

console.log('Using DB connection string for Render Postgres (external hostname)');

module.exports = pool;
