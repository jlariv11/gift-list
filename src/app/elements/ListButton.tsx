import React from "react";

interface ListButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>  {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    buttonText?: string;
    buttonIcon?: React.ReactNode;
    className?: string;
}

const ListButton = React.forwardRef<HTMLButtonElement, ListButtonProps>(
    ({ onClick, buttonText, buttonIcon, className = "", ...rest }, ref) => {
        return (
            <button
                ref={ref}
                {...rest}
                onClick={(e) => onClick?.(e)}
                className={`text-gray-800 bg-orange-400 p-4 rounded-xl hover:bg-orange-300 shadow-md ${className}`}
            >
                {buttonText}
                {buttonIcon}
            </button>
        );
    }
);
ListButton.displayName = "ListButton";

export default ListButton;
