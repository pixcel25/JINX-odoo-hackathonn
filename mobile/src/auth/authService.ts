import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

export type Employee = {
  loginId: string;
  displayName: string;
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

const ACCOUNT_KEY = 'dayflow.employee.account.v1';
const INITIAL_LOGIN_ID = 'employee@dayflow.com';
const INITIAL_PASSWORD = 'Dayflow@123';

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

  if (loginId.trim().toLowerCase() !== account.loginId || passwordHash !== account.passwordHash) {
    throw new AuthServiceError('That login ID or password is not correct.');
  }

  const employee = { loginId: account.loginId, displayName: account.displayName };
  return account.mustChangePassword
    ? { status: 'password-change-required', employee }
    : { status: 'authenticated', employee };
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
