import { css } from '@emotion/react'

export default {
  serviceInputGroup: css({
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
  }),
  isUsing: css({
    margin: '0px 20px',
  }),
  field: css({
    width: '200px',
    display: 'flex',
    margin: '0px 20px 24px 20px',
  }),
  field2: css({
    width: '150px',
    display: 'flex',
    margin: '0px 20px',
  }),
  qrcode: css({
    padding: '0px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexGrow: 1,
    width: '100%',
    flexWrap: 'wrap',
    marginBottom: 12,
    '& .MuiTextField-root': {
      flexGrow: '1',
      '& .MuiInputBase-root': {
        minWidth: 150,
        '& .MuiInputBase-input': {
          padding: 8
        },
      },
    },
    '& button': {
      wordBreak: 'keep-all',
      width: 'fit-content',
      flexShrink: 0
    }
  }),
  logoInputGroup: css({
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '32px',
    marginLeft: '20px',
    gap: 10
  })
}