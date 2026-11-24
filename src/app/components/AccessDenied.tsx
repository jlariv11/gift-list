export default function AccessDenied() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
            <div className="mb-5 rounded-full bg-gray-100 p-4">
                <span className="text-3xl">🔒</span>
            </div>

            <h1 className="mb-3 text-2xl font-semibold">
                You don&apos;t have access to this list
            </h1>

            <p className="max-w-md text-gray-500">
                This list is restricted to its owner.
                Sign in with the account that owns this list
                to continue.
            </p>
        </div>
    );
}