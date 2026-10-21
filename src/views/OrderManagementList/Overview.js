import PropTypes from 'prop-types'
import roundDecimal from './../../helper/roundDecimal.js'
import { formatMoney } from 'ui/format'

// 區間統計：每格的數值運算與舊版相同，只加千分位與新版樣式；金額一律千分位、不加幣別（與下方帳單表格一致，STYLE §7）
const Stat = ({ label, children }) => (
  <div className="flex flex-col gap-1 bg-background px-4 py-4">
    <span className="text-label text-text-secondary">{label}</span>
    <span className="text-heading tabular-nums text-text">{children}</span>
  </div>
)

function Overview({ orderList, membershipDisplay, bonusDisplay }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-solid border-border bg-border sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      <Stat label="服務消費">{formatMoney(roundDecimal(orderList.service) || 0)}</Stat>
      <Stat label={`店販消費${membershipDisplay ? '/會員卡消費' : ''}`}>
        {`${formatMoney(roundDecimal(orderList.product) || 0)}${membershipDisplay ? ' / ' + formatMoney(roundDecimal(orderList.membership)) : ''}`}
      </Stat>
      <Stat label="卡券使用 (入業績)">{formatMoney(roundDecimal(orderList.usedTicket) || 0)}</Stat>
      <Stat label="卡券販賣 (入業績)">{formatMoney(roundDecimal(orderList.ticketSellIntoPerformance) || 0)}</Stat>
      <Stat label="業績收入">{formatMoney(roundDecimal(orderList.performanceIncome) || 0)}</Stat>
      <Stat label="卡券販賣 (不入業績)">{formatMoney(roundDecimal(orderList.ticketSellNotIntoPerformance) || 0)}</Stat>
      <Stat label="卡券使用(-)">{formatMoney(roundDecimal(orderList.usedTicketForDecount) || 0)}</Stat>
      <Stat label="第三方卡券(-)">{formatMoney(roundDecimal(orderList.thirdPartTicketForDecount) || 0)}</Stat>
      <Stat label="其他付款方式(-)">{formatMoney(roundDecimal(orderList.otherPayWayForDecount) || 0)}</Stat>
      <Stat label={`入金使用(-)${bonusDisplay ? '/點數折抵金額(-)' : ''}`}>
        {formatMoney(roundDecimal(orderList.walletUsedForDecount) || 0)}
        {bonusDisplay && ` / ${formatMoney(roundDecimal(orderList.bonusDecountForReport))}`}
      </Stat>
      <Stat label="入金儲值">{formatMoney(roundDecimal(orderList.walletDeposit) || 0)}</Stat>
      <Stat label="營業現金應收">{formatMoney(roundDecimal(orderList.businessCash) || 0)}</Stat>
    </div>
  )
}

Overview.propTypes = {
  className: PropTypes.string,
}

export default Overview
