// import React, { useState, useCallback } from 'react';
// import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

// const mapContainerStyle = {
//     width: '100%',
//     height: '400px',
// };

// const defaultCenter = {
//     lat: 26.751018,
//     lng: 94.203359,
// };

// function LocationSelector({ onLocationSelect }) {
//     const [currentLocation, setCurrentLocation] = useState(null);
//     const [customLocation, setCustomLocation] = useState(null); // To store custom location selected by the user

//     // Function to get the current location
//     const getCurrentLocation = useCallback(() => {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     const { latitude, longitude } = position.coords;
//                     setCustomLocation(null);
//                     setCurrentLocation({ lat: latitude, lng: longitude });
//                 },
//                 (error) => {
//                     console.error("Error getting location:", error);
//                 }
//             );
//         } else {
//             console.error("Geolocation is not supported by this browser.");
//         }
//     }, []);

//     // Function to reset the location to default
//     const resetLocation = () => {
//         setCurrentLocation(null); // Reset to default location
//         setCustomLocation(null);   // Clear any custom location
//     };

//     // Function to handle map click and set a custom location
//     const handleMapClick = (event) => {
//         const { latLng } = event;
//         const newLocation = {
//             lat: latLng.lat(),
//             lng: latLng.lng(),
//         };
//         setCurrentLocation(null);
//         setCustomLocation(newLocation);
//     };

//     // Determine the center based on available locations
//     const center = customLocation || currentLocation || defaultCenter;

//     return (
//         <div>
//             <button
//                 onClick={getCurrentLocation}
//                 style={{ marginBottom: '10px', padding: '10px', fontSize: '16px' }}>
//                 Use My Current Location
//             </button>
//             <button
//                 onClick={resetLocation}
//                 style={{ marginLeft: '10px', padding: '10px', fontSize: '16px' }}>
//                 Reset to Default Location
//             </button>

//             <LoadScript googleMapsApiKey={import.meta.env.VITE_GMAP_API}>
//                 <GoogleMap
//                     mapContainerStyle={mapContainerStyle}
//                     center={center}
//                     zoom={currentLocation || customLocation ? 15 : 10}
//                     onClick={handleMapClick} // Listen for clicks on the map
//                 >
//                     {currentLocation && <Marker position={currentLocation} />}
//                     {customLocation && <Marker position={customLocation} />}
//                 </GoogleMap>
//             </LoadScript>
//         </div>
//     );
// }

// export default LocationSelector;




import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
    width: '100%',
    height: '400px',
};

const defaultCenter = {
    lat: 26.751018,
    lng: 94.203359,
};

function LocationSelector({ onLocationSelect }) {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [customLocation, setCustomLocation] = useState(null); // Store custom location

    // Get the current location
    const getCurrentLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCustomLocation(null); // Clear any custom location
                    const newLocation = { lat: latitude, lng: longitude };
                    setCurrentLocation(newLocation);
                    onLocationSelect(newLocation); // Send selected location to parent
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }, [onLocationSelect]);

    // Reset to default location
    const resetLocation = () => {
        setCurrentLocation(null);
        setCustomLocation(null);
        onLocationSelect(null); // Reset the selected location in parent component
    };

    // Handle map click to set custom location
    const handleMapClick = (event) => {
        const { latLng } = event;
        const newLocation = {
            lat: latLng.lat(),
            lng: latLng.lng(),
        };
        setCurrentLocation(null); // Clear current location if custom location is selected
        setCustomLocation(newLocation);
        onLocationSelect(newLocation); // Send custom location to parent
    };

    // Determine the map center based on available locations
    const center = customLocation || currentLocation || defaultCenter;

    return (
        <div>
            <button
                onClick={getCurrentLocation}
                className="mr-2 mb-2 px-4 py-2 text-lg font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
                Use My Current Location
            </button>
            <button
                onClick={resetLocation}
                className="px-4 py-2 text-lg font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
                Reset to Default Location
            </button>

            <LoadScript googleMapsApiKey={import.meta.env.VITE_GMAP_API}>
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={currentLocation || customLocation ? 15 : 10}
                    onClick={handleMapClick}
                >
                    {currentLocation && <Marker position={currentLocation} />}
                    {customLocation && <Marker position={customLocation} />}
                </GoogleMap>
            </LoadScript>
        </div>
    );
}

export default LocationSelector;

