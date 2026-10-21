import { format } from 'date-fns'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import roundDecimal from './../../helper/roundDecimal.js'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Skeleton } from 'ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { formatNumber } from 'ui/format'

function OrderRecord({
  helperReport,
  titleDate,
  priceDisplayOnReport,
  setDateForHelper,
  dateForHelper,
  isLoading,
  ...rest
}) {
  const [sorted, setSorted] = useState([])

  useEffect(() => {
    const sortByNumber = helperReport
      .filter(data => !isNaN(parseInt(data.user.designerNo, 10)) && data.user.designerNo.length > 0)
      .sort((a, b) => a.user.designerNo - b.user.designerNo)
    const sortByCharacter = helperReport
      .filter(data => isNaN(parseInt(data.user.designerNo, 10)) && data.user.designerNo.length > 0)
      .sort((a, b) =>
        a.user.designerNo.localeCompare(b.user.designerNo, 'en', { sensitivity: 'base' })
      )
    const sortByNickName = helperReport
      .filter(data => data.user.designerNo === '' && data.user.nickName !== null)
      .sort((a, b) => a.user.nickName.localeCompare(b.user.nickName, 'en', { sensitivity: 'base' }))

    const sortByName = helperReport
      .filter(data => data.user.designerNo === '' && data.user.nickName === null)
      .sort((a, b) => a.user.name.localeCompare(b.user.name, 'en', { sensitivity: 'base' }))

    const sorted = [...sortByNumber, ...sortByCharacter, ...sortByNickName, ...sortByName]
    setSorted(sorted)
  }, [helperReport])
  return (
    <div {...rest} className="mt-[-24px]">
      <MerchantSearchBar
        values={dateForHelper}
        onFilter={values => setDateForHelper(values)}
        outside
        visible={['datePicker']}
        inMerchantDailyReport={true}
        hideStartDate={true}
        onlyDayTime={true}
      />
      {isLoading ?
        <Skeleton className="mx-auto h-96 w-full max-w-[800px]" /> :  sorted.length === 0 ?
        <Card>
          <EmptyState title="無資料" />
        </Card>
        : sorted.map((data, i) => (
            <Card key={`data-${i}`} className="mx-auto mb-6 min-w-[500px] max-w-[800px]">
              <CardHeader className="items-center pb-4 text-center">
                <CardTitle>
                  {`${
                    data.user.designerNo !== null && data.user.designerNo !== ''
                      ? data.user.designerNo
                      : ''
                  } ${
                    data.user.nickName !== null && data.user.nickName !== '' ? data.user.nickName : ''
                  } ${data.user.name} ${format(new Date(titleDate), 'MM/dd/yyyy')} 互助報表`}
                </CardTitle>
              </CardHeader>
              <div className="px-5 pb-5">
                  <div className="flex flex-col gap-4">
                      <Table aria-label="a dense table">
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead>#</TableHead>
                            <TableHead>項目</TableHead>
                            <TableHead>設計師</TableHead>
                            <TableHead numeric>金額</TableHead>
                            <TableHead numeric>點</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.helperRecord.map((record, index) => (
                            <TableRow key={`record-${index}`}>
                              <TableCell>
                                <a
                                  target="_blank"
                                  href={`/order/${record.orderId}`}
                                  className="text-text underline"
                                >
                                  #{record.orderNo}
                                </a>
                              </TableCell>
                              <TableCell className="whitespace-pre-line">
                                {record.service.name}
                              </TableCell>
                              <TableCell className="whitespace-pre-line">
                                {record.designer.name}
                              </TableCell>
                              {priceDisplayOnReport ? (
                                <TableCell numeric>{formatNumber(Math.abs(Math.round(record.helperFee)))}</TableCell>
                              ) : record.helperMoneyGivenWay === '點數換算金額' ? (
                                <TableCell />
                              ) : (
                                <TableCell numeric>{formatNumber(Math.abs(Math.round(record.helperFee)))}</TableCell>
                              )}
                              <TableCell numeric>{formatNumber(roundDecimal(record.helperPoint))}</TableCell>
                            </TableRow>
                          ))}
                          {data.productRecord.map((record, index) => (
                            <TableRow key={`productRecord-${index}`}>
                              <TableCell>
                                <a
                                  target="_blank"
                                  href={`/order/${record.orderId}`}
                                  className="text-text underline"
                                >
                                  #{record.orderNo}
                                </a>
                              </TableCell>
                              <TableCell>{`${record.productName} ${formatNumber(record.productUnitPrice)}x${record.productCount}`}</TableCell>
                              <TableCell></TableCell>
                              <TableCell numeric>{formatNumber(Math.round(record.productRake))}</TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell className="font-medium">合計</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            {priceDisplayOnReport ? (
                              <TableCell numeric>
                                {formatNumber(Math.abs(
                                  Math.round(
                                    data.helperRecord.reduce((accu, curVal) => accu + curVal.helperFee, 0)
                                  )
                                ) +
                                  Math.abs(
                                    Math.round(
                                      data.productRecord.reduce((accu, curVal) => accu + curVal.productRake, 0)
                                    )
                                  ))}
                              </TableCell>
                            ) : (
                              <TableCell numeric>
                                {formatNumber(Math.abs(
                                  Math.round(
                                    data.helperRecord
                                      .map(record =>
                                        record.helperMoneyGivenWay === '點數換算金額'
                                          ? 0
                                          : record.helperFee
                                      )
                                      .reduce((accu, curVal) => (accu += curVal), 0)
                                  )
                                ) +
                                  Math.abs(
                                    Math.round(
                                      data.productRecord.reduce((accu, curVal) => accu + curVal.productRake, 0)
                                    )
                                  ))}
                              </TableCell>
                            )}
                            <TableCell numeric>
                              {formatNumber(roundDecimal(
                                data.helperRecord.reduce((accu, curVal) => accu + curVal.helperPoint, 0)
                              ))}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      <Table aria-label="a dense table">
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead></TableHead>
                            <TableHead numeric>日合計</TableHead>
                            <TableHead numeric>累計</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              互助獲得金額
                              <br />
                              (不含點)
                            </TableCell>
                            <TableCell numeric>
                              {formatNumber(priceDisplayOnReport
                                ? Math.abs(
                                    Math.round(
                                      data.helperRecord.reduce((accu, curVal) => accu + curVal.helperFeeNoPoint, 0)
                                    )
                                  )
                                : Math.abs(
                                    Math.round(
                                      data.helperRecord
                                        .map(record =>
                                          record.helperMoneyGivenWay === '點數換算金額'
                                            ? 0
                                            : record.helperFee
                                        )
                                        .reduce((accu, curVal) => (accu += curVal), 0)
                                    )
                                  ))}
                            </TableCell>
                            <TableCell numeric>{formatNumber(Math.abs(Math.round(data.summaryNoPoint)))}</TableCell>
                          </TableRow>
                          {priceDisplayOnReport ? (
                            <TableRow>
                              <TableCell>
                                互助獲得(點)
                                <br />
                                點數/換算金額
                              </TableCell>
                              <TableCell numeric>
                                {formatNumber(roundDecimal(
                                  data.helperRecord.reduce((accu, curVal) => accu + curVal.helperPoint, 0)
                                ))}
                                /
                                {formatNumber(Math.abs(
                                  Math.round(
                                    data.helperRecord.reduce((accu, curVal) => accu + curVal.helperFeeOnlyPoint, 0)
                                  )
                                ))}
                              </TableCell>
                              <TableCell numeric>
                                {formatNumber(roundDecimal(data.helperPointTillNow))} /
                                {formatNumber(Math.abs(Math.round(data.summaryOnlyPoint)))}
                              </TableCell>
                            </TableRow>
                          ) : (
                            <TableRow>
                              <TableCell>互助獲得 - 點數</TableCell>
                              <TableCell numeric>
                                {formatNumber(roundDecimal(
                                  data.helperRecord.reduce((accu, curVal) => accu + curVal.helperPoint, 0)
                                ))}
                              </TableCell>
                              <TableCell numeric>{formatNumber(roundDecimal(data.helperPointTillNow))}</TableCell>
                            </TableRow>
                          )}
                          <TableRow>
                            <TableCell>店販業績</TableCell>
                            <TableCell numeric>
                              {formatNumber(Math.abs(
                                Math.round(
                                  data.productRecord.reduce((accu, curVal) => accu + curVal.productUnitPrice, 0)
                                )
                              ) *
                                Math.round(
                                  data.productRecord.reduce((accu, curVal) => accu + curVal.productCount, 0)
                                ))}
                            </TableCell>
                            <TableCell numeric>{formatNumber(Math.round(data.productPerformanceTillNow))}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>店販抽成</TableCell>
                            <TableCell numeric>
                              {formatNumber(Math.abs(
                                Math.round(
                                  data.productRecord.reduce((accu, curVal) => accu + curVal.productRake, 0)
                                )
                              ))}
                            </TableCell>
                            <TableCell numeric>{formatNumber(roundDecimal(data.productRakeTillNow))}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                  </div>
              </div>
            </Card>
        ))}
    </div>
  )
}

OrderRecord.propTypes = {
  orders: PropTypes.array,
}

OrderRecord.defaultProps = {
  orders: [],
}

export default OrderRecord
