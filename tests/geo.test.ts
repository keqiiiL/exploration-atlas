import { describe, expect, it } from "vitest";
import {
  bearingDegrees,
  haversineDistance,
  holdLastReliablePosition,
  isInsideCheckpoint,
  matchPositionToRoute,
  medianSample,
  projectHeadingToMap,
  projectLocationToBounds,
  projectPositionToMap,
  smoothPositionSample,
} from "../src/lib/geo";
import { gcj02ToWgs84Approx, wgs84ToGcj02 } from "../src/lib/coordinateTransform";
import { zones } from "../src/config/story";

describe("geographic matching", () => {
  const route = [
    { latitude: 39.92, longitude: 116.408 },
    { latitude: 39.92, longitude: 116.409 },
    { latitude: 39.92, longitude: 116.41 },
  ];

  it("computes useful meter distances", () => {
    const distance = haversineDistance(route[0], route[1]);
    expect(distance).toBeGreaterThan(80);
    expect(distance).toBeLessThan(90);
  });

  it("snaps a nearby position to route progress", () => {
    const match = matchPositionToRoute(
      { latitude: 39.92002, longitude: 116.409 },
      route,
      route[2],
    );
    expect(match.progress).toBeGreaterThan(0.45);
    expect(match.progress).toBeLessThan(0.55);
    expect(match.distanceFromRouteM).toBeLessThan(4);
  });

  it("uses median values to suppress a location spike", () => {
    const sample = medianSample([
      { latitude: 39.92, longitude: 116.41, accuracy: 20, timestamp: 1 },
      { latitude: 31.5, longitude: 121, accuracy: 900, timestamp: 2 },
      { latitude: 39.9201, longitude: 116.4101, accuracy: 22, timestamp: 3 },
    ]);
    expect(sample?.latitude).toBeCloseTo(39.92);
    expect(sample?.accuracy).toBe(22);
  });

  it("keeps a geofence tight while allowing only the existing accuracy edge", () => {
    expect(isInsideCheckpoint(54, 80, 45)).toBe(true);
    expect(isInsideCheckpoint(56, 80, 45)).toBe(false);
    expect(isInsideCheckpoint(0, 500, 45, 120)).toBe(false);
    expect(isInsideCheckpoint(0, Number.NaN, 45, 120)).toBe(false);
  });

  it("derives a geographic walking direction when GPS has no compass heading", () => {
    expect(bearingDegrees(route[0], route[1])).toBeCloseTo(90, 1);
    expect(bearingDegrees(route[0], { latitude: route[0].latitude + 0.001, longitude: route[0].longitude }))
      .toBeCloseTo(0, 1);
  });

  it("freezes at the last reliable coordinate when a coarse sample arrives", () => {
    const previous = { latitude: 39.92, longitude: 116.41, accuracy: 24, timestamp: 1 };
    const held = holdLastReliablePosition(previous, {
      latitude: 39.8,
      longitude: 116.2,
      accuracy: 500,
      timestamp: 2,
    });
    expect(held).toMatchObject({ latitude: previous.latitude, longitude: previous.longitude, accuracy: 500 });
    expect(holdLastReliablePosition(null, { ...previous, accuracy: 500 })).toBeNull();
  });

  it("projects every registered WGS route anchor onto its north-up map", () => {
    for (const zone of zones) {
      expect(zone.coordinateSystem).toBe("wgs84");
      expect(zone.mapRoutePoints).toHaveLength(zone.routeGeo.length);
      for (let index = 0; index < zone.routeGeo.length; index += 1) {
        const point = projectPositionToMap(zone.routeGeo[index], zone, zone.checkpoints[0]);
        expect(point.x).toBeCloseTo(zone.mapRoutePoints![index].x, 0);
        expect(point.y).toBeCloseTo(zone.mapRoutePoints![index].y, 0);
      }
    }
  });

  it("contains far samples inside the visible map", () => {
    for (const zone of zones) {
      const point = projectPositionToMap(
        { latitude: zone.center.latitude + 0.2, longitude: zone.center.longitude + 0.2 },
        zone,
        zone.checkpoints[0],
      );
      expect(point.x).toBeGreaterThanOrEqual(10);
      expect(point.x).toBeLessThanOrEqual(790);
      expect(point.y).toBeGreaterThanOrEqual(10);
      expect(point.y).toBeLessThanOrEqual(490);
    }
  });

  it("keeps compass bearings literal on every north-up formal map", () => {
    for (const zone of zones) {
      const checkpoint = zone.checkpoints[0];
      for (const heading of [0, 90, 180, 270]) {
        expect(projectHeadingToMap(zone.routeGeo[0], heading, zone, checkpoint)).toBe(heading);
      }
    }
  });

  it("aligns checkpoint map points to geographic bounds", () => {
    for (const zone of zones) {
      for (const checkpoint of zone.checkpoints) {
        const point = projectLocationToBounds(checkpoint.location, zone.mapBounds!);
        expect(point.x).toBeCloseTo(checkpoint.mapPoint.x, 0);
        expect(point.y).toBeCloseTo(checkpoint.mapPoint.y, 0);
      }
    }
  });

  it("responds immediately to meaningful movement", () => {
    const previous = { latitude: 39.92, longitude: 116.41, accuracy: 35, timestamp: 1, heading: 180 };
    const next = { latitude: 39.9202, longitude: 116.41, accuracy: 35, timestamp: 2 };
    const smoothed = smoothPositionSample(previous, next);
    expect(smoothed.latitude).toBe(next.latitude);
    expect(smoothed.heading).toBe(180);
  });
});

describe("offline coordinate preparation", () => {
  it("keeps converted AMap public entrance points in WGS-84", () => {
    const fixtures = [
      { gcj: { latitude: 39.911356, longitude: 116.373222 }, configured: zones[0].checkpoints[0].location },
      { gcj: { latitude: 39.925088, longitude: 116.415263 }, configured: zones[1].checkpoints[1].location },
      { gcj: { latitude: 39.938999, longitude: 116.393337 }, configured: zones[2].checkpoints[0].location },
    ];
    for (const fixture of fixtures) {
      expect(haversineDistance(gcj02ToWgs84Approx(fixture.gcj), fixture.configured)).toBeLessThan(2);
      expect(haversineDistance(wgs84ToGcj02(fixture.configured), fixture.gcj)).toBeLessThan(2);
    }
  });

  it("keeps the two Dongsi checkpoints within a single walking map", () => {
    const [books, records] = zones[1].checkpoints;
    const distance = haversineDistance(books.location, records.location);
    expect(distance).toBeGreaterThan(500);
    expect(distance).toBeLessThan(800);
  });
});
