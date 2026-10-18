/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardContent, CardHeader, Checkbox, Divider, Table,
  TableBody, TableCell, TableHead, TableRow, Typography, Dialog,
  DialogTitle, DialogContent, DialogContentText, TextField,
  DialogActions, IconButton
} from '@mui/material'
import { Edit as EditIconSlot, ContentCopy as ContentCopyIcon } from 'ui/icons'

import { Link } from 'react-router-dom';
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteService from 'hooks/useFetchDeleteService'
import format from 'date-fns/format'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from "react-csv";
import useFetchMerchantHelperItems from 'hooks/useFetchMerchantHelperItems'
import useFetchSettingBatchSettingForHelper from 'hooks/useFetchBatchSettingForHelper'
import idx from 'idx'
import useFetchSettingBatchSettingForDeduction from 'hooks/useFetchBatchSettingForDeduction'
import useFetchMerchantCommissionWay from 'hooks/useFetchMerchantCommissionWay'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import useFetchSetUpdateServicesLaunchedStatus from 'hooks/useFetchSetUpdateServicesLaunchedStatus'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import AboutDeductionEditModal from './AboutDeductionEditModal'
import AssistantSettingEditModal from './AssistantSettingEditModal'
import SaleStatusEditModal from './SaleStatusEditModal'

const styles = {
  card: css({
    borderRadius: '16px',
    boxShadow: 'none',
    border: '1px solid rgb(var(--border))',
  }),
  header: css({
    padding: '12px 24px 4px 24px',
    '& .MuiCardHeader-title': {
      width: '100%',
    }
  }),
  tableHead: css({
    backgroundColor: 'rgb(var(--background))',
    '& .MuiTableCell-head': {
      color: 'rgb(var(--text))',
      fontWeight: 'bold',
      borderBottom: '1px solid rgb(var(--border))',
      height: '40px !important',
      padding: '2px 16px !important',
      fontSize: '14px',
    }
  }),
  tableRow: css({
    height: '40px !important',
    minHeight: '40px !important',
    '& .MuiTableCell-body': {
      padding: '2px 16px !important',
      borderBottom: '1px solid rgb(var(--border))',
      fontSize: '14px !important',
      color: 'rgb(var(--text))',
    },
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
  }),
  actionButton: css({
    padding: '4px !important',
    color: 'rgb(var(--text-tertiary)) !important',
    '&:hover': {
      color: 'rgb(var(--accent)) !important',
      backgroundColor: 'rgba(26, 115, 232, 0.04) !important',
    }
  }),
  csvBtn: css({
    borderRadius: '20px !important',
    padding: '6px 20px !important',
    fontSize: '14px !important',
    boxShadow: 'none !important',
    fontWeight: 'bold !important',
    backgroundColor: 'rgb(var(--surface)) !important',
    color: 'rgb(var(--text-secondary)) !important',
    '&:hover': {
      backgroundColor: 'rgb(var(--surface)) !important',
    }
  }),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 700,
  }),
  notSetting: css({
    color: 'red',
    fontWeight: 'bold',
  }),
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
        業績: data.performanceCalculationMode === "SELLING" ? '販賣時入業績' : '使用時入業績',
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
        openSnackbar({ variant: 'error', message: err.msg })
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
        openSnackbar({ variant: 'error', message: err.msg })
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

  const calcModeText = mode => {
    switch (mode) {
      case 'SELLING':
        return '販賣時入業績'

      case 'USING':
        return '使用時入業績'

      case 'USINGSAVEDEDUCT':
        return '使用時入業績（扣項依販賣時設定）'
    }
  }

  return (
    <div {...rest} css={className}>
      <Card css={styles.card}>
        <CardHeader
          css={styles.header}
          action={
            <CSVLink data={excelData} filename="卡券列表.csv">
              <Button variant="contained" css={styles.csvBtn} size="small">
                報表匯出
              </Button>
            </CSVLink>
          }
          title={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Typography variant="h6" style={{ fontWeight: 'bold', color: 'rgb(var(--text))' }}>
                所有預收卡
              </Typography>
              <Typography color="textSecondary" variant="body2">
                共 {coupons !== undefined && coupons.length} 筆
              </Typography>
            </div>
          }
        />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table size="small">
                <TableHead css={styles.tableHead}>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedCoupons.length === coupons.length}
                        color="primary"
                        indeterminate={
                          selectedCoupons.length > 0 && selectedCoupons.length < coupons.length
                        }
                        onChange={handleSelectAll}
                        disabled={coupons.filter(d => !d.isUsing).length === coupons.length}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: '60px' }}>操作</TableCell>
                    <TableCell sx={{ minWidth: '80px' }}>代號</TableCell>
                    <TableCell sx={{ minWidth: '100px' }}>類別</TableCell>
                    <TableCell sx={{ minWidth: '150px' }}>名稱</TableCell>
                    <TableCell sx={{ minWidth: '100px' }}>參考價格</TableCell>
                    <TableCell sx={{ minWidth: '100px' }}>可使用次數</TableCell>
                    <TableCell sx={{ minWidth: '130px', whiteSpace: 'nowrap' }}>業績</TableCell>
                    <TableCell sx={{ minWidth: '100px' }}>變更者</TableCell>
                    <TableCell sx={{ minWidth: '120px' }}>扣項設定數量</TableCell>
                    <TableCell sx={{ minWidth: '120px' }}>互助設定數量</TableCell>
                    <TableCell sx={{ minWidth: '100px' }}>上架狀態</TableCell>
                    <TableCell sx={{ minWidth: '120px' }}>變更時間</TableCell>
                    <TableCell sx={{ minWidth: '80px' }}>建立副本</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {coupons.map((data, idx) => (
                    <TableRow
                      hover
                      key={`coupon-${idx}`}
                      disabled={!data.isUsing}
                      selected={selectedCoupons.indexOf(data.id) !== -1}
                      css={styles.tableRow}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={selectedCoupons.indexOf(data.id) !== -1}
                          value={selectedCoupons.indexOf(data.id) !== -1}
                          onChange={() => handleSelectOne(data.id)}
                          disabled={!data.isUsing}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          component={RouterLink}
                          css={styles.actionButton}
                          to={`/coupon/edit/${data.id}`}
                          disabled={!data.isUsing}
                          size="small"
                        >
                          <EditIconSlot fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{data.no}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {data.ServiceCategory !== null ? data.ServiceCategory.name : '無類別'}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{data.name}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{data.price}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{data.ticketAvailableCount}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{calcModeText(data.performanceCalculationMode)}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{data.creator === null ? '' : data.creator.name}</TableCell>
                      <TableCell
                        css={data.ticketDeductionCount === 0 ? styles.notSetting : {}}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        {data.ticketDeductionCount === 0 ? '無設定' : data.ticketDeductionCount}
                      </TableCell>
                      <TableCell
                        css={data.helperDeductionCount === 0 ? styles.notSetting : {}}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        {data.helperDeductionCount === 0 ? '無設定' : data.helperDeductionCount}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{data.isLaunched ? '上架' : '下架'}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{format(data.updatedAt, 'yyyy/MM/dd')}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Link to={`coupon/duplicate/${data.id}`}>
                          <IconButton size="small">
                            <ContentCopyIcon fontSize='small' />
                          </IconButton>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
      </Card>
      <TableEditBar
        selected={selectedCoupons}
        onDelete={deleteCouponIsUsing ? handleCancel : handleConfirmCancel}
        onEdit={handleOpenMutipleEditModal}
        onEditDeduction={handleOpenEditDeductionModal}
        onEditSaleStatus={handleOpenEditSaleStatusModal}
      />
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'刪除卡券'}</DialogTitle>
        <DialogContent style={{ overflow: 'visible' }}>
          <DialogContentText id="alert-dialog-description">
            <TextField
              value={deleteOrderPwd}
              label="刪除密碼"
              onChange={event => setDeleteOrderPwd(event.target.value)}
              inputProps={{
                type: 'password',
                'data-testid': 'delete-password',
              }}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            取消
          </Button>
          <Button onClick={handleConfirmCancel} color="primary" autoFocus data-testid="confirm">
            確認
          </Button>
        </DialogActions>
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
