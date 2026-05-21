/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bug,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  Download,
  FileUp,
  GitBranch,
  LogOut,
  MessageSquare,
  Paperclip,
  Plus,
  RefreshCw,
  Save,
  Search,
  Shield,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import heroImage from './assets/hero.png'
import { AdminPanel } from './components/admin/AdminPanel.jsx'
import { MentionInbox, MentionTextarea } from './components/Mentions.jsx'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const TYPES = ['BUG', 'FEATURE', 'TECHNICAL']
const ROLES = ['ADMIN', 'DEVELOPER']

const emptyTicketForm = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  type: 'BUG',
  assigneeId: '',
  dueDate: '',
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('issueflow.token') || '')
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [tickets, setTickets] = useState([])
  const [comments, setComments] = useState([])
  const [dependencies, setDependencies] = useState([])
  const [workload, setWorkload] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [deletedTickets, setDeletedTickets] = useState([])
  const [deletedProjects, setDeletedProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [adminManageProjectId, setAdminManageProjectId] = useState('')
  const [selectedTicketId, setSelectedTicketId] = useState('')
  const [activePanel, setActivePanel] = useState('comments')
  const [ticketScope, setTicketScope] = useState('all')
  const [adminProjectIds, setAdminProjectIds] = useState([])
  const [adminTickets, setAdminTickets] = useState([])
  const [adminPage, setAdminPage] = useState('overview')
  const [selectedAdminTicketId, setSelectedAdminTicketId] = useState('')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const [loginForm, setLoginForm] = useState({ username: '', password: 'secret' })
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'DEVELOPER',
  })
  const [projectForm, setProjectForm] = useState({ name: '', description: '' })
  const [projectPatch, setProjectPatch] = useState({ name: '', description: '' })
  const [ticketForm, setTicketForm] = useState(emptyTicketForm)
  const [ticketPatch, setTicketPatch] = useState({ status: '', priority: '', assigneeId: '', dueDate: '' })
  const [adminTicketPatch, setAdminTicketPatch] = useState({ title: '', description: '', status: '', priority: '', assigneeId: '', dueDate: '' })
  const [userPatch, setUserPatch] = useState({ userId: '', fullName: '', role: 'DEVELOPER' })
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState('')
  const [editingCommentText, setEditingCommentText] = useState('')
  const [dependencyId, setDependencyId] = useState('')
  const [attachmentFile, setAttachmentFile] = useState(null)
  const [uploadedAttachments, setUploadedAttachments] = useState([])
  const [csvFile, setCsvFile] = useState(null)
  const [auditFilter, setAuditFilter] = useState({ action: '', entityType: '', actor: '', entityId: '' })

  const isAdmin = currentUser?.role === 'ADMIN'
  const selectedProject = projects.find((project) => project.id === Number(selectedProjectId))
  const managedProject = projects.find((project) => String(project.id) === String(adminManageProjectId))
  const projectEditorProject = isAdmin ? managedProject : selectedProject
  const selectedTicket = tickets.find((ticket) => ticket.id === Number(selectedTicketId))
  const openTickets = tickets.filter((ticket) => ticket.status !== 'DONE').length
  const overdueTickets = tickets.filter((ticket) => ticket.isOverdue).length
  const localAttachments = uploadedAttachments.filter((attachment) => String(attachment.ticketId) === String(selectedTicketId))
  const myTickets = tickets.filter((ticket) => String(ticket.assigneeId) === String(currentUser?.id) && ticket.status !== 'DONE')
  const urgentTickets = tickets.filter((ticket) => ['HIGH', 'CRITICAL'].includes(ticket.priority) && ticket.status !== 'DONE')
  const visibleAdminTickets = useMemo(
    () => adminTickets.filter((ticket) => adminProjectIds.length === 0 || adminProjectIds.includes(String(ticket.projectId))),
    [adminProjectIds, adminTickets],
  )
  const visibleAdminOpenTickets = useMemo(
    () => visibleAdminTickets.filter((ticket) => ticket.status !== 'DONE'),
    [visibleAdminTickets],
  )
  const visibleAdminOverdueTickets = useMemo(
    () => visibleAdminTickets.filter((ticket) => ticket.isOverdue),
    [visibleAdminTickets],
  )
  const selectedAdminTicket = adminTickets.find((ticket) => String(ticket.id) === String(selectedAdminTicketId))
  const adminProjectFilterLabel = adminProjectIds.length === 0
    ? 'All projects'
    : `${adminProjectIds.length} project${adminProjectIds.length === 1 ? '' : 's'} selected`
  const adminPageMeta = {
    overview: {
      title: 'Overview',
      description: 'Workspace health, quick actions, and recent operational activity.',
    },
    projects: {
      title: 'Projects',
      description: 'Create, edit, and soft-delete project records.',
    },
    tickets: {
      title: 'Tickets',
      description: 'Review tickets across projects and edit ticket details as an admin.',
    },
    users: {
      title: 'Users',
      description: 'Create users and update roles.',
    },
    recovery: {
      title: 'Recovery',
      description: 'Restore soft-deleted tickets and projects.',
    },
    audit: {
      title: 'Audit log',
      description: 'Filter operational events by action, entity, actor, or ID.',
    },
  }
  const activeAdminMeta = adminPageMeta[adminPage] || adminPageMeta.overview

  const scopedTickets = useMemo(() => {
    if (ticketScope !== 'mine') return tickets
    return tickets.filter((ticket) => String(ticket.assigneeId) === String(currentUser?.id))
  }, [currentUser?.id, ticketScope, tickets])

  const filteredTickets = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return scopedTickets
    return scopedTickets.filter((ticket) =>
      [ticket.title, ticket.description, ticket.status, ticket.priority, ticket.type]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized)),
    )
  }, [query, scopedTickets])

  const request = useCallback(
    async (path, options = {}) => {
      const headers = { ...(options.headers || {}) }
      let body = options.body

      if (body && !(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify(body)
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE}${path}`, {
        method: options.method || 'GET',
        headers,
        body,
      })

      const contentType = response.headers.get('content-type') || ''
      const payload = contentType.includes('application/json')
        ? await response.json()
        : await response.text()

      if (!response.ok) {
        const message = payload?.message || payload || `HTTP ${response.status}`
        throw new Error(message)
      }

      return payload
    },
    [token],
  )

  const run = async (operation, successMessage = '') => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const result = await operation()
      if (successMessage) setNotice(successMessage)
      return result
    } catch (caught) {
      setError(caught.message || 'Request failed')
      return null
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!notice && !error) return undefined

    const timeoutId = window.setTimeout(() => {
      setNotice('')
      setError('')
    }, error ? 6500 : 3500)

    return () => window.clearTimeout(timeoutId)
  }, [error, notice])

  const dismissToast = () => {
    setNotice('')
    setError('')
  }

  const validateRequired = (fields) => {
    const missing = fields.find(({ value }) => {
      if (value instanceof File) return false
      return value === null || value === undefined || String(value).trim() === ''
    })

    if (!missing) return true
    setNotice('')
    setError(`${missing.label} is required`)
    return false
  }

  const loadProjects = useCallback(async () => {
    const data = await request('/projects')
    setProjects(data)
    if (!selectedProjectId && data.length > 0) {
      setSelectedProjectId(String(data[0].id))
    }
  }, [request, selectedProjectId])

  const loadUsers = useCallback(async () => {
    setUsers(await request('/users'))
  }, [request])

  const loadAuditLogs = useCallback(async (filters = auditFilter) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    const queryString = params.toString()
    setAuditLogs(await request(`/audit-logs${queryString ? `?${queryString}` : ''}`))
  }, [auditFilter, request])

  const loadTicketSideData = useCallback(async () => {
    if (!selectedTicketId) {
      setComments([])
      setDependencies([])
      return
    }
    const [commentData, dependencyData] = await Promise.all([
      request(`/tickets/${selectedTicketId}/comments`),
      request(`/tickets/${selectedTicketId}/dependencies`),
    ])
    setComments(commentData)
    setDependencies(dependencyData)
  }, [request, selectedTicketId])

  const loadProjectData = useCallback(async () => {
    if (!selectedProjectId) {
      setTickets([])
      setWorkload([])
      return
    }
    const [ticketData, workloadData] = await Promise.all([
      request(`/tickets?projectId=${selectedProjectId}`),
      request(`/projects/${selectedProjectId}/workload`),
    ])
    setTickets(ticketData)
    setWorkload(workloadData)
    setSelectedTicketId((current) => {
      if (ticketData.some((ticket) => String(ticket.id) === String(current))) return current
      return ticketData[0] ? String(ticketData[0].id) : ''
    })
  }, [request, selectedProjectId])

  const loadDeleted = useCallback(async () => {
    if (!isAdmin) return
    const [projectData, ticketLists] = await Promise.all([
      request('/projects/deleted'),
      projects.length > 0
        ? Promise.all(projects.map((project) => request(`/tickets/deleted?projectId=${project.id}`)))
        : Promise.resolve([]),
    ])
    setDeletedProjects(projectData)
    setDeletedTickets(ticketLists.flat())
  }, [isAdmin, projects, request])

  const loadAdminTickets = useCallback(async () => {
    if (!isAdmin || projects.length === 0) {
      setAdminTickets([])
      return
    }

    const ticketLists = await Promise.all(
      projects.map(async (project) => {
        const projectTickets = await request(`/tickets?projectId=${project.id}`)
        return projectTickets.map((ticket) => ({ ...ticket, projectName: project.name }))
      }),
    )
    setAdminTickets(ticketLists.flat())
  }, [isAdmin, projects, request])

  const loadSession = useCallback(async () => {
    if (!token) return
    const me = await request('/auth/me')
    setCurrentUser(me)
    await Promise.all([loadUsers(), loadProjects(), loadAuditLogs()])
  }, [loadAuditLogs, loadProjects, loadUsers, request, token])

  useEffect(() => {
    if (!token) return
    let active = true
    loadSession().catch((caught) => {
      if (active) setError(caught.message || 'Session failed')
    })
    return () => {
      active = false
    }
  }, [loadSession, token])

  useEffect(() => {
    if (!token || !selectedProjectId) return
    let active = true
    loadProjectData().catch((caught) => {
      if (active) setError(caught.message || 'Project load failed')
    })
    return () => {
      active = false
    }
  }, [loadProjectData, selectedProjectId, token])

  useEffect(() => {
    if (!projectEditorProject) {
      setProjectPatch({ name: '', description: '' })
      return
    }
    setProjectPatch({ name: projectEditorProject.name || '', description: projectEditorProject.description || '' })
  }, [projectEditorProject])

  useEffect(() => {
    if (!isAdmin) return
    if (projects.length === 0) {
      setAdminManageProjectId('')
      return
    }
    if (!projects.some((project) => String(project.id) === String(adminManageProjectId))) {
      setAdminManageProjectId(String(projects[0].id))
    }
  }, [adminManageProjectId, isAdmin, projects])

  useEffect(() => {
    const user = users.find((entry) => String(entry.id) === String(userPatch.userId))
    if (!user) return
    setUserPatch((current) => ({ ...current, fullName: user.fullName || '', role: user.role || 'DEVELOPER' }))
  }, [userPatch.userId, users])

  useEffect(() => {
    if (!token || !selectedTicketId) return
    let active = true
    loadTicketSideData().catch((caught) => {
      if (active) setError(caught.message || 'Ticket load failed')
    })
    return () => {
      active = false
    }
  }, [loadTicketSideData, selectedTicketId, token])

  useEffect(() => {
    if (!token || !isAdmin) return
    let active = true
    loadDeleted().catch((caught) => {
      if (active) setError(caught.message || 'Deleted records load failed')
    })
    return () => {
      active = false
    }
  }, [isAdmin, loadDeleted, token])

  useEffect(() => {
    if (!token || !isAdmin) return
    let active = true
    loadAdminTickets().catch((caught) => {
      if (active) setError(caught.message || 'Admin tickets load failed')
    })
    return () => {
      active = false
    }
  }, [isAdmin, loadAdminTickets, token])

  useEffect(() => {
    if (!isAdmin) return
    if (visibleAdminTickets.some((ticket) => String(ticket.id) === String(selectedAdminTicketId))) return
    setSelectedAdminTicketId(visibleAdminTickets[0] ? String(visibleAdminTickets[0].id) : '')
  }, [isAdmin, selectedAdminTicketId, visibleAdminTickets])

  useEffect(() => {
    if (!selectedAdminTicket) {
      setAdminTicketPatch({ title: '', description: '', status: '', priority: '', assigneeId: '', dueDate: '' })
      return
    }

    setAdminTicketPatch({
      title: selectedAdminTicket.title || '',
      description: selectedAdminTicket.description || '',
      status: selectedAdminTicket.status || '',
      priority: selectedAdminTicket.priority || '',
      assigneeId: selectedAdminTicket.assigneeId ? String(selectedAdminTicket.assigneeId) : '',
      dueDate: toDateTimeLocal(selectedAdminTicket.dueDate),
    })
  }, [selectedAdminTicket])

  useEffect(() => {
    if (currentUser?.role === 'DEVELOPER') {
      setTicketScope('mine')
    }
    if (currentUser?.role === 'ADMIN') {
      setTicketScope('all')
    }
  }, [currentUser])

  useEffect(() => {
    if (!selectedTicketId) return
    if (filteredTickets.some((ticket) => String(ticket.id) === String(selectedTicketId))) return
    setSelectedTicketId(filteredTickets[0] ? String(filteredTickets[0].id) : '')
  }, [filteredTickets, selectedTicketId])

  const refreshAll = async () => {
    await run(async () => {
      await Promise.all([loadUsers(), loadProjects(), loadProjectData(), loadTicketSideData(), loadAuditLogs(), loadDeleted(), loadAdminTickets()])
    }, 'Refreshed')
  }

  const login = async (event) => {
    event.preventDefault()
    if (!validateRequired([
      { label: 'Username', value: loginForm.username },
      { label: 'Password', value: loginForm.password },
    ])) return

    const auth = await run(() =>
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      }).then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.message || 'Login failed')
        return payload
      }),
    )
    if (!auth) return
    localStorage.setItem('issueflow.token', auth.accessToken)
    setToken(auth.accessToken)
    setNotice('Signed in')
  }

  const logout = async () => {
    if (token) {
      await run(() => request('/auth/logout', { method: 'POST' }))
    }
    localStorage.removeItem('issueflow.token')
    setToken('')
    setCurrentUser(null)
    setTickets([])
    setProjects([])
    setNotice('')
  }

  const createUser = async (event) => {
    event.preventDefault()
    if (!validateRequired([
      { label: 'Username', value: userForm.username },
      { label: 'Email', value: userForm.email },
      { label: 'Full name', value: userForm.fullName },
      { label: 'Role', value: userForm.role },
    ])) return

    await run(async () => {
      await request('/users', { method: 'POST', body: userForm })
      setUserForm({ username: '', email: '', fullName: '', role: 'DEVELOPER' })
      if (token) await loadUsers()
    }, 'User created')
  }

  const createProject = async (event) => {
    event.preventDefault()
    if (!validateRequired([
      { label: 'Project name', value: projectForm.name },
      { label: 'Owner', value: currentUser?.id },
    ])) return

    await run(async () => {
      const project = await request('/projects', {
        method: 'POST',
        body: { ...projectForm, ownerId: currentUser.id },
      })
      setProjectForm({ name: '', description: '' })
      await loadProjects()
      if (isAdmin) {
        setAdminManageProjectId(String(project.id))
      } else {
        setSelectedProjectId(String(project.id))
      }
    }, 'Project created')
  }

  const updateProject = async (event) => {
    event.preventDefault()
    const projectId = isAdmin ? adminManageProjectId : selectedProjectId
    if (!validateRequired([
      { label: 'Project', value: projectId },
      { label: 'Project name', value: projectPatch.name },
    ])) return

    await run(async () => {
      await request(`/projects/${projectId}`, { method: 'PATCH', body: projectPatch })
      await Promise.all([loadProjects(), loadAuditLogs(), loadAdminTickets()])
    }, 'Project updated')
  }

  const deleteProject = async () => {
    const projectId = isAdmin ? adminManageProjectId : selectedProjectId
    if (!projectId) return
    await run(async () => {
      await request(`/projects/${projectId}`, { method: 'DELETE' })
      if (String(selectedProjectId) === String(projectId)) setSelectedProjectId('')
      if (String(adminManageProjectId) === String(projectId)) setAdminManageProjectId('')
      setAdminProjectIds((current) => current.filter((id) => String(id) !== String(projectId)))
      setSelectedTicketId('')
      await Promise.all([loadProjects(), loadDeleted(), loadAuditLogs(), loadAdminTickets()])
    }, 'Project deleted')
  }

  const updateUser = async (event) => {
    event.preventDefault()
    if (!validateRequired([
      { label: 'User', value: userPatch.userId },
      { label: 'Full name', value: userPatch.fullName },
      { label: 'Role', value: userPatch.role },
    ])) return

    await run(async () => {
      await request(`/users/update/${userPatch.userId}`, {
        method: 'POST',
        body: { fullName: userPatch.fullName, role: userPatch.role },
      })
      await Promise.all([loadUsers(), loadAuditLogs()])
    }, 'User updated')
  }

  const deleteUser = async () => {
    if (!userPatch.userId) return
    await run(async () => {
      await request(`/users/${userPatch.userId}`, { method: 'DELETE' })
      setUserPatch({ userId: '', fullName: '', role: 'DEVELOPER' })
      await Promise.all([loadUsers(), loadAuditLogs()])
    }, 'User deleted')
  }

  const createTicket = async (event) => {
    event.preventDefault()
    if (!validateRequired([
      { label: 'Project', value: selectedProjectId },
      { label: 'Title', value: ticketForm.title },
      { label: 'Status', value: ticketForm.status },
      { label: 'Priority', value: ticketForm.priority },
      { label: 'Type', value: ticketForm.type },
    ])) return

    await run(async () => {
      const body = {
        ...ticketForm,
        projectId: Number(selectedProjectId),
        assigneeId: ticketForm.assigneeId ? Number(ticketForm.assigneeId) : null,
        dueDate: toInstant(ticketForm.dueDate),
      }
      await request('/tickets', { method: 'POST', body })
      setTicketForm(emptyTicketForm)
      await Promise.all([loadProjectData(), loadAuditLogs()])
    }, 'Ticket created')
  }

  const updateTicket = async () => {
    if (!selectedTicketId) return
    await run(async () => {
      const body = compact({
        status: ticketPatch.status || null,
        priority: ticketPatch.priority || null,
        assigneeId: ticketPatch.assigneeId ? Number(ticketPatch.assigneeId) : null,
        dueDate: toInstant(ticketPatch.dueDate),
      })
      await request(`/tickets/${selectedTicketId}`, { method: 'PATCH', body })
      setTicketPatch({ status: '', priority: '', assigneeId: '', dueDate: '' })
      await Promise.all([loadProjectData(), loadAuditLogs()])
    }, 'Ticket updated')
  }

  const updateAdminTicket = async (event) => {
    event.preventDefault()
    if (!validateRequired([
      { label: 'Ticket', value: selectedAdminTicketId },
      { label: 'Title', value: adminTicketPatch.title },
      { label: 'Status', value: adminTicketPatch.status },
      { label: 'Priority', value: adminTicketPatch.priority },
    ])) return

    await run(async () => {
      const body = compact({
        title: adminTicketPatch.title,
        description: adminTicketPatch.description,
        status: adminTicketPatch.status,
        priority: adminTicketPatch.priority,
        assigneeId: adminTicketPatch.assigneeId ? Number(adminTicketPatch.assigneeId) : null,
        dueDate: toInstant(adminTicketPatch.dueDate),
      })
      await request(`/tickets/${selectedAdminTicketId}`, { method: 'PATCH', body })
      await Promise.all([loadProjectData(), loadAuditLogs(), loadAdminTickets()])
    }, 'Ticket updated')
  }

  const deleteAdminTicket = async () => {
    if (!selectedAdminTicketId) return
    await run(async () => {
      await request(`/tickets/${selectedAdminTicketId}`, { method: 'DELETE' })
      setSelectedAdminTicketId('')
      await Promise.all([loadProjectData(), loadDeleted(), loadAuditLogs(), loadAdminTickets()])
    }, 'Ticket deleted')
  }

  const startEditComment = (comment) => {
    setEditingCommentId(String(comment.id))
    setEditingCommentText(comment.content || '')
  }

  const updateComment = async (commentId) => {
    if (!validateRequired([
      { label: 'Comment', value: editingCommentText },
    ])) return

    await run(async () => {
      await request(`/tickets/${selectedTicketId}/comments/${commentId}`, {
        method: 'PATCH',
        body: { content: editingCommentText },
      })
      setEditingCommentId('')
      setEditingCommentText('')
      await Promise.all([loadTicketSideData(), loadAuditLogs()])
    }, 'Comment updated')
  }

  const deleteComment = async (commentId) => {
    await run(async () => {
      await request(`/tickets/${selectedTicketId}/comments/${commentId}`, { method: 'DELETE' })
      await Promise.all([loadTicketSideData(), loadAuditLogs()])
    }, 'Comment deleted')
  }

  const deleteTicket = async () => {
    if (!selectedTicketId) return
    await run(async () => {
      await request(`/tickets/${selectedTicketId}`, { method: 'DELETE' })
      setSelectedTicketId('')
      await Promise.all([loadProjectData(), loadDeleted(), loadAuditLogs()])
    }, 'Ticket deleted')
  }

  const addComment = async (event) => {
    event.preventDefault()
    if (!validateRequired([
      { label: 'Ticket', value: selectedTicketId },
      { label: 'Author', value: currentUser?.id },
      { label: 'Comment', value: commentText },
    ])) return

    await run(async () => {
      await request(`/tickets/${selectedTicketId}/comments`, {
        method: 'POST',
        body: { authorId: currentUser.id, content: commentText },
      })
      setCommentText('')
      await Promise.all([loadTicketSideData(), loadAuditLogs()])
    }, 'Comment added')
  }

  const addDependency = async (event) => {
    event.preventDefault()
    if (!validateRequired([
      { label: 'Ticket', value: selectedTicketId },
      { label: 'Blocked by ticket', value: dependencyId },
    ])) return

    await run(async () => {
      await request(`/tickets/${selectedTicketId}/dependencies`, {
        method: 'POST',
        body: { blockedBy: Number(dependencyId) },
      })
      setDependencyId('')
      await Promise.all([loadTicketSideData(), loadAuditLogs()])
    }, 'Dependency added')
  }

  const removeDependency = async (blockerId) => {
    await run(async () => {
      await request(`/tickets/${selectedTicketId}/dependencies/${blockerId}`, { method: 'DELETE' })
      await Promise.all([loadTicketSideData(), loadAuditLogs()])
    }, 'Dependency removed')
  }

  const uploadAttachment = async (event) => {
    event.preventDefault()
    if (!validateRequired([
      { label: 'Ticket', value: selectedTicketId },
      { label: 'Attachment file', value: attachmentFile },
    ])) return

    const formData = new FormData()
    formData.append('file', attachmentFile)
    await run(async () => {
      const uploaded = await request(`/tickets/${selectedTicketId}/attachments`, { method: 'POST', body: formData })
      setUploadedAttachments((current) => [uploaded, ...current.filter((item) => item.id !== uploaded.id)])
      setAttachmentFile(null)
      event.currentTarget.reset()
      await loadAuditLogs()
    }, 'Attachment uploaded')
  }

  const deleteAttachment = async (attachmentId) => {
    await run(async () => {
      await request(`/tickets/${selectedTicketId}/attachments/${attachmentId}`, { method: 'DELETE' })
      setUploadedAttachments((current) => current.filter((item) => item.id !== attachmentId))
      await loadAuditLogs()
    }, 'Attachment deleted')
  }

  const exportCsv = async () => {
    if (!selectedProjectId) return
    await run(async () => {
      const response = await fetch(`${API_BASE}/tickets/export?projectId=${selectedProjectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('CSV export failed')
      const text = await response.text()
      const blob = new Blob([text], { type: 'text/csv' })
      const href = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = href
      link.download = `issueflow-project-${selectedProjectId}.csv`
      link.click()
      URL.revokeObjectURL(href)
    }, 'CSV exported')
  }

  const exportAdminTicketsCsv = async () => {
    await run(async () => {
      if (adminProjectIds.length === 1) {
        const [projectId] = adminProjectIds
        const response = await fetch(`${API_BASE}/tickets/export?projectId=${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('CSV export failed')
        downloadText(await response.text(), `issueflow-project-${projectId}.csv`, 'text/csv')
        return
      }

      const header = 'id,title,description,status,priority,type,projectId,assigneeId,dueDate,isOverdue'
      const rows = visibleAdminTickets.map((ticket) => [
        ticket.id,
        ticket.title,
        ticket.description,
        ticket.status,
        ticket.priority,
        ticket.type,
        ticket.projectId,
        ticket.assigneeId || '',
        ticket.dueDate || '',
        ticket.isOverdue,
      ].map(csvValue).join(','))
      const fileName = adminProjectIds.length > 1 ? 'issueflow-selected-projects.csv' : 'issueflow-all-projects.csv'
      downloadText([header, ...rows].join('\n'), fileName, 'text/csv')
    }, 'CSV exported')
  }

  const toggleAdminProjectFilter = (projectId) => {
    const normalized = String(projectId)
    setAdminProjectIds((current) => (
      current.includes(normalized)
        ? current.filter((id) => id !== normalized)
        : [...current, normalized]
    ))
  }

  const importCsv = async (event) => {
    event.preventDefault()
    if (!validateRequired([
      { label: 'Project', value: selectedProjectId },
      { label: 'CSV file', value: csvFile },
    ])) return

    const formData = new FormData()
    formData.append('projectId', selectedProjectId)
    formData.append('file', csvFile)
    await run(async () => {
      const result = await request('/tickets/import', { method: 'POST', body: formData })
      setNotice(`CSV imported: ${result.created} created, ${result.failed} failed`)
      setCsvFile(null)
      event.currentTarget.reset()
      await Promise.all([loadProjectData(), loadAuditLogs()])
    })
  }

  const applyAuditFilters = async (event) => {
    event.preventDefault()
    await run(() => loadAuditLogs(auditFilter), 'Audit filtered')
  }

  const clearAuditFilters = async () => {
    const next = { action: '', entityType: '', actor: '', entityId: '' }
    setAuditFilter(next)
    await run(() => loadAuditLogs(next), 'Audit filters cleared')
  }

  const restoreTicket = async (ticketId) => {
    await run(async () => {
      await request(`/tickets/${ticketId}/restore`, { method: 'POST' })
      await Promise.all([loadProjectData(), loadDeleted(), loadAuditLogs()])
    }, 'Ticket restored')
  }

  const restoreProject = async (projectId) => {
    await run(async () => {
      await request(`/projects/${projectId}/restore`, { method: 'POST' })
      await Promise.all([loadProjects(), loadDeleted(), loadAuditLogs()])
    }, 'Project restored')
  }

  if (!token) {
    return (
      <div className="app-bg min-h-screen p-4 text-slate-900 sm:p-6">
        <div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-6xl items-center gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="glass-panel motion-rise overflow-hidden rounded-xl">
            <div className="border-b border-white/70 bg-white/60 p-6">
              <div className="mb-5 flex items-center justify-between gap-5">
                <div className="flex min-w-0 items-center gap-3">
                <div className="focus-ring-pulse flex h-12 w-12 items-center justify-center rounded-md bg-teal-700 text-white shadow-sm">
                  <GitBranch size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-normal">IssueFlow</h1>
                  <p className="text-sm text-slate-500">Project delivery, ticket ownership, and audit visibility.</p>
                </div>
                </div>
                <img className="hidden h-24 w-24 shrink-0 object-contain sm:block" src={heroImage} alt="" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="interactive-card rounded-md border border-teal-200 bg-teal-50 p-3">
                  <div className="text-xs font-semibold uppercase text-teal-700">Developers</div>
                  <div className="mt-1 text-2xl font-semibold text-teal-950">Focus</div>
                </div>
                <div className="interactive-card rounded-md border border-sky-200 bg-sky-50 p-3">
                  <div className="text-xs font-semibold uppercase text-sky-700">Projects</div>
                  <div className="mt-1 text-2xl font-semibold text-sky-950">Track</div>
                </div>
                <div className="interactive-card rounded-md border border-violet-200 bg-violet-50 p-3">
                  <div className="text-xs font-semibold uppercase text-violet-700">Admins</div>
                  <div className="mt-1 text-2xl font-semibold text-violet-950">Control</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <div className="interactive-card rounded-lg border border-violet-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold">Admin demo</h2>
                  <RoleBadge value="ADMIN" />
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between gap-3"><span>Username</span><span className="font-semibold text-slate-900">clara_admin</span></div>
                  <div className="flex justify-between gap-3"><span>Password</span><span className="font-semibold text-slate-900">secret</span></div>
                </div>
                <button
                  className="btn mt-4 w-full border-violet-600 text-violet-700 hover:bg-violet-50"
                  type="button"
                  onClick={() => setLoginForm({ username: 'clara_admin', password: 'secret' })}
                >
                  <Shield size={16} />
                  Use admin
                </button>
              </div>

              <div className="interactive-card rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold">Developer demo</h2>
                  <RoleBadge value="DEVELOPER" />
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between gap-3"><span>Username</span><span className="font-semibold text-slate-900">noah_backend</span></div>
                  <div className="flex justify-between gap-3"><span>Password</span><span className="font-semibold text-slate-900">secret</span></div>
                </div>
                <button
                  className="btn mt-4 w-full border-sky-600 text-sky-700 hover:bg-sky-50"
                  type="button"
                  onClick={() => setLoginForm({ username: 'noah_backend', password: 'secret' })}
                >
                  <Users size={16} />
                  Use developer
                </button>
              </div>
            </div>
          </section>

          <section className="glass-panel motion-rise rounded-xl p-6">
            <div className="mb-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-slate-900 text-white shadow-lg shadow-slate-900/20">
                <Shield size={21} />
              </div>
              <h2 className="text-2xl font-semibold">Sign in</h2>
              <p className="mt-1 text-sm text-slate-500">Use a demo account or sign in with a user you created.</p>
            </div>

            <form className="space-y-4" onSubmit={login}>
              <Field label="Username" required>
                <input
                  className="field"
                  value={loginForm.username}
                  onChange={(event) => setLoginForm({ ...loginForm, username: event.target.value })}
                  required
                />
              </Field>
              <Field label="Password" required>
                <input
                  className="field"
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                  required
                />
              </Field>
              <button className="btn btn-primary w-full" disabled={busy}>
                <Shield size={17} />
                Sign in
              </button>
            </form>

            <div className="my-5 border-t border-slate-200" />

            <details className="rounded-md border border-slate-200 bg-white/70 p-4 shadow-sm">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700">Create a new user</summary>
              <div className="mt-4">
                <UserForm form={userForm} setForm={setUserForm} onSubmit={createUser} busy={busy} />
              </div>
            </details>
          </section>
        </div>
        <Toast error={error} notice={notice} onDismiss={dismissToast} />
      </div>
    )
  }

  if (isAdmin) {
    return (
      <>
        <AdminPanel
          activeAdminMeta={activeAdminMeta}
          activePanel={activePanel}
          addComment={addComment}
          addDependency={addDependency}
          adminManageProjectId={adminManageProjectId}
          adminPage={adminPage}
          adminProjectFilterLabel={adminProjectFilterLabel}
          adminProjectIds={adminProjectIds}
          adminTicketPatch={adminTicketPatch}
          adminTickets={adminTickets}
          applyAuditFilters={applyAuditFilters}
          attachmentFile={attachmentFile}
          auditFilter={auditFilter}
          auditLogs={auditLogs}
          busy={busy}
          clearAuditFilters={clearAuditFilters}
          commentText={commentText}
          comments={comments}
          createProject={createProject}
          createTicket={createTicket}
          createUser={createUser}
          csvFile={csvFile}
          currentUser={currentUser}
          deleteAdminTicket={deleteAdminTicket}
          deleteAttachment={deleteAttachment}
          deleteComment={deleteComment}
          deleteProject={deleteProject}
          deleteUser={deleteUser}
          deletedProjects={deletedProjects}
          deletedTickets={deletedTickets}
          dependencies={dependencies}
          dependencyId={dependencyId}
          editingCommentId={editingCommentId}
          editingCommentText={editingCommentText}
          exportAdminTicketsCsv={exportAdminTicketsCsv}
          importCsv={importCsv}
          localAttachments={localAttachments}
          logout={logout}
          projectEditorProject={projectEditorProject}
          projectForm={projectForm}
          projectPatch={projectPatch}
          projects={projects}
          refreshAll={refreshAll}
          removeDependency={removeDependency}
          restoreProject={restoreProject}
          restoreTicket={restoreTicket}
          selectedAdminTicket={selectedAdminTicket}
          selectedProjectId={selectedProjectId}
          selectedTicketId={selectedTicketId}
          setActivePanel={setActivePanel}
          setAdminManageProjectId={setAdminManageProjectId}
          setAdminPage={setAdminPage}
          setAdminProjectIds={setAdminProjectIds}
          setAdminTicketPatch={setAdminTicketPatch}
          setAttachmentFile={setAttachmentFile}
          setAuditFilter={setAuditFilter}
          setCommentText={setCommentText}
          setCsvFile={setCsvFile}
          setDependencyId={setDependencyId}
          setEditingCommentId={setEditingCommentId}
          setEditingCommentText={setEditingCommentText}
          setProjectForm={setProjectForm}
          setProjectPatch={setProjectPatch}
          setSelectedAdminTicketId={setSelectedAdminTicketId}
          setSelectedProjectId={setSelectedProjectId}
          setSelectedTicketId={setSelectedTicketId}
          setTicketForm={setTicketForm}
          setUserForm={setUserForm}
          setUserPatch={setUserPatch}
          startEditComment={startEditComment}
          ticketForm={ticketForm}
          tickets={tickets}
          toggleAdminProjectFilter={toggleAdminProjectFilter}
          updateAdminTicket={updateAdminTicket}
          updateComment={updateComment}
          updateProject={updateProject}
          updateUser={updateUser}
          uploadAttachment={uploadAttachment}
          userForm={userForm}
          userPatch={userPatch}
          users={users}
          visibleAdminOpenTickets={visibleAdminOpenTickets}
          visibleAdminOverdueTickets={visibleAdminOverdueTickets}
          visibleAdminTickets={visibleAdminTickets}
        />
        <Toast error={error} notice={notice} onDismiss={dismissToast} />
      </>
    )
  }

  return (
    <div className="app-bg min-h-screen text-slate-900">
        <header className="app-header">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-700 text-white shadow-lg shadow-teal-900/20">
                <GitBranch size={21} />
              </div>
              <div>
                <div className="text-lg font-semibold">IssueFlow</div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{currentUser?.username || 'Signed in'}</span>
                  {currentUser?.role && <RoleBadge value={currentUser.role} />}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="icon-btn" onClick={refreshAll} disabled={busy} title="Refresh">
                <RefreshCw size={17} />
              </button>
              <button className="btn" onClick={logout}>
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </div>
        </header>

      <main className="mx-auto flex max-w-[1500px] flex-col gap-6 px-4 py-5 sm:px-6">
          <section className="panel motion-rise accent-strip overflow-hidden">
            <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <GitBranch size={15} />
                  Project
                </div>
                <h1 className="text-2xl font-semibold tracking-normal">{selectedProject?.name || 'Select a project'}</h1>
                <p className="mt-1 max-w-3xl text-sm text-slate-500">
                  {selectedProject?.description || 'Choose a project to load tickets, workload, comments, and exports.'}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white/80 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                      String(project.id) === String(selectedProjectId)
                        ? 'border-teal-300 bg-teal-50 text-teal-900 shadow-sm shadow-teal-900/10'
                        : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
                    }`}
                    type="button"
                    onClick={() => setSelectedProjectId(String(project.id))}
                  >
                    <span>{project.name}</span>
                    <ChevronRight size={14} />
                  </button>
                ))}
                <button className="icon-btn" type="button" onClick={loadProjects} title="Refresh projects">
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>
          </section>

          <>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={Bug} label="Project tickets" value={tickets.length} color="teal" />
              <MetricCard icon={CalendarDays} label="Assigned to me" value={myTickets.length} color="sky" />
              <MetricCard icon={GitBranch} label="High priority" value={urgentTickets.length} color="amber" />
              <MetricCard icon={CircleDot} label="Overdue" value={overdueTickets} color="rose" />
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
              <div className="space-y-5">
                <section className="panel motion-rise overflow-hidden">
                  <div className="flex flex-col gap-3 border-b border-slate-200 bg-white/70 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Ticket queue</h2>
                      <p className="text-sm text-slate-500">{filteredTickets.length} shown, {openTickets} open in project</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-grid grid-cols-2 rounded-md bg-white p-1 text-sm font-semibold shadow-sm ring-1 ring-slate-200">
                        <button
                          className={`rounded px-3 py-2 transition ${ticketScope === 'all' ? 'bg-teal-50 text-teal-800' : 'text-slate-500 hover:text-slate-800'}`}
                          type="button"
                          onClick={() => setTicketScope('all')}
                        >
                          All
                        </button>
                        <button
                          className={`rounded px-3 py-2 transition ${ticketScope === 'mine' ? 'bg-sky-50 text-sky-800' : 'text-slate-500 hover:text-slate-800'}`}
                          type="button"
                          onClick={() => setTicketScope('mine')}
                        >
                          For me
                        </button>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                          className="field w-full pl-9 md:w-64"
                          placeholder="Search tickets"
                          value={query}
                          onChange={(event) => setQuery(event.target.value)}
                        />
                      </div>
                      <button className="icon-btn" onClick={exportCsv} disabled={!selectedProjectId} title="Export CSV">
                        <Download size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Ticket</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Priority</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Assignee</th>
                          <th className="px-4 py-3">Due</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredTickets.map((ticket) => (
                          <tr
                            key={ticket.id}
                            className={`cursor-pointer transition duration-200 hover:bg-slate-50 ${
                              String(ticket.id) === String(selectedTicketId) ? 'bg-teal-50/90 shadow-[inset_4px_0_0_#0f766e]' : 'bg-white hover:shadow-sm'
                            }`}
                            onClick={() => setSelectedTicketId(String(ticket.id))}
                          >
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900">{ticket.title}</div>
                              <div className="line-clamp-1 text-xs text-slate-500">{ticket.description}</div>
                            </td>
                            <td className="px-4 py-3"><StatusBadge value={ticket.status} /></td>
                            <td className="px-4 py-3"><PriorityBadge value={ticket.priority} overdue={ticket.isOverdue} /></td>
                            <td className="px-4 py-3 text-slate-600"><TypeBadge value={ticket.type} /></td>
                            <td className="px-4 py-3 text-slate-600">{usernameFor(users, ticket.assigneeId) || 'Unassigned'}</td>
                            <td className="px-4 py-3 text-slate-600">{formatDate(ticket.dueDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredTickets.length === 0 && <EmptyState label="No tickets" />}
                </section>

                <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                  <form className="panel interactive-card space-y-4 p-5" onSubmit={createTicket}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">New ticket</h3>
                        <p className="text-sm text-slate-500">Leave assignee empty to use auto-assignment.</p>
                      </div>
                      <Bug size={18} className="text-teal-700" />
                    </div>
                    <Field label="Title" required>
                      <input
                        className="field"
                        value={ticketForm.title}
                        onChange={(event) => setTicketForm({ ...ticketForm, title: event.target.value })}
                        required
                      />
                    </Field>
                    <Field label="Description">
                      <textarea
                        className="textarea-field min-h-24"
                        value={ticketForm.description}
                        onChange={(event) => setTicketForm({ ...ticketForm, description: event.target.value })}
                      />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Status" required>
                        <Select value={ticketForm.status} values={STATUSES} onChange={(status) => setTicketForm({ ...ticketForm, status })} required />
                      </Field>
                      <Field label="Priority" required>
                        <Select value={ticketForm.priority} values={PRIORITIES} onChange={(priority) => setTicketForm({ ...ticketForm, priority })} required />
                      </Field>
                      <Field label="Type" required>
                        <Select value={ticketForm.type} values={TYPES} onChange={(type) => setTicketForm({ ...ticketForm, type })} required />
                      </Field>
                      <Field label="Assignee">
                        <select
                          className="field"
                          value={ticketForm.assigneeId}
                          onChange={(event) => setTicketForm({ ...ticketForm, assigneeId: event.target.value })}
                        >
                          <option value="">Auto assign</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>{user.username}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label="Due date">
                      <input
                        className="field"
                        type="datetime-local"
                        value={ticketForm.dueDate}
                        onChange={(event) => setTicketForm({ ...ticketForm, dueDate: event.target.value })}
                      />
                    </Field>
                    <button className="btn btn-primary w-full" disabled={!selectedProjectId || busy}>
                      <Plus size={16} />
                      Create ticket
                    </button>
                  </form>

                  <div className="panel interactive-card overflow-hidden border-t-4 border-t-sky-500 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Workload</h3>
                        <p className="text-sm text-slate-500">Open tickets per developer</p>
                      </div>
                      <Users size={18} className="text-teal-700" />
                    </div>
                    <div className="space-y-2">
                      {workload.slice(0, 10).map((row) => (
                        <div key={row.userId} className="flex items-center justify-between rounded-md bg-sky-50 px-3 py-2 ring-1 ring-sky-100">
                          <span className="text-sm font-medium">{row.username}</span>
                          <span className="badge bg-white text-sky-700 ring-1 ring-sky-200">{row.openTicketCount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              <aside className="panel motion-rise self-start overflow-hidden">
                <div className="border-b border-slate-200 bg-white/70 p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">{selectedTicket?.title || 'Ticket detail'}</h2>
                      <p className="text-sm text-slate-500">{selectedTicket ? `#${selectedTicket.id}` : 'Select a ticket from the queue'}</p>
                    </div>
                    {selectedTicket && (
                      <button className="icon-btn border-rose-200 text-rose-700 hover:bg-rose-50" onClick={deleteTicket} title="Soft delete ticket">
                        <Trash2 size={17} />
                      </button>
                    )}
                  </div>
                  {selectedTicket && (
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between gap-2"><span className="text-slate-500">Status</span><StatusBadge value={selectedTicket.status} /></div>
                      <div className="flex justify-between gap-2"><span className="text-slate-500">Priority</span><PriorityBadge value={selectedTicket.priority} overdue={selectedTicket.isOverdue} /></div>
                      <div className="flex justify-between gap-2"><span className="text-slate-500">Type</span><TypeBadge value={selectedTicket.type} /></div>
                      <div className="flex justify-between gap-2"><span className="text-slate-500">Assignee</span><span>{usernameFor(users, selectedTicket.assigneeId) || 'Unassigned'}</span></div>
                      <div className="flex justify-between gap-2"><span className="text-slate-500">Due</span><span>{formatDate(selectedTicket.dueDate)}</span></div>
                    </div>
                  )}
                </div>

                <div className="border-b border-slate-200 p-5">
                  <h3 className="mb-3 text-sm font-semibold">Update ticket</h3>
                  <div className="grid gap-2">
                    <Select value={ticketPatch.status} values={STATUSES} placeholder="Status" onChange={(status) => setTicketPatch({ ...ticketPatch, status })} />
                    <Select value={ticketPatch.priority} values={PRIORITIES} placeholder="Priority" onChange={(priority) => setTicketPatch({ ...ticketPatch, priority })} />
                    <select
                      className="field"
                      value={ticketPatch.assigneeId}
                      onChange={(event) => setTicketPatch({ ...ticketPatch, assigneeId: event.target.value })}
                    >
                      <option value="">Assignee</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                      ))}
                    </select>
                    <input
                      className="field"
                      type="datetime-local"
                      value={ticketPatch.dueDate}
                      onChange={(event) => setTicketPatch({ ...ticketPatch, dueDate: event.target.value })}
                    />
                    <button className="btn btn-primary" disabled={!selectedTicketId || busy} onClick={updateTicket}>
                      <Check size={16} />
                      Apply
                    </button>
                  </div>
                </div>

                <div className="border-b border-slate-200">
                  <div className="grid grid-cols-2 text-xs font-semibold">
                    <TabButton active={activePanel === 'comments'} onClick={() => setActivePanel('comments')} icon={MessageSquare} label="Comments" />
                    <TabButton active={activePanel === 'files'} onClick={() => setActivePanel('files')} icon={Paperclip} label="Files" />
                  </div>
                </div>

                <div className="max-h-[680px] overflow-y-auto p-5">
            {activePanel === 'comments' && (
              <div className="space-y-4">
                <form className="space-y-2" onSubmit={addComment}>
                  <Field label="Comment" required>
                    <MentionTextarea
                      value={commentText}
                      onChange={setCommentText}
                      users={users}
                      placeholder="Write a comment. Type @ to mention someone."
                      required
                    />
                  </Field>
                  <button className="btn btn-primary w-full" disabled={!selectedTicketId || busy}>
                    <MessageSquare size={16} />
                    Add comment
                  </button>
                </form>

                <form className="flex gap-2" onSubmit={addDependency}>
                  <Field label="Blocked by" required className="min-w-0 flex-1">
                    <select className="field" value={dependencyId} onChange={(event) => setDependencyId(event.target.value)} required>
                      <option value="">Select ticket</option>
                      {tickets
                        .filter((ticket) => String(ticket.id) !== String(selectedTicketId))
                        .map((ticket) => (
                          <option key={ticket.id} value={ticket.id}>{ticket.title}</option>
                        ))}
                    </select>
                  </Field>
                  <button className="icon-btn mt-5" disabled={!selectedTicketId || !dependencyId} title="Add dependency">
                    <GitBranch size={16} />
                  </button>
                </form>

                {dependencies.map((dependency) => (
                  <div key={dependency.id} className="flex items-center justify-between rounded-md bg-amber-50 px-3 py-2 text-sm">
                    <span>{dependency.title}</span>
                    <button className="icon-btn h-8 w-8" onClick={() => removeDependency(dependency.id)} title="Remove dependency">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                <div className="space-y-3">
                  {comments.map((comment) => (
                    <article key={comment.id} className="rounded-md border border-slate-200 p-3 shadow-sm">
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>{usernameFor(users, comment.authorId)}</span>
                        <div className="flex items-center gap-1">
                          <button className="icon-btn h-7 w-7" onClick={() => startEditComment(comment)} title="Edit comment">
                            <Save size={13} />
                          </button>
                          <button className="icon-btn h-7 w-7 border-rose-200 text-rose-700 hover:bg-rose-50" onClick={() => deleteComment(comment.id)} title="Delete comment">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      {String(editingCommentId) === String(comment.id) ? (
                        <div className="space-y-2">
                          <MentionTextarea value={editingCommentText} onChange={setEditingCommentText} users={users} required />
                          <div className="flex gap-2">
                            <button className="btn btn-primary h-8 px-2" onClick={() => updateComment(comment.id)}>
                              <Check size={14} />
                              Save
                            </button>
                            <button className="btn h-8 px-2" onClick={() => setEditingCommentId('')}>
                              <X size={14} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-800">{comment.content}</p>
                      )}
                      {comment.mentionedUsers.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {comment.mentionedUsers.map((user) => (
                            <span key={user.id} className="badge bg-teal-50 text-teal-700">@{user.username}</span>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>

                <MentionInbox currentUser={currentUser} request={request} users={users} />
              </div>
            )}

            {activePanel === 'files' && (
              <div className="space-y-4">
                <form className="space-y-2" onSubmit={uploadAttachment}>
                  <Field label="Attachment file" required>
                    <input className="field pt-2" type="file" required onChange={(event) => setAttachmentFile(event.target.files?.[0] || null)} />
                  </Field>
                  <button className="btn btn-primary w-full" disabled={!attachmentFile || !selectedTicketId}>
                    <Upload size={16} />
                    Upload attachment
                  </button>
                </form>
                <div className="space-y-2">
                  {localAttachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between rounded-md bg-teal-50 px-3 py-2 text-sm ring-1 ring-teal-100">
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{attachment.filename}</div>
                        <div className="text-xs text-teal-700">{attachment.contentType}</div>
                      </div>
                      <button className="icon-btn h-8 w-8 border-rose-200 text-rose-700 hover:bg-rose-50" onClick={() => deleteAttachment(attachment.id)} title="Delete attachment">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <form className="space-y-2" onSubmit={importCsv}>
                  <Field label="CSV file" required>
                    <input className="field pt-2" type="file" accept=".csv,text/csv" required onChange={(event) => setCsvFile(event.target.files?.[0] || null)} />
                  </Field>
                  <button className="btn w-full" disabled={!csvFile || !selectedProjectId}>
                    <FileUp size={16} />
                    Import CSV
                  </button>
                </form>
              </div>
            )}

                </div>
              </aside>
            </section>
          </>
      </main>

      <Toast error={error} notice={notice} onDismiss={dismissToast} />
    </div>
  )
}

function UserForm({ form, setForm, onSubmit, busy }) {
  return (
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
      <Field label="Username" required>
        <input className="field" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required />
      </Field>
      <Field label="Email" required>
        <input className="field" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
      </Field>
      <Field label="Full name" required>
        <input className="field" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
      </Field>
      <Field label="Role" required>
        <Select value={form.role} values={ROLES} onChange={(role) => setForm({ ...form, role })} required />
      </Field>
      <button className="btn btn-primary sm:col-span-2" disabled={busy}>
        <UserPlus size={16} />
        Create user
      </button>
    </form>
  )
}

function Field({ label, children, required = false, className = '' }) {
  return (
    <label className={className}>
      <span className="label">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </span>
      {children}
    </label>
  )
}

function Select({ value, values, onChange, placeholder, required = false }) {
  return (
    <select className="field" value={value} onChange={(event) => onChange(event.target.value)} required={required}>
      {placeholder && <option value="">{placeholder}</option>}
      {values.map((item) => (
        <option key={item} value={item}>{item}</option>
      ))}
    </select>
  )
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      className={`flex items-center justify-center gap-1.5 border-r border-slate-200 px-2 py-3 transition duration-200 last:border-r-0 ${
        active ? 'bg-teal-50 text-teal-800 shadow-[inset_0_-2px_0_#0f766e]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon size={15} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

function Toast({ error, notice, onDismiss }) {
  if (!error && !notice) return null
  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,560px)] -translate-x-1/2">
      <div className={`motion-rise flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-bold shadow-xl ${error ? 'bg-rose-600 text-white shadow-rose-900/20' : 'bg-slate-900 text-white shadow-slate-900/20'}`}>
        <span>{error || notice}</span>
        <button
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-white/80 transition hover:bg-white/10 hover:text-white"
          type="button"
          onClick={onDismiss}
          title="Dismiss message"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}

function EmptyState({ label }) {
  return (
    <div className="flex min-h-28 items-center justify-center gap-2 rounded-md bg-white/50 text-sm font-medium text-slate-500">
      <CircleDot size={16} className="text-teal-600" />
      {label}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, color }) {
  const classes = {
    teal: 'border-teal-200 bg-teal-50 text-teal-900',
    sky: 'border-sky-200 bg-sky-50 text-sky-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    rose: 'border-rose-200 bg-rose-50 text-rose-900',
    violet: 'border-violet-200 bg-violet-50 text-violet-900',
  }
  return (
    <div className={`interactive-card flex items-center justify-between rounded-lg border px-4 py-4 shadow-sm ${classes[color] || classes.teal}`}>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide opacity-75">{label}</div>
        <div className="text-3xl font-semibold">{value}</div>
      </div>
      <div className="rounded-md bg-white/70 p-2 shadow-sm">
        <Icon size={22} />
      </div>
    </div>
  )
}

function RoleBadge({ value }) {
  const classes = {
    ADMIN: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
    DEVELOPER: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  }
  return <span className={`badge ring-1 ${classes[value] || classes.DEVELOPER}`}>{value}</span>
}

function StatusBadge({ value }) {
  const classes = {
    TODO: 'bg-slate-100 text-slate-700 ring-slate-200',
    IN_PROGRESS: 'bg-sky-50 text-sky-700 ring-sky-200',
    IN_REVIEW: 'bg-amber-50 text-amber-700 ring-amber-200',
    DONE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  }
  return <span className={`badge ring-1 ${classes[value] || classes.TODO}`}>{value}</span>
}

function TypeBadge({ value }) {
  const classes = {
    BUG: 'bg-rose-50 text-rose-700 ring-rose-200',
    FEATURE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    TECHNICAL: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  }
  return <span className={`badge ring-1 ${classes[value] || classes.TECHNICAL}`}>{value}</span>
}

function PriorityBadge({ value, overdue }) {
  const classes = {
    LOW: 'bg-slate-100 text-slate-700 ring-slate-200',
    MEDIUM: 'bg-blue-50 text-blue-700 ring-blue-200',
    HIGH: 'bg-orange-50 text-orange-700 ring-orange-200',
    CRITICAL: 'bg-rose-50 text-rose-700 ring-rose-200',
  }
  return <span className={`badge ring-1 ${classes[value] || classes.LOW}`}>{overdue ? `${value} OVERDUE` : value}</span>
}

function usernameFor(users, id) {
  if (!id) return ''
  return users.find((user) => user.id === id)?.username || `#${id}`
}

function formatDate(value) {
  if (!value) return 'None'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function toInstant(value) {
  if (!value) return null
  return new Date(value).toISOString()
}

function toDateTimeLocal(value) {
  if (!value) return ''
  const date = new Date(value)
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

function compact(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== null && entry !== undefined && entry !== ''))
}

function downloadText(text, filename, type) {
  const blob = new Blob([text], { type })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.click()
  URL.revokeObjectURL(href)
}

function csvValue(value) {
  const text = String(value ?? '')
  if (!/[",\n]/.test(text)) return text
  return `"${text.replaceAll('"', '""')}"`
}

export default App
