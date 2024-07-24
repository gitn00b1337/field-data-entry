import { FormConfig, FormEntryV2, FormFieldType, FormRow, FormScreenConfig, GlobalFieldType, } from "./config";
import * as FileSystem from 'expo-file-system';
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatTotalSecondsToTimeString } from "./utils";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const SAF = FileSystem.StorageAccessFramework;

async function trySaveFileUsingCachedPermissions(asyncStoreKey: string, fileContents: string, fileName: string, fileMimeType: string = 'text/csv'): Promise<{ success: boolean, path?: string }> {
    let directoryUri = await AsyncStorage.getItem(asyncStoreKey);

    if (directoryUri) {
        try {
            // there's no way yet in expo to check SAF permission without requesting every time, so try using cached setting if it exists
            const destinationUri = await SAF.createFileAsync(directoryUri, fileName, fileMimeType);
            await SAF.writeAsStringAsync(destinationUri, fileContents, { encoding: 'utf8' });

            return {
                success: true,
            };
        }
        catch {   
        }
    }

    return {
        success: false,
    };
}

function getExportFileName(entry: FormEntryV2) {
    const createdAt = moment.utc(entry.createdAt);
    const createdAtStr = createdAt.format('DD-MM-yy-HH-mm-ss');
    const fileName = `DataExport_${createdAtStr}.csv`;
    console.log(`fileName: ${fileName}`);
    return fileName;
}

function getMultiExportFileName(entries: FormEntryV2[]) {
    const ordered = entries.sort((e1, e2) => {
        const c1 = moment.utc(e1.createdAt);
        const c2 = moment.utc(e2.createdAt);

        if (c1.isBefore(c2)) {
            return -1;
        }
        else if (c1.isAfter(c2)) {
            return 1;
        }
        else {
            return 0;
        }
    });

    const first = moment.utc(ordered[0].createdAt).format('DD-MM-yy');
    const last = moment.utc(ordered.slice(-1)[0].createdAt).format('DD-MM-yy');
    const fileName = `DataExport_${first}_${last}.csv`;
    console.log(`fileName: ${fileName}`);
    return fileName;
}

function getExportColumns(entry: FormEntryV2) {
    let columns: Column[] = [];

    for (let i = 0; i < entry.config.screens.length; i++) {
        columns = [
            ...columns,
            ...convertScreenToSheetColumns(entry, i)
        ];
    }

    return [
        getEntryDateColumn(entry),
        ...columns,
        ...convertGlobalFieldsToColumns(entry, columns.length),
    ];
}

export async function exportTemplate(config: FormConfig) {
    const json = JSON.stringify(config);
    const fileName = `${config.name || 'Template-Export'}.json`;

    const asyncStoreKey = "SAFStore";
    const { success } = await trySaveFileUsingCachedPermissions(asyncStoreKey, json, fileName, 'application/json');

    if (!success) {
        const downloadDir = SAF.getUriForDirectoryInRoot('Documents');
        const permission = await SAF.requestDirectoryPermissionsAsync(downloadDir);

         if (!permission.granted) {
            return;
        }

        await SAF.createFileAsync(permission.directoryUri, fileName, 'application/json');
        await AsyncStorage.setItem(asyncStoreKey, permission.directoryUri);
    }
}

async function writeCSV(fileName: string, contents: string) {
    const asyncStoreKey = "SAFStore";
    const { success } = await trySaveFileUsingCachedPermissions(asyncStoreKey, contents, fileName);
    
    if (!success) {
        const downloadDir = SAF.getUriForDirectoryInRoot('Documents');
        const permission = await SAF.requestDirectoryPermissionsAsync(downloadDir);

         if (!permission.granted) {
            return;
        }

        await SAF.createFileAsync(permission.directoryUri, fileName, 'text/csv');
        await AsyncStorage.setItem(asyncStoreKey, permission.directoryUri);
    }
}

export async function exportMultipleForms(entries: FormEntryV2[]) {
    if (entries.length === 0) {
        return;
    }
    else if (entries.length === 1) {
        return await exportForm(entries[0]);
    }

    let previousEntries = [
        entries[0],
    ];

    for (let i=1; i<entries.length; i++) {
        const entry = entries[i];
        const prevEntry = entries[i-1];

        const canMerge = canMergeEntries(prevEntry, entry);
        console.log(`Can merge entries: ${canMerge}`);

        if (!canMerge) {
            await mergeAndExportForms([ ...previousEntries, entry ]);
            previousEntries = [ entry ];
            continue;
        } else {
            previousEntries.push(entry);
        }

        if (i === entries.length-1) {
            await mergeAndExportForms(previousEntries);
        }
    }
}

function canMergeEntries(entry1: FormEntryV2, entry2: FormEntryV2) {
    const cols1 = getExportColumns(entry1);
    const cols2 = getExportColumns(entry2);

    if (cols1.length !== cols2.length) {
        return false;
    }

    for (let i=0; i<cols1.length; i++) {
        const col1 = cols1[i];
        const col2 = cols2[i];

        if (col1.name !== col2.name || col1.index!== col2.index) {
            return false;
        }
    }

    return true;
}

async function mergeAndExportForms(entries: FormEntryV2[]) {
   const fileName = getMultiExportFileName(entries);

   let csv = '';

   for (let i=0; i<entries.length; i++) {
    const columns = getExportColumns(entries[i]);
    const entryCSV = writeColumnsCSV(columns, i > 0);
    csv += entryCSV;
   }

   console.log('csv:')
   console.log(csv);
   await writeCSV(fileName, csv);
}

export async function exportForm(entry: FormEntryV2) {
    const columns = getExportColumns(entry);
    const csv = writeColumnsCSV(columns);

    const fileName = getExportFileName(entry);
    await writeCSV(fileName, csv);
}

type ScreenRowGroup = {
    index: number;
    rows: FormRow[];
}

type GroupedScreenRows = {
    [rowKey: string]: ScreenRowGroup
}

function orderGroupedRows(groups: GroupedScreenRows): ScreenRowGroup[] {
    return Object.keys(groups)
        .map(rowKey => {
            return groups[rowKey];
        })
        .sort((g1, g2) => g1.index - g2.index);
}

type Column = {
    name: string;
    index: number;
    rows: {
        value: string | number | boolean;
        type: FormFieldType | GlobalFieldType;
    }[]
}

function getColumns(entry: FormEntryV2, groups: ScreenRowGroup[]): Column[] {
    return groups.reduce<Column[]>((columns, group) => {
        if (!group.rows.length) {
            return columns;
        }

        // avoid duplicate field names by simply supporting the rows field order
        // all rows in this group have the same field config as they're duplicates
        const mapped: Column[] = [];

        for (const row of group.rows) {
            for (let fieldIndex = 0; fieldIndex < row.fields.length; fieldIndex++) {
                const field = row.fields[fieldIndex];
                const currentCol = mapped[fieldIndex];
                const entryValue = entry.values[field.entryKey];
                const value = typeof entryValue !== 'undefined' ? entryValue?.value : '';

                // @ts-ignore
                if (field.type === 'PLAYBACK_BUTTON') {
                    console.log(`Skipping audio button`)
                    continue; 
                }

                // console.log(`field type: ${field.type}`)
                // console.log(field)
    
                mapped[fieldIndex] =  {
                    name: field.label,
                    index: group.index,
                    rows: [
                        ...(currentCol?.rows || []),
                        {
                            value,
                            type: field.type,
                        }
                    ]
                }
            }
        }        

        return [
            ...columns,
            ...mapped
        ];
    }, []);
}

function getMaxRows(columns: Column[]) {
    return Math.max(
        ...columns.map(col => col.rows.length)
    );

}

function writeColumnsCSV(columns: Column[], isAppend = false) {
    const maxRows = getMaxRows(columns);
    const startIndex = isAppend ? 0 : -1;
    let csv = '';

    for (let rowIndex = startIndex; rowIndex < maxRows; rowIndex++) {
        let line = '';

        if (rowIndex === -1) {
            line = columns.map(c => `"${c.name}"`).join(',');
        }
        else {
            line = columns.map(c => {
                const index = c.rows.length === 1 
                    ? 0 
                    : rowIndex;

                const row = c.rows[index];
                const parsed = parseValue(row?.value, row?.type);
                return `"${parsed}"`;
            }).join(',');
        }

        csv = csv.concat(`${line}\n`);
    }

    return csv;
}

function parseValue(val: any, type: FormFieldType | GlobalFieldType) {
    switch (type) {
        case 'CHECKBOX':
            return !!val;
        case 'NUMERIC':
            return Number(val);
        case 'WHOLE_NUMBER':
            return Math.round(Number(val));
        case 'TIMER':
            return formatTotalSecondsToTimeString(val);
        default:
            return typeof val === 'undefined' ? '' : `${val}`;
    }
}

function groupScreenRows(rows: FormRow[]): GroupedScreenRows {
    return rows.reduce<GroupedScreenRows>((grp, row, rowIndex) => {
        if (!row.parentId) {
            return {
                ...grp,
                [row.id]: {
                    index: rowIndex,
                    rows: [
                        row,
                        ...(grp[row.id]?.rows || []),
                    ],
                },
            };
        }
        else {
            return {
                ...grp,
                [row.parentId]: {
                    ...grp[row.parentId],
                    rows: [
                        ...(grp[row.parentId]?.rows || []),
                        row
                    ]
                }
            }
        }
    }, {});
}

function getEntryDateColumn(entry: FormEntryV2) {
    const value = moment(entry.createdAt)
        .utc()
        .local()
        .format('HH:mm DD-MM-YYYY');

    const col: Column = {
        name: 'Entry Time',
        index: -1,
        rows: [
            {
                value,
                type: 'TEXT',
            }
        ]
    };

    return col;
}

export function convertScreenToSheetColumns(entry: FormEntryV2, screenIndex: number) {
    const screen = entry.config.screens[screenIndex];

    const grouped = groupScreenRows(screen.rows);
    const orderedGroups = orderGroupedRows(grouped);
    const columns = getColumns(entry, orderedGroups);
    return columns;    
}

export function convertGlobalFieldsToColumns(entry: FormEntryV2, startIndex: number) {
    return entry.config.globalFields
        .filter(f => f.exportable)
        .map((gf, index) => {
            const value = entry.values[gf.entryKey]?.value;
            const col: Column = {
                name: gf.label,
                index: startIndex + index,
                rows: [
                    {
                        value,
                        type: gf.type,
                    }
                ]
            };

            return col;
        })
}