import { NavButton } from '../../components/nav-button';
import { StyleSheet, Text, View, Button, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// export type HomeScreenProps = {

// }

export default function HomeScreen() {

    return (
        <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingRight: 150, }}>
            <Text style={styles.header}>APOPO Data Collection</Text>
            <View>
                <View>

                </View>
            </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1, 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        backgroundColor: '#FFFFFF',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: 12,
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