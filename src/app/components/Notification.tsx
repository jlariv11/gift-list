type NotificationProps = {
    text: string;
}

export default function Notification({ text }: NotificationProps) {
    return (
        <div className="rounded-xl p-4 bg-orange-400 text-gray-800">
            {text}
        </div>
    );
}


