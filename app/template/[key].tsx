import { useGlobalSearchParams, } from "expo-router";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { loadConfiguration, saveConfiguration } from "../../lib/database";
import { useEffect, useState } from "react";
import { FormConfig, FormFieldConfig } from "../../lib/config";
import { TemplateForm } from "./template-form";
import { Formik, FormikHelpers } from "formik";

export default function Config() {
    const params = useGlobalSearchParams();
    const configId = params.key as string;
    const [config, setConfig] = useState<FormConfig>();
    const [loadingError, setLoadingError] = useState('');

    useEffect(() => {
        loadConfiguration(configId)
            .then(result => {
                console.log('Load result::')
                console.log(result)
                setConfig(result);
            })
            .catch(() => {
                setLoadingError('An error occured loading the configuration.');            
            })
    }, []);

    async function handleSubmit(values: FormConfig, formikHelpers: FormikHelpers<FormConfig>) {
        console.log(`Submitting form...`);

        await saveConfiguration(values)
            .then((result) => {
                console.log('Form saved')
            })
            .catch((e) => {
                // todo display error
                console.error(e);
            });
    }

    console.log(config)

    return (
        <View>
            {
                loadingError && (
                    <Text>{ loadingError }</Text>
                )
            }
            {
                config && (
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
                )
            }
            {
                !config && (
                    <Text>Loading...</Text>
                )
            }
        </View>
    )
}