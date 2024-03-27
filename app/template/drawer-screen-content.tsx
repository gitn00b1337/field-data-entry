import { StyleSheet, TouchableOpacity, View, } from "react-native";
import { FormEntryV2, createFieldConfig, createFormRow, createFormScreenConfig, } from "../../lib/config";
import { Text,  MD3Theme, Button, } from 'react-native-paper';
import React from 'react';
import { DotsPopupMenu } from "../../components/dots-popup-menu";
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { AddButton } from "../../components/add-button";

export type DrawerScreenContentProps = {
    theme: MD3Theme;
    onScreenChange: (index: number) => void;
    screenIndex: number;
    control: Control<FormEntryV2, any>;
    onAddScreen: () => void;
    onDeleteScreen: (screenIndex: number) => void;
}

export function DrawerScreenContent({
    theme,
    onScreenChange,
    screenIndex,
    onAddScreen,
    onDeleteScreen,
    control,
}: DrawerScreenContentProps) {
    const styles = makeStyles(theme);
     
    const screens = useWatch({
        control,
        name: 'config.screens',
    });

    function handleScreenPress(newScreenIndex: number) {
        onScreenChange(newScreenIndex);
    }

    return (
        <View style={styles.navContainer}>
            <View style={styles.screensContainer}>
                <View style={styles.row}>
                    <Text style={styles.header}>
                        Screens
                    </Text>
                </View>
                {
                    screens.map((screen, index) => (
                        <View 
                            key={screen.key}
                            style={{ ...styles.row, ...styles.screenRow, ...(screenIndex === index ? styles.activeRow : {}) }}
                        >
                            <TouchableOpacity
                                onPress={() => handleScreenPress(index)}
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
                                        { 
                                            key: 'delete', 
                                            label: 'Delete', 
                                            onPress: () => onDeleteScreen(index),
                                        }
                                    ]}
                                />
                            </View>
                        </View>
                    ))
                }
                <View style={styles.row}>
                    <View style={{ flexGrow: 1, alignItems: 'center', paddingVertical: 12, }}>
                        <AddButton 
                            onPress={onAddScreen} 
                            label="Add Screen"
                            style={{ width: 135, maxWidth: 150 }}
                        />
                    </View>
                </View>
            </View>
        </View>
    )
}

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