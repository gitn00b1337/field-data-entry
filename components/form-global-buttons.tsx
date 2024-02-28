import { StyleSheet, View } from "react-native";
import { FormEntry, FormEntryV2, FormEntryValues, GlobalField, } from "../lib/config";
import { FAB, MD3Theme, useTheme } from "react-native-paper";
import { Direction } from "./form-screen";
import { useEffect, useState } from "react";
import { FormTimerButton, TimerButton } from "./form-timer-button";
import { Stack } from "expo-router";
import { NavButton } from "./nav-button";
import { useFormikContext } from "formik";
import { DotsPopupMenu } from "./dots-popup-menu";

export type FormGlobalButtonsProps = {
    fields: GlobalField[];
    entry: FormEntryValues;
    isDesignMode?: boolean;
    setSelectedRowIndex?: (number: number) => void;
    onAddRowPress?: () => void;
    onChangeRowPress?: (direction: Direction) => void;
    onDiscardForm: () => void;
    onSubmitForm: () => void;
    onDeleteForm: () => void;
    onExportForm?: () => void;
}

export function FormGlobalButtons({
    fields,
    entry,
    isDesignMode,
    setSelectedRowIndex,
    onAddRowPress,
    onChangeRowPress,
    onDiscardForm,
    onSubmitForm,
    onDeleteForm,
    onExportForm,
}: FormGlobalButtonsProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const [buttonFields, setButtonFields] = useState(() => fields.filter(f => f.position === 'FLOATING_BUTTON_BR'));
    const [headerFields, setHeaderFields] = useState(() => fields.filter(f => f.position === 'HEADER'));
    const formContext = useFormikContext<FormEntryV2>();

    useEffect(() => {
        setButtonFields(
            fields.filter(f => f.position === 'FLOATING_BUTTON_BR')
        );
        setHeaderFields(
            fields.filter(f => f.position === 'HEADER')
        )
    }, [ fields ])
    
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
                                    field={f}
                                    isDesignMode={isDesignMode}
                                    setFormField={val => formContext.setFieldValue(`values.${f.entryKey}`, val)}
                                    formField={formContext.values.values[f.entryKey] as FormEntry<number>}
                                />
                            ))
                        }
                        <NavButton text='Save' onPress={onSubmitForm} />
                        <DotsPopupMenu
                            actions={[
                                { key: 'dpm_discard', label: 'Discard Changes', onPress: onDiscardForm, },
                                { key: 'dpm_delete', label: `Delete ${isDesignMode ? 'Template' : 'Form'}`, onPress: onDeleteForm, },
                                { key: 'dpm_export', label: 'Export', onPress: onExportForm },
                            ]}
                        />
                    </View>
                )
            }}
        />
        {
            isDesignMode && (
                <>
                    <FAB
                        icon="plus"
                        style={{ ...styles.fab, }}
                        onPress={onAddRowPress}
                        color={theme.colors.onPrimary}
                    />
                    <FAB
                        icon="arrow-up-bold"
                        style={{ ...styles.fab, backgroundColor: theme.colors.background, }}
                        onPress={() => handleChangeRowPress('UP')}
                        color={theme.colors.secondary}
                    />
                    <FAB
                        icon="arrow-down-bold"
                        style={{ ...styles.fab, backgroundColor: theme.colors.background, }}
                        onPress={() => handleChangeRowPress('DOWN')}
                        color={theme.colors.secondary}
                    />
                </>
            )
        }   
        {
            buttonFields.map(f => (
                <FormTimerButton 
                    key={`${f.key}`} 
                    field={f} 
                    isDesignMode={isDesignMode}
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