/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, CardHeader, TextField, Checkbox,
  Divider, Button, CardActions, Select, MenuItem,
  FormControl, InputLabel, FormControlLabel, ToggleButton,
  ToggleButtonGroup
} from '@mui/material'
import { Fragment } from 'react'
import { cloneDeep } from 'lodash'
import { MobileDatePicker } from '@mui/x-date-pickers'
import { isBefore, format } from 'date-fns'
import MerchantListAutocpmpleteForManagement from 'components/MerchantListAutocpmpleteForManagement'
import BelongAutocomplete from 'components/BelongAutocomplete'
import PaywayAutocomplete from 'components/PaywayAutocomplete'
import produce from 'immer'
import { openSnackbar } from 'elements/snackbars'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    marginTop: theme.spacing(3),
  }),
  date: css({
    display: 'flex',
    gap: 20,
    flexWrap: 'wrap',
    '& input': {
      cursor: 'pointer'
    },
    '& .MuiTextField-root': {
      width: 150
    }
  }),
  content: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 25,
    paddingTop: 16
  }),
  midTitle: css({
    marginBottom: 12,
    fontSize: 14,
    fontWeight: 500
  }),
  type: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
    '& p': {
      fontSize: 14,
      fontWeight: 500
    },
    '& .title': {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    '& .MuiFormControl-root': {
      width: 150
    },
    '& .container': {
      display: 'flex',
      gap: 20,
      flexDirection: 'column',
      '& .Autocomplete .MuiFormControl-root': {
        width: '100% !important'
      },
      '& > div': {
        display: 'flex',
        gap: 20,
        flexWrap: 'wrap'
      },
    },
    '& .card': {
      gap: 12
    }
  })
}

function General({ inputValue, attributions, setInputValue, handleSubmit, isClick, mainEvent, eventId }) {

  const handleDateChange = (value, pickerType) => {
    const newValue = cloneDeep(inputValue)
    newValue[pickerType] = value
    if (pickerType === 'endDateForGroup' && isBefore(newValue.endDateForGroup, newValue.startDateForGroup)) {
      newValue.startDateForGroup = newValue.endDateForGroup
    } else if (pickerType === 'startDateForGroup' && isBefore(newValue.endDateForGroup, newValue.startDateForGroup)) {
      newValue.endDateForGroup = newValue.startDateForGroup
    }
    setInputValue(newValue)
  }

  const handleValueChange = (key, value) => {
    const checkKey = ['product', 'membershipCard', 'nameForGroup']
    setInputValue(
      produce(draft => {
        draft[key] = value
        if (value === '' && !checkKey.includes(key)) {
          draft[key].belong = []
        }
      })
    )
  }

  const handleTypeChange = (key1, key2, value) => {
    setInputValue(
      produce(draft => {
        draft[key1][key2] = value
        if (value === 'ALL') {
          draft[key1].belong = []
        }
      })
    )
  }

  const handleWalletDepositChange = (key1, key2, value) => {
    setInputValue(
      produce(draft => {
        draft[key1][key2] = value
        if (!value) {
          draft[key1].price = 0
        }
      })
    )
  }
  return (
    <Fragment>
      <Card css={styles.root}>
        <CardHeader title={`${mainEvent.name} ${format(mainEvent.start, "yyyy/M/d")} ~ ${format(mainEvent.end, "yyyy/M/d")}`} />
        <Divider />
        <CardContent css={styles.content}>
          <TextField
            label='規則名稱'
            placeholder='請輸入規則名稱'
            variant='outlined'
            value={inputValue.nameForGroup}
            onChange={e => handleValueChange('nameForGroup', e.target.value)}
          />
          <div css={styles.date}>
            <MobileDatePicker
              maxDate={mainEvent.end}
              minDate={mainEvent.start}
              closeOnSelect
              label="起始時間"
              value={inputValue.startDateForGroup}
              format="yyyy/MM/dd"
              onChange={value => handleDateChange(new Date(value).getTime(), 'startDateForGroup')}
            />
            <MobileDatePicker
              maxDate={mainEvent.end}
              minDate={mainEvent.start}
              closeOnSelect
              label="結束時間"
              value={inputValue.endDateForGroup}
              format="yyyy/MM/dd"
              onChange={value => handleDateChange(new Date(value).getTime(), 'endDateForGroup')}
            />
          </div>
          <div>
            <p css={styles.midTitle}>適用店家：</p>
            <MerchantListAutocpmpleteForManagement
              onValueChange={value => handleValueChange('merchants', value)}
              selectIds={inputValue.merchants}
              inRule
              eventId={eventId}
            />
          </div>
          <div css={styles.type}>
            <div className='title'>
              <p>適用消費類型：</p>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={inputValue.consumptionTypeUsing}
                onChange={(e, v) => v && handleValueChange('consumptionTypeUsing', v)}
              >
                <ToggleButton value='ALL'>全部套用</ToggleButton>
                <ToggleButton value='CUSTOMIZE'>自訂</ToggleButton>
              </ToggleButtonGroup>
            </div>
            {inputValue.consumptionTypeUsing === 'CUSTOMIZE' && (
              <>
                <FormControl variant="outlined">
                  <InputLabel>店販</InputLabel>
                  <Select
                    label='店販'
                    value={inputValue.product}
                    onChange={e => handleValueChange('product', e.target.value)}
                  >
                    <MenuItem value={false}>不套用</MenuItem>
                    <MenuItem value={true}>套用</MenuItem>
                  </Select>
                </FormControl>
                <Divider />
                <FormControl variant="outlined">
                  <InputLabel>會員卡</InputLabel>
                  <Select
                    label='會員卡'
                    value={inputValue.membershipCard}
                    onChange={e => handleValueChange('membershipCard', e.target.value)}
                  >
                    <MenuItem value={false}>不套用</MenuItem>
                    <MenuItem value={true}>套用</MenuItem>
                  </Select>
                </FormControl>
                <Divider />
                <div className='container'>
                  <div>
                    <FormControl variant="outlined">
                      <InputLabel>服務</InputLabel>
                      <Select
                        label='服務'
                        value={inputValue.service.type !== ''}
                        onChange={e => handleTypeChange('service', 'type', e.target.value ? 'ALL' : '')}
                      >
                        <MenuItem value={false}>不套用</MenuItem>
                        <MenuItem value={true}>套用</MenuItem>
                      </Select>
                    </FormControl>
                    {inputValue.service.type != '' && (
                      <FormControl variant="outlined">
                        <InputLabel>歸屬</InputLabel>
                        <Select
                          label='歸屬'
                          value={inputValue.service.type}
                          onChange={e => handleTypeChange('service', 'type', e.target.value)}
                        >
                          <MenuItem value='ALL'>全部套用</MenuItem>
                          <MenuItem value='SPECIFIC'>自訂</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  </div>
                  {inputValue.service.type === 'SPECIFIC' && (
                    <BelongAutocomplete
                      optionData={attributions}
                      isloading={attributions.langth === 0}
                      value={inputValue.service.belong}
                      className='Autocomplete'
                      onChange={value => handleTypeChange('service', 'belong', value)}
                    />
                  )}
                </div>
                <Divider />
                <div className='container card'>
                  <div>
                    <FormControl variant="outlined">
                      <InputLabel>賣卡先入</InputLabel>
                      <Select
                        label='賣卡先入'
                        value={inputValue.ticketSellInPerformance.type !== ''}
                        onChange={e => handleTypeChange('ticketSellInPerformance', 'type', e.target.value ? 'ALL' : '')}
                      >
                        <MenuItem value={false}>不套用</MenuItem>
                        <MenuItem value={true}>套用</MenuItem>
                      </Select>
                    </FormControl>
                    {inputValue.ticketSellInPerformance.type !== '' && (
                      <>
                        <FormControl variant="outlined">
                          <InputLabel>歸屬</InputLabel>
                          <Select
                            label='歸屬'
                            value={inputValue.ticketSellInPerformance.type}
                            onChange={e => handleTypeChange('ticketSellInPerformance', 'type', e.target.value)}
                          >
                            <MenuItem value='ALL'>全部套用</MenuItem>
                            <MenuItem value='SPECIFIC'>自訂</MenuItem>
                          </Select>
                        </FormControl>
                      </>
                    )}
                  </div>
                  {inputValue.ticketSellInPerformance.type === 'SPECIFIC' && (
                    <BelongAutocomplete
                      optionData={attributions}
                      isloading={attributions.langth === 0}
                      value={inputValue.ticketSellInPerformance.belong}
                      className='Autocomplete'
                      onChange={value => handleTypeChange('ticketSellInPerformance', 'belong', value)}
                    />
                  )}
                </div>
                <div style={{ marginTop: 25 }} className='container card'>
                  <div>
                    <FormControl variant="outlined">
                      <InputLabel>賣卡後入</InputLabel>
                      <Select
                        label='賣卡後入'
                        value={inputValue.ticketSellNotInPerformance.type !== ''}
                        onChange={e => handleTypeChange('ticketSellNotInPerformance', 'type', e.target.value ? 'ALL' : '')}
                      >
                        <MenuItem value={false}>不套用</MenuItem>
                        <MenuItem value={true}>套用</MenuItem>
                      </Select>
                    </FormControl>
                    {inputValue.ticketSellNotInPerformance.type !== '' && (
                      <>
                        <FormControl variant="outlined">
                          <InputLabel>歸屬</InputLabel>
                          <Select
                            label='歸屬'
                            value={inputValue.ticketSellNotInPerformance.type}
                            onChange={e => handleTypeChange('ticketSellNotInPerformance', 'type', e.target.value)}
                          >
                            <MenuItem value='ALL'>全部套用</MenuItem>
                            <MenuItem value='SPECIFIC'>自訂</MenuItem>
                          </Select>
                        </FormControl>
                      </>
                    )}
                  </div>
                  {inputValue.ticketSellNotInPerformance.type === 'SPECIFIC' && (
                    <BelongAutocomplete
                      optionData={attributions}
                      isloading={attributions.langth === 0}
                      value={inputValue.ticketSellNotInPerformance.belong}
                      className='Autocomplete'
                      onChange={value => handleTypeChange('ticketSellNotInPerformance', 'belong', value)}
                    />
                  )}
                </div>
                <Divider />
                <div className='container card'>
                  <div>
                    <FormControl variant="outlined">
                      <InputLabel>用卡先入</InputLabel>
                      <Select
                        label='用卡先入'
                        value={inputValue.ticketUsePerformanceEntered.type !== ''}
                        onChange={e => handleTypeChange('ticketUsePerformanceEntered', 'type', e.target.value ? 'ALL' : '')}
                      >
                        <MenuItem value={false}>不套用</MenuItem>
                        <MenuItem value={true}>套用</MenuItem>
                      </Select>
                    </FormControl>
                    {inputValue.ticketUsePerformanceEntered.type !== '' && (
                      <>
                        <FormControl variant="outlined">
                          <InputLabel>歸屬</InputLabel>
                          <Select
                            label='歸屬'
                            value={inputValue.ticketUsePerformanceEntered.type}
                            onChange={e => handleTypeChange('ticketUsePerformanceEntered', 'type', e.target.value)}
                          >
                            <MenuItem value='ALL'>全部套用</MenuItem>
                            <MenuItem value='SPECIFIC'>自訂</MenuItem>
                          </Select>
                        </FormControl>
                      </>
                    )}
                  </div>
                  {inputValue.ticketUsePerformanceEntered.type === 'SPECIFIC' && (
                    <BelongAutocomplete
                      optionData={attributions}
                      isloading={attributions.langth === 0}
                      value={inputValue.ticketUsePerformanceEntered.belong}
                      className='Autocomplete'
                      onChange={value => handleTypeChange('ticketUsePerformanceEntered', 'belong', value)}
                    />
                  )}
                </div>
                <div style={{ marginTop: 25 }} className='container card'>
                  <div>
                    <FormControl variant="outlined">
                      <InputLabel>用卡後入</InputLabel>
                      <Select
                        label='用卡後入'
                        value={inputValue.ticketUsePerformanceNotEntered.type !== ''}
                        onChange={e => handleTypeChange('ticketUsePerformanceNotEntered', 'type', e.target.value ? 'ALL' : '')}
                      >
                        <MenuItem value={false}>不套用</MenuItem>
                        <MenuItem value={true}>套用</MenuItem>
                      </Select>
                    </FormControl>
                    {inputValue.ticketUsePerformanceNotEntered.type !== '' && (
                      <>
                        <FormControl variant="outlined">
                          <InputLabel>歸屬</InputLabel>
                          <Select
                            label='歸屬'
                            value={inputValue.ticketUsePerformanceNotEntered.type}
                            onChange={e => handleTypeChange('ticketUsePerformanceNotEntered', 'type', e.target.value)}
                          >
                            <MenuItem value='ALL'>全部套用</MenuItem>
                            <MenuItem value='SPECIFIC'>自訂</MenuItem>
                          </Select>
                        </FormControl>
                      </>
                    )}
                  </div>
                  {inputValue.ticketUsePerformanceNotEntered.type === 'SPECIFIC' && (
                    <BelongAutocomplete
                      optionData={attributions}
                      isloading={attributions.langth === 0}
                      value={inputValue.ticketUsePerformanceNotEntered.belong}
                      className='Autocomplete'
                      onChange={value => handleTypeChange('ticketUsePerformanceNotEntered', 'belong', value)}
                    />
                  )}
                </div>
              </>
            )}
          </div>
          <div css={styles.type}>
            <div className='title'>
              <p>適用付款方式：</p>
            </div>
            <div className="container">
              <PaywayAutocomplete
                value={inputValue.payTypeUsing}
                onChange={value => handleValueChange('payTypeUsing', value)}
                className='Autocomplete'
              />
            </div>
          </div>
          <div css={styles.type}>
            <div className='title'>
              <p>適用規則：</p>
            </div>
            <div className="container">
              <div>
                <TextField
                  label='門檻'
                  variant='outlined'
                  value={inputValue.thresholdPrice}
                  onFocus={e => e.target.select()}
                  onChange={e => {
                    const value = e.target.value
                    if (value.match(/^[0-9]*$/)) {
                      handleValueChange('thresholdPrice', Number(value))
                    }
                  }}
                />
                <TextField
                  label='每單發券上限'
                  variant='outlined'
                  value={inputValue.maxCountPerOrder}
                  onFocus={e => e.target.select()}
                  onChange={e => {
                    const value = e.target.value
                    if (value.match(/^[0-9]*$/)) {
                      handleValueChange('maxCountPerOrder', Number(value))
                    }
                  }}
                />
                <TextField
                  label='總張數上限'
                  variant='outlined'
                  value={inputValue.maxCountForGroup}
                  onFocus={e => e.target.select()}
                  onChange={e => {
                    const value = e.target.value
                    if (value.match(/^[0-9]*$/)) {
                      if (Number(value) > mainEvent.maxCount) {
                        openSnackbar({
                          message: `張數上限為${mainEvent.maxCount}`,
                          variant: 'warning'
                        })
                      } else {
                        handleValueChange('maxCountForGroup', Number(value))
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <Divider />
          <div css={styles.type}>
            <div className='title'>
              <p>入金儲值：</p>
            </div>
            <div className="container">
              <div>
                <FormControl variant="outlined">
                  <InputLabel>現金</InputLabel>
                  <Select
                    label='現金'
                    value={inputValue.walletDepositForCash.using}
                    onChange={e => {
                      handleWalletDepositChange('walletDepositForCash', 'using', e.target.value)
                    }}
                  >
                    <MenuItem value={false}>不套用</MenuItem>
                    <MenuItem value={true}>套用</MenuItem>
                  </Select>
                </FormControl>
                {inputValue.walletDepositForCash.using && (
                  <TextField
                    label='金額門檻'
                    variant='outlined'
                    value={inputValue.walletDepositForCash.price}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const value = e.target.value
                      if (value.match(/^[0-9]*$/)) {
                        handleTypeChange('walletDepositForCash', 'price', Number(value))
                      }
                    }}
                  />
                )}
              </div>
            </div>
            <div className="container" style={{ marginTop: 25 }}>
              <div>
                <FormControl variant="outlined">
                  <InputLabel>其他付款方式</InputLabel>
                  <Select
                    label='其他付款方式'
                    value={inputValue.walletDepositForOtherPay.using}
                    onChange={e => handleWalletDepositChange('walletDepositForOtherPay', 'using', e.target.value)}
                  >
                    <MenuItem value={false}>不套用</MenuItem>
                    <MenuItem value={true}>套用</MenuItem>
                  </Select>
                </FormControl>
                {inputValue.walletDepositForOtherPay.using && (
                  <TextField
                    label='金額門檻'
                    variant='outlined'
                    value={inputValue.walletDepositForOtherPay.price}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const value = e.target.value
                      if (value.match(/^[0-9]*$/)) {
                        handleTypeChange('walletDepositForOtherPay', 'price', Number(value))
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
          <Divider />
          <FormControlLabel
            style={{ width: 'fit-content' }}
            control={<Checkbox color="primary" />}
            label='開啟簡訊通知'
            checked={inputValue.isSMSNotifyForGroup}
            onChange={(e, v) => handleValueChange('isSMSNotifyForGroup', v)}
          />
        </CardContent>
      </Card>
      <CardActions style={{ paddingLeft: 0 }}>
        <Button disabled={isClick} onClick={handleSubmit} color="primary" variant="contained">
          新增
        </Button>
      </CardActions>
    </Fragment>
  )
}
export default General