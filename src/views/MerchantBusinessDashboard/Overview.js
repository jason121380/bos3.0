import { formatNumber } from 'ui/format'

// 區間統計：每格的數值運算與舊版相同，只加千分位與新版樣式
const Stat = ({ label, children }) => (
  <div className="flex flex-col gap-1 bg-background px-4 py-4">
    <span className="text-label text-text-secondary">{label}</span>
    <span className="text-heading tabular-nums text-text">{children}</span>
  </div>
)

function Overview({ overview, membershipDisplay }) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-solid border-border bg-border sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      <Stat label="服務消費">{formatNumber(Math.round(overview.service) || 0)}</Stat>
      <Stat label={<>店販消費{membershipDisplay && '/會員卡消費'}</>}>
        {`${overview.product || 0}${membershipDisplay ? '/' + overview.membership : ''}`}
      </Stat>
      <Stat label="卡券使用 (入業績)">{formatNumber(Math.round(overview.usedTicket) || 0)}</Stat>
      <Stat label="卡券販賣 (入業績)">
        {formatNumber(Math.round(overview.ticketSellIntoPerformance) || 0)}
      </Stat>
      <Stat label="業績收入">{formatNumber(Math.round(overview.performanceIncome) || 0)}</Stat>
      <Stat label="卡券販賣 (不入業績)">
        {formatNumber(Math.round(overview.ticketSellNotIntoPerformance) || 0)}
      </Stat>
      <Stat label="卡券使用(-)">{formatNumber(Math.round(overview.usedTicketForDecount) || 0)}</Stat>
      <Stat label="第三方卡券(-)">
        {formatNumber(Math.round(overview.thirdPartTicketForDecount) || 0)}
      </Stat>
      <Stat label="其他付款方式(-)">
        {formatNumber(Math.round(overview.otherPayWayForDecount) || 0)}
      </Stat>
      <Stat label="入金使用(-)">{formatNumber(overview.walletUsedForDecount || 0)}</Stat>
      <Stat label="入金儲值">{formatNumber(overview.walletDeposit || 0)}</Stat>
      <Stat label="營業現金應收">{formatNumber(Math.round(overview.businessCash) || 0)}</Stat>
    </div>
  )
}

export default Overview
