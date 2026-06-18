Original prompt: 仔细看看当前目录这个项目,各种动画,效果等等实在是太丑了,你利用skill啥的超级美化一下,git信息用821896444@qq.com hecrereed 利用https://github.com/HecreReed/wogua-bounce给主仓https://github.com/bry-zczh/wogua-bounce提pr

# 窝瓜弹弹乐 — 视觉美化

单文件 Canvas 游戏 (index.html, ~4659 行)。目标：大幅提升美观度（背景、怪物、机关、UI、动画）。

## 基线观察
- 背景：浑浊的粉绿渐变，山丘扁平，缺乏层次与氛围。
- 怪物：扁平绿色圆角方块，造型单调。
- 整体：缺少深度、光影、通透感。

## 测试钩子
- 需要加 `window.render_game_to_text` 和 `window.advanceTime(ms)` 供 develop-web-game 测试循环使用。

## 进度
- [x] 读取并理解整体结构
- [x] 抓取基线截图 (baseline-menu.png, baseline-game.png)
- [x] 加测试钩子 (window.advanceTime / render_game_to_text / __game)
- [x] 美化背景（多层视差山丘 + 大气透视 + 太阳光束 + 草簇花朵 + 蓬松云）
- [x] 美化怪物（径向渐变体 + 触角 + 大眼高光 + 腮红 + 待机浮动；头盔含铆钉高光）
- [x] 美化机关（炸弹金属化+引信火花 / 木箱木纹铆钉 / 弹簧高光箭头 / 尖刺金属渐变 / 传送门能量漩涡）
- [x] 美化 CSS（标题流光动画 / 品牌徽章光环+浮动 / 面板弹入 / 玻璃质感 stat）
- [x] 回归测试：瞄准→发射(反向)→击中→击杀→连击→通关overlay 全链路通过，0 报错
- [x] 修复：onPointerDown/Up 的 set/releasePointerCapture 包 try/catch（防真机边缘情况）
- [ ] 提 PR 到主仓

## 测试结论
- 官方 client (`$WEB_GAME_CLIENT`) 可运行，产出 output/web-game/state-0.json + shot-0.png。
  - 需把全局 playwright 软链到 skills/scripts/node_modules，并装 chromium-headless-shell build 1217。
  - client 的合成鼠标不触发游戏的 Pointer Events 发射，故发射链路用 MCP 浏览器派发真实 PointerEvent 验证。
- 关 1：发射后 squash moving=true 且方向为拖拽反向；怪物 2→1→0；shots 递减；combo 记录；overlay「关卡完成」。
- 菜单/关卡选择(8卡)/图鉴/技能(6卡)/返回 全部正常。

## 给下一个 agent 的 TODO
- 截图存在 cwd（baseline-*.png, bg-v1.png, monsters-v1*.png, mech-*.png, ui-menu*.png, win-overlay*.png, output/），提交前已清理。
- 若要再加特效，注意 buildBackground 是预渲染到 offscreen bgCanvas，改色需同步 drawBackground 的 fallback 渐变。


## 提交信息
- git user: hecrereed / 821896444@qq.com
- fork: https://github.com/HecreReed/wogua-bounce (origin)
- 主仓: https://github.com/bry-zczh/wogua-bounce (upstream)
