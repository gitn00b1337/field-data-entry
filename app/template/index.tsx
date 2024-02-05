import { FormConfig, createFormConfig, } from "../../lib/config";
import { Formik, FormikHelpers } from 'formik';
import { useRouter } from "expo-router";
import { saveConfiguration } from "../../lib/database";
import { TemplateForm } from "./template-form";

const config = createFormConfig();

export default function CreateTemplateScreen() {
    const router = useRouter();

    async function handleSubmit(values: FormConfig, formikHelpers: FormikHelpers<FormConfig>) {
        console.log(`Submitting form...`);

        await saveConfiguration(values)
            .then((result) => {
                if (result.insertId) {
                    console.log(result)
                    console.log('Redirecting...')
                    router.push(`template/${result.insertId}`)
                }
                else {
                    console.log('No insert id!');
                    console.log(result)
                    console.log('rows:')
                    console.log(result.rowsAffected)
                }
            })
            .catch((e) => {
                // todo display error
                console.error(e);
            });
    }

    return (
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

