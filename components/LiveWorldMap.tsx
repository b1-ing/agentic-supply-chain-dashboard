// LiveWorldMap.tsx
"use client";

import React, { useEffect, useState } from "react";
import WorldMap, { Depot, Vehicle } from "./WorldMap";
import { getWorld, VehicleRoute } from "@/lib/api";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/worldstate";

export default function LiveWorldMap() {
    const [depots, setDepots] = useState<Depot[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [routes, setRoutes] = useState<VehicleRoute[]>([]);

    const [loading, setLoading] = useState(true);
    const [wsConnected, setWsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Initial State Fetch + 2. WebSocket Connection
    useEffect(() => {
        let isMounted = true;
        let socket: WebSocket | null = null;

        async function initWorld() {
            try {
                setLoading(true);
                // Step A: Fetch initial world state (depots, vehicles, routes)
                const initialState = await getWorld();

                if (isMounted) {
                    setDepots(initialState.depots || []);
                    setVehicles(initialState.vehicles || []);
                    setRoutes(initialState.routes || []);
                    setLoading(false);
                }

                // Step B: Connect to WebSocket after fetching initial snapshot
                socket = new WebSocket(WS_URL);

                socket.onopen = () => {
                    console.log("Connected to WorldState WebSocket channel.");
                    if (isMounted) setWsConnected(true);
                };

                socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);

                        // Handle vehicle location tick/update event
                        if (data.type === "vehicle_update" || data.type === "position_tick") {
                            setVehicles((prevVehicles) =>
                                prevVehicles.map((v) =>
                                    String(v.vehicle_id) === String(data.vehicle_id)
                                        ? {
                                            ...v,
                                            current_lat: data.current_lat ?? v.current_lat,
                                            current_lon: data.current_lon ?? v.current_lon,
                                            status: data.status ?? v.status,
                                        }
                                        : v
                                )
                            );
                        }

                        // Handle full state or route recalculation events
                        if (data.type === "route_update") {
                            setRoutes(data.routes);
                        }
                    } catch (err) {
                        console.error("Failed to parse WebSocket message:", err);
                    }
                };

                socket.onclose = () => {
                    console.log("WorldState WebSocket disconnected.");
                    if (isMounted) setWsConnected(false);
                };

                socket.onerror = (err) => {
                    console.error("WebSocket error:", err);
                    if (isMounted) setWsConnected(false);
                };

            } catch (err) {
                console.error("Error initialising world state:", err);
                if (isMounted) {
                    setError("Failed to load initial world state.");
                    setLoading(false);
                }
            }
        }

        initWorld();

        return () => {
            isMounted = false;
            if (socket) socket.close();
        };
    }, []);

    if (loading) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="text-xs font-mono">Loading World State & Depots...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-slate-950 text-red-400 text-xs font-mono">
                {error}
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            {/* Live Connection Badge Overlay */}
            <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 rounded-lg bg-slate-900/90 px-3 py-1.5 border border-slate-800 backdrop-blur-md shadow-lg text-xs font-mono">
                {wsConnected ? (
                    <>
                        <Wifi className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                        <span className="text-emerald-400 font-semibold">LIVE STREAM</span>
                    </>
                ) : (
                    <>
                        <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-amber-400 font-semibold">DISCONNECTED</span>
                    </>
                )}
            </div>

            <WorldMap depots={depots} vehicles={vehicles} routes={routes} />
        </div>
    );
}