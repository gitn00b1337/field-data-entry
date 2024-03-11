import { View, StyleSheet, } from "react-native";
import { Text, } from "react-native-paper";
import { FormInput } from "../../components/form-input";
import { Control } from "react-hook-form";
import { FormEntryV2 } from "../../lib/config";

type DrawerSettingsContentProps = {
    control: Control<FormEntryV2, any>;
}

export function DrawerSettingsContent({
    control,
}: DrawerSettingsContentProps) {

    return (
        <View style={styles.navContainer}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Form Settings</Text>
            </View>
            <View style={{ width: '100%' }}>
                <View style={styles.row}>
                    <FormInput
                        fieldName='config.name'
                        label='Form Name'
                        control={control}
                    />
                </View>
            </View>
            <View style={{ width: '100%' }}>
                <View style={styles.row}>
                    <FormInput
                        fieldName='config.description'
                        label='Form Description'
                        multiline
                        control={control}
                    />
                </View>
            </View>
        </View>
    )


}

const styles = StyleSheet.create({
    navContainer: {
        flexGrow: 1,
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flexDirection: 'column',
    },
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
        paddingHorizontal: 12,
        display: 'flex',
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
        paddingHorizontal: 12,
        display: 'flex',
        marginBottom: 12,
    },
    header: {
        fontWeight: '700',
        flexGrow: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
})

