import { TextField } from 'ui/text-field'
import { useState, useEffect, Fragment } from 'react'
import { Button } from 'ui/button'
import { useFetchGetUserMerchantForManagementLazy, useFetchGetEventJoinMerchants } from 'hooks/useFetchGetUserMerchant'
import MerchantsListModal, { managementTreeClasses } from 'components/MerchantsListModal'
import PropTypes from 'prop-types'
import { Autocomplete } from 'ui/combobox'

let first = true

const MerchantListAutocpmpleteForManagement = ({ onValueChange = () => { }, selectIds = [], isReadOnly = false, inRule = false, eventId = null }) => {
  const [merchantForManagement, merchantForManagementData] = useFetchGetUserMerchantForManagementLazy()
  const [eventJoinMerchants, eventJoinMerchantsData] = useFetchGetEventJoinMerchants()
  const [merchantList, setMerchantList] = useState({
    allMerchants: [],
    groups: [],
    merchants: []
  })
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

  const handleSetData = merchantData => {
    const filterData = merchantData.allMerchants.filter(d => selectIds.includes(d.id))
    first = false
    setMerchantList(merchantData)
    setValues(filterData)
  }

  useEffect(() => {
    const ids = values.map(d => d.id)
    onValueChange(ids)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（onValueChange）；只在 [values] 變動時呼叫，補上會每次 render 重跑
  }, [values])

  useEffect(() => {
    if (!merchantForManagementData.loading && merchantForManagementData.data) {
      const data = JSON.parse(merchantForManagementData.data.advancedManagerMerchants)
      handleSetData(data)
    } else if (!eventJoinMerchantsData.loading && eventJoinMerchantsData.data) {
      const data = JSON.parse(eventJoinMerchantsData.data.eventJoinedMerchants)
      handleSetData(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（handleSetData）；只在 [merchantForManagementData, eventJoinMerchantsData] 變動時呼叫，補上會每次 render 重跑
  }, [merchantForManagementData, eventJoinMerchantsData])

  useEffect(() => {
    return () => {
      first = true
    }
  }, [])

  useEffect(() => {
    if (inRule && eventId) {
      eventJoinMerchants({
        variables: {
          eventId: eventId
        }
      })
    } else {
      merchantForManagement()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（eventJoinMerchants、merchantForManagement）；只在 [inRule, eventId] 變動時呼叫，補上會每次 render 重跑
  }, [inRule, eventId])

  return (
    <>
      <div id='openModal' style={{ width: '100%', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <Autocomplete
          className="min-w-0 flex-1 [&_input]:cursor-pointer"
          readOnly={isReadOnly}
          multiple
          fullWidth
          disabled={!merchantList}
          open={false}
          style={{ cursor: 'pointer' }}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          popupIcon={
            isReadOnly ? '' : <Button asChild variant="primary" size="sm" onClick={handleSelectAll}><div>全選</div></Button>
          }
          value={values}
          onChange={(e, v) => {
            setValues(v)
          }}
          options={merchantList.allMerchants || []}
          disableCloseOnSelect
          getOptionLabel={option => option.name}
          renderOption={(props, option) => (
            <li {...props}>
              {option.name}
            </li>
          )}
          renderInput={params => (
            <TextField
              onClick={event => !isReadOnly && handleOnClick(event)}
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
        {isReadOnly ? '' : (
          <Button onClick={() => setOpen(true)} variant="primary" className="shrink-0">選擇店家</Button>
        )}
      </div>
      <MerchantsListModal
        open={open}
        setOpen={setOpen}
        merchantList={merchantList}
        values={values}
        setValues={setValues}
        classes={managementTreeClasses}
      />
    </>
  )
}

MerchantListAutocpmpleteForManagement.propTypes = {
  onValueChange: PropTypes.func,
  selectIds: PropTypes.array
}

export default MerchantListAutocpmpleteForManagement