import { StyleSheet, View } from "react-native";
import { Button, Icon, Modal, Portal, Text, useTheme } from "react-native-paper";
import { NavButton } from "../../components/nav-button";
import { useRouter } from "expo-router";

type DiscardFormDialogProps = {
    isVisible: boolean;
    onHideModal: () => void;
}

export function DiscardFormDialog({
    isVisible,
    onHideModal,
}: DiscardFormDialogProps) {
    const router = useRouter();
    const theme = useTheme();
    
    function handleDiscard() {
        router.replace('/');
    }
    
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
                        Quit Data Entry
                    </Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.text}>Any unsaved changes will be discarded</Text>
                </View>
                <View style={styles.buttonsContainer}>
                    <NavButton 
                        text="Cancel"
                        variant='SECONDARY'
                        onPress={onHideModal}
                    />
                    <NavButton
                        text='Quit & Loose Changes'
                        variant='PRIMARY'
                        onPress={handleDiscard}
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
        flexDirection: 'column',
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