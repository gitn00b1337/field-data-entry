import { View, StyleSheet } from "react-native";
import { NavButton } from "../../components/nav-button";

export type HeaderButtonsProps = {
    onCreateEntry: () => void;
    onCreateTemplate: () => void;
    onEditTemplate: () => void;
    hasSelectedTemplate: boolean; 
}

export function HeaderButtons({
    onCreateEntry,
    onEditTemplate,
    onCreateTemplate,
    hasSelectedTemplate,
}: HeaderButtonsProps) {
    return (
        <View style={styles.container}>
            {
                hasSelectedTemplate && (
                    <>
                        <NavButton text='Create Entry' onPress={onCreateEntry} />
                        <NavButton text='Edit Template' onPress={onEditTemplate} variant='SECONDARY' />
                    </>
                )
            }
            {
                !hasSelectedTemplate && <NavButton text='Create Template' onPress={onCreateTemplate} />
            }
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