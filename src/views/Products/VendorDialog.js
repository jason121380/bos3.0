/** @jsxImportSource @emotion/react */
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete,
  TextField
} from '@mui/material'

const VendorDialog = ({
  open, handleClosePublishDialog, isClick, option, setMerchantVendorId,
  merchantVendorId, handleSetVendor
}) => {
  return (
    <Dialog open={open}>
      <DialogTitle id="alert-dialog-title">編輯廠商</DialogTitle>
      <DialogContent style={{ overflow: 'visible' }}>
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
              label="選擇廠商"
              variant="outlined"
              fullWidth
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password',
              }}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button disabled={isClick} variant='contained' onClick={handleClosePublishDialog} color="primary">
          取消
        </Button>
        <Button disabled={isClick || !merchantVendorId} variant='contained' onClick={handleSetVendor} color="primary" autoFocus data-testid="confirm">
          確認
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default VendorDialog