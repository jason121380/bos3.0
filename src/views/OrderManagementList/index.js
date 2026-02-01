/** @jsxImportSource @emotion/react */
import { Container, Grid, Link, Button, Typography, Card, Collapse, IconButton } from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import MerchantSearchBar from 'components/MerchantSearchBar'
import ProgressBar from 'components/ProgressBar'
import PageTitle from 'components/PageTitle'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import DateSelector from 'components/DateSelector'
import { endOfDay, startOfDay } from 'date-fns'
import useFetchGetOrderList from 'hooks/useFetchGetOrderList'
import useFetchGetOrderStaticDetail from 'hooks/useFetchGetOrderStaticDetail'
import idx from 'idx'
import produce from 'immer'
import { Fragment, useEffect, useState } from 'react'
import useFetchCustomerDataMarked from 'hooks/useFetchGetCustomerDataMarkedDefault'
import useFetchGetIsOpenDateRangeInOrderMangement from 'hooks/useFetchGetIsOpenDateRangeInOrderMangement'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsCustomerBonusActive from 'hooks/useFetchGetIsCustomerBonusActive'
import useFetchGetLogoDisplayOnInvoice from 'hooks/useFetchGetLogoDisplayOnInvoice'
import useFetchGetQrcodeDisplayOnInvoice from 'hooks/useFetchGetQrcodeDisplayOnInvoice'
import useFetchGetMessageDisplayOnInvoice from 'hooks/useFetchGetMessageDisplayOnInvoice'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import useFetchMerchantOrderDetailPrintLayout from 'hooks/useFetchGetMerchantPrintFormatSettings'
import useFetchGetDesignerNameDisplayOnInvoice from 'hooks/useFetchGetDesignerNameDisplayOnInvoice'
import { useFetchGetIsPrintWindowClosureDelayed } from 'hooks/useFetchGetParameterOrderCreateSetting'
import { useFetchGetSerialNumberUsing } from 'hooks/useFetchGetParameterOrderCreateSetting'
import useFetchGetOrderListDateAuth from 'hooks/useFetchGetOrderListDateAuth'
import { Link as RouterLink } from 'react-router-dom'
import useQueryString from 'hooks/useQueryString'
import QRCode from 'qrcode'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import ResultsV2 from './ResultsV2'
import Overview from './Overview'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(1.5),
  }),
}

function OrderManagementList() {
  const [getQueryString] = useQueryString()
  const customerDataMarkedData = useFetchCustomerDataMarked()
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const customerBonusActive = useFetchGetIsCustomerBonusActive()
  const getLogoDisplayOnInvoice = useFetchGetLogoDisplayOnInvoice()
  const getQrcodeDisplayOnInvoice = useFetchGetQrcodeDisplayOnInvoice()
  const getMessageDisplayOnInvoice = useFetchGetMessageDisplayOnInvoice()
  const passwordData = useFetchMerchantPassword()
  const merchantOrderDetailPrintLayoutData = useFetchMerchantOrderDetailPrintLayout()
  const getDesignerNameDisplayOnInvoice = useFetchGetDesignerNameDisplayOnInvoice()
  const getIsPrintWindowClosureDelayed = useFetchGetIsPrintWindowClosureDelayed()
  const getSerialNumberUsing = useFetchGetSerialNumberUsing()
  const getOrderListDateAuth = useFetchGetOrderListDateAuth()

  const [pageSetting, setPageSetting] = useState({
    pageLimit: 1000,
    pageOffset: 0,
    customerId: '',
    employeeId: '',
    isReserved: false,
    payWay: [],
    thirdPartTicketId: '',
    source: []
  })
  const [date, setDate] = useState({
    startDate: startOfDay(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime()
  })
  const [onlyStart, setOnlyStart] = useState(false)
  const [attrs, setAttrs] = useState([])
  const [membershipDisplay, setMembershipDisplay] = useState(false)
  const [bonusDisplay, setBonusDisplay] = useState(false)
  const [showFilter, setShowFilter] = useState(false)

  const [progress, setProgress] = useState(0)
  const [isCustomerDataMarked, setIsCustomerDataMarked] = useState(false)
  const [orderIds, setOrtderIds] = useState([])
  const [orderList, setOrderList] = useState([])
  const getOrderList = useFetchGetOrderList({
    dateRange: date,
    customerId: pageSetting.customerId,
    designerId: pageSetting.employeeId,
    otherPayWay: pageSetting.payWay.length === 0 ? '' : pageSetting.payWay,
    thirdPartTicketId: pageSetting.thirdPartTicketId,
    source: pageSetting.source
  })
  const orderStaticDetail = useFetchGetOrderStaticDetail(orderIds)
  const getIsOpenDateRangeInOrderMangement = useFetchGetIsOpenDateRangeInOrderMangement()
  const [qrcodeUrl, setQrcodeUrl] = useState('')
  const [imgUrl, setImgUrl] = useState('')
  const [closureDelayed, setClosureDelayed] = useState(false)
  const [detailInfo, setDetailInfo] = useState({
    logo: {
      isDisplay: false,
      imageUrl: null
    },
    qrcode: {
      isDisplay: false,
      url: null,
      imageUrl: null
    },
    message: {
      isDisplay: false,
      message: null,
    }
  })
  const [serialNumberUsing, setSerialNumberUsing] = useState(false)

  useEffect(() => {
    if (!getSerialNumberUsing.loading) {
      const data = idx(getSerialNumberUsing, _ => _.data.getParameterOrderCreateSetting.isOrderSerialNumberUsing)
      setSerialNumberUsing(data)
    }
  }, [getSerialNumberUsing.loading])
  const handlePageChange = (event, newPage) => {
    setPageSetting(
      produce(draft => {
        draft.pageOffset = newPage
      })
    )
  }

  const handleRowsPerPageChange = event => {
    setPageSetting(
      produce(draft => {
        draft.pageLimit = idx(event, _ => _.target.value)
        draft.pageOffset = 0
      })
    )
  }

  useEffect(() => {
    if (!getIsPrintWindowClosureDelayed.loading) {
      const data = idx(getIsPrintWindowClosureDelayed, _ => _.data.getParameterOrderCreateSetting.isPrintWindowClosureDelayed)
      setClosureDelayed(data)
    }
  }, [getIsPrintWindowClosureDelayed.loading])

  useEffect(() => {
    if (!isMemberShipCardActiveData.loading && !getOrderList.loading && getOrderList.data) {
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      const membership = idx(getOrderList, _ => _.data.getOrderList.intervalSummary.membership)
      setMembershipDisplay(isMemberShipCardActive || membership !== 0)
    }
  }, [isMemberShipCardActiveData.loading, getOrderList.loading])

  useEffect(() => {
    if (!customerBonusActive.loading && !getOrderList.loading && getOrderList.data) {
      const bonusActive = idx(
        customerBonusActive,
        _ => _.data.getIsCustomerBonusActive
      )
      const bonus = idx(getOrderList, _ => _.data.getOrderList.intervalSummary.bonusDecountForReport)
      setBonusDisplay(bonusActive || bonus !== 0)
    }
  }, [customerBonusActive.loading, getOrderList.loading])

  useEffect(() => {
    if (!customerDataMarkedData.loading) {
      const customerDataMarked = idx(
        customerDataMarkedData,
        _ => _.data.getCustomerDataMarkedDefault
      )
      setIsCustomerDataMarked(customerDataMarked)
    }
  }, [customerDataMarkedData.loading])

  useEffect(() => {
    if (!getIsOpenDateRangeInOrderMangement.loading && !getOrderListDateAuth.loading) {
      const isOpenDateRange = idx(
        getIsOpenDateRangeInOrderMangement,
        _ => _.data.getIsOpenDateRangeInOrderMangement
      )
      const dateAuth = getOrderListDateAuth.data.orderListDateAuth
      const arr = ['lastmonth', 'thismonth', 'dbyesterday', 'yesterday', 'today', 'selector']
      const attrs = []
      arr.forEach(key => {
        switch (key) {
          case 'lastmonth':
            if (dateAuth[key] && isOpenDateRange) attrs.push(key)
            break;
          case 'thismonth':
            if (dateAuth[key] && isOpenDateRange) attrs.push(key)
            break;
          case 'selector':
            if (dateAuth[key]) {
              if (isOpenDateRange) {
                attrs.push('startDate', 'endDate')
              } else {
                attrs.push('startDate')
                setOnlyStart(true)
              }
            }
            break;
          default:
            dateAuth[key] && attrs.push(key)
            break;
        }
      })
      setAttrs(attrs)
    }
  }, [getIsOpenDateRangeInOrderMangement.loading, getOrderListDateAuth.loading])

  useEffect(() => {
    if (!getOrderList.loading && getOrderList.data) {
      const data = idx(getOrderList, _ => _.data.getOrderList)
      const ids = data.orderList.map(d => d.id)
      const pageData = data.orderList.slice(
        pageSetting.pageLimit * pageSetting.pageOffset,
        (pageSetting.pageLimit * pageSetting.pageOffset) + pageSetting.pageLimit
      )
      setOrderList(pageData)
      setOrtderIds([...ids])
    }
  }, [getOrderList.loading, pageSetting.pageLimit, pageSetting.pageOffset])

  useEffect(() => {
    if (!orderStaticDetail.loading && !getOrderList.loading && getOrderList.data) {
      const staticDetail = idx(orderStaticDetail, _ => _.data.getOrderStaticDetail)
      if (staticDetail.length) {
        const orders = idx(getOrderList, _ => _.data.getOrderList.orderList).slice(
          pageSetting.pageLimit * pageSetting.pageOffset,
          (pageSetting.pageLimit * pageSetting.pageOffset) + pageSetting.pageLimit
        )
        orders.forEach(({ id }, index) => {
          const findData = staticDetail.find(({ orderId }) => orderId === id)
          if (findData) {
            orders[index].staticDetail = findData.orderStaticDetail
          }
        });
        setOrderList(orders)
      }
    }
  }, [orderStaticDetail.loading, getOrderList.data, pageSetting.pageLimit, pageSetting.pageOffset])

  useEffect(() => {
    if (
      !getLogoDisplayOnInvoice.loading &&
      !getQrcodeDisplayOnInvoice.loading &&
      !getMessageDisplayOnInvoice.loading
    ) {
      const logo = idx(getLogoDisplayOnInvoice, _ => _.data.getLogoDisplayOnInvoice)
      const qrcode = idx(getQrcodeDisplayOnInvoice, _ => _.data.getQrcodeDisplayOnInvoice)
      const message = idx(getMessageDisplayOnInvoice, _ => _.data.getMessageDisplayOnInvoice)
      setDetailInfo({
        logo: logo,
        qrcode: qrcode,
        message: message
      })
      QRCode.toDataURL(qrcode.url, (err, string) => {
        !err && setQrcodeUrl(string)
      })
      const getDataUrl = async () => {
        let blob = await fetch(logo.imageUrl).then(r => r.blob());
        let dataUrl = await new Promise(resolve => {
          let reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        })
        setImgUrl(dataUrl)
      }
      getDataUrl()
    }
  }, [
    getLogoDisplayOnInvoice.loading,
    getQrcodeDisplayOnInvoice.loading,
    getMessageDisplayOnInvoice.loading
  ])
  return (
    <Page css={styles.root} title="帳單列表">
      <Container maxWidth={false} css={styles.container}>
        <AdminPageHeader
          title='帳單列表'
          showFilter={showFilter}
          onFilterClick={() => setShowFilter(!showFilter)}
          primaryAction={{
            label: '新開單',
            to: '/order/create'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {(!getIsOpenDateRangeInOrderMangement.loading && !getOrderListDateAuth.loading) && (
              <DateSelector
                attributes={attrs}
                date={date}
                dateChange={value => setDate(value)}
                onlyStart={onlyStart}
                margin={false}
              />
            )}
          </div>
        </AdminPageHeader>

        <Collapse in={showFilter}>
          <div style={{ marginBottom: '12px', backgroundColor: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #f0f0f0' }}>
            <MerchantSearchBar
              values={pageSetting}
              onFilter={value => setPageSetting(value)}
              getThirdPartyId={true}
              outside
              stopGetQueryString={true}
              visible={['employee', 'customer', 'payment', 'thirdPartyCoupon']}
              inMerchantDailyReport={false}
              lastInLeaderBoard={true}
            />
            <div style={{ marginTop: '12px' }}>
              <MerchantSearchBar
                values={pageSetting}
                onFilter={value => setPageSetting(value)}
                getThirdPartyId={true}
                outside
                stopGetQueryString={true}
                visible={['sources']}
                inMerchantDailyReport={false}
                lastInLeaderBoard={true}
              />
            </div>
          </div>
        </Collapse>
        {!getOrderList.loading ? (
          getOrderList.data ? (
            <Fragment>
              <Overview membershipDisplay={membershipDisplay} orderList={idx(getOrderList, _ => _.data.getOrderList.intervalSummary) || {}} bonusDisplay={bonusDisplay} />
              <ResultsV2
                className={styles.results}
                orders={orderList}
                pageSetting={pageSetting}
                setPageSetting={setPageSetting}
                refetch2={getOrderList.refetch}
                totalCount={idx(getOrderList, _ => _.data.getOrderList.orderList).length || 0}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                isCustomerDataMarked={isCustomerDataMarked}
                membershipDisplay={membershipDisplay}
                bonusDisplay={bonusDisplay}
                bonusActive={!customerBonusActive.loading ? idx(customerBonusActive, _ => _.data.getIsCustomerBonusActive) : false}
                orderStaticDetailLoading={orderStaticDetail.loading}
                qrcodeUrl={qrcodeUrl}
                imgUrl={imgUrl}
                detailInfo={detailInfo}
                closureDelayed={closureDelayed}
                disabled={
                  getLogoDisplayOnInvoice.loading ||
                  getQrcodeDisplayOnInvoice.loading ||
                  getMessageDisplayOnInvoice.loading
                }
                disableDeleteOrders={
                  !passwordData.loading ? idx(
                    passwordData,
                    _ => _.data.merchantPassword.deleteOrder.isUsing
                  ) : false
                }
                orderDetailPrintLayout={
                  !merchantOrderDetailPrintLayoutData.loading ? idx(merchantOrderDetailPrintLayoutData,
                    _ => _.data.getMerchantPrintFormatSettings
                  ) : 'A4'
                }
                nameDisplayOnInvoice={
                  !getDesignerNameDisplayOnInvoice.loading ? idx(
                    getDesignerNameDisplayOnInvoice, _ => _.data.getDesignerNameDisplayOnInvoice
                  ) : 'NAME'
                }
                serialNumberUsing={serialNumberUsing}
              />
            </Fragment>
          ) : <Typography style={{ marginTop: 50 }} align='center' component="h4" variant="h4">時間區間請選擇31日以內</Typography>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <ProgressBar
              setProgress={setProgress}
              progress={progress}
              dataLoading={getOrderList.loading}
            />
          </div>
        )}
      </Container>
    </Page>
  )
}

export default OrderManagementList
