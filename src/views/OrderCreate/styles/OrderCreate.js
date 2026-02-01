import { css } from '@emotion/react'
import { theme } from '../../../theme'

export default {
  root: css({
    padding: '0 24px 24px 24px',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
  }),
}
