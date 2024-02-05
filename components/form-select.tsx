import { useState } from "react";
import DropDown from "react-native-paper-dropdown";
import { useField } from 'formik';
import { View, ViewProps, ViewStyle } from "react-native";

export type FormSelectProps = {
    fieldName: string;
    value: string;
    label: string;
    options: {
        label: string;
        value: string;
    }[];
    style?: ViewStyle;
    multiSelect?: boolean;
    containerStyle?: ViewStyle;
}

export function FormSelect({
    fieldName,
    value,
    label,
    options,
    style = {},
    multiSelect = false,
    containerStyle = {},
}: FormSelectProps) {
    const [showDropDown, setShowDropDown] = useState(false);
    const [field, meta, helpers] = useField(fieldName);

    return (
        <View style={containerStyle}>
            <DropDown
                label={label}
                mode={"outlined"}
                visible={showDropDown}
                showDropDown={() => setShowDropDown(true)}
                onDismiss={() => setShowDropDown(false)}
                value={field.value}
                setValue={helpers.setValue}
                list={options}
                dropDownStyle={style}
                multiSelect={multiSelect}
            />
        </View>
    )
}