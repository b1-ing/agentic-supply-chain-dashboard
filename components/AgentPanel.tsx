"use client";

import { useState } from "react";
import { runAgent } from "@/lib/api";
import {
    Bot,
    Send,
    Loader2,
    Wrench,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Sparkles,
    AlertCircle,
    Terminal,
    CornerDownLeft,
    Sparkle,
} from "lucide-react";

/* ------------------------------------------------------------------
 * Types
 * ---------------------------------------------------------------- */

export interface ToolCall {
    id: string;
    toolName: string;
    args: Record<string, unknown>;
    status: "running" | "completed" | "failed";
    durationMs?: number;
    result?: unknown;
    error?: string;
}

export interface AgentRunResult {
    thought?: string;
    finalOutput: string;
}

/* ------------------------------------------------------------------
 * Presets & Suggested Prompts
 * ---------------------------------------------------------------- */

const SUGGESTED_PROMPTS = [
    "Create order: 50kg chilled seafood from depot to Tengah Airbase",
    "PIE is closed, re-route active fleet",
];

/* ------------------------------------------------------------------
 * Main Component
 * ---------------------------------------------------------------- */

export default function AgentPanel() {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showThought, setShowThought] = useState(true);

    const [activeTrace, setActiveTrace] = useState<ToolCall[]>([]);
    const [response, setResponse] = useState<AgentRunResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(customPrompt?: string) {
        const promptToSubmit = customPrompt || message;

        if (!promptToSubmit.trim() || loading) return;

        setLoading(true);
        setError(null);
        setResponse(null);
        setActiveTrace([]);

        let accumulatedThought = "";

        try {
            await runAgent(promptToSubmit, {
                onEvent(event) {
                    // 1. LIVE AGENT MONOLOGUE / REASONING
                    if (event.type === "thought" || event.type === "agent_thought") {
                        if (event.content) {
                            accumulatedThought += event.content;
                            setResponse((prev) => ({
                                finalOutput: prev?.finalOutput ?? "",
                                thought: accumulatedThought,
                            }));
                        }
                        return;
                    }

                    // 2. REAL TOOL START
                    if (event.type === "tool_start") {
                        setActiveTrace((prev) => [
                            ...prev,
                            {
                                id: event.id ?? `${Date.now()}-${prev.length}`,
                                toolName: event.toolName ?? "unknown_tool",
                                args: event.args ?? {},
                                status: "running",
                            },
                        ]);
                        return;
                    }

                    // 3. REAL TOOL END
                    if (event.type === "tool_end") {
                        setActiveTrace((prev) =>
                            prev.map((tool) => {
                                if (tool.id !== event.id && tool.toolName !== event.toolName) {
                                    return tool;
                                }
                                return {
                                    ...tool,
                                    status: event.status ?? "completed",
                                    durationMs: event.durationMs,
                                    result: event.result,
                                    error: event.error,
                                };
                            })
                        );
                        return;
                    }

                    // 4. FINAL AGENT RESPONSE
                    if (event.type === "agent_final") {
                        setResponse((prev) => ({
                            thought: prev?.thought ?? accumulatedThought,
                            finalOutput: event.output ?? "",
                        }));
                        return;
                    }

                    // 5. AGENT ERROR
                    if (event.type === "agent_error") {
                        setError(event.error ?? "Agent execution failed.");
                        return;
                    }
                },
            });
        } catch (err) {
            console.error("Error executing agent stream:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to contact the Operations Agent engine."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex h-full w-full flex-col rounded-xl border border-slate-800/80 bg-slate-950 p-4 text-slate-100 shadow-2xl backdrop-blur-md">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600/30 to-indigo-600/20 text-blue-400 ring-1 ring-blue-500/40 shadow-inner">
                        <Bot className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-100">
                            Operations Agent
                        </h2>
                        <p className="text-[10px] text-slate-400">
                            Natural Language Orchestrator & Solver Pipeline
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            WorldState Sync
          </span>
                </div>
            </div>

            {/* Suggestion Chips */}
            <div className="mb-3 flex flex-wrap gap-1.5">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setMessage(prompt);
                            handleSubmit(prompt);
                        }}
                        disabled={loading}
                        className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-[11px] text-slate-300 transition-all hover:border-blue-500/40 hover:bg-blue-950/30 hover:text-blue-200 active:scale-[0.98] disabled:opacity-50"
                    >
                        <Sparkles className="h-3 w-3 text-blue-400 shrink-0" />
                        <span className="truncate max-w-[240px]">{prompt}</span>
                    </button>
                ))}
            </div>

            {/* STYLIZED INPUT CONSOLE */}
            <div className="group relative mb-4 rounded-xl border border-slate-800 bg-slate-900/50 p-2.5 shadow-lg backdrop-blur-md transition-all focus-within:border-blue-500/60 focus-within:bg-slate-900/90 focus-within:ring-1 focus-within:ring-blue-500/30 hover:border-slate-700/80">
                {/* Terminal Header Bar */}
                <div className="mb-2 flex items-center justify-between border-b border-slate-800/60 pb-1.5 px-0.5 font-mono text-[10px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <Terminal className="h-3 w-3 text-blue-400" />
                        <span>COMMAND_INPUT</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-600">
            NLP Engine v2.4
          </span>
                </div>

                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                    placeholder="Issue dispatch orders or re-route rules (e.g. 'Reroute active trucks around Bartley Road')..."
                    className="min-h-20 w-full resize-none bg-transparent font-sans text-xs text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed"
                />

                <div className="mt-2 flex items-center justify-between border-t border-slate-800/40 pt-2">
          <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
            <CornerDownLeft className="h-3 w-3" />
            Cmd/Ctrl + Enter
          </span>

                    <button
                        onClick={() => handleSubmit()}
                        disabled={loading || !message.trim()}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>Orchestrating...</span>
                            </>
                        ) : (
                            <>
                                <Send className="h-3.5 w-3.5" />
                                <span>Ask Agent</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Execution Trace & Output Viewport */}
            <div className="flex-1 overflow-y-auto space-y-3">
                {/* Active Tool Traces */}
                {(loading || activeTrace.length > 0) && (
                    <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
                        <div className="flex items-center justify-between mb-2 border-b border-slate-800/80 pb-2">
                            <div className="flex items-center gap-2 text-xs font-mono font-medium text-slate-300">
                                <Terminal className="h-3.5 w-3.5 text-blue-400" />
                                <span>Execution Trace</span>
                            </div>
                            {loading && (
                                <span className="text-[10px] font-mono text-blue-400 animate-pulse">
                  Solving constraints...
                </span>
                            )}
                        </div>

                        <div className="space-y-2 font-mono text-xs">
                            {activeTrace.map((tool) => (
                                <TraceItem key={tool.id} tool={tool} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-400 shadow-md">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span className="leading-relaxed">{error}</span>
                    </div>
                )}

                {/* STYLIZED FINAL OUTPUT BOX */}
                {response && (
                    <div className="relative overflow-hidden rounded-xl border border-blue-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-4 shadow-xl backdrop-blur-md">
                        {/* Ambient Top Glow */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

                        {/* Agent Thought / Monologue Accordion */}
                        {response.thought && (
                            <div className="mb-3 border-b border-slate-800/80 pb-2.5">
                                <button
                                    onClick={() => setShowThought(!showThought)}
                                    className="flex items-center justify-between w-full text-left text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Wrench className="h-3.5 w-3.5 text-purple-400" />
                                        <span>Agent Monologue & Reasoning</span>
                                    </div>
                                    {showThought ? (
                                        <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
                                    ) : (
                                        <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                                    )}
                                </button>

                                {showThought && (
                                    <div className="mt-2 rounded-lg bg-slate-950/80 p-3 text-[11px] font-mono text-slate-300 leading-relaxed border border-slate-800/80 whitespace-pre-wrap shadow-inner">
                                        {response.thought}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Final Output Header & Content */}
                        <div>
                            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-400">
                                <Sparkle className="h-3.5 w-3.5 text-blue-400" />
                                <span>Agent Dispatch Result</span>
                            </div>

                            <div className="rounded-lg bg-slate-950/50 p-3 border border-slate-800/50 text-xs font-sans text-slate-200 leading-relaxed whitespace-pre-wrap">
                                {response.finalOutput}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------
 * Tool Trace Sub-Component
 * ---------------------------------------------------------------- */

function TraceItem({ tool }: { tool: ToolCall }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="rounded-md bg-slate-950/70 p-2 border border-slate-800/60 transition-all">
            <div
                className="flex items-center justify-between gap-3 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2 min-w-0">
                    {tool.status === "running" && (
                        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-blue-400" />
                    )}
                    {tool.status === "completed" && (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    )}
                    {tool.status === "failed" && (
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                    )}
                    <span className="text-blue-300 font-semibold truncate text-[11px]">
            {tool.toolName}()
          </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-[10px] text-slate-500">
                    {tool.durationMs !== undefined && (
                        <span>{tool.durationMs.toFixed(0)} ms</span>
                    )}
                    {tool.result && <span>{expanded ? "▼" : "▶"}</span>}
                </div>
            </div>

            {/* Arguments */}
            <div className="mt-1 ml-5 text-[10px] text-slate-500 font-mono break-all">
                {JSON.stringify(tool.args)}
            </div>

            {/* Optional Result Payload Toggle */}
            {expanded && tool.result && (
                <div className="mt-2 ml-5 p-2 bg-slate-900/90 rounded border border-slate-800 text-[10px] text-emerald-300 font-mono overflow-x-auto">
                    <pre>{JSON.stringify(tool.result, null, 2)}</pre>
                </div>
            )}

            {/* Error Message */}
            {tool.error && (
                <div className="mt-1.5 ml-5 text-[10px] text-red-400">
                    {tool.error}
                </div>
            )}
        </div>
    );
}