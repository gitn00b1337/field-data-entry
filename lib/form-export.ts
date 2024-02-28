import { FormEntryRow, FormEntryScreen, FormEntryV2, FormFieldType, FormFieldV2 } from "./config";
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import moment from "moment";

export async function exportForm(entry: FormEntryV2) {
    let columns: Column[] = [];


    for (let i = 0; i < entry.screens.length; i++) {
        columns = [
            ...columns,
            ...convertScreenToSheetColumns(entry, i)
        ];
    }

    const csv = writeColumnsCSV(columns);
    console.log(csv);

    const createdAt = moment.utc(entry.createdAt);
    const createdAtStr = createdAt.format('dd-MM-yyy-HH-mm-ss');
    const path = FileSystem.documentDirectory! + `${createdAtStr}.csv`;

    await FileSystem.writeAsStringAsync(
        path,
        csv,
        { encoding: 'utf8' }
    );

    return await Sharing.shareAsync(path);
}

type DataGroup = {
    [columnName: string]: {
        values: any[]
    }   
}

type ScreenRowGroup = {
    index: number;
    rows: FormEntryRow[];
}

type GroupedScreenRows = {
    [rowKey: string]: ScreenRowGroup
}

type CellValue = {
    value: any;
    rowIndex: number;
    columnIndex: number;
}

function groupScreenRowsByRowKey(screen: FormEntryScreen): GroupedScreenRows {
    return screen.rows
        // group the rows by key
        .reduce((groups, row, index) => {
            const group: ScreenRowGroup | undefined = groups[row.key];

            if (group) {
                return {
                    ...groups,
                    [row.key]: {
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
                [row.key]: newGroup,
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
        type: FormFieldType;
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
                const row = c.rows[rowIndex];
                console.log(row);

                return parseValue(row?.value, row?.type);
            }).join(',');
        }

        csv = csv.concat(`${line}\n`);
    }

    return csv;
}

function parseValue(val: any, type: FormFieldType) {
    switch (type) {
        case 'CHECKBOX':
            return !!val;
        case 'NUMERIC':
            return Number(val);
        case 'WHOLE_NUMBER':
            return Math.round(Number(val));
        default:
            return typeof val === 'undefined' ? '' : `${val}`;
    }
}

export function convertScreenToSheetColumns(entry: FormEntryV2, screenIndex: number) {
    const screen = entry.screens[screenIndex];

    const grouped = groupScreenRowsByRowKey(screen);
    const orderedGroups = orderGroupedRows(grouped);
    const columns = getColumns(entry, orderedGroups);
    return columns;    
}