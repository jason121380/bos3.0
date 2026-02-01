import { css } from '@emotion/react'
import { theme } from '../../../theme'

export default {
  root: css({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  }),
  container: css({
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr',
    },
  }),
  leftColumn: css({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  }),
  rightColumn: css({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  }),
  heading: css({
    fontSize: '15px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    '&::before': {
      content: '""',
      display: 'inline-block',
      width: '4px',
      height: '16px',
      backgroundColor: theme.palette.primary.main,
      marginRight: '8px',
      borderRadius: '2px',
    },
  }),
}
