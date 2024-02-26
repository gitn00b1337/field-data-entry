import { FieldArrayRenderProps } from "formik";
import { FormEntryRow, FormEntryScreen, FormEntryV2, FormFieldV2, FormTrigger } from "./config";
import { generateUUID } from "./utils";

export type HandleTriggersOnFieldChangeProps = {
    form: FormEntryV2;
    fieldKey: string;
    rowArrayHelper: FieldArrayRenderProps;
    screenIndex: number;
    rowIndex: number;
}

/**
 * Checks for triggers affected by the field change
 * and runs any that need to be actioned.
 */
export function handleTriggersOnFieldChange({
    form,
    fieldKey,
    rowArrayHelper,
    screenIndex,
    rowIndex,
}: HandleTriggersOnFieldChangeProps) {
    const screen = form.screens[screenIndex];
    const row = screen?.rows[rowIndex];

    const triggers = getFieldChangeTriggers(screen, fieldKey);

    console.log(`handleTriggersOnFieldChange: ${triggers.length} triggers detected`);
    const field = row.fields.find(f => f.key === fieldKey);
    console.log('FIELD')
    console.log(field);

    triggers.forEach(t => runTrigger(form, t, rowArrayHelper, screen, rowIndex));
}

function triggerHasFieldKey(trigger: FormTrigger, fieldKey: string) {
    // no field trigger means all fields in the row(s)
    if (trigger?.fields?.length === 0) {
        return true;
    }

    return trigger?.fields?.includes(fieldKey) || false;
}

/**
 * Checks if the trigger has met it's criteria to "trigger" when a field value has changed.
 * @param entry The current form values entered by the user.
 * @param trigger The form trigger to check.
 * @returns Whether the trigger conditions are satisfied.
 */
function triggerConditionsSatisfied(entry: FormEntryV2, trigger: FormTrigger, triggerRows: FormEntryRow[]): boolean {
    // only one condition type atm - all fields filled in.
    console.log('triggerConditionsSatisfied: all fields required.')

    // if no value, returns false
    return !triggerRows.find(row => {
        return row?.fields?.find(field => {
            if (trigger.fields.length && !trigger.fields.includes(field.key)) {
                console.log(`triggerConditionsSatisfied: field ${field.name} not required.`);
                return false;
            }

            const hasNoVal = !entry.values[field.entryKey];
            console.log(`triggerConditionsSatisfied: ${field.name} has ${hasNoVal ? 'no' : ''} value`);
            // console.log(entry.values)
            return hasNoVal;
        });
    })
}

/**
 * Checks if the field has any related triggers
 * @param entry The form entry
 * @param screen The current form screen
 * @param fieldKey The key of the field which changed value
 * @returns Any triggers that are ready to be run
 */
function getFieldChangeTriggers(screen: FormEntryScreen, fieldKey: string) {
    return screen.triggers.filter(trigger => 
        triggerHasFieldKey(trigger, fieldKey)
    );
}

/**
 * Checks trigger conditions and performs the action configured if the conditions are met. 
 */
function runTrigger(form: FormEntryV2, trigger: FormTrigger, rowArrayHelper: FieldArrayRenderProps, screen: FormEntryScreen, rowIndex: number) {
    // only one action type atm - COPY ROWS
    // firstly check there isnt already a copy of this row in the form (a row with the same key below this row)
    // if there is, stop
    // if there isn't, copy.
    const row = screen.rows[rowIndex];
    console.log(`rowIndex: ${rowIndex}`)

    const triggerRows = getRowsForTrigger(screen, trigger, row);

    if (!triggerRows.length) {
        console.log(`runTrigger: No trigger rows.`);
        return;
    }

    if (!triggerConditionsSatisfied(form, trigger, triggerRows)) {
        console.log(`Trigger conditions not satisfied.`);
        return;
    }

    // const copyToPosition = rowIndex + triggerRows.length;
    // const copyAtPos = screen.rows[copyToPosition];

    // if (copyAtPos && copyAtPos.copyTrigger === row.copyTrigger) {
    //     console.log('Copy already exists.');
    //     return;
    // }
    

    const lastRowCopy = getLastRowCopy(screen, row, trigger.key);
    console.log('lastRowCopy:')
    console.log(lastRowCopy)

    console.log(`firstRowCopyIndex: ${row.copyIndex}`)
    if (lastRowCopy > row.copyIndex) {
        console.log(`runTrigger: Has higher row copy index in form.`);
        return;
    }

    console.log(`Copying ${triggerRows.length} rows`);

    for (const row of triggerRows) {
        console.log('runTrigger: Copying row');
        const copy = copyRow(row, lastRowCopy, trigger);
        // todo add form values in for these entry keys
        // console.log(copy);
        rowArrayHelper.push(copy);
    }
}

function getRowsForTrigger(screen: FormEntryScreen, trigger: FormTrigger, row: FormEntryRow): FormEntryRow[] {
    if (!screen) {
        return [];
    }

    console.log('Row:')
    console.log(row)

    return trigger.rows
        .map(rowKey => 
            screen.rows.find(r => 
                r.key === rowKey 
                && r.copyIndex === row.copyIndex
                && r.copyTrigger === row.copyTrigger
            )
        )
        .filter(r => !!r);
}

function copyRow(row: FormEntryRow, lastRowCopy: number, trigger: FormTrigger): FormEntryRow {
    return {
        ...row,
        copyIndex: lastRowCopy + 1,
        copyTrigger: trigger.key,
        fields: row.fields.map<FormFieldV2>(f => {
            return {
                ...f,
                entryKey: generateUUID(),
            }
        })
    }
}

function getLastRowCopy(screen: FormEntryScreen, row: FormEntryRow, triggerKey: string): number {
    let copyIndex = 0;

    for (const screenRow of screen.rows) {
        if (   screenRow.key !== row.key 
            || screenRow.copyTrigger !== triggerKey
            || screenRow.copyIndex < copyIndex
        ) {
            continue;
        }

        copyIndex = screenRow.copyIndex;
    }

    console.log(`copyIndex: ${copyIndex}`)
    return copyIndex;
}