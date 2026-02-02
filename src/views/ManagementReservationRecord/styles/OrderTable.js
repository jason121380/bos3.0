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
    borderRadius: '16px !important',
    boxShadow: 'none !important',
    border: '1px solid #f0f0f0 !important',
    '& > div': {
      display: 'flex'
    }
  }),
  title: css({
    padding: '12px 16px',
    wordBreak: 'break-all',
    fontWeight: '800',
    backgroundColor: '#f8f9fa', // Light gray background
    color: '#202D50', // Dark gray text
    minHeight: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRight: '1px solid #d0d7de',
    fontSize: '14px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  }),
  timeTitle: css({
    width: 60,
  }),
  item: css({
    height: 70,
    borderTop: '1px solid #f0f0f0'
  }),
  ndsTitle: css({
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
  }),
  ndsItem: css({
    borderTop: '1px solid #f0f0f0',
    borderRight: '1px solid #f0f0f0',
    borderLeft: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: '#fafafa',
  }),
  ndsWrap: css({
    width: 100,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  }),
  timeItem: css({
    borderTop: '1px solid #f0f0f0',
    borderRight: '1px solid #f0f0f0',
    textAlign: 'center',
    alignContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#202D50',
    backgroundColor: '#f8f9fa',
  }),
  timeWrap: css({
    width: 60,
    flexShrink: 0
  }),
  desWrap: css({
    position: 'relative',
    flexShrink: 0
  }),
  orderItem: css({
    borderTop: '1px solid #f0f0f0',
    borderRight: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'flex-end'
  }),
  limitItem: css({
    width: '100%',
    color: '#999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    overflow: 'hidden',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(26, 115, 232, 0.1) !important',
    },
    '& .capacity-label': {
      fontSize: '10px',
      color: '#bbb',
      marginBottom: '2px',
    },
    '& .capacity-value': {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#1A73E8',
    }
  }),
  calendarWrap: css({
    position: 'absolute',
    height: '100%',
    top: 0,
    left: 0,
    overflow: 'hidden',
    borderRight: '1px solid #f0f0f0',
  }),
  clickWrap: css({
    display: 'flex',
    gap: 0,
    position: 'absolute',
    width: '100%'
  }),
  clickItem: css({
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#fff',
    border: '2px solid white',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'transform 0.1s ease',
    '&:hover': {
      zIndex: 10,
      transform: 'scale(1.02)',
    },
    '& span': {
      padding: '0px 8px',
      wordBreak: 'break-all',
      textAlign: 'center'
    }
  }),
  holiday: css({
    background: '#ffebee !important',
    '& .capacity-value': {
      color: '#f44336 !important',
    }
  }),
  tableBody: css({
    position: 'relative',
    width: 'fit-content',
    borderBottom: '1px solid #f0f0f0'
  }),
  tableHead: css({
    position: 'sticky',
    top: 0,
    zIndex: 10,
    width: 'fit-content',
    borderBottom: '1px solid #f0f0f0',
  })
}
