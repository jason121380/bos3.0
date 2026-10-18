/** @jsxImportSource @emotion/react */
import {
  Button,
  Container,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Switch,
} from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import idx from 'idx'
import React, { useState, Fragment } from 'react'
import { useHistory } from 'react-router'
import useFetchCreateMembership from 'hooks/useFetchCreateMembership'
import { useFetchGetMembershipCategories } from 'hooks/useFetchGetMembershipCategory'
import { useFetchGetMemberships } from 'hooks/useFetchGetMembership'
import { CirclePicker } from 'react-color'

import styles from './styles/MemberCardCreate'
//isLocked
const lockStatus = [
  {
    value: 'TRUE',
    label: '不可更改',
  },
  {
    value: 'FALSE',
    label: '可更改',
  },
  {
    value: 'UNSET',
    label: '依系統參數設定',
  },
]
// 抽成
const commissionWay = [
  { label: '固定金額', value: 'fixed' },
  { label: '依售價-成本(%)', value: 'byCost' },
  { label: '售價(%)', value: 'byPrice' },
]

export default function MemberCardCreate() {
  const history = useHistory()
  const [showTextColorPicker, setShowTextColorPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  // 是否顯示抽成的card
  const [forSale, setForSale] = useState(false)

  // 宣告新增會員卡mutation
  const { createMembership } = useFetchCreateMembership()

  // 拿到會員卡
  const memberships = useFetchGetMemberships({
    categoryUUIds: [],
    keyword: '',
    pageLimit: 50,
    pageOffset: 0,
  })

  // 拿到會員卡類別
  const categories = idx(
    useFetchGetMembershipCategories({
      paranoid: true,
    }),
    _ => _.data.membershipCategories
  )

  // 拿店家id
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null

  // 儲存要新增的值
  const [submitValue, setSubmitValue] = useState({
    cost: 0,
    sellPrice: 0,
    employeePrice: 0,
    no: '',
    name: '',
    MembershipCategoryUUID: '',
    commissionWay: 'fixed',
    commission: 0,
    isAvailableForSale: forSale,
    isLocked: 'UNSET',
    effecitveDay: 0,
    color: "#FFFFFF",
    textColor: "#FFFFFF",
    image: '',
    comment: ""
  })
  const [colorData, setColorData] = useState(submitValue.color)
  const [colorTextData, setColorTextData] = useState(submitValue.textColor)

  // 按新增
  const handleSubmit = () => {
    //如果抽成card關掉就把抽成的欄位拿掉
    try {
      if (!forSale) {
        setSubmitValue({
          ...submitValue,
          commissionWay: 'fixed',
          commission: 0,
          isAvailableForSale: false,
        })
      }
      if ( parseInt(submitValue.effecitveDay) < 0) {
        openSnackbar({ message: '請輸入有效期限大於或等於0', variant: 'error' })
      } else {
        createMembership({
          ...submitValue,
          OfficialBrandMerchantId: merchantId,
        })
          .then(() => {
            openSnackbar({ message: '成功會員卡', variant: 'success' })
            memberships.refetch()
            history.push('/member-card-record')
          })
          .catch(err => {
            openSnackbar({ message: err.message, variant: 'error' })
          })
      }
    } catch (error) {
      openSnackbar({ message: error.message, variant: 'error' })
    }
  }
  //disable 新增
  const valid = !(submitValue.no && submitValue.name && submitValue.MembershipCategoryUUID)

  return (
    <Page css={styles.root} title="新增會員卡">
      <Container maxWidth="md">
        <PageTitle title='新增會員卡' subTitle='Create Membership' />
        <Card css={styles.actions}>
          <CardHeader title="一般資訊" />
          <CardContent>
            <TextField
              label="代號"
              variant="outlined"
              fullWidth
              css={styles.formGroup}
              name="no"
              inputProps={{
                'data-testid': 'no',
                required: '代號 為必填',
              }}
              onChange={e => setSubmitValue({ ...submitValue, no: e.target.value })}
            />
            <TextField
              label="名稱"
              css={styles.formGroup}
              variant="outlined"
              fullWidth
              name="name"
              inputProps={{
                'data-testid': 'name',
                required: '名稱 為必填',
              }}
              onChange={e => setSubmitValue({ ...submitValue, name: e.target.value })}
            />
            <FormControl variant="outlined" fullWidth>
              <InputLabel>會員卡類別</InputLabel>
              <Select
                label='會員卡類別'
                name="MembershipCategoryUUID"
                defaultValue=""
                data-testid="btn"
                inputProps={{
                  'data-testid': 'name',
                  required: '會員卡類別 為必填',
                }}
                onChange={event => {
                  setSubmitValue({ ...submitValue, MembershipCategoryUUID: event.target.value })
                }}
              >
                {categories != undefined &&
                  categories.map((data, idx) => (
                    <MenuItem key={`${data.uuid}-${idx}`} value={data.uuid}>
                      {data.no} / {data.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              type="number"
              label="有效天數"
              variant="outlined"
              fullWidth
              css={styles.textFieldFormGroup}
              name="effecitveDay"
              onChange={event => {
                setSubmitValue({ ...submitValue, effecitveDay: parseInt(event.target.value) })
              }}
              onWheel={() => document.activeElement.blur()}              
            />
            <div css={styles.isAvailableForSaleDiv}>
              <span>是否可販售</span>
              <Switch
                name="isAvailableForSale"
                checked={forSale}
                onChange={() => {
                  setForSale(!forSale)
                  setSubmitValue({ ...submitValue, isAvailableForSale: !forSale})
                }}              
              />
            </div>
            {forSale && (
            <TextField
              type="number"
              label="會員卡價格"
              variant="outlined"
              fullWidth
              name="sellPrice"
              css={styles.formGroup}
              onChange={event => {
                setSubmitValue({ ...submitValue, sellPrice: parseFloat(event.target.value) })
              }}
              onWheel={() => document.activeElement.blur()}              
            />)}
            <TextField
              type="number"
              label="成本價格"
              variant="outlined"
              fullWidth
              name="cost"
              css={styles.formGroup}
              onChange={event => {
                setSubmitValue({ ...submitValue, cost: parseFloat(event.target.value) })
              }}
              onWheel={() => document.activeElement.blur()}              
            />
            <TextField
              type="number"
              label="員工自購價格"
              variant="outlined"
              fullWidth
              name="employeePrice"
              css={styles.formGroup}
              onChange={event => {
                setSubmitValue({ ...submitValue, employeePrice: parseFloat(event.target.value) })
              }}
              onWheel={() => document.activeElement.blur()}              
            />
            <div css={styles.formGroup} style={{display: 'flex', alignItems: 'center'}}>
              <TextField
                label="會員卡的顏色"
                variant="outlined"
                name="color"
                value={submitValue.color}
                onChange={event => {
                  setSubmitValue({ ...submitValue, color: event.target.value})
                }}
              />
              <Button
                  style={{ 
                    background: `${submitValue.color}`,
                    marginLeft: '10px',
                    height: '40px',
                    border: '1px solid rgb(var(--border-strong))',
                  }}
                  onClick={() => {
                    setShowColorPicker(true)
                    setColorData(submitValue.color)
                  }}
              />
              {showColorPicker && (
                  <Fragment>
                    <CirclePicker
                      css={styles.colorPicker}
                      disableAlpha
                      color={colorData}
                      onChange={event => {
                        setColorData(event.hex)
                        setSubmitValue({ ...submitValue, color: event.hex })
                        setShowColorPicker(false)
                      }}
                    />
                  </Fragment>
                )}
            </div>
            <div css={styles.formGroup} style={{display: 'flex', alignItems: 'center'}}>
              <TextField
                label="會員卡文字的顏色"
                variant="outlined"
                name="textColor"
                value={submitValue.textColor}
                onChange={event => {
                  setSubmitValue({ ...submitValue, textColor: event.target.value })
                }}
              />
              <Button
                  style={{ 
                    background: `${submitValue.textColor}`,
                    marginLeft: '10px',
                    height: '40px',
                    border: '1px solid rgb(var(--border-strong))',
                  }}
                  onClick={() => {
                    setShowTextColorPicker(true)
                    setColorTextData(submitValue.textColor)
                  }}
              />
              {showTextColorPicker && (
                <Fragment>
                  <CirclePicker
                    css={styles.colorPicker}
                    disableAlpha
                    color={colorTextData}
                    onChange={event => {
                      setColorTextData(event.hex)
                      setSubmitValue({ ...submitValue, textColor: event.hex })
                      setShowTextColorPicker(false)
                    }}
                  />
                </Fragment>
              )}
            </div>
            <TextField
              label="圖片"
              variant="outlined"
              fullWidth
              name="image"
              css={styles.formGroup}
              onChange={event => {
                setSubmitValue({ ...submitValue, image: event.target.value })
              }}
            />
             <TextField
              label="會籍說明"
              variant="outlined"
              fullWidth
              name="comment"
              multiline
              minRows="4"
              css={styles.formGroup}
              onChange={event => {
                setSubmitValue({ ...submitValue, comment: event.target.value })
              }}
            />
            <FormControl variant="outlined" fullWidth css={styles.formGroup}>
              <InputLabel>打帳單是否能更改預設價格</InputLabel>
              <Select
                label='打帳單是否能更改預設價格'
                defaultValue="UNSET"
                name="isLocked"
                onChange={event => {
                  setSubmitValue({ ...submitValue, isLocked: event.target.value })
                }}
              >
                {lockStatus.map((data, idx) => (
                  <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                    {data.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
        {forSale && (
          <Card css={styles.aboutPayment}>
            <CardHeader title="抽成" />
            <CardContent>
              <FormControl
                defaultValue=""
                variant="outlined"
                css={styles.formGroup}
                fullWidth
              >
                <InputLabel>抽成方式</InputLabel>
                <Select
                  label='抽成方式'
                  name="commissionWay"
                  onChange={event => {
                    setSubmitValue({ ...submitValue, commissionWay: event.target.value })
                  }}
                >
                  {commissionWay.map((data, idx) => (
                    <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                      {data.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                type="number"
                label={
                  submitValue.commissionWay === 'byCost' || submitValue.commissionWay === 'byPrice'
                    ? '抽成數字%'
                    : '抽成數字'
                }
                variant="outlined"
                fullWidth
                name="commission"
                css={styles.formGroup}
                onChange={event => {
                  setSubmitValue({ ...submitValue, commission: parseFloat(event.target.value) })
                }}
                onWheel={() => document.activeElement.blur()}              
              />
            </CardContent>
          </Card>
        )}
        <div css={styles.actions}>
          <Button
            color="primary"
            variant="contained"
            type="submit"
            data-testid="submit"
            onClick={() => handleSubmit()}
            disabled={valid}
          >
            新增
          </Button>
        </div>
      </Container>
     
    </Page>
  )
}
