import { ToggleButtonGroup, ToggleButton } from '@mui/material'
import PropTypes from 'prop-types'

function ReferToggleButton({ value, onChange, disabled = false }) {
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={value}
      onChange={(e, v) => onChange(v)}
    >
      <ToggleButton disabled={disabled} value='FAKE'>虛業績</ToggleButton>
      <ToggleButton disabled={disabled} value='TRUTH'>實業績</ToggleButton>
    </ToggleButtonGroup>
  )
}

ReferToggleButton.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export default ReferToggleButton