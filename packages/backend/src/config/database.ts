import { Pool } from 'pg';
import { config } from './env';

export const pool = new Pool({
  connectionString: config.database.url,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await pool.connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};