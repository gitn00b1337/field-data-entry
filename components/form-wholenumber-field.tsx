import { FieldComponentProps } from "./form-field";
import { TextField } from "./form-text-field";

export function WholeNumberField(props: FieldComponentProps) {
    return (
        <TextField
            {...props}
            inputProps={{ keyboardType: 'numeric' }}
        />
    )
}