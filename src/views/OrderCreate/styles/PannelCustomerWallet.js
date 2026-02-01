import { css } from '@emotion/react'
import { theme } from '../../../theme'

export default {
  payment: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(3),
  }),
  field: css({
    width: '120px',
    display: 'flex',
    justifyContent: 'flex-start',
  }),
  checkbox: css({
    width: '100px',
    display: 'flex',
    marginRight: '12px',
    '&:last-child': {
      marginRight: '0px',
    },
  }),
  action: css({
    width: '50px',
    display: 'flex',
    marginRight: '12px',
    cursor: 'pointer',
    '&:last-child': {
      marginRight: '0px',
    },
  }),
  walletDiv: css({
    display: 'flex',
    flexDirection: 'column',
  }),
  walletDiv2: css({
    display: 'flex',
  }),
}
