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
import clsx from 'clsx'
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
    border: '1px solid rgb(var(--border))',
    backgroundColor: 'rgb(var(--background))',
    overflow: 'hidden',
  }),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 2400,
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
    '&.Mui-selected': {
      backgroundColor: 'rgb(var(--surface)) !important',
    },
    '&.Mui-selected:hover': {
      backgroundColor: 'rgb(var(--surface)) !important',
    },
  }),
  actions: css({
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
    borderTop: '1px solid rgb(var(--border))',
  }),
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
              <Typography variant="h6" style={{ fontWeight: 'bold', color: 'rgb(var(--text))' }}>
                加項總覽
              </Typography>
              <Typography color="textSecondary" variant="body2">
                共 {users.length} 筆資料, {pageSetting.pageOffset + 1}/{Math.ceil(users.length / pageSetting.pageLimit)} 頁
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
                    <TableCell>實發金額</TableCell>
                    <TableCell>工資</TableCell>
                    <TableCell>伙食津貼</TableCell>
                    <TableCell>職務加給</TableCell>
                    <TableCell>勞健保勞退</TableCell>
                    <TableCell>全勤獎金</TableCell>
                    <TableCell>售貨獎金</TableCell>
                    <TableCell>業績抽成</TableCell>
                    <TableCell>特殊抽成</TableCell>
                    <TableCell>洗髮抽成</TableCell>
                    <TableCell>護髮抽成</TableCell>
                    <TableCell>燙染抽成</TableCell>
                    <TableCell>其它抽成</TableCell>
                    <TableCell>其他津貼</TableCell>
                    <TableCell>獎勵金</TableCell>
                    <TableCell>顧客還單</TableCell>
                    <TableCell>績效抽成</TableCell>
                    <TableCell>加項合計</TableCell>
                    <TableCell>指定業績</TableCell>
                    <TableCell>不指定業績</TableCell>
                    <TableCell>點數</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(data => (
                    <TableRow key={data.id} css={localStyles.tableRow}>
                      <TableCell>{data.designerNo}</TableCell>
                      <TableCell>{data.name}</TableCell>
                      <TableCell>{data.jobTitle}</TableCell>
                      <TableCell>
                        {data.salary.wage +
                          data.salary.mealAllowance +
                          data.salary.additionOfDuties +
                          data.salary.laborhealthInsurance +
                          data.salary.attendanceBonus +
                          data.salary.salesBonus +
                          data.salary.salesCommission +
                          data.salary.specialCommission +
                          data.salary.shampooCommission +
                          data.salary.hairCareCommission +
                          data.salary.hotDyeingCommission +
                          data.salary.otherCommission +
                          data.salary.otherAllowance +
                          data.salary.reward +
                          data.salary.customerReturn +
                          data.salary.performanceCommission +
                          data.salary.designateSales +
                          data.salary.notDesignateSales}
                      </TableCell>
                      <TableCell>{data.salary.wage}</TableCell>
                      <TableCell>{data.salary.mealAllowance}</TableCell>
                      <TableCell>{data.salary.additionOfDuties}</TableCell>
                      <TableCell>{data.salary.laborhealthInsurance}</TableCell>
                      <TableCell>{data.salary.attendanceBonus}</TableCell>
                      <TableCell>{data.salary.salesBonus}</TableCell>
                      <TableCell>{data.salary.salesCommission}</TableCell>
                      <TableCell>{data.salary.specialCommission}</TableCell>
                      <TableCell>{data.salary.shampooCommission}</TableCell>
                      <TableCell>{data.salary.hairCareCommission}</TableCell>
                      <TableCell>{data.salary.hotDyeingCommission}</TableCell>
                      <TableCell>{data.salary.otherCommission}</TableCell>
                      <TableCell>{data.salary.otherAllowance}</TableCell>
                      <TableCell>{data.salary.reward}</TableCell>
                      <TableCell>{data.salary.customerReturn}</TableCell>
                      <TableCell>{data.salary.performanceCommission}</TableCell>
                      <TableCell>
                        {data.salary.wage +
                          data.salary.mealAllowance +
                          data.salary.additionOfDuties +
                          data.salary.laborhealthInsurance +
                          data.salary.attendanceBonus +
                          data.salary.salesBonus +
                          data.salary.salesCommission +
                          data.salary.specialCommission +
                          data.salary.shampooCommission +
                          data.salary.hairCareCommission +
                          data.salary.hotDyeingCommission +
                          data.salary.otherCommission +
                          data.salary.otherAllowance +
                          data.salary.reward +
                          data.salary.customerReturn +
                          data.salary.performanceCommission}
                      </TableCell>
                      <TableCell>{data.salary.designateSales}</TableCell>
                      <TableCell>{data.salary.notDesignateSales}</TableCell>
                      <TableCell>{data.salary.points}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow css={localStyles.tableRow}>
                    <TableCell>合 計:</TableCell>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, item) =>
                        (total =
                          total +
                          item.salary.wage +
                          item.salary.mealAllowance +
                          item.salary.additionOfDuties +
                          item.salary.laborhealthInsurance +
                          item.salary.attendanceBonus +
                          item.salary.salesBonus +
                          item.salary.salesCommission +
                          item.salary.specialCommission +
                          item.salary.shampooCommission +
                          item.salary.hairCareCommission +
                          item.salary.hotDyeingCommission +
                          item.salary.otherCommission +
                          item.salary.otherAllowance +
                          item.salary.reward +
                          item.salary.customerReturn +
                          item.salary.performanceCommission +
                          item.salary.designateSales +
                          item.salary.notDesignateSales),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce((total, item) => (total = total + item.salary.wage), 0)}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, item) => (total = total + item.salary.mealAllowance),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, item) => (total = total + item.salary.additionOfDuties),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, item) => (total = total + item.salary.laborhealthInsurance),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, item) => (total = total + item.salary.attendanceBonus),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce((total, item) => (total = total + item.salary.salesBonus), 0)}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, item) => (total = total + item.salary.salesCommission),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, item) => (total = total + item.salary.specialCommission),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, item) => (total = total + item.salary.shampooCommission),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, item) => (total = total + item.salary.hairCareCommission),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, item) => (total = total + item.salary.hotDyeingCommission),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, item) => (total = total + item.salary.otherCommission),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, item) => (total = total + item.salary.otherAllowance),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce((total, item) => (total = total + item.salary.reward), 0)}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, item) => (total = total + item.salary.customerReturn),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, item) => (total = total + item.salary.performanceCommission),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, item) =>
                        (total =
                          total +
                          item.salary.wage +
                          item.salary.mealAllowance +
                          item.salary.additionOfDuties +
                          item.salary.laborhealthInsurance +
                          item.salary.attendanceBonus +
                          item.salary.salesBonus +
                          item.salary.salesCommission +
                          item.salary.specialCommission +
                          item.salary.shampooCommission +
                          item.salary.hairCareCommission +
                          item.salary.hotDyeingCommission +
                          item.salary.otherCommission +
                          item.salary.otherAllowance +
                          item.salary.reward +
                          item.salary.customerReturn +
                          item.salary.performanceCommission),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, item) => (total = total + item.salary.designateSales),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce(
                        (total, item) => (total = total + item.salary.notDesignateSales),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {users.reduce((total, item) => (total = total + item.salary.points), 0)}
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
