import { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Card } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

// 第一欄（日期）固定在左側、表頭固定在上方，與舊版 sticky 行為相同
const stickyHead = 'sticky left-0 z-[99] bg-surface outline outline-1 outline-border'
const stickyCell = 'sticky left-0 z-[99] bg-background outline outline-1 outline-border'
// 每個服務欄位左右各半：虛業績／客次
const splitCell = 'flex w-full tabular-nums [&>div]:w-1/2 [&>div]:text-center'

function Results({ reportData, sort }) {
  const renderTable = () => {
    const { serviceIds, all, date, designer } = reportData
    const TotalRow = () => (
      <Fragment>
        {serviceIds.map(id => {
          const curService = []

          all.forEach(item => {
            const findData = item.singleServices.find(d => d.serviceId === id)
            findData && curService.push(findData.summary)
          })

          return (
            <TableCell key={`total-${id}`}>
              <div className={splitCell}>
                <div>{formatNumber(Math.round(curService.reduce((a, b) => a + b.performance, 0) * 100) / 100)}</div>
                <div>{Math.round(curService.reduce((a, b) => a + b.orderCount, 0) * 100) / 100}</div>
              </div>
            </TableCell>
          )
        })}
      </Fragment>

    )
    switch (sort) {
      case 'ALL':
        return (
          <Table wrapperClassName="max-h-[calc(100vh-250px)] overflow-auto" className="min-w-[650px]">
              <TableHeader className="sticky top-0 z-[100]">
                <TableRow>
                  <TableHead className={stickyHead}>日期</TableHead>
                  {serviceIds.map(id => {
                    const findData = all[0].singleServices.find(d => d.serviceId === id)
                    return (
                      <TableHead key={`thead-${findData.serviceId}`}>
                        <div className="text-center">{findData.serviceNo + ' - ' + findData.serviceName}</div>
                        <div className={splitCell}>
                          <div>虛業績</div>
                          <div>客次</div>
                        </div>
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>

              <TableBody>
                {all.map(d => (
                  <TableRow key={d.date}>
                    <TableCell className={stickyCell}>{d.date}</TableCell>
                    {serviceIds.map(id => {
                      const findData = d.singleServices.find(item => item.serviceId === id)
                      return (
                        <TableCell key={`${d.date}-${findData.serviceId}`}>
                          <div className={splitCell}>
                            <div>{formatNumber(Math.round(findData.summary.performance * 100) / 100)}</div>
                            <div>{findData.summary.orderCount}</div>
                          </div>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell className={stickyCell}>合計</TableCell>
                  <TotalRow />
                </TableRow>
              </TableBody>
            </Table>
        )
      case 'BYDATE':
        return (
          <Table wrapperClassName="max-h-[calc(100vh-250px)] overflow-auto" className="min-w-[650px]">
              <TableHeader className="sticky top-0 z-[100]">
                <TableRow>
                  <TableHead className={stickyHead}>日期</TableHead>
                  <TableHead>設計師編號</TableHead>
                  <TableHead>設計師名稱</TableHead>
                  {serviceIds.map(id => {
                    const findData = date[0].summary.singleServices.find(item => item.serviceId === id)
                    return (
                      <TableHead key={`thead-${findData.serviceId}`}>
                        <div className="text-center">{findData.serviceNo + ' - ' + findData.serviceName}</div>
                        <div className={splitCell}>
                          <div>虛業績</div>
                          <div>客次</div>
                        </div>
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>

              <TableBody>
                {date.map(({ date, designerServices, summary }) => (
                  <Fragment key={date}>
                    {designerServices.map(item => (
                      <TableRow key={item.designerId}>
                        <TableCell className={stickyCell}>{date}</TableCell>
                        <TableCell>{item.designerNo}</TableCell>
                        <TableCell>{item.designerName}</TableCell>
                        {serviceIds.map((id, i) => {
                          const findData = item.singleServices.find(d => d.serviceId === id)
                          return (
                            <TableCell key={`singleServices-${date}=${i}`}>
                              <div className={splitCell}>
                                <div>{formatNumber(Math.round(findData.singleServiceItem[0].performance * 100) / 100)}</div>
                                <div>{findData.singleServiceItem[0].orderCount}</div>
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}

                    {designerServices.length !== 0 && (
                      <TableRow className="font-bold [&>td]:bg-surface-hover">
                        <TableCell className={stickyCell}>{date}</TableCell>
                        <TableCell></TableCell>
                        <TableCell>小計</TableCell>
                        {serviceIds.map((id, i) => {
                          const { singleServiceItem } = summary.singleServices.find(item => item.serviceId === id)
                          return (
                            <TableCell key={`summary-${date}=${i}`}>
                              <div className={splitCell}>
                                <div>{formatNumber(singleServiceItem[0] ? Math.round(singleServiceItem[0].performance * 100) / 100 : 0)}</div>
                                <div>{singleServiceItem[0] ? singleServiceItem[0].orderCount : 0}</div>
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )}
                  </Fragment>
                ))}
                <TableRow className="font-bold">
                  <TableCell className={stickyCell}>合計</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TotalRow />
                </TableRow>
              </TableBody>
            </Table>
        )

      case 'BYDESIGNER':
        return (
          <Table wrapperClassName="max-h-[calc(100vh-250px)] overflow-auto" className="min-w-[650px]">
              <TableHeader className="sticky top-0 z-[100]">
                <TableRow>
                  <TableHead className={stickyHead}>日期</TableHead>
                  <TableHead>設計師編號</TableHead>
                  <TableHead>設計師名稱</TableHead>
                  {serviceIds.map(id => {
                    const findData = date[0].summary.singleServices.find(item => item.serviceId === id)
                    return (
                      <TableHead key={`thead-${findData.serviceId}`}>
                        <div className="text-center">{findData.serviceNo + ' - ' + findData.serviceName}</div>
                        <div className={splitCell}>
                          <div>虛業績</div>
                          <div>客次</div>
                        </div>
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>

              <TableBody>
                {designer.map(({ designerId, designerName, designerNo, datePerformances, summary }) => (
                  <Fragment key={designerId}>
                    {datePerformances.map(({ date, singleServices }) => (
                      <TableRow key={`${date}-${designerId}`}>
                        <TableCell className={stickyCell}>{date}</TableCell>
                        <TableCell>{designerNo}</TableCell>
                        <TableCell>{designerName}</TableCell>
                        {serviceIds.map(id => {
                          const findData = singleServices.find(item => item.serviceId === id)
                          return (
                            <TableCell key={`${date}-${findData.serviceId}`}>
                              <div className={splitCell}>
                                <div>{formatNumber(Math.round(findData.summary.performance * 100) / 100)}</div>
                                <div>{findData.summary.orderCount}</div>
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>

                    ))}
                    {datePerformances.length !== 0 && (
                      <TableRow className="font-bold [&>td]:bg-surface-hover">
                        <TableCell className={stickyCell}></TableCell>
                        <TableCell></TableCell>
                        <TableCell>小計</TableCell>
                        {serviceIds.map((id, i) => {
                          const findData = summary.find(({ serviceId }) => serviceId === id)
                          return (
                            <TableCell key={`subTotal-${date}=${i}`}>
                              <div className={splitCell}>
                                <div>{formatNumber(findData.summary ? Math.round(findData.summary.performance * 100) / 100 : 0)}</div>
                                <div>{findData.summary ? findData.summary.orderCount : 0}</div>
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )}
                  </Fragment>
                ))}
                <TableRow className="font-bold">
                  <TableCell className={stickyCell}>合計</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TotalRow />
                </TableRow>
              </TableBody>
            </Table>
        )
      default:
        return sort
    }
  }

  return (
    <Fragment>
      {reportData?.serviceIds?.length ? renderTable() : (
        <Card className="mt-6">
          <EmptyState title="無資料" />
        </Card>
      )}
    </Fragment>
  )
}

Results.propTypes = {
  report: PropTypes.array,
}

Results.defaultProps = {
  report: [],
}

export default Results
