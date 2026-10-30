// 排序依據使用 ui/native-select NativeSelect（與同列 ui/combobox Autocomplete 並排）
import { Checkbox } from 'ui/checkbox'
import { FormControl } from 'ui/form-control'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { TextField } from 'ui/text-field'
import { Button } from 'ui/button'
import { ReportToolbar } from 'ui/page-header'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import useFetchUsersOrderableList from 'hooks/useFetchGetUserOrderableList'
import DateSelector from 'components/DateSelector'
import idx from 'idx'
import compareNo from 'utils/compareNo'
import { Autocomplete } from 'ui/combobox'
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

const accordance = [
  { label: '全部', value: 'ALL' },
  { label: '入金', value: 'WALLET' },
  { label: '非入金', value: 'NOTWALLET' },
]

const type = [
  { label: '服務', value: 'SERVICE' },
  { label: '店販', value: 'PORDUCT' },
  { label: '賣卡', value: 'TICKETSELL' },
  { label: '用卡', value: 'TICKETUSE' },
  { label: '會員卡', value: 'MEMBERSHIP' },
]

const Filter = ({ dataChange, inputData, loading, handleSearch, rangeLimit }) => {
  const userOrderableList = useFetchUsersOrderableList()

  const filterOptions = (options, state) => {
    const keyWord = state.inputValue
    // 編號自然排序（英數編號也有效）、空編號排最後（原本 a.userNo - b.userNo 對英數編號得 NaN、空編號當 0 排最前；Jason 2026/10/22 fix all）
    const newOptions = [...options].sort((a, b) => compareNo(a.userNo, b.userNo))
    if (keyWord !== '' && keyWord.trim() !== '') {
      const filterData = newOptions.filter(
        data =>
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
            <FormControl disabled={loading || userOrderableList.loading} fullWidth variant="outlined" style={{ width: 100 }}>
              <NativeSelect
                value={inputData.orderType}
                onChange={e => dataChange(e.target.value, 'orderType')}
                displayEmpty={false}
                placeholder="請選擇…"
                disabled={loading || userOrderableList.loading}
                label="排序依據"
              >
                {accordance.map(({ label, value }) => (
                  <NativeSelectOption key={value} value={value}>
                    {label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </FormControl>
          </div>
          <div className="min-w-0 flex-1 sm:w-auto sm:min-w-[200px] sm:max-w-[480px] sm:flex-initial">
            <Autocomplete
              multiple
              autoHighlight
              fullWidth
              options={type}
              disableCloseOnSelect
              onChange={(e, value) =>
                dataChange(
                  value.map(({ value }) => value),
                  'consumptionTypes'
                )
              }
              getOptionLabel={option => option.label}
              disabled={loading || userOrderableList.loading}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox style={{ color: 'rgb(var(--text))', marginRight: 8 }} icon={icon} checkedIcon={checkedIcon} checked={selected} />
                  {option.label}
                </li>
              )}
              renderInput={params => <TextField {...params} style={{ marginRight: 18 }} variant="outlined" label="消費類型" />}
            />
          </div>
          <div className="min-w-0">
            <Autocomplete
              multiple
              autoHighlight
              fullWidth
              options={!userOrderableList.loading ? idx(userOrderableList, _ => _.data.getUserOrderableList) : []}
              disableCloseOnSelect
              disabled={loading || userOrderableList.loading}
              getOptionLabel={option => (option.userNickName !== null && option.userNickName.trim() ? option.userNickName : option.userName)}
              onChange={(e, value) =>
                dataChange(
                  value.map(({ userId }) => userId),
                  'designerIds'
                )
              }
              filterOptions={filterOptions}
              renderOption={({ key, ...props }, option, { selected }) => (
                <li key={option.userId} {...props}>
                  <Checkbox style={{ color: 'rgb(var(--text))', marginRight: 8 }} icon={icon} checkedIcon={checkedIcon} checked={selected} />
                  {option.userNickName !== null && option.userNickName.trim() ? option.userNickName : option.userName}
                  {option.userNo !== null && option.userNo.trim() ? ` - ${option.userNo}` : ''}
                </li>
              )}
              renderInput={params => <TextField {...params} variant="outlined" label="設計師篩選" placeholder="選擇設計師" />}
            />
          </div>
        </>
      }
      actions={
        <Button variant="primary" onClick={handleSearch} disabled={loading || userOrderableList.loading}>
          搜尋
        </Button>
      }
    />
  )
}

export default Filter
