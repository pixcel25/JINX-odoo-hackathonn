export interface SalaryStructure {
  payGrade: string
  baseSalary: string
  allowances: string
  taxDeduction: string
  monthWage?: string
  yearlyWage?: string
  workingDays?: string
  workingHours?: string
  basicSalary?: string
  houseRentAllowance?: string
  standardAllowance?: string
  performanceBonus?: string
  leaveTravelAllowance?: string
  fixedAllowance?: string
  providentFundEmployee?: string
  providentFundEmployer?: string
  professionalTax?: string
}

export interface SalaryLog {
  id: string
  changedAt: string
  oldSalary: SalaryStructure
  newSalary: SalaryStructure
}

export const DEFAULT_SALARY_STRUCTURE: SalaryStructure = {
  payGrade: 'Level 4 - Senior Engineer',
  baseSalary: '$110,000 / annum',
  allowances: '$18,000 / annum',
  taxDeduction: 'Standard Corporate Slab',
  monthWage: '50000',
  yearlyWage: '600000',
  workingDays: '22',
  workingHours: '8',
  basicSalary: '25000.00',
  houseRentAllowance: '12500.00',
  standardAllowance: '4167.00',
  performanceBonus: '2082.50',
  leaveTravelAllowance: '2082.50',
  fixedAllowance: '2918.00',
  providentFundEmployee: '3000.00',
  providentFundEmployer: '3000.00',
  professionalTax: '200.00'
}
