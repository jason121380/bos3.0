/** @jsxImportSource @emotion/react */
import {
  Grid, TextField, Checkbox, Button, FormControl, InputLabel,
  Select, MenuItem, Autocomplete
} from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import useFetchUsersOrderableList from 'hooks/useFetchGetUserOrderableList'
import DateSelector from 'components/DateSelector'
import idx from 'idx'
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />
import { css } from '@emotion/react'

const styles = {
  container: css({
    margin: '24px 0 16px',
    gap: 10
  }),
  autocomplete: css({
    '& .MuiOutlinedInput-root': {
      paddingRight: '18px !important'
    }
  })
}

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

const Filter = ({ dataChange, inputData, loading, handleSearch, rangeLimit, excelLoading, getExcel }) => {
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
    <Grid container direction='column' css={styles.container}>
      <Grid item style={{ gap: 10 }} container alignItems='center'>
        <Grid item>
          <DateSelector
            date={inputData.dateRange}
            dateChange={value => dataChange(value, 'dateRange')}
            attributes={['lastmonth', 'thismonth', 'startDate', 'endDate']}
            disabled={loading || userOrderableList.loading}
            rangelimit={rangeLimit}
          />
        </Grid>
        <Grid item>
          <FormControl
            disabled={loading || userOrderableList.loading}
            fullWidth variant='outlined'
            style={{ width: 100 }}
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
        </Grid>
        <Grid item style={{ maxWidth: 480, minWidth: 200 }}>
          <Autocomplete
            multiple
            autoHighlight
            fullWidth
            options={type}
            disableCloseOnSelect
            css={styles.autocomplete}
            onChange={(e, value) => dataChange(value.map(({ value }) => value), 'consumptionTypes')}
            getOptionLabel={option => option.label}
            disabled={loading || userOrderableList.loading}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  style={{ color: 'rgb(var(--text))', marginRight: 8 }}
                  icon={icon}
                  checkedIcon={checkedIcon}
                  checked={selected}
                />
                {option.label}
              </li>
            )}
            renderInput={params => (
              <TextField
                {...params}
                style={{ marginRight: 18 }}
                variant="outlined"
                label="消費類型"
              />
            )}
          />
        </Grid>
        <Grid item style={{ marginLeft: 'auto' }}>
          <Button
            color='primary'
            variant='contained'
            disabled={excelLoading}
            onClick={getExcel}
          >報表匯出</Button>
        </Grid>
      </Grid>
      <Grid style={{ alignItems: 'center', display: 'flex', gap: 10 }}>
        <Grid item style={{ flexGrow: 1 }}>
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
        </Grid>
        <Grid item style={{ width: 'fit-content' }}>
          <Button
            color='primary'
            variant='contained'
            onClick={handleSearch}
            disabled={loading || userOrderableList.loading}
          >搜尋</Button>
        </Grid>

      </Grid>
    </Grid>
  )
}

export default Filter