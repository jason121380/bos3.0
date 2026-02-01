import { createTheme } from "@mui/material"
import palette from "../palette"
const theme = createTheme()

export default {
  styleOverrides: {
    root: {
      '& .MuiTabScrollButton-root': {
        display: 'inline-flex'
      },
      '& .MuiTab-root': {
        padding: '6px 12px',
        [theme.breakpoints.up('sm')]: {
          minWidth: '160px'
        }
      },
      '& button': {
        color: palette.text.secondary
      },
      '& button.Mui-selected': {
        color: 'black !important'
      }
    },
  }
}
