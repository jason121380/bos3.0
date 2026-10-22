import { Fragment } from 'react'
import { EmptyState } from 'ui/empty-state'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

// 固定首欄與表頭（原 styles.sticky／stickyRow，改用 tokens 底色）
const STICKY_COL = 'sticky left-0 z-[99] w-[150px] bg-background'
// 列印時表頭白底黑字，與舊版 th.MuiTableCell-head 的列印樣式一致
const STICKY_ROW = 'sticky top-0 z-[100] print:bg-transparent print:[&_th]:text-text'

// 客單價＝業績÷客數四捨五入；客數為 0（0÷0 為 NaN、業績÷0 為 Infinity）時顯示 0（原本只擋 NaN，業績不為 0 時會顯示 Infinity）
const perCustomer = (performance, customers) => {
  const value = performance / customers
  return Number.isFinite(value) ? Math.round(value) : 0
}

export default function Results({ designerPerformance, serviceCategory, membershipDisplay }) {
  return (
    designerPerformance.length === 0 ? 
    <EmptyState title="無資料" /> : (
      // designerPerformanceReportTable／designerPerformance／sumPerformance 為列印與斑馬紋樣式的掛鉤（initialize.scss），保留
      <Table dense wrapperClassName='designerPerformanceReportTable mt-2.5 max-h-[calc(100vh-265px)] overflow-auto' aria-label="a dense table">
          <TableHeader className={STICKY_ROW}>
            <TableRow className="hover:bg-transparent">
              <TableHead className={`${STICKY_COL} bg-surface`}>設計師</TableHead>
              {serviceCategory.map((data, index) => {
                return (
                  <Fragment key={index}>
                    <TableHead numeric>{data}</TableHead>
                    <TableHead numeric>人數</TableHead>
                  </Fragment>
                )
              })}
              <TableHead numeric>業績</TableHead>
              <TableHead numeric>業績客單價</TableHead>
              <TableHead numeric>店販</TableHead>
              {membershipDisplay && <TableHead numeric>會員卡</TableHead>}
              <TableHead numeric>總業績</TableHead>
              <TableHead numeric>天數</TableHead>
              <TableHead numeric>總客數</TableHead>
              <TableHead numeric>總客單價</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='designerPerformance'>
            {designerPerformance[0].designerPerformanceData.map((data, index) => {
              return (
                <Fragment key={index} >
                  <TableRow >
                    <TableCell className={STICKY_COL}>{data.designerName}</TableCell>
                    {data.serviceCategory.map((service, index) => {
                      return (
                        <Fragment key={index}>
                          <TableCell numeric>{formatNumber(service.servicePerformance)}</TableCell>
                          <TableCell numeric>{formatNumber(service.servicePerformanceCount)}</TableCell>
                        </Fragment> 
                      )
                    })}
                    <TableCell numeric>{formatNumber(data.performance)}</TableCell>
                    <TableCell numeric>
                      {formatNumber(perCustomer(data.performance, data.totalCustomer))}
                    </TableCell>
                    <TableCell numeric>{formatNumber(data.productPerformance)}</TableCell>
                    {membershipDisplay && <TableCell numeric>{formatNumber(data.membershipPerformance)}</TableCell>}
                    <TableCell numeric>{formatNumber(data.totalPerformance)}</TableCell>
                    <TableCell numeric>{formatNumber(data.performanceDay)}</TableCell>
                    <TableCell numeric>{formatNumber(data.totalCustomer)}</TableCell>
                    <TableCell numeric>{formatNumber(data.totalPerformanceCustomerUnit)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={STICKY_COL}>指定</TableCell>
                    {data.serviceCategory.map((service, index) => {
                      return (
                        <Fragment key={index}>
                          <TableCell numeric>{formatNumber(service.designateServicePerformance)}</TableCell>
                          <TableCell numeric>{formatNumber(service.designateCount)}</TableCell>
                        </Fragment> 
                      )
                    })}
                    <TableCell numeric>{formatNumber(data.designatePerformance)}</TableCell>
                    <TableCell numeric>
                      {formatNumber(perCustomer(data.designatePerformance, data.totalDesignateCustomer))}
                    </TableCell>
                    <TableCell numeric>{formatNumber(data.designateProductPerformance)}</TableCell>
                    {membershipDisplay && <TableCell numeric>{formatNumber(data.designateMembershipPerformance)}</TableCell>}
                    <TableCell numeric>{formatNumber(data.designateTotalPerformance)}</TableCell>
                    <TableCell numeric>{formatNumber(data.designatePerformanceDay)}</TableCell>
                    <TableCell numeric>{formatNumber(data.totalDesignateCustomer)}</TableCell>
                    <TableCell numeric>{formatNumber(data.designateTotalPerformanceCustomerUnit)}</TableCell>
                  </TableRow>
                </Fragment>
              )
            })}
          </TableBody>
          <TableBody className='sumPerformance'>
            {designerPerformance[0].designerPerformanceSum.map((data, index) => {
              return (
                <TableRow key={index}>
                    <TableCell className={`${STICKY_COL} font-bold`}>{data.designerName}</TableCell>
                    {data.serviceCategory.map((service, index) => {
                      return (
                        <Fragment key={index}>
                          <TableCell numeric>{formatNumber(service.servicePerformance)}</TableCell>
                          <TableCell numeric>{formatNumber(service.servicePerformanceCount)}</TableCell>
                        </Fragment> 
                      )
                    })}
                    <TableCell numeric>{formatNumber(data.performance)}</TableCell>
                    <TableCell numeric>
                      {formatNumber(perCustomer(data.performance, data.totalCustomer))}
                    </TableCell>
                    <TableCell numeric>{formatNumber(data.productPerformance)}</TableCell>
                    {membershipDisplay && <TableCell numeric>{formatNumber(data.membershipPerformance)}</TableCell>}
                    <TableCell numeric>{formatNumber(data.totalPerformance)}</TableCell>
                    <TableCell numeric>{formatNumber(data.performanceDay)}</TableCell>
                    <TableCell numeric>{formatNumber(data.totalCustomer)}</TableCell>
                    <TableCell numeric>{formatNumber(data.totalPerformanceCustomerUnit)}</TableCell>
                  </TableRow>
              )
            })}
            {designerPerformance[0].designerPerformanceSum.map((data, index) => {
              return (
                <TableRow key={index} >
                  <TableCell className={`${STICKY_COL} font-bold`}>指定</TableCell>
                  {data.serviceCategory.map((service, index) => {
                      return (
                        <Fragment key={index}>
                          <TableCell numeric>{formatNumber(service.designateServicePerformance)}</TableCell>
                          <TableCell numeric>{formatNumber(service.designateCount)}</TableCell>
                        </Fragment> 
                      )
                  })}
                  <TableCell numeric>{formatNumber(data.designatePerformance)}</TableCell>
                  <TableCell numeric>{formatNumber(perCustomer(data.designatePerformance, data.totalDesignateCustomer))}</TableCell>
                  <TableCell numeric>{formatNumber(data.designateProductPerformance)}</TableCell>
                  {membershipDisplay && <TableCell numeric>{formatNumber(data.designateMembershipPerformance)}</TableCell>}
                  <TableCell numeric>{formatNumber(data.designateTotalPerformance)}</TableCell>
                  <TableCell numeric>{formatNumber(data.designatePerformanceDay)}</TableCell>
                  <TableCell numeric>{formatNumber(data.totalDesignateCustomer)}</TableCell>
                  <TableCell numeric>{formatNumber(data.designateTotalPerformanceCustomerUnit)}</TableCell>
                </TableRow>
              )
            })}
            {designerPerformance[0].designerPerformanceSum.map((data, index) => {
              return (
                <TableRow key={index} >
                  <TableCell className={`${STICKY_COL} font-bold`}>不指定</TableCell>
                  {data.serviceCategory.map((service, index) => {
                    return (
                      <Fragment key={index}>
                        <TableCell numeric>{formatNumber(service.nonDesignateServicePerformance)}</TableCell>
                        <TableCell numeric>{formatNumber(service.nonDesignateCount)}</TableCell>
                      </Fragment> 
                    )
                  })}
                  <TableCell numeric>{formatNumber(data.nonDesignatePerformance)}</TableCell>
                  <TableCell numeric>{formatNumber(perCustomer(data.nonDesignatePerformance, data.totalNonDesignateCustomer))}</TableCell>
                  <TableCell numeric>{formatNumber(data.nonDesignateProductPerformance)}</TableCell>
                  {membershipDisplay && <TableCell numeric>{formatNumber(data.nonDesignateMembershipPerformance)}</TableCell>}
                  <TableCell numeric>{formatNumber(data.nonDesignateTotalPerformance)}</TableCell>
                  <TableCell/>
                  <TableCell numeric>{formatNumber(data.totalNonDesignateCustomer)}</TableCell>
                  <TableCell numeric>{formatNumber(data.nonDesignateTotalPerformanceCustomerUnit)}</TableCell>
                </TableRow>
              )
            })}
            {designerPerformance[0].designerPerformancePercented.map((data, index) => {
              return (
                <TableRow key={index} >
                  <TableCell className={`${STICKY_COL} font-bold`}>{data.designerName}</TableCell>
                  {data.serviceCategory.map((service, index) => {
                    return (
                      <Fragment key={index}>
                        <TableCell/>
                        <TableCell numeric>{service.designateCount !== null && service.designateCount + '%'}</TableCell>
                      </Fragment> 
                    )
                  })}
                  <TableCell/>
                  <TableCell/>
                  <TableCell/>
                  {membershipDisplay && <TableCell/>}
                  <TableCell/>
                  <TableCell/>
                  <TableCell numeric>{data.totalDesignateCustomer !== null && data.totalDesignateCustomer + '%'}</TableCell>
                  <TableCell/>
                </TableRow>
              )
            })}
            {designerPerformance[0].designerPerformanceMale.map((data, index) => {
              return (
                <TableRow key={index} >
                  <TableCell className={`${STICKY_COL} font-bold`}>{data.designerName}</TableCell>
                    {data.serviceCategory.map((service, index) => {
                      return (
                        <Fragment key={index}>
                          <TableCell numeric>{formatNumber(service.servicePerformance)}</TableCell>
                          <TableCell numeric>{formatNumber(service.servicePerformanceCount)}</TableCell>
                        </Fragment> 
                      )
                    })}
                    <TableCell numeric>{formatNumber(data.performance)}</TableCell>
                    <TableCell numeric>
                      {formatNumber(perCustomer(data.performance, data.totalCustomer))}
                    </TableCell>
                    <TableCell numeric>{formatNumber(data.productPerformance)}</TableCell>
                    {membershipDisplay && <TableCell numeric>{formatNumber(data.membershipPerformance)}</TableCell>}
                    <TableCell numeric>{formatNumber(data.totalPerformance)}</TableCell>
                    <TableCell numeric>{formatNumber(data.performanceDay)}</TableCell>
                    <TableCell numeric>{formatNumber(data.totalCustomer)}</TableCell>
                    <TableCell numeric>{formatNumber(data.totalPerformanceCustomerUnit)}</TableCell>
                </TableRow>
              )
            })}
            {designerPerformance[0].designerPerformanceFemale.map((data, index) => {
              return (
                <TableRow key={index} >
                  <TableCell className={`${STICKY_COL} font-bold`}>{data.designerName}</TableCell>
                  {data.serviceCategory.map((service, index) => {
                      return (
                        <Fragment key={index}>
                          <TableCell numeric>{formatNumber(service.servicePerformance)}</TableCell>
                          <TableCell numeric>{formatNumber(service.servicePerformanceCount)}</TableCell>
                        </Fragment> 
                      )
                    })}
                  <TableCell numeric>{formatNumber(data.performance)}</TableCell>
                  <TableCell numeric>
                    {formatNumber(perCustomer(data.performance, data.totalCustomer))}
                  </TableCell>
                  <TableCell numeric>{formatNumber(data.productPerformance)}</TableCell>
                  {membershipDisplay && <TableCell numeric>{formatNumber(data.membershipPerformance)}</TableCell>}
                  <TableCell numeric>{formatNumber(data.totalPerformance)}</TableCell>
                  <TableCell numeric>{formatNumber(data.performanceDay)}</TableCell>
                  <TableCell numeric>{formatNumber(data.totalCustomer)}</TableCell>
                  <TableCell numeric>{formatNumber(data.totalPerformanceCustomerUnit)}</TableCell>
                </TableRow>
              )
            })}
            {designerPerformance[0].designerPerformanceUnknown.map((data, index) => {
              return (
                <TableRow key={index} >
                  <TableCell className={`${STICKY_COL} font-bold`}>{data.designerName}</TableCell>
                  {data.serviceCategory.map((service, index) => {
                      return (
                        <Fragment key={index}>
                          <TableCell numeric>{formatNumber(service.servicePerformance)}</TableCell>
                          <TableCell numeric>{formatNumber(service.servicePerformanceCount)}</TableCell>
                        </Fragment> 
                      )
                    })}
                  <TableCell numeric>{formatNumber(data.performance)}</TableCell>
                  <TableCell numeric>
                    {formatNumber(perCustomer(data.performance, data.totalCustomer))}
                  </TableCell>
                  <TableCell numeric>{formatNumber(data.productPerformance)}</TableCell>
                  {membershipDisplay && <TableCell numeric>{formatNumber(data.membershipPerformance)}</TableCell>}
                  <TableCell numeric>{formatNumber(data.totalPerformance)}</TableCell>
                  <TableCell numeric>{formatNumber(data.performanceDay)}</TableCell>
                  <TableCell numeric>{formatNumber(data.totalCustomer)}</TableCell>
                  <TableCell numeric>{formatNumber(data.totalPerformanceCustomerUnit)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
      </Table>
    )
  )
}

Results.defaultProps = {}
