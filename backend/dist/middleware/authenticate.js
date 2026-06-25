import { supabaseAdmin } from '../supabase/client.js';
export async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('[Auth Failure]: No token provided or invalid format');
        res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) {
            console.warn('[Auth Failure]: Supabase token verification failed', error?.message);
            res.status(401).json({ error: 'Unauthorized: Invalid token' });
            return;
        }
        const role = user.user_metadata?.role || 'Viewer';
        const authUser = {
            id: user.id,
            email: user.email || '',
            role,
        };
        req.user = authUser;
        console.log(`[Auth Success]: User ${authUser.email} with role ${authUser.role} authenticated`);
        next();
    }
    catch (err) {
        console.error('[Auth Error]: Exception caught during authentication', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
