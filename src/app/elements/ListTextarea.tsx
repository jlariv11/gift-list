interface ListTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}
function ListTextarea(props: ListTextareaProps) {
    return (
        <div>
            <div>
                {props.label}
            </div>
            <textarea {...props} className="border-2 border-gray-200 rounded-md shadow-sm"></textarea>
        </div>
    )
}

export default ListTextarea;