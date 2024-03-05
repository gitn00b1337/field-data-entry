import moment from 'moment';
import { generateUUID } from './utils';

export type FormActionType = 'COPY_ROWS';
export type FormActionCondition = 'HAS_VALUE';
export type FormFieldOnChangeAction = 'NONE' | 'CREATE_BLANK';

export type FormFieldType = 'TEXT' | 'WHOLE_NUMBER' | 'SELECT' | 'MULTI_SELECT' | 'NUMERIC' | 'CHECKBOX' | 'TIMER';
export type GlobalFieldType = 'TIMER';

export type FormConfig = {
    id: number;
    name: string;
    description: string;
    screens: FormScreenConfig[];
    position: number;
    imgSrc: string;
    globalFields: GlobalFieldConfig[]; 
}

export type FormEntryValue<T = string | number | boolean> = {
    value: T;
    meta: {
        [key: string]: any
    }
}

export type FormEntryValues =  { 
    [entryKey: string]: FormEntryValue
}

export type FormEntryV2 = {
    id: number;
    // configId: number;
    config: FormConfig;
    // name: string;
    // description: string;
    // screens: FormEntryScreen[];
    values: FormEntryValues;
    createdAt: string;
    updatedAt: string;
    // globalFields: GlobalField[];
}

export type FormGroup = {
    rows: FormRow;
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

    /**
     * Configured actions to perform based on conditions set.
     */
    triggers: FormTrigger[];
}

/**
 * Very simple form triggers which simply do something when
 * all fields for the specified rows have a value. 
 */
export type FormTrigger = {
    key: string;
    /**
     * Screen key. Multi-screen triggers not supported.
     */
    screen: string;
    /**
     * Row keys for this trigger.
     */
    rows: string[];
    /**
     * Field keys for this trigger.
     */
    fields: string[];
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

    copyIndex: number;

    copyTrigger: string;
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
    defaultValue: string;
    entryKey: string;
}

export type GlobalFieldConfig = {
    key: string;
    label: string;
    type: GlobalFieldType;
    name: string;
    position: GlobalFieldPosition;
    startTrigger: GlobalFieldStartTrigger;
    entryKey: string;
}

export type FormFieldOptionConfig = {
    label: string;
    value: string;
    position: number;
    onChangeAction: FormFieldOnChangeAction;
}

export function createFormRow({
    fields = [],
    copyIndex = 0,
    copyTrigger,
}: {
    fields?: FormFieldConfig[];
    copyIndex?: number;
    copyTrigger?: string;
}): FormRow {
    return {
        key: generateUUID(),
        fields,
        copyIndex,
        copyTrigger,
    };
}

export type CreateFieldConfigProps = {
    label?: string;
    type?: FormFieldType;
    options?: FormFieldOptionConfig[];
    name?: string;
    multiSelect?: boolean;
    defaultValue?: string;
}

export function createFieldConfig({
    name = '',
    type = 'TEXT',
    label = '',
    options = [],
    defaultValue = '',
    multiSelect = false,
}: CreateFieldConfigProps): FormFieldConfig {
    return {
        name,
        type,
        label,
        options,
        defaultValue,
        multiSelect,
        key: generateUUID(),
        entryKey: generateUUID(),
    };
}

export type CreateGlobalFieldProps = {
    key?: string;
    label?: string;
    type?: GlobalFieldType;
    name?: string;
    position?: GlobalFieldPosition;
    startTrigger?: GlobalFieldStartTrigger;
}

export type GlobalFieldPosition = 'HEADER' | 'FLOATING_BUTTON_BR';
export type GlobalFieldStartTrigger = 'MANUAL' | 'ON_FORM_CREATED';

export function createGlobalField({
    name = '',
    key = generateUUID(),
    label = '',
    type = 'TIMER',
    position = 'FLOATING_BUTTON_BR',
    startTrigger = 'MANUAL',
}: CreateGlobalFieldProps): GlobalFieldConfig {
    return {
        name,
        key,
        label,
        type,
        position,
        startTrigger,
        entryKey: generateUUID(),
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
        triggers: [],
    }
}

export function createFormConfig(): FormConfig {
    return {
        id: undefined,
        name: '',
        description: '',
        screens: [
            createFormScreenConfig({ 
                title: '',
                position: 0,
                rows: [
                    createFormRow({
                        fields: [
                            createFieldConfig({})
                        ]
                    })
                ]
             })
        ],
        position: 0,
        imgSrc: '',
        globalFields: [],
    };
}

export function createTrigger(screen: string): FormTrigger {
    return {
        screen,
        rows: [],
        action: 'COPY_ROWS',
        condition: 'HAS_VALUE',
        fields: [],
        key: generateUUID(),
    };
}

export function createFormV2(config: FormConfig): FormEntryV2 {
    return {
        id: undefined, 
        config,
        values: createEntryValues(config),
        createdAt: moment().utc().toISOString(),
        updatedAt:  moment().utc().toISOString(),
    };
}

export type FieldEntry = {
    value: string;
    meta: { [key: string]: any };
}

export function createFieldEntry(value = '', meta = {}): FormEntryValue {
    return {
        value,
        meta,
    }
}

function createEntryValues(config: FormConfig) {
    let values: FormEntryValues = {};

    for (const screen of config.screens) {
        for (const row of screen.rows) {
            for (const field of row.fields) {
                while (values.hasOwnProperty(field.entryKey)) {
                    // shouldnt even enter here ever
                    console.log('Changing field entry key');
                    field.entryKey = generateUUID();
                }

                values[field.entryKey] = createFieldEntry();
            }
        }
    }

    for (const field of config.globalFields) {
        while (values.hasOwnProperty(field.entryKey)) {
            // shouldnt even enter here ever
            console.log('Changing field entry key');
            field.entryKey = generateUUID();
        }

        values[field.entryKey] = createFieldEntry();

        if (field.type === 'TIMER') {
            values[field.entryKey].meta = createTimerMeta(field);
        }
    }

    console.log(values);
    return values;
} 

export type TimerState = 'RUNNING' | 'STOPPED';

export type TimerEntryMeta = {
    state: TimerState;
    lastValue: number;
    history: { state: TimerState; timestamp: string; }[]
}

function createTimerMeta(config: GlobalFieldConfig): TimerEntryMeta {
    return {
        state: config.startTrigger === 'MANUAL' ? 'STOPPED' : 'RUNNING',
        lastValue: 0,
        history: [],
    };
}