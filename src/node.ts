import { OsmObject } from "./osm-object.js";
import { strArrayToFloat } from "./utils.js";
import type { RefElements } from "./ref-elements.js";
import type { Feature } from "geojson";

export type LatLon = { lat: string; lon: string };

export class Node extends OsmObject {
  private latLng: LatLon | undefined;

  constructor(id: string, refElems: RefElements) {
    super("node", id, refElems);
  }

  public setLatLng(latLng: LatLon) {
    this.latLng = latLng;
  }

  public toFeature(): Feature | undefined {
    if (this.latLng) {
      return {
        type: "Feature",
        id: this.getCompositeId(),
        properties: this.getProps(),
        geometry: {
          type: "Point",
          coordinates: strArrayToFloat([this.latLng.lon, this.latLng.lat]),
        },
      };
    }
  }

  public getLatLng(): LatLon | undefined {
    return this.latLng;
  }
}
