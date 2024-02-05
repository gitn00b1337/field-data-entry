import { StyleSheet, TouchableOpacity, View, } from "react-native";
import { FormFieldConfig, FormRow, } from "../../lib/config";
import { Button, Text, MD3Theme, useTheme,  } from 'react-native-paper';
import React from 'react';
import { FieldArray, FieldArrayRenderProps } from "formik";
import  { NestableDraggableFlatList, NestableScrollContainer, RenderItem, RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";

export type DrawerRowContentProps = {
    theme: MD3Theme;
    selectedRow: FormRow | undefined;
    selectedRowIndex: number;
    fieldName: string;
    onAddFieldPress: (helper: FieldArrayRenderProps) => void;
    screenIndex: number;
    onEditFieldPress: (index: number) => void;
}

export function DrawerRowContent({
    theme,
    selectedRow,
    selectedRowIndex,
    fieldName,
    onAddFieldPress,
    screenIndex,
    onEditFieldPress,
}: DrawerRowContentProps) {
    const styles = makeStyles(theme);

    if (!selectedRow) {
        return (
            <View style={styles.navContainer}>
                <View style={styles.row}>
                    <Text style={styles.noScreenText}>
                        Select a screen to configure rows.
                    </Text>
                </View>
            </View>
        )
    }

    function renderItem({ item, getIndex, drag, isActive }: RenderItemParams<FormFieldConfig>) {
        const index = getIndex();
        const fName = `row${selectedRowIndex}-fieldconfig${index}`;

        return (
            <ScaleDecorator>
                <TouchableOpacity
                    style={{
                        flexGrow: 1,
                        backgroundColor: isActive ? 'grey' : 'transparent',
                    }}
                    onLongPress={drag}
                    disabled={isActive}
                >
                    <RowField
                        field={item}
                        fieldName={fName}
                        index={index}
                        onEditBtnPress={onEditFieldPress}
                    />
                </TouchableOpacity>
            </ScaleDecorator>
        )
    }

    function handleDragEnd(from: number, to: number, arrayHelper: FieldArrayRenderProps) {
        arrayHelper.move(from, to);
        console.log(`Moving field from ${from} to ${to}`)
    }

    return (
        <FieldArray
            name={`screens[${screenIndex}].rows[${selectedRowIndex}].fields`}
            render={arrayHelper => (
                <NestableScrollContainer contentContainerStyle={styles.navContainer}>
                    <View style={styles.row}>
                        <Text style={styles.header}>{`Row ${selectedRowIndex + 1}`}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.header}>Fields</Text>
                    </View>
                    <NestableDraggableFlatList
                        style={{ flex: undefined, flexGrow: 0, }}
                        contentContainerStyle={{ flex: undefined, flexGrow: 0, }}
                        containerStyle={{ flexGrow: 0, flex: undefined, width: '100%' }}
                        data={selectedRow.fields}
                        onDragEnd={({ from, to }) => handleDragEnd(from, to, arrayHelper)}
                        keyExtractor={(field, fieldIndex) => `row${selectedRowIndex}-fieldconfig${fieldIndex}`}
                        renderItem={renderItem}
                    />
                    <View style={styles.row}>
                        <View style={{ flexGrow: 1, }}>
                            <Button onPress={() => onAddFieldPress(arrayHelper)}>Add Field</Button>
                        </View>
                    </View>
                </NestableScrollContainer>
            )}
        />
    )
}

function RowField({
    field,
    fieldName,
    index,
    onEditBtnPress,
}: {
    field: FormFieldConfig;
    fieldName: string;
    index: number;
    onEditBtnPress: (fieldIndex: number) => void;
}) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const label = field.label ? `${field.label}` : `New Field`;

    return (
        <View style={styles.fieldLabel}>
            <View style={styles.fieldBtnContainer}>
                <Button style={styles.fieldDragBtn} icon='drag-vertical'>&nbsp;</Button>
            </View>
            <View style={styles.fieldLabelContainer}>
                <Text style={styles.fieldLabelText}>
                    {`${label}`}
                </Text>
            </View>
            <TouchableOpacity style={styles.fieldBtnContainer} onPress={() => onEditBtnPress(index)}>
                <Button style={styles.fieldEditBtn} icon='square-edit-outline'>&nbsp;</Button>
            </TouchableOpacity>
        </View>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    noScreenText: {
        paddingTop: 24,
    },
    fieldLabel: {
        paddingLeft: 24,
        paddingRight: 12,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
    },
    fieldEditBtn: {
        alignSelf: 'flex-end',
        flexGrow: 0,
        width: 30,
        minWidth: 20,
    },
    fieldBtnContainer: {
        flexGrow: 0,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        alignContent: 'flex-start',
        minWidth: 1,
    },
    fieldDragBtn: {
        flexGrow: 0,
        width: 20,
        paddingHorizontal: 0,
        minWidth: 15,
    },
    fieldLabelContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
    },
    fieldLabelText: {
        flexGrow: 1,
        alignContent: 'stretch',
        justifyContent: 'center',
        alignItems: 'stretch',
        textAlignVertical: 'center',
    },
    
    navContainer: {
        flexGrow: 1,
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flexDirection: 'column',
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
        paddingHorizontal: 12,
    },
    header: {
        fontWeight: '700',
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
})