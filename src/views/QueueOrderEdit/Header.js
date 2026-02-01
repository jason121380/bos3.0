/** @jsxImportSource @emotion/react */
import { Grid, Button, TextField } from '@mui/material'
import PropTypes from 'prop-types'
import { useContext, useState } from 'react'
import billContext from 'context/keyInContext'
import FastCheckOrdersModal from 'components/FastCheckOrdersModal'
import PageTitle from 'components/PageTitle'
import produce from 'immer'
import { css } from '@emotion/react'

const styles = {
  input: css({
    marginLeft: 12,
    width: 100,
    '& input': {
      padding: '8px !important'
    }
  })
}

function Header() {
  const { bill, setBill, enable, serialNumberUsing } = useContext(billContext)
  const [openModal, setOpenModal] = useState(false)

  return (
    <div>
      <FastCheckOrdersModal date={bill.date} open={openModal} setOpenModal={setOpenModal}/>
      <Grid alignItems="flex-end" container justifyContent="space-between">
        <Grid item style={{ alignItems: 'center', display: 'flex', alignItems: 'flex-end' }}>
          <PageTitle  title={`重新開單 ${bill.no ? `(${bill.no})` : ''}`} subTitle='Order detail' />
          {serialNumberUsing && (
            <TextField
              disabled={!enable}
              css={styles.input}
              variant='outlined'
              label='流水號'
              InputLabelProps={{
                shrink: true,
              }}
              value={bill.serialNumber == null ? '' : bill.serialNumber}
              onChange={e => {
                const value = e.target.value === '' ? null : e.target.value
                setBill(
                  produce(draft => {
                    draft.serialNumber = value
                  })
                )
              }}
            />
          )}
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
