import { FormEntryV2, FormFieldType, FormRow, FormScreenConfig, GlobalFieldType, } from "./config";
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
    const createdAtStr = createdAt.format('dd-MM-yyy-HH-mm-ss');

    return `${createdAtStr}.csv`;
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
        ...columns,
        ...convertGlobalFieldsToColumns(entry, columns.length),
    ];
}

export async function exportForm(entry: FormEntryV2) {
    const columns = getExportColumns(entry);
    const csv = writeColumnsCSV(columns);
    console.log(csv);

    const asyncStoreKey = "SAFStore";
    const fileName = getExportFileName(entry);
    const { success } = await trySaveFileUsingCachedPermissions(asyncStoreKey, csv, fileName);
    
    if (!success) {
        const downloadDir = SAF.getUriForDirectoryInRoot('Documents');
        const permission = await SAF.requestDirectoryPermissionsAsync(downloadDir);

         if (!permission.granted) {
            return;
        }

        const path = `~/Documents/${fileName}`;
        await SAF.createFileAsync(permission.directoryUri, fileName, 'text/csv');
        await AsyncStorage.setItem(asyncStoreKey, permission.directoryUri);
    }
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

        console.log(entry.values)

        for (const row of group.rows) {
            for (let fieldIndex = 0; fieldIndex < row.fields.length; fieldIndex++) {
                const field = row.fields[fieldIndex];
                const currentCol = mapped[fieldIndex];
                const entryValue = entry.values[field.entryKey];
                const value = typeof entryValue !== 'undefined' ? entryValue?.value : '';

                console.log(field);
    
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

function writeColumnsCSV(columns: Column[]) {
    const maxRows = getMaxRows(columns);
    let csv = '';

    for (let rowIndex = -1; rowIndex < maxRows; rowIndex++) {
        let line = '';

        if (rowIndex === -1) {
            line = columns.map(c => c.name).join(',');
        }
        else {
            line = columns.map(c => {
                const index = c.rows.length === 1 
                    ? 0 
                    : rowIndex;

                const row = c.rows[index];
                return parseValue(row?.value, row?.type);
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

export function convertScreenToSheetColumns(entry: FormEntryV2, screenIndex: number) {
    const screen = entry.config.screens[screenIndex];

    const grouped = groupScreenRowsByRowKey(screen);
    const orderedGroups = orderGroupedRows(grouped);
    const columns = getColumns(entry, orderedGroups);
    return columns;    
}

export function convertGlobalFieldsToColumns(entry: FormEntryV2, startIndex: number) {
    return entry.config.globalFields.map((gf, index) => {
        const value = entry.values[gf.entryKey]?.value;

        const col: Column = {
            name: gf.name,
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