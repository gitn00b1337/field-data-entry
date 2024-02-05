import { StyleSheet, TouchableOpacity, View, } from "react-native";
import { FormFieldConfig, FormRow, FormScreenConfig,  } from "../../lib/config";
import { Button, useTheme, MD3Theme,  } from 'react-native-paper';
import React from 'react';
import { useGlobalState } from "../global-state";
import { FieldArrayRenderProps } from "formik";
import { DrawerScreenContent } from "./drawer-screen-content";
import { DrawerRowContent } from "./drawer-row-content";
import { DrawerFieldContent } from "./drawer-field-content";

export type DrawerConfigType = 'NAV' | 'ROW' | 'FIELD';

export type DrawerMenuProps = {
    onScreenChange: (index: number) => void;
    screens: FormScreenConfig[];
    screenIndex: number;
    onAddScreenPress: () => void;
    selectedRow: FormRow | undefined;
    selectedRowIndex: number;
    selectedField: FormFieldConfig | undefined;
    selectedFieldIndex: number;
    onFieldPress: (index: number) => void;
    onAddFieldPress: (arrayHelper: FieldArrayRenderProps) => void;
    onEditFieldPress: (index: number) => void;
}

export function DrawerMenu({
    onScreenChange,
    screens,
    screenIndex,
    onAddScreenPress,
    selectedRow,
    selectedRowIndex,
    onFieldPress,
    onAddFieldPress,
    onEditFieldPress,
    selectedField,
    selectedFieldIndex,
}: DrawerMenuProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const [state, dispatch] = useGlobalState();
    const fieldName = `screens[${screenIndex}].rows[${selectedRowIndex}]`;

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
                        screens={screens}
                        screenIndex={screenIndex}
                        onAddScreenPress={onAddScreenPress}
                    />
                )
            }
            {
                state.configType === 'ROW' && (
                    <DrawerRowContent
                        theme={theme}
                        selectedRow={selectedRow}
                        selectedRowIndex={selectedRowIndex}
                        fieldName={fieldName}
                        onAddFieldPress={onAddFieldPress}
                        screenIndex={screenIndex}
                        onEditFieldPress={onEditFieldPress}
                    />
                )
            }
            {
                state.configType === 'FIELD' && (
                    <DrawerFieldContent
                        theme={theme}
                        field={selectedField}
                        fieldIndex={selectedFieldIndex}
                        rowIndex={selectedRowIndex}
                        screenIndex={screenIndex}
                    />
                )
            }
            <View style={styles.actionsContainer}>
                <TouchableOpacity onPress={() => dispatch('SET_DRAWER_CONFIG_TYPE', 'NAV')}>
                    <Button style={styles.actionBtn} icon='monitor-screenshot'>
                        &nbsp;
                    </Button>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW')}>
                    <Button style={styles.actionBtn} icon='format-list-numbered'>
                        &nbsp;
                    </Button>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => dispatch('SET_DRAWER_CONFIG_TYPE', 'FIELD')}>
                    <Button style={styles.actionBtn} icon='widgets'>
                        &nbsp;
                    </Button>
                </TouchableOpacity>
            </View>
        </View>
    )
}

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
    actionBtn: {
        padding: 0,
        margin: 0,
        height: 28,
        width: 28,
    },
    actionBtnText: {
        fontSize: 28,
    },    
    actionsContainer: {
        width: '100%',
        alignSelf: 'flex-end',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.surface,
    },    
})