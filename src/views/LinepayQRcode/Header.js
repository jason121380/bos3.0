/** @jsxImportSource @emotion/react */
import { Grid } from 'ui/grid-compat'
import { Typography } from '@mui/material'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    marginBottom: theme.spacing(3),
  }),
}
function Header({ className, ...rest }) {
  return (
    <div {...rest} css={css([styles.root, className])}>
      <Grid alignItems="flex-end" container justifyContent="space-between" spacing={3}>
        <Grid item>
          <Typography component="h2" gutterBottom variant="overline">
            Reservations
          </Typography>
          <Typography component="h1" variant="h3">
            預約記錄
          </Typography>
        </Grid>
      </Grid>
    </div>
  )
}

Header.propTypes = {
  className: PropTypes.object,
}

export default Header
