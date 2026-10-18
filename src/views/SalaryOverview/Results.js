/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardActions, CardContent, CardHeader, Divider, Table,
  TableBody, TableCell, TableHead, TableRow, Typography, Checkbox,
  Drawer, Grid, Hidden
} from '@mui/material'
import idx from 'idx'
import PropTypes from 'prop-types'
import React, { useState, useEffect, Fragment } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from "react-csv";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import { openSnackbar } from 'elements/snackbars'
import useFetchDestroyUserSalaryMonthlyCheckoutRecord from 'hooks/useFetchDestroyUserSalaryMonthlyCheckoutRecord'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const localStyles = {
  card: css({
    borderRadius: '16px',
    boxShadow: 'none',
    border: '1px solid rgb(var(--border))',
    backgroundColor: 'rgb(var(--background))',
    overflow: 'hidden',
  }),
  content: css({
    padding: '0 !important',
  }),
  inner: css({
    minWidth: 1000,
  }),
  tableHead: css({
    backgroundColor: 'rgb(var(--background))',
    '& .MuiTableCell-head': {
      color: 'rgb(var(--text))',
      fontWeight: 'bold',
      borderBottom: 'none',
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
      borderBottom: 'none',
      fontSize: '14px !important',
      color: 'rgb(var(--text))',
    },
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
  }),
  cardHeader: css({
    padding: '12px 24px !important',
    '& .MuiCardHeader-title': {
      fontSize: '16px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
    },
  }),
  actions: css({
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
    borderTop: 'none',
  }),
}

function Results({
  status,
  calendarDate,
  className,
  customers,
  pageSetting,
  salaryUserList,
  usersSalary,
  userSalayItemData,
  handleOnChangePage,
  handleOnChangeRowsPerPage,
  isThisMonthSalaryChacked,
  editBtnStatus,
  usersIsSalaryChecked,
  isSalaryItemsLock,
  isSalaryChackedData,
  borrowDisplay,
  ...rest
}) {
  const [excelData, setExcelData] = useState([])
  const [selectedOrders, setSelectedOrders] = useState([])
  const [monthlyCheckoutInput, setMonthlyCheckoutInput] = React.useState([])
  const [monthlyCheckoutInputFalse, setMonthlyCheckoutInputFalse] = useState([])
  const [disabledBtn, setDisabledBtn] = useState(false)
  const [userId, setUserId] = useState([])
  useEffect(() => {
    const excelData = []
    usersSalary.forEach(data => {
      excelData.push({
        姓名: data.name,
        代號: data.designerNo,
        薪資加項: data.increaseItem,
        薪資扣項: data.decreaseItem > 0 ? `-${data.decreaseItem}` : data.decreaseItem,
        實際匯款金額: data.increaseItem - data.decreaseItem,
      })
    })
    setExcelData(excelData)
  }, [usersSalary])

  const handleSelectOne = id => {
    const newSelect = [...selectedOrders], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedOrders(newSelect)
  }
  useEffect(() => {
    const data = []
    usersSalary.forEach(user => {
      if (!user.isOnDuty) return
      if ((isSalaryItemsLock && user.increaseItem > 0) || user.decreaseItem > 0) {
        data.push(user.id)
      } else if (!isSalaryItemsLock) {
        data.push(user.id)
      }
    })
    setUserId(data)
  }, [usersSalary])

  const handleSelectAll = event => {
    const newSelectedPayment = event.target.checked ? userId : []
    setSelectedOrders(newSelectedPayment)
  }
  const open = selectedOrders.length > 0
  const handleCloseAccount = num => {
    openSnackbar({
      message: `是否確認要月結`,
      variant: 'error',
      disableHide: true,
      resign: true,
      salaryCheckout: true,
      monthlyCheckoutInput: num === 1 ? monthlyCheckoutInput : monthlyCheckoutInputFalse,
      salaryCheckoutDate: calendarDate,
      userSalayItemDataRefetch: salaryUserList.refetch,
      isSalaryChackedDataRefetch: isSalaryChackedData.refetch,
      progressCount: 0,
    })
    setDisabledBtn(true)
  }

  const {
    destroyUserSalaryMonthlyCheckoutRecord,
  } = useFetchDestroyUserSalaryMonthlyCheckoutRecord()
  const handleDeleteCheckout = () => {
    destroyUserSalaryMonthlyCheckoutRecord({
      date: calendarDate,
      userIds: selectedOrders,
    })
      .then(() => {
        openSnackbar({
          message: '刪除成功',
          variant: 'success',
          progressCount: 0,
          disableHide: true,
        })
      })
      .then(() => {
        window.location.reload()
      })
  }

  React.useEffect(() => {
    if (!selectedOrders.loading && selectedOrders.length > 0) {
      const userHaveSetSalaryDetail = []
      const userHaveSetSalaryDetailFalse = []

      selectedOrders.forEach(data => {
        userHaveSetSalaryDetail.push([{ userId: data }])
        userHaveSetSalaryDetailFalse.push([{ userId: data, isSalaryItemAutoSet: false }]) // 不帶入加扣項的資料
      })

      setMonthlyCheckoutInput([...userHaveSetSalaryDetail])
      setMonthlyCheckoutInputFalse([...userHaveSetSalaryDetailFalse])
    }

    if (selectedOrders.length === 0) {
      setMonthlyCheckoutInput([])
      setMonthlyCheckoutInputFalse([])
    }
  }, [salaryUserList.loading, selectedOrders])
  const findBorrow = decreaseItemDetail => {
    const borrowPrice = decreaseItemDetail.find(d => d.itemName === "員工借支")
    return borrowPrice ? borrowPrice.price : 0
  }
  const getButtonLabel = ({ isSalaryChecked, isOnDuty }) => {
    if (!isOnDuty) return '檢視'
    return editBtnStatus ? '檢視' : isSalaryChecked ? '編輯' : '未結算'
  }
  return (
    <div {...rest} css={css([localStyles.root, className])} className='SalaryOverviewResult'>
      <Card css={localStyles.card}>
        <CardHeader
          css={localStyles.cardHeader}
          action={
            <CSVLink data={excelData} filename="薪資總表.csv" >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: 'rgb(var(--surface)) !important',
                  color: 'rgb(var(--text-secondary)) !important',
                  borderRadius: '50px',
                  padding: '6px 24px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  boxShadow: 'none',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgb(var(--surface)) !important',
                    boxShadow: 'none',
                  }
                }}
              >
                報表匯出
              </Button>
            </CSVLink>
          }
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>薪資總覽</span>
              <Typography color="textSecondary" variant="body2">
                共 {usersSalary.length} 筆
              </Typography>
            </div>
          }
        />
        <CardContent css={localStyles.content}>
          <PerfectScrollbar>
            <div css={localStyles.inner}>
              <Table size="small">
                <TableHead css={localStyles.tableHead}>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={
                          selectedOrders.length === userId.length && userId.length > 0
                        }
                        sx={{ color: 'rgba(0, 0, 0, 0.54) !important' }}
                        indeterminate={
                          selectedOrders.length > 0 && selectedOrders.length < usersSalary.length
                        }
                        onChange={handleSelectAll}
                        disabled={usersSalary.length === 0}
                      />
                    </TableCell>

                    <TableCell>狀態</TableCell>
                    <TableCell>姓名</TableCell>
                    <TableCell>代號</TableCell>
                    <TableCell>薪資加項</TableCell>
                    <TableCell>薪資扣項</TableCell>
                    {borrowDisplay && <TableCell>員工借支</TableCell>}
                    <TableCell>實際匯款金額</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usersSalary.map((data, index) => {
                    if ((isSalaryItemsLock && data.increaseItem > 0) || data.decreaseItem > 0) {
                      return (
                        <TableRow key={data.id} css={localStyles.tableRow}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={selectedOrders.indexOf(data.id) > -1}
                              onChange={() => handleSelectOne(data.id)}
                              inputProps={{
                                'data-testid': `order-checkbox-${index}`,
                              }}
                              disabled={!data.isOnDuty}
                            />
                          </TableCell>
                          <TableCell sx={{ width: '110px' }}>
                            <Button
                              component={data.isSalaryChecked ? RouterLink : 'button'}
                              to={data.isSalaryChecked ? `/salary/edit/${data.id}?date=${calendarDate}` : undefined}
                              variant="text"
                              size="small"
                              disabled={!data.isSalaryChecked}
                              sx={{
                                color: data.isSalaryChecked ? 'rgb(var(--text-secondary)) !important' : 'rgba(26, 115, 232, 0.5) !important',
                                fontWeight: 'bold !important',
                                fontSize: '14px !important',
                                minWidth: '80px',
                                padding: data.isSalaryChecked ? '4px 16px !important' : '4px 8px !important',
                                backgroundColor: data.isSalaryChecked ? 'rgb(var(--surface)) !important' : 'transparent !important',
                                border: 'none !important',
                                borderRadius: '20px !important',
                                cursor: data.isSalaryChecked ? 'pointer' : 'default',
                                boxShadow: 'none !important',
                                transition: 'all 0.2s ease',
                                '&.Mui-disabled': {
                                  color: 'rgba(26, 115, 232, 0.4) !important',
                                },
                                '&:hover': {
                                  backgroundColor: data.isSalaryChecked ? 'rgb(var(--surface)) !important' : 'transparent !important',
                                }
                              }}
                            >
                              {data.isSalaryChecked ? '詳情' : '未結算'}
                            </Button>
                          </TableCell>
                          <TableCell sx={{ fontSize: '14.5px', fontWeight: 600, color: 'rgb(var(--text))', width: '180px' }}>{data.name}</TableCell>
                          <TableCell sx={{ fontSize: '14px', color: 'text.secondary', width: '100px' }}>{data.designerNo || '-'}</TableCell>
                          <TableCell sx={{ fontSize: '14px', textAlign: 'left', width: '130px' }}>{data.increaseItem}</TableCell>
                          <TableCell sx={{ fontSize: '14px', color: 'error.main', textAlign: 'left', width: '130px' }}>
                            {borrowDisplay ? (data.decreaseItem - findBorrow(data.decreaseItemDetail)) * -1 : data.decreaseItem * -1}
                          </TableCell>
                          {borrowDisplay && <TableCell sx={{ fontSize: '14px', textAlign: 'left', width: '130px' }}>{findBorrow(data.decreaseItemDetail) * -1}</TableCell>}
                          <TableCell sx={{ fontSize: '16px', fontWeight: 'bold', color: theme.palette.primary.main, textAlign: 'left' }}>{data.increaseItem - data.decreaseItem}</TableCell>
                        </TableRow>
                      )
                    } else if (!isSalaryItemsLock) {
                      return (
                        <TableRow key={data.id} css={localStyles.tableRow}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={selectedOrders.indexOf(data.id) > -1}
                              onChange={() => handleSelectOne(data.id)}
                              inputProps={{
                                'data-testid': `order-checkbox-${index}`,
                              }}
                              disabled={!data.isOnDuty}
                            />
                          </TableCell>
                          <TableCell sx={{ width: '110px' }}>
                            <Button
                              component={data.isSalaryChecked ? RouterLink : 'button'}
                              to={data.isSalaryChecked ? `/salary/edit/${data.id}?date=${calendarDate}` : undefined}
                              variant="text"
                              size="small"
                              disabled={!data.isSalaryChecked}
                              sx={{
                                color: data.isSalaryChecked ? 'rgb(var(--text-secondary)) !important' : 'rgba(26, 115, 232, 0.5) !important',
                                fontWeight: 'bold !important',
                                fontSize: '14px !important',
                                minWidth: '80px',
                                padding: data.isSalaryChecked ? '4px 16px !important' : '4px 8px !important',
                                backgroundColor: data.isSalaryChecked ? 'rgb(var(--surface)) !important' : 'transparent !important',
                                border: 'none !important',
                                borderRadius: '20px !important',
                                cursor: data.isSalaryChecked ? 'pointer' : 'default',
                                boxShadow: 'none !important',
                                transition: 'all 0.2s ease',
                                '&.Mui-disabled': {
                                  color: 'rgba(26, 115, 232, 0.4) !important',
                                },
                                '&:hover': {
                                  backgroundColor: data.isSalaryChecked ? 'rgb(var(--surface)) !important' : 'transparent !important',
                                }
                              }}
                            >
                              {data.isSalaryChecked ? '詳情' : '未結算'}
                            </Button>
                          </TableCell>
                          <TableCell sx={{ fontSize: '14.5px', fontWeight: 600, color: 'rgb(var(--text))', width: '180px' }}>
                            {data.name}
                            {data.isOnDuty ? '' : <strong style={{ color: 'red', marginLeft: '4px' }}>{' (已離職)'}</strong>}
                          </TableCell>
                          <TableCell sx={{ fontSize: '14px', color: 'text.secondary', width: '100px' }}>{data.designerNo || '-'}</TableCell>
                          <TableCell sx={{ fontSize: '14px', textAlign: 'left', width: '130px' }}>{data.increaseItem}</TableCell>
                          <TableCell sx={{ fontSize: '14px', textAlign: 'left', width: '130px' }}>
                            {data.decreaseItem > 0 ? `-${data.decreaseItem}` : data.decreaseItem}
                          </TableCell>
                          {borrowDisplay && <TableCell sx={{ fontSize: '14px', textAlign: 'left', width: '130px' }}>{findBorrow(data.decreaseItemDetail)}</TableCell>}
                          <TableCell sx={{ fontSize: '16px', fontWeight: 'bold', color: theme.palette.primary.main, textAlign: 'left', width: '180px' }}>{data.increaseItem - data.decreaseItem}</TableCell>
                        </TableRow>
                      )
                    }
                  })}
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
        <CardActions css={localStyles.actions}>
        </CardActions>
      </Card>
      <Drawer anchor="bottom" open={open} PaperProps={{ elevation: 1 }} variant="persistent">
        <Grid alignItems="center" container sx={{ gap: '0px 20px', padding: 1.5 }} >
          <Hidden smDown>
            <Grid item md={4}>
              <Typography color="textSecondary" variant="subtitle1">
                {selectedOrders.length} selected
              </Typography>
            </Grid>
          </Hidden>
          <Grid item>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '8px 0',
            }}>
              <Button
                variant="contained"
                disabled={isSalaryItemsLock}
                onClick={() => handleDeleteCheckout()}
                startIcon={<DeleteForeverIcon />}
                style={{
                  borderRadius: '50px',
                  padding: '8px 24px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: 'none',
                  backgroundColor: '#ea4335',
                  color: 'white',
                }}
              >
                刪除
              </Button>
            </div>
          </Grid>
          {!isSalaryItemsLock && (
            <Fragment>
              <Grid item >
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '8px 0',
                }}>
                  <Button
                    variant="contained"
                    onClick={() => handleCloseAccount(1)}
                    disabled={disabledBtn}
                    startIcon={<FactCheckIcon />}
                    style={{
                      borderRadius: '50px',
                      padding: '8px 24px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      boxShadow: 'none',
                      backgroundColor: 'rgb(var(--accent))',
                      color: 'white',
                    }}
                  >
                    {isThisMonthSalaryChacked ? '重新月結' : '月結訂單'}
                  </Button>
                </div>
              </Grid>
              <Grid item >
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '8px 0',
                }}>
                  <Button
                    variant="contained"
                    onClick={() => handleCloseAccount(2)}
                    disabled={disabledBtn}
                    startIcon={<FactCheckIcon />}
                    style={{
                      borderRadius: '50px',
                      padding: '8px 24px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      boxShadow: 'none',
                      backgroundColor: 'rgb(var(--accent))',
                      color: 'white',
                    }}
                  >
                    {isThisMonthSalaryChacked ? '重新月結不帶入加扣項' : '月結訂單不帶入加扣項'}
                  </Button>
                </div>
              </Grid>
            </Fragment>
          )}
        </Grid>
      </Drawer>
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.object,
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
