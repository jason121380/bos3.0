import { css } from '@emotion/react'
import { theme } from '../../../theme'

export default {
  details: css({
    overflowX: 'auto',
  }),
  heading: css({
    fontSize: '16px !important',
    fontWeight: 'bold',
    color: 'rgb(var(--text))',
    display: 'flex',
    alignItems: 'center',
  }),
  fieldOutter: css({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'column',
  }),
}
