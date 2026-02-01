import { css } from '@emotion/react'
import { theme } from '../../../theme'

export default {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  aboutPayment: css({
    marginTop: theme.spacing(3),
  }),
  actions: css({
    marginTop: theme.spacing(3),
    display: 'flex',
    justifyContent: 'space-between',
  }),
  lastNextDiv: css({
    width: '260px',
    display: 'flex',
    justifyContent: 'space-between',
  }),
}
