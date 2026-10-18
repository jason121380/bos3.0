/** @jsxImportSource @emotion/react */
// 裁切對話框內有 MUI Slider，保留 MUI Dialog；多行與 InputLabelProps 的文字欄位保留 MUI TextField
import {
  Dialog, DialogContent, DialogTitle, Slider, TextField
} from '@mui/material'
import { Avatar } from 'ui/avatar'
import { CheckboxField } from 'ui/checkbox'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo, useRef, useState, useCallback } from 'react'
import { EditRounded as EditRoundedIcon } from 'ui/icons'
import Resizer from "react-image-file-resizer";
import Cropper from 'react-easy-crop'
import CropImage from './CropImage'
import { openSnackbar } from 'elements/snackbars';
import _ from 'lodash'
import produce from 'immer';
import { css } from '@emotion/react'

const styles = {
  root: css({}),
  serviceInputGroup: css({
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '24px',
    marginLeft: '20px'
  }),
  serviceInputTitle: css({
    display: 'flex',
    alignItems: 'center',
    marginBottom: '14px',
  }),
  avatar: css({
    height: 100,
    width: 100,
  }),
  sliderContainer: css({
    display: 'flex',
    gap: '10px 20px',
    flexWrap: 'wrap',
    marginTop: '10px',
  }),
  slider: css({
    display: 'flex',
    flexGrow: 1,
    minWidth: '180px',
    justifyContent: 'flex-end',
    alignItems: 'center'
  })
}

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
        <div css={styles.serviceInputGroup}>
          <div css={styles.serviceInputTitle}>店家Logo設定</div>
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
                  <EditRoundedIcon style={{ position: 'absolute', right: 0, bottom: 0, background: '#cccccc', borderRadius: "50%", padding: 5 }} />
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
        <div css={styles.serviceInputGroup}>
          <div style={{ marginBottom: '0' }} css={styles.serviceInputTitle}>
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
        <div css={styles.serviceInputGroup}>
          <div style={{ marginBottom: '0' }} css={styles.serviceInputTitle}>
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
      <Dialog className='ProfileDetails' open={open} onClose={handleClose}>
        <DialogTitle style={{ paddingBottom: 0 }}>選取頭像範圍</DialogTitle>
        <DialogContent>
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
          <div css={styles.sliderContainer}>
            <div css={styles.slider}>
              <div style={{ width: '50px' }}>旋轉</div>
              <Slider value={rotation} min={0} max={360} step={1} onChange={(e, value) => setRotation(value)} />
            </div>
            <div css={styles.slider}>
              <div style={{ width: '50px' }}>縮放</div>
              <Slider value={zoom} min={0.1} max={10} step={0.1} onChange={(e, value) => setZoom(value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', columnGap: '20px', margin: '10px 0' }}>
            <Button disabled={btnDisable} variant="secondary" onClick={handleClose}>取消</Button>
            <Button disabled={btnDisable} onClick={showCroppedImage} variant="primary">確認上傳</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default memo(AboutOrderCreate)
