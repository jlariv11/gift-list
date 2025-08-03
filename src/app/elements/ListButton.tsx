interface ListButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    buttonText?: string;
    buttonIcon?: React.ReactNode;
}

function ListButton(props: ListButtonProps) {
    const { buttonText, buttonIcon, onClick, ...rest } = props;

    return (
        <button
            {...rest}
            onClick={(e) => onClick?.(e)}
            className="text-gray-800 bg-orange-400 p-4 rounded-xl hover:bg-orange-300 shadow-md disabled:bg-orange-200"
        >
            {buttonText}
            {buttonIcon}
        </button>
    );
}

export default ListButton;
