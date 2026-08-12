import type {Order} from "@/lib/api";

interface OrdersPanelProps {
    pendingOrders: Order[],
    activeOrders: Order[],
    cancelledOrders: Order[]
}

function OrderCard({
                       order,
                       active,
                   }: {
    order: Order;
    active: boolean;
}) {
    return (
        <div className="rounded-lg border border-slate-100 bg-white px-3 py-2.5">

            <div className="flex items-center justify-between gap-2">

        <span className="truncate text-xs font-semibold text-slate-800">
          {order.order_id}
        </span>

                {order.assigned_vehicle && (
                    <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
            {order.assigned_vehicle}
          </span>
                )}

            </div>

            <div className="mt-2 text-[11px] text-slate-500">
                <div>
          <span className="font-medium text-slate-600">
            Pickup:
          </span>{" "}
                    {order.pickup_address}
                </div>

                <div className="mt-0.5">
          <span className="font-medium text-slate-600">
            Delivery:
          </span>{" "}
                    {order.delivery_address}
                </div>
            </div>

            <div className="mt-2 flex gap-1.5">

                {order.refrigerated && (
                    <span className="rounded bg-cyan-50 px-1.5 py-0.5 text-[10px] text-cyan-700">
            COLD
          </span>
                )}

                {order.oversized && (
                    <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] text-orange-700">
            OVERSIZED
          </span>
                )}

                {order.fragile && (
                    <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] text-purple-700">
            FRAGILE
          </span>
                )}

            </div>

            {active && (
                <div className="mt-2 text-[10px] font-medium text-emerald-600">
                    ● In progress
                </div>
            )}
        </div>
    );
}

export default function OrdersPanel({
                                        pendingOrders,
                                        activeOrders,
                                        cancelledOrders
                                    }: OrdersPanelProps) {
    return (
        <section className="border-b border-slate-200">

            <div className="px-4 py-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Orders
                </h2>
            </div>

            <div className="space-y-3 px-3 pb-3">

                <div>
                    <div className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Pending ({pendingOrders.length})
                    </div>

                    {pendingOrders.length === 0 ? (
                        <p className="px-1 text-xs text-slate-400">
                            No pending orders
                        </p>
                    ) : (
                        <div className="space-y-1.5">
                            {pendingOrders.map((order) => (
                                <OrderCard
                                    key={order.order_id}
                                    order={order}
                                    active={false}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <div className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Active ({activeOrders.length})
                    </div>

                    {activeOrders.length === 0 ? (
                        <p className="px-1 text-xs text-slate-400">
                            No active orders
                        </p>
                    ) : (
                        <div className="space-y-1.5">
                            {activeOrders.map((order) => (
                                <OrderCard
                                    key={order.order_id}
                                    order={order}
                                    active={true}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <div className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Cancelled ({cancelledOrders.length})
                    </div>

                    {cancelledOrders.length === 0 ? (
                        <p className="px-1 text-xs text-slate-400">
                            No active orders
                        </p>
                    ) : (
                        <div className="space-y-1.5">
                            {cancelledOrders.map((order) => (
                                <OrderCard
                                    key={order.order_id}
                                    order={order}
                                    active={false}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
}