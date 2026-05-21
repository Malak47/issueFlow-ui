import { GitBranch, Shield, Users } from 'lucide-react'
import heroImage from '../../assets/hero.png'
import { UserForm } from '../users/UserForm.jsx'
import { Field, RoleBadge, Toast } from '../ui/Primitives.jsx'

export function LoginView({
  busy,
  createUser,
  dismissToast,
  error,
  login,
  loginForm,
  notice,
  setLoginForm,
  setUserForm,
  userForm,
}) {
  return (
    <div className="app-bg min-h-screen p-4 text-slate-900 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-6xl items-center gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="glass-panel motion-rise overflow-hidden rounded-xl">
          <div className="border-b border-white/70 bg-white/70 p-6">
            <div className="mb-5 flex items-center justify-between gap-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="focus-ring-pulse flex h-12 w-12 items-center justify-center rounded-md bg-emerald-700 text-white shadow-sm">
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
              <DemoMetric eyebrow="Developers" label="Focus" tone="emerald" />
              <DemoMetric eyebrow="Projects" label="Track" tone="sky" />
              <DemoMetric eyebrow="Admins" label="Control" tone="amber" />
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <DemoAccountCard
              role="ADMIN"
              username="clara_admin"
              icon={Shield}
              tone="slate"
              onUse={() => setLoginForm({ username: 'clara_admin', password: 'secret' })}
            />
            <DemoAccountCard
              role="DEVELOPER"
              username="noah_backend"
              icon={Users}
              tone="sky"
              onUse={() => setLoginForm({ username: 'noah_backend', password: 'secret' })}
            />
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

          <details className="rounded-md border border-slate-200 bg-white/75 p-4 shadow-sm">
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

function DemoMetric({ eyebrow, label, tone }) {
  const classes = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    sky: 'border-sky-200 bg-sky-50 text-sky-950',
    amber: 'border-amber-200 bg-amber-50 text-amber-950',
  }
  return (
    <div className={`interactive-card rounded-md border p-3 ${classes[tone]}`}>
      <div className="text-xs font-semibold uppercase text-current opacity-70">{eyebrow}</div>
      <div className="mt-1 text-2xl font-semibold">{label}</div>
    </div>
  )
}

function DemoAccountCard({ role, username, icon: Icon, tone, onUse }) {
  const buttonClasses = tone === 'slate'
    ? 'border-slate-700 text-slate-800 hover:bg-slate-50'
    : 'border-sky-600 text-sky-700 hover:bg-sky-50'

  return (
    <div className="interactive-card rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{role === 'ADMIN' ? 'Admin demo' : 'Developer demo'}</h2>
        <RoleBadge value={role} />
      </div>
      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex justify-between gap-3"><span>Username</span><span className="font-semibold text-slate-900">{username}</span></div>
        <div className="flex justify-between gap-3"><span>Password</span><span className="font-semibold text-slate-900">secret</span></div>
      </div>
      <button className={`btn mt-4 w-full ${buttonClasses}`} type="button" onClick={onUse}>
        <Icon size={16} />
        Use {role === 'ADMIN' ? 'admin' : 'developer'}
      </button>
    </div>
  )
}
