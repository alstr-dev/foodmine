import React from "react";

const SuccessModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center bg-green-500 text-white p-4 rounded-t-lg">
                    <h2 className="text-lg font-semibold">Success</h2>
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
                        className="mx-auto mb-4 w-16 h-16 text-green-500"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.707-7.707a1 1 0 011.414 0l2.586-2.586a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-1-1a1 1 0 011.414-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <p className="text-gray-700">{message || "Operation completed successfully!"}</p>
                </div>
                {/* Footer */}
                <div className="flex justify-center p-4">
                    <button
                        className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;
