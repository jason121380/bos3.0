import DateSelector from 'components/DateSelector'
import MerchantSearchBar from 'components/MerchantSearchBar'
import Page from 'components/Page'
import { endOfDay, startOfDay } from 'date-fns'
import { useFetchPendingOrders } from 'hooks/useFetchOrders'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import useFetchCustomerDataMarked from 'hooks/useFetchGetCustomerDataMarkedDefault'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsCustomerBonusActive from 'hooks/useFetchGetIsCustomerBonusActive'
import useFetchGetLogoDisplayOnInvoice from 'hooks/useFetchGetLogoDisplayOnInvoice'
import useFetchGetQrcodeDisplayOnInvoice from 'hooks/useFetchGetQrcodeDisplayOnInvoice'
import useFetchGetMessageDisplayOnInvoice from 'hooks/useFetchGetMessageDisplayOnInvoice'
import { useFetchMerchantPasswordIsUsing } from 'hooks/useFetchMerchantPassword'
import useFetchMerchantOrderDetailPrintLayout from 'hooks/useFetchGetMerchantPrintFormatSettings'
import useFetchGetDesignerNameDisplayOnInvoice from 'hooks/useFetchGetDesignerNameDisplayOnInvoice'
import { useFetchGetIsPrintWindowClosureDelayed } from 'hooks/useFetchGetParameterOrderCreateSetting'
import { useFetchGetDisablePendingOrder } from 'hooks/useFetchGetParameterAboutSettingFunction'
import useCheckDisablePendingOrder from 'hooks/useCheckDisablePendingOrder'
import { Link as RouterLink } from 'react-router-dom'
import QRCode from 'qrcode'
import { ListFilter, Plus } from 'lucide-react'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { PageHeader, Toolbar, ToolbarSpacer } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import ResultsV2 from './ResultsV2'

function DraftOrderManagementList() {
  const customerDataMarkedData = useFetchCustomerDataMarked()
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const customerBonusActive = useFetchGetIsCustomerBonusActive()
  const getLogoDisplayOnInvoice = useFetchGetLogoDisplayOnInvoice()
  const getQrcodeDisplayOnInvoice = useFetchGetQrcodeDisplayOnInvoice()
  const getMessageDisplayOnInvoice = useFetchGetMessageDisplayOnInvoice()
  const passwordData = useFetchMerchantPasswordIsUsing()
  const merchantOrderDetailPrintLayoutData = useFetchMerchantOrderDetailPrintLayout()
  const getDesignerNameDisplayOnInvoice = useFetchGetDesignerNameDisplayOnInvoice()
  const getIsPrintWindowClosureDelayed = useFetchGetIsPrintWindowClosureDelayed()

  const [pageSetting, setPageSetting] = React.useState({
    pageLimit: 1000,
    pageOffset: 0,
    startDate: startOfDay(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
    customerId: '',
    employeeId: '',
    isReserved: false,
    payWay: [],
    thirdPartTicketName: '',
    thirdPartTicketId: '',
    isPending: true,
    source: null
  })
  const [progress, setProgress] = React.useState(0)
  const [isCustomerDataMarked, setIsCustomerDataMarked] = React.useState(false)
  const [membershipDisplay, setMembershipDisplay] = React.useState(false)
  const [bonusDisplay, setBonusDisplay] = React.useState(false)
  const [showFilter, setShowFilter] = React.useState(false)
  const getDisablePendingOrder = useFetchGetDisablePendingOrder()

  const orders = useFetchPendingOrders({
    dateRange: {
      startDate: pageSetting.startDate,
      endDate: pageSetting.endDate,
    },
    designerId: pageSetting.employeeId || null,
    customerId: pageSetting.customerId || null,
    otherPayWay: pageSetting.payWay.length === 0 ? null : pageSetting.payWay,
    thirdPartTicketId: pageSetting.thirdPartTicketId || null,
    sources: pageSetting.source ? [pageSetting.source] : [],
    pageLimit: pageSetting.pageLimit,
    pageOffset: pageSetting.pageOffset,
  })
  const orderList = idx(orders, _ => _.data.pendingOrders.orders) || []
  const refetch = idx(orders, _ => _.refetch)
  const totalCount = idx(orders, _ => _.data.pendingOrders.totalCount) || 0

  const [qrcodeUrl, setQrcodeUrl] = React.useState('')
  const [imgUrl, setImgUrl] = React.useState('')
  const [closureDelayed, setClosureDelayed] = React.useState(false)
  const [detailInfo, setDetailInfo] = React.useState({
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
  React.useEffect(() => {
    if (!getIsPrintWindowClosureDelayed.loading) {
      const data = idx(getIsPrintWindowClosureDelayed, _ => _.data.getParameterOrderCreateSetting.isPrintWindowClosureDelayed)
      setClosureDelayed(data)
    }
  }, [getIsPrintWindowClosureDelayed.loading])
  React.useEffect(() => {
    if (!isMemberShipCardActiveData.loading && !orders.loading) {
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      const allOrers = orders.data.pendingOrders.orders
      const memberRecord = allOrers.map(d => d.membershipOrders).flat()
      const membership = memberRecord.some(({ price }) => price !== 0)
      setMembershipDisplay(isMemberShipCardActive || membership !== 0)
    }
  }, [isMemberShipCardActiveData.loading, orders.loading])
  React.useEffect(() => {
    if (!customerBonusActive.loading && !orders.loading) {
      const bonusActive = idx(
        customerBonusActive,
        _ => _.data.getIsCustomerBonusActive
      )
      const allOrers = orders.data.pendingOrders.orders
      const bonus = allOrers.some(({ bonusDecount }) => bonusDecount !== 0)
      setBonusDisplay(bonusActive || bonus)
    }
  }, [customerBonusActive.loading, orders.loading])
  React.useEffect(() => {
    if (!customerDataMarkedData.loading) {
      const customerDataMarked = idx(
        customerDataMarkedData,
        _ => _.data.getCustomerDataMarkedDefault
      )
      setIsCustomerDataMarked(customerDataMarked)
    }
  }, [customerDataMarkedData.loading])

  React.useEffect(() => {
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

  useCheckDisablePendingOrder()

  return (
    <Page className="ui-root" title="掛單列表">
      <PageHeader
        title="掛單列表"
        actions={
          <Button asChild variant="primary">
            <RouterLink to="/order/create">
              <Plus strokeWidth={1.75} />
              新開單
            </RouterLink>
          </Button>
        }
      />
      <Toolbar>
        <DateSelector
          attributes={['dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
          date={{ startDate: pageSetting.startDate, endDate: pageSetting.endDate }}
          dateChange={value => setPageSetting(prev => ({ ...prev, ...value }))}
          margin={false}
        />
        <ToolbarSpacer />
        <Button
          variant="secondary"
          aria-pressed={showFilter}
          className={showFilter ? 'border-text bg-surface-hover' : undefined}
          onClick={() => setShowFilter(!showFilter)}
        >
          <ListFilter strokeWidth={1.75} />
          篩選
        </Button>
      </Toolbar>

      {showFilter && (
        <Card className="mb-6 p-4">
          <MerchantSearchBar
            values={pageSetting}
            onFilter={value => setPageSetting(value)}
            outside
            visible={['employee', 'customer', 'payment', 'thirdPartyCoupon', 'source']}
            hideStartDate={true}
            getThirdPartyName={true}
          />
        </Card>
      )}
      {!orders.loading ? (
        <ResultsV2
          orders={orderList}
          pageSetting={pageSetting}
          refetch2={refetch}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          isCustomerDataMarked={isCustomerDataMarked}
          membershipDisplay={membershipDisplay}
          bonusDisplay={bonusDisplay}
          bonusActive={!customerBonusActive.loading ? idx(customerBonusActive, _ => _.data.getIsCustomerBonusActive) : false}
          qrcodeUrl={qrcodeUrl}
          imgUrl={imgUrl}
          detailInfo={detailInfo}
          closureDelayed={closureDelayed}
          disabled={
            getLogoDisplayOnInvoice.loading ||
            getQrcodeDisplayOnInvoice.loading ||
            getMessageDisplayOnInvoice.loading
          }
          passwordEnabled={
            !passwordData.loading ? ({
              delete: idx(passwordData, _ => _.data.merchantPassword.deleteOrder.isUsing),
              checkout: idx(passwordData, _ => _.data.merchantPassword.reCheckoutOrder.isUsing),
            }) : ({
              delete: false,
              checkout: false
            })
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
        />
      ) : (
        // 載入中：與舊版 ProgressBar 相同時機顯示（orders.loading）
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="載入中">
          <Skeleton className="h-[320px] w-full rounded-lg" />
        </div>
      )}
    </Page>
  )
}

export default DraftOrderManagementList
