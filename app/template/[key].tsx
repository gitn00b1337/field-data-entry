import { useGlobalSearchParams, useRouter, } from "expo-router";
import { View } from "react-native";
import { Text, } from "react-native-paper";
import { loadConfiguration, saveConfiguration } from "../../lib/database";
import { useEffect, useState } from "react";
import { FormEntryV2, createFormV2, } from "../../lib/config";
import { TemplateForm } from "./template-form";
import { Formik, FormikHelpers } from "formik";
import { FormSnackbar, FormSnackbarType } from "../../components/form-snackbar";

export default function Config() {
    const params = useGlobalSearchParams();
    const configId = params.key as string;
    const [config, setConfig] = useState<FormEntryV2>();
    const [loadingError, setLoadingError] = useState('');
    const [snackbarOptions, setSnackbarOptions] = useState<{ type: FormSnackbarType, message: string } | undefined>();
    const router = useRouter();

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
        router.push('/');
        return null;
    }

    async function handleSubmit(values: FormEntryV2, formikHelpers: FormikHelpers<FormEntryV2>) {
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
            <View>
                 <Text>Loading...</Text>
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
            <Formik
                initialValues={config}
                onSubmit={handleSubmit}
            >                
                {(props) => (
                    <TemplateForm
                        {...props}
                        showDrawer={true}
                    />
                )}
            </Formik>
        </>
    )
}