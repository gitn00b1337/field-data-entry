import { generateUUID } from './utils';

export type FormConfig = {
    id: string;
    name: string;
    description: string;
    screens: FormScreenConfig[];
    position: number;
    imgSrc: string;
}

export type FormScreenConfig = {
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

export type FormRow = {
    /**
     * The fields for a given row.
     */
    fields: FormFieldConfig[];
}

export type FormFieldConfig = {
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
    };
}


