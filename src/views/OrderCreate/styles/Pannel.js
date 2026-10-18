import { css } from '@emotion/react'
import { theme } from '../../../theme'

export default {
  root: css({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: 0,
    overflow: 'hidden',
  }),
  container: css({
    display: 'grid',
    gridTemplateColumns: '1fr 420px',
    gap: '12px',
    overflow: 'hidden',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr',
    },
  }),
  leftColumn: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minWidth: 0,
  }),
  rightColumn: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minWidth: 0,
    overflow: 'hidden',
  }),
  heading: css({
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'rgb(var(--text))',
    display: 'flex',
    alignItems: 'center',
  }),
}
