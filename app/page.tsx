"use client";

import dynamic from "next/dynamic";
import DashboardData from "@/components/DashboardData";

// const WorldMap = dynamic(
//     () => import("@/components/WorldMap"),
//     {
//         ssr: false,
//     },
// );

export default function DashboardPage() {
    return (
        <main className="flex h-dvh flex-col overflow-hidden bg-slate-50">


            <div className="min-h-0 flex-1">
                <DashboardData
                />
            </div>

        </main>
    );
}