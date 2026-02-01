export default {
  styleOverrides: {
    root: {
      '& .MuiDayCalendar-weekDayLabel': {
        fontSize: 12,
        margin: '0px 2px'
      },
      '& .MuiDayCalendar-weekContainer': {
        '& .MuiPickersDay-root': {
          fontSize: 12,
          margin: '0px 2px',
          '&.Mui-selected': {
            backgroundColor: '#8E8E93 !important',
            color: '#fff !important',
            '&:hover': {
              backgroundColor: '#636366 !important',
            }
          },
          '&.MuiPickersDay-today': {
            borderColor: '#8E8E93 !important',
          }
        }
      },
      '& .MuiPickersDay-root': {
        borderRadius: '50%'
      }
    },
  }
}
