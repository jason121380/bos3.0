import { createTheme } from '@mui/material/styles'
import { css } from '@emotion/react'
const theme = createTheme({
  overrides: {
    MuiTableCell: {
      root: {
        padding: '5px 10px',
      },
    },
  },
})

export default {
  root: css({}),
  filterButton: css({
    marginRight: theme.spacing(2),
  }),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 2000,
  }),
  actions: css({
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  }),
  font: css({
    fontWeight: 'bold',
    color: 'rgb(var(--accent))',
  }),
  gap: css({
    padding: '10px 0px',
  }),
  tableRoot: css({
    padding: '5px 10px',
  }),
  th: css({
    padding: theme.spacing(0),
  }),
  td: css({
    padding: theme.spacing(0),
  }),
  spaces: css({
    padding: theme.spacing(2),
  }),
  width: css({
    width: '13rem',
  }),
  thWidth: css({
    width: 0,
  }),
  sticky: css({
    position: 'sticky',
    top: 0,
    left: 0,
    background: 'white',
    zIndex: '99',
    wordBreak: 'break-all',
    minWidth: '50px',
    maxWidth: '50px'
  }),
  sticky2: css({
    position: 'sticky',
    top: 0,
    left: 50,
    background: 'white',
    zIndex: '99',
    paddingRight: '20px !important'
  }),
  stickyRow: css({
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: '100',
    outline: '1px solid rgb(var(--border))',
  })
}