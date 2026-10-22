import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { Button } from 'ui/button'
import { useState, Fragment } from 'react'
import PropTypes from 'prop-types'
import roundDecimal from './../../helper/roundDecimal.js'
import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from 'ui/icons'
import { formatNumber } from 'ui/format'

const TABLE_COLUMNS = {
  EXPAND: '展開',
  RANK: '名次',
  DESIGNER: '設計師',
  STORE: '所屬店家',
  HELPER_POINTS: '互助獲得(點數)',
  HELPER_PRICE: '互助獲得(金額)',
  PRODUCT_TOTAL: '店販業績',
  MEMBERSHIP_TOTAL: '會員卡業績'
}

function Results({ report, performReference, displayReportWithMembership }) {
  const [open, setOpen] = useState([])
  const hasMergedDetailsRows = report.some(data => data.mergedDetails?.length > 1)

  const handleClick = (index) => () => {
    const idx = open.indexOf(index)
    if (idx > -1) {
      const arr = open
      arr.splice(idx, 1)
      setOpen([...arr])
    } else {
      setOpen([...open, index])
    }
  }
  const isOpen = (index) => open.includes(index)
  const getHasMergedDetails = data => data.mergedDetails?.length > 1

  const renderRoundedCell = (value) => <TableCell numeric>{formatNumber(roundDecimal(value))}</TableCell>;

  const renderDetailsTable = (data) => (
    <Table dense>
      <TableHeader>
        <TableRow>
          <TableHead>{TABLE_COLUMNS.STORE}</TableHead>
          <TableHead numeric>{TABLE_COLUMNS.HELPER_POINTS}</TableHead>
          <TableHead numeric>{TABLE_COLUMNS.HELPER_PRICE}</TableHead>
          <TableHead numeric>{`${TABLE_COLUMNS.PRODUCT_TOTAL}(${performReference === 'TRUTH' ? '實' : '虛'})`}</TableHead>
          {displayReportWithMembership &&
            <TableHead numeric>{`${TABLE_COLUMNS.MEMBERSHIP_TOTAL}(${performReference === 'TRUTH' ? '實' : '虛'})`}</TableHead>
          }
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.mergedDetails.map((detail, detailIndex) => (
          <TableRow key={detailIndex}>
            <TableCell>{detail.storeName}</TableCell>
            {renderRoundedCell(detail.helperReceivedPoint)}
            {renderRoundedCell(detail.helperReceivedPrice)}
            {renderRoundedCell(detail.productTotal)}
            {displayReportWithMembership && renderRoundedCell(detail.membershipTotal)}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const renderTotalCell = (key) => (
    <TableCell numeric>
      {formatNumber(Math.round(report.reduce((accu, curVal) => accu + (curVal[key] || 0), 0)))}
    </TableCell>
  );

  const renderTotalRow = () => (
    <TableRow>
      {hasMergedDetailsRows && <TableCell className='noprint'/>}
      <TableCell className="font-bold">合計</TableCell>
      <TableCell />
      <TableCell />
      {renderTotalCell('helperReceivedPoint')}
      {renderTotalCell('helperReceivedPrice')}
      {renderTotalCell('productTotal')}
      {displayReportWithMembership && renderTotalCell('membershipTotal')}
    </TableRow>
  )

  return (
    <Table dense wrapperClassName='HelperLeaderBoardTable' className="min-w-[650px]" aria-label="a dense table">
      <TableHeader>
        <TableRow>
          {hasMergedDetailsRows && <TableHead className='noprint'>{TABLE_COLUMNS.EXPAND}</TableHead>}
          <TableHead>{TABLE_COLUMNS.RANK}</TableHead>
          <TableHead>{TABLE_COLUMNS.DESIGNER}</TableHead>
          <TableHead>{TABLE_COLUMNS.STORE}</TableHead>
          <TableHead numeric>{TABLE_COLUMNS.HELPER_POINTS}</TableHead>
          <TableHead numeric>{TABLE_COLUMNS.HELPER_PRICE}</TableHead>
          <TableHead numeric>{`${TABLE_COLUMNS.PRODUCT_TOTAL}(${performReference === 'TRUTH' ? '實' : '虛'})`}</TableHead>
          {displayReportWithMembership &&
            <TableHead numeric>{`${TABLE_COLUMNS.MEMBERSHIP_TOTAL}(${performReference === 'TRUTH' ? '實' : '虛'})`}</TableHead>
          }
        </TableRow>
      </TableHeader>
      <TableBody>
        {report.map((data, index) => {
          const hasMergedDetails = getHasMergedDetails(data)
          return (
            <Fragment key={index}>
              <TableRow>
                {hasMergedDetailsRows &&
                  <TableCell className='noprint'>
                    {hasMergedDetails ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={isOpen(index) ? '收合明細' : '展開明細'}
                        onClick={handleClick(index)}
                      >
                        {isOpen(index) ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                      </Button>
                    ) : null}
                  </TableCell>
                }
                <TableCell>
                  <span>{index + 1}</span>
                </TableCell>
                <TableCell className="font-bold">{data.userName}</TableCell>
                <TableCell>{data.storeName}</TableCell>
                {renderRoundedCell(data.helperReceivedPoint)}
                {renderRoundedCell(data.helperReceivedPrice)}
                {renderRoundedCell(data.productTotal)}
                {displayReportWithMembership && renderRoundedCell(data.membershipTotal)}
              </TableRow>
              {hasMergedDetails &&
                <TableRow className={isOpen(index) ? 'noprint' : 'noprint border-b-0'}>
                  {/* 跨欄數＝表格欄數：展開、名次、設計師、所屬店家、點數、金額、店販＝7，顯示會員卡時再加 1 */}
                  <TableCell className="!p-0" colSpan={displayReportWithMembership ? 8 : 7}>
                    {isOpen(index) && (
                      <div className="m-4">
                        {renderDetailsTable(data)}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              }
            </Fragment>
          )
        })}
        {renderTotalRow()}
      </TableBody>
    </Table>
  )
}

Results.propTypes = {
  report: PropTypes.array,
}

Results.defaultProps = {
  report: [],
}

export default Results
