import { useEffect, useState } from 'react'
// Main admin dashboard: authentication, navigation, employee records, and admin actions.
import type { FormEvent } from 'react'
import './App.css'
import { EmployeeDetailsModal } from './components/EmployeeDetailsModal'
import type { Employee, ResumeEntry } from './components/EmployeeDetailsModal'
import { DEFAULT_SALARY_STRUCTURE, EMPTY_SALARY_STRUCTURE } from './data/salary'
import type { SalaryLog, SalaryStructure } from './data/salary'
import { DEFAULT_PRIVATE_INFO } from './data/privateInfo'
import type { PrivateInfo } from './data/privateInfo'
import { LeaveApplicationModal } from './components/LeaveApplicationModal'
import dashboardData from './data/dashboard.json'

type Mode = 'login' | 'signup'
type FormErrors = Record<string, string>

const API_URL = import.meta.env.VITE_API_URL ?? '/api'
const ATTENDANCE_MIN_DATE = '2026-08-22'
const ATTENDANCE_MAX_DATE = '2026-08-22'

function formatAttendanceDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validPassword(password: string) {
  return password.length >= 10 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)
}

function csrfCookie() {
  return document.cookie.split('; ').find((item) => item.startsWith('csrftoken='))?.split('=')[1]
}

async function getCsrfToken() {
  await fetch(`${API_URL}/auth/csrf/`, { credentials: 'include' })
  return csrfCookie()
}

interface TimeOffRequest {
  id: string
  employeeName: string
  startDate: string
  endDate: string
  timeOffType: 'Paid Time Off' | 'Sick Time Off' | 'Casual Leave'
  status: 'Approved' | 'Pending' | 'Refused'
  allocationDays?: number
}

/* const INITIAL_EMPLOYEES: Employee[] = [
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
    initials: 'JD',
    paidLeaveAvailable: 24,
    sickLeaveAvailable: 7,
    casualLeaveAvailable: 5,
    attendanceHistory: [
      { date: '22 Oct 2025', status: 'Present', checkIn: '10:00 AM', checkOut: '19:00 PM', workHours: '09:00' },
      { date: '21 Oct 2025', status: 'Present', checkIn: '09:55 AM', checkOut: '19:05 PM', workHours: '09:10' },
      { date: '20 Oct 2025', status: 'Late', checkIn: '10:45 AM', checkOut: '19:30 PM', workHours: '08:45' },
      { date: '19 Oct 2025', status: 'On Leave', checkIn: '-:-', checkOut: '-:-', workHours: '00:00' },
      { date: '18 Oct 2025', status: 'Present', checkIn: '09:50 AM', checkOut: '19:00 PM', workHours: '09:10' }
    ],
    leaveHistory: [
      { id: 'lh1', leaveType: 'Paid Time Off', startDate: '28/10/2025', endDate: '28/10/2025', days: 1, reason: 'Family event and personal commitments', status: 'Pending' },
      { id: 'lh2', leaveType: 'Sick Time Off', startDate: '15/09/2025', endDate: '16/09/2025', days: 2, reason: 'High fever and medical rest advised by physician', status: 'Approved' },
      { id: 'lh3', leaveType: 'Casual Leave', startDate: '05/08/2025', endDate: '05/08/2025', days: 1, reason: 'Urgent home maintenance works', status: 'Approved' }
    ]
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
    initials: 'JS',
    paidLeaveAvailable: 20,
    sickLeaveAvailable: 5,
    casualLeaveAvailable: 4,
    attendanceHistory: [
      { date: '22 Oct 2025', status: 'Present', checkIn: '10:00 AM', checkOut: '19:00 PM', workHours: '09:00' },
      { date: '21 Oct 2025', status: 'Present', checkIn: '10:00 AM', checkOut: '19:00 PM', workHours: '09:00' },
      { date: '20 Oct 2025', status: 'Present', checkIn: '09:45 AM', checkOut: '18:50 PM', workHours: '09:05' }
    ],
    leaveHistory: [
      { id: 'lh4', leaveType: 'Sick Time Off', startDate: '01/11/2025', endDate: '03/11/2025', days: 3, reason: 'Dental surgery and recovery rest', status: 'Approved' }
    ]
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
    initials: 'AW',
    paidLeaveAvailable: 18,
    sickLeaveAvailable: 6,
    casualLeaveAvailable: 3,
    attendanceHistory: [
      { date: '22 Oct 2025', status: 'Absent', checkIn: '-:-', checkOut: '-:-', workHours: '00:00' },
      { date: '21 Oct 2025', status: 'Present', checkIn: '09:30 AM', checkOut: '18:30 PM', workHours: '09:00' }
    ],
    leaveHistory: [
      { id: 'lh5', leaveType: 'Paid Time Off', startDate: '12/11/2025', endDate: '15/11/2025', days: 4, reason: 'Annual family vacation trip', status: 'Pending' }
    ]
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
    initials: 'MK',
    paidLeaveAvailable: 22,
    sickLeaveAvailable: 7,
    casualLeaveAvailable: 5,
    attendanceHistory: [
      { date: '22 Oct 2025', status: 'Present', checkIn: '09:00 AM', checkOut: '17:00 PM', workHours: '08:00' }
    ],
    leaveHistory: [
      { id: 'lh6', leaveType: 'Paid Time Off', startDate: '20/11/2025', endDate: '20/11/2025', days: 1, reason: 'Personal work', status: 'Refused' }
    ]
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
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    paidLeaveAvailable: 24,
    sickLeaveAvailable: 7,
    casualLeaveAvailable: 5,
    attendanceHistory: [
      { date: '22 Oct 2025', status: 'Present', checkIn: '09:00 AM', checkOut: '06:00 PM', workHours: '09:00' }
    ],
    leaveHistory: []
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
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    paidLeaveAvailable: 21,
    sickLeaveAvailable: 6,
    casualLeaveAvailable: 4,
    attendanceHistory: [
      { date: '22 Oct 2025', status: 'Present', checkIn: '09:10 AM', checkOut: '18:00 PM', workHours: '08:50' }
    ],
    leaveHistory: []
  }
]
*/

// Employees are created through the admin form instead of seeded hardcoded users.
const INITIAL_EMPLOYEES: Employee[] = []
// Leave requests are populated from the application workflow, not seeded fixtures.
const INITIAL_TIME_OFF_REQUESTS: TimeOffRequest[] = []
const ADMIN_PROFILE: Employee = {
  id: 'admin-profile',
  name: 'Admin User',
  title: 'HR Administrator',
  empId: 'ADMIN-001',
  dept: 'Administration',
  status: 'Present',
  email: 'admin@dayflow.com',
  phone: '+91 9876543210',
  company: 'DayFlow Technologies',
  manager: 'Executive Team',
  location: 'Goa, India',
  about: 'Administrator responsible for managing employee records, attendance, and time off workflows.',
  jobLove: 'Helping teams work smoothly through simple and reliable HR processes.',
  hobbies: 'Reading, planning, and exploring new productivity tools.',
  skills: ['HR Management', 'Team Leadership', 'Reporting', 'Administration'],
  certifications: ['DayFlow Admin Access'],
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
  initials: 'AU',
  paidLeaveAvailable: 24,
  sickLeaveAvailable: 7,
  casualLeaveAvailable: 5,
  attendanceHistory: [],
  leaveHistory: []
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mode, setMode] = useState<Mode>('login')
  const [form, setForm] = useState({ email: 'admin', password: '1234567890', confirmPassword: '' })
  const [authErrors, setAuthErrors] = useState<FormErrors>({})
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  
  // Navigation state controls which admin dashboard section is visible.
  const [activeTab, setActiveTab] = useState<'Employees' | 'Attendance' | 'Time Off' | 'Salary Logs'>('Employees')
  const [attendanceDate, setAttendanceDate] = useState(ATTENDANCE_MAX_DATE)
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES)
  
  // Employee Popup Modal State
  const [profileModalEmployee, setProfileModalEmployee] = useState<Employee | null>(null)
  const [salaryByEmployee, setSalaryByEmployee] = useState<Record<string, SalaryStructure>>(() => {
    try {
      return JSON.parse(localStorage.getItem('dayflow-salary-structures') ?? '{}') as Record<string, SalaryStructure>
    } catch {
      return {}
    }
  })
  const [salaryLogsByEmployee, setSalaryLogsByEmployee] = useState<Record<string, SalaryLog[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem('dayflow-salary-logs') ?? '{}') as Record<string, SalaryLog[]>
    } catch {
      return {}
    }
  })
  const [salarySaving, setSalarySaving] = useState(false)
  const [salaryError, setSalaryError] = useState('')
  const [privateInfoByEmployee, setPrivateInfoByEmployee] = useState<Record<string, PrivateInfo>>({})
  const [resumeByEmployee, setResumeByEmployee] = useState<Record<string, ResumeEntry[]>>({})

  useEffect(() => {
    localStorage.setItem('dayflow-salary-structures', JSON.stringify(salaryByEmployee))
  }, [salaryByEmployee])

  useEffect(() => {
    localStorage.setItem('dayflow-salary-logs', JSON.stringify(salaryLogsByEmployee))
  }, [salaryLogsByEmployee])
  const [selectedLeaveApplication, setSelectedLeaveApplication] = useState<TimeOffRequest | null>(null)

  // Time Off view state & requests
  const [timeOffSubTab, setTimeOffSubTab] = useState<'Time Off' | 'Allocation'>('Time Off')
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>(INITIAL_TIME_OFF_REQUESTS)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // New Employee form state is used by the admin employee provisioning dialog.
  const [newEmp, setNewEmp] = useState<{
    company: string
    name: string
    email: string
    title: string
    empId: string
    dept: string
    status: Employee['status']
    phone: string
    location: string
  }>({
    company: '',
    name: '',
    email: '',
    title: '',
    empId: '',
    dept: dashboardData.defaultDepartment,
    status: dashboardData.defaultAttendanceStatus as Employee['status'],
    phone: '',
    location: ''
  })
  const [employeeFormError, setEmployeeFormError] = useState('')
  const [employeeFormSuccess, setEmployeeFormSuccess] = useState('')
  const [generatedEmployeeId, setGeneratedEmployeeId] = useState('')
  const [employeeFormLoading, setEmployeeFormLoading] = useState(false)

  // Open employee details modal popup handler
  const openEmployeePopup = (emp: Employee) => {
    setSalaryError('')
    setProfileModalEmployee(emp)
  }

  const handleSaveSalary = async (employee: Employee, nextSalary: SalaryStructure) => {
    setSalarySaving(true)
    setSalaryError('')
    const previousSalary = salaryByEmployee[employee.id] ?? DEFAULT_SALARY_STRUCTURE
    try {
      const token = await getCsrfToken()
      const response = await fetch(`${API_URL}/auth/salary-change/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'X-CSRFToken': token } : {}) },
        body: JSON.stringify({
          employeeEmail: employee.email,
          employeeName: employee.name,
          oldSalary: previousSalary,
          newSalary: nextSalary
        })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error ?? 'Unable to send the salary update email.')
      setSalaryByEmployee((current) => ({ ...current, [employee.id]: nextSalary }))
      setSalaryLogsByEmployee((current) => ({
        ...current,
        [employee.id]: [...(current[employee.id] ?? []), {
          id: `${employee.id}-${Date.now()}`,
          changedAt: new Date().toISOString(),
          oldSalary: previousSalary,
          newSalary: nextSalary
        }]
      }))
    } catch (error) {
      setSalaryError(error instanceof Error ? error.message : 'Unable to save the salary update.')
    } finally {
      setSalarySaving(false)
    }
  }

  const handleSavePrivateInfo = (employee: Employee, privateInfo: PrivateInfo) => {
    setPrivateInfoByEmployee((current) => ({ ...current, [employee.id]: privateInfo }))
  }

  const handleSaveResume = (employee: Employee, resumeEntries: ResumeEntry[]) => {
    setResumeByEmployee((current) => ({ ...current, [employee.id]: resumeEntries }))
  }

  const handleSaveEmployee = (updatedEmployee: Employee) => {
    setEmployees((currentEmployees) => currentEmployees.map((employee) => employee.id === updatedEmployee.id ? updatedEmployee : employee))
    setProfileModalEmployee(updatedEmployee)
  }

  const handleDeleteEmployee = (employee: Employee) => {
    setEmployees((currentEmployees) => currentEmployees.filter((item) => item.id !== employee.id))
    setProfileModalEmployee(null)
  }

  const shiftAttendanceDate = (days: number) => {
    const nextDate = new Date(`${attendanceDate}T00:00:00`)
    nextDate.setDate(nextDate.getDate() + days)
    const nextDateValue = nextDate.toISOString().slice(0, 10)
    if (nextDateValue >= ATTENDANCE_MIN_DATE && nextDateValue <= ATTENDANCE_MAX_DATE) {
      setAttendanceDate(nextDateValue)
    }
  }

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthSuccess('')
    // Temporary demo access: allow the login form to submit with both fields blank.
    if (mode === 'login' && !form.email.trim() && !form.password) {
      setIsAuthenticated(true)
      return
    }
    const nextErrors: FormErrors = {}
    const email = form.email.trim().toLowerCase()
    if (!email) nextErrors.email = 'Work email is required.'
    else if (!validEmail(email)) nextErrors.email = 'Enter a valid email address.'
    if (!form.password) nextErrors.password = 'Password is required.'
    else if (mode === 'signup' && !validPassword(form.password)) nextErrors.password = 'Use 10+ characters with upper, lower, and a number.'
    if (mode === 'signup' && form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'
    setAuthErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setAuthLoading(true)
    try {
      const token = await getCsrfToken()
      const response = await fetch(`${API_URL}/auth/${mode}/`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'X-CSRFToken': token } : {}) },
        body: JSON.stringify({ email, password: form.password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error ?? 'Unable to complete your request.')
      if (mode === 'signup') {
        setMode('login')
        setForm({ email, password: '', confirmPassword: '' })
        setAuthSuccess('Account created. You can now sign in.')
      } else setIsAuthenticated(true)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'A network error occurred. Please try again.')
    } finally { setAuthLoading(false) }
  }

  const handleAddEmployee = async (e: FormEvent) => {
    e.preventDefault()
    setEmployeeFormSuccess('')
    const missingField = [
      ['Company Name', newEmp.company],
      ['Name', newEmp.name],
      ['Email', newEmp.email],
      ['Phone', newEmp.phone],
      ['Department', newEmp.dept],
      ['Location', newEmp.location]
    ].find(([, value]) => !value.trim())?.[0]
    if (missingField) {
      setEmployeeFormError(`${missingField} is required.`)
      return
    }
    if (!validEmail(newEmp.email.trim())) {
      setEmployeeFormError('Enter a valid employee email address.')
      return
    }
    setEmployeeFormError('')
    setEmployeeFormLoading(true)
    try {
      const token = await getCsrfToken()
      const response = await fetch(`${API_URL}/auth/employees/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'X-CSRFToken': token } : {}) },
        body: JSON.stringify({
          company: newEmp.company,
          name: newEmp.name,
          email: newEmp.email,
          phone: newEmp.phone,
          department: newEmp.dept,
          location: newEmp.location,
          }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error ?? 'Unable to add this employee.')

      const initials = newEmp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      const created: Employee = {
        id: String(data.id),
        name: data.name,
        title: 'Team Member',
        empId: data.employeeId,
        dept: newEmp.dept,
        status: dashboardData.defaultAttendanceStatus as Employee['status'],
        checkIn: '10:00 AM',
        checkOut: '19:00 PM',
        workHours: '09:00',
        email: data.email,
        phone: data.phone,
        company: data.company,
        manager: '',
        location: newEmp.location,
        about: 'New team member profile.',
        jobLove: 'Excited to contribute to DayFlow development.',
        hobbies: 'Reading and coding.',
        skills: ['TypeScript', 'Web Development'],
        certifications: ['DayFlow Onboarding'],
        initials,
        paidLeaveAvailable: 24,
        sickLeaveAvailable: 7,
        casualLeaveAvailable: 5,
        attendanceHistory: [
          { date: '22 Oct 2025', status: dashboardData.defaultAttendanceStatus as Employee['status'], checkIn: '10:00 AM', checkOut: '19:00 PM', workHours: '09:00' }
        ],
        leaveHistory: []
      }
      setEmployees(currentEmployees => [created, ...currentEmployees])
      setSalaryByEmployee((current) => ({ ...current, [created.id]: EMPTY_SALARY_STRUCTURE }))
      setResumeByEmployee((current) => ({ ...current, [created.id]: [] }))
      setGeneratedEmployeeId(data.employeeId)
      setActiveTab('Employees')
      setSearchQuery('')
      setDeptFilter('All')
      setStatusFilter('All')
      setIsModalOpen(false)
      setNewEmp({ company: '', name: '', email: '', title: '', empId: '', dept: dashboardData.defaultDepartment, status: dashboardData.defaultAttendanceStatus as Employee['status'], phone: '', location: '' })
      setEmployeeFormSuccess(`Employee added successfully. Login ID: ${data.employeeId}`)
    } catch (error) {
      setEmployeeFormError(error instanceof Error ? error.message : 'A network error occurred. Please try again.')
    } finally {
      setEmployeeFormLoading(false)
    }
  }

  // Time off actions
  const handleApproveLeave = (id: string) => {
    setTimeOffRequests(requests => 
      requests.map(req => req.id === id ? { ...req, status: 'Approved' } : req)
    )
  }

  const handleRejectLeave = (id: string) => {
    setTimeOffRequests(requests => 
      requests.map(req => req.id === id ? { ...req, status: 'Refused' } : req)
    )
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

  const isAllocationView = timeOffSubTab === 'Allocation'
  // Pending requests stay in Time Off; decided requests move to Allocation.
  const filteredTimeOffRequests = timeOffRequests.filter(req => {
    const matchesSearch = req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.timeOffType.toLowerCase().includes(searchQuery.toLowerCase())
    const belongsInCurrentQueue = isAllocationView ? req.status !== 'Pending' : req.status === 'Pending'
    return matchesSearch && belongsInCurrentQueue
  })
  const leaveApplicationEmployee = selectedLeaveApplication
    ? employees.find(emp => emp.name === selectedLeaveApplication.employeeName) ?? null
    : null

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
              <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setForm({ email: 'admin', password: '1234567890', confirmPassword: '' }); setAuthErrors({}); setAuthError(''); setAuthSuccess('') }} role="tab" aria-selected={mode === 'login'}>Sign in</button>
              <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setForm({ email: '', password: '', confirmPassword: '' }); setAuthErrors({}); setAuthError(''); setAuthSuccess('') }} role="tab" aria-selected={mode === 'signup'}>Sign up</button>
            </div>

            <form onSubmit={handleAuthSubmit} noValidate>
              <div className="field-group">
                <label htmlFor="email">{mode === 'login' ? 'Admin Username / Email' : 'Work Email'}</label>
                  <input id="email" type="text" autoComplete="username" placeholder={mode === 'login' ? 'admin' : 'admin@company.com'} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} aria-invalid={Boolean(authErrors.email)} />
                  {authErrors.email && <span className="field-error">{authErrors.email}</span>}
              </div>

              <div className="field-group">
                <label htmlFor="password">Password</label>
                  <input id="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder={mode === 'login' ? '1234567890' : 'Enter your admin password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} aria-invalid={Boolean(authErrors.password)} />
                  {authErrors.password && <span className="field-error">{authErrors.password}</span>}
              </div>

              {mode === 'signup' && (
                <div className="field-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input id="confirmPassword" type="password" autoComplete="new-password" placeholder="Repeat your admin password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} aria-invalid={Boolean(authErrors.confirmPassword)} />
                  {authErrors.confirmPassword && <span className="field-error">{authErrors.confirmPassword}</span>}
                </div>
              )}

              {authError && <div className="alert error" role="alert">{authError}</div>}
              {authSuccess && <div className="alert success" role="status">{authSuccess}</div>}
              <button className="submit" type="submit" disabled={authLoading}>
                {authLoading ? 'Please wait...' : mode === 'login' ? 'Sign in to Admin Portal' : 'Create Admin Account'} <span>→</span>
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
              onClick={() => { setActiveTab('Employees'); setStatusFilter('All'); }}
            >
              Employees
            </button>
            <button 
              className={`nav-link-btn ${activeTab === 'Attendance' ? 'active' : ''}`}
              onClick={() => { setActiveTab('Attendance'); setStatusFilter('All'); }}
            >
              Attendance
            </button>
            <button 
              className={`nav-link-btn ${activeTab === 'Time Off' ? 'active' : ''}`}
              onClick={() => { setActiveTab('Time Off'); setStatusFilter('All'); }}
            >
              Time Off
            </button>
            <button
              className={`nav-link-btn ${activeTab === 'Salary Logs' ? 'active' : ''}`}
              onClick={() => { setActiveTab('Salary Logs'); setStatusFilter('All'); }}
            >
              Salary Logs
            </button>
          </nav>
        </div>

        <div className="nav-right-actions">
          <button className="nav-icon-circle coral-badge" title="Notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          <div 
            className="nav-user-box blue-badge" 
            title="View Admin Profile"
            onClick={() => openEmployeePopup(ADMIN_PROFILE)}
          >
            <img src={ADMIN_PROFILE.avatarUrl} alt="Admin profile" />
          </div>
        </div>
      </header>

      {/* Sub Header Title Bar (for Employees tab) */}
      {activeTab === 'Employees' && (
        <div className="wireframe-subheader">
          <div className="subheader-title-group">
            <h1 className="subheader-title">Employees Directory</h1>
          </div>

          <div className="subheader-actions">
            <button type="button" className="btn-add-new-emp" onClick={() => { setEmployeeFormError(''); setEmployeeFormSuccess(''); setGeneratedEmployeeId(''); setIsModalOpen(true) }}>
              + Add Employee
            </button>
          </div>
        </div>
      )}
      {activeTab === 'Salary Logs' && (
        <div className="wireframe-subheader">
          <div className="subheader-title-group">
            <h1 className="subheader-title">Salary Logs</h1>
          </div>
        </div>
      )}

      {/* Main App Content View */}
      <main className="wireframe-main-content">
        {/* ==================== TAB 1: EMPLOYEES ==================== */}
        {activeTab === 'Employees' && (
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
                  {dashboardData.departments.map((department) => <option key={department} value={department}>{department}</option>)}
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
                  onClick={() => openEmployeePopup(emp)}
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
                      <span className="view-profile-link">View Details →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: ATTENDANCE ==================== */}
        {activeTab === 'Attendance' && (
          <div className="attendance-wireframe-layout">
            {/* Top Header Title & Employee Search + Action Tools */}
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

            {/* Controls Bar (Date controls + Present/Absent Summary) */}
            <div className="attendance-control-panel">
              <div className="panel-left-controls">
                <div className="arrow-btn-group">
                  <button className="ctrl-btn-square" onClick={() => shiftAttendanceDate(-1)} disabled={attendanceDate <= ATTENDANCE_MIN_DATE} aria-label="Previous date">‹</button>
                  <button className="ctrl-btn-square" onClick={() => shiftAttendanceDate(1)} disabled={attendanceDate >= ATTENDANCE_MAX_DATE} aria-label="Next date">›</button>
                </div>

                <label className="ctrl-btn-dropdown">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Date
                  <input
                    className="attendance-date-input"
                    type="date"
                    min={ATTENDANCE_MIN_DATE}
                    max={ATTENDANCE_MAX_DATE}
                    value={attendanceDate}
                    onChange={(event) => setAttendanceDate(event.target.value)}
                    aria-label="Select attendance date"
                  />
                </label>
              </div>

              <div className="panel-center-date">
                <div className="date-display-pill">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                   <span>{formatAttendanceDate(attendanceDate)}</span>
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

            {/* Attendance Overview Metrics Panel (PERMANENTLY VISIBLE BELOW DATE BAR) */}
            <div className="attendance-overview-expandable-card">
              <div className="overview-card-header">
                <div>
                  <h3 className="overview-card-title">Attendance Overview & Daily Statistics</h3>
                  <p className="overview-card-sub">Real-time attendance rate, status breakdown, and staff metrics</p>
                </div>
                <span className="overview-badge">Live Metrics Overview</span>
              </div>

              <div className="attendance-metrics-grid">
                <div 
                  className={`metric-card metric-present ${statusFilter === 'Present' ? 'active-metric' : ''}`}
                  onClick={() => setStatusFilter(statusFilter === 'Present' ? 'All' : 'Present')}
                >
                  <div className="metric-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div className="metric-info">
                    <span className="metric-value">{employees.filter(e => e.status === 'Present').length}</span>
                    <span className="metric-label">Present Today</span>
                  </div>
                </div>

                <div 
                  className={`metric-card metric-absent ${statusFilter === 'Absent' ? 'active-metric' : ''}`}
                  onClick={() => setStatusFilter(statusFilter === 'Absent' ? 'All' : 'Absent')}
                >
                  <div className="metric-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </div>
                  <div className="metric-info">
                    <span className="metric-value">{employees.filter(e => e.status === 'Absent').length}</span>
                    <span className="metric-label">Absent</span>
                  </div>
                </div>

                <div 
                  className={`metric-card metric-on-leave ${statusFilter === 'On Leave' ? 'active-metric' : ''}`}
                  onClick={() => setStatusFilter(statusFilter === 'On Leave' ? 'All' : 'On Leave')}
                >
                  <div className="metric-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div className="metric-info">
                    <span className="metric-value">{employees.filter(e => e.status === 'On Leave').length}</span>
                    <span className="metric-label">On Leave</span>
                  </div>
                </div>

                <div 
                  className={`metric-card metric-late ${statusFilter === 'Late' ? 'active-metric' : ''}`}
                  onClick={() => setStatusFilter(statusFilter === 'Late' ? 'All' : 'Late')}
                >
                  <div className="metric-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div className="metric-info">
                    <span className="metric-value">{employees.filter(e => e.status === 'Late').length}</span>
                    <span className="metric-label">Late Arrival</span>
                  </div>
                </div>

                <div 
                  className={`metric-card metric-sick ${statusFilter === 'Sick Leave' ? 'active-metric' : ''}`}
                  onClick={() => setStatusFilter(statusFilter === 'Sick Leave' ? 'All' : 'Sick Leave')}
                >
                  <div className="metric-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  </div>
                  <div className="metric-info">
                    <span className="metric-value">{employees.filter(e => e.status === 'Sick Leave').length}</span>
                    <span className="metric-label">Sick Leave</span>
                  </div>
                </div>
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
                          <div className="emp-cell clickable-emp-row" onClick={() => openEmployeePopup(emp)}>
                            <div className={`emp-cell-avatar ${isAbsent ? 'avatar-absent' : 'avatar-present'}`}>
                              {emp.initials || emp.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                            </div>
                            <div className="emp-cell-info">
                              <span className="emp-cell-name clickable-link-name">{emp.name}</span>
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
                          <button className="row-action-pencil" title="View Details" onClick={() => openEmployeePopup(emp)}>✎</button>
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

        {/* ==================== TAB 3: TIME OFF (MATCHING EXACT WIREFRAME) ==================== */}
        {activeTab === 'Time Off' && (
          <div className="timeoff-wireframe-layout">
            {/* Sub Nav Bar: Time Off | Allocation */}
            <div className="timeoff-subnav-bar">
              <button 
                className={`timeoff-subnav-btn ${timeOffSubTab === 'Time Off' ? 'active' : ''}`}
                onClick={() => setTimeOffSubTab('Time Off')}
              >
                Time Off
              </button>
              <button 
                className={`timeoff-subnav-btn ${timeOffSubTab === 'Allocation' ? 'active' : ''}`}
                onClick={() => setTimeOffSubTab('Allocation')}
              >
                Allocation
              </button>
            </div>

            {/* Action Bar: Searchbar */}
            <div className="timeoff-action-bar">
              <div className="timeoff-searchbar">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input 
                  type="text"
                  placeholder="Searchbar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Leave Balance Available Cards (Paid time Off: 24 Days, Sick time off: 07 Days) */}
            <div className="timeoff-balance-cards-grid">
              <div className="balance-card balance-paid">
                <span className="balance-title">Paid time Off</span>
                 <span className="balance-days">{dashboardData.leaveBalances.paid} Days Available</span>
              </div>
              <div className="balance-card balance-sick">
                <span className="balance-title">Sick time off</span>
                 <span className="balance-days">{String(dashboardData.leaveBalances.sick).padStart(2, '0')} Days Available</span>
              </div>
            </div>

            {/* Time Off Wireframe Data Table */}
            <div className="timeoff-wireframe-card">
              <table className="timeoff-wireframe-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Time off Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTimeOffRequests.map(req => {
                    const targetEmp = employees.find(e => e.name === req.employeeName)
                    const displayStatus = isAllocationView
                      ? req.status === 'Approved' ? 'Accepted' : req.status === 'Refused' ? 'Rejected' : 'Pending'
                      : 'Pending'
                    const statusClass = isAllocationView ? req.status.toLowerCase() : 'pending'
                    return (
                      <tr key={req.id}>
                        <td className="emp-name-cell">
                          <span 
                            className="clickable-link-name"
                            onClick={() => {
                              if (targetEmp) openEmployeePopup(targetEmp)
                            }}
                            title="Click to view employee details"
                          >
                            [{req.employeeName}]
                          </span>
                        </td>
                        <td>{req.startDate}</td>
                        <td>{req.endDate}</td>
                        <td className="type-blue-cell">{req.timeOffType}</td>
                        <td>
                          <div className="timeoff-status-cell-wrap">
                            <span className={`timeoff-status-badge status-${statusClass}`}>
                              {displayStatus}
                            </span>
                            {!isAllocationView && <div className="approval-action-boxes">
                              <button
                                className="view-application-btn"
                                title="View Application"
                                onClick={() => setSelectedLeaveApplication(req)}
                              >
                                View Application
                              </button>
                              <button 
                                className="box-btn-reject"
                                title="Refuse Request"
                                onClick={() => handleRejectLeave(req.id)}
                              >
                                ✖
                              </button>
                              <button 
                                className="box-btn-approve"
                                title="Approve Request"
                                onClick={() => handleApproveLeave(req.id)}
                              >
                                ✔
                              </button>
                            </div>}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Salary Logs' && (
          <div className="salary-logs-page">
            <div className="salary-logs-page-header">
              <div>
                <h2 className="salary-logs-page-title">Salary Change History</h2>
                <p className="salary-logs-page-subtitle">Review previous and current salary structures for every employee.</p>
              </div>
              <span className="overview-badge">Audit Log</span>
            </div>
            {Object.entries(salaryLogsByEmployee).some(([, logs]) => logs.length > 0) ? (
              <div className="salary-logs-list">
                {Object.entries(salaryLogsByEmployee).flatMap(([employeeId, logs]) => {
                  const employee = employees.find((item) => item.id === employeeId)
                  return employee ? [...logs].reverse().map((log) => (
                    <div className="salary-log-entry" key={log.id}>
                      <div className="salary-log-header">
                        <strong>{employee.name}</strong>
                        <span>{new Date(log.changedAt).toLocaleString()}</span>
                      </div>
                      <div className="salary-log-structures">
                        <div><span className="salary-log-label">Previous</span><span>{log.oldSalary.payGrade} | {log.oldSalary.baseSalary} | {log.oldSalary.allowances} | {log.oldSalary.taxDeduction}</span></div>
                        <div><span className="salary-log-label">New</span><span>{log.newSalary.payGrade} | {log.newSalary.baseSalary} | {log.newSalary.allowances} | {log.newSalary.taxDeduction}</span></div>
                      </div>
                    </div>
                  )) : []
                })}
              </div>
            ) : (
              <p className="salary-logs-empty">No salary changes have been recorded.</p>
            )}
          </div>
        )}
      </main>

      {/* Employee Details Popup Modal Overlay Component */}
      <EmployeeDetailsModal 
        key={`${profileModalEmployee?.id || 'emp'}-${activeTab}`}
        employee={profileModalEmployee}
        onClose={() => setProfileModalEmployee(null)}
        showAllTabs={activeTab !== 'Time Off'}
        defaultTab={activeTab === 'Time Off' ? 'Leave & Time Off' : undefined}
        salary={profileModalEmployee ? salaryByEmployee[profileModalEmployee.id] : undefined}
        onSaveSalary={profileModalEmployee ? (salary) => handleSaveSalary(profileModalEmployee, salary) : undefined}
        salarySaving={salarySaving}
        salaryError={salaryError}
        privateInfo={profileModalEmployee ? privateInfoByEmployee[profileModalEmployee.id] ?? DEFAULT_PRIVATE_INFO : undefined}
        onSavePrivateInfo={profileModalEmployee ? (privateInfo) => handleSavePrivateInfo(profileModalEmployee, privateInfo) : undefined}
        resumeEntries={profileModalEmployee ? resumeByEmployee[profileModalEmployee.id] : undefined}
        onSaveResume={profileModalEmployee ? (resumeEntries) => handleSaveResume(profileModalEmployee, resumeEntries) : undefined}
        onSaveEmployee={profileModalEmployee ? handleSaveEmployee : undefined}
        onDeleteEmployee={profileModalEmployee ? handleDeleteEmployee : undefined}
      />

      {selectedLeaveApplication && leaveApplicationEmployee && (
        <LeaveApplicationModal
          employee={leaveApplicationEmployee}
          application={selectedLeaveApplication}
          onClose={() => setSelectedLeaveApplication(null)}
        />
      )}

      {/* New Employee Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content employee-signup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Employee</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddEmployee} className="modal-form">
              <div className="modal-field">
                <label htmlFor="employee-company">Company Name</label>
                <input
                  id="employee-company"
                  type="text"
                  required
                  placeholder="Enter company name"
                  value={newEmp.company}
                  onChange={(e) => {
                    const company = e.target.value
                    setNewEmp({ ...newEmp, company })
                  }}
                />
              </div>

              <div className="modal-field">
                <label htmlFor="employee-name">Name</label>
                <input 
                  id="employee-name"
                  type="text" 
                  required
                  placeholder="Enter employee name"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                />
              </div>

              <div className="modal-field">
                <label htmlFor="employee-email">Email</label>
                <input
                  id="employee-email"
                  type="email"
                  required
                  placeholder="employee@company.com"
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                />
              </div>

              <div className="modal-field">
                <label htmlFor="employee-phone">Phone</label>
                <input
                  id="employee-phone"
                  type="tel"
                  required
                  placeholder="Enter phone number"
                  value={newEmp.phone}
                  onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                />
              </div>

              <div className="modal-field">
                <label htmlFor="employee-department">Department</label>
                <select
                  id="employee-department"
                  required
                  value={newEmp.dept}
                  onChange={(e) => setNewEmp({ ...newEmp, dept: e.target.value })}
                >
                  {dashboardData.departments.map((department) => <option key={department} value={department}>{department}</option>)}
                </select>
              </div>

              <div className="modal-field">
                <label htmlFor="employee-location">Location</label>
                <input
                  id="employee-location"
                  type="text"
                  required
                  placeholder="Enter work location"
                  value={newEmp.location}
                  onChange={(e) => setNewEmp({ ...newEmp, location: e.target.value })}
                />
              </div>

              <div className="modal-field generated-id-field">
                <label htmlFor="generated-employee-id">Generated Employee ID</label>
                <input
                  id="generated-employee-id"
                  type="text"
                  value={generatedEmployeeId || 'Generated after submission'}
                  readOnly
                />
              </div>

              {employeeFormError && <div className="alert error" role="alert">{employeeFormError}</div>}
              <div className="modal-actions">
                <button type="submit" className="btn-primary employee-signup-button" disabled={employeeFormLoading}>
                  {employeeFormLoading ? 'Saving...' : 'Add Employee'}
                </button>
              </div>
              {employeeFormSuccess && <div className="alert success employee-form-success" role="status">{employeeFormSuccess}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
