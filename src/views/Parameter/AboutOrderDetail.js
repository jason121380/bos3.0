// 裁切對話框 Slider 已換 ui/slider、Dialog 已換 ui/dialog；多行與 InputLabelProps 的文字欄位使用 ui/text-field TextField
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from 'ui/dialog'
import { TextField } from 'ui/text-field'
import { Avatar } from 'ui/avatar'
import { Slider } from 'ui/slider'
import { CheckboxField } from 'ui/checkbox'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo, useRef, useState, useCallback } from 'react'
import { EditRounded as EditRoundedIcon } from 'ui/icons'
import Resizer from "react-image-file-resizer";
import Cropper from 'react-easy-crop'
import CropImage from './CropImage'
import { openSnackbar } from 'elements/snackbars';
import produce from 'immer';
function AboutOrderCreate({
  className, orderCreateSetting, setOrderCreateSetting, uploadMerchantLogo, inputEnable,
}) {
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
        file,
        100,
        100,
        "png",
        70,
        0,
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
        uploadMerchantLogo({
          file: compressImg,
        }).then(res => {
          if (res.data.setOrderDetailMerchantLogo) {
            openSnackbar({
              message: '店家Logo上傳成功',
              variant: 'success'
            })
            setOpen(false)
            handleSetValue(res.data.setOrderDetailMerchantLogo, 'logoDisplayOnInvoice', 'imageUrl')
          } else {
            openSnackbar({
              message: '店家Logo上傳失敗',
              variant: 'error'
            })
          }
          setCrop({ x: 0, y: 0 })
          setZoom(1)
          setBtnDisabled(false)
        })
          .catch(error => {
            openSnackbar({
              message: error.message,
              variant: 'error'
            })
            setBtnDisabled(false)
          })
      }
    } catch (error) {
      setBtnDisabled(false)
      openSnackbar({
        message: error.message,
        variant: 'error'
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [croppedAreaPixels] 變動時執行；handleSetValue、imageSrc、rotation、uploadMerchantLogo 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [croppedAreaPixels])

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
  const handleSetValue = (value, key1, key2) => {
    setOrderCreateSetting(
      produce(draft => {
        draft[key1][key2] = value
      })
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>帳單明細顯示設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col mb-[24px] ml-[20px]">
          <div className="flex items-center mb-[14px]">店家Logo設定</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30 }}>
            <input
              id='upload'
              type="file"
              accept=".jpg, .png, .webp"
              style={{ display: "none" }}
              onChange={onSelectFile}
              ref={inputRef}
            />
            <label
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              htmlFor="upload"
              ref={inputRef}
            >
              {orderCreateSetting.logoDisplayOnInvoice.imageUrl ? (
                <div style={{ position: 'relative' }}>
                  <Avatar
                    src={orderCreateSetting.logoDisplayOnInvoice.imageUrl}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckboxField
                disabled={!inputEnable}
                label="啟用"
                checked={orderCreateSetting.logoDisplayOnInvoice.isDisplay}
                onChange={e => handleSetValue(e.target.checked, 'logoDisplayOnInvoice', 'isDisplay')}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col mb-[24px] ml-[20px]">
          <div style={{ marginBottom: '0' }} className="flex items-center mb-[14px]">
            店家Qrcode設定
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 20 }}>
              <CheckboxField
                label="啟用"
                checked={orderCreateSetting.qrcodeDisplayOnInvoice.isDisplay}
                disabled={!inputEnable}
                onChange={e => handleSetValue(e.target.checked, 'qrcodeDisplayOnInvoice', 'isDisplay')}
              />
            </div>
          </div>
          <TextField
            label='店家網址'
            variant="outlined"
            value={orderCreateSetting.qrcodeDisplayOnInvoice.url ? orderCreateSetting.qrcodeDisplayOnInvoice.url : ''}
            InputLabelProps={{ shrink: true }}
            disabled={!inputEnable}
            onChange={e => handleSetValue(e.target.value, 'qrcodeDisplayOnInvoice', 'url')}
            placeholder={`請輸入網址 ex: www.mlgroup.io`}
          />
        </div>
        <div className="flex flex-col mb-[24px] ml-[20px]">
          <div style={{ marginBottom: '0' }} className="flex items-center mb-[14px]">
            文字內容設定
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 20 }}>
              <CheckboxField
                label="啟用"
                disabled={!inputEnable}
                checked={orderCreateSetting.messageDisplayOnInvoice.isDisplay}
                onChange={e => handleSetValue(e.target.checked, 'messageDisplayOnInvoice', 'isDisplay')}
              />
            </div>
          </div>
          <TextField
            label='文字內容'
            variant="outlined"
            value={orderCreateSetting.messageDisplayOnInvoice.message ? orderCreateSetting.messageDisplayOnInvoice.message : ''}
            placeholder='請輸入文字內容'
            disabled={!inputEnable}
            multiline
            minRows={3}
            maxRows={3}
            InputLabelProps={{ shrink: true }}
            onChange={e => handleSetValue(e.target.value, 'messageDisplayOnInvoice', 'message')}
          />
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
            aspect={1/1}
            cropSize={{ width: 300, height: 300 }}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
          <div className="flex gap-x-[20px] gap-y-[10px] flex-wrap mt-[10px]">
            <div className="flex grow min-w-[180px] justify-end items-center">
              <div style={{ width: '50px' }}>旋轉</div>
              <Slider value={rotation} min={0} max={360} step={1} onChange={(e, value) => setRotation(value)} />
            </div>
            <div className="flex grow min-w-[180px] justify-end items-center">
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

export default memo(AboutOrderCreate)
