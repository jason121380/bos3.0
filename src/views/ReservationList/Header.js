/** @jsxImportSource @emotion/react */
import { Grid, Typography } from '@mui/material'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    marginBottom: theme.spacing(3),
  }),
}

function Header({ ...rest }) {
  return (
    <div {...rest} css={styles.root}>
      <Grid alignItems="flex-end" container justifyContent="space-between" spacing={3}>
        <Grid item>
          <Typography component="h2" gutterBottom variant="overline">
            Reservations
          </Typography>
          <Typography
            component="h1"
            variant="h3"
            onClick={() => {
              localStorage.clear()
            }}
          >
            預約記錄
          </Typography>
        </Grid>
      </Grid>
    </div>
  )
}

export default Header
