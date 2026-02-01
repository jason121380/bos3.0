import { css } from '@emotion/react'
import { theme } from '../../theme'

export default {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }),
  cardContent: css({
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }),
  Avatar: css({
    width: 100,
    height: 100
  })
}