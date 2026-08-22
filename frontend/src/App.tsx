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
}

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Jane Doe',
    title: 'BE Computer Engineering',
    empId: '24C010',
    dept: 'Engineering',
    status: 'Present',
    checkIn: '10:00 AM',
    checkOut: '19:00 PM',
    workHours: '09:00',
    email: 'jane.doe@dayflow.com',
    phone: '+91 9518788852',
    company: 'DayFlow Technologies',
    manager: 'Michael Chang',
    location: 'Goa, India',
    about: 'Passionate software engineer focused on building clean web interfaces, optimizing full-stack applications, and creating efficient human resource management tools.',
    jobLove: 'I love solving complex workflow challenges and collaborating with talented cross-functional teams to build impactful software.',
    hobbies: 'Building side projects, playing chess, listening to tech podcasts, and exploring nature.',
    skills: ['TypeScript', 'React', 'Python', 'Django', 'REST APIs', 'UI/UX Design'],
    certifications: ['AWS Certified Developer', 'Meta Front-End Certificate', 'Scrum Master'],
    initials: 'JD'
  },
  {
    id: '2',
    name: 'John Smith',
    title: 'Marketing Specialist',
    empId: 'EMP-1042',
    dept: 'Marketing',
    status: 'Present',
    checkIn: '10:00 AM',
    checkOut: '19:00 PM',
    workHours: '09:00',
    email: 'john.smith@dayflow.com',
    phone: '+91 9876543210',
    company: 'DayFlow Technologies',
    manager: 'Michael Chang',
    location: 'Bangalore, India',
    about: 'Full-stack software architect with 6+ years of enterprise application development.',
    jobLove: 'Architecting scalable systems and mentoring junior engineers.',
    hobbies: 'Open source contribution, cycling, and web performance tuning.',
    skills: ['SEO', 'Digital Marketing', 'HubSpot', 'Content Strategy'],
    certifications: ['Google Analytics Professional'],
    initials: 'JS'
  },
  {
    id: '3',
    name: 'Alice Wong',
    title: 'Sales Lead',
    empId: 'EMP-1089',
    dept: 'Sales',
    status: 'Absent',
    checkIn: '-:-',
    checkOut: '-:-',
    workHours: '00:00',
    email: 'alice.wong@dayflow.com',
    phone: '+91 9123456789',
    company: 'DayFlow Technologies',
    manager: 'Michael Chang',
    location: 'Mumbai, India',
    about: 'Lead UI/UX designer crafting intuitive digital experiences for enterprise SaaS platforms.',
    jobLove: 'Transforming complex administrative workflows into beautiful, effortless user journeys.',
    hobbies: 'UI motion design, photography, and interior styling.',
    skills: ['Salesforce', 'B2B Sales', 'Negotiation'],
    certifications: ['Certified Sales Professional'],
    initials: 'AW'
  },
  {
    id: '4',
    name: 'Michael Kim',
    title: 'Senior Developer',
    empId: 'EMP-1102',
    dept: 'Engineering',
    status: 'Present',
    checkIn: '09:00 AM',
    checkOut: '17:00 PM',
    workHours: '08:00',
    email: 'michael.kim@dayflow.com',
    phone: '+91 9988776655',
    company: 'DayFlow Technologies',
    manager: 'Michael Chang',
    location: 'Delhi, India',
    about: 'Strategic marketing practitioner focusing on B2B SaaS growth and product positioning.',
    jobLove: 'Connecting HR leaders with innovative software solutions that save them time.',
    hobbies: 'Content writing, marathon running, and digital media analytics.',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    certifications: ['AWS Solutions Architect'],
    initials: 'MK'
  },
  {
    id: '5',
    name: 'Ashvek Anand Parab',
    title: 'BE Computer Engineering',
    empId: '24C010',
    dept: 'Engineering',
    status: 'Present',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    workHours: '09:00',
    email: '24c010@aiemgoa.ac.in',
    phone: '+91 9518788852',
    company: 'DayFlow Technologies',
    manager: 'Michael Chang',
    location: 'Goa, India',
    about: 'Passionate software engineer focused on building clean web interfaces.',
    jobLove: 'I love solving complex workflow challenges.',
    hobbies: 'Building side projects, playing chess.',
    skills: ['TypeScript', 'React', 'Python'],
    certifications: ['AWS Certified Developer'],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '6',
    name: 'Sarah Jenkins',
    title: 'Senior UX Engineer',
    empId: 'EMP-1044',
    dept: 'Design',
    status: 'Present',
    checkIn: '09:10 AM',
    checkOut: '18:00 PM',
    workHours: '08:50',
    email: 'sarah.jenkins@dayflow.com',
    phone: '+91 9871122334',
    company: 'DayFlow Technologies',
    manager: 'Jordan Lee',
    location: 'Goa, India',
    about: 'UX engineer bridging interface aesthetics with frontend architecture.',
    jobLove: 'Crafting responsive accessibility tools.',
    hobbies: 'Sketching, hiking.',
    skills: ['Figma', 'Accessibility', 'React'],
    certifications: ['CPACC Accessibility Certification'],
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  }
]

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mode, setMode] = useState<Mode>('login')
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  
  // Navigation state
  const [activeTab, setActiveTab] = useState<'Employees' | 'Attendance' | 'Time Off'>('Employees')
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
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
  const [newEmp, setNewEmp] = useState<{
    name: string
    title: string
    empId: string
    dept: string
    status: Employee['status']
  }>({
    name: '',
    title: '',
    empId: '',
    dept: 'Engineering',
    status: 'Present'
  })

  // Sign in handler
  const handleAuthSubmit = (e: FormEvent) => {
    e.preventDefault()
    setIsAuthenticated(true)
  }

  const handleAddEmployee = (e: FormEvent) => {
    e.preventDefault()
    if (!newEmp.name.trim()) return
    const initials = newEmp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    const created: Employee = {
      id: Date.now().toString(),
      name: newEmp.name,
      title: newEmp.title || 'Team Member',
      empId: newEmp.empId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      dept: newEmp.dept,
      status: newEmp.status,
      checkIn: newEmp.status === 'Present' ? '10:00 AM' : '-:-',
      checkOut: newEmp.status === 'Present' ? '19:00 PM' : '-:-',
      workHours: newEmp.status === 'Present' ? '09:00' : '00:00',
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
      initials
    }
    setEmployees([created, ...employees])
    setSelectedEmployee(created)
    setNewEmp({ name: '', title: '', empId: '', dept: 'Engineering', status: 'Present' })
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
                          emp.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.dept.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Admin Portal Layout
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
              onClick={() => { setActiveTab('Employees'); setSelectedEmployee(null); setStatusFilter('All'); }}
            >
              Employees
            </button>
            <button 
              className={`nav-link-btn ${activeTab === 'Attendance' ? 'active' : ''}`}
              onClick={() => { setActiveTab('Attendance'); setSelectedEmployee(null); setStatusFilter('All'); }}
            >
              Attendance
            </button>
            <button 
              className={`nav-link-btn ${activeTab === 'Time Off' ? 'active' : ''}`}
              onClick={() => { setActiveTab('Time Off'); setSelectedEmployee(null); setStatusFilter('All'); }}
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

      {/* Sub Header Title Bar (for non-attendance tabs) */}
      {activeTab !== 'Attendance' && (
        <div className="wireframe-subheader">
          <div className="subheader-title-group">
            <h1 className="subheader-title">
              {activeTab === 'Time Off' ? 'Time Off & Leave Requests' :
               selectedEmployee ? 'My Profile' : 'Employees Directory'}
            </h1>
            {activeTab === 'Employees' && selectedEmployee && (
              <button className="btn-back-directory" onClick={() => setSelectedEmployee(null)}>
                ← Back to Directory
              </button>
            )}
          </div>

          <div className="subheader-actions">
            {activeTab === 'Employees' && (
              <button className="btn-add-new-emp" onClick={() => setIsModalOpen(true)}>
                + Add Employee
              </button>
            )}
            {activeTab === 'Time Off' && (
              <button className="btn-add-new-emp">
                + New Leave Request
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main App Content View */}
      <main className="wireframe-main-content">
        {/* ==================== TAB 1: EMPLOYEES ==================== */}
        {activeTab === 'Employees' && (
          selectedEmployee ? (
            /* Profile Details View */
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
              {/* Filter Bar */}
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
                </div>

                <div className="filter-search-box">
                  <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Search employee by name, ID, title..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Cards Grid */}
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
                        <span className="view-profile-link">View Profile →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* ==================== TAB 2: ATTENDANCE (WIREFRAME MATCH) ==================== */}
        {activeTab === 'Attendance' && (
          <div className="attendance-wireframe-layout">
            {/* Top Header Title & Action Tools */}
            <div className="attendance-header-bar">
              <div className="attendance-title-wrap">
                <h1 className="attendance-main-title">Attendance</h1>
                <p className="attendance-main-sub">View and manage daily employee attendance records.</p>
              </div>

              <div className="attendance-top-actions">
                <div className="attendance-search-field">
                  <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Search employee..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <button 
                  className={`btn-attendance-filter ${statusFilter !== 'All' ? 'active' : ''}`}
                  onClick={() => setStatusFilter(statusFilter === 'All' ? 'Absent' : 'All')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  Filter
                </button>

                <button className="btn-attendance-export">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export
                </button>
              </div>
            </div>

            {/* Controls Bar (Date controls + Present/Absent Badges) */}
            <div className="attendance-control-panel">
              <div className="panel-left-controls">
                <div className="arrow-btn-group">
                  <button className="ctrl-btn-square">‹</button>
                  <button className="ctrl-btn-square">›</button>
                </div>

                <button className="ctrl-btn-dropdown">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Date ▾
                </button>

                <button className="ctrl-btn-tab active">Day</button>
              </div>

              <div className="panel-center-date">
                <div className="date-display-pill">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>22 October 2025</span>
                </div>
              </div>

              <div className="panel-right-summary">
                <span className="summary-pill present">
                  <span className="dot present-dot"></span> Present ({employees.filter(e => e.status === 'Present').length})
                </span>
                <span className="summary-pill absent">
                  <span className="dot absent-dot"></span> Absent ({employees.filter(e => e.status === 'Absent' || e.status === 'On Leave' || e.status === 'Sick Leave').length})
                </span>
              </div>
            </div>

            {/* Attendance Wireframe Table Card */}
            <div className="attendance-wireframe-card">
              <table className="attendance-wireframe-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Work Hours</th>
                    <th>Extra Hours</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => {
                    const isAbsent = emp.status === 'Absent' || emp.status === 'On Leave' || emp.status === 'Sick Leave'
                    return (
                      <tr key={emp.id} className={isAbsent ? 'row-absent' : ''}>
                        <td>
                          <div className="emp-cell">
                            <div className={`emp-cell-avatar ${isAbsent ? 'avatar-absent' : 'avatar-present'}`}>
                              {emp.initials || emp.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                            </div>
                            <div className="emp-cell-info">
                              <span className="emp-cell-name">{emp.name}</span>
                              <span className="emp-cell-dept">{emp.dept}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill-wireframe ${isAbsent ? 'pill-absent' : 'pill-present'}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td>{emp.checkIn || '-:-'}</td>
                        <td>{emp.checkOut || '-:-'}</td>
                        <td>{emp.workHours || '00:00'}</td>
                        <td className="extra-hours-cell">
                          {emp.status === 'Present' ? '01:00' : '00:00'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="row-action-pencil" title="Edit Record">✎</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Table Pagination Footer */}
              <div className="table-pagination-footer">
                <span className="pagination-text">
                  Showing 1 to {filteredEmployees.length} of {employees.length} entries
                </span>
                <div className="pagination-btns">
                  <button className="pg-btn disabled">Previous</button>
                  <button className="pg-btn active">1</button>
                  <button className="pg-btn">2</button>
                  <button className="pg-btn">3</button>
                  <span className="pg-ellipsis">...</span>
                  <button className="pg-btn">Next</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: TIME OFF ==================== */}
        {activeTab === 'Time Off' && (
          <div className="timeoff-tab-container">
            <div className="attendance-overview-section">
              <div className="attendance-overview-header">
                <div>
                  <h3 className="attendance-section-title">Time Off & Leave Summary</h3>
                  <p className="attendance-section-sub">Overview of employee leave requests, balances, and scheduled absences</p>
                </div>
                <span className="attendance-date-badge">22 Aug 2026</span>
              </div>

              <div className="attendance-metrics-grid">
                <div className="metric-card metric-on-leave">
                  <div className="metric-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div className="metric-info">
                    <span className="metric-value">1</span>
                    <span className="metric-label">Approved Leave Today</span>
                  </div>
                </div>

                <div className="metric-card metric-sick">
                  <div className="metric-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  </div>
                  <div className="metric-info">
                    <span className="metric-value">1</span>
                    <span className="metric-label">Sick Leave Today</span>
                  </div>
                </div>

                <div className="metric-card metric-late">
                  <div className="metric-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div className="metric-info">
                    <span className="metric-value">3</span>
                    <span className="metric-label">Pending Requests</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="attendance-table-card">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Duration</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="table-emp-user">
                        <div className="table-avatar-initials">AW</div>
                        <div className="table-emp-text">
                          <span className="table-emp-name">Alice Wong</span>
                          <span className="table-emp-id">EMP-1089</span>
                        </div>
                      </div>
                    </td>
                    <td>Annual Paid Leave</td>
                    <td>3 Days</td>
                    <td>22 Aug - 24 Aug</td>
                    <td>Personal Vacation</td>
                    <td><span className="status-pill status-on-leave">Approved</span></td>
                    <td><button className="btn-table-action">Details</button></td>
                  </tr>
                </tbody>
              </table>
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

              <div className="modal-field">
                <label>Attendance Status</label>
                <select 
                  value={newEmp.status}
                  onChange={(e) => setNewEmp({ ...newEmp, status: e.target.value as Employee['status'] })}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Late">Late</option>
                  <option value="Sick Leave">Sick Leave</option>
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
