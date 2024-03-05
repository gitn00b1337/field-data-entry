import { View, StyleSheet, } from "react-native";
import { MD3Theme, Text, } from "react-native-paper";
import { FormInput } from "../../components/form-input";
import { FormConfig } from "../../lib/config";

type DrawerSettingsContentProps = {
    theme: MD3Theme;
    form: FormConfig;
}

export function DrawerSettingsContent({
    theme,
    form,
}: DrawerSettingsContentProps) {

    return (
        <View style={styles.navContainer}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Form Settings</Text>
            </View>
            <View style={{ width: '100%' }}>
                <View style={styles.row}>
                    <FormInput
                        fieldName='name'
                        label='Form Name'
                    />
                </View>
            </View>
            <View style={{ width: '100%' }}>
                <View style={styles.row}>
                    <FormInput
                        fieldName='description'
                        label='Form Description'
                        value={form.description}
                        multiline
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

