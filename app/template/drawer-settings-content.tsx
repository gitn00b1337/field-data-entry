import { View, StyleSheet, } from "react-native";
import { MD3Theme, Text, useTheme, } from "react-native-paper";
import { FormInput } from "../../components/form-input";
import { Control } from "react-hook-form";
import { FormEntryV2 } from "../../lib/config";
import { CheckboxField } from "../../components/form-checkbox";

type DrawerSettingsContentProps = {
    control: Control<FormEntryV2, any>;
}

export function DrawerSettingsContent({
    control,
}: DrawerSettingsContentProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={styles.navContainer}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Form Settings</Text>
            </View>
            <View style={styles.formContainer}>
            <View style={{ width: '100%' }}>
                <View style={styles.row}>
                    <FormInput
                        fieldName='config.name'
                        label='Form Name'
                        control={control}
                        style={styles.field}
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
                        style={styles.field}
                    />
                </View>
            </View>
            <View style={{ }}>
                <View style={styles.row}>
                    <CheckboxField
                        control={control}
                        name={`config.displayRowNumbers`}
                        isDisabled={false}
                        label="Display Row Numbers"
                        labelStyle={{ color: '#000' }}
                        containerStyle={{ borderBottomWidth: 0, backgroundColor: 'transparent' }}
                        style={styles.field}
                    />
                </View>
            </View>
            </View>
        </View>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    field: { 
        backgroundColor: 'transparent' 
    },
    navContainer: {
        flexGrow: 1,
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flexDirection: 'column',
    },
    formContainer: {
        marginHorizontal: 24,
        borderRadius: theme.roundness,
        paddingTop: 12,
        paddingHorizontal: 8,
      backgroundColor: '#fff',
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

