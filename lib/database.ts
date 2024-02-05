import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";
import { SQLError, SQLResultSet, SQLTransaction } from "expo-sqlite";
import { dbActions } from "./storage";
import { FormConfig } from "./config";

export type DbActionKey = keyof typeof dbActions;

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

function createConfigTableIfNotExists(db: SQLite.Database) {
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
        createConfigTableIfNotExists(database),
    ]);

    await creating;

    databaseCreated = true;
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

export function loadConfiguration(configId: string): Promise<FormConfig> {
    if (!configId) {
        throw new Error(`No config id provided. Cannot load configuration!`);
    }

    const params = [ configId ];
    const sql = `SELECT * FROM configs WHERE id = ? LIMIT 1`;

    return runTransaction(sql, params)
        .then(result => {
            const row = result.rows.item(0);
            const config =  row?.config;
            
            if (config) {
                // first save isnt quite accurate, but since
                // its not exposed can just correct the id here
                config.id = row.id;
            }            

            return config;
        });
}