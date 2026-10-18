/** @jsxImportSource @emotion/react */
import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RedoIcon from '@mui/icons-material/Redo'
import UndoIcon from '@mui/icons-material/Undo'
import { css } from '@emotion/react'
import AdminPageHeader from 'components/AdminPageHeader'

const styles = {
  button: css({
    borderRadius: '24px !important',
    padding: '6px 24px !important',
    fontSize: '14px !important',
    fontWeight: 'bold !important',
    boxShadow: 'none !important',
    marginLeft: '10px !important',
    textTransform: 'none !important',
    border: 'none !important',
  }),
  primaryButton: css({
    backgroundColor: 'rgb(var(--accent)) !important',
    color: '#FFFFFF !important',
    '&:hover': {
      backgroundColor: '#1557b0 !important',
    },
    '&:disabled': {
      backgroundColor: 'rgba(0, 0, 0, 0.12) !important',
      color: 'rgba(0, 0, 0, 0.26) !important',
    }
  }),
  secondaryButton: css({
    backgroundColor: 'rgb(var(--background)) !important',
    color: 'rgb(var(--text-secondary)) !important',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.05) !important',
    '&:hover': {
      backgroundColor: 'rgb(var(--surface)) !important',
    },
    '&:disabled': {
      backgroundColor: 'rgb(var(--background)) !important',
      color: 'rgba(0, 0, 0, 0.26) !important',
      opacity: 0.6,
    }
  }),
  btnGroup: css({
    display: 'flex',
    alignItems: 'center',
  })
}

function Header({
  handleAddScheduleCard,
  handleUndoScheduleCard,
  handleRedoScheduleCard,
  disableButton,
  disableButtonUndo,
  disableButtonRedo,
  undoActive
}) {
  const merchantName = JSON.parse(localStorage.getItem('userMerchant')).name

  return (
    <AdminPageHeader
      title="排班表"
    >
      <div css={styles.btnGroup}>
        {undoActive && (
          <>
            <Button
              variant="contained"
              onClick={handleUndoScheduleCard}
              css={[styles.button, styles.secondaryButton]}
              disabled={disableButton || disableButtonUndo}
            >
              復原
            </Button>
            <Button
              variant="contained"
              onClick={handleRedoScheduleCard}
              css={[styles.button, styles.secondaryButton]}
              disabled={disableButton || disableButtonRedo}
            >
              重做
            </Button>
          </>
        )}
        <Button
          variant="contained"
          onClick={handleAddScheduleCard}
          css={[styles.button, styles.primaryButton]}
          disabled={disableButton}
        >
          新增
        </Button>
      </div>
    </AdminPageHeader>
  )
}

export default Header
