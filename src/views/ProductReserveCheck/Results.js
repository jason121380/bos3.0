import PropTypes from 'prop-types'
import { Fragment } from 'react'
import clsx from 'clsx'
import { EmptyState } from 'ui/empty-state'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

// 欄線：一般分隔（border）、商品群組分隔（border-strong）；固定首欄改用 tokens 底色（原為寫死白底）
const SEP = 'border-0 border-r border-solid border-border'
const GROUP_END = 'border-0 border-r border-solid border-border-strong'
const STICKY_COL = 'sticky left-0 z-[99] min-w-[120px] break-all'

function Results({ reportData }) {
  const { reserveCheckSummary, productReserveChecks } = reportData
  return (
    <Fragment>
      {reserveCheckSummary.length === 0 ? (
        <EmptyState title="無資料" className="mt-[100px]" />
      ) : (
        <div className="mt-3 grid grid-cols-1 items-start gap-4 overflow-auto md:grid-cols-4">
          <div className="min-w-0 md:col-span-1">
            <Table wrapperClassName="max-h-[80vh] overflow-y-auto" aria-label="a dense table">
              <TableHeader className="sticky top-0 z-[100]">
                <TableRow className="hover:bg-transparent">
                  <TableHead>品名</TableHead>
                  <TableHead numeric>數量</TableHead>
                  <TableHead numeric>價格</TableHead>
                  <TableHead numeric>庫存金額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reserveCheckSummary.map(d => (
                  <TableRow key={d.id}>
                    <TableCell>{d.productName}</TableCell>
                    <TableCell numeric>{formatNumber(d.reserveCount)}</TableCell>
                    <TableCell numeric>{formatNumber(d.price)}</TableCell>
                    <TableCell numeric>{formatNumber(d.reservePrice)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-surface font-medium">
                  <TableCell colSpan={2}></TableCell>
                  <TableCell numeric><strong>合計</strong></TableCell>
                  <TableCell numeric className="font-bold">{formatNumber(reserveCheckSummary.reduce((a, b) => a + b.reservePrice , 0))}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="min-w-0 md:col-span-3">
            <Table wrapperClassName="max-h-[80vh] overflow-y-auto">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={`${STICKY_COL} top-0 z-[101] border-r border-r-border-strong bg-surface`}>品名</TableHead>
                  {productReserveChecks.map(d => (
                    <TableHead key={d.id} className="sticky top-0 z-[100] min-w-[100px] border-r border-r-border-strong bg-surface text-center" colSpan={3}>{d.productName}</TableHead>
                  ))}
                </TableRow>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={`${STICKY_COL} top-11 z-[101] border-r border-r-border-strong bg-surface`}>本期</TableHead>
                  {productReserveChecks.map((d, i) => (
                    <Fragment key={`stockLabel-${i}`}>
                      <TableHead className="sticky top-11 z-[100] bg-surface text-center">進</TableHead>
                      <TableHead className="sticky top-11 z-[100] bg-surface text-center">發</TableHead>
                      <TableHead className="sticky top-11 z-[100] border-r border-r-border-strong bg-surface text-center">存</TableHead>
                    </Fragment>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {productReserveChecks[0].reserveChecks.map((d, i) => (
                  <TableRow key={`${d.title}-${i}`}>
                    <TableCell className={`${STICKY_COL} ${GROUP_END} bg-background`}>{d.title}</TableCell>
                    {productReserveChecks.map(({ id, reserveChecks }) => {
                      return (
                        <Fragment key={id}>
                          <TableCell className={`${SEP} text-center tabular-nums text-accent`}>{reserveChecks[i].isCreated ? reserveChecks[i].in : '-'}</TableCell>
                          <TableCell className={`${SEP} text-center tabular-nums text-danger`}>{reserveChecks[i].isCreated ? reserveChecks[i].out : '-'}</TableCell>
                          <TableCell className={`${GROUP_END} text-center tabular-nums`}>{reserveChecks[i].isCreated ? reserveChecks[i].balance : '-'}</TableCell>
                        </Fragment>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </Fragment>
  )
}

Results.propTypes = {
  reportData: PropTypes.object,
}

Results.defaultProps = {
  reportData: {},
}

export default Results