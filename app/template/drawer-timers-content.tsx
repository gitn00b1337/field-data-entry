import { Alert, StyleSheet, View, } from "react-native";
import { FormEntryV2, GlobalFieldConfig, createGlobalField, } from "../../lib/config";
import { Text,  MD3Theme, Button, useTheme, TextInput } from 'react-native-paper';
import React from 'react';
import { DotsPopupMenu } from "../../components/dots-popup-menu";
import { FormSelectField } from "../../components/form-select";
import { FormInput } from "../../components/form-input";
import { Control, useController, useFieldArray, useWatch } from "react-hook-form";
import { AddButton } from "../../components/add-button";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DrawerTimersContentProps = {
    theme: MD3Theme;
    control: Control<FormEntryV2, any>;
}

export function DrawerTimersContent({
    theme,
    control,
}: DrawerTimersContentProps) {
    const styles = makeStyles(theme);

    const globalFields = useFieldArray({
        control,
        name: 'config.globalFields'
    })

    function handleAddMultiScreenFieldPress() {
        const field = createGlobalField({
            name: `config.globalFields.${globalFields.fields.length}`,
            type: 'TIMER',
            exportable: true,
        });

        globalFields.append(field);
    }

    function handleAddAudioButton() {
        const field = createGlobalField({
            name: `config.globalFields.${globalFields.fields.length}`,
            type: 'PLAYBACK_BUTTON',
            exportable: false,
        });

        globalFields.append(field);
    }

    return (
        <View style={styles.navContainer}>
            <View style={styles.screensContainer}>
                <View style={styles.row}>
                        <Text style={styles.header}>
                            Timers
                        </Text>
                    </View>
                </View>
                {
                    globalFields.fields
                        .map((f, index) => {
                            if (f.type !== 'TIMER') {
                                return null;
                            }

                            return (
                                <GlobalFieldConfigView 
                                    key={`timer-${f.entryKey}`} 
                                    field={f}
                                    onDelete={() => globalFields.remove(index)}
                                    control={control}
                                />
                            )
                        })
                }         
                <View style={styles.row}>
                    <View style={{ flexGrow: 1, alignItems: 'center', paddingBottom: 12, }}>
                        <AddButton 
                            onPress={handleAddMultiScreenFieldPress} 
                            label="Add Timer"
                            style={{ width: 150, maxWidth: 150 }}
                        />
                    </View>
                </View>
                <View style={styles.row}>
                    <Text style={styles.header}>
                        Audio
                    </Text>
                </View>
                {
                    globalFields.fields
                        .map((f, index) => {
                            if (f.type !== 'PLAYBACK_BUTTON') {
                                return null;
                            }

                            return (
                                <PlaybackButtonConfigView 
                                    key={`playback-${f.entryKey}`} 
                                    field={f}
                                    onDelete={() => globalFields.remove(index)}
                                    control={control}
                                />
                            )
                        })
                }     
                <View style={styles.row}>
                    <View style={{ flexGrow: 1, alignItems: 'center', paddingBottom: 12, }}>
                        <AddButton 
                            onPress={handleAddAudioButton} 
                            label="Add Audio"
                            style={{ width: 150, maxWidth: 150 }}
                        />
                    </View>
                </View>
        </View>
    )
}

type GlobalFieldConfigProps = {
    field: GlobalFieldConfig;
    onDelete: () => void;
    control: Control<FormEntryV2, any>;
}

type PlaybackButtonConfigProps = {
    field: GlobalFieldConfig;
    onDelete: () => void;
    control: Control<FormEntryV2, any>;
}

export function PlaybackButtonConfigView({
    field,
    onDelete,
    control,
}: PlaybackButtonConfigProps) {
    const theme = useTheme();
    const styles = makeGlobalFieldStyles(theme);
    
    const { field: filePathField, } = useController({
        control,
        name: `${field.name}.filePath` as any,
    });
    
    async function handleSelectFile() {
        try {
            const result = await DocumentPicker.getDocumentAsync({
              type: 'audio/mpeg',
              multiple: false,
            });

            if (!result.assets?.length || result.canceled) {
                return;
            }

            if (result.assets.length > 1) {
                Alert.alert('Only one file may be selected per button');
                return;
            }

            const asset = result.assets[0];

            // cache it within the app
            const cacheUri = FileSystem.cacheDirectory + asset.name;
            await FileSystem.copyAsync({
              from: asset.uri,
              to: cacheUri,
            });

            // cache the location to async storage
            filePathField.onChange(cacheUri);
          } catch (error) {
            console.log(error);
          }
    }

    const fileName = filePathField?.value?.split('/').pop() || 'Select File';

    return (
        <View style={styles.container}>
            <View style={styles.configWrap}>
                <View style={styles.row}>
                    <FormInput
                        fieldName={`${field.name}.label`}
                        label='Label'
                        control={control}
                    />
                </View>
                <View style={styles.row}>
                    <FormSelectField
                        fieldName={`${field.name}.position`}
                        options={[{ label: 'Floating Button', value: 'FLOATING_BUTTON_BR' }, { label: 'Heading', value: 'HEADER' }]} 
                        label='Position'           
                        control={control} 
                        defaultValue="FLOATING_BUTTON_BR"
                    />
                </View>
                <View style={styles.row}>
                    <TouchableOpacity onPress={handleSelectFile} style={{ position: 'relative', flexGrow: 1, }}>
                        <View style={{ zIndex: 10, position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, }} />
                        <TextInput
                            label='File'
                            value={fileName}
                            style={[styles.field]}
                            mode='flat'
                            outlineColor={theme.colors.onSurface}
                            textColor={theme.colors.onSurfaceDisabled}
                            underlineColor={theme.colors.outlineVariant}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.extraOptionsContainer}>
                <DotsPopupMenu
                    size={20}
                    actions={[
                        { 
                            key: 'delete', 
                            label: 'Delete', 
                            onPress: onDelete,
                        }
                    ]}
                />
            </View>
        </View>
    );
}

function GlobalFieldConfigView({
    field,
    onDelete,
    control,
}: GlobalFieldConfigProps) {
    const theme = useTheme();
    const styles = makeGlobalFieldStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.configWrap}>
                <View style={styles.row}>
                    <FormInput
                        fieldName={`${field.name}.label`}
                        label='Label'
                        control={control}
                    />
                </View>
                <View style={styles.row}>
                    <FormSelectField
                        fieldName={`${field.name}.position`}
                        options={[{ label: 'Floating Button', value: 'FLOATING_BUTTON_BR' }, { label: 'Heading', value: 'HEADER' }]} 
                        label='Position'           
                        control={control} 
                        defaultValue="FLOATING_BUTTON_BR"
                    />
                </View>
                <View style={styles.row}>
                    <FormSelectField
                        fieldName={`${field.name}.startTrigger`}
                        options={[{ label: 'Manual', value: 'MANUAL' }, { label: 'On Form Created', value: 'ON_FORM_CREATED' }]} 
                        label='Start Trigger'    
                        control={control}       
                        defaultValue='MANUAL' 
                    />
                </View>
            </View>
            <View style={styles.extraOptionsContainer}>
                <DotsPopupMenu
                    size={22}
                    actions={[
                        { 
                            key: 'delete', 
                            label: 'Delete', 
                            onPress: onDelete,
                        }
                    ]}
                />
            </View>
        </View>
    );
}

const makeGlobalFieldStyles = (theme: MD3Theme) => StyleSheet.create({
    extraOptionsContainer: { 
        justifyContent: 'flex-start', 
        alignItems: 'center', 
        alignContent: 'center', 
        width: 20, 
        paddingRight: 4, 
    },
    field: {
        backgroundColor: '#fff', 
        flexGrow: 1,
        marginBottom: 10,
        minWidth: '100%'
    },
    container: { 
        paddingBottom: 24, 
        marginBottom: 12, 
        marginHorizontal: 24,
        borderBottomColor: theme.colors.outline, 
        borderBottomWidth: 1, 
        alignContent: 'stretch',
        alignItems: 'stretch',
        flexDirection: 'row',
        paddingLeft: 12,
        paddingRight: 4,
        backgroundColor: '#fff',
        borderRadius: theme.roundness,
        overflow: 'hidden'
    },
    configWrap: {
        flex: 1,
        paddingTop: 6
    },
    row: {
        // width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
    },
})

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
        backgroundColor: theme.colors.surface,
    },    
    screensContainer: {
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
    },
    screenRow: {
        // paddingLeft: 12,
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