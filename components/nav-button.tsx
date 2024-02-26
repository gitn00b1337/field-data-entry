import { Button } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { StyleSheet, View, } from 'react-native';

export type NavButtonProps = {
    text: string;
    onPress: () => void;
    variant?: 'PRIMARY' | 'SECONDARY'
}

export function NavButton({
    text,
    onPress,
    variant = 'PRIMARY',
}: NavButtonProps) {
    const theme = useTheme();
    const isPrimary = variant === 'PRIMARY';

    return (
        <View style={styles.container}>
            <Button 
                mode="contained-tonal"
                buttonColor={isPrimary ? theme.colors.primary : '#fff'}
                textColor={isPrimary ? '#fff' : 'rgb(96, 103, 112)'}
                labelStyle={styles.label}
                onPress={onPress}
                style={styles.button}
            >
                { text }
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        textTransform: 'uppercase',
        fontWeight: '900',
    },
    button: {
        borderRadius: 5,
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
    }
});