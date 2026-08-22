export interface SalaryStructure {
  payGrade: string
  baseSalary: string
  allowances: string
  taxDeduction: string
}

export const DEFAULT_SALARY_STRUCTURE: SalaryStructure = {
  payGrade: 'Level 4 - Senior Engineer',
  baseSalary: '$110,000 / annum',
  allowances: '$18,000 / annum',
  taxDeduction: 'Standard Corporate Slab'
}
