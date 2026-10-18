# 改版決策與教訓（MEMORY）

> 目的：記下「為什麼這樣做」，避免日後重複討論或重踩坑。規範本身見 `STYLE.md`，守則見根目錄 `CLAUDE.md`。更新：2026/10/18

## 已定案的決策

| 決策 | 理由／日期 |
|---|---|
| 技術走 Tailwind 3.4 + Radix 元件放 `src/ui/`；品牌藍 `#1A73E8` 為唯一主題色 | 參考 OpenAI 介面克制感；沿用舊版品牌色 |
| Tailwind preflight 關閉，基礎樣式限定在 `.ui-root`，用 `:where()` 把權重歸零 | 遷移期間不能破壞還在用 MUI 的頁面 |
| 只改畫面，不動 API／Redux／hooks／金額日期運算；列印範本不動 | 使用者鐵則 |
| 會 `window.print()` 的報表表格（約 15 頁）維持 MUI（選項 A） | 列印規則直接寫在 MUI class 上，換了會動到列印 |
| 後端 repo 唯讀；測試不建立真實帳單 | 使用者指示 |
| 欄位標籤統一「上方標籤＋佔位字」，不用浮動標籤 | 浮動標籤被 `overflow` 裁掉、備註欄標籤太小；打帳單第 1 組 |
| 必填 `*` 依既有驗證規則標示，並在原始碼註解寫明依據 | 打帳單第 2 組；`orderRequirements.js` 與 Header `valid` 有測試比對 |
| 停用的掛單／明細／結帳顯示「尚缺：…」 | 使用者看不出為什麼不能按 |
| 圖示按鈕改真的 `<button>` 帶 title／aria-label；「+」改「新增項目」 | 第 3 組 |
| 收合卡片以 `summaryMeta` 顯示「已填 N 筆 · NT$ 小計」 | 第 4 組 |
| 金額一律 `NT$` ＋千分位；長帳單用**底部固定合計列**（方案 B）而非 sticky 側欄卡 | sticky 卡只能在並排區內移動，幾乎沒效果；整頁兩欄會壓縮項目列 |
| 服務下拉：選項顯示 `名稱(代號) - 價格`、以 `id` 當 key、中文「查無符合／載入中」 | 同名同價服務分不出來；MUI 以標籤當 key 會重複 |
| 「always merge」：驗證通過就開 PR 並 merge 進 main，不必再問 | 使用者 2026/10/18 指示 |
| `handleToggleNavBar` 判斷寬度 1280→1024 | 側欄改用 Tailwind `lg`(1024)，判斷值必須與 CSS 斷點一致（唯一的邏輯常數修改） |

## 驗證基準

- 測試：改版前 14 檔／25 測試，7 檔 13 個失敗；現在 17 檔／50 測試，仍是同樣 7 檔 13 個失敗（無新增失敗）。
- RegisterForm 競態：舊測試只等 2ms 就檢查導頁，改版後頁面變輕才暴露；已改用 RTL `wait`。
- verify-logic 對 `c41b604` 的 42 個 FAIL 已逐一分類（見 `VERIFY_REPORT.md`），其中 2 處是實際差異（斷點常數、Services 篩選鈕）。

## 教訓（踩過的坑）

1. **codemod 會誤傷模板字串**：`tf2input.py` 把含 `}` 的 template literal 標籤改壞（Payment.js 解析失敗）、漏掉雙引號的 `"data-testid"`。批次轉換後一定要跑 eslint＋verify-logic，並人工看 diff。
2. **`inputProps={{placeholder}}` 會覆蓋預設的 `{ 'data-testid': '' }`**：兩者要一起傳。
3. **headless Chromium 沒有捲軸**：「訂單列表沒有捲軸」的修正只能驗 CSS 規則，需使用者在實機確認。
4. **偵測腳本的誤判**：用 height 推算行數會誤判固定高度儲存格，用 Range client rects；可捲動容器內的內容超出外層不算裁切。
5. **dev server log 會過期**：看到 "Compiled" 不代表伺服器還活著；`pgrep` 也可能抓到殘留程序。啟動前清 log，啟動後 `curl`。
6. **JSX 註解不能放在 `return (` 的第一個子節點**：會變成解析錯誤；用 `//` 放在 return 上方。
7. **flex 容器被內容撐寬**：父層是 flex 時，子層要 `min-width:0` 與 `max-width:100%`；百分比寬度要扣 margin。
8. **MUI Autocomplete 的 `aria-expanded`** 只在「有選項」時為 true；沒有選項時的「No options」彈出層可見但 aria 為 false。
9. **`git fetch` 與 `log` 串在一起會被權限分類器擋**；單獨 `git fetch origin main` 可以。
10. **合併後分支要重置到 main**，再推送（快轉）；否則 stop hook 會提示有未推送的 commit。
11. **Portal 內缺 `ui-root` 要從根因修**：與其逐檔補 class，不如讓 `src/ui` 元件根元素自帶 `ui-root`（已做 8 檔）。檢查用 `node scripts/redesign/portal-root-scan.js`（純文字比對：檔案 import 8 個 ui 元件之一、使用 `<Dialog|Modal|Popper|Popover|Menu|Drawer`、檔內沒有 `ui-root`、且該 ui 元件自身未帶 `ui-root`）。手動整理的清單會漂移（舊「16 檔」實際掃描為 25），以掃描結果為準。限制：只比對同檔案，經由其他元件間接放進 Portal 的不會被抓到。
12. **孿生目錄（Create／Edit）不可照抄**（[v3.0-1019-0202]）：`CouponEdit` 與 `CouponCreate` 的 About 檔看似相同，實際差在 `onChange` key 大小寫（`serviceDeductionItems` vs `ServiceDeductionItems`）、載入中防護（`loading ? '' : value`）、新增列初始值與圖示做法。改版時逐檔對照、只動 JSX，handler 一字不改。
