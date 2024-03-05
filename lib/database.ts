import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";
import { SQLError, SQLResultSet, SQLTransaction } from "expo-sqlite";
import { FormConfig, FormEntryV2 } from "./config";
import { sanitizeConfig } from "./form";
import { Migration, getPendingMigrations } from "./database-migrations";
import moment from "moment";

let creating: Promise<any>;

const DB_NAME = "fielddb.db";

export type DbTransaction = (sql: string, params?: any[]) => Promise<SQLResultSet>;

/**
 * Transforms callback into promise version of expo sqlite db transactions.
 * NB: waits for tables to be created before running
 * @param sql SQL command string
 * @param params Any params required for the sql
 * @returns Promise of the result set
 */
const runTransaction: DbTransaction = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        return creating
            .then(() => {
                console.log('DB created, running transaction...')
                
                function onComplete(_: SQLTransaction, resultSet: SQLResultSet) {
                    console.log('Transaction complete')
                    return resolve(resultSet);
                }

                function onError(_: SQLTransaction, error: SQLError) {
                    reject(error?.message || 'An error occured running a transaction query.');
                    return true; // return true to rollback
                }

                try {
                    database.transaction((tx) => {
                        tx.executeSql(sql, params, onComplete, onError)
                    })
                }
                catch (e) {
                    console.error(e);
                    return reject(e?.message || `An error ocurred running ${sql}`);
                }
            })
            .catch((reason) => {
                console.error(reason);
                reject(reason)
            });
    });
}

/**
 * Transforms callback into promise version of expo sqlite db transactions.
 * NB: DOES NOT WAIT for tables to be created before running
 * @param sql SQL command string
 * @param params Any params required for the sql
 * @returns Promise of the result set
 */
const runTransactionDangerous: DbTransaction = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        console.log('DB created, running transaction...')
        
        function onComplete(_: SQLTransaction, resultSet: SQLResultSet) {
            console.log('Transaction complete')
            return resolve(resultSet);
        }

        function onError(_: SQLTransaction, error: SQLError) {
            reject(error?.message || 'An error occured running a transaction query.');
            return true; // return true to rollback
        }

        function onTransactionError(error: SQLError) {
            const reason = error?.message || 'An error occured creating a transaction.';
            console.error(reason);
            reject(reason);
        }

        function onTransactionSuccess() {
            console.log('runTransactionDangerous: Transaction success.')
        }

        try {
            database.transaction((tx) => {
                tx.executeSql(sql, params, onComplete, onError)
            }, onTransactionError, onTransactionSuccess)
        }
        catch (e) {
            console.error(e);
            return reject(e?.message || `An error ocurred running ${sql}`);
        }
    });
}

function createTable(name: string, sql: string, params?: any[]): Promise<SQLite.SQLResultSet> {
    return new Promise((resolve, reject) => {
        function onComplete(_: SQLTransaction, resultSet: SQLResultSet) {
            console.log(`Table ${name} created.`)
            return resolve(resultSet);
        }

        function onError(_: SQLTransaction, error: SQLError) {
            console.error(`An error occured creating table ${name}. ${error.message}`);
            reject(error.message);
            return true; // return true to rollback
        }

        function onTransactionError(error: SQLError) {
            const reason = error?.message || 'An error occured creating a transaction.';
            console.error(reason);
            reject(reason);
        }

        function onTransactionSuccess() {
            console.log('createTable: Transaction success.')
        }

        try {
            console.log('Running transaction')
            database.transaction((tx) => {
                tx.executeSql(sql, params, onComplete, onError)
            }, onTransactionError, onTransactionSuccess)
        }
        catch (e) {
            console.error(e);
            return reject(e?.message || `An error ocurred running ${sql}`);
        }
    })
}

function createConfigTableIfNotExists() {
    const query = `
        create table if not exists configs (
            id INTEGER primary key not null,
            name text not null,
            config text not null
        );
    `;

    return createTable('configs', query);
}

function createDatabase() {
    creating = Promise.all([
        createConfigTableIfNotExists(),
        createMigrationTableIfNotExists(),
    ])
    .then(migrateDatabase);

    return creating;
}

function openDatabase() {
    if (Platform.OS === "web") {
        throw new Error(`Web not supported.`);
    }

    return SQLite.openDatabase(DB_NAME);
}

const database = openDatabase();

// create the tables. queries shouldnt run until tables have been created/migrated
createDatabase()
    .then(() => console.log('Database created.'))
    .catch(e => {
        console.error(e);
    });

function createConfiguration(config: FormConfig): Promise<SQLite.SQLResultSet> {
    const params = [
        config.name,
        JSON.stringify(config),
    ]

    const sql = `INSERT OR IGNORE INTO configs (name, config)
        values (?, ?);
    `;

    console.log('Creating configuration...')
    return runTransaction(sql, params);
}

function updateConfiguration(config: FormConfig): Promise<SQLite.SQLResultSet> {
    if (!config.id) {
        throw new Error(`Configuration cannot be updated. It must have an ID!`);
    }

    console.log('Updating configuration...')
    console.log(config.id)
    
    const sql = `
        update configs 
        set name = ?,
            config = ?
        where id = ?;
    `;

    const params = [
        config.name,
        JSON.stringify(config),
        config.id
    ];

    return runTransaction(sql, params);
}

export function saveConfiguration(config: FormConfig): Promise<SQLite.SQLResultSet> {
    if (config.id) {
        return updateConfiguration(config);
    }
    else {
        return createConfiguration(config);
    }
}

function updateEntry(entry: FormEntryV2): Promise<SQLite.SQLResultSet> {
    if (!entry.id) {
        throw new Error(`Configuration cannot be updated. It must have an ID!`);
    }

    const withUpdatedTS: FormEntryV2 = {
        ...entry,
        updatedAt:  moment().utc().toISOString(),
    };

    console.log('Updating entry...')
    console.log(withUpdatedTS.id)
    
    const sql = `
        update entries
        set name = ?,
            entry = ?,
            configId = ?,
            updatedAt = ?
        where id = ?;
    `;

    const params = [
        withUpdatedTS.config.name,
        JSON.stringify(withUpdatedTS),
        withUpdatedTS.config.id,
        withUpdatedTS.updatedAt,
        withUpdatedTS.id,
    ];

    return runTransaction(sql, params);
}

function createEntry(entry: FormEntryV2): Promise<SQLite.SQLResultSet> {
    const params = [
        entry.config.name,
        JSON.stringify(entry),
        entry.config.id,
        entry.createdAt,
        entry.updatedAt,
    ];

    const sql = `INSERT OR IGNORE INTO entries (name, entry, configId, createdAt, updatedAt) values (?, ?, ?, ?, ?)`;

    return runTransaction(sql, params);
}

export async function saveEntry(entry: FormEntryV2): Promise<number> {
    if (!entry) {
        throw new Error(`No entry provided!`);
    }
    else if (entry.id) {
        await updateEntry(entry);
        return entry.id;
    }
    else {
        const resultSet = await createEntry(entry);
        return resultSet.insertId;
    }
}

export function deleteConfiguration(config: FormConfig) {
    if (!config.id) {
        throw new Error(`Configuration cannot be deleted. It must have an ID!`);
    }

    const sql = `
        delete from configs
        where id = ?
    `;

    console.log('Deleting configuration...')
    return runTransaction(sql, [ config.id ]);
}

export function deleteEntry(entry: FormEntryV2) {
    if (!entry.id) {
        throw new Error(`Form entry cannot be deleted. It must have an ID!`);
    }

    return deleteEntryById(entry.id);
}

export function deleteEntryById(id: number) {
    const sql = `
        delete from entries
        where id = ?
    `;

    console.log('Deleting entry...')
    return runTransaction(sql, [ id ]);
}

export async function loadConfiguration(configId: string): Promise<FormConfig | undefined> {
    if (!configId) {
        throw new Error(`No config id provided. Cannot load configuration!`);
    }

    const params = [ configId ];
    const sql = `SELECT * FROM configs WHERE id = ? LIMIT 1;`;

    try {
        const result = await runTransaction(sql, params);
        const row = result.rows.item(0);
        const config = row?.config ? JSON.parse(row.config) : undefined;
        
        if (config) {
            // first save isnt quite accurate, but since
            // its not exposed can just correct the id here
            config.id = row.id;
        }            

        if (!config) {
            return config;
        }
        
        return sanitizeConfig(config);
    }
    catch (e) {
        console.error(e);
        return undefined;
    }
}

export async function loadEntry(entryId: string): Promise<FormEntryV2 | undefined> {
    if (!entryId) {
        throw new Error(`No entry id provided. Cannot load entry!`);
    }

    const params = [ entryId ];
    const sql = `SELECT * FROM entries WHERE id = ? LIMIT 1;`;

    try {
        const result = await runTransaction(sql, params);
        const row = result.rows.item(0);
        const entry = row?.entry ? JSON.parse(row.entry) : undefined;

        if (entry) {
            // first save isnt quite accurate, but since
            // its not exposed can just correct the id here
            entry.id = row.id;
        }
        return entry;
    } catch (e) {
        console.error(e);
        return undefined;
    }
}

export type ConfigurationOverview = {
    id: number;
    name: string;
    updatedAt: string;
}

export type EntriesOverview = {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export async function getConfigurations(): Promise<ConfigurationOverview[]> {
    const params = [];
    const sql = `SELECT id, name, updatedAt FROM configs ORDER BY createdAt DESC;`;
    
    const result = await runTransaction(sql, params);
    let mapped: ConfigurationOverview[] = [];
    for (let i = 0; i < result.rows.length; i++) {
        const item = result.rows.item(i);

        if (!item) {
            continue;
        }

        mapped.push({
            id: item.id,
            name: item.name,
            updatedAt: item.updatedAt,
        });
    }
    return mapped;
}

export async function getEntries(configId: number): Promise<EntriesOverview[]> {
    const params = [ configId ];
    const sql = `SELECT id, name, createdAt, updatedAt FROM entries WHERE configId = ? ORDER BY createdAt DESC;`;
    
    const result = await runTransaction(sql, params);
    let mapped: EntriesOverview[] = [];
    for (let i = 0; i < result.rows.length; i++) {
        const item = result.rows.item(i);

        if (!item) {
            continue;
        }

        mapped.push({
            id: Number(item.id),
            name: item.name,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        });
    }
    return mapped;
}

function createMigrationTableIfNotExists() {
    const sql = `CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER primary key not null,
        lastRunIndex integer not null
    );`;

    return createTable('migrations', sql)
        .then(() => {
            runTransaction(`INSERT INTO migrations(lastRunIndex) SELECT 0 WHERE NOT EXISTS (SELECT 1 FROM migrations);`)
                .then((value: SQLite.SQLResultSet) => {
                    console.log('Migration rows inserted:')
                    console.log(value.rows);
                })
                .catch(e => {
                    console.error('An error occured adding migration info.');
                    console.error(e);
                });
        })
        .catch(e => {
            console.error('An error occured creating the migrations table.');
            console.error(e);
        });
}

async function getMigrationIndex() {
    const sql = `SELECT * FROM migrations LIMIT 1;`;
    
    try {
        const result = await runTransactionDangerous(sql);
        const row = result.rows.item(0);

        if (!row) {
            throw new Error(`No migration data found!`);
        }
        return row.lastRunIndex;
    } catch (e) {
        console.error('An error occured getting migration index!');
        throw e;
    }
}

function updateMigrationIndex(lastRanMigrationIndex: number) {
    const sql = `UPDATE migrations SET lastRunIndex = ?;`;
    const params = [ lastRanMigrationIndex ];

    return runTransactionDangerous(sql, params);
}

async function runMigrations(migrations: Migration[]): Promise<number> {
    let count = 0;

    try {
        for (const { sql, params, } of migrations) {
            console.log('Running migration.')
    
            await runTransactionDangerous(sql, params);
            count = count + 1;             
        }
    }
    catch (e) {        
        // handled above.
        return count;
    }

    return count;
}

async function migrateDatabase() {
    try {
        console.log('Migrating db...')
        const index = await getMigrationIndex();
        console.log(`Migration index: ${index}`);

        const migrations = getPendingMigrations(index);
        console.log(migrations);
        const migrationsRan = await runMigrations(migrations);

        if (migrationsRan > 0) {
            console.log(`Updating migration index to ${index + migrationsRan}`);
            await updateMigrationIndex(index + migrationsRan);
        }        

        if (migrationsRan !== migrations.length) {
            throw new Error(`An error occured running migration ${index + migrationsRan}`)
        }

        console.log('DB migrations complete.');
    }
    catch (e) {
        console.error(e);
    }
}