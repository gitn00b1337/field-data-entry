import { useGlobalSearchParams, } from "expo-router";
import { useEffect, useState } from "react";
import { FieldEntry, FormEntry, FormEntryV2, FormEntryValues, TimerEntryMeta, createFieldEntry } from "../../lib/config";
import { StyleSheet } from "react-native";
import { loadEntry, } from "../../lib/database";
import { EntryForm, LoadingState } from "./form";

export type LoadedEntry = {
    data?: FormEntryV2;
    state: LoadingState;
    error?: string;
}

function withPausedTimers(entry: FormEntryV2): FormEntryV2 {
    const keys = entry.globalFields?.filter(f => f.type === 'TIMER').map(f => f.entryKey);

    const newVals: FormEntryValues = keys
        .map(key => {
            const entryVal = entry.values[key];

            if (!entryVal) {
                const value = createFieldEntry();
                return { key, value };
            }
            else {
                const meta: TimerEntryMeta = {
                    state: 'STOPPED',
                    lastValue: entryVal.meta?.lastValue || 0,
                    history: [ ...(entryVal.meta?.history || [] ) ],
                };

                const value: FormEntry = {
                    ...entryVal,
                    meta
                };

                return { key, value };
            }
        })
        .reduce((obj, kv) => {
            if (!kv) {
                return obj;
            }

            const { key, value } = kv;
            
            return {
                ...obj,
                [key]: value,
            };
        }, {});

    return {
        ...entry,
        values: {
            ...entry.values,
            ...newVals
        }
    };
}

export default function UpdateEntryScreen() {
    const params = useGlobalSearchParams();
    const entryId = params.id as string;
    const [loadedEntry, setLoadedEntry] = useState<LoadedEntry>({ state: 'LOADING' });

    useEffect(() => {
        console.log('Loading ')

        loadEntry(entryId)
            .then(result => {
                setLoadedEntry({
                    state: 'LOADED',
                    data: withPausedTimers(result),
                    error: '',
                })
            })
            .catch(e => {
                setLoadedEntry({
                    error: 'An error occured loading the configuration.',
                    state: 'ERROR',
                });
                console.error(`Error loading entry!`)
                console.error(e);        
            });
    }, []);

    return (
        <EntryForm
            entry={loadedEntry.data}
            state={loadedEntry.state}
            loadingError={loadedEntry.error}
        />
    );
}