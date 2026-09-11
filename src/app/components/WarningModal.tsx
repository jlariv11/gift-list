import ListButton from "../elements/ListButton";


interface WarningProps {
    actionFunction: () => void;
    warning: string;
    toggleModal: (toggle: boolean) => void;
}

export default function WarningModal({actionFunction, warning, toggleModal}: WarningProps) {
    return (
        <div>
            <div className={"space-y-2 b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                <h1 className={"text-xl lg:text-2xl"}>{warning}</h1>
                <ListButton buttonText={"Confirm"} onClick={() => {actionFunction(); toggleModal(false); }}></ListButton>
            </div>
        </div>
    )
}