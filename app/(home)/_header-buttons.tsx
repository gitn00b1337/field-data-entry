import { View, StyleSheet } from "react-native";
import { NavButton } from "../../components/nav-button";
import { DotsPopupMenu } from "../../components/dots-popup-menu";

export type HeaderButtonsProps = {
    onCreateEntry: () => void;
    onCreateTemplate: () => void;
    onEditTemplate: () => void;
    hasSelectedTemplate: boolean; 
    onImportTemplate: () => void;
}

export function HeaderButtons({
    onCreateEntry,
    onEditTemplate,
    onCreateTemplate,
    hasSelectedTemplate,
    onImportTemplate,
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
                !hasSelectedTemplate && (
                    <>
                        <NavButton text='Create Template' onPress={onCreateTemplate} />
                        <DotsPopupMenu    
                            iconColor="#fff"                            
                            actions={[
                                { key: 'import_template', label: 'Import Template', onPress: onImportTemplate }
                            ]}
                        />
                    </>
                )
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