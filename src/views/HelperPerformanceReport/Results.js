/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 900,
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
  border: css({
    borderRight: '1px solid rgb(var(--border))',
  }),
  sticky: css({
    position: 'sticky',
    top: 0,
    left: 0,
    background: 'white',
    zIndex: '99',
    wordBreak: 'break-all',
    width: '200px',
  }),
  stickyRow: css({
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: '100',
    outline: '1px solid rgb(var(--border))',
  }),
}

function Results({
  helperPerformanceData,
  membershipDisplay,
  ...rest
}) {
  return (
    <div {...rest} css={styles.root}>
      <Typography color="textSecondary" gutterBottom variant="body2"></Typography>
      <Card>
        <Divider />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table className='HelperPerformanceReportTable'>
                <TableHead>
                  <TableRow css={styles.stickyRow}>
                    <TableCell style={{ borderRight: '1px solid rgb(var(--border))', }} css={styles.sticky}>設計師名稱</TableCell>
                    <TableCell>洗髮人數</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>洗髮指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>

                    <TableCell>剪髮人數</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>剪髮指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>

                    <TableCell>燙髮人數</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>燙髮指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>

                    <TableCell>染髮人數</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>染髮指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>

                    <TableCell>護髮人數</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>護髮指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>

                    <TableCell>頭皮理療人數</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>頭皮理療指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>

                    <TableCell>接髮人數</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>接髮指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>

                    <TableCell>造型人數</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>造型髮指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>

                    <TableCell>美容人數</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>美容指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>

                    <TableCell>美甲人數</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>美甲指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>

                    <TableCell>套餐人數</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>套餐指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>

                    <TableCell>髮券銷售人數</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>髮券銷售指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>

                    <TableCell>套餐銷售人數</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>套餐銷售指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>

                    <TableCell>洗護包套人數</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>洗護包套指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>

                    <TableCell>入金人數</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>入金指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>

                    <TableCell>外租收入人數</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>外租收入指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>

                    <TableCell>其他人數</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>其他指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>

                    <TableCell>店販</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>店販指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>

                    {membershipDisplay && (
                      <Fragment>
                        <TableCell>會員卡</TableCell>
                        <TableCell css={styles.border}>抽成元</TableCell>
                        <TableCell>會員卡指定</TableCell>
                        <TableCell css={styles.border}>抽成點</TableCell>
                      </Fragment>
                    )}

                    <TableCell>合計</TableCell>
                    <TableCell css={styles.border}>抽成元</TableCell>
                    <TableCell>合計指定</TableCell>
                    <TableCell css={styles.border}>抽成點</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {helperPerformanceData.map((data, index) =>
                    <TableRow hover key={index}>
                      <TableCell css={styles.sticky}>{data.userName}</TableCell>
                      {data.helperPerformance.map((item, itemIndex) => {
                        return (
                          <Fragment key={itemIndex}>
                            <TableCell>{Math.round(item.count)}</TableCell>
                            <TableCell>{Math.round(item.priceNoPoint)}</TableCell>
                            <TableCell>{Math.round(item.designateCount)}</TableCell>
                            <TableCell>{Math.round(item.point)}</TableCell>
                          </Fragment>
                        )
                      })}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
      </Card>
    </div>
  )
}

Results.propTypes = {
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
