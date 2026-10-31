import { useState } from 'react'
import './App.css'

type Category = 'feat' | 'work' | 'rest' | 'game' | 'chore' | 'scroll' | 'custom'

type Commit = {
  id: string
  category: Category
  message: string
  duration: number
  tags: string[]
  createdAt: Date
}

const categories: { id: Category; label: string }[] = [
  { id: 'feat', label: 'Развитие' },
  { id: 'work', label: 'Работа' },
  { id: 'rest', label: 'Отдых' },
  { id: 'game', label: 'Игры' },
  { id: 'chore', label: 'Быт' },
  { id: 'scroll', label: 'Соцсети' },
  { id: 'custom', label: 'Другое' },
]

function parseCommit(input: string): Omit<Commit, 'id' | 'createdAt'> | null {
  const colonIndex = input.indexOf(':')

  if (colonIndex === -1) {
    return null
  }

  const rawCategory = input.slice(0, colonIndex).trim().toLowerCase()
  const category = categories.find((item) => item.id === rawCategory)?.id

  if (!category) {
    return null
  }

  let message = input.slice(colonIndex + 1).trim()

  const tags = Array.from(
    message.matchAll(/#([\p{L}\p{N}_-]+)/gu),
    (match) => match[1],
  )

  message = message.replace(/#[\p{L}\p{N}_-]+/gu, ' ').trim()

  const durationMatch = message.match(
    /(?:^|\s)(?:(\d+)\s*(?:h|ч))?\s*(\d+)\s*(?:m|м)(?=\s|$)/i,
  )

  if (!durationMatch || !message) {
    return null
  }

  const hours = Number(durationMatch[1] ?? 0)
  const minutes = Number(durationMatch[2])
  const duration = hours * 60 + minutes

  if (duration <= 0 || duration > 1440) {
    return null
  }

  message = message.replace(durationMatch[0], ' ').trim()

  if (!message) {
    return null
  }

  return {
    category,
    message,
    duration,
    tags,
  }
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${remainingMinutes} мин`
  }

  if (remainingMinutes === 0) {
    return `${hours} ч`
  }

  return `${hours} ч ${remainingMinutes} мин`
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function App() {
  const [input, setInput] = useState('')
  const [commits, setCommits] = useState<Commit[]>([])
  const [error, setError] = useState('')

  const totalMinutes = commits.reduce(
    (total, commit) => total + commit.duration,
    0,
  )

  function addCommit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = parseCommit(input)

    if (!parsed) {
      setError(
        'Проверь формат: категория: описание длительность #тег',
      )
      return
    }

    const newCommit: Commit = {
      ...parsed,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }

    setCommits((previous) => [newCommit, ...previous])
    setInput('')
    setError('')
  }

  function deleteCommit(id: string) {
    setCommits((previous) => previous.filter((commit) => commit.id !== id))
  }

  const today = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  })

  return (
    <main className="app">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="GitLife — главная">
          <span className="brand-icon">G</span>
          <span>GitLife</span>
        </a>

        <span className="topbar-caption">Твоя жизнь в коммитах</span>
      </header>

      <div className="content" id="home">
        <section className="welcome">
          <div>
            <p className="eyebrow">ТВОЯ ИСТОРИЯ</p>
            <h1>Привет!</h1>
            <p className="subtitle">
              Фиксируй моменты. Замечай, как проходит время.
            </p>
          </div>

          <div className="date-card">
            <span className="date-icon">◷</span>
            <span>{today}</span>
          </div>
        </section>

        <section className="summary">
          <div className="summary-card">
            <span className="summary-label">Коммиты сегодня</span>
            <strong>{commits.length}</strong>
            <span className="summary-note">Записанных событий</span>
          </div>

          <div className="summary-card">
            <span className="summary-label">Учтённое время</span>
            <strong>{formatDuration(totalMinutes)}</strong>
            <span className="summary-note">Сумма длительности событий</span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">НОВАЯ ЗАПИСЬ</p>
              <h2>Что ты делал?</h2>
            </div>
            <span className="heading-icon">＋</span>
          </div>

          <form onSubmit={addCommit}>
            <label className="input-label" htmlFor="commit-input">
              Команда коммита
            </label>

            <div className="input-wrapper">
              <span className="terminal-prefix">&gt;_</span>
              <input
                id="commit-input"
                type="text"
                value={input}
                onChange={(event) => {
                  setInput(event.target.value)
                  setError('')
                }}
                placeholder="feat: изучил TypeScript 1h30m #study"
                autoComplete="off"
              />
            </div>

            <p className="input-hint">
              Категория: описание, длительность и необязательные теги.
            </p>

            <div className="category-list">
              {categories.map((category) => (
                <button
                  className="category-chip"
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setInput((previous) =>
                      previous
                        ? `${category.id}: ${previous}`
                        : `${category.id}: `,
                    )
                    setError('')
                    document.getElementById('commit-input')?.focus()
                  }}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {error && <p className="error-message">{error}</p>}

            <button className="submit-button" type="submit">
              <span>＋</span> Создать коммит
            </button>
          </form>

          <div className="examples">
            <span>Пример:</span>
            <code>scroll: TikTok 35m #evening</code>
          </div>
        </section>

        <section className="history">
          <div className="history-heading">
            <div>
              <p className="eyebrow">ТВОЙ ДЕНЬ</p>
              <h2>Последние коммиты</h2>
            </div>

            <span className="history-count">{commits.length}</span>
          </div>

          {commits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">&lt;/&gt;</div>
              <h3>История пока пуста</h3>
              <p>
                Добавь первый коммит, чтобы начать собирать историю своего дня.
              </p>
            </div>
          ) : (
            <div className="commit-list">
              {commits.map((commit) => {
                const categoryLabel =
                  categories.find((item) => item.id === commit.category)?.label ??
                  'Другое'

                return (
                  <article className="commit-card" key={commit.id}>
                    <div className={`commit-marker marker-${commit.category}`}>
                      <span>✓</span>
                    </div>

                    <div className="commit-body">
                      <div className="commit-topline">
                        <span className={`category-label label-${commit.category}`}>
                          {categoryLabel}
                        </span>
                        <time>{formatTime(commit.createdAt)}</time>
                      </div>

                      <h3>{commit.message}</h3>

                      {commit.tags.length > 0 && (
                        <div className="tag-list">
                          {commit.tags.map((tag) => (
                            <span className="tag" key={tag}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="commit-duration">
                        <span>◷</span> {formatDuration(commit.duration)}
                      </div>
                    </div>

                    <button
                      className="delete-button"
                      type="button"
                      onClick={() => deleteCommit(commit.id)}
                      aria-label={`Удалить запись: ${commit.message}`}
                      title="Удалить коммит"
                    >
                      ×
                    </button>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <footer className="footer">
          <span className="footer-dot" />
          GitLife <span>·</span> Маленькие шаги тоже имеют значение.
        </footer>
      </div>
    </main>
  )
}

export default App