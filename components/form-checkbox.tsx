import { useField } from "formik";
import { StyleSheet, View } from "react-native";
import { Checkbox, CheckboxItemProps, MD3Theme, useTheme } from "react-native-paper";
import { FieldComponentProps } from "./form-field";
import { useEffect, useRef } from "react";

export function CheckboxField({
    config,
    onChange,
    onPress,
    isDisabled,
    ...checkboxProps
}: FieldComponentProps & Omit<CheckboxItemProps, "status" | "label">) {
    const theme = useTheme();
    const [field, meta, helpers] = useField(config.name);
    const styles = makeStyles(theme);
    const valueChanged = useRef(false);

    function handlePress() {
        const val = !field.value; 
        helpers.setValue(val);

        if (typeof onPress === 'function') {
            onPress();
        }
    }

    useEffect(() => {
        if (valueChanged.current 
            && typeof onChange === 'function'
            && meta.touched
        ) {
            onChange(field.value);
        } 

        valueChanged.current = true;
    }, [ field.value ]);
    
    return (
       <View style={styles.container}>
            <Checkbox.Item
                {...checkboxProps}
                label={config.label || 'New Field'}
                status={field.value == true ? 'checked' : 'unchecked'}
                onPress={handlePress}        
                disabled={isDisabled}    
            />
       </View>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: theme.roundness, 
        borderBottomWidth: 1, 
        borderBottomColor: theme.colors.outlineVariant, 
        flexGrow: 1, 
        justifyContent: 'center'
    }
});