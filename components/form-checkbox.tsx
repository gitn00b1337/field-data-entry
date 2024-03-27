import { StyleSheet, View, ViewStyle } from "react-native";
import { Checkbox, CheckboxItemProps, MD3Theme, useTheme } from "react-native-paper";
import { useEffect, useRef } from "react";
import { Control, Path, useController } from "react-hook-form";
import { FormEntryV2 } from "../lib/config";

export type FormCheckboxProps = {
    name: string;
    onChange?: (val: boolean) => void;
    isDisabled: boolean;
    control: Control<FormEntryV2, any>;
    onPress?: () => void;
    label: string;
    containerStyle?: ViewStyle
} & Omit<CheckboxItemProps, "status" | "label">;

export function CheckboxField({
    name,
    onChange,
    onPress,
    isDisabled,
    control,
    label,
    containerStyle,
    ...checkboxProps
}: FormCheckboxProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const valueChanged = useRef(false);
    const {
        field,
        fieldState,
    } = useController({
        name: name as Path<FormEntryV2>,
        control,
    });

    function handlePress() {
        const val = !field.value; 
        field.onChange(val);

        if (typeof onPress === 'function') {
            onPress();
        }
    }

    useEffect(() => {
        if (valueChanged.current 
            && typeof onChange === 'function'
            && fieldState.isTouched
        ) {
            onChange(field.value as boolean);
        } 

        valueChanged.current = true;
    }, [ field.value ]);
    
    return (
       <View style={[styles.container, containerStyle]}>
        <View style={{ flexGrow: 1, width: '100%', }} />
        <View style={{ justifyContent: 'flex-end', }}>
            <Checkbox.Item
                {...checkboxProps}
                label={label || 'New Field'}
                status={field.value == true ? 'checked' : 'unchecked'}
                onPress={handlePress}        
                disabled={isDisabled}   
                style={{
                    paddingBottom: 0,
                    marginBottom: 0,
                }} 
                labelStyle={{
                    paddingBottom: 4,
                    marginBottom: 0,
                    fontSize: 16,
                }}
                
            />           
        </View> 
       </View>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: theme.roundness, 
        borderBottomWidth: 1, 
        borderBottomColor: theme.colors.outline, 
        flexGrow: 1, 
        justifyContent: 'center',
        marginBottom: 10,
    }
});