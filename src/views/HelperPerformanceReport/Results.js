/** @jsxImportSource @emotion/react */
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Card } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

// 固定首欄（原 styles.sticky 寫死白底，改用 tokens）與群組右框線
const STICKY_COL = 'sticky left-0 top-0 z-[99] w-[200px] break-all bg-background'
const GROUP_END = 'border-r'

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
      <Card className="p-5">
        {/* HelperPerformanceReportTable：initialize.scss 的斑馬欄樣式掛鉤，保留 */}
        <Table dense className='HelperPerformanceReportTable min-w-[900px]'>
          <TableHeader className="sticky top-0 z-[100]">
            <TableRow className="hover:bg-transparent">
              <TableHead className={`${STICKY_COL} ${GROUP_END} bg-surface`}>設計師名稱</TableHead>
              <TableHead numeric>洗髮人數</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>洗髮指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>

              <TableHead numeric>剪髮人數</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>剪髮指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>

              <TableHead numeric>燙髮人數</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>燙髮指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>

              <TableHead numeric>染髮人數</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>染髮指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>

              <TableHead numeric>護髮人數</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>護髮指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>

              <TableHead numeric>頭皮理療人數</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>頭皮理療指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>

              <TableHead numeric>接髮人數</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>接髮指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>

              <TableHead numeric>造型人數</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>造型髮指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>

              <TableHead numeric>美容人數</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>美容指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>

              <TableHead numeric>美甲人數</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>美甲指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>

              <TableHead numeric>套餐人數</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>套餐指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>

              <TableHead numeric>髮券銷售人數</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>髮券銷售指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>

              <TableHead numeric>套餐銷售人數</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>套餐銷售指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>

              <TableHead numeric>洗護包套人數</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>洗護包套指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>

              <TableHead numeric>入金人數</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>入金指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>

              <TableHead numeric>外租收入人數</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>外租收入指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>

              <TableHead numeric>其他人數</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>其他指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>

              <TableHead numeric>店販</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>店販指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>

              {membershipDisplay && (
                <Fragment>
                  <TableHead numeric>會員卡</TableHead>
                  <TableHead numeric className={GROUP_END}>抽成元</TableHead>
                  <TableHead numeric>會員卡指定</TableHead>
                  <TableHead numeric className={GROUP_END}>抽成點</TableHead>
                </Fragment>
              )}

              <TableHead numeric>合計</TableHead>
              <TableHead numeric className={GROUP_END}>抽成元</TableHead>
              <TableHead numeric>合計指定</TableHead>
              <TableHead numeric className={GROUP_END}>抽成點</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {helperPerformanceData.map((data, index) =>
              <TableRow key={index}>
                <TableCell className={STICKY_COL}>{data.userName}</TableCell>
                {data.helperPerformance.map((item, itemIndex) => {
                  return (
                    <Fragment key={itemIndex}>
                      <TableCell numeric>{formatNumber(Math.round(item.count))}</TableCell>
                      <TableCell numeric>{formatNumber(Math.round(item.priceNoPoint))}</TableCell>
                      <TableCell numeric>{formatNumber(Math.round(item.designateCount))}</TableCell>
                      <TableCell numeric>{formatNumber(Math.round(item.point))}</TableCell>
                    </Fragment>
                  )
                })}
              </TableRow>
            )}
          </TableBody>
        </Table>
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
