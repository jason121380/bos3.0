// MUI Dialog 保留：內含 MUI Autocomplete（Radix Dialog 會擋住其彈出層）
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete,
  TextField
} from '@mui/material'
import { Button } from 'ui/button'
import { Field } from 'ui/input'

const VendorDialog = ({
  open, handleClosePublishDialog, isClick, option, setMerchantVendorId,
  merchantVendorId, handleSetVendor
}) => {
  return (
    <Dialog open={open}>
      <DialogTitle id="alert-dialog-title">編輯廠商</DialogTitle>
      <DialogContent style={{ overflow: 'visible' }}>
        <Field label="選擇廠商">
          <Autocomplete
            style={{ width: 250 }}
            options={option}
            autoHighlight
            value={option.find(d => d.uuid === merchantVendorId) || null}
            onChange={(e, v) => setMerchantVendorId(v ? v.uuid : '')}
            getOptionLabel={option => {
              return `${option.no === '' ? '(無代號)' : `${option.no}`} ${option.nickname === "" ? option.name : option.nickname}`
            }
            }
            renderOption={(props, option) => (
              <li {...props} key={option.uuid}>
                {`${option.no === '' ? '(無代號)' : `${option.no}`} ${option.nickname === "" ? option.name : option.nickname}`}
              </li>
            )}
            filterOptions={(options, { inputValue }) => {
              const newOptions = options.filter(d => {
                return (d.no.includes(inputValue) || d.name.includes(inputValue) || d.nickname.includes(inputValue))
              })
              return newOptions
            }}
            renderInput={params => (
              <TextField
                {...params}
                variant="outlined"
                fullWidth
                inputProps={{
                  ...params.inputProps,
                  autoComplete: 'new-password',
                }}
              />
            )}
          />
        </Field>
      </DialogContent>
      <DialogActions>
        <Button disabled={isClick} variant="secondary" onClick={handleClosePublishDialog}>
          取消
        </Button>
        <Button disabled={isClick || !merchantVendorId} variant="primary" onClick={handleSetVendor} autoFocus data-testid="confirm">
          確認
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default VendorDialog