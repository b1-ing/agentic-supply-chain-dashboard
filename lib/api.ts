const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function request<T>(
    path: string,
    options?: RequestInit,
): Promise<T> {
  const response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...options?.headers,
        },
        cache: "no-store",
      },
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
        `API ${response.status}: ${body || response.statusText}`,
    );
  }

  return response.json();
}

/* ------------------------------------------------------------------
 * Vehicles
 * ---------------------------------------------------------------- */

export interface Vehicle {
  vehicle_id: string;
  status: string;

  current_node?: number | null;
  current_lat?: number | null;
  current_lon?: number | null;

  max_weight_kg?: number | null;
  max_volume_m3?: number | null;
  max_pallets?: number | null;

  height_m?: number | null;
  width_m?: number | null;
  length_m?: number | null;

  refrigerated: boolean;
  hazardous_certified: boolean;
}

export interface Depot{
depot_id: string;

graph_node: number | null;
lat: number;
lon: number;

}

/* ------------------------------------------------------------------
 * Orders
 * ---------------------------------------------------------------- */

export interface Order {
  order_id: string;

  pickup_address: string;
  delivery_address: string;

  pickup_lat?: number | null;
  pickup_lon?: number | null;

  delivery_lat?: number | null;
  delivery_lon?: number | null;

  weight_kg?: number | null;
  volume_m3?: number | null;
  pallets?: number | null;

  refrigerated: boolean;
  hazardous: boolean;
  fragile: boolean;
  oversized: boolean;

  assigned_vehicle?: string | null;

  notes?: string | null;

  status?: string | null;
}

/* ------------------------------------------------------------------
 * Routes
 * ---------------------------------------------------------------- */

export interface RouteStop {
  sequence: number;

  kind: string;

  lat?: number | null;
  lon?: number | null;

  order_id?: string | null;
  vehicle_id?: string | null;
}

export interface RouteSegment {
  geometry: [number, number][];
}

export interface VehicleRoute {
  vehicle_id: string;

  stops: RouteStop[];

  segments?: RouteSegment[];

  total_distance?: number;
  total_travel_time?: number;
}

/* ------------------------------------------------------------------
 * World
 * ---------------------------------------------------------------- */

export interface WorldResponse {
  unserviceable_orders?: Order[];
  vehicles: Vehicle[];

  depots: Depot[];

  pending_orders?: Order[];
  new_orders?: Order[];

  orders_in_progress?: Order[];

  routes: VehicleRoute[];

  traffic_events?: unknown[];
  matched_events?: unknown[];

  summary?: string;
}

export interface VehicleRoute {
  vehicle_id: string;

  stops: RouteStop[];

  geometry?: [number, number][];

  total_distance_m?: number;
  total_travel_time_seconds?: number;
}

/* ------------------------------------------------------------------
 * API
 * ---------------------------------------------------------------- */

export function getWorld(): Promise<WorldResponse> {
  return request<WorldResponse>("/api/world");
}

export function getVehicles(): Promise<Vehicle[]> {
  return request<Vehicle[]>("/api/vehicles");
}

export function getOrders(): Promise<Order[]> {
  return request<Order[]>("/api/orders");
}

export function getRoutes(): Promise<VehicleRoute[]> {
  return request<VehicleRoute[]>("/api/routes");
}


export interface AgentStreamEvent {
  type: "thought" | "agent_thought" | "tool_start" | "tool_end" | "agent_final" | "agent_error";
  id?: string;
  toolName?: string;
  args?: Record<string, unknown>;
  status?: "running" | "completed" | "failed";
  durationMs?: number;
  result?: unknown;
  error?: string;
  content?: string;
  output?: string;
}

export interface RunAgentHandlers {
  onEvent?: (event: AgentStreamEvent) => void;
}

/**
 * Executes the operations agent and streams real-time thoughts, tool calls, and final output via SSE.
 */
export async function runAgent(
    message: string,
    handlers: RunAgentHandlers = {}
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/agent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown server error");
    throw new Error(`Agent request failed (${response.status}): ${errorText}`);
  }

  if (!response.body) {
    throw new Error("No readable stream returned from backend agent service.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Split SSE chunks by double newline
      const parts = buffer.split("\n\n");
      // Keep incomplete chunk in the buffer
      buffer = parts.pop() || "";

      for (const part of parts) {
        const line = part.trim();
        if (!line) continue;

        // Extract "data: " lines from Server-Sent Events stream
        if (line.startsWith("data:")) {
          const jsonStr = line.replace(/^data:\s*/, "").trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;

          try {
            const event: AgentStreamEvent = JSON.parse(jsonStr);
            handlers.onEvent?.(event);
          } catch (parseErr) {
            console.warn("Failed to parse SSE line:", line, parseErr);
          }
        }
      }
    }

    // Process any remaining tail in the buffer
    if (buffer.trim().startsWith("data:")) {
      const jsonStr = buffer.replace(/^data:\s*/, "").trim();
      if (jsonStr && jsonStr !== "[DONE]") {
        try {
          const event: AgentStreamEvent = JSON.parse(jsonStr);
          handlers.onEvent?.(event);
        } catch {
          // Ignore trailing stream parse errors
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}