// 本頁以 window.print() 列印整頁。initialize.scss 的 .InventoryWorkReview 列印規則原以 .MuiPaper-root／.MuiCardContent-root 去掉卡片外距、內距、圓角，
// 改用 ui/card 後以 print: 變體重現同樣的列印重置；表格外框（.InventoryWorkReviewTable）以 ui/table 的 wrapperClassName 保留，列印規則照常命中
import { Card, CardContent } from 'ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { Download, Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { Fragment } from 'react'
import format from 'date-fns/format'
import { CSVLink } from 'react-csv'
import { formatNumber } from 'ui/format'

// 原 emotion styles 逐值轉 Tailwind；root 的 '& .MuiCardHeader-content > span' 在 ui/card（不輸出 Mui class）內不命中，死碼不轉
const styles = {
  hearderWrap: 'flex justify-between items-center w-full flex-wrap gap-[10px]',
  plus: 'font-bold text-[#3b3bff]',
  minus: 'font-bold text-[red]',
  infoWrap: 'flex items-center gap-[10px_10px] flex-wrap',
  btnWrap: 'flex gap-[10px] flex-wrap',
}

function General({ info, inventoryData, CSVData }) {
  const handleCheckCount = count => {
    if (count === 0) {
      return 0
    } else if (count > 0) {
      return <span className={styles.plus}>{`+${formatNumber(count)}`}</span>
    } else {
      return <span className={styles.minus}>{formatNumber(count)}</span>
    }
  }
  return (
    <Fragment>
      <Card className="mt-[24px] whitespace-nowrap print:!m-0 print:overflow-visible print:rounded-none print:p-0">
        {/* 標題列（noprint）：className 原樣保留，版面以 inline style 重現原卡片標題的內距（上、左右 16px，下 0） */}
        <div className="noprint" style={{ padding: '16px 16px 0' }}>
          <div className={`${styles.hearderWrap} text-heading text-text`}>
            {info !== null && (
              <div className={styles.infoWrap}>
                <span>{`建立時間:${format(info.date, 'yyyy/MM/dd HH:mm')}`}</span>
                <span>{`建立者:${info.creatorName}`}</span>
              </div>
            )}
            <div className={styles.btnWrap}>
              <Button asChild size="sm" variant="secondary" className="noprint">
                <CSVLink data={CSVData} filename="盤點紀錄.csv" className="no-underline">
                  <Download strokeWidth={1.75} />
                  報表匯出
                </CSVLink>
              </Button>
              <Button size="sm" className="noprint" variant="secondary" onClick={() => window.print()}>
                <Printer strokeWidth={1.75} />
                列印
              </Button>
            </div>
          </div>
        </div>
        <CardContent className="print:p-0">
          {/* 列印：儲存格不套螢幕的固定列高（h-10），避免長清單列印頁數變多 */}
          <Table wrapperClassName="InventoryWorkReviewTable" className="print:[&_td]:h-auto print:[&_th]:h-auto">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>商品名稱</TableHead>
                <TableHead>代號</TableHead>
                <TableHead numeric>當前庫存</TableHead>
                <TableHead numeric>盤點數量</TableHead>
                <TableHead numeric>差異</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryData.map(({ productId, productName, productNo, currentCount, inventoryCount }) => (
                <TableRow key={productId}>
                  <TableCell>{productName}</TableCell>
                  <TableCell>{productNo}</TableCell>
                  <TableCell numeric>{formatNumber(currentCount)}</TableCell>
                  <TableCell numeric>{inventoryCount === null ? '' : formatNumber(inventoryCount)}</TableCell>
                  <TableCell numeric>{inventoryCount === null ? '' : handleCheckCount(inventoryCount - currentCount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Fragment>
  )
}
export default General
