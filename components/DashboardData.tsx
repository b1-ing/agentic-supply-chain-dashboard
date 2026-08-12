"use client";

import { useCallback, useEffect, useState } from "react";

import {
    getWorld, VehicleRoute,
    WorldResponse, getRoutes
} from "@/lib/api";

import FleetPanel from "./FleetPanel";
import OrdersPanel from "./OrdersPanel";
import RoutesPanel from "./RoutesPanel";
import OrderInput from "./OrderInput";
import PlanningPanel from "@/components/PlanningPanel";
interface DashboardDataProps {
    WorldMap: React.ComponentType<{
        routes?: VehicleRoute[];
    }>;
}
export default function DashboardData({
                                          WorldMap,
                                      }: DashboardDataProps) {
    const [world, setWorld] =
        useState<WorldResponse | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

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
                    : "Failed to load world state",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();

        const interval = window.setInterval(
            refresh,
            5000,
        );

        return () => {
            window.clearInterval(interval);
        };
    }, [refresh]);

    if (loading && !world) {
        return (
            <div className="flex h-full items-center justify-center p-6">
                <div className="text-sm text-slate-500">
                    Loading world state...
                </div>
            </div>
        );
    }

    if (error && !world) {
        return (
            <div className="p-5">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-700">
                        Backend unavailable
                    </p>

                    <p className="mt-1 text-xs text-red-600">
                        {error}
                    </p>

                    <button
                        onClick={refresh}
                        className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!world) {
        return null;
    }


    return (
        <div className="grid h-full min-h-0 grid-cols-[280px_minmax(0,1fr)_300px]">

            <aside className="overflow-y-auto border-r bg-white">
                <FleetPanel vehicles={world.vehicles} />

                <OrdersPanel
                    pendingOrders={
                        world.pending_orders ??
                        world.new_orders ??
                        []
                    }
                    activeOrders={
                        world.orders_in_progress ?? []
                    }
                    cancelledOrders={
                        world.unserviceable_orders ?? []
                    }
                />

                <RoutesPanel routes={world.routes} />
            </aside>

            <section className="min-h-0">
                <WorldMap routes={world.routes} />
            </section>

            <aside className="min-h-0 overflow-y-auto border-l border-slate-200 bg-white">

                <OrderInput />

                <PlanningPanel />

                {/* Future:
        traffic events
        selected vehicle
        selected route
        agent decisions
    */}

            </aside>

        </div>
    );
}