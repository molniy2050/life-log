import Dexie, { type Table } from 'dexie'

export type Category =
	| 'feat'
	| 'work'
	| 'rest'
	| 'game'
	| 'chore'
	| 'scroll'
	| 'custom'

export interface LifeEvent {
	id: string
	category: Category
	message: string
	durationMinutes: number
	tags: string[]
	eventAt: string
	createdAt: string
}

class GitLifeDatabase extends Dexie {
	events!: Table<LifeEvent, string>

	constructor() {
		super('GitLifeDatabase')

		this.version(1).stores({
			events: 'id, category, eventAt, createdAt',
		})
	}
}

export const db = new GitLifeDatabase()