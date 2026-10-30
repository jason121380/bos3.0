// 排序依據 Select（handler 讀 e.target.value）與設計師多選 Autocomplete 使用 ui/combobox
import { Checkbox } from 'ui/checkbox'
import { FormControl } from 'ui/form-control'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { TextField } from 'ui/text-field'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import useFetchUsersOrderableList from 'hooks/useFetchGetUserOrderableList'
import DateSelector from 'components/DateSelector'
import idx from 'idx'
import compareNo from 'utils/compareNo'
import { Button } from 'ui/button'
import { ReportToolbar } from 'ui/page-header'
import { Autocomplete } from 'ui/combobox'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

const accordance = [
  { label: '入金儲值', value: 'DEPOSIT' },
  { label: '入金使用', value: 'USE' },
]

const Filter = ({ dataChange, inputData, loading, handleSearch, rangeLimit }) => {
  const userOrderableList = useFetchUsersOrderableList()

  const filterOptions = (options, state) => {
    const keyWord = state.inputValue
    // 編號自然排序（英數編號也有效）、空編號排最後（原本 a.userNo - b.userNo 對英數編號得 NaN、空編號當 0 排最前；Jason 2026/10/22 fix all）
    const newOptions = [...options].sort((a, b) => compareNo(a.userNo, b.userNo))
    if (keyWord !== '' && keyWord.trim() !== '') {
      const filterData = newOptions.filter(data =>
        (data.userNo !== null && data.userNo !== '' && data.userNo.toLowerCase() === keyWord.toLowerCase()) ||
        (data.userNickName !== null && data.userNickName !== '' && data.userNickName.toLowerCase().includes(keyWord.toLowerCase())) ||
        (data.userName !== null && data.userName !== '' && data.userName.toLowerCase().includes(keyWord.toLowerCase()))
      )
      return filterData
    } else {
      return newOptions
    }
  }

  return (
    <ReportToolbar
      date={
        <DateSelector
          date={inputData.dateRange}
          dateChange={value => dataChange(value, 'dateRange')}
          attributes={['lastmonth', 'thismonth', 'startDate', 'endDate']}
          disabled={loading || userOrderableList.loading}
          rangelimit={rangeLimit}
        />
      }
      filters={
        <>
          <div className="shrink-0">
            <FormControl
              disabled={loading || userOrderableList.loading}
              fullWidth variant='outlined'
              style={{ width: 120 }}
            >
              <NativeSelect
                value={inputData.orderType}
                onChange={e => dataChange(e.target.value, 'orderType')}
                displayEmpty={false}
                placeholder="請選擇…"
                disabled={loading || userOrderableList.loading}
                label="排序依據"

              >
                {accordance.map(({ label, value }) => (
                  <NativeSelectOption key={value} value={value}>{label}</NativeSelectOption>
                ))}
              </NativeSelect>
            </FormControl>
          </div>
          <div className="min-w-0">
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
        </>
      }
      actions={
        <Button
          variant='primary'
          onClick={handleSearch}
          disabled={loading || userOrderableList.loading}
        >搜尋</Button>
      }
    />
  )
}

export default Filter