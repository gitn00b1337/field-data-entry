import { StyleSheet, View, } from "react-native";
import { FormEntryV2, FormFieldConfig, FormRow, FormScreenConfig, } from "../../lib/config";
import { Button, Text, MD3Theme, List, useTheme, } from 'react-native-paper';
import React from 'react';
import { NestableDraggableFlatList, NestableScrollContainer, RenderItemParams, } from "react-native-draggable-flatlist";
import { DotsPopupMenu } from "../../components/dots-popup-menu";
import { useGlobalState } from "../global-state";
import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import { CheckboxField } from "../../components/form-checkbox";
import { AddButton } from "../../components/add-button";
import { FormInput } from "../../components/form-input";
import { TouchableOpacity } from "react-native-gesture-handler";

export type DrawerRowContentProps = {
    theme: MD3Theme;
    fieldName: string;
    screenIndex: number;
    selectedRowIndex: number;
    screen: FormScreenConfig;
    
    control: Control<FormEntryV2, any>;
    setValue: UseFormSetValue<FormEntryV2>;

    onAddField: () => void;
    onEditFieldPress: (index: number) => void;
    onMoveField: (from: number, to: number) => void;
    onChangeRowPress: (index: number) => void;
    onAddRow: () => void;
    onDeleteRow: (index: number) => void;
}

type RenderItemProps = RenderItemParams<FormFieldConfig> & { 
    onEditFieldPress: (index: number) => void; 
    theme: MD3Theme; 
}

function renderItem({ 
    item, 
    getIndex, 
    drag, 
    isActive, 
    onEditFieldPress, 
    theme, 
}: RenderItemProps) {
    const index = getIndex();
    const styles = makeStyles(theme);

    return (
        <List.Item
            title={item.label || 'New Field'}
            onLongPress={drag}
            disabled={isActive}
            style={styles.listItem}
            left={props => <List.Icon icon='drag-vertical' />}
            titleStyle={styles.listItemTitle}
            contentStyle={styles.listItemContent}
            onPress={() => onEditFieldPress(index)}
        />
    )
}

export function DrawerRowContent({
    theme,
    selectedRowIndex,
    screenIndex,
    screen,
    control,
    onMoveField,
    onEditFieldPress,
    onAddField,
    onChangeRowPress,
    onAddRow,
    onDeleteRow,
}: DrawerRowContentProps) {
    const styles = makeStyles(theme);
    const [_, dispatch] = useGlobalState();

    const rows = useWatch({
        control,
        name: `config.screens.${screenIndex}.rows`,
    });

    const selectedRow = rows[selectedRowIndex];
    console.log(`Selected row index: ${selectedRowIndex}`);
    console.log(`Drawer rows: ${rows.length}`)

    if (!selectedRow) {
        return (
            <View style={styles.navContainer}>
                <View style={styles.row}>
                    <Text style={styles.noScreenText}>
                        Select a screen to configure rows.
                    </Text>
                </View>
            </View>
        )
    }

    return (
        <View style={{ flexGrow: 1, backgroundColor: theme.colors.surface, }}>
            <View style={styles.breadcrumbContainer}>
                <Button
                    icon="chevron-left"
                    onPress={() => dispatch('SET_DRAWER_CONFIG_TYPE', 'NAV')}
                >
                    Screens
                </Button>
            </View>
            <View style={{ flex: 1, }}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{`Screen ${screenIndex + 1}`}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 12, }}>
                <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>
                        Rows
                    </Text>                
                </View>
                <TouchableOpacity  
                    onPress={onAddRow} 
                >
                    <Text style={{ fontSize: 12, color: theme.colors.primary }}>Add Row</Text>
                </TouchableOpacity>
            </View>
            <View style={{
                backgroundColor: '#fff',
                borderRadius: theme.roundness,
                overflow: 'hidden',
                marginHorizontal: 24,
            }}>
            {
                rows.map((row, index) => (
                    <RowConfig
                        key={`row-${index}`}
                        row={row}
                        index={index}
                        control={control}
                        screen={screen}
                        screenIndex={screenIndex}
                        onChangeRowPress={onChangeRowPress}
                        onMoveField={onMoveField}
                        onEditFieldPress={onEditFieldPress}
                        selectedRowIndex={selectedRowIndex}
                        onAddField={onAddField}
                        onDeleteRow={onDeleteRow}
                    />
                ))
            }
            </View>
            </View>
            
        </View>
    )
}

type RowConfigProps = {
    row: FormRow;
    index: number;
    screenIndex: number;
    selectedRowIndex: number;
    screen: FormScreenConfig;
    
    control: Control<FormEntryV2, any>;
    onAddField: () => void;
    onEditFieldPress: (index: number) => void;
    onMoveField: (from: number, to: number) => void;
    onChangeRowPress: (index: number) => void;
    onDeleteRow: (index: number) => void;
}

function RowConfig({
    index,
    selectedRowIndex,
    control,
    screenIndex,
    row,
    screen,
    onChangeRowPress,
    onMoveField,
    onEditFieldPress,
    onAddField,
    onDeleteRow,
}: RowConfigProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const isExpanded = index === selectedRowIndex;
    const selectedRow = screen?.rows[selectedRowIndex];
    const hasCopyBtn = useWatch({
        control,
        name: `config.screens.${screenIndex}.rows.${index}.hasCopyNewBtn`,
    })
    const maxFields = useWatch({
        control,
        name: `config.screens.${screenIndex}.rows.${index}.maxFields`,
    });

    return (
        <View
            key={row.id}
            style={[
                styles.accordionContainer,
                { flexDirection: 'row', },
            ]}
        >
            <View style={{ flexGrow: 1, }}>
                <List.Accordion
                    title={`Row ${index + 1}`}
                    expanded={isExpanded}
                    onPress={() => onChangeRowPress(index)}
                    style={[styles.accordion]}
                    titleStyle={[styles.accordionTitle, ]}
                    descriptionStyle={styles.accordionDescription}
                    right={props => (
                        <List.Icon
                            icon='chevron-down'
                            style={{ display: 'none' }}
                        />
                    )}
                    >                                                
                    {
                        index === selectedRowIndex && selectedRow.fields && (
                            <NestableScrollContainer contentContainerStyle={styles.navContainer}>
                                <View style={[styles.row]}>
                                    <CheckboxField
                                        control={control}
                                        name={`config.screens.${screenIndex}.rows.${index}.hasCopyNewBtn`}
                                        isDisabled={false}
                                        label="Enable Copy Button"
                                        labelStyle={styles.copyNewLabel}
                                        containerStyle={{ borderBottomWidth: 0, marginBottom: 0, }}
                                    />
                                </View>
                                <View style={styles.row}>
                                    <View style={{  flex: 1, flexDirection: 'row', paddingLeft: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12, }}>
                                        <View style={{ flex: 1, }}>
                                            <Text>Max Fields Per Row</Text>
                                        </View>
                                        <View style={{ width: 50 }}>
                                            <FormInput
                                                fieldName={`config.screens.${screenIndex}.rows.${index}.maxFields`}
                                                label=''
                                                control={control}
                                                keyboardType='numeric'
                                                style={{ fontSize: 14, color: '#000', paddingLeft: 0,  }}
                                                onFieldChange={(field, text) => field.onChange(isNaN(Number(text)) || text?.length === 0 ? text : Number(text))}
                                                onFieldBlur={(field, text) => field.onChange(Number(text) || 4)}
                                                // underlineColor={'#fff'}
                                            />
                                        </View>
                                        
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent:'space-between', flex: 1, marginBottom: 12, paddingLeft: 0 }}>
                                    <View style={styles.subHeaderContainer}>
                                        <Text style={styles.subHeader}>Row Fields</Text>
                                    </View>
                                    <TouchableOpacity onPress={onAddField}>
                                        <Text style={{ fontSize: 12, color: theme.colors.primary }}>Add Field</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1, paddingLeft: 8, marginBottom: 12,}}>
                                    <NestableDraggableFlatList
                                        style={{ flex: undefined, flexGrow: 0, }}
                                        contentContainerStyle={{ flex: undefined, flexGrow: 0, }}
                                        containerStyle={{ flexGrow: 0, flex: undefined, width: '100%' }}
                                        data={selectedRow.fields}
                                        onDragEnd={({ from, to }) => onMoveField(from, to)}
                                        keyExtractor={(_, fieldIndex) => `row${selectedRowIndex}-fieldconfig${fieldIndex}`}
                                        renderItem={props => renderItem({ 
                                            ...props, 
                                            onEditFieldPress,
                                            theme,
                                        })}
                                    />
                                </View>
                            </NestableScrollContainer>
                        )
                    }
                </List.Accordion>
            </View>
            <View>
                <DotsPopupMenu
                    size={20}
                    actions={[
                        { key: 'delete', label: 'Delete', onPress: () => onDeleteRow(index) }
                    ]}
                />
            </View>
        </View>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    copyNewLabel: {
        color: '#000',
        fontWeight: 'normal',
        fontFamily: theme.fonts.default.fontFamily,
        fontSize: 14,
    },
    title:{
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 24,
    },
    titleContainer: {
        paddingLeft: 24,
    },
    sectionTitleContainer: {
        
    },
    sectionTitle: {
        fontWeight: '700',
        letterSpacing: 1,
    },
    breadcrumbContainer: {
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    noScreenText: {
        paddingTop: 24,
    },
    fieldLabel: {
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
    },
    fieldEditBtn: {
        alignSelf: 'flex-end',
        flexGrow: 0,
        width: 30,
        minWidth: 20,
    },
    fieldBtnContainer: {
        flexGrow: 0,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        alignContent: 'flex-start',
        minWidth: 1,
    },
    fieldDragBtn: {
        flexGrow: 0,
        width: 20,
        paddingHorizontal: 0,
        minWidth: 15,
    },
    fieldLabelContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
    },
    fieldLabelText: {
        flexGrow: 1,
        alignContent: 'stretch',
        justifyContent: 'center',
        alignItems: 'stretch',
        textAlignVertical: 'center',
    },

    navContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    addFieldBtn: {
        flexGrow: 1,
        textAlign: 'left',
        paddingLeft: 0,
        marginLeft: 0,
        borderRadius: 0,
    },
    addFieldContainer: {
        flexDirection: 'row',
        flex: 1,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 12,
        paddingBottom: 12,
    },
    addFieldDivider: {
        marginHorizontal: 'auto',
        backgroundColor: theme.colors.outline,
        width: '90%',
        alignSelf: 'center',
        marginTop: 12,
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
        paddingLeft: 8,
        // paddingHorizontal: 12,
    },
    subHeader: {
        fontWeight: '700',
        fontSize: 12,
    },
    subHeaderContainer: {
        paddingLeft: 24
    },
    header: {
        fontWeight: '700',
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    accordion: {
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: 0,
        marginBottom: 0,
        display: 'flex',
        gap: 0,
        rowGap: 0,
    },
    accordionContainer: {
        borderBottomWidth: 1,
        borderColor: theme.colors.outline,
        paddingVertical: 0,
    },
    firstAccordionContainer: {
        borderTopWidth: 1,
        borderColor: theme.colors.outline,
    },
    accordionTitle: {
        padding: 0,
        margin: 0,
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold'
    },
    accordionDescription: {
        padding: 0,
        margin: 0,
    },
    accordionContent: {
        display: 'flex',
        gap: 0,
        rowGap: 0,
    },
    listItem: {
        flexGrow: 1,
        paddingLeft: 12,
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: 0,
        marginBottom: 0,
    },
    listItemTitle: {
        fontSize: 14,
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: 0,
        marginBottom: 0,
        minHeight: 1,
    },
    listItemContent: {
        minHeight: 1,
    }
})