import React, { useState } from 'react'

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
}

export const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
  employee,
  onClose,
  showAllTabs = true
}) => {
  const [activeTab, setActiveTab] = useState<
    'Attendance History' | 'Leave & Time Off' | 'Private Info' | 'Resume' | 'Salary Info'
  >('Attendance History')

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
          <div className="wireframe-tabs-bar">
            <button 
              className={`wireframe-tab-btn ${activeTab === 'Attendance History' ? 'active' : ''}`}
              onClick={() => setActiveTab('Attendance History')}
            >
              Attendance Track Record
            </button>

            <button 
              className={`wireframe-tab-btn ${activeTab === 'Leave & Time Off' ? 'active' : ''}`}
              onClick={() => setActiveTab('Leave & Time Off')}
            >
              Leaves & Time Off
            </button>

            {showAllTabs && (
              <>
                <button 
                  className={`wireframe-tab-btn ${activeTab === 'Private Info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Private Info')}
                >
                  Private Info
                </button>

                <button 
                  className={`wireframe-tab-btn ${activeTab === 'Resume' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Resume')}
                >
                  Resume
                </button>

                <button 
                  className={`wireframe-tab-btn ${activeTab === 'Salary Info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Salary Info')}
                >
                  Salary Info
                </button>
              </>
            )}
          </div>

          {/* TAB 1: Attendance Track Record */}
          {activeTab === 'Attendance History' && (
            <div className="wireframe-single-card">
              <div className="content-card-box">
                <div className="card-header-line">
                  <h3 className="box-title">Attendance Track Record</h3>
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
                      {(employee.attendanceHistory || [
                        { date: '22 Oct 2025', status: employee.status, checkIn: employee.checkIn || '10:00 AM', checkOut: employee.checkOut || '19:00 PM', workHours: employee.workHours || '09:00' }
                      ]).map((log, i) => (
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
                    <span className="balance-days">{employee.paidLeaveAvailable ?? 24} Days Available</span>
                  </div>
                  <div className="balance-card balance-sick">
                    <span className="balance-title">Sick Time Off</span>
                    <span className="balance-days">{employee.sickLeaveAvailable ?? 7} Days Available</span>
                  </div>
                  <div className="balance-card balance-casual">
                    <span className="balance-title">Casual Leave</span>
                    <span className="balance-days">{employee.casualLeaveAvailable ?? 5} Days Available</span>
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
            <div className="wireframe-tab-grid">
              <div className="tab-left-col">
                <div className="content-card-box">
                  <div className="card-header-line">
                    <h3 className="box-title">About</h3>
                    <button className="card-pencil-btn" title="Edit About">✎</button>
                  </div>
                  <p className="box-text-content">{employee.about}</p>
                </div>

                <div className="content-card-box">
                  <div className="card-header-line">
                    <h3 className="box-title">What I love about my job</h3>
                    <button className="card-pencil-btn" title="Edit Job Interest">✎</button>
                  </div>
                  <p className="box-text-content">{employee.jobLove}</p>
                </div>

                <div className="content-card-box">
                  <div className="card-header-line">
                    <h3 className="box-title">My interests and hobbies</h3>
                    <button className="card-pencil-btn" title="Edit Hobbies">✎</button>
                  </div>
                  <p className="box-text-content">{employee.hobbies}</p>
                </div>
              </div>

              <div className="tab-right-col">
                <div className="content-card-box">
                  <div className="card-header-line">
                    <h3 className="box-title">Skills</h3>
                  </div>
                  
                  <div className="tags-flex-wrap">
                    {employee.skills.map((skill, index) => (
                      <span key={index} className="skill-pill-tag">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="content-card-box">
                  <div className="card-header-line">
                    <h3 className="box-title">Certification</h3>
                  </div>

                  <div className="cert-list-wrap">
                    {employee.certifications.map((cert, index) => (
                      <div key={index} className="cert-item-row">
                        <span className="cert-badge-dot"></span>
                        <span className="cert-title">{cert}</span>
                      </div>
                    ))}
                  </div>
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
                <h3 className="box-title">Compensation & Salary Information</h3>
                <div className="salary-info-grid">
                  <div className="salary-box">
                    <span className="salary-label">Pay Grade</span>
                    <span className="salary-val">Level 4 — Senior Engineer</span>
                  </div>
                  <div className="salary-box">
                    <span className="salary-label">Base Salary</span>
                    <span className="salary-val">$110,000 / annum</span>
                  </div>
                  <div className="salary-box">
                    <span className="salary-label">HRA & Allowances</span>
                    <span className="salary-val">$18,000 / annum</span>
                  </div>
                  <div className="salary-box">
                    <span className="salary-label">Tax Deduction</span>
                    <span className="salary-val">Standard Corporate Slab</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
