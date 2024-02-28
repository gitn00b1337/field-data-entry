import { useGlobalSearchParams, } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { loadConfiguration, saveEntry } from "../../lib/database";
import { createFormV2 } from "../../lib/config";
import { LoadedEntry } from "./[id]";
import { Text } from "react-native-paper";
import { EntryForm } from "./form";

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
        <EntryForm
            entry={loadedEntry.data}
            state={loadedEntry.state}
            loadingError={loadedEntry.error}
        />
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