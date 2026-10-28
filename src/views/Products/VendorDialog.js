import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogBody, DialogFooter } from 'ui/dialog'
import { TextField } from 'ui/text-field'
import { Button } from 'ui/button'
import { Field } from 'ui/input'
import { Autocomplete } from 'ui/combobox'

const VendorDialog = ({
  open, handleClosePublishDialog, isClick, option, setMerchantVendorId,
  merchantVendorId, handleSetVendor
}) => {
  return (
    <Dialog open={open}>
      <DialogContent size="sm" hideClose aria-describedby={undefined}>
        <DialogHeader><DialogTitle id="alert-dialog-title">編輯廠商</DialogTitle></DialogHeader>
        <DialogBody style={{ overflow: 'visible' }}>
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
        </DialogBody>
        <DialogFooter>
          <Button disabled={isClick} variant="secondary" onClick={handleClosePublishDialog}>
            取消
          </Button>
          <Button disabled={isClick || !merchantVendorId} variant="primary" onClick={handleSetVendor} autoFocus data-testid="confirm">
            確認
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default VendorDialog
