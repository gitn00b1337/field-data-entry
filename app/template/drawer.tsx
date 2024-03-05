import { StyleSheet, TouchableOpacity, View, } from "react-native";
import { FormConfig, FormFieldConfig, FormRow, FormScreenConfig,  } from "../../lib/config";
import { Button, useTheme, MD3Theme, IconButton,  } from 'react-native-paper';
import React from 'react';
import { useGlobalState } from "../global-state";
import { FieldArrayRenderProps } from "formik";
import { DrawerScreenContent } from "./drawer-screen-content";
import { DrawerRowContent } from "./drawer-row-content";
import { DrawerFieldContent } from "./drawer-field-content";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";
import { DrawerSettingsContent } from "./drawer-settings-content";
import { DrawerTriggersContent } from "./drawer-triggers-content";

export type DrawerConfigType = 'NAV' | 'ROW' | 'FIELD' | 'TRIGGER' | 'SETTINGS';

export type DrawerMenuProps = {
    form: FormConfig;
    onScreenChange: (index: number) => void;
    screens: FormScreenConfig[];
    screenIndex: number;
    onAddScreenPress: () => void;
    selectedRowIndex: number;
    selectedFieldIndex: number;
    onAddFieldPress: (arrayHelper: FieldArrayRenderProps) => void;
    onEditFieldPress: (index: number) => void;
    onDeleteFieldPress: (arrayHelper: FieldArrayRenderProps, index: number) => void;
    onDeleteRowPress: (arrayHelper: FieldArrayRenderProps) => void;
    onChangeRowPress: (index: number) => void;
    onChangeFieldOrder: (from: number, to: number, arrayHelper: FieldArrayRenderProps) => void;
    onDeleteScreenPress: () => void;
}

export function DrawerMenu({
    form,
    onScreenChange,
    screens,
    screenIndex,
    onAddScreenPress,
    selectedRowIndex,
    onAddFieldPress,
    onEditFieldPress,
    onDeleteFieldPress,
    selectedFieldIndex,
    onDeleteRowPress,
    onChangeRowPress,
    onChangeFieldOrder,
    onDeleteScreenPress,
}: DrawerMenuProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const [state, dispatch] = useGlobalState();
    const fieldName = `screens[${screenIndex}].rows[${selectedRowIndex}]`;
    const activeScreen = screens[screenIndex];

    if (!state.drawerVisible) {
        return null;
    }

    return (
        <View style={{
            ...styles.container,
            display: state.drawerVisible ? 'flex' : 'none',
        }}>
            {
                state.configType === 'NAV' && (
                    <DrawerScreenContent
                        theme={theme}
                        onScreenChange={onScreenChange}
                        form={form}
                        screenIndex={screenIndex}
                        onAddScreenPress={onAddScreenPress}
                        onDeleteScreenPress={onDeleteScreenPress}
                    />
                )
            }
            {
                state.configType === 'ROW' && (
                    <DrawerRowContent
                        theme={theme}
                        selectedRowIndex={selectedRowIndex}
                        fieldName={fieldName}
                        onAddFieldPress={onAddFieldPress}
                        screenIndex={screenIndex}
                        onEditFieldPress={onEditFieldPress}
                        screen={activeScreen}
                        onDeleteRowPress={onDeleteRowPress}
                        onChangeRowPress={onChangeRowPress}
                        onChangeFieldOrder={onChangeFieldOrder}
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
                        onDeletePress={onDeleteFieldPress}
                        form={form}
                    />
                )
            }
            {
                state.configType === 'SETTINGS' && (
                    <DrawerSettingsContent
                        theme={theme}
                        form={form}
                    />
                )
            }
            {
                state.configType === 'TRIGGER' && (
                    <DrawerTriggersContent
                        theme={theme}
                        form={form}
                        screen={screens[screenIndex]}
                        screenIndex={screenIndex}
                    />
                )
            }
            <View style={styles.actionsContainer}>
                <ActionButton
                    onPress={() => dispatch('SET_DRAWER_CONFIG_TYPE', 'NAV')}
                    icon='monitor-small'
                    isFocused={state.configType === 'NAV'}
                />
                <ActionButton
                    onPress={() => dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW')}
                    icon='reorder-horizontal'
                    isFocused={state.configType === 'ROW'}
                />
                <ActionButton
                    onPress={() => dispatch('SET_DRAWER_CONFIG_TYPE', 'FIELD')}
                    icon='text-box-check-outline'
                    isFocused={state.configType === 'FIELD'}
                />
                <ActionButton
                    onPress={() => dispatch('SET_DRAWER_CONFIG_TYPE', 'TRIGGER')}
                    icon='lightning-bolt'
                    isFocused={state.configType === 'TRIGGER'}
                />
                <ActionButton
                    onPress={() => dispatch('SET_DRAWER_CONFIG_TYPE', 'SETTINGS')}
                    icon='cog'
                    isFocused={state.configType === 'SETTINGS'}
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
    container: {
        alignContent: 'stretch',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        borderRightColor: theme.colors.surface,
        borderRightWidth: 1,
        position: 'relative',
        width: '30%',
        maxWidth: 450,
        backgroundColor: '#fff',
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
    },  
})