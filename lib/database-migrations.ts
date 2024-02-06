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
]

