"use client";

import React, { useEffect, useRef } from "react";
import {
    MapContainer,
    TileLayer,
    Polyline,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import type { VehicleRoute, RouteStop, Depot, Vehicle } from "@/lib/api";

import "leaflet/dist/leaflet.css";

// Extended interface to accept live traffic events
export interface TrafficEvent {
    incident_id: string;
    source?: string;
    type: string;
    severity?: number; // 0.0 to 1.0 scale
    description: string;
    road_name?: string;
    latitude: number;
    longitude: number;
    start_time?: string;
    end_time?: string | null;
}

interface WorldMapProps {
    routes?: VehicleRoute[];
    depots?: Depot[];
    vehicles?: Vehicle[];
    trafficEvents?: TrafficEvent[];
    selectedOrderId?: string;
    selectedVehicleId?: string;
    tomtomApiKey?: string;
}

const SINGAPORE_CENTER: [number, number] = [1.3521, 103.8198];

// Fix default Leaflet icon paths in Next.js
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

/* ------------------------------------------------------------------
 * Color & Custom Marker Helpers
 * ---------------------------------------------------------------- */

function getVehicleColor(vehicleId: string | number): string {
    const idStr = String(vehicleId);
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
        hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 85%, 45%)`;
}

function createVehicleIcon(id: string, isSelected: boolean) {
    const bgColor = isSelected ? "#dc2626" : "#2563eb";
    return L.divIcon({
        className: "custom-vehicle-marker",
        html: `<div style="background-color: ${bgColor}; color: white; padding: 4px 8px; border-radius: 9999px; font-weight: bold; font-size: 10px; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); white-space: nowrap;">🚛 ${id}</div>`,
        iconSize: [60, 24],
        iconAnchor: [30, 12],
    });
}

const stopIcon = L.divIcon({
    className: "custom-stop-marker",
    html: `
        <div style="
            width: 22px;
            height: 22px;
            background: #ffffff;
            border: 4px solid #2563eb;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
});

const pickupIcon = L.divIcon({
    className: "custom-pickup-marker",
    html: `
        <div style="
            width: 28px;
            height: 28px;
            background: #16a34a;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 13px;
            font-family: sans-serif;
        ">P</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

const deliveryIcon = L.divIcon({
    className: "custom-delivery-marker",
    html: `
        <div style="
            width: 28px;
            height: 28px;
            background: #dc2626;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 13px;
            font-family: sans-serif;
        ">D</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

function getStopIcon(stop: RouteStop) {
    const kind = stop.kind?.toLowerCase();
    if (kind === "pickup") return pickupIcon;
    if (kind === "delivery") return deliveryIcon;
    return stopIcon;
}

/* ------------------------------------------------------------------
 * Traffic Incident Icon Generator
 * ---------------------------------------------------------------- */

function createTrafficIcon(event: TrafficEvent) {
    const type = event.type?.toLowerCase();
    const severity = event.severity ?? 0.5;

    // Pick icon graphic based on incident type
    let symbol = "⚠️";
    if (type.includes("accident")) symbol = "💥";
    else if (type.includes("breakdown") || type.includes("vehicle")) symbol = "🔧";
    else if (type.includes("roadwork")) symbol = "🚧";

    // Color gradient based on severity level
    let badgeColor = "#f59e0b"; // Medium amber (0.4 - 0.6)
    if (severity >= 0.8) badgeColor = "#ef4444"; // High red (0.8 - 1.0)
    else if (severity <= 0.3) badgeColor = "#3b82f6"; // Low blue

    return L.divIcon({
        className: "custom-traffic-marker",
        html: `
            <div style="
                width: 30px;
                height: 30px;
                background-color: ${badgeColor};
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 3px 8px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                cursor: pointer;
            ">${symbol}</div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    });
}

/* ------------------------------------------------------------------
 * Direction Arrow Helpers
 * ---------------------------------------------------------------- */

function DirectionArrow({
                            position,
                            angle,
                            color,
                        }: {
    position: [number, number];
    angle: number;
    color: string;
}) {
    const icon = L.divIcon({
        className: "route-direction-arrow",
        html: `
            <div style="
                transform: rotate(${angle}deg);
                color: ${color};
                font-size: 14px;
                font-weight: 900;
                line-height: 14px;
                text-shadow: 
                    -1px -1px 0 #fff,  
                     1px -1px 0 #fff,
                    -1px  1px 0 #fff,
                     1px  1px 0 #fff;
                display: flex;
                align-items: center;
                justify-content: center;
            ">▲</div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });

    return <Marker position={position} icon={icon} interactive={false} />;
}

function getArrowPoints(positions: [number, number][]): {
    position: [number, number];
    angle: number;
}[] {
    const arrows: { position: [number, number]; angle: number }[] = [];

    for (let i = 0; i < positions.length - 1; i += 10) {
        const current = positions[i];
        const next = positions[Math.min(i + 1, positions.length - 1)];

        const lat = (current[0] + next[0]) / 2;
        const lon = (current[1] + next[1]) / 2;

        const dLat = next[0] - current[0];
        const dLon = next[1] - current[1];

        const angle = Math.atan2(dLon, dLat) * (180 / Math.PI);

        arrows.push({
            position: [lat, lon],
            angle,
        });
    }

    return arrows;
}

/* ------------------------------------------------------------------
 * Moving Vehicle & Bounds Controller
 * ---------------------------------------------------------------- */

function MovingVehicleMarker({
                                 vehicle,
                                 isSelected,
                             }: {
    vehicle: Vehicle;
    isSelected: boolean;
}) {
    const lat = Number(vehicle.current_lat);
    const lon = Number(vehicle.current_lon);

    if (isNaN(lat) || isNaN(lon)) return null;

    return (
        <Marker position={[lat, lon]} icon={createVehicleIcon(vehicle.vehicle_id, isSelected)}>
            <Popup>
                <div className="p-1 text-xs space-y-1 font-sans">
                    <div className="font-bold text-sm text-blue-600 border-b pb-1">
                        🚛 Vehicle: {vehicle.vehicle_id}
                    </div>
                    {vehicle.status && (
                        <div>
                            <span className="font-semibold">Status:</span> {vehicle.status}
                        </div>
                    )}
                    <div>
                        <span className="font-semibold">Location:</span> {lat.toFixed(4)}, {lon.toFixed(4)}
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}

function MapBoundsController({
                                 depots = [],
                                 vehicles = [],
                                 routes = [],
                                 trafficEvents = [],
                             }: {
    depots?: Depot[];
    vehicles?: Vehicle[];
    routes?: VehicleRoute[];
    trafficEvents?: TrafficEvent[];
}) {
    const map = useMap();
    const hasCenteredRef = useRef(false);

    useEffect(() => {
        if (hasCenteredRef.current) return;

        const points: [number, number][] = [];

        depots.forEach((d) => {
            const lat = Number(d.lat);
            const lon = Number(d.lon);
            if (!isNaN(lat) && !isNaN(lon)) points.push([lat, lon]);
        });

        vehicles.forEach((v) => {
            const lat = Number(v.current_lat);
            const lon = Number(v.current_lon);
            if (!isNaN(lat) && !isNaN(lon)) points.push([lat, lon]);
        });

        trafficEvents.forEach((e) => {
            const lat = Number(e.latitude);
            const lon = Number(e.longitude);
            if (!isNaN(lat) && !isNaN(lon)) points.push([lat, lon]);
        });

        routes.forEach((r) => {
            r.segments?.forEach((seg) => {
                seg.geometry?.forEach(([lon, lat]) => {
                    const nLat = Number(lat);
                    const nLon = Number(lon);
                    if (!isNaN(nLat) && !isNaN(nLon)) points.push([nLat, nLon]);
                });
            });
            r.stops?.forEach((stop) => {
                const lat = Number(stop.lat);
                const lon = Number(stop.lon);
                if (!isNaN(lat) && !isNaN(lon)) points.push([lat, lon]);
            });
        });

        if (points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
            hasCenteredRef.current = true;
        }
    }, [depots, vehicles, routes, trafficEvents, map]);

    return null;
}

/* ------------------------------------------------------------------
 * Main Exported Map Component
 * ---------------------------------------------------------------- */

export default function WorldMap({
                                     routes = [],
                                     depots = [],
                                     vehicles = [],
                                     trafficEvents = [],
                                     selectedOrderId,
                                     selectedVehicleId,
                                 }: WorldMapProps) {
    return (
        <MapContainer
            center={SINGAPORE_CENTER}
            zoom={12}
            scrollWheelZoom={true}
            className="h-full w-full z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Viewport Bounds Controller */}
            <MapBoundsController
                depots={depots}
                vehicles={vehicles}
                routes={routes}
                trafficEvents={trafficEvents}
            />

            {/* Render Depots */}
            {depots.map((depot) => {
                const lat = Number(depot.lat);
                const lon = Number(depot.lon);
                if (isNaN(lat) || isNaN(lon)) return null;

                return (
                    <Marker key={`depot-${depot.depot_id}`} position={[lat, lon]}>
                        <Popup>
                            <div className="font-sans text-xs">
                                🏢 <strong>Depot:</strong> {depot.depot_id}
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            {/* Render Live Vehicles */}
            {vehicles.map((vehicle) => (
                <MovingVehicleMarker
                    key={`vehicle-${vehicle.vehicle_id}`}
                    vehicle={vehicle}
                    isSelected={selectedVehicleId === vehicle.vehicle_id}
                />
            ))}

            {/* Render Live Traffic Incidents */}
            {trafficEvents.map((event) => {
                const lat = Number(event.latitude);
                const lon = Number(event.longitude);
                if (isNaN(lat) || isNaN(lon)) return null;

                const severity = event.severity ?? 0.5;
                const badgeBg =
                    severity >= 0.8 ? "bg-red-600" : severity <= 0.3 ? "bg-blue-600" : "bg-amber-500";

                return (
                    <Marker
                        key={`traffic-${event.incident_id}`}
                        position={[lat, lon]}
                        icon={createTrafficIcon(event)}
                    >
                        <Popup>
                            <div className="p-1 text-xs space-y-1 font-sans max-w-xs">
                                <div className="flex items-center justify-between border-b pb-1 gap-2">
                                    <span className={`text-[10px] uppercase font-bold text-white px-1.5 py-0.5 rounded ${badgeBg}`}>
                                        {event.type.replace(/_/g, " ")}
                                    </span>
                                    {event.source && (
                                        <span className="text-[10px] text-gray-400 font-mono">
                                            Source: {event.source}
                                        </span>
                                    )}
                                </div>
                                <div className="font-semibold text-gray-800 text-sm leading-tight pt-1">
                                    {event.description}
                                </div>
                                {event.road_name && (
                                    <div className="text-gray-500">
                                        <span className="font-medium text-gray-700">Road:</span> {event.road_name}
                                    </div>
                                )}
                                <div className="text-[10px] text-gray-400">
                                    Severity: {(severity * 100).toFixed(0)}%
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            {/* Render Routes, Direction Arrows & Stops */}
            {routes.map((route) => {
                const vehicleColor = getVehicleColor(route.vehicle_id);
                const isVehicleSelected = selectedVehicleId === route.vehicle_id;

                return (
                    <React.Fragment key={`route-${route.vehicle_id}`}>
                        {/* Route Segments */}
                        {route.segments?.map((segment, segmentIndex) => {
                            const positions: [number, number][] =
                                segment.geometry?.map(([lon, lat]) => [Number(lat), Number(lon)]) ?? [];

                            if (positions.length < 2) return null;

                            const arrows = getArrowPoints(positions);

                            return (
                                <React.Fragment key={`${route.vehicle_id}-seg-${segmentIndex}`}>
                                    <Polyline
                                        positions={positions}
                                        pathOptions={{
                                            color: isVehicleSelected ? "#dc2626" : vehicleColor,
                                            weight: isVehicleSelected ? 9 : 6,
                                            opacity: isVehicleSelected ? 1 : 0.85,
                                        }}
                                        eventHandlers={{
                                            mouseover: (e) => {
                                                const layer = e.target;
                                                layer.setStyle({ weight: 9, opacity: 1 });
                                            },
                                            mouseout: (e) => {
                                                const layer = e.target;
                                                layer.setStyle({
                                                    weight: isVehicleSelected ? 9 : 6,
                                                    opacity: isVehicleSelected ? 1 : 0.85,
                                                });
                                            },
                                        }}
                                    >
                                        <Popup>
                                            <div className="p-1 text-xs space-y-1 font-sans">
                                                <div className="font-bold border-b pb-1 text-sm">
                                                    Vehicle: {route.vehicle_id}
                                                </div>
                                                <div>
                                                    <span className="font-semibold">Segment:</span> #{segmentIndex + 1}
                                                </div>
                                                {segment.distance_m != null && (
                                                    <div>
                                                        <span className="font-semibold">Distance:</span>{" "}
                                                        {(segment.distance_m / 1000).toFixed(2)} km
                                                    </div>
                                                )}
                                                {segment.duration_s != null && (
                                                    <div>
                                                        <span className="font-semibold">Duration:</span>{" "}
                                                        {Math.round(segment.duration_s / 60)} mins
                                                    </div>
                                                )}
                                            </div>
                                        </Popup>
                                    </Polyline>

                                    {arrows.map((arrow, arrowIndex) => (
                                        <DirectionArrow
                                            key={`${route.vehicle_id}-arrow-${segmentIndex}-${arrowIndex}`}
                                            position={arrow.position}
                                            angle={arrow.angle}
                                            color={isVehicleSelected ? "#dc2626" : vehicleColor}
                                        />
                                    ))}
                                </React.Fragment>
                            );
                        })}

                        {/* Stops & Markers */}
                        {route.stops?.map((stop, stopIndex) => {
                            if (stop.lat == null || stop.lon == null) return null;

                            const lat = Number(stop.lat);
                            const lon = Number(stop.lon);
                            if (isNaN(lat) || isNaN(lon)) return null;

                            const isOrderSelected = selectedOrderId && stop.order_id === selectedOrderId;

                            return (
                                <Marker
                                    key={`${route.vehicle_id}-stop-${stopIndex}`}
                                    position={[lat, lon]}
                                    icon={getStopIcon(stop)}
                                >
                                    <Popup>
                                        <div className="p-1 text-xs space-y-1 font-sans">
                                            <div
                                                className="font-bold text-sm uppercase px-2 py-0.5 rounded text-white inline-block"
                                                style={{
                                                    backgroundColor:
                                                        stop.kind?.toLowerCase() === "pickup"
                                                            ? "#16a34a"
                                                            : stop.kind?.toLowerCase() === "delivery"
                                                                ? "#dc2626"
                                                                : "#2563eb",
                                                }}
                                            >
                                                {stop.kind || "Stop"}
                                            </div>

                                            {stop.order_id && (
                                                <div className={isOrderSelected ? "font-bold text-red-600" : ""}>
                                                    <span className="font-semibold">Order ID:</span> {stop.order_id}
                                                </div>
                                            )}

                                            <div>
                                                <span className="font-semibold">Vehicle:</span> {route.vehicle_id}
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </React.Fragment>
                );
            })}
        </MapContainer>
    );
}