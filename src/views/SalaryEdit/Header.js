import { TextField } from '@mui/material'
import React from 'react'

function Header({ remark, setRemark }) {
  return (
    <TextField
      style={{ width: 350 }}
      fullWidth
      value={!!remark ? remark : ''}
      variant='outlined'
      label="備註"
      onChange={event => setRemark(event.target.value)}
    />
  )
}

export default Header