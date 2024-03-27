import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { FormEntryV2, FormRow } from "../../lib/config";
import { FormSnackbar, FormSnackbarType } from "../../components/form-snackbar";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import { ScrollView, View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DataCollectionForm } from "../../components/data-collection-form";
import { ScreenNavigator } from "./_screen-navigator";
import { deleteEntry, saveEntry } from "../../lib/database";
import { exportForm } from "../../lib/form-export";
import { DiscardFormDialog } from "./discard-dialog";
import { DeleteFormDialog } from "./delete-form.dialog";

export type LoadingState = 'LOADING' | 'ERROR' | 'LOADED';

type EntryFormProps = {
    entry: FormEntryV2;
    state: LoadingState;
    loadingError: string;
}

export function EntryForm({
    entry,
    state,
    loadingError
}: EntryFormProps) {
    const [entryId, setEntryId] = useState<number>(entry?.id);
    const [snackbarOptions, setSnackbarOptions] = useState<{ type: FormSnackbarType, message: string } | undefined>();
    const [screenIndex, setScreenIndex] = useState(0);
    const router = useRouter();
    const [isExporting, setIsExporting] = useState(false);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [showDeleteFormDialog, setShowDeleteFormDialog] = useState(false);
    const theme = useTheme();

    async function handleSubmit(values: FormEntryV2) {
        console.log('submitting...')

        const vals = {
            ...values,
            id: entry?.id || entryId,
        };

        try {
            const id = await saveEntry(vals);

            if (id) {
                setEntryId(id);
                setSnackbarOptions({ type: 'SUCCESS', message: 'Form Saved!' });
            }
            else {
                setSnackbarOptions({ type: 'ERROR', message: 'An error occured saving, please try again.' });
            }
        } 
        catch (e) {
            console.error(e);
            setSnackbarOptions({ type: 'ERROR', message: e?.message || 'An error occured saving, please try again.' });
        }
    }

    async function handleDeleteForm() {
        try {
            if (entry.id) {
                await deleteEntry(entry);
            }
            
            router.replace('/');
        }
        catch (e) {
            console.error(e);
            setSnackbarOptions({ type: 'ERROR', message: e?.message || 'An error occured deleting, please try again.' });
        }
    }

    async function handleExportForm(values: FormEntryV2) {
        setIsExporting(true);

        try {
            await exportForm(values);
            setSnackbarOptions({ type: 'SUCCESS', message: `Form exported!` });
        }
        catch (e) {
            setSnackbarOptions({ type: 'ERROR', message: 'An error occured exporting, please try again.' });
            console.error(e);
        }
    }

    return (
        <>
        <DiscardFormDialog
            onHideModal={() => setShowLeaveDialog(false)}
            isVisible={showLeaveDialog}
        />
        <DeleteFormDialog
            onHideModal={() => setShowDeleteFormDialog(false)}
            onDelete={handleDeleteForm}
            isVisible={showDeleteFormDialog}
        />
        <GestureHandlerRootView style={{ flexGrow: 1, }}>
            {
                !!snackbarOptions && (
                    <FormSnackbar
                        visible={!!snackbarOptions}
                        onClose={() => setSnackbarOptions(undefined)}
                        label={snackbarOptions?.message}
                        type={snackbarOptions?.type}
                    />
                )
            }
            <ScrollView contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'center',
                flexDirection: 'row',
            }}>
                <View style={styles.container}>
                    <View style={{
                        flexGrow: 1,
                    }}>
                        {
                            state === 'LOADING' && (
                                <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', }}>
                                    <ActivityIndicator animating={true} color={theme.colors.secondary} size='large' />
                                </View>
                            )
                        }
                        {
                            state === 'ERROR' && (
                                <Text>{loadingError}</Text>
                            )
                        }
                        {
                            entry && state === 'LOADED' && (
                                <DataCollectionForm
                                    screenIndex={screenIndex}
                                    isDesignMode={false}
                                    initialValues={entry}
                                    onSubmit={handleSubmit}
                                    onDiscardPress={() => setShowLeaveDialog(true)}
                                    onDeleteFormPress={() => setShowDeleteFormDialog(true)}
                                    onExportForm={handleExportForm}
                                    onChangeScreen={setScreenIndex}
                                />
                            )
                        }
                    </View>
                </View>
            </ScrollView>
        </GestureHandlerRootView>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#FFFFFF',
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'row',
        rowGap: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
});