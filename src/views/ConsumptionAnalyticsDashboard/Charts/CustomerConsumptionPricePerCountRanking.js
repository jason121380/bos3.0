/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, Table, TableBody, TableCell, TableHead,
  TableRow, TableContainer, Grid,
} from '@mui/material'
import React from 'react'
import { css } from '@emotion/react'

const styles = {
  noDataDiv: css({
    width: '100%',
    height: '350px',
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center'
  }),
  noData: css({
    fontSize: '24px',
  }),
}

const CustomerConsumptionPricePerCountRanking = ({ data }) => {
  return (
    <Grid item md={6} sm={12} xs={12}>
      <Card>
        <CardContent>
          <div>
            <div className='cardTitle'>消費客單價排行</div>
            <div className='subTitle'>期間內來客(訂單)的消費總額</div>
          </div>
          {data.length > 0 ?
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: 25 }}></TableCell>
                    <TableCell>姓名</TableCell>
                    <TableCell>手機</TableCell>
                    <TableCell>總訂單數</TableCell>
                    <TableCell>總金額</TableCell>
                    <TableCell>客單價</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((d, index) => (
                    <TableRow key={`customerConsumptionPricePerCount-${index}`} hover>
                      <TableCell>{`${index + 1}.`}</TableCell>
                      <TableCell>{d.name}</TableCell>
                      <TableCell>{d.cellphone}</TableCell>
                      <TableCell>{d.orderCount}</TableCell>
                      <TableCell>{d.totalPrice}</TableCell>
                      <TableCell>{d.pricePerCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer> :
            <div css={styles.noDataDiv}><span css={styles.noData}>無資料</span></div>
          }
        </CardContent>
      </Card>
    </Grid>
  )
}

export default React.memo(CustomerConsumptionPricePerCountRanking)