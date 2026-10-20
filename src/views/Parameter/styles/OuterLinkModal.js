import { css } from '@emotion/react'
import { theme } from 'theme'

const styles = {
  root: css({
    '& .MuiDialog-paper, .MuiDialogContent-root': {
      overflowY: 'visible'
    },
    '& .MuiTypography-root': {
      fontSize: 16
    },
    '& div.MuiDialogContent-root': {
      padding: '16px 24px'
    },
    '& .MuiDialogActions-root': {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0px 24px 16px',
      flexWrap: 'wrap',
      gap: 10
    },
    '& .MuiDialogActions-spacing > :not(:first-child)': {
      marginLeft: 0,
    },
    '& .MuiDialogTitle-root': {
      paddingTop: 8,
      paddingBottom: 0,
      '& .MuiTypography-root': {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }
  }),
  page: css({
    padding: theme.spacing(3),
  }),
  Content: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  }),
  ButtonGroup: ({
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  })
}

export { styles, theme }