/** @jsxImportSource @emotion/react */
import { Grid } from 'ui/grid-compat'
import { Button } from 'ui/button-compat'
import { Dialog, DialogTitle, DialogContent, ThemeProvider, Divider, Typography } from '@mui/material'
import { Button as UiButton } from 'ui/button'
import { LoaderCircle } from 'lucide-react'
import { Close as CloseIcon } from 'ui/icons'
import { useEffect } from 'react';
import { css } from '@emotion/react'
import { green } from 'ui/colors';
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
        <UiButton variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="關閉" title="關閉" onClick={handleOnClose}>
          <CloseIcon />
        </UiButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        {isLoading ? (
          <Grid container item ><LoaderCircle className="m-auto h-10 w-10 animate-spin text-accent" strokeWidth={1.75} /></Grid>
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