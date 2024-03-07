import { View, TouchableOpacity, StyleSheet, GestureResponderEvent } from "react-native";
import { FormEntryValue, GlobalFieldConfig, GlobalFieldPosition, } from "../lib/config";
import { useEffect, useMemo, useRef, useState } from "react";
import { FieldInputProps, connect, useField, } from "formik";
import { Icon, MD3Theme, Menu, Text, useTheme } from "react-native-paper";
import moment from "moment";
import { formatTotalSecondsToTimeString } from "../lib/utils";

export type TimerPosition = GlobalFieldPosition | 'IN_FORM';

export type FormTimerButtonProps = {
    entryKey: string;
    position: TimerPosition;
    label: string;
}

export function FormTimerButton(props: FormTimerButtonProps) {
    const [formField, timeMeta, timeHelpers] = useField(`values.${props.entryKey}`);

    return (
        <TimerButton
            position={props.position}
            formField={formField.value}
            setFormField={timeHelpers.setValue}
            label={props.label}
        />
    )
}

type TimerButtonProps = {
    position: TimerPosition,
    formField: FormEntryValue<number>;
    setFormField: (val: FormEntryValue<number>) => void;
    label: string;
}

/**
 * Header bar lies outside formik context reach so need a separate timer button 
 */
export function TimerButton({
    position,
    formField,
    setFormField,
    label,
}: TimerButtonProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);

    const [isRunning, setIsRunning] = useState(formField?.meta?.state === 'RUNNING');
    const [currentTime, setCurrentTime] = useState(formField?.value || 0);
    const [showResetMenu, setShowResetMenu] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 })

    const timeStr = useMemo(() => 
        formatTotalSecondsToTimeString(formField?.value)
    , [ formField?.value ]);

    const intervalRef = useRef<NodeJS.Timeout>();

    function startTimer() {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        setFormField({
            value: formField?.value || 0,
            meta: {
                state: 'RUNNING',
                history: [
                    ...(formField?.meta?.history || []),
                    { state: 'RUNNING', timestamp: moment().utc().toISOString() },
                ],
                lastValue: currentTime,
            },
        });
        
        setCurrentTime(formField?.value || 0);
        intervalRef.current = setInterval(onInterval, 1000);
    }

    function stopTimer() {
        clearInterval(intervalRef.current);

        setFormField({
            ...formField,
            value: currentTime,
            meta: {
                state: 'STOPPED',
                history: [
                    ...(formField.meta?.history || []),
                    { state: 'STOPPED', timestamp: moment().utc().toISOString() },
                ],
                lastValue: currentTime,
            },
        });
    }

    function onInterval() {
        setCurrentTime(t => t + 1);
    }

    useEffect(() => {
        setFormField({
            ...formField,
            value: currentTime,
        });
    }, [currentTime])

    useEffect(() => {
        if (isRunning) {
            console.log('Starting timer')
            startTimer();
        }
        else {
            console.log('Stopping timer')
            stopTimer();
        }
        return stopTimer;
    }, [isRunning]);

    function handlePress() {
        setIsRunning(!isRunning);
    }

    function getExtraStyles() {
        switch (position) {
            case 'HEADER':
                return {
                    extraLabelStyles: styles.headerLabel,
                    extraContainerStyles: styles.headerContainer,
                    extraTimeStyles: styles.headerTime,
                    iconColor: theme.colors.onSecondaryContainer,
                };

            case 'FLOATING_BUTTON_BR':
                return {
                    extraLabelStyles: {},
                    extraContainerStyles: {},
                    extraTimeStyles: {},
                    iconColor: theme.colors.onPrimaryContainer,
                };

            case 'IN_FORM': 
                return {
                    extraLabelStyles: styles.formLabel,
                    extraContainerStyles: styles.formContainer,
                    extraTimeStyles: styles.formTime,
                    iconColor: theme.colors.onPrimaryContainer,
                }

            default:
                return { label: {}, container: {} };
        }
    }

    function handleLongPress(event: GestureResponderEvent) {
        const { nativeEvent } = event;
        const anchor = {
            x: nativeEvent.pageX,
            y: nativeEvent.pageY,
        };

        setMenuAnchor(anchor);
        setShowResetMenu(true);
    }

    function handleReset() {
        setIsRunning(false);
        setCurrentTime(0);
        setShowResetMenu(false);
    }

    const { extraLabelStyles, extraContainerStyles, extraTimeStyles, iconColor } = getExtraStyles(); 

    return (
        <>
        <TouchableOpacity 
            onPress={handlePress} 
            onLongPress={handleLongPress}
            style={[styles.container, extraContainerStyles ]}
        >
            <View style={{ flexGrow: 1, }}>
                <Text style={[styles.label, extraLabelStyles]} numberOfLines={1} ellipsizeMode='tail'>{ label || 'Timer' }</Text>
                <Text style={[styles.time, extraTimeStyles]} numberOfLines={1} ellipsizeMode='tail'>{timeStr}</Text>
            </View>
            <View>
                <Icon
                    source={isRunning ? 'pause' : 'play'}
                    size={24}
                    color={iconColor}
                />
            </View>            
        </TouchableOpacity>
        <Menu
            visible={showResetMenu}
            onDismiss={() => setShowResetMenu(false)}
            anchor={menuAnchor}
            contentStyle={styles.resetMenuContent}
        >
            <Menu.Item onPress={handleReset} title='Reset' />
        </Menu>
        </>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    resetMenuContent: {
        backgroundColor: '#fff',
    },
    formContainer: {
        backgroundColor: '#fff',
        shadowColor: theme.colors.surface,
        borderRadius: theme.roundness,
        flexGrow: 1,
        maxWidth: 240,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    formLabel: {
        color: theme.colors.onPrimaryContainer,
        fontSize: 12,
        paddingBottom: 0,
        lineHeight: 12,
        paddingTop: 6,
    },
    formTime: {
        color: theme.colors.onPrimaryContainer,
        padding: 0,
        margin: 0,
        lineHeight: 16,
        fontSize: 16,
    },
    container: {
        backgroundColor: theme.colors.primary,
        shadowColor: theme.colors.surface,
        width: 150,
        borderRadius: 20,
        padding: 12,
        justifyContent: 'flex-start',
        alignContent: 'stretch',
        alignItems: 'center',
        flexDirection: 'row',
    },
    headerContainer: {
        padding: 6,
        borderRadius: 5,
        backgroundColor: theme.colors.background,
    },
    headerLabel: {
        marginBottom: 0,
        paddingBottom: 2,
        lineHeight: 12,
        color: theme.colors.onSecondaryContainer,
    },
    headerTime: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        lineHeight: 12,
        color: theme.colors.onSecondaryContainer,
    },
    time: {
        color: theme.colors.onPrimary
    },
    label: {
        fontSize: 10,
        color: theme.colors.onPrimary,
        overflow: 'hidden',
    }
})