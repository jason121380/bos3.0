/** @jsxImportSource @emotion/react */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from '@mui/material'
import { css } from '@emotion/react'

import styles from './styles'

function Results({ className, results, excelData, attributeSwitchs, membershipDisplay, ...rest }) {
  return (
    <div {...rest} css={css([styles.root, className])}>
      <TableContainer component={Paper} style={{ maxHeight: 'calc(100vh - 280px' }}>
        <Table css={styles.table} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow css={styles.stickyRow}>
              <TableCell css={styles.sticky}>編號</TableCell>
              <TableCell css={styles.sticky2}>設計師</TableCell>
              <TableCell>服務業績/人次/單均價</TableCell>
              <TableCell>店販業績/人次/單均價</TableCell>
              {membershipDisplay ? <TableCell>會員卡業績/人次/單均價</TableCell> : null}
              <TableCell>男/女/未知 (人次)</TableCell>
              <TableCell>指定/不指定 (人次)</TableCell>
              <TableCell>男/女/未知 (不重複)</TableCell>
              {results.users[0].categoryData.map((data, index) => {
                if (attributeSwitchs[index]) {
                  return <TableCell key={index}>{`${data.categoryName}/人次/單均價`}</TableCell>
                }
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {results.users.filter(data =>
            (
              data.fakePerformance > 0 || data.orderCount > 0 || data.averagePerformance > 0 ||
              data.productPerformance > 0 || data.productOrderCount > 0 || data.productAveragePerformance > 0 ||
              data.membershipPerformance > 0 || data.membershipOrderCount > 0 || data.membershipAveragePerformance > 0 ||
              data.orderMaleCount > 0 || data.orderFemaleCount > 0 || data.orderUnknownCount > 0
            )).map((user, index) => {
              return (
                <TableRow key={index} hover>
                  <TableCell css={styles.sticky}>{user.userNo}</TableCell>
                  <TableCell css={styles.sticky2}>{user.userName}</TableCell>
                  <TableCell>
                    {Math.round(user.fakePerformance)}/{user.orderCount}/
                    {Math.round(user.averagePerformance)}
                  </TableCell>
                  <TableCell>
                    {Math.round(user.productPerformance)}/{user.productOrderCount}/
                    {Math.round(user.productAveragePerformance)}
                  </TableCell>
                  {membershipDisplay ?
                    <TableCell>
                      {Math.round(user.membershipPerformance)}/{user.membershipOrderCount}/
                      {Math.round(user.membershipAveragePerformance)}
                    </TableCell> : null
                  }
                  <TableCell>
                    {Math.round(user.orderMaleCount)}/{user.orderFemaleCount}/
                    {Math.round(user.orderUnknownCount)}
                  </TableCell>
                  <TableCell>
                    {Math.round(user.orderDesignateCount)}/{user.orderNonDesignatecount}
                  </TableCell>
                  <TableCell>
                    {Math.round(user.customerMaleCount)}/{user.customerFemaleCount}/
                    {Math.round(user.customerUnknownCount)}
                  </TableCell>
                  {user.categoryData.map(({ categoryName, fakePerformance, orderCount, averagePerformance }, index) => {
                    if (attributeSwitchs[index]) {
                      return (
                        <TableCell key={`${categoryName}-${index}`}>
                          {`${Math.round(fakePerformance)}/${orderCount}/${Math.round(averagePerformance)}`}
                        </TableCell>
                      )
                    }
                  })}
                </TableRow>
              )
            })}
            <TableRow hover>
              <TableCell css={styles.sticky} />
              <TableCell css={styles.sticky2} style={{ fontWeight: 'bold' }}>全店</TableCell>
              <TableCell>
                {Math.round(results.wholeStore.fakePerformance)}/{results.wholeStore.orderCount}/
                {Math.round(results.wholeStore.averagePerformance)}
              </TableCell>
              <TableCell>
                {Math.round(results.wholeStore.productPerformance)}/
                {results.wholeStore.productOrderCount}/
                {Math.round(results.wholeStore.productAveragePerformance)}
              </TableCell>
              {membershipDisplay ?
                <TableCell>
                  {Math.round(results.wholeStore.membershipPerformance)}/
                  {results.wholeStore.membershipOrderCount}/
                  {Math.round(results.wholeStore.membershipAveragePerformance)}
                </TableCell> : null
              }
              <TableCell>
                {Math.round(results.wholeStore.orderMaleCount)}/
                {results.wholeStore.orderFemaleCount}/
                {Math.round(results.wholeStore.orderUnknownCount)}
              </TableCell>
              <TableCell>
                {Math.round(results.wholeStore.orderDesignateCount)}/
                {results.wholeStore.orderNonDesignatecount}
              </TableCell>
              <TableCell>
                {Math.round(results.wholeStore.customerMaleCount)}/
                {results.wholeStore.customerFemaleCount}/
                {Math.round(results.wholeStore.customerUnknownCount)}
              </TableCell>
                {results.wholeStore.categoryData.map(({ categoryName, fakePerformance, orderCount, averagePerformance }, index) => {
                  if (attributeSwitchs[index]) {
                    return (
                      <TableCell key={`${categoryName}-${index}`}>
                        {`${Math.round(fakePerformance)}/${orderCount}/${Math.round(averagePerformance)}`}
                      </TableCell>
                    )
                  }
                })}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default Results
