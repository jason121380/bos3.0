/** @jsxImportSource @emotion/react */
// 本頁以 window.print() 列印整頁，initialize.scss 的 .InventoryWorkReview 列印樣式依賴 MUI Card / CardContent / Paper / Table 的 class，
// 因此列印內容（卡片與表格）原封保留，只替換不列印（noprint）的動作按鈕
import { Paper } from 'ui/display-compat'
import { TableContainer, Table, TableBody, TableRow, TableCell, TableHead } from 'ui/table-compat'
import { Card, CardContent, CardHeader } from 'ui/card-compat'
import { Download, Printer } from 'lucide-react'
import { Button } from 'ui/button'
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
                <Button asChild size="sm" variant="secondary" className="noprint">
                  <CSVLink
                    data={CSVData}
                    filename="盤點紀錄.csv"
                    className="no-underline"
                  >
                    <Download strokeWidth={1.75} />
                    報表匯出
                  </CSVLink>
                </Button>
                <Button
                  size="sm"
                  className="noprint"
                  variant="secondary"
                  onClick={() => window.print()}
                >
                  <Printer strokeWidth={1.75} />
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