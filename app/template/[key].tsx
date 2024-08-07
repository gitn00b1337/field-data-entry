import { useGlobalSearchParams, useRouter, } from "expo-router";
import { View } from "react-native";
import { ActivityIndicator, Text, useTheme, } from "react-native-paper";
import { loadConfiguration, saveConfiguration } from "../../lib/database";
import { useEffect, useState } from "react";
import { FormEntryV2, createFormV2, } from "../../lib/config";
import { TemplateForm } from "./template-form";
import { FormSnackbar, FormSnackbarType } from "../../components/form-snackbar";

export default function Config() {
    const params = useGlobalSearchParams();
    const configId = params.key as string;
    const [config, setConfig] = useState<FormEntryV2>();
    const [loadingError, setLoadingError] = useState('');
    const [snackbarOptions, setSnackbarOptions] = useState<{ type: FormSnackbarType, message: string } | undefined>();
    const router = useRouter();
    const theme = useTheme();

    useEffect(() => {
        loadConfiguration(configId)
            .then(result => {
                const form = createFormV2(result);
                setConfig(form);
                setLoadingError('');
            })
            .catch(e => {
                setLoadingError('An error occured loading the configuration.');    
                console.error(e);        
            });
    }, []);

    if (!configId) {
        router.navigate('/');
        return null;
    }

    async function handleSubmit(values: FormEntryV2) {
        console.log(`Submitting form...`);

        await saveConfiguration(values.config)
            .then((result) => {
                console.log('Form saved')
                setSnackbarOptions({ type: 'SUCCESS', message: 'Form Saved!' });
            })
            .catch((e) => {
                // todo display error
                console.error(e);
                setSnackbarOptions({ type: 'ERROR', message: e?.message || 'An error occured saving, please try again.' });
            });
    }

    if (loadingError) {
        return (
            <View>
                <Text>{ loadingError }</Text>
            </View>
        )
    }
    else if (!config) {
        return (
            <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', }}>
                <ActivityIndicator animating={true} color={theme.colors.secondary} size='large' />
            </View>
        )
    }

    return (
        <>
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
            <TemplateForm          
                initialValues={config}
                onSubmit={handleSubmit}
            />
        </>
    )
}