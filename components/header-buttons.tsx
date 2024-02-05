import { View, StyleSheet } from "react-native";
import { NavButton } from "./nav-button";
import { router } from 'expo-router';
import { useRoute } from '@react-navigation/native';

export function HeaderButtons() {
    const route = useRoute();

    const isTemplatePage = route.name === 'template/index';
    const isRoutePage = route.name === '(home)/index';
    console.log(route.name)

    return (
        <View style={styles.container}>
            {
                isRoutePage && (
                    <>
                        <NavButton text='Create Template' onPress={() => router.navigate('/template')} />
                        <NavButton text='Create Entry' onPress={() => router.navigate('/entry')} />
                    </>
                )            
            }
            {
                isTemplatePage && (
                    <>

                    </>
                )
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      justifyContent: 'flex-start',
      flexDirection: 'row',
      gap: 12,
    },
  });