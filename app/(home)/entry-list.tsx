import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { ActivityIndicator, MD2Colors } from 'react-native-paper';

export type EntryListItem = {
    name: string;
    url: string;
    id: string;
    createdAt: string;
    updatedAt: string;
}

export type EntryListProps = {
    items: EntryListItem[];
    onItemClick: (item: EntryListItem) => void;
    loading: boolean;
}

export function EntryList({
    items,
    onItemClick,
    loading,
}: EntryListProps) {
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