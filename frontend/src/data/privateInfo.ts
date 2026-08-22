export interface PrivateInfo {
  dateOfBirth: string
  residingAddress: string
  nationality: string
  personalEmail: string
  gender: string
  maritalStatus: string
  dateOfJoining: string
  bankDetails: string
  accountNumber: string
  bankName: string
  ifscCode: string
  panNumber: string
  uanNumber: string
  employeeCode: string
}

export const DEFAULT_PRIVATE_INFO: PrivateInfo = {
  dateOfBirth: 'Not provided',
  residingAddress: 'Not provided',
  nationality: 'Not provided',
  personalEmail: 'Not provided',
  gender: 'Not provided',
  maritalStatus: 'Not provided',
  dateOfJoining: 'Not provided',
  bankDetails: 'Not provided',
  accountNumber: 'Not provided',
  bankName: 'Not provided',
  ifscCode: 'Not provided',
  panNumber: 'Not provided',
  uanNumber: 'Not provided',
  employeeCode: 'Not provided'
}
