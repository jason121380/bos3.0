import React from 'react'
import { Field, Input } from 'ui/input'

function Header({ remark, setRemark }) {
  return (
    <Field label="備註" htmlFor="salary-edit-remark" className="w-[350px]">
      <Input id="salary-edit-remark" value={!!remark ? remark : ''} onChange={event => setRemark(event.target.value)} />
    </Field>
  )
}

export default Header
