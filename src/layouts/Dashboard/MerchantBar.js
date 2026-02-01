/** @jsxImportSource @emotion/react */
import { Dialog, DialogTitle, List, CircularProgress, DialogContent } from '@mui/material'
import PropTypes from 'prop-types'
import MerchantList from './MerchantList'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  dialog: css({
    '& .MuiPaper-root': {
      borderRadius: 16,
      width: '400px',
      maxWidth: '90vw',
      padding: '8px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    }
  }),
  root: css({
    padding: '0 !important',
  }),
  list: css({
    padding: 0,
  }),
  Circular: css({
    width: '100%',
    padding: '40px 0',
    textAlign: 'center'
  }),
  title: css({
    fontWeight: 700,
    fontSize: '20px',
    textAlign: 'center',
    padding: '16px 24px 8px 24px',
  })
}

function MerchantBar({ open, onClose, userMerchants }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      css={styles.dialog}
      scroll="paper"
    >
      <DialogTitle css={styles.title}>切換店家</DialogTitle>
      <DialogContent css={styles.root}>
        <List css={styles.list}>
          {!userMerchants.loading ? (
            <MerchantList
              merchants={JSON.parse(userMerchants.data.getUserMerchant)}
            />
          ) : (
            <div css={styles.Circular}>
              <CircularProgress />
            </div>
          )}
        </List>
      </DialogContent>
    </Dialog>
  )
}

MerchantBar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

export default MerchantBar
