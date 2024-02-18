import { StyleSheet, View, Text, TouchableOpacity, } from "react-native";
import { MD3Theme, TextInput, TextInputProps, useTheme } from "react-native-paper";
import { useEffect, useState } from "react";
import { FormFieldConfig } from "../lib/config";
import { useField } from "formik";
import { Dropdown } from 'react-native-element-dropdown';
import { FormSelectField } from "./form-select";

export type FormFieldProps = {
    config: FormFieldConfig;
    onPress?: () => void;
}

export function FormField(props: FormFieldProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);

    return (
        <TouchableOpacity 
            style={styles.container}
            onPress={props.onPress}
        >
            <FieldComponent {...props} />
        </TouchableOpacity>
    )
}

function FieldComponent(props : FormFieldProps) {
    switch (props.config.type) {
        case 'TEXT': return <TextField {...props} />;
        case 'SELECT': return (
            <FormSelectField 
                fieldName={`${props.config.name}.value`}
                label={props.config.label}
                options={props.config.options}
                onFocus={props.onPress}
            />
        );
        case 'BG_TIMER': return <Text>BG_TIMER</Text>;
        case 'TIMER': return <Text>TIMER</Text>;
        case 'NUMERIC': return <NumericField {...props} />;
        case 'WHOLE_NUMBER': return <WholeNumberField {...props} />;
        default: 
            console.error(`Field type ${props.config.type} not supported`);
            return null;
    }
}

export function WholeNumberField(props: FormFieldProps) {
    return (
        <TextField
            {...props}
            inputProps={{ keyboardType: 'numeric' }}
        />
    )
}

export function NumericField(props: FormFieldProps) {
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
    config,
    onPress,
    inputProps = {},
}: FormFieldProps & { inputProps?: TextInputProps }) {
    const {
        label,
        name,
    } = config;

    const [field, meta, helpers] = useField(`${name}.value`);

    return (
        <TextInput
            label={label || `New Field`}
            value={field.value}
            onChangeText={v => helpers.setValue(v)}
            style={{ 
                backgroundColor: '#fff', 
                marginBottom: 0,
                paddingBottom: 0,
            }}
            {...inputProps}
            onPressIn={onPress}
        />
    )
}

// export function SelectField({
//     config,
//     onPress,
// }: FormFieldProps) {
//     const {
//         label,
//         options,
//         multiSelect,
//         name,
//     } = config;
//     const [field, meta, helpers] = useField(`${name}.value`);
//     const [isFocus, setIsFocus] = useState(false);

//     useEffect(() => {
//         if (isFocus) {
//             onPress();
//         }
//     }, [ isFocus ]);

//     return (
//         <View style={{ position: 'relative', minHeight: 50, }}>
//             <View style={{ elevation: 10, minHeight: 300, position: 'absolute', top: 0, left: 0, right: 0, }}>
//                 <Dropdown
//                     style={[isFocus && { borderColor: 'blue' }]}
//                     placeholderStyle={styles.placeholderStyle}
//                     selectedTextStyle={styles.selectedTextStyle}
//                     inputSearchStyle={styles.inputSearchStyle}
//                     iconStyle={styles.iconStyle}
//                     data={data}
//                     search
//                     maxHeight={300}
//                     labelField="label"
//                     valueField="value"
//                     placeholder={!isFocus ? 'Select item' : '...'}
//                     searchPlaceholder="Search..."
//                     value={value}
//                     onFocus={() => setIsFocus(true)}
//                     onBlur={() => setIsFocus(false)}
//                     onChange={item => {
//                         setValue(item.value);
//                         setIsFocus(false);
//                     }}
//                     renderLeftIcon={() => (
//                         <AntDesign
//                         style={styles.icon}
//                         color={isFocus ? 'blue' : 'black'}
//                         name="Safety"
//                         size={20}
//                         />
//                     )}
//                     />
//             </View>
//         </View>
//     )

//     // return (
//     //     <PaperSelect
//     //         label={label}
//     //         value={field.value}
//     //         onSelection={handleSelection}
//     //         arrayList={options.map((op, index) => { return { ...op, _id: `${index}`}})}
//     //         multiEnable={multiSelect || false}
//     //         selectedArrayList={[]}
//     //         textInputStyle={{
//     //             backgroundColor: '#fff'
//     //         }}
//     //         textInputProps={{
                
//     //         }}
//     //     />
//     // )
//     // return (
//     //     <DropDown
//     //         label={label}
//     //         mode={"outlined"}
//     //         visible={showDropdown}
//     //         showDropDown={() => {
//     //             setShowDropdown(true);
//     //             onPress();
//     //         }}
//     //         onDismiss={() => setShowDropdown(false)}
//     //         value={field.value}
//     //         setValue={value => helpers.setValue(value)}
//     //         list={options}
//     //         multiSelect={multiSelect}
//     //         inputProps={{
//     //             paddingTop: 0,
//     //             borderColor: 'red'
//     //         }}
//     //     />
//     // )
// }

// const styles = StyleSheet.create({
//     container: {
//       backgroundColor: 'white',
//       padding: 16,
//     },
//     dropdown: {
//       height: 50,
//       borderColor: 'gray',
//       borderWidth: 0.5,
//       borderRadius: 8,
//       paddingHorizontal: 8,
//     },
//     icon: {
//       marginRight: 5,
//     },
//     label: {
//       position: 'absolute',
//       backgroundColor: 'white',
//       left: 22,
//       top: 8,
//       zIndex: 999,
//       paddingHorizontal: 8,
//       fontSize: 14,
//     },
//     placeholderStyle: {
//       fontSize: 16,
//     },
//     selectedTextStyle: {
//       fontSize: 16,
//     },
//     iconStyle: {
//       width: 20,
//       height: 20,
//     },
//     inputSearchStyle: {
//       height: 40,
//       fontSize: 16,
//     },
//   });

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexGrow: 1,
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

