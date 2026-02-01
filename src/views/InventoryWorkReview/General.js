/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, CardHeader, Button, TableContainer,
  Table, TableBody, TableRow, TableCell, TableHead, Paper
} from '@mui/material'
import { Fragment } from 'react'
import format from 'date-fns/format'
import { CSVLink } from 'react-csv'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    marginTop: theme.spacing(3),
    whiteSpace: 'nowrap',
    '& .MuiCardHeader-content > span': {
      display: 'flex',
      width: '100%'
    }
  }),
  buttonGroup: css({
    gap: 10,
    display: 'flex',
    flexWrap: 'wrap',
  }),
  hearderWrap: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    flexWrap: 'wrap',
    gap: 10
  }),
  actions: css({
    marginTop: theme.spacing(3),
    gap: 10,
    display: 'flex',
    flexWrap: 'wrap'
  }),
  category: css({
    display: 'flex',
    justifyContent: 'space-between',
    gap: 20
  }),
  categoryBtnWrap: css({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px 10px'
  }),
  categoryBtn: css({
    whiteSpace: 'nowrap',
    flexWrap: 1
  }),
  divider1: css({
    margin: '12px 0 -12px 0'
  }),
  divider2: css({
    margin: '8px 0px'
  }),
  plus: css({
    fontWeight: 'bold',
    color: '#3b3bff'
  }),
  minus: css({
    fontWeight: 'bold',
    color: 'red'
  }),
  info: css({
    fontSize: 12,
    fontWeight: 'normal',
    whiteSpace: 'break-spaces'
  }),
  infoWrap: css({
    display: 'flex',
    alignItems: 'center',
    gap: '10px 10px',
    flexWrap: 'wrap',
  }),
  btnWrap: css({
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap'
  })
}


function General({ info, inventoryData, CSVData }) {
  const handleCheckCount = count => {
    if (count === 0) {
      return 0
    } else if (count > 0) {
      return <span css={styles.plus}>{`+${count}`}</span>
    } else {
      return <span css={styles.minus}>{count}</span>
    }
  }
  return (
    <Fragment>
      <Card css={styles.root}>
        <CardHeader
          title={
            <div css={styles.hearderWrap}>
              {info !== null && (
                <div css={styles.infoWrap}>
                  <span>{`建立時間:${format(info.date, 'yyyy/M/d HH:mm')}`}</span>
                  <span>{`建立者:${info.creatorName}`}</span>
                </div>
              )}
              <div css={styles.btnWrap}>
                <CSVLink
                  data={CSVData}
                  filename="盤點紀錄.csv"
                  style={{ display: 'inline' }}
                >
                  <Button
                    className="noprint"
                    variant="contained"
                    color="primary"
                  >
                    報表匯出
                  </Button>
                </CSVLink>
                <Button
                  className="noprint"
                  variant="contained"
                  color="primary"
                  onClick={() => window.print()}
                >
                  列印
                </Button>
              </div>
            </div>
          }
          className='noprint'
          style={{ paddingBottom: '0' }}
        />
        <CardContent>
          <TableContainer className='InventoryWorkReviewTable' component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>商品名稱</TableCell>
                  <TableCell>代號</TableCell>
                  <TableCell>當前庫存</TableCell>
                  <TableCell>盤點數量</TableCell>
                  <TableCell>差異</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryData.map(({ productId, productName, productNo, currentCount, inventoryCount }) => (
                  <TableRow key={productId} hover>
                    <TableCell>{productName}</TableCell>
                    <TableCell>{productNo}</TableCell>
                    <TableCell>{currentCount}</TableCell>
                    <TableCell>
                      {inventoryCount === null ? '' : inventoryCount}
                    </TableCell>
                    <TableCell>{inventoryCount === null ? '' : handleCheckCount(inventoryCount - currentCount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Fragment>
  )
}
export default General