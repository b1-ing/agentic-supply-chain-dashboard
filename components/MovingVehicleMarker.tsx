// MovingVehicleMarker.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Vehicle } from "./WorldMap";

function getVehicleColor(vehicleId: string | number): string {
    const idStr = String(vehicleId);
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
        hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 85%, 45%)`;
}

function createVehicleIcon(vehicleId: string | number) {
    const color = getVehicleColor(vehicleId);
    return L.divIcon({
        className: "custom-vehicle-marker",
        html: `
            <div style="
                width: 32px;
                height: 32px;
                background: ${color};
                border: 3px solid #ffffff;
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
                transition: transform 0.3s ease;
            ">🚛</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
}

export function MovingVehicleMarker({ vehicle }: { vehicle: Vehicle }) {
    const markerRef = useRef<L.Marker | null>(null);

    // Smoothly transition marker coordinate changes
    useEffect(() => {
        if (markerRef.current) {
            const marker = markerRef.current;
            const newLatLng = L.latLng(vehicle.current_lat, vehicle.current_lon);

            // Add CSS transition class to marker DOM element for smooth movement
            const element = marker.getElement();
            if (element) {
                element.style.transition = "transform 0.8s linear";
            }

            marker.setLatLng(newLatLng);
        }
    }, [vehicle.current_lat, vehicle.current_lon]);

    return (
        <Marker
            ref={markerRef}
            position={[vehicle.current_lat, vehicle.current_lon]}
            icon={createVehicleIcon(vehicle.vehicle_id)}
        >
            <Popup>
                <div className="p-1 text-xs space-y-1 font-sans">
                    <div className="font-bold text-sm text-slate-800 border-b pb-1">
                        🚛 Vehicle: {vehicle.vehicle_id}
                    </div>
                    {vehicle.status && (
                        <div>
                            <span className="font-semibold">Status:</span>{" "}
                            <span className="uppercase text-[10px] bg-slate-100 font-bold px-1 py-0.5 rounded border border-slate-300">
                                {vehicle.status}
                            </span>
                        </div>
                    )}
                    {vehicle.depot_id && (
                        <div>
                            <span className="font-semibold">Assigned Depot:</span>{" "}
                            {vehicle.depot_id}
                        </div>
                    )}
                    <div>
                        <span className="font-semibold">Position:</span>{" "}
                        {vehicle.current_lat.toFixed(4)}, {vehicle.current_lon.toFixed(4)}
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}