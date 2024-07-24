import { StyleSheet, View, ViewStyle } from "react-native";
import { Checkbox, CheckboxItemProps, MD3Theme, useTheme } from "react-native-paper";
import { useEffect, useRef } from "react";
import { Control, Controller, Path, useController } from "react-hook-form";
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
    onChange: propOnChange,
    onPress,
    isDisabled,
    control,
    label,
    containerStyle,
    labelStyle,
    ...checkboxProps
}: FormCheckboxProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);

    // useEffect(() => {
    //     if (typeof onChange === 'function'&& fieldState.isTouched
    //     ) {
    //         onChange(field.value as boolean);
    //     }
    // }, [ field.value ]);
    
    return (
       <View style={[styles.container, containerStyle]}>
        <View style={{ flexGrow: 1, width: '100%', }} />
        <View style={{ justifyContent: 'flex-end', }}>
            <Controller
                key={`field-${name}`}
                control={control}
                name={name as Path<FormEntryV2>}
                render={({ field: { onChange, onBlur, value,  name }}) => {
                    function handleChange() {
                        onChange(!value);

                        if (typeof propOnChange === 'function') {
                            propOnChange(!value);
                        }
                    }

                    return (
                        <Checkbox.Item
                            {...checkboxProps}
                            label={label || 'New Field'}
                            status={value == true ? 'checked' : 'unchecked'}
                            onPress={handleChange}     
                            disabled={isDisabled}   
                            style={{
                                paddingBottom: 0,
                                marginBottom: 0,
                            }} 
                            labelStyle={[{
                                paddingBottom: 4,
                                marginBottom: 0,
                                fontSize: 16,
                            }, labelStyle]}
                        /> 
                    )
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