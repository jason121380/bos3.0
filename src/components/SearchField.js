/** @jsxImportSource @emotion/react */
import { TextField, InputAdornment } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { css } from '@emotion/react'

const SearchField = ({ value, onChange }) => {
  return (
    <TextField
      type="text"
      variant="standard"
      fullWidth
      size="small"
      placeholder='名稱/代號'
      value={value}
      onChange={e => {
        onChange(e.target.value)
      }}
      css={css({
        width: 200,
        '& input': {
          fontSize: 16,
          padding: '1px 0px 5px !important'
        }
      })}
      InputProps={{
        startAdornment: (
          <InputAdornment style={{ padding: 4 }} position="start">
            <SearchRoundedIcon style={{ marginLeft: -8 }} />
          </InputAdornment>
        ),
        endAdornment: (
          <ClearRoundedIcon sx={{ cursor: 'pointer' }} onClick={() => onChange("")} />
        )
      }}
    />
  )
}

export default SearchField