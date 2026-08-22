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
  status: 'Active' | 'On Leave' | 'Inactive' | 'Present'
  email: string
  phone: string
  company: string
  manager: string
  location: string
  about: string
  jobLove: string
  hobbies: string
  skills: string[]
  certifications: string[]
  avatarUrl?: string
  initials?: string
}

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Ashvek Anand Parab',
    title: 'BE Computer Engineering',
    empId: '24C010',
    dept: 'Engineering',
    status: 'Present',
    email: '24c010@aiemgoa.ac.in',
    phone: '+91 9518788852',
    company: 'DayFlow Technologies',
    manager: 'Michael Chang',
    location: 'Goa, India',
    about: 'Passionate software engineer focused on building clean web interfaces, optimizing full-stack applications, and creating efficient human resource management tools.',
    jobLove: 'I love solving complex workflow challenges and collaborating with talented cross-functional teams to build impactful software.',
    hobbies: 'Building side projects, playing chess, listening to tech podcasts, and exploring nature.',
    skills: ['TypeScript', 'React', 'Python', 'Django', 'REST APIs', 'UI/UX Design'],
    certifications: ['AWS Certified Developer', 'Meta Front-End Certificate', 'Scrum Master'],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '2',
    name: 'Alex Mercer',
    title: 'Senior Developer',
    empId: 'EMP-1042',
    dept: 'Engineering',
    status: 'Active',
    email: 'alex.mercer@dayflow.com',
    phone: '+91 9876543210',
    company: 'DayFlow Technologies',
    manager: 'Michael Chang',
    location: 'Bangalore, India',
    about: 'Full-stack software architect with 6+ years of enterprise application development.',
    jobLove: 'Architecting scalable systems and mentoring junior engineers.',
    hobbies: 'Open source contribution, cycling, and web performance tuning.',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'GraphQL'],
    certifications: ['AWS Solutions Architect', 'Google Cloud Engineer'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '3',
    name: 'Jordan Lee',
    title: 'Lead Product Designer',
    empId: 'EMP-1089',
    dept: 'Design',
    status: 'On Leave',
    email: 'jordan.lee@dayflow.com',
    phone: '+91 9123456789',
    company: 'DayFlow Technologies',
    manager: 'Michael Chang',
    location: 'Mumbai, India',
    about: 'Lead UI/UX designer crafting intuitive digital experiences for enterprise SaaS platforms.',
    jobLove: 'Transforming complex administrative workflows into beautiful, effortless user journeys.',
    hobbies: 'UI motion design, photography, and interior styling.',
    skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
    certifications: ['Nielsen Norman UX Certification', 'Interaction Design Specialist'],
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '4',
    name: 'Taylor Cruz',
    title: 'Marketing Manager',
    empId: 'EMP-1102',
    dept: 'Marketing',
    status: 'Active',
    email: 'taylor.cruz@dayflow.com',
    phone: '+91 9988776655',
    company: 'DayFlow Technologies',
    manager: 'Michael Chang',
    location: 'Delhi, India',
    about: 'Strategic marketing practitioner focusing on B2B SaaS growth and product positioning.',
    jobLove: 'Connecting HR leaders with innovative software solutions that save them time.',
    hobbies: 'Content writing, marathon running, and digital media analytics.',
    skills: ['SEO', 'Content Strategy', 'HubSpot', 'Growth Hacking'],
    certifications: ['HubSpot Inbound Marketing', 'Google Analytics Professional'],
    initials: 'TC'
  },
  {
    id: '5',
    name: 'Michael Chang',
    title: 'HR Director',
    empId: 'EMP-0012',
    dept: 'Human Resources',
    status: 'Active',
    email: 'michael.chang@dayflow.com',
    phone: '+91 9811223344',
    company: 'DayFlow Technologies',
    manager: 'Executive Board',
    location: 'Goa, India',
    about: 'Human Resources Director overseeing global talent acquisition, culture, and employee success.',
    jobLove: 'Empowering team members to reach their full career potential in a supportive culture.',
    hobbies: 'Leadership coaching, tennis, and organizational psychology.',
    skills: ['Talent Management', 'HR Policy', 'Conflict Resolution'],
    certifications: ['SHRM-SCP Senior Certified', 'SPHR Professional'],
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
]

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mode, setMode] = useState<Mode>('login')
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState<'Employees' | 'Attendance' | 'Time Off'>('Employees')
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(INITIAL_EMPLOYEES[0])
  const [detailTab, setDetailTab] = useState<'Resume' | 'Private Info' | 'Salary Info'>('Private Info')
  
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newSkillInput, setNewSkillInput] = useState('')
  const [newCertInput, setNewCertInput] = useState('')
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [isAddingCert, setIsAddingCert] = useState(false)

  // New Employee form state
  const [newEmp, setNewEmp] = useState({
    name: '',
    title: '',
    empId: '',
    dept: 'Engineering',
    status: 'Active' as const
  })

  // Sign in handler
  const handleAuthSubmit = (e: FormEvent) => {
    e.preventDefault()
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
      email: `${newEmp.name.toLowerCase().replace(/\s+/g, '.')}@dayflow.com`,
      phone: '+91 9876543210',
      company: 'DayFlow Technologies',
      manager: 'Michael Chang',
      location: 'Goa, India',
      about: 'New team member profile.',
      jobLove: 'Excited to contribute to DayFlow development.',
      hobbies: 'Reading and coding.',
      skills: ['TypeScript', 'Web Development'],
      certifications: ['DayFlow Onboarding'],
      initials: newEmp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    setEmployees([created, ...employees])
    setSelectedEmployee(created)
    setNewEmp({ name: '', title: '', empId: '', dept: 'Engineering', status: 'Active' })
    setIsModalOpen(false)
  }

  const handleAddSkill = () => {
    if (!newSkillInput.trim() || !selectedEmployee) return
    const updated = {
      ...selectedEmployee,
      skills: [...selectedEmployee.skills, newSkillInput.trim()]
    }
    setSelectedEmployee(updated)
    setEmployees(employees.map(e => e.id === updated.id ? updated : e))
    setNewSkillInput('')
    setIsAddingSkill(false)
  }

  const handleAddCert = () => {
    if (!newCertInput.trim() || !selectedEmployee) return
    const updated = {
      ...selectedEmployee,
      certifications: [...selectedEmployee.certifications, newCertInput.trim()]
    }
    setSelectedEmployee(updated)
    setEmployees(employees.map(e => e.id === updated.id ? updated : e))
    setNewCertInput('')
    setIsAddingCert(false)
  }

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.empId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDept = deptFilter === 'All' || emp.dept === deptFilter
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter || (statusFilter === 'Active' && emp.status === 'Present')
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

  // Admin Portal Layout matching exact requested wireframe layout
  return (
    <div className="wireframe-app-container">
      {/* Top Navbar */}
      <header className="wireframe-navbar">
        <div className="nav-left">
          <div className="company-logo-badge">
            <span className="logo-icon">d</span>
            <span className="logo-text">Company Logo</span>
          </div>

          <nav className="nav-links-bar">
            <button 
              className={`nav-link-btn ${activeTab === 'Employees' ? 'active' : ''}`}
              onClick={() => setActiveTab('Employees')}
            >
              Employees
            </button>
            <button 
              className={`nav-link-btn ${activeTab === 'Attendance' ? 'active' : ''}`}
              onClick={() => setActiveTab('Attendance')}
            >
              Attendance
            </button>
            <button 
              className={`nav-link-btn ${activeTab === 'Time Off' ? 'active' : ''}`}
              onClick={() => setActiveTab('Time Off')}
            >
              Time Off
            </button>
          </nav>
        </div>

        <div className="nav-right-actions">
          <button className="nav-icon-circle coral-badge" title="Notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          <div 
            className="nav-user-box blue-badge" 
            title="Sign Out"
            onClick={() => setIsAuthenticated(false)}
          >
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80" alt="User Avatar" />
          </div>
        </div>
      </header>

      {/* Sub Header Title Bar */}
      <div className="wireframe-subheader">
        <div className="subheader-title-group">
          <h1 className="subheader-title">
            {selectedEmployee ? 'My Profile' : 'Employees Directory'}
          </h1>
          {selectedEmployee && (
            <button className="btn-back-directory" onClick={() => setSelectedEmployee(null)}>
              ← Back to Directory
            </button>
          )}
        </div>

        <div className="subheader-actions">
          <button className="btn-add-new-emp" onClick={() => setIsModalOpen(true)}>
            + Add Employee
          </button>
        </div>
      </div>

      {/* Main App Content View */}
      <main className="wireframe-main-content">
        {selectedEmployee ? (
          /* Profile Details View (Matching Wireframe Image) */
          <div className="profile-format-view">
            {/* Banner Header Card */}
            <div className="profile-banner-box">
              <div className="profile-avatar-pencil-wrap">
                {selectedEmployee.avatarUrl ? (
                  <img src={selectedEmployee.avatarUrl} alt={selectedEmployee.name} className="profile-circle-avatar" />
                ) : (
                  <div className="profile-circle-initials">{selectedEmployee.initials || 'EP'}</div>
                )}
                <button className="avatar-edit-pencil" title="Edit Profile Photo">
                  ✎
                </button>
              </div>

              {/* Main Fields Grid */}
              <div className="profile-fields-grid">
                {/* Column 1 */}
                <div className="fields-col">
                  <div className="name-field-row">
                    <h2 className="profile-name-heading">{selectedEmployee.name}</h2>
                    <button className="inline-pencil-btn" title="Edit Name">✎</button>
                  </div>

                  <div className="field-line-item">
                    <span className="field-key">Login ID</span>
                    <span className="field-val-line">{selectedEmployee.empId}</span>
                  </div>

                  <div className="field-line-item">
                    <span className="field-key">Email</span>
                    <span className="field-val-line">{selectedEmployee.email}</span>
                  </div>

                  <div className="field-line-item">
                    <span className="field-key">Mobile</span>
                    <span className="field-val-line">{selectedEmployee.phone}</span>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="fields-col">
                  <div className="field-line-item margin-top-spacer">
                    <span className="field-key">Company</span>
                    <span className="field-val-line">{selectedEmployee.company}</span>
                  </div>

                  <div className="field-line-item">
                    <span className="field-key">Department</span>
                    <span className="field-val-line">{selectedEmployee.dept}</span>
                  </div>

                  <div className="field-line-item">
                    <span className="field-key">Manager</span>
                    <span className="field-val-line">{selectedEmployee.manager}</span>
                  </div>

                  <div className="field-line-item">
                    <span className="field-key">Location</span>
                    <span className="field-val-line">{selectedEmployee.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Inner Tabs Bar */}
            <div className="wireframe-tabs-bar">
              <button 
                className={`wireframe-tab-btn ${detailTab === 'Resume' ? 'active' : ''}`}
                onClick={() => setDetailTab('Resume')}
              >
                Resume
              </button>
              <button 
                className={`wireframe-tab-btn ${detailTab === 'Private Info' ? 'active' : ''}`}
                onClick={() => setDetailTab('Private Info')}
              >
                Private Info
              </button>
              <button 
                className={`wireframe-tab-btn ${detailTab === 'Salary Info' ? 'active' : ''}`}
                onClick={() => setDetailTab('Salary Info')}
              >
                Salary Info
              </button>
            </div>

            {/* Tab Content Section */}
            {detailTab === 'Private Info' && (
              <div className="wireframe-tab-grid">
                {/* Left Wide Column */}
                <div className="tab-left-col">
                  <div className="content-card-box">
                    <div className="card-header-line">
                      <h3 className="box-title">About</h3>
                      <button className="card-pencil-btn" title="Edit About">✎</button>
                    </div>
                    <p className="box-text-content">{selectedEmployee.about}</p>
                  </div>

                  <div className="content-card-box">
                    <div className="card-header-line">
                      <h3 className="box-title">What I love about my job</h3>
                      <button className="card-pencil-btn" title="Edit Job Interest">✎</button>
                    </div>
                    <p className="box-text-content">{selectedEmployee.jobLove}</p>
                  </div>

                  <div className="content-card-box">
                    <div className="card-header-line">
                      <h3 className="box-title">My interests and hobbies</h3>
                      <button className="card-pencil-btn" title="Edit Hobbies">✎</button>
                    </div>
                    <p className="box-text-content">{selectedEmployee.hobbies}</p>
                  </div>
                </div>

                {/* Right Narrow Column */}
                <div className="tab-right-col">
                  <div className="content-card-box">
                    <div className="card-header-line">
                      <h3 className="box-title">Skills</h3>
                    </div>
                    
                    <div className="tags-flex-wrap">
                      {selectedEmployee.skills.map((skill, index) => (
                        <span key={index} className="skill-pill-tag">{skill}</span>
                      ))}
                    </div>

                    {isAddingSkill ? (
                      <div className="inline-add-input-wrap">
                        <input 
                          type="text" 
                          placeholder="Enter skill name..." 
                          value={newSkillInput}
                          onChange={(e) => setNewSkillInput(e.target.value)}
                          className="inline-input"
                        />
                        <button className="btn-inline-save" onClick={handleAddSkill}>Save</button>
                        <button className="btn-inline-cancel" onClick={() => setIsAddingSkill(false)}>✕</button>
                      </div>
                    ) : (
                      <button className="btn-add-item-action" onClick={() => setIsAddingSkill(true)}>
                        + Add Skills
                      </button>
                    )}
                  </div>

                  <div className="content-card-box">
                    <div className="card-header-line">
                      <h3 className="box-title">Certification</h3>
                    </div>

                    <div className="cert-list-wrap">
                      {selectedEmployee.certifications.map((cert, index) => (
                        <div key={index} className="cert-item-row">
                          <span className="cert-badge-dot"></span>
                          <span className="cert-title">{cert}</span>
                        </div>
                      ))}
                    </div>

                    {isAddingCert ? (
                      <div className="inline-add-input-wrap">
                        <input 
                          type="text" 
                          placeholder="Enter certification..." 
                          value={newCertInput}
                          onChange={(e) => setNewCertInput(e.target.value)}
                          className="inline-input"
                        />
                        <button className="btn-inline-save" onClick={handleAddCert}>Save</button>
                        <button className="btn-inline-cancel" onClick={() => setIsAddingCert(false)}>✕</button>
                      </div>
                    ) : (
                      <button className="btn-add-item-action" onClick={() => setIsAddingCert(true)}>
                        + Add Certification
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'Resume' && (
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
                      <h4>{selectedEmployee.title}</h4>
                      <span className="resume-period">Graduated 2022</span>
                      <p>Focused on software architecture, algorithms, database optimization, and user interface design.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'Salary Info' && (
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
        ) : (
          /* Directory Grid View */
          <div className="directory-format-view">
            <div className="directory-filter-bar">
              <div className="filter-selects">
                <select 
                  value={deptFilter} 
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="filter-select"
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
                  className="filter-select"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="filter-search-box">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  type="text" 
                  placeholder="Filter by name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="directory-cards-grid">
              {filteredEmployees.map(emp => (
                <div 
                  key={emp.id} 
                  className="directory-emp-card"
                  onClick={() => setSelectedEmployee(emp)}
                >
                  <div className="card-top-avatar">
                    {emp.avatarUrl ? (
                      <img src={emp.avatarUrl} alt={emp.name} className="dir-avatar-img" />
                    ) : (
                      <div className="dir-avatar-initials">{emp.initials || 'EP'}</div>
                    )}
                  </div>

                  <div className="dir-card-info">
                    <h3 className="dir-emp-name">{emp.name}</h3>
                    <p className="dir-emp-title">{emp.title}</p>
                    <span className="dir-emp-dept">{emp.dept}</span>
                    
                    <div className="dir-emp-footer">
                      <span className="dir-emp-id">ID: {emp.empId}</span>
                      <span className={`status-pill status-${emp.status.toLowerCase().replace(' ', '-')}`}>
                        {emp.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

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
