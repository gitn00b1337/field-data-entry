import { StyleSheet, View } from "react-native";
import { Icon, Modal, Portal, Text } from "react-native-paper";
import { NavButton } from "../../components/nav-button";
import { useRouter } from "expo-router";

type LeaveFormDialogProps = {
    isVisible: boolean;
    onHideModal: () => void;
    onSaveAndQuit: () => void;
}

export function LeaveFormDialog({
    isVisible,
    onHideModal,
    onSaveAndQuit,
}: LeaveFormDialogProps) {
    const router = useRouter();
    
    function handleDiscard() {
        if (router.canGoBack()) {
            router.back();
        }
        else {
            router.replace('/')
        }
    }

    return (
        <Portal>
            <Modal visible={isVisible} onDismiss={onHideModal} contentContainerStyle={styles.containerStyle}>
                <View style={styles.headingContainer}>
                    <View style={styles.headingIcon}>
                        <Icon
                            source='alert-outline' 
                            size={48}        
                        />
                    </View>
                    <Text style={styles.heading}>
                        Discarding Changes
                    </Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.text}>You have unsaved changes. Are you sure you want to quit editing this form?</Text>
                </View>
                <View style={styles.buttonsContainer}>
                    <NavButton 
                        text="Loose Changes & Quit"
                        variant='SECONDARY'
                        onPress={handleDiscard}
                    />
                    <NavButton
                        text='Save Changes & Quit'
                        variant='PRIMARY'
                        onPress={onSaveAndQuit}
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
        flexDirection: 'row',
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
        paddingVertical: 48,
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