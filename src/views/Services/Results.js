import { Copy, Download, Pencil } from 'lucide-react'

import { Link } from 'react-router-dom'
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteService from 'hooks/useFetchDeleteService'
import idx from 'idx'
import format from 'date-fns/format'
import { useState, useEffect, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from 'react-csv'
import useFetchMerchantHelperItems from 'hooks/useFetchMerchantHelperItems'
import useFetchSettingBatchSettingForHelper from 'hooks/useFetchBatchSettingForHelper'
import useFetchSettingBatchSettingForDeduction from 'hooks/useFetchBatchSettingForDeduction'
import useFetchMerchantCommissionWay from 'hooks/useFetchMerchantCommissionWay'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import paginationLabel from './../../helper/paginationLabel'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { formatNumber } from 'ui/format'
import { Field, Input } from 'ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TablePagination, TableRow } from 'ui/table'
import { cn } from 'ui/utils'

import AboutDeductionEditModal from './AboutDeductionEditModal'
import AssistantSettingEditModal from './AssistantSettingEditModal'

function Results({ className, services, refetchService, onPageChange, onRowsPerPageChange, ...rest }) {
  const pageRef = useRef(null)
  const merchantId = localStorage.getItem('userMerchant') ? JSON.parse(localStorage.getItem('userMerchant')).id : null

  const merchantHelperItemsData = useFetchMerchantHelperItems({ merchantId })
  const { setBatchSettingForHelper } = useFetchSettingBatchSettingForHelper()
  const { setBatchSettingForDeduction } = useFetchSettingBatchSettingForDeduction()
  const merchantCommissions = useFetchMerchantCommissionWay()
  const merchantHelperItems = idx(merchantHelperItemsData, _ => _.data.merchantHelperItems)
  const [selectedService, setSelectedService] = useState([])
  const [deleteOrderPwd, setDeleteOrderPwd] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [openEditAssistantModal, setOpenEditAssistantModal] = useState(false)
  const [openEditDeductionModal, setOpenEditDeductionModal] = useState(false)
  const { deleteService } = useFetchDeleteService()
  const [excelData, setExcelData] = useState([])
  const [disableDeleteService, setDisableDeleteService] = useState(false)
  const passwordData = useFetchMerchantPassword()

  useEffect(() => {
    if (!passwordData.loading) {
      const disableDeleteService = idx(passwordData, _ => _.data.merchantPassword.deleteService.isUsing)
      setDisableDeleteService(disableDeleteService)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [passwordData.loading])

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
  const [serviceDeductionItems, setServiceDeductionItems] = useState([])

  // 只有啟用中的服務可勾選；全選框以可選取的筆數判斷
  const selectableCount = services.data.filter(d => d.isUsing).length
  const handleSelectAll = event => {
    const newSelectedService = event.target.checked ? services.data.filter(d => d.isUsing).map(service => service.id) : []
    setSelectedService(newSelectedService)
  }
  const handleSelectOne = id => {
    const newSelect = [...selectedService],
      index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedService(newSelect)
  }

  const handleCancel = () => {
    setOpenDialog(true)
  }

  const handleConfirmCancel = () => {
    deleteService(disableDeleteService ? { itemIds: selectedService, password: deleteOrderPwd } : { itemIds: selectedService }).then(() => {
      setOpenDialog(false)
      setDeleteOrderPwd('')
      refetchService()
      setSelectedService([])
      openSnackbar({
        message: '成功刪除服務',
        variant: 'success',
      })
    })
  }

  useEffect(() => {
    const excelData = []
    services.data.forEach(data => {
      excelData.push({
        代號: data.no,
        名稱: data.name,
        類別: idx(data, _ => _.serviceCategory.name),
        參考價格: data.price,
        扣項設定數量: data.serviceDeductionCount === 0 ? '無扣項' : data.serviceDeductionCount,
        互助設定數量: data.helperDeductionCount === 0 ? '無設定' : data.helperDeductionCount,
        變更時間: format(data.updatedAt, 'yyyy/MM/dd'),
      })
    })
    setExcelData(excelData)
  }, [services])

  const handleOnChangePage = (_event, nextPage) => {
    onPageChange({
      value: nextPage,
      key: 'pageOffset',
    })
    refetchService()
  }

  // 改每頁筆數時頁碼歸 0（index.js 的 handleRowsPerPageChange）
  const handleOnChangeRowsPerPage = event => {
    onRowsPerPageChange(event)
    refetchService()
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleOpenMutipleEditModal = () => {
    setOpenEditAssistantModal(true)
  }

  const handleCloseAssistSettingModal = () => {
    setOpenEditAssistantModal(false)
    setSelectedService([])
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
    const newHelperDeductionSetting = helperDeductionSetting.map(({ deductionWay, isDesignate, ...keepProteries }) => keepProteries)

    const input = {
      ids: selectedService,
      helperDeductionSetting: newHelperDeductionSetting,
    }
    setBatchSettingForHelper({ input })
      .then(() => {
        openSnackbar({ variant: 'success', message: '批次服務互助修改完成' })
        setOpenEditAssistantModal(false)
        setSelectedService([])
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
        // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [merchantCommissions.loading, openEditDeductionModal])

  const handleOpenEditDeductionModal = () => {
    setOpenEditDeductionModal(true)
  }

  const handleCloseDeductionSettingModal = () => {
    setOpenEditDeductionModal(false)
    setSelectedService([])
    if (!merchantCommissions.loading) {
      setServiceDeductionItems(
        idx(merchantCommissions.data, _ =>
          _.merchantCommissionWay.map(data => ({
            type: data.name,
            itemSettings: [
              {
                isSpecial: false,
                name: '',
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
      ids: selectedService,
      serviceDeductionItems: serviceDeductionItems,
    }

    setBatchSettingForDeduction({ input })
      .then(() => {
        openSnackbar({ variant: 'success', message: '批次服務扣項修改完成' })
        setOpenEditDeductionModal(false)
        setSelectedService([])
      })
      .catch(err => {
        // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
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

  useEffect(() => {
    if (pageRef.current) {
      paginationLabel(pageRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pageRef.current 放進依賴，讓分頁元件掛上 DOM 後的下一次 render 補上中文分頁標籤
  }, [services, pageRef.current])

  // 不可點的列操作（停用的服務）：連結無 disabled 屬性，比照 MUI ButtonBase 改用 aria-disabled + 取消指標事件
  const linkDisabled = disabledLink => (disabledLink ? { 'aria-disabled': true, tabIndex: -1, className: 'pointer-events-none opacity-40' } : {})
  return (
    <div {...rest}>
      <Card>
        <CardHeader
          className="items-center pb-4"
          action={
            <Button asChild size="sm" variant="secondary">
              <CSVLink data={excelData} filename="服務項目.csv">
                <Download strokeWidth={1.75} />
                報表匯出
              </CSVLink>
            </Button>
          }
        >
          <div className="flex items-baseline gap-3">
            <CardTitle>所有營業服務</CardTitle>
            <span className="text-label tabular-nums text-text-secondary">共 {services.totalCount} 筆</span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    aria-label="全選"
                    checked={selectedService.length === selectableCount && selectableCount > 0}
                    indeterminate={selectedService.length > 0 && selectedService.length < selectableCount}
                    onChange={handleSelectAll}
                    disabled={services.data.length === 0 || services.data.filter(d => !d.isUsing).length === services.data.length}
                  />
                </TableHead>
                <TableHead>操作</TableHead>
                <TableHead>代號</TableHead>
                <TableHead>類別</TableHead>
                <TableHead>名稱</TableHead>
                <TableHead numeric>參考價格</TableHead>
                <TableHead>扣項設定數量</TableHead>
                <TableHead>互助設定數量</TableHead>
                <TableHead>變更時間</TableHead>
                <TableHead>建立副本</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.data.map((data, index) => (
                <TableRow key={`${data.name}-${index}`} data-state={selectedService.indexOf(data.id) > -1 || !data.isUsing ? 'selected' : undefined}>
                  <TableCell>
                    <Checkbox
                      aria-label={`選取 ${data.name}`}
                      onChange={() => handleSelectOne(data.id)}
                      checked={selectedService.indexOf(data.id) > -1}
                      disabled={!data.isUsing}
                    />
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon" className="text-text-secondary">
                      <RouterLink aria-label="編輯服務" to={`/service/edit/${data.id}`} {...linkDisabled(!data.isUsing)}>
                        <Pencil strokeWidth={1.75} />
                      </RouterLink>
                    </Button>
                  </TableCell>
                  <TableCell>{data.no}</TableCell>
                  <TableCell>{idx(data, _ => (_.serviceCategory !== null ? _.serviceCategory.name : '無分類'))}</TableCell>
                  <TableCell>{data.name}</TableCell>
                  <TableCell numeric>{formatNumber(data.price)}</TableCell>
                  <TableCell className={cn('tabular-nums', data.serviceDeductionCount === 0 && 'font-medium text-danger')}>
                    {data.serviceDeductionCount === 0 ? '無扣項' : data.serviceDeductionCount}
                  </TableCell>
                  <TableCell className={cn('tabular-nums', data.helperDeductionCount === 0 && 'font-medium text-danger')}>
                    {data.helperDeductionCount === 0 ? '無設定' : data.helperDeductionCount}
                  </TableCell>
                  <TableCell className="tabular-nums">{format(data.updatedAt, 'yyyy/MM/dd')}</TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon" className="text-text-secondary">
                      <Link to={`service/duplicate/${data.id}`} aria-label="建立副本">
                        <Copy strokeWidth={1.75} />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* pageRef 保留給 paginationLabel（只改寫 MUI 分頁的英文標籤；新分頁已是中文，找不到 MUI 元素時不做事） */}
          <div ref={pageRef}>
            <TablePagination
              count={services.totalCount}
              onPageChange={handleOnChangePage}
              onRowsPerPageChange={handleOnChangeRowsPerPage}
              page={services.pageOffset}
              rowsPerPage={services.pageLimit}
              rowsPerPageOptions={[5, 10, 25, 50, 1000]}
            />
          </div>
        </div>
      </Card>
      <TableEditBar
        selected={selectedService}
        onDelete={disableDeleteService ? handleCancel : handleConfirmCancel}
        onEdit={handleOpenMutipleEditModal}
        onEditDeduction={handleOpenEditDeductionModal}
      />
      <Dialog open={openDialog} onOpenChange={o => !o && handleCloseDialog()}>
        <DialogContent aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogHeader>
            <DialogTitle id="alert-dialog-title">{'刪除服務'}</DialogTitle>
            <DialogDescription id="alert-dialog-description">刪除後無法復原，請輸入刪除密碼確認。</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Field label="刪除密碼" htmlFor="delete-service-password">
              <Input
                id="delete-service-password"
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
    </div>
  )
}

export default Results
