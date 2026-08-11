"use client";

import { useState } from "react";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:8000";

export default function OrderInput() {
    const [prompt, setPrompt] = useState("");
    const [submitting, setSubmitting] =
        useState(false);

    const [message, setMessage] =
        useState<string | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    async function submitOrder() {
        if (!prompt.trim() || submitting) {
            return;
        }

        setSubmitting(true);
        setMessage(null);
        setError(null);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/orders`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        prompt:
                            prompt.trim(),
                    }),
                },
            );

            if (!response.ok) {
                const body =
                    await response.text();

                throw new Error(
                    body ||
                    `Request failed (${response.status})`,
                );
            }

            const data =
                await response.json();

            console.log(
                "[ORDER CREATED]",
                data,
            );

            setMessage(
                data.message ??
                "Order submitted successfully.",
            );

            setPrompt("");
        } catch (err) {
            console.error(
                "[ORDER ERROR]",
                err,
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to submit order.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="border-b border-slate-200 bg-white">

            <div className="px-4 py-3">

                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    New Order
                </h2>

                <p className="mt-1 text-[11px] text-slate-400">
                    Enter an order in natural language.
                </p>

            </div>

            <div className="px-3 pb-4">

                <textarea
                    value={prompt}
                    onChange={(event) =>
                        setPrompt(
                            event.target.value,
                        )
                    }
                    onKeyDown={(event) => {
                        if (
                            event.key === "Enter" &&
                            (event.ctrlKey ||
                                event.metaKey)
                        ) {
                            event.preventDefault();

                            submitOrder();
                        }
                    }}
                    placeholder={
                        "e.g. Deliver 8 pallets from Jurong Port to Changi Airport by 15:00."
                    }
                    rows={6}
                    disabled={submitting}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                />

                <div className="mt-2 flex items-center justify-between">

                    <span className="text-[10px] text-slate-400">
                        Ctrl + Enter to submit
                    </span>

                    <button
                        onClick={submitOrder}
                        disabled={
                            !prompt.trim() ||
                            submitting
                        }
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        {submitting
                            ? "Submitting..."
                            : "Submit Order"}
                    </button>

                </div>

                {message && (
                    <div className="mt-2 rounded-md bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mt-2 rounded-md bg-red-50 px-3 py-2 text-[11px] text-red-700">
                        {error}
                    </div>
                )}

            </div>



        </section>
    );
}