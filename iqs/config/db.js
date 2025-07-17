const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'iqs',
  password: 'honore',
  port: 5432,
});
console.log('Using DB config:', { user: 'postgres', database: 'iqs', password: 'honore' });

module.exports = pool;
