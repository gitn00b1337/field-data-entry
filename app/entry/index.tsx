import { Stack, useGlobalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { Form, createForm, getEntryInitialValues, getFormInitialEntry } from "../../lib/form";
import { loadConfiguration } from "../../lib/database";
import { DataCollectionForm } from "../../components/data-collection-form";
import { HeaderButtons } from "./_header-buttons";
import { ScreenNavigator } from "./_screen-navigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function EntryScreen() {
    const searchParams = useGlobalSearchParams();
    const templateId = searchParams.templateId as string;
    const [form, setForm] = useState<Form>();
    const [state, setState] = useState<'LOADING' | 'ERROR' | 'LOADED'>('LOADING');
    const [loadingError, setLoadingError] = useState('');
    const [screenIndex, setScreenIndex] = useState(0);

    function loadForm() {
        loadConfiguration(templateId)
            .then(config => {
                const form = createForm(config);

                setForm(form);
                setState('LOADED');
                setLoadingError('');
            })
            .catch(e => {
                setLoadingError('An error occured loading the configuration.');    
                console.error(e);        
            });
    }

    useEffect(() => {
        loadForm();
    }, []);

    return (
        <GestureHandlerRootView style={{ flexGrow: 1, }}>
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <HeaderButtons
                            onDiscardEntry={() => {}}
                            onSaveEntry={() => {}}
                        />
                    )
                }}
            />
            <ScrollView contentContainerStyle={{ 
                flexGrow: 1, 
                justifyContent: 'center', 
                flexDirection: 'row', 
            }}>
                <View style={styles.container}>
                    {
                        form?.config && (
                            <ScreenNavigator
                                config={form.config}
                                screenIndex={screenIndex}
                                setScreenIndex={setScreenIndex}
                            />
                        )
                    }
                    <Text style={styles.header}>{form?.config?.name || 'APOPO Data Collection'}</Text>
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
                                    initialValues={form.entry}
                                    onSubmit={() => { }}
                                    form={form}
                                />
                            )
                        }
                    </View>
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    )
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