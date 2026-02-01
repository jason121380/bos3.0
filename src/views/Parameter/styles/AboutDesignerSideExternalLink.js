import { css } from '@emotion/react'

export default {
  header: css({
    '& .MuiCardHeader-action': {
      margin: 0
    }
  }),
  serviceInputGroup: css({
    display: 'flex',
    alignItems: 'center',
    gap: '15px 20px',
    flexWrap: 'wrap'
  }),
  icon: css({
    cursor: 'pointer',
    marginLeft: '50px',
  }),
  pointer: css({
    cursor: 'pointer'
  }),
  Button: css({
    color: '#fff',
    width: 200,
    padding: '8px 16px',
    position: 'relative',
    textTransform: 'none',
    wordBreak: 'break-all',
    '& svg.editIcon': {
      position: 'absolute',
      top: 0,
      right: 0,
      transform: 'translate(-10%, 10%)',
      display: 'none'
    },
    '&:hover > svg.editIcon': {
      display: 'block'
    },
    '& .svgWrap': {
      width: 25,
      height: 25,
      transform: 'translate(-50%, -50%)',
      borderRadius: '50%',
      background: '#bf3939',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      '& svg': {
        width: 20,
        height: 20,
      }
    }
  })
}
