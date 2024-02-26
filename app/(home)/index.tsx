import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    IconButton,
    Text,
} from 'react-native-paper';
import { getConfigurations, getEntries } from '../../lib/database';
import { Stack, useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { TemplateList, TemplateListItem } from './template-list';
import { HeaderButtons } from './_header-buttons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { EntryList, EntryListItem } from './entry-list';
import moment from 'moment';

export default function HomeScreen() {
    const [templates, setTemplates] = useState<TemplateListItem[]>([]);
    const [entries, setEntries] = useState<EntryListItem[]>([]);
    const [pageError, setPageError] = useState('');
    const router = useRouter();
    const [tabIndex, setTabIndex] = useState(0);
    const isFocused = useIsFocused();
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateListItem>();
    const [loadingEntries, setLoadingEntries] = useState(false);

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        getConfigurations()
            .then(results => {
                const configs = results?.map<TemplateListItem>(r => {
                    return {
                        id: r.id,
                        name: r.name,
                        url: `template/${r.id}`,
                        lastUpdatedAt: r.updatedAt,
                    };
                }) || [];

                setTemplates(configs);
            })
            .catch(e => {
                console.error(e);
                setPageError('An error occured loading configrations.');
            });
    }, [isFocused]);

    useEffect(() => {
        if (!selectedTemplate) {
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

    function handleBackClick() {
        setSelectedTemplate(undefined);
    }

    function handleEditTemplate() {
        router.push(`/template/${selectedTemplate.id}`)
    }

    return (
        <GestureHandlerRootView style={{ flexGrow: 1, }}>
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <HeaderButtons
                            onCreateEntry={handleCreateEntryPress}
                            onCreateTemplate={handleCreateTemplatePress}
                            hasSelectedTemplate={!!selectedTemplate}
                            onEditTemplate={handleEditTemplate}
                        />
                    )
                }}
            />
            <ScrollView contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'center',
                flexDirection: 'row',
            }}>
                {
                    !selectedTemplate && (
                        <View style={styles.container}>
                            <Text style={styles.header}>APOPO Data Collection</Text>
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
                                    icon='arrow-left-thick'
                                    style={styles.backButton}
                                    onPress={handleBackClick}
                                />
                                <Text style={[styles.header, styles.templateHeader]}>{`${selectedTemplate.name}`}</Text>
                            </View>
                            <View style={{
                                flexGrow: 1,
                            }}>
                                <View style={{ flex: 1 }}>
                                    <EntryList
                                        items={entries}
                                        onItemClick={entry => router.push(entry.url)}
                                        loading={loadingEntries}
                                    />
                                </View>
                            </View>
                        </View>
                    )
                }
            </ScrollView>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#FFFFFF',
        maxWidth: 1200,
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
        alignSelf: 'center'
    }
});