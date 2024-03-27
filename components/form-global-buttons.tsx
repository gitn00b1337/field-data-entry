import { StyleSheet, View } from "react-native";
import { FormEntryV2, } from "../lib/config";
import { Button, MD3Theme, useTheme } from "react-native-paper";
import { Direction } from "./form-screen";
import React, { useEffect, useState } from "react";
import { FormTimerButton, } from "./form-timer-button";
import { Stack, useRouter } from "expo-router";
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
    screenIndex: number;
    onChangeScreen: (newIndex: number) => void;
    screenCount: number;
    onSubmit: () => void;
}

export function FormGlobalButtons({
    control,
    isDesignMode,
    onChangeRowPress,
    onDiscardForm,
    onSubmitForm,
    onDeleteForm,
    onExportForm,
    onChangeScreen,
    screenIndex,
    screenCount,
    onSubmit,
}: FormGlobalButtonsProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const router = useRouter();
    
    const isLastScreen = screenCount === (screenIndex + 1);

    const fields = useWatch({
        control,
        name: 'config.globalFields',
    });

    const [buttonFields, setButtonFields] = useState(() => fields.filter(f => f.position === 'FLOATING_BUTTON_BR'));
    const [headerFields, setHeaderFields] = useState(() => fields.filter(f => f.position === 'HEADER'));

    useEffect(() => {
        // console.log('ON DELETE')
         // correct the indexes for template (handling deletes)
        const withNameRight = fields
            .map((f, i) => {
                return {
                    ...f,
                    name: `config.globalFields[${i}]`
                }
            });
            // console.log(withNameRight)
        setButtonFields(
            withNameRight.filter(f => f.position === 'FLOATING_BUTTON_BR')
        );
        setHeaderFields(
            withNameRight.filter(f => f.position === 'HEADER')
        )
    }, [fields])

    function handleChangeRowPress(direction: Direction) {
        if (typeof onChangeRowPress === 'function') {
            onChangeRowPress(direction);
        }
    }
    
    async function handleNextPress() {
        if (isLastScreen) {
            try {
                await onSubmit();
                
                if (router.canGoBack()) {
                    router.back();
                }
                else {
                    router.replace('/');
                }
            }
            catch (e) {
                console.error(e);
            }
        }
        else {
            onChangeScreen(screenIndex + 1);
        }
    }

    return (
        <View style={styles.positioner}>
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <View style={styles.headerButtonsContainer}>
                            {
                                headerFields.map((f, i) => (
                                    <FormTimerButton
                                        key={f.key}
                                        position={f.position}
                                        label={f.label}
                                        control={control}
                                        entryKey={f.entryKey}
                                        name={f.name}
                                    />
                                ))
                            }
                            <NavButton text='Save' onPress={onSubmitForm} />
                            <DotsPopupMenu
                                iconColor="#fff" 
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
            <View style={styles.container}>
                <View style={styles.backBtnContainer}>
                {
                    !isDesignMode && screenIndex > 0 && (
                        <Button 
                            style={styles.backBtn}
                            mode="contained-tonal"
                            buttonColor={theme.colors.secondary}
                            textColor={'#fff'}
                            labelStyle={styles.nextBtnLabel}
                            onPress={() => onChangeScreen(screenIndex -1)}
                        >
                            Back
                        </Button>
                    )
                }
                </View>
                <View style={styles.globalBtnsContainer}>
                {
                    buttonFields.map((f, fi) => (
                        <FormTimerButton
                            key={`${f.key}`}
                            entryKey={f.entryKey}
                            position={f.position}
                            label={f.label}
                            control={control}
                            name={f.name}
                        />
                    ))
                }
                </View>
                <View style={styles.finishBtnContainer}>
                    <Button
                        style={styles.nextBtn}
                        mode="contained-tonal"
                        buttonColor={theme.colors.secondary}
                        textColor={'#fff'}
                        labelStyle={styles.nextBtnLabel}
                        onPress={handleNextPress}
                    >
                        { isLastScreen ? 'Finish' : 'Next' }
                    </Button>
                </View>
            </View>
        </View>
    )
}



const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    finishBtnContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    globalBtnsContainer: {
        flexGrow: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        columnGap: 12,
    },
    backBtnContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextBtn: {
        borderRadius: theme.roundness,
        alignSelf: 'flex-end',
        marginVertical: 0,
        paddingVertical: 0,
    },
    backBtn: {
        borderRadius: 5,
    },
    nextBtnLabel: {
        textTransform: 'uppercase',
        fontWeight: '900',
    },
    positioner: {
        height: 60,
    },
    container: {
        position: 'absolute',
        bottom: 0,
        paddingHorizontal: 24,
        right: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#DDDDDD',
        backgroundColor: '#fff',
        height: 66,
    },
    headerButtonsContainer: {
        justifyContent: 'flex-end',
        flexDirection: 'row',
        gap: 12,
    },
})