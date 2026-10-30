// 裁切對話框 Slider 已換 ui/slider、Dialog 已換 ui/dialog；多選 Autocomplete、數字欄位使用正式 ui 元件
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from 'ui/dialog'
import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { Avatar } from 'ui/avatar'
import { Slider } from 'ui/slider'
import { CheckboxField } from 'ui/checkbox'
import { Field } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { EditRounded as EditRoundedIcon, CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import Resizer from "react-image-file-resizer";
import Cropper from 'react-easy-crop'
import CropImage from './CropImage'
import { memo, Fragment, useState, useRef, useCallback } from 'react'
import produce from 'immer'
import { openSnackbar } from 'elements/snackbars';

import { Autocomplete } from 'ui/combobox'

const AfterCheckoutBanned = [
  { label: '打帳單', value: 'CREATEORDER' },
  { label: '材料自購', value: 'PICKING' },
  { label: '收支', value: 'BALANCE' },
]

const nameDisplaySetting = [
  { label: '只顯示姓名', value: 'NAME' },
  { label: '優先顯示暱稱', value: 'NICKNAME' },
  { label: '顯示 姓名（暱稱）', value: 'BOTH' },
]

const mode = [
  { label: '四捨五入', value: 'ROUNDING' },
  { label: '無條件進位', value: 'ROUNDUP' },
  { label: '無條件捨去', value: 'ROUNDDOWN' },
]

function AboutSettingFunction({
  className, aboutSettingFunction, setAboutSettingFunction,
  inputEnable, setMerchantAvatar, merchantLogo, setMerchantLogo
}) {
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
  const checkedIcon = <CheckBoxIcon fontSize="small" />
  const inputRef = useRef(null)
  const [imageSrc, setImageSrc] = useState('');
  const [open, setOpen] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [btnDisable, setBtnDisabled] = useState(false)
  const [rotation, setRotation] = useState(0)

  const resizeFile = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file, 100, 100, "png", 70, 0,
        (uri) => {
          resolve(uri);
        },
        "file"
      );
    });

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const showCroppedImage = useCallback(async () => {
    setBtnDisabled(true)
    try {
      const croppedImage = await CropImage(
        imageSrc,
        croppedAreaPixels,
        rotation
      )
      const compressImg = await resizeFile(croppedImage)
      if (typeof compressImg === 'object') {
        const res = await setMerchantAvatar({ file: compressImg })
        if (res.data.setMerchantAvatar) {
          openSnackbar({
            message: '店家Logo上傳成功',
            variant: 'success'
          })
          setOpen(false)
          setMerchantLogo(res.data.setMerchantAvatar)
        } else {
          throw new Error('店家Logo上傳失敗')
        }
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setBtnDisabled(false)
      }
    } catch (error) {
      setBtnDisabled(false)
      openSnackbar({
        message: error.message,
        variant: 'error'
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [croppedAreaPixels, setMerchantLogo] 變動時執行；imageSrc、rotation、setMerchantAvatar 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [croppedAreaPixels, setMerchantLogo])

  const onSelectFile = event => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", function () {
      setImageSrc(reader.result)
    }, false);
    setOpen(true)
    if (file) {
      reader.readAsDataURL(file);
    }
    event.target.value = null
  }

  const handleClose = () => {
    setOpen(false)
    setBtnDisabled(false)
    setImageSrc('')
    setZoom(1)
    setRotation(0)
    inputRef.current.value = ''
  }

  // 「啟用顧客自行建立客資功能」（顯示建檔連結、複製、下載 QRCode）已不在清單內，相關畫面與函式跑不到，2026/10/22 移除
  const settingArr = [
    { label: '商品自購可低於成本價', key: 'isUnlimProdEmpPrice' },
    { label: '啟用會員卡功能', key: 'isMemberShipCardActive' },
    { label: '啟用紅利點數功能', key: 'isCustomerBonusActive' },
    { label: '啟用快捷組合功能', key: 'isComboUsing' },
    { label: '排班表跨日是否自動清除定/跳班時間', key: 'isAutoClearAddedTimeInScheduleTable' },
    { label: '手機版設計師端 行事曆是否要顯示全店人員的資料', key: 'isMerchantScheduleDisplay' },
    { label: '顧客端消費紀錄是否顯示金額', key: 'isPriceDisplayOnCustomerSide' },
    { label: '該日尚有掛單未結帳，則無法日結', key: 'isDailyCheckoutBlockedByDraftOrder' },
    { label: '考勤排班總表上班時間是否顯示', key: 'isEmployeeScheduleWorkingHourDisplay' },
    { label: '側邊選單“報表及分析”是否展開報表細項', key: 'isReportListExtended' },
    { label: '排班表是否啟用"復原/重做"功能', key: 'isEmployeeScheduleUndoActive' },
    { label: '設計師端預約時間選項顯示全天時段', key: 'isBookingTimeNoLimit' },
    { label: '單日預約紀錄顯示設計師事件', key: 'isEventDisplayOnDayBookingRecord' },
    { label: '入金最終金額不得小於零', key: 'isWalletFinNonNeg' },
    { label: '顧客有綁定LINE@才給予紅利點數', key: 'isBonusRewardWithLine' },
    { label: '關閉掛單功能', key: 'disablePendingOrder' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>功能設定</CardTitle>
      </CardHeader>
      <CardContent>
        {settingArr.map(({ label, key }) => (
          <Fragment key={label}>
            <div className="flex items-center mb-[24px]">
              <CheckboxField
                disabled={!inputEnable}
                className="mx-[20px] my-0"
                label={label}
                checked={aboutSettingFunction[key]}
                onChange={(e, v) => {
                  setAboutSettingFunction(
                    produce(draft => { draft[key] = v })
                  )
                }}
              />
            </div>
          </Fragment>
        ))}
        <div
          className="flex items-center mb-[24px]"
          style={{ flexDirection: 'column', alignItems: 'flex-start' }}
        >
          <CheckboxField
            disabled={!inputEnable}
            className="mx-[20px] my-0"
            label='啟用紅利點數給點自動換算'
            checked={aboutSettingFunction.bonusRewardRule.isUsing}
            onChange={(e, v) => {
              setAboutSettingFunction(
                produce(draft => { draft.bonusRewardRule.isUsing = v })
              )
            }}
          />
          {aboutSettingFunction.bonusRewardRule.isUsing && (
            <div style={{ marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <TextField
                disabled={!inputEnable}
                style={{ marginLeft: 24, width: 80 }}
                type='number'
                label='消費多少元'
                variant='outlined'
                onWheel={() => document.activeElement.blur()}
                value={aboutSettingFunction.bonusRewardRule.rule.price}
                onChange={e => {
                  const value = Math.abs(parseFloat(e.target.value)) || 0
                  setAboutSettingFunction(
                    produce(draft => { draft.bonusRewardRule.rule.price = value })
                  )
                }}
              />
              <TextField
                disabled={!inputEnable}
                style={{ width: 80 }}
                type='number'
                label='得到一點'
                variant='outlined'
                onWheel={() => document.activeElement.blur()}
                value={aboutSettingFunction.bonusRewardRule.rule.bonus}
                onChange={e => {
                  const value = Math.abs(parseFloat(e.target.value)) || 0
                  setAboutSettingFunction(
                    produce(draft => { draft.bonusRewardRule.rule.bonus = value })
                  )
                }}
              />
              <Field label='換算規則'>
                <NativeSelect
                  disabled={!inputEnable}
                  fullWidth={false}
                  style={{ width: 120 }}
                  value={aboutSettingFunction.bonusRewardRule.rule.mode}
                  onChange={e => {
                    setAboutSettingFunction(
                      produce(draft => { draft.bonusRewardRule.rule.mode = e.target.value })
                    )
                  }}
                >
                  {mode.map((data, idx) => (
                    <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                      {data.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            </div>
          )}
        </div>
        <div
          style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: 40 }}
          className="flex items-center mb-[24px]"
        >
          <CheckboxField
            disabled={!inputEnable}
            className="mx-[20px] my-0"
            label='啟用紅利點數自動換算'
            checked={aboutSettingFunction.isBonusConversion}
            onChange={(e, v) => {
              setAboutSettingFunction(
                produce(draft => { draft.isBonusConversion = v })
              )
            }}
          />
          {aboutSettingFunction.isBonusConversion && (
            <TextField
              disabled={!inputEnable}
              style={{ margin: '0 24px'}}
              type='number'
              label='多少點折抵一元'
              variant='outlined'
              inputProps={{
                step: 0.1
              }}
              onWheel={() => document.activeElement.blur()}
              value={aboutSettingFunction.bonusConversionRate}
              onChange={e => {
                const value = Math.abs(parseFloat(e.target.value)) || 0
                setAboutSettingFunction(
                  produce(draft => { draft.bonusConversionRate = value })
                )
              }}
            />
          )}
        </div>
        <div className="flex flex-col mb-[32px] ml-[20px] gap-[10px]">
          <div>店家Logo設定</div>
          <div>
            <input
              id='upload'
              type="file"
              accept=".jpg, .png, .webp"
              style={{ display: "none" }}
              onChange={onSelectFile}
              ref={inputRef}
            />
            <label
              style={{ cursor: 'pointer', display: 'flex', width: 'fit-content' }}
              htmlFor="upload"
              ref={inputRef}
            >
              {merchantLogo ? (
                <div style={{ position: 'relative' }}>
                  <Avatar
                    src={merchantLogo}
                    className="h-20 w-20 rounded-md"
                  />
                  <EditRoundedIcon style={{ position: 'absolute', right: 0, bottom: 0, background: 'rgb(var(--border-strong))', borderRadius: "50%", padding: 5 }} />
                </div>
              ) :
                <Button
                  onClick={() => inputRef.current.click()}
                  variant="secondary"
                  disabled={!inputEnable}
                >上傳圖片</Button>
              }
            </label>
          </div>
        </div>
        <Field label='顧客端顯示設計師名稱'>
          <NativeSelect
            disabled={!inputEnable}
            fullWidth={false}
            className="w-[200px] flex mt-0 mx-[20px] mb-[24px]"
            value={aboutSettingFunction.designerNameForCustomerSide}
            onChange={e => {
              setAboutSettingFunction(
                produce(draft => { draft.designerNameForCustomerSide = e.target.value })
              )
            }}
          >
            {nameDisplaySetting.map((data, idx) => (
              <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                {data.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <div style={{ width: '100%', padding: '0px 20px 24px 20px' }}>
          <Field label="日結後鎖定的功能">
            <Autocomplete
              multiple
              options={AfterCheckoutBanned}
              disableCloseOnSelect
              disabled={!inputEnable}
              getOptionLabel={option => option.label}
              value={AfterCheckoutBanned.filter(d => aboutSettingFunction.actionsBannedAfterDailyCheckout.includes(d.value))}
              onChange={(e, v) => {
                setAboutSettingFunction(
                  produce(draft => { draft.actionsBannedAfterDailyCheckout = v.map(d => d.value) })
                )
              }}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    style={{ color: 'rgb(var(--text))', marginRight: 8 }}
                    icon={icon}
                    checkedIcon={checkedIcon}
                    checked={selected}
                  />
                  {option.label}
                </li>
              )}
              renderInput={params => (
                <TextField {...params} variant="outlined" label="功能名稱" placeholder="功能名稱" />
              )}
            />
          </Field>
        </div>
        <div>
          <div style={{ marginBottom: '15px', marginLeft: 20 }}>設定店家營業時間</div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <TextField
              variant='outlined'
              className="w-[150px] flex mx-[20px] my-0"
              disabled={!inputEnable}
              type="time"
              label="起始時間"
              value={aboutSettingFunction.openingTimeForDisplay.openingHoursForDisplay.slice(0, 5)}
              onChange={e => {
                setAboutSettingFunction(
                  produce(draft => { draft.openingTimeForDisplay.openingHoursForDisplay = e.target.value })
                )
              }}
            />
            <TextField
              variant='outlined'
              className="w-[150px] flex mx-[20px] my-0"
              disabled={!inputEnable}
              type="time"
              label="結束時間"
              value={aboutSettingFunction.openingTimeForDisplay.closingHoursForDisplay.slice(0, 5)}
              onChange={e => {
                setAboutSettingFunction(
                  produce(draft => { draft.openingTimeForDisplay.closingHoursForDisplay = e.target.value })
                )
              }}
            />
          </div>
        </div>
      </CardContent>
      {/* 裁切窗：只有裁切區與原生滑桿（無下拉／日期彈層），改用 ui Dialog；舊版沒有關閉鈕（Esc／點背景關閉），故 hideClose。
          裁切區高 300px、相對定位（原 initialize.scss .ProfileDetails .MuiDialog-paperWidthSm 規則）改在 DialogBody 上以 Tailwind 指定（選 react-easy-crop 容器的 data-testid="container"，即 .reactEasyCrop_Container） */}
      <Dialog open={open} onOpenChange={o => !o && handleClose()}>
        <DialogContent size="md" hideClose aria-describedby={undefined} className='ProfileDetails'>
        <DialogHeader className="pb-0">
          <DialogTitle>選取頭像範圍</DialogTitle>
        </DialogHeader>
        <DialogBody className="[&_[data-testid=container]]:!relative [&_[data-testid=container]]:h-[300px] [&_[data-testid=container]]:w-full">
          <Cropper
            rotation={rotation}
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            restrictPosition={false}
            minZoom={0.1}
            maxZoom={10}
            aspect={1 / 1}
            cropSize={{ width: 300, height: 300 }}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
          <div>
            <div>
              <div style={{ width: '50px' }}>旋轉</div>
              <Slider value={rotation} min={0} max={360} step={1} onChange={(e, value) => setRotation(value)} />
            </div>
            <div>
              <div style={{ width: '50px' }}>縮放</div>
              <Slider value={zoom} min={0.1} max={10} step={0.1} onChange={(e, value) => setZoom(value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', columnGap: '20px', margin: '10px 0' }}>
            <Button disabled={btnDisable} variant="secondary" onClick={handleClose}>取消</Button>
            <Button disabled={btnDisable} onClick={showCroppedImage} variant="primary">確認上傳</Button>
          </div>
        </DialogBody>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default memo(AboutSettingFunction)