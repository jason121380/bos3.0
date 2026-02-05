/** @jsxImportSource @emotion/react */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
} from '@mui/material'
import PropTypes from 'prop-types'
import { Fragment, useEffect, useState, useRef } from 'react'
import { css } from '@emotion/react'

const localStyles = {
  tableHead: css({
    backgroundColor: '#FFFFFF',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    '& .MuiTableCell-head': {
      backgroundColor: '#f8f9fa',
      color: '#212121',
      fontWeight: 'bold',
      borderBottom: '1px solid #f0f0f0',
      height: '40px !important',
      padding: '2px 16px !important',
      fontSize: '14px',
      whiteSpace: 'nowrap',
    }
  }),
  tableRow: css({
    height: '40px !important',
    minHeight: '40px !important',
    '& .MuiTableCell-body': {
      padding: '2px 16px !important',
      borderBottom: '1px solid #f0f0f0',
      fontSize: '14px !important',
      color: '#333',
    },
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
  }),
  totalRow: css({
    backgroundColor: 'rgba(26, 115, 232, 0.05) !important',
    height: '40px !important',
    '& .MuiTableCell-body': {
      padding: '2px 16px !important',
      fontWeight: 'bold !important',
      color: '#1A73E8 !important',
      borderBottom: '1px solid #f0f0f0',
    }
  }),
  stickyLeft: css({
    position: 'sticky',
    left: 0,
    background: '#FFFFFF !important',
    zIndex: 20,
    borderRight: '1px solid #f0f0f0',
  }),
  stickyLeft2: css({
    position: 'sticky',
    left: 80,
    background: '#FFFFFF !important',
    zIndex: 20,
    borderRight: '1px solid #f0f0f0',
  }),
}

function Results({
  salaryDetailReport,
  merchantSalaryIncreaseItems,
  merchantSalaryDecreaseItems,
  designersSalaryDetailReportDataLoading,
}) {
  const [increaseItemsSum, setIncreaseItemsSum] = useState([])
  const [decreaseItemsSum, setDecreaseItemsSum] = useState([])

  useEffect(() => {
    if (!designersSalaryDetailReportDataLoading && !merchantSalaryIncreaseItems.loading) {
      const increaseItemsSum = []

      merchantSalaryIncreaseItems.forEach(data => {
        increaseItemsSum.push(0)
      })

      merchantSalaryIncreaseItems.forEach((data, index) => {
        salaryDetailReport.userSalaryDetail.forEach(data2 => {
          if (data2.increase.length === 0) {
            increaseItemsSum[index] += 0
          } else {
            data2.increase.forEach(increaseItem => {
              if (increaseItem.itemName === data.name) {
                increaseItemsSum[index] += increaseItem.price
              }
            })
          }
        })
      })
      setIncreaseItemsSum(increaseItemsSum)
    }
  }, [merchantSalaryIncreaseItems, designersSalaryDetailReportDataLoading])

  useEffect(() => {
    if (!designersSalaryDetailReportDataLoading && merchantSalaryDecreaseItems.length > 0) {
      const decreaseItemsSum = []
      merchantSalaryDecreaseItems.forEach(data => { })
      merchantSalaryDecreaseItems.forEach((data, index) => {
        decreaseItemsSum.push(0)

        salaryDetailReport.userSalaryDetail.forEach(data2 => {
          if (data2.decrease.length === 0) {
            decreaseItemsSum[index] += 0
          } else {
            data2.decrease.forEach(decreaseItem => {
              if (decreaseItem.itemName === data.name) {
                decreaseItemsSum[index] += decreaseItem.price
              }
            })
          }
        })
      })
      setDecreaseItemsSum(decreaseItemsSum)
    }
  }, [merchantSalaryDecreaseItems, designersSalaryDetailReportDataLoading])

  return (
    <Fragment>
      <TableContainer style={{ marginTop: 24, padding: 0, border: '1px solid #f0f0f0', borderRadius: '16px', overflow: 'auto', backgroundColor: '#fff' }} className="DesignersSalaryDetailReportTable">
        <Table size="small" stickyHeader>
          <TableHead css={localStyles.tableHead}>
            <TableRow>
              <TableCell css={localStyles.stickyLeft} style={{ wordBreak: 'break-all' }}>代號</TableCell>
              <TableCell css={localStyles.stickyLeft2} style={{ wordBreak: 'break-all' }}>姓名</TableCell>
              <TableCell>身份</TableCell>
              {merchantSalaryIncreaseItems.map((data, index) => (
                <TableCell key={`${data.name}-${index}`}>{data.name}</TableCell>
              ))}
              <TableCell>加項合計</TableCell>
              <TableCell>指定業績</TableCell>
              <TableCell>不指定業績</TableCell>
              <TableCell>特殊抽業績</TableCell>
              <TableCell>點數</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salaryDetailReport.userSalaryDetail.map((data, index) => {
              return (
                <TableRow key={index} css={localStyles.tableRow}>
                  <TableCell css={localStyles.stickyLeft} style={{ wordBreak: 'break-all' }}>{data.userNo}</TableCell>
                  <TableCell css={localStyles.stickyLeft2} style={{ wordBreak: 'break-all' }}>{data.userName}</TableCell>
                  <TableCell>{data.userHelperIdentity}</TableCell>
                  {merchantSalaryIncreaseItems.map((merchantIncreaseItems, merchantIncreaseItemsIndex) => {
                    if (
                      data.increase.find(
                        increase => increase.itemName === merchantIncreaseItems.name
                      ) !== undefined
                    ) {
                      return (
                        <TableCell key={merchantIncreaseItemsIndex}>
                          {
                            data.increase.find(
                              increase => increase.itemName === merchantIncreaseItems.name
                            ).price
                          }
                        </TableCell>
                      )
                    } else {
                      return <TableCell key={merchantIncreaseItemsIndex}>0</TableCell>
                    }
                  })}
                  <TableCell>{Math.round(data.increaseSum)}</TableCell>
                  <TableCell>{Math.round(data.designatePerformance)}</TableCell>
                  <TableCell>{Math.round(data.nonDesignatePerformance)}</TableCell>
                  <TableCell>{Math.round(data.specialTruthPerformance)}</TableCell>
                  <TableCell>{Math.round(data.helperRetrievePoint)}</TableCell>
                </TableRow>
              )
            }
            )}
            <TableRow css={localStyles.totalRow}>
              <TableCell css={localStyles.stickyLeft} style={{ fontWeight: 'bold', backgroundColor: 'rgba(26, 115, 232, 0.05) !important', color: '#1A73E8 !important' }}>合計:</TableCell>
              <TableCell css={localStyles.stickyLeft2} style={{ backgroundColor: 'rgba(26, 115, 232, 0.05) !important' }} />
              <TableCell />
              {increaseItemsSum.map((data, index) => (
                <TableCell key={index}>{Math.round(data)}</TableCell>
              ))}
              <TableCell>
                {Math.round(
                  salaryDetailReport.userSalaryDetail
                    .map(data => data.increaseSum)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                )}
              </TableCell>
              <TableCell>
                {Math.round(
                  salaryDetailReport.userSalaryDetail
                    .map(data => data.designatePerformance)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                )}
              </TableCell>
              <TableCell>
                {Math.round(
                  salaryDetailReport.userSalaryDetail
                    .map(data => data.nonDesignatePerformance)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                )}
              </TableCell>
              <TableCell>
                {Math.round(
                  salaryDetailReport.userSalaryDetail
                    .map(data => data.specialTruthPerformance)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                )}
              </TableCell>
              <TableCell>
                {Math.round(
                  salaryDetailReport.userSalaryDetail
                    .map(data => data.helperRetrievePoint)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer
        style={{ marginTop: 24, padding: 0, border: '1px solid #f0f0f0', borderRadius: '16px', overflow: 'auto', backgroundColor: '#fff' }}
        className="DesignersSalaryDetailReportTable-2"
      >
        <Table size="small" stickyHeader>
          <TableHead css={localStyles.tableHead}>
            <TableRow>
              <TableCell css={localStyles.stickyLeft} style={{ wordBreak: 'break-all' }}>代號</TableCell>
              <TableCell css={localStyles.stickyLeft2} style={{ wordBreak: 'break-all' }}>姓名</TableCell>
              <TableCell>實發金額</TableCell>
              {merchantSalaryDecreaseItems.map((data, index) => (
                <TableCell key={`${data.name}-${index}`}>{data.name}</TableCell>
              ))}
              <TableCell>扣項合計</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salaryDetailReport.userSalaryDetail.map((data, index) => {
              return (
                <TableRow key={index} css={localStyles.tableRow}>
                  <TableCell css={localStyles.stickyLeft} style={{ wordBreak: 'break-all' }}>{data.userNo}</TableCell>
                  <TableCell css={localStyles.stickyLeft2} style={{ wordBreak: 'break-all' }}>{data.userName}</TableCell>
                  <TableCell>{Math.round(data.actualPaidPrice)}</TableCell>
                  {merchantSalaryDecreaseItems.map((merchantDecreaseItems, merchantDecreaseItemsIndex) => {
                    if (data.decrease.length === 0) {
                      return <TableCell key={merchantDecreaseItemsIndex}>0</TableCell>
                    } else {
                      if (
                        data.decrease.find(
                          decrease => decrease.itemName === merchantDecreaseItems.name
                        ) !== undefined
                      ) {
                        return (
                          <TableCell key={merchantDecreaseItemsIndex}>
                            {
                              data.decrease.find(
                                decrease =>
                                  decrease.itemName === merchantDecreaseItems.name
                              ).price
                            }
                          </TableCell>
                        )
                      } else {
                        return <TableCell>0</TableCell>
                      }
                    }
                  })}
                  <TableCell>{Math.round(data.decreaseSum)}</TableCell>
                </TableRow>
              )
            }
            )}
            <TableRow css={localStyles.totalRow}>
              <TableCell css={localStyles.stickyLeft} style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa !important' }}>合計:</TableCell>
              <TableCell css={localStyles.stickyLeft2} style={{ backgroundColor: '#f8f9fa !important' }} />
              <TableCell>
                {Math.round(
                  salaryDetailReport.userSalaryDetail
                    .map(data => data.actualPaidPrice)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                )}
              </TableCell>
              {decreaseItemsSum.map((data, index) => (
                <TableCell key={index}>{Math.round(data)}</TableCell>
              ))}
              <TableCell>
                {Math.round(
                  salaryDetailReport.userSalaryDetail
                    .map(data => data.decreaseSum)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
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
