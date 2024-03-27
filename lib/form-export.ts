import { FormConfig, FormEntryV2, FormFieldType, FormRow, FormScreenConfig, GlobalFieldType, } from "./config";
import * as FileSystem from 'expo-file-system';
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatTotalSecondsToTimeString } from "./utils";

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
    const createdAtStr = createdAt.format('dd-MM-yy-HH-mm-ss');

    return `DataExport_${createdAtStr}.csv`;
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

    const first = moment.utc(ordered[0].createdAt).format('dd-MM-yy');
    const last = moment.utc(ordered.slice(-1)[0].createdAt).format('dd-MM-yy');

    return `DataExport_${first}_${last}.csv`
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

function getMergedExportColumns(entries: FormEntryV2[]) {
    let columns: Column[] = [];

    for (const entry of entries) {
        const cols = getExportColumns(entry);
        
        for (const column of cols) {
            const nameMatch = cols.findIndex(c => c.name === column.name);

            if (nameMatch === -1) {
                columns.push(column);
            }
            else {
                columns[nameMatch] = {
                    ...columns[nameMatch],
                    rows: [
                        ...columns[nameMatch].rows,
                        ...column.rows
                    ]
                }
            }
        }
    }

    return columns;
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
    for (const entry of entries) {
        await exportForm(entry);
    }

    // if (entries.length === 0) {
    //     return;
    // }
    // else if (entries.length === 1) {
    //     return await exportForm(entries[0]);
    // }

    // const columns = getMergedExportColumns(entries);
    // const csv = writeColumnsCSV(columns);
    
    // const fileName = getMultiExportFileName(entries);
    // await writeCSV(fileName, csv);
}

export async function exportForm(entry: FormEntryV2) {
    const columns = getExportColumns(entry);
    const csv = writeColumnsCSV(columns);
    // console.log(csv);

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

function groupScreenRowsByRowKey(screen: FormScreenConfig): GroupedScreenRows {
    return screen.rows
        // group the rows by key
        .reduce((groups, row, index) => {
            const group: ScreenRowGroup | undefined = groups[row.id];

            if (group) {
                return {
                    ...groups,
                    [row.id]: {
                        index: Math.min(index, group.index),
                        rows: [
                            ...(group?.rows || []),
                            row,
                        ],
                    }
                }
            }

            const newGroup: ScreenRowGroup = {
                index,
                rows: [ row ],
            };

            return {
                ...groups,
                [row.id]: newGroup,
            };
        }, {});
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
        type: FormFieldType | FormFieldType;
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

function groupScreenRows(screen: FormScreenConfig): GroupedScreenRows {
    return screen.rows.reduce<GroupedScreenRows>((grp, row, rowIndex) => {
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
        .format('HH:mm dd-MM-YYY');

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

    // const grouped = groupScreenRowsByRowKey(screen);
    const grouped = groupScreenRows(screen);
    console.log(`Grouped Rows, expected 1, got ${Object.keys(grouped).length}`)
    const orderedGroups = orderGroupedRows(grouped);
    console.log(`Ordered count: ${orderedGroups.length}`);
    const columns = getColumns(entry, orderedGroups);
    console.log(`Columns, expected 6, received ${columns.length}`)
    return columns;    
}

export function convertGlobalFieldsToColumns(entry: FormEntryV2, startIndex: number) {
    return entry.config.globalFields.map((gf, index) => {
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