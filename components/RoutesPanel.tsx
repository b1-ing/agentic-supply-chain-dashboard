import type { VehicleRoute } from "@/lib/api";

interface RoutesPanelProps {
    routes: VehicleRoute[];
}

function formatDistance(meters?: number) {
    if (meters == null) {
        return "—";
    }

    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)} km`;
    }

    return `${Math.round(meters)} m`;
}

function formatTime(seconds?: number) {
    if (seconds == null) {
        return "—";
    }

    const minutes = Math.round(seconds / 60);

    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const remaining = minutes % 60;

        return `${hours}h ${remaining}m`;
    }

    return `${minutes} min`;
}

export default function RoutesPanel({
                                        routes,
                                    }: RoutesPanelProps) {
    return (
        <section className="border-b border-slate-200">

            <div className="px-4 py-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Active Routes
                </h2>
            </div>

            <div className="space-y-1.5 px-3 pb-3">

                {routes.length === 0 ? (
                    <p className="px-1 text-xs text-slate-400">
                        No active routes
                    </p>
                ) : (
                    routes.map((route) => (
                        <div
                            key={route.vehicle_id}
                            className="rounded-lg border border-slate-100 bg-white px-3 py-2.5"
                        >
                            <div className="flex items-center justify-between">

                <span className="text-xs font-semibold text-slate-800">
                  {route.vehicle_id}
                </span>

                                <span className="text-[10px] text-slate-400">
                  {route.stops.length} stops
                </span>

                            </div>

                            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">

                                <div>
                                    <div className="text-slate-400">
                                        Distance
                                    </div>

                                    <div className="font-medium text-slate-700">
                                        {formatDistance(
                                            route.total_distance_m,
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-slate-400">
                                        Travel time
                                    </div>

                                    <div className="font-medium text-slate-700">
                                        {formatTime(
                                            route.total_travel_time_seconds,
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))
                )}

            </div>
        </section>
    );
}