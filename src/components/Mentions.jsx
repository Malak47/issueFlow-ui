/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AtSign, RefreshCw } from 'lucide-react'

export function MentionTextarea({ value, onChange, users, placeholder = '', required = false, disabled = false }) {
  const textareaRef = useRef(null)
  const [trigger, setTrigger] = useState(null)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const mentionQuery = trigger?.query

  const suggestions = useMemo(() => {
    if (!trigger) return []
    const query = trigger.query.toLowerCase()
    return users
      .filter((user) => {
        const username = String(user.username || '').toLowerCase()
        const fullName = String(user.fullName || '').toLowerCase()
        return username.includes(query) || fullName.includes(query)
      })
      .slice(0, 6)
  }, [trigger, users])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [mentionQuery])

  const refreshTrigger = useCallback((text, caret) => {
    setTrigger(findMentionTrigger(text, caret))
  }, [])

  const selectMention = useCallback((user) => {
    if (!trigger) return
    const before = value.slice(0, trigger.start)
    const after = value.slice(trigger.end)
    const nextValue = `${before}@${user.username} ${after}`
    const nextCaret = before.length + user.username.length + 2

    onChange(nextValue)
    setTrigger(null)
    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(nextCaret, nextCaret)
    })
  }, [onChange, trigger, value])

  const handleChange = (event) => {
    const nextValue = event.target.value
    onChange(nextValue)
    refreshTrigger(nextValue, event.target.selectionStart)
  }

  const handleKeyDown = (event) => {
    if (!trigger || suggestions.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightedIndex((index) => (index + 1) % suggestions.length)
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex((index) => (index - 1 + suggestions.length) % suggestions.length)
    }

    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      selectMention(suggestions[highlightedIndex])
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setTrigger(null)
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        className="textarea-field"
        value={value}
        onChange={handleChange}
        onClick={(event) => refreshTrigger(value, event.currentTarget.selectionStart)}
        onKeyDown={handleKeyDown}
        onKeyUp={(event) => refreshTrigger(value, event.currentTarget.selectionStart)}
        onBlur={() => window.setTimeout(() => setTrigger(null), 120)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />

      {trigger && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-md border border-teal-200 bg-white shadow-lg">
          {suggestions.map((user, index) => (
            <button
              key={user.id}
              type="button"
              className={`flex w-full items-center gap-3 px-3 py-2 text-left transition ${
                index === highlightedIndex ? 'bg-teal-50' : 'hover:bg-slate-50'
              }`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectMention(user)}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-teal-700 text-xs font-bold text-white">
                {initialsFor(user.fullName)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-900">@{user.username}</span>
                <span className="block truncate text-xs text-slate-500">{user.fullName} · {user.role}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function MentionInbox({ currentUser, request, users }) {
  const [mentions, setMentions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const currentUserId = currentUser?.id

  const loadMyMentions = useCallback(async () => {
    if (!currentUserId) {
      setMentions([])
      return
    }

    setLoading(true)
    setError('')
    try {
      const payload = await request(`/users/${currentUserId}/mentions?page=1&pageSize=10`)
      setMentions(payload.data || [])
    } catch (caught) {
      setError(caught.message || 'Mentions could not be loaded')
    } finally {
      setLoading(false)
    }
  }, [currentUserId, request])

  useEffect(() => {
    loadMyMentions()
  }, [loadMyMentions])

  return (
    <section className="rounded-md bg-violet-50 p-3 ring-1 ring-violet-100">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-violet-950">Who mentioned me?</h3>
          <p className="text-xs text-violet-700">
            {currentUser ? `Showing comments that mention @${currentUser.username}.` : 'Sign in to see your mentions.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AtSign size={16} className="text-violet-700" />
          <button className="icon-btn h-8 w-8 bg-white" type="button" onClick={loadMyMentions} disabled={loading || !currentUser} title="Refresh mentions">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {error && <div className="rounded-md bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">{error}</div>}

      <div className="mt-3 space-y-2">
        {mentions.map((mention) => (
          <article key={mention.id} className="rounded-md bg-white p-3 text-xs text-slate-700 ring-1 ring-violet-100">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-900">Ticket #{mention.ticketId}</span>
              <span className="text-slate-500">from {usernameFor(users, mention.authorId)}</span>
            </div>
            <p className="line-clamp-3">{mention.content}</p>
          </article>
        ))}
        {!loading && mentions.length === 0 && (
          <div className="rounded-md bg-white px-3 py-4 text-center text-xs font-medium text-slate-500 ring-1 ring-violet-100">
            No one mentioned you yet.
          </div>
        )}
        {loading && (
          <div className="rounded-md bg-white px-3 py-4 text-center text-xs font-medium text-violet-700 ring-1 ring-violet-100">
            Loading mentions...
          </div>
        )}
      </div>
    </section>
  )
}

function usernameFor(users, id) {
  if (!id) return 'Unknown user'
  return users.find((user) => String(user.id) === String(id))?.username || `user #${id}`
}

function findMentionTrigger(value, caret) {
  const beforeCaret = value.slice(0, caret)
  const atIndex = beforeCaret.lastIndexOf('@')
  if (atIndex === -1) return null
  if (atIndex > 0 && !/\s/.test(beforeCaret[atIndex - 1])) return null

  const query = beforeCaret.slice(atIndex + 1)
  if (/\s/.test(query) || !/^[A-Za-z0-9_]*$/.test(query)) return null

  return { start: atIndex, end: caret, query }
}

function initialsFor(value) {
  return String(value || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
