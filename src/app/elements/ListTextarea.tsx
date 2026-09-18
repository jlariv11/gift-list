import React from "react";

interface ListTextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    helperText?: string;
    className?: string;
}

function ListTextarea({label, helperText, className = "", id, ...props}: ListTextareaProps) {
    return (
        <div className="w-full">
            {label && (<label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>)}

            <textarea{...props} id={id} className={` w-full resize-y rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted ${className} `}/>

            {helperText && (<p className="mt-1.5 text-xs leading-5 text-muted">{helperText}</p>)}
        </div>
    );
}

export default ListTextarea;