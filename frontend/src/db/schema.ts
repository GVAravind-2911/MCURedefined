import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('username').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: text('created_at')
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
  likedList: text('likedList').$defaultFn(() => JSON.stringify([])),
  watchedList: text('watchedList').$defaultFn(() => JSON.stringify([])),
  watchlist: text('watchList').$defaultFn(() => JSON.stringify([])),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert