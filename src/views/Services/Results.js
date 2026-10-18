/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardActions, CardContent, CardHeader, Checkbox, Divider,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow,
  Typography, Dialog, DialogTitle, DialogContent, DialogContentText, TextField,
  DialogActions, IconButton
} from '@mui/material'
import { Edit as EditIconSlot, ContentCopy as ContentCopyIcon } from 'ui/icons'

import { Link } from 'react-router-dom';
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteService from 'hooks/useFetchDeleteService'
import idx from 'idx'
import format from 'date-fns/format'
import { useState, useEffect, useRef } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from "react-csv";
import useFetchMerchantHelperItems from 'hooks/useFetchMerchantHelperItems'
import useFetchSettingBatchSettingForHelper from 'hooks/useFetchBatchSettingForHelper'
import useFetchSettingBatchSettingForDeduction from 'hooks/useFetchBatchSettingForDeduction'
import useFetchMerchantCommissionWay from 'hooks/useFetchMerchantCommissionWay'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import pagenationLabel from './../../helper/pagenationLabel'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import AboutDeductionEditModal from './AboutDeductionEditModal'
import AssistantSettingEditModal from './AssistantSettingEditModal'

const styles = {
  root: css({}),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 700,
  }),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  }),
  actions: css({
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  }),
  notSetting: css({
    color: 'red',
    fontWeight: 'bold',
  }),
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
    backgroundColor: 'rgb(var(--background)) !important',
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
}

function Results({ className, services, refetchService, onPageChange, onRowsPerPageChange, ...rest }) {
  const pageRef = useRef(null)
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null

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
      const disableDeleteService = idx(
        passwordData,
        _ => _.data.merchantPassword.deleteService.isUsing
      )
      setDisableDeleteService(disableDeleteService)
    }
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

  const handleSelectAll = event => {
    const newSelectedService = event.target.checked
      ? services.data.filter(d => d.isUsing).map(service => service.id)
      : []
    setSelectedService(newSelectedService)
  }
  const handleSelectOne = id => {
    const newSelect = [...selectedService], index = newSelect.indexOf(id)
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
    deleteService(
      disableDeleteService
        ? { itemIds: selectedService, password: deleteOrderPwd }
        : { itemIds: selectedService }
    ).then(() => {
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

  const handleOnChangeRowsPerPage = event => {
    onPageChange({
      value: event.target.value,
      key: 'pageLimit',
    })
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
    const newHelperDeductionSetting = helperDeductionSetting.map(
      ({ deductionWay, isDesignate, ...keepProteries }) => keepProteries
    )

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

  useEffect(() => {
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [services, pageRef.current])

  return (
    <div {...rest} css={className}>
      <Card css={styles.card}>
        <CardHeader
          css={styles.header}
          action={
            <CSVLink data={excelData} filename="服務項目.csv">
              <Button variant="contained" css={styles.csvBtn} size="small">
                報表匯出
              </Button>
            </CSVLink>
          }
          title={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Typography variant="h6" style={{ fontWeight: 'bold', color: 'rgb(var(--text))' }}>
                所有營業服務
              </Typography>
              <Typography color="textSecondary" variant="body2">
                共 {services.totalCount} 筆
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
                        checked={
                          selectedService.length === services.data.length &&
                          services.data.length > 0
                        }
                        color="primary"
                        indeterminate={
                          selectedService.length > 0 &&
                          selectedService.length < services.data.length
                        }
                        onChange={handleSelectAll}
                        disabled={
                          services.data.length === 0 ||
                          services.data.filter(d => !d.isUsing).length === services.data.length
                        }
                      />
                    </TableCell>
                    <TableCell>操作</TableCell>
                    <TableCell>代號</TableCell>
                    <TableCell>類別</TableCell>
                    <TableCell>名稱</TableCell>
                    <TableCell>參考價格</TableCell>
                    <TableCell>扣項設定數量</TableCell>
                    <TableCell>互助設定數量</TableCell>
                    <TableCell>變更時間</TableCell>
                    <TableCell>建立副本</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.data.map((data, index) => (
                    <TableRow
                      key={`${data.name}-${index}`}
                      css={styles.tableRow}
                      selected={selectedService.indexOf(data.id) > -1 || !data.isUsing}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          onChange={() => handleSelectOne(data.id)}
                          checked={selectedService.indexOf(data.id) > -1}
                          disabled={!data.isUsing}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          component={RouterLink}
                          css={styles.actionButton}
                          to={`/service/edit/${data.id}`}
                          disabled={!data.isUsing}
                          size="small"
                        >
                          <EditIconSlot fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell>{data.no}</TableCell>
                      <TableCell>
                        {idx(data, _ =>
                          _.serviceCategory !== null ? _.serviceCategory.name : '無分類'
                        )}
                      </TableCell>
                      <TableCell>{data.name}</TableCell>
                      <TableCell>{data.price}</TableCell>
                      <TableCell
                        css={data.serviceDeductionCount === 0 ? `${styles.notSetting}` : ''}
                      >
                        {data.serviceDeductionCount === 0 ? '無扣項' : data.serviceDeductionCount}
                      </TableCell>
                      <TableCell
                        css={data.helperDeductionCount === 0 ? `${styles.notSetting}` : ''}
                      >
                        {data.helperDeductionCount === 0 ? '無設定' : data.helperDeductionCount}
                      </TableCell>
                      <TableCell>{format(data.updatedAt, 'yyyy/MM/dd')}</TableCell>
                      <TableCell>
                        <Link to={`service/duplicate/${data.id}`}>
                          <IconButton>
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
        <CardActions css={styles.actions}>
          <TablePagination
            ref={pageRef}
            labelRowsPerPage='每頁顯示數量'
            component="div"
            count={services.totalCount}
            onPageChange={handleOnChangePage}
            onRowsPerPageChange={handleOnChangeRowsPerPage}
            page={services.pageOffset}
            rowsPerPage={services.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </CardActions>
      </Card>
      <TableEditBar
        selected={selectedService}
        onDelete={disableDeleteService ? handleCancel : handleConfirmCancel}
        onEdit={handleOpenMutipleEditModal}
        onEditDeduction={handleOpenEditDeductionModal}
      />
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'刪除服務'}</DialogTitle>
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
    </div>
  )
}


export default Results
