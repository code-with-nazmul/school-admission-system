import {
  ClassItem,
  CreateClassPayload,
  HoldResponse,
  ConfirmHoldResponse,
  StudentHold,
  ApiError,
} from '../types';

declare global {
  interface Window {
    __ENV__?: {
      VITE_API_URL?: string;
    };
  }
}

const API_BASE_URL =
  (typeof window !== 'undefined' && window.__ENV__?.VITE_API_URL) ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8080';

export class ApiClientError extends Error {
  public status: number;
  public errorType: string;

  constructor(message: string, status: number = 400, errorType: string = 'Error') {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.errorType = errorType;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  studentId?: string,
): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (studentId) {
    headers.set('X-Student-Id', studentId);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return {} as T;
    }

    if (!response.ok) {
      let errorData: ApiError = {
        error: 'Request Failed',
        message: 'অনুরোধটি সম্পন্ন করা যায়নি।',
      };

      try {
        errorData = await response.json();
      } catch {
        // Fallback for non-JSON error bodies
        if (response.status === 409) {
          errorData = { error: 'Conflict', message: 'দুঃখিত, কোনো আসন খালি নেই।' };
        } else if (response.status === 404) {
          errorData = { error: 'Not Found', message: 'তথ্যটি পাওয়া যায়নি।' };
        } else if (response.status === 403) {
          errorData = { error: 'Forbidden', message: 'এই কাজের জন্য আপনার অনুমতি নেই।' };
        }
      }

      throw new ApiClientError(
        errorData.message || 'অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে।',
        response.status,
        errorData.error,
      );
    }

    return await response.json();
  } catch (err: unknown) {
    if (err instanceof ApiClientError) {
      throw err;
    }

    // Network error or server unreachable
    throw new ApiClientError(
      'সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে নিশ্চিত করুন ব্যাকএন্ড চালু আছে।',
      0,
      'NetworkError',
    );
  }
}

export const api = {
  // Classes
  getClasses: () => request<ClassItem[]>('/classes'),

  getClassById: (classId: string) => request<ClassItem>(`/classes/${classId}`),

  createClass: (payload: CreateClassPayload) =>
    request<ClassItem>('/classes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Holds
  createHold: (classId: string, studentId: string) =>
    request<HoldResponse>(
      `/classes/${classId}/holds`,
      { method: 'POST' },
      studentId,
    ),

  getHoldById: (holdId: string) => request<HoldResponse>(`/holds/${holdId}`),

  confirmHold: (holdId: string, studentId: string) =>
    request<ConfirmHoldResponse>(
      `/holds/${holdId}/confirm`,
      { method: 'POST' },
      studentId,
    ),

  cancelHold: (holdId: string, studentId: string) =>
    request<void>(
      `/holds/${holdId}`,
      { method: 'DELETE' },
      studentId,
    ),

  // Student specific
  getMyHolds: (studentId: string) =>
    request<StudentHold[]>('/me/holds', { method: 'GET' }, studentId),
};

