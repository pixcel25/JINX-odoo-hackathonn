import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

export type Employee = {
  id?: number;
  loginId: string;
  displayName: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  joinedAt?: string;
  title?: string;
  department?: string;
  manager?: string;
  location?: string;
};

type StoredAccount = Employee & {
  passwordHash: string;
  mustChangePassword: boolean;
};

type LoginResult =
  | { status: 'authenticated'; employee: Employee }
  | { status: 'password-change-required'; employee: Employee };

export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

function mapEmployeeResponse(data: Record<string, unknown>): Employee {
  const loginId = typeof data.employeeId === 'string' ? data.employeeId : '';
  const displayName = typeof data.displayName === 'string' ? data.displayName : '';

  if (!loginId || !displayName) {
    throw new AuthServiceError('The employee profile returned by the service is incomplete.');
  }

  return {
    id: typeof data.id === 'number' ? data.id : undefined,
    loginId,
    displayName,
    name: typeof data.name === 'string' ? data.name : displayName,
    email: typeof data.email === 'string' ? data.email : undefined,
    phone: typeof data.phone === 'string' ? data.phone : undefined,
    company: typeof data.company === 'string' ? data.company : undefined,
    joinedAt: typeof data.joinedAt === 'string' ? data.joinedAt : undefined,
  };
}

const ACCOUNT_KEY = 'dayflow.employee.account.v1';
const INITIAL_LOGIN_ID = 'employee@dayflow.com';
const INITIAL_PASSWORD = 'Dayflow@123';
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.1.14.110:8000/api';

async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
}

async function readAccount(): Promise<StoredAccount> {
  try {
    const storedAccount = await SecureStore.getItemAsync(ACCOUNT_KEY);

    if (storedAccount) {
      return JSON.parse(storedAccount) as StoredAccount;
    }

    const account: StoredAccount = {
      loginId: INITIAL_LOGIN_ID,
      displayName: 'Dayflow Employee',
      passwordHash: await hashPassword(INITIAL_PASSWORD),
      mustChangePassword: true,
    };

    await SecureStore.setItemAsync(ACCOUNT_KEY, JSON.stringify(account));
    return account;
  } catch {
    throw new AuthServiceError('We could not access your secure account data. Please try again.');
  }
}

export async function login(loginId: string, password: string): Promise<LoginResult> {
  const account = await readAccount();
  const passwordHash = await hashPassword(password);

  if (loginId.trim().toLowerCase() === account.loginId && passwordHash === account.passwordHash) {
    const employee = { loginId: account.loginId, displayName: account.displayName };
    return account.mustChangePassword
      ? { status: 'password-change-required', employee }
      : { status: 'authenticated', employee };
  }

  if (!loginId.includes('@')) {
    let response: Response;
    try {
      response = await fetch(`${API_URL}/auth/employee-login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: loginId.trim(), password }),
      });
    } catch {
      throw new AuthServiceError('We could not reach the employee service. Check that the backend is running.');
    }

    const data = await response.json().catch(() => ({}));
    if (!data || typeof data !== 'object') {
      throw new AuthServiceError('The employee service returned an invalid profile.');
    }
    if (!response.ok) {
      const message = 'error' in data && typeof data.error === 'string'
        ? data.error
        : 'That employee ID or password is not correct.';
      throw new AuthServiceError(message);
    }

    return {
      status: 'authenticated',
      employee: mapEmployeeResponse(data as Record<string, unknown>),
    };
  }

  if (loginId.trim().toLowerCase() !== account.loginId || passwordHash !== account.passwordHash) {
    throw new AuthServiceError('That login ID or password is not correct.');
  }

  throw new AuthServiceError('That login ID or password is not correct.');
}

export async function changePassword(
  loginId: string,
  nextPassword: string,
): Promise<Employee> {
  const account = await readAccount();

  if (loginId.trim().toLowerCase() !== account.loginId || !account.mustChangePassword) {
    throw new AuthServiceError('This password change request is no longer valid. Please sign in again.');
  }

  const updatedAccount: StoredAccount = {
    ...account,
    passwordHash: await hashPassword(nextPassword),
    mustChangePassword: false,
  };

  try {
    await SecureStore.setItemAsync(ACCOUNT_KEY, JSON.stringify(updatedAccount));
  } catch {
    throw new AuthServiceError('Your new password could not be saved securely. Please try again.');
  }

  return { loginId: updatedAccount.loginId, displayName: updatedAccount.displayName };
}
