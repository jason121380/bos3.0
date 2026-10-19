import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { Button } from 'ui/button'
import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from 'ui/icons'
import { useState, Fragment } from 'react'
import PropTypes from 'prop-types'
import { isSameDay } from 'date-fns'

function Results({
  report,
  performReference,
  monthlyAveragePerformanceTotal,
  monthlyAverageDisplayForDesignerLeaderBoard,
  isSubmit,
  membershipDisplay,
  performanceDisplay,
  dataDisplay,
}) {
  const [open, setOpen] = useState([])
  const referenceLabel = performReference === 'TRUTH' ? '實' : '虛'
  const hasMergedDetailsRows = report.some(data => data.mergedDetails.length > 1)

  // numeric：該欄表頭與本體數字靠右（對應 TableHead／TableCell 的 numeric）；className 取代舊的 emotion css／style
  const tableHeadCells = [
    hasMergedDetailsRows && { label: '展開', className: 'noprint' },
    { label: '名次' },
    { label: '設計師', className: 'font-bold' },
    { label: '所屬店家' },
    { label: '總業績', numeric: true },
    monthlyAverageDisplayForDesignerLeaderBoard && { label: '服務業績月平均', numeric: true },
    dataDisplay.isDRRPEVDisplay && { label: '業績年預估值', numeric: true },
    { label: `服務總業績(${referenceLabel})`, numeric: true },
    performanceDisplay === 'VISIBLE' && { label: `服務業績(指)(${referenceLabel})`, numeric: true },
    performanceDisplay === 'VISIBLE' && { label: `服務業績(不指)(${referenceLabel})`, numeric: true },
    { label: `卡券使用業績(${referenceLabel})`, numeric: true },
    { label: `卡券販賣(入業績)(${referenceLabel})`, numeric: true },
    { label: `店販業績(${referenceLabel})`, numeric: true },
    membershipDisplay && { label: `會員卡業績(${referenceLabel})`, numeric: true },
    { label: '互助使用(點數/金額)', numeric: true },
    dataDisplay.isDRROCDisplay && { label: '客次數', numeric: true },
  ].filter(Boolean)

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

  const handleCountSummary = key => {
    return Math.round(report.reduce((acc, cur) => acc + cur[key], 0))
  }

  const isOpen = (index) =>  open.includes(index)

  const getHasMergedDetails = data => data.mergedDetails.length > 1

  const renderCell = (value, idx) => <TableCell numeric key={`cell-${idx}`}>{Math.round(value)}</TableCell>

  return (
    isSubmit &&
    <Table dense wrapperClassName='DesignerPerformBasicTable' className="min-w-[650px]" aria-label="a dense table">
      <TableHeader>
        <TableRow>
          {tableHeadCells.map(({label, ...cell}, index) => (
            <TableHead key={index} {...cell}>
              {label}
            </TableHead>
          ))}
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
                <TableCell className="font-bold whitespace-nowrap">{data.userName}</TableCell>
                <TableCell className="whitespace-nowrap">{data.storeName}</TableCell>
                {[
                  data.businessPerformanceTotal,
                  monthlyAverageDisplayForDesignerLeaderBoard ? data.monthlyAveragePerformance : null,
                  dataDisplay.isDRRPEVDisplay ? data.performanceEV : null,
                  data.serviceTotal,
                  performanceDisplay === 'VISIBLE' ? data.designateServiceTotal : null,
                  performanceDisplay === 'VISIBLE' ? data.nonDesignateServiceTotal : null,
                  data.usedTicketTotal,
                  data.ticketSellIntoPerformanceDesignate + data.ticketSellIntoPerformanceNonDesignate,
                  data.productTotal,
                  membershipDisplay ? data.membershipTotal : null,
                ].map((value, idx) => value !== null ? renderCell(value, idx) : null)}
                <TableCell numeric>
                  {Math.round(data.helperPaidPoint)}/{Math.round(data.helperPaidPrice)}
                </TableCell>
                {dataDisplay.isDRROCDisplay && <TableCell numeric>{data.orderCount}</TableCell>}
              </TableRow>
              {hasMergedDetails &&
                <TableRow className={isOpen(index) ? 'noprint' : 'noprint border-b-0'}>
                  <TableCell className="!p-0" colSpan={tableHeadCells.length}>
                    {isOpen(index) && (
                      <div className="m-4">
                        <Table dense className='multiMerchantsLeaderBoardCollapse'>
                          <TableHeader>
                            <TableRow>
                              {tableHeadCells.slice(3).map(({label, ...cell}, index) => (
                                <TableHead key={index} {...cell}>
                                  {label}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.mergedDetails.map((detail, detailIndex) => (
                              <TableRow key={detailIndex}>
                                <TableCell className="whitespace-nowrap">{detail.storeName}</TableCell>
                                {[
                                  detail.businessPerformanceTotal,
                                  monthlyAverageDisplayForDesignerLeaderBoard ? detail.monthlyAveragePerformance : null,
                                  dataDisplay.isDRRPEVDisplay ? detail.performanceEV : null,
                                  detail.serviceTotal,
                                  performanceDisplay === 'VISIBLE' ? detail.designateServiceTotal : null,
                                  performanceDisplay === 'VISIBLE' ? detail.nonDesignateServiceTotal : null,
                                  detail.usedTicketTotal,
                                  detail.ticketSellIntoPerformanceDesignate + detail.ticketSellIntoPerformanceNonDesignate,
                                  detail.productTotal,
                                  membershipDisplay ? detail.membershipTotal : null,
                                ].map((value, idx) => value !== null ? renderCell(value, idx) : null)}
                                <TableCell numeric>
                                  {Math.round(detail.helperPaidPoint)}/{Math.round(detail.helperPaidPrice)}
                                </TableCell>
                                {dataDisplay.isDRROCDisplay && <TableCell numeric>{detail.orderCount}</TableCell>}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              }
            </Fragment>
          )
        })}
        <TableRow>
          {hasMergedDetailsRows &&
            <TableCell className='noprint'/>
          }
          <TableCell className="font-bold whitespace-nowrap">合計</TableCell>
          <TableCell />
          <TableCell />
          {[
            handleCountSummary('businessPerformanceTotal'),
            monthlyAverageDisplayForDesignerLeaderBoard ? monthlyAveragePerformanceTotal : null,
            dataDisplay.isDRRPEVDisplay ? handleCountSummary('performanceEV') : null,
            handleCountSummary('serviceTotal'),
            performanceDisplay === 'VISIBLE' ? handleCountSummary('designateServiceTotal') : null,
            performanceDisplay === 'VISIBLE' ? handleCountSummary('nonDesignateServiceTotal') : null,
            handleCountSummary('usedTicketTotal'),
            handleCountSummary('ticketSellIntoPerformanceDesignate') + handleCountSummary('ticketSellIntoPerformanceNonDesignate'),
            handleCountSummary('productTotal'),
            membershipDisplay ? handleCountSummary('membershipTotal') : null,
          ].map((value, idx) => value !== null ? <TableCell numeric key={idx}>{Math.round(value)}</TableCell> : null)}
          <TableCell numeric>
            {handleCountSummary('helperPaidPoint')}/{handleCountSummary('helperPaidPrice')}
          </TableCell>
          {dataDisplay.isDRROCDisplay && <TableCell numeric>{handleCountSummary('orderCount')}</TableCell>}
        </TableRow>
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
