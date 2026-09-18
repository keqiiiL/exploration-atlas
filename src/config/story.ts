import { experienceConfig } from "@/src/config/experience";
import type { ExplorationZone, StoryProgress } from "@/src/types";

// Browser Geolocation reports WGS-84. Public entrances are used as GPS targets
// so indoor positioning inside a mall or shop never becomes a completion gate.
const xidanZone: ExplorationZone = {
  id: "xidan-time-lab",
  order: 1,
  title: "Xidan · Time Laboratory",
  subtitle: "西单大悦城 · 第一枚时间坐标",
  mysteryTitle: "BEIJING CHAPTER · THE FIRST HOUR",
  mysterySubtitle: "从一件代表今天的物品开始",
  parkingLabel: "西单大悦城北侧公共入口",
  parkingMapPoint: { x: 262.9, y: 280 },
  center: { latitude: 39.9095, longitude: 116.3667 },
  coordinateSystem: "wgs84",
  routeGeo: [
    { latitude: 39.9092, longitude: 116.3658 },
    { latitude: 39.9094978173, longitude: 116.366736095 },
  ],
  mapRoutePoints: [{ x: 262.9, y: 280 }, { x: 369.8, y: 250.2 }],
  svgPath: "M262.9 280 L369.8 250.2",
  maxLocationAccuracyM: 120,
  accent: "#72513b",
  mapKind: "city",
  mapOrientation: "north-up",
  mapBounds: { north: 39.912, south: 39.907, west: 116.3635, east: 116.3705 },
  checkpoints: [{
    id: "my-time-lab",
    label: "MY TIME LAB",
    mysteryTitle: "第一枚未知坐标",
    mysteryLabel: "时间正在西单等待",
    storyBeat: "为今天挑出一件最像你的物品。",
    giftType: "sparkle",
    location: { latitude: 39.9094978173, longitude: 116.366736095 },
    unlockRadiusM: 45,
    referenceImage: "/references/sparkle.svg",
    matchMode: "scene-only",
    passScore: 55,
    clue: "先抵达西单大悦城的公共入口，第一项照片任务才会完整显影。",
    paidClue: "进入 MY TIME LAB 后，找到一件最能代表今天心情或风格的物品，让它成为照片里的主角。",
    coinReward: 30,
    revealLabel: "时间标本",
    unlockCopy: "第一枚坐标已经收好。今天被你选中的这一件，会替这一刻保存时间。",
    photoPrompt: "拍下一件最能代表今天的物品；照片只保存在当前设备。",
    mapPoint: { x: 369.8, y: 250.2 },
  }],
};

const dongsiZone: ExplorationZone = {
  id: "dongsi-pages-and-records",
  order: 2,
  title: "Dongsi · Pages & Records",
  subtitle: "前炒面胡同至隆福寺 · 书页与唱针",
  mysteryTitle: "BEIJING CHAPTER · INK & VINYL",
  mysterySubtitle: "两枚坐标藏在东四的胡同里",
  parkingLabel: "前炒面胡同西口 · 东四南大街公共区域",
  parkingMapPoint: { x: 487.3, y: 426.8 },
  center: { latitude: 39.9211, longitude: 116.4099 },
  coordinateSystem: "wgs84",
  routeGeo: [
    { latitude: 39.9182, longitude: 116.41035 },
    { latitude: 39.91855, longitude: 116.41075 },
    { latitude: 39.9213, longitude: 116.4103 },
    { latitude: 39.9236868403, longitude: 116.409022591 },
  ],
  mapRoutePoints: [
    { x: 487.3, y: 426.8 },
    { x: 545.5, y: 405.5 },
    { x: 480, y: 237.8 },
    { x: 294.2, y: 92.3 },
  ],
  svgPath: "M487.3 426.8 L545.5 405.5 L480 237.8 L294.2 92.3",
  maxLocationAccuracyM: 120,
  accent: "#4c5636",
  mapKind: "vinyl",
  mapOrientation: "north-up",
  mapBounds: { north: 39.9252, south: 39.917, west: 116.407, east: 116.4125 },
  checkpoints: [
    {
      id: "maybe-books",
      label: "可能有书",
      mysteryTitle: "第二枚未知坐标",
      mysteryLabel: "答案夹在胡同的书页里",
      storyBeat: "从一本书里带走今天的关键词。",
      giftType: "scent",
      location: { latitude: 39.91855, longitude: 116.41075 },
      unlockRadiusM: 45,
      referenceImage: "/references/scent.svg",
      matchMode: "scene-only",
      passScore: 55,
      clue: "从东四南大街走进前炒面胡同，留意临街青砖灰瓦的小院入口。",
      paidClue: "在店里找一本仅凭书名就愿意带进下一年的书，把封面与手中的一角一起拍下。",
      coinReward: 30,
      revealLabel: "可能书页",
      unlockCopy: "第二枚坐标被夹进书页。答案不必唯一，只要这是你此刻愿意相信的可能。",
      photoPrompt: "拍下一本由你选中的书；请避开其他顾客的正脸。",
      mapPoint: { x: 545.5, y: 405.5 },
    },
    {
      id: "lipi-records",
      label: "莱蒎黑胶唱片 Lipi Records",
      mysteryTitle: "第三枚未知坐标",
      mysteryLabel: "唱针正在隆福寺等待落下",
      storyBeat: "为今天选一张应该响起的唱片。",
      giftType: "sound",
      location: { latitude: 39.9236868403, longitude: 116.409022591 },
      unlockRadiusM: 50,
      referenceImage: "/references/sound.svg",
      matchMode: "scene-only",
      passScore: 55,
      clue: "沿东四向北，寻找隆福寺二期东院的户外公共入口。",
      paidClue: "进入莱蒎后，在唱片封面中找一张最像今天背景音乐的，让封面完整出现在照片里。",
      coinReward: 30,
      revealLabel: "今日唱片",
      unlockCopy: "第三枚坐标开始旋转。多年以后再听见相似的旋律，也许会想起今天的北京。",
      photoPrompt: "拍下今天选中的一张黑胶唱片或唱片陈列。",
      mapPoint: { x: 294.2, y: 92.3 },
    },
  ],
};

const shichahaiZone: ExplorationZone = {
  id: "shichahai-finale",
  order: 3,
  title: "Shichahai · Final Reflection",
  subtitle: "银锭桥 · 正式路线的最后一页",
  mysteryTitle: "BEIJING CHAPTER · THE LAST BRIDGE",
  mysterySubtitle: "最后一枚坐标在水面与胡同之间",
  parkingLabel: "烟袋斜街东侧公共区域",
  parkingMapPoint: { x: 765.7, y: 108.3 },
  center: { latitude: 39.9384, longitude: 116.3888 },
  coordinateSystem: "wgs84",
  routeGeo: [
    { latitude: 39.9392, longitude: 116.3902 },
    { latitude: 39.9384, longitude: 116.389 },
    { latitude: 39.937595528, longitude: 116.387090842 },
  ],
  mapRoutePoints: [{ x: 765.7, y: 108.3 }, { x: 628.6, y: 175 }, { x: 410.4, y: 242 }],
  svgPath: "M765.7 108.3 L628.6 175 L410.4 242",
  maxLocationAccuracyM: 120,
  accent: "#274554",
  mapKind: "garden",
  mapOrientation: "north-up",
  mapBounds: { north: 39.9405, south: 39.9345, west: 116.3835, east: 116.3905 },
  checkpoints: [{
    id: "yinding-bridge",
    label: "什刹海 · 银锭桥",
    mysteryTitle: "第四枚未知坐标",
    mysteryLabel: "桥上的风正在翻动最后一页",
    storyBeat: "在前海与后海交接处，为这段路线留下收官照片。",
    giftType: "motion",
    location: { latitude: 39.937595528, longitude: 116.387090842 },
    unlockRadiusM: 55,
    referenceImage: "/references/motion.svg",
    matchMode: "pose-scene",
    passScore: 55,
    clue: "终点位于前海与后海交接处的银锭桥，GPS 点设在桥面户外公共区域。",
    paidClue: "站在不妨碍通行的位置，让桥、水面或胡同天际线进入画面，完成今天的最后一张照片。",
    coinReward: 30,
    revealLabel: "最后一桥",
    unlockCopy: "第四枚坐标已经抵达。正式任务到此完成，下一页不需要金币，也不再需要寻找。",
    photoPrompt: "在银锭桥公共区域拍下路线收官照片；请注意行人和通行安全。",
    mapPoint: { x: 410.4, y: 242 },
  }],
};

export const zones: ExplorationZone[] = [xidanZone, dongsiZone, shichahaiZone];

export const initialProgress: StoryProgress = {
  activeZoneId: zones[0].id,
  activeCheckpointId: zones[0].checkpoints[0].id,
  completedCheckpointIds: [],
  photoAttempts: {},
  capturedPhotoIds: [],
  phase: "intro",
  zoneStarted: false,
  arrivedCheckpointIds: [],
  economy: {
    coins: experienceConfig.economy.initialCoins,
    awardedCheckpointIds: [],
    skippedCheckpointIds: [],
    purchases: [],
  },
};

export const fogMessages = [
  "第一枚时间坐标已经收好。下一页在东四的胡同里，书页与唱针会先后显影。",
  "书页和唱片已经收好。请前往什刹海，让银锭桥翻开正式路线的最后一页。",
];

export function findZone(id: string) {
  return zones.find((zone) => zone.id === id) ?? zones[0];
}

export function findCheckpoint(id: string) {
  for (const zone of zones) {
    const checkpoint = zone.checkpoints.find((item) => item.id === id);
    if (checkpoint) return { checkpoint, zone };
  }
  return { checkpoint: zones[0].checkpoints[0], zone: zones[0] };
}
