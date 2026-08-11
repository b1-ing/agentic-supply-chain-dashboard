import type { Vehicle } from "@/lib/api";

interface FleetPanelProps {
    vehicles: Vehicle[];
}

function statusClass(status: string) {
    switch (status.toUpperCase()) {
        case "EN_ROUTE":
            return "bg-blue-100 text-blue-700";

        case "IDLE":
            return "bg-slate-100 text-slate-600";

        case "AVAILABLE":
            return "bg-emerald-100 text-emerald-700";

        case "OFFLINE":
            return "bg-red-100 text-red-700";

        default:
            return "bg-amber-100 text-amber-700";
    }
}

export default function FleetPanel({
                                       vehicles,
                                   }: FleetPanelProps) {
    return (
        <section className="border-b border-slate-200">

            <div className="flex items-center justify-between px-4 py-3">
                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Fleet
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400">
                        {vehicles.length} vehicles
                    </p>
                </div>
            </div>

            <div className="space-y-1 px-3 pb-3">
                {vehicles.length === 0 ? (
                    <p className="px-1 text-xs text-slate-400">
                        No vehicles
                    </p>
                ) : (
                    vehicles.map((vehicle) => (
                        <div
                            key={vehicle.vehicle_id}
                            className="rounded-lg border border-slate-100 bg-white px-3 py-2.5"
                        >
                            <div className="flex items-center justify-between">

                <span className="text-sm font-medium text-slate-800">
                  {vehicle.vehicle_id}
                </span>

                                <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass(
                                        vehicle.status,
                                    )}`}
                                >
                  {vehicle.status}
                </span>
                            </div>

                            <div className="mt-2 flex gap-2 text-[11px] text-slate-400">

                                {vehicle.refrigerated && (
                                    <span className="rounded bg-cyan-50 px-1.5 py-0.5 text-cyan-700">
                    REFRIGERATED
                  </span>
                                )}

                                {vehicle.hazardous_certified && (
                                    <span className="rounded bg-orange-50 px-1.5 py-0.5 text-orange-700">
                    HAZMAT
                  </span>
                                )}

                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}