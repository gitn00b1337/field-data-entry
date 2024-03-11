import { View, StyleSheet, } from "react-native";
import { Button, IconButton, MD3Theme, Text, useTheme, } from "react-native-paper";
import { FormEntryV2, FormFieldConfig, FormScreenConfig, FormTrigger, createTrigger } from "../../lib/config";
import { FormSelectField } from "../../components/form-select";
import { FormMultiSelectField } from "../../components/form-multiselect";
import { useEffect, useState } from "react";
import { DotsPopupMenu } from "../../components/dots-popup-menu";
import { Control, useFieldArray } from "react-hook-form";

type DrawerTriggersContentProps = {
    theme: MD3Theme;
    screen: FormScreenConfig;
    screenIndex: number;
    control: Control<FormEntryV2, any>;
}

export function DrawerTriggersContent({
    theme,
    screen,
    screenIndex,
    control,
}: DrawerTriggersContentProps) {
    const styles = makeStyles(theme);

    const triggers = useFieldArray({
        control,
        name: `config.screens.${screenIndex}.triggers`,
    });

    function handleAddTriggerPress() {
        if (!screen) {
            // todo notify user to click a screen.
            return;
        }

        const trigger = createTrigger(screen.key);
        triggers.append(trigger);
    }

    return (
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
                        onDeletePress={() => triggers.remove(index)}
                        screenIndex={screenIndex}
                        control={control}
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
                        onPress={handleAddTriggerPress}
                    >
                        Add Trigger
                    </Button>
                </View>
            </View>
        </View>
    )
}

type FormTriggerConfigProps = {
    trigger: FormTrigger;
    index: number;
    screen: FormScreenConfig;
    onDeletePress: () => void;
    screenIndex: number;
    control: Control<FormEntryV2, any>;
}

function FormTriggerConfig({
    trigger,
    index,
    screen,
    onDeletePress,
    screenIndex,
    control,
}: FormTriggerConfigProps) {
    const [fieldsAvailable, setFieldsAvailable] = useState<FormFieldConfig[]>([]);
    const theme = useTheme();
    const triggerStyles = makeTriggerStyles(theme);
    const fieldOptions = [
        ...fieldsAvailable.map((f, fIndex) => {
            return {
                label: f.label || 'New field' ,
                value: f.id,
            }
        }),
    ]

    useEffect(() => {
        const fields = trigger.rows.reduce<FormFieldConfig[]>((fields, rowKey) => {
            const row = screen.rows.find(r => r.id === rowKey);

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
            <View style={triggerStyles.configWrap}>  
            <View>
                <FormMultiSelectField
                    fieldName={`screens[${screenIndex}].triggers[${index}].rows`}
                    label='Target Row(s)'
                    options={screen.rows.map((row, rowIndex) => {
                        return {
                            label: `Row ${rowIndex+1}`,
                            value: row.id,
                        }
                    })}
                    control={control}
                />
            </View>
            <View>
                <FormMultiSelectField
                    fieldName={`screens[${screenIndex}].triggers[${index}].fields`}
                    label='Target field(s)'
                    options={fieldOptions}    
                    hasAllOption={true}   
                    allOptionLabel="All Fields"     
                    control={control}                                    
                />
            </View>
            <View>
                <FormSelectField
                    fieldName={`screens[${screenIndex}].triggers[${index}].action`}
                    label='Action'
                    options={[{ value: 'COPY_ROWS', label: 'Copy Rows' }]}
                    control={control}   
                    defaultValue="COPY_ROWS"                                     
                />
            </View>
            </View>
            <View style={{ justifyContent: 'flex-start', alignItems: 'center', alignContent: 'center'}}>
                <DotsPopupMenu
                    size={20}
                    actions={[
                        { key: 'delete', label: 'Delete', onPress: onDeletePress }
                    ]}
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
        flexDirection: 'row',
        paddingHorizontal: 12,
        borderBottomColor: theme.colors.surface,
        borderBottomWidth: 4,
        paddingBottom: 24,
        marginBottom: 24,
    },
    configWrap: {
        flexDirection: 'column',
        flexGrow: 1,
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

