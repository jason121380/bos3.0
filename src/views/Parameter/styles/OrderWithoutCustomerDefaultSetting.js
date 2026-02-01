import { css } from '@emotion/react'

export default {
  serviceInputGroup: css({
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
  }),
  bookingInputGroup: css({
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '24px',
  }),
  orderLimitGroup: css({
    display: 'flex',
    flexDirection: 'row',
    marginBottom: '24px',
    marginTop: 36,
    alignItems: 'flex-start',
    '& .MuiTextField-root': {
      width: 80,
      margin: '0px 6px',
      '& .MuiInputBase-root': {
        height: 50,
        '& input': {
          textAlign: 'center'
        }
      }
    }
  }),
  bookingInput: css({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    rowGap: '10px'
  }),
  isUsing: css({
    margin: '0px 20px',
  }),
  selectWidth: css({
    width: '150px',
  }),
  phoneTextfieldGroup: css({
    width: '200px',
    minWidth: '200px',
    margin: '15px 0',
    display: 'flex',
    alignItems: 'center',
  }),
  phoneTextfield: css({
    width: '120px',
  }),
  field: css({
    width: '150px',
    display: 'flex',
    margin: '0',
  }),
  timeWrap: css({
    display: 'flex',
    alignItems: 'center'
  })
}
