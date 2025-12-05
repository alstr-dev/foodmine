import React from "react";

const Header = () => {
    return (
        <div className="w-full bg-white shadow-md p-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <div className="flex items-center space-x-4">
                <div className="text-gray-800">Admin</div>
                <button className="bg-red-500 text-white py-1 px-4 rounded-md">Logout</button>
            </div>
        </div>
    );
};

export default Header;
