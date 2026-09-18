import React from "react";

interface ListButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    buttonText?: string;
    buttonIcon?: React.ReactNode;
    className?: string;
    variant?: "primary" | "secondary" | "danger" | "ghost";
}

const ListButton = React.forwardRef<HTMLButtonElement, ListButtonProps>(({onClick, buttonText, buttonIcon, className = "", variant = "primary", ...rest}, ref) => {

        const baseStyles = `
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-lg
            px-4
            py-2.5
            text-sm
            font-medium
            transition-colors
            duration-150
            cursor-pointer
            disabled:pointer-events-none
            disabled:opacity-50
        `;

        const variants = {
            primary: `
                bg-primary
                text-white
                hover:bg-primary-hover
            `,

            secondary: `
                border
                border-border
                bg-surface
                text-foreground
                hover:bg-page
            `,

            danger: `
                bg-danger
                text-white
                hover:bg-danger-hover
            `,

            ghost: `
                bg-transparent
                text-muted
                hover:bg-surface-muted
                hover:text-foreground
            `,
        };

        return (<button ref={ref}{...rest} onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>{buttonIcon}{buttonText}</button>);
    }
);

ListButton.displayName = "ListButton";

export default ListButton;