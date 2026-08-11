# Agentic Supply Chain Dashboard

Next.js + React + Leaflet frontend for the agentic supply-chain platform.

## Important architecture

The browser cannot read `cache/singapore.graphml` directly.

The backend owns the graph:

    cache/singapore.graphml
            ↓
    initialise_world()
            ↓
       WorldState.graph
            ↓
       GET /world/graph
            ↓
       GeoJSON
            ↓
       Leaflet map

This keeps the filesystem and NetworkX graph on the backend.

## Run

```bash
npm install
copy .env.local.example .env.local
npm run dev
```

Open:

http://localhost:3000

The FastAPI backend must expose:

    GET http://127.0.0.1:8000/world/graph

and allow CORS from the Next.js origin.

## Next steps

Replace the placeholder KPI cards with:

- vehicles
- pending orders
- orders in progress
- active routes
- traffic events

Then add map layers for:

- vehicle positions
- route segments
- pickup/delivery stops
- traffic incidents
- speed-band traffic
- depots
