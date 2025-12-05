import React from "react";

const FailureModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center bg-red-500 text-white p-4 rounded-t-lg">
                    <h2 className="text-lg font-semibold">Failure</h2>
                    <button
                        className="text-white hover:text-gray-200"
                        onClick={onClose}
                    >
                        &times;
                    </button>
                </div>
                {/* Body */}
                <div className="p-6 text-center">
                    <svg
                        className="mx-auto mb-4 w-16 h-16 text-red-500"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-6h2v2H9v-2zm0-8h2v6H9V4z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <p className="text-gray-700">{message || "Something went wrong!"}</p>
                </div>
                {/* Footer */}
                <div className="flex justify-center p-4">
                    <button
                        className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FailureModal;
