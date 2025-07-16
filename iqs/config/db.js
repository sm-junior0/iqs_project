const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'iqs',
  password: '1234',
  port: 5432,
});
console.log('Using DB config:', { user: 'postgres', database: 'iqs', password: '1234' });

module.exports = pool;
