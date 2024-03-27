import { View, TouchableOpacity, StyleSheet, GestureResponderEvent } from "react-native";
import { FormEntryV2, GlobalFieldPosition, } from "../lib/config";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, MD3Theme, Menu, Text, useTheme } from "react-native-paper";
import moment from "moment";
import { formatTotalSecondsToTimeString } from "../lib/utils";
import { Control, Path, useController, useWatch } from "react-hook-form";

export type TimerPosition = GlobalFieldPosition | 'IN_FORM';

export type FormTimerButtonProps = {
    name: string;
    entryKey: string;
    position: TimerPosition;
    label: string;
    control: Control<FormEntryV2, any>;
    onPress?: () => void;
    isDisabled?: boolean;
}

export function FormTimerButton({
    name,
    entryKey,
    position,
    label,
    control,
    onPress,
    isDisabled,
}: FormTimerButtonProps) {
    const field = useWatch({ 
        control,
        name: `${name}.label` as Path<FormEntryV2>,
    })

    return (
        <TimerButton
            position={position}
            label={label}
            control={control}
            entryKey={entryKey}
            onPress={onPress}
            isDisabled={isDisabled}
        />
    )
}

type TimerButtonProps = {
    position: TimerPosition,
    label: string;
    control: Control<FormEntryV2, any>;
    entryKey: string;
    onPress?: () => void;
    isDisabled?: boolean;
}

/**
 * Header bar lies outside context reach so need a separate timer button 
 */
export function TimerButton({
    position,
    label,
    control,
    entryKey,
    onPress,
    isDisabled,    
}: TimerButtonProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);

    const {
        field,
    } = useController({
        control,
        name: `values.${entryKey}`
    });

    const [isRunning, setIsRunning] = useState<boolean>(field?.value?.meta?.state === 'RUNNING');
    const [currentTime, setCurrentTime] = useState<number>(Number(field?.value?.value) || 0);
    const [showResetMenu, setShowResetMenu] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 })

    const timeStr = useMemo(() => 
        formatTotalSecondsToTimeString(Number(field?.value?.value))
    , [ field?.value?.value ]);

    const intervalRef = useRef<NodeJS.Timeout>();

    function startTimer() {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        
        setIsRunning(true);
        setCurrentTime(Number(field?.value?.value) || 0);
        intervalRef.current = setInterval(onInterval, 1000);
    }

    function stopTimer() {
        clearInterval(intervalRef.current);
        setIsRunning(false);
    }

    function onInterval() {
        setCurrentTime(t => t + 1);
    }

    useEffect(() => {
        console.log(`Updating to ${currentTime}`)
        field.onChange({
            ...field.value,
            value: currentTime,
        });
    }, [currentTime]);

    useEffect(() => {
        const state = isRunning ? 'RUNNING' : 'STOPPED';

        field.onChange({
            value: currentTime,
            meta: {
                state,
                history: [
                    ...(field?.value?.meta?.history || []),
                    { state, timestamp: moment().utc().toISOString() },
                ],
                lastValue: currentTime,
            },
        });
        
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
        if (typeof onPress === 'function') {
            onPress();
        }

        if (!isDisabled) {
            setIsRunning(!isRunning);
        }        
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
                    extraLabelStyles: styles.floatingLabel,
                    extraContainerStyles: styles.floatingContainer,
                    extraTimeStyles: styles.floatingTime,
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
    const isGlobal = position === 'FLOATING_BUTTON_BR' || position === 'HEADER';

    return (
        <TouchableOpacity 
            onPress={handlePress} 
            onLongPress={handleLongPress}
            style={[styles.container, extraContainerStyles ]}
        >
            <View style={[{ flexGrow: 1,  }]}>
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
            <Menu
                visible={showResetMenu}
                onDismiss={() => setShowResetMenu(false)}
                anchor={menuAnchor}
                contentStyle={styles.resetMenuContent}
            >
                <Menu.Item onPress={handleReset} title='Reset' />
            </Menu>       
        </TouchableOpacity>
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
        maxWidth: 'auto',
        width: 'auto',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outline,
        marginBottom: 10,
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
        borderRadius: theme.roundness,
        backgroundColor: theme.colors.background,
    },
    headerLabel: {
        marginBottom: 0,
        paddingBottom: 2,
        lineHeight: 12,
        color: '#222222',
    },
    headerTime: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        lineHeight: 12,
        color: '#222222',
    },
    floatingContainer: {
        padding: 6,
        borderRadius: theme.roundness,
        height: 42,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderColor: '#dddddd',
        borderWidth: 1,
    },
    floatingLabel: {
        marginBottom: 0,
        lineHeight: 12,
        color: theme.colors.onPrimaryContainer,
    },
    floatingTime: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        lineHeight: 12,
        color: theme.colors.onPrimaryContainer,
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