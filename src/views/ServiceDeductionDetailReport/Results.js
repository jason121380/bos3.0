import PropTypes from 'prop-types'
import { Fragment, useEffect } from 'react'
import { format } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { formatNumber } from 'ui/format'

function Results({ userServiceDeductionDetial, setExcelData }) {
  const countTotal = key => {
    const total = userServiceDeductionDetial.reduce((accu, curVal) => accu + curVal[key], 0)
    return floatDisplay(total)
  }

  const floatDisplay = num => {
    if (String(num).length > 7) {
      num = Math.round(num)
      let display = Number(num).toFixed(2)
      if (Number(display) === 0) {
        display = 0
      }
      return display
    } else {
      return num
    }
  }

  useEffect(() => {
    if (userServiceDeductionDetial !== null) {
      const excelData = []
      userServiceDeductionDetial.forEach(data => {
        excelData.push({
          日期: format(new Date(data.date), 'yyyy/MM/dd'),
          帳單編號: `#${data.orderNo}`,
          類別: data.type,
          項目: data.item,
          設計師: data.designerName,
          金額: data.cash,
          '手續費(扣業績)': floatDisplay(data.handlingFeeOnSales),
          '扣項(扣業績)': floatDisplay(data.deductionOnSales),
          '互助(扣業績)': floatDisplay(data.helperPriceOnSales),
          實業績: floatDisplay(data.truthPerformance),
          '實業績(依特殊抽成)': floatDisplay(data.specialRake_truthPerformance),
          '特殊抽成(依特殊抽成)': floatDisplay(data.specialRake_specialRake),
          服務歸屬: data.category_categoryName,
          '不分實業績(依服務歸屬)': floatDisplay(data.category_normalTruthPerformance),
          '不分實業績 抽成(依服務歸屬)': floatDisplay(data.category_normalRake),
          '指定實業績(依服務歸屬)': floatDisplay(data.category_designateTruthPerformance),
          '指定實業績 抽成(依服務歸屬)': floatDisplay(data.category_designateRake),
          '不指定實業績(依服務歸屬)': floatDisplay(data.category_nonDesignateTruthPerformance),
          '不指定實業績 抽成(依服務歸屬)': floatDisplay(data.category_nonDesignateRake),
          '%': data.percentage,
          服務抽成: floatDisplay(data.serviceRake),
          '手續費(扣薪水)': floatDisplay(data.handlingFeeOnSalary),
          '扣項(扣薪水)': floatDisplay(data.deductionOnSalary),
          '互助(扣薪水)': floatDisplay(data.helperPriceOnSalary),
          小計: floatDisplay(data.summary),
        })
      })

      excelData.push({
        日期: '合計',
        帳單編號: '',
        類別: '',
        項目: '',
        設計師: '',
        金額: countTotal('cash'),
        '手續費(扣業績)': countTotal('handlingFeeOnSales'),
        '扣項(扣業績)': countTotal('deductionOnSales'),
        '互助(扣業績)': countTotal('helperPriceOnSales'),
        實業績: countTotal('truthPerformance'),
        '實業績(依特殊抽成)': countTotal('specialRake_truthPerformance'),
        '特殊抽成(依特殊抽成)': countTotal('specialRake_specialRake'),
        服務歸屬: '',
        '不分實業績(依服務歸屬)': countTotal('category_normalTruthPerformance'),
        '不分實業績 抽成(依服務歸屬)': countTotal('category_normalRake'),
        '指定實業績(依服務歸屬)': countTotal('category_designateTruthPerformance'),
        '指定實業績 抽成(依服務歸屬)': countTotal('category_designateRake'),
        '不指定實業績(依服務歸屬)': countTotal('category_nonDesignateTruthPerformance'),
        '不指定實業績 抽成(依服務歸屬)': countTotal('category_nonDesignateRake'),
        '%': '',
        服務抽成: countTotal('serviceRake'),
        '手續費(扣薪水)': countTotal('handlingFeeOnSalary'),
        '扣項(扣薪水)': countTotal('deductionOnSalary'),
        '互助(扣薪水)': countTotal('helperPriceOnSalary'),
        小計: countTotal('summary'),
      })
      setExcelData(excelData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（countTotal）；只在 [userServiceDeductionDetial, setExcelData] 變動時呼叫，補上會每次 render 重跑
  }, [userServiceDeductionDetial, setExcelData])

  return (
    <Fragment>
      <div className="mt-3">
        <Table dense className="min-w-[650px]" aria-label="a dense table">
          <TableHeader>
            <TableRow>
              <TableHead rowSpan={2}>日期</TableHead>
              <TableHead rowSpan={2}>帳單編號</TableHead>
              <TableHead rowSpan={2}>類別</TableHead>
              <TableHead rowSpan={2}>項目</TableHead>
              <TableHead rowSpan={2}>設計師</TableHead>
              <TableHead rowSpan={2} numeric>
                金額
              </TableHead>
              <TableHead colSpan={3} className="text-center">
                扣業績
              </TableHead>
              <TableHead rowSpan={2} numeric>
                實業績
              </TableHead>
              <TableHead colSpan={2} className="text-center">
                依特殊抽成
              </TableHead>
              <TableHead colSpan={7} className="text-center">
                依服務歸屬
              </TableHead>
              <TableHead rowSpan={2} numeric>
                %
              </TableHead>
              <TableHead rowSpan={2} numeric>
                服務抽成
              </TableHead>
              <TableHead colSpan={3} className="text-center">
                扣薪水
              </TableHead>
              <TableHead rowSpan={2} numeric>
                小計
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead numeric>手續費</TableHead>
              <TableHead numeric>扣項</TableHead>
              <TableHead numeric>互助</TableHead>
              <TableHead numeric>實業績</TableHead>
              <TableHead numeric>特殊抽成</TableHead>
              <TableHead>服務歸屬</TableHead>
              <TableHead numeric>不分實業績</TableHead>
              <TableHead numeric>不分實業績 抽成</TableHead>
              <TableHead numeric>指定實業績</TableHead>
              <TableHead numeric>指定實業績 抽成</TableHead>
              <TableHead numeric>不指定實業績</TableHead>
              <TableHead numeric>不指定實業績 抽成</TableHead>
              <TableHead numeric>手續費</TableHead>
              <TableHead numeric>扣項</TableHead>
              <TableHead numeric>互助</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody id="whiteSpace">
            {userServiceDeductionDetial.map((data, index) => (
              <TableRow key={index}>
                <TableCell> {format(new Date(data.date), 'yyyy/MM/dd')}</TableCell>
                <TableCell>#{data.orderNo}</TableCell>
                <TableCell>{data.type}</TableCell>
                <TableCell>{data.item}</TableCell>
                <TableCell>{data.designerName}</TableCell>
                <TableCell numeric>{formatNumber(floatDisplay(data.cash))}</TableCell>
                <TableCell numeric>{formatNumber(floatDisplay(data.handlingFeeOnSales))}</TableCell>
                <TableCell numeric>{formatNumber(floatDisplay(data.deductionOnSales))}</TableCell>
                <TableCell numeric>{formatNumber(floatDisplay(data.helperPriceOnSales))}</TableCell>
                <TableCell numeric>{formatNumber(floatDisplay(data.truthPerformance))}</TableCell>
                <TableCell numeric>{formatNumber(floatDisplay(data.specialRake_truthPerformance))}</TableCell>
                <TableCell numeric>{formatNumber(floatDisplay(data.specialRake_specialRake))}</TableCell>
                <TableCell>{data.category_categoryName !== '' ? data.category_categoryName : '預設'}</TableCell>
                <TableCell numeric>{formatNumber(floatDisplay(data.category_normalTruthPerformance))}</TableCell>
                <TableCell numeric>{formatNumber(floatDisplay(data.category_normalRake))}</TableCell>
                <TableCell numeric>{formatNumber(floatDisplay(data.category_designateTruthPerformance))}</TableCell>
                <TableCell numeric>{formatNumber(floatDisplay(data.category_designateRake))}</TableCell>
                <TableCell numeric>{formatNumber(floatDisplay(data.category_nonDesignateTruthPerformance))}</TableCell>
                <TableCell numeric>{formatNumber(floatDisplay(data.category_nonDesignateRake))}</TableCell>
                <TableCell numeric>{data.percentage}</TableCell>
                <TableCell numeric>{formatNumber(floatDisplay(data.serviceRake))}</TableCell>
                <TableCell numeric>{formatNumber(floatDisplay(data.handlingFeeOnSalary))}</TableCell>
                <TableCell numeric>{formatNumber(floatDisplay(data.deductionOnSalary))}</TableCell>
                <TableCell numeric>{formatNumber(floatDisplay(data.helperPriceOnSalary))}</TableCell>
                <TableCell numeric>{formatNumber(floatDisplay(data.summary))}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="font-bold">合計</TableCell>
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell numeric>{formatNumber(countTotal('cash'))}</TableCell>
              <TableCell numeric>{formatNumber(countTotal('handlingFeeOnSales'))}</TableCell>
              <TableCell numeric>{formatNumber(countTotal('deductionOnSales'))}</TableCell>
              <TableCell numeric>{formatNumber(countTotal('helperPriceOnSales'))}</TableCell>
              <TableCell numeric>{formatNumber(countTotal('truthPerformance'))}</TableCell>
              <TableCell numeric>{formatNumber(countTotal('specialRake_truthPerformance'))}</TableCell>
              <TableCell numeric>{formatNumber(countTotal('specialRake_specialRake'))}</TableCell>
              <TableCell />
              <TableCell numeric>{formatNumber(countTotal('category_normalTruthPerformance'))}</TableCell>
              <TableCell numeric>{formatNumber(countTotal('category_normalRake'))}</TableCell>
              <TableCell numeric>{formatNumber(countTotal('category_designateTruthPerformance'))}</TableCell>
              <TableCell numeric>{formatNumber(countTotal('category_designateRake'))}</TableCell>
              <TableCell numeric>{formatNumber(countTotal('category_nonDesignateTruthPerformance'))}</TableCell>
              <TableCell numeric>{formatNumber(countTotal('category_nonDesignateRake'))}</TableCell>
              <TableCell numeric />
              <TableCell numeric>{formatNumber(countTotal('serviceRake'))}</TableCell>
              <TableCell numeric>{formatNumber(countTotal('handlingFeeOnSalary'))}</TableCell>
              <TableCell numeric>{formatNumber(countTotal('deductionOnSalary'))}</TableCell>
              <TableCell numeric>{formatNumber(countTotal('helperPriceOnSalary'))}</TableCell>
              <TableCell numeric>{formatNumber(countTotal('summary'))}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Fragment>
  )
}

Results.propTypes = {
  report: PropTypes.object,
}

Results.defaultProps = {
  report: {},
}

export default Results
