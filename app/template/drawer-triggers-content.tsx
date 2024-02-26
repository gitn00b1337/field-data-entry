import { View, StyleSheet, } from "react-native";
import { Button, IconButton, MD3Theme, Text, useTheme, } from "react-native-paper";
import { FormInput } from "../../components/form-input";
import { FormConfig, FormFieldConfig, FormScreenConfig, FormTrigger, createTrigger } from "../../lib/config";
import { FieldArray, FieldArrayRenderProps } from "formik";
import { FormSelectField } from "../../components/form-select";
import { FormMultiSelectField } from "../../components/form-multiselect";
import { FormCheckBox } from "../../components/form-checkbox";
import { useEffect, useState } from "react";

type DrawerTriggersContentProps = {
    theme: MD3Theme;
    form: FormConfig;
    screen: FormScreenConfig;
    screenIndex: number;
}

export function DrawerTriggersContent({
    theme,
    form,
    screen,
    screenIndex,
}: DrawerTriggersContentProps) {
    const styles = makeStyles(theme);

    function handleAddTriggerPress(helper: FieldArrayRenderProps) {
        if (!screen) {
            // todo notify user to click a screen.
            return;
        }

        const trigger = createTrigger(screen.key);
        helper.push(trigger);
    }

    return (
        <FieldArray
            name={`screens[${screenIndex}].triggers`}
            render={(arrayHelper) => (
                <View style={styles.navContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.header}>Form Triggers</Text>
                    </View>
                    {
                        screen.triggers.map((trigger, index) => (
                            <FormTriggerConfig 
                                key={`formtrigger-${index}`} 
                                trigger={trigger} 
                                index={index} 
                                screen={screen}
                                onDeletePress={() => arrayHelper.remove(index)}
                                screenIndex={screenIndex}
                            />
                        ))
                    }
                    <View style={[styles.row, { flexDirection: 'column' }]}>
                        <View style={styles.addFieldDivider} />
                        <View style={styles.addFieldContainer}>
                            <IconButton
                                icon='plus-circle-outline'
                                size={16}
                            />
                            <Button
                                style={styles.addFieldBtn}
                                contentStyle={styles.addFieldBtnContent}
                                labelStyle={styles.addFieldBtnText}
                                onPress={() => handleAddTriggerPress(arrayHelper)}
                            >
                                Add Trigger
                            </Button>
                        </View>
                    </View>
                </View>
            )}
        />

    )
}

type FormTriggerConfigProps = {
    trigger: FormTrigger;
    index: number;
    screen: FormScreenConfig;
    onDeletePress: () => void;
    screenIndex: number;
}

function FormTriggerConfig({
    trigger,
    index,
    screen,
    onDeletePress,
    screenIndex,
}: FormTriggerConfigProps) {
    const [fieldsAvailable, setFieldsAvailable] = useState<FormFieldConfig[]>([]);
    const theme = useTheme();
    const triggerStyles = makeTriggerStyles(theme);
    const fieldOptions = [
        ...fieldsAvailable.map((f, fIndex) => {
            return {
                label: f.label || 'New field' ,
                value: f.key,
            }
        }),
    ]

    useEffect(() => {
        const fields = trigger.rows.reduce<FormFieldConfig[]>((fields, rowKey) => {
            const row = screen.rows.find(r => r.key === rowKey);

            if (!row?.fields) {
                return fields;
            }

            return [
                ...fields,
                ...row?.fields,
            ]
        }, []);

        setFieldsAvailable(fields);
    }, [ trigger.rows ]);    
  
    return (
        <View 
            key={`trigger-${index}`}
            style={triggerStyles.triggerContainer}
        >         
            <View>
                <FormMultiSelectField
                    fieldName={`screens[${screenIndex}].triggers[${index}].rows`}
                    label='Target Row(s)'
                    options={screen.rows.map((row, rowIndex) => {
                        return {
                            label: `Row ${rowIndex+1}`,
                            value: row.key,
                        }
                    })}
                />
            </View>
            <View>
                <FormMultiSelectField
                    fieldName={`screens[${screenIndex}].triggers[${index}].fields`}
                    label='Target field(s)'
                    options={fieldOptions}    
                    hasAllOption={true}   
                    allOptionLabel="All Fields"                                         
                />
            </View>
            <View>
                <FormSelectField
                    fieldName={`screens[${screenIndex}].triggers[${index}].action`}
                    label='Action'
                    options={[{ value: 'COPY_ROWS', label: 'Copy Rows' }]}                                         
                />
            </View>
        </View>
    )
}

const makeTriggerStyles = (theme: MD3Theme) => StyleSheet.create({
    triggerDesc: {
        flexGrow: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    triggerContainer: {
        flexDirection: 'column',
        width: '100%',
        paddingHorizontal: 12,
        borderBottomColor: theme.colors.surface,
        borderBottomWidth: 4,
        paddingBottom: 24,
        marginBottom: 24,
    },
})

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    navContainer: {
        flexGrow: 1,
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flexDirection: 'column',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
        paddingHorizontal: 12,
    },
    addFieldDivider: {
        marginHorizontal: 'auto',
        backgroundColor: theme.colors.outlineVariant,
        width: '90%',
        alignSelf: 'center',
        marginTop: 12,
    },
    addFieldBtn: {
        flexGrow: 1,
        textAlign: 'left',
        paddingLeft: 0,
        marginLeft: 0,
        borderRadius: 0,
    },
    addFieldBtnContent: {
        paddingVertical: 0,
        marginVertical: 0,
        paddingTop: 0,
        justifyContent: 'flex-start',
        paddingLeft: 0,
    },
    addFieldContainer: {
        flexDirection: 'row',
        flexGrow: 1,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 2,
    },
    addFieldBtnText: {
        paddingVertical: 0,
        marginVertical: 0,
        paddingTop: 0,
        color: '#000',
        fontWeight: 'normal',
        fontFamily: theme.fonts.default.fontFamily,
        fontSize: 14,
        paddingLeft: 0,
        marginLeft: 0,
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
        // paddingHorizontal: 12,
    },
    header: {
        fontWeight: '700',
        flexGrow: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    
})

