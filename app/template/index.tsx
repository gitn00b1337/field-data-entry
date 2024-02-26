import { FormConfig, createFormConfig, } from "../../lib/config";
import { Formik, FormikHelpers } from 'formik';
import { useRouter } from "expo-router";
import { saveConfiguration } from "../../lib/database";
import { TemplateForm } from "./template-form";
import { FormSnackbar, FormSnackbarType } from "../../components/form-snackbar";
import { useState } from "react";

const config = createFormConfig();

export default function CreateTemplateScreen() {
    const router = useRouter();
    const [snackbarOptions, setSnackbarOptions] = useState<{ type: FormSnackbarType, message: string } | undefined>();

    async function handleSubmit(values: FormConfig, formikHelpers: FormikHelpers<FormConfig>) {
        await saveConfiguration(values)
            .then((result) => {
                if (result.insertId) {
                    router.push(`template/${result.insertId}?saved=true`);
                }
                else {
                    console.log('No insert id!');
                    console.log(result)
                    setSnackbarOptions({ type: 'ERROR', message: 'An error occured saving, please try again.' });
                }
            })
            .catch((e) => {
                // todo display error
                console.error(e);
                setSnackbarOptions({ type: 'ERROR', message: e?.message || 'An error occured saving, please try again.' });
            });
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

