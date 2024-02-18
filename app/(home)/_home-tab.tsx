import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
    Button,
    Title,
    Paragraph,
    Text,
} from 'react-native-paper';
import {
    Tabs,
    TabScreen,
    useTabIndex,
    useTabNavigation,
    TabsProvider,
} from 'react-native-paper-tabs';
import { getConfigurations } from '../../lib/database';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';

export function HomeTabs() {
    const [templates, setTemplates] = useState<DataListItem[]>([]);
    const [entries, setEntries] = useState<DataListItem[]>([]);
    const [pageError, setPageError] = useState('');
    const router = useRouter();
    const [tabIndex, setTabIndex] = useState(0);
    const isFocused = useIsFocused();

    useEffect(() => {
        console.log('getting configurations')
        getConfigurations()
            .then(results => {
                console.log('configs:')
                console.log(results)
                const configs = results?.map<DataListItem>(r => {
                    return {
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
            })
    }, [ isFocused ]);

    function handleTemplateClick(item: DataListItem) {
        router.push(item.url);
    }

    return (
        <View style={{ 
            minHeight: 400, 
            flexGrow: 1, 
            maxWidth: 1200,
            justifyContent: 'center',
            // alignItems: 'center'
        }}>
            <TabsProvider
                defaultIndex={tabIndex}
                onChangeIndex={index => setTabIndex(index)}
            >
                <Tabs
                    style={styles.tabs}
                    showLeadingSpace={false}
                    tabHeaderStyle={styles.tabHeader}
                    tabLabelStyle={styles.tabLabel}
                    mode='fixed'
                    iconPosition='leading'
                >
                    <TabScreen label="Entries">
                        <View style={{ flex: 1 }}>
                            <Text>Entries</Text>
                        </View>
                    </TabScreen>    
                    <TabScreen label="Templates">
                        <View style={{ flex: 1 }}>
                            <DataList
                                items={templates}
                                onItemClick={handleTemplateClick}
                        />
                        </View>
                    </TabScreen>            
                </Tabs>
            </TabsProvider>
        </View>
    )
}

type DataListItem = {
    name: string;
    url: string;
    lastUpdatedAt: string;
}

type DataListProps = {
    items: DataListItem[];
    onItemClick: (item: DataListItem) => void;
}

function DataList({
    items,
    onItemClick,
}: DataListProps) {
    return (
        <View style={styles.list}>
            {
                items.map((item, index) => {
                    return (
                        <TouchableOpacity 
                            key={`item-${item.url}`}
                            onPress={() => onItemClick(item)}
                            style={[
                                styles.listRow,
                                index % 2 === 0 ? styles.evenRow : undefined,
                            ]}
                        >
                            <View style={styles.listDataCol}>
                                <Text>{ item.name || 'Not named.'} </Text>
                            </View>
                            <View style={styles.listDataCol}>
                                <Text>{ item.lastUpdatedAt }</Text>
                            </View>
                        </TouchableOpacity>
                    )
                })
            }
        </View>
    )
}

const styles = StyleSheet.create({
    tabs: {
        backgroundColor: '#fff',
        borderColor: '#fff',
        position: 'relative',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        overflow: 'hidden',
    },
    tabHeader: {
        position: 'relative',
        backgroundColor: 'red',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        paddingBottom: 0,
        height: 46,
        overflow: 'hidden',
    },
    tabLabel: {
        position: 'relative',
        flexGrow: 1,
        marginBottom: 0,
    },
    list: {
        paddingVertical: 12,
    },
    listRow: {
        flexDirection: 'row',
        flexGrow: 1,
        justifyContent: 'space-evenly',
        alignItems: 'stretch',
    },
    listDataCol: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 12,
        
    },
    evenRow: {
        backgroundColor: '#EDEDED'
    }
})