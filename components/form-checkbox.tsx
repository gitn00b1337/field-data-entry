import { View } from "react-native";
import { Checkbox, CheckboxItemProps } from "react-native-paper";

export type FormInputProps = {
    fieldName: string;
    value: string;
    label: string
} & CheckboxItemProps

export function FormCheckBox({
    fieldName,
    value,
    label,
    ...checkboxProps
}: FormInputProps) {
    return (
        <View>
            <Checkbox
                {...checkboxProps}
            />
        </View>
    )
}