'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '../../../../components/AppLayout';
import { apiRequest } from '../../../../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

interface Employee {
  id: string;
  name: string;
  department: string;
  salary: number;
  created_at: string;
  created_by: string;
}

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [salary, setSalary] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: employee, isLoading, error: fetchError } = useQuery<Employee>({
    queryKey: ['employee', id],
    queryFn: () => apiRequest(`/employees/${id}`),
    enabled: !!id,
  });

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setDepartment(employee.department);
      setSalary(employee.salary.toString());
    }
  }, [employee]);

  const mutation = useMutation({
    mutationFn: (data: { name: string; department: string; salary: number }) =>
      apiRequest(`/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      router.push('/employees');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const salNum = parseFloat(salary);
    if (isNaN(salNum) || salNum <= 0) {
      setError('Salary must be a positive number');
      return;
    }

    try {
      await mutation.mutateAsync({ name, department, salary: salNum });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update employee record');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto space-y-6 font-sans">
        <div className="flex items-center gap-4">
          <Link
            href="/employees"
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-white">Edit Employee</h1>
            <p className="text-slate-500 text-xs mt-0.5">Modify parameters for registered employee</p>
          </div>
        </div>

        {fetchError && (
          <div className="bg-red-950/50 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm font-semibold">
            Failed to retrieve employee details. You may not have access or the record doesn&apos;t exist.
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : employee ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
            {error && (
              <div className="mb-6 bg-red-950/50 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-300">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 block w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-semibold text-slate-300">
                  Department
                </label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-2 block w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-semibold text-slate-300">
                  Annual Salary (USD)
                </label>
                <input
                  id="salary"
                  type="number"
                  required
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="mt-2 block w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                />
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Employee...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Employee
                  </>
                )}
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
