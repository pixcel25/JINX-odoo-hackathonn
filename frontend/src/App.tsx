import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Mode = 'login' | 'signup'

interface Employee {
  id: string
  name: string
  title: string
  empId: string
  dept: string
  status: 'Active' | 'On Leave' | 'Inactive'
  avatarUrl?: string
  initials?: string
}

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Alex Mercer',
    title: 'Senior Developer',
    empId: 'EMP-1042',
    dept: 'Engineering',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '2',
    name: 'Jordan Lee',
    title: 'Lead Product Designer',
    empId: 'EMP-1089',
    dept: 'Design',
    status: 'On Leave',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '3',
    name: 'Taylor Cruz',
    title: 'Marketing Manager',
    empId: 'EMP-1102',
    dept: 'Marketing',
    status: 'Active',
    initials: 'TC'
  },
  {
    id: '4',
    name: 'Michael Chang',
    title: 'HR Director',
    empId: 'EMP-0012',
    dept: 'Human Resources',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
]

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mode, setMode] = useState<Mode>('login')
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Employees' | 'Attendance' | 'Leave' | 'Payroll'>('Employees')
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES)
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // New Employee form state
  const [newEmp, setNewEmp] = useState({
    name: '',
    title: '',
    empId: '',
    dept: 'Engineering',
    status: 'Active' as const
  })

  // Sign in handler (allows empty fields per request)
  const handleAuthSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Bypass strict validation to allow easy Admin sign in
    setIsAuthenticated(true)
  }

  const handleAddEmployee = (e: FormEvent) => {
    e.preventDefault()
    if (!newEmp.name.trim()) return
    const created: Employee = {
      id: Date.now().toString(),
      name: newEmp.name,
      title: newEmp.title || 'Team Member',
      empId: newEmp.empId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      dept: newEmp.dept,
      status: newEmp.status,
      initials: newEmp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    setEmployees([created, ...employees])
    setNewEmp({ name: '', title: '', empId: '', dept: 'Engineering', status: 'Active' })
    setIsModalOpen(false)
  }

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.empId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDept = deptFilter === 'All' || emp.dept === deptFilter
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter
    return matchesSearch && matchesDept && matchesStatus
  })

  if (!isAuthenticated) {
    return (
      <main className="auth-shell">
        <section className="brand-panel">
          <div className="brand-content">
            <div className="brand-badge">
              <div className="brand-mark">d</div>
              <h1 className="brand-title">DayFlow</h1>
            </div>
            <div className="brand-card">
              <div className="card-dot"></div>
              <span className="card-label">Admin Portal</span>
              <div className="card-wave">
                <svg viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 10 Q25 2, 50 10 T100 10" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="form-panel">
          <div className="form-wrap">
            <div className="mobile-brand">
              <div className="brand-mark">d</div>
              <span className="brand-title">DayFlow</span>
            </div>

            <div className="admin-badge-tag">ADMIN PORTAL</div>
            
            <h2>{mode === 'login' ? 'Admin Sign In' : 'Create Admin Account'}</h2>

            <div className="mode-switch" role="tablist" aria-label="Authentication mode">
              <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} role="tab" aria-selected={mode === 'login'}>Sign in</button>
              <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')} role="tab" aria-selected={mode === 'signup'}>Sign up</button>
            </div>

            <form onSubmit={handleAuthSubmit} noValidate>
              <div className="field-group">
                <label htmlFor="email">Work Email</label>
                <input id="email" type="email" autoComplete="email" placeholder="admin@company.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </div>

              <div className="field-group">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" autoComplete="current-password" placeholder="Enter your admin password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              </div>

              {mode === 'signup' && (
                <div className="field-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input id="confirmPassword" type="password" autoComplete="new-password" placeholder="Repeat your admin password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} />
                </div>
              )}

              <button className="submit" type="submit">
                {mode === 'login' ? 'Sign in to Admin Portal' : 'Create Admin Account'} <span>→</span>
              </button>
            </form>

            <p className="portal-footer-note">Authorized Admin Access Only</p>
          </div>
        </section>
      </main>
    )
  }

  // Dashboard Interface
  return (
    <div className="hrms-layout">
      {/* Sidebar */}
      <aside className="hrms-sidebar">
        <div className="sidebar-header">
          <span className="hrms-logo-title">
            <span className="logo-accent">HRMS</span> Admin
          </span>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'Dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('Dashboard')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
            <span>Dashboard</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'Employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('Employees')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Employees</span>
            <div className="active-indicator"></div>
          </button>

          <button 
            className={`nav-item ${activeTab === 'Attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('Attendance')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Attendance</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'Leave' ? 'active' : ''}`}
            onClick={() => setActiveTab('Leave')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            <span>Leave</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'Payroll' ? 'active' : ''}`}
            onClick={() => setActiveTab('Payroll')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <span>Payroll</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>Settings</span>
          </button>

          <button className="nav-item logout-btn" onClick={() => setIsAuthenticated(false)}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="hrms-main">
        {/* Top Header */}
        <header className="hrms-topbar">
          <div className="search-box">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              placeholder="Search employees..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="topbar-actions">
            <button className="icon-btn" title="Notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
            <button className="icon-btn" title="Help">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </button>
            <div className="user-profile-avatar" title="Admin User">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80" alt="Admin Avatar" />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="hrms-content">
          <div className="content-header">
            <div>
              <h1 className="page-title">Employees Directory</h1>
              <p className="page-subtitle">Manage and view all employee profiles.</p>
            </div>

            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <span>+</span> NEW EMPLOYEE
            </button>
          </div>

          {/* Controls Bar */}
          <div className="filter-controls-bar">
            <div className="filter-dropdowns">
              <select 
                value={deptFilter} 
                onChange={(e) => setDeptFilter(e.target.value)}
                className="select-filter"
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Human Resources">Human Resources</option>
              </select>

              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select-filter"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="filter-search-wrap">
              <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              <input 
                type="text" 
                placeholder="Filter by name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-search-input"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="employee-cards-grid">
            {filteredEmployees.map(emp => (
              <div key={emp.id} className="employee-card">
                <div className="card-top">
                  {emp.avatarUrl ? (
                    <img src={emp.avatarUrl} alt={emp.name} className="card-avatar-img" />
                  ) : (
                    <div className="card-avatar-initials">{emp.initials ?? 'EP'}</div>
                  )}
                  <button className="card-menu-btn" title="Options">⋮</button>
                </div>

                <div className="card-body">
                  <h3 className="emp-name">{emp.name}</h3>
                  <p className="emp-title">{emp.title}</p>

                  <div className="emp-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">ID</span>
                      <span className="detail-value">{emp.empId}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Dept</span>
                      <span className="detail-value">{emp.dept}</span>
                    </div>

                    <div className="detail-item full-width">
                      <span className="detail-label">Status</span>
                      <span className={`status-pill status-${emp.status.toLowerCase().replace(' ', '-')}`}>
                        <span className="status-dot"></span>
                        {emp.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination-wrap">
            <button className="page-btn" disabled>&lt;</button>
            <button className={`page-btn ${currentPage === 1 ? 'active' : ''}`} onClick={() => setCurrentPage(1)}>1</button>
            <button className={`page-btn ${currentPage === 2 ? 'active' : ''}`} onClick={() => setCurrentPage(2)}>2</button>
            <button className={`page-btn ${currentPage === 3 ? 'active' : ''}`} onClick={() => setCurrentPage(3)}>3</button>
            <button className="page-btn">&gt;</button>
          </div>
        </main>
      </div>

      {/* New Employee Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Employee</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddEmployee} className="modal-form">
              <div className="modal-field">
                <label>Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Sarah Jenkins"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                />
              </div>

              <div className="modal-field">
                <label>Job Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. UX Designer"
                  value={newEmp.title}
                  onChange={(e) => setNewEmp({ ...newEmp, title: e.target.value })}
                />
              </div>

              <div className="modal-field">
                <label>Employee ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. EMP-2041"
                  value={newEmp.empId}
                  onChange={(e) => setNewEmp({ ...newEmp, empId: e.target.value })}
                />
              </div>

              <div className="modal-field">
                <label>Department</label>
                <select 
                  value={newEmp.dept}
                  onChange={(e) => setNewEmp({ ...newEmp, dept: e.target.value })}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
