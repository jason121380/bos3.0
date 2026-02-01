import { css } from '@emotion/react'
import { theme } from '../../../theme'

export default {
  root: css({}),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidtcssh: 700,
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
}
