import DateSelector from 'components/DateSelector'
import MerchantSearchBar from 'components/MerchantSearchBar'
import Page from 'components/Page'
import { endOfDay, startOfDay } from 'date-fns'
import { useFetchPendingOrders } from 'hooks/useFetchOrders'
import idx from 'idx'
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
import isExportCustomerMasked from 'helper/exportCustomerMask'

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
  // 匯出客資遮罩：設定確定是「不遮罩」(false) 才匯出完整姓名電話；載入中或查詢失敗一律遮罩（個資寧可多遮，Codex review PR #254）
  const [isCustomerDataMarked, setIsCustomerDataMarked] = React.useState(true)
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
      // 查詢失敗時以空列表計算，不整頁錯誤（Jason 2026/10/22）
      const allOrers = idx(orders, _ => _.data.pendingOrders.orders) || []
      const memberRecord = allOrers.map(d => d.membershipOrders).flat()
      const membership = memberRecord.some(({ price }) => price !== 0)
      // membership 是布林：未啟用會員卡且沒有會員卡金額時不顯示會員卡欄（原本比較 membership !== 0 永遠為 true，Jason 2026/10/22）
      setMembershipDisplay(Boolean(isMemberShipCardActive || membership))
    }
  }, [isMemberShipCardActiveData.loading, orders.loading])
  React.useEffect(() => {
    if (!customerBonusActive.loading && !orders.loading) {
      const bonusActive = idx(
        customerBonusActive,
        _ => _.data.getIsCustomerBonusActive
      )
      const allOrers = idx(orders, _ => _.data.pendingOrders.orders) || []
      const bonus = allOrers.some(({ bonusDecount }) => bonusDecount !== 0)
      setBonusDisplay(bonusActive || bonus)
    }
  }, [customerBonusActive.loading, orders.loading])
  React.useEffect(() => {
    if (!customerDataMarkedData.loading) {
      setIsCustomerDataMarked(isExportCustomerMasked(customerDataMarkedData))
    }
  }, [customerDataMarkedData.loading, customerDataMarkedData.error])

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
      // 沒啟用或沒有 logo 網址時 imageUrl 是 null；不要 fetch(null)（會打到 /null）
      if (logo && logo.imageUrl) {
        const getDataUrl = async () => {
          let blob = await fetch(logo.imageUrl).then(r => r.blob());
          let dataUrl = await new Promise(resolve => {
            let reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.readAsDataURL(blob)
          })
          setImgUrl(dataUrl)
        }
        // 商家 logo 抓不到時列印不印 logo（原本就是如此）；補 catch 只為不留下未處理的 Promise 錯誤
        getDataUrl().catch(() => {})
      }
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
