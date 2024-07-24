import { StyleSheet, View } from "react-native";
import { Icon, Modal, Portal, Text, useTheme } from "react-native-paper";
import { NavButton } from "../../components/nav-button";
import { useRouter } from "expo-router";

type DeleteFormDialogProps = {
    isVisible: boolean;
    onHideModal: () => void;
    onDelete: () => void;
}

export function DeleteFormDialog({
    isVisible,
    onHideModal,
    onDelete,
}: DeleteFormDialogProps) {
    const router = useRouter();
    const theme = useTheme();
    
    return (
        <Portal>
            <Modal visible={isVisible} onDismiss={onHideModal} contentContainerStyle={styles.containerStyle}>
                <View style={styles.headingContainer}>
                    <View style={styles.headingIcon}>
                        <Icon
                            source='alert-outline' 
                            size={48}        
                            color={theme.colors.tertiary}
                        />
                    </View>
                    <Text style={styles.heading}>
                        Deleting Form
                    </Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.text}>Are you sure you want to delete this form? Deleting is permanent.</Text>
                </View>
                <View style={styles.buttonsContainer}>
                    <NavButton 
                        text="Cancel"
                        variant='SECONDARY'
                        onPress={onHideModal}
                    />
                    <NavButton
                        text='Delete Form'
                        variant='PRIMARY'
                        onPress={onDelete}
                    />
                </View>
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
    heading: {
        fontWeight: '700',
        fontSize: 16,
    },
    headingContainer: {
        paddingTop: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headingIcon: {
        paddingRight: 12,
    },
    containerStyle: {
        backgroundColor: 'white',
        minWidth: '40%',
        maxWidth: '80%',
        alignSelf: 'center',
        padding: 36,
        paddingHorizontal: 48,
        marginTop: '-10%',
        flexDirection: 'column'
    },
    textContainer: {
        paddingHorizontal: 12,
        paddingVertical: 24,
        justifyContent: 'center'
    },
    text: {
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'space-between',
    }
})