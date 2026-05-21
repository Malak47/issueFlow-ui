import {
  Activity,
  Bug,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  Download,
  FileUp,
  Folder,
  GitBranch,
  LogOut,
  MessageSquare,
  Paperclip,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react'
import { nextTicketStatus, PRIORITIES, STATUSES, TYPES } from '../../config/issueFlow.js'
import { formatDate, usernameFor } from '../../lib/formatters.js'
import { MentionInbox, MentionTextarea } from '../Mentions.jsx'
import {
  EmptyState,
  Field,
  PriorityBadge,
  RoleBadge,
  Select,
  StatusBadge,
  TabButton,
  Toast,
  TypeBadge,
} from '../ui/Primitives.jsx'

export function DeveloperWorkspace(props) {
  const {
    activePanel,
    addComment,
    addDependency,
    attachmentFile,
    busy,
    commentText,
    comments,
    currentUser,
    csvFile,
    deleteAttachment,
    deleteComment,
    deleteTicket,
    dependencies,
    dependencyId,
    dismissToast,
    editingCommentId,
    editingCommentText,
    error,
    exportCsv,
    filteredTickets,
    importCsv,
    loadProjects,
    localAttachments,
    logout,
    myTickets,
    notice,
    openTickets,
    overdueTickets,
    projects,
    query,
    refreshAll,
    removeDependency,
    request,
    selectedProject,
    selectedProjectId,
    selectedTicket,
    selectedTicketId,
    setActivePanel,
    setAttachmentFile,
    setCommentText,
    setCsvFile,
    setDependencyId,
    setEditingCommentId,
    setEditingCommentText,
    setQuery,
    setSelectedProjectId,
    setSelectedTicketId,
    setTicketForm,
    setTicketPatch,
    setTicketScope,
    startEditComment,
    ticketForm,
    ticketPatch,
    ticketScope,
    tickets,
    updateComment,
    updateTicket,
    uploadAttachment,
    urgentTickets,
    users,
    workload,
  } = props
  return (
    <div className="min-h-screen bg-[#f4f7f6] text-slate-900 2xl:flex">
      <DeveloperSidebar
        busy={busy}
        currentUser={currentUser}
        loadProjects={loadProjects}
        logout={logout}
        projects={projects}
        refreshAll={refreshAll}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
      />

      <main className="flex min-w-0 flex-1 flex-col gap-5 px-4 py-5 sm:px-6 xl:px-8 2xl:h-screen 2xl:overflow-hidden">
        <WorkspaceHeader
          busy={busy}
          exportCsv={exportCsv}
          refreshAll={refreshAll}
          selectedProject={selectedProject}
          selectedProjectId={selectedProjectId}
        />

        <ProjectSelector
          loadProjects={loadProjects}
          projects={projects}
          selectedProject={selectedProject}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
        />

        <section className="grid shrink-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DeveloperMetricCard icon={Bug} label="Project tickets" value={tickets.length} tone="sage" />
          <DeveloperMetricCard icon={CalendarDays} label="Assigned to me" value={myTickets.length} tone="blue" />
          <DeveloperMetricCard icon={GitBranch} label="High priority" value={urgentTickets.length} tone="amber" />
          <DeveloperMetricCard icon={CircleDot} label="Overdue" value={overdueTickets} tone="rose" />
        </section>

        <section className="grid min-h-0 flex-1 gap-5 overflow-y-auto pr-1 xl:grid-cols-[minmax(0,1fr)_430px]">
          <div className="min-h-0 space-y-5">
            <TicketQueue
              filteredTickets={filteredTickets}
              openTickets={openTickets}
              query={query}
              selectedTicketId={selectedTicketId}
              setQuery={setQuery}
              setSelectedTicketId={setSelectedTicketId}
              setTicketScope={setTicketScope}
              ticketScope={ticketScope}
              users={users}
            />
            <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <TicketForm
                busy={busy}
                createTicket={props.createTicket}
                selectedProjectId={selectedProjectId}
                setTicketForm={setTicketForm}
                ticketForm={ticketForm}
                users={users}
              />
              <WorkloadPanel workload={workload} />
            </section>
          </div>

          <TicketDetailPanel
            activePanel={activePanel}
            addComment={addComment}
            addDependency={addDependency}
            attachmentFile={attachmentFile}
            busy={busy}
            commentText={commentText}
            comments={comments}
            currentUser={currentUser}
            csvFile={csvFile}
            deleteAttachment={deleteAttachment}
            deleteComment={deleteComment}
            deleteTicket={deleteTicket}
            dependencies={dependencies}
            dependencyId={dependencyId}
            editingCommentId={editingCommentId}
            editingCommentText={editingCommentText}
            importCsv={importCsv}
            localAttachments={localAttachments}
            removeDependency={removeDependency}
            request={request}
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
            setTicketPatch={setTicketPatch}
            startEditComment={startEditComment}
            ticketPatch={ticketPatch}
            tickets={tickets}
            updateComment={updateComment}
            updateTicket={updateTicket}
            uploadAttachment={uploadAttachment}
            users={users}
          />
        </section>
      </main>

      <Toast error={error} notice={notice} onDismiss={dismissToast} />
    </div>
  )
}

function DeveloperSidebar({ busy, currentUser, loadProjects, logout, projects, refreshAll, selectedProjectId, setSelectedProjectId }) {
  return (
    <aside className="admin-sidebar">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-900/20">
          <GitBranch size={21} />
        </div>
        <div className="text-lg font-semibold">IssueFlow</div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-slate-950">
            {(currentUser?.fullName || currentUser?.username || '?').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-white">{currentUser?.username}</div>
            <RoleBadge value={currentUser?.role} />
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        <button className="admin-nav-item admin-nav-active" type="button">
          <Bug size={17} />
          <span>My workspace</span>
        </button>
        <button className="admin-nav-item" type="button" onClick={loadProjects}>
          <Folder size={17} />
          <span>Projects</span>
        </button>
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/60 p-2">
        <div className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-slate-500">Active projects</div>
        <div className="space-y-1">
          {projects.map((project) => (
            <button
              key={project.id}
              className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm font-bold transition ${
                String(project.id) === String(selectedProjectId)
                  ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              type="button"
              onClick={() => setSelectedProjectId(String(project.id))}
            >
              <span className="min-w-0 truncate">{project.name}</span>
              <ChevronRight size={14} />
            </button>
          ))}
          {projects.length === 0 && <div className="px-3 py-2 text-sm text-slate-500">No projects</div>}
        </div>
      </div>

      <div className="mt-auto space-y-3">
        <button className="btn w-full justify-start" type="button" onClick={refreshAll} disabled={busy}><RefreshCw size={16} />Refresh</button>
        <button className="btn w-full justify-start" type="button" onClick={logout}><LogOut size={16} />Logout</button>
      </div>
    </aside>
  )
}

function WorkspaceHeader({ busy, exportCsv, refreshAll, selectedProject, selectedProjectId }) {
  return (
    <header className="flex shrink-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Developer workspace</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          {selectedProject ? `${selectedProject.name} queue, workload, comments, files, and CSV actions.` : 'Select a project to load tickets and collaboration tools.'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm">
          <Activity size={16} className="text-emerald-600" />
          Live project data
        </div>
        <button className="btn border-emerald-700 bg-emerald-700 text-white shadow-emerald-900/20 hover:bg-emerald-800" type="button" onClick={exportCsv} disabled={!selectedProjectId}>
          <Download size={16} />
          Export CSV
        </button>
        <button className="icon-btn" type="button" onClick={refreshAll} disabled={busy} title="Refresh data">
          <RefreshCw size={17} />
        </button>
      </div>
    </header>
  )
}

function ProjectSelector({ loadProjects, projects, selectedProject, selectedProjectId, setSelectedProjectId }) {
  return (
    <section className="admin-card admin-card-soft-cyan shrink-0 overflow-visible p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <GitBranch size={15} />
            Current project
          </div>
          <h2 className="text-lg font-semibold">{selectedProject?.name || 'Select a project'}</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            {selectedProject?.description || 'Choose a project to load tickets, workload, comments, and exports.'}
          </p>
        </div>
        <button className="icon-btn" type="button" onClick={loadProjects} title="Refresh projects">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {projects.map((project) => (
          <button
            key={project.id}
            className={`admin-filter ${String(project.id) === String(selectedProjectId) ? 'admin-filter-active' : ''}`}
            type="button"
            onClick={() => setSelectedProjectId(String(project.id))}
          >
            {project.name}
          </button>
        ))}
        {projects.length === 0 && <EmptyState label="No projects available" />}
      </div>
    </section>
  )
}

function DeveloperMetricCard({ icon: Icon, label, value, tone }) {
  const tones = {
    sage: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    blue: 'border-sky-100 bg-sky-50 text-sky-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
  }

  return (
    <div className={`admin-summary-card text-left ${tones[tone] || tones.sage}`}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 shadow-sm"><Icon size={24} /></span>
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-wide">{label}</span>
        <span className="mt-1 block text-3xl font-semibold text-slate-950">{value}</span>
      </span>
    </div>
  )
}

function TicketQueue({ filteredTickets, openTickets, query, selectedTicketId, setQuery, setSelectedTicketId, setTicketScope, ticketScope, users }) {
  return (
    <section className="admin-card admin-card-soft-sage flex min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Ticket queue</h2>
          <p className="text-sm text-slate-500">{filteredTickets.length} shown, {openTickets} open in project</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-grid grid-cols-2 rounded-md bg-white p-1 text-sm font-semibold shadow-sm ring-1 ring-slate-200">
            <button
              className={`rounded px-3 py-2 transition ${ticketScope === 'all' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-500 hover:text-slate-800'}`}
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
            <input className="field w-full pl-9 md:w-64" placeholder="Search tickets" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto px-5 pb-5">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Type</th>
              <th>Assignee</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr
                key={ticket.id}
                className={`cursor-pointer transition duration-200 hover:bg-slate-50 ${
                  String(ticket.id) === String(selectedTicketId) ? 'bg-emerald-50/90 shadow-[inset_4px_0_0_#047857]' : 'bg-white hover:shadow-sm'
                }`}
                onClick={() => setSelectedTicketId(String(ticket.id))}
              >
                <td>
                  <div className="font-semibold text-slate-900">{ticket.title}</div>
                  <div className="line-clamp-1 text-xs text-slate-500">{ticket.description}</div>
                </td>
                <td><StatusBadge value={ticket.status} /></td>
                <td><PriorityBadge value={ticket.priority} overdue={ticket.isOverdue} /></td>
                <td className="text-slate-600"><TypeBadge value={ticket.type} /></td>
                <td className="text-slate-600">{usernameFor(users, ticket.assigneeId) || 'Unassigned'}</td>
                <td className="text-slate-600">{formatDate(ticket.dueDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredTickets.length === 0 && <EmptyState label="No tickets" />}
    </section>
  )
}

function TicketForm({ busy, createTicket, selectedProjectId, setTicketForm, ticketForm, users }) {
  return (
    <form className="admin-card admin-card-soft-blue space-y-4 p-5" onSubmit={createTicket}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">New ticket</h3>
          <p className="text-sm text-slate-500">Leave assignee empty to use auto-assignment.</p>
        </div>
        <Bug size={18} className="text-emerald-700" />
      </div>
      <Field label="Title" required>
        <input className="field" value={ticketForm.title} onChange={(event) => setTicketForm({ ...ticketForm, title: event.target.value })} required />
      </Field>
      <Field label="Description">
        <textarea className="textarea-field min-h-24" value={ticketForm.description} onChange={(event) => setTicketForm({ ...ticketForm, description: event.target.value })} />
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
          <select className="field" value={ticketForm.assigneeId} onChange={(event) => setTicketForm({ ...ticketForm, assigneeId: event.target.value })}>
            <option value="">Auto assign</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Due date">
        <input className="field" type="datetime-local" value={ticketForm.dueDate} onChange={(event) => setTicketForm({ ...ticketForm, dueDate: event.target.value })} />
      </Field>
      <button className="btn btn-primary w-full" disabled={!selectedProjectId || busy}>
        <Plus size={16} />
        Create ticket
      </button>
    </form>
  )
}

function WorkloadPanel({ workload }) {
  return (
    <div className="admin-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Workload</h3>
          <p className="text-sm text-slate-500">Open tickets per developer</p>
        </div>
        <Users size={18} className="text-sky-700" />
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
  )
}

function TicketDetailPanel(props) {
  const {
    activePanel,
    addComment,
    addDependency,
    attachmentFile,
    busy,
    commentText,
    comments,
    currentUser,
    csvFile,
    deleteAttachment,
    deleteComment,
    deleteTicket,
    dependencies,
    dependencyId,
    editingCommentId,
    editingCommentText,
    importCsv,
    localAttachments,
    removeDependency,
    request,
    selectedProjectId,
    selectedTicket,
    selectedTicketId,
    setActivePanel,
    setAttachmentFile,
    setCommentText,
    setCsvFile,
    setDependencyId,
    setEditingCommentId,
    setEditingCommentText,
    setTicketPatch,
    startEditComment,
    ticketPatch,
    tickets,
    updateComment,
    updateTicket,
    uploadAttachment,
    users,
  } = props
  const isDone = selectedTicket?.status === 'DONE'
  const nextStatus = nextTicketStatus(selectedTicket?.status)

  return (
    <aside className="admin-card self-start overflow-hidden">
      <div className="border-b border-slate-200 bg-white/75 p-5">
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
          <Select
            value={ticketPatch.status}
            values={nextStatus ? [nextStatus] : []}
            placeholder={nextStatus ? 'Next status' : 'No status update'}
            onChange={(status) => setTicketPatch({ ...ticketPatch, status })}
            disabled={!selectedTicket || isDone || !nextStatus}
          />
          <Select value={ticketPatch.priority} values={PRIORITIES} placeholder="Priority" onChange={(priority) => setTicketPatch({ ...ticketPatch, priority })} disabled={!selectedTicket || isDone} />
          <select className="field" value={ticketPatch.assigneeId} onChange={(event) => setTicketPatch({ ...ticketPatch, assigneeId: event.target.value })} disabled={!selectedTicket || isDone}>
            <option value="">Keep assignee</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </select>
          <input className="field" type="datetime-local" value={ticketPatch.dueDate} onChange={(event) => setTicketPatch({ ...ticketPatch, dueDate: event.target.value })} disabled={!selectedTicket || isDone} />
          <button className="btn btn-primary" disabled={!selectedTicketId || busy || isDone} onClick={updateTicket}>
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
          <TicketComments
            addComment={addComment}
            addDependency={addDependency}
            busy={busy}
            commentText={commentText}
            comments={comments}
            currentUser={currentUser}
            deleteComment={deleteComment}
            dependencies={dependencies}
            dependencyId={dependencyId}
            editingCommentId={editingCommentId}
            editingCommentText={editingCommentText}
            removeDependency={removeDependency}
            request={request}
            selectedTicketId={selectedTicketId}
            setCommentText={setCommentText}
            setDependencyId={setDependencyId}
            setEditingCommentId={setEditingCommentId}
            setEditingCommentText={setEditingCommentText}
            startEditComment={startEditComment}
            tickets={tickets}
            updateComment={updateComment}
            users={users}
          />
        )}

        {activePanel === 'files' && (
          <TicketFiles
            attachmentFile={attachmentFile}
            csvFile={csvFile}
            deleteAttachment={deleteAttachment}
            importCsv={importCsv}
            localAttachments={localAttachments}
            selectedProjectId={selectedProjectId}
            selectedTicketId={selectedTicketId}
            setAttachmentFile={setAttachmentFile}
            setCsvFile={setCsvFile}
            uploadAttachment={uploadAttachment}
          />
        )}
      </div>
    </aside>
  )
}

function TicketComments(props) {
  const {
    addComment,
    addDependency,
    busy,
    commentText,
    comments,
    currentUser,
    deleteComment,
    dependencies,
    dependencyId,
    editingCommentId,
    editingCommentText,
    removeDependency,
    request,
    selectedTicketId,
    setCommentText,
    setDependencyId,
    setEditingCommentId,
    setEditingCommentText,
    startEditComment,
    tickets,
    updateComment,
    users,
  } = props

  return (
    <div className="space-y-4">
      <form className="space-y-2" onSubmit={addComment}>
        <Field label="Comment" required>
          <MentionTextarea value={commentText} onChange={setCommentText} users={users} placeholder="Write a comment. Type @ to mention someone." required />
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
          <article key={comment.id} className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
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
                  <span key={user.id} className="badge bg-emerald-50 text-emerald-700">@{user.username}</span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      <MentionInbox currentUser={currentUser} request={request} users={users} />
    </div>
  )
}

function TicketFiles({ attachmentFile, csvFile, deleteAttachment, importCsv, localAttachments, selectedProjectId, selectedTicketId, setAttachmentFile, setCsvFile, uploadAttachment }) {
  return (
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
          <div key={attachment.id} className="flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2 text-sm ring-1 ring-emerald-100">
            <div className="min-w-0">
              <div className="truncate font-semibold">{attachment.filename}</div>
              <div className="text-xs text-emerald-700">{attachment.contentType}</div>
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
  )
}
