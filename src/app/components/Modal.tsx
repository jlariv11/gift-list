import {IoMdCloseCircleOutline} from "react-icons/io";
import ReactDOM from "react-dom";

interface ModalProps {
    modalBody: React.ReactNode;
    modalDivID: string;
    modalTitle: string;
    showModalToggle: (modalToggle: boolean) => void
}

function createModalContent(props: ModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="w-full max-w-lg px-3">
                <div className="pb-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300 shadow-lg">
                    <div className="p-2">
                        <div className="space-y-2 flex justify-between">
                            <h1 className="text-2xl">{props.modalTitle}</h1>
                            <IoMdCloseCircleOutline
                                onClick={() => props.showModalToggle(false)}
                                size={32}
                                className="text-xl text-orange-400 hover:text-orange-300 cursor-pointer"
                            />
                        </div>

                        <div>
                            {props.modalBody}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function Modal(props: ModalProps){
    const modalDiv = document.getElementById(props.modalDivID);
    return (modalDiv !== null) ? ReactDOM.createPortal(createModalContent(props), modalDiv) : <div></div>;
}