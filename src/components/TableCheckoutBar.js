/** @jsxImportSource @emotion/react */
import { Button } from 'ui/button'
import { Check as CheckIcon } from 'ui/icons'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'
import { theme } from '../theme'

const styles = {
  root: css({
    padding: theme.spacing(2),
  }),
  actions: css({
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  }),
}

function TableCheckoutBar({
  selected = [],
  className,
  onMarkPaid,
  onMarkUnpaid,
  onDelete,
  checkoutProcessing,
  ...rest
}) {
  const open = selected.length > 0
  return (
    // 批次結帳列（比照 TableEditBar，STYLE §5 浮層）：勾選後浮在畫面底部中央；與舊版 persistent Drawer 相同，未勾選時仍在 DOM（隱藏）
    <div hidden={!open} className={`ui-root noprint pointer-events-none fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-[1200] lg:bottom-6 justify-center px-4 ${open ? 'flex' : 'hidden'}`}>
      <div
        {...rest}
        css={css([styles.root, className])}
        className="pointer-events-auto flex max-w-full flex-wrap items-center gap-3 rounded-lg border border-solid border-border bg-background shadow-float"
      >
        {/* 原 Hidden smDown：600px 以下不顯示勾選筆數 */}
        <div className="text-body font-medium text-text-secondary max-[599.95px]:hidden">
          {selected.length} selected
        </div>
        <div css={styles.actions}>
          <Button
            onClick={onMarkPaid}
            disabled={checkoutProcessing}
            variant="primary"
          >
            <CheckIcon />
            {checkoutProcessing ? '結帳中...' : '結帳'}
          </Button>
        </div>
      </div>
    </div>
  )
}

TableCheckoutBar.propTypes = {
  className: PropTypes.object,
  onDelete: PropTypes.func,
  onMarkPaid: PropTypes.func,
  onMarkUnpaid: PropTypes.func,
  selected: PropTypes.array.isRequired,
}

export default TableCheckoutBar
