/** @jsxImportSource @emotion/react */
import { Grid } from '@mui/material'
import CustomerInfo from './CustomerInfo'

export default function General({ customer, className = {}, isLoading, bookingCusCheck, ...rest }) {
  if (!customer) {
    return null
  }
  return (
    <Grid {...rest} css={className} container spacing={3}>
      <Grid item lg={6} md={6} xl={4} xs={12}>
        <CustomerInfo bookingCusCheck={bookingCusCheck} customer={customer} isLoading={isLoading}/>
      </Grid>
      <Grid item lg={4} md={6} xl={3} xs={12}>
        {/* <OtherActions /> */}
      </Grid>
    </Grid>
  )
}
