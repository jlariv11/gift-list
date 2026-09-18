import { IoClose } from "react-icons/io5";
import ReactDOM from "react-dom";

interface ModalProps {
    modalBody: React.ReactNode;
    modalDivID: string;
    modalTitle: string;
    showModalToggle: (modalToggle: boolean) => void;
    closeActions?: () => void;
    position?: "top" | "bottom" | "left" | "right" | "";
}

function createModalContent(props: ModalProps) {

    function getModalPosition() {
        switch (props.position) {
            case "top":
                return "justify-center items-start pt-10";
            case "bottom":
                return "justify-center items-end pb-10";
            case "left":
                return "justify-start items-center pl-4";
            case "right":
                return "justify-end items-center pr-4";
            default:
                return "justify-center items-center";
        }
    }

    function closeModal() {
        props.showModalToggle(false);
        props.closeActions?.();
    }

    return (
        <div className={` fixed inset-0 z-50 flex ${getModalPosition()} bg-black/30 p-4 backdrop-blur-[2px] `} onClick={closeModal}>
            <div className=" w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-surface shadow-xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className=" flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 className=" text-xl font-semibold tracking-tight text-foreground">{props.modalTitle}</h2>

                    <button type="button" onClick={closeModal} aria-label="Close modal" className=" flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground">
                        <IoClose size={22} />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[80vh] overflow-y-auto p-6">
                    {props.modalBody}
                </div>
            </div>
        </div>
    );
}

export default function Modal(props: ModalProps) {
    const modalDiv = document.getElementById(props.modalDivID);

    return modalDiv ? ReactDOM.createPortal(createModalContent(props), modalDiv) : null;
}