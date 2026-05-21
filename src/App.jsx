/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminPanel } from './components/admin/AdminPanel.jsx'
import { LoginView } from './components/auth/LoginView.jsx'
import { Toast } from './components/ui/Primitives.jsx'
import { DeveloperWorkspace } from './components/workspace/DeveloperWorkspace.jsx'
import { API_BASE, adminPageMeta, emptyTicketForm, nextTicketStatus } from './config/issueFlow.js'
import { compact, downloadText, toDateTimeLocal, toInstant } from './lib/formatters.js'

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
        throw new Error(apiErrorMessage(payload, `HTTP ${response.status}`))
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
    setTicketPatch({ status: '', priority: '', assigneeId: '', dueDate: '' })
  }, [selectedTicketId])

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
        const contentType = response.headers.get('content-type') || ''
        const payload = contentType.includes('application/json')
          ? await response.json()
          : await response.text()
        if (!response.ok) throw new Error(apiErrorMessage(payload, 'Login failed'))
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
    if (selectedTicket?.status === 'DONE') {
      setNotice('')
      setError('DONE tickets cannot be updated')
      return
    }
    if (ticketPatch.status && ticketPatch.status !== nextTicketStatus(selectedTicket?.status)) {
      setNotice('')
      setError(`Invalid status transition from ${selectedTicket?.status} to ${ticketPatch.status}`)
      return
    }
    const body = compact({
      status: ticketPatch.status || null,
      priority: ticketPatch.priority || null,
      assigneeId: ticketPatch.assigneeId ? Number(ticketPatch.assigneeId) : null,
      dueDate: toInstant(ticketPatch.dueDate),
    })
    if (Object.keys(body).length === 0) {
      setNotice('')
      setError('Choose at least one ticket field to update')
      return
    }
    await run(async () => {
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
    if (selectedAdminTicket?.status === 'DONE') {
      setNotice('')
      setError('DONE tickets cannot be updated')
      return
    }
    if (
      adminTicketPatch.status
      && adminTicketPatch.status !== selectedAdminTicket?.status
      && adminTicketPatch.status !== nextTicketStatus(selectedAdminTicket?.status)
    ) {
      setNotice('')
      setError(`Invalid status transition from ${selectedAdminTicket?.status} to ${adminTicketPatch.status}`)
      return
    }

    await run(async () => {
      const body = {
        title: adminTicketPatch.title,
        description: adminTicketPatch.description,
        status: adminTicketPatch.status,
        priority: adminTicketPatch.priority,
      }
      if (adminTicketPatch.assigneeId) body.assigneeId = Number(adminTicketPatch.assigneeId)
      if (adminTicketPatch.dueDate) body.dueDate = toInstant(adminTicketPatch.dueDate)
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
      downloadText(await response.text(), `tickets-project-${selectedProjectId}.csv`, 'text/csv')
    }, 'CSV exported')
  }

  const exportAdminTicketsCsv = async () => {
    await run(async () => {
      if (adminProjectIds.length !== 1) {
        throw new Error('Select exactly one project before exporting CSV')
      }
      const [projectId] = adminProjectIds
      const response = await fetch(`${API_BASE}/tickets/export?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('CSV export failed')
      downloadText(await response.text(), `tickets-project-${projectId}.csv`, 'text/csv')
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
      <LoginView
        busy={busy}
        createUser={createUser}
        dismissToast={dismissToast}
        error={error}
        login={login}
        loginForm={loginForm}
        notice={notice}
        setLoginForm={setLoginForm}
        setUserForm={setUserForm}
        userForm={userForm}
      />
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
    <DeveloperWorkspace
      activePanel={activePanel}
      addComment={addComment}
      addDependency={addDependency}
      attachmentFile={attachmentFile}
      busy={busy}
      commentText={commentText}
      comments={comments}
      createTicket={createTicket}
      currentUser={currentUser}
      csvFile={csvFile}
      deleteAttachment={deleteAttachment}
      deleteComment={deleteComment}
      deleteTicket={deleteTicket}
      dependencies={dependencies}
      dependencyId={dependencyId}
      dismissToast={dismissToast}
      editingCommentId={editingCommentId}
      editingCommentText={editingCommentText}
      error={error}
      exportCsv={exportCsv}
      filteredTickets={filteredTickets}
      importCsv={importCsv}
      loadProjects={loadProjects}
      localAttachments={localAttachments}
      logout={logout}
      myTickets={myTickets}
      notice={notice}
      openTickets={openTickets}
      overdueTickets={overdueTickets}
      projects={projects}
      query={query}
      refreshAll={refreshAll}
      removeDependency={removeDependency}
      request={request}
      selectedProject={selectedProject}
      selectedProjectId={selectedProjectId}
      selectedTicket={selectedTicket}
      selectedTicketId={selectedTicketId}
      setActivePanel={setActivePanel}
      setAttachmentFile={setAttachmentFile}
      setCommentText={setCommentText}
      setCsvFile={setCsvFile}
      setDependencyId={setDependencyId}
      setEditingCommentId={setEditingCommentId}
      setEditingCommentText={setEditingCommentText}
      setQuery={setQuery}
      setSelectedProjectId={setSelectedProjectId}
      setSelectedTicketId={setSelectedTicketId}
      setTicketForm={setTicketForm}
      setTicketPatch={setTicketPatch}
      setTicketScope={setTicketScope}
      startEditComment={startEditComment}
      ticketForm={ticketForm}
      ticketPatch={ticketPatch}
      ticketScope={ticketScope}
      tickets={tickets}
      updateComment={updateComment}
      updateTicket={updateTicket}
      uploadAttachment={uploadAttachment}
      urgentTickets={urgentTickets}
      users={users}
      workload={workload}
    />
  )
}

export default App

function apiErrorMessage(payload, fallback) {
  if (!payload) return fallback
  if (typeof payload === 'string') return payload || fallback
  const fieldErrors = payload.fieldErrors && Object.values(payload.fieldErrors)
  if (fieldErrors?.length) return fieldErrors.join(', ')
  return payload.message || fallback
}
