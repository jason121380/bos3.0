/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, CardHeader, Divider, Table, TableBody,
  TableCell, TableHead, TableRow, Typography, Button,
} from '@mui/material'
import { format } from 'date-fns'
import PropTypes from 'prop-types'
import { useEffect, useState, Fragment } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { CSVLink } from "react-csv";
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 900,
  }),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  }),
  actions: css({
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  }),
}

function Results({
  customers, results, summary, pointSummary, beenAssistedDesigner, ...rest
}) {
  const [excelData, setExcelData] = useState([])
  const [summary2, setSummary2] = useState(0)
  const [pointSummary2, setPointSummary2] = useState(0)

  useEffect(() => {
    if (beenAssistedDesigner !== undefined && results !== undefined) {
      const summary2 = results
        .filter(data => data.designer.id === beenAssistedDesigner)
        .map(order => order.helperFee)
        .reduce((accu, curVal) => (accu += curVal), 0)
      const pointSummary2 = results
        .filter(data => data.designer.id === beenAssistedDesigner)
        .map(order => order.helperPoint)
        .reduce((accu, curVal) => (accu += curVal), 0)
      setSummary2(summary2)
      setPointSummary2(pointSummary2)
    }
    if (results.length > 0) {
      const excelData = []
      if (beenAssistedDesigner === undefined) {
        results.forEach(order => {
          excelData.push({
            日期: format(new Date(order.date), 'yyyy/MM/dd'),
            帳單編號: `#${order.orderNo}`,
            ' 服務項目(互助項目)': `${order.service.name}(${order.helperType})`,
            設計師: order.designer.name,
            互助人: order.helper.name,
            '互助換算金額(方式)': `${order.helperFee}(${order.helperMoneyGivenWay})`,
            點數: order.helperPoint,
            互助扣項方式: order.helperDeductionType === 'onSales'
              ? '依業績'
              : order.helperDeductionType === 'onSalary'
                ? '依薪水'
                : '無扣項',
          })
        })
        excelData.push({
          日期: '合計',
          '互助換算金額(方式)': summary,
          點數: pointSummary,
        })
      } else if (beenAssistedDesigner != undefined) {
        results
          .filter(data => data.designer.id === beenAssistedDesigner)
          .map(order => {
            excelData.push({
              日期: format(new Date(order.date), 'yyyy/MM/dd'),
              帳單編號: `#${order.orderNo}`,
              ' 服務項目(互助項目)': `${order.service.name}(${order.helperType})`,
              設計師: order.designer.name,
              互助人: order.helper.name,
              '互助換算金額(方式)': `${order.helperFee}(${order.helperMoneyGivenWay})`,
              點數: order.helperPoint,
              互助扣項方式: order.helperDeductionType === 'onSales'
                ? '依業績'
                : order.helperDeductionType === 'onSalary'
                  ? '依薪水'
                  : '無扣項',
            })
          })
        excelData.push({
          日期: '合計',
          '互助換算金額(方式)': summary2,
          點數: pointSummary2,
        })
      }
      setExcelData(excelData)
    }
  }, [results, beenAssistedDesigner, summary2, pointSummary2])

  const pointFloatDisplay = point => {
    if (point.toString().length <= 3) {
      return point
    } else {
      return point.toString().substring(0, 4)
    }
  }

  return (
    <div {...rest} css={styles.root}>
      <Typography color="textSecondary" gutterBottom variant="body2">
        {results.length} 筆資料
      </Typography>
      <Card>
        <CardHeader
          action={
            <CSVLink data={excelData} filename="互助點數明細.csv" >
              <Button variant="contained" color="primary" size="small">
                報表匯出
              </Button>
            </CSVLink>
          }
          title="互助紀錄"
        />
        <Divider />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>日期</TableCell>
                    <TableCell>帳單編號</TableCell>
                    <TableCell>服務項目(互助項目)</TableCell>
                    <TableCell>設計師</TableCell>
                    <TableCell>互助人</TableCell>
                    <TableCell>互助換算金額(方式)</TableCell>
                    <TableCell>點數</TableCell>
                    <TableCell>互助扣項方式</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results !== undefined && beenAssistedDesigner === undefined
                    ? results.map((order, index) => (
                      <TableRow hover key={`decrease-result-${index}`}>
                        <TableCell>{format(new Date(order.date), 'yyyy/MM/dd')}</TableCell>
                        <TableCell>#{order.orderNo}</TableCell>
                        <TableCell>
                          {order.service.name}({order.helperType})
                        </TableCell>
                        <TableCell>{order.designer.name}</TableCell>
                        <TableCell>{order.helper.name}</TableCell>
                        <TableCell>
                          {order.helperFee}({order.helperMoneyGivenWay})
                        </TableCell>
                        <TableCell>{pointFloatDisplay(order.helperPoint)}</TableCell>
                        <TableCell>
                          {order.helperDeductionType === 'onSales'
                            ? '依業績'
                            : order.helperDeductionType === 'onSalary'
                              ? '依薪水'
                              : '無扣項'}
                        </TableCell>
                      </TableRow>
                    ))
                    : results
                      .filter(data => data.designer.id === beenAssistedDesigner)
                      .map((order, index) => (
                        <TableRow hover key={`decrease-result-${index}`}>
                          <TableCell>{format(new Date(order.date), 'yyyy/MM/dd')}</TableCell>
                          <TableCell>#{order.orderNo}</TableCell>
                          <TableCell>
                            {order.service.name}({order.helperType})
                          </TableCell>
                          <TableCell>{order.designer.name}</TableCell>
                          <TableCell>{order.helper.name}</TableCell>
                          <TableCell>
                            {order.helperFee}({order.helperMoneyGivenWay})
                          </TableCell>
                          <TableCell>{pointFloatDisplay(order.helperPoint)}</TableCell>
                          <TableCell>
                            {order.helperDeductionType === 'onSales'
                              ? '依業績'
                              : order.helperDeductionType === 'onSalary'
                                ? '依薪水'
                                : '無扣項'}
                          </TableCell>
                        </TableRow>
                      ))}
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    {beenAssistedDesigner !== undefined ? (
                      <Fragment>
                        <TableCell>{summary2}</TableCell>
                        <TableCell>{pointFloatDisplay(pointSummary2)}</TableCell>
                      </Fragment>
                    ) : (
                      <Fragment>
                        <TableCell>{summary}</TableCell>
                        <TableCell>{pointFloatDisplay(pointSummary)}</TableCell>
                      </Fragment>
                    )}
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
      </Card>
    </div>
  )
}

Results.propTypes = {
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
