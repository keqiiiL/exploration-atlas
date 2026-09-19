import { describe, expect, it } from "vitest";
import { geolocationErrorMessage } from "@/src/hooks/useGeolocation";

describe("mobile geolocation recovery copy", () => {
  it("gives browser-neutral permission recovery steps", () => {
    expect(geolocationErrorMessage(1)).toContain("Safari 或 Chrome");
    expect(geolocationErrorMessage(1)).toContain("网站设置");
  });

  it("distinguishes timeout from a generic unavailable position", () => {
    expect(geolocationErrorMessage(3)).toContain("已超时");
    expect(geolocationErrorMessage(3)).toContain("精确定位");
    expect(geolocationErrorMessage(2)).toContain("制图人暗门");
  });
});
