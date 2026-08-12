"use client";

import {
    MapContainer,
    TileLayer,
    Polyline,
    Marker,
    Popup,
} from "react-leaflet";

import L from "leaflet";
import type { VehicleRoute, RouteStop } from "@/lib/api";

import "leaflet/dist/leaflet.css";

interface WorldMapProps {
    routes?: VehicleRoute[];
    tomtomApiKey?: string; // Add this prop or use process.env
}

/* ------------------------------------------------------------------
 * Singapore
 * ---------------------------------------------------------------- */

const SINGAPORE_CENTER: [number, number] = [
    1.3521,
    103.8198,
];

/* ------------------------------------------------------------------
 * Marker icons
 * ---------------------------------------------------------------- */

const stopIcon = L.divIcon({
    className: "custom-stop-marker",
    html: `
        <div
            style="
                width: 12px;
                height: 12px;
                background: white;
                border: 3px solid #2563eb;
                border-radius: 50%;
                box-shadow: 0 1px 4px rgba(0,0,0,0.35);
            "
        ></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
});

const pickupIcon = L.divIcon({
    className: "custom-pickup-marker",
    html: `
        <div
            style="
                width: 14px;
                height: 14px;
                background: #16a34a;
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 1px 4px rgba(0,0,0,0.35);
            "
        ></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

const deliveryIcon = L.divIcon({
    className: "custom-delivery-marker",
    html: `
        <div
            style="
                width: 14px;
                height: 14px;
                background: #dc2626;
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 1px 4px rgba(0,0,0,0.35);
            "
        ></div>
    `,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
});

/* ------------------------------------------------------------------
 * Direction arrow
 * ---------------------------------------------------------------- */

function DirectionArrow({
                            position,
                            angle,
                        }: {
    position: [number, number];
    angle: number;
}) {
    const icon = L.divIcon({
        className: "route-direction-arrow",
        html: `
            <div
                style="
                    transform: rotate(${angle}deg);
                    color: #2563eb;
                    font-size: 10px;
                    font-weight: 700;
                    line-height: 18px;
                    text-shadow:
                        0 0 2px white,
                        0 0 2px white;
                "
            >
                ▶
            </div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });

    return (
        <Marker
            position={position}
            icon={icon}
            interactive={false}
        />
    );
}

/* ------------------------------------------------------------------
 * Calculate arrow positions
 * ---------------------------------------------------------------- */

function getArrowPoints(
    positions: [number, number][],
): {
    position: [number, number];
    angle: number;
}[] {
    const arrows: {
        position: [number, number];
        angle: number;
    }[] = [];

    /*
     * Put an arrow approximately every 10 points.
     *
     * This is deliberately simple for now.
     * We can later make this distance-based.
     */

    for (
        let i = 0;
        i < positions.length - 1;
        i += 10
    ) {
        const current = positions[i];
        const next =
            positions[
                Math.min(
                    i + 1,
                    positions.length - 1,
                )
                ];

        const lat =
            (current[0] + next[0]) / 2;

        const lon =
            (current[1] + next[1]) / 2;

        /*
         * Approximate bearing in screen coordinates.
         *
         * Leaflet rotates clockwise from the right.
         */

        const dy = next[0] - current[0];
        const dx = next[1] - current[1];

        const angle =
            Math.atan2(dy, dx) *
            (180 / Math.PI);

        arrows.push({
            position: [lat, lon],
            angle,
        });
    }

    return arrows;
}

/* ------------------------------------------------------------------
 * Stop icon selection
 * ---------------------------------------------------------------- */

function getStopIcon(
    stop: RouteStop,
) {
    const kind =
        stop.kind?.toLowerCase();

    if (kind === "pickup") {
        return pickupIcon;
    }

    if (kind === "delivery") {
        return deliveryIcon;
    }

    return stopIcon;
}

/* ------------------------------------------------------------------
 * Map
 * ---------------------------------------------------------------- */

export default function WorldMap({
                                     routes = [],
                                     tomtomApiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY || "YOUR_FALLBACK_API_KEY",
                                 }: WorldMapProps) {
    return (
        <MapContainer
            center={SINGAPORE_CENTER}
            zoom={12}
            className="h-full w-full"
        >

            {/* ------------------------------------------------------
             * OpenStreetMap base layer
             * ---------------------------------------------------- */}

            {/*<TileLayer*/}
            {/*    url="http://127.0.0.1:8000/traffic/{z}/{x}/{y}.png"*/}
            {/*    opacity={0.85}*/}
            {/*/>*/}

            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/*<TileLayer*/}
            {/*    attribution='&copy; 1992 - 2026 TomTom Traffic.'*/}
            {/*    url={`https://{s}.api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${tomtomApiKey}`}*/}
            {/*    subdomains="abcd"*/}
            {/*    maxZoom={22}*/}
            {/*    opacity={0.8} // Adjust opacity so base map features stay visible underneath*/}
            {/*/>*/}






            {/* ------------------------------------------------------
             * Routes
             * ---------------------------------------------------- */}

            {routes.map((route) => (
                <div key={route.vehicle_id}>

                    {route.segments?.map(
                        (segment, segmentIndex) => {
                            const positions =
                                segment.geometry;

                            if (
                                positions.length < 2
                            ) {
                                return null;
                            }

                            const arrows =
                                getArrowPoints(
                                    positions,
                                );

                            return (
                                <div
                                    key={`${route.vehicle_id}-${segmentIndex}`}
                                >

                                    {/* Route */}
                                    <Polyline
                                        positions={
                                            positions
                                        }
                                        pathOptions={{
                                            weight: 5,
                                            opacity: 0.8,
                                        }}
                                    />

                                    {/* Direction arrows */}
                                    {arrows.map(
                                        (
                                            arrow,
                                            arrowIndex,
                                        ) => (
                                            <DirectionArrow
                                                key={`${route.vehicle_id}-${segmentIndex}-${arrowIndex}`}
                                                position={
                                                    arrow.position
                                                }
                                                angle={
                                                    arrow.angle
                                                }
                                            />
                                        ),
                                    )}

                                </div>
                            );
                        },
                    )}

                    {/* ------------------------------------------------
                     * Stops
                     * ------------------------------------------------ */}

                    {route.stops?.map(
                        (stop, stopIndex) => {
                            if (
                                stop.lat == null ||
                                stop.lon == null
                            ) {
                                return null;
                            }

                            const position: [
                                number,
                                number,
                            ] = [
                                stop.lat,
                                stop.lon,
                            ];

                            return (
                                <Marker
                                    key={`${route.vehicle_id}-stop-${stopIndex}`}
                                    position={
                                        position
                                    }
                                    icon={getStopIcon(
                                        stop,
                                    )}
                                >
                                    <Popup>
                                        <div className="text-xs">

                                            <div className="font-semibold">
                                                {stop.kind}
                                            </div>

                                            {stop.order_id && (
                                                <div>
                                                    Order:{" "}
                                                    {
                                                        stop.order_id
                                                    }
                                                </div>
                                            )}

                                            <div>
                                                Vehicle:{" "}
                                                {
                                                    route.vehicle_id
                                                }
                                            </div>

                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        },
                    )}

                </div>
            ))}

        </MapContainer>
    );
}