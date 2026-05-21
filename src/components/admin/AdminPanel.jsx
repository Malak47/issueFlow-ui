import {
  Activity,
  ArchiveRestore,
  Bell,
  Bug,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  FileDown,
  FileUp,
  Folder,
  GitBranch,
  History,
  LogOut,
  MessageSquare,
  Paperclip,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  Trash2,
  Upload,
  UserCog,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { MentionTextarea } from '../Mentions.jsx'

const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const TYPES = ['BUG', 'FEATURE', 'TECHNICAL']
const ROLES = ['ADMIN', 'DEVELOPER']
const AUDIT_ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN', 'LOGOUT', 'AUTO_ASSIGN', 'AUTO_ESCALATE', 'ADD_DEPENDENCY', 'REMOVE_DEPENDENCY', 'IMPORT', 'EXPORT', 'UPLOAD_ATTACHMENT', 'DELETE_ATTACHMENT']
const AUDIT_ENTITIES = ['USER', 'PROJECT', 'TICKET', 'COMMENT', 'DEPENDENCY', 'ATTACHMENT', 'AUTH']
const AUDIT_ACTORS = ['USER', 'SYSTEM']

export function AdminPanel(props) {
  const {
    activeAdminMeta,
    activePanel,
    addComment,
    addDependency,
    adminPage,
    adminProjectFilterLabel,
    adminProjectIds,
    adminTicketPatch,
    adminTickets,
    applyAuditFilters,
    attachmentFile,
    auditFilter,
    auditLogs,
    busy,
    clearAuditFilters,
    commentText,
    comments,
    createProject,
    createTicket,
    createUser,
    csvFile,
    deleteAdminTicket,
    deleteAttachment,
    deleteComment,
    deleteProject,
    deleteUser,
    deletedProjects,
    deletedTickets,
    dependencies,
    dependencyId,
    editingCommentId,
    editingCommentText,
    exportAdminTicketsCsv,
    importCsv,
    localAttachments,
    logout,
    projectEditorProject,
    projectForm,
    projectPatch,
    projects,
    refreshAll,
    removeDependency,
    restoreProject,
    restoreTicket,
    selectedAdminTicket,
    selectedProjectId,
    selectedTicketId,
    setActivePanel,
    setAdminPage,
    setAdminProjectIds,
    setAdminTicketPatch,
    setAttachmentFile,
    setCommentText,
    setCsvFile,
    setDependencyId,
    setEditingCommentId,
    setEditingCommentText,
    setProjectForm,
    setProjectPatch,
    setSelectedAdminTicketId,
    setSelectedProjectId,
    setSelectedTicketId,
    setTicketForm,
    setUserForm,
    setUserPatch,
    startEditComment,
    ticketForm,
    tickets,
    toggleAdminProjectFilter,
    updateAdminTicket,
    updateComment,
    updateProject,
    updateUser,
    uploadAttachment,
    userForm,
    userPatch,
    users,
    visibleAdminOpenTickets,
    visibleAdminOverdueTickets,
    visibleAdminTickets,
  } = props

  const openAdminTicket = (ticketId) => {
    setSelectedAdminTicketId(String(ticketId))
    setSelectedTicketId(String(ticketId))
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-slate-900 2xl:flex">
      <AdminSidebar currentUser={props.currentUser} activePage={adminPage} onSelectPage={setAdminPage} onLogout={logout} onRefresh={refreshAll} busy={busy} />

      <main className="flex min-w-0 flex-1 flex-col gap-5 px-4 py-5 sm:px-6 xl:px-8 2xl:h-screen 2xl:overflow-hidden">
        <header className="flex shrink-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">{activeAdminMeta.title}</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">{activeAdminMeta.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm">
              <Activity size={16} className="text-cyan-600" />
              Live workspace data
            </div>
            <button className="btn border-cyan-700 bg-cyan-700 text-white shadow-cyan-900/20 hover:bg-cyan-800" type="button" onClick={exportAdminTicketsCsv}>
              <FileDown size={16} />
              Export CSV
            </button>
            <button className="icon-btn" type="button" onClick={refreshAll} disabled={busy} title="Refresh data">
              <RefreshCw size={17} />
            </button>
            <button className="icon-btn relative" type="button" onClick={() => setAdminPage('audit')} title="Latest audit events">
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-y-auto pr-1">
          {adminPage === 'overview' && (
            <OverviewPage
              auditLogs={auditLogs}
              deletedProjects={deletedProjects}
              deletedTickets={deletedTickets}
              projects={projects}
              setAdminPage={setAdminPage}
              users={users}
              adminTickets={adminTickets}
              visibleAdminOverdueTickets={visibleAdminOverdueTickets}
              exportAdminTicketsCsv={exportAdminTicketsCsv}
            />
          )}

          {adminPage === 'tickets' && (
            <TicketsPage
              activePanel={activePanel}
              addComment={addComment}
              addDependency={addDependency}
              adminProjectFilterLabel={adminProjectFilterLabel}
              adminProjectIds={adminProjectIds}
              adminTicketPatch={adminTicketPatch}
              attachmentFile={attachmentFile}
              busy={busy}
              commentText={commentText}
              comments={comments}
              createTicket={createTicket}
              csvFile={csvFile}
              deleteAdminTicket={deleteAdminTicket}
              deleteAttachment={deleteAttachment}
              deleteComment={deleteComment}
              dependencies={dependencies}
              dependencyId={dependencyId}
              editingCommentId={editingCommentId}
              editingCommentText={editingCommentText}
              importCsv={importCsv}
              localAttachments={localAttachments}
              openAdminTicket={openAdminTicket}
              projects={projects}
              removeDependency={removeDependency}
              selectedAdminTicket={selectedAdminTicket}
              selectedProjectId={selectedProjectId}
              selectedTicketId={selectedTicketId}
              setActivePanel={setActivePanel}
              setAdminProjectIds={setAdminProjectIds}
              setAdminTicketPatch={setAdminTicketPatch}
              setAttachmentFile={setAttachmentFile}
              setCommentText={setCommentText}
              setCsvFile={setCsvFile}
              setDependencyId={setDependencyId}
              setEditingCommentId={setEditingCommentId}
              setEditingCommentText={setEditingCommentText}
              setSelectedProjectId={setSelectedProjectId}
              setTicketForm={setTicketForm}
              startEditComment={startEditComment}
              ticketForm={ticketForm}
              tickets={tickets}
              toggleAdminProjectFilter={toggleAdminProjectFilter}
              updateAdminTicket={updateAdminTicket}
              updateComment={updateComment}
              uploadAttachment={uploadAttachment}
              users={users}
              visibleAdminOpenTickets={visibleAdminOpenTickets}
              visibleAdminOverdueTickets={visibleAdminOverdueTickets}
              visibleAdminTickets={visibleAdminTickets}
            />
          )}

          {adminPage === 'users' && (
            <UsersPage
              busy={busy}
              createUser={createUser}
              deleteUser={deleteUser}
              setUserForm={setUserForm}
              setUserPatch={setUserPatch}
              updateUser={updateUser}
              userForm={userForm}
              userPatch={userPatch}
              users={users}
            />
          )}

          {adminPage === 'projects' && (
            <ProjectsPage
              busy={busy}
              createProject={createProject}
              deleteProject={deleteProject}
              projectEditorProject={projectEditorProject}
              projectForm={projectForm}
              projectPatch={projectPatch}
              projects={projects}
              setProjectForm={setProjectForm}
              setProjectPatch={setProjectPatch}
              setSelectedProjectId={props.setAdminManageProjectId}
              selectedProjectId={props.adminManageProjectId}
              updateProject={updateProject}
            />
          )}

          {adminPage === 'recovery' && (
            <RecoveryPage
              deletedProjects={deletedProjects}
              deletedTickets={deletedTickets}
              restoreProject={restoreProject}
              restoreTicket={restoreTicket}
            />
          )}

          {adminPage === 'audit' && (
            <AuditPage
              applyAuditFilters={applyAuditFilters}
              auditFilter={auditFilter}
              auditLogs={auditLogs}
              clearAuditFilters={clearAuditFilters}
              deletedProjects={deletedProjects}
              deletedTickets={deletedTickets}
              projects={projects}
              setAuditFilter={props.setAuditFilter}
              tickets={[...adminTickets, ...tickets]}
              users={users}
            />
          )}
        </section>
      </main>
    </div>
  )
}

function OverviewPage({ auditLogs, deletedProjects, deletedTickets, projects, setAdminPage, users, adminTickets, visibleAdminOverdueTickets, exportAdminTicketsCsv }) {
  return (
    <div className="grid h-full min-h-0 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminSummaryCard icon={Users} label="Users" value={users.length} action="View all users" tone="blue" target="users" onSelect={setAdminPage} />
          <AdminSummaryCard icon={Folder} label="Projects" value={projects.length} action="View projects" tone="sage" target="projects" onSelect={setAdminPage} />
          <AdminSummaryCard icon={Bug} label="Tickets" value={adminTickets.length} action="Edit tickets" tone="cyan" target="tickets" onSelect={setAdminPage} />
          <AdminSummaryCard icon={ArchiveRestore} label="Deleted" value={deletedProjects.length + deletedTickets.length} action="View recovery" tone="amber" target="recovery" onSelect={setAdminPage} />
        </div>

        <section className="admin-card admin-card-soft-cyan p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Workspace snapshot</h2>
              <p className="text-sm text-slate-500">A compact summary of the records currently loaded from IssueFlow.</p>
            </div>
            <Activity size={19} className="text-cyan-700" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <AdminMiniMetric icon={Folder} label="Projects" value={projects.length} tone="sage" />
            <AdminMiniMetric icon={Bug} label="Tickets" value={adminTickets.length} tone="blue" />
            <AdminMiniMetric icon={History} label="Audit events" value={auditLogs.length} tone="cyan" />
          </div>
        </section>

        <AdminRecentAudit logs={auditLogs} users={users} projects={projects} tickets={adminTickets} onOpenAudit={() => setAdminPage('audit')} />
      </div>

      <aside className="space-y-5">
        <AdminQuickActions onJump={setAdminPage} onExport={exportAdminTicketsCsv} />
        <AdminHealth overdueCount={visibleAdminOverdueTickets.length} deletedCount={deletedProjects.length + deletedTickets.length} />
      </aside>
    </div>
  )
}

function TicketsPage(props) {
  const {
    activePanel,
    addComment,
    addDependency,
    adminProjectFilterLabel,
    adminTicketPatch,
    attachmentFile,
    busy,
    commentText,
    comments,
    createTicket,
    csvFile,
    deleteAdminTicket,
    deleteAttachment,
    deleteComment,
    dependencies,
    dependencyId,
    editingCommentId,
    editingCommentText,
    importCsv,
    localAttachments,
    openAdminTicket,
    projects,
    removeDependency,
    selectedAdminTicket,
    selectedProjectId,
    selectedTicketId,
    setActivePanel,
    setAdminTicketPatch,
    setAttachmentFile,
    setCommentText,
    setCsvFile,
    setDependencyId,
    setEditingCommentId,
    setEditingCommentText,
    setSelectedProjectId,
    setTicketForm,
    startEditComment,
    ticketForm,
    tickets,
    toggleAdminProjectFilter,
    updateAdminTicket,
    updateComment,
    uploadAttachment,
    users,
    visibleAdminOpenTickets,
    visibleAdminOverdueTickets,
    visibleAdminTickets,
  } = props

  return (
    <div className="grid h-full min-h-0 gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
      <section className="admin-card admin-card-soft-sage flex min-h-0 flex-col overflow-visible">
        <div className="flex shrink-0 flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Ticket portfolio</h2>
            <p className="text-sm text-slate-500">Filter across projects, select a ticket, then edit or collaborate on it.</p>
          </div>
          <ProjectMultiSelect
            label={adminProjectFilterLabel}
            projects={projects}
            selectedProjectIds={props.adminProjectIds}
            onToggle={toggleAdminProjectFilter}
            onClear={() => props.setAdminProjectIds([])}
          />
        </div>

        <div className="grid shrink-0 gap-3 p-5 md:grid-cols-3">
          <AdminMiniMetric icon={Bug} label="Visible tickets" value={visibleAdminTickets.length} tone="sage" />
          <AdminMiniMetric icon={CalendarDays} label="Open tickets" value={visibleAdminOpenTickets.length} tone="blue" />
          <AdminMiniMetric icon={CircleDot} label="Overdue" value={visibleAdminOverdueTickets.length} tone="rose" />
        </div>

        <div className="min-h-0 flex-1 overflow-x-auto px-5 pb-5">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Due</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visibleAdminTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className={`cursor-pointer ${String(ticket.id) === String(selectedAdminTicket?.id) ? 'bg-cyan-50/80 shadow-[inset_4px_0_0_#0e7490]' : ''}`}
                  onClick={() => openAdminTicket(ticket.id)}
                >
                  <td>
                    <div className="font-semibold text-slate-900">{ticket.title}</div>
                    <div className="line-clamp-1 text-xs text-slate-500">{ticket.description}</div>
                  </td>
                  <td className="font-medium text-slate-700">{ticket.projectName || projectNameFor(projects, ticket.projectId)}</td>
                  <td><StatusBadge value={ticket.status} /></td>
                  <td><PriorityBadge value={ticket.priority} overdue={ticket.isOverdue} /></td>
                  <td>{usernameFor(users, ticket.assigneeId) || 'Unassigned'}</td>
                  <td>{formatDate(ticket.dueDate)}</td>
                  <td><button className="btn h-9 px-3" type="button">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleAdminTickets.length === 0 && <EmptyState label="No tickets for this project scope" />}
        </div>
      </section>

      <aside className="grid min-h-0 gap-5 overflow-y-auto">
        <TicketEditCard
          adminTicketPatch={adminTicketPatch}
          busy={busy}
          deleteAdminTicket={deleteAdminTicket}
          selectedAdminTicket={selectedAdminTicket}
          setAdminTicketPatch={setAdminTicketPatch}
          updateAdminTicket={updateAdminTicket}
          users={users}
          projects={projects}
        />
        <TicketCreateImportCard
          busy={busy}
          createTicket={createTicket}
          csvFile={csvFile}
          importCsv={importCsv}
          projects={projects}
          selectedProjectId={selectedProjectId}
          setCsvFile={setCsvFile}
          setSelectedProjectId={setSelectedProjectId}
          setTicketForm={setTicketForm}
          ticketForm={ticketForm}
          users={users}
        />
        <TicketCollaborationCard
          activePanel={activePanel}
          addComment={addComment}
          addDependency={addDependency}
          attachmentFile={attachmentFile}
          busy={busy}
          commentText={commentText}
          comments={comments}
          deleteAttachment={deleteAttachment}
          deleteComment={deleteComment}
          dependencies={dependencies}
          dependencyId={dependencyId}
          editingCommentId={editingCommentId}
          editingCommentText={editingCommentText}
          localAttachments={localAttachments}
          removeDependency={removeDependency}
          selectedTicketId={selectedTicketId}
          setActivePanel={setActivePanel}
          setAttachmentFile={setAttachmentFile}
          setCommentText={setCommentText}
          setDependencyId={setDependencyId}
          setEditingCommentId={setEditingCommentId}
          setEditingCommentText={setEditingCommentText}
          startEditComment={startEditComment}
          tickets={tickets}
          updateComment={updateComment}
          uploadAttachment={uploadAttachment}
          users={users}
        />
      </aside>
    </div>
  )
}

function TicketEditCard({ adminTicketPatch, busy, deleteAdminTicket, selectedAdminTicket, setAdminTicketPatch, updateAdminTicket, users, projects }) {
  return (
    <form className="admin-card admin-card-soft-blue space-y-4 p-5" onSubmit={updateAdminTicket}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Ticket edit</h2>
          <p className="text-sm text-slate-500">{selectedAdminTicket ? `Editing #${selectedAdminTicket.id} in ${projectNameFor(projects, selectedAdminTicket.projectId)}` : 'Select a ticket from the table.'}</p>
        </div>
        {selectedAdminTicket && <StatusBadge value={selectedAdminTicket.status} />}
      </div>
      <Field label="Title" required>
        <input className="field" value={adminTicketPatch.title} onChange={(event) => setAdminTicketPatch({ ...adminTicketPatch, title: event.target.value })} disabled={!selectedAdminTicket} required />
      </Field>
      <Field label="Description">
        <textarea className="textarea-field min-h-28" value={adminTicketPatch.description} onChange={(event) => setAdminTicketPatch({ ...adminTicketPatch, description: event.target.value })} disabled={!selectedAdminTicket} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Status" required>
          <Select value={adminTicketPatch.status} values={STATUSES} placeholder="Status" onChange={(status) => setAdminTicketPatch({ ...adminTicketPatch, status })} required />
        </Field>
        <Field label="Priority" required>
          <Select value={adminTicketPatch.priority} values={PRIORITIES} placeholder="Priority" onChange={(priority) => setAdminTicketPatch({ ...adminTicketPatch, priority })} required />
        </Field>
      </div>
      <Field label="Assignee">
        <select className="field" value={adminTicketPatch.assigneeId} onChange={(event) => setAdminTicketPatch({ ...adminTicketPatch, assigneeId: event.target.value })} disabled={!selectedAdminTicket}>
          <option value="">Unassigned</option>
          {users.map((user) => <option key={user.id} value={user.id}>{user.username}</option>)}
        </select>
      </Field>
      <Field label="Due date">
        <input className="field" type="datetime-local" value={adminTicketPatch.dueDate} onChange={(event) => setAdminTicketPatch({ ...adminTicketPatch, dueDate: event.target.value })} disabled={!selectedAdminTicket} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <button className="btn btn-primary" disabled={!selectedAdminTicket || busy}><Save size={16} />Save</button>
        <button className="btn border-rose-200 text-rose-700 hover:bg-rose-50" type="button" onClick={deleteAdminTicket} disabled={!selectedAdminTicket || busy}><Trash2 size={16} />Delete</button>
      </div>
    </form>
  )
}

function TicketCreateImportCard({ busy, createTicket, csvFile, importCsv, projects, selectedProjectId, setCsvFile, setSelectedProjectId, setTicketForm, ticketForm, users }) {
  return (
    <section className="admin-card p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Create and import</h2>
        <p className="text-sm text-slate-500">Admin can create tickets in any active project and import project CSV files.</p>
      </div>
      <form className="space-y-3" onSubmit={createTicket}>
        <Field label="Project" required>
          <select className="field" value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} required>
            <option value="">Select project</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </Field>
        <Field label="Title" required>
          <input className="field" value={ticketForm.title} onChange={(event) => setTicketForm({ ...ticketForm, title: event.target.value })} required />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Select value={ticketForm.status} values={STATUSES} onChange={(status) => setTicketForm({ ...ticketForm, status })} required />
          <Select value={ticketForm.priority} values={PRIORITIES} onChange={(priority) => setTicketForm({ ...ticketForm, priority })} required />
          <Select value={ticketForm.type} values={TYPES} onChange={(type) => setTicketForm({ ...ticketForm, type })} required />
        </div>
        <Field label="Assignee">
          <select className="field" value={ticketForm.assigneeId} onChange={(event) => setTicketForm({ ...ticketForm, assigneeId: event.target.value })}>
            <option value="">Auto assign</option>
            {users.map((user) => <option key={user.id} value={user.id}>{user.username}</option>)}
          </select>
        </Field>
        <Field label="Due date">
          <input className="field" type="datetime-local" value={ticketForm.dueDate} onChange={(event) => setTicketForm({ ...ticketForm, dueDate: event.target.value })} />
        </Field>
        <button className="btn btn-primary w-full" disabled={!selectedProjectId || busy}><Plus size={16} />Create ticket</button>
      </form>

      <form className="mt-4 border-t border-slate-100 pt-4" onSubmit={importCsv}>
        <Field label="CSV file" required>
          <input className="field pt-2" type="file" accept=".csv,text/csv" required onChange={(event) => setCsvFile(event.target.files?.[0] || null)} />
        </Field>
        <button className="btn mt-3 w-full" disabled={!csvFile || !selectedProjectId}><FileUp size={16} />Import CSV</button>
      </form>
    </section>
  )
}

function TicketCollaborationCard(props) {
  const {
    activePanel,
    addComment,
    addDependency,
    attachmentFile,
    busy,
    commentText,
    comments,
    deleteAttachment,
    deleteComment,
    dependencies,
    dependencyId,
    editingCommentId,
    editingCommentText,
    localAttachments,
    removeDependency,
    selectedTicketId,
    setActivePanel,
    setAttachmentFile,
    setCommentText,
    setDependencyId,
    setEditingCommentId,
    setEditingCommentText,
    startEditComment,
    tickets,
    updateComment,
    uploadAttachment,
    users,
  } = props

  return (
    <section className="admin-card overflow-hidden">
      <div className="grid grid-cols-2 text-xs font-semibold">
        <TabButton active={activePanel === 'comments'} onClick={() => setActivePanel('comments')} icon={MessageSquare} label="Comments" />
        <TabButton active={activePanel === 'files'} onClick={() => setActivePanel('files')} icon={Paperclip} label="Files" />
      </div>

      <div className="max-h-[520px] overflow-y-auto p-5">
        {activePanel === 'comments' && (
          <div className="space-y-4">
            <form className="space-y-2" onSubmit={addComment}>
              <Field label="Comment" required>
                <MentionTextarea value={commentText} onChange={setCommentText} users={users} placeholder="Write a comment. Type @ to mention someone." required />
              </Field>
              <button className="btn btn-primary w-full" disabled={!selectedTicketId || busy}><MessageSquare size={16} />Add comment</button>
            </form>

            <form className="flex gap-2" onSubmit={addDependency}>
              <Field label="Blocked by" required className="min-w-0 flex-1">
                <select className="field" value={dependencyId} onChange={(event) => setDependencyId(event.target.value)} required>
                  <option value="">Select ticket</option>
                  {tickets.filter((ticket) => String(ticket.id) !== String(selectedTicketId)).map((ticket) => (
                    <option key={ticket.id} value={ticket.id}>{ticket.title}</option>
                  ))}
                </select>
              </Field>
              <button className="icon-btn mt-5" disabled={!selectedTicketId || !dependencyId} title="Add dependency"><GitBranch size={16} /></button>
            </form>

            {dependencies.map((dependency) => (
              <div key={dependency.id} className="flex items-center justify-between rounded-md bg-amber-50 px-3 py-2 text-sm">
                <span>{dependency.title}</span>
                <button className="icon-btn h-8 w-8" onClick={() => removeDependency(dependency.id)} title="Remove dependency"><Trash2 size={14} /></button>
              </div>
            ))}

            {comments.map((comment) => (
              <article key={comment.id} className="rounded-md border border-slate-200 p-3 shadow-sm">
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>{usernameFor(users, comment.authorId)}</span>
                  <div className="flex items-center gap-1">
                    <button className="icon-btn h-7 w-7" onClick={() => startEditComment(comment)} title="Edit comment"><Save size={13} /></button>
                    <button className="icon-btn h-7 w-7 border-rose-200 text-rose-700 hover:bg-rose-50" onClick={() => deleteComment(comment.id)} title="Delete comment"><Trash2 size={13} /></button>
                  </div>
                </div>
                {String(editingCommentId) === String(comment.id) ? (
                  <div className="space-y-2">
                    <MentionTextarea value={editingCommentText} onChange={setEditingCommentText} users={users} required />
                    <div className="flex gap-2">
                      <button className="btn btn-primary h-8 px-2" onClick={() => updateComment(comment.id)}><Check size={14} />Save</button>
                      <button className="btn h-8 px-2" onClick={() => setEditingCommentId('')}><X size={14} />Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-800">{comment.content}</p>
                )}
              </article>
            ))}
          </div>
        )}

        {activePanel === 'files' && (
          <div className="space-y-4">
            <form className="space-y-2" onSubmit={uploadAttachment}>
              <Field label="Attachment file" required>
                <input className="field pt-2" type="file" required onChange={(event) => setAttachmentFile(event.target.files?.[0] || null)} />
              </Field>
              <button className="btn btn-primary w-full" disabled={!attachmentFile || !selectedTicketId}><Upload size={16} />Upload attachment</button>
            </form>
            {localAttachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2 text-sm ring-1 ring-emerald-100">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{attachment.filename}</div>
                  <div className="text-xs text-emerald-700">{attachment.contentType}</div>
                </div>
                <button className="icon-btn h-8 w-8 border-rose-200 text-rose-700 hover:bg-rose-50" onClick={() => deleteAttachment(attachment.id)} title="Delete attachment"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function UsersPage({ busy, createUser, deleteUser, setUserForm, setUserPatch, updateUser, userForm, userPatch, users }) {
  return (
    <section className="admin-card admin-card-soft-blue h-full overflow-y-auto p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">User management</h2>
          <p className="text-sm text-slate-500">Create users, update roles, and remove users from the workspace.</p>
        </div>
        <UserCog size={19} className="text-blue-700" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <UserForm form={userForm} setForm={setUserForm} onSubmit={createUser} busy={busy} />
        <div className="hidden items-stretch justify-center px-1 lg:flex" aria-hidden="true">
          <div className="relative w-px bg-gradient-to-b from-transparent via-blue-200 to-transparent" />
        </div>
        <form className="grid gap-3" onSubmit={updateUser}>
          <Field label="User" required>
            <select className="field" value={userPatch.userId} onChange={(event) => setUserPatch({ ...userPatch, userId: event.target.value })} required>
              <option value="">Select user</option>
              {users.map((user) => <option key={user.id} value={user.id}>{user.username}</option>)}
            </select>
          </Field>
          <Field label="Role" required><Select value={userPatch.role} values={ROLES} onChange={(role) => setUserPatch({ ...userPatch, role })} required /></Field>
          <Field label="Full name" required><input className="field" value={userPatch.fullName} onChange={(event) => setUserPatch({ ...userPatch, fullName: event.target.value })} required /></Field>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn border-blue-600 text-blue-700 hover:bg-blue-50" disabled={!userPatch.userId || busy}><Save size={16} />Save</button>
            <button className="btn border-rose-200 text-rose-700 hover:bg-rose-50" type="button" onClick={deleteUser} disabled={!userPatch.userId || busy}><Trash2 size={16} />Delete</button>
          </div>
        </form>
      </div>
    </section>
  )
}

function ProjectsPage({ busy, createProject, deleteProject, projectEditorProject, projectForm, projectPatch, projects, selectedProjectId, setProjectForm, setProjectPatch, setSelectedProjectId, updateProject }) {
  return (
    <section className="admin-card admin-card-soft-sage h-full overflow-y-auto p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Project management</h2>
          <p className="text-sm text-slate-500">Create, edit, soft-delete, and restore project records.</p>
        </div>
        <GitBranch size={19} className="text-emerald-700" />
      </div>
      <div className="grid items-start gap-5 2xl:grid-cols-[0.9fr_1.1fr]">
        <form className="self-start space-y-3 rounded-md border border-emerald-100 bg-emerald-50/40 p-4" onSubmit={createProject}>
          <h3 className="text-sm font-semibold text-emerald-950">Create project</h3>
          <Field label="Name" required><input className="field" value={projectForm.name} onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })} required /></Field>
          <Field label="Description"><textarea className="textarea-field min-h-24" value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} /></Field>
          <button className="btn btn-primary w-full" disabled={busy}><Plus size={16} />Create project</button>
        </form>

        <div className="space-y-4">
          <section className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <Field label="Project to manage" required>
              <select className="field" value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} required>
                <option value="">Select project</option>
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            </Field>
          </section>
          <form className="space-y-3 rounded-md border border-blue-100 bg-blue-50/40 p-4" onSubmit={updateProject}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-blue-950">Edit details</h3>
                <p className="text-xs text-blue-700">{projectEditorProject ? `Editing ${projectEditorProject.name}` : 'Select a project before editing.'}</p>
              </div>
              {projectEditorProject && <span className="badge bg-white text-blue-700 ring-1 ring-blue-200">#{projectEditorProject.id}</span>}
            </div>
            <Field label="Name" required><input className="field" value={projectPatch.name} onChange={(event) => setProjectPatch({ ...projectPatch, name: event.target.value })} required disabled={!selectedProjectId} /></Field>
            <Field label="Description"><textarea className="textarea-field min-h-24" value={projectPatch.description} onChange={(event) => setProjectPatch({ ...projectPatch, description: event.target.value })} disabled={!selectedProjectId} /></Field>
            <button className="btn w-full border-blue-600 text-blue-700 hover:bg-blue-50" disabled={!selectedProjectId || busy}><Save size={16} />Save changes</button>
          </form>
          <section className="rounded-md border border-rose-200 bg-rose-50 p-4">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <p className="text-xs text-rose-700">{projectEditorProject ? `Moves ${projectEditorProject.name} to Recovery.` : 'Select a project to enable delete.'}</p>
              <button className="btn border-rose-600 bg-rose-600 text-white hover:bg-rose-700" type="button" onClick={deleteProject} disabled={!selectedProjectId || busy}><Trash2 size={16} />Delete project</button>
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}

function RecoveryPage({ deletedProjects, deletedTickets, restoreProject, restoreTicket }) {
  return (
    <section className="admin-card admin-card-soft-amber h-full overflow-y-auto p-5">
      <div className="mb-4 flex items-center justify-between">
        <div><h2 className="text-lg font-semibold">Recovery</h2><p className="text-sm text-slate-500">Restore soft-deleted tickets and projects.</p></div>
        <ArchiveRestore size={19} className="text-amber-700" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section>
          <h3 className="mb-2 text-sm font-semibold">Deleted tickets</h3>
          <div className="space-y-2">{deletedTickets.map((ticket) => <RestoreRow key={ticket.id} label={ticket.title} onClick={() => restoreTicket(ticket.id)} />)}{deletedTickets.length === 0 && <EmptyState label="No deleted tickets" />}</div>
        </section>
        <section>
          <h3 className="mb-2 text-sm font-semibold">Deleted projects</h3>
          <div className="space-y-2">{deletedProjects.map((project) => <RestoreRow key={project.id} label={project.name} onClick={() => restoreProject(project.id)} />)}{deletedProjects.length === 0 && <EmptyState label="No deleted projects" />}</div>
        </section>
      </div>
    </section>
  )
}

function AuditPage({ applyAuditFilters, auditFilter, auditLogs, clearAuditFilters, deletedProjects, deletedTickets, projects, setAuditFilter, tickets, users }) {
  return (
    <section className="admin-card admin-card-soft-cyan flex h-full min-h-0 flex-col overflow-hidden p-5">
      <div className="mb-4 flex items-center justify-between">
        <div><h2 className="text-lg font-semibold">Audit log</h2><p className="text-sm text-slate-500">Filter operational events by action, entity, actor, or ID.</p></div>
        <History size={19} className="text-cyan-700" />
      </div>
      <form className="audit-filter-form mb-4 rounded-md bg-white/80 p-3 ring-1 ring-cyan-100" onSubmit={applyAuditFilters}>
        <Select value={auditFilter.action} values={AUDIT_ACTIONS} placeholder="Action" onChange={(action) => setAuditFilter({ ...auditFilter, action })} />
        <Select value={auditFilter.entityType} values={AUDIT_ENTITIES} placeholder="Entity" onChange={(entityType) => setAuditFilter({ ...auditFilter, entityType })} />
        <Select value={auditFilter.actor} values={AUDIT_ACTORS} placeholder="Actor" onChange={(actor) => setAuditFilter({ ...auditFilter, actor })} />
        <input className="field" placeholder="Entity ID" value={auditFilter.entityId} onChange={(event) => setAuditFilter({ ...auditFilter, entityId: event.target.value })} />
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:justify-end">
          <button className="btn btn-primary w-full min-w-0 px-4 sm:w-auto sm:min-w-24"><Search size={15} />Apply</button>
          <button className="btn w-full min-w-0 px-4 sm:w-auto sm:min-w-24" type="button" onClick={clearAuditFilters}><X size={15} />Clear</button>
        </div>
      </form>
      <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto pr-1">
        {auditLogs.slice(0, 100).map((log) => (
          <AuditLogCard key={log.id} log={log} users={users} projects={[...projects, ...deletedProjects]} tickets={[...tickets, ...deletedTickets]} />
        ))}
      </div>
    </section>
  )
}

function AdminSidebar({ currentUser, activePage, onSelectPage, onLogout, onRefresh, busy }) {
  const navItems = [
    { label: 'Overview', icon: Shield, target: 'overview' },
    { label: 'Projects', icon: Folder, target: 'projects' },
    { label: 'Tickets', icon: Bug, target: 'tickets' },
    { label: 'Users', icon: Users, target: 'users' },
    { label: 'Recovery', icon: ArchiveRestore, target: 'recovery' },
    { label: 'Audit log', icon: History, target: 'audit' },
  ]

  return (
    <aside className="admin-sidebar">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-900/20">
          <GitBranch size={21} />
        </div>
        <div className="text-lg font-semibold">IssueFlow</div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold text-slate-950">
            {initialsFor(currentUser?.fullName || currentUser?.username)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-white">{currentUser?.username}</div>
            <RoleBadge value={currentUser?.role} />
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map(({ label, icon: Icon, target }) => (
          <button key={target} className={`admin-nav-item ${activePage === target ? 'admin-nav-active' : ''}`} type="button" onClick={() => onSelectPage(target)}>
            <Icon size={17} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-3">
        <button className="btn w-full justify-start" type="button" onClick={onRefresh} disabled={busy}><RefreshCw size={16} />Refresh</button>
        <button className="btn w-full justify-start" type="button" onClick={onLogout}><LogOut size={16} />Logout</button>
      </div>
    </aside>
  )
}

function ProjectMultiSelect({ label, projects, selectedProjectIds, onToggle, onClear }) {
  return (
    <details className="group relative w-full md:w-72">
      <summary className="admin-filter flex w-full cursor-pointer list-none items-center justify-between gap-3">
        <span>{label}</span>
        <ChevronRight size={14} className="transition group-open:rotate-90" />
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-xl shadow-slate-300/60">
        <button className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold transition ${selectedProjectIds.length === 0 ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50'}`} type="button" onClick={onClear}>
          All projects
          {selectedProjectIds.length === 0 && <Check size={15} />}
        </button>
        <div className="my-2 border-t border-slate-100" />
        <div className="max-h-56 space-y-1 overflow-y-auto">
          {projects.map((project) => {
            const checked = selectedProjectIds.includes(String(project.id))
            return (
              <label key={project.id} className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${checked ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}>
                <input className="h-4 w-4 rounded border-slate-300 text-emerald-700" type="checkbox" checked={checked} onChange={() => onToggle(project.id)} />
                <span className="min-w-0 flex-1 truncate">{project.name}</span>
              </label>
            )
          })}
          {projects.length === 0 && <div className="px-3 py-2 text-sm text-slate-500">No projects available</div>}
        </div>
      </div>
    </details>
  )
}

function UserForm({ form, setForm, onSubmit, busy }) {
  return (
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
      <Field label="Username" required><input className="field" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required /></Field>
      <Field label="Email" required><input className="field" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></Field>
      <Field label="Full name" required><input className="field" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required /></Field>
      <Field label="Role" required><Select value={form.role} values={ROLES} onChange={(role) => setForm({ ...form, role })} required /></Field>
      <button className="btn btn-primary sm:col-span-2" disabled={busy}><UserPlus size={16} />Create user</button>
    </form>
  )
}

function Field({ label, children, required = false, className = '' }) {
  return <label className={className}><span className="label">{label}{required && <span className="text-rose-600"> *</span>}</span>{children}</label>
}

function Select({ value, values, onChange, placeholder, required = false }) {
  return (
    <select className="field" value={value} onChange={(event) => onChange(event.target.value)} required={required}>
      {placeholder && <option value="">{placeholder}</option>}
      {values.map((item) => <option key={item} value={item}>{item}</option>)}
    </select>
  )
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button className={`flex items-center justify-center gap-1.5 border-r border-slate-200 px-2 py-3 transition duration-200 last:border-r-0 ${active ? 'bg-cyan-50 text-cyan-800 shadow-[inset_0_-2px_0_#0e7490]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`} onClick={onClick} type="button">
      <Icon size={15} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

function RestoreRow({ label, onClick }) {
  return (
    <div className="interactive-card flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
      <span className="truncate text-sm">{label}</span>
      <button className="icon-btn h-8 w-8" onClick={onClick} title="Restore"><ArchiveRestore size={15} /></button>
    </div>
  )
}

function EmptyState({ label }) {
  return <div className="flex min-h-28 items-center justify-center gap-2 rounded-md bg-white/50 text-sm font-medium text-slate-500"><CircleDot size={16} className="text-cyan-600" />{label}</div>
}

function AdminSummaryCard({ icon: Icon, label, value, action, tone, target, onSelect }) {
  const tones = {
    blue: 'border-blue-100 bg-blue-50 text-blue-700',
    sage: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    cyan: 'border-cyan-100 bg-cyan-50 text-cyan-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
  }

  return (
    <button className={`admin-summary-card text-left ${tones[tone] || tones.sage}`} type="button" onClick={() => onSelect(target)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 shadow-sm"><Icon size={24} /></span>
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-wide">{label}</span>
        <span className="mt-1 block text-3xl font-semibold text-slate-950">{value}</span>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold">{action}<ChevronRight size={13} /></span>
      </span>
    </button>
  )
}

function AdminMiniMetric({ icon: Icon, label, value, tone }) {
  const tones = {
    sage: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    blue: 'border-blue-100 bg-blue-50 text-blue-700',
    cyan: 'border-cyan-100 bg-cyan-50 text-cyan-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
  }
  return <div className={`rounded-lg border p-4 ${tones[tone] || tones.sage}`}><div className="flex items-center justify-between gap-3"><div><div className="text-xs font-bold uppercase tracking-wide">{label}</div><div className="mt-1 text-3xl font-semibold text-slate-950">{value}</div></div><div className="rounded-md bg-white/80 p-2 shadow-sm"><Icon size={20} /></div></div></div>
}

function AdminRecentAudit({ logs, users, projects, tickets, onOpenAudit }) {
  return (
    <section id="admin-recent-audit" className="admin-card admin-card-soft-cyan p-5">
      <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-base font-semibold">Recent audit events</h2><button className="text-xs font-bold text-cyan-700" type="button" onClick={onOpenAudit}>View all</button></div>
      <div className="space-y-4">
        {logs.slice(0, 5).map((log) => (
          <div key={log.id} className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100"><History size={15} /></div>
            <div className="min-w-0"><div className="line-clamp-2 text-sm font-semibold text-slate-800">{auditActorLabel(log, users)} {auditActionSentence(log.action).toLowerCase()} {auditEntityLabel(log, { users, projects, tickets })}</div><div className="mt-1 text-xs text-slate-500">{formatDate(log.timestamp)}</div></div>
          </div>
        ))}
        {logs.length === 0 && <EmptyState label="No audit events" />}
      </div>
    </section>
  )
}

function AdminQuickActions({ onJump, onExport }) {
  const actions = [
    { label: 'Create new project', icon: Plus, onClick: () => onJump('projects') },
    { label: 'Invite new user', icon: UserPlus, onClick: () => onJump('users') },
    { label: 'Export tickets CSV', icon: FileDown, onClick: onExport },
    { label: 'Open audit filters', icon: Settings, onClick: () => onJump('audit') },
  ]
  return <section className="admin-card admin-card-soft-blue p-5"><h2 className="mb-4 text-base font-semibold">Quick actions</h2><div className="space-y-2">{actions.map(({ label, icon: Icon, onClick }) => <button key={label} className="admin-action-row" type="button" onClick={onClick}><span className="flex items-center gap-2"><Icon size={15} />{label}</span><ChevronRight size={15} /></button>)}</div></section>
}

function AdminHealth({ overdueCount, deletedCount }) {
  const healthy = overdueCount === 0
  return <section className="admin-card admin-card-soft-sage p-5"><h2 className="mb-4 text-base font-semibold">Workspace health</h2><div className={`rounded-lg border p-4 ${healthy ? 'border-emerald-100 bg-emerald-50 text-emerald-800' : 'border-rose-100 bg-rose-50 text-rose-800'}`}><div className="flex items-start gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 shadow-sm"><Check size={17} /></div><div><div className="text-sm font-bold">{healthy ? 'All systems operational' : `${overdueCount} overdue ticket${overdueCount === 1 ? '' : 's'}`}</div><div className="mt-1 text-xs">{deletedCount} deleted item{deletedCount === 1 ? '' : 's'} available in recovery.</div></div></div></div></section>
}

function RoleBadge({ value }) {
  const classes = { ADMIN: 'bg-cyan-50 text-cyan-700 ring-cyan-200', DEVELOPER: 'bg-emerald-50 text-emerald-700 ring-emerald-200' }
  return <span className={`badge ring-1 ${classes[value] || classes.DEVELOPER}`}>{value}</span>
}

function StatusBadge({ value }) {
  const classes = { TODO: 'bg-slate-100 text-slate-700 ring-slate-200', IN_PROGRESS: 'bg-blue-50 text-blue-700 ring-blue-200', IN_REVIEW: 'bg-amber-50 text-amber-700 ring-amber-200', DONE: 'bg-emerald-50 text-emerald-700 ring-emerald-200' }
  return <span className={`badge ring-1 ${classes[value] || classes.TODO}`}>{value}</span>
}

function PriorityBadge({ value, overdue }) {
  const classes = { LOW: 'bg-slate-100 text-slate-700 ring-slate-200', MEDIUM: 'bg-blue-50 text-blue-700 ring-blue-200', HIGH: 'bg-orange-50 text-orange-700 ring-orange-200', CRITICAL: 'bg-rose-50 text-rose-700 ring-rose-200' }
  return <span className={`badge ring-1 ${classes[value] || classes.LOW}`}>{overdue ? `${value} OVERDUE` : value}</span>
}

function AuditActionBadge({ value }) {
  const danger = ['DELETE', 'DELETE_ATTACHMENT']
  const success = ['CREATE', 'RESTORE', 'IMPORT']
  const system = ['AUTO_ASSIGN', 'AUTO_ESCALATE']
  let classes = 'bg-slate-100 text-slate-700 ring-slate-200'
  if (danger.includes(value)) classes = 'bg-rose-50 text-rose-700 ring-rose-200'
  if (success.includes(value)) classes = 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (system.includes(value)) classes = 'bg-amber-50 text-amber-700 ring-amber-200'
  if (value === 'UPDATE') classes = 'bg-cyan-50 text-cyan-700 ring-cyan-200'
  return <span className={`badge ring-1 ${classes}`}>{value}</span>
}

function AuditLogCard({ log, users, projects, tickets }) {
  const actor = auditActorLabel(log, users)
  const entity = auditEntityLabel(log, { users, projects, tickets })
  const tone = ['DELETE', 'DELETE_ATTACHMENT'].includes(log.action) ? 'border-l-rose-500' : log.actor === 'SYSTEM' ? 'border-l-amber-500' : 'border-l-cyan-500'
  return <article className={`rounded-lg border border-slate-200 border-l-4 ${tone} bg-white p-4 text-sm shadow-sm`}><div className="flex flex-wrap items-center justify-between gap-2"><AuditActionBadge value={log.action} /><span className="text-xs font-semibold text-slate-500">{formatDate(log.timestamp)}</span></div><div className="mt-3 text-base font-semibold text-slate-900">{auditActionSentence(log.action)} {entity}</div><div className="mt-2 grid gap-2 text-xs text-slate-600 sm:grid-cols-3"><div><span className="block font-bold uppercase tracking-wide text-slate-400">Performed by</span><span>{actor}</span></div><div><span className="block font-bold uppercase tracking-wide text-slate-400">Entity</span><span>{log.entityType} #{log.entityId}</span></div><div><span className="block font-bold uppercase tracking-wide text-slate-400">Source</span><span>{log.actor}</span></div></div></article>
}

function usernameFor(users, id) {
  if (!id) return ''
  return users.find((user) => user.id === id)?.username || `#${id}`
}

function projectNameFor(projects, id) {
  return projects.find((project) => String(project.id) === String(id))?.name || `Project #${id}`
}

function auditActorLabel(log, users) {
  if (log.actor === 'SYSTEM') return 'System automation'
  const userId = log.performedBy || (log.entityType === 'AUTH' ? log.entityId : null)
  const user = users.find((entry) => String(entry.id) === String(userId))
  if (user) return `${user.fullName} (@${user.username})`
  return 'User action (actor id not recorded)'
}

function auditEntityLabel(log, { users, projects, tickets }) {
  if (log.entityType === 'USER' || log.entityType === 'AUTH') {
    const user = users.find((entry) => String(entry.id) === String(log.entityId))
    if (user) return `${user.fullName} (@${user.username})`
  }
  if (log.entityType === 'PROJECT') {
    const project = projects.find((entry) => String(entry.id) === String(log.entityId))
    if (project) return project.name
  }
  if (log.entityType === 'TICKET') {
    const ticket = tickets.find((entry) => String(entry.id) === String(log.entityId))
    if (ticket) return ticket.title
  }
  return `${log.entityType.toLowerCase()} #${log.entityId}`
}

function auditActionSentence(action) {
  const labels = { CREATE: 'Created', UPDATE: 'Updated', DELETE: 'Deleted', RESTORE: 'Restored', LOGIN: 'Signed in as', LOGOUT: 'Signed out', AUTO_ASSIGN: 'Auto-assigned', AUTO_ESCALATE: 'Auto-escalated', ADD_DEPENDENCY: 'Added dependency', REMOVE_DEPENDENCY: 'Removed dependency', IMPORT: 'Imported', EXPORT: 'Exported', UPLOAD_ATTACHMENT: 'Uploaded attachment', DELETE_ATTACHMENT: 'Deleted attachment' }
  return labels[action] || action
}

function initialsFor(value) {
  return String(value || '?').trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}

function formatDate(value) {
  if (!value) return 'None'
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}
