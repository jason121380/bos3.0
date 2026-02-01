/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, CardHeader, Divider, Table, TableBody,
  TableCell, TableHead, TableRow, Typography, TableContainer,
  Paper, CircularProgress
} from '@mui/material'
import { format } from 'date-fns'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import roundDecimal from './../../helper/roundDecimal.js'
import { css } from '@emotion/react'

const styles = {
  root: css({
    marginTop: -24
  }),
  cardHeader: css({
    textAlign: 'center',
  }),
  orderNoLink: css({
    textDecorationLine: 'underline',
    color: 'black',
  }),
}

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
      .filter(data => !isNaN(parseInt(data.user.designerNo)) && data.user.designerNo.length > 0)
      .sort((a, b) => a.user.designerNo - b.user.designerNo)
    const sortByCharacter = helperReport
      .filter(data => isNaN(parseInt(data.user.designerNo)) && data.user.designerNo.length > 0)
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
    <div {...rest} css={styles.root}>
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
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </div> :  sorted.length === 0 ?
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Typography component="h3" variant="h3">
            無資料
          </Typography>
        </div>
        : sorted.map((data, i) => (
            <Card key={`data-${i}`} style={{ margin: '0 auto', minWidth: '500px', maxWidth: '800px' }}>
              <CardHeader
                title={`${
                  data.user.designerNo !== null && data.user.designerNo !== ''
                    ? data.user.designerNo
                    : ''
                } ${
                  data.user.nickName !== null && data.user.nickName !== '' ? data.user.nickName : ''
                } ${data.user.name} ${format(new Date(titleDate), 'MM/dd/yyyy')} 互助報表`}
                css={styles.cardHeader}
              />
              <Divider />
              <CardContent css={styles.content}>
                <PerfectScrollbar>
                  <div css={styles.inner}>
                    <TableContainer component={Paper}>
                      <Table css={styles.table} size="small" aria-label="a dense table">
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>項目</TableCell>
                            <TableCell>設計師</TableCell>
                            <TableCell>金額</TableCell>
                            <TableCell>點</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.helperRecord.map((record, index) => (
                            <TableRow key={`record-${index}`}>
                              <TableCell>
                                <a
                                  target="_blank"
                                  href={`/order/${record.orderId}`}
                                  css={styles.orderNoLink}
                                >
                                  #{record.orderNo}
                                </a>
                              </TableCell>
                              <TableCell style={{ whiteSpace: 'pre-line' }}>
                                {record.service.name}
                              </TableCell>
                              <TableCell style={{ whiteSpace: 'pre-line' }}>
                                {record.designer.name}
                              </TableCell>
                              {priceDisplayOnReport ? (
                                <TableCell>{Math.abs(Math.round(record.helperFee))}</TableCell>
                              ) : record.helperMoneyGivenWay === '點數換算金額' ? (
                                <TableCell />
                              ) : (
                                <TableCell>{Math.abs(Math.round(record.helperFee))}</TableCell>
                              )}
                              <TableCell>{roundDecimal(record.helperPoint)}</TableCell>
                            </TableRow>
                          ))}
                          {data.productRecord.map((record, index) => (
                            <TableRow key={`productRecord-${index}`}>
                              <TableCell>
                                <a
                                  target="_blank"
                                  href={`/order/${record.orderId}`}
                                  css={styles.orderNoLink}
                                >
                                  #{record.orderNo}
                                </a>
                              </TableCell>
                              <TableCell>{`${record.productName} ${record.productUnitPrice}x${record.productCount}`}</TableCell>
                              <TableCell></TableCell>
                              <TableCell>{Math.round(record.productRake)}</TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell style={{ fontWeight: '500' }}>合計</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            {priceDisplayOnReport ? (
                              <TableCell>
                                {Math.abs(
                                  Math.round(
                                    data.helperRecord.reduce((accu, curVal) => accu + curVal.helperFee, 0)
                                  )
                                ) +
                                  Math.abs(
                                    Math.round(
                                      data.productRecord.reduce((accu, curVal) => accu + curVal.productRake, 0)
                                    )
                                  )}
                              </TableCell>
                            ) : (
                              <TableCell>
                                {Math.abs(
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
                                  )}
                              </TableCell>
                            )}
                            <TableCell>
                              {roundDecimal(
                                data.helperRecord.reduce((accu, curVal) => accu + curVal.helperPoint, 0)
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TableContainer component={Paper}>
                      <Table css={styles.table} size="small" aria-label="a dense table">
                        <TableHead>
                          <TableRow>
                            <TableCell></TableCell>
                            <TableCell>日合計</TableCell>
                            <TableCell>累計</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              互助獲得金額
                              <br />
                              (不含點)
                            </TableCell>
                            <TableCell>
                              {priceDisplayOnReport
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
                                  )}
                            </TableCell>
                            <TableCell>{Math.abs(Math.round(data.summaryNoPoint))}</TableCell>
                          </TableRow>
                          {priceDisplayOnReport ? (
                            <TableRow>
                              <TableCell>
                                互助獲得(點)
                                <br />
                                點數/換算金額
                              </TableCell>
                              <TableCell>
                                {roundDecimal(
                                  data.helperRecord.reduce((accu, curVal) => accu + curVal.helperPoint, 0)
                                )}
                                /
                                {Math.abs(
                                  Math.round(
                                    data.helperRecord.reduce((accu, curVal) => accu + curVal.helperFeeOnlyPoint, 0)
                                  )
                                )}
                              </TableCell>
                              <TableCell>
                                {roundDecimal(data.helperPointTillNow)} /
                                {Math.abs(Math.round(data.summaryOnlyPoint))}
                              </TableCell>
                            </TableRow>
                          ) : (
                            <TableRow>
                              <TableCell>互助獲得 - 點數</TableCell>
                              <TableCell>
                                {roundDecimal(
                                  data.helperRecord.reduce((accu, curVal) => accu + curVal.helperPoint, 0)
                                )}
                              </TableCell>
                              <TableCell>{roundDecimal(data.helperPointTillNow)}</TableCell>
                            </TableRow>
                          )}
                          <TableRow>
                            <TableCell>店販業績</TableCell>
                            <TableCell>
                              {Math.abs(
                                Math.round(
                                  data.productRecord.reduce((accu, curVal) => accu + curVal.productUnitPrice, 0)
                                )
                              ) *
                                Math.round(
                                  data.productRecord.reduce((accu, curVal) => accu + curVal.productCount, 0)
                                )}
                            </TableCell>
                            <TableCell>{Math.round(data.productPerformanceTillNow)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>店販抽成</TableCell>
                            <TableCell>
                              {Math.abs(
                                Math.round(
                                  data.productRecord.reduce((accu, curVal) => accu + curVal.productRake, 0)
                                )
                              )}
                            </TableCell>
                            <TableCell>{roundDecimal(data.productRakeTillNow)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                </PerfectScrollbar>
              </CardContent>
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
