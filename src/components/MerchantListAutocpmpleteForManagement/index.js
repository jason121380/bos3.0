/** @jsxImportSource @emotion/react */
import { useState, useEffect, Fragment } from 'react'
import { Button as MuiButton, Autocomplete, TextField } from '@mui/material'
import { Button } from 'ui/button'
import { useFetchGetUserMerchantForManagementLazy, useFetchGetEventJoinMerchants } from 'hooks/useFetchGetUserMerchant'
import MerchantsListModal from './MerchantsListModal'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../../theme'

const styles = {
  root: css({
    '& input': {
      cursor: 'pointer'
    },
    '& .MuiAutocomplete-endAdornment': {
      top: 0,
      right: 0,
      '& button:last-child': {
        paddingRight: 0,
        paddingLeft: 0,
      }
    }
  }),
}

let first = true

const index = ({ onValueChange = () => { }, selectIds = [], isReadOnly = false, inRule = false, eventId = null }) => {
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
    if (target.tagName === 'path') return
    if (target.tagName === 'INPUT' || target.getAttribute('class').includes('MuiInputBase-root')) setOpen(true)
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
  }, [values])

  useEffect(() => {
    if (!merchantForManagementData.loading && merchantForManagementData.data) {
      const data = JSON.parse(merchantForManagementData.data.advancedManagerMerchants)
      handleSetData(data)
    } else if (!eventJoinMerchantsData.loading && eventJoinMerchantsData.data) {
      const data = JSON.parse(eventJoinMerchantsData.data.eventJoinedMerchants)
      handleSetData(data)
    }
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
  }, [inRule, eventId])

  return (
    <ThemeProvider theme={theme}>
      <div id='openModal' style={{ width: '100%', display: 'flex', gap: 10, alignItems: 'center' }}>
        <Autocomplete
          readOnly={isReadOnly}
          css={styles.root}
          multiple
          fullWidth
          disabled={!merchantList}
          open={false}
          style={{ cursor: 'pointer' }}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          popupIcon={
            isReadOnly ? '' : <MuiButton component='div' onClick={handleSelectAll} variant="contained" color="primary" size="small">全選</MuiButton>
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
          <Button onClick={() => setOpen(true)} style={{ whiteSpace: 'nowrap', height: 'fit-content' }} variant="primary">選擇店家</Button>
        )}
      </div>
      <MerchantsListModal
        open={open}
        setOpen={setOpen}
        merchantList={merchantList}
        values={values}
        setValues={setValues}
      />
    </ThemeProvider>
  )
}

index.propTypes = {
  onValueChange: PropTypes.func,
  selectIds: PropTypes.array
}

export default index