export default {
  styleOverrides: {
    root: {
      backgroundColor: '#8E8E93 !important',
      color: '#fff',
      '& .MuiPickersToolbar-content .MuiDateTimePickerToolbar-dateContainer': {
        '& button': {
          display: 'flex',
          '& span': {
            color: 'rgba(255, 255, 255, 0.702)',
          },
          '& span.Mui-selected': {
            color: 'white !important'
          }
        }
      },
      '& .MuiPickersToolbar-content .MuiDateTimePickerToolbar-timeContainer': {
        '& button': {
          display: 'flex',
          '& span': {
            color: 'rgba(255, 255, 255, 0.702)'
          },
          '& span.Mui-selected': {
            color: 'white !important'
          }
        },
        '& .MuiDateTimePickerToolbar-timeDigitsContainer': {
          display: 'flex',
          alignItems: 'center',
          '& span': {
            fontSize: 30,
          }
        }
      },
      '& .MuiPickersToolbar-content': {
        marginTop: 8
      },
      '& .MuiDatePickerToolbar-title': {
        color: 'white'
      },
      '& span': {
        color: '#fff'
      }
    },
  }
}
