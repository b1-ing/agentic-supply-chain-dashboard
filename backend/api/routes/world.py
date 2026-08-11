# Add/replace the graph endpoint in your FastAPI backend.

from fastapi import APIRouter
import osmnx as ox

from services.world.world_manager import world_manager

router = APIRouter(prefix="/world", tags=["world"])


@router.get("/graph")
def get_graph():
    world = world_manager.get_world()

    # Convert the already-loaded NetworkX/OSMnx graph to GeoJSON.
    # The GraphML file is loaded once by initialise_world(); the browser
    # never needs direct filesystem access to cache/singapore.graphml.
    geojson = ox.graph_to_gdfs(
        world.graph,
        nodes=False,
        fill_edge_geometry=True,
    ).to_json()

    import json
    return json.loads(geojson)
