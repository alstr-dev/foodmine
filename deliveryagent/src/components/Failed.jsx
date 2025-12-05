import React from "react";

const Failed = ({ show, message, onClose }) => {
    if (!show) return null; // Render nothing if `show` is false

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg w-96 p-6">
                <h2 className="text-lg font-bold text-red-600 mb-4">Error</h2>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end">
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                        onClick={onClose}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Failed;
