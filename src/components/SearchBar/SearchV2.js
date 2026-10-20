import { Input, TextField } from 'ui/text-field'
import { Select, MenuItem, FormControl, InputLabel } from 'ui/form-control'
import { Button } from 'ui/button'
import { Search as SearchIcon, Delete as DeleteIcon } from 'ui/icons'
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
    <div {...rest} className={cn('box-border flex w-full flex-wrap gap-2.5', className)}>
      <div className="flex items-center flex-wrap gap-[10px]">
        <div className="grow h-[42px] py-0 px-[16px] flex items-center rounded-md bg-background">
          <SearchIcon className="mr-[16px] text-[#007AFF]" />
          <Input
            className="grow"
            disableUnderline
            placeholder="搜尋關鍵字"
            value={keyword}
            onChange={handleOnChange}
            onKeyDown={handleOnKeyPress}
          />
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
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
      <div className="flex items-center flex-wrap gap-[10px]">
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
        <div>
          <FormControl variant="outlined" className="!min-w-[180px] max-w-[270px]">
            <InputLabel>黑名單篩選</InputLabel>
            <Select
              value={isUnwelcome}
              label='黑名單篩選'
              onChange={(event, value) => {
                setIsUnwelcome(event.target.value)
                onIsUnwelcome(event)
              }}
            >
              <MenuItem value='ALL'>顯示全部</MenuItem>
              <MenuItem value='UNWELCOME'>顯示黑名單</MenuItem>
              <MenuItem value='WELCOME'>排除黑名單</MenuItem>
            </Select>
          </FormControl>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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
          variant="danger"
        >
          <DeleteIcon />
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
