# 界面截图

均使用 Playwright Chromium（headless，浅色主题，`zh-CN`）实际渲染页面后截取。

| 文件 | 说明 |
| --- | --- |
| `before-desktop.jpg` | 基线：`main` @ `c09d436`，仓库尚无页面，静态服务器根目录列表；1440 × 900 |
| `before-mobile.jpg` | 基线移动端：390 × 844 CSS 像素，deviceScaleFactor 1.5 |
| `after-desktop.jpg` | 本次分支完整页面；1440 × 900 视口，整页截图 |
| `after-mobile.jpg` | 本次分支移动端整页；390 × 844 CSS 像素，deviceScaleFactor 1.5 |
| `after-hero.jpg` | 桌面首屏 |
| `after-cart.jpg` | 加入两道菜后的餐篮抽屉 |
| `after-reservation.jpg` | 订座表单提交成功状态 |

`before` 截图对应基线提交 `c09d436`（main）；`after` 截图对应本 PR 分支。
