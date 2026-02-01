/** @jsxImportSource @emotion/react */
import {
  Grid, Typography, Button, TextField, Card, Tooltip,
  IconButton, Dialog, DialogActions, DialogContent,
  DialogTitle
} from '@mui/material'
import idx from 'idx'
import React, { Fragment, useEffect, useState } from 'react'
import { format } from 'date-fns'
import DeleteIcon from '@mui/icons-material/Delete'
import useFetchDeleteOrder from 'hooks/useFetchDeleteOrder'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import { openSnackbar } from 'elements/snackbars'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  iconSize: css({
    fontSize: '100px',
  }),
  dialogTitle: css({
    padding: theme.spacing(5),
  }),
  deleteButton: css({
    color: theme.palette.common.white,
    backgroundColor: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  }),
}

function Results({ displaySeats }) {
  const { deleteOrders } = useFetchDeleteOrder()
  const passwordData = useFetchMerchantPassword()
  const [deleteOrderPwd, setDeleteOrderPwd] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [disableDeleteOrders, setDisableDeleteOrders] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [openConfirmDelete, setOpenConfirmDelete] = React.useState(false)
  // 看有沒有勾要用密碼刪除
  useEffect(() => {
    if (!passwordData.loading) {
      const disableDeleteOrders = idx(
        passwordData,
        _ => _.data.merchantPassword.deleteOrder.isUsing
      )
      setDisableDeleteOrders(disableDeleteOrders)
    }
  }, [passwordData.loading])
  // 開單按鈕
  const handleGoToCreateOrder = seatNumber => {
    window.location.href = `/order/create?order=${seatNumber}`
  }
  // 刪除按鈕
  const handleDeleteOrder = orderId => {
    if (!disableDeleteOrders) {
      setSelectedOrder(orderId)
      setOpenConfirmDelete(true)
    } else {
      setOpenDialog(true)
      setSelectedOrder(orderId)
    }
  }
  // 取消輸入密碼dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setDeleteOrderPwd('')
  }
  // 確認用密碼刪除訂單
  const handleConfirmCancel = () => {
    if (selectedOrder != null) {
      deleteOrders({ orderIds: selectedOrder, password: deleteOrderPwd })
        .then(() => {
          setOpenDialog(false)
          setDeleteOrderPwd('')
          setSelectedOrder()
          openSnackbar({
            message: '刪除訂單成功',
            variant: 'success',
          })
          window.location.reload()
        })
        .catch(err => {
          setOpenDialog(false)
          setSelectedOrder()
          setDeleteOrderPwd('')
          openSnackbar({
            message: err.message,
            variant: 'error',
          })
          window.location.reload()
        })
    }
  }
  // 取消不用密碼刪除訂單
  const handleClose = () => {
    setOpenConfirmDelete(false)
  }
  // 確認不用密碼刪除訂單
  const handleDelete = () => {
    deleteOrders({ orderIds: selectedOrder, password: '' }).then(() => {
      openSnackbar({
        message: '成功刪除座位開單',
        variant: 'success',
      })
      window.location.reload()
    })
    handleClose()
  }
  const handleOpenPage = url => {
    window.location.href = `/draft-order/${url}`
  }

  return (
    <Fragment>
      <Grid container spacing={2} style={{ marginTop: 35 }} >
        {displaySeats != undefined &&
          displaySeats.map((seat, index) => {
            return (
              <Grid item key={index} >
                {seat.isSeatUsing === false && (
                  <div style={{ paddingTop: 33 }}>
                    <Tooltip title="新增" followCursor>
                      <Card
                        className="containerBox"
                        sx={{
                          backgroundColor: '#f6f4f2',
                          width: '150px',
                          height: '150px',
                          color: ' #425664',
                          position: 'relative',
                          borderRadius: '20px',
                          padding: '10px',
                          boxShadow:
                            'rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow:
                              'rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset',
                            cursor: 'pointer',
                          },
                        }}
                        onClick={() => handleGoToCreateOrder(seat.seatNumber)}
                      >
                        <div>
                          <div className="boxTop">
                            <h4>座位：{seat.seatNumber}</h4>
                            <p></p>
                          </div>
                          <h2 style={{ position: 'absolute', top: '25%' }}></h2>
                          <div className="boxBottom">
                            <h3 style={{ position: 'absolute', bottom: 0 }}></h3>
                            <p style={{ position: 'absolute', bottom: 0, right: 0 }}></p>
                          </div>
                        </div>
                      </Card>
                    </Tooltip>
                  </div>
                )}
                {seat.isSeatUsing === true && seat.isDesignate === true && (
                  <div style={{ display: 'inline' }}>
                    <Tooltip title="刪除" followCursor>
                      <IconButton
                        onClick={() => handleDeleteOrder(seat.orderId)}
                        aria-label="delete"
                        size="large"
                        style={{ float: 'right', marginBottom: -16, zIndex: 1, right: -18 }}
                      >
                        <DeleteIcon
                          sx={{
                            color: '#202D50',
                            '&:hover': {
                              transform: 'scale(1.5)',
                              cursor: 'pointer',
                            },
                          }}
                          fontSize="inherit"
                        />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="編輯" followCursor>
                      <Card
                        className="containerBoxDesigner"
                        sx={{
                          backgroundColor: '#5b687b',
                          width: '150px',
                          height: '150px',
                          color: ' #faf1cf',
                          position: 'relative',
                          borderRadius: '20px',
                          padding: '10px',
                          boxShadow:
                            'rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow:
                              'rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset',
                            cursor: 'pointer',
                          },
                        }}
                        onClick={() => handleOpenPage(seat.orderId)}
                      >
                        <div className="boxTop">
                          <div>
                            <p>座位：{seat.seatNumber}</p>
                            <p># {seat.orderNo}</p>
                          </div>
                          <div>
                            <p>{format(new Date(seat.updateTime), 'MM/dd/HH:mm')}</p>
                          </div>
                        </div>

                        <h3 id="seatOrderh3" style={{ position: 'absolute', top: '35%' }}>
                          {seat.customerNo.slice(0, 5) + ' ' + seat.customerName.slice(0, 5)}
                          <p style={{ fontSize: '12px' }}>{seat.customerCellphone}</p>
                        </h3>

                        <div className="boxBottom">
                          <p style={{ position: 'absolute', bottom: 5 }}>
                            {seat.designerNo.slice(0, 5) + ' ' + seat.designerName.slice(0, 5)}
                          </p>
                          <p style={{ position: 'absolute', bottom: 5, right: 9 }}>指定</p>
                        </div>
                      </Card>
                    </Tooltip>
                  </div>
                )}
                {seat.isSeatUsing === true && seat.isDesignate === false && (
                  <div style={{ display: 'inline' }}>
                    <Tooltip title="刪除" followCursor>
                      <IconButton
                        onClick={() => handleDeleteOrder(seat.orderId)}
                        aria-label="delete"
                        size="large"
                        style={{ float: 'right', marginBottom: -16, zIndex: 1, right: -18 }}
                      >
                        <DeleteIcon
                          sx={{
                            color: '#202D50',
                            '&:hover': {
                              transform: 'scale(1.5)',
                              cursor: 'pointer',
                            },
                          }}
                          fontSize="inherit"
                        />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="編輯" followCursor>
                      <Card
                        className="containerBoxNoDesigner"
                        sx={{
                          backgroundColor: '#faf1cf',
                          width: '150px',
                          height: '150px',
                          color: ' #5b687b',
                          position: 'relative',
                          borderRadius: '20px',
                          padding: '10px',
                          boxShadow:
                            'rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow:
                              'rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset',
                            cursor: 'pointer',
                          },
                        }}
                        onClick={() => handleOpenPage(seat.orderId)}
                      >
                        <div>
                          <div className="boxTop">
                            <div>
                              <p>座位：{seat.seatNumber}</p>
                              <p># {seat.orderNo}</p>
                            </div>
                            <p>{format(new Date(seat.updateTime), 'MM/dd/HH:mm')}</p>
                          </div>
                          <h3
                            id="seatOrderh3nonDesignate"
                            style={{ position: 'absolute', top: '35%' }}
                          >
                            {seat.customerNo.slice(0, 5) + ' ' + seat.customerName.slice(0, 5)}
                            <p style={{ fontSize: '10px' }}>{seat.customerCellphone}</p>
                          </h3>
                          <div className="boxBottom">
                            <p style={{ position: 'absolute', bottom: 5 }}>
                              {seat.designerNo.slice(0, 5) + ' ' + seat.designerName.slice(0, 5)}
                            </p>
                            <p style={{ position: 'absolute', bottom: 5, right: 9 }}>不指定</p>
                          </div>
                        </div>
                      </Card>
                    </Tooltip>
                  </div>
                )}
              </Grid>
            )
          })}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Typography variant="h2">刪除訂單?</Typography>
        </DialogTitle>
        <DialogContent dividers style={{ width: '300px' }}>
          <TextField
            value={deleteOrderPwd}
            label="刪除密碼"
            onChange={event => setDeleteOrderPwd(event.target.value)}
            inputProps={{
              type: 'password',
              'data-testid': 'delete-password',
            }}
            variant="outlined"
            style={{ width: '250px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" size="large">
            取消
          </Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            size="large"
            css={styles.deleteButton}
            autoFocus
            data-testid="confirm"
          >
            確認
          </Button>
        </DialogActions>
      </Dialog>
      <div>
        <Dialog
          open={openConfirmDelete}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title" css={styles.dialogTitle}>
            <Typography variant="h2">確定要刪除訂單嗎？</Typography>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container justifyContent="space-between">
              <Grid item>
                <Button onClick={handleClose} variant="contained" size="large">
                  取消
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={handleDelete}
                  variant="contained"
                  size="large"
                  css={styles.deleteButton}
                  autoFocus
                >
                  確定
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      </div>
    </Fragment>
  )
}
export default Results
