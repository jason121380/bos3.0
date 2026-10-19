/** @jsxImportSource @emotion/react */
import {
  Input, TextField, Grid, Select,
  MenuItem, FormControl, InputLabel,
} from '@mui/material'
import { Button } from 'ui/button'
import { Search as SearchIcon, Delete as DeleteIcon } from 'ui/icons'
import PropTypes from 'prop-types'
import React, { useState, useRef, Fragment, useEffect } from 'react'
import { useLocation } from 'react-router'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import SourceSelect from 'components/SourceSelect'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
  }),
  search: css({
    flexGrow: 1,
    height: 42,
    padding: theme.spacing(0, 2),
    display: 'flex',
    alignItems: 'center',
  }),
  searchIcon: css({
    marginRight: theme.spacing(2),
    color: theme.palette.icon,
  }),
  searchInput: css({
    flexGrow: 1,
  }),
  searchButton: css({
    height: '36px',
    backgroundColor: '#9ad6f3 !important',
    color: 'black !important',
    "&:hover": {
      backgroundColor: '#78a4ba !important',
    }
  }),
  field: css({
    minWidth: '180px !important',
    maxWidth: 180 * 1.5 + 'px',
  }),
  field2: css({
    flexGrow: 1,
    width: '180px !important',
    minWidth: '150px',
  }),
  birthdayGrid: css({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
  }),
  birthdayInput: css({
    width: '80px',
  }),
  birthdayMonthDay: css({
    width: '80px',
  }),
  deleteBtn: css({
    backgroundColor: '#f62e2e !important',
    height: '36px',
    color: 'white',
    "&:hover": {
      backgroundColor: '#891a1a !important',
      color: 'white',
    }
  }),
}

function SearchV2({
  setCustomerNoSort,
  onSearchV2,
  onDesignerV2,
  onDesignerV3,
  onBirthdayStart,
  onIsUnwelcome,
  className,
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
    <Grid {...rest} css={className} container style={{ gap: '10px' }}>
      <Grid item css={styles.birthdayGrid}>
        <div css={styles.search} className="rounded-md bg-background">
          <SearchIcon css={styles.searchIcon} />
          <Input
            css={styles.searchInput}
            disableUnderline
            placeholder="搜尋關鍵字"
            value={keyword}
            onChange={handleOnChange}
            onKeyDown={handleOnKeyPress}
          />
        </div>
      </Grid>
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
              className={styles.field2}
            />
            <EmployeeAutoComplete
              label={'偏好設計師編號/姓名'}
              value={designer}
              onChange={value => {
                onDesignerV2(value)
                setDesigner(value.userId)
              }}
              className={styles.field2}
            />
          </Fragment>
          :
          <Grid item >
            <EmployeeAutoComplete
              label={'設計師編號/姓名'}
              value={designer}
              onChange={value => {
                onDesignerV2(value)
                setDesigner(value.userId)
              }}
              className={styles.field}
            />
          </Grid>
        }
      </div>
      <Grid item css={styles.birthdayGrid}>
        <TextField
          label="民國年"
          name="year"
          inputRef={yearRef}
          value={birthdayObj.year}
          onChange={e => handleBirthdayChange(e)}
          variant="outlined"
          css={styles.birthdayMonthDay}
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
          css={styles.birthdayMonthDay}
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
          css={styles.birthdayMonthDay}
          onKeyDown={handleBirthFocus}
          onFocus={e => {
            e.target.select()
          }}
        />
      </Grid>
      {!disableCustomerSource && (
        <Grid item>
          <SourceSelect
            className={styles.field}
            value={customerSource}
            onChange={(event, value) => {
              onCustomerSource(value)
              setCustomerSource(event.target.value)
            }}
          />
        </Grid>
      )}
      {onIsUnwelcome && (
        <Grid item>
          <FormControl variant="outlined" css={styles.field}>
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
        </Grid>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <Button
          css={styles.searchButton}
          onClick={() => {
            onSearchV2(keyword)
            onBirthdayStart(birthdayObj)
          }}
          variant="primary"
        >
          搜尋
        </Button>
        <Button
          css={styles.deleteBtn}
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
          variant="primary"
        >
          <DeleteIcon />
          清除
        </Button>
      </div>
    </Grid>
  )
}

SearchV2.propTypes = {
  className: PropTypes.object,
  onSearchV2: PropTypes.func,
}

export default SearchV2
