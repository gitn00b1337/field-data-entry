import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";
import { SQLError, SQLResultSet, SQLTransaction } from "expo-sqlite";
import { FormConfig } from "./config";
import { sanitizeConfig } from "./form";
import { Migration, getPendingMigrations } from "./database-migrations";

// export type DbActionKey = keyof typeof dbActions;

let databaseCreated = false;
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

                function onTransactionError(error: SQLError) {
                    const reason = error?.message || 'An error occured creating a transaction.';
                    console.error(reason);
                    reject(reason);
                }
        
                function onTransactionSuccess() {
                    console.log('Transaction success.')
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
            console.log('Transaction success.')
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
            console.log('Transaction success.')
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

async function createDatabase() {
    creating = Promise.all([
        createConfigTableIfNotExists(),
        createMigrationTableIfNotExists(),
    ]);

    await creating;

    await migrateDatabase();

    databaseCreated = true;
    console.log('Database created')

    return creating;
}

function openDatabase() {
    if (Platform.OS === "web") {
        throw new Error(`Web not supported.`);
    }

    return SQLite.openDatabase(DB_NAME);
}

// type DispatchDbAction = <T extends DbActionKey>(actionIdentifier: T, payload?: Parameters<typeof dbActions[T]>) => any;

// export const useDatabase = (): [DbTransaction, DispatchDbAction] => {
//     const dispatch: DispatchDbAction = (actionIdentifier, payload) => {
//         const action = dbActions[actionIdentifier];

//         if (typeof action !== 'function') {
//             throw new Error(`Invalid db action ${action}`);
//         }

//         return action.apply(this, ...payload);
//     }

//     try {
//         return [runTransaction, dispatch];
//     }
//     catch {
//         throw new Error(`Unable to set up database, storage not supported!`);
//     }
// }

// open the database connection - one global connection

const database = openDatabase();
// create the tables. queries shouldnt run until tables have been created/migrated
createDatabase()
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

export function deleteConfiguration(config: FormConfig) {
    if (!config.id) {
        throw new Error(`Configuration cannot be deleted. It must have an ID!`);
    }

    const sql = `
        delete from configs
        where id = ?
    `;

    return runTransaction(sql, [ config.id ]);
}

export function loadConfiguration(configId: string): Promise<FormConfig | undefined> {
    if (!configId) {
        throw new Error(`No config id provided. Cannot load configuration!`);
    }

    const params = [ configId ];
    const sql = `SELECT * FROM configs WHERE id = ? LIMIT 1;`;

    return runTransaction(sql, params)
        .then(result => {
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
        })
        .catch(e => {
            console.error(e);
            return undefined;
        });
}

export type ConfigurationOverview = {
    id: string;
    name: string;
    updatedAt: string;
}

export function getConfigurations(): Promise<ConfigurationOverview[]> {
    const params = [];
    const sql = `SELECT id, name, updatedAt FROM configs;`;

    return runTransaction(sql, params)
        .then(result => {
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
        });
}

function createMigrationTableIfNotExists() {
    const sql = `CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER primary key not null,
        lastRunIndex integer not null
    );`;

    return createTable('migrations', sql)
        .then(() => {
            runTransaction(`INSERT INTO migrations(lastRunIndex) values (0);`)
            .catch(e => {
                console.error('An error occured adding migration info.');
                console.error(e);
            })
        });
}


function getMigrationIndex() {
    const sql = `SELECT * FROM migrations LIMIT 1;`;
    
    return runTransactionDangerous(sql)
        .then(result => {
            const row = result.rows.item(0);

            if (!row) {
                throw new Error(`No migration data found!`);
            }

            return row.lastRunIndex;
        })
        .catch(e => {
            console.error('An error occured getting migration index!');
            throw e;
        })
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