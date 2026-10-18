import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import PropTypes from 'prop-types'

function ReferToggleButton({ value, onChange, disabled = false }) {
  return (
    <ToggleGroup
      size="small"
      exclusive
      value={value}
      onChange={(e, v) => onChange(v)}
    >
      <ToggleGroupItem disabled={disabled} value='FAKE'>虛業績</ToggleGroupItem>
      <ToggleGroupItem disabled={disabled} value='TRUTH'>實業績</ToggleGroupItem>
    </ToggleGroup>
  )
}

ReferToggleButton.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export default ReferToggleButton