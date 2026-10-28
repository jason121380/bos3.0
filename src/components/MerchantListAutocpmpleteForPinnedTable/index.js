import idx from 'idx'
import { TextField } from 'ui/text-field'
import { useState, useEffect, Fragment } from 'react'
import { Button } from 'ui/button'
import { useFetchGetUserGroupsWOCS } from 'hooks/useFetchGetUserMerchant'
import MerchantsListModal from './MerchantsListModal'
import PropTypes from 'prop-types'
import { Autocomplete } from 'ui/combobox'

const MerchantListAutocpmpleteForPinnedTable = ({
  onValueChange = () => { }, selectIds = [], values, setValues, isClick
}) => {
  const getUserGroupsWOCS = useFetchGetUserGroupsWOCS()
  const [merchantList, setMerchantList] = useState({
    allMerchants: [],
    groups: [],
    merchants: []
  })
  const [open, setOpen] = useState(false)

  const handleSelectAll = () => {
    onValueChange(merchantList.allMerchants.map(d => d.id))
  }

  const handleOnClick = ({ target }) => {
    // 正式輸入框沒有 MuiInputBase-root。沒有 class 的節點冒泡時 getAttribute 為 null，不可 .includes。
    // 只在點到輸入框（或仍帶舊 class 的外框）時開窗；點外框內距、全選鈕、圖示維持不開。
    if (target.tagName === 'path') return
    const className = target.getAttribute('class') || ''
    if (target.tagName === 'INPUT' || className.includes('MuiInputBase-root')) setOpen(true)
  }

  useEffect(() => {
    // 查詢失敗時 data 為 undefined，不讀欄位（2026/10/28 稽核 B-04）
    if (!getUserGroupsWOCS.loading && idx(getUserGroupsWOCS, _ => _.data.getUserGroupWOCS)) {
      const data = JSON.parse(getUserGroupsWOCS.data.getUserGroupWOCS)
      setMerchantList(data)
    }
  }, [getUserGroupsWOCS.loading])

  useEffect(() => {
    open ? setValues(selectIds) : setValues([])
  }, [open, setValues])

  return (
    <>
      <div id='openModal' style={{ width: '100%', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <Autocomplete
          className="min-w-0 flex-1 [&_input]:cursor-pointer"
          multiple
          fullWidth
          disabled={getUserGroupsWOCS.loading || isClick}
          open={false}
          style={{ cursor: 'pointer' }}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          // 全選：ui Button 以 asChild 落在 div（避免巢狀 button）；div 沒有 disabled，比照 MUI 以 aria-disabled＋pointer-events-none 擋點擊
          popupIcon={<Button asChild variant="primary" size="sm" onClick={handleSelectAll} aria-disabled={getUserGroupsWOCS.loading || isClick} className={getUserGroupsWOCS.loading || isClick ? 'pointer-events-none opacity-40' : undefined}><div>全選</div></Button>}
          value={merchantList.allMerchants.filter(d => selectIds.includes(d.id))}
          onChange={(e, v) => {
            onValueChange(v.map(d => d.id))
          }}
          options={merchantList.allMerchants}
          disableCloseOnSelect
          getOptionLabel={option => option.name}
          renderOption={(props, option) => (
            <li {...props}>
              {option.name}
            </li>
          )}
          renderInput={params => (
            <TextField
              onClick={event => handleOnClick(event)}
              {...params}
              focused={false}
              variant="outlined"
              label="加入店家"
              placeholder="店家名稱"
              onFocus={el => el.target.blur()}
              disabled={getUserGroupsWOCS.loading || isClick}
              InputProps={{
                ...params.InputProps,
              }}
            />
          )}
        />
        <Button disabled={getUserGroupsWOCS.loading || isClick} onClick={() => setOpen(true)} variant="primary" className="shrink-0">選擇店家</Button>
      </div>
      <MerchantsListModal
        open={open}
        setOpen={setOpen}
        merchantList={merchantList}
        values={values}
        setValues={setValues}
        onValueChange={onValueChange}
      />
    </>
  )
}

MerchantListAutocpmpleteForPinnedTable.propTypes = {
  onValueChange: PropTypes.func,
  selectIds: PropTypes.array
}

export default MerchantListAutocpmpleteForPinnedTable