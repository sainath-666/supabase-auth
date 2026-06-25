import { Request, Response } from 'express';
import { EmployeeService } from '../services/employee.service.js';
import { z } from 'zod';

const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  department: z.string().min(1, 'Department is required'),
  salary: z.number().positive('Salary must be a positive number'),
});

const employeeService = new EmployeeService();

export class EmployeeController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const employees = await employeeService.getAll();
      res.json(employees);
    } catch (err: any) {
      console.error('[Server Error]: Failed to retrieve employees list', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const employee = await employeeService.getById(id);
      if (!employee) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }
      res.json(employee);
    } catch (err: any) {
      console.error('[Server Error]: Failed to retrieve employee details', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validation = employeeSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Validation Error', details: validation.error.flatten() });
        return;
      }

      const { name, department, salary } = validation.data;
      const createdBy = req.user!.id; // from authenticate middleware

      const employee = await employeeService.create(name, department, salary, createdBy);
      res.status(201).json(employee);
    } catch (err: any) {
      console.error('[Server Error]: Failed to create employee', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validation = employeeSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Validation Error', details: validation.error.flatten() });
        return;
      }

      const { name, department, salary } = validation.data;
      const employee = await employeeService.update(id, name, department, salary);

      if (!employee) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }

      res.json(employee);
    } catch (err: any) {
      console.error('[Server Error]: Failed to update employee', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await employeeService.delete(id);
      if (!success) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }
      res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (err: any) {
      console.error('[Server Error]: Failed to delete employee', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
