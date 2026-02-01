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
import PropTypes from 'prop-types'
import { getMonth, getYear } from 'date-fns'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  actions: css({
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  }),
  total: css({
    fontWeight: 'bold',
  }),
  sticky: css({
    position: 'sticky',
    left: 0,
    background: 'white',
    zIndex: '99',
    outline: '1px solid #eeeeee',
  }),
  stickyRow: css({
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: '100',
    outline: '1px solid #eeeeee',
  }),
}

export default function Results({ reportData, className }) {
  return (
    <TableContainer style={{ maxHeight: 'calc(100vh - 260px)' }} css={className} className='BusinessItemsMonthlyAnalyzeReportTable' component={Paper}>
      <Table css={styles.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow css={styles.stickyRow}>
            <TableCell css={styles.sticky}>月份</TableCell>
            {reportData.businessItemsReportData[0].serviceCategoriesPerformance.map((data, index) => (
              <TableCell key={index}>{data.categoriesName}</TableCell>
            ))}
            <TableCell>客數</TableCell>
            <TableCell>店販收入</TableCell>
            <TableCell>總業績</TableCell>
            <TableCell>合計收入</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.businessItemsReportData.map((data, index) => (
            <TableRow key={`tableRow-${index}`} hover>
              <TableCell css={styles.sticky}>{`${getYear(data.date)}/${getMonth(data.date) + 1}`}</TableCell>
              {data.serviceCategoriesPerformance.map((service, index) => (
                <TableCell key={`service-${index}`}>{`${service.performance} / ${service.count}`}</TableCell>
              ))}
              <TableCell>{data.cutomerCount}</TableCell>
              <TableCell>{data.productPerformance}</TableCell>
              <TableCell>{data.totalPerformance}</TableCell>
              <TableCell>{data.totalIncome}</TableCell>
            </TableRow>
          ))}
          <TableRow hover>
            <TableCell css={css([styles.total, styles.sticky])}>合計</TableCell>
            {reportData.businessItemsReportDataTotal.serviceCategoriesPerformance.map((service, index) => (
              <TableCell key={`Total-${index}`}>{`${service.performance} / ${service.count}`}</TableCell>
            ))}
            <TableCell>{reportData.businessItemsReportDataTotal.cutomerCount}</TableCell>
            <TableCell>{reportData.businessItemsReportDataTotal.productPerformance}</TableCell>
            <TableCell>{reportData.businessItemsReportDataTotal.totalPerformance}</TableCell>
            <TableCell>{reportData.businessItemsReportDataTotal.totalIncome}</TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell css={css([styles.total, styles.sticky])}>指定</TableCell>
            {reportData.businessItemsReportDataDesignation.serviceCategoriesPerformance.map((service, index) => (
              <TableCell key={`designation-${index}`}>{`${service.performance} / ${service.count}`}</TableCell>
            ))}
            <TableCell>{reportData.businessItemsReportDataDesignation.cutomerCount}</TableCell>
            <TableCell>{reportData.businessItemsReportDataDesignation.productPerformance}</TableCell>
            <TableCell>{reportData.businessItemsReportDataDesignation.totalPerformance}</TableCell>
            <TableCell>{reportData.businessItemsReportDataDesignation.totalIncome}</TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell css={css([styles.total, styles.sticky])}>不指定</TableCell>
            {reportData.businessItemsReportDataNonDesignation.serviceCategoriesPerformance.map((service, index) => (
              <TableCell key={`nonDesignation-${index}`}>{`${service.performance} / ${service.count}`}</TableCell>
            ))}
            <TableCell>{reportData.businessItemsReportDataNonDesignation.cutomerCount}</TableCell>
            <TableCell>{reportData.businessItemsReportDataNonDesignation.productPerformance}</TableCell>
            <TableCell>{reportData.businessItemsReportDataNonDesignation.totalPerformance}</TableCell>
            <TableCell>{reportData.businessItemsReportDataNonDesignation.totalIncome}</TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell css={css([styles.total, styles.sticky])}>指定比</TableCell>
            {reportData.businessItemsReportDataDesignationProportion.serviceCategoriesPerformance.map((service, index) => (
              <TableCell key={`designationProportion-${index}`}>{`${service.performance}% / ${service.count}%`}</TableCell>
            ))}
            <TableCell>{reportData.businessItemsReportDataDesignationProportion.cutomerCount}%</TableCell>
            <TableCell>{reportData.businessItemsReportDataDesignationProportion.productPerformance}%</TableCell>
            <TableCell>{reportData.businessItemsReportDataDesignationProportion.totalPerformance}%</TableCell>
            <TableCell>{reportData.businessItemsReportDataDesignationProportion.totalIncome}%</TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell css={css([styles.total, styles.sticky])}>業績比</TableCell>
            {reportData.businessItemsReportDataPerformanceProportion.serviceCategoriesPerformance.map((service, index) => (
              <TableCell key={`performanceProportion-${index}`}>{service.performance}%</TableCell>
            ))}
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

Results.propTypes = {
  className: PropTypes.object,
}