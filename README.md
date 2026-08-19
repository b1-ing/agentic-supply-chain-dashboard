# Agentic Supply Chain Dashboard

Next.js + React + Leaflet frontend for the agentic supply-chain platform.


## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create the local environment file from the example:

```bash
copy .env.local.example .env.local
```

Update the values in `.env.local` if required.

### 3. Start the development server

```bash
npm run dev
```

The dashboard will be available at:

```text
http://localhost:3000
```

## Backend Requirements

The FastAPI backend must be running.

Check the agentic-supply-chain-platform repo on how to get this up.


## Dashboard

The dashboard will provide a real-time operational view of the supply-chain system, including:

* Vehicle positions and status
* Pending orders
* Orders currently in progress
* Active routes
* Traffic events
* Singapore road network
* Traffic conditions and disruptions

## Next Steps

### KPI Cards

Replace the current placeholder KPI cards with live values for:

* Vehicles
* Pending orders
* Orders in progress
* Active routes
* Traffic events

### Map Layers

Add the following Leaflet map layers:

* Vehicle positions
* Route segments
* Pickup and delivery stops
* Traffic incidents
* Speed-band traffic
* Depots

## Project Structure

A typical frontend structure is:

```text
.
├── app/
├── components/
├── public/
├── .env.local.example
├── package.json
└── README.md
```

The frontend is responsible for **visualisation and interaction**, while the FastAPI backend remains responsible for the NetworkX graph, world state, routing, traffic processing, and operational logic.
