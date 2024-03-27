import { Button, MD3Theme } from 'react-native-paper';
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
    const styles = makeStyles(theme);
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

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    label: {
        textTransform: 'uppercase',
        fontWeight: '900',
    },
    button: {
        borderRadius: theme.roundness,
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
    }
});