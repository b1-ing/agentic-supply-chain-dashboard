
// components/PlanningPanel.tsx

"use client";

import { useEffect, useState } from "react";

const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:8000";

interface PlanningData {
    summary?: string;
    recommend_replan?: boolean;
    assessments?: any[];
}

export default function PlanningPanel() {
    const [planning, setPlanning] =
        useState<PlanningData | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const response = await fetch(
                    `${API_BASE}/api/planning`,
                );

                if (!response.ok) {
                    throw new Error(
                        `HTTP ${response.status}`,
                    );
                }

                const data =
                    await response.json();

                setPlanning(data);
            } catch (error) {
                console.error(
                    "[Planning]",
                    error,
                );
            }
        }

        load();

        const interval =
            setInterval(load, 5000);

        return () =>
            clearInterval(interval);
    }, []);

    if (!planning) {
        return (
            <section className="border-b border-slate-200 bg-white p-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Planning Decision
                </h2>

                <p className="mt-2 text-xs text-slate-400">
                    Loading...
                </p>
            </section>
        );
    }

    return (
        <section className="border-b border-slate-200 bg-white p-4">

            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Planning Decision
            </h2>

            <div
                className={`mt-3 rounded-lg border p-3 ${
                    planning.recommend_replan
                        ? "border-amber-200 bg-amber-50"
                        : "border-emerald-200 bg-emerald-50"
                }`}
            >

                <div className="flex items-center gap-2">

                    <span className="text-sm">
                        {planning.recommend_replan
                            ? "⚠"
                            : "✓"}
                    </span>

                    <span className="text-xs font-semibold text-slate-800">
                        {planning.recommend_replan
                            ? "Replanning recommended"
                            : "Network operating normally"}
                    </span>

                </div>

                {planning.summary && (
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        {planning.summary}
                    </p>
                )}

            </div>

            {planning.assessments &&
                planning.assessments.length > 0 && (

                    <div className="mt-3">

                        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Assessments
                        </div>

                        <div className="space-y-2">

                            {planning.assessments.map(
                                (assessment, index) => (
                                    <div
                                        key={index}
                                        className="rounded-md border border-slate-200 p-2.5"
                                    >
                                        <div className="flex justify-between">

                                        <span className="text-xs font-medium text-slate-700">
                                            {assessment.road_name ??
                                                assessment.incident_id ??
                                                `Incident ${index + 1}`}
                                        </span>

                                            <span className="text-[10px] uppercase text-slate-500">
                                            {assessment.severity ??
                                                "unknown"}
                                        </span>

                                        </div>

                                        {assessment.estimated_delay_minutes !=
                                            null && (
                                                <p className="mt-1 text-[11px] text-slate-500">
                                                    Estimated delay:{" "}
                                                    {
                                                        assessment.estimated_delay_minutes
                                                    }{" "}
                                                    min
                                                </p>
                                            )}

                                    </div>
                                ),
                            )}

                        </div>

                    </div>
                )}

        </section>
    );
}