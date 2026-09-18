/**
 * Public, non-personal defaults for the open-source template.
 *
 * Customizers normally edit this file first, then replace the route and
 * checkpoint data in `story.ts`. Optional media stays disabled until the
 * matching files have been added under `public/custom/`.
 */
export const experienceConfig = {
  recipientName: "探索者",
  deliveryLabel: "PRIVATE DELIVERY · TO THE EXPLORER",
  publicDemo: {
    // Keep this on in the open-source template so first-time visitors can
    // preview the whole journey without travelling to the example locations.
    // Turn it off for the recipient-facing private deployment.
    enabled: true,
  },
  chapter: {
    from: "PAST",
    to: "NEXT",
    transition: "PAST → NEXT",
    lastPage: "THE LAST PAGE OF THE PAST",
  },
  opening: {
    lead: "这是一封只写给一位探索者的北京邀请函。",
    lines: [
      "四枚坐标散落在北京，从西单的时间实验室一路延伸到什刹海。",
      "打开蜡封，让今天的路线在你脚下逐页显影。",
    ],
    edition: "BEIJING · PRIVATE EDITION",
  },
  economy: {
    initialCoins: 10,
    shopItems: [
      { id: "current-clue", kind: "clue", name: "本站线索", description: "揭开当前任务的一条额外提示。", price: 10 },
      { id: "skip-current", kind: "skip-task", name: "跳过任务", description: "仅在 GPS 到达后可用；跳过后不发本站金币。", price: 40 },
      { id: "milk-tea-voucher", kind: "milk-tea", name: "奶茶兑换券", description: "购买后生成保存在本机的兑换券。", price: 50 },
      { id: "food-voucher", kind: "food", name: "食品兑换券", description: "购买后生成保存在本机的兑换券。", price: 70 },
    ],
  },
  finale: {
    transition: "THE PAST HAS BEEN KEPT · A NEW CHAPTER BEGINS",
    lines: [
      "过去一岁的故事，已经被好好收藏。",
      "现在，请翻开新一岁的第一章，今年的主题是探索。",
      "无论走到哪里，都愿你保有发现世界的好奇与被爱包围的勇气。",
    ],
    signature: "Happy Birthday, Explorer.",
    continueLabel: "翻开新一岁的第一章",
    destination: {
      name: "Nino Nina 国贸",
      address: "国贸商城北区七层 · NL7003",
      note: "最终晚饭彩蛋已解锁，不需要金币，也不需要再次定位。",
    },
  },
  optionalMedia: {
    introFilm: {
      enabled: false,
      src: "/custom/intro-film.mp4",
      poster: "/custom/intro-film-poster.jpg",
      lastFrame: "/custom/intro-film-last-frame.jpg",
      deliveryLabel: "PRIVATE DELIVERY · BIRTHDAY EXPLORATION",
    },
    backgroundMusic: {
      enabled: false,
      src: "/custom/background-music.mp3",
      volume: 0.48,
    },
  },
  cartographer: {
    enabled: true,
    // This is an event fallback, not a security boundary: static-site visitors
    // can inspect bundled source. Change it for each private deployment.
    pin: "2468",
  },
} as const;
