import React, { useState } from 'react'
import { DEFAULT_SALARY_STRUCTURE } from '../data/salary'
import type { SalaryStructure } from '../data/salary'
import { DEFAULT_PRIVATE_INFO } from '../data/privateInfo'
import type { PrivateInfo } from '../data/privateInfo'

export interface AttendanceRecord {
  date: string
  status: 'Present' | 'Absent' | 'On Leave' | 'Late' | 'Sick Leave'
  checkIn: string
  checkOut: string
  workHours: string
}

export interface LeaveHistoryItem {
  id: string
  leaveType: string
  startDate: string
  endDate: string
  days: number
  reason: string
  status: 'Approved' | 'Pending' | 'Refused'
}

export interface Employee {
  id: string
  name: string
  title: string
  empId: string
  dept: string
  status: 'Present' | 'Absent' | 'On Leave' | 'Late' | 'Sick Leave'
  email: string
  phone: string
  company: string
  manager: string
  location: string
  checkIn?: string
  checkOut?: string
  workHours?: string
  about: string
  jobLove: string
  hobbies: string
  skills: string[]
  certifications: string[]
  avatarUrl?: string
  initials?: string
  paidLeaveAvailable?: number
  sickLeaveAvailable?: number
  casualLeaveAvailable?: number
  attendanceHistory?: AttendanceRecord[]
  leaveHistory?: LeaveHistoryItem[]
}

interface EmployeeDetailsModalProps {
  employee: Employee | null
  onClose: () => void
  showAllTabs?: boolean
  defaultTab?: 'Attendance History' | 'Leave & Time Off' | 'Private Info' | 'Resume' | 'Salary Info' | 'Security'
  salary?: SalaryStructure
  onSaveSalary?: (salary: SalaryStructure) => Promise<void>
  salarySaving?: boolean
  salaryError?: string
  privateInfo?: PrivateInfo
  onSavePrivateInfo?: (privateInfo: PrivateInfo) => void
}

export const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
  employee,
  onClose,
  showAllTabs = true,
  defaultTab,
  salary = DEFAULT_SALARY_STRUCTURE,
  onSaveSalary,
  salarySaving = false,
  salaryError = '',
  privateInfo = DEFAULT_PRIVATE_INFO,
  onSavePrivateInfo
}) => {
  const initialActiveTab = defaultTab || (showAllTabs ? 'Attendance History' : 'Leave & Time Off')
  const [activeTab, setActiveTab] = useState<
    'Attendance History' | 'Leave & Time Off' | 'Private Info' | 'Resume' | 'Salary Info' | 'Security'
  >(initialActiveTab)
  const [editedSalary, setEditedSalary] = useState<SalaryStructure>({ ...DEFAULT_SALARY_STRUCTURE, ...salary })
  const [isEditingSalary, setIsEditingSalary] = useState(false)
  const [editedPrivateInfo, setEditedPrivateInfo] = useState<PrivateInfo>({ ...DEFAULT_PRIVATE_INFO, ...privateInfo })
  const [isEditingPrivateInfo, setIsEditingPrivateInfo] = useState(false)

  const handleSalarySave = async () => {
    if (!onSaveSalary) return
    await onSaveSalary(editedSalary)
    setIsEditingSalary(false)
  }

  const updatePrivateField = (field: keyof PrivateInfo, value: string) => {
    setEditedPrivateInfo((current) => ({ ...current, [field]: value }))
  }

  if (!employee) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content profile-popup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="popup-title-wrap">
            <h2>Employee Details & Track Record</h2>
            <span className="popup-emp-id">ID: {employee.empId}</span>
          </div>
          <button className="close-btn" onClick={onClose} title="Close Modal">✕</button>
        </div>

        <div className="modal-body-scrollable">
          {/* Employee Details Banner Card */}
          <div className="profile-banner-box">
            <div className="profile-avatar-pencil-wrap">
              {employee.avatarUrl ? (
                <img src={employee.avatarUrl} alt={employee.name} className="profile-circle-avatar" />
              ) : (
                <div className="profile-circle-initials">{employee.initials || 'EP'}</div>
              )}
              <button className="avatar-edit-pencil" title="Edit Profile Photo">✎</button>
            </div>

            {/* Profile Fields Grid */}
            <div className="profile-fields-grid">
              <div className="fields-col">
                <div className="name-field-row">
                  <h2 className="profile-name-heading">{employee.name}</h2>
                  <button className="inline-pencil-btn" title="Edit Name">✎</button>
                </div>

                <div className="field-line-item">
                  <span className="field-key">Login ID</span>
                  <span className="field-val-line">{employee.empId}</span>
                </div>

                <div className="field-line-item">
                  <span className="field-key">Email</span>
                  <span className="field-val-line">{employee.email}</span>
                </div>

                <div className="field-line-item">
                  <span className="field-key">Mobile</span>
                  <span className="field-val-line">{employee.phone}</span>
                </div>
              </div>

              <div className="fields-col">
                <div className="field-line-item margin-top-spacer">
                  <span className="field-key">Company</span>
                  <span className="field-val-line">{employee.company}</span>
                </div>

                <div className="field-line-item">
                  <span className="field-key">Department</span>
                  <span className="field-val-line">{employee.dept}</span>
                </div>

                <div className="field-line-item">
                  <span className="field-key">Manager</span>
                  <span className="field-val-line">{employee.manager}</span>
                </div>

                <div className="field-line-item">
                  <span className="field-key">Location</span>
                  <span className="field-val-line">{employee.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Navigation Bar */}
          <div className="wireframe-tabs-bar" role="tablist" aria-label="Employee details">
            <button 
              type="button"
              role="tab"
              aria-selected={activeTab === 'Attendance History'}
              className={`wireframe-tab-btn ${activeTab === 'Attendance History' ? 'active' : ''}`}
              onClick={() => setActiveTab('Attendance History')}
            >
               Attendance Record
            </button>

            <button 
              type="button"
              role="tab"
              aria-selected={activeTab === 'Leave & Time Off'}
              className={`wireframe-tab-btn ${activeTab === 'Leave & Time Off' ? 'active' : ''}`}
              onClick={() => setActiveTab('Leave & Time Off')}
            >
              Leaves & Time Off
            </button>

            {showAllTabs && (
              <>
                <button 
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'Private Info'}
                  className={`wireframe-tab-btn ${activeTab === 'Private Info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Private Info')}
                >
                  Private Info
                </button>

                <button 
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'Resume'}
                  className={`wireframe-tab-btn ${activeTab === 'Resume' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Resume')}
                >
                  Resume
                </button>

                <button 
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'Salary Info'}
                  className={`wireframe-tab-btn ${activeTab === 'Salary Info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Salary Info')}
                >
                  Salary Info
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'Security'}
                  className={`wireframe-tab-btn ${activeTab === 'Security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Security')}
                >
                  Security
                </button>

              </>
            )}
          </div>

           {/* TAB 1: Attendance Record */}
          {activeTab === 'Attendance History' && (
            <div className="wireframe-single-card">
              <div className="content-card-box">
                <div className="card-header-line">
                  <h3 className="box-title">Attendance Record</h3>
                  <span className="overview-badge">Historical Attendance Log</span>
                </div>

                <div className="attendance-track-summary-grid">
                  <div className="track-summary-box">
                    <span className="track-val">18 Days</span>
                    <span className="track-lbl">Present (This Month)</span>
                  </div>
                  <div className="track-summary-box">
                    <span className="track-val">1 Day</span>
                    <span className="track-lbl">Late Arrivals</span>
                  </div>
                  <div className="track-summary-box">
                    <span className="track-val">1 Day</span>
                    <span className="track-lbl">Approved Absences</span>
                  </div>
                </div>

                <div className="table-wrapper-box">
                  <table className="profile-record-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Work Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(employee.attendanceHistory || []).map((log, i) => (
                        <tr key={i}>
                          <td><strong>{log.date}</strong></td>
                          <td>
                            <span className={`status-pill-wireframe ${log.status === 'Present' ? 'pill-present' : 'pill-absent'}`}>
                              {log.status}
                            </span>
                          </td>
                          <td>{log.checkIn}</td>
                          <td>{log.checkOut}</td>
                          <td>{log.workHours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Leaves & Time Off */}
          {activeTab === 'Leave & Time Off' && (
            <div className="wireframe-single-card">
              <div className="content-card-box">
                <div className="card-header-line">
                  <h3 className="box-title">Available Leaves & Leave History</h3>
                  <span className="overview-badge">Leave Management</span>
                </div>

                <div className="timeoff-balance-cards-grid margin-bottom-spacer">
                  <div className="balance-card balance-paid">
                    <span className="balance-title">Paid Time Off</span>
                    <span className="balance-days">{employee.paidLeaveAvailable ?? 0} Days Available</span>
                  </div>
                  <div className="balance-card balance-sick">
                    <span className="balance-title">Sick Time Off</span>
                    <span className="balance-days">{employee.sickLeaveAvailable ?? 0} Days Available</span>
                  </div>
                  <div className="balance-card balance-casual">
                    <span className="balance-title">Casual Leave</span>
                    <span className="balance-days">{employee.casualLeaveAvailable ?? 0} Days Available</span>
                  </div>
                </div>

                <h4 className="section-subheading">Previous Leaves Taken & Reasons</h4>
                <div className="table-wrapper-box">
                  <table className="profile-record-table">
                    <thead>
                      <tr>
                        <th>Leave Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Duration</th>
                        <th>Reason</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(employee.leaveHistory && employee.leaveHistory.length > 0) ? (
                        employee.leaveHistory.map(lh => (
                          <tr key={lh.id}>
                            <td className="type-blue-cell">{lh.leaveType}</td>
                            <td>{lh.startDate}</td>
                            <td>{lh.endDate}</td>
                            <td>{lh.days} Day{lh.days > 1 ? 's' : ''}</td>
                            <td className="reason-text-cell">{lh.reason}</td>
                            <td>
                              <span className={`timeoff-status-badge status-${lh.status.toLowerCase()}`}>
                                {lh.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                            No previous leave records found for {employee.name}.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Private Info */}
          {showAllTabs && activeTab === 'Private Info' && (
            <div className="private-info-card">
              <div className="private-info-header">
                <h3 className="box-title">My Profile</h3>
                {onSavePrivateInfo && !isEditingPrivateInfo && (
                  <button type="button" className="private-edit-btn" onClick={() => setIsEditingPrivateInfo(true)}>Edit Details</button>
                )}
                {onSavePrivateInfo && isEditingPrivateInfo && (
                  <button type="button" className="private-save-btn" onClick={() => { onSavePrivateInfo(editedPrivateInfo); setIsEditingPrivateInfo(false) }}>Save Details</button>
                )}
              </div>
              <div className="private-profile-summary">
                <div className="private-profile-avatar">{employee.initials || 'EP'}</div>
                <div className="private-profile-name">{employee.name}<span>{employee.title}</span></div>
                <div className="private-summary-fields">
                  <span>Company<strong>{employee.company}</strong></span>
                  <span>Department<strong>{employee.dept}</strong></span>
                  <span>Manager<strong>{employee.manager}</strong></span>
                  <span>Location<strong>{employee.location}</strong></span>
                </div>
              </div>
              <div className="private-info-columns">
                <div>
                  <h4>Personal Information</h4>
                  {(['dateOfBirth', 'residingAddress', 'nationality', 'personalEmail', 'gender', 'maritalStatus', 'dateOfJoining'] as Array<keyof PrivateInfo>).map((field) => (
                    <label key={field}>{field.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())}<input value={editedPrivateInfo[field]} readOnly={!isEditingPrivateInfo} onChange={(event) => updatePrivateField(field, event.target.value)} /></label>
                  ))}
                </div>
                <div>
                  <h4>Bank Details</h4>
                  {(['bankDetails', 'accountNumber', 'bankName', 'ifscCode', 'panNumber', 'uanNumber', 'employeeCode'] as Array<keyof PrivateInfo>).map((field) => (
                    <label key={field}>{field.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())}<input value={editedPrivateInfo[field]} readOnly={!isEditingPrivateInfo} onChange={(event) => updatePrivateField(field, event.target.value)} /></label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Resume */}
          {showAllTabs && activeTab === 'Resume' && (
            <div className="wireframe-single-card">
              <div className="content-card-box">
                <h3 className="box-title">Work Experience & Education</h3>
                <div className="resume-section">
                  <div className="resume-item">
                    <h4>Senior Developer — DayFlow Solutions</h4>
                    <span className="resume-period">2023 - Present</span>
                    <p>Building high-throughput full-stack enterprise web modules and leading backend API integrations.</p>
                  </div>
                  <div className="resume-item">
                    <h4>{employee.title}</h4>
                    <span className="resume-period">Graduated 2022</span>
                    <p>Focused on software architecture, algorithms, database optimization, and user interface design.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Salary Info */}
          {showAllTabs && activeTab === 'Salary Info' && (
            <div className="wireframe-single-card">
              <div className="content-card-box">
                <div className="card-header-line">
                  <h3 className="box-title">Compensation & Salary Information</h3>
                  {onSaveSalary && !isEditingSalary && (
                    <button type="button" className="salary-edit-btn" onClick={() => setIsEditingSalary(true)}>
                      Edit Salary
                    </button>
                  )}
                  {onSaveSalary && isEditingSalary && (
                    <button
                      type="button"
                      className="salary-save-btn"
                      onClick={handleSalarySave}
                      disabled={salarySaving}
                    >
                      {salarySaving ? 'Saving...' : 'Save Salary'}
                    </button>
                  )}
                </div>
                {salaryError && <div className="alert error salary-save-error" role="alert">{salaryError}</div>}
                <div className="salary-overview-grid">
                  <div className="salary-overview-field"><span>Month Wage</span><input value={editedSalary.monthWage ?? ''} readOnly={!isEditingSalary} onChange={(event) => setEditedSalary({ ...editedSalary, monthWage: event.target.value })} /><small>/ Month</small></div>
                  <div className="salary-overview-field"><span>Yearly Wage</span><input value={editedSalary.yearlyWage ?? ''} readOnly={!isEditingSalary} onChange={(event) => setEditedSalary({ ...editedSalary, yearlyWage: event.target.value })} /><small>/ Yearly</small></div>
                  <div className="salary-overview-field"><span>No. of working days in a week</span><input value={editedSalary.workingDays ?? ''} readOnly={!isEditingSalary} onChange={(event) => setEditedSalary({ ...editedSalary, workingDays: event.target.value })} /></div>
                  <div className="salary-overview-field"><span>Break Time / Hours</span><input value={editedSalary.workingHours ?? ''} readOnly={!isEditingSalary} onChange={(event) => setEditedSalary({ ...editedSalary, workingHours: event.target.value })} /><small>/ Hrs</small></div>
                </div>

                <div className="salary-sections-grid">
                  <section className="salary-section">
                    <h4>Salary Components</h4>
                    <div className="salary-component-row"><span>Basic Salary</span><input value={editedSalary.basicSalary ?? ''} readOnly={!isEditingSalary} onChange={(event) => setEditedSalary({ ...editedSalary, basicSalary: event.target.value })} /><small>₹ / month</small><b>50.00%</b></div>
                    <p>Define Basic salary from company cost based on monthly wages</p>
                    <div className="salary-component-row"><span>House Rent Allowance</span><input value={editedSalary.houseRentAllowance ?? ''} readOnly={!isEditingSalary} onChange={(event) => setEditedSalary({ ...editedSalary, houseRentAllowance: event.target.value })} /><small>₹ / month</small><b>50.00%</b></div>
                    <p>HRA provided to employees 50% of the basic salary</p>
                    <div className="salary-component-row"><span>Standard Allowance</span><input value={editedSalary.standardAllowance ?? ''} readOnly={!isEditingSalary} onChange={(event) => setEditedSalary({ ...editedSalary, standardAllowance: event.target.value })} /><small>₹ / month</small><b>16.67%</b></div>
                    <p>A standard allowance is a predetermined, fixed amount provided to employees.</p>
                    <div className="salary-component-row"><span>Performance Bonus</span><input value={editedSalary.performanceBonus ?? ''} readOnly={!isEditingSalary} onChange={(event) => setEditedSalary({ ...editedSalary, performanceBonus: event.target.value })} /><small>₹ / month</small><b>8.33%</b></div>
                    <p>Variable amount paid during payroll based on performance.</p>
                    <div className="salary-component-row"><span>Leave Travel Allowance</span><input value={editedSalary.leaveTravelAllowance ?? ''} readOnly={!isEditingSalary} onChange={(event) => setEditedSalary({ ...editedSalary, leaveTravelAllowance: event.target.value })} /><small>₹ / month</small><b>8.33%</b></div>
                    <p>LTA is paid by the company to cover travel expenses.</p>
                    <div className="salary-component-row"><span>Fixed Allowance</span><input value={editedSalary.fixedAllowance ?? ''} readOnly={!isEditingSalary} onChange={(event) => setEditedSalary({ ...editedSalary, fixedAllowance: event.target.value })} /><small>₹ / month</small><b>11.67%</b></div>
                    <p>Fixed allowance portion of wages determined after calculating all salary components.</p>
                  </section>

                  <section className="salary-section">
                    <h4>Provident Fund (PF) Contribution</h4>
                    <div className="salary-component-row"><span>Employee</span><input value={editedSalary.providentFundEmployee ?? ''} readOnly={!isEditingSalary} onChange={(event) => setEditedSalary({ ...editedSalary, providentFundEmployee: event.target.value })} /><small>₹ / month</small><b>12.00%</b></div>
                    <p>PF is calculated based on the basic salary.</p>
                    <div className="salary-component-row"><span>Employer</span><input value={editedSalary.providentFundEmployer ?? ''} readOnly={!isEditingSalary} onChange={(event) => setEditedSalary({ ...editedSalary, providentFundEmployer: event.target.value })} /><small>₹ / month</small><b>12.00%</b></div>
                    <p>PF is calculated based on the basic salary.</p>
                    <h4>Tax Deductions</h4>
                    <div className="salary-component-row"><span>Professional Tax</span><input value={editedSalary.professionalTax ?? ''} readOnly={!isEditingSalary} onChange={(event) => setEditedSalary({ ...editedSalary, professionalTax: event.target.value })} /><small>₹ / month</small></div>
                    <p>Professional Tax deducted from the Gross salary.</p>
                  </section>
                </div>
              </div>
            </div>
          )}

          {showAllTabs && activeTab === 'Security' && (
            <div className="wireframe-single-card">
              <div className="content-card-box security-card">
                <h3 className="box-title">Security</h3>
                <p className="box-text-content">Manage account access and authentication settings for this employee.</p>
                <button type="button" className="private-edit-btn">Reset Password</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
