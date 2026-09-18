type NotificationProps = {
    text: string;
}

export default function Notification({ text }: NotificationProps) {
    return (<div className=" rounded-lg border border-primary-light bg-primary-light px-4 py-3 text-sm text-primary">{text}</div>);
}