import { StyleSheet } from "react-native";
import { Snackbar, Text, } from "react-native-paper";

export type FormSnackbarType = 'SUCCESS' | 'ERROR';

export type FormSnackbarProps = {
    type: FormSnackbarType;
    label: string;
    visible: boolean;
    onClose: () => void;
}

function getBorderColor(type: FormSnackbarType) {
    return type === 'SUCCESS' ? '#5cb85c' : '#ff0e0e'
}

export function FormSnackbar({
    type,
    label,
    visible,
    onClose,
}: FormSnackbarProps) {
    const borderColor = getBorderColor(type);

    return (
        <Snackbar
            style={{ 
                ...styles.container,
                borderColor,
            }}
            visible={visible}
            onDismiss={onClose}
            action={{
                label: '',
                icon: 'close',
                textColor: '#000',
                onPress: onClose,
            }}
            duration={5000}
        >
            <Text style={{ color: '#000' }} >
            { label }
            </Text>
        </Snackbar>
)
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff', 
        borderLeftWidth: 15, 
        width: '40%', 
        right: 20, 
        position: 'absolute', 
        bottom: 20,  
        zIndex: 99999,
    }
})