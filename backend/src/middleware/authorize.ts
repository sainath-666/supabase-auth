import { Request, Response, NextFunction } from 'express';
import { cerbos } from '../cerbos/client.js';
import { pool } from '../database/index.js';

export function authorize(resourceKind: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user;
    if (!user) {
      console.warn(`[Authorization Failure]: Access denied to action ${action} on ${resourceKind}. User not authenticated.`);
      res.status(401).json({ error: 'Unauthorized: User context missing' });
      return;
    }

    try {
      let resourceAttributes: Record<string, any> = {};
      let resourceId = 'new';

      // If there is an ID in the route parameters, fetch the resource to populate attributes for Cerbos check
      if (req.params.id) {
        resourceId = req.params.id;
        const dbResult = await pool.query('SELECT * FROM employees WHERE id = $1', [resourceId]);
        if (dbResult.rows.length === 0) {
          console.warn(`[Authorization Failure]: Employee with ID ${resourceId} not found`);
          res.status(404).json({ error: 'Employee not found' });
          return;
        }
        resourceAttributes = dbResult.rows[0];
      } else if (action === 'create') {
        // For creation, we assume the resource will be owned by the creator
        resourceAttributes = {
          created_by: user.id,
          ...req.body
        };
      }

      // Query Cerbos policy engine
      const decision = await cerbos.checkResource({
        principal: {
          id: user.id,
          roles: [user.role],
          attr: {
            email: user.email,
          },
        },
        resource: {
          id: resourceId,
          kind: resourceKind,
          attr: resourceAttributes,
        },
        actions: [action],
      });

      const allowed = decision.isAllowed(action);

      if (!allowed) {
        console.warn(`[Authorization Failure]: User ${user.email} (Role: ${user.role}) denied action "${action}" on resource "${resourceKind}" (ID: ${resourceId})`);
        res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        return;
      }

      console.log(`[Authorization Success]: User ${user.email} (Role: ${user.role}) allowed action "${action}" on resource "${resourceKind}" (ID: ${resourceId})`);
      next();
    } catch (err: any) {
      console.error('[Authorization Error]: Cerbos check failed', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}
