import ListButton from "../elements/ListButton";

interface WarningProps {
    actionFunction: () => void;
    warning: string;
    toggleModal: (toggle: boolean) => void;
}
export default function WarningModal({actionFunction, warning, toggleModal}: WarningProps) {

    return (
        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-medium leading-relaxed text-foreground">
                {warning}
            </h2>

            <div className="mt-6 flex justify-end gap-3">

                <button onClick={() => toggleModal(false)} className=" rounded-lg px-4 py-2 text-sm font-medium text-[#777772] transition-colors hover:bg-[#F7F7F4] hover:text-[#242422]">
                    Cancel
                </button>

                <ListButton
                    buttonText="Confirm"
                    onClick={() => {
                        actionFunction();
                        toggleModal(false);
                    }}
                />

            </div>
        </div>
    );
}