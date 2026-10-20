import { TextField } from 'ui/text-field'
import { Field, Input } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Button } from 'ui/button'
import { Eraser, Search as SearchIcon } from 'lucide-react'
import PropTypes from 'prop-types'
import React, { useState, useRef, Fragment, useEffect } from 'react'
import { useLocation } from 'react-router'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import SourceSelect from 'components/SourceSelect'
import { cn } from 'ui/utils'

function SearchV2({
  setCustomerNoSort,
  onSearchV2,
  onDesignerV2,
  onDesignerV3,
  onBirthdayStart,
  onIsUnwelcome,
  className = '',
  css,
  onCustomerSource,
  disableCustomerSource,
  inCustomerFilterExport,
  handleClearData = () => { },
  setBelong,
  setCustomerIsCome,
  getQuery = false,
  ...rest
}) {
  const yearRef = useRef()
  const monthRef = useRef()
  const dayRef = useRef()
  const location = useLocation()
  const [keyword, setKeyword] = useState('')
  const [designer, setDesigner] = useState('')
  const [latestDesigner, setLatestDesigner] = useState('')
  const [customerSource, setCustomerSource] = useState('')
  const [isUnwelcome, setIsUnwelcome] = useState('ALL')

  const [birthdayObj, setBirthdayObj] = React.useState({
    year: '',
    month: '',
    day: '',
  })
  const handleOnChange = e => setKeyword(e.target.value)
  const handleOnKeyPress = e => {
    if (e.key === 'Enter') {
      onSearchV2(keyword)
    }
  }
  const handleBirthdayChange = e => {
    switch (e.target.name) {
      case 'year':
        if (e.target.value.length <= 3) {
          setBirthdayObj({ ...birthdayObj, year: e.target.value })
        }
        break
      case 'month':
        if (parseInt(e.target.value) <= 12 || e.target.value === '') {
          setBirthdayObj({ ...birthdayObj, month: e.target.value })
        }
        break
      case 'day':
        if (parseInt(e.target.value) <= 31 || e.target.value === '') {
          setBirthdayObj({ ...birthdayObj, day: e.target.value })
        }
        break
      default:
        break
    }
  }
  const handleBirthFocus = e => {
    if (e.key === 'Enter') {
      switch (e.target.name) {
        case 'year':
          monthRef.current.focus()
          break
        case 'month':
          dayRef.current.focus()
          break
        case 'day':
          onBirthdayStart(birthdayObj)
          onSearchV2(keyword)
          break
        default:
          break
      }
    }
  }

  useEffect(() => {
    if (!getQuery) return
    const queryString = new URLSearchParams(location.search).get("pageSetting")
    if (queryString) {
      const parseData = JSON.parse(queryString)
      setKeyword(parseData.keyword)
    }
  }, [])

  return (
    // 篩選列（STYLE §6／§14）：標籤一律在欄位上方、36px 輸入框、token 色；各組底部對齊（items-end）。搜尋框改 ui/input（原自製 42px 白框＋寫死 #007AFF 圖示）
    <div {...rest} className={cn('box-border flex w-full flex-wrap items-end gap-2.5', className)}>
      <Field label="關鍵字" htmlFor="customer-search-keyword" className="min-w-[200px] grow basis-[240px]">
        <div className="relative">
          <SearchIcon aria-hidden="true" strokeWidth={1.75} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <Input
            id="customer-search-keyword"
            className="pl-9"
            placeholder="搜尋關鍵字"
            value={keyword}
            onChange={handleOnChange}
            onKeyDown={handleOnKeyPress}
          />
        </div>
      </Field>
      <div className="flex flex-wrap items-end gap-2.5">
        {inCustomerFilterExport ?
          <Fragment>
            <EmployeeAutoComplete
              label={'最近設計師編號/姓名'}
              value={latestDesigner}
              onChange={value => {
                onDesignerV3(value)
                setLatestDesigner(value.userId)
              }}
              className="grow !w-[180px] min-w-[150px]"
            />
            <EmployeeAutoComplete
              label={'偏好設計師編號/姓名'}
              value={designer}
              onChange={value => {
                onDesignerV2(value)
                setDesigner(value.userId)
              }}
              className="grow !w-[180px] min-w-[150px]"
            />
          </Fragment>
          :
          <div>
            <EmployeeAutoComplete
              label={'設計師編號/姓名'}
              value={designer}
              onChange={value => {
                onDesignerV2(value)
                setDesigner(value.userId)
              }}
              className="!min-w-[180px] max-w-[270px]"
            />
          </div>
        }
      </div>
      <div className="flex flex-wrap items-end gap-2.5">
        <TextField
          label="民國年"
          name="year"
          inputRef={yearRef}
          value={birthdayObj.year}
          onChange={e => handleBirthdayChange(e)}
          variant="outlined"
          className="w-[80px]"
          onKeyDown={handleBirthFocus}
          onFocus={e => {
            e.target.select()
          }}
        />
        <TextField
          label="月"
          name="month"
          inputRef={monthRef}
          value={birthdayObj.month}
          onChange={e => handleBirthdayChange(e)}
          variant="outlined"
          className="w-[80px]"
          onKeyDown={handleBirthFocus}
          onFocus={e => {
            e.target.select()
          }}
        />
        <TextField
          label="日"
          name="day"
          inputRef={dayRef}
          value={birthdayObj.day}
          onChange={e => handleBirthdayChange(e)}
          variant="outlined"
          className="w-[80px]"
          onKeyDown={handleBirthFocus}
          onFocus={e => {
            e.target.select()
          }}
        />
      </div>
      {!disableCustomerSource && (
        <div>
          <SourceSelect
            className="!min-w-[180px] max-w-[270px]"
            value={customerSource}
            onChange={(event, value) => {
              onCustomerSource(value)
              setCustomerSource(event.target.value)
            }}
          />
        </div>
      )}
      {onIsUnwelcome && (
        <Field label="黑名單篩選" htmlFor="customer-search-unwelcome" className="min-w-[180px] max-w-[270px]">
          <NativeSelect
            id="customer-search-unwelcome"
            value={isUnwelcome}
            onChange={(event, value) => {
              setIsUnwelcome(event.target.value)
              onIsUnwelcome(event)
            }}
          >
            <NativeSelectOption value='ALL'>顯示全部</NativeSelectOption>
            <NativeSelectOption value='UNWELCOME'>顯示黑名單</NativeSelectOption>
            <NativeSelectOption value='WELCOME'>排除黑名單</NativeSelectOption>
          </NativeSelect>
        </Field>
      )}
      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          onClick={() => {
            onSearchV2(keyword)
            onBirthdayStart(birthdayObj)
          }}
          variant="primary"
        >
          搜尋
        </Button>
        <Button
          onClick={() => {
            handleClearData()
            setBirthdayObj({ day: '', month: '', year: '' })
            setKeyword('')
            setDesigner('')
            setLatestDesigner('')
            setCustomerSource('')
            setIsUnwelcome('ALL')
            setBelong && setBelong([])
            setCustomerIsCome && setCustomerIsCome(null)
            setCustomerNoSort && setCustomerNoSort({
              keyword: '',
              preferDesigner: '',
              latestDesigner: '',
              birthday: {
                year: '',
                month: '',
                day: '',
              },
              source: '',
              pageLimit: 50,
              pageOffset: 0,
              isUnwelcome: 'ALL',
              consumptionRange: null,
              baseDateRange: null,
              customerIsCome: null,
              category: []
            })
          }}
          variant="secondary"
        >
          <Eraser strokeWidth={1.75} />
          清除
        </Button>
      </div>
    </div>
  )
}

SearchV2.propTypes = {
  className: PropTypes.string,
  onSearchV2: PropTypes.func,
}

export default SearchV2
