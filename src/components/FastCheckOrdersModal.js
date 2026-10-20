/** @jsxImportSource @emotion/react */
// 窗內有日期選擇器（DateSelector）與設計師下拉，依踩雷清單保留相容層 Dialog（Radix Dialog 會擋住彈出層）
import { Dialog, DialogTitle, DialogContent } from 'ui/modal-compat'
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from 'ui/table'
import { Button } from 'ui/button'
import { useState, useEffect } from 'react'
import { startOfDay, endOfDay } from 'date-fns'
import { useFetchOrdersFastCheckLazy } from 'hooks/useFetchOrders'
import { useHistory } from 'react-router';
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsCustomerBonusActive from 'hooks/useFetchGetIsCustomerBonusActive'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { EditOutlined as EditOutlinedIcon, Close as CloseIcon } from 'ui/icons'
import idx from 'idx'
import DateSelector from 'components/DateSelector'
import { css } from '@emotion/react'
import { LoaderCircle } from 'lucide-react'

const styles  = {
  sticky: css({
    position: 'sticky !important',
    top: 0,
    left: 0,
    background: 'rgb(var(--background))',
    zIndex: '99',
    wordBreak: 'break-all',
    // ui/table 在 .ui-root 內為 border-box；固定欄的 minWidth 沿用舊版 content-box 計算（內容區最小寬），避免編號被擠成兩行
    boxSizing: 'content-box',
  }),
  stickyRow: css({
    position: 'sticky !important',
    top: 0,
    background: 'rgb(var(--background))',
    zIndex: '100',
    outline: '1px solid rgb(var(--border)) !important',
  }),
  calendarButton: css({
    backgroundColor: 'white !important',
    color: 'black !important',
  }),
  filter: css({
    width: '200px !important',
  }),
  filterBar: css({
    padding: '14px 0', 
    display: 'flex', 
    alignItems: 'center', 
    columnGap: '20px', 
    rowGap: '10px', 
    flexWrap: 'wrap',
  }),
  title: css({
    padding: '8px 8px 8px 24px !important',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  circular: css({
    textAlign: 'center',
    marginTop: '50px',
  }),
  noData: css({
    textAlign: 'center',
    marginTop: '80px !important',
  }),
  cellHighlight: css({
    fontWeight: 'bold',
    color: 'red',
  }),
  margin: css({
    margin: 0
  }),
}

const FastCheckOrdersModal = ({ open, setOpenModal, date }) => {
  const history = useHistory()
  const [orderData, setOrderData] = useState([])
  const [membershipDisplay, setMembershipDisplay] = useState(false)
  const [bonusDisplay, setBonusDisplay] = useState(false)
  const [ordersFastCheckLazy, ordersFastCheckLazyData] = useFetchOrdersFastCheckLazy()
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const customerBonusActive = useFetchGetIsCustomerBonusActive()
  const [summery, setSummery] = useState({
    service: 0,
    product: 0,
    usedTicket: 0,
    ticketSellIntoPerformance: 0,
    performanceIncome: 0,
    ticketSellNotIntoPerformance: 0,
    usedTicketForDecount: 0,
    thirdPartTicketForDecount: 0,
    otherPayWayForDecount: 0,
    walletUsedForDecount: 0,
    businessCash: 0,
  })
  const [submitData, setSubmitData] = useState({
    date: date,
    designate: null,
    designerId: '',
  })

  const handleCloseModal = () => {
    setOpenModal(false)
    setSubmitData({
      date: date,
      designate: null,
      designerId: '',
    })
  }

  const handleReset = () => {
    setSubmitData({
      date: date,
      designate: null,
      designerId: '',
    })
  }
  const handleSubmit = () => {
    ordersFastCheckLazy({
      variables: {
        input: {
          startDate: startOfDay(new Date(submitData.date)).getTime(),
          endDate: endOfDay(new Date(submitData.date)).getTime(),
          employeeId: submitData.designerId,
          isReserved: false,
          isDesignate: submitData.designate,
        }
      }
    })
  }
  const serviceOrders = (order) => {
    const arr = []
    let returnString = ''

    order.serviceOrders.map(d => {
      if (d.thirdPartyPayName) {
        arr.push(d.thirdPartyPayName)
      }
    })
    arr.forEach((element, index) => {
      if (index !== 0) {
        returnString = returnString + ', 含 ' + element
      } else {
        returnString = '含 ' + element
      }
    })
    return returnString
  }
  const productOrders = (order) => {
    const arr = []
    let returnString = ''

    order.productOrders.map(d => {
      if (d.thirdPartyPayName) {
        arr.push(d.thirdPartyPayName)
      }
    })
    arr.forEach((element, index) => {
      if (index !== 0) {
        returnString = returnString + ', 含 ' + element
      } else {
        returnString = '含 ' + element
      }
    })
    return returnString
  }
  const membershipOrders = (order) => {
    const arr = []
    let returnString = ''

    order.membershipOrders.map(d => {
      if (d.thirdPartyPayName) {
        arr.push(d.thirdPartyPayName)
      }
    })
    arr.forEach((element, index) => {
      if (index !== 0) {
        returnString = returnString + ', 含 ' + element
      } else {
        returnString = '含 ' + element
      }
    })
    return returnString
  }
  const thirdParty = (order) => {
    const arr = []
    let returnString = ''

    order.serviceOrders.map(d => {
      if (d.thirdPartyPayName) {
        arr.push(d.thirdPartyPayName)
      }
    })

    order.productOrders.map(d => {
      if (d.thirdPartyPayName) {
        if (!arr.find(elm => elm === d.thirdPartyPayName)) {
          arr.push(d.thirdPartyPayName)
        }
      }
    })

    arr.forEach((element, index) => {
      if (index !== 0) {
        returnString = returnString + ', 含 ' + element
      } else {
        returnString = '含 ' + element
      }
    })
    return returnString
  }
  useEffect(() => {
    if (
      ordersFastCheckLazyData.data !== undefined &&
      !ordersFastCheckLazyData.loading &&
      !isMemberShipCardActiveData.loading &&
      !customerBonusActive.loading
    ) {
      const data = idx(ordersFastCheckLazyData,_=>_.data.orders.orders)
      const data2 = idx(ordersFastCheckLazyData,_=>_.data.orders.intervalSummary)
      const isMemberShipCardActive = idx(isMemberShipCardActiveData,_ => _.data.getIsMemberShipCardActive)
      const membership = idx(ordersFastCheckLazyData, _ => _.data.orders.intervalSummary.membership)
      const bonusActive = idx(customerBonusActive,_ => _.data.getIsCustomerBonusActive)
      const bonus = idx(ordersFastCheckLazyData, _ => _.data.orders.intervalSummary.bonusDecountForReport)
      setBonusDisplay(bonusActive || bonus !== 0)
      setMembershipDisplay(isMemberShipCardActive || membership !== 0)
      setOrderData(data)
      setSummery(data2)
    }
  }, [ordersFastCheckLazyData.loading, isMemberShipCardActiveData.loading, customerBonusActive.loading])

  useEffect(() => {
    setSubmitData({ ...submitData, date: date })
  }, [date])

  useEffect(() => {
    open && handleSubmit()
  }, [submitData, open])

  return (
    <Dialog className='FastCheckOrdersModal' maxWidth='xl' fullWidth open={open} onClose={handleCloseModal}>
      <DialogTitle css={styles.title}>
        帳單速查
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="關閉" title="關閉" onClick={handleCloseModal}>
          <CloseIcon/>
        </Button>
      </DialogTitle>
      <div className="h-px bg-border" />
      <DialogContent style={{ padding: '0px 24px 24px' }}>
        <div css={styles.filterBar}>
          <DateSelector
            date={{ startDate: submitData.date, endDate: submitData.date }}
            attributes={['startDate']}
            dateChange={({ startDate }) => setSubmitData({ ...submitData, date: startDate })}
          />
          <EmployeeAutoComplete
            label="服務人員姓名/編號"
            value={submitData.designerId}
            className={styles.filter}
            name="designer"
            onChange={
              value => value.userId ?
                setSubmitData({ ...submitData, designerId: value.userId }) :
                setSubmitData({ ...submitData, designerId: '' })
            }
          />
          <ToggleGroup
            size="small"
            exclusive
            value={submitData.designate}
            onChange={(e, value) => setSubmitData({ ...submitData, designate: value })}
          >
            <ToggleGroupItem value={true}>指定</ToggleGroupItem>
            <ToggleGroupItem value={false}>不指定</ToggleGroupItem>
          </ToggleGroup>
          <Button
            disabled={ordersFastCheckLazyData.data === undefined || ordersFastCheckLazyData.loading}
            variant="secondary" onClick={handleReset}
          >重設</Button>
        </div>
        {(ordersFastCheckLazyData.data === undefined || ordersFastCheckLazyData.loading) ?
          <div css={styles.circular}><LoaderCircle className="mx-auto h-10 w-10 animate-spin text-accent" strokeWidth={1.75} /></div> :
          orderData.length > 0 ?
            <Table wrapperClassName="h-[calc(100%-100px)]">
              <TableHeader css={styles.stickyRow}>
                <TableRow>
                  <TableHead css={styles.sticky} style={{minWidth: '42px'}}></TableHead>
                  <TableHead css={styles.sticky} style={{minWidth: '50px', left: '42px'}}>編號</TableHead>
                  <TableHead css={styles.sticky} style={{minWidth: '100px', left: '92px'}}>客戶</TableHead>
                  <TableHead css={styles.sticky} style={{minWidth: '100px', left: '192px'}}>設計師</TableHead>
                  <TableHead>指定</TableHead>
                  <TableHead className="cellHighlight">營業現金應收</TableHead>
                  <TableHead>服務消費</TableHead>
                  <TableHead>店販消費</TableHead>
                  {membershipDisplay && <TableHead>會員卡販賣</TableHead>}
                  <TableHead>卡券使用 (入業績)</TableHead>
                  <TableHead>卡券販賣 (入業績)</TableHead>
                  <TableHead>業績收入</TableHead>
                  <TableHead>卡券販賣 (不入業績)</TableHead>
                  <TableHead>卡券使用(-)</TableHead>
                  <TableHead>第三方卡券(-)</TableHead>
                  <TableHead>其他付款方式(-)</TableHead>
                  <TableHead>入金使用(-)</TableHead>
                  {bonusDisplay && <TableHead>點數折抵金額(-)</TableHead>}
                  <TableHead>備註</TableHead>
                  <TableHead>訂單來源</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {orderData.map(d => 
                (
                  <TableRow key={d.id}>
                    <TableCell css={styles.sticky} style={{ width: '42px', padding: '2px'}}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 [&_svg]:size-6" aria-label="編輯帳單" title="編輯帳單" onClick={() => {history.push(`/order/${d.id}`), handleCloseModal()}}><EditOutlinedIcon /></Button>
                    </TableCell>
                    <TableCell css={styles.sticky} style={{minWidth: '50px', left: '42px'}}>{d.no}</TableCell>
                    <TableCell css={styles.sticky} style={{minWidth: '100px', left: '92px'}}>{d.customer.name}</TableCell>
                    <TableCell css={styles.sticky} style={{minWidth: '100px', left: '192px'}}>{d.designer.name}</TableCell>
                    <TableCell>{d.isDesignate ? 'Y' : 'N'}</TableCell>
                    <TableCell className="cellHighlight">
                      {Math.round(d.businessCash)}
                    </TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap'}}>
                      {Math.round(d.serviceFakeTotal)}
                      <p className="m-0 text-[14px] leading-5 text-text-secondary">
                        {d.serviceOrders.length > 0 && serviceOrders(d)}
                      </p>
                    </TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap'}}>
                      {Math.round(d.productFakeTotal)}
                      <p className="m-0 text-[14px] leading-5 text-text-secondary">
                        {d.productOrders.length > 0 && productOrders(d)}
                      </p>
                    </TableCell>
                    {membershipDisplay && (
                      <TableCell style={{ whiteSpace: 'nowrap'}}>
                        {Math.round(d.membershipFakeTotal)}
                        <p className="m-0 text-[14px] leading-5 text-text-secondary">
                          {d.membershipOrders.length > 0 && membershipOrders(d)}
                        </p>
                      </TableCell>
                    )}
                    <TableCell>{parseInt(d.useTicketTotal*100)/100}</TableCell>
                    <TableCell>{Math.round(d.ticketSellIntoPerformance)}</TableCell>
                    <TableCell>{Math.round(d.performanceIncome)}</TableCell>
                    <TableCell>{Math.round(d.ticketSellNotIntoPerformance)}</TableCell>
                    <TableCell>{parseInt(d.usedTicketForDecount*100)/100}</TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap'}}>
                      {Math.round(d.thirdPartTicketForDecount)}
                      <p className="m-0 text-[14px] leading-5 text-text-secondary">
                        {d.serviceOrders.length > 0 &&
                          d.productOrders.length > 0 &&
                          thirdParty(d)}
                      </p>
                    </TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap'}}>
                      {Math.round(d.otherPayWayForDecount)}
                      <p className="m-0 text-[14px] leading-5 text-text-secondary">{d.payType2}</p>
                    </TableCell>
                    <TableCell>{d.walletUsedForDecount}</TableCell>
                    {bonusDisplay && <TableCell>{d.bonusDecountForReport}</TableCell>}
                    <TableCell>{d.remark}</TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{d.source}</TableCell>
                  </TableRow>
                )
              )}
                <TableRow>
                  <TableCell css={styles.sticky} style={{minWidth: '42px'}}></TableCell>
                  <TableCell css={styles.sticky} style={{minWidth: '50px', left: '42px'}}></TableCell>
                  <TableCell css={styles.sticky} style={{minWidth: '100px', left: '92px'}}></TableCell>
                  <TableCell css={styles.sticky} style={{minWidth: '100px', left: '192px'}}></TableCell>
                  <TableCell style={{fontWeight: 'bold'}}>合計</TableCell>
                  <TableCell className="cellHighlight">{summery.businessCash || 0}</TableCell>
                  <TableCell>{summery.service || 0}</TableCell>
                  <TableCell>{summery.product || 0}</TableCell>
                  {membershipDisplay && <TableCell>{summery.membership || 0}</TableCell>}
                  <TableCell>{summery.usedTicket || 0}</TableCell>
                  <TableCell>{summery.ticketSellIntoPerformance || 0}</TableCell>
                  <TableCell>{summery.performanceIncome || 0}</TableCell>
                  <TableCell>{summery.ticketSellNotIntoPerformance || 0}</TableCell>
                  <TableCell>{summery.usedTicketForDecount || 0}</TableCell>
                  <TableCell>{summery.thirdPartTicketForDecount || 0}</TableCell>
                  <TableCell>{summery.otherPayWayForDecount || 0}</TableCell>
                  <TableCell>{summery.walletUsedForDecount || 0}</TableCell>
                  {bonusDisplay && <TableCell>{summery.bonusDecountForReport}</TableCell>}
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table> :
          <h3 css={styles.noData} className="m-0 text-title text-text">
            無資料
          </h3>
        }
      </DialogContent>
    </Dialog>
  )
}

export default FastCheckOrdersModal
