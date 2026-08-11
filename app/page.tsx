"use client";

import dynamic from "next/dynamic";
import DashboardData from "@/components/DashboardData";

const WorldMap = dynamic(
    () => import("@/components/WorldMap"),
    {
        ssr: false,
    },
);

export default function DashboardPage() {
    return (
        <main className="flex h-dvh flex-col overflow-hidden bg-slate-50">

            <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-5">
                <h1 className="font-semibold">
                    Supply Chain Control Tower
                </h1>

                <span className="text-xs text-emerald-600">
          ● Live
        </span>
            </header>

            <div className="min-h-0 flex-1">
                <DashboardData
                    WorldMap={WorldMap}
                />
            </div>

        </main>
    );
}