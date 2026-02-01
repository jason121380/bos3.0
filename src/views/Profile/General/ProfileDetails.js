/** @jsxImportSource @emotion/react */
import {
  Avatar,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Slider,
} from '@mui/material'
import idx from 'idx'
import PropTypes from 'prop-types'
import { Fragment, useState, useRef, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import CropImage from './CropImage'
import Resizer from "react-image-file-resizer";
import { openSnackbar } from 'elements/snackbars'
import useFetchSetUserAvatar from 'hooks/useFetchSetUserAvatar'
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import _ from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../../theme'

const styles = {
  root: css({}),
  content: css({
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    textAlgin: 'center',
  }),
  name: css({
    marginTop: theme.spacing(1) + '!important',
  }),
  avatar: css({
    height: 100,
    width: 100,
  }),
  removeBotton: css({
    width: '100%',
  }),
  newAddCard: css({
    marginTop: '30px',
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
      <Dialog className='ProfileDetails' open={open} onClose={handleClose}>
        <DialogTitle style={{ paddingBottom: 0 }}>選取頭像範圍</DialogTitle>
        <DialogContent>
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
          <div css={styles.sliderContainer}>
            <div css={styles.slider}>
              <div style={{ width: '50px' }}>旋轉</div>
              <Slider value={rotation} min={0} max={360} step={1} onChange={(e, value) => setRotation(value)} />
            </div>
            <div css={styles.slider}>
              <div style={{ width: '50px' }}>縮放</div>
              <Slider value={zoom} min={1} max={10} step={0.1} onChange={(e, value) => setZoom(value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', columnGap: '20px', margin: '10px 0' }}>
            <Button disabled={btnDisable} color='primary' variant='contained' onClick={handleClose}>取消</Button>
            <Button disabled={btnDisable} onClick={showCroppedImage} color='primary' variant='contained'>確認上傳</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Card {...rest} css={css([styles.root, className])}>
        <CardContent css={styles.content}>
          <div style={{ position: 'relative' }}>
            <Avatar
              css={styles.avatar}
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
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'absolute', right: '-15px', bottom: 0 }}
              htmlFor="upload"
            >
              <EditRoundedIcon />
            </label>
          </div>
          <Typography css={styles.name} gutterBottom variant="h3">
            {idx(profile, _ => _.name)}
          </Typography>
          <Typography color="textSecondary" variant="body1">
            {idx(profile, _ => _.userGroup)}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {idx(profile, _ => _.merchantIdentity.authorityName)}
          </Typography>
        </CardContent>
      </Card>
    </Fragment>
  )
}

ProfileDetails.propTypes = {
  className: PropTypes.object,
  profile: PropTypes.object.isRequired,
}

export default ProfileDetails
