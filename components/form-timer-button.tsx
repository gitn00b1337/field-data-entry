import { View, TouchableOpacity, StyleSheet } from "react-native";
import { FormEntryValue, GlobalFieldConfig, } from "../lib/config";
import { useEffect, useMemo, useRef, useState } from "react";
import { FieldInputProps, connect, useField, } from "formik";
import { Icon, MD3Theme, Text, useTheme } from "react-native-paper";
import moment from "moment";
import { formatTotalSecondsToTimeString } from "../lib/utils";

export type FormTimerButtonProps = {
    field: GlobalFieldConfig;
    isDesignMode: boolean;
}

export function FormTimerButton(props: FormTimerButtonProps) {
    const [formField, timeMeta, timeHelpers] = useField(`values.${props.field.entryKey}`);

    return (
        <TimerButton
            {...props}
            formField={formField.value}
            setFormField={timeHelpers.setValue}
        />
    )
}

type TimerButtonProps = FormTimerButtonProps & {
    formField: FormEntryValue<number>;
    setFormField: (val: FormEntryValue<number>) => void;
}

/**
 * Header bar lies outside formik context reach so need a separate timer button 
 */
export function TimerButton({
    field,
    formField,
    setFormField,
}: TimerButtonProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);

    const [isRunning, setIsRunning] = useState(formField?.meta?.state === 'RUNNING');
    const [currentTime, setCurrentTime] = useState(formField?.value || 0);

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

    const isHeaderButton = field.position === 'HEADER';

    return (
        <TouchableOpacity onPress={handlePress} style={[styles.container, isHeaderButton && styles.headerContainer]}>
            <View style={{ flexGrow: 1, }}>
                <Text style={[styles.label, isHeaderButton && styles.headerLabel]} numberOfLines={1} ellipsizeMode='tail'>{ field.label || 'Timer' }</Text>
                <Text style={[styles.time, isHeaderButton && styles.headerTime]} numberOfLines={1} ellipsizeMode='tail'>{timeStr}</Text>
            </View>
            <View>
                <Icon
                    source={isRunning ? 'pause' : 'play'}
                    size={24}
                    color={isHeaderButton ? theme.colors.onSecondaryContainer : theme.colors.onPrimary }
                />
            </View>            
        </TouchableOpacity>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
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