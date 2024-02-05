import { Button } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { StyleSheet, } from 'react-native';
import { useNavigation } from 'expo-router';

export type NavButtonProps = {
    text: string;
    onPress: () => void;
}

export function NavButton({
    text,
    onPress,
}: NavButtonProps) {
    const theme = useTheme();
    const navigation = useNavigation();

    return (
        <Button 
            mode="contained-tonal"
            buttonColor={theme.colors.primary}
            textColor='#fff'
            labelStyle={styles.label}
            onPress={onPress}
            style={styles.button}
        >
            { text }
        </Button>
    );
}

const styles = StyleSheet.create({
    label: {
        textTransform: 'uppercase',
        fontWeight: '900',
    },
    button: {
        borderRadius: 5,
    }
});