import { apiFetch } from "./api";

export type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: {
      type: "LineString";
      coordinates: number[][];
    };
    properties?: Record<string, unknown>;
  }>;
};

export function getWorldGraph() {
  return apiFetch<GeoJsonFeatureCollection>("/world/graph");
}