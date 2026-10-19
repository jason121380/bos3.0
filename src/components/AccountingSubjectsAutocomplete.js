import { TextField } from 'ui/text-field'
import idx from 'idx'
import React, { useState, useEffect, forwardRef } from 'react'
import useFetchAccountingSubjects from 'hooks/useFetchAccountingSubjects'
import { Autocomplete } from 'ui/combobox'

function AccountingSubjectsAutocomplete({
  onChange,
  onFocus,
  value,
  autoFocus,
  inoutType,
  ...otherProps
}, ref) {
  const [revenueSubjects, setRevenueSubjects] = useState([])
  const [expenditureSubjects, setExpenditureSubjects] = useState([])
  const getAccountingSubjects = useFetchAccountingSubjects()
  const options =
    idx(getAccountingSubjects, _ =>
      _.data.accountingSubjects.map(d => ({
        title: d.name,
        value: d.id,
        number: d.number,
        inoutType: d.inoutType,
        isUsing: d.isUsing
      }))
    ) || []

  useEffect(() => {
    if (!getAccountingSubjects.loading) {
      const revenueInit = []
      const expenditureInit = []
      idx(getAccountingSubjects, _ =>
        _.data.accountingSubjects.map(d => {
          if (d.isUsing === true) {
            if (d.inoutType === 'REVENUE') {
              revenueInit.push({
                title: d.name,
                value: d.id,
                number: d.number,
                inoutType: d.inoutType,
              })
            } else {
              expenditureInit.push({
                title: d.name,
                value: d.id,
                number: d.number,
                inoutType: d.inoutType,
              })
            }
          }
        })
      )
      setRevenueSubjects(revenueInit)
      setExpenditureSubjects(expenditureInit)
    }
  }, [getAccountingSubjects.loading])

  const seletedValue = idx(value, _value => options.find(d => d.title === _value.title)) || null
  return (
    <Autocomplete
      style={{ width: '-webkit-fill-available' }}
      {...otherProps}
      options={
        inoutType === 'REVENUE'
          ? revenueSubjects !== undefined && revenueSubjects
          : expenditureSubjects !== undefined && expenditureSubjects
      }
      value={seletedValue}
      getOptionLabel={option => `${option.number} ${option.title}`}
      onFocus={onFocus}
      renderInput={params => (
        <TextField inputRef={ref} {...params} label="科目" variant="outlined" fullWidth autoFocus={autoFocus} />
      )}
      onChange={onChange}
    />
  )
}
export default forwardRef(AccountingSubjectsAutocomplete)