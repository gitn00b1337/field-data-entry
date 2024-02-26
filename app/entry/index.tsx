import { useGlobalSearchParams, } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { loadConfiguration, saveEntry } from "../../lib/database";
import { createFormV2 } from "../../lib/config";
import { EntryScreen, LoadedEntry } from "./[id]";
import { Text } from "react-native-paper";

export default function CreateEntryScreen() {
    const searchParams = useGlobalSearchParams();
    const templateId = searchParams.templateId as string;
    const [loadedEntry, setLoadedEntry] = useState<LoadedEntry>({ state: 'LOADING' });

    useEffect(() => {
        loadForm();
    }, []);

    function loadForm() {
        if (!templateId) {
            return;
        }

        loadConfiguration(templateId)
            .then(config => {
                const form = createFormV2(config);

                setLoadedEntry({
                    data: form,
                    state: 'LOADED',
                    error: ''
                });
            })
            .catch(e => {
                setLoadedEntry({
                    error: 'An error occured loading the configuration.',
                    state: 'ERROR',
                });
                console.error(e);        
            });
    }

    if (!templateId) {
        return (
            <View>
                <Text>No template found.</Text>
            </View>
        )
    }

    return (
        <EntryScreen
            entry={loadedEntry.data}
            state={loadedEntry.state}
            loadingError={loadedEntry.error}
        />
    )
}

// export default function EntryScreen() {
//     const searchParams = useGlobalSearchParams();
//     const templateId = searchParams.templateId as string;
//     const [form, setForm] = useState<FormEntryV2>();
//     const [state, setState] = useState<'LOADING' | 'ERROR' | 'LOADED'>('LOADING');
//     const [loadingError, setLoadingError] = useState('');
//     const [screenIndex, setScreenIndex] = useState(0);
//     const formRef = useRef<FormikProps<FormEntryV2>>(null);
//     const [snackbarOptions, setSnackbarOptions] = useState<{ type: FormSnackbarType, message: string } | undefined>();
//     const router = useRouter();

//     useEffect(() => {
//         loadForm();
//     }, []);

//     function loadForm() {
//         if (!templateId) {
//             return;
//         }

//         loadConfiguration(templateId)
//             .then(config => {
//                 const form = createFormV2(config);

//                 setForm(form);
//                 setState('LOADED');
//                 setLoadingError('');
//             })
//             .catch(e => {
//                 setLoadingError('An error occured loading the configuration.');    
//                 console.error(e);        
//             });
//     }

//     function handleSubmit(values: any) {
//         console.log('submitting...')

//         return saveEntry(values)
//             .then((result) => {
//                 if (result.insertId) {
//                     console.log(`Routing to entry/${result.insertId}`)
//                     router.replace(`entry/${result.insertId}?saved=true`);
//                     setSnackbarOptions({ type: 'SUCCESS', message: 'Form Saved!' });
//                 }
//                 else {
//                     console.log('No insert id!');
//                     console.log(result)
//                     setSnackbarOptions({ type: 'ERROR', message: 'An error occured saving, please try again.' });
//                 }
//             })
//             .catch((e) => {
//                 // todo display error
//                 console.error(e);
//                 setSnackbarOptions({ type: 'ERROR', message: e?.message || 'An error occured saving, please try again.' });
//             });
//     }

//     function onSaveButtonPress() {
//         if (typeof formRef?.current?.handleSubmit === 'function') {
//             formRef.current.handleSubmit();
//         }
//     }

//     function onDiscardPress() {
//         router.push('/');
//     }

//     if (!templateId) {
//         router.push('/');
//         return null;
//     }

//     return (
//         <GestureHandlerRootView style={{ flexGrow: 1, }}>
//             <Stack.Screen
//                 options={{
//                     headerRight: () => (
//                         <HeaderButtons
//                             onDiscardEntry={onDiscardPress}
//                             onSaveEntry={onSaveButtonPress}
//                         />
//                     )
//                 }}
//             />
//             {
//                 !!snackbarOptions && (
//                     <FormSnackbar
//                         visible={!!snackbarOptions}
//                         onClose={() => setSnackbarOptions(undefined)}
//                         label={snackbarOptions?.message}
//                         type={snackbarOptions?.type}
//                     />
//                 )
//             }
//             <ScrollView contentContainerStyle={{ 
//                 flexGrow: 1, 
//                 justifyContent: 'center', 
//                 flexDirection: 'row', 
//             }}>
//                 <View style={styles.container}>
//                     {
//                         form && (
//                             <ScreenNavigator
//                                 form={form}
//                                 screenIndex={screenIndex}
//                                 setScreenIndex={setScreenIndex}
//                             />
//                         )
//                     }
//                     <Text style={styles.header}>{form?.name || 'APOPO Data Collection'}</Text>
//                     <View style={{ 
//                         flexGrow: 1, 
//                     }}>
//                         {
//                             state === 'LOADING' && (
//                                 <Text>Loading...</Text>
//                             )
//                         }
//                         {
//                             state === 'ERROR' && (
//                                 <Text>{loadingError}</Text>
//                             )
//                         }
//                         {
//                             state === 'LOADED' && (
//                                 <DataCollectionForm
//                                     screenIndex={screenIndex}
//                                     isDesignMode={false}
//                                     initialValues={form}
//                                     onSubmit={handleSubmit}
//                                     form={form}
//                                     formRef={formRef}
//                                 />
//                             )
//                         }
//                     </View>
//                 </View>
//             </ScrollView>
//         </GestureHandlerRootView>
//     )
// }

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