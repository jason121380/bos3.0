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

const ProductSalesPriceRanking = ({ data }) => {
  return (
    <Grid item md={6} sm={12} xs={12}>
      <Card>
        <CardContent>
          <div>
            <div className='cardTitle'>商品銷售金額排行</div>
            <div className='subTitle'>期間內商品銷售金額排行</div>
          </div>
          {data.length > 0 ?
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: 25 }}></TableCell>
                    <TableCell>商品</TableCell>
                    <TableCell>類別</TableCell>
                    <TableCell>數量</TableCell>
                    <TableCell>總金額</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((d, index) => (
                    <TableRow key={`productSalesPrice-${index}`} hover>
                      <TableCell>{`${index + 1}.`}</TableCell>
                      <TableCell>{d.name}</TableCell>
                      <TableCell>{d.categoryName}</TableCell>
                      <TableCell>{d.count}</TableCell>
                      <TableCell>{d.price}</TableCell>
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

export default React.memo(ProductSalesPriceRanking)