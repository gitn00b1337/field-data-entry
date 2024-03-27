import { StyleSheet, View, } from "react-native";
import { FormEntryV2, GlobalFieldConfig, createGlobalField, } from "../../lib/config";
import { Text,  MD3Theme, Button, useTheme, } from 'react-native-paper';
import React from 'react';
import { DotsPopupMenu } from "../../components/dots-popup-menu";
import { FormSelectField } from "../../components/form-select";
import { FormInput } from "../../components/form-input";
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { AddButton } from "../../components/add-button";

export type DrawerTimersContentProps = {
    theme: MD3Theme;
    control: Control<FormEntryV2, any>;
}

export function DrawerTimersContent({
    theme,
    control,
}: DrawerTimersContentProps) {
    const styles = makeStyles(theme);

    const globalFields = useFieldArray({
        control,
        name: 'config.globalFields'
    })

    function handleAddMultiScreenFieldPress() {
        const field = createGlobalField({
            name: `config.globalFields.${globalFields.fields.length}`,
        });

        globalFields.append(field);
    }

    return (
        <View style={styles.navContainer}>
            <View style={styles.screensContainer}>
                <View style={styles.row}>
                        <Text style={styles.header}>
                            Timers
                        </Text>
                    </View>
                </View>
                <View>
                {
                    globalFields.fields.map((f, index) => (
                        <GlobalFieldConfigView 
                            key={f.key} 
                            field={f}
                            onDelete={() => globalFields.remove(index)}
                            control={control}
                        />
                    ))
                }                       
                </View>
                <View style={styles.row}>
                    <View style={{ flexGrow: 1, alignItems: 'center', paddingBottom: 12, }}>
                        <AddButton 
                            onPress={handleAddMultiScreenFieldPress} 
                            label="Add Timer"
                            style={{ width: 150, maxWidth: 150 }}
                        />
                    </View>
                </View>
        </View>
    )
}

type GlobalFieldConfigProps = {
    field: GlobalFieldConfig;
    onDelete: () => void;
    control: Control<FormEntryV2, any>;
}

function GlobalFieldConfigView({
    field,
    onDelete,
    control,
}: GlobalFieldConfigProps) {
    const theme = useTheme();
    const styles = makeGlobalFieldStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.configWrap}>
                <View style={styles.row}>
                    <FormInput
                        fieldName={`${field.name}.label`}
                        label='Label'
                        control={control}
                    />
                </View>
                <View style={styles.row}>
                    <FormSelectField
                        fieldName={`${field.name}.position`}
                        options={[{ label: 'Floating Button', value: 'FLOATING_BUTTON_BR' }, { label: 'Heading', value: 'HEADER' }]} 
                        label='Position'           
                        control={control} 
                        defaultValue="FLOATING_BUTTON_BR"
                    />
                </View>
                <View style={styles.row}>
                    <FormSelectField
                        fieldName={`${field.name}.startTrigger`}
                        options={[{ label: 'Manual', value: 'MANUAL' }, { label: 'On Form Created', value: 'ON_FORM_CREATED' }]} 
                        label='Start Trigger'    
                        control={control}       
                        defaultValue='MANUAL' 
                    />
                </View>
            </View>
            <View style={{ justifyContent: 'flex-start', alignItems: 'center', alignContent: 'center'}}>
                <DotsPopupMenu
                    size={20}
                    actions={[
                        { 
                            key: 'delete', 
                            label: 'Delete', 
                            onPress: onDelete,
                        }
                    ]}
                />
            </View>
        </View>
    );
}

const makeGlobalFieldStyles = (theme: MD3Theme) => StyleSheet.create({
    container: { 
        width: '100%', 
        paddingBottom: 24, 
        marginBottom: 12, 
        borderBottomColor: theme.colors.outline, 
        borderBottomWidth: 1, 
        paddingLeft: 12,
        paddingRight: 12,
        alignContent: 'stretch',
        alignItems: 'stretch',
        flexDirection: 'row',
    },
    configWrap: {
        flexGrow: 1,
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
        paddingHorizontal: 12,
    },
})

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    addScreenBtn: {
        backgroundColor: theme.colors.primary,
    },
    navContainer: {
        flexGrow: 1,
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flexDirection: 'column',
    },    
    screensContainer: {
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
        paddingHorizontal: 12,
    },
    screenRow: {
        paddingLeft: 12,
    },
    activeRow: {
        backgroundColor: theme.colors.surface,
    },
    header: {
        fontWeight: '700',
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    label: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 12,
        fontWeight: '100'
    }
})