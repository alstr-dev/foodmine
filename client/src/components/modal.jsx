import React, { useState } from 'react';

function Modal() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);

    const handleCancelClick = (itemId) => {
        setSelectedItemId(itemId);
        setIsModalOpen(true); // Show modal
    };

    const confirmCancel = () => {
        handleCancel(selectedItemId);
        setIsModalOpen(false);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div>
            {/* Cancel Button */}
            {cancelableItems[item.item_id] && (
                <button
                    onClick={() => handleCancelClick(item.item_id)}
                    className="mt-4 w-full text-white font-semibold py-2 rounded bg-red-500 hover:bg-red-600"
                >
                    Cancel
                </button>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirm Cancellation</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            >
                                No, Keep It
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Yes, Cancel Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


export default Modal;