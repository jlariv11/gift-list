interface ListButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>  {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    buttonText?: string;
    buttonIcon?: React.ReactNode
    className?: string;
}

function ListButton({ buttonText, buttonIcon, className, onClick, ...rest }: ListButtonProps) {
    return (
        <button {...rest} onClick={(e) => onClick?.(e)} className={`text-gray-800 bg-orange-400 p-4 rounded-xl hover:bg-orange-300 shadow-md ${className}`}>{buttonText}{buttonIcon}</button>
    )
}

export default ListButton;