import { FormEntryV2, createFormConfig, createFormV2, } from "../../lib/config";
import { useRouter } from "expo-router";
import { TemplateForm } from "./template-form";
import { FormSnackbar, FormSnackbarType } from "../../components/form-snackbar";
import { useState } from "react";
import { saveConfiguration } from "../../lib/database";
import { View } from "react-native";

const config = createFormConfig();
const form = createFormV2(config);

export default function CreateTemplateScreen() {
    const router = useRouter();
    const [snackbarOptions, setSnackbarOptions] = useState<{ type: FormSnackbarType, message: string } | undefined>();

    async function handleSubmit(values: FormEntryV2) {
        console.log('Submitting form...');

        try {
            const result = await saveConfiguration(values.config);
            console.log('Configuration saved.');
                
            if (result.insertId) {
                router.push(`template/${result.insertId}?saved=true`);
            }
            else {
                console.log('No insert id!');
                console.log(result)
                setSnackbarOptions({ type: 'ERROR', message: 'An error occured saving, please try again.' });
            }
        }
        catch (e) {
            console.error(e);
            setSnackbarOptions({ type: 'ERROR', message: e?.message || 'An error occured saving, please try again.' });
        }
    }

    return (
        <View style={{ flex: 1, }}>
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
                initialValues={form}
                onSubmit={handleSubmit}
            />
        </View>
    )
}

