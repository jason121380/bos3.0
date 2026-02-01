import { css } from '@emotion/react'

export default {
  root: css({
    '& *': {
      boxSizing: 'border-box'
    },
  }),
  TableContainer: css({
    minHeight: '60vh',
    height: 'calc(100vh - 260px)',
    overflow: 'scroll',
    position: 'relative',
    '& > div': {
      display: 'flex'
    }
  }),
  title: css({
    padding: '2px 5px',
    fontWeight: 600,
    backgroundColor: '#08424c',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRight: '1px solid lightgray',
    fontSize: 14,
    height: 40,
  }),
  timeTitle: css({
    justifyContent: 'center'
  }),
  item: css({
    height: 70,
    borderTop: '1px solid lightgray'
  }),
  ndsTitle: css({
    // width: 100,
    borderRight: '1px solid lightgray',
  }),
  timeTitle: css({
    alignItems: 'center',
    width: 50,
    borderRight: '1px solid lightgray',
    justifyContent: 'center'
  }),
  ndsItem: css({
    height: 70,
    borderTop: '1px solid lightgray',
    borderRight: '1px solid lightgray',
    borderLeft: '1px solid lightgray',
    display: 'flex',
    justifyContent: 'flex-end'
  }),
  ndsWrap: css({
    width: 100,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  }),
  timeItem: css({
    height: 70,
    borderTop: '1px solid lightgray',
    borderRight: '1px solid lightgray',
    textAlign: 'center',
    lineHeight: '80px',
    fontSize: 14
  }),
  timeWrap: css({
    width: 50,
    flexShrink: 0
  }),
  desWrap: css({
    minWidth: 100,
    position: 'relative',
    flexShrink: 0
  }),
  orderItem: css({
    height: 70,
    borderTop: '1px solid lightgray',
    borderRight: '1px solid lightgray',
    display: 'flex',
    justifyContent: 'flex-end'
  }),
  limitItem: css({
    width: 100,
    color: '#8a8a8a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    overflow: 'hidden',
    flexDirection: 'column',
    cursor: 'pointer !important',
    borderLeft: '1px solid lightgray',
  }),
  calendarWrap: css({
    position: 'absolute',
    height: '100%',
    top: 0,
    left: 0,
    overflow: 'hidden',
    borderRight: '1px solid lightgray',
  }),
  clickWrap: css({
    display: 'flex',
    gap: 0,
    position: 'absolute',
    width: '100%'
    // '&:hover': {
    //   zIndex: 9
    // }
  }),
  clickItem: css({
    borderRadius: 15,
    cursor: 'pointer !important',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    fontSize: 14,
    color: '#fff',
    border: '3px solid white',
    overflow: 'hidden',
    zIndex: 3,
    // '&:hover': {
    //   zIndex: 3
    // },
    '& span': {
      padding: '0px 4px',
      wordBreak: 'break-all'
    }
  }),
  holiday: css({
    background: '#ffa9a9'
  }),
  tableBody: css({
    position: 'relative',
    width: 'fit-content',
    borderBottom: '1px solid lightgray'
  }),
  tableHead: css({
    position: 'sticky', 
    top: 0,
    zIndex: 7,
    width: 'fit-content'
  })
}

