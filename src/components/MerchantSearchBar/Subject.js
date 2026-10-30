import { LoaderCircle } from 'lucide-react'
import { TextField } from 'ui/text-field'
import useFetchGetAccountingSubjects from 'hooks/useFetchGetAccountingSubjects'
import idx from 'idx'
import { useState, useEffect, Fragment } from 'react'
import findIndex from 'lodash/findIndex'
import { Autocomplete } from 'ui/combobox'

export default function Subject({ onChange, value, className = '' }) {
  const accountingSubjects = useFetchGetAccountingSubjects()
  const [options, setOptions] = useState([])
  useEffect(() => {
    if (!accountingSubjects.loading) {
      // 查詢失敗時 data 為 undefined：當成沒有科目，不讓整個報表頁拋錯（Jason 2026/10/22 fix all）
      const data = idx(accountingSubjects, _ => _.data.accountingSubjects) || []
      const arr = data.filter(({ name, isUsing }, index, arr) => {
        const objIdx = findIndex(arr, (data) => data.name === name)
        return objIdx === index && isUsing
      })
      setOptions(arr)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [accountingSubjects.loading])
  return (
    <Autocomplete
      freeSolo
      className={className}
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
                  <LoaderCircle className="h-5 w-5 animate-spin" strokeWidth={1.75} />
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
