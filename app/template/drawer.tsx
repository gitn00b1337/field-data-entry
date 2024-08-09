import { StyleSheet, TouchableOpacity, View, } from "react-native";
import { FormConfig, FormEntryV2, FormScreenConfig, createFieldConfig, createFieldEntry, } from "../../lib/config";
import { useTheme, MD3Theme, IconButton, } from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import { useGlobalState } from "../global-state";
import { DrawerScreenContent } from "./drawer-screen-content";
import { DrawerRowContent } from "./drawer-row-content";
import { DrawerFieldContent } from "./drawer-field-content";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";
import { DrawerSettingsContent } from "./drawer-settings-content";
import { DrawerTriggersContent } from "./drawer-triggers-content";
import { DrawerTimersContent } from "./drawer-timers-content";
import { Control, FormState, UseFormRegister, UseFormSetValue, UseFormWatch, useFieldArray, useWatch } from "react-hook-form";
import { DeviceMotion, DeviceMotionOrientation } from "expo-sensors";
import { ScrollView } from "react-native-gesture-handler";

export type DrawerConfigType = 'NAV' | 'ROW' | 'FIELD' | 'TRIGGER' | 'SETTINGS' | 'TIMERS';

export type DrawerMenuProps = {
    onScreenChange: (index: number) => void;
    screenIndex: number;
    selectedRowIndex: number;
    selectedFieldIndex: number;
    onFieldAdded: (fieldIndex: number) => void;
    onEditFieldPress: (fieldIndex: number) => void;
    onFieldDeleted: (fieldIndex: number) => void;
    onAddScreen: () => void;
    onDeleteScreen: (screenIndex: number) => void;
    setValue: UseFormSetValue<FormEntryV2>;
    control: Control<FormEntryV2, any>;
    onAddRow: () => void;
    onDeleteRow: (rowIndex: number) => void;
    onRowPress: (rowIndex: number) => void;
}

export function DrawerMenu({
    onScreenChange,
    screenIndex,
    selectedRowIndex,
    selectedFieldIndex,
    control,
    setValue,
    onAddScreen,
    onDeleteScreen,
    onFieldAdded,
    onEditFieldPress,
    onDeleteRow,
    onFieldDeleted,
    onRowPress,
    onAddRow,
}: DrawerMenuProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const [state, dispatch] = useGlobalState();
    const fieldName = `screens[${screenIndex}].rows[${selectedRowIndex}]`;
    const screens = useWatch({
        name: 'config.screens',
        control,
    });
    const [isPortrait, setIsPortrait] = useState(false);

    useEffect(() => {
        const subscription = DeviceMotion.addListener(({ orientation }) => {
            const isPortrait = orientation == DeviceMotionOrientation.Portrait
                || orientation == DeviceMotionOrientation.UpsideDown;

            setIsPortrait(isPortrait);
        });

        return () => DeviceMotion.removeSubscription(subscription);
    }, []);

    const {
        append: appendField,
        remove: removeField,
        move: moveField,
    } = useFieldArray({
        control,
        name: `config.screens.${screenIndex}.rows.${selectedRowIndex}.fields`
    });

    function handleDeleteField(fieldIndex: number) {
        removeField(fieldIndex);
        onFieldDeleted(fieldIndex);

        dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW');
    }

    function handleAddField() {
        const fieldCount = screens[screenIndex]?.rows[selectedRowIndex]?.fields?.length;

        if (typeof fieldCount !== 'number') {
            return;
        }

        const name = `screens[${screenIndex}].rows[${selectedRowIndex}].fields[${fieldCount}]`;
        const newField = createFieldConfig({ name, type: 'TEXT', });
        const entry = createFieldEntry();

        appendField(newField);
        setValue(`values.${newField.entryKey}`, entry);
        onFieldAdded(fieldCount);
    }

    function handleMoveField(from: number, to: number) {
        moveField(from, to);
    }

    const activeScreen = screens && screens[screenIndex];

    if (!state.drawerVisible) {
        return null;
    }

    return (
        <View style={[isPortrait && styles.portraitDrawer, !isPortrait && styles.landscapeDrawer ]}>
            <ScrollView contentContainerStyle={{
            }}>
                <View style={[
                    {
                        ...styles.container,
                        display: state.drawerVisible ? 'flex' : 'none',
                        position: 'relative',
                    },
                    isPortrait && styles.portraitContainer,
                ]}>
                    {
                        state.configType === 'NAV' && (
                            <DrawerScreenContent
                                theme={theme}
                                control={control}
                                onScreenChange={onScreenChange}
                                screenIndex={screenIndex}
                                onAddScreen={onAddScreen}
                                onDeleteScreen={onDeleteScreen}
                            />
                        )
                    }
                    {
                        state.configType === 'ROW' && (
                            <DrawerRowContent
                                theme={theme}
                                selectedRowIndex={selectedRowIndex}
                                fieldName={fieldName}
                                screenIndex={screenIndex}
                                screen={activeScreen}
                                setValue={setValue}
                                control={control}
                                onAddField={handleAddField}
                                onEditFieldPress={onEditFieldPress}
                                onDeleteRow={onDeleteRow}
                                onChangeRowPress={onRowPress}
                                onAddRow={onAddRow}
                                onMoveField={handleMoveField}
                            />
                        )
                    }
                    {
                        state.configType === 'FIELD' && (
                            <DrawerFieldContent
                                theme={theme}
                                fieldIndex={selectedFieldIndex}
                                rowIndex={selectedRowIndex}
                                screenIndex={screenIndex}
                                onDeleteField={handleDeleteField}
                                control={control}
                                setValue={setValue}
                            />
                        )
                    }
                    {
                        state.configType === 'SETTINGS' && (
                            <DrawerSettingsContent
                                control={control}
                            />
                        )
                    }
                    {
                        state.configType === 'TRIGGER' && (
                            <DrawerTriggersContent
                                theme={theme}
                                screen={screens[screenIndex]}
                                screenIndex={screenIndex}
                                control={control}
                            />
                        )
                    }
                    {
                        state.configType === 'TIMERS' && (
                            <DrawerTimersContent
                                control={control}
                                theme={theme}
                            />
                        )
                    }
                </View>
            </ScrollView>
            <View style={[styles.actionsContainer,]}>
                <ActionButton
                    onPress={() => dispatch('SET_DRAWER_CONFIG_TYPE', 'SETTINGS')}
                    icon='cog'
                    isFocused={state.configType === 'SETTINGS'}
                />
                <ActionButton
                    onPress={() => dispatch('SET_DRAWER_CONFIG_TYPE', 'NAV')}
                    icon='monitor-small'
                    isFocused={state.configType === 'NAV'}
                />
                <ActionButton
                    onPress={() => dispatch('SET_DRAWER_CONFIG_TYPE', 'TIMERS')}
                    icon='timer'
                    isFocused={state.configType === 'TIMERS'}
                />
            </View>
        </View>
    )
}

type ActionButtonProps = {
    onPress: () => void;
    icon: IconSource;
    isFocused: boolean;
}

function ActionButton({
    onPress,
    icon,
    isFocused,
}: ActionButtonProps) {
    const theme = useTheme();

    return (
        <TouchableOpacity
            style={actionStyles.actionBtnContainer}
            onPress={onPress}
        >
            <IconButton
                style={actionStyles.actionBtn}
                icon={icon}
                size={22}
                iconColor={isFocused ? theme.colors.primary : undefined}
            />
        </TouchableOpacity>
    )
}

const actionStyles = StyleSheet.create({
    actionBtnContainer: {
        display: 'flex',
        flexGrow: 1,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 12,
        paddingTop: 12,
    },
    actionBtn: {
        padding: 0,
        margin: 0,
        height: 28,
        width: 28,
    },
    actionBtnText: {
        fontSize: 28,
    },
});

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    portraitDrawer: {
        borderColor: '#DDDDDD',
        borderWidth: 1,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        elevation: 12,
        overflow: 'hidden',
        backgroundColor: theme.colors.surface,
        paddingTop: 12,
        marginTop: 12,
        height: '50%',
        position: 'relative',
        paddingBottom: 52
    },
    landscapeDrawer: {
        width: '35%',
        // maxWidth: 450,
        position: 'relative',
        minHeight: '100%',
        paddingBottom: 52,
        backgroundColor: theme.colors.surface,
    },
    container: {
        alignContent: 'stretch',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        // backgroundColor: '#fff',
        flex: 1,
        paddingBottom: 24,
    },
    portraitContainer: {
        width: '100%',
        maxWidth: undefined,
        // backgroundColor: '#fff',
        minHeight: 435,
        height: '45%',
    },
    actionsContainer: {
        width: '100%',
        alignSelf: 'flex-end',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'stretch',
        alignContent: 'stretch',
        borderTopWidth: 1,
        borderTopColor: theme.colors.surface,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: '#fff',
    },
    portraitBottomActions: {

    }
})