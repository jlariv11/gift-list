type ListButtonProps = {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    buttonText?: string;
    buttonIcon?: React.ReactNode
    className?: string;
}

function ListButton({onClick, buttonText, buttonIcon}: ListButtonProps) {
    return (
        <button onClick={(e) => onClick?.(e)} className={"text-gray-800 bg-orange-400 p-4 rounded-xl hover:bg-orange-300 shadow-md"}>{buttonText}{buttonIcon}</button>
    )
}

export default ListButton;