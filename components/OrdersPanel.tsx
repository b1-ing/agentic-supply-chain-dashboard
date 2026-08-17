"use client";

import { useState } from "react";
import type { Order } from "@/lib/api";
import {
    Package,
    Clock,
    Activity,
    XCircle,
    Snowflake,
    BoxSelect,
    ShieldAlert,
    Truck,
    ArrowRight,
    ChevronDown,
    ChevronRight,
    Hash,
    Copy,
    Check,
} from "lucide-react";

interface OrdersPanelProps {
    pendingOrders: Order[];
    activeOrders: Order[];
    cancelledOrders: Order[];
    selectedOrderId?: string;
    onSelectOrder?: (orderId: string) => void;
}

/* ------------------------------------------------------------------
 * Order Card Component
 * ---------------------------------------------------------------- */

function OrderCard({
                       order,
                       status,
                       isSelected,
                       onSelect,
                   }: {
    order: Order;
    status: "pending" | "active" | "cancelled";
    isSelected?: boolean;
    onSelect?: () => void;
}) {
    const [copied, setCopied] = useState(false);

    // Prevent card click selection if user is just highlighting text
    const handleCardClick = (e: React.MouseEvent) => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            return; // User is highlighting text, don't trigger selection
        }
        onSelect?.();
    };

    const handleCopyId = (e: React.MouseEvent) => {
        e.stopPropagation(); // Don't trigger card selection when clicking copy icon
        navigator.clipboard.writeText(order.order_id);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div
            onClick={handleCardClick}
            className={`group relative rounded-lg border p-3 transition-all cursor-pointer select-text ${
                isSelected
                    ? "border-blue-500 bg-slate-900/90 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/40"
                    : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80"
            }`}
        >
            {/* Card Header */}
            <div className="flex items-center justify-between gap-2">
                {/* Prominent Order ID Header Tag */}
                <div className="flex items-center gap-1.5 min-w-0">
                    <div
                        onClick={handleCopyId}
                        title="Click to copy Order ID"
                        className="flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 font-mono text-xs font-bold text-blue-400 border border-blue-500/30 shrink-0 shadow-sm hover:bg-blue-500/20 hover:border-blue-500/50 transition-colors cursor-pointer select-none"
                    >
                        <Hash className="h-3 w-3 text-blue-400" />
                        <span className="select-text">{order.order_id}</span>
                        {copied ? (
                            <Check className="h-3 w-3 text-emerald-400 ml-0.5" />
                        ) : (
                            <Copy className="h-2.5 w-2.5 text-blue-400/60 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
                        )}
                    </div>

                    {status === "active" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20 select-none">
              <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
              In Transit
            </span>
                    )}

                    {status === "pending" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20 select-none">
              <Clock className="h-2.5 w-2.5" />
              Queued
            </span>
                    )}

                    {status === "cancelled" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400 ring-1 ring-inset ring-red-500/20 select-none">
              Cancelled
            </span>
                    )}
                </div>

                {/* Assigned Vehicle Pill */}
                {order.assigned_vehicle && (
                    <div className="flex items-center gap-1 rounded bg-blue-950/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-blue-400 border border-blue-800/50 shrink-0 select-text">
                        <Truck className="h-3 w-3 text-blue-400" />
                        <span>{order.assigned_vehicle}</span>
                    </div>
                )}
            </div>

            {/* Address Vector & Order ID Highlight Block */}
            <div className="mt-2.5 space-y-1.5 rounded bg-slate-950/60 p-2 border border-slate-800/50 text-[11px] select-text">
                {/* Explicit Order ID Reference Line */}
                <div className="flex items-center justify-between pb-1 border-b border-slate-800/40 text-[10px] font-mono">
                    <span className="text-slate-500 uppercase tracking-wider select-none">Order ID</span>
                    <span className="font-semibold text-blue-300 selection:bg-blue-600 selection:text-white cursor-text">
            {order.order_id}
          </span>
                </div>

                <div className="flex items-start gap-1.5 text-slate-300 pt-0.5">
                    <span className="font-mono font-semibold text-blue-400 shrink-0 select-none">P:</span>
                    <span className="truncate text-slate-300 selection:bg-blue-600 selection:text-white cursor-text">
            {order.pickup_address}
          </span>
                </div>
                <div className="flex items-center justify-center py-0.5 text-slate-600 select-none">
                    <ArrowRight className="h-3 w-3 rotate-90" />
                </div>
                <div className="flex items-start gap-1.5 text-slate-300">
                    <span className="font-mono font-semibold text-emerald-400 shrink-0 select-none">D:</span>
                    <span className="truncate text-slate-300 selection:bg-blue-600 selection:text-white cursor-text">
            {order.delivery_address}
          </span>
                </div>
            </div>

            {/* Special Handling Badges */}
            <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/60 pt-2 select-none">
                <div className="flex flex-wrap gap-1.5">
                    {order.refrigerated && (
                        <span className="inline-flex items-center gap-1 rounded bg-cyan-950/80 px-1.5 py-0.5 text-[10px] font-medium text-cyan-400 border border-cyan-800/50">
              <Snowflake className="h-3 w-3" />
              COLD
            </span>
                    )}

                    {order.oversized && (
                        <span className="inline-flex items-center gap-1 rounded bg-orange-950/80 px-1.5 py-0.5 text-[10px] font-medium text-orange-400 border border-orange-800/50">
              <BoxSelect className="h-3 w-3" />
              OVERSIZED
            </span>
                    )}

                    {order.fragile && (
                        <span className="inline-flex items-center gap-1 rounded bg-purple-950/80 px-1.5 py-0.5 text-[10px] font-medium text-purple-400 border border-purple-800/50">
              <ShieldAlert className="h-3 w-3" />
              FRAGILE
            </span>
                    )}

                    {!order.refrigerated && !order.oversized && !order.fragile && (
                        <span className="text-[10px] text-slate-500">Standard Delivery</span>
                    )}
                </div>

                <ChevronRight className="h-3.5 w-3.5 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-300" />
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------
 * Main Component
 * ---------------------------------------------------------------- */

export default function OrdersPanel({
                                        pendingOrders = [],
                                        activeOrders = [],
                                        cancelledOrders = [],
                                        selectedOrderId,
                                        onSelectOrder,
                                    }: OrdersPanelProps) {
    // Collapsible section states
    const [openSections, setOpenSections] = useState({
        active: true,
        pending: true,
        cancelled: false,
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const totalOrders =
        pendingOrders.length + activeOrders.length + cancelledOrders.length;

    return (
        <section className="flex h-full w-full flex-col rounded-xl border border-slate-800 bg-slate-950 text-slate-100 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 select-none">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30">
                        <Package className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                            Order Queue
                        </h2>
                        <p className="text-[11px] text-slate-400">
                            {totalOrders} total in WorldState
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    {activeOrders.length} active
                </div>
            </div>

            {/* Orders Viewport */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3">
                {/* ACTIVE ORDERS SECTION */}
                <div className="rounded-lg border border-slate-800/80 bg-slate-900/30 overflow-hidden">
                    <button
                        onClick={() => toggleSection("active")}
                        className="flex w-full items-center justify-between bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 transition-colors select-none"
                    >
                        <div className="flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Active Orders</span>
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.2 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                {activeOrders.length}
              </span>
                        </div>
                        {openSections.active ? (
                            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                        ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                        )}
                    </button>

                    {openSections.active && (
                        <div className="p-2 space-y-2">
                            {activeOrders.length === 0 ? (
                                <p className="p-2 text-center text-xs text-slate-500 select-none">
                                    No active orders in transit
                                </p>
                            ) : (
                                activeOrders.map((order) => (
                                    <OrderCard
                                        key={order.order_id}
                                        order={order}
                                        status="active"
                                        isSelected={selectedOrderId === order.order_id}
                                        onSelect={() => onSelectOrder?.(order.order_id)}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* PENDING ORDERS SECTION */}
                <div className="rounded-lg border border-slate-800/80 bg-slate-900/30 overflow-hidden">
                    <button
                        onClick={() => toggleSection("pending")}
                        className="flex w-full items-center justify-between bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 transition-colors select-none"
                    >
                        <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-amber-400" />
                            <span>Pending Queue</span>
                            <span className="rounded-full bg-amber-500/10 px-2 py-0.2 text-[10px] font-mono text-amber-400 border border-amber-500/20">
                {pendingOrders.length}
              </span>
                        </div>
                        {openSections.pending ? (
                            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                        ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                        )}
                    </button>

                    {openSections.pending && (
                        <div className="p-2 space-y-2">
                            {pendingOrders.length === 0 ? (
                                <p className="p-2 text-center text-xs text-slate-500 select-none">
                                    No pending orders waiting for solver
                                </p>
                            ) : (
                                pendingOrders.map((order) => (
                                    <OrderCard
                                        key={order.order_id}
                                        order={order}
                                        status="pending"
                                        isSelected={selectedOrderId === order.order_id}
                                        onSelect={() => onSelectOrder?.(order.order_id)}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* CANCELLED ORDERS SECTION */}
                <div className="rounded-lg border border-slate-800/80 bg-slate-900/30 overflow-hidden">
                    <button
                        onClick={() => toggleSection("cancelled")}
                        className="flex w-full items-center justify-between bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 transition-colors select-none"
                    >
                        <div className="flex items-center gap-2">
                            <XCircle className="h-3.5 w-3.5 text-red-400" />
                            <span>Cancelled / Unassigned</span>
                            <span className="rounded-full bg-red-500/10 px-2 py-0.2 text-[10px] font-mono text-red-400 border border-red-500/20">
                {cancelledOrders.length}
              </span>
                        </div>
                        {openSections.cancelled ? (
                            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                        ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                        )}
                    </button>

                    {openSections.cancelled && (
                        <div className="p-2 space-y-2">
                            {cancelledOrders.length === 0 ? (
                                <p className="p-2 text-center text-xs text-slate-500 select-none">
                                    No cancelled orders
                                </p>
                            ) : (
                                cancelledOrders.map((order) => (
                                    <OrderCard
                                        key={order.order_id}
                                        order={order}
                                        status="cancelled"
                                        isSelected={selectedOrderId === order.order_id}
                                        onSelect={() => onSelectOrder?.(order.order_id)}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}