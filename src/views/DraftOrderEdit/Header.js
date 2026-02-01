import { Grid, Typography, Button } from '@mui/material'
import PropTypes from 'prop-types'
import  { useContext, useState } from 'react'
import billContext from 'context/keyInContext'
import FastCheckOrdersModal from 'components/FastCheckOrdersModal'


function Header({ ...rest }) {
  const { orderNo, bill } = useContext(billContext)
  const [openModal, setOpenModal] = useState(false)

  return (
    <div {...rest}>
      <FastCheckOrdersModal date={bill.date} open={openModal} setOpenModal={setOpenModal}/>
      <Grid alignItems="flex-end" container justifyContent="space-between">
        <Grid item>
          <Typography component="h2" gutterBottom variant="overline">
            Pending Order detail
          </Typography>
          <Typography component="h3" variant="h3">
            掛單詳細 {orderNo && `(${orderNo})`}
          </Typography>
        </Grid>
        <Button onClick={() => setOpenModal(true)} variant='contained' color='primary'>帳單速查</Button>
      </Grid>
    </div>
  )
}

Header.propTypes = {
  className: PropTypes.string,
}

export default Header
