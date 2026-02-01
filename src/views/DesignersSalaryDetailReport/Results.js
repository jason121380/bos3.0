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

const styles = {
  table: css({
    minWidth: 650,
  }),
  sticky: css({
    position: 'sticky',
    left: 0,
    background: 'white',
    zIndex: '99',
    outline: '1px solid #eeeeee',
  }),
  sticky2: css({
    position: 'sticky',
    left: 80,
    background: 'white',
    zIndex: '99',
    outline: '1px solid #eeeeee',
  }),
  stickyRow: css({
    position: 'relative',
    top: 0,
    background: 'white',
    zIndex: '100',
    outline: '1px solid #eeeeee',
  }),
  fixed: css({
    position: 'fixed',
  })
}

function Results({
  salaryDetailReport,
  merchantSalaryIncreaseItems,
  merchantSalaryDecreaseItems,
  designersSalaryDetailReportDataLoading,
}) {
  const [increaseItemsSum, setIncreaseItemsSum] = useState([])
  const [decreaseItemsSum, setDecreaseItemsSum] = useState([])
  const [fixedStatus1, setFixedStatus1] = useState(false)
  const [fixedStatus2, setFixedStatus2] = useState(false)
  const [headerHeight, setHerderHeight] = useState(64)
  const [hide1, setHide1] = useState(false)
  const [xMove1, setXMove1] = useState(0)
  const [xMove2, setXMove2] = useState(0)
  const [tableGap, setTableGap] = useState(24)
  const tableRef1 = useRef(null)
  const tableRef2 = useRef(null)
  const tHead1 = useRef(null)
  const tHead2 = useRef(null)
  const tr1Ref = useRef(null)
  const tr2Ref = useRef(null)
  const handleScroll1 = () => {
    setTableGap(tableRef1.current.getBoundingClientRect().left)
    const t1 = tr1Ref.current.getBoundingClientRect().x
    const t2 = tr2Ref.current.getBoundingClientRect().x
    setXMove1(t1 - 180)
    setXMove2(t2 - 180)
    const t1Height = tableRef1.current.offsetHeight + tHead1.current.offsetTop - headerHeight * 1.5
    setHide1(window.scrollY > t1Height)
    setHerderHeight(window.innerWidth < 600 ? 56 : 64)
    setFixedStatus1(window.scrollY > (tHead1.current.offsetTop - headerHeight))
    setFixedStatus2(window.scrollY > (tHead2.current.offsetTop - headerHeight))
  }
  useEffect(() => {
    if (tableRef1.current && tableRef2.current && tHead1.current && tHead2.current && tr1Ref.current) {
      window.addEventListener('scroll', handleScroll1)
      window.addEventListener('resize', handleScroll1)
      tableRef1.current.addEventListener('scroll', handleScroll1)
      tableRef2.current.addEventListener('scroll', handleScroll1)
      return () => {
        window.removeEventListener('scroll', handleScroll1)
        window.removeEventListener('resize', handleScroll1)
        tableRef1.current && tableRef1.current.removeEventListener('scroll', handleScroll1)
        tableRef2.current && tableRef2.current.removeEventListener('scroll', handleScroll1)
      }
    }
  }, [])
  
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
      merchantSalaryDecreaseItems.forEach(data => {})
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

  const headerVisible = (move, index) => {
    if (move < (-180 + tableGap - index * 80)) {
      return 'hidden'
    } else {
      return 'visible'
    }
  }
  return (
    <Fragment>
      <TableContainer ref={tableRef1} style={{ marginTop: 12 }} component={Paper} className="DesignersSalaryDetailReportTable">
        <Table css={styles.table} size="small" aria-label="a dense table">
          <TableHead ref={tHead1} css={styles.stickyRow}>
            <TableRow style={{ top: fixedStatus1 && headerHeight, display: hide1 && 'none', left: xMove1 }} css={fixedStatus1 ? styles.fixed : {}}>
              <TableCell css={styles.sticky} style={{ wordBreak: 'break-all', left: fixedStatus1 && tableGap}}>代號</TableCell>
              <TableCell css={styles.sticky2} style={{ wordBreak: 'break-all', left: fixedStatus1 && (tableGap + 80)}}>姓名</TableCell>
              <TableCell style={{ visibility: xMove1 < (-180 + tableGap ) && 'hidden' }}>身份</TableCell>
              {merchantSalaryIncreaseItems.map((data, index) => (
                <TableCell style={{ visibility: headerVisible(xMove1, index + 1)}} key={`${data.name}-${index}`}>{data.name}</TableCell>
              ))}
              <TableCell style={{ visibility: headerVisible(xMove1, merchantSalaryIncreaseItems.length + 1)}}>加項合計</TableCell>
              <TableCell style={{ visibility: headerVisible(xMove1, merchantSalaryIncreaseItems.length + 2)}}>指定業績</TableCell>
              <TableCell style={{ visibility: headerVisible(xMove1, merchantSalaryIncreaseItems.length + 3)}}>不指定業績</TableCell>
              <TableCell>特殊抽業績</TableCell>
              <TableCell>點數</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salaryDetailReport.userSalaryDetail.map((data, index) => {
                return (
                  <TableRow hover key={index}>
                    <TableCell css={styles.sticky} style={{ wordBreak: 'break-all' }}>{data.userNo}</TableCell>
                    <TableCell css={styles.sticky2} style={{ wordBreak: 'break-all' }}>{data.userName}</TableCell>
                    <TableCell ref={tr1Ref}>{data.userHelperIdentity}</TableCell>
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
            <TableRow>
              <TableCell css={styles.sticky} style={{ fontWeight: 'bold' }}>合計:</TableCell>
              <TableCell css={styles.sticky2}/>
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
        component={Paper}
        className="DesignersSalaryDetailReportTable-2"
        ref={tableRef2}
      >
        <Table css={styles.table} size="small" aria-label="a dense table">
          <TableHead ref={tHead2} css={styles.stickyRow}>
            <TableRow style={{ top: fixedStatus2 && headerHeight, left: xMove2 }} css={fixedStatus2 ? styles.fixed : {}}>
              <TableCell css={styles.sticky} style={{ wordBreak: 'break-all', left: fixedStatus2 && tableGap }}>代號</TableCell>
              <TableCell css={styles.sticky2} style={{ wordBreak: 'break-all', left: fixedStatus2 && (tableGap + 80) }}>姓名</TableCell>
              <TableCell style={{ visibility: xMove2 < (-180 + tableGap ) && 'hidden' }}>實發金額</TableCell>
              {merchantSalaryDecreaseItems.map((data, index) => (
                <TableCell style={{ visibility: headerVisible(xMove2, index + 1)}} key={`${data.name}-${index}`}>{data.name}</TableCell>
              ))}
              <TableCell>扣項合計</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salaryDetailReport.userSalaryDetail.map((data, index) => {
                return (
                  <TableRow hover key={index}>
                    <TableCell css={styles.sticky} style={{ wordBreak: 'break-all' }}>{data.userNo}</TableCell>
                    <TableCell css={styles.sticky2} style={{ wordBreak: 'break-all' }}>{data.userName}</TableCell>
                    <TableCell ref={tr2Ref}>{Math.round(data.actualPaidPrice)}</TableCell>
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
            <TableRow>
              <TableCell css={styles.sticky} style={{ fontWeight: 'bold' }}>合計:</TableCell>
              <TableCell  css={styles.sticky2}/>
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
