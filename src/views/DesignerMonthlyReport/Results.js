import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import cloneDeep from 'lodash/cloneDeep';

export default function Results({ designerMontlyListData, performReference, sort, isMemberShipCardActive, setExcelData }) {
  const [membershipDisplay, setMembershipDisplay] = useState(false)
  const [reportData, setReportData] = useState([])

  useEffect(() => {
    const performanceSort = []
    const designerSort = []
    const filterRawData = []
    const perforBool = performReference === 'TRUTH'
    const sortBool = sort === 'performance'
    designerMontlyListData.forEach(data => {
      if (
        data.truthPerformance > 0 ||
        data.fakePerformance > 0 ||
        data.orderAverageTruthPerformance > 0 ||
        data.orderAverageFakePerformance > 0 ||
        data.orderTotalCount > 0 ||
        data.orderDesignateCount > 0 ||
        data.orderNonDesignateCount > 0 ||
        data.productFakePerformance > 0 ||
        data.membershipFakePerformance > 0
      ) {
        filterRawData.push({
          date: data.date,
          designerName: data.designerName,
          performance: perforBool ? data.truthPerformance : data.fakePerformance,
          orderTotalCount: data.orderTotalCount,
          orderDesignateCount: data.orderDesignateCount,
          orderNonDesignateCount: data.orderNonDesignateCount,
          orderAveragePerformance: perforBool ? data.orderAverageTruthPerformance : data.orderAverageFakePerformance,
          membershipFakePerformance: data.membershipFakePerformance,
          productFakePerformance: data.productFakePerformance,
          monthIndex: data.monthIndex
        })
      }
    })
    filterRawData.sort((a, b) => b.performance - a.performance)
    const membershipTotal = performanceSort.reduce((accu, curVal) => (accu += curVal.membershipFakePerformance), 0) > 0
    const memberDisplay = (membershipTotal || isMemberShipCardActive)
    setMembershipDisplay(memberDisplay)
    const totalPerformance = (data, key) => {
      return Math.round(data.map(d => d[key])
        .reduce((accu, curVal) => (accu += curVal), 0)
      )
    }
    if (sortBool) {
      const month = []
      filterRawData.forEach(d => {
        if (!month.includes(d.monthIndex)) month.push(d.monthIndex)
      })
      month.sort((a, b) => a - b)
      month.forEach(index => {
        const filterData = filterRawData.filter(d => d.monthIndex === index)
        const totalObj = {
          date: '',
          designerName: '小計',
          performance: totalPerformance(filterData, 'performance'),
          orderTotalCount: totalPerformance(filterData, 'orderTotalCount'),
          orderDesignateCount: totalPerformance(filterData, 'orderDesignateCount'),
          orderNonDesignateCount: totalPerformance(filterData, 'orderNonDesignateCount'),
          orderAveragePerformance: totalPerformance(filterData, 'orderAveragePerformance'),
          membershipFakePerformance: totalPerformance(filterData, 'membershipFakePerformance'),
          productFakePerformance: totalPerformance(filterData, 'productFakePerformance'),
          monthIndex: ''
        }
        if (filterData.length > 0) {
          month.length > 1 && filterData.push(totalObj)
          performanceSort.push(...filterData)
        }
      })

      setReportData(performanceSort)
    } else {
      const nameArr = []
      filterRawData.forEach(d => {
        if (!nameArr.includes(d.designerName)) nameArr.push(d.designerName)
      })
      nameArr.sort((x, y) => {
        const reg = /[a-zA-Z0-9]/
        if (reg.test(x) || reg.test(y)) {
          if (x > y) {
            return 1
          } else if (x < y) {
            return -1
          } else {
            return 0
          }
        } else {
          return x.localeCompare(y)
        }
      })
      nameArr.forEach(d => {
        const filterData = filterRawData.filter(data => data.designerName === d).sort((a, b) => a.monthIndex - b.monthIndex)
        const totalObj = {
          date: '',
          designerName: '小計',
          performance: totalPerformance(filterData, 'performance'),
          orderTotalCount: totalPerformance(filterData, 'orderTotalCount'),
          orderDesignateCount: totalPerformance(filterData, 'orderDesignateCount'),
          orderNonDesignateCount: totalPerformance(filterData, 'orderNonDesignateCount'),
          orderAveragePerformance: totalPerformance(filterData, 'orderAveragePerformance'),
          membershipFakePerformance: totalPerformance(filterData, 'membershipFakePerformance'),
          productFakePerformance: totalPerformance(filterData, 'productFakePerformance'),
          monthIndex: ''
        }
        if (filterData.length > 0) {
          (nameArr.length > 1 && !filterRawData.every(d => d.monthIndex === 0)) && filterData.push(totalObj)
          designerSort.push(...filterData)
        }
      })
      setReportData(designerSort)
    }
    const renderExcelData = cloneDeep(sortBool ? performanceSort : designerSort)
    const excelData = []
    const performanceKey = perforBool ? '服務卡券業績(實)' : '服務卡券業績(虛)'
    renderExcelData.forEach(d => {
      const mamberShipObj = memberDisplay ? {會員卡業績: Math.round(d.membershipFakePerformance)} : {}
      excelData.push({...{
        月份: d.date ? format(d.date, 'yyyy/MM') : '',
        設計師: d.designerName,
        總業績: Math.round(d.performance) + Math.round(d.productFakePerformance) + (memberDisplay ? Math.round(d.membershipFakePerformance) : 0),
        [performanceKey]: Math.round(d.performance),
        總客數: d.orderTotalCount,
        客單價: Math.round(d.orderAveragePerformance),
        指定: d.orderDesignateCount,
        不指定: d.orderNonDesignateCount,
        店販金額: Math.round(d.productFakePerformance),
      },...mamberShipObj})
    })

    const mamberShipSum = memberDisplay ? {會員卡業績: Math.round(
      renderExcelData.reduce((a, b) => a + (b.designerName === '小計' ? 0 : b.membershipFakePerformance), 0)
    )} : {}

    excelData.push({...{
      月份: '合計',
      設計師: '',
      總業績: Math.round(renderExcelData.reduce( (a, b) =>  a + (b.designerName === '小計'? 0 : b.performance) ,0))
      + Math.round(renderExcelData.reduce((a, b) =>  a + (b.designerName === '小計'? 0 : b.productFakePerformance) ,0))
      + (memberDisplay ? Math.round(renderExcelData.reduce((a, b) =>  a + (b.designerName === '小計'? 0 : b.membershipFakePerformance) ,0)) : 0),
      [performanceKey]: Math.round(renderExcelData.reduce((a, b) =>  a + (b.designerName === '小計'? 0 : b.performance) ,0)),
      總客數: renderExcelData.reduce((a, b) =>  a + (b.designerName === '小計'? 0 : b.orderTotalCount) ,0),
      客單價: Math.round(renderExcelData.reduce((a, b) =>  a + (b.designerName === '小計'? 0 : b.orderAveragePerformance) ,0)),
      指定: renderExcelData.reduce((a, b) =>  a + (b.designerName === '小計'? 0 : b.orderDesignateCount) ,0),
      不指定: renderExcelData.reduce((a, b) =>  a + (b.designerName === '小計'? 0 : b.orderNonDesignateCount) ,0),
      店販金額: Math.round(renderExcelData.reduce((a, b) =>  a + (b.designerName === '小計'? 0 : b.productFakePerformance) ,0)),
    },...mamberShipSum})

    setExcelData(excelData)
  }, [designerMontlyListData, performReference, sort, isMemberShipCardActive, setExcelData])
  return (
      <Table dense wrapperClassName='DesignerMonthlyReportTableContainer mt-[10px]' className='DesignerMonthlyReportTable' aria-label="a dense table">
        <TableHeader>
          <TableRow>
            <TableHead>月份</TableHead>
            <TableHead>設計師</TableHead>
            <TableHead>總業績</TableHead>
            <TableHead>{performReference === 'FAKE' ? '服務卡券業績(虛)' : '服務卡券業績(實)'}</TableHead>
            <TableHead>總客數</TableHead>
            <TableHead>客單價</TableHead>
            <TableHead>指定</TableHead>
            <TableHead>不指定</TableHead>
            <TableHead>店販金額</TableHead>
            {membershipDisplay && <TableHead>會員卡業績</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportData.map((d, index) => {
            if (d.designerName === '小計') {
              return (
                <TableRow className='subtotal' key={index}>
                  <TableCell />
                  <TableCell>小計</TableCell>
                  <TableCell>{Math.round(d.performance) + Math.round(d.productFakePerformance) + (membershipDisplay ? Math.round(d.membershipFakePerformance) : 0)}</TableCell>
                  <TableCell>{Math.round(d.performance)}</TableCell>
                  <TableCell>{d.orderTotalCount}</TableCell>
                  <TableCell>{Math.round(d.orderAveragePerformance)}</TableCell>
                  <TableCell>{d.orderDesignateCount}</TableCell>
                  <TableCell>{d.orderNonDesignateCount}</TableCell>
                  <TableCell>{Math.round(d.productFakePerformance)}</TableCell>
                  {membershipDisplay && <TableCell>{Math.round(d.membershipFakePerformance)}</TableCell>}
                </TableRow>
              )
            } else {
              return (
                <TableRow key={`${d.date}-${d.designerName}`}>
                  <TableCell>{format(d.date, 'yyyy/MM')}</TableCell>
                  <TableCell>{d.designerName}</TableCell>
                  <TableCell>{Math.round(d.performance) + Math.round(d.productFakePerformance) + (membershipDisplay ? Math.round(d.membershipFakePerformance) : 0)}</TableCell>
                  <TableCell>{Math.round(d.performance)}</TableCell>
                  <TableCell>{d.orderTotalCount}</TableCell>
                  <TableCell>{Math.round(d.orderAveragePerformance)}</TableCell>
                  <TableCell>{d.orderDesignateCount}</TableCell>
                  <TableCell>{d.orderNonDesignateCount}</TableCell>
                  <TableCell>{Math.round(d.productFakePerformance)}</TableCell>
                  {membershipDisplay && <TableCell>{Math.round(d.membershipFakePerformance)}</TableCell>}
                </TableRow>
              )
            }
          })}
          <TableRow>
            <TableCell>合計</TableCell>
            <TableCell />
            <TableCell>
            {
              Math.round(reportData.reduce( (a, b) =>  a + (b.designerName === '小計'? 0 : b.performance) ,0))
              + Math.round(reportData.reduce((a, b) =>  a + (b.designerName === '小計'? 0 : b.productFakePerformance) ,0))
              + (membershipDisplay ? Math.round(reportData.reduce((a, b) =>  a + (b.designerName === '小計'? 0 : b.membershipFakePerformance) ,0)) : 0)
            }</TableCell>
            <TableCell>
              {Math.round(reportData.reduce(
                (a, b) => a + (b.designerName === '小計' ? 0 : b.performance), 0)
              )}
            </TableCell>
            <TableCell>
              {reportData.reduce((a, b) => a + (b.designerName === '小計' ? 0 : b.orderTotalCount), 0)}
            </TableCell>
            <TableCell>
              {Math.round(
                reportData.reduce((a, b) => a + (b.designerName === '小計' ? 0 : b.orderAveragePerformance), 0)
              )}
            </TableCell>
            <TableCell>
              {reportData.reduce((a, b) => a + (b.designerName === '小計' ? 0 : b.orderDesignateCount), 0)}
            </TableCell>
            <TableCell>
              {reportData.reduce((a, b) => a + (b.designerName === '小計' ? 0 : b.orderNonDesignateCount), 0)}
            </TableCell>
            <TableCell>
              {Math.round(
                reportData.reduce((a, b) => a + (b.designerName === '小計' ? 0 : b.productFakePerformance), 0)
              )}
            </TableCell>
            {membershipDisplay && (
              <TableCell>
                {Math.round(
                  reportData.reduce((a, b) => a + (b.designerName === '小計' ? 0 : b.membershipFakePerformance), 0)
                )}
              </TableCell>
            )}
          </TableRow>
        </TableBody>
      </Table>
  )
}

Results.propTypes = {
  className: PropTypes.object,
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}
