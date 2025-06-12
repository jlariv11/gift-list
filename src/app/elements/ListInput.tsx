interface ListInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    className?: string;
}
function ListInput(props: ListInputProps) {
    return (
        <div>
            <div>
                {props.label}
            </div>
            <input {...props} className={`border-2 border-gray-200 rounded-md shadow-sm ${props.className}`}></input>
        </div>
    )
}

export default ListInput;