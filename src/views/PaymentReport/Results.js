/** @jsxImportSource @emotion/react */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  CardHeader,
  Card,
  Button,
} from '@mui/material'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { CSVLink } from "react-csv";
import { css } from '@emotion/react'

const styles = {
  table: css({
    minWidth: 650,
  }),
  designerName: css({
    fontWeight: 'bold',
  }),
  medals: css({
    fontSize: '19px',
  }),
}

function Results({ report, paymentsName }) {
  const [totalArr, setTotalArr] = useState([])
  const [excelData, setExcelData] = useState([])

  useEffect(() => {
    const init = []
    const excelData = []
    if (report !== undefined) {
      for (let i = 0; i < paymentsName.length; i++) {
        init.push(0)
      }
      report.forEach(data => {
        const obj = {}
        obj['日期'] = format(data.date, 'yyyy/MM/dd')
        if (data.payTypeDetail.length !== 0) {
          paymentsName.forEach((payment, index) => {
            if (data.payTypeDetail.find(d => d.name === payment)) {
              init[index] += data.payTypeDetail.find(d => d.name === payment).price
              obj[payment] = data.payTypeDetail.find(d => d.name === payment).price
            }
          })
          excelData.push(obj)
        }
      })
      setTotalArr(init)
      const obj2 = {}
      obj2['日期'] = '合計'
      paymentsName.forEach((payment, index) => {
        obj2[payment] = init[index]
      })
      excelData.push(obj2)
      setExcelData(excelData)
    }
  }, [report])
  return (
    <Card>
      <CardHeader
        action={
          <CSVLink
            data={excelData}
            filename="每日非現金明細.csv"
            style={{ display: 'inline' }}
          >
            <Button variant="contained" color="primary">
              報表匯出
            </Button>
          </CSVLink>
        }
        title="每日非現金明細"
      />
      <TableContainer component={Paper}>
        <Table css={styles.table} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>日期</TableCell>
              {paymentsName.map(payment => (
                <TableCell key={payment}>{payment}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {report.map((data, index) => {
              if (data.payTypeDetail.length === 0) {
                return (
                  <TableRow key={index}>
                    <TableCell>{format(data.date, 'yyyy/MM/dd')}</TableCell>
                    {paymentsName.map(payment => (
                      <TableCell key={payment}/>
                    ))}
                  </TableRow>
                )
              } else {
                return (
                  <TableRow key={index}>
                    <TableCell>{format(data.date, 'yyyy/MM/dd')}</TableCell>
                    {paymentsName.map(payment => {
                      if (data.payTypeDetail.find(d => d.name === payment) !== undefined) {
                        return (
                          <TableCell key={payment}>
                            {data.payTypeDetail.find(d => d.name === payment).price}
                          </TableCell>
                        )
                      } else {
                        return <TableCell key={payment} />
                      }
                    })}
                  </TableRow>
                )
              }
            })}
            <TableRow>
              <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
              {totalArr.map((sum, index) => (
                <TableCell key={`${index}`}>{sum}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

Results.propTypes = {
  report: PropTypes.array,
}

Results.defaultProps = {
  report: [],
}

export default Results
