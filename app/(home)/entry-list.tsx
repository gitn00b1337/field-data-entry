import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Button, IconButton, MD3Theme, Text, useTheme } from "react-native-paper";
import { ActivityIndicator, MD2Colors } from 'react-native-paper';
import { DotsPopupMenu } from "../../components/dots-popup-menu";
import { deleteEntryById, loadEntry } from "../../lib/database";
import { useState } from "react";
import { FormSnackbar, FormSnackbarType } from "../../components/form-snackbar";
import { exportMultipleForms } from "../../lib/form-export";

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
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const theme = useTheme();
    const styles = makeStyles(theme);

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

    function handleRowLongPress(item: EntryListItem) {
        setSelectedRows([
            ...selectedRows,
            item.id,
        ]);
    }

    function handleRowPress(item: EntryListItem) {
        if (selectedRows.length) {
            if (selectedRows.includes(item.id)) {
                setSelectedRows(
                    selectedRows.filter(id => id !== item.id)
                )
            }
            else {
                setSelectedRows([
                    ...selectedRows,
                    item.id,
                ]);
            }            
        }
        else {
            onItemClick(item);
        }
    }

    async function handleExportMultiPress() {
        try {
            console.log('Exporting entries')
            const entriesRequests = selectedRows.map(id => {
                return loadEntry(`${id}`);
            });
    
            const results = await Promise.all(entriesRequests);
    
            await exportMultipleForms(results);

            setSnackbarOptions({
                type: 'SUCCESS',
                message: 'Entries exported!',
            })
        }
        catch (e) {
            console.error(e);

            setSnackbarOptions({
                type: 'ERROR',
                message: `An error occured loading selected entries: ${e.message}`
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
                <View style={[styles.listDataCol, { flexGrow: 1, }]}>
                    <Text style={styles.columnHeader}>Entry</Text>
                </View>
                <View style={[styles.listDataCol, { width: '30%' }]}>
                    <Text style={styles.columnHeader}>Creation Time</Text>
                </View>
                <View style={[styles.listDataCol, { width: '30%', marginRight: 50, }]}>
                    <Text style={styles.columnHeader}>Last Updated</Text>
                </View>
            </View>            
            {
                items.map((item, index) => {
                    const isSelected = selectedRows.includes(item.id);
                    return (
                        <TouchableOpacity 
                            key={`item-${item.url}`}
                            onPress={() => handleRowPress(item)}
                            style={[
                                styles.listRow,
                                index % 2 === 0 ? styles.evenRow : undefined,
                                isSelected && styles.selectedRow,
                            ]}
                            onLongPress={() => handleRowLongPress(item)}
                        >
                            <View style={[styles.listDataCol, { flexGrow: 1, }]}>
                                <Text style={[ isSelected && styles.selectedRowText ]}>{ item.name || 'Not named.'} </Text>
                            </View>
                            <View style={[styles.listDataCol, { width: '30%' }]}>
                                <Text style={[ isSelected && styles.selectedRowText ]}>{ item.createdAt }</Text>
                            </View>
                            <View style={[styles.listDataCol, { width: '30%' }]}>
                                <Text style={[ isSelected && styles.selectedRowText ]}>{ item.updatedAt }</Text>
                            </View>
                            <View style={styles.dotsMenu}>
                                <DotsPopupMenu
                                    iconColor={isSelected ? '#fff' : '#000' }                                
                                    actions={[
                                        { key: 'delete', label: 'Delete', onPress: () => handleDeletePress(item) }
                                    ]}
                                />
                            </View>       
                        </TouchableOpacity>
                    )
                })
            }
            {
                selectedRows.length > 0 && (
                    <View style={styles.msOverviewContainer}>
                        {/* <View style={styles.msCountContainer}>
                            <Text style={styles.msCount}>{`${selectedRows.length} selected`}</Text>
                        </View> */}
                        <View>
                            <Button
                                icon='export'
                                textColor="rgb(34, 34, 34)"
                                style={styles.exportBtn}
                                onPress={handleExportMultiPress}
                                labelStyle={styles.exportLabelStyle}
                                contentStyle={{ paddingHorizontal: 0 }}
                            >
                                Export All
                            </Button>
                        </View>
                    </View>
                )
            }
        </View>
    )
}

const makeStyles = (theme: MD3Theme) =>  StyleSheet.create({
    exportBtn: {
        backgroundColor: '#fff',
        borderRadius: theme.roundness,
        paddingHorizontal: 0,
        borderColor: '#DDDDDD',
        borderWidth: 1,
        width: 140,
    },
    exportLabelStyle: {
        paddingHorizontal: 0,
    },
    columnHeader: {
        fontWeight: '700',
        letterSpacing: 1.1,
    },
    msCount: {
        color: '#000'
    },
    msCountContainer: {
        paddingRight: 12,
    },
    msOverviewContainer: {
        flexDirection: 'row',
        flexGrow: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        alignContent: 'center',
        marginTop: 12,
    },
    dotsMenu: {
        paddingRight: 6,
        justifyContent: 'center',
        width: 50,
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
        justifyContent: 'flex-end',
        alignItems: 'stretch',
    },
    listDataCol: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        alignContent: 'flex-start',
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    evenRow: {
        backgroundColor: 'rgba(240, 241, 245, 0.5)'
    },
    selectedRow: {
        backgroundColor: theme.colors.secondary,
    },
    selectedRowText: {
        color: '#fff',
    }
})