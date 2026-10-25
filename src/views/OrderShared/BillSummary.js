import React, { useState } from 'react'
import { ChevronUp } from 'lucide-react'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatMoney, formatNumber } from 'ui/format'

// 四個帳單頁的「金額彙總」畫面（打帳單 PannelPerformance、帳單詳細／掛單詳細／重新開單 Footer 原本各一份，2026/10/21 合併）。
// 這裡只負責排版與千分位；每個數值的運算式仍留在各頁、一字未改，以 props 傳入。

// 明細的一列：左邊名稱、右邊金額（千分位）
export function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-body">
      <span className="whitespace-nowrap text-text-secondary">{label}</span>
      <span className="whitespace-nowrap tabular-nums text-text">{formatMoney(value)}</span>
    </div>
  )
}

// 「消費明細」與「付款與折抵」兩欄：spending／payments 為 [{ label, value }]，順序即顯示順序
export function SummaryDetails({ spending, payments }) {
  return (
    <>
      <div className="flex flex-col">
        <p className="m-0 pb-1 text-label font-medium text-text-tertiary">消費明細</p>
        {spending.map(row => (
          <SummaryRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
      <div className="flex flex-col">
        <p className="m-0 pb-1 text-label font-medium text-text-tertiary">付款與折抵</p>
        {payments.map(row => (
          <SummaryRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
    </>
  )
}

// 業績合計與現金應收（放進呼叫端的兩欄格線）
export function SummaryTotals({ performanceTotal, cashDue }) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="text-label text-text-secondary">業績合計</span>
        <span className="text-heading tabular-nums text-text">{formatNumber(performanceTotal)}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-label text-text-secondary">現金應收</span>
        <span className="text-display tabular-nums text-text">{formatNumber(cashDue)}</span>
      </div>
    </>
  )
}

// 動作按鈕區：按鈕靠右，停用時在下方說明原因（role="status"，只出現一次）
export function BillActions({ reason, children }) {
  return (
    <div className="flex flex-col items-end gap-1.5 max-sm:w-full">
      {children}
      {reason && (
        <p role="status" className="m-0 text-caption text-warning max-sm:text-right">
          {reason}
        </p>
      )}
    </div>
  )
}

// 帳單詳細／掛單詳細／重新開單的金額彙總卡（放在 Pannel 下方右欄，比照打帳單 PannelPerformance）：
// 桌機顯示明細與合計，動作按鈕在合計下方；手機（< 640px）只留動作按鈕，明細與合計收進底部固定列（StickySummaryBar）。
// children 放在卡片最後（密碼視窗、列印範本等），輸出位置與合併前相同
export function EditSummaryCard({ details, performanceTotal, cashDue, actions, children }) {
  return (
    <Card className="ui-root w-full self-start">
      <CardHeader className="max-sm:hidden">
        <CardTitle>金額彙總</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-5 pt-2 max-sm:hidden">{details}</div>
      <div className="mt-3 flex flex-col gap-4 border-0 border-t border-solid border-border px-5 py-4 max-sm:mt-0 max-sm:border-t-0">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-sm:hidden">
          <SummaryTotals performanceTotal={performanceTotal} cashDue={cashDue} />
        </div>
        {actions}
      </div>
      {children}
    </Card>
  )
}

// 底部固定列：長帳單捲動時，業績合計與現金應收隨時看得到。
// 左側讓出側欄（lg 以上依 layouts/Dashboard 提供的 --sidebar-w：展開 264px、收合 0）；手機讓出底部導覽列（56px＋iPhone 安全區——
// PWA 全螢幕時導覽列會加高，只讓 56px 會被蓋住）；列印時不顯示。手機版（< 640px）由左側展開鈕往上展開完整明細（純畫面開合）。
// detailsId：展開區的 id（aria-controls 指向它），各頁不同
// aboveTabBar：該頁手機是否顯示底部導覽列。只有打帳單（導覽列的分頁之一）有；帳單詳細／掛單詳細／重新開單的路由不顯示導覽列
// （layouts/Dashboard/MobileNav 的 FLOW），傳 false 讓固定列貼齊畫面底部、只以下內距讓出 iPhone 安全區
// （原本一律讓出 56px，列下方露出頁面內容；Jason 2026/10/22 fix all）
export function StickySummaryBar({ detailsId, details, performanceTotal, cashDue, aboveTabBar = true }) {
  const [summaryOpen, setSummaryOpen] = useState(false)
  const position = aboveTabBar
    ? 'bottom-[calc(56px+env(safe-area-inset-bottom))] py-2'
    : 'bottom-0 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))]'
  return (
    <div className={`ui-root fixed inset-x-0 ${position} z-[1050] border-0 border-t border-solid border-border bg-background px-4 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] print:hidden lg:bottom-0 lg:left-[var(--sidebar-w,264px)]`}>
      {summaryOpen && (
        <div id={detailsId} className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto border-0 border-b border-solid border-border pb-2 sm:hidden">
          <p className="m-0 pb-1 pt-1 text-heading font-bold text-text">金額彙總</p>
          {details}
        </div>
      )}
      <div className="mx-auto flex max-w-[1200px] items-center justify-end gap-3 whitespace-nowrap sm:gap-8">
        <button
          type="button"
          aria-label="金額彙總明細"
          aria-expanded={summaryOpen}
          aria-controls={detailsId}
          onClick={() => setSummaryOpen(!summaryOpen)}
          className="mr-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-surface-hover sm:hidden"
        >
          <ChevronUp className={summaryOpen ? 'h-5 w-5 rotate-180 transition-transform' : 'h-5 w-5 transition-transform'} strokeWidth={1.75} />
        </button>
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-label text-text-secondary max-sm:text-caption">業績合計</span>
          <span className="text-heading tabular-nums text-text">{formatMoney(performanceTotal)}</span>
        </div>
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-label text-text-secondary max-sm:text-caption">現金應收</span>
          <span className="text-heading font-semibold tabular-nums text-text">{formatMoney(cashDue)}</span>
        </div>
      </div>
    </div>
  )
}
