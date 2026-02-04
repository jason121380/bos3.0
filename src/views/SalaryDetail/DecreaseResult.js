/** @jsxImportSource @emotion/react */
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material'
import GenericMoreButton from 'components/GenericMoreButton'
import TableEditBar from 'components/TableEditBar'
import PropTypes from 'prop-types'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const localStyles = {
  card: css({
    borderRadius: '16px',
    boxShadow: 'none',
    border: '1px solid #f0f0f0',
    backgroundColor: '#fff',
    overflow: 'hidden',
  }),
  content: css({
    padding: '0px !important',
  }),
  inner: css({
    minWidth: 2300,
  }),
  tableHead: css({
    backgroundColor: '#FFFFFF',
    '& .MuiTableCell-head': {
      color: '#212121',
      fontWeight: 'bold',
      borderBottom: '1px solid #f0f0f0',
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
      borderBottom: '1px solid #f0f0f0',
      fontSize: '14px !important',
      color: '#333',
    },
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
    '&.Mui-selected': {
      backgroundColor: '#f9f9f9 !important',
    },
    '&.Mui-selected:hover': {
      backgroundColor: '#f9f9f9 !important',
    },
  }),
  actions: css({
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
    borderTop: '1px solid #f0f0f0',
  })
}

function Results({
  className,
  pageSetting,
  users,
  handleOnChangePage,
  handleOnChangeRowsPerPage,
  ...rest
}) {
  return (
    <div {...rest} css={css([localStyles.root, className])}>
      <Card css={localStyles.card}>
        <CardHeader
          action={<GenericMoreButton />}
          title={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Typography variant="h6" style={{ fontWeight: 'bold', color: '#202124' }}>
                扣項總覽
              </Typography>
              <Typography color="textSecondary" variant="body2">
                共 {pageSetting.totalCount} 筆資料, {pageSetting.pageOffset + 1}/{Math.ceil(pageSetting.totalCount / pageSetting.pageLimit)} 頁
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
                    <TableCell>代號</TableCell>
                    <TableCell>姓名</TableCell>
                    <TableCell>職稱</TableCell>
                    <TableCell>學費</TableCell>
                    <TableCell>教育費</TableCell>
                    <TableCell>旅遊基金</TableCell>
                    <TableCell>儲蓄金</TableCell>
                    <TableCell>福利金</TableCell>
                    <TableCell>勞健費</TableCell>
                    <TableCell>自購材料</TableCell>
                    <TableCell>員工借支</TableCell>
                    <TableCell>事病假</TableCell>
                    <TableCell>違規扣款</TableCell>
                    <TableCell>遲退未刷</TableCell>
                    <TableCell>未達扣款</TableCell>
                    <TableCell>贈品扣款</TableCell>
                    <TableCell>管理處用具</TableCell>
                    <TableCell>互助扣款</TableCell>
                    <TableCell>代墊款</TableCell>
                    <TableCell>宿舍費用</TableCell>
                    <TableCell>信用卡手續費</TableCell>
                    <TableCell>薪資欠款</TableCell>
                    <TableCell>顧客欠單</TableCell>
                    <TableCell>曠職扣款</TableCell>
                    <TableCell>減項合計</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(data => (
                    <TableRow key={data.id} css={localStyles.tableRow}>
                      <TableCell>{data.designerNo}</TableCell>
                      <TableCell>{data.name}</TableCell>
                      <TableCell>{data.jobTitle}</TableCell>
                      <TableCell>{data.salary.tuition}</TableCell>
                      <TableCell>{data.salary.educationFee}</TableCell>
                      <TableCell>{data.salary.tourismFund}</TableCell>
                      <TableCell>{data.salary.savings}</TableCell>
                      <TableCell>{data.salary.welfare}</TableCell>
                      <TableCell>{data.salary.laborHealthPremium}</TableCell>
                      <TableCell>{data.salary.selfPurchasedMaterials}</TableCell>
                      <TableCell>{data.salary.employeeLoan}</TableCell>
                      <TableCell>{data.salary.deductionForSickLeave}</TableCell>
                      <TableCell>{data.salary.illegalCharge}</TableCell>
                      <TableCell>{data.salary.lateRetreat}</TableCell>
                      <TableCell>{data.salary.DeductionOfLiabilityDue}</TableCell>
                      <TableCell>{data.salary.giftdeduction}</TableCell>
                      <TableCell>{data.salary.managementOfficeEquipment}</TableCell>
                      <TableCell>{data.salary.mutualDeduction}</TableCell>
                      <TableCell>{data.salary.advances}</TableCell>
                      <TableCell>{data.salary.dormitoryCosts}</TableCell>
                      <TableCell>{data.salary.creditCardFee}</TableCell>
                      <TableCell>{data.salary.salaryArrears}</TableCell>
                      <TableCell>{data.salary.customerArrears}</TableCell>
                      <TableCell>{data.salary.derelictionOfDuty}</TableCell>
                      <TableCell>
                        {data.salary.tuition +
                          data.salary.educationFee +
                          data.salary.tourismFund +
                          data.salary.savings +
                          data.salary.welfare +
                          data.salary.laborHealthPremium +
                          data.salary.selfPurchasedMaterials +
                          data.salary.employeeLoan +
                          data.salary.deductionForSickLeave +
                          data.salary.illegalCharge +
                          data.salary.lateRetreat +
                          data.salary.DeductionOfLiabilityDue +
                          data.salary.giftdeduction +
                          data.salary.managementOfficeEquipment +
                          data.salary.mutualDeduction +
                          data.salary.advances +
                          data.salary.dormitoryCosts +
                          data.salary.creditCardFee +
                          data.salary.salaryArrears +
                          data.salary.customerArrears +
                          data.salary.derelictionOfDuty}
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow css={localStyles.tableRow}>
                    <TableCell>合 計:</TableCell>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell>
                      {users.reduce((total, data) => (total = total + data.salary.tuition), 0)}
                    </TableCell>
                    <TableCell>
                      {users.reduce((total, data) => (total = total + data.salary.educationFee), 0)}
                    </TableCell>
                    <TableCell>
                      {users.reduce((total, data) => (total = total + data.salary.tourismFund), 0)}
                    </TableCell>
                    <TableCell>
                      {users.reduce((total, data) => (total = total + data.salary.savings), 0)}
                    </TableCell>
                    <TableCell>
                      {users.reduce((total, data) => (total = total + data.salary.welfare), 0)}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, data) => (total = total + data.salary.laborHealthPremium),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, data) => (total = total + data.salary.selfPurchasedMaterials),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce((total, data) => (total = total + data.salary.employeeLoan), 0)}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, data) => (total = total + data.salary.deductionForSickLeave),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, data) => (total = total + data.salary.illegalCharge),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce((total, data) => (total = total + data.salary.lateRetreat), 0)}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, data) => (total = total + data.salary.DeductionOfLiabilityDue),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, data) => (total = total + data.salary.giftdeduction),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, data) => (total = total + data.salary.managementOfficeEquipment),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, data) => (total = total + data.salary.mutualDeduction),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce((total, data) => (total = total + data.salary.advances), 0)}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, data) => (total = total + data.salary.dormitoryCosts),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, data) => (total = total + data.salary.creditCardFee),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, data) => (total = total + data.salary.salaryArrears),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, data) => (total = total + data.salary.customerArrears),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, data) => (total = total + data.salary.derelictionOfDuty),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, data) =>
                        (total =
                          total +
                          data.salary.tuition +
                          data.salary.educationFee +
                          data.salary.tourismFund +
                          data.salary.savings +
                          data.salary.welfare +
                          data.salary.laborHealthPremium +
                          data.salary.selfPurchasedMaterials +
                          data.salary.employeeLoan +
                          data.salary.deductionForSickLeave +
                          data.salary.illegalCharge +
                          data.salary.lateRetreat +
                          data.salary.DeductionOfLiabilityDue +
                          data.salary.giftdeduction +
                          data.salary.managementOfficeEquipment +
                          data.salary.mutualDeduction +
                          data.salary.advances +
                          data.salary.dormitoryCosts +
                          data.salary.creditCardFee +
                          data.salary.salaryArrears +
                          data.salary.customerArrears +
                          data.salary.derelictionOfDuty),
                        0
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
        <CardActions css={localStyles.actions}>
          <TablePagination
            labelRowsPerPage='每頁顯示數量'
            component="div"
            count={pageSetting.totalCount}
            onPageChange={handleOnChangePage}
            onRowsPerPageChange={handleOnChangeRowsPerPage}
            page={pageSetting.pageOffset}
            rowsPerPage={pageSetting.pageLimit}
            rowsPerPageOptions={[5, 10, 20, 25, 1000]}
          />
        </CardActions>
      </Card>
      <TableEditBar />
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
