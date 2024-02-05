import { StyleSheet, TouchableOpacity, View, } from "react-native";
import { FormScreenConfig, } from "../../lib/config";
import { Text,  MD3Theme, } from 'react-native-paper';
import React from 'react';

export type DrawerScreenContentProps = {
    theme: MD3Theme;
    onScreenChange: (index: number) => void;
    screens: FormScreenConfig[];
    screenIndex: number;
    onAddScreenPress: () => void;
}

export function DrawerScreenContent({
    theme,
    onScreenChange,
    screens,
    screenIndex,
    onAddScreenPress
}: DrawerScreenContentProps) {
    const styles = makeStyles(theme);

    return (
        <View style={styles.navContainer}>
            <TouchableOpacity onPress={() => onScreenChange(-1)} style={{ ...styles.row, ...(screenIndex === -1 ? styles.activeRow : {}) }}>
                <Text style={styles.header}>
                    Form Settings
                </Text>
            </TouchableOpacity>
            <View style={styles.screensContainer}>
                <View style={styles.row}>
                    <Text style={styles.header}>
                        Screens
                    </Text>
                </View>
                {
                    screens.map((screen, index) => (
                        <TouchableOpacity
                            key={`navbar-screen-${index}`}
                            onPress={() => onScreenChange(index)}
                            style={{ ...styles.row, ...styles.screenRow, ...(screenIndex === index ? styles.activeRow : {}) }}
                        >
                            <Text style={styles.label}>
                                {`${screen.title || `Screen ${index + 1}`}`}
                            </Text>
                        </TouchableOpacity>
                    ))
                }
                <TouchableOpacity
                    onPress={onAddScreenPress}
                    style={{ ...styles.row, ...styles.screenRow, ...styles.addScreenBtn }}
                >
                    <Text style={{ ...styles.label, color: theme.colors.onPrimary, }}>
                        Add Screen
                    </Text>
                </TouchableOpacity>
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
        paddingLeft: 24,
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