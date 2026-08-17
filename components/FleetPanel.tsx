"use client";

import type { Vehicle } from "@/lib/api";
import {
    Truck,
    Snowflake,
    ShieldAlert,
    Radio,
    ChevronRight,
    Package,
} from "lucide-react";

interface FleetPanelProps {
    vehicles: Vehicle[];
    selectedVehicleId?: string;
    onSelectVehicle?: (vehicleId: string) => void;
}

/* ------------------------------------------------------------------
 * Status Badge Styling Helper
 * ---------------------------------------------------------------- */

function getStatusBadge(status: string) {
    const normalized = status.toUpperCase();

    switch (normalized) {
        case "EN_ROUTE":
        case "ACTIVE":
            return {
                label: "En Route",
                className: "bg-blue-500/10 text-blue-400 ring-blue-500/30",
                dotColor: "bg-blue-400 animate-pulse",
            };
        case "AVAILABLE":
        case "IDLE":
            return {
                label: "Available",
                className: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
                dotColor: "bg-emerald-400",
            };
        case "OFFLINE":
        case "MAINTENANCE":
            return {
                label: "Offline",
                className: "bg-red-500/10 text-red-400 ring-red-500/30",
                dotColor: "bg-red-400",
            };
        default:
            return {
                label: status,
                className: "bg-amber-500/10 text-amber-400 ring-amber-500/30",
                dotColor: "bg-amber-400",
            };
    }
}

/* ------------------------------------------------------------------
 * Main Component
 * ---------------------------------------------------------------- */

export default function FleetPanel({
                                       vehicles = [],
                                       selectedVehicleId,
                                       onSelectVehicle,
                                   }: FleetPanelProps) {
    const activeCount = vehicles.filter((v) =>
        ["EN_ROUTE", "ACTIVE"].includes(v.status.toUpperCase())
    ).length;

    return (
        <section className="flex h-full w-full flex-col rounded-xl border border-slate-800 bg-slate-950 text-slate-100 shadow-xl">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30">
                        <Truck className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                            Fleet Status
                        </h2>
                        <p className="text-[11px] text-slate-400">
                            {activeCount} of {vehicles.length} active on road
                        </p>
                    </div>
                </div>

                <span className="flex items-center gap-1.5 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
          <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
          Live GPS
        </span>
            </div>

            {/* Vehicle Cards Container */}
            <div className="flex-1 overflow-y-auto space-y-2 p-3">
                {vehicles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 p-6 text-center">
                        <Truck className="h-8 w-8 text-slate-600 mb-2" />
                        <p className="text-xs font-medium text-slate-400">No vehicles registered</p>
                        <p className="text-[11px] text-slate-500">
                            WorldState has no active fleet units.
                        </p>
                    </div>
                ) : (
                    vehicles.map((vehicle) => {
                        const badge = getStatusBadge(vehicle.status);
                        const isSelected = selectedVehicleId === vehicle.vehicle_id;

                        return (
                            <div
                                key={vehicle.vehicle_id}
                                onClick={() => onSelectVehicle?.(vehicle.vehicle_id)}
                                className={`group relative rounded-lg border p-3 transition-all cursor-pointer ${
                                    isSelected
                                        ? "border-blue-500 bg-slate-900/90 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/40"
                                        : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80"
                                }`}
                            >
                                {/* Vehicle Title & Status */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-200">
                      {vehicle.vehicle_id}
                    </span>
                                    </div>

                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${badge.className}`}
                                    >
                    <span className={`h-1.5 w-1.5 rounded-full ${badge.dotColor}`} />
                                        {badge.label}
                  </span>
                                </div>

                                {/* Optional Metric Bar / Capacity Indicator if properties exist */}
                                {"capacity_kg" in vehicle && (
                                    <div className="mt-2.5">
                                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3 text-slate-500" />
                        Payload
                      </span>
                                            <span className="font-mono text-slate-300">
                        {(vehicle as any).current_load_kg || 0} / {(vehicle as any).capacity_kg} kg
                      </span>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 transition-all duration-300"
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        (((vehicle as any).current_load_kg || 0) /
                                                            ((vehicle as any).capacity_kg || 1)) *
                                                        100
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Capability Badges & Interactive Hint */}
                                <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/60 pt-2">
                                    <div className="flex flex-wrap gap-1.5">
                                        {vehicle.refrigerated && (
                                            <span className="inline-flex items-center gap-1 rounded bg-cyan-950/80 px-1.5 py-0.5 text-[10px] font-medium text-cyan-400 border border-cyan-800/50">
                        <Snowflake className="h-3 w-3 text-cyan-400" />
                        CHILLED
                      </span>
                                        )}

                                        {vehicle.hazardous_certified && (
                                            <span className="inline-flex items-center gap-1 rounded bg-amber-950/80 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-800/50">
                        <ShieldAlert className="h-3 w-3 text-amber-400" />
                        HAZMAT
                      </span>
                                        )}

                                        {!vehicle.refrigerated && !vehicle.hazardous_certified && (
                                            <span className="text-[10px] text-slate-500">Standard Freight</span>
                                        )}
                                    </div>

                                    <ChevronRight className="h-3.5 w-3.5 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-300" />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
}