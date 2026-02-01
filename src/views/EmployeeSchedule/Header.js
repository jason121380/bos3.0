/** @jsxImportSource @emotion/react */
import { Button, Grid, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RedoIcon from '@mui/icons-material/Redo'
import UndoIcon from '@mui/icons-material/Undo'
import { css } from '@emotion/react'

const styles = {
  addButton: css({
    color: '#202d50 !important',
    borderColor: '#202d50 !important',
    border: '1px solid #202d50',
    marginLeft: '10px !important',
    "&:hover":{
      backgroundColor: '#202d50',
      borderColor: '#202d50',
      color: 'white !important',
    }
  }),
  undoButton: css({
    color: 'white',
    backgroundColor: '#cb0529 !important',
    marginLeft: '10px',
    "&:hover":{
      backgroundColor: '#b00020 !important',
    }
  }),
  redoButton: css({
    color: 'white',
    backgroundColor: '#cb0529 !important',
    marginLeft: '10px',
    "&:hover":{
      backgroundColor: '#b00020 !important',
    },
    '&:disabled': {
      backgroundColor: 'rgb(0 0 0 / 12%) !important'
    }
  }),
  btn: {
    padding: '6px 16px',
    borderRadius: 4
  }
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
  const MerchantName = JSON.parse(localStorage.getItem('userMerchant')).name
  return (
    <div>
      <Grid
        container
        style={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          margin: '10px 0 20px 0',
        }}
      >
        <Grid item>
          <Typography component="h2" gutterBottom variant="overline">
            Employee Schedule
          </Typography>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Typography component="h3" variant="h3">
              排班表
            </Typography>
            <Typography variant="subtitle2">
              {'  —  ' + MerchantName}
            </Typography>
          </div>
        </Grid>

        <Grid item style={{ marginTop: '10px' }}>
          <Button
            variant="outlined"
            size="medium"
            onClick={handleAddScheduleCard}
            startIcon={<AddIcon />}
            css={styles.addButton}
            disabled={disableButton}
          >
            新增
          </Button>
          {undoActive && (
            <>
              <Button
                variant="contained"
                size="medium"
                color='error'
                startIcon={<UndoIcon />}
                onClick={handleUndoScheduleCard}
                css={styles.undoButton}
                disabled={disableButton || disableButtonUndo}
              >
                復原
              </Button>
              <Button
                variant="contained"
                size="medium"
                color='error'
                startIcon={<RedoIcon />}
                onClick={handleRedoScheduleCard}
                css={styles.redoButton}
                disabled={disableButton || disableButtonRedo}
              > 
                重做
              </Button>
            </>
          )}
        </Grid>
      </Grid>
    </div>
  )
}

export default Header
