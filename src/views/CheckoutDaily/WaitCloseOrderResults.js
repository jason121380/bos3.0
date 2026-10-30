import TableCheckoutBar from 'components/TableCheckoutBar'
import { ChevronDown } from 'lucide-react'
import { format, startOfDay } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import PropTypes from 'prop-types'
import React from 'react'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { cn } from 'ui/utils'

function Results({
  pageSetting,
  waitCloseOrderResults,
  refetchDailyMoneyFlowReport,
  refetch,
  loading,
  checkoutStatus,
  ...rest
}) {
  const checkoutStaff = JSON.parse(localStorage.getItem('user'))

  const [results, setResults] = React.useState([])
  const [checkoutProcessing, setCheckoutProcessing] = React.useState(false)
  const [canCheckoutOrder, setCanCheckoutOrder] = React.useState(0)
  const [expanded, setExpanded] = React.useState(false)

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

  React.useEffect(() => {
    if (!loading) {
      const filterResults = waitCloseOrderResults.filter(d => d.date <= startOfDay(new Date()).getTime())
      setResults(filterResults)
      // 全選框以畫面列出的日期計算（不含今天 00:00 以後、沒列出的時間戳），Jason 2026/10/22
      if (checkoutStatus) {
        const length = filterResults.filter(d => d.pendingOrderCount === 0).length
        setCanCheckoutOrder(length)
      } else {
        setCanCheckoutOrder(filterResults.length)
      }
    }
    // 「有掛單未結不可日結」設定由父層 state 傳入、可能比列表晚一拍更新；設定改變時重算全選上限（B2 #13）
  }, [loading, checkoutStatus])
  const [selectedOrders, setSelectedOrders] = React.useState([])
  const handleSelectAll = event => {
    if (checkoutStatus) {
      const newSelectedOrders = event.target.checked ? results.filter(d => d.pendingOrderCount === 0).map(d => d.date) : []
      setSelectedOrders(newSelectedOrders)
    } else {
      const newSelectedOrders = event.target.checked ? results.map(order => order.date) : []
      setSelectedOrders(newSelectedOrders)
    }
  }

  const handleSelectOne = id => {
    const newSelect = [...selectedOrders], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedOrders(newSelect)
  }
  const handleMarkPaid = () => {
    openSnackbar({
      message: `是否確認要日結`,
      variant: 'error',
      disableHide: true,
      resign: true,
      isDailyCheckout: true,
      selectedOrders: selectedOrders,
      waitCloseOrderResults: waitCloseOrderResults,
      setSelectedOrders: setSelectedOrders,
      progressCount: 0,
      checkoutStaff: checkoutStaff,
    })
  }

  return (
    <div {...rest}>
      <Card>
        <CardHeader
          className="items-center pb-5"
          action={
            <Button
              variant="ghost"
              size="icon"
              className="text-text-secondary"
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ChevronDown className={cn('transition-transform', expanded && 'rotate-180')} strokeWidth={1.75} />
            </Button>
          }
        >
          <div className="flex items-baseline gap-3">
            <CardTitle>尚未日結紀錄</CardTitle>
            <span className="text-label text-text-secondary tabular-nums">
              共 {results.length} 筆
            </span>
          </div>
        </CardHeader>
        {expanded && (
          <div className="border-0 border-t border-solid border-border">
            <div className="flex items-center gap-2 border-0 border-b border-solid border-border bg-surface px-5 py-2">
              <Checkbox
                aria-label="全選"
                checked={
                  selectedOrders.length > 0
                    ? selectedOrders.length === canCheckoutOrder
                    : false
                }
                indeterminate={
                  selectedOrders.length > 0 && selectedOrders.length < canCheckoutOrder
                }
                onChange={handleSelectAll}
              />
              <span className="text-label text-text-secondary">
                全選 / 營業日期
              </span>
            </div>
            <div className="grid grid-cols-1 gap-x-6 px-5 py-2 sm:grid-cols-2">
              {results.map(result => (
                <div key={result.date} className="flex h-10 items-center gap-2 border-0 border-b border-solid border-border">
                  <Checkbox
                    aria-label={format(new Date(result.date), 'yyyy/MM/dd')}
                    onChange={() => handleSelectOne(result.date)}
                    checked={selectedOrders.indexOf(result.date) > -1}
                    disabled={checkoutStatus && result.pendingOrderCount > 0}
                  />
                  <span className="flex flex-wrap items-center text-body tabular-nums text-text">
                    {format(new Date(result.date), 'yyyy/MM/dd')}
                    {checkoutStatus && result.pendingOrderCount > 0 && (
                      <span className="ml-2 text-caption font-medium text-danger">
                        ({result.pendingOrderCount}筆掛單未結)
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
      <TableCheckoutBar
        selected={selectedOrders}
        onMarkPaid={handleMarkPaid}
        checkoutProcessing={checkoutProcessing}
      />
    </div >
  )
}

Results.propTypes = {
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}

export default Results
