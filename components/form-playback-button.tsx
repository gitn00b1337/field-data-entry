import { View, TouchableOpacity, StyleSheet, GestureResponderEvent, Alert } from "react-native";
import { FormEntryV2, GlobalFieldPosition, } from "../lib/config";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon, MD3Theme, Menu, Text, useTheme } from "react-native-paper";
import moment from "moment";
import { formatTotalSecondsToTimeString } from "../lib/utils";
import { Control, Path, useController, useWatch } from "react-hook-form";
import { TimerPosition } from "./form-timer-button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from 'expo-av';
import { AddButton } from "./add-button";

export type FormPlaybackButtonProps = {
    position: TimerPosition;
    label: string;
    isDisabled?: boolean;
    filePath: string;
}

export function FormPlaybackButton({
    position,
    label,
    isDisabled,
    filePath,
}: FormPlaybackButtonProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const soundRef = useRef<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [soundLoaded, setSoundLoaded] = useState(false);

    const clearDown = useCallback(async () => {
        console.log(`Clearing down sound!`);
        if (soundRef.current) {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
            soundRef.current = null;
        } else {
            console.warn(`No sound to clear!`)
        }
    }, [ soundRef.current ]);

    useEffect(() => {
        loadSound();

        return () => {
            clearDown();
        };
    }, []);

    function showNoFileFoundAlert() {
        Alert.alert("Error", "No file found for playback");
    }

    const handlePlayPress = useCallback(async () => {
        if (!filePath) {
            return showNoFileFoundAlert();
        }

        try {
            if (isPlaying && soundRef.current) {
                await soundRef.current.pauseAsync();
            } else {
                await playSound();
            }

            setIsPlaying(p => !p);
        } catch (error) {
            console.log(error);
        }
    }, [ soundRef.current ]);

    const playSound = useCallback(async () => {
        if (!soundLoaded || !soundRef.current) {
            await loadSound();
        }

        await soundRef.current.playAsync();
    }, [ soundRef.current ]);

    async function handleLongPress() {
        await soundRef.current?.stopAsync();
        setIsPlaying(false);
    }

    const loadSound = useCallback(async () => {
        try {
            if (!filePath) {
                return;
            }

            setSoundLoaded(false);

            const { sound } = await Audio.Sound.createAsync(
                { uri: filePath },
                { shouldPlay: false }
            );
            soundRef.current = sound;

            sound.setOnPlaybackStatusUpdate((status) => {
                if ('didJustFinish' in status && status.didJustFinish) {
                    soundRef.current.unloadAsync();
                    soundRef.current = null;
                    setIsPlaying(false);
                } else if ('error' in status && !!status.error) {
                    soundRef.current.unloadAsync();
                    soundRef.current = null;
                    setIsPlaying(false);
                    console.log(status.error);
                }
            });

            await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
            setSoundLoaded(true);
        } catch (e) {
            console.error(e);
        }
    }, [ soundRef.current ]);

    function getExtraStyles() {
        switch (position) {
            case 'HEADER':
                return {
                    iconColor: theme.colors.onSecondaryContainer,
                };

            case 'FLOATING_BUTTON_BR':
                return {
                    iconColor: theme.colors.onPrimaryContainer,
                };

            case 'IN_FORM':
                return {
                    iconColor: theme.colors.onPrimaryContainer,
                }

            default:
                return { label: {}, container: {} };
        }
    }

    const { iconColor } = getExtraStyles();

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handlePlayPress}
            onLongPress={handleLongPress}
        >
            <View style={styles.labelContainer}>
                <Text style={styles.label}>{label || 'Play'}</Text>
            </View>
            <View style={styles.iconContainer}>
                <Icon
                    source={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color={iconColor}
                />
            </View>
        </TouchableOpacity>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    labelContainer: {
        flex: 1,
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center'
    },
    label: {
        verticalAlign: 'middle',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 20,
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: theme.roundness,
        paddingHorizontal: 12,
        borderColor: '#DDDDDD',
        borderWidth: 1,
        maxWidth: 120,
        width: 100,
        height: 40,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
        flexDirection: 'row',
    },
})