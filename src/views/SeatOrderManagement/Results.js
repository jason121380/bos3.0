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
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import useFetchDeleteOrder from 'hooks/useFetchDeleteOrder'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import { openSnackbar } from 'elements/snackbars'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import Draggable from 'react-draggable'

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
  seatWrapper: css({
    position: 'absolute',
    zIndex: 10,
  }),
  canvas: css({
    position: 'relative',
    width: '100%',
    minHeight: '800px', // 提供足夠的拖拉空間
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '20px',
    overflow: 'hidden',
    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
  }),
  editModeShake: css({
    animation: 'shake 0.5s infinite',
    '@keyframes shake': {
      '0%': { transform: 'rotate(0deg)' },
      '25%': { transform: 'rotate(1deg)' },
      '50%': { transform: 'rotate(0deg)' },
      '75%': { transform: 'rotate(-1deg)' },
      '100%': { transform: 'rotate(0deg)' },
    },
  }),
}

function Results({ displaySeats, editMode }) {
  const { deleteOrders } = useFetchDeleteOrder()
  const passwordData = useFetchMerchantPassword()
  const [deleteOrderPwd, setDeleteOrderPwd] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [disableDeleteOrders, setDisableDeleteOrders] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [openConfirmDelete, setOpenConfirmDelete] = React.useState(false)

  // 記錄座位的座標與自定義座位
  const [positions, setPositions] = useState({})
  const [customSeats, setCustomSeats] = useState([])
  const [openEditNameDialog, setOpenEditNameDialog] = useState(false)
  const [editingSeat, setEditingSeat] = useState(null)
  const [tempSeatNumber, setTempSeatNumber] = useState('')

  // 從 localStorage 讀取位置與自定義座位
  useEffect(() => {
    const savedPositions = localStorage.getItem('seat_positions')
    if (savedPositions) {
      setPositions(JSON.parse(savedPositions))
    }
    const savedCustomSeats = localStorage.getItem('custom_seats')
    if (savedCustomSeats) {
      setCustomSeats(JSON.parse(savedCustomSeats))
    }
  }, [])

  const saveCustomSeats = (seats) => {
    setCustomSeats(seats)
    localStorage.setItem('custom_seats', JSON.stringify(seats))
  }

  const handleAddSeat = () => {
    const newId = `custom_${Date.now()}`
    const nextNumber = (displaySeats?.length || 0) + customSeats.length + 1
    const newSeat = {
      seatNumber: `${nextNumber}`,
      isCustom: true,
      id: newId
    }
    saveCustomSeats([...customSeats, newSeat])
  }

  const handleDeleteCustomSeat = (id) => {
    saveCustomSeats(customSeats.filter(s => s.id !== id))
  }

  const handleOpenEditName = (seat) => {
    setEditingSeat(seat)
    setTempSeatNumber(seat.seatNumber)
    setOpenEditNameDialog(true)
  }

  const handleSaveSeatName = () => {
    if (editingSeat.isCustom) {
      const newSeats = customSeats.map(s =>
        s.id === editingSeat.id ? { ...s, seatNumber: tempSeatNumber } : s
      )
      saveCustomSeats(newSeats)
    } else {
      // 針對後端座位的本地名稱修改 (存進 localStorage)
      const localNames = JSON.parse(localStorage.getItem('seat_local_names') || '{}')
      localNames[editingSeat.seatNumber] = tempSeatNumber
      localStorage.setItem('seat_local_names', JSON.stringify(localNames))
      // 這裡需要強制重新渲染，可以用一個狀態觸發
    }
    setOpenEditNameDialog(false)
  }

  const handleDragStop = (e, data, seatNumber) => {
    const newPositions = {
      ...positions,
      [seatNumber]: { x: data.x, y: data.y }
    }
    setPositions(newPositions)
    localStorage.setItem('seat_positions', JSON.stringify(newPositions))
  }

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
    if (editMode) return
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
    if (editMode) return
    window.location.href = `/draft-order/${url}`
  }

  // 計算初始位置 (如果沒有儲存過)
  const getInitialPosition = (index) => {
    const cols = 6
    const spacingX = 170
    const spacingY = 190
    return {
      x: (index % cols) * spacingX,
      y: Math.floor(index / cols) * spacingY
    }
  }

  const allSeats = [
    ...(displaySeats || []).map(s => {
      const localNames = JSON.parse(localStorage.getItem('seat_local_names') || '{}')
      return { ...s, displayName: localNames[s.seatNumber] || s.seatNumber }
    }),
    ...customSeats.map(s => ({ ...s, displayName: s.seatNumber }))
  ]

  return (
    <Fragment>
      <Card css={styles.canvas}>
        {editMode && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSeat}
            style={{
              position: 'absolute',
              right: 20,
              top: 20,
              zIndex: 100,
              borderRadius: '20px',
              backgroundColor: '#1A73E8'
            }}
          >
            新增座位
          </Button>
        )}
        {allSeats.map((seat, index) => {
          const seatKey = seat.id || seat.seatNumber
          const pos = positions[seatKey] || getInitialPosition(index)
          return (
            <Draggable
              key={`${seatKey}-${editMode}`}
              defaultPosition={pos}
              onStop={(e, data) => handleDragStop(e, data, seatKey)}
              disabled={!editMode}
            >
              <div css={[styles.seatWrapper, editMode && styles.editModeShake]}>
                {editMode && (
                  <Fragment>
                    <IconButton
                      size="small"
                      style={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        zIndex: 105,
                        backgroundColor: '#fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                      onClick={() => seat.isCustom ? handleDeleteCustomSeat(seat.id) : null}
                      disabled={!seat.isCustom}
                    >
                      <CloseIcon fontSize="small" color={seat.isCustom ? "error" : "disabled"} />
                    </IconButton>
                    <IconButton
                      size="small"
                      style={{
                        position: 'absolute',
                        bottom: -10,
                        right: -10,
                        zIndex: 105,
                        backgroundColor: '#fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                      onClick={() => handleOpenEditName(seat)}
                    >
                      <EditIcon fontSize="small" color="primary" />
                    </IconButton>
                  </Fragment>
                )}
                {!seat.isSeatUsing && (
                  <div style={{ paddingTop: 33 }}>
                    <Tooltip title="新增" followCursor disabled={editMode}>
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
                            transform: editMode ? 'none' : 'scale(1.1)',
                            boxShadow:
                              'rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset',
                            cursor: editMode ? 'move' : 'pointer',
                          },
                        }}
                        onClick={() => handleGoToCreateOrder(seat.seatNumber)}
                      >
                        <div>
                          <div className="boxTop">
                            <h4>座位：{seat.displayName}</h4>
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
                {seat.isSeatUsing && seat.isDesignate && (
                  <div style={{ display: 'inline' }}>
                    <Tooltip title="刪除" followCursor disabled={editMode}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteOrder(seat.orderId)
                        }}
                        aria-label="delete"
                        size="large"
                        style={{ position: 'absolute', top: -10, right: -10, zIndex: 100 }}
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
                    <Tooltip title="編輯" followCursor disabled={editMode}>
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
                            transform: editMode ? 'none' : 'scale(1.1)',
                            boxShadow:
                              'rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset',
                            cursor: editMode ? 'move' : 'pointer',
                          },
                        }}
                        onClick={() => handleOpenPage(seat.orderId)}
                      >
                        <div className="boxTop">
                          <div>
                            <p>座位：{seat.displayName}</p>
                            <p># {seat.orderNo}</p>
                          </div>
                          <div>
                            <p>{format(new Date(seat.updateTime), 'MM/dd/HH:mm')}</p>
                          </div>
                        </div>

                        <h3 id="seatOrderh3" style={{ position: 'absolute', top: '35%' }}>
                          {(seat.customerNo || '').slice(0, 5) + ' ' + (seat.customerName || '').slice(0, 5)}
                          <p style={{ fontSize: '12px' }}>{seat.customerCellphone || ''}</p>
                        </h3>

                        <div className="boxBottom">
                          <p style={{ position: 'absolute', bottom: 5 }}>
                            {(seat.designerNo || '').slice(0, 5) + ' ' + (seat.designerName || '').slice(0, 5)}
                          </p>
                          <p style={{ position: 'absolute', bottom: 5, right: 9 }}>指定</p>
                        </div>
                      </Card>
                    </Tooltip>
                  </div>
                )}
                {seat.isSeatUsing && !seat.isDesignate && (
                  <div style={{ display: 'inline' }}>
                    <Tooltip title="刪除" followCursor disabled={editMode}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteOrder(seat.orderId)
                        }}
                        aria-label="delete"
                        size="large"
                        style={{ position: 'absolute', top: -10, right: -10, zIndex: 100 }}
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
                    <Tooltip title="編輯" followCursor disabled={editMode}>
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
                            transform: editMode ? 'none' : 'scale(1.1)',
                            boxShadow:
                              'rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset',
                            cursor: editMode ? 'move' : 'pointer',
                          },
                        }}
                        onClick={() => handleOpenPage(seat.orderId)}
                      >
                        <div>
                          <div className="boxTop">
                            <div>
                              <p>座位：{seat.displayName}</p>
                              <p># {seat.orderNo}</p>
                            </div>
                            <p>{format(new Date(seat.updateTime), 'MM/dd/HH:mm')}</p>
                          </div>
                          <h3
                            id="seatOrderh3nonDesignate"
                            style={{ position: 'absolute', top: '35%' }}
                          >
                            {(seat.customerNo || '').slice(0, 5) + ' ' + (seat.customerName || '').slice(0, 5)}
                            <p style={{ fontSize: '10px' }}>{seat.customerCellphone || ''}</p>
                          </h3>
                          <div className="boxBottom">
                            <p style={{ position: 'absolute', bottom: 5 }}>
                              {(seat.designerNo || '').slice(0, 5) + ' ' + (seat.designerName || '').slice(0, 5)}
                            </p>
                            <p style={{ position: 'absolute', bottom: 5, right: 9 }}>不指定</p>
                          </div>
                        </div>
                      </Card>
                    </Tooltip>
                  </div>
                )}
              </div>
            </Draggable>
          )
        })}
      </Card>

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

      <Dialog open={openEditNameDialog} onClose={() => setOpenEditNameDialog(false)}>
        <DialogTitle>編輯座位名稱</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="座位號碼/名稱"
            value={tempSeatNumber}
            onChange={(e) => setTempSeatNumber(e.target.value)}
            variant="outlined"
            style={{ marginTop: '10px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditNameDialog(false)}>取消</Button>
          <Button onClick={handleSaveSeatName} color="primary" variant="contained">
            儲存
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}
export default Results
