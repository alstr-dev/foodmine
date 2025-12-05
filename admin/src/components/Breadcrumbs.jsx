import React from "react";
import { useLocation, Link } from "react-router-dom";

const Breadcrumbs = () => {
    const location = useLocation();

    // Split the current path into an array for breadcrumbs
    const paths = location.pathname.split("/").filter((path) => path);

    return (
        <nav className="bg-gray-50 py-3 px-4 shadow-sm ml-1">
            <ul className="flex items-center space-x-2 text-sm text-gray-600">
                <li>
                    <Link to="/" className="text-blue-500 hover:underline">
                        Home
                    </Link>
                </li>
                {paths.map((path, index) => {
                    const fullPath = `/${paths.slice(0, index + 1).join("/")}`;
                    const isLast = index === paths.length - 1;

                    return (
                        <li key={fullPath} className="flex items-center">
                            <span className="mx-2 text-gray-400">/</span>
                            {isLast ? (
                                <span className="text-gray-800 font-medium capitalize">{path}</span>
                            ) : (
                                <Link
                                    to={fullPath}
                                    className="text-blue-500 hover:underline capitalize"
                                >
                                    {path}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default Breadcrumbs;
