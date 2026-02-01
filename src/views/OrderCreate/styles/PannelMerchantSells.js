import { css } from '@emotion/react'
import { theme } from '../../../theme'

export default {
  details: css({
    overflowX: 'auto',
  }),
  heading: css({
    fontSize: '15px !important',
    fontWeight: 'bold',
  }),
  fieldOutter: css({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'column',
  }),
}
