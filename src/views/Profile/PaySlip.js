/** @jsxImportSource @emotion/react */
import {
  Card,
  CardHeader,
  Divider,
  Grid,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  TableBody,
  TableCell,
  Table,
  colors,
  Typography,
  CircularProgress
} from '@mui/material'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { format } from 'date-fns'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  saveButton: css({
    color: theme.palette.common.white,
    backgroundColor: colors.green[600],
    '&:hover': {
      backgroundColor: colors.green[900],
    },
  }),
  action: css({
    width: '100%',
  }),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  }),
  actions: css({
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  }),
  cardHeader: css({
    textAlign: 'center',
  }),
  eachSlip: css({
    marginBottom: '20px',
  }),
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px'
  })
}

function PaySlip({
  isDisplayFakePerformance,
  userPaySlip,
  setGetLastMonth,
  getLastMonth,
  isLoading,
  EPWDDisplay,
}) {
  return (
    <Grid item xs={12} style={{ marginTop: -24 }} css={styles.eachSlip}>
      <MerchantSearchBar
        values={getLastMonth}
        onFilter={values => setGetLastMonth(values)}
        outside
        visible={['datePicker']}
        hideEndDate={true}
        onlyMonthYear={true}
        displayMonth={true}
      />
      {isLoading ?
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </div> : userPaySlip !== undefined && userPaySlip.length > 0 ? (
          userPaySlip.map((user, key) => {
            if (user.decreaseItem.length > 0 || user.increaseItem.length > 0) {
              return (
                <Grid key={key} item xs={12} css={styles.eachSlip}>
                  <Card>
                    <div css={styles.header} className='MuiCardHeader-root'>
                      <div></div>
                      <div className='MuiCardHeader-content'>
                        <Typography variant='h5'>
                          {`${JSON.parse(localStorage.getItem('userMerchant')).name}  -  ${format(
                            getLastMonth.startDate,
                            'yyyy/MM'
                          )} - ${user.name}`}
                        </Typography>
                      </div>
                      <div>{EPWDDisplay ? `天數: ${user.workingDays}` : ''}</div>
                    </div>
                    <Divider />
                    <TableContainer component={Paper}>
                      <Table css={styles.table} size="small" aria-label="a dense table">
                        <TableBody className='renderItem'>
                          {user.increaseItem.length > 0 ? (
                            user.increaseItem.map((item, i) => {
                              if (i % 6 === 0 && i != 0) {
                                return (
                                  <Fragment key={`increaseItem-${i}`}>
                                    <TableRow></TableRow>
                                    <TableCell
                                      style={{ fontWeight: 'bold', width: '100px' }}
                                    >
                                      {item.itemName}
                                    </TableCell>
                                    <TableCell className='price' style={{ width: '100px' }}>
                                      {item.price}
                                    </TableCell>
                                  </Fragment>
                                )
                              } else {
                                return (
                                  <Fragment key={`increaseItem-${i}`}>
                                    <TableCell
                                      style={{ fontWeight: 'bold', width: '100px' }}
                                    >
                                      {item.itemName}
                                    </TableCell>
                                    <TableCell className='price' style={{ width: '100px' }}>
                                      {item.price}
                                    </TableCell>
                                  </Fragment>
                                )
                              }
                            })
                          ) : (
                            <TableCell></TableCell>
                          )}
                        </TableBody>
                        <TableBody>
                          <TableRow>
                            <br />
                          </TableRow>
                        </TableBody>
                        <TableBody className='renderItem'>
                          {user.decreaseItem.length > 0 ? (
                            user.decreaseItem.map((item, i) => {
                              if (i % 6 === 0 && i != 0) {
                                return (
                                  <Fragment key={`decreaseItem-${i}`}>
                                    <TableRow></TableRow>
                                    <TableCell style={{ fontWeight: 'bold' }}>
                                      {item.itemName}
                                    </TableCell>
                                    <TableCell className='price'>{item.price}</TableCell>
                                  </Fragment>
                                )
                              } else {
                                return (
                                  <Fragment key={`decreaseItem-${i}`}>
                                    <TableCell style={{ fontWeight: 'bold' }}>
                                      {item.itemName}
                                    </TableCell>
                                    <TableCell className='price'>{item.price}</TableCell>
                                  </Fragment>
                                )
                              }
                            })
                          ) : (
                            <TableCell></TableCell>
                          )}
                        </TableBody>
                        <TableBody>
                          <TableRow>
                            <br />
                          </TableRow>
                        </TableBody>
                      </Table>
                      <Table>
                        <TableBody>
                          <TableRow style={{ textAlign: 'center' }}>
                            <TableCell style={{ fontWeight: 'bold' }}>
                              加項合計
                            </TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>
                              扣項合計
                            </TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>
                              實領薪資
                            </TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>
                              互助獲得(點)
                            </TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>
                              指定實業績
                            </TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>
                              不指定實業績
                            </TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>
                              特抽總業績
                            </TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>
                              總實業績
                            </TableCell>
                            {isDisplayFakePerformance && (
                              <Fragment>
                                <TableCell style={{ fontWeight: 'bold' }}>
                                  總虛業績
                                </TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>
                                  扣項-扣業績
                                </TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>
                                  手續費-扣業績
                                </TableCell>
                              </Fragment>
                            )}
                            <TableCell className='tableRemark' style={{ fontWeight: 'bold' }}>
                              備註
                            </TableCell>
                          </TableRow>
                          <TableRow style={{ textAlign: 'center' }}>
                            <TableCell>{user.increaseItem.reduce((a, b) => a + b.price, 0)}</TableCell>
                            <TableCell>{user.decreaseItem.reduce((a, b) => a + b.price, 0)}</TableCell>
                            <TableCell>{user.summary}</TableCell>
                            <TableCell>
                              {Math.round(user.helperPointRetrieve * 10) / 10}
                            </TableCell>
                            <TableCell>
                              {Math.round(user.designateTruthPerformance * 10) / 10}
                            </TableCell>
                            <TableCell>
                              {Math.round(user.nonDesignateTruthPerformance * 10) / 10}
                            </TableCell>
                            <TableCell>
                              {Math.round(user.specialTruthPerformance * 10) / 10}
                            </TableCell>
                            <TableCell>
                              {Math.round(user.truthPerformance * 10) / 10}
                            </TableCell>
                            {isDisplayFakePerformance && (
                              <Fragment>
                                <TableCell>
                                  {Math.round(user.fakePerformanceTotal * 10) / 10}
                                </TableCell>
                                <TableCell>
                                  {Math.round(user.performanceDecountItem * 10) / 10}
                                </TableCell>
                                <TableCell>
                                  {Math.round(user.handlingFeeOnSales * 10) / 10}
                                </TableCell>
                              </Fragment>
                            )}
                            <TableCell className='tableRemark' style={{ whiteSpace: 'nowrap' }}>
                              {user.remark}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                </Grid>
              )
            } else {
              return (
                <Grid item xs={12} css={styles.eachSlip}>
                  <Card>
                    <CardHeader
                      title={`${JSON.parse(localStorage.getItem('userMerchant')).name} - ${format(
                        getLastMonth.startDate,
                        'yyyy/MM'
                      )} - ${user.name}`}
                      css={styles.cardHeader}
                    />
                    <Divider />
                    <TableContainer component={Paper}>
                      <Table css={styles.table} size="small" aria-label="a dense table">
                        <TableHead>
                          <TableRow>
                            <TableCell>無加項</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>0</TableCell>
                          </TableRow>
                        </TableBody>
                        <TableHead>
                          <TableRow>
                            <TableCell>無扣項</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>0</TableCell>
                          </TableRow>
                        </TableBody>
                        <TableBody>
                          <TableRow>
                            <TableCell> </TableCell>
                          </TableRow>
                        </TableBody>
                        <TableHead>
                          <TableRow style={{ textAlign: 'center' }}>
                            <TableCell>實領薪資</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow style={{ textAlign: 'center' }}>
                            <TableCell>{0}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                </Grid>
              )
            }
          })
        ) : (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Typography component="h1" variant="h3">
              無資料
            </Typography>
          </div>
        )}
    </Grid>
  )
}

PaySlip.propTypes = {
  className: PropTypes.string,
}

export default PaySlip
