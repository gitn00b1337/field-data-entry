import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { NavButton } from "../../components/nav-button";

export type HeaderButtonsProps = {
    onSubmitForm: () => void;
}

export function HeaderButtons({
    onSubmitForm,
}: HeaderButtonsProps) {
    return (
        <View style={styles.container}>
            <NavButton text='Save' onPress={onSubmitForm} />
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