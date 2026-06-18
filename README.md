# 窝瓜弹弹乐

一个纯前端 Canvas 弹射清怪小游戏。玩家拖拽窝瓜蓄力，松手后反方向发射，在有限次数内通过反弹、炸弹桶、弹簧墙、传送门、风道和尖刺墙清除所有怪物。

## 功能

- PC 鼠标和手机触屏统一使用 Pointer Events。
- 竖屏 9:16 游戏区域，最大宽度 480px。
- 主界面包含开始游戏、选择关卡、地形怪物图鉴。
- 主界面新增技能加点，可选择弹力训练、地形改造、分裂窝瓜、强力蓄力、爆破共鸣和荆棘护盾。
- 35 个内置关卡。
- 第 6-35 关提供路线提示按钮，后续关卡逐步组合弹簧、移动弹簧、尖刺墙、炸弹、木箱、巡逻怪、传送门和风道。
- 关卡选择卡片展示每关核心机制，每页展示 8 个关卡并支持上一页/下一页切换。
- 地形怪物图鉴说明普通怪、头盔怪、巡逻怪、木箱、炸弹桶、弹簧墙、移动弹簧、尖刺墙、传送门、风道、边界反弹和技能。
- 尖刺风道加入卡住保护：主窝瓜反复被风吹回尖刺时会自动结束当前尝试。
- 瞄准线、力度条、粒子、屏幕震动、受击文字。
- 使用 `assets/wogua.png` 作为窝瓜主角，绿色主体保持原色，白色背景已扣成透明。
- 支持 PWA 安装到手机桌面，提供离线缓存和独立窗口启动。

## 本地运行

直接打开 `index.html` 即可。为了让图片资产和 Canvas 处理更接近线上环境，也可以启动静态服务：

```bash
npm run start
```

然后访问 `http://localhost:4173`。

## 手机安装

目前仓库没有独立 APK 文件。推荐使用 PWA 方式安装，但 PWA 需要先部署到 HTTPS 站点：

1. 将项目部署到 GitHub Pages、Vercel、Netlify 或其他 HTTPS 静态网站。
2. Android Chrome：点右上角菜单，选择“添加到主屏幕”或“安装应用”。
3. iPhone Safari：点分享按钮，选择“添加到主屏幕”。

如果仓库保持 public 并开启 GitHub Pages，默认地址会是 `https://bry-zczh.github.io/wogua-bounce/`。

本地手机预览可以让手机和电脑连接同一个 Wi-Fi，在电脑上运行 `npm run start`，然后用手机打开 `http://电脑局域网IP:4173`。这种方式适合测试，但不能作为正式安装入口。

安装后会像普通 App 一样从桌面图标启动。若需要真正的 `.apk` 安装包，需要再接入 Android 打包流程。

## 移动端 App

项目已接入 Capacitor，App 名称为 `Angry Melon`，包名为 `com.bryzczh.angrymelon`。

### Android APK

仓库包含 GitHub Actions 构建模板：`docs/build-apk-workflow.yml`。如果需要自动构建 APK，需要将它复制到 `.github/workflows/build-apk.yml` 并确保 GitHub token 有 `workflow` 权限。启用后每次推送到 `main` 会自动构建 debug APK，可在 GitHub 仓库的 Actions 页面下载 `angry-melon-debug-apk` artifact。

本地构建需要安装 Android Studio、Android SDK 和 JDK 21：

```bash
npm ci
npm run android:sync
cd android
./gradlew assembleDebug
```

生成文件在 `android/app/build/outputs/apk/debug/app-debug.apk`。

### iPhone / iOS

iPhone 不能安装 APK。iPhone 版本需要用 iOS 工程构建：

```bash
npm ci
npm run ios:sync
npx cap open ios
```

然后在 Xcode 里选择开发团队，连接 iPhone 真机运行，或通过 Apple Developer/TestFlight 分发。没有 Apple 签名环境时，无法直接生成可安装的 `.ipa`。

### 仓库改名

如果把远程仓库改名为 `Angry Melon`，GitHub 仓库名建议使用 `angry-melon` 或 `Angry-Melon` 这种无空格形式。改名后旧仓库地址通常会跳转，但建议同步更新本地远端：

```bash
git remote set-url origin https://github.com/bry-zczh/angry-melon.git
```

如果开启 GitHub Pages，访问地址也会从 `https://bry-zczh.github.io/wogua-bounce/` 变成新仓库名对应的地址。

## 检查

```bash
npm run check
```
