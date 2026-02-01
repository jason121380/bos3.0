/** @jsxImportSource @emotion/react */
import {
  Dialog, DialogTitle, DialogContent, ThemeProvider,
  Divider, Button, IconButton, CircularProgress,
  Typography, Grid
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import { useEffect } from 'react';
import { css } from '@emotion/react'
import { green } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles'

import { getShortcutsForOrderCreate } from 'hooks/useFetchShortcut'

const theme = createTheme({
  palette: {
    primary: {
      main: green[600]
    }
  }
})

const styles = {
  title: css({
    padding: '8px 8px 8px 24px !important',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
}

const ShortcutDialog = ({ open, handleOnClose, handleShortcutChange }) => {
  const [getShortcutFunc, shortcutLazyData] = getShortcutsForOrderCreate()

  const isLoading = !shortcutLazyData.loading && shortcutLazyData.data ? false : true

  const shortcutData = !shortcutLazyData.loading && shortcutLazyData.data
    ? shortcutLazyData.data.shortcuts
    : []

  useEffect(() => {
    open && getShortcutFunc()
  }, [open])

  return (
    <Dialog fullWidth maxWidth='sm' open={open} onClose={handleOnClose} >
      <DialogTitle css={styles.title}>
        快捷組合
        <IconButton sx={{ padding: '8px !important' }} onClick={handleOnClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        {isLoading ? (
          <Grid container item ><CircularProgress sx={{ m: 'auto' }} /></Grid>
        ) : (
          <ThemeProvider theme={theme}>
            <Grid container item spacing={2}>
              {shortcutData.length ? shortcutData.map(d => (
                <Grid item key={d.id} >
                  <Button
                    color='primary'
                    variant='contained'
                    onClick={() => {
                      handleShortcutChange(d)
                      handleOnClose()
                    }}
                  >
                    {d.name}
                  </Button>
                </Grid>
              )) : (
                <Typography sx={{ m: '14px auto 0' }} variant="h4" component="div">無資料</Typography>
              )}
            </Grid>
          </ThemeProvider>
        )}

      </DialogContent>
    </Dialog>
  )
}

export default ShortcutDialog