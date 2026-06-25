import { supabaseAdmin } from '../supabase/client.js';
import { cerbos } from '../cerbos/client.js';
import { z } from 'zod';
const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['Admin', 'Manager', 'Employee', 'Viewer']).default('Viewer'),
});
const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password is required'),
});
export class AuthController {
    async signup(req, res) {
        try {
            const validation = signupSchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({ error: 'Validation Error', details: validation.error.flatten() });
                return;
            }
            const { email, password, role } = validation.data;
            // Create user using Supabase Admin Auth
            const { data, error } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { role }
            });
            if (error) {
                console.warn('[Auth Failure]: Signup failed', error.message);
                res.status(400).json({ error: error.message });
                return;
            }
            console.log(`[Auth Success]: User ${email} registered with role ${role}`);
            res.status(201).json({ message: 'User created successfully', user: data.user });
        }
        catch (err) {
            console.error('[Server Error]: Signup exception', err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async login(req, res) {
        try {
            const validation = loginSchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({ error: 'Validation Error', details: validation.error.flatten() });
                return;
            }
            const { email, password } = validation.data;
            // Sign in with password
            const { data, error } = await supabaseAdmin.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                console.warn('[Auth Failure]: Login failed', error.message);
                res.status(400).json({ error: error.message });
                return;
            }
            console.log(`[Auth Success]: User ${email} logged in`);
            res.json({
                session: data.session,
                user: data.user,
            });
        }
        catch (err) {
            console.error('[Server Error]: Login exception', err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async profile(req, res) {
        // req.user is populated by authenticate middleware
        res.json({ user: req.user });
    }
    async permissions(req, res) {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            // Check actions on 'employee' resource kind
            // We will perform a generic check to populate standard action allowances.
            // To see if Employee can update "own" record, we pass attributes where they are the owner
            const actions = ['create', 'read', 'update', 'delete', 'list'];
            const decision = await cerbos.checkResource({
                principal: {
                    id: user.id,
                    roles: [user.role],
                    attr: {
                        email: user.email,
                    },
                },
                resource: {
                    id: 'check-permissions-id',
                    kind: 'employee',
                    // We can specify owned attributes to check if update is generally possible under ownership
                    attr: {
                        created_by: user.id,
                    },
                },
                actions,
            });
            const permissions = {
                employee: {
                    create: decision.isAllowed('create'),
                    read: decision.isAllowed('read'),
                    update: decision.isAllowed('update'), // true if owner since we set created_by: user.id above
                    delete: decision.isAllowed('delete'),
                    list: decision.isAllowed('list')
                }
            };
            res.json(permissions);
        }
        catch (err) {
            console.error('[Server Error]: Permissions evaluation failed', err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
