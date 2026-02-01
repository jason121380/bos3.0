import palette from '../palette'

export default {
  styleOverrides: {
    root: {
      height: '42px',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'transparent',
      '&.MuiInputBase-multiline': {
        height: 'auto',
        minHeight: '42px',
      },
      '&.MuiInputBase-sizeSmall': {
        height: '42px',
      },
      borderRadius: 8 // Unified to 8px
    },
    input: {
      textAlign: 'left', // Left-aligned
      padding: '9px 14px 13px 14px !important', // Asymmetric padding for visual centering (compensate for font baseline)
      height: '42px !important',
      lineHeight: '20px !important', // Fixed line height for consistent text rendering
      boxSizing: 'border-box !important',
      '&::placeholder': {
        opacity: 1,
        color: palette.text.secondary,
        textAlign: 'left', // Placeholder left-aligned
      },
      '&.MuiInputBase-inputMultiline': {
        textAlign: 'left',
        padding: '10px 14px !important', // Slightly more padding for textarea
        height: 'auto !important',
        lineHeight: '1.5 !important',
      }
    }
  }
}
