import { StyleSheet, TouchableOpacity, ViewStyle, } from "react-native";
import { MD3Theme, useTheme } from "react-native-paper";
import { FormEntryV2, FormFieldConfig, } from "../lib/config";
import { FormSelectField } from "./form-select";
import { FormMultiSelectField } from "./form-multiselect";
import { CheckboxField } from "./form-checkbox";
import { TextField } from "./form-text-field";
import { NumericField } from "./form-numeric-field";
import { WholeNumberField } from "./form-wholenumber-field";
import { FormTimerButton } from "./form-timer-button";
import { Control, Controller } from "react-hook-form";
import { FormTallyField } from "./form-tally-field";
import { FormPlaybackButton } from "./form-playback-button";

export type FormFieldProps = {
    config: FormFieldConfig;
    onPress?: () => void;
    onChange?: (field: FormFieldConfig, value: any) => void;
    isDisabled?: boolean;
    control: Control<FormEntryV2, any>;
    containerStyle?: ViewStyle;
}

export type FieldComponentProps = {
    onChange?: (val: any) => void;
} & Omit<FormFieldProps, 'onChange'>;

export function FormField({
    onChange,
    containerStyle,
    ...props
}: FormFieldProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);

    function handleChange(val: any) {
        if (typeof onChange === 'function') {
            onChange(props.config, val);
        }
    }

    return (
        <TouchableOpacity 
            style={[styles.container, containerStyle]}
            onPress={props.onPress}
        >
            <FieldComponent 
                {...props} 
                config={{
                    ...props.config,
                    name: `values.${props.config.entryKey}.value`,
                }}
                onChange={handleChange} 
            />
        </TouchableOpacity>
    )
}

function FieldComponent(props : FieldComponentProps) {
    if (props.config.type === 'SELECT') {
        if (props.config.multiSelect) {
            return (
                <FormMultiSelectField 
                    fieldName={`${props.config.name}`}
                    label={props.config.label}
                    options={props.config.options}
                    onFocus={props.onPress}
                    onChange={props.onChange}
                    isDisabled={props.isDisabled}
                    control={props.control}
                />
            )
        }
        else {
            return (
                <FormSelectField 
                    fieldName={`${props.config.name}`}
                    label={props.config.label}
                    options={props.config.options}
                    onFocus={props.onPress}
                    onChange={props.onChange}
                    isDisabled={props.isDisabled}
                    control={props.control}
                    defaultValue={props.config.defaultValue}
                />
            );
        }
    }

    switch (props.config.type) {
        case 'TEXT': return <TextField {...props} />;
        case 'NUMERIC': return <NumericField {...props} />;
        case 'WHOLE_NUMBER': return <WholeNumberField {...props} />;
        case 'CHECKBOX': return (
            <CheckboxField 
                name={props.config.name}
                label={props.config.label}
                onPress={props.onPress}
                onChange={props.onChange}
                isDisabled={props.isDisabled}
                control={props.control}
            />
        );
        case 'TIMER': return (
            <FormTimerButton 
                position='IN_FORM'
                entryKey={props.config.entryKey}
                label={props.config.label}
                control={props.control}
                onPress={props.onPress}
                isDisabled={props.isDisabled}
                name={props.config.name}
            />
        )
        case 'TALLY': return <FormTallyField {...props} />;
        default: 
            console.error(`Field type ${props.config.type} not supported`);
            return null;
    }
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    container: {
        // paddingHorizontal: 12,
        flex: 1,
        position: 'relative',
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
        columnGap: 6,
    },
    formSectionBtn: {
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
        borderWidth: 0,
        maxWidth: 150,
        marginBottom: 6,
    },
    formSectionBtnLabel: {
        textTransform: 'uppercase',
        fontWeight: '900',
        color: theme.colors.onBackground,
    },
});

