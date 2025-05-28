type ListInputProps = {
    label: string;
    type: string;
    id?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
    onFinishEdit?: (e: React.FocusEvent<HTMLInputElement>) => void;
    value?: string | number;
    min?: number;
    max?: number;
    cols?: number;
    rows?: number;
}
function ListInput({label, type, id, onChange, onFinishEdit, value, min, max, cols, rows}: ListInputProps) {
    return (
        <div>
            <div>
                {label}
            </div>
            {type === 'textarea' ? (
                <textarea
                    className="border-2 border-gray-200 rounded-md shadow-sm"
                    cols={cols}
                    rows={rows}
                    value={value}
                    onChange={(e) => onChange(e)}
                />
            ) : (
                <input
                    className="border-2 border-gray-200 rounded-md shadow-sm"
                    id={id}
                    type={type}
                    min={type === 'number' ? min : undefined}
                    max={type === 'number' ? max : undefined}
                    value={value}
                    onChange={(e) => onChange(e)}
                    onBlur={(e) => onFinishEdit?.(e)}
                />
            )}

        </div>
    )
}

export default ListInput;