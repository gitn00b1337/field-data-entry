import { FormConfig, FormFieldConfig, } from "./config"

export type Form = {
    config: FormConfig;
    entry: FormEntry
}

export type FormEntry = {
    [fieldName: string]: string
}

export function createForm(config: FormConfig, entry?: FormEntry): Form {    
    return {
        config,
        entry,
    };
}

/**
 * Builds the initial values for the form from the config. 
 * @param form The form to get initial values form
 * @returns The form entry for formik
 */
export function getEntryInitialValues(form: Form, previousEntry: FormEntry = {}) {
    let entry: FormEntry = {};
    
    for (const screen of form.config.screens) {
        for (const row of screen.rows) {
            for (const field of row.fields) {
                entry[field.name] = previousEntry[field.name] || '';
            }
        }
    }
    
    return entry;
}

export type ParsedFormEntry = {
    [fieldName: string]: any
}

/**
 * Forms are easily made dirty and type unsafe so this helper method
 * corrects the types
 */
export function parseForm(form: Form): ParsedFormEntry {
    let parsedEntry: ParsedFormEntry = {};
    
    for (const screen of form.config.screens) {
        for (const row of screen.rows) {
            for (const field of row.fields) {
                const entry = form.entry[field.name];
                parsedEntry[field.name] = parseField(field, entry);
            }
        }
    }
    
    return parsedEntry;
}

export function parseField(field: FormFieldConfig, entry: string) {
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