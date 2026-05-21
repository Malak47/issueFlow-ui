import { UserPlus } from 'lucide-react'
import { ROLES } from '../../config/issueFlow.js'
import { Field, Select } from '../ui/Primitives.jsx'

export function UserForm({ form, setForm, onSubmit, busy }) {
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
