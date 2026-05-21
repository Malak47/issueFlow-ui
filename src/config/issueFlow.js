export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
export const TYPES = ['BUG', 'FEATURE', 'TECHNICAL']
export const ROLES = ['ADMIN', 'DEVELOPER']

export const STATUS_TRANSITIONS = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'IN_REVIEW',
  IN_REVIEW: 'DONE',
}

export function nextTicketStatus(status) {
  return STATUS_TRANSITIONS[status] || ''
}

export function updateStatusOptions(status) {
  const nextStatus = nextTicketStatus(status)
  return [status, nextStatus].filter(Boolean)
}

export const AUDIT_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'RESTORE',
  'LOGIN',
  'LOGOUT',
  'AUTO_ASSIGN',
  'AUTO_ESCALATE',
  'ADD_DEPENDENCY',
  'REMOVE_DEPENDENCY',
  'IMPORT',
  'EXPORT',
  'UPLOAD_ATTACHMENT',
  'DELETE_ATTACHMENT',
]

export const AUDIT_ENTITIES = ['USER', 'PROJECT', 'TICKET', 'COMMENT', 'DEPENDENCY', 'ATTACHMENT', 'AUTH']
export const AUDIT_ACTORS = ['USER', 'SYSTEM']

export const emptyTicketForm = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  type: 'BUG',
  assigneeId: '',
  dueDate: '',
}

export const adminPageMeta = {
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
