/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, TableContainer,
  Table, TableHead, TableBody, TableCell, TableRow,
  Button,
  IconButton, CircularProgress, Typography
} from '@mui/material'
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

const styles  = {
  sticky: css({
    position: 'sticky !important',
    top: 0,
    left: 0,
    background: 'white',
    zIndex: '99',
    wordBreak: 'break-all',
  }),
  stickyRow: css({
    position: 'sticky !important',
    top: 0,
    background: 'white',
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
  IconButton: {
    padding: '4px !important'
  }
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
        <IconButton sx={{ padding: '8px !important' }} onClick={handleCloseModal}>
          <CloseIcon/>
        </IconButton>
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
            variant='contained' onClick={handleReset}
          >重設</Button>
        </div>
        {(ordersFastCheckLazyData.data === undefined || ordersFastCheckLazyData.loading) ?
          <div css={styles.circular}><CircularProgress/></div> :
          orderData.length > 0 ?
          <TableContainer style={{height: 'calc(100% - 100px)'}}>
            <Table>
              <TableHead css={styles.stickyRow}>
                <TableRow>
                  <TableCell css={styles.sticky} style={{minWidth: '42px'}}></TableCell>
                  <TableCell css={styles.sticky} style={{minWidth: '50px', left: '42px'}}>編號</TableCell>
                  <TableCell css={styles.sticky} style={{minWidth: '100px', left: '92px'}}>客戶</TableCell>
                  <TableCell css={styles.sticky} style={{minWidth: '100px', left: '192px'}}>設計師</TableCell>
                  <TableCell>指定</TableCell>
                  <TableCell className="cellHighlight">營業現金應收</TableCell>
                  <TableCell>服務消費</TableCell>
                  <TableCell>店販消費</TableCell>
                  {membershipDisplay && <TableCell>會員卡販賣</TableCell>}
                  <TableCell>卡券使用 (入業績)</TableCell>
                  <TableCell>卡券販賣 (入業績)</TableCell>
                  <TableCell>業績收入</TableCell>
                  <TableCell>卡券販賣 (不入業績)</TableCell>
                  <TableCell>卡券使用(-)</TableCell>
                  <TableCell>第三方卡券(-)</TableCell>
                  <TableCell>其他付款方式(-)</TableCell>
                  <TableCell>入金使用(-)</TableCell>
                  {bonusDisplay && <TableCell>點數折抵金額(-)</TableCell>}
                  <TableCell>備註</TableCell>
                  <TableCell>訂單來源</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {orderData.map(d => 
                (
                  <TableRow key={d.id}>
                    <TableCell css={styles.sticky} style={{ width: '42px', padding: '2px'}}>
                      <IconButton size='large' onClick={() => {history.push(`/order/${d.id}`), handleCloseModal()}} css={styles.IconButton}><EditOutlinedIcon style={{ width: '30px', height: '30px'}}/></IconButton>
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
                      <Typography variant="body2">
                        {d.serviceOrders.length > 0 && serviceOrders(d)}
                      </Typography>
                    </TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap'}}>
                      {Math.round(d.productFakeTotal)}
                      <Typography variant="body2">
                        {d.productOrders.length > 0 && productOrders(d)}
                      </Typography>
                    </TableCell>
                    {membershipDisplay && (
                      <TableCell style={{ whiteSpace: 'nowrap'}}>
                        {Math.round(d.membershipFakeTotal)}
                        <Typography variant="body2">
                          {d.membershipOrders.length > 0 && membershipOrders(d)}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>{parseInt(d.useTicketTotal*100)/100}</TableCell>
                    <TableCell>{Math.round(d.ticketSellIntoPerformance)}</TableCell>
                    <TableCell>{Math.round(d.performanceIncome)}</TableCell>
                    <TableCell>{Math.round(d.ticketSellNotIntoPerformance)}</TableCell>
                    <TableCell>{parseInt(d.usedTicketForDecount*100)/100}</TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap'}}>
                      {Math.round(d.thirdPartTicketForDecount)}
                      <Typography variant="body2">
                        {d.serviceOrders.length > 0 &&
                          d.productOrders.length > 0 &&
                          thirdParty(d)}
                      </Typography>
                    </TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap'}}>
                      {Math.round(d.otherPayWayForDecount)}
                      <Typography variant="body2">{d.payType2}</Typography>
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
            </Table>
          </TableContainer> :
          <Typography css={styles.noData} component="h3" variant="h3">
            無資料
          </Typography>
        }
      </DialogContent>
    </Dialog>
  )
}

export default FastCheckOrdersModal
