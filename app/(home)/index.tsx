import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import {
    IconButton,
    Text,
} from 'react-native-paper';
import { getConfigurations, getEntries, saveConfiguration } from '../../lib/database';
import { Stack, useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { TemplateList, TemplateListItem } from './template-list';
import { HeaderButtons } from './_header-buttons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { EntryList, EntryListItem } from './entry-list';
import * as DocumentPicker from 'expo-document-picker';
import moment from 'moment';
import * as FileSystem from 'expo-file-system';
import { FormConfig } from '../../lib/config';
import { FormSnackbar, FormSnackbarType } from '../../components/form-snackbar';
import usAIDLogo from '../../assets/usaid-logo.png';

export default function HomeScreen() {
    const [templates, setTemplates] = useState<TemplateListItem[]>([]);
    const [entries, setEntries] = useState<EntryListItem[]>([]);
    const [pageError, setPageError] = useState('');
    const router = useRouter();
    const [tabIndex, setTabIndex] = useState(0);
    const isFocused = useIsFocused();
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateListItem>();
    const [loadingEntries, setLoadingEntries] = useState(false);
    const [snackbarOptions, setSnackbarOptions] = useState<{ type: FormSnackbarType, message: string } | undefined>();

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        loadConfigurations();
        loadEntries();
    }, [isFocused]);

    async function loadConfigurations() {
        try {
            const results = await getConfigurations();
            const configs = results?.map<TemplateListItem>(r => {
                return {
                    id: r.id,
                    name: r.name,
                    url: `template/${r.id}`,
                    lastUpdatedAt: r.updatedAt,
                };
            }) || [];

            setTemplates(configs);
        }
        catch (e) {
            console.error(e);
            setPageError('An error occured loading configrations.');
        }
    }

    function loadEntries() {
        if (!selectedTemplate?.id) {
            setEntries([]);
            return;
        }

        setLoadingEntries(true);

        getEntries(selectedTemplate.id)
            .then(results => {
                const entries = results?.map<EntryListItem>(r => {
                    const createdAt = moment(r.createdAt).isValid() 
                        ? moment.utc(r.createdAt).local().format('HH:mm DD-MM-YYYY').toString()
                        : '';

                    const updatedAt = moment(r.updatedAt).isValid()
                        ? moment.utc(r.updatedAt).local().format('HH:mm DD-MM-YYYY').toString()
                        : '';

                    return {
                        createdAt,
                        updatedAt,
                        id: r.id,
                        name: r.name,
                        url: `entry/${r.id}`,
                    };
                });

                setEntries(entries);
            })
            .catch(e => {
                console.error(e);
                setPageError('An error occured loading configrations.');
            })
            .finally(() => {
                setLoadingEntries(false);
            });
    }

    function handleItemDeleted(id: number) {
        console.log('filtering')
        const newEntries = entries.filter(e => e.id !== id);
        setEntries(newEntries);
    }

    useEffect(() => {
        loadEntries();
    }, [ selectedTemplate ])

    function handleTemplateClick(item: TemplateListItem) {
        setSelectedTemplate(item);
    }

    function handleCreateEntryPress() {
        router.push(`/entry?templateId=${selectedTemplate.id}`)
    }

    function handleCreateTemplatePress() {
        router.push('/template');
    }

    function handleBackPress() {
        setSelectedTemplate(undefined);
    }

    function handleEditTemplate() {
        router.push(`/template/${selectedTemplate.id}`)
    }

    async function parseImportedConfig(asset: DocumentPicker.DocumentPickerAsset) {
        const json = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'utf8' });

        try {
            const config: FormConfig = JSON.parse(json);

            if (!config) {
                throw new Error(`Invalid file contents.`);
            }

            config.id = undefined;
            return config;
        }
        catch (e) {
            setSnackbarOptions({ type: 'ERROR', message: 'An error occured importing. Is the file valid?' });
        }        
    }

    async function handleImportTemplatePress() {
        try {
            const result = await DocumentPicker.getDocumentAsync({ 
                type: 'application/json',
                multiple: true,
            });
    
            if (result.canceled || !result.assets.length) {
                return;
            }

            let configs: FormConfig[] = [];
    
            // parse first, so any errors don't cause SOME files
            // to be imported and some not
            for (const asset of result.assets) {
                const parsed = await parseImportedConfig(asset);
                configs.push(parsed);
            }

            // now save the configs
            for (const config of configs) {
                await saveConfiguration(config);
            }

            setSnackbarOptions({ type: 'SUCCESS', message: `Template${configs.length > 1 ? 's' : ''} imported` });
            await loadConfigurations();
        }
        catch (e) {
            console.error(e);
            setSnackbarOptions({ type: 'ERROR', message: 'An error occured importing one or more files. Is the file valid?' });
        }
    }

    return (
        <GestureHandlerRootView style={{ flexGrow: 1, }}>    
            {
                !!snackbarOptions && (
                    <FormSnackbar
                        visible={!!snackbarOptions}
                        onClose={() => setSnackbarOptions(undefined)}
                        label={snackbarOptions?.message}
                        type={snackbarOptions?.type}
                    />
                )
            }        
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <HeaderButtons
                            onCreateEntry={handleCreateEntryPress}
                            onCreateTemplate={handleCreateTemplatePress}
                            hasSelectedTemplate={!!selectedTemplate}
                            onEditTemplate={handleEditTemplate}
                            onImportTemplate={handleImportTemplatePress}
                        />
                    )
                }}
            />
            <ScrollView contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'center',
            }}>
                <View style={{ flexGrow: 1, flexDirection: 'row', justifyContent: 'center', }}>
                {
                    !selectedTemplate && (
                        <View style={styles.container}>
                            <Text style={styles.header}>Form Templates</Text>
                            <View style={{
                                flexGrow: 1,
                            }}>
                                <View style={{ flex: 1 }}>
                                    <TemplateList
                                        items={templates}
                                        onItemClick={handleTemplateClick}
                                    />
                                </View>
                            </View>
                        </View>
                    )
                }
                {
                    selectedTemplate && (
                        <View style={styles.container}>
                            <View style={styles.templateHeaderContainer}>
                                <IconButton
                                    icon='chevron-left'
                                    style={styles.backButton}
                                    onPress={handleBackPress}
                                    size={36}
                                    iconColor='#000'
                                />
                                <Text style={[styles.header, styles.templateHeader]}>{`${selectedTemplate.name || 'Data Collection'}`}</Text>
                            </View>
                            <View style={{
                                flexGrow: 1,
                            }}>
                                <View style={{ flex: 1 }}>
                                    <EntryList
                                        items={entries}
                                        onItemClick={entry => router.push(entry.url)}
                                        loading={loadingEntries}
                                        onItemDeleted={handleItemDeleted}
                                    />
                                </View>
                            </View>
                        </View>
                    )
                }
                </View>
                <View style={styles.usAIDContainer}>
                    <View style={styles.usAIDTextContainer}>
                        <Text style={{ textTransform: 'uppercase', textAlign: 'center', fontSize: 10 }}>{`This app was developed \nwith support from USAID`}</Text>
                    </View>
                    <View style={styles.usAIDLogoContainer}>
                        <Image
                            style={styles.usAidLogo} 
                            source={usAIDLogo} 
                            contentFit='contain'
                        />
                    </View>
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    usAIDContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderTopColor: '#DDDDDD',
        borderTopWidth: 1,
        marginTop: 24,
        paddingTop: 24,
    },
    usAIDTextContainer: {
        marginBottom: -40
    },
    usAIDLogoContainer: {
        width: 250,
        height: 180,
        justifyContent: 'center',
    },
    usAidLogo: {
        flex: 1,
        width: '100%',
    },
    container: {
        flexGrow: 1,
        backgroundColor: '#FFFFFF',
        maxWidth: 1200,
        paddingHorizontal: 24,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        alignSelf: 'center',
        paddingVertical: 24,
    },
    templateHeader: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        textAlign: 'center',
    },
    templateHeaderContainer: {
        flexDirection: 'row',
        width: '100%',
        alignContent: 'stretch',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'row',
        rowGap: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        alignSelf: 'center',
    }
});