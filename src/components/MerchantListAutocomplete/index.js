import { TextField, InputAdornment } from 'ui/text-field'
import { useState, useEffect } from 'react'
import { Button } from 'ui/button'
import useFetchGetUserMerchant from 'hooks/useFetchGetUserMerchant'
import MerchantsListModal from 'components/MerchantsListModal'
import PropTypes from 'prop-types'
import { Autocomplete } from 'ui/combobox'
import idx from 'idx'

// 查詢失敗（data 為 undefined）時當成沒有店家，不讓整頁拋錯（Jason 2026/10/22 fix all）
const EMPTY_MERCHANT_LIST = { allMerchants: [], groups: [], merchants: [] }

const MerchantListAutocomplete = ({ onValueChange = () => {} }) => {
  const userMerchants = useFetchGetUserMerchant()
  const userMerchantJson = idx(userMerchants, _ => _.data.getUserMerchant)
  const merchantList = !userMerchants.loading ? (userMerchantJson ? JSON.parse(userMerchantJson) : EMPTY_MERCHANT_LIST) : {}
  const [values, setValues] = useState([])
  const [open, setOpen] = useState(false)

  const handleSelectAll = () => {
    setValues(merchantList.allMerchants)
  }

  const handleOnClick = ({ target }) => {
    // 正式輸入框沒有 MuiInputBase-root。沒有 class 的節點冒泡時 getAttribute 為 null，不可 .includes。
    // 只在點到輸入框（或仍帶舊 class 的外框）時開窗；點外框內距、全選鈕、圖示維持不開。
    if (target.tagName === 'path') return
    const className = target.getAttribute('class') || ''
    if (target.tagName === 'INPUT' || className.includes('MuiInputBase-root')) setOpen(true)
  }

  useEffect(() => {
    const ids = values.map(d => d.id)
    onValueChange(ids)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（onValueChange）；只在 [values] 變動時呼叫，補上會每次 render 重跑
  }, [values])

  return (
    <>
      <div id="openModal" style={{ width: '100%', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <Autocomplete
          className="min-w-0 flex-1 [&_input]:cursor-pointer"
          multiple
          fullWidth
          disabled={!merchantList}
          open={false}
          popupIcon={
            // 全選：ui Button primary sm（h-8，放在 36px 輸入框內不撐高）；
            // Autocomplete popupIndicator 本身是 <button>，故以 asChild 落在 div 上避免巢狀 button（原 MuiButton component='div' 的等效作法），onClick 原樣
            <Button asChild variant="primary" size="sm" onClick={handleSelectAll}>
              <div>全選</div>
            </Button>
          }
          value={values}
          onChange={(e, v) => {
            setValues(v)
          }}
          options={merchantList.allMerchants || []}
          disableCloseOnSelect
          getOptionLabel={option => option.name}
          renderInput={params => (
            <TextField
              onClick={handleOnClick}
              {...params}
              focused={false}
              variant="outlined"
              label="加入店家"
              placeholder="店家名稱"
              onFocus={el => el.target.blur()}
              InputProps={{
                ...params.InputProps,
              }}
            />
          )}
        />
        <Button onClick={() => setOpen(true)} variant="primary" className="shrink-0">
          選擇店家
        </Button>
      </div>
      {!userMerchants.loading && (
        <MerchantsListModal open={open} setOpen={setOpen} merchantList={merchantList} values={values} setValues={setValues} />
      )}
    </>
  )
}

MerchantListAutocomplete.propTypes = {
  onValueChange: PropTypes.func,
}

export default MerchantListAutocomplete
