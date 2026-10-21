import { TextField, InputAdornment } from 'ui/text-field'
import { useState, useEffect } from 'react'
import { Button } from 'ui/button'
import useFetchGetUserMerchant from 'hooks/useFetchGetUserMerchant'
import MerchantsListModal from './MerchantsListModal'
import PropTypes from 'prop-types'
import { Autocomplete } from 'ui/combobox'

const MerchantListAutocpmplete = ({ onValueChange = () => { } }) => {
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
    <>
      <div id='openModal' style={{ width: '100%', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <Autocomplete
          className="min-w-0 flex-1 [&_input]:cursor-pointer"
          multiple
          fullWidth
          disabled={!merchantList}
          open={false}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          popupIcon={
            // 全選：ui Button primary sm（h-8，放在 36px 輸入框內不撐高）；
            // Autocomplete popupIndicator 本身是 <button>，故以 asChild 落在 div 上避免巢狀 button（原 MuiButton component='div' 的等效作法），onClick 原樣
            <Button asChild variant="primary" size="sm" onClick={handleSelectAll}><div>全選</div></Button>
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
        <Button onClick={() => setOpen(true)} variant="primary" className="shrink-0">選擇店家</Button>
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
    </>
  )
}

MerchantListAutocpmplete.propTypes = {
  onValueChange: PropTypes.func
}

export default MerchantListAutocpmplete