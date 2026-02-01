/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, CardHeader, TextField, Checkbox,
  Divider, Button, CardActions, FormControlLabel,
  ToggleButton, ToggleButtonGroup
} from '@mui/material'
import { Fragment } from 'react'
import { MobileDatePicker } from '@mui/x-date-pickers'
import MLAutocpmplete from 'components/MerchantListAutocpmpleteForManagement'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    marginTop: theme.spacing(3),
    '& .MuiCardHeader-action': {
      alignItems: ''
    }
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
  type: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
    '& p': {
      fontSize: 14,
      fontWeight: 500
    },
    '& .MuiFormControl-root': {
      width: 150
    },
  })
}

function General({ dateChange, inputValue, valueChange, isClick, submit }) {
  const PrivateToggle = () => (
    <ToggleButtonGroup onChange={(e, v) => v !== null && valueChange('isPublic', v)} value={inputValue.isPublic} exclusive>
      <ToggleButton value={true}>公開</ToggleButton>
      <ToggleButton value={false}>私人</ToggleButton>
    </ToggleButtonGroup>
  )

  return (
    <Fragment>
      <Card css={styles.root}>
        <CardHeader title='活動設定' action={<PrivateToggle />} />
        <Divider />
        <CardContent css={styles.content}>
          <div css={styles.date}>
            <MobileDatePicker
              closeOnSelect
              label="預設起始時間"
              showToolbar={false}
              value={inputValue.startDateDefault}
              format="yyyy/MM/dd"
              localeText={{
                toolbarTitle: '預設起始時間'
              }}
              slotProps={{
                toolbar: {
                  toolbarFormat: 'M月d日'
                }
              }}
              onChange={value => dateChange(new Date(value).getTime(), 'startDateDefault')}
            />
            <MobileDatePicker
              closeOnSelect
              label="預設結束時間"
              showToolbar={false}
              value={inputValue.endDateDefault}
              format="yyyy/MM/dd"
              localeText={{
                toolbarTitle: '預設結束時間'
              }}
              slotProps={{
                toolbar: {
                  toolbarFormat: 'M月d日'
                }
              }}
              onChange={value => dateChange(new Date(value).getTime(), 'endDateDefault')}
            />
          </div>
          <TextField
            label='活動名稱'
            placeholder='請輸入活動名稱'
            variant='outlined'
            value={inputValue.nameDefault}
            onChange={e => valueChange('nameDefault', e.target.value)}
          />
          {!inputValue.isPublic && (
            <MLAutocpmplete
              selectIds={inputValue.merchantIds}
              onValueChange={v => valueChange('merchantIds', v)}
            />
          )}
          <div css={styles.type}>
            <TextField
              label='總張數上限'
              variant='outlined'
              value={inputValue.maxCountDefault}
              onFocus={e => e.target.select()}
              onChange={e => {
                const value = e.target.value
                if (value.match(/^[0-9]*$/)) {
                  valueChange('maxCountDefault', Number(value))
                }
              }}
            />
            <FormControlLabel
              style={{ width: 'fit-content' }}
              control={<Checkbox color="primary" />}
              label='開啟簡訊通知'
              checked={inputValue.isSMSNotifyDefault}
              onChange={(e, v) => valueChange('isSMSNotifyDefault', v)}
            />
          </div>
        </CardContent>
      </Card>
      <CardActions style={{ paddingLeft: 0 }}>
        <Button disabled={isClick} onClick={submit} color="primary" variant="contained">
          新增
        </Button>
      </CardActions>
    </Fragment>
  )
}
export default General