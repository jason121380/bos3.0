import { css } from '@emotion/react'

export default {
  root: css({}),
  content: css({
    padding: 0,
  }),
  stickyRow: css({
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: '100',
    outline: '1px solid #eeeeee',
  }),
}
