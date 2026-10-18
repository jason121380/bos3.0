import { css } from '@emotion/react'
import { theme } from '../../../theme'

export default {
  payment: css({
    display: 'flex',
    flexWrap: 'wrap', // 窄螢幕時「訂單來源」換到下一列，不再被切掉
    gap: '12px 0',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(3),
  }),
  field: css({
    width: '350px !important',
    maxWidth: '100%',
    display: 'flex',
    marginRight: '12px',
    justifyContent: 'flex-start',
  }),
  field2: css({
    width: '200px !important',
    maxWidth: '100%',
    display: 'flex',
    marginRight: '12px',
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
}
