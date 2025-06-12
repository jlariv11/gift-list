import ListButton from "@/app/elements/ListButton";


interface DeleteProps {
    deleteFunction: () => void;
    toggleModal: (toggle: boolean) => void;
}

export default function DeleteModal({deleteFunction, toggleModal}: DeleteProps) {
    return (
        <div>
            <div className={"w-150 space-y-2 b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                <h1 className={"text-2xl"}>Are you sure you want to delete this list?</h1>
                <ListButton buttonText={"Confirm"} onClick={() => {deleteFunction(); toggleModal(false); }}></ListButton>
            </div>
        </div>
    )
}