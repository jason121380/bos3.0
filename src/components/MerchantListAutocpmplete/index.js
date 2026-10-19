/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import { Button as MuiButton, Autocomplete, TextField, InputAdornment } from '@mui/material'
import { Button } from 'ui/button'
import useFetchGetUserMerchant from 'hooks/useFetchGetUserMerchant'
import MerchantsListModal from './MerchantsListModal'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../../theme'

const styles = {
  root: css({
    '& input': {
      cursor: 'pointer'
    }
  })
}

const index = ({ onValueChange = () => { } }) => {
  const userMerchants = useFetchGetUserMerchant()
  const merchantList = !userMerchants.loading ? JSON.parse(userMerchants.data.getUserMerchant) : {}
  const [values, setValues] = useState([])
  const [open, setOpen] = useState(false)

  const handleSelectAll = () => {
    setValues(merchantList.allMerchants)
  }

  const handleOnClick = ({ target }) => {
    if (target.tagName === 'path') return
    if (target.tagName === 'INPUT' || target.getAttribute('class').includes('MuiInputBase-root')) setOpen(true)
  }

  useEffect(() => {
    const ids = values.map(d => d.id)
    onValueChange(ids)
  }, [values])

  return (
    <ThemeProvider theme={theme}>
      <div id='openModal' style={{ width: '100%', display: 'flex', gap: 10, alignItems: 'center' }}>
        <Autocomplete
          css={styles.root}
          multiple
          fullWidth
          disabled={!merchantList}
          open={false}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          popupIcon={
            <MuiButton component='div' onClick={handleSelectAll} variant="contained" color="primary" size="small">全選</MuiButton>
          }
          value={values}
          onChange={(e, v) => {
            setValues(v)
          }}
          options={merchantList.allMerchants || []}
          disableCloseOnSelect
          getOptionLabel={option => option.name}
          renderOption={(props, option) => (
            <li {...props}>
              {option.name}
            </li>
          )}
          renderInput={params => (
            <TextField
              onClick={handleOnClick}
              {...params}
              focused={false}
              variant="outlined"
              label="加入店家"
              placeholder="店家名稱"
              onFocus={el => el.target.blur()}
              InputProps={{
                ...params.InputProps,
              }}
            />
          )}
        />
        <Button onClick={() => setOpen(true)} style={{ whiteSpace: 'nowrap', height: 'fit-content' }} variant="primary">選擇店家</Button>
      </div>
      {!userMerchants.loading &&
        <MerchantsListModal
          open={open}
          setOpen={setOpen}
          merchantList={merchantList}
          values={values}
          setValues={setValues}
        />
      }
    </ThemeProvider>
  )
}

index.propTypes = {
  onValueChange: PropTypes.func
}

export default index