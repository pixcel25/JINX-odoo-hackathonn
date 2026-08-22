import type { Employee } from './EmployeeDetailsModal'

export interface LeaveApplication {
  id: string
  employeeName: string
  startDate: string
  endDate: string
  timeOffType: string
  status: 'Approved' | 'Pending' | 'Refused'
}

interface LeaveApplicationModalProps {
  employee: Employee
  application: LeaveApplication
  onClose: () => void
}

export function LeaveApplicationModal({ employee, application, onClose }: LeaveApplicationModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content profile-popup-modal application-popup-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div className="popup-title-wrap">
            <h2>Leave Application</h2>
            <span className="popup-emp-id">Request: {application.id}</span>
          </div>
          <button className="close-btn" onClick={onClose} title="Close Modal">✕</button>
        </div>

        <div className="modal-body-scrollable">
          <div className="profile-banner-box">
            <div className="profile-avatar-pencil-wrap">
              {employee.avatarUrl ? (
                <img src={employee.avatarUrl} alt={employee.name} className="profile-circle-avatar" />
              ) : (
                <div className="profile-circle-initials">{employee.initials || 'EP'}</div>
              )}
            </div>

            <div className="profile-fields-grid">
              <div className="fields-col">
                <div className="name-field-row">
                  <h2 className="profile-name-heading">{employee.name}</h2>
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

          <section className="application-details-card">
            <div className="application-card-title-row">
              <h3 className="box-title">Time off Type Request</h3>
              <span className={`timeoff-status-badge status-${application.status.toLowerCase()}`}>
                {application.status}
              </span>
            </div>
            <div className="application-request-fields">
              <div className="application-request-row">
                <span className="application-detail-label">Employee</span>
                <strong>{application.employeeName}</strong>
              </div>
              <div className="application-request-row">
                <span className="application-detail-label">Time off Type</span>
                <strong>{application.timeOffType}</strong>
              </div>
              <div className="application-request-row">
                <span className="application-detail-label">Validity Period</span>
                <strong>{application.startDate}<span className="application-period-separator">To</span>{application.endDate}</strong>
              </div>
              <div className="application-request-row">
                <span className="application-detail-label">Allocation</span>
                <strong>01.00 <span className="application-unit">Days</span></strong>
              </div>
              <div className="application-request-row application-attachment-row">
                <span className="application-detail-label">Attachment</span>
                <div className="application-attachment-value">
                  <button type="button" className="attachment-upload-btn" title="Upload attachment" aria-label="Upload attachment">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></svg>
                  </button>
                  <span>(For sick leave certificate)</span>
                </div>
              </div>
            </div>
            <div className="application-actions">
              <button type="button" className="application-submit-btn" onClick={onClose}>Submit</button>
              <button type="button" className="application-discard-btn" onClick={onClose}>Discard</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
