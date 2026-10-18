/** @jsxImportSource @emotion/react */
// 設計師多選（Autocomplete）與業績切換鈕保留 MUI
import {
  TextField, Checkbox, Autocomplete,
  ToggleButtonGroup, ToggleButton
} from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import useFetchUsersOrderableList from 'hooks/useFetchGetUserOrderableList'
import idx from 'idx'
import ReferToggleButton from 'components/ReferToggleButton'
import DateSelector from 'components/DateSelector'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Button } from 'ui/button'

const styles = {
  root: css({}),
  cardHeader: css({
    textAlign: 'center',
  }),
  calendarButton: css({
    backgroundColor: theme.palette.common.white,
  }),
  searchBtn: css({
    height: 'fit-content'
  }),
  container: css({
    margin: '24px 0',
    gap: '10px 20px'
  }),
  flex: css({
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    alignItems: 'center',
  })
}

const Filter = ({ date, setDate, handleSearch, loading, inputData, setInputData, referDisplay }) => {
  const userOrderableList = useFetchUsersOrderableList()
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
  const checkedIcon = <CheckBoxIcon fontSize="small" />

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
    <div className="flex flex-col gap-2 pb-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <DateSelector
          date={date}
          disabled={loading}
          attributes={['lastmonth', 'thismonth', 'startDate', 'endDate']}
          dateChange={value => setDate(value)}
        />
        {!referDisplay && (
          <ReferToggleButton
            value={inputData.reference}
            onChange={value => value && setInputData({ ...inputData, reference: value })}
            disabled={loading}
          />
        )}
        <ToggleButtonGroup
          size="small"
          exclusive
          value={inputData.performance}
          onChange={(e, value) => value && setInputData({ ...inputData, performance: value })}
        >
          <ToggleButton disabled={loading} value='SUM'>總和業績</ToggleButton>
          <ToggleButton disabled={loading} value='AVERAGE'>平均業績</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div className="flex flex-nowrap items-center gap-2.5">
        <div className="min-w-0 flex-1">
          <Autocomplete
            multiple
            autoHighlight
            fullWidth
            options={!userOrderableList.loading ? idx(userOrderableList, _ => _.data.getUserOrderableList) : []}
            disableCloseOnSelect
            disabled={loading}
            onChange={(e, value) => {
              const ids = value.map(d => d.userId)
              setInputData({ ...inputData, designerIds: ids })
            }}
            getOptionLabel={option =>
              option.userNickName !== null && option.userNickName.trim() ? option.userNickName : option.userName
            }
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
        <Button
          variant="primary"
          onClick={handleSearch}
          disabled={loading}
        >
          搜尋
        </Button>
      </div>
    </div>
  )
}

export default Filter