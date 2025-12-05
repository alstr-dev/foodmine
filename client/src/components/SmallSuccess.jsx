import React, { useState } from "react";

const SmallSuccess = ({ message, isVisible, onClose }) => {
    return (
        isVisible && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                {/* Overlay */}
                <div
                    className="absolute inset-0 bg-black opacity-50"
                    onClick={onClose}
                ></div>
                {/* Modal */}
                <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
                    <h3 className="text-lg font-semibold">{message}</h3>
                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={onClose}
                    >
                        Ok
                    </button>
                </div>
            </div>
        )
    );
};

export default SmallSuccess;