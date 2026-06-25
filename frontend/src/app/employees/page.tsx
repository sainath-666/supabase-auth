'use client';

import React from 'react';
import { AppLayout } from '../../components/AppLayout';
import { useAuth } from '../../lib/auth-context';
import { apiRequest } from '../../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Shield, User, Landmark, Building, Calendar, Loader2 } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  department: string;
  salary: number;
  created_at: string;
  created_by: string;
}

export default function EmployeesListPage() {
  const { user, role, permissions } = useAuth();
  const queryClient = useQueryClient();

  const { data: employees, isLoading, error } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: () => apiRequest('/employees'),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/employees/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this employee record?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete employee record');
      }
    }
  };

  const canCreate = permissions?.employee.create ?? false;
  const canDelete = permissions?.employee.delete ?? false;

  const canEditRecord = (emp: Employee) => {
    if (role === 'Admin' || role === 'Manager') return true;
    if (role === 'Employee' && emp.created_by === user?.id) return true;
    return false;
  };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <AppLayout>
      <div className="space-y-6 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Employee Management</h1>
            <p className="text-slate-400 text-xs mt-1">
              Active Role: <span className="text-indigo-400 font-bold">{role}</span>. Actions are validated against your role in Cerbos policies.
            </p>
          </div>

          {canCreate && (
            <Link
              href="/employees/new"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm font-semibold">
            Failed to retrieve employee directory. Check backend connection and authorization policy.
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : !employees || employees.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
            No employee records found. Create one if your permissions allow!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((emp) => {
              const isOwner = emp.created_by === user?.id;
              const editable = canEditRecord(emp);

              return (
                <div
                  key={emp.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-100 text-base group-hover:text-indigo-300 transition-colors">
                          {emp.name}
                        </h3>
                        <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider block">
                          Employee UUID: {emp.id.substring(0, 8)}...
                        </span>
                      </div>

                      {isOwner && (
                        <span className="bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded-full text-[9px] font-bold">
                          OWN RECORD
                        </span>
                      )}
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-400 border-t border-slate-800/80 pt-3.5">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-indigo-400" />
                        <span>Department: <strong className="text-slate-300 font-semibold">{emp.department}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-indigo-400" />
                        <span>Salary: <strong className="text-slate-300 font-semibold">{formatter.format(emp.salary)}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-400" />
                        <span className="truncate">Created By: <strong className="text-slate-400 font-mono text-[10px]">{emp.created_by}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <span>Created At: <strong className="text-slate-400 font-semibold">{new Date(emp.created_at).toLocaleDateString()}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-slate-800/80 mt-6 pt-4">
                    {editable && (
                      <Link
                        href={`/employees/edit/${emp.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-950 hover:bg-indigo-950 text-slate-400 hover:text-indigo-400 border border-slate-800 hover:border-indigo-800/30 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-950 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-800/30 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
