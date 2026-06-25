'use client';

import React, { useEffect, useState } from 'react';
import { subscribeToRequests, RequestLog } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { Shield, RefreshCw, Terminal, Eye, FileText, Database } from 'lucide-react';

export function DeveloperConsole() {
  const { jwtDecoded, permissions, role } = useAuth();
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [activeTab, setActiveTab] = useState<'inspector' | 'jwt' | 'cerbos' | 'policy'>('inspector');

  useEffect(() => {
    return subscribeToRequests((newLog) => {
      setLogs((prev) => {
        const idx = prev.findIndex((l) => l.id === newLog.id);
        if (idx > -1) {
          const updated = [...prev];
          updated[idx] = newLog;
          return updated;
        }
        return [newLog, ...prev].slice(0, 50); // limit to 50 logs
      });
    });
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all duration-300">
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-400 animate-pulse" />
          <h2 className="text-md font-bold tracking-wide uppercase text-indigo-300">Developer Console</h2>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 gap-1">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'inspector'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Request Inspector
          </button>
          <button
            onClick={() => setActiveTab('jwt')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'jwt'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            JWT Debugger
          </button>
          <button
            onClick={() => setActiveTab('cerbos')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'cerbos'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cerbos Decisions
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'policy'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Policy Reference
          </button>
        </div>
      </div>

      <div className="p-6 max-h-[450px] overflow-y-auto">
        {activeTab === 'inspector' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Intercepting outgoing API calls to Express Backend</span>
              <button
                onClick={() => setLogs([])}
                className="hover:text-red-400 flex items-center gap-1 text-slate-500"
              >
                Clear Logs
              </button>
            </div>
            {logs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm italic">
                No API requests intercepted yet. Make queries or submit forms to see activity.
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => {
                  const isError = log.status && log.status >= 400;
                  return (
                    <div
                      key={log.id}
                      className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-2 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              log.method === 'GET'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : log.method === 'POST'
                                ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                : log.method === 'PUT'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}
                          >
                            {log.method}
                          </span>
                          <span className="text-slate-300 font-semibold">{log.url}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">{log.timestamp}</span>
                          {log.status ? (
                            <span
                              className={`px-2 py-0.5 rounded font-bold ${
                                isError
                                  ? 'bg-red-950 text-red-400 border border-red-800'
                                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              }`}
                            >
                              {log.status} {log.statusText}
                            </span>
                          ) : (
                            <span className="text-slate-500 animate-pulse">Pending...</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-900">
                        <div>
                          <div className="text-slate-500 font-semibold mb-1">Request Headers:</div>
                          <pre className="text-slate-400 bg-slate-900/50 p-2 rounded max-h-[100px] overflow-auto">
                            {JSON.stringify(log.headers, null, 2)}
                          </pre>
                          {log.body && (
                            <>
                              <div className="text-slate-500 font-semibold mt-2 mb-1">Request Body:</div>
                              <pre className="text-slate-400 bg-slate-900/50 p-2 rounded max-h-[100px] overflow-auto">
                                {JSON.stringify(log.body, null, 2)}
                              </pre>
                            </>
                          )}
                        </div>
                        <div>
                          <div className="text-slate-500 font-semibold mb-1">Response Payload:</div>
                          <pre className="text-slate-400 bg-slate-900/50 p-2 rounded max-h-[180px] overflow-auto">
                            {JSON.stringify(log.responseBody, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'jwt' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between text-xs text-slate-400 font-sans">
              <span>Supabase Access Token (Decoded payload structure)</span>
              <span className="text-indigo-400">Authenticated via Supabase Auth</span>
            </div>
            {jwtDecoded ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                  <div className="text-indigo-400 font-bold mb-2">JWT Decoded Payload</div>
                  <pre className="text-slate-300 max-h-[300px] overflow-auto">
                    {JSON.stringify(jwtDecoded, null, 2)}
                  </pre>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-4 font-sans text-sm">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">User Identifier (sub)</h4>
                    <p className="text-slate-200 font-mono text-xs bg-slate-900 p-2 rounded border border-slate-800">{jwtDecoded.sub}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">User Email</h4>
                    <p className="text-slate-200 font-mono text-xs bg-slate-900 p-2 rounded border border-slate-800">{jwtDecoded.email}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Role Assigned in Metadata</h4>
                    <p className="text-indigo-400 font-bold font-mono text-xs bg-slate-900 p-2 rounded border border-slate-800">
                      {jwtDecoded.user_metadata?.role || 'Viewer'}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed">
                    This JWT is automatically attached to the <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300">Authorization</code> header. The Express backend validates this token against the Supabase JWT secret and extracts the user context before checking Cerbos.
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 italic text-sm font-sans">
                No active token. Please log in.
              </div>
            )}
          </div>
        )}

        {activeTab === 'cerbos' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400 leading-relaxed">
              Cerbos evaluates permissions dynamically on every request. The table below represents the active evaluation results returned by the backend permission API endpoint.
            </div>
            {permissions ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold">
                    <Shield className="w-4 h-4" />
                    <span>Cerbos Principal</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-slate-500">id:</span> <span className="text-slate-300">{jwtDecoded?.sub}</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-slate-500">role:</span> <span className="text-emerald-400 font-bold">{role}</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 bg-slate-950 border border-slate-800 p-4 rounded-lg">
                  <div className="text-indigo-400 font-bold mb-3 flex items-center justify-between">
                    <span>Evaluated Actions: &apos;employee&apos;</span>
                    <span className="text-xs text-slate-500 font-normal">Resolved attributes: owner</span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(permissions.employee).map(([action, allowed]) => (
                      <div
                        key={action}
                        className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 hover:border-slate-700 transition"
                      >
                        <span className="font-mono text-xs text-slate-300 font-semibold">{action}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            allowed
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                              : 'bg-red-950/80 text-red-400 border border-red-800'
                          }`}
                        >
                          {allowed ? 'ALLOWED' : 'DENIED'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 italic text-sm">
                Evaluating permissions...
              </div>
            )}
          </div>
        )}

        {activeTab === 'policy' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400 leading-relaxed">
              Below is the logical configuration of your Cerbos Policy defined in <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-300">cerbos/policies/employee.yaml</code>.
            </div>
            <pre className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-slate-300 font-mono text-xs max-h-[300px] overflow-auto leading-relaxed">
{`---
apiVersion: api.cerbos.dev/v1
resourcePolicy:
  version: "default"
  resource: employee
  rules:
    # Admin can do everything
    - actions: ["create", "read", "update", "delete", "list"]
      effect: EFFECT_ALLOW
      roles:
        - Admin

    # Manager can create, read, update, list (no delete)
    - actions: ["create", "read", "update", "list"]
      effect: EFFECT_ALLOW
      roles:
        - Manager

    # Employee can read, list, and update own records
    - actions: ["read", "list"]
      effect: EFFECT_ALLOW
      roles:
        - Employee

    - actions: ["update"]
      effect: EFFECT_ALLOW
      roles:
        - Employee
      condition:
        match:
          expr: request.resource.attr.created_by == request.principal.id

    # Viewer can read and list
    - actions: ["read", "list"]
      effect: EFFECT_ALLOW
      roles:
        - Viewer`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
