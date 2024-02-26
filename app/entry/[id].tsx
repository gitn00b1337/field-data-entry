import { Stack, useGlobalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FormEntryV2 } from "../../lib/config";
import { FormSnackbar, FormSnackbarType } from "../../components/form-snackbar";
import { Text } from "react-native-paper";
import { ScrollView, View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DataCollectionForm } from "../../components/data-collection-form";
import { HeaderButtons } from "./_header-buttons";
import { FormikProps } from "formik";
import { ScreenNavigator } from "./_screen-navigator";
import { deleteEntry, loadEntry, saveEntry } from "../../lib/database";

type LoadingState = 'LOADING' | 'ERROR' | 'LOADED';

type UpdateEntryScreenProps = {
    entry: FormEntryV2;
    state: LoadingState;
    loadingError: string;
}

export function EntryScreen({
    entry,
    state,
    loadingError,
}: UpdateEntryScreenProps) {
    const [entryId, setEntryId] = useState<number>(entry?.id);
    const [snackbarOptions, setSnackbarOptions] = useState<{ type: FormSnackbarType, message: string } | undefined>();
    const [screenIndex, setScreenIndex] = useState(0);
    const formRef = useRef<FormikProps<FormEntryV2>>(null);
    const router = useRouter();

    console.log('EntryScreen!')

    function handleSaveButtonPress() {
        if (typeof formRef?.current?.handleSubmit === 'function') {
            formRef.current.handleSubmit();
        }
    }

    function handleDiscard() {
        if (router.canGoBack()) {
            router.back();
        }
        else {
            router.replace('/')
        }
    }

    async function handleSubmit(values: FormEntryV2) {
        console.log('submitting...')

        const vals = {
            ...values,
            id: entry?.id || entryId,
        };

        console.log(vals)

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

    async function handleDeleteFormPress() {
        try {
            await deleteEntry(entry)
            router.replace('/');
        }
        catch (e) {
            console.error(e);
            setSnackbarOptions({ type: 'ERROR', message: e?.message || 'An error occured deleting, please try again.' });
        }
    }

    return (
        <>
        <Stack.Screen
            options={{
                headerRight: () => (
                    <HeaderButtons
                        onDiscardEntry={handleDiscard}
                        onSaveEntry={handleSaveButtonPress}
                    />
                )
            }}
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
                    {
                        entry && (
                            <ScreenNavigator
                                form={entry}
                                screenIndex={screenIndex}
                                setScreenIndex={setScreenIndex}
                            />
                        )
                    }
                    <Text style={styles.header}>{entry?.name || 'APOPO Data Collection'}</Text>
                    <View style={{
                        flexGrow: 1,
                    }}>
                        {
                            state === 'LOADING' && (
                                <Text>Loading...</Text>
                            )
                        }
                        {
                            state === 'ERROR' && (
                                <Text>{loadingError}</Text>
                            )
                        }
                        {
                            state === 'LOADED' && (
                                <DataCollectionForm
                                    screenIndex={screenIndex}
                                    isDesignMode={false}
                                    initialValues={entry}
                                    onSubmit={handleSubmit}
                                    form={entry}
                                    formRef={formRef}
                                    onDiscardPress={handleDiscard}
                                    onDeleteFormPress={handleDeleteFormPress}
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

export type LoadedEntry = {
    data?: FormEntryV2;
    state: LoadingState;
    error?: string;
}

export default function UpdateEntryScreen() {
    const params = useGlobalSearchParams();
    const entryId = params.id as string;
    const [loadedEntry, setLoadedEntry] = useState<LoadedEntry>({ state: 'LOADING' });

    useEffect(() => {
        console.log('Loading ')

        loadEntry(entryId)
            .then(result => {
                setLoadedEntry({
                    state: 'LOADED',
                    data: result,
                    error: '',
                })
            })
            .catch(e => {
                setLoadedEntry({
                    error: 'An error occured loading the configuration.',
                    state: 'ERROR',
                });
                console.error(`Error loading entry!`)
                console.error(e);        
            });
    }, []);

    return (
        <EntryScreen
            entry={loadedEntry.data}
            state={loadedEntry.state}
            loadingError={loadedEntry.error}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#FFFFFF',
        maxWidth: 1200,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        alignSelf: 'center',
        paddingVertical: 24,
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