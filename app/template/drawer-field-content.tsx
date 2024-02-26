import { StyleSheet, View, } from "react-native";
import { FormFieldConfig, FormFieldType, createFieldOption, } from "../../lib/config";
import { Button, Text, MD3Theme, Menu,  } from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import { FormSelectField } from "../../components/form-select";
import { FormInput } from "../../components/form-input";
import { FieldArray, FieldArrayRenderProps } from "formik";
import { DotsPopupMenu } from "../../components/dots-popup-menu";

type DrawerFieldContentProps = {
    theme: MD3Theme;
    field: FormFieldConfig;
    screenIndex: number;
    rowIndex: number;
    fieldIndex: number;
    onDeletePress: (arrayHelper: FieldArrayRenderProps, index: number) => void;
}

type DropdownOption = {
    label: string;
    value: FormFieldType;
}
type DropdownOptions = DropdownOption[];

const typeOptions: DropdownOptions = [
    { label: 'Text', value: 'TEXT', },
    { label: 'Numeric', value: 'NUMERIC', },
    { label: 'Whole Number', value: 'WHOLE_NUMBER', },
    { label: 'Dropdown', value: 'SELECT', },
    { label: 'Checkbox', value: 'CHECKBOX', },
    // { label: 'Timer', value: 'TIMER' },
];

export function DrawerFieldContent({
    theme,
    field,
    fieldIndex,
    rowIndex,
    screenIndex,
    onDeletePress,
}: DrawerFieldContentProps) {
    const styles = makeStyles(theme);
    const [disableAddOption, setDisableAddOption] = useState(false);
    const [visible, setVisible] = React.useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    useEffect(() => {
        if (!field?.options) {
            return;
        }

        const hasEmptyValue = field.options.findIndex(o => !o.value) > -1;
        setDisableAddOption(hasEmptyValue);        
    }, [ field?.options ])

    if (screenIndex === -1 || rowIndex === -1 || fieldIndex === -1 || !field) {
        // console.log(`Screen ${screenIndex} row ${rowIndex} field ${fieldIndex}`)
        // console.log(field);
        
        return (
            <View style={styles.navContainer}>
                <View style={styles.row}>
                    <Text style={styles.noRowText}>Select a row to configure fields.</Text>
                </View>
            </View>
        )
    } 

    const name = `screens[${screenIndex}].rows[${rowIndex}].fields[${fieldIndex}]`;

    function handleAddOption(arrayHelper: FieldArrayRenderProps) {
        const newOption = createFieldOption();
        arrayHelper.push(newOption);
    }

    return (
        <FieldArray
            name={`screens[${screenIndex}].rows[${rowIndex}].fields`}
            render={arrayHelper => (
                <View style={styles.navContainer}>
                    <View style={styles.row}>
                        <Text style={styles.header}>Edit Field</Text>
                        <DotsPopupMenu
                             actions={[
                                { key: 'delete', label: 'Delete', onPress: () => onDeletePress(arrayHelper, fieldIndex) }
                             ]}
                        />
                    </View>
                    {
                        field && (
                            <>
                            <FieldArray
                                name={`${name}.options`}
                                render={(arrayHelper) => (
                                    <View style={{ width: '100%' }}>
                                        <View style={styles.row}>
                                            <FormInput
                                                fieldName={`${name}.label`}
                                                label={'Label'}
                                                value={field.label}
                                            />
                                        </View>
                                        <View style={[styles.row]}>
                                            <FormSelectField
                                                fieldName={`${name}.type`}
                                                label='Field Type'
                                                options={typeOptions}
                                            />
                                        </View>
                                        {
                                            field.type === 'SELECT' && (
                                                <View style={styles.options}>
                                                    <View style={styles.optionsHeader}>
                                                        <Text style={styles.optionsHeaderText}>Dropdown Options</Text>
                                                    </View>
                                                    {
                                                        field.options?.map((option, opIndex) => {
                                                            const opName = `${name}.options[${opIndex}]`;

                                                            return (
                                                                <View style={styles.optionRow} key={opName}>
                                                                    <FormInput
                                                                        fieldName={`${opName}.label`}
                                                                        value={option.label}
                                                                        label='Label'
                                                                    />
                                                                    <FormInput
                                                                        fieldName={`${opName}.value`}
                                                                        value={option.value}
                                                                        label='Value'
                                                                    />
                                                                </View>
                                                            )
                                                        })
                                                    }
                                                    <View style={styles.addOptionContainer}>
                                                        <Button disabled={disableAddOption} onPress={() => handleAddOption(arrayHelper)}>
                                                            Add Option
                                                        </Button>
                                                    </View>
                                                </View>
                                            )
                                        }
                                    </View>
                                )}
                            />
                            </>
                        )
                    }
                    {
                        !field && (
                            <View style={styles.row}>
                                <Text style={styles.noSelectionText}>No field selected.</Text>
                            </View>
                        )
                    }
                </View>
            )}
        />
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    noRowText: {
        paddingTop: 24,
    },
    options: {
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignContent: 'stretch',
        alignItems: 'stretch',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
        borderRadius: 0,
        paddingVertical: 24,
        margin: 12,
    },
    optionsHeader: {
        backgroundColor: theme.colors.background,
        width: 130,
        height: 31,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: -17,
        left: 8,
    },
    optionsHeaderText: {
        color: theme.colors.onSurfaceVariant,
        fontSize: 12,
        letterSpacing: 0.3
    },
    option: {
        flexGrow: 1,
    },
    optionRow: {
        justifyContent: 'flex-start',
        alignContent: 'stretch',
        alignItems: 'stretch',
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },    
    addOptionContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingTop: 12,
    },
    fieldRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
        paddingHorizontal: 12,
    },
    fieldInput: {
        width: '100%',
        marginBottom: 24,
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
        display: 'flex',
        marginBottom: 12,
    },
    noSelectionText: {
        paddingLeft: 24,
    },    
    header: {
        fontWeight: '700',
        flexGrow: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    menuButton: {

    },
    actionsMenu: {
        marginTop: 10,
        marginLeft: 12,
        opacity: 1,
    },
    actionsContent: {
        backgroundColor: 'white',
        borderRadius: 0,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
        shadowRadius: 0,
        opacity: 1,
    }
})