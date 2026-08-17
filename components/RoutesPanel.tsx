"use client";

import { useState } from "react";
import type { VehicleRoute } from "@/lib/api";
import {
    Route,
    Navigation,
    Clock,
    MapPin,
    ChevronDown,
    ChevronRight,
    Truck,
    Package,
    Flag,
} from "lucide-react";

interface RoutesPanelProps {
    routes: VehicleRoute[];
    selectedVehicleId?: string;
    onSelectRoute?: (vehicleId: string) => void;
}

/* ------------------------------------------------------------------
 * Formatting Utilities
 * ---------------------------------------------------------------- */

function formatDistance(meters?: number) {
    if (meters == null) return "—";
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
}

function formatTime(seconds?: number) {
    if (seconds == null) return "—";
    const minutes = Math.round(seconds / 60);
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const remaining = minutes % 60;
        return `${hours}h ${remaining}m`;
    }
    return `${minutes} min`;
}

/* ------------------------------------------------------------------
 * Route Card Component
 * ---------------------------------------------------------------- */

function RouteCard({
                       route,
                       isSelected,
                       onSelect,
                   }: {
    route: VehicleRoute;
    isSelected?: boolean;
    onSelect?: () => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={`group rounded-lg border transition-all ${
                isSelected
                    ? "border-blue-500 bg-slate-900/90 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/40"
                    : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80"
            }`}
        >
            {/* Main Card Header */}
            <div
                onClick={onSelect}
                className="p-3 cursor-pointer select-none space-y-2.5"
            >
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-blue-950/80 text-blue-400 border border-blue-800/50">
                            <Truck className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-mono text-xs font-semibold text-slate-200 truncate">
              {route.vehicle_id}
            </span>
                    </div>

                    <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-300 border border-slate-700/50">
              <MapPin className="h-2.5 w-2.5 text-blue-400" />
                {route.stops?.length ?? 0} stops
            </span>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded((prev) => !prev);
                            }}
                            className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
                            aria-label="Toggle waypoints"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Telemetry Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 rounded bg-slate-950/60 p-2 border border-slate-800/50 text-[11px]">
                    <div>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                            <Navigation className="h-3 w-3 text-emerald-400" />
                            <span>Est. Distance</span>
                        </div>
                        <div className="mt-0.5 font-mono text-xs font-medium text-slate-200">
                            {formatDistance(route.total_distance_m)}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                            <Clock className="h-3 w-3 text-amber-400" />
                            <span>Est. Travel Time</span>
                        </div>
                        <div className="mt-0.5 font-mono text-xs font-medium text-slate-200">
                            {formatTime(route.total_travel_time_seconds)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Expandable Stops / Waypoints Timeline */}
            {isExpanded && route.stops && route.stops.length > 0 && (
                <div className="border-t border-slate-800/80 bg-slate-950/80 p-3">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Waypoint Manifest
                    </div>
                    <div className="relative pl-3 space-y-2 border-l border-slate-800 text-[11px]">
                        {route.stops.map((stop, idx) => {
                            const isFirst = idx === 0;
                            const isLast = idx === route.stops.length - 1;

                            return (
                                <div key={idx} className="relative group/stop flex items-center justify-between min-w-0">
                                    {/* Timeline Bullet */}
                                    <span
                                        className={`absolute -left-[17px] flex h-2 w-2 rounded-full ring-4 ring-slate-950 ${
                                            isFirst
                                                ? "bg-emerald-400"
                                                : isLast
                                                    ? "bg-red-400"
                                                    : "bg-blue-400"
                                        }`}
                                    />

                                    <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                        {isFirst ? (
                                            <Flag className="h-3 w-3 text-emerald-400 shrink-0" />
                                        ) : isLast ? (
                                            <Flag className="h-3 w-3 text-red-400 shrink-0" />
                                        ) : (
                                            <Package className="h-3 w-3 text-blue-400 shrink-0" />
                                        )}
                                        <span className="font-mono text-xs text-slate-300 truncate">
                      {"location_id" in stop && typeof stop.location_id === "string"
                          ? stop.location_id
                          : `Waypoint ${idx + 1}`}
                    </span>
                                    </div>

                                    {"arrival_time" in stop && (
                                        <span className="font-mono text-[10px] text-slate-500 shrink-0">
                      {String(stop.arrival_time)}
                    </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------
 * Main Component
 * ---------------------------------------------------------------- */

export default function RoutesPanel({
                                        routes = [],
                                        selectedVehicleId,
                                        onSelectRoute,
                                    }: RoutesPanelProps) {
    return (
        <section className="flex h-full w-full flex-col rounded-xl border border-slate-800 bg-slate-950 text-slate-100 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/30">
                        <Route className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                            Active Routes
                        </h2>
                        <p className="text-[11px] text-slate-400">
                            {routes.length} vehicle path{routes.length === 1 ? "" : "s"} calculated
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Paths
                </div>
            </div>

            {/* Routes Viewport */}
            <div className="flex-1 overflow-y-auto space-y-2 p-3">
                {routes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-800/80 p-6 text-center">
                        <Route className="h-8 w-8 text-slate-600 mb-2" />
                        <p className="text-xs font-medium text-slate-400">No active routes</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                            Run solver optimization to calculate paths
                        </p>
                    </div>
                ) : (
                    routes.map((route) => (
                        <RouteCard
                            key={route.vehicle_id}
                            route={route}
                            isSelected={selectedVehicleId === route.vehicle_id}
                            onSelect={() => onSelectRoute?.(route.vehicle_id)}
                        />
                    ))
                )}
            </div>
        </section>
    );
}