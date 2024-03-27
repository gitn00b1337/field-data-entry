import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

export type TemplateListItem = {
    name: string;
    url: string;
    lastUpdatedAt: string;
    id: number;
}

export type TemplateListProps = {
    items: TemplateListItem[];
    onItemClick: (item: TemplateListItem) => void;
}

export function TemplateList({
    items,
    onItemClick,
}: TemplateListProps) {
    if (!items.length) {
        return (
            <View>
                <Text>You have no saved templates. Click the "Create Template" button to create a new form template.</Text>
            </View>
        )
    }

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
        justifyContent: 'flex-start',
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
})