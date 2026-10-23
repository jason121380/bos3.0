import { Copy, Download, Pencil } from 'lucide-react'

import { Link } from 'react-router-dom';
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteService from 'hooks/useFetchDeleteService'
import format from 'date-fns/format'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from "react-csv";
import useFetchMerchantHelperItems from 'hooks/useFetchMerchantHelperItems'
import useFetchSettingBatchSettingForHelper from 'hooks/useFetchBatchSettingForHelper'
import idx from 'idx'
import useFetchSettingBatchSettingForDeduction from 'hooks/useFetchBatchSettingForDeduction'
import useFetchMerchantCommissionWay from 'hooks/useFetchMerchantCommissionWay'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import useFetchSetUpdateServicesLaunchedStatus from 'hooks/useFetchSetUpdateServicesLaunchedStatus'
import { Badge } from 'ui/badge'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { formatNumber } from 'ui/format'
import { Field, Input } from 'ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { cn } from 'ui/utils'

import AboutDeductionEditModal from './AboutDeductionEditModal'
import AssistantSettingEditModal from './AssistantSettingEditModal'
import SaleStatusEditModal from './SaleStatusEditModal'

// 業績入帳模式文字（列表與報表匯出共用）
const calcModeText = mode => {
  switch (mode) {
    case 'SELLING':
      return '販賣時入業績'

    case 'USING':
      return '使用時入業績'

    case 'USINGSAVEDEDUCT':
      return '使用時入業績（扣項依販賣時設定）'
    default:
      // 其他值不處理（與原本沒有 default 時相同）
      break
  }
}

function Results({ className, coupons, refetch, ...rest }) {
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null

  const merchantHelperItemsData = useFetchMerchantHelperItems({ merchantId })
  const merchantHelperItems = idx(merchantHelperItemsData, _ => _.data.merchantHelperItems)
  const merchantCommissions = useFetchMerchantCommissionWay()
  const merchantPassword = useFetchMerchantPassword()
  const { setBatchSettingForHelper } = useFetchSettingBatchSettingForHelper()
  const { setBatchSettingForDeduction } = useFetchSettingBatchSettingForDeduction()
  const { updateLaunched } = useFetchSetUpdateServicesLaunchedStatus()

  const [selectedCoupons, setSelectedCoupons] = useState([])
  const [excelData, setExcelData] = useState([])
  const [deleteOrderPwd, setDeleteOrderPwd] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [openEditAssistantModal, setOpenEditAssistantModal] = useState(false)
  const [openEditDeductionModal, setOpenEditDeductionModal] = useState(false)
  const [openEditSaleStatusModal, setOpenEditSaleStatusModal] = useState(false)
  const [deleteCouponIsUsing, setDeleteCouponIsUsing] = useState(false)
  const [helperDeductionSetting, setHelperDeductionSetting] = useState([
    {
      type: '',
      helperDeductionType: 'onSales',
      nameList: [],
      peopleCount: 0,
      point: 0,
      cash: 0,
      percent: 0,
      designatePoint: 0,
      designateCash: 0,
      designatePercent: 0,
      nonDesignatePoint: 0,
      nonDesignateCash: 0,
      nonDesignatePercent: 0,
      isDesignate: false,
      deductionWay: '',
      isSplitted: false,
    },
  ])
  const [saleStatus, setSaleStatus] = useState(true)

  const [serviceDeductionItems, setServiceDeductionItems] = useState([])

  const { deleteService } = useFetchDeleteService()

  useEffect(() => {
    if (!merchantPassword.loading) {
      const deleteCouponIsUsing = idx(
        merchantPassword,
        _ => _.data.merchantPassword.deleteService.isUsing
      )
      setDeleteCouponIsUsing(deleteCouponIsUsing)
    }
  }, [merchantPassword.loading])
  // 只有啟用中的卡券可勾選；全選框以可選取的筆數判斷
  const selectableCount = coupons.filter(coupon => coupon.isUsing).length
  const handleSelectAll = event => {
    const selectedCoupon = event.target.checked
      ? coupons.filter(coupon => coupon.isUsing).map(coupon => coupon.id)
      : []
    setSelectedCoupons(selectedCoupon)
  }
  const handleSelectOne = id => {
    const newSelect = [...selectedCoupons], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedCoupons(newSelect)
  }

  const handleCancel = () => {
    setOpenDialog(true)
  }

  const handleConfirmCancel = () => {
    deleteService({
      itemIds: selectedCoupons,
      password: deleteOrderPwd,
    }).then(() => {
      setOpenDialog(false)
      setDeleteOrderPwd('')
      refetch()
      setSelectedCoupons([])
      openSnackbar({ message: '成功刪除卡券', variant: 'success' })
    })
  }

  const handleUpdateLaunchedStatus = () => {
    updateLaunched({
      input: {
        ids: selectedCoupons,
        status: saleStatus
      }
    }).then(() => {
      refetch()
      setSelectedCoupons([])
      openSnackbar({ message: '變更上架狀態成功', variant: 'success' })
    }).catch(err => {
      openSnackbar({ message: err.message, variant: 'error' })
    })
  }
  useEffect(() => {
    const excelData = []
    coupons.forEach(data => {
      excelData.push({
        代號: data.no,
        類別: data.ServiceCategory !== null ? data.ServiceCategory.name : '無類別',
        名稱: data.name,
        參考價格: data.price,
        可使用次數: data.ticketAvailableCount,
        業績: calcModeText(data.performanceCalculationMode),
        變更者: data.creator === null ? '' : data.creator.name,
        扣項設定數量: data.ticketDeductionCount === 0 ? '無設定' : data.ticketDeductionCount,
        互助設定數量: data.helperDeductionCount === 0 ? '無設定' : data.helperDeductionCount,
        上架狀態: data.isLaunched ? '上架' : '下架',
        變更時間: format(data.updatedAt, 'yyyy/MM/dd'),
      })
    })
    setExcelData(excelData)
  }, [coupons])

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleOpenMutipleEditModal = () => {
    setOpenEditAssistantModal(true)
  }

  const handleCloseAssistSettingModal = () => {
    setOpenEditAssistantModal(false)
    setSelectedCoupons([])
    setHelperDeductionSetting([
      {
        type: '',
        helperDeductionType: 'onSales',
        nameList: [],
        peopleCount: 0,
        point: 0,
        cash: 0,
        percent: 0,
        designatePoint: 0,
        designateCash: 0,
        designatePercent: 0,
        nonDesignatePoint: 0,
        nonDesignateCash: 0,
        nonDesignatePercent: 0,
        isDesignate: false,
        deductionWay: '',
        isSplitted: false,
      },
    ])
  }

  const handleSubmitHelperDeductionSetting = () => {
    const newHelperDeductionSetting = helperDeductionSetting.map(
      ({ deductionWay, isDesignate, ...keepProteries }) => keepProteries
    )

    const input = {
      ids: selectedCoupons,
      helperDeductionSetting: newHelperDeductionSetting,
    }
    setBatchSettingForHelper({ input })
      .then(() => {
        openSnackbar({ variant: 'success', message: '批次卡券互助修改完成' })
        setOpenEditAssistantModal(false)
        setSelectedCoupons([])
        setHelperDeductionSetting([
          {
            type: '',
            helperDeductionType: 'onSales',
            nameList: [],
            peopleCount: 0,
            point: 0,
            cash: 0,
            percent: 0,
            designatePoint: 0,
            designateCash: 0,
            designatePercent: 0,
            nonDesignatePoint: 0,
            nonDesignateCash: 0,
            nonDesignatePercent: 0,
            isDesignate: false,
            deductionWay: '',
            isSplitted: false,
          },
        ])
      })
      .catch(err => {
        openSnackbar({ variant: 'error', message: err.message })
      })
  }

  useEffect(() => {
    if (!merchantCommissions.loading) {
      setServiceDeductionItems(
        idx(merchantCommissions.data, _ =>
          _.merchantCommissionWay.map(data => ({
            type: data.name,
            itemSettings: [
              {
                isSpecial: false,
                name: '材料費',
                type: 'onSales',
                deductionWay: '',
                price: 0,
                designatePrice: 0,
                nonDesignatePrice: 0,
                deductionOrder: 1,
                deductionReference: 0,
              },
            ],
          }))
        )
      )
    }
  }, [merchantCommissions.loading])

  const handleOpenEditDeductionModal = () => {
    setOpenEditDeductionModal(true)
  }
  const handleOpenEditSaleStatusModal = () => {
    setOpenEditSaleStatusModal(true)
  }
  const handlecloseEditSaleStatusModal = () => {
    setOpenEditSaleStatusModal(false)
  }
  const handleCloseDeductionSettingModal = () => {
    setOpenEditDeductionModal(false)
    setSelectedCoupons([])
    if (!merchantCommissions.loading) {
      setServiceDeductionItems(
        idx(merchantCommissions.data, _ =>
          _.merchantCommissionWay.map(data => ({
            type: data.name,
            itemSettings: [
              {
                isSpecial: false,
                name: '材料費',
                type: 'onSales',
                deductionWay: '',
                price: 0,
                designatePrice: 0,
                nonDesignatePrice: 0,
                deductionOrder: 1,
                deductionReference: 0,
              },
            ],
          }))
        )
      )
    }
  }

  const handleSubmitDeductionSetting = () => {
    const input = {
      ids: selectedCoupons,
      serviceDeductionItems: serviceDeductionItems,
    }

    setBatchSettingForDeduction({ input })
      .then(() => {
        openSnackbar({ variant: 'success', message: '批次卡券扣項修改完成' })
        setOpenEditDeductionModal(false)
        setSelectedCoupons([])
      })
      .catch(err => {
        openSnackbar({ variant: 'error', message: err.message })
      })
  }

  const handleSubmitDeductionSettingWarning = () => {
    openSnackbar({
      message: '您確定要批次編緝?，此步驟將會覆蓋原先設定',
      variant: 'error',
      disableHide: true,
      groupEdit: true,
      handleSubmitDeductionSetting: handleSubmitDeductionSetting,
    })
  }

  const handleSubmitHelperDeductionSettingWarning = () => {
    openSnackbar({
      message: '您確定要批次編緝?，此步驟將會覆蓋原先設定',
      variant: 'error',
      disableHide: true,
      groupEdit: true,
      serviceHelperGroupEdit: true,
      handleSubmitHelperDeductionSetting: handleSubmitHelperDeductionSetting,
    })
  }

  // 不可點的列操作（停用的卡券）：連結無 disabled 屬性，比照 MUI ButtonBase 改用 aria-disabled + 取消指標事件
  const linkDisabled = disabledLink => (disabledLink ? { 'aria-disabled': true, tabIndex: -1, className: 'pointer-events-none opacity-40' } : {})
  return (
    <div {...rest}>
      <Card>
        <CardHeader
          className="items-center pb-4"
          action={
            <Button asChild size="sm" variant="secondary">
              <CSVLink data={excelData} filename="卡券列表.csv">
                <Download strokeWidth={1.75} />
                報表匯出
              </CSVLink>
            </Button>
          }
        >
          <div className="flex items-baseline gap-3">
            <CardTitle>所有預收卡</CardTitle>
            <span className="text-label tabular-nums text-text-secondary">
              共 {coupons !== undefined && coupons.length} 筆
            </span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    aria-label="全選"
                    checked={selectableCount > 0 && selectedCoupons.length === selectableCount}
                    indeterminate={
                      selectedCoupons.length > 0 && selectedCoupons.length < selectableCount
                    }
                    onChange={handleSelectAll}
                    disabled={coupons.filter(d => !d.isUsing).length === coupons.length}
                  />
                </TableHead>
                <TableHead className="min-w-[60px]">操作</TableHead>
                <TableHead className="min-w-[80px]">代號</TableHead>
                <TableHead className="min-w-[100px]">類別</TableHead>
                <TableHead className="min-w-[150px]">名稱</TableHead>
                <TableHead numeric className="min-w-[100px]">參考價格</TableHead>
                <TableHead numeric className="min-w-[100px]">可使用次數</TableHead>
                <TableHead className="min-w-[130px]">業績</TableHead>
                <TableHead className="min-w-[100px]">變更者</TableHead>
                <TableHead className="min-w-[120px]">扣項設定數量</TableHead>
                <TableHead className="min-w-[120px]">互助設定數量</TableHead>
                <TableHead className="min-w-[100px]">上架狀態</TableHead>
                <TableHead className="min-w-[120px]">變更時間</TableHead>
                <TableHead className="min-w-[80px]">建立副本</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((data, idx) => (
                <TableRow
                  key={`coupon-${idx}`}
                  disabled={!data.isUsing}
                  data-state={selectedCoupons.indexOf(data.id) !== -1 ? 'selected' : undefined}
                  className="whitespace-nowrap"
                >
                  <TableCell>
                    <Checkbox
                      aria-label={`選取 ${data.name}`}
                      checked={selectedCoupons.indexOf(data.id) !== -1}
                      value={selectedCoupons.indexOf(data.id) !== -1}
                      onChange={() => handleSelectOne(data.id)}
                      disabled={!data.isUsing}
                    />
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                      <RouterLink
                        aria-label="編輯卡券"
                        to={`/coupon/edit/${data.id}`}
                        {...linkDisabled(!data.isUsing)}
                      >
                        <Pencil strokeWidth={1.75} />
                      </RouterLink>
                    </Button>
                  </TableCell>
                  <TableCell>{data.no}</TableCell>
                  <TableCell>
                    {data.ServiceCategory !== null ? data.ServiceCategory.name : '無類別'}
                  </TableCell>
                  <TableCell>{data.name}</TableCell>
                  <TableCell numeric>{formatNumber(data.price)}</TableCell>
                  <TableCell numeric>{formatNumber(data.ticketAvailableCount)}</TableCell>
                  <TableCell>{calcModeText(data.performanceCalculationMode)}</TableCell>
                  <TableCell>{data.creator === null ? '' : data.creator.name}</TableCell>
                  <TableCell className={cn('tabular-nums', data.ticketDeductionCount === 0 && 'font-medium text-danger')}>
                    {data.ticketDeductionCount === 0 ? '無設定' : data.ticketDeductionCount}
                  </TableCell>
                  <TableCell className={cn('tabular-nums', data.helperDeductionCount === 0 && 'font-medium text-danger')}>
                    {data.helperDeductionCount === 0 ? '無設定' : data.helperDeductionCount}
                  </TableCell>
                  <TableCell>
                    <Badge variant={data.isLaunched ? 'success' : 'neutral'}>{data.isLaunched ? '上架' : '下架'}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{format(data.updatedAt, 'yyyy/MM/dd')}</TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                      <Link to={`coupon/duplicate/${data.id}`} aria-label="建立副本">
                        <Copy strokeWidth={1.75} />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      <TableEditBar
        selected={selectedCoupons}
        onDelete={deleteCouponIsUsing ? handleCancel : handleConfirmCancel}
        onEdit={handleOpenMutipleEditModal}
        onEditDeduction={handleOpenEditDeductionModal}
        onEditSaleStatus={handleOpenEditSaleStatusModal}
      />
      <Dialog open={openDialog} onOpenChange={o => !o && handleCloseDialog()}>
        <DialogContent aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogHeader>
            <DialogTitle id="alert-dialog-title">{'刪除卡券'}</DialogTitle>
            <DialogDescription id="alert-dialog-description">刪除後無法復原，請輸入刪除密碼確認。</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Field label="刪除密碼" htmlFor="delete-coupon-password">
              <Input
                id="delete-coupon-password"
                type="password"
                value={deleteOrderPwd}
                onChange={event => setDeleteOrderPwd(event.target.value)}
                data-testid="delete-password"
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button variant="danger" onClick={handleConfirmCancel} autoFocus data-testid="confirm">
              確認
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {openEditAssistantModal && (
        <AssistantSettingEditModal
          openEditAssistantModal={openEditAssistantModal}
          merchantHelperItems={merchantHelperItems}
          onClose={() => handleCloseAssistSettingModal()}
          helperDeductionSetting={helperDeductionSetting}
          setHelperDeductionSetting={setHelperDeductionSetting}
          handleSubmitHelperDeductionSettingWarning={handleSubmitHelperDeductionSettingWarning}
        />
      )}
      {openEditDeductionModal && (
        <AboutDeductionEditModal
          openEditDeductionModal={openEditDeductionModal}
          ServiceDeductionItems={serviceDeductionItems}
          onClose={() => handleCloseDeductionSettingModal()}
          setServiceDeductionItems={setServiceDeductionItems}
          handleSubmitDeductionSettingWarning={handleSubmitDeductionSettingWarning}
        />
      )}
      {openEditSaleStatusModal && (
        <SaleStatusEditModal
          openEditSaleStatusModal={openEditSaleStatusModal}
          saleStatus={saleStatus}
          setSaleStatus={setSaleStatus}
          onClose={() => handlecloseEditSaleStatusModal()}
          handleUpdateLaunchedStatus={handleUpdateLaunchedStatus}
        />
      )}
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.object,
}

export default Results
