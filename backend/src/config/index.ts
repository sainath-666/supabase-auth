import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || '5000',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET || '',
  cerbosUrl: process.env.CERBOS_URL || 'http://localhost:3592',
  databaseUrl: process.env.DATABASE_URL || '',
};

// Validate critical config
const required = ['supabaseUrl', 'supabaseServiceKey', 'supabaseJwtSecret'];
for (const key of required) {
  if (!config[key as keyof typeof config]) {
    console.warn(`[Config Warning]: Missing environment variable for ${key}`);
  }
}
