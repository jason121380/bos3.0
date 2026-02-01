import { css } from '@emotion/react'
import { theme } from '../../../theme'
import { red } from '@mui/material/colors'

export default {
  card: css({
    marginTop: theme.spacing(2),
    position: 'fixed',
    bottom: '0px',
    zIndex: 1100,
    borderRadius: '0px',
    backgroundColor: '#FFFFFF',
  }),
  cardNoFixed: css({
    marginTop: theme.spacing(2),
    borderRadius: '12px',
  }),
  cardContent: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    [theme.breakpoints.down('sm')]: {
      padding: '12px 16px',
      flexWrap: 'wrap',
      gap: '8px',
    },
  }),
  price: css({
    padding: theme.spacing(1),
  }),
  actions: css({
    padding: theme.spacing(3),
  }),
  action: css({
    padding: theme.spacing(1),
  }),
  font: css({
    fontWeight: 'bold',
    color: '#4581df',
    padding: theme.spacing(1),
  }),
  checkoutBtn: css({
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    borderRadius: '10px',
    padding: '10px 20px',
    fontWeight: '600',
    '&:hover': {
      backgroundColor: '#0051D5',
    },
    marginRight: '10px !important',
  }),
  detailBtn: css({
    backgroundColor: '#FFFFFF',
    color: '#007AFF',
    border: '1px solid #007AFF',
    borderRadius: '10px',
    padding: '10px 20px',
    fontWeight: '600',
    '&:hover': {
      backgroundColor: 'rgba(0, 122, 255, 0.05)',
    },
    marginLeft: '10px !important',
  }),
  detailBtn2: css({
    backgroundColor: '#FFFFFF',
    color: '#007AFF',
    border: '1px solid #007AFF',
    borderRadius: '10px',
    padding: '10px 20px',
    fontWeight: '600',
    '&:hover': {
      backgroundColor: 'rgba(0, 122, 255, 0.05)',
    },
  }),
  pendingBtn: css({
    backgroundColor: '#8E8E93',
    color: '#FFFFFF',
    borderRadius: '10px',
    padding: '10px 20px',
    fontWeight: '600',
    '&:hover': {
      backgroundColor: '#636366',
    },
    marginRight: '10px !important',
    whiteSpace: 'nowrap'
  }),
  heading: css({
    fontSize: '15px !important',
    fontWeight: theme.typography.fontWeightRegular,
  }),
  switchDiv: css({
    display: 'flex',
    alignItems: 'center',
    margin: '10px 0 0 10px',
    cursor: 'pointer'
  }),
}