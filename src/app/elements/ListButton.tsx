interface ListButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>  {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    buttonText?: string;
    buttonIcon?: React.ReactNode
    className?: string;
}

function ListButton(props: ListButtonProps) {
    return (
        <button {...props} onClick={(e) => props.onClick?.(e)} className={`text-gray-800 bg-orange-400 p-4 rounded-xl hover:bg-orange-300 shadow-md ${props.className}`}>{props.buttonText}{props.buttonIcon}</button>
    )
}

export default ListButton;