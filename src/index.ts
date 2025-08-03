import { RefElements } from "./ref-elements.js";
import type { Feature, FeatureCollection, GeometryObject } from "geojson";
import analyzeFeaturesFromJson from "./json.js";
import analyzeFeaturesFromXml from "./xml.js";

interface IOptions {
  /**
   * An OSM element ID in the form of type/id, eg: way/123 to create a GeoJSON representation of.
   * If not present, all tagged objects will be converted.
   * @default undefined
   */
  elementId?: string | undefined;
}

function parseOptions(options: IOptions | undefined): {
  elementId: string | undefined;
} {
  if (!options) {
    return { elementId: undefined };
  }
  let elementId = options.elementId;
  return { elementId };
}

function detectFormat(
  o: string | { [k: string]: any },
): "json" | "xml" | "json-raw" | "invalid" {
  if ((o as { [k: string]: any }).elements) {
    return "json";
  }
  if (o.indexOf("<osm") >= 0) {
    return "xml";
  }
  if (o.trim().startsWith("{")) {
    return "json-raw";
  }
  return "invalid";
}

function osm2geojson(
  osm: string | { [k: string]: any },
  opts?: IOptions,
): FeatureCollection<GeometryObject> | Feature<any, any> | undefined {
  let { elementId } = parseOptions(opts);

  let format = detectFormat(osm);

  const refElements = new RefElements();
  if (format === "json-raw") {
    osm = JSON.parse(osm as string) as { [k: string]: any };
    if ((osm as { [k: string]: any }).elements) {
      format = "json";
    } else {
      format = "invalid";
    }
  }

  if (format === "json") {
    analyzeFeaturesFromJson(osm as { [k: string]: any }, refElements);
  } else if (format === "xml") {
    analyzeFeaturesFromXml(osm as string, refElements);
  }

  refElements.bindAll();

  let featureArray: Feature<any, any>[] = [];

  if (elementId) {
    //return refElements.get(elementId)?.toFeature();
    const feature = refElements.get(elementId)?.toFeature();
    if (feature) {
      featureArray.push(feature);
    }
  } else {

  for (const v of refElements.values()) {
    if (v.refCount > 0 && !v.hasTag) {
      continue;
    }
    const feature = v.toFeature();
    if (feature) {
      featureArray.push(feature);
    }
  }
}

  return { type: "FeatureCollection", features: featureArray };
}

export default osm2geojson;
