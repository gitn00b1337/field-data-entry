import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useRoute } from '@react-navigation/native';

const Logo = require('../assets/logo.png');

export function HeaderTitle() {
    const route = useRoute();
    const router = useRouter();

    function handleLogoPress() {
        if (router.canGoBack()) {
            router.back();
        }
        else {
            router.navigate('/');
        }        
    }

    return (
        <View style={styles.container}>
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