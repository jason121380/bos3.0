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

const styles = {
  root: css({}),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 1000,
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
  actionsDrawer: css({
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& button': {
      color: '#263238 !important'
    }
  }),
  buttonIcon: css({
    marginRight: theme.spacing(1),
  }),
  drawContainer: css({
    gap: '0px 20px',
    padding: 12
  }),
  cardHeader: css({
    '& .MuiCardHeader-title': {
      fontSize: '15px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      '&::before': {
        content: '""',
        display: 'inline-block',
        width: '4px',
        height: '16px',
        backgroundColor: '#1A73E8',
        marginRight: '8px',
        borderRadius: '2px',
      },
    },
  }),
  tableRow: css({
    backgroundColor: '#ffffff !important',
    '&:hover': {
      backgroundColor: '#ffffff !important',
    },
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
    <div {...rest} css={css([styles.root, className])} className='SalaryOverviewResult'>
      <Card>
        <CardHeader
          css={styles.cardHeader}
          action={
            <CSVLink data={excelData} filename="薪資總表.csv" >
              <Button variant="contained" color="primary" size="small">
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
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={
                          selectedOrders.length === userId.length && userId.length > 0
                        }
                        color="primary"
                        indeterminate={
                          selectedOrders.length > 0 && selectedOrders.length < usersSalary.length
                        }
                        onChange={handleSelectAll}
                        disabled={usersSalary.length === 0}
                      />
                    </TableCell>

                    <TableCell>編輯</TableCell>
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
                        <TableRow key={data.id} css={styles.tableRow}>
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
                          <TableCell>
                            {idx(status, _ => (
                              <Button
                                color="primary"
                                component={RouterLink}
                                size="small"
                                to={`/salary/edit/${data.id}?date=${calendarDate}`}
                                variant="outlined"
                                disabled={!data.isSalaryChecked}
                                css={styles.disabledBtn}
                                className={!data.isSalaryChecked ? 'disabledBtn' : ''}
                              >
                                {getButtonLabel(data)}
                              </Button>
                            ))}
                          </TableCell>
                          <TableCell>{data.name}</TableCell>
                          <TableCell>{data.designerNo}</TableCell>
                          <TableCell>{data.increaseItem}</TableCell>
                          <TableCell>
                            {borrowDisplay ? (data.decreaseItem - findBorrow(data.decreaseItemDetail)) * -1 : data.decreaseItem * -1}
                          </TableCell>
                          {borrowDisplay && <TableCell>{findBorrow(data.decreaseItemDetail) * -1}</TableCell>}
                          <TableCell>{data.increaseItem - data.decreaseItem}</TableCell>
                        </TableRow>
                      )
                    } else if (!isSalaryItemsLock) {
                      return (
                        <TableRow key={data.id} css={styles.tableRow}>
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
                          <TableCell>
                            {idx(status, _ => (
                              <Button
                                color="primary"
                                component={RouterLink}
                                size="small"
                                to={`/salary/edit/${data.id}?date=${calendarDate}`}
                                variant="outlined"
                                disabled={!data.isSalaryChecked}
                                css={styles.disabledBtn}
                                className={!data.isSalaryChecked ? 'disabledBtn' : ''}
                              >
                                {getButtonLabel(data)}
                              </Button>
                            ))}
                          </TableCell>
                          <TableCell>
                            {data.name}
                            {data.isOnDuty ? '' : <strong style={{ color: 'red' }}>{' (已離職)'}</strong>}
                          </TableCell>
                          <TableCell>{data.designerNo}</TableCell>
                          <TableCell>{data.increaseItem}</TableCell>
                          <TableCell>
                            {data.decreaseItem > 0 ? `-${data.decreaseItem}` : data.decreaseItem}
                          </TableCell>
                          {borrowDisplay && <TableCell>{findBorrow(data.decreaseItemDetail)}</TableCell>}
                          <TableCell>{data.increaseItem - data.decreaseItem}</TableCell>
                        </TableRow>
                      )
                    }
                  })}
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
        <CardActions css={styles.actions}>
        </CardActions>
      </Card>
      <Drawer anchor="bottom" open={open} PaperProps={{ elevation: 1 }} variant="persistent">
        <Grid alignItems="center" container css={styles.drawContainer} >
          <Hidden smDown>
            <Grid item md={4}>
              <Typography color="textSecondary" variant="subtitle1">
                {selectedOrders.length} selected
              </Typography>
            </Grid>
          </Hidden>
          <Grid item>
            <div css={styles.actionsDrawer}>
              <Button disabled={isSalaryItemsLock} onClick={() => handleDeleteCheckout()}>
                <DeleteForeverIcon css={styles.buttonIcon} />
                刪除
              </Button>
            </div>
          </Grid>
          {!isSalaryItemsLock && (
            <Fragment>
              <Grid item >
                <div css={styles.actionsDrawer}>
                  <Button onClick={() => handleCloseAccount(1)} disabled={disabledBtn}>
                    <FactCheckIcon css={styles.buttonIcon} />
                    {isThisMonthSalaryChacked ? '重新月結' : '月結訂單'}
                  </Button>
                </div>
              </Grid>
              <Grid item >
                <div css={styles.actionsDrawer}>
                  <Button onClick={() => handleCloseAccount(2)} disabled={disabledBtn}>
                    <FactCheckIcon css={styles.buttonIcon} />
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
