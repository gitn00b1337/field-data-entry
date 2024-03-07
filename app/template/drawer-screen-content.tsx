import { StyleSheet, TouchableOpacity, View, } from "react-native";
import { FormConfig, GlobalFieldConfig, createGlobalField, } from "../../lib/config";
import { Text,  MD3Theme, Button, useTheme, } from 'react-native-paper';
import React from 'react';
import { DotsPopupMenu } from "../../components/dots-popup-menu";
import { FieldArray, FieldArrayRenderProps } from "formik";
import { FormSelectField } from "../../components/form-select";
import { FormInput } from "../../components/form-input";

export type DrawerScreenContentProps = {
    form: FormConfig;
    theme: MD3Theme;
    onScreenChange: (index: number) => void;
    screenIndex: number;
    onAddScreenPress: () => void;
    onDeleteScreenPress: () => void;
}

export function DrawerScreenContent({
    theme,
    form,
    onScreenChange,
    screenIndex,
    onAddScreenPress,
    onDeleteScreenPress,
}: DrawerScreenContentProps) {
    const styles = makeStyles(theme);

    function handleAddMultiScreenFieldPress(arrayHelper: FieldArrayRenderProps) {
        const field = createGlobalField({
            name: `globalFields[${form.globalFields.length}]`,
        });

        arrayHelper.push(field);
    }

    return (
        <FieldArray
            name='config.globalFields'
            render={globalFieldArrayHelper => (
                <View style={styles.navContainer}>
                    <View style={styles.screensContainer}>
                        <View style={styles.row}>
                            <Text style={styles.header}>
                                Screens
                            </Text>
                        </View>
                        {
                            form.screens.map((screen, index) => (
                                <View 
                                    key={`screen-${index}`}
                                    style={{ ...styles.row, ...styles.screenRow, ...(screenIndex === index ? styles.activeRow : {}) }}
                                >
                                    <TouchableOpacity
                                        onPress={() => onScreenChange(index)}
                                        style={{ flexGrow: 1, }}
                                    >
                                        <Text style={styles.label}>
                                            {`${screen.title || `Screen ${index + 1}`}`}
                                        </Text>
                                    </TouchableOpacity>
                                    <View style={{ justifyContent: 'center'}}>
                                        <DotsPopupMenu
                                            size={20}
                                            actions={[
                                                { key: 'delete', label: 'Delete', onPress: () => onDeleteScreenPress() }
                                            ]}
                                        />
                                    </View>
                                </View>
                            ))
                        }
                        <View style={styles.row}>
                            <View style={{ flexGrow: 1, }}>
                                <Button onPress={onAddScreenPress}>Add Screen</Button>
                            </View>
                        </View>
                    </View>
                    <View style={styles.screensContainer}>
                        <View style={styles.row}>
                                <Text style={styles.header}>
                                    Timers
                                </Text>
                            </View>
                        </View>
                        <View>
                        <FieldArray
                            name='config.globalFields'
                            render={arrayHelper => (
                                <>
                                    {
                                        form.globalFields.map((f, index) => (
                                            <GlobalFieldConfigView 
                                                key={f.key} 
                                                field={f}
                                                arrayHelper={arrayHelper}
                                                index={index} 
                                            />
                                        ))
                                    }
                                </>
                            )}
                        />
                        </View>
                        <View style={styles.row}>
                            <View style={{ flexGrow: 1, }}>
                                <Button onPress={() => handleAddMultiScreenFieldPress(globalFieldArrayHelper)}>Add Timer</Button>
                            </View>
                        </View>
                </View>
            )}
        />
    )
}

type GlobalFieldConfigProps = {
    field: GlobalFieldConfig;
    index: number;
    arrayHelper: FieldArrayRenderProps;
}

function GlobalFieldConfigView({
    field,
    index,
    arrayHelper,
}: GlobalFieldConfigProps) {
    const theme = useTheme();
    const styles = makeGlobalFieldStyles(theme);

    function handleDelete() {
        arrayHelper.remove(index);
    }

    return (
        <View style={styles.container}>
            <View style={styles.configWrap}>
                <View style={styles.row}>
                    <FormInput
                        fieldName={`${field.name}.label`}
                        label='Label'
                    />
                </View>
                <View style={styles.row}>
                    <FormSelectField
                        fieldName={`${field.name}.position`}
                        options={[{ label: 'Floating Button', value: 'FLOATING_BUTTON_BR' }, { label: 'Heading', value: 'HEADER' }]} 
                        label='Position'            
                    />
                </View>
                <View style={styles.row}>
                    <FormSelectField
                        fieldName={`${field.name}.startTrigger`}
                        options={[{ label: 'Manual', value: 'MANUAL' }, { label: 'On Form Created', value: 'ON_FORM_CREATED' }]} 
                        label='Start Trigger'            
                    />
                </View>
            </View>
            <View style={{ justifyContent: 'flex-start', alignItems: 'center', alignContent: 'center'}}>
                <DotsPopupMenu
                    size={20}
                    actions={[
                        { key: 'delete', label: 'Delete', onPress: handleDelete }
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
        borderBottomColor: theme.colors.outlineVariant, 
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