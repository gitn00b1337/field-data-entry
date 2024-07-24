import { NativeSyntheticEvent, StyleSheet, TextInputEndEditingEventData, View, } from "react-native";
import { FormEntryV2, FormFieldOptionConfig, FormFieldType, createFieldOption, } from "../../lib/config";
import { Button, Text, MD3Theme, IconButton, } from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import { FormSelectField } from "../../components/form-select";
import { FormInput } from "../../components/form-input";
import { DotsPopupMenu } from "../../components/dots-popup-menu";
import { useGlobalState } from "../global-state";
import { Control, UseFormSetValue, useFieldArray, useWatch } from "react-hook-form";
import { CheckboxField } from "../../components/form-checkbox";
import { AddButton } from "../../components/add-button";

type DrawerFieldContentProps = {
    theme: MD3Theme;
    screenIndex: number;
    rowIndex: number;
    fieldIndex: number;
    onDeleteField: (fieldIndex: number) => void;
    control: Control<FormEntryV2, any>;
    setValue: UseFormSetValue<FormEntryV2>;
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
    { label: 'Timer', value: 'TIMER' },
    { label: 'Tally', value: 'TALLY' },
];

export function DrawerFieldContent({
    theme,
    fieldIndex,
    rowIndex,
    screenIndex,
    onDeleteField,
    control,
    setValue,
}: DrawerFieldContentProps) {
    const styles = makeStyles(theme);
    const [state, dispatch] = useGlobalState();
    const name = `config.screens.${screenIndex}.rows.${rowIndex}.fields.${fieldIndex}`;
    const fieldConfig = useWatch({
        control,
        name: `config.screens.${screenIndex}.rows.${rowIndex}.fields.${fieldIndex}`,
    });
    const defaultField = useWatch({
        control,
        name: `config.screens.${screenIndex}.rows.${rowIndex}.fields.${fieldIndex}.defaultValue`
    });
    console.log(`${name}`)

    const {
        fields: options,
        remove: removeOption,
        append: appendOption,
        update: updateOption,
    } = useFieldArray({
        control,
        name: `config.screens.${screenIndex}.rows.${rowIndex}.fields.${fieldIndex}.options`
    });

    const optionsArr = useWatch({
        control,
        name: `config.screens.${screenIndex}.rows.${rowIndex}.fields.${fieldIndex}.options`
    })

    if (screenIndex === -1 || rowIndex === -1 || fieldIndex === -1 || !fieldConfig) {
        return (
            <View style={styles.navContainer}>
                <View style={styles.row}>
                    <Text style={styles.noRowText}>Select a row to configure fields.</Text>
                </View>
            </View>
        )
    }

    function handleAddOption() {
        const newOption = createFieldOption();
        appendOption(newOption);
    }

    function setDefaultValue(value: string) {
        setValue(`config.screens.${screenIndex}.rows.${rowIndex}.fields.${fieldIndex}.defaultValue`, value);
    }

    function handleFieldLabelBlur(e: NativeSyntheticEvent<TextInputEndEditingEventData>, optionIndex: number) {
        const option = fieldConfig.options && fieldConfig.options[optionIndex];
        const value = e.nativeEvent?.text;
        const isSelect = fieldConfig.type === 'SELECT';
        const missingDefault = !fieldConfig.options?.find(op => op.value === fieldConfig.defaultValue);

        // requested feature: if its a select, set the value as the label 
        // but keep it overwritable. think will need to also check if touched v2 TODO.
        if (typeof value !== 'string' || !option || !isSelect) {
            return;
        }

        const newOp: FormFieldOptionConfig = {
            ...option,
            value,
        };

        updateOption(optionIndex, newOp);

        if (missingDefault) {
            setDefaultValue(value);
        }
    }

    return (
        <View style={styles.navContainer}>
            <View style={{ flex: 1, flexDirection: 'column', }}>
                <View style={styles.breadcrumbContainer}>
                    <Button
                        icon="chevron-left"
                        onPress={() => dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW')}
                    >
                        Rows
                    </Button>
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Edit Field</Text>
                    <DotsPopupMenu
                        actions={[
                            { key: 'delete', label: 'Delete', onPress: () => onDeleteField(fieldIndex) }
                        ]}
                    />
                </View>
            </View>
            <View style={styles.formContainer}>
                {
                    fieldConfig && (
                        <>
                            <View style={{ flex: 1, }}>
                                <View style={styles.row}>
                                    <FormInput
                                        fieldName={`${name}.label`}
                                        label={'Label'}
                                        control={control}
                                    />
                                </View>
                                <View style={[styles.row]}>
                                    <FormSelectField
                                        fieldName={`${name}.type`}
                                        label='Field Type'
                                        options={typeOptions}
                                        control={control}
                                    />
                                </View>
                                <View style={{ paddingLeft: 12, }}>
                                    {
                                        fieldConfig.type === 'SELECT' && (
                                            <CheckboxField
                                                control={control}
                                                name={`${name}.multiSelect`}
                                                isDisabled={false}
                                                label="Multiple Choice"
                                                labelStyle={styles.isMultiSelectLabel}
                                                containerStyle={{ borderBottomWidth: 0, }}
                                            />
                                        )
                                    }
                                </View>
                                {
                                    fieldConfig.type === 'SELECT' && (
                                        <View style={styles.options}>
                                            <View style={styles.optionsHeader}>
                                                <Text style={styles.optionsHeaderText}>Dropdown Options</Text>
                                            </View>
                                            {
                                                options?.map((option, opIndex) => {
                                                    const opName = `${name}.options[${opIndex}]`;
                                                    const isDefault = option.value === defaultField && option.value !== '';
                                                    const selectedIconStyle = isDefault && styles.activeDefaultIcon;

                                                    return (
                                                        <View style={styles.optionRow} key={option.id}>
                                                            <View style={styles.optionEntryContainer}>
                                                                <FormInput
                                                                    fieldName={`${opName}.label`}
                                                                    label='Label'
                                                                    onEndEditing={e => handleFieldLabelBlur(e, opIndex)}
                                                                    control={control}
                                                                />
                                                            </View>
                                                            <View style={styles.optionEntryContainer}>
                                                                <FormInput
                                                                    fieldName={`${opName}.value`}
                                                                    label='Value'
                                                                    control={control}
                                                                />
                                                            </View>
                                                            <View style={styles.defaultIconContainer}>
                                                                <IconButton
                                                                    icon={isDefault ? 'star' : 'star-outline'}
                                                                    onPress={() => setDefaultValue(option.value)}
                                                                    style={[styles.defaultIcon, selectedIconStyle]}
                                                                />
                                                            </View>
                                                            <View style={styles.dotsMenu}>
                                                                <DotsPopupMenu
                                                                    actions={[
                                                                        { key: 'delete', label: 'Delete', onPress: () => removeOption(opIndex) }
                                                                    ]}
                                                                />
                                                            </View>
                                                        </View>
                                                    )
                                                })
                                            }
                                            <View style={styles.addOptionContainer}>
                                                <AddButton
                                                    onPress={handleAddOption}
                                                    label="Add Option"
                                                    style={{ width: 150, maxWidth: 150 }}
                                                />
                                            </View>
                                        </View>
                                    )
                                }
                                <View style={{ paddingLeft: 0, }}>
                                    <CheckboxField
                                        control={control}
                                        name={`${name}.persistsCopy`}
                                        isDisabled={false}
                                        label="Persists On Partial Entry Copy"
                                        labelStyle={styles.persistsCopyLabel}
                                        containerStyle={{ borderBottomWidth: 0, marginBottom: 0, }}
                                    />
                                </View>
                            </View>
                        </>
                    )
                }
                {
                    !fieldConfig && (
                        <View style={styles.row}>
                            <Text style={styles.noSelectionText}>No field selected.</Text>
                        </View>
                    )
                }
            </View>
        </View>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    formContainer: {
        backgroundColor: '#fff',
        flex: 1,
        marginHorizontal: 24,
        padding: 12,
        borderRadius: theme.roundness,
    },
    persistsCopyLabel: {
        color: '#000',
        fontWeight: 'normal',
        fontFamily: theme.fonts.default.fontFamily,
        fontSize: 14,
    },
    isMultiSelectLabel: {
        color: '#000',
        fontWeight: 'normal',
        fontFamily: theme.fonts.default.fontFamily,
        fontSize: 14,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 24,
        flexGrow: 1,
    },
    titleContainer: {
        paddingLeft: 24,
        flexDirection: 'row',
        flex: 1,
    },
    breadcrumbContainer: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        flex: 1,
    },
    dotsMenu: {
        flexGrow: 0,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultIconContainer: {
        flexGrow: 0,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionEntryContainer: {
        marginRight: 12,
        flexGrow: 1,
    },
    activeDefaultIcon: {

    },
    defaultIcon: {
        padding: 0,
        margin: 0,
    },
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
        borderColor: theme.colors.outline,
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
    },
    addOptionContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingTop: 12,
    },
    fieldRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
        paddingHorizontal: 12,
    },
    navContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
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
        borderColor: theme.colors.outline,
        shadowRadius: 0,
        opacity: 1,
    }
})