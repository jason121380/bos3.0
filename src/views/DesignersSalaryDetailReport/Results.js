import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui/table'
import PropTypes from 'prop-types'
import { Fragment, useEffect, useState, useRef } from 'react'

function Results({
  salaryDetailReport,
  merchantSalaryIncreaseItems,
  merchantSalaryDecreaseItems,
  designersSalaryDetailReportDataLoading,
}) {
  const [increaseItemsSum, setIncreaseItemsSum] = useState([])
  const [decreaseItemsSum, setDecreaseItemsSum] = useState([])

  useEffect(() => {
    if (!designersSalaryDetailReportDataLoading && !merchantSalaryIncreaseItems.loading) {
      const increaseItemsSum = []

      merchantSalaryIncreaseItems.forEach(data => {
        increaseItemsSum.push(0)
      })

      merchantSalaryIncreaseItems.forEach((data, index) => {
        salaryDetailReport.userSalaryDetail.forEach(data2 => {
          if (data2.increase.length === 0) {
            increaseItemsSum[index] += 0
          } else {
            data2.increase.forEach(increaseItem => {
              if (increaseItem.itemName === data.name) {
                increaseItemsSum[index] += increaseItem.price
              }
            })
          }
        })
      })
      setIncreaseItemsSum(increaseItemsSum)
    }
  }, [merchantSalaryIncreaseItems, designersSalaryDetailReportDataLoading])

  useEffect(() => {
    if (!designersSalaryDetailReportDataLoading && merchantSalaryDecreaseItems.length > 0) {
      const decreaseItemsSum = []
      merchantSalaryDecreaseItems.forEach(data => { })
      merchantSalaryDecreaseItems.forEach((data, index) => {
        decreaseItemsSum.push(0)

        salaryDetailReport.userSalaryDetail.forEach(data2 => {
          if (data2.decrease.length === 0) {
            decreaseItemsSum[index] += 0
          } else {
            data2.decrease.forEach(decreaseItem => {
              if (decreaseItem.itemName === data.name) {
                decreaseItemsSum[index] += decreaseItem.price
              }
            })
          }
        })
      })
      setDecreaseItemsSum(decreaseItemsSum)
    }
  }, [merchantSalaryDecreaseItems, designersSalaryDetailReportDataLoading])

  return (
    <Fragment>
      <Table dense wrapperClassName="DesignersSalaryDetailReportTable mt-6 rounded-2xl bg-background">
          <TableHeader className="bg-background sticky top-0 z-10 [&_th]:bg-surface [&_th]:!text-text [&_th]:font-bold">
            <TableRow>
              <TableHead className="sticky z-20 !bg-background [border-right:1px_solid_rgb(var(--border))] left-0" style={{ wordBreak: 'break-all' }}>代號</TableHead>
              <TableHead className="sticky z-20 !bg-background [border-right:1px_solid_rgb(var(--border))] left-[80px]" style={{ wordBreak: 'break-all' }}>姓名</TableHead>
              <TableHead>身份</TableHead>
              {merchantSalaryIncreaseItems.map((data, index) => (
                <TableHead key={`${data.name}-${index}`}>{data.name}</TableHead>
              ))}
              <TableHead>加項合計</TableHead>
              <TableHead>指定業績</TableHead>
              <TableHead>不指定業績</TableHead>
              <TableHead>特殊抽業績</TableHead>
              <TableHead>點數</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salaryDetailReport.userSalaryDetail.map((data, index) => {
              return (
                <TableRow key={index}>
                  <TableCell className="sticky z-20 !bg-background [border-right:1px_solid_rgb(var(--border))] left-0" style={{ wordBreak: 'break-all' }}>{data.userNo}</TableCell>
                  <TableCell className="sticky z-20 !bg-background [border-right:1px_solid_rgb(var(--border))] left-[80px]" style={{ wordBreak: 'break-all' }}>{data.userName}</TableCell>
                  <TableCell>{data.userHelperIdentity}</TableCell>
                  {merchantSalaryIncreaseItems.map((merchantIncreaseItems, merchantIncreaseItemsIndex) => {
                    if (
                      data.increase.find(
                        increase => increase.itemName === merchantIncreaseItems.name
                      ) !== undefined
                    ) {
                      return (
                        <TableCell key={merchantIncreaseItemsIndex}>
                          {
                            data.increase.find(
                              increase => increase.itemName === merchantIncreaseItems.name
                            ).price
                          }
                        </TableCell>
                      )
                    } else {
                      return <TableCell key={merchantIncreaseItemsIndex}>0</TableCell>
                    }
                  })}
                  <TableCell>{Math.round(data.increaseSum)}</TableCell>
                  <TableCell>{Math.round(data.designatePerformance)}</TableCell>
                  <TableCell>{Math.round(data.nonDesignatePerformance)}</TableCell>
                  <TableCell>{Math.round(data.specialTruthPerformance)}</TableCell>
                  <TableCell>{Math.round(data.helperRetrievePoint)}</TableCell>
                </TableRow>
              )
            }
            )}
            <TableRow className="!bg-[rgba(26,115,232,0.05)] [&_td]:!font-bold [&_td]:!text-accent">
              <TableCell className="sticky z-20 !bg-background [border-right:1px_solid_rgb(var(--border))] left-0" style={{ fontWeight: 'bold', backgroundColor: 'rgba(26, 115, 232, 0.05) !important', color: 'rgb(var(--accent)) !important' }}>合計:</TableCell>
              <TableCell className="sticky z-20 !bg-background [border-right:1px_solid_rgb(var(--border))] left-[80px]" style={{ backgroundColor: 'rgba(26, 115, 232, 0.05) !important' }} />
              <TableCell />
              {increaseItemsSum.map((data, index) => (
                <TableCell key={index}>{Math.round(data)}</TableCell>
              ))}
              <TableCell>
                {Math.round(
                  salaryDetailReport.userSalaryDetail
                    .map(data => data.increaseSum)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                )}
              </TableCell>
              <TableCell>
                {Math.round(
                  salaryDetailReport.userSalaryDetail
                    .map(data => data.designatePerformance)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                )}
              </TableCell>
              <TableCell>
                {Math.round(
                  salaryDetailReport.userSalaryDetail
                    .map(data => data.nonDesignatePerformance)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                )}
              </TableCell>
              <TableCell>
                {Math.round(
                  salaryDetailReport.userSalaryDetail
                    .map(data => data.specialTruthPerformance)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                )}
              </TableCell>
              <TableCell>
                {Math.round(
                  salaryDetailReport.userSalaryDetail
                    .map(data => data.helperRetrievePoint)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                )}
              </TableCell>
            </TableRow>
          </TableBody>
      </Table>

      <Table dense wrapperClassName="DesignersSalaryDetailReportTable-2 mt-6 rounded-2xl bg-background">
          <TableHeader className="bg-background sticky top-0 z-10 [&_th]:bg-surface [&_th]:!text-text [&_th]:font-bold">
            <TableRow>
              <TableHead className="sticky z-20 !bg-background [border-right:1px_solid_rgb(var(--border))] left-0" style={{ wordBreak: 'break-all' }}>代號</TableHead>
              <TableHead className="sticky z-20 !bg-background [border-right:1px_solid_rgb(var(--border))] left-[80px]" style={{ wordBreak: 'break-all' }}>姓名</TableHead>
              <TableHead>實發金額</TableHead>
              {merchantSalaryDecreaseItems.map((data, index) => (
                <TableHead key={`${data.name}-${index}`}>{data.name}</TableHead>
              ))}
              <TableHead>扣項合計</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salaryDetailReport.userSalaryDetail.map((data, index) => {
              return (
                <TableRow key={index}>
                  <TableCell className="sticky z-20 !bg-background [border-right:1px_solid_rgb(var(--border))] left-0" style={{ wordBreak: 'break-all' }}>{data.userNo}</TableCell>
                  <TableCell className="sticky z-20 !bg-background [border-right:1px_solid_rgb(var(--border))] left-[80px]" style={{ wordBreak: 'break-all' }}>{data.userName}</TableCell>
                  <TableCell>{Math.round(data.actualPaidPrice)}</TableCell>
                  {merchantSalaryDecreaseItems.map((merchantDecreaseItems, merchantDecreaseItemsIndex) => {
                    if (data.decrease.length === 0) {
                      return <TableCell key={merchantDecreaseItemsIndex}>0</TableCell>
                    } else {
                      if (
                        data.decrease.find(
                          decrease => decrease.itemName === merchantDecreaseItems.name
                        ) !== undefined
                      ) {
                        return (
                          <TableCell key={merchantDecreaseItemsIndex}>
                            {
                              data.decrease.find(
                                decrease =>
                                  decrease.itemName === merchantDecreaseItems.name
                              ).price
                            }
                          </TableCell>
                        )
                      } else {
                        return <TableCell>0</TableCell>
                      }
                    }
                  })}
                  <TableCell>{Math.round(data.decreaseSum)}</TableCell>
                </TableRow>
              )
            }
            )}
            <TableRow className="!bg-[rgba(26,115,232,0.05)] [&_td]:!font-bold [&_td]:!text-accent">
              <TableCell className="sticky z-20 !bg-background [border-right:1px_solid_rgb(var(--border))] left-0" style={{ fontWeight: 'bold', backgroundColor: 'rgb(var(--surface)) !important' }}>合計:</TableCell>
              <TableCell className="sticky z-20 !bg-background [border-right:1px_solid_rgb(var(--border))] left-[80px]" style={{ backgroundColor: 'rgb(var(--surface)) !important' }} />
              <TableCell>
                {Math.round(
                  salaryDetailReport.userSalaryDetail
                    .map(data => data.actualPaidPrice)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                )}
              </TableCell>
              {decreaseItemsSum.map((data, index) => (
                <TableCell key={index}>{Math.round(data)}</TableCell>
              ))}
              <TableCell>
                {Math.round(
                  salaryDetailReport.userSalaryDetail
                    .map(data => data.decreaseSum)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                )}
              </TableCell>
            </TableRow>
          </TableBody>
      </Table>
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
