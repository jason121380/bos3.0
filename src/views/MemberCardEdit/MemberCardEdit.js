import { Switch } from 'ui/switch'
import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import { useEffect, useState, Fragment } from 'react'
import { useHistory } from 'react-router'
import { useFetchGetMemberships, useFetchGetMembership } from 'hooks/useFetchGetMembership'
import { useFetchGetMembershipCategories } from 'hooks/useFetchGetMembershipCategory'
import useFetchUpdateMembership from 'hooks/useFetchUpdateMembership'
import produce from 'immer'
import idx from 'idx'

import { CirclePicker } from 'react-color'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input, Textarea } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { PageHeader } from 'ui/page-header'
import QueryFailed from 'components/QueryFailed'

// 色票浮層：沿用舊版置中固定定位（CirclePicker 接受 className）
const colorPickerClass =
  'fixed left-1/2 top-1/2 z-[1400] box-content -translate-x-1/2 -translate-y-1/2 rounded-md border border-solid border-border-strong bg-background pb-3 pl-5 pr-3 pt-5 shadow-float'
// 顏色預覽按鈕：背景色由 style 帶入目前色碼
const swatchClass = 'h-9 w-16 shrink-0 rounded-md border border-solid border-border-strong p-0'

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
    textColor: '#FFFFFF',
    image: '',
    comment: '',
  })
  const [colorData, setColorData] = useState(submitValue.color)
  const [colorTextData, setColorTextData] = useState(submitValue.textColor)
  const [showTextColorPicker, setShowTextColorPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  //disable 儲存
  const valid = !(submitValue.no && submitValue.name && submitValue.MembershipCategoryUUID)
  // 停用原因（STYLE.md §6）：依上方 valid 的三個必填欄位，只列目前真的缺的
  const missingFields = [!submitValue.no && '代號', !submitValue.name && '名稱', !submitValue.MembershipCategoryUUID && '會員卡類別'].filter(Boolean)

  // 拿到後端回傳的自來的資料先show出來
  useEffect(() => {
    if (!membership.loading) {
      const tmp = idx(membership, _ => _.data.membership)
      // 查詢失敗或查無此卡時不帶入（原本讀 undefined.uuid 整頁進入錯誤畫面）
      if (!tmp) return
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
          // 未分類的會員卡（membershipCategory 為 null）類別留空（原本讀 null.uuid 整頁進入錯誤畫面）
          draft.MembershipCategoryUUID = tmp.membershipCategory ? tmp.membershipCategory.uuid : ''
          draft.isAvailableForSale = tmp.isAvailableForSale
          draft.isLocked = tmp.isLocked
          draft.effecitveDay = tmp.effecitveDay
          draft.image = tmp.image
          draft.color = tmp.color !== null ? tmp.color : ''
          draft.textColor = tmp.textColor
          draft.comment = tmp.comment
        })
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [membership.loading])

  // 拿到此筆的index
  useEffect(() => {
    if (membershipList !== undefined && !membership.loading) {
      const currentMembershipID = idx(membership, _ => _.data.membership.uuid)
      setMembershipIndexArray(membershipList.data)
      membershipList.data.forEach((d, index) => {
        if (d.uuid === currentMembershipID) {
          setMembershipIndex(index)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
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
    if (parseInt(submitValue.effecitveDay, 10) < 0) {
      openSnackbar({ message: '請輸入有效期限大於或等於0', variant: 'error' })
    } else {
      updateMembership({
        ...submitValue,
        effecitveDay: parseInt(submitValue.effecitveDay, 10),
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
          // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
        })
    }
  }

  // 儲存並上一筆
  const handleToLastItem = () => {
    if (parseInt(submitValue.effecitveDay, 10) < 0) {
      openSnackbar({ message: '請輸入有效期限大於或等於0', variant: 'error' })
    } else {
      updateMembership({
        ...submitValue,
        effecitveDay: parseInt(submitValue.effecitveDay, 10),
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
          // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
        })
    }
  }
  //儲存並下一筆
  const handleToNextItem = () => {
    if (parseInt(submitValue.effecitveDay, 10) < 0) {
      openSnackbar({ message: '請輸入有效期限大於或等於0', variant: 'error' })
    } else {
      updateMembership({
        ...submitValue,
        effecitveDay: parseInt(submitValue.effecitveDay, 10),
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
          // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
        })
    }
  }

  return (
    <Page className="ui-root" title="編輯會員卡">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <PageHeader title="編輯會員卡" className="pb-0" />
        {membership.error ? (
          <QueryFailed onRetry={() => membership.refetch()} />
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>一般資訊</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Field label="代號">
                  <Input value={submitValue.no} onChange={event => handleOnChange({ event, key: 'no' })} />
                </Field>
                <Field label="名稱">
                  <Input value={submitValue.name} onChange={event => handleOnChange({ event, key: 'name' })} />
                </Field>
                <Field label="會員卡類別">
                  <NativeSelect
                    value={submitValue.MembershipCategoryUUID}
                    onChange={event => handleOnChange({ event, key: 'MembershipCategoryUUID' })}
                  >
                    {categories != null &&
                      categories.map((data, idx) => (
                        <NativeSelectOption key={`${data.uuid}-${idx}`} value={data.uuid}>
                          {data.no} / {data.name}
                        </NativeSelectOption>
                      ))}
                  </NativeSelect>
                </Field>
                <Field label="有效天數">
                  <Input
                    type="number"
                    name="effecitveDay"
                    value={submitValue.effecitveDay}
                    onChange={event => handleOnChange({ event, key: 'effecitveDay' })}
                    onWheel={() => document.activeElement.blur()}
                  />
                </Field>
                <div className="flex items-center gap-2">
                  <span className="text-label text-text">是否可販售</span>
                  <Switch
                    checked={submitValue.isAvailableForSale}
                    onChange={event => handleOnChange({ event, key: 'isAvailableForSale' })}
                    color="primary"
                    name="isAvailableForSale"
                  />
                </div>
                {submitValue.isAvailableForSale && (
                  <Field label="會員卡售價">
                    <Input
                      type="number"
                      value={submitValue.sellPrice}
                      onChange={event => handleOnChange({ event, key: 'sellPrice' })}
                      onWheel={() => document.activeElement.blur()}
                    />
                  </Field>
                )}
                <Field label="成本價格">
                  <Input
                    type="number"
                    value={submitValue.cost}
                    onChange={event => handleOnChange({ event, key: 'cost' })}
                    onWheel={() => document.activeElement.blur()}
                  />
                </Field>
                <Field label="員工自購價格">
                  <Input
                    type="number"
                    value={submitValue.employeePrice}
                    onChange={event => handleOnChange({ event, key: 'employeePrice' })}
                    onWheel={() => document.activeElement.blur()}
                  />
                </Field>
                <Field label="會員卡的顏色">
                  <div className="flex items-center gap-2.5">
                    <Input
                      className="w-60"
                      name="color"
                      value={submitValue.color}
                      onChange={event => {
                        setSubmitValue({ ...submitValue, color: event.target.value })
                      }}
                    />
                    <Button
                      aria-label="選擇會員卡的顏色"
                      className={swatchClass}
                      style={{
                        background: `${submitValue.color}`,
                      }}
                      onClick={() => {
                        setShowColorPicker(true)
                        setColorData(submitValue.color)
                      }}
                    />
                    {showColorPicker && (
                      <Fragment>
                        <CirclePicker
                          className={colorPickerClass}
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
                </Field>
                <Field label="會員卡文字的顏色">
                  <div className="flex items-center gap-2.5">
                    <Input
                      className="w-60"
                      name="textColor"
                      value={submitValue.textColor}
                      onChange={event => {
                        setSubmitValue({ ...submitValue, textColor: event.target.value })
                      }}
                    />
                    <Button
                      aria-label="選擇會員卡文字的顏色"
                      className={swatchClass}
                      style={{
                        background: `${submitValue.textColor}`,
                      }}
                      onClick={() => {
                        setShowTextColorPicker(true)
                        setColorTextData(submitValue.textColor)
                      }}
                    />
                    {showTextColorPicker && (
                      <Fragment>
                        <CirclePicker
                          className={colorPickerClass}
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
                </Field>
                <Field label="圖片">
                  <Input
                    name="image"
                    value={submitValue.image}
                    onChange={event => {
                      handleOnChange({ event, key: 'image' })
                    }}
                  />
                </Field>
                <Field label="會籍說明">
                  <Textarea
                    name="comment"
                    rows={4}
                    value={submitValue.comment}
                    onChange={event => {
                      handleOnChange({ event, key: 'comment' })
                    }}
                  />
                </Field>
                <Field label="打帳單是否能更改預設價格">
                  <NativeSelect name="isLocked" value={submitValue.isLocked} onChange={event => handleOnChange({ event, key: 'isLocked' })}>
                    {lockStatus.map((data, idx) => (
                      <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                        {data.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </Field>
              </CardContent>
            </Card>
            {submitValue.isAvailableForSale && !membership.loading && (
              <Card>
                <CardHeader>
                  <CardTitle>抽成</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Field label="抽成方式">
                    <NativeSelect
                      value={submitValue.commissionWay !== undefined && submitValue.commissionWay}
                      onChange={event => handleOnChange({ event, key: 'commissionWay' })}
                    >
                      {commissionWay.map((data, idx) => (
                        <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                          {data.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>
                  <Field label={submitValue.commissionWay === 'byCost' || submitValue.commissionWay === 'byPrice' ? '抽成數字%' : '抽成數字'}>
                    <Input
                      type="number"
                      value={submitValue.commission}
                      onChange={event => handleOnChange({ event, key: 'commission' })}
                      onWheel={() => document.activeElement.blur()}
                    />
                  </Field>
                </CardContent>
              </Card>
            )}
            <div className="flex flex-wrap items-center justify-end gap-2">
              {valid && (
                <p id="member-card-edit-missing" role="status" className="text-caption text-text-secondary">
                  {`尚缺：${missingFields.join('、')}`}
                </p>
              )}
              <Button variant="secondary" disabled={membershipIndex === 0 || valid} onClick={handleToLastItem}>
                儲存並上一筆
              </Button>
              <Button variant="secondary" disabled={membershipIndex === membershipIndexArray.length - 1 || valid} onClick={handleToNextItem}>
                儲存並下一筆
              </Button>
              <Button variant="primary" disabled={valid} aria-describedby={valid ? 'member-card-edit-missing' : undefined} onClick={handleSubmit}>
                儲存
              </Button>
            </div>
          </>
        )}
      </div>
    </Page>
  )
}
