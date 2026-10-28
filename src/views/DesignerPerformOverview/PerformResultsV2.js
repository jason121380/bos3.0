import { cn } from 'ui/utils'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

// 編號、設計師兩欄固定在左側，表頭固定在上方（與舊版 sticky 行為相同）
const sticky = 'sticky left-0 z-[99] min-w-[50px] max-w-[50px] break-all'
const sticky2 = 'sticky left-[50px] z-[99] pr-5'

function Results({ className, results, excelData, attributeSwitchs, membershipDisplay, ...rest }) {
  return (
    <div {...rest} className={cn('mt-2', className)}>
      {/* 舊版 maxHeight 為 'calc(100vh - 280px'（少右括號，瀏覽器不採用），故不加高度限制以維持相同捲動行為 */}
      <Table dense>
        <TableHeader className="sticky top-0 z-[100]">
          <TableRow className="hover:bg-transparent">
            <TableHead className={cn(sticky, 'bg-surface')}>編號</TableHead>
            <TableHead className={cn(sticky2, 'bg-surface')}>設計師</TableHead>
            <TableHead numeric>服務業績/人次/單均價</TableHead>
            <TableHead numeric>店販業績/人次/單均價</TableHead>
            {membershipDisplay ? <TableHead numeric>會員卡業績/人次/單均價</TableHead> : null}
            <TableHead numeric>男/女/未知 (人次)</TableHead>
            <TableHead numeric>指定/不指定 (人次)</TableHead>
            <TableHead numeric>男/女/未知 (不重複)</TableHead>
            {results.users[0].categoryData.map((data, index) => {
              if (attributeSwitchs[index]) {
                return <TableHead numeric key={index}>{`${data.categoryName}/人次/單均價`}</TableHead>
              }
              return undefined
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.users.filter(data =>
          (
            data.fakePerformance > 0 || data.orderCount > 0 || data.averagePerformance > 0 ||
            data.productPerformance > 0 || data.productOrderCount > 0 || data.productAveragePerformance > 0 ||
            data.membershipPerformance > 0 || data.membershipOrderCount > 0 || data.membershipAveragePerformance > 0 ||
            data.orderMaleCount > 0 || data.orderFemaleCount > 0 || data.orderUnknownCount > 0
          )).map((user, index) => {
            return (
              <TableRow key={index} className="group">
                <TableCell className={cn(sticky, 'bg-background tabular-nums group-hover:bg-surface-hover')}>{user.userNo}</TableCell>
                <TableCell className={cn(sticky2, 'bg-background group-hover:bg-surface-hover')}>{user.userName}</TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(user.fakePerformance))}/{formatNumber(user.orderCount)}/
                  {formatNumber(Math.round(user.averagePerformance))}
                </TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(user.productPerformance))}/{formatNumber(user.productOrderCount)}/
                  {formatNumber(Math.round(user.productAveragePerformance))}
                </TableCell>
                {membershipDisplay ?
                  <TableCell numeric>
                    {formatNumber(Math.round(user.membershipPerformance))}/{formatNumber(user.membershipOrderCount)}/
                    {formatNumber(Math.round(user.membershipAveragePerformance))}
                  </TableCell> : null
                }
                <TableCell numeric>
                  {formatNumber(Math.round(user.orderMaleCount))}/{formatNumber(user.orderFemaleCount)}/
                  {formatNumber(Math.round(user.orderUnknownCount))}
                </TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(user.orderDesignateCount))}/{formatNumber(user.orderNonDesignatecount)}
                </TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(user.customerMaleCount))}/{formatNumber(user.customerFemaleCount)}/
                  {formatNumber(Math.round(user.customerUnknownCount))}
                </TableCell>
                {user.categoryData.map(({ categoryName, fakePerformance, orderCount, averagePerformance }, index) => {
                  if (attributeSwitchs[index]) {
                    return (
                      <TableCell numeric key={`${categoryName}-${index}`}>
                        {`${formatNumber(Math.round(fakePerformance))}/${formatNumber(orderCount)}/${formatNumber(Math.round(averagePerformance))}`}
                      </TableCell>
                    )
                  }
                  return undefined
                })}
              </TableRow>
            )
          })}
          <TableRow className="group font-bold">
            <TableCell className={cn(sticky, 'bg-background group-hover:bg-surface-hover')} />
            <TableCell className={cn(sticky2, 'bg-background group-hover:bg-surface-hover')} style={{ fontWeight: 'bold' }}>全店</TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(results.wholeStore.fakePerformance))}/{formatNumber(results.wholeStore.orderCount)}/
              {formatNumber(Math.round(results.wholeStore.averagePerformance))}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(results.wholeStore.productPerformance))}/
              {formatNumber(results.wholeStore.productOrderCount)}/
              {formatNumber(Math.round(results.wholeStore.productAveragePerformance))}
            </TableCell>
            {membershipDisplay ?
              <TableCell numeric>
                {formatNumber(Math.round(results.wholeStore.membershipPerformance))}/
                {formatNumber(results.wholeStore.membershipOrderCount)}/
                {formatNumber(Math.round(results.wholeStore.membershipAveragePerformance))}
              </TableCell> : null
            }
            <TableCell numeric>
              {formatNumber(Math.round(results.wholeStore.orderMaleCount))}/
              {formatNumber(results.wholeStore.orderFemaleCount)}/
              {formatNumber(Math.round(results.wholeStore.orderUnknownCount))}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(results.wholeStore.orderDesignateCount))}/
              {formatNumber(results.wholeStore.orderNonDesignatecount)}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(results.wholeStore.customerMaleCount))}/
              {formatNumber(results.wholeStore.customerFemaleCount)}/
              {formatNumber(Math.round(results.wholeStore.customerUnknownCount))}
            </TableCell>
            {results.wholeStore.categoryData.map(({ categoryName, fakePerformance, orderCount, averagePerformance }, index) => {
              if (attributeSwitchs[index]) {
                return (
                  <TableCell numeric key={`${categoryName}-${index}`}>
                    {`${formatNumber(Math.round(fakePerformance))}/${formatNumber(orderCount)}/${formatNumber(Math.round(averagePerformance))}`}
                  </TableCell>
                )
              }
              return undefined
            })}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

export default Results
