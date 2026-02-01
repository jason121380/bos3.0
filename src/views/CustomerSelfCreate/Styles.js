import { css } from '@emotion/react'
import { theme } from '../../theme'

export default {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    '& input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active': {
      'WebkitBoxShadow': '0 0 0 60px #ffffff inset !important',
      'backgroundColor': '#fafafa !important',
      'backgroundClip': 'content-box !important'
    },
    '& .MuiOutlinedInput-input': {
      padding: '12px !important'
    },
    '& .MuiCardContent-root': {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    },
    '& .MuiCardContent-root, input, .MuiFormControlLabel-label': {
      fontSize: 16,
    },
    '& .MuiCardHeader-title': {
      fontSize: 20
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#3f51b5'
    },
    '& .MuiAlert-message': {
      fontSize: 16
    },
    '& .MuiOutlinedInput-input:-webkit-autofill': {
      caretColor: '#000',
      'WebkitTextFillColor': '#000'
    },
  }),
  status: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 200,
    '& svg': {
      fontSize: 100
    },
    '& .check': {
      color: '#66bb6a'
    },
    '& .close': {
      color: '#f44336'
    }
  }),
  label: css({
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    '& span': {
      color: 'red'
    }
  })
}