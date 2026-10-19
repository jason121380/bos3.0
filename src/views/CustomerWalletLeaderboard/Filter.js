/** @jsxImportSource @emotion/react */
// 排序依據 Select（handler 讀 e.target.value）與設計師多選 Autocomplete 保留 MUI
import { TextField, Checkbox, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import useFetchUsersOrderableList from 'hooks/useFetchGetUserOrderableList'
import DateSelector from 'components/DateSelector'
import idx from 'idx'
import { Button } from 'ui/button'
import { css } from '@emotion/react'
import { Autocomplete } from 'ui/combobox'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

const styles = {
  container: css({
    margin: '24px 0 16px',
    gap: 10
  })
}

const accordance = [
  { label: '入金儲值', value: 'DEPOSIT' },
  { label: '入金使用', value: 'USE' },
]

const Filter = ({ dataChange, inputData, loading, handleSearch, rangeLimit }) => {
  const userOrderableList = useFetchUsersOrderableList()

  const filterOptions = (options, state) => {
    const keyWord = state.inputValue
    const newOptions = options.sort((a, b) => {
      return a.userNo - b.userNo
    })
    if (keyWord !== '' && keyWord.trim() !== '') {
      const filterData = newOptions.filter(data =>
        (data.userNo !== null && data.userNo !== '' && data.userNo.toLowerCase() === keyWord.toLowerCase()) ||
        (data.userNickName !== null && data.userNickName !== '' && data.userNickName.toLowerCase().includes(keyWord.toLowerCase())) ||
        (data.userName !== null && data.userName !== '' && data.userName.toLowerCase().includes(keyWord.toLowerCase()))
      )
      return filterData
    } else {
      return options
    }
  }

  return (
    <div className="flex flex-col gap-2.5 pb-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="w-full min-w-0 sm:w-auto sm:shrink-0">
          <DateSelector
            date={inputData.dateRange}
            dateChange={value => dataChange(value, 'dateRange')}
            attributes={['lastmonth', 'thismonth', 'startDate', 'endDate']}
            disabled={loading || userOrderableList.loading}
            rangelimit={rangeLimit}
          />
        </div>
        <div className="shrink-0">
          <FormControl
            disabled={loading || userOrderableList.loading}
            fullWidth variant='outlined'
            style={{ width: 120 }}
          >
            <InputLabel>排序依據</InputLabel>
            <Select
              value={inputData.orderType}
              label='排序依據'
              onChange={e => dataChange(e.target.value, 'orderType')}

            >
              {accordance.map(({ label, value }) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>
      <div className="flex items-end gap-2.5">
        <div className="min-w-0 flex-1">
          <Autocomplete
            multiple
            autoHighlight
            fullWidth
            options={!userOrderableList.loading ? idx(userOrderableList, _ => _.data.getUserOrderableList) : []}
            disableCloseOnSelect
            disabled={loading || userOrderableList.loading}
            getOptionLabel={option =>
              option.userNickName !== null && option.userNickName.trim() ? option.userNickName : option.userName
            }
            onChange={(e, value) => dataChange(value.map(({ userId }) => userId), 'designerIds')}
            filterOptions={filterOptions}
            renderOption={({ key, ...props }, option, { selected }) => (
              <li key={option.userId} {...props}>
                <Checkbox
                  style={{ color: 'rgb(var(--text))', marginRight: 8 }}
                  icon={icon}
                  checkedIcon={checkedIcon}
                  checked={selected}
                />
                {option.userNickName !== null && option.userNickName.trim() ? option.userNickName : option.userName}
                {option.userNo !== null && option.userNo.trim() ? ` - ${option.userNo}` : ''}
              </li>
            )}
            renderInput={params => (
              <TextField
                {...params}
                variant="outlined"
                label="設計師篩選"
                placeholder="選擇設計師"
              />
            )}
          />
        </div>
        <div className="w-fit">
          <Button
            variant='primary'
            onClick={handleSearch}
            disabled={loading || userOrderableList.loading}
          >搜尋</Button>
        </div>

      </div>
    </div>
  )
}

export default Filter