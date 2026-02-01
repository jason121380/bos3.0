/** @jsxImportSource @emotion/react */
import { Button, Drawer, Grid, Hidden, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'
import { theme } from '../theme'

const styles = {
  root: css({
    padding: theme.spacing(2),
  }),
  actions: css({
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  }),
  buttonIcon: css({
    marginRight: theme.spacing(1),
  }),
}

function TableCheckoutBar({
  selected = [],
  className,
  onMarkPaid,
  onMarkUnpaid,
  onDelete,
  checkoutProcessing,
  ...rest
}) {
  const open = selected.length > 0
  return (
    <Drawer anchor="bottom" open={open} PaperProps={{ elevation: 1 }} variant="persistent">
      <div {...rest} css={css([styles.root, className])}>
        <Grid alignItems="center" container spacing={2}>
          <Hidden smDown>
            <Grid item md={3}>
              <Typography color="textSecondary" variant="subtitle1">
                {selected.length} selected
              </Typography>
            </Grid>
          </Hidden>
          <Grid item md={6} xs={12}>
            <div css={styles.actions}>
              <Button
                onClick={onMarkPaid}
                disabled={checkoutProcessing}
                style={{ color: 'white', backgroundColor: 'red' }}
                variant="contained"
              >
                <CheckIcon css={styles.buttonIcon} />
                {checkoutProcessing ? '結帳中...' : '結帳'}
              </Button>
            </div>
          </Grid>
        </Grid>
      </div>
    </Drawer>
  )
}

TableCheckoutBar.propTypes = {
  className: PropTypes.object,
  onDelete: PropTypes.func,
  onMarkPaid: PropTypes.func,
  onMarkUnpaid: PropTypes.func,
  selected: PropTypes.array.isRequired,
}

export default TableCheckoutBar
