import { FormConfig, } from "./config"
import { generateUUID } from "./utils";

export type ParsedFormEntry = {
    [fieldName: string]: {
        value: string | number | boolean;
        index: number;
    }[]
}

export function sanitizeConfig(config: FormConfig): FormConfig {
    if (!config) {
        throw new Error(`Cannot sanitize undefined config`);
    }

    const newConfig: FormConfig = {
        ...config,
        screens: config.screens?.filter(s => !!s) || [],
    }

    for (const screen of newConfig.screens) {
        screen.rows = screen.rows?.filter(r => !!r) || [];
        screen.key = screen.key || generateUUID();
        screen.triggers = screen.triggers?.filter(t => !!t) || [];

        for (const row of screen.rows) {
            row.fields = row.fields?.filter(f => !!f) || [];
            row.id = row.id || generateUUID();

            for (const field of row.fields) {
                field.id = field.id || generateUUID();
                field.exportable = typeof field.exportable === 'undefined' ? true : field.exportable;
                field.persistsCopy = typeof field.persistsCopy === 'undefined'? true : field.persistsCopy;
            }
        }
    }

    newConfig.globalFields = newConfig.globalFields || [];
    
    for (const field of newConfig.globalFields) {
        field.exportable = field.type !== 'PLAYBACK_BUTTON';
    }
    
    return newConfig;
}