/** @jsxImportSource @emotion/react */
import {
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper,
} from '@mui/material'
import { css } from '@emotion/react'
import format from 'date-fns/format'

import styles from './styles'

function Results({ className, results, excelData, attributeSwitchs, membershipDisplay, ...rest }) {
  return (
    <div {...rest} css={css([styles.root, className])}>
      <TableContainer component={Paper} style={{ maxHeight: 'calc(100vh - 280px' }}>
        <Table css={styles.table} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow css={styles.stickyRow}>
            <TableCell css={styles.sticky}>日期</TableCell>
              <TableCell>服務業績/人次/單均價</TableCell>
              <TableCell>店販業績/人次/單均價</TableCell>
              {membershipDisplay ? <TableCell>會員卡業績/人次/單均價</TableCell> : null}
              <TableCell>男/女/未知 (人次)</TableCell>
              <TableCell>指定/不指定 (人次)</TableCell>
              <TableCell>男/女/未知 (不重複)</TableCell>
              {results[0].performance.categoryData.map((data, index) => {
                if (attributeSwitchs[index]) {
                  return <TableCell key={index}>{`${data.categoryName}/人次/單均價`}</TableCell>
                }
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map(({ date, performance }, index) => {
              const {
                fakePerformance, orderCount, averagePerformance, productPerformance, productOrderCount,
                membershipPerformance, membershipOrderCount, membershipAveragePerformance, customerUnknownCount,
                productAveragePerformance, orderMaleCount, orderFemaleCount, orderUnknownCount, categoryData,
                orderDesignateCount, orderNonDesignatecount, customerMaleCount, customerFemaleCount
              } = performance
              return (
                <TableRow key={index} hover>
                  <TableCell css={styles.sticky}>{format(date, 'yyyy/MM/dd')}</TableCell>
                  <TableCell>
                    {Math.round(fakePerformance)}/{orderCount}/
                    {Math.round(averagePerformance)}
                  </TableCell>
                  <TableCell>
                    {Math.round(productPerformance)}/{productOrderCount}/
                    {Math.round(productAveragePerformance)}
                  </TableCell>
                  {membershipDisplay ?
                    <TableCell>
                      {Math.round(membershipPerformance)}/{membershipOrderCount}/
                      {Math.round(membershipAveragePerformance)}
                    </TableCell> : null
                  }
                  <TableCell>
                    {Math.round(orderMaleCount)}/{orderFemaleCount}/
                    {Math.round(orderUnknownCount)}
                  </TableCell>
                  <TableCell>
                    {Math.round(orderDesignateCount)}/{orderNonDesignatecount}
                  </TableCell>
                  <TableCell>
                    {Math.round(customerMaleCount)}/{customerFemaleCount}/
                    {Math.round(customerUnknownCount)}
                  </TableCell>
                  {categoryData.map(({ categoryName, fakePerformance, orderCount, averagePerformance }, index) => {
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
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default Results
