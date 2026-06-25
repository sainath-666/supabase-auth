import { pool } from '../database/index.js';
export class EmployeeService {
    async getAll() {
        const result = await pool.query('SELECT * FROM employees ORDER BY created_at DESC');
        return result.rows;
    }
    async getById(id) {
        const result = await pool.query('SELECT * FROM employees WHERE id = $1', [id]);
        if (result.rows.length === 0)
            return null;
        return result.rows[0];
    }
    async create(name, department, salary, createdBy) {
        const result = await pool.query('INSERT INTO employees (name, department, salary, created_by) VALUES ($1, $2, $3, $4) RETURNING *', [name, department, salary, createdBy]);
        return result.rows[0];
    }
    async update(id, name, department, salary) {
        const result = await pool.query('UPDATE employees SET name = $1, department = $2, salary = $3 WHERE id = $4 RETURNING *', [name, department, salary, id]);
        if (result.rows.length === 0)
            return null;
        return result.rows[0];
    }
    async delete(id) {
        const result = await pool.query('DELETE FROM employees WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
}
