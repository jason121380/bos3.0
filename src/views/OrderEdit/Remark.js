import { TextField } from 'ui/text-field'
import { Field } from 'ui/input'
import billContext from 'context/keyInContext'
import { useContext, memo } from 'react'
import { BillSourceField } from 'views/OrderShared/Remark'


function Remark() {
  const { bill, handleBillChange } = useContext(billContext)

  return (
    <div className="mb-6 flex min-w-0 max-w-full flex-wrap items-end justify-start gap-x-0 gap-y-[12px]">
      <Field label="備註" className="!mr-[12px] flex !w-[350px] max-w-[calc(100%-12px)] justify-start">
      <TextField
        fullWidth
        value={bill.remark ? bill.remark : ''}
        variant="outlined"
        placeholder="備註"
        inputProps={{
          'data-testid': 'remark',
        }}
        onChange={event => {
          handleBillChange({
            key: 'remark',
            value: event.target.value,
          })
        }}
      />
      </Field>
      <BillSourceField />
    </div>
  )
}

export default memo(Remark)
