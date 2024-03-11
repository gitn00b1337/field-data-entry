import { StyleSheet, View } from "react-native";
import { FormEntryV2, } from "../lib/config";
import { FAB, MD3Theme, useTheme } from "react-native-paper";
import { Direction } from "./form-screen";
import React, { useEffect, useState } from "react";
import { FormTimerButton, TimerButton, } from "./form-timer-button";
import { Stack } from "expo-router";
import { NavButton } from "./nav-button";
import { DotsPopupMenu } from "./dots-popup-menu";
import { Control, useWatch, } from "react-hook-form";

export type FormGlobalButtonsProps = {
    control: Control<FormEntryV2, any>;
    isDesignMode?: boolean;
    onChangeRowPress?: (direction: Direction) => void;
    onDiscardForm: () => void;
    onSubmitForm: () => Promise<void>;
    onDeleteForm: () => void;
    onExportForm?: () => void;
}

export function FormGlobalButtons({
    control,
    isDesignMode,
    onChangeRowPress,
    onDiscardForm,
    onSubmitForm,
    onDeleteForm,
    onExportForm,
}: FormGlobalButtonsProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);

    const fields = useWatch({
        control,
        name: 'config.globalFields',
    });

    const [buttonFields, setButtonFields] = useState(() => fields.filter(f => f.position === 'FLOATING_BUTTON_BR'));
    const [headerFields, setHeaderFields] = useState(() => fields.filter(f => f.position === 'HEADER'));

    useEffect(() => {
        setButtonFields(
            fields.filter(f => f.position === 'FLOATING_BUTTON_BR')
        );
        setHeaderFields(
            fields.filter(f => f.position === 'HEADER')
        )
    }, [fields])

    function handleChangeRowPress(direction: Direction) {
        if (typeof onChangeRowPress === 'function') {
            onChangeRowPress(direction);
        }
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <View style={styles.headerButtonsContainer}>
                            {
                                headerFields.map(f => (
                                    <TimerButton
                                        key={f.key}
                                        position={f.position}
                                        label={f.label}
                                        control={control}
                                        entryKey={f.entryKey}
                                    />
                                ))
                            }
                            <NavButton text='Save' onPress={onSubmitForm} />
                            <DotsPopupMenu
                                actions={[
                                    { key: 'dpm_discard', label: 'Quit', onPress: onDiscardForm, },
                                    { key: 'dpm_export', label: 'Export', onPress: onExportForm, hasDivider: true, },
                                    { key: 'dpm_delete', label: `Delete ${isDesignMode ? 'Template' : 'Form'}`, onPress: onDeleteForm, },
                                ]}
                            />
                        </View>
                    )
                }}
            />
            {
                buttonFields.map(f => (
                    <FormTimerButton
                        key={`${f.key}`}
                        entryKey={f.entryKey}
                        position={f.position}
                        label={f.label}
                        control={control}
                    />
                ))
            }
        </View>
    )
}



const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        padding: 24,
        right: 0,
        flexDirection: 'row',
        columnGap: 12,
    },
    fab: {
        backgroundColor: theme.colors.primary,
        shadowColor: theme.colors.surface,
    },
    headerButtonsContainer: {
        justifyContent: 'flex-start',
        flexDirection: 'row',
        gap: 12,
    },
})