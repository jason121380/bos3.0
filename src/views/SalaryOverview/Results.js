/** @jsxImportSource @emotion/react */
// 底部操作列沿用 MUI Drawer（persistent），內容改為新元件
import { Drawer } from '@mui/material'
import idx from 'idx'
import PropTypes from 'prop-types'
import React, { useState, useEffect, Fragment } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from "react-csv";
import { DeleteForever as DeleteForeverIcon, FactCheck as FactCheckIcon } from 'ui/icons'
import { openSnackbar } from 'elements/snackbars'
import useFetchDestroyUserSalaryMonthlyCheckoutRecord from 'hooks/useFetchDestroyUserSalaryMonthlyCheckoutRecord'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

// 「詳情」：已結算為連結、未結算為停用按鈕（與舊版 Button component 切換相同），供 ui/button asChild 包覆
const DetailLink = React.forwardRef(({ checked, ...props }, ref) => {
  const Comp = checked ? RouterLink : 'button'
  return <Comp ref={ref} {...props} />
})
DetailLink.displayName = 'DetailLink'

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
    <div {...rest} css={className} className='SalaryOverviewResult'>
      <Card>
        <CardHeader
          className="items-center pb-4"
          action={
            <Button asChild size="sm" variant="secondary">
              <CSVLink data={excelData} filename="薪資總表.csv" >
                報表匯出
              </CSVLink>
            </Button>
          }
        >
          <div className="flex items-baseline gap-3">
            <CardTitle>薪資總覽</CardTitle>
            <span className="text-label tabular-nums text-text-secondary">
              共 {usersSalary.length} 筆
            </span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table dense className="min-w-[1000px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    aria-label="全選"
                    checked={
                      selectedOrders.length === userId.length && userId.length > 0
                    }
                    indeterminate={
                      selectedOrders.length > 0 && selectedOrders.length < usersSalary.length
                    }
                    onChange={handleSelectAll}
                    disabled={usersSalary.length === 0}
                  />
                </TableHead>

                <TableHead>狀態</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>代號</TableHead>
                <TableHead numeric>薪資加項</TableHead>
                <TableHead numeric>薪資扣項</TableHead>
                {borrowDisplay && <TableHead numeric>員工借支</TableHead>}
                <TableHead numeric>實際匯款金額</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersSalary.map((data, index) => {
                if ((isSalaryItemsLock && data.increaseItem > 0) || data.decreaseItem > 0) {
                  return (
                        <TableRow key={data.id} className="hover:bg-transparent" data-state={selectedOrders.indexOf(data.id) > -1 ? 'selected' : undefined}>
                          <TableCell className="w-12">
                            <Checkbox
                              aria-label={`選取 ${data.name}`}
                              checked={selectedOrders.indexOf(data.id) > -1}
                              onChange={() => handleSelectOne(data.id)}
                              data-testid={`order-checkbox-${index}`}
                              disabled={!data.isOnDuty}
                            />
                          </TableCell>
                          <TableCell className="w-[110px]">
                            <Button asChild variant={data.isSalaryChecked ? 'secondary' : 'ghost'} size="sm" className="min-w-[80px]">
                              <DetailLink
                                checked={data.isSalaryChecked}
                                to={data.isSalaryChecked ? `/salary/edit/${data.id}?date=${calendarDate}` : undefined}
                                disabled={!data.isSalaryChecked}
                              >
                                {data.isSalaryChecked ? '詳情' : '未結算'}
                              </DetailLink>
                            </Button>
                          </TableCell>
                          <TableCell className="w-[180px] font-medium">{data.name}</TableCell>
                          <TableCell className="w-[100px] tabular-nums text-text-secondary">{data.designerNo || '-'}</TableCell>
                          <TableCell numeric className="w-[130px]">{formatNumber(data.increaseItem)}</TableCell>
                          <TableCell numeric className="w-[130px] text-danger">
                            {formatNumber(borrowDisplay ? (data.decreaseItem - findBorrow(data.decreaseItemDetail)) * -1 : data.decreaseItem * -1)}
                          </TableCell>
                          {borrowDisplay && <TableCell numeric className="w-[130px]">{formatNumber(findBorrow(data.decreaseItemDetail) * -1)}</TableCell>}
                          <TableCell numeric className="font-bold text-accent">{formatNumber(data.increaseItem - data.decreaseItem)}</TableCell>
                        </TableRow>
                  )
                } else if (!isSalaryItemsLock) {
                  return (
                        <TableRow key={data.id} className="hover:bg-transparent" data-state={selectedOrders.indexOf(data.id) > -1 ? 'selected' : undefined}>
                          <TableCell className="w-12">
                            <Checkbox
                              aria-label={`選取 ${data.name}`}
                              checked={selectedOrders.indexOf(data.id) > -1}
                              onChange={() => handleSelectOne(data.id)}
                              data-testid={`order-checkbox-${index}`}
                              disabled={!data.isOnDuty}
                            />
                          </TableCell>
                          <TableCell className="w-[110px]">
                            <Button asChild variant={data.isSalaryChecked ? 'secondary' : 'ghost'} size="sm" className="min-w-[80px]">
                              <DetailLink
                                checked={data.isSalaryChecked}
                                to={data.isSalaryChecked ? `/salary/edit/${data.id}?date=${calendarDate}` : undefined}
                                disabled={!data.isSalaryChecked}
                              >
                                {data.isSalaryChecked ? '詳情' : '未結算'}
                              </DetailLink>
                            </Button>
                          </TableCell>
                          <TableCell className="w-[180px] font-medium">
                            {data.name}
                            {data.isOnDuty ? '' : <strong className="ml-1 text-danger">{' (已離職)'}</strong>}
                          </TableCell>
                          <TableCell className="w-[100px] tabular-nums text-text-secondary">{data.designerNo || '-'}</TableCell>
                          <TableCell numeric className="w-[130px]">{formatNumber(data.increaseItem)}</TableCell>
                          <TableCell numeric className="w-[130px]">
                            {formatNumber(data.decreaseItem > 0 ? `-${data.decreaseItem}` : data.decreaseItem)}
                          </TableCell>
                          {borrowDisplay && <TableCell numeric className="w-[130px]">{formatNumber(findBorrow(data.decreaseItemDetail))}</TableCell>}
                          <TableCell numeric className="w-[180px] font-bold text-accent">{formatNumber(data.increaseItem - data.decreaseItem)}</TableCell>
                        </TableRow>
                  )
                }
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
      <Drawer anchor="bottom" open={open} PaperProps={{ elevation: 1 }} variant="persistent">
        <div className="ui-root flex flex-wrap items-center gap-x-5 border-0 border-t border-solid border-border bg-background px-6 py-3">
          <div className="hidden md:block md:w-1/3">
            <span className="text-body tabular-nums text-text-secondary">
              {selectedOrders.length} selected
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-3 py-2">
            <Button
              variant="danger"
              disabled={isSalaryItemsLock}
              onClick={() => handleDeleteCheckout()}
            >
              <DeleteForeverIcon />
              刪除
            </Button>
          </div>
          {!isSalaryItemsLock && (
            <Fragment>
              <div className="flex flex-wrap justify-center gap-3 py-2">
                <Button
                  variant="primary"
                  onClick={() => handleCloseAccount(1)}
                  disabled={disabledBtn}
                >
                  <FactCheckIcon />
                  {isThisMonthSalaryChacked ? '重新月結' : '月結訂單'}
                </Button>
              </div>
              <div className="flex flex-wrap justify-center gap-3 py-2">
                <Button
                  variant="secondary"
                  onClick={() => handleCloseAccount(2)}
                  disabled={disabledBtn}
                >
                  <FactCheckIcon />
                  {isThisMonthSalaryChacked ? '重新月結不帶入加扣項' : '月結訂單不帶入加扣項'}
                </Button>
              </div>
            </Fragment>
          )}
        </div>
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
