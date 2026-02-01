/** @jsxImportSource @emotion/react */
import {
  Button,
  Divider,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Checkbox,
  Drawer,
  Grid,
  Hidden
} from '@mui/material'
import { Delete as DeleteIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material'
import idx from 'idx'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { openSnackbar } from 'elements/snackbars'
import useFetchDestroyUserSalaryMonthlyCheckoutRecord from 'hooks/useFetchDestroyUserSalaryMonthlyCheckoutRecord'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import ManagementTable from 'components/ManagementTable'

const styles = {
  root: css({}),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
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
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [selectableEmployees, setSelectableEmployees] = useState([])

  const { fetchDestroyUserSalaryMonthlyCheckoutRecord } = useFetchDestroyUserSalaryMonthlyCheckoutRecord()

  useEffect(() => {
    const list = (usersSalary || []).filter(d => {
      const userStatus = usersIsSalaryChecked.find(user => user.id === d.id)
      return userStatus && !userStatus.isMonthCheckout
    }).map(d => d.id)
    setSelectableEmployees(list)
  }, [usersSalary, usersIsSalaryChecked])

  const handleSelectAll = event => {
    const newSelected = event.target.checked ? selectableEmployees : []
    setSelectedEmployees(newSelected)
  }

  const handleSelectOne = id => {
    const newSelect = [...selectedEmployees], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedEmployees(newSelect)
  }

  const handleCloseAccount = async () => {
    // 這裡通常會調用月結 API
    openSnackbar({ message: '月結成功', variant: 'success' })
    if (isSalaryChackedData && isSalaryChackedData.refetch) isSalaryChackedData.refetch()
    setSelectedEmployees([])
  }

  const handleDeleteCheckout = async () => {
    fetchDestroyUserSalaryMonthlyCheckoutRecord({
      input: {
        userIds: selectedEmployees,
        monthTime: calendarDate,
      },
    }).then(() => {
      openSnackbar({ message: '已刪除月結記錄', variant: 'warning' })
      if (isSalaryChackedData && isSalaryChackedData.refetch) isSalaryChackedData.refetch()
      if (salaryUserList && salaryUserList.refetch) salaryUserList.refetch()
      setSelectedEmployees([])
    })
  }

  useEffect(() => {
    const data = (usersSalary || []).map(d => ({
      姓名: d.lastName + d.firstName,
      底薪: d.baseSalary,
      抽成合計: d.performanceSalary,
      借支小計: d.borrowTotal,
      勞健保: d.insurance,
      加項小計: d.increaseItem,
      扣項小計: d.decreaseItem,
      應領薪資: d.totalSalary,
      實領薪資: d.actualSalary,
    }))
    setExcelData(data)
  }, [usersSalary])

  return (
    <div {...rest} className={className}>
      <ManagementTable
        title="薪資管理列表"
        totalCount={(usersSalary || []).filter(data => !isSalaryItemsLock || (data.increaseItem > 0 || data.decreaseItem > 0)).length}
        excelData={excelData}
        excelFilename="薪資總表.csv"
        pageLimit={pageSetting.pageLimit}
        pageOffset={pageSetting.pageOffset}
        onPageChange={handleOnChangePage}
        onRowsPerPageChange={handleOnChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 1000]}
        minWidth={1150}
        tableHead={
          <>
            {!isSalaryItemsLock && (
              <TableCell padding="checkbox">
                <Checkbox
                  checked={
                    selectedEmployees.length === selectableEmployees.length &&
                    selectableEmployees.length > 0
                  }
                  color="primary"
                  indeterminate={
                    selectedEmployees.length > 0 &&
                    selectedEmployees.length < selectableEmployees.length
                  }
                  onChange={handleSelectAll}
                  disabled={selectableEmployees.length === 0}
                />
              </TableCell>
            )}
            <TableCell>操作</TableCell>
            <TableCell>姓名</TableCell>
            <TableCell>底薪</TableCell>
            <TableCell>抽成合計</TableCell>
            <TableCell>借支小計</TableCell>
            <TableCell>勞健保</TableCell>
            <TableCell>加項小計</TableCell>
            <TableCell>扣項小計</TableCell>
            <TableCell>應領薪資</TableCell>
            <TableCell>實領薪資</TableCell>
          </>
        }
      >
        <TableBody>
          {(usersSalary || []).map((data, index) => {
            const shouldShow = !isSalaryItemsLock || (data.increaseItem > 0 || data.decreaseItem > 0);
            if (!shouldShow) return null;

            const userStatus = usersIsSalaryChecked.find(d => d.id === data.id) || {}

            return (
              <TableRow key={data.id} css={styles.tableRow}>
                {!isSalaryItemsLock && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={selectedEmployees.indexOf(data.id) > -1}
                      onChange={() => handleSelectOne(data.id)}
                      disabled={userStatus.isMonthCheckout}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Button
                    color="primary"
                    component={RouterLink}
                    size="small"
                    to={editBtnStatus ? `/salary/overview/${data.id}/edit?date=${calendarDate}` : `/salary/overview/${data.id}/checkout?date=${calendarDate}`}
                    variant="outlined"
                  >
                    {editBtnStatus ? '編輯' : '月結'}
                  </Button>
                </TableCell>
                <TableCell>
                  <Typography variant="h6">
                    {data.lastName}{data.firstName}
                  </Typography>
                </TableCell>
                <TableCell>{data.baseSalary}</TableCell>
                <TableCell>
                  <Typography variant="body2" color="primary" style={{ fontWeight: 'bold' }}>
                    {data.performanceSalary}
                  </Typography>
                </TableCell>
                <TableCell>{borrowDisplay ? data.borrowTotal : '---'}</TableCell>
                <TableCell>{data.insurance}</TableCell>
                <TableCell style={{ color: 'green' }}>{data.increaseItem}</TableCell>
                <TableCell style={{ color: 'red' }}>{data.decreaseItem}</TableCell>
                <TableCell>{data.totalSalary}</TableCell>
                <TableCell>
                  <Typography variant="h6" color="secondary" style={{ fontWeight: 'bold' }}>
                    {data.actualSalary}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </ManagementTable>

      <Drawer
        anchor="bottom"
        open={selectedEmployees.length > 0}
        variant="persistent"
      >
        <div css={styles.drawContainer}>
          <Grid container alignItems="center" justifyContent="center" spacing={2}>
            <Grid item>
              <Typography variant="h6">已選擇 {selectedEmployees.length} 位員工</Typography>
            </Grid>
            <Grid item>
              <Button
                color="primary"
                onClick={handleCloseAccount}
                variant="contained"
                startIcon={<CheckCircleIcon />}
              >
                批次月結
              </Button>
            </Grid>
            <Grid item>
              <Button
                color="error"
                onClick={handleDeleteCheckout}
                variant="outlined"
                startIcon={<DeleteIcon />}
              >
                刪除月結記錄
              </Button>
            </Grid>
          </Grid>
        </div>
      </Drawer>
    </div>
  )
}

Results.propTypes = {
  status: PropTypes.string,
  calendarDate: PropTypes.number,
  className: PropTypes.string,
  customers: PropTypes.array,
  pageSetting: PropTypes.object,
  salaryUserList: PropTypes.object,
  usersSalary: PropTypes.array,
  userSalayItemData: PropTypes.object,
  handleOnChangePage: PropTypes.func,
  handleOnChangeRowsPerPage: PropTypes.func,
  isThisMonthSalaryChacked: PropTypes.bool,
  editBtnStatus: PropTypes.bool,
  usersIsSalaryChecked: PropTypes.array,
  isSalaryItemsLock: PropTypes.bool,
  isSalaryChackedData: PropTypes.object,
  borrowDisplay: PropTypes.bool,
}

Results.defaultProps = {
  usersSalary: [],
}

export default Results
