import { View, StyleSheet } from "react-native";
import { NavButton } from "../../components/nav-button";

export type HeaderButtonsProps = {
    onSaveEntry: () => void;
    onDiscardEntry: () => void;
}

export function HeaderButtons({
    onSaveEntry,
    onDiscardEntry,
}: HeaderButtonsProps) {
    return (
        <View style={styles.container}>
            <NavButton text='Save' onPress={onSaveEntry} />
            <NavButton text='Discard' onPress={onDiscardEntry} variant='SECONDARY' />
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