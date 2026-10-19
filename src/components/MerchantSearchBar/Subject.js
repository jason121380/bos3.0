/** @jsxImportSource @emotion/react */
import { TextField } from 'ui/text-field'
import { MenuItem, Select, CircularProgress } from '@mui/material'
import useFetchGetAccountingSubjects from 'hooks/useFetchGetAccountingSubjects'
import idx from 'idx'
import { useState, useEffect, Fragment } from 'react'
import { findIndex } from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Autocomplete } from 'ui/combobox'

const styles = {
  root: css({
    width: 200
  }),
  container: css({
    display: 'flex',
    alignItems: 'center',
  }),
  calendar: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  }),
  calendarButton: css({
    backgroundColor: theme.palette.common.white,
  }),
  field: css({
    width: '195px !important',
    marginLeft: '34px',
  }),
}

export default function Subject({ onChange, value, className }) {
  const accountingSubjects = useFetchGetAccountingSubjects()
  const [options, setOptions] = useState([])
  useEffect(() => {
    if (!accountingSubjects.loading) {
      const data = idx(accountingSubjects, _ => _.data.accountingSubjects)
      const arr = data.filter(({ name, isUsing }, index, arr) => {
        const objIdx = findIndex(arr, (data) => data.name === name)
        return objIdx === index && isUsing
      })
      setOptions(arr)
    }
  }, [accountingSubjects.loading])
  return (
    <Autocomplete
      freeSolo
      css={className}
      onChange={onChange}
      options={options}
      value={options.find(({ name }) => name === value)}
      autoHighlight
      getOptionLabel={option => option?.name || ''}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          {option?.name || ''}
        </li>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label="選擇科目"
          fullWidth
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <Fragment>
                {accountingSubjects.loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </Fragment>
            ),
          }}
        />
      )}
    />
  )
}
