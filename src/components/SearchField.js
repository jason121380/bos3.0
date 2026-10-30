import { TextField, InputAdornment } from 'ui/text-field'
import { SearchRounded as SearchRoundedIcon, ClearRounded as ClearRoundedIcon } from 'ui/icons'

const SearchField = ({ value, onChange }) => {
  return (
    <TextField
      type="text"
      variant="standard"
      fullWidth
      size="small"
      placeholder="名稱/代號"
      value={value}
      onChange={e => {
        onChange(e.target.value)
      }}
      className="w-[200px] [&_input]:text-[16px] [&_input]:![padding:1px_0px_5px]"
      InputProps={{
        startAdornment: (
          <InputAdornment style={{ padding: 4 }} position="start">
            <SearchRoundedIcon style={{ marginLeft: -8 }} />
          </InputAdornment>
        ),
        endAdornment: <ClearRoundedIcon sx={{ cursor: 'pointer' }} onClick={() => onChange('')} />,
      }}
    />
  )
}

export default SearchField
