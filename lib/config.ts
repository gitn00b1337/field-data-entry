import { generateUUID } from './utils';

export type FormConfig = {
    id: string;
    name: string;
    description: string;
    screens: FormScreenConfig[];
    position: number;
    imgSrc: string;
    /**
     * Configured actions to perform based on conditions set.
     */
    triggers: FormTrigger[];
}

export type FormScreenConfig = {
    /**
     * Unique (per form) key for this screen.
     */
    key: string;
    /**
     * The title of this screen
     */
    title: string;
    /**
     * The label for the "next" button. If the screen is the last in the form,
     * then the next button is not shown and the complete entry button is shown.
     */
    nextBtnLabel: string;
    /**
     * The position of the screen within the form
     */
    position: number;
    /**
     * Each screen has rows of fields
     */
    rows: FormRow[];
}

export type FormActionType = 'LOOP';
export type FormActionCondition = 'ALL_SET';

/**
 * Very simple form triggers which simply do something when
 * all fields for the specified rows have a value. 
 */
export type FormTrigger = {
    /**
     * Screen key. Multi-screen triggers not supported.
     */
    screen: string;
    /**
     * Row keys for this trigger.
     */
    rows: string[];
    /**
     * Type of action to perform.
     */
    action: FormActionType;
    /**
     * POC, simple condition type.
     */
    condition: FormActionCondition;
}

export type FormRow = {
    /**
     * Unique (per form) key for this row.
     */
    key: string;
    /**
     * The fields for a given row.
     */
    fields: FormFieldConfig[];
}

export type FormFieldConfig = {
    /**
     * Unique (per form) key for this row.
     */
    key: string;
    label: string;
    type: FormFieldType;
    options: FormFieldOptionConfig[];
    /**
     * Name of the form component for formik e.g. screens[1].rows[0].fields[2]
     */
    name: string;
    /**
     * Whether the field can have multiple selections (SELECT, TIMER)
     */
    multiSelect: boolean;
}

export type FormEntryFieldType = 'TEXT' | 'WHOLE_NUMBER' | 'SELECT' | 'TIMER' | '' | 'NUMERIC';
export type FormBackgroundFieldType = 'BG_TIMER';
export type FormFieldType = FormEntryFieldType | FormBackgroundFieldType;

export type FormFieldOptionConfig = {
    label: string;
    value: string;
    position: number;
    onChangeAction: FormFieldOnChangeAction;
}

export type FormFieldOnChangeAction = 'NONE' | 'CREATE_BLANK';

export function createFormRow({
    fields = [],
}: {
    fields?: FormFieldConfig[]
}): FormRow {
    return {
        key: generateUUID(),
        fields,
    };
}

export function createFieldConfig({
    name,
    type,
    label,
}: { 
    name: string;
    type: FormFieldType;
    label?: string;
}): FormFieldConfig {
    return {
        type,
        label: label || '',
        options: [],
        name,
        multiSelect: false,
        key: generateUUID(),
    };
}

export function createFieldOption(): FormFieldOptionConfig {
    return {
        label: '', 
        value: '', 
        position: 0, 
        onChangeAction: 'NONE',
    }
}

export function createFormScreenConfig({
    title,
    position,
    rows = [],
    nextBtnLabel = 'Next',
}: {
    title: string;
    position: number;
    rows?: FormRow[];
    nextBtnLabel?: string;
}): FormScreenConfig {
    return {
        title,
        position,
        rows,
        nextBtnLabel,
        key: generateUUID(),
    }
}

export function createFormConfig(): FormConfig {
    return {
        id: '',
        name: '',
        description: '',
        screens: [],
        position: 0,
        imgSrc: '',
        triggers: [],
    };
}

export function createTrigger(screen: string): FormTrigger {
    return {
        screen,
        rows: [],
        action: 'LOOP',
        condition: 'ALL_SET',
    };
}

