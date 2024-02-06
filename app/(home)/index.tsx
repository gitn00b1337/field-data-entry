import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeTab } from './_home-tab';

export default function HomeScreen() {

    return (
        <ScrollView contentContainerStyle={{ 
            flexGrow: 1, 
            justifyContent: 'center', 
            flexDirection: 'row', 
        }}>
            <View style={styles.container}>
                <Text style={styles.header}>APOPO Data Collection</Text>
                <View style={{ 
                    flexGrow: 1, 
                }}>
                    <HomeTab
                    />
                </View>
            </View>
        </ScrollView>
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
      buttonContainer: {
        display: 'flex',
        flexDirection: 'row',
        rowGap: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
      },
});