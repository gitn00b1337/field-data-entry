// import { FormConfig, FormEntryV2, FormEntryValues, FormFieldConfig, FormRow, FormScreenConfig, FormTrigger } from "./config";
// import { generateUUID } from "./utils";

// export type HandleTriggersOnFieldChangeProps = {
//     fieldKey: string;
//     screenIndex: number;
//     onAddRow: (index: number, row: FormRow) => void;
//     form: FormEntryV2;
//     rowKey: string;
//     copyIndex: number;
// }

// /**
//  * Checks for triggers affected by the field change
//  * and runs any that need to be actioned.
//  */
// export function handleTriggersOnFieldChange({
//     form,
//     fieldKey,
//     screenIndex,
//     rowKey,
//     copyIndex,
//     onAddRow,
// }: HandleTriggersOnFieldChangeProps) {
//     const {
//         config,
//         values,
//     } = form;

//     const screen = config.screens[screenIndex];
//     const triggers = getFieldChangeTriggers(screen, fieldKey);

//     triggers.forEach(t => runTrigger(values, config, t, screen, rowKey, copyIndex, onAddRow));
// }

// function triggerHasFieldKey(trigger: FormTrigger, fieldKey: string) {
//     // no field trigger means all fields in the row(s)
//     if (trigger?.fields?.length === 0) {
//         return true;
//     }

//     return trigger?.fields?.includes(fieldKey) || false;
// }

// /**
//  * Checks if the trigger has met it's criteria to "trigger" when a field value has changed.
//  * @param entry The current form values entered by the user.
//  * @param trigger The form trigger to check.
//  * @returns Whether the trigger conditions are satisfied.
//  */
// function triggerConditionsSatisfied(entry: FormEntryValues, config: FormConfig, trigger: FormTrigger, triggerRows: FormRow[]): boolean {
//     // only one condition type atm - all fields filled in.
//     for (let row of triggerRows) {
//         const checkAllFields = trigger.fields.length === 0;

//         for (let field of row.fields) {        
//             if (!checkAllFields && trigger.fields.indexOf(field.id) === -1) {
//                 continue;
//             }

//             const entryVal = entry[field.entryKey];
//             const hasNoVal = field.type !== 'CHECKBOX' && (typeof entryVal?.value === 'undefined' || entryVal?.value === '');
//             console.log(`triggerConditionsSatisfied: ${field.name} has ${hasNoVal ? 'no' : ''} value`);

//             if (hasNoVal) {
//                 return false;
//             }
//         }
//     }

//     return true;
// }

// /**
//  * Checks if the field has any related triggers
//  * @param entry The form entry
//  * @param screen The current form screen
//  * @param fieldKey The key of the field which changed value
//  * @returns Any triggers that are ready to be run
//  */
// function getFieldChangeTriggers(screen: FormScreenConfig, fieldKey: string) {
//     return screen.triggers.filter(trigger => 
//         triggerHasFieldKey(trigger, fieldKey)
//     );
// }

// /**
//  * Checks trigger conditions and performs the action configured if the conditions are met. 
//  */
// function runTrigger(
//     entry: FormEntryValues, 
//     config: FormConfig, 
//     trigger: FormTrigger, 
//     screen: FormScreenConfig, 
//     rowKey: string, 
//     copyIndex: number, 
//     onAddRow: (rowIndex: number, row: FormRow) => void
// ) {
//     // only one action type atm - COPY ROWS
//     // firstly check there isnt already a copy of this row in the form (a row with the same key below this row)
//     // if there is, stop
//     // if there isn't, copy.
//     const rowIndex = screen.rows.findIndex(r => r.id === rowKey && r.copyIndex === copyIndex);
//     const row = screen.rows[rowIndex];
//     const rowCopyIndex = row?.copyIndex || 0;
//     console.log(`rowIndex: ${rowIndex}`)

//     const triggerRows = getRowsForTrigger(screen, trigger, row);

//     if (!triggerRows.length) {
//         console.log(`runTrigger: No trigger rows.`);
//         return;
//     }

//     if (!triggerConditionsSatisfied(entry, config, trigger, triggerRows)) {
//         console.log(`Trigger conditions not satisfied.`);
//         return;
//     }

//     const lastRowCopy = getLastRowCopy(screen, row, trigger.key);
//     console.log(`lastRowCopy: ${lastRowCopy}`);
//     console.log(`rowCopyIndex: ${rowCopyIndex}`)

//     if (lastRowCopy > rowCopyIndex) {
//         console.log(`runTrigger: Has higher row copy index in form.`);
//         return;
//     }

//     console.log(`Copying ${triggerRows.length} rows`);

//     let i = rowIndex + 1;
//     for (const row of triggerRows) {
//         console.log('runTrigger: Copying row');
//         const copy = copyRow(row, lastRowCopy, trigger);
//         // todo add form values in for these entry keys
//         onAddRow(i, copy);
//         i++;
//     }
// }

// function getRowsForTrigger(screen: FormScreenConfig, trigger: FormTrigger, row: FormRow): FormRow[] {
//     if (!screen) {
//         return [];
//     }

//     return trigger.rows
//         .map(id => 
//             screen.rows.find(r => 
//                 r.id === id 
//                 && r.copyIndex === row.copyIndex
//                 && r.copyTrigger === row.copyTrigger
//             )
//         )
//         .filter(r => !!r);
// }

// function copyRow(row: FormRow, lastRowCopy: number, trigger: FormTrigger): FormRow {
//     return {
//         ...row,
//         copyIndex: (lastRowCopy || 0) + 1,
//         copyTrigger: trigger.key,
//         fields: row.fields.map<FormFieldConfig>(f => {
//             return {
//                 ...f,
//                 entryKey: generateUUID(),
//             }
//         })
//     }
// }

// function getLastRowCopy(screen: FormScreenConfig, row: FormRow, triggerKey: string): number {
//     const indexes = screen.rows
//         .filter(r => r.id === row.id && (row.copyTrigger === row.copyTrigger || !row.copyTrigger))
//         .map(r => r.copyIndex);

//     return Math.max(...indexes);
// }