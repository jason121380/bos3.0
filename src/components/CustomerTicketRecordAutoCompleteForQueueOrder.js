/** @jsxImportSource @emotion/react */
import { CircularProgress } from 'ui/display-compat'
import { TextField } from 'ui/text-field'
import useFetchTicketRecords from 'hooks/useFetchTicketRecords'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import React from 'react'
import { Autocomplete } from 'ui/combobox'

export default function CustomerTicketRecordAutoComplete({
  className,
  onChange = () => {},
  label = '',
  value,
  couponUsages = [],
  customerId,
  inputProps = {
    'data-testid': '',
  },
}) {
  const ticketsRecordToggle = useToggle()
  const [ticketRecordKeyword, setTicketRecordKeyword] = React.useState('')
  const ticketRecord = useFetchTicketRecords({
    keyword: ticketRecordKeyword,
    customerId: customerId,
    pageOffset: 0,
    pageLimit: 1000,
  })
  const options = idx(ticketRecord, _ => _.data.ticketRecords.data) || []
  const activeIDs = couponUsages.map(d => d.customerTicketId)
  const selectedValue =
    idx(ticketRecord, _ => _.data.ticketRecords.data.find(d => d.id === value)) || null

  return (
    <Autocomplete
      disableClearable
      open={ticketsRecordToggle.open}
      onOpen={ticketsRecordToggle.toggle}
      onClose={ticketsRecordToggle.toggle}
      css={className}
      value={selectedValue}
      options={options}
      autoHighlight
      getOptionLabel={option => `${option.name} ${option.remark !== '' ? option.remark : ''}`}
      loading={ticketRecord.loading}
      onChange={(_event, value) => onChange(idx(value, _ => value))}
      filterOptions={currentOption => currentOption.filter(d => activeIDs.indexOf(d.id) === -1)}
      renderOption={(props, option) => (
        <div {...props} data-testid={`${inputProps['data-testid']}-${option.name}`} key={option.id}>
          {`${option.name} ${option.remark !== '' ? option.remark : ''}`}
        </div>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          fullWidth
          onChange={event => setTicketRecordKeyword(idx(event, _ => _.target.value))}
          variant="outlined"
          value={ticketRecordKeyword}
          InputProps={{
            ...params.InputProps,
            ...inputProps,
            endAdornment: (
              <React.Fragment>
                {ticketRecord.loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  )
}
