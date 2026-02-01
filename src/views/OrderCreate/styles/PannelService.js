import { css } from '@emotion/react'
import { theme } from '../../../theme'

export default {
  root: css({
    width: '100%',
    marginTop: theme.spacing(3),
  }),
  heading: css({
    fontSize: '15px !important',
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
  heading2: css({
    fontSize: theme.typography.pxToRem(13),
    fontWeight: theme.typography.fontWeightRegular,
    marginLeft: 10,
    fontWeight: 'bold',
  }),
  details: css({
    overflowX: 'auto',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  }),
  fieldOutter: css({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'column',
  }),
}
