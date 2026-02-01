import { Grid, Typography } from '@mui/material'

function Header({ ...rest }) {
  return (
    <div {...rest}>
      <Grid container justifyContent="space-between" spacing={3}>
        <Grid item lg={6} xs={12}>
          <Typography component="h2" gutterBottom variant="overline">
            Designer Perform Detail
          </Typography>
          <Typography component="h1" gutterBottom variant="h3">
            設計師細項分析
          </Typography>
        </Grid>
      </Grid>
    </div>
  )
}
export default Header
