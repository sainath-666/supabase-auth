import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface RequestLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  status?: number;
  statusText?: string;
  responseBody?: any;
}

type RequestLogListener = (log: RequestLog) => void;
const listeners = new Set<RequestLogListener>();

export function subscribeToRequests(listener: RequestLogListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function logRequest(log: RequestLog) {
  listeners.forEach((l) => l(log));
}

export async function apiRequest(path: string, options: RequestInit = {}) {
  const url = `${API_URL}${path}`;
  const session = (await supabase.auth.getSession()).data.session;
  const token = session?.access_token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const logId = Math.random().toString(36).substring(2, 9);
  const currentLog: RequestLog = {
    id: logId,
    timestamp: new Date().toLocaleTimeString(),
    method: options.method || 'GET',
    url,
    headers: { ...headers },
    body: options.body ? JSON.parse(options.body as string) : undefined,
  };

  logRequest(currentLog);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    currentLog.status = response.status;
    currentLog.statusText = response.statusText;

    const text = await response.text();
    let responseData;
    try {
      responseData = text ? JSON.parse(text) : null;
    } catch {
      responseData = text;
    }

    currentLog.responseBody = responseData;
    logRequest({ ...currentLog });

    if (!response.ok) {
      throw {
        status: response.status,
        message: responseData?.error || responseData?.message || 'API request failed',
        details: responseData?.details,
      };
    }

    return responseData;
  } catch (error: any) {
    if (!currentLog.status) {
      currentLog.status = 500;
      currentLog.statusText = 'Network Error';
      currentLog.responseBody = { error: error.message };
      logRequest({ ...currentLog });
    }
    throw error;
  }
}
