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
import { useEffect, useState, Fragment } from 'react'
import { useHistory } from 'react-router'
import { useFetchGetMemberships, useFetchGetMembership } from 'hooks/useFetchGetMembership'
import { useFetchGetMembershipCategories } from 'hooks/useFetchGetMembershipCategory'
import useFetchUpdateMembership from 'hooks/useFetchUpdateMembership'
import produce from 'immer'
import idx from 'idx'

import styles from './styles/MemberCardEdit'
import { CirclePicker } from 'react-color'

// isLock
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

export default function MemberCardEdit({ match }) {
  const itemId = match.params.id
  const history = useHistory()

  // 會員卡類別的全部自來喔
  const categories = idx(
    useFetchGetMembershipCategories({
      paranoid: true,
    }),
    _ => _.data.membershipCategories
  )
  // 此會員卡的資料
  const membership = useFetchGetMembership(itemId)

  // 全部會員卡的資料
  const membershipList = idx(
    useFetchGetMemberships({
      pageLimit: 50,
      pageOffset: 0,
      keyword: '',
      categoryUUIds: [],
    }),
    _ => _.data.memberships
  )

  // 編輯會員卡的mutation
  const { updateMembership } = useFetchUpdateMembership()

  // 筆數
  const [membershipIndex, setMembershipIndex] = useState(0)
  const [membershipIndexArray, setMembershipIndexArray] = useState([])

  // show出來以及編輯的value
  const [submitValue, setSubmitValue] = useState({
    itemUUID: '',
    no: '',
    name: '',
    cost: 0,
    sellPrice: 0,
    employeePrice: 0,
    commission: 0,
    MembershipCategoryUUID: '',
    isAvailableForSale: false,
    isLocked: 'UNSET',
    color: '#FFFFFF',
    effecitveDay: 0,
    commissionWay: 'fixed',
    textColor: "#FFFFFF",
    image: '',
    comment: ""
  })
  const [colorData, setColorData] = useState(submitValue.color)
  const [colorTextData, setColorTextData] = useState(submitValue.textColor)
  const [showTextColorPicker, setShowTextColorPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  //disable 儲存
  const valid = !(submitValue.no && submitValue.name && submitValue.MembershipCategoryUUID)

  // 拿到後端回傳的自來的資料先show出來
  useEffect(() => {
    if (!membership.loading) {
      const tmp = idx(membership, _ => _.data.membership)
      setSubmitValue(
        produce(draft => {
          draft.itemUUID = tmp.uuid
          draft.no = tmp.no
          draft.name = tmp.name
          draft.cost = tmp.cost
          if (tmp.isAvailableForSale) {
            draft.sellPrice = tmp.sellPrice
            draft.commissionWay = tmp.commissionWay
          } else {
            draft.sellPrice = 0
          }
          draft.employeePrice = tmp.employeePrice
          draft.commission = tmp.commission
          draft.MembershipCategoryUUID = tmp.membershipCategory.uuid
          draft.isAvailableForSale = tmp.isAvailableForSale
          draft.isLocked = tmp.isLocked
          draft.effecitveDay = tmp.effecitveDay
          draft.image = tmp.image
          draft.color = tmp.color !== null ? tmp.color : ""
          draft.textColor = tmp.textColor
          draft.comment = tmp.comment
        })
      )
    }
  }, [membership.loading])

  // 拿到此筆的index
  useEffect(() => {
    if (membershipList !== undefined &&  !membership.loading) {
      const currentMembershipID = idx(membership, _ => _.data.membership.uuid)
      setMembershipIndexArray(membershipList.data)
      membershipList.data.map((d, index) => {
        if (d.uuid === currentMembershipID) {
          setMembershipIndex(index)
        }
      })
    }
  }, [membershipList, membership.loading])

  // 換資料
  const handleOnChange = ({ event, key }) => {
    if (event.persist) event.persist()
    setSubmitValue(
      produce(draft => {
        draft[key] = idx(event, _ => _.target.value)
        if (key === 'isAvailableForSale') {
          setSubmitValue(
            produce(draft => {
              draft[key] = event.target.checked
            })
          )
          if (event.target.checked === false) {
            setSubmitValue(
              produce(draft => {
                draft['commission'] = 0
                draft['commissionWay'] = 'fixed'
              })
            )
          }
        }
      })
    )
  }

  // 儲存
  const handleSubmit = () => {
    if ( parseInt(submitValue.effecitveDay)< 0) {
      openSnackbar({ message: '請輸入有效期限大於或等於0', variant: 'error' })
    } else {
      updateMembership({
        ...submitValue,
        effecitveDay: parseInt(submitValue.effecitveDay),
        employeePrice: parseFloat(submitValue.employeePrice),
        cost: parseFloat(submitValue.cost),
        sellPrice: parseFloat(submitValue.sellPrice),
        commission: parseFloat(submitValue.commission),
      })
        .then(() => {
          openSnackbar({ message: '成功更新會員卡', variant: 'success' })
          history.push('/member-card-record')
        })
        .catch(err => {
          openSnackbar({ message: err.message, variant: 'error' })
        })
    }
  }

  // 儲存並上一筆
  const handleToLastItem = () => {
    if ( parseInt(submitValue.effecitveDay)< 0) {
      openSnackbar({ message: '請輸入有效期限大於或等於0', variant: 'error' })
    } else {
      updateMembership({
        ...submitValue,
        effecitveDay: parseInt(submitValue.effecitveDay),
        employeePrice: parseFloat(submitValue.employeePrice),
        cost: parseFloat(submitValue.cost),
        sellPrice: parseFloat(submitValue.sellPrice),
        commission: parseFloat(submitValue.commission),
      })
        .then(() => {
          openSnackbar({ message: '成功更新會員卡', variant: 'success' })
          window.location.href = `/member-card/edit/${membershipIndexArray[membershipIndex - 1].uuid}`
        })
        .catch(err => {
          openSnackbar({ message: err.message, variant: 'error' })
        })
    }
  }
  //儲存並下一筆
  const handleToNextItem = () => {
    if ( parseInt(submitValue.effecitveDay)< 0) {
      openSnackbar({ message: '請輸入有效期限大於或等於0', variant: 'error' })
    } else {
      updateMembership({
        ...submitValue,
        effecitveDay: parseInt(submitValue.effecitveDay),
        employeePrice: parseFloat(submitValue.employeePrice),
        cost: parseFloat(submitValue.cost),
        sellPrice: parseFloat(submitValue.sellPrice),
        commission: parseFloat(submitValue.commission),
      })
        .then(() => {
          openSnackbar({ message: '成功更新會員卡', variant: 'success' })
          window.location.href = `/member-card/edit/${membershipIndexArray[membershipIndex + 1].uuid}`
        })
        .catch(err => {
          openSnackbar({ message: err.message, variant: 'error' })
        })
    }
  }

  return (
    <Page css={styles.root} title="編輯會員卡">
      <Container maxWidth="lg">
        <PageTitle title='編輯會員卡' subTitle='Membership Edit' />
        <Card css={styles.aboutPayment}>
          <CardHeader title="一般資訊" />
          <CardContent>
            <TextField
              label="代號"
              value={submitValue.no}
              variant="outlined"
              fullWidth
              onChange={event => handleOnChange({ event, key: 'no' })}
              css={styles.formGroup}
            />
            <TextField
              label="名稱"
              css={styles.formGroup}
              value={submitValue.name}
              onChange={event => handleOnChange({ event, key: 'name' })}
              variant="outlined"
              fullWidth
            />
            <FormControl variant="outlined" fullWidth>
              <InputLabel>會員卡類別</InputLabel>
              <Select
                label='會員卡類別'
                value={submitValue.MembershipCategoryUUID}
                onChange={event => handleOnChange({ event, key: 'MembershipCategoryUUID' })}
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
              value={submitValue.effecitveDay}
              onChange={event => handleOnChange({ event, key: 'effecitveDay' })}
              onWheel={() => document.activeElement.blur()}              
            />
            <div css={styles.isAvailableForSaleDiv}>
              <span>是否可販售</span>
              <Switch
                checked={submitValue.isAvailableForSale}
                onChange={event => handleOnChange({ event, key: 'isAvailableForSale' })}
                color="primary"
                name="isAvailableForSale"
              />
            </div>
            {submitValue.isAvailableForSale && (
              <TextField
                type="number"
                label="會員卡售價"
                variant="outlined"
                fullWidth
                value={submitValue.sellPrice}
                onChange={event => handleOnChange({ event, key: 'sellPrice' })}
                css={styles.formGroup}
                onWheel={() => document.activeElement.blur()}              
              />
            )}
            <TextField
              type="number"
              label="成本價格"
              variant="outlined"
              fullWidth
              css={styles.formGroup}
              value={submitValue.cost}
              onChange={event => handleOnChange({ event, key: 'cost' })}
              onWheel={() => document.activeElement.blur()}              
            />
            <TextField
              type="number"
              label="員工自購價格"
              variant="outlined"
              fullWidth
              value={submitValue.employeePrice}
              onChange={event => handleOnChange({ event, key: 'employeePrice' })}
              css={styles.formGroup}
              onWheel={() => document.activeElement.blur()}              
            />
            <div css={styles.formGroup} style={{display: 'flex', alignItems: 'center'}}>
              <TextField
                label="會員卡的顏色"
                variant="outlined"
                name="color"
                value={submitValue.color}
                onChange={event => {
                  setSubmitValue({...submitValue, color: event.target.value  })
                }}
              />
              <Button
                style={{ 
                  background: `${submitValue.color}`,
                  marginLeft: '10px',
                  height: '40px',
                  border: '1px solid #92929F',
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
                      setSubmitValue({...submitValue, color: event.hex  })
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
                  setSubmitValue({...submitValue, textColor: event.target.value  })
                }}
              />
              <Button
                style={{ 
                  background: `${submitValue.textColor}`,
                  marginLeft: '10px',
                  height: '40px',
                  border: '1px solid #92929F',
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
                        setSubmitValue({...submitValue, textColor: event.hex  })
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
              value={submitValue.image}
              onChange={event => {
                handleOnChange({ event, key: 'image' })
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
              value={submitValue.comment}
              onChange={event => {
                handleOnChange({ event, key: 'comment' })
              }}
            />
            <FormControl variant="outlined" fullWidth css={styles.formGroup}>
              <InputLabel>打帳單是否能更改預設價格</InputLabel>
              <Select
                label='打帳單是否能更改預設價格'
                name="isLocked"
                value={submitValue.isLocked}
                onChange={event => handleOnChange({ event, key: 'isLocked' })}
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
        {submitValue.isAvailableForSale && !membership.loading && (
          <Card css={styles.aboutPayment}>
            <CardHeader title="抽成" />
            <CardContent>
              <FormControl variant="outlined" css={styles.formGroup} fullWidth>
                <InputLabel>抽成方式</InputLabel>
                <Select
                  label='抽成方式'
                  value={submitValue.commissionWay !== undefined && submitValue.commissionWay}
                  onChange={event => handleOnChange({ event, key: 'commissionWay' })}
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
                value={submitValue.commission}
                onChange={event => handleOnChange({ event, key: 'commission' })}
                css={styles.formGroup}
                onWheel={() => document.activeElement.blur()}              
              />
            </CardContent>
          </Card>
        )}
        <div css={styles.actions}>
          <Button color="primary" variant="contained" disabled={valid} onClick={handleSubmit}>
            儲存
          </Button>
          <div css={styles.lastNextDiv}>
            <Button
              color="primary"
              variant="contained"
              disabled={membershipIndex === 0 || valid}
              onClick={handleToLastItem}
            >
              儲存並上一筆
            </Button>
            <Button
              color="primary"
              variant="contained"
              disabled={membershipIndex === membershipIndexArray.length - 1 || valid}
              onClick={handleToNextItem}
            >
              儲存並下一筆
            </Button>
          </div>
        </div>
      </Container>
    </Page>
  )
}
