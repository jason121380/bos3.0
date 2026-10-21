// 裁切頭像的彈窗內含 react-easy-crop，Slider 已換 ui/slider，彈窗改用 ui/dialog
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from 'ui/dialog'
import { Slider } from 'ui/slider'
import idx from 'idx'
import PropTypes from 'prop-types'
import { Fragment, useState, useRef, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import CropImage from './CropImage'
import Resizer from "react-image-file-resizer";
import { openSnackbar } from 'elements/snackbars'
import useFetchSetUserAvatar from 'hooks/useFetchSetUserAvatar'
import { EditRounded as EditRoundedIcon } from 'ui/icons'
import { Avatar } from 'ui/avatar'
import { Button } from 'ui/button'
import { Card } from 'ui/card'

function ProfileDetails({
  profile,
  className,
  ...rest
}) {
  const [imageSrc, setImageSrc] = useState('');
  const [avatarSrc, setAvatarSrc] = useState(profile.avatar);
  const [open, setOpen] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [btnDisable, setBtnDisabled] = useState(false)
  const [rotation, setRotation] = useState(0)
  const inputRef = useRef(null)
  const { setUserAvatar } = useFetchSetUserAvatar()

  const resizeFile = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        300,
        300,
        "jpeg",
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
        setUserAvatar({
          file: compressImg,
        }).then(res => {
          if (res.data.setUserAvatar) {
            openSnackbar({
              message: '頭像上傳成功',
              variant: 'success'
            })
            window.location.reload()
          } else {
            openSnackbar({
              message: '頭像上傳失敗',
              variant: 'error'
            })
            setBtnDisabled(false)
          }
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
  }

  const handleClose = () => {
    setOpen(false)
    setBtnDisabled(false)
    setImageSrc('')
    setZoom(1)
    setRotation(0)
    inputRef.current.value = ''
  }
  return (
    <Fragment>
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
            maxZoom={10}
            aspect={1 / 1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
          <div className="mt-[10px] flex flex-wrap gap-x-[20px] gap-y-[10px]">
            <div className="flex min-w-[180px] grow items-center justify-end">
              <div style={{ width: '50px' }}>旋轉</div>
              <Slider value={rotation} min={0} max={360} step={1} onChange={(e, value) => setRotation(value)} />
            </div>
            <div className="flex min-w-[180px] grow items-center justify-end">
              <div style={{ width: '50px' }}>縮放</div>
              <Slider value={zoom} min={1} max={10} step={0.1} onChange={(e, value) => setZoom(value)} />
            </div>
          </div>

          <div className="my-2.5 flex justify-end gap-2">
            <Button disabled={btnDisable} variant='ghost' onClick={handleClose}>取消</Button>
            <Button disabled={btnDisable} onClick={showCroppedImage} variant='primary'>確認上傳</Button>
          </div>
        </DialogBody>
        </DialogContent>
      </Dialog>
      <Card {...rest} className={className}>
        <div className="flex flex-col items-center p-5 text-center">
          <div style={{ position: 'relative' }}>
            <Avatar
              className="h-[100px] w-[100px]"
              src={avatarSrc}
            />
            <input
              id='upload'
              type="file"
              accept=".jpg, .png, .webp"
              style={{ display: "none" }}
              onChange={onSelectFile}
              ref={inputRef}
            />
            <label
              className="absolute bottom-0 right-[-15px] flex cursor-pointer items-center text-text-secondary hover:text-text"
              htmlFor="upload"
              aria-label="更換頭像"
            >
              <EditRoundedIcon />
            </label>
          </div>
          <h3 className="mt-3 text-heading text-text">
            {idx(profile, _ => _.name)}
          </h3>
          <p className="mt-1 text-body text-text-secondary">
            {idx(profile, _ => _.userGroup)}
          </p>
          <p className="text-caption text-text-secondary">
            {idx(profile, _ => _.merchantIdentity.authorityName)}
          </p>
        </div>
      </Card>
    </Fragment>
  )
}

ProfileDetails.propTypes = {
  className: PropTypes.string,
  profile: PropTypes.object.isRequired,
}

export default ProfileDetails
