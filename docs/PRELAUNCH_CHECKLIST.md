# 北京单人 Exploration Atlas 上线前检查

本页记录第三阶段的自动验证结论。它不替代四个地点的现场实测；运行时 GPS、地图投影、IndexedDB 和 PWA 架构均保持原样。

## 正式触发点

浏览器定位使用 WGS-84。公开地图坐标如来自高德（GCJ-02），已离线换算并由测试锁定。

| 任务点 | WGS-84 触发点 | 建议半径 | 入口依据 |
| --- | --- | ---: | --- |
| MY TIME LAB | `39.9099772968, 116.3670070808` | 55 m | 西单大悦城北侧公开入口；不把室内店铺定位作为完成条件 |
| 可能有书 | `39.91855, 116.41075` | 50 m | 前炒面胡同 49 号临街小院入口 |
| Lipi Records | `39.9236868403, 116.409022591` | 55 m | 隆福寺二期东院户外公共入口 |
| 银锭桥 | `39.937595528, 116.387090842` | 60 m | 前海与后海交接处的桥面公共区域 |

当前判定仍要求定位精度不差于 120 米、连续两次样本进入围栏；精度边缘只允许原算法最多增加 10 米。建议半径考虑了建筑遮挡、胡同和水边的手机漂移，但不会覆盖相邻街区。

坐标复核来源：

- [西单大悦城（高德地图）](https://ditu.amap.com/place/B000A80NIV)
- [西单大悦城官方项目页](https://www.grandjoy.com/detail/346.html)
- [可能有书（北京市文化和旅游局）](https://lyzz.visitbeijing.com.cn/news/detail?id=24837)
- [隆福寺二期（高德地图）](https://ditu.amap.com/place/B0LGTXW0Y8)
- [银锭桥（高德地图）](https://ditu.amap.com/place/B000A88CJ3)

## 手机首次打开

1. 用 HTTPS 正式地址打开，保持联网，横屏使用；先等待首页和离线资源加载完成。
2. 点击“开启地图”，到第一站后再点击“开始探索”。浏览器弹出位置请求时选择允许，并打开系统“精确位置”。
3. iPhone Safari 可在页面菜单的“网站设置”中检查“位置”；iPhone Chrome 同时需要系统中 Chrome 的位置权限和网页提示许可。
4. 在每站室外入口停留片刻，等两个可靠定位样本。若显示低精度，走到开阔处后重试。
5. 第一次完整加载并看到地图后，可添加到主屏幕。之后断网重开时，已缓存的页面、地图与本机进度仍可用；GPS 本身不要求蜂窝数据，但设备定位速度可能受环境影响。

## 自动验证范围

- 单元测试锁定四站顺序、WGS-84 坐标、建议半径、地图锚点、金币与商品价格。
- 浏览器场景覆盖金币/线索/兑换券恢复、GPS 到站前禁止跳过、跳过不发金币、零金币解锁最终彩蛋、Nino Nina 揭晓、拒绝定位时的制图人兜底。
- 生产构建检查 manifest、service worker、照片模型、参考图和三组北京地图资源均进入离线缓存。
- 正式模式使用 `formal-*` IndexedDB 命名空间；Demo 使用 `fulltest-demo-*`，互不读取。

## 已知限制与部署前动作

- 四个坐标均为公开资料的桌面复核，尚未在现场以目标手机实测；正式出发前仍应逐点做一次短距离 GPS 烟雾测试。
- iOS 可能因系统节电、精确位置关闭、建筑遮挡或首次冷启动而返回低精度/超时；页面会冻结在最后可靠坐标，并提供重试与制图人暗门。
- PWA 首次访问必须联网；离线能力要在 service worker 完成安装后才成立。照片和进度只保存在当前浏览器本机，清除网站数据或卸载 PWA 会丢失。
- 部署必须使用 HTTPS，并用正式域名在 iPhone Safari、iPhone Chrome 和一台 Android Chrome 各完成一次权限、刷新恢复、离线重开测试。
- 当前 macOS 自动化环境若无法启动 Playwright WebKit，应记录为宿主环境限制；不得为规避该限制重构应用。

浏览器权限参考：[Apple Safari 网站权限](https://support.apple.com/guide/iphone/browse-the-web-privately-iphb01fc3c85/ios)、[Google iPhone/iPad 定位权限](https://support.google.com/legal/answer/179386?co=GENIE.Platform%3DiOS&hl=zh-Hans)、[MDN Geolocation `watchPosition`](https://developer.mozilla.org/docs/Web/API/Geolocation/watchPosition)。
