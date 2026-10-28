import PropTypes from 'prop-types'
import { getMonth, getYear } from 'date-fns'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

// 固定首欄（原 styles.sticky 寫死白底，改用 tokens）；列印時表頭白底黑字
const STICKY_COL = 'sticky left-0 z-[99] bg-background outline outline-1 outline-border'
const printHeader = 'print:bg-transparent print:[&_th]:text-text'

export default function Results({ reportData, className }) {
  return (
    // BusinessItemsMonthlyAnalyzeReportTable：@media print 與螢幕樣式的掛鉤（以 table／th／td 標籤選取），保留在表格外框
    <Table
      dense
      dense
      wrapperClassName='BusinessItemsMonthlyAnalyzeReportTable max-h-[calc(100vh-260px)] overflow-auto'
      className={className}
      aria-label="a dense table"
    >
      <TableHeader className={`sticky top-0 z-[100] ${printHeader}`}>
        <TableRow className="hover:bg-transparent">
          <TableHead className={`${STICKY_COL} bg-surface`}>月份</TableHead>
          {reportData.businessItemsReportData[0].serviceCategoriesPerformance.map((data, index) => (
            <TableHead numeric key={index}>{data.categoriesName}</TableHead>
          ))}
          <TableHead numeric>客數</TableHead>
          <TableHead numeric>店販收入</TableHead>
          <TableHead numeric>總業績</TableHead>
          <TableHead numeric>合計收入</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reportData.businessItemsReportData.map((data, index) => (
          <TableRow key={`tableRow-${index}`}>
            <TableCell className={`${STICKY_COL} tabular-nums`}>{`${getYear(data.date)}/${getMonth(data.date) + 1}`}</TableCell>
            {data.serviceCategoriesPerformance.map((service, index) => (
              <TableCell numeric key={`service-${index}`}>{`${formatNumber(service.performance)} / ${formatNumber(service.count)}`}</TableCell>
            ))}
            <TableCell numeric>{formatNumber(data.cutomerCount)}</TableCell>
            <TableCell numeric>{formatNumber(data.productPerformance)}</TableCell>
            <TableCell numeric>{formatNumber(data.totalPerformance)}</TableCell>
            <TableCell numeric>{formatNumber(data.totalIncome)}</TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell className={`${STICKY_COL} font-bold`}>合計</TableCell>
          {reportData.businessItemsReportDataTotal.serviceCategoriesPerformance.map((service, index) => (
            <TableCell numeric key={`Total-${index}`}>{`${formatNumber(service.performance)} / ${formatNumber(service.count)}`}</TableCell>
          ))}
          <TableCell numeric>{formatNumber(reportData.businessItemsReportDataTotal.cutomerCount)}</TableCell>
          <TableCell numeric>{formatNumber(reportData.businessItemsReportDataTotal.productPerformance)}</TableCell>
          <TableCell numeric>{formatNumber(reportData.businessItemsReportDataTotal.totalPerformance)}</TableCell>
          <TableCell numeric>{formatNumber(reportData.businessItemsReportDataTotal.totalIncome)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={`${STICKY_COL} font-bold`}>指定</TableCell>
          {reportData.businessItemsReportDataDesignation.serviceCategoriesPerformance.map((service, index) => (
            <TableCell numeric key={`designation-${index}`}>{`${formatNumber(service.performance)} / ${formatNumber(service.count)}`}</TableCell>
          ))}
          <TableCell numeric>{formatNumber(reportData.businessItemsReportDataDesignation.cutomerCount)}</TableCell>
          <TableCell numeric>{formatNumber(reportData.businessItemsReportDataDesignation.productPerformance)}</TableCell>
          <TableCell numeric>{formatNumber(reportData.businessItemsReportDataDesignation.totalPerformance)}</TableCell>
          <TableCell numeric>{formatNumber(reportData.businessItemsReportDataDesignation.totalIncome)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={`${STICKY_COL} font-bold`}>不指定</TableCell>
          {reportData.businessItemsReportDataNonDesignation.serviceCategoriesPerformance.map((service, index) => (
            <TableCell numeric key={`nonDesignation-${index}`}>{`${formatNumber(service.performance)} / ${formatNumber(service.count)}`}</TableCell>
          ))}
          <TableCell numeric>{formatNumber(reportData.businessItemsReportDataNonDesignation.cutomerCount)}</TableCell>
          <TableCell numeric>{formatNumber(reportData.businessItemsReportDataNonDesignation.productPerformance)}</TableCell>
          <TableCell numeric>{formatNumber(reportData.businessItemsReportDataNonDesignation.totalPerformance)}</TableCell>
          <TableCell numeric>{formatNumber(reportData.businessItemsReportDataNonDesignation.totalIncome)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={`${STICKY_COL} font-bold`}>指定比</TableCell>
          {reportData.businessItemsReportDataDesignationProportion.serviceCategoriesPerformance.map((service, index) => (
            <TableCell numeric key={`designationProportion-${index}`}>{`${service.performance}% / ${service.count}%`}</TableCell>
          ))}
          <TableCell numeric>{reportData.businessItemsReportDataDesignationProportion.cutomerCount}%</TableCell>
          <TableCell numeric>{reportData.businessItemsReportDataDesignationProportion.productPerformance}%</TableCell>
          <TableCell numeric>{reportData.businessItemsReportDataDesignationProportion.totalPerformance}%</TableCell>
          <TableCell numeric>{reportData.businessItemsReportDataDesignationProportion.totalIncome}%</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={`${STICKY_COL} font-bold`}>業績比</TableCell>
          {reportData.businessItemsReportDataPerformanceProportion.serviceCategoriesPerformance.map((service, index) => (
            <TableCell numeric key={`performanceProportion-${index}`}>{service.performance}%</TableCell>
          ))}
          <TableCell numeric>-</TableCell>
          <TableCell numeric>-</TableCell>
          <TableCell numeric>-</TableCell>
          <TableCell numeric>-</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

Results.propTypes = {
  className: PropTypes.string,
}