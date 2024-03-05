import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { ActivityIndicator, MD2Colors } from 'react-native-paper';
import { DotsPopupMenu } from "../../components/dots-popup-menu";
import { deleteEntry, deleteEntryById } from "../../lib/database";
import { useState } from "react";
import { FormSnackbar, FormSnackbarType } from "../../components/form-snackbar";

export type EntryListItem = {
    name: string;
    url: string;
    id: number;
    createdAt: string;
    updatedAt: string;
}

export type EntryListProps = {
    items: EntryListItem[];
    onItemClick: (item: EntryListItem) => void;
    loading: boolean;
    onItemDeleted: (id: number) => void;
}

export function EntryList({
    items,
    onItemClick,
    loading,
    onItemDeleted,
}: EntryListProps) {
    const [snackbarOptions, setSnackbarOptions] = useState<{ type: FormSnackbarType, message: string } | undefined>();

    async function handleDeletePress(item: EntryListItem) {
        try {
            await deleteEntryById(item.id);
            onItemDeleted(item.id);
        }
        catch (e) {
            setSnackbarOptions({
                type: 'ERROR',
                message: 'An error occured deleting the entry. Please try again.',
            });
        }
    }

    if (loading) {
        return (
            <View style={{ paddingTop: '10%'}}>
                <ActivityIndicator 
                    animating={true} 
                    color={MD2Colors.blue800} 
                    size='large'
                />
                
            </View>
        )
    }

    if (!items.length) {
        return (
            <View>
                <Text>You have no saved entries for this form template. Click the "Create Entry" button to create a new entry.</Text>
            </View>
        )
    }

    return (
        <View style={styles.list}>
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
            <View style={styles.listRow}>
                <View style={styles.listDataCol}>
                    <Text>Entry</Text>
                </View>
                <View style={styles.listDataCol}>
                    <Text>Created At</Text>
                </View>
                <View style={styles.listDataCol}>
                    <Text>Updated At</Text>
                </View>
            </View>
            
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
                                <Text>{ item.createdAt }</Text>
                            </View>
                            <View style={styles.listDataCol}>
                                <Text>{ item.updatedAt }</Text>
                            </View>
                            <View style={styles.dotsMenu}>
                                <DotsPopupMenu                                
                                    actions={[
                                        { key: 'delete', label: 'Delete', onPress: () => handleDeletePress(item) }
                                    ]}
                                />
                            </View>       
                        </TouchableOpacity>
                    )
                })
            }
        </View>
    )
}

const styles = StyleSheet.create({
    dotsMenu: {
        paddingRight: 6,
    },
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
        paddingVertical: 2,
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