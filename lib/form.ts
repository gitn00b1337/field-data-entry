import { FormConfig, FormFieldV2, } from "./config"
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

    let newConfig: FormConfig = {
        ...config,
        screens: config.screens?.filter(s => !!s) || [],
    }

    for (const screen of newConfig.screens) {
        screen.rows = screen.rows?.filter(r => !!r) || [];
        screen.key = screen.key || generateUUID();
        screen.triggers = screen.triggers?.filter(t => !!t) || [];

        for (const row of screen.rows) {
            row.fields = row.fields?.filter(f => !!f) || [];
            row.key = row.key || generateUUID();

            for (const field of row.fields) {
                field.key = field.key || generateUUID();
            }
        }
    }

    newConfig.globalFields = newConfig.globalFields || [];
    
    return newConfig;
}

// /**
//  * Forms are easily made dirty and type unsafe so this helper method
//  * corrects the types
//  */
// export function parseForm(form: Form): ParsedFormEntry {
//     let parsedEntry: ParsedFormEntry = {};
    
//     for (const screen of form.config.screens) {
//         for (const row of screen.rows) {
//             for (const field of row.fields) {
//                 const entry = form.entry[field.name];

//                 if (Array.isArray(entry)) {
//                     parsedEntry[field.name] = parsedEntry[field.name] || [];

//                     for (const item of entry) {
//                         const value = parseField(field, item.value);

//                         parsedEntry[field.name].push({
//                             value,
//                             index: 0,
//                         })    
//                     }
//                 }
//             }
//         } 
//     }
    
//     return parsedEntry;
// }

export function parseField(field: FormFieldV2, entry: string) {
    switch (field.type) {
        case 'WHOLE_NUMBER': return parseWholeNumber(entry);
        case 'NUMERIC': return parseNumber(entry);
        
        default: return entry;
    }
}

export function parseNumber(val: string) {
    return Number(val);
}

export function parseWholeNumber(val: string) {
    return Math.round(Number(val));
}