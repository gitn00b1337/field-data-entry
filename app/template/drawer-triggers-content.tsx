import { View, StyleSheet, } from "react-native";
import { Button, IconButton, MD3Theme, Text, useTheme, } from "react-native-paper";
import { FormInput } from "../../components/form-input";
import { FormConfig, FormScreenConfig, createTrigger } from "../../lib/config";
import { FieldArray, FieldArrayRenderProps } from "formik";
import { FormSelectField } from "../../components/form-select";
import { FormMultiSelectField } from "../../components/form-multiselect";

type DrawerTriggersContentProps = {
    theme: MD3Theme;
    form: FormConfig;
    screen: FormScreenConfig;
}

export function DrawerTriggersContent({
    theme,
    form,
    screen,
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
            name='triggers'
            render={(arrayHelper) => (
                <View style={styles.navContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.header}>Form Triggers</Text>
                    </View>
                    {
                        form.triggers.map((trigger, index) => {
                            return (
                                <View 
                                    key={`trigger-${index}`}
                                    style={styles.triggerContainer}
                                >
                                    <View style={{ backgroundColor: 'red'}}>
                                        <FormMultiSelectField
                                            fieldName={`triggers[${index}].rows`}
                                            label='When rows...'
                                            options={screen.rows.map((row, rowIndex) => {
                                                return {
                                                    label: `Row ${rowIndex+1}`,
                                                    value: row.key,
                                                }
                                            })}
                                            
                                        />
                                    </View>
                                    <View>
                                        <Text style={styles.triggerDesc}>Have all fields filled in, create a new set of these rows.</Text>
                                    </View>
                                </View>
                            )
                        })
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

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    navContainer: {
        flexGrow: 1,
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flexDirection: 'column',
    },
    triggerContainer: {
        flexDirection: 'column',
        width: '100%',
        paddingHorizontal: 12,
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
    triggerDesc: {
        flexGrow: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
    }
})

