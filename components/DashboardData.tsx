"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
    getWorld,
    VehicleRoute,
    WorldResponse,
} from "@/lib/api";

import FleetPanel from "./FleetPanel";
import OrdersPanel from "./OrdersPanel";
import RoutesPanel from "./RoutesPanel";
import AgentPanel from "@/components/AgentPanel";

import {
    Bot,
    RefreshCw,
    AlertTriangle,
    Radio,
    Truck,
    Package,
    Route as RouteIcon,
    Sparkles,
    Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------
 * Bulletproof Dynamic WorldMap Loader
 * Handles Default Exports, Named Exports, and prevents SSR hydration crashes
 * ---------------------------------------------------------------- */
const DynamicWorldMap = dynamic(
    () =>
        import("./WorldMap").then((mod) => {
            // Unwraps default export OR named export correctly
            const Component = mod.default || mod.WorldMap || mod;
            return Component;
        }),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full w-full flex-col items-center justify-center bg-slate-950 text-slate-400 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span className="text-xs font-mono">Loading Interactive World Map...</span>
            </div>
        ),
    }
);

interface DashboardDataProps {
    WorldMap?: React.ComponentType<any>;
}

export default function DashboardData({ WorldMap }: DashboardDataProps) {
    // Standardize component resolution: if WorldMap prop isn't a valid React component, use DynamicWorldMap
    const MapComponent =
        typeof WorldMap === "function" ||
        (typeof WorldMap === "object" && WorldMap !== null && "$$typeof" in WorldMap)
            ? WorldMap
            : DynamicWorldMap;

    const [world, setWorld] = useState<WorldResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cross-panel selection states for map highlighting
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>();
    const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();

    // Operational sidebar tab state
    const [activeTab, setActiveTab] = useState<"fleet" | "orders" | "routes">("orders");

    const refresh = useCallback(async () => {
        try {
            const data = await getWorld();
            setWorld(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load world telemetry state",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
        const interval = window.setInterval(refresh, 5000);
        return () => window.clearInterval(interval);
    }, [refresh]);

    // Derived order state memoization
    const pendingOrders = useMemo(
        () => world?.pending_orders ?? world?.new_orders ?? [],
        [world]
    );
    const activeOrders = useMemo(
        () => world?.orders_in_progress ?? [],
        [world]
    );
    const cancelledOrders = useMemo(
        () => world?.unserviceable_orders ?? [],
        [world]
    );

    /* ------------------------------------------------------------------
     * Loading State
     * ---------------------------------------------------------------- */
    if (loading && !world) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-slate-950 p-6 text-slate-200">
                <div className="relative flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                    <Bot className="absolute h-5 w-5 text-blue-400" />
                </div>
                <p className="mt-4 font-mono text-xs font-medium text-slate-400 animate-pulse">
                    Connecting to Agentic World Engine...
                </p>
            </div>
        );
    }

    /* ------------------------------------------------------------------
     * Error State
     * ---------------------------------------------------------------- */
    if (error && !world) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-slate-950 p-6">
                <div className="max-w-md rounded-xl border border-red-900/50 bg-red-950/30 p-6 backdrop-blur-md shadow-2xl text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-900/40 text-red-400 ring-1 ring-red-500/30">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-slate-100 uppercase tracking-wider">
                        Telemetry Feed Disrupted
                    </h3>
                    <p className="mt-1 text-xs text-red-300/80 leading-relaxed">{error}</p>
                    <button
                        onClick={refresh}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition-colors hover:bg-red-500 active:bg-red-700"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Reconnect Telemetry
                    </button>
                </div>
            </div>
        );
    }

    if (!world) return null;

    return (
        <div className="grid h-full min-h-0 w-full grid-cols-[220px_minmax(0,1fr)_360px] bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
            {/* ====================================================================
          LEFT COLUMN: Operational Data (Fleet, Orders, Routes Tabs)
         ==================================================================== */}
            <aside className="flex flex-col border-r border-slate-800 bg-slate-950/80 min-h-0 overflow-hidden z-10">
                <div className="border-b border-slate-800 p-1.5 bg-slate-900/50">
                    <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-950 p-1 border border-slate-800/80">
                        <button
                            type="button"
                            onClick={() => setActiveTab("orders")}
                            title="Orders"
                            className={`flex items-center justify-center gap-1 rounded-md py-1 text-[11px] font-medium transition-all ${
                                activeTab === "orders"
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                            }`}
                        >
                            <Package className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">Orders</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("fleet")}
                            title="Fleet"
                            className={`flex items-center justify-center gap-1 rounded-md py-1 text-[11px] font-medium transition-all ${
                                activeTab === "fleet"
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                            }`}
                        >
                            <Truck className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">Fleet</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("routes")}
                            title="Routes"
                            className={`flex items-center justify-center gap-1 rounded-md py-1 text-[11px] font-medium transition-all ${
                                activeTab === "routes"
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                            }`}
                        >
                            <RouteIcon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">Routes</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-1.5">
                    {activeTab === "orders" && (
                        <OrdersPanel
                            pendingOrders={pendingOrders}
                            activeOrders={activeOrders}
                            cancelledOrders={cancelledOrders}
                            selectedOrderId={selectedOrderId}
                            onSelectOrder={(id) => setSelectedOrderId(id)}
                        />
                    )}

                    {activeTab === "fleet" && (
                        <FleetPanel
                            vehicles={world.vehicles}
                            selectedVehicleId={selectedVehicleId}
                            onSelectVehicle={(id) => setSelectedVehicleId(id)}
                        />
                    )}

                    {activeTab === "routes" && (
                        <RoutesPanel
                            routes={world.routes}
                            selectedVehicleId={selectedVehicleId}
                            onSelectRoute={(id) => setSelectedVehicleId(id)}
                        />
                    )}
                </div>
            </aside>

            {/* ====================================================================
          CENTER STAGE: Interactive Canvas & Overlay Status
         ==================================================================== */}
            <section className="relative flex flex-col min-h-0 bg-slate-950 overflow-hidden">
                {/* Floating Telemetry Status Pill */}
                <div className="pointer-events-none absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
                    <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-950/80 px-3 py-1.5 backdrop-blur-md shadow-lg">
                        <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                        <span className="font-mono text-[11px] font-medium text-slate-300">
                            WORLD_STATE // CANVAS
                        </span>
                    </div>

                    <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/80 px-3 py-1.5 backdrop-blur-md shadow-lg font-mono text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                            {world.vehicles?.length ?? 0} Vehicles
                        </span>
                        <span className="text-slate-700">|</span>
                        <span className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            {activeOrders.length} Active Orders
                        </span>
                    </div>
                </div>

                {/* Unobstructed Map Viewport Stage */}
                <div className="h-full w-full min-h-0 relative z-0">
                    <MapComponent
                        routes={world.routes}
                        depots={world.depots}
                        vehicles={world.vehicles}
                        selectedOrderId={selectedOrderId}
                        selectedVehicleId={selectedVehicleId}
                    />
                </div>
            </section>

            {/* ====================================================================
          RIGHT COLUMN: Dedicated Agentic Command & Planning Console
         ==================================================================== */}
            <aside className="flex flex-col border-l border-slate-800 bg-slate-950/90 min-h-0 overflow-hidden z-10">
                <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 bg-slate-900/40 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30">
                            <Sparkles className="h-3 w-3" />
                        </div>
                        <h2 className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider">
                            Agent Console
                        </h2>
                    </div>
                    <span className="rounded bg-purple-500/10 px-1.5 py-0.5 font-mono text-[9px] text-purple-400 border border-purple-500/20">
                        AUTONOMOUS
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-3">
                    <AgentPanel />
                </div>
            </aside>
        </div>
    );
}
