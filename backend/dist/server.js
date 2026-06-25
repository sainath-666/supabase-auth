import app from './app.js';
import { config } from './config/index.js';
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`[Server]: Backend running on port ${PORT}`);
    console.log(`[Server]: Configured Cerbos URL at ${config.cerbosUrl}`);
    console.log(`[Server]: Configured Supabase URL at ${config.supabaseUrl}`);
});
