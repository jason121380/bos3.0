
export default {
  styleOverrides: {
    root: {
      minWidth: 180,
      '& .MuiAutocomplete-clearIndicator': {
        borderRadius: '50%',
        padding: 4
      },
      '& .MuiAutocomplete-popupIndicator:hover': {
        backgroundColor: 'transparent'
      },
      '& .MuiAutocomplete-endAdornment': {
        top: 0,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        '& button': {
          padding: '4px !important'
        }
      },
      '&.MuiAutocomplete-root .MuiInputBase-root': {
        padding: '0 !important', // Remove default padding to let input element handle all spacing
      },
      '&.MuiAutocomplete-root .MuiInputBase-root.MuiInputBase-sizeSmall': {
        padding: '0 !important', // Ensure small size has same padding as regular
      },
      '& .MuiChip-root': {
        backgroundColor: 'rgba(0, 0, 0, 0.08) !important',
        color: 'rgb(38, 50, 56) !important'
      }
    },
    popper: {
      '& [aria-selected="true"] span svg.MuiSvgIcon-root': {
        color: '#202D50'
      },
      '& .MuiAutocomplete-option': {
        fontSize: 14
      }
    }
  }
}
