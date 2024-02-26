import { FieldComponentProps } from "./form-field";
import { TextField } from "./form-text-field";

export function NumericField(props: FieldComponentProps) {
    return (
        <TextField
            {...props}
            inputProps={{ 
                keyboardType: 'number-pad',
            }}
        />
    )
}