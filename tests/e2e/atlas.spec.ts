import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("exploration-atlas:intro-film-played-v1", "true");
    const nativeTimeout = window.setTimeout.bind(window);
    window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) =>
      nativeTimeout(handler, timeout === 4_650 || timeout === 3_000 ? 40 : timeout, ...args)) as typeof window.setTimeout;
  });
});

async function openAtlas(page: Page) {
  await page.getByRole("button", { name: "开启地图" }).click();
  await expect(page.locator(".map-stage")).toBeVisible({ timeout: 7_000 });
}

async function openCartographer(page: Page) {
  const compass = page.getByRole("button", { name: "指南针" });
  await compass.dispatchEvent("pointerdown");
  await page.waitForTimeout(80);
  await compass.dispatchEvent("pointerup");
  await page.locator("input[inputmode='numeric']").fill("2468");
  await page.getByRole("button", { name: "进入" }).click();
  await expect(page.getByRole("heading", { name: "制图人控制台" })).toBeVisible();
}

async function seedProgress(page: Page, databaseName: string, progress: Record<string, unknown>) {
  await page.evaluate(async ({ databaseName, progress }) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(databaseName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const transaction = request.result.transaction("state", "readwrite");
        transaction.objectStore("state").put(progress, "progress");
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }, { databaseName, progress });
}

async function seedPhoto(page: Page, databaseName: string, photo: Record<string, unknown>) {
  await page.evaluate(async ({ databaseName, photo }) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(databaseName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const transaction = request.result.transaction("photos", "readwrite");
        transaction.objectStore("photos").put(photo);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }, { databaseName, photo });
}

function progressAt(checkpointId: string, zoneId: string, overrides: Record<string, unknown> = {}) {
  return {
    activeZoneId: zoneId,
    activeCheckpointId: checkpointId,
    completedCheckpointIds: [],
    photoAttempts: {},
    capturedPhotoIds: [],
    phase: "map",
    zoneStarted: true,
    arrivedCheckpointIds: [],
    economy: { coins: 10, awardedCheckpointIds: [], skippedCheckpointIds: [], purchases: [] },
    ...overrides,
  };
}

test("opens the Beijing invitation and living map", async ({ page }) => {
  await page.goto("/?run=e2e-beijing-intro");
  await expect(page.getByRole("heading", { name: "Exploration Atlas" })).toBeVisible();
  await expect(page.getByText("这是一封只写给一位探索者的北京邀请函。")).toBeVisible();
  await openAtlas(page);
  await expect(page.getByText("第一枚未知坐标")).toBeVisible();
  await expect(page.getByRole("button", { name: "打开商店，金币余额 10" })).toBeVisible();
});

test("arrives at the first outdoor checkpoint after two accurate GPS samples", async ({ page, context, baseURL }) => {
  await context.grantPermissions(["geolocation"], { origin: new URL(baseURL!).origin });
  await context.setGeolocation({ latitude: 39.9092, longitude: 116.3658, accuracy: 16 });
  await page.goto("/?run=e2e-beijing-gps");
  await openAtlas(page);
  await page.getByRole("button", { name: "飞行扫帚已抵达，开始探索" }).click();
  await context.setGeolocation({ latitude: 39.9099773, longitude: 116.3670071, accuracy: 14 });
  await page.waitForTimeout(120);
  await context.setGeolocation({ latitude: 39.9099775, longitude: 116.3670073, accuracy: 13 });
  await expect(page.getByRole("button", { name: "开启照片复刻" })).toBeVisible();
  await expect(page.locator(".quest-card h2")).toContainText("MY TIME LAB");
});

test("buys and restores the paid clue from IndexedDB", async ({ page }) => {
  await page.goto("/?run=e2e-clue-persistence");
  await openAtlas(page);
  await page.getByRole("button", { name: "打开商店，金币余额 10" }).click();
  const clueItem = page.locator(".shop-grid article").filter({ hasText: "本站线索" });
  await clueItem.getByRole("button", { name: "购买 · 10 金币" }).click();
  await expect(page.getByLabel("金币余额 0")).toBeVisible();
  await page.getByRole("button", { name: "关闭" }).click();
  await page.getByRole("button", { name: "查看线索" }).click();
  await expect(page.getByText("进入 MY TIME LAB 后")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "打开商店，金币余额 0" })).toBeVisible();
  await page.getByRole("button", { name: "查看线索" }).click();
  await expect(page.getByText("进入 MY TIME LAB 后")).toBeVisible();
});

test("manual fallback awards once, and GPS-gated skip spends forty without a reward", async ({ page }) => {
  await page.goto("/?run=e2e-economy-skip");
  await openAtlas(page);
  await openCartographer(page);
  await page.getByRole("button", { name: "强制抵达" }).click();
  await openCartographer(page);
  await page.getByRole("button", { name: "强制过关" }).click();
  await expect(page.getByText("任务奖励 +30 金币")).toBeVisible();
  await page.getByRole("button", { name: "带着这一页返回飞行扫帚" }).click();
  await page.getByRole("button", { name: "我已停车，翻开下一页" }).click();

  await page.getByRole("button", { name: "打开商店，金币余额 40" }).click();
  const skipItem = page.locator(".shop-grid article").filter({ hasText: "跳过任务" });
  await expect(skipItem.getByRole("button", { name: "GPS 到达后可用" })).toBeDisabled();
  await page.getByRole("button", { name: "关闭" }).click();
  await openCartographer(page);
  await page.getByRole("button", { name: "强制抵达" }).click();
  await page.getByRole("button", { name: "打开商店，金币余额 40" }).click();
  await skipItem.getByRole("button", { name: "购买 · 40 金币" }).click();
  await expect(page.getByText("已使用跳过任务 · 本站不发金币")).toBeVisible();
  await page.getByRole("button", { name: "寻找下一枚未知坐标" }).click();
  await expect(page.getByRole("button", { name: "打开商店，金币余额 0" })).toBeVisible();
});

test("creates local drink and food vouchers and persists redemption", async ({ page }) => {
  const run = "e2e-local-vouchers";
  await page.goto(`/?run=${run}`);
  await expect(page.getByRole("heading", { name: "Exploration Atlas" })).toBeVisible();
  await page.waitForTimeout(150);
  await seedProgress(page, `exploration-atlas-formal-${run}`, progressAt("my-time-lab", "xidan-time-lab", {
    economy: { coins: 130, awardedCheckpointIds: [], skippedCheckpointIds: [], purchases: [] },
  }));
  await page.reload();
  await page.getByRole("button", { name: "打开商店，金币余额 130" }).click();
  await page.locator(".shop-grid article").filter({ hasText: "奶茶兑换券" }).getByRole("button", { name: "购买 · 50 金币" }).click();
  await page.locator(".shop-grid article").filter({ hasText: "食品兑换券" }).getByRole("button", { name: "购买 · 70 金币" }).click();
  await expect(page.getByLabel("金币余额 10")).toBeVisible();
  const milkVoucher = page.locator(".voucher-list article").filter({ hasText: "奶茶兑换券" });
  await milkVoucher.getByRole("button", { name: "确认已兑换" }).click();
  await expect(milkVoucher.getByRole("button", { name: "已兑换" })).toBeDisabled();
  await page.getByRole("button", { name: "关闭" }).click();
  await page.reload();
  await page.getByRole("button", { name: "打开商店，金币余额 10" }).click();
  await expect(page.locator(".voucher-list article").filter({ hasText: "奶茶兑换券" }).getByRole("button", { name: "已兑换" })).toBeDisabled();
  await expect(page.locator(".voucher-list article").filter({ hasText: "食品兑换券" }).getByRole("button", { name: "确认已兑换" })).toBeEnabled();
});

test("completing Yinding Bridge reveals the free Nino Nina finale at zero coins", async ({ page }) => {
  const run = "e2e-free-finale";
  await page.goto(`/?run=${run}`);
  await expect(page.getByRole("heading", { name: "Exploration Atlas" })).toBeVisible();
  await page.waitForTimeout(150);
  await seedProgress(page, `exploration-atlas-formal-${run}`, progressAt("yinding-bridge", "shichahai-finale", {
    completedCheckpointIds: ["my-time-lab", "maybe-books", "lipi-records"],
    arrivedCheckpointIds: ["yinding-bridge"],
    economy: {
      coins: 0,
      awardedCheckpointIds: ["my-time-lab", "maybe-books", "lipi-records", "yinding-bridge"],
      skippedCheckpointIds: [],
      purchases: [],
    },
  }));
  await page.reload();
  await openCartographer(page);
  await page.getByRole("button", { name: "强制过关" }).click();
  await page.getByRole("button", { name: "揭晓今晚的最后彩蛋" }).click();
  await expect(page.getByRole("heading", { name: "Exploration Completed" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nino Nina 国贸" })).toBeVisible();
  await expect(page.getByText("国贸商城北区七层 · NL7003")).toBeVisible();
  await expect(page.getByText(/不需要金币/)).toBeVisible();
});

test("migrates a valid legacy progress record without an economy object", async ({ page }) => {
  const run = "e2e-legacy-progress";
  await page.goto(`/?run=${run}`);
  await expect(page.getByRole("heading", { name: "Exploration Atlas" })).toBeVisible();
  await page.waitForTimeout(150);
  const legacy = progressAt("my-time-lab", "xidan-time-lab");
  delete (legacy as { economy?: unknown }).economy;
  await seedProgress(page, `exploration-atlas-formal-${run}`, legacy);
  await page.reload();
  await expect(page.getByRole("button", { name: "打开商店，金币余额 10" })).toBeVisible();
  await expect(page.locator(".map-stage")).toBeVisible();
});

test("keeps the cartographer fallback available when location is denied", async ({ page, context, baseURL }) => {
  await context.clearPermissions();
  await page.goto("/?run=e2e-location-denied");
  await openAtlas(page);
  await page.getByRole("button", { name: "飞行扫帚已抵达，开始探索" }).click();
  await expect(page.getByText(/Safari 或 Chrome/)).toBeVisible();
  await openCartographer(page);
  await page.getByRole("button", { name: "强制抵达" }).click();
  await expect(page.getByRole("button", { name: "开启照片复刻" })).toBeVisible();
  expect(new URL(baseURL!).origin).toMatch(/^http:\/\/127\.0\.0\.1:/);
});

test("explains low-accuracy and timeout recovery without blocking the fallback", async ({ page, context, baseURL }) => {
  await context.grantPermissions(["geolocation"], { origin: new URL(baseURL!).origin });
  await context.setGeolocation({ latitude: 39.9099773, longitude: 116.3670071, accuracy: 300 });
  await page.goto("/?run=e2e-location-imprecise");
  await openAtlas(page);
  await page.getByRole("button", { name: "飞行扫帚已抵达，开始探索" }).click();
  await expect(page.getByText(/当前定位精度约 ±300 米/)).toBeVisible();
  await openCartographer(page);
  await expect(page.getByRole("button", { name: "强制抵达" })).toBeEnabled();

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        clearWatch: () => undefined,
        watchPosition: (_success: PositionCallback, error: PositionErrorCallback) => {
          window.setTimeout(() => error({ code: 3, message: "timeout", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 }), 0);
          return 1;
        },
      },
    });
  });
  await page.goto("/?run=e2e-location-timeout");
  await openAtlas(page);
  await page.getByRole("button", { name: "飞行扫帚已抵达，开始探索" }).click();
  await expect(page.getByText(/定位请求已超时/)).toBeVisible();
  await expect(page.getByText(/制图人暗门/)).toBeVisible();
});

test("restores task state, coins, purchases and photos after refresh", async ({ page }) => {
  const run = "e2e-complete-local-restore";
  const databaseName = `exploration-atlas-formal-${run}`;
  await page.goto(`/?run=${run}`);
  await expect(page.getByRole("heading", { name: "Exploration Atlas" })).toBeVisible();
  await page.waitForTimeout(150);
  await seedProgress(page, databaseName, progressAt("maybe-books", "dongsi-pages-and-records", {
    completedCheckpointIds: ["my-time-lab"],
    capturedPhotoIds: ["photo-one"],
    photoAttempts: { "my-time-lab": 1 },
    economy: {
      coins: 30,
      awardedCheckpointIds: ["my-time-lab"],
      skippedCheckpointIds: [],
      purchases: [{ id: "clue-one", itemId: "clue", kind: "clue", targetCheckpointId: "maybe-books", purchasedAt: 1 }],
    },
  }));
  await seedPhoto(page, databaseName, {
    id: "photo-one",
    checkpointId: "my-time-lab",
    dataUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2'/%3E",
    score: 88,
    createdAt: 1,
  });
  await page.reload();
  await expect(page.getByRole("button", { name: "打开商店，金币余额 30" })).toBeVisible();
  await expect(page.locator(".quest-card h2")).toContainText("第二枚未知坐标");
  await expect(page.getByRole("img", { name: "探索复刻照片" })).toBeVisible();
  await page.getByRole("button", { name: "查看线索" }).click();
  await expect(page.getByText("在店里找一本仅凭书名")).toBeVisible();
});

test("isolates formal progress from Demo mode for the same run id", async ({ page }) => {
  const run = "e2e-mode-isolation";
  await page.goto(`/?run=${run}`);
  await expect(page.getByRole("heading", { name: "Exploration Atlas" })).toBeVisible();
  await page.waitForTimeout(150);
  await seedProgress(page, `exploration-atlas-formal-${run}`, progressAt("my-time-lab", "xidan-time-lab", {
    economy: { coins: 77, awardedCheckpointIds: [], skippedCheckpointIds: [], purchases: [] },
  }));
  await page.reload();
  await expect(page.getByRole("button", { name: "打开商店，金币余额 77" })).toBeVisible();

  await page.goto(`/?mode=demo&run=${run}`);
  await expect(page.getByRole("heading", { name: "Exploration Atlas" })).toBeVisible();
  await expect(page.getByRole("button", { name: "打开商店，金币余额 10" })).toBeVisible();

  await page.goto(`/?run=${run}`);
  await expect(page.getByRole("button", { name: "打开商店，金币余额 77" })).toBeVisible();
});

test("builds an installable offline shell without changing the service-worker flow", async ({ page, context }) => {
  await page.goto("/?run=e2e-offline-shell");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Exploration Atlas" })).toBeVisible();
  const cacheCount = await page.evaluate(async () => (await caches.keys()).length);
  expect(cacheCount).toBeGreaterThan(0);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Exploration Atlas" })).toBeVisible();
});

test("keeps the map usable with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?mode=fulltest&run=e2e-reduced-motion");
  await openAtlas(page);
  await expect(page.locator(".theme-ambient")).toHaveCSS("display", "none");
  await expect(page.getByRole("button", { name: "飞行扫帚已抵达，开始探索" })).toBeEnabled();
});
