import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, useTheme } from "react-native-paper";
import { Image } from 'expo-image';
import { router, useRouter } from 'expo-router';
import { useGlobalState } from "../app/global-state";
import { useRoute } from '@react-navigation/native';

const Logo = require('../assets/logo.png');

export function HeaderTitle() {
    const [state, dispatch] = useGlobalState();
    const route = useRoute();
    const theme = useTheme();

    const showBurger = route.name === 'template/index';

    function handleLogoPress() {
        router.navigate('/');
    }

    function handleBurgerPress() {
        dispatch('SET_DRAWER_VISIBLE', !state.drawerVisible);
    }

    return (
        <View style={styles.container}>
            {
                showBurger && (
                    <Button 
                        icon={'menu'}
                        onPress={handleBurgerPress} 
                        labelStyle={styles.hamburgerLabel}
                        contentStyle={styles.hamburgerContent}
                        style={styles.hamburger}
                        textColor={state.drawerVisible ?  theme.colors.primary : theme.colors.onPrimary }
                    >
                        &nbsp;
                    </Button>
                )
            }
            <TouchableOpacity onPress={handleLogoPress}>
                <Image
                    style={styles.logo}
                    source={Logo}
                    contentFit="contain"
                    transition={1000}
                />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row',
    },
    title: {
        color: '#fff',
        textTransform: 'uppercase',
        fontSize: 22,
        fontWeight: 'bold',
    },
    logo: {
        width: 230,
        height: 89,
    },
    hamburgerLabel: {
        fontSize: 24,
        textAlign: 'center',
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        paddingBottom: 0,
        marginLeft: 0,
        marginRight: 0,
    },
    hamburgerContent: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingLeft: 0,
        paddingRight: 10,
        paddingTop: 0,
        paddingBottom: 0,
        marginLeft: 0,
        marginRight: 0,
    },
    hamburger: {
        minWidth: 10,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 10,
        paddingBottom: 0,
        marginLeft: 0,
        marginRight: 12
    }
})