import { StyleSheet, TouchableOpacity, View, } from "react-native";
import { FormFieldConfig, FormRow, FormScreenConfig, } from "../../lib/config";
import { Button, Text, MD3Theme, useTheme, List, IconButton, Divider, Icon, } from 'react-native-paper';
import React from 'react';
import { FieldArray, FieldArrayRenderProps } from "formik";
import { NestableDraggableFlatList, NestableScrollContainer, RenderItem, RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { DotsPopupMenu } from "../../components/dots-popup-menu";

export type DrawerRowContentProps = {
    theme: MD3Theme;
    fieldName: string;
    screenIndex: number;
    selectedRowIndex: number;
    screen: FormScreenConfig;
    selectedRow: FormRow | undefined;
    onAddFieldPress: (helper: FieldArrayRenderProps) => void;
    onEditFieldPress: (index: number) => void;
    onChangeRowPress: (index: number) => void;
    onDeleteRowPress: (arrayHelper: FieldArrayRenderProps) => void;
    onChangeFieldOrder: (from: number, to: number, arrayHelper: FieldArrayRenderProps) => void;
}

export function DrawerRowContent({
    theme,
    selectedRow,
    selectedRowIndex,
    fieldName,
    onAddFieldPress,
    screenIndex,
    onEditFieldPress,
    screen,
    onDeleteRowPress,
    onChangeRowPress,
    onChangeFieldOrder,
}: DrawerRowContentProps) {
    const styles = makeStyles(theme);

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

    function renderItem({ item, getIndex, drag, isActive }: RenderItemParams<FormFieldConfig>) {
        const index = getIndex();

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

    return (
        <View style={{ flexGrow: 1, }}>
            <FieldArray
                name={`screens[${screenIndex}].rows`}
                render={rowArrayHelper => (
                    <>
                        {
                            screen.rows.map((row, index) => {
                                const isExpanded = index === selectedRowIndex;

                                return (
                                    <View
                                        key={`row-${index}`}
                                        style={[
                                            styles.accordionContainer,
                                            { flexDirection: 'row', }
                                        ]}
                                    >
                                        <View style={{ flexGrow: 1, }}>
                                            <List.Accordion
                                                title={`Row ${index + 1}`}
                                                expanded={isExpanded}
                                                onPress={() => onChangeRowPress(index)}
                                                style={[styles.accordion]}
                                                titleStyle={[styles.accordionTitle, isExpanded ? {fontWeight: '700'} : {}]}
                                                descriptionStyle={styles.accordionDescription}
                                                right={props => (
                                                    <List.Icon
                                                        icon='chevron-down'
                                                        style={{ display: 'none' }}
                                                    />
                                                )}
                                                >                                                
                                                {
                                                    index === selectedRowIndex && (
                                                        <FieldArray
                                                            name={`screens[${screenIndex}].rows[${selectedRowIndex}].fields`}
                                                            render={arrayHelper => (
                                                                <NestableScrollContainer contentContainerStyle={styles.navContainer}>
                                                                    <NestableDraggableFlatList
                                                                        style={{ flex: undefined, flexGrow: 0, }}
                                                                        contentContainerStyle={{ flex: undefined, flexGrow: 0, }}
                                                                        containerStyle={{ flexGrow: 0, flex: undefined, width: '100%' }}
                                                                        data={selectedRow.fields}
                                                                        onDragEnd={({ from, to }) => onChangeFieldOrder(from, to, arrayHelper)}
                                                                        keyExtractor={(field, fieldIndex) => `row${selectedRowIndex}-fieldconfig${fieldIndex}`}
                                                                        renderItem={renderItem}
                                                                    />
                                                                    <View style={[styles.row, { flexDirection: 'column'}]}>
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
                                                                                onPress={() => onAddFieldPress(arrayHelper)}
                                                                            >
                                                                                Add Field
                                                                            </Button>
                                                                        </View>
                                                                    </View>
                                                                </NestableScrollContainer>
                                                            )}
                                                        />
                                                    )
                                                }
                                            </List.Accordion>
                                        </View>
                                        <View>
                                            <DotsPopupMenu
                                                size={20}
                                                actions={[
                                                    { key: 'delete', label: 'Delete', onPress: () => onDeleteRowPress(rowArrayHelper) }
                                                ]}
                                            />
                                        </View>
                                    </View>
                                )
                            })
                        }
                    </>
                )}
            />
        </View>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
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
        flexGrow: 1,
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
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
        flexGrow: 1,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 2,
    },
    addFieldDivider: {
        marginHorizontal: 'auto',
        backgroundColor: theme.colors.outlineVariant,
        width: '90%',
        alignSelf: 'center',
        marginTop: 12,
    },
    addFieldBtnContent: {
        paddingVertical: 0,
        marginVertical: 0,
        paddingTop: 0,
        justifyContent: 'flex-start',
        paddingLeft: 0,
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
        borderColor: theme.colors.outlineVariant,
        paddingVertical: 4,

    },
    accordionTitle: {
        padding: 0,
        margin: 0,
        color: '#000'
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