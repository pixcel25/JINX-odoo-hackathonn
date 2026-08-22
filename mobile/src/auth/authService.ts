import * as SecureStore from "expo-secure-store";

export type Employee = {
  id: string;
  userId: string;
  loginId: string;
  displayName: string;
  email: string;
  role: "admin" | "hr" | "employee";
  token: string;
  paidLeaveAvailable?: number;
  sickLeaveAvailable?: number;
  casualLeaveAvailable?: number;
};

type LoginResult =
  | { status: "authenticated"; employee: Employee }
  | { status: "password-change-required"; employee: Employee };

export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthServiceError";
  }
}

const SESSION_KEY = "dayflow.employee.session.v2";
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.67.9.66:8000/api";

async function responseData(
  response: Response,
): Promise<Record<string, unknown>> {
  return (await response.json().catch(() => ({}))) as Record<string, unknown>;
}

export async function apiRequest<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new AuthServiceError(
      "We could not reach the HR service. Check that the backend is running.",
    );
  }

  const data = await responseData(response);
  if (!response.ok) {
    throw new AuthServiceError(
      typeof data.error === "string"
        ? data.error
        : "The HR request could not be completed.",
    );
  }
  return data as T;
}

function employeeFromResponse(data: Record<string, unknown>): Employee {
  const role =
    data.role === "admin" || data.role === "hr" ? data.role : "employee";
  return {
    id: String(data.id),
    userId: String(data.userId ?? data.id),
    loginId: String(data.loginId ?? data.employeeId),
    displayName: String(data.displayName ?? data.name ?? "Employee"),
    email: String(data.email ?? ""),
    role,
    token: String(data.token),
    paidLeaveAvailable: Number(data.paidLeaveAvailable ?? 0),
    sickLeaveAvailable: Number(data.sickLeaveAvailable ?? 0),
    casualLeaveAvailable: Number(data.casualLeaveAvailable ?? 0),
  };
}

export async function login(
  loginId: string,
  password: string,
): Promise<LoginResult> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/hr/auth/employee-login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId: loginId.trim(), password }),
    });
  } catch {
    throw new AuthServiceError(
      "We could not reach the HR service. Check that the backend is running.",
    );
  }

  const data = await responseData(response);
  if (!response.ok) {
    throw new AuthServiceError(
      typeof data.error === "string"
        ? data.error
        : "That login ID or password is not correct.",
    );
  }

  const employee = employeeFromResponse(data);
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(employee));
  return { status: "authenticated", employee };
}

export async function changePassword(
  loginId: string,
  nextPassword: string,
): Promise<Employee> {
  void loginId;
  void nextPassword;
  throw new AuthServiceError(
    "Password changes are managed by your HR administrator.",
  );
}

export async function loadSession(): Promise<Employee | null> {
  try {
    const storedSession = await SecureStore.getItemAsync(SESSION_KEY);
    return storedSession ? (JSON.parse(storedSession) as Employee) : null;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
