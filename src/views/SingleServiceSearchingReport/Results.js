/** @jsxImportSource @emotion/react */
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  TableContainer, Typography
} from '@mui/material'
import { Fragment } from 'react'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'

const styles = {
  table: css({
    minWidth: 650,
  }),
  sticky: css({
    position: 'sticky',
    left: 0,
    background: 'white',
    zIndex: '99',
    outline: '1px solid rgb(var(--border))',
  }),
  stickyRow: css({
    position: 'sticky !important',
    top: 0,
    background: 'white',
    zIndex: '100',
    outline: '1px solid rgb(var(--border)) !important',
  }),
  designerName: css({
    fontWeight: 'bold',
  }),
  sepreateDiv: css({
    width: '100%',
    display: 'flex',
    '& div': {
      width: '50%',
      textAlign: 'center'
    }
  }),
  centerTd: css({
    textAlign: 'center',
  }),
  summary: css({
    '& td': {
      fontWeight: 'bold'
    }
  }),
  subTotal: css({
    '& td.MuiTableCell-root.MuiTableCell-body': {
      backgroundColor: 'lightgray',
      color: 'rgb(var(--text))'
    }
  })
}

function Results({ reportData, sort }) {
  const renderTable = () => {
    const { serviceIds, all, date, designer } = reportData
    const TotalRow = () => (
      <Fragment>
        {serviceIds.map(id => {
          const curService = []

          all.forEach(item => {
            const findData = item.singleServices.find(d => d.serviceId === id)
            findData && curService.push(findData.summary)
          })

          return (
            <TableCell key={`total-${id}`}>
              <div css={styles.sepreateDiv}>
                <div>{Math.round(curService.reduce((a, b) => a + b.performance, 0) * 100) / 100}</div>
                <div>{Math.round(curService.reduce((a, b) => a + b.orderCount, 0) * 100) / 100}</div>
              </div>
            </TableCell>
          )
        })}
      </Fragment>

    )
    switch (sort) {
      case 'ALL':
        return (
          <TableContainer component={Paper} style={{ maxHeight: 'calc(100vh - 250px)' }}>
            <Table css={styles.table} size="small">
              <TableHead css={styles.stickyRow}>
                <TableRow>
                  <TableCell css={styles.sticky}>日期</TableCell>
                  {serviceIds.map(id => {
                    const findData = all[0].singleServices.find(d => d.serviceId === id)
                    return (
                      <TableCell key={`thead-${findData.serviceId}`}>
                        <div css={styles.centerTd}>{findData.serviceNo + ' - ' + findData.serviceName}</div>
                        <div css={styles.sepreateDiv}>
                          <div>虛業績</div>
                          <div>客次</div>
                        </div>
                      </TableCell>
                    )
                  })}
                </TableRow>
              </TableHead>

              <TableBody>
                {all.map(d => (
                  <TableRow hover key={d.date}>
                    <TableCell css={styles.sticky}>{d.date}</TableCell>
                    {serviceIds.map(id => {
                      const findData = d.singleServices.find(item => item.serviceId === id)
                      return (
                        <TableCell key={`${d.date}-${findData.serviceId}`}>
                          <div css={styles.sepreateDiv}>
                            <div>{Math.round(findData.summary.performance * 100) / 100}</div>
                            <div>{findData.summary.orderCount}</div>
                          </div>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
                <TableRow css={styles.summary} hover>
                  <TableCell css={styles.sticky}>合計</TableCell>
                  <TotalRow />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )
      case 'BYDATE':
        return (
          <TableContainer component={Paper} style={{ maxHeight: 'calc(100vh - 250px)' }}>
            <Table css={styles.table} size="small">
              <TableHead css={styles.stickyRow}>
                <TableRow>
                  <TableCell css={styles.sticky}>日期</TableCell>
                  <TableCell>設計師編號</TableCell>
                  <TableCell>設計師名稱</TableCell>
                  {serviceIds.map(id => {
                    const findData = date[0].summary.singleServices.find(item => item.serviceId === id)
                    return (
                      <TableCell key={`thead-${findData.serviceId}`}>
                        <div css={styles.centerTd}>{findData.serviceNo + ' - ' + findData.serviceName}</div>
                        <div css={styles.sepreateDiv}>
                          <div>虛業績</div>
                          <div>客次</div>
                        </div>
                      </TableCell>
                    )
                  })}
                </TableRow>
              </TableHead>

              <TableBody>
                {date.map(({ date, designerServices, summary }) => (
                  <Fragment key={date}>
                    {designerServices.map(item => (
                      <TableRow key={item.designerId} hover>
                        <TableCell css={styles.sticky}>{date}</TableCell>
                        <TableCell>{item.designerNo}</TableCell>
                        <TableCell>{item.designerName}</TableCell>
                        {serviceIds.map((id, i) => {
                          const findData = item.singleServices.find(d => d.serviceId === id)
                          return (
                            <TableCell key={`singleServices-${date}=${i}`}>
                              <div css={styles.sepreateDiv}>
                                <div>{Math.round(findData.singleServiceItem[0].performance * 100) / 100}</div>
                                <div>{findData.singleServiceItem[0].orderCount}</div>
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}

                    {designerServices.length !== 0 && (
                      <TableRow css={[styles.summary, styles.subTotal]} hover>
                        <TableCell css={styles.sticky}>{date}</TableCell>
                        <TableCell></TableCell>
                        <TableCell>小計</TableCell>
                        {serviceIds.map((id, i) => {
                          const { singleServiceItem } = summary.singleServices.find(item => item.serviceId === id)
                          return (
                            <TableCell key={`summary-${date}=${i}`}>
                              <div css={styles.sepreateDiv}>
                                <div>{singleServiceItem[0] ? Math.round(singleServiceItem[0].performance * 100) / 100 : 0}</div>
                                <div>{singleServiceItem[0] ? singleServiceItem[0].orderCount : 0}</div>
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )}
                  </Fragment>
                ))}
                <TableRow css={styles.summary} hover>
                  <TableCell css={styles.sticky}>合計</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TotalRow />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )

      case 'BYDESIGNER':
        return (
          <TableContainer component={Paper} style={{ maxHeight: 'calc(100vh - 250px)' }}>
            <Table css={styles.table} size="small">
              <TableHead css={styles.stickyRow}>
                <TableRow>
                  <TableCell css={styles.sticky}>日期</TableCell>
                  <TableCell>設計師編號</TableCell>
                  <TableCell>設計師名稱</TableCell>
                  {serviceIds.map(id => {
                    const findData = date[0].summary.singleServices.find(item => item.serviceId === id)
                    return (
                      <TableCell key={`thead-${findData.serviceId}`}>
                        <div css={styles.centerTd}>{findData.serviceNo + ' - ' + findData.serviceName}</div>
                        <div css={styles.sepreateDiv}>
                          <div>虛業績</div>
                          <div>客次</div>
                        </div>
                      </TableCell>
                    )
                  })}
                </TableRow>
              </TableHead>

              <TableBody>
                {designer.map(({ designerId, designerName, designerNo, datePerformances, summary }) => (
                  <Fragment key={designerId}>
                    {datePerformances.map(({ date, singleServices }) => (
                      <TableRow key={`${date}-${designerId}`} hover>
                        <TableCell css={styles.sticky}>{date}</TableCell>
                        <TableCell>{designerNo}</TableCell>
                        <TableCell>{designerName}</TableCell>
                        {serviceIds.map(id => {
                          const findData = singleServices.find(item => item.serviceId === id)
                          return (
                            <TableCell key={`${date}-${findData.serviceId}`}>
                              <div css={styles.sepreateDiv}>
                                <div>{Math.round(findData.summary.performance * 100) / 100}</div>
                                <div>{findData.summary.orderCount}</div>
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>

                    ))}
                    {datePerformances.length !== 0 && (
                      <TableRow css={[styles.summary, styles.subTotal]} hover>
                        <TableCell css={styles.sticky}></TableCell>
                        <TableCell></TableCell>
                        <TableCell>小計</TableCell>
                        {serviceIds.map((id, i) => {
                          const findData = summary.find(({ serviceId }) => serviceId === id)
                          return (
                            <TableCell key={`subTotal-${date}=${i}`}>
                              <div css={styles.sepreateDiv}>
                                <div>{findData.summary ? Math.round(findData.summary.performance * 100) / 100 : 0}</div>
                                <div>{findData.summary ? findData.summary.orderCount : 0}</div>
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )}
                  </Fragment>
                ))}
                <TableRow css={styles.summary} hover>
                  <TableCell css={styles.sticky}>合計</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TotalRow />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )
      default:
        return sort
    }
  }

  return (
    <Fragment>
      {reportData?.serviceIds?.length ? renderTable() : (
        <Typography variant="h3" style={{ textAlign: 'center', marginTop: 100 }}>無資料</Typography>
      )}
    </Fragment>
  )
}

Results.propTypes = {
  report: PropTypes.array,
}

Results.defaultProps = {
  report: [],
}

export default Results
