import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { Button } from 'ui/button'
import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from 'ui/icons'
import { useState, Fragment } from 'react'
import roundDecimal from './../../helper/roundDecimal.js'
import { formatNumber } from 'ui/format'

// 表頭 sticky：捲動容器是 ui/table 外框 div（wrapperClassName 給 max-h＋overflow-y），故 sticky 掛在 th；列印改回 static
const STICKY_TH = 'sticky top-0 z-10 bg-surface print:static'

export default function Results({ reportData }) {
  const [open, setOpen] = useState([])
  return (
    <Table
      dense
      wrapperClassName='multiMerchantsLeaderBoardTable max-h-[calc(100vh-260px)] overflow-y-auto print:max-h-none'
      className="min-w-[650px]"
      aria-label="a dense table"
    >
      <TableHeader>
        <TableRow>
          <TableHead className={`noprint ${STICKY_TH}`}>展開</TableHead>
          <TableHead className={STICKY_TH}>排名</TableHead>
          <TableHead className={STICKY_TH}>店家名稱</TableHead>
          <TableHead className={STICKY_TH}>販售人名稱</TableHead>
          <TableHead className={STICKY_TH}>販售人代號</TableHead>
          <TableHead numeric className={STICKY_TH}>總業績</TableHead>
          <TableHead numeric className={STICKY_TH}>總數量</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reportData.map((d, index) => (
          <Fragment key={index}>
            <TableRow className="cursor-pointer" onClick={() => {
              const idx = open.indexOf(index)
              if (idx > -1) {
                const arr = open
                arr.splice(idx, 1)
                setOpen([...arr])
              } else {
                setOpen([...open, index])
              }
            }}>
              <TableCell className='noprint'>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={open.indexOf(index) > -1 ? '收合明細' : '展開明細'}
                >
                  {open.indexOf(index) > -1 ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                </Button>
              </TableCell>
              <TableCell>{d.sorting}</TableCell>
              <TableCell>{d.merchantName}</TableCell>
              <TableCell>{d.sellerName}</TableCell>
              <TableCell>{d.sellerNo ? d.sellerNo : ''}</TableCell>
              <TableCell numeric>{formatNumber(roundDecimal(d.totalPerformance))}</TableCell>
              <TableCell numeric>{formatNumber(d.totalCount)}</TableCell>
            </TableRow>
            <TableRow className={open.indexOf(index) > -1 ? 'noprint' : 'noprint border-b-0'}>
              <TableCell className="!p-0" colSpan={7}>
                {open.indexOf(index) > -1 && (
                  <div className="m-4">
                    <Table dense className='multiMerchantsLeaderBoardCollapse'>
                      <TableHeader>
                        <TableRow>
                          <TableHead>商品名稱</TableHead>
                          <TableHead>商品編號</TableHead>
                          <TableHead numeric>業績</TableHead>
                          <TableHead numeric>數量</TableHead>
                          <TableHead>單位</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {d.productDetail.map((detail, index) => (
                          <TableRow key={`${detail.productName}-${d.sellerName}-${index}`}>
                            <TableCell>{detail.productName}</TableCell>
                            <TableCell>{detail.productNo}</TableCell>
                            <TableCell numeric>{formatNumber(detail.performance)}</TableCell>
                            <TableCell numeric>{formatNumber(detail.count)}</TableCell>
                            <TableCell>{detail.unit}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TableCell>
            </TableRow>
          </Fragment>
        ))}
        <TableRow>
          <TableCell colSpan={4} />
          <TableCell className="font-bold">合計</TableCell>
          <TableCell numeric className="font-bold">{formatNumber(parseFloat(reportData.reduce((a, b) => a + roundDecimal(b.totalPerformance), 0).toFixed(2)))}</TableCell>
          <TableCell numeric className="font-bold">{formatNumber(reportData.reduce((a, b) => a + b.totalCount, 0))}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

Results.defaultProps = {}
