// import { View, StyleSheet, } from "react-native";
// import { FormField, createFieldOption } from "../../lib/config";
// import { Button, Dialog, Portal, PaperProvider, Text, TextInput } from 'react-native-paper';
// import { FormInput } from "../../components/form-input";
// import { FormSelect } from "../../components/form-select";
// import { FieldArray, FieldArrayRenderProps, Formik, FormikHelpers } from "formik";

// export type FieldEditDialogProps = {
//   field: FormField;
//   visible: boolean;
//   onHideDialog: () => void;
//   onSubmit: (values: FormField, formikHelpers: FormikHelpers<FormField>) => void;
// }

// type DropdownOption = {
//   label: string;
//   value: string;
// }
// type DropdownOptions = DropdownOption[];

// export function FieldEditDialog({
//   field,
//   visible,
//   onHideDialog,
//   onSubmit,
// }: FieldEditDialogProps) {
//   const typeOptions: DropdownOptions = [
//     { label: 'Text', value: 'TEXT' },
//     { label: 'Whole Number', value: 'WHOLE_NUMBER' },
//     { label: 'Dropdown', value: 'SELECT' },
//     { label: 'Timer', value: 'TIMER' },
//   ];

//   function handleAddOption(arrayHelper: FieldArrayRenderProps) {
//     const newOption = createFieldOption();
//     arrayHelper.push(newOption);
//   }

//   if (!field) {
//     return null;
//   }

//   return (
//     <Portal>
//       <Formik
//         initialValues={field}
//         onSubmit={onSubmit}
//       >
//         {({ values, submitForm }) => (
//           <Dialog
//             visible={visible}
//             onDismiss={onHideDialog}
//             dismissable={false}
//             style={styles.container}
//           >
//             <Dialog.Title>Edit Field</Dialog.Title>
//             <Dialog.Content>
//               <FieldArray
//                 name={`options`}
//                 render={(arrayHelper) => (
//                   <View>
//                     <View>
//                       <Text>
//                         To edit this form field, type the label you'd like to see for the field e.g. the question or topic and then choose
//                         the field type. For dropdown fields, you can then create the selectable options.
//                       </Text>
//                     </View>
//                     <View style={{ ...styles.fieldRow, ...styles.detailsRow }}>
//                       <View style={styles.fieldContainer}>
//                         <FormInput
//                           fieldName={`label`}
//                           label='Label'
//                           value={values.label}
//                           style={{ maxWidth: 350, marginBottom: 10, }}
//                         />
//                       </View>
//                     </View>
//                     <View style={{ ...styles.fieldRow, ...styles.detailsRow }}>
//                       <View style={styles.fieldContainer}>
//                         <FormSelect
//                           fieldName={`type`}
//                           value={field.type}
//                           label='Field Type'
//                           options={typeOptions}
//                           containerStyle={{ maxWidth: 350 }}
//                         />
//                       </View>
//                     </View>
//                     <View style={styles.fieldRow}>
//                       {
//                         values.type === 'SELECT' && values.options.map((option, opIndex) => {
//                           const name = `options[${opIndex}]`

//                           return (
//                             <View style={styles.optionRow}>
//                               <FormInput
//                                 fieldName={`${name}.label`}
//                                 value={option.label}
//                                 label='Label'
//                                 style={styles.option}
//                               />
//                               <FormInput
//                                 fieldName={`${name}.value`}
//                                 value={option.value}
//                                 label='Value'
//                                 style={styles.option}
//                               />
//                             </View>
//                           )
//                         })
//                       }
//                       {
//                         values.type === 'SELECT' && (
//                           <View style={styles.fieldRow}>
//                             <Button onPress={() => handleAddOption(arrayHelper)}>
//                               Add Option
//                             </Button>
//                           </View>
//                         )
//                       }
//                     </View>
//                   </View>
//                 )}
//               />
//             </Dialog.Content>
//             <Dialog.Actions>
//               <Button onPress={submitForm}>Done</Button>
//               <Button onPress={onHideDialog}>Cancel</Button>
//             </Dialog.Actions>
//           </Dialog>
//         )}
//       </Formik>
//     </Portal>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#fff',
//   },
//   fieldRow: {
//     marginBottom: 12,
//   },
//   fieldContainer: {

//   },
//   detailsRow: {
//     // justifyContent: 'flex-start',
//     // alignContent: 'stretch',
//     // alignItems: 'stretch',
//     // flexDirection: 'row',
//   },
//   option: {
//     flexGrow: 1,
//   },
//   optionRow: {
//     justifyContent: 'flex-start',
//     alignContent: 'stretch',
//     alignItems: 'stretch',
//     flexDirection: 'row',
//     gap: 12,
//   },
// })