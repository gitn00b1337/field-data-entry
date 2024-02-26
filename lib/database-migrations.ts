import moment from 'moment';

export type Migration = {
    sql: string;
    params?: any[];
}

function Migration(sql: string, params: any[] = []): Migration {
    return { sql, params };
}

export function getPendingMigrations(currentVersionIndex: number) {
    return MIGRATIONS.slice(currentVersionIndex);
}

// never change the order of these.
const MIGRATIONS: Migration[] = [
    Migration('ALTER TABLE configs ADD COLUMN createdAt text;'),
    Migration('ALTER TABLE configs ADD COLUMN updatedAt text;'),
    Migration('UPDATE configs SET createdAt = ?;', [ moment().utc().toISOString() ]),
    Migration('UPDATE configs SET updatedAt = ?;', [ moment().utc().toISOString() ]),
    Migration('CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY NOT NULL, name text NOT NULL, entry text NOT NULL);', []),
    Migration('ALTER TABLE entries ADD COLUMN templateId INTEGER;', []),
    Migration('ALTER TABLE entries DROP COLUMN templateId;', []),
    Migration('ALTER TABLE entries ADD COLUMN configId INTEGER;', []),
    Migration(`ALTER TABLE entries ADD COLUMN createdAt TEXT;`, []),
    Migration(`ALTER TABLE entries ADD COLUMN updatedAt TEXT;`, []),

]