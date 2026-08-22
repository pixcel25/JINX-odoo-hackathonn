import { apiRequest } from "../../../auth/authService";

export type PayrollDetails = {
  id: string | null;
  userId: string;
  payGrade: string;
  baseSalary: string;
  allowances: string;
  taxDeduction: string;
  baseSalaryValue: string;
  allowancesValue: string;
  deductionsValue: string;
  netSalaryValue: string;
  monthWage: string;
  yearlyWage: string;
};

export async function getPayroll(
  token: string,
): Promise<PayrollDetails | null> {
  const response = await apiRequest<{ payroll: PayrollDetails[] }>(
    "/hr/payroll/",
    token,
  );
  return response.payroll[0] ?? null;
}
