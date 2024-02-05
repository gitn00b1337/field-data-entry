import { StyleSheet, View, Text, } from "react-native";
import { MD3Theme, TextInput, TextInputProps, useTheme } from "react-native-paper";
import { useState } from "react";
import DropDown from "react-native-paper-dropdown";
import { FormFieldConfig } from "../lib/config";
import { useField } from "formik";

export type FormFieldProps = {
    config: FormFieldConfig;
}

export function FormField({
    config,
}: FormFieldProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={styles.container}>
            <FieldComponent config={config} />
        </View>
    )
}

function FieldComponent({ config } : { config: FormFieldConfig }) {
    switch (config.type) {
        case 'TEXT': return <TextField {...config} />;
        case 'SELECT': return <SelectField {...config} />;
        case 'BG_TIMER': return <Text>BG_TIMER</Text>;
        case 'TIMER': return <Text>TIMER</Text>;
        case 'NUMERIC': return <NumericField {...config} />;
        case 'WHOLE_NUMBER': return <WholeNumberField {...config} />;
        default: 
            console.error(`Field type ${config.type} not supported`);
            return null;
    }
}

export function WholeNumberField(props: FormFieldConfig) {
    return (
        <TextField
            {...props}
            inputProps={{ keyboardType: 'numeric' }}
        />
    )
}

export function NumericField(props: FormFieldConfig) {
    return (
        <TextField
            {...props}
            inputProps={{ 
                keyboardType: 'number-pad',
        }}
        />
    )
}

export function TextField({
    label,
    name,
    inputProps = {},
}: FormFieldConfig & { inputProps?: TextInputProps }) {
    const [field, meta, helpers] = useField(`${name}.value`);

    return (
        <TextInput
            label={label || `New Field`}
            value={field.value}
            onChangeText={v => helpers.setValue(v)}
            style={{ 
                backgroundColor: '#fff', 
            }}
            {...inputProps}
        />
    )
}

export function SelectField({
    label,
    options,
    multiSelect,
    name,
}: FormFieldConfig) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [field, meta, helpers] = useField(`${name}.value`);

    return (
        <DropDown
            label={label}
            mode={"outlined"}
            visible={showDropdown}
            showDropDown={() => setShowDropdown(true)}
            onDismiss={() => setShowDropdown(false)}
            value={field.value}
            setValue={value => helpers.setValue(value)}
            list={options}
            dropDownStyle={{

            }}
            multiSelect={multiSelect}
        />
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexGrow: 1,
    },
    sectionBtnContainer: {
        alignItems: 'flex-end',
    },
    field: {
        backgroundColor: '#fff',
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'space-evenly',
        alignContent: 'stretch',
        columnGap: 12,
    },
    formSectionBtn: {
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
        borderWidth: 0,
        maxWidth: 150,
        marginBottom: 12,
    },
    formSectionBtnLabel: {
        textTransform: 'uppercase',
        fontWeight: '900',
        color: theme.colors.onBackground,
    },
});

