import { useGlobalSearchParams, useRouter, } from "expo-router";
import { View } from "react-native";
import { Text, Snackbar } from "react-native-paper";
import { loadConfiguration, saveConfiguration } from "../../lib/database";
import { useEffect, useState } from "react";
import { FormConfig, FormFieldConfig } from "../../lib/config";
import { TemplateForm } from "./template-form";
import { Formik, FormikHelpers } from "formik";
import { FormSnackbar, FormSnackbarType } from "../../components/form-snackbar";

export default function Config() {
    const params = useGlobalSearchParams();
    const configId = params.key as string;
    const [config, setConfig] = useState<FormConfig>();
    const [loadingError, setLoadingError] = useState('');
    const [snackbarOptions, setSnackbarOptions] = useState<{ type: FormSnackbarType, message: string } | undefined>();
    const router = useRouter();

    useEffect(() => {
        loadConfiguration(configId)
            .then(result => {
                setConfig(result);
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

    async function handleSubmit(values: FormConfig, formikHelpers: FormikHelpers<FormConfig>) {
        console.log(`Submitting form...`);

        await saveConfiguration(values)
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
    if (snackbarOptions) {
        console.log(snackbarOptions)
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