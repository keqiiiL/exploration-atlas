import { describe, expect, it } from "vitest";
import { experienceConfig } from "@/src/config/experience";
import { fullTestZones } from "@/src/config/fullTestStory";
import { fogMessages, initialProgress, zones } from "@/src/config/story";
import { haversineDistance, projectPositionToMap } from "@/src/lib/geo";

describe("formal Beijing story route", () => {
  it("uses four tasks across three maps in the confirmed order", () => {
    expect(zones).toHaveLength(3);
    expect(fogMessages).toHaveLength(2);
    expect(zones.map((zone) => zone.checkpoints.length)).toEqual([1, 2, 1]);
    expect(zones.flatMap((zone) => zone.checkpoints).map((item) => item.label)).toEqual([
      "MY TIME LAB",
      "可能有书",
      "莱蒎黑胶唱片 Lipi Records",
      "什刹海 · 银锭桥",
    ]);
  });

  it("uses public outdoor arrival areas instead of indoor shop coordinates", () => {
    expect(zones.map((zone) => zone.parkingLabel)).toEqual([
      "西单大悦城北侧公共入口",
      "前炒面胡同西口 · 东四南大街公共区域",
      "烟袋斜街东侧公共区域",
    ]);
    expect(zones[2].checkpoints[0]).toMatchObject({
      id: "yinding-bridge",
      unlockRadiusM: 55,
      location: { latitude: 39.937595528, longitude: 116.387090842 },
    });
  });

  it("keeps WGS-84 routes, north-up bounds and checkpoint anchors registered", () => {
    for (const zone of zones) {
      expect(zone.coordinateSystem).toBe("wgs84");
      expect(zone.mapOrientation).toBe("north-up");
      expect(zone.mapBounds).toBeDefined();
      expect(zone.mapRoutePoints).toHaveLength(zone.routeGeo.length);
      expect(zone.routeGeo.at(-1)).toEqual(zone.checkpoints.at(-1)?.location);
      for (const checkpoint of zone.checkpoints) {
        const anchorIndex = zone.routeGeo.findIndex(
          (anchor) => haversineDistance(anchor, checkpoint.location) < 0.5,
        );
        expect(anchorIndex).toBeGreaterThanOrEqual(0);
        const projected = projectPositionToMap(checkpoint.location, zone, checkpoint);
        expect(projected.x).toBeCloseTo(checkpoint.mapPoint.x, 0);
        expect(projected.y).toBeCloseTo(checkpoint.mapPoint.y, 0);
        expect(checkpoint.mapPoint).toEqual(zone.mapRoutePoints![anchorIndex]);
      }
    }
  });

  it("keeps the two Dongsi stops on one walkable map", () => {
    expect(zones[1].checkpoints.map((item) => item.id)).toEqual(["maybe-books", "lipi-records"]);
    expect(haversineDistance(zones[1].checkpoints[0].location, zones[1].checkpoints[1].location))
      .toBeLessThan(800);
  });

  it("gives every normal task thirty coins and a paid clue", () => {
    for (const checkpoint of zones.flatMap((zone) => zone.checkpoints)) {
      expect(checkpoint.coinReward).toBe(30);
      expect(checkpoint.paidClue.length).toBeGreaterThan(10);
      expect(checkpoint.passScore).toBe(55);
    }
  });

  it("ships the confirmed economy prices and free dinner finale", () => {
    expect(initialProgress.economy.coins).toBe(10);
    expect(experienceConfig.economy.shopItems.map(({ kind, price }) => ({ kind, price }))).toEqual([
      { kind: "clue", price: 10 },
      { kind: "skip-task", price: 40 },
      { kind: "milk-tea", price: 50 },
      { kind: "food", price: 70 },
    ]);
    expect(experienceConfig.finale.destination.name).toBe("Nino Nina 国贸");
    expect(experienceConfig.finale.destination.note).toContain("不需要金币");
  });

  it("keeps every goal clear of the collapsed left quest panel", () => {
    for (const checkpoint of zones.flatMap((zone) => zone.checkpoints)) {
      expect(checkpoint.mapPoint.x).toBeGreaterThanOrEqual(260);
    }
  });
});

describe("isolated full-test story route", () => {
  it("mirrors the formal route without sharing identifiers", () => {
    expect(fullTestZones).toHaveLength(3);
    expect(fullTestZones.flatMap((zone) => zone.checkpoints).map((item) => item.giftType))
      .toEqual(["sparkle", "scent", "sound", "motion"]);
    expect(fullTestZones.every((zone) => zone.id.startsWith("fulltest-"))).toBe(true);
    expect(fullTestZones.flatMap((zone) => zone.checkpoints).every((item) => item.id.startsWith("fulltest-")))
      .toBe(true);
  });
});
