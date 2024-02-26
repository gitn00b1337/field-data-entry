import moment from 'moment';
import { generateUUID } from './utils';

export type FormActionType = 'COPY_ROWS';
export type FormActionCondition = 'HAS_VALUE';
export type FormFieldOnChangeAction = 'NONE' | 'CREATE_BLANK';

export type FormFieldType = 'TEXT' | 'WHOLE_NUMBER' | 'SELECT' | 'MULTI_SELECT' | 'NUMERIC' | 'CHECKBOX';
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

export type FormEntry<T = string | number> = {
    value: T;
    meta: {
        [key: string]: any
    }
}

export type FormEntryValues =  { 
    [entryKey: string]: FormEntry
}

export type FormEntryV2 = {
    id: number;
    configId: number;
    name: string;
    description: string;
    screens: FormEntryScreen[];
    values: FormEntryValues;
    createdAt: string;
    updatedAt: string;
    globalFields: GlobalField[];
}

export type GlobalField = {
    entryKey: string;
} & GlobalFieldConfig

export type FormEntryScreen = {
    key: string;
    title: string;
    nextBtnLabel: string;
    position: number;
    rows: FormEntryRow[];
    /**
     * Configured actions to perform based on conditions set for this screen.
     */
    triggers: FormTrigger[];
}

export type FormEntryRow = {
    /**
     * Unique (per form) key for this row.
     */
    key: string;
    /**
     * The fields for a given row.
     */
    fields: FormFieldV2[];
    /**
     * An index mapping this row to the form entry values. Original row = 0, first copy = 1, nth copy = n.
     */
    copyIndex: number;
    /**
     * Key of the trigger that created this copy
     */
    copyTrigger: string;
}

export type FormFieldV2 = {
    /**
     * Unique (per form) key for this row
     */
    key: string;
    /**
     * The label shown for this field
     */
    label: string;
    /**
     * The field (data display) type
     */
    type: FormFieldType;
    /**
     * Field specific options
     */
    options: FormFieldOptionConfig[];
    /**
     * Name of the form component for formik e.g. screens[1].rows[0].fields[2]
     */
    name: string;
    /**
     * Whether the field can have multiple selections (SELECT, TIMER)
     */
    multiSelect: boolean;
    /**
     * The key for the entered value, found in form.values[ entryKey ]
     */
    entryKey: string;
    /**
     * Default value, only used for select fields.
     */
    defaultValue: string;
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
}

export type GlobalFieldConfig = {
    key: string;
    label: string;
    type: GlobalFieldType;
    name: string;
    position: GlobalFieldPosition;
    startTrigger: GlobalFieldStartTrigger;
}

export type FormFieldOptionConfig = {
    label: string;
    value: string;
    position: number;
    onChangeAction: FormFieldOnChangeAction;
}


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
        screens: [],
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
    const screens = config.screens.map(formScreenFromConfig);
    const globalFields = createEntryGlobalFields(config.globalFields);

    return {
        screens,
        globalFields,
        id: undefined, 
        name: config.name, 
        description: config.description, 
        configId: config.id,
        values: createEntryValues(screens, globalFields),
        createdAt: moment().utc().toISOString(),
        updatedAt:  moment().utc().toISOString(),
    };
}

function createEntryGlobalFields(fields: GlobalFieldConfig[]): GlobalField[] {
    return fields.map(field => {
        return {
            ...field,
            entryKey: generateUUID(),
        }
    });
}

type FieldEntry = {
    value: string;
    meta: { [key: string]: any };
}

function createFieldEntry(value: string = '', meta = {}): FieldEntry {
    return {
        value,
        meta,
    }
}

function createEntryValues(screens: FormEntryScreen[], globalFields: GlobalField[]) {
    let values: FormEntryValues = {};

    for (const screen of screens) {
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

    for (const field of globalFields) {
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

function createTimerMeta(config: GlobalField): TimerEntryMeta {
    return {
        state: config.startTrigger === 'MANUAL' ? 'STOPPED' : 'RUNNING',
        lastValue: 0,
        history: [],
    };
}

function getDefaultFieldValue(field: FormFieldV2) {
    switch (field.type) {
        case 'MULTI_SELECT':
        case 'SELECT':
            return field.defaultValue;
        case 'WHOLE_NUMBER':
        case 'NUMERIC':
            return 0;

        default: 
            return '';
    } 
}

function formScreenFromConfig(screen: FormScreenConfig): FormEntryScreen {
    console.log(`formScreenFromConfig: screen ${screen.key}`)
    console.log(screen.triggers);

    const triggers = screen.triggers.filter(t => t.screen === screen.key);
    console.log(`filtered count: ${triggers.length}`)

    return {
        key: screen.key, 
        title: screen.title, 
        nextBtnLabel: screen.nextBtnLabel, 
        position: screen.position, 
        rows: screen.rows.map(formRowFromConfig),
        triggers,
    }
}

function formRowFromConfig(row: FormRow): FormEntryRow {
    return {
        key: row.key,
        fields: row.fields?.map(fromFormFieldConfig) || [],
        copyIndex: 0,
        copyTrigger: '',
    }
}

function fromFormFieldConfig(field: FormFieldConfig): FormFieldV2 {
    return {
        key: field.key,
        label: field.label,
        type: field.type,
        options: field.options,
        name: field.name,
        multiSelect: field.multiSelect,
        entryKey: generateUUID(),
        defaultValue: field.defaultValue,
    }
}