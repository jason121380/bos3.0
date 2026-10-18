/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import format from 'date-fns/format'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

import styles from './styles'

// 固定首欄（原 styles.sticky 寫死白底，改用 tokens）
const STICKY_COL = 'sticky left-0 top-0 z-[99] min-w-[100px] max-w-[100px] break-all bg-background'

function Results({ className, results, excelData, attributeSwitchs, membershipDisplay, ...rest }) {
  return (
    <div {...rest} css={css([styles.root, className])}>
      <Table aria-label="a dense table">
        <TableHeader className="sticky top-0 z-[100]">
          <TableRow className="hover:bg-transparent">
            <TableHead className={`${STICKY_COL} bg-surface`}>日期</TableHead>
            <TableHead numeric>服務業績/人次/單均價</TableHead>
            <TableHead numeric>店販業績/人次/單均價</TableHead>
            {membershipDisplay ? <TableHead numeric>會員卡業績/人次/單均價</TableHead> : null}
            <TableHead numeric>男/女/未知 (人次)</TableHead>
            <TableHead numeric>指定/不指定 (人次)</TableHead>
            <TableHead numeric>男/女/未知 (不重複)</TableHead>
            {results[0].performance.categoryData.map((data, index) => {
              if (attributeSwitchs[index]) {
                return <TableHead numeric key={index}>{`${data.categoryName}/人次/單均價`}</TableHead>
              }
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map(({ date, performance }, index) => {
            const {
              fakePerformance, orderCount, averagePerformance, productPerformance, productOrderCount,
              membershipPerformance, membershipOrderCount, membershipAveragePerformance, customerUnknownCount,
              productAveragePerformance, orderMaleCount, orderFemaleCount, orderUnknownCount, categoryData,
              orderDesignateCount, orderNonDesignatecount, customerMaleCount, customerFemaleCount
            } = performance
            return (
              <TableRow key={index}>
                <TableCell className={`${STICKY_COL} tabular-nums`}>{format(date, 'yyyy/MM/dd')}</TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(fakePerformance))}/{formatNumber(orderCount)}/
                  {formatNumber(Math.round(averagePerformance))}
                </TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(productPerformance))}/{formatNumber(productOrderCount)}/
                  {formatNumber(Math.round(productAveragePerformance))}
                </TableCell>
                {membershipDisplay ?
                  <TableCell numeric>
                    {formatNumber(Math.round(membershipPerformance))}/{formatNumber(membershipOrderCount)}/
                    {formatNumber(Math.round(membershipAveragePerformance))}
                  </TableCell> : null
                }
                <TableCell numeric>
                  {formatNumber(Math.round(orderMaleCount))}/{formatNumber(orderFemaleCount)}/
                  {formatNumber(Math.round(orderUnknownCount))}
                </TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(orderDesignateCount))}/{formatNumber(orderNonDesignatecount)}
                </TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(customerMaleCount))}/{formatNumber(customerFemaleCount)}/
                  {formatNumber(Math.round(customerUnknownCount))}
                </TableCell>
                {categoryData.map(({ categoryName, fakePerformance, orderCount, averagePerformance }, index) => {
                  if (attributeSwitchs[index]) {
                    return (
                      <TableCell numeric key={`${categoryName}-${index}`}>
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
    </div>
  )
}

export default Results
