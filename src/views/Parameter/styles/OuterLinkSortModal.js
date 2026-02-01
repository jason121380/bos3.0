import { css } from '@emotion/react'

export default {
  root: css({
    // maxHeight: '80vh',
    '& .MuiDialog-paper, .MuiDialogContent-root': {
      overflowY: 'visible'
    },
    '& .MuiTypography-root': {
      fontSize: 16
    },
    '& div.MuiDialogContent-root': {
      padding: '16px 24px'
    },
    '& .MuiDialogActions-root': {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0px 24px 16px',
      flexWrap: 'wrap',
      gap: 10
    },
    '& .MuiDialogTitle-root': {
      paddingBottom: 8
    }
  }),
  Button: css({
    color: '#fff',
    width: 200,
    padding: '8px 16px',
    position: 'relative',
    background: '#26a69a',
    borderRadius: '4px',
    textAlign: 'center',
    fontWeight: 500,
    lineHeight: '1.75',
    fontSize: '0.93rem',
    marginTop: 15,
    '&:first-child': {
      marginTop: 0
    },
    '& span': {
      wordBreak: 'break-all',
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
  }),
  btnWRap: css({
    display: 'flex',
    flexDirection: 'column'
  }),
  Content: css({
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '50vh',
    overflow: 'hidden',
    overflowY: 'scroll',
    margin: '0px 0px 15px 0'
  }),
  ButtonGroup: css({
    display: 'flex',
    marginLeft: 'auto',
    gap: 10,
    flexWrap: 'wrap',
  }),
  subTitle: css({
    fontSize: '8px',
    color: 'gray',
  }),
}