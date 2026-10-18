/** @jsxImportSource @emotion/react */
import {
  Dialog, DialogContent, DialogTitle, Divider, DialogActions,
  TextField, Button, ThemeProvider, Checkbox, FormControlLabel,
  Autocomplete
} from '@mui/material'
import { useState, memo } from 'react'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { useFetchMerchantAuthoritiesNameAndId } from 'hooks/useFetchGetMerchantAuthorities'
import useFetchCreateMerchantExternalLink from 'hooks/useFetchCreateMerchantExternalLink'
import useFetchUpdateMerchantExternalLink from 'hooks/useFetchUpdateMerchantExternalLink'
import useFetchDeleteMerchantExternalLink from 'hooks/useFetchDeleteMerchantExternalLink'
import useFetchCreateMerchantCusExternalLink from 'hooks/useFetchCreateMerchantCusExternalLink'
import useFetchUpdateMerchantCusExternalLink from 'hooks/useFetchUpdateMerchantCusExternalLink'
import useFetchDeleteMerchantCusExternalLink from 'hooks/useFetchDeleteMerchantCusExternalLink'
import { styles, theme } from './styles/OuterLinkModal'
import { openSnackbar } from 'elements/snackbars'
import { cloneDeep } from 'lodash'
import idx from 'idx'

const OuterLinkModal = ({
  isCus = false,
  open,
  onModalClose,
  isCreate,
  updateData,
  setUpdateData,
  refetchLink
}) => {
  const { createLink } = useFetchCreateMerchantExternalLink()
  const { updateLink } = useFetchUpdateMerchantExternalLink()
  const { deleteLink } = useFetchDeleteMerchantExternalLink()
  const { createCusLink } = useFetchCreateMerchantCusExternalLink()
  const { updateCusLink } = useFetchUpdateMerchantCusExternalLink()
  const { deleteCusLink } = useFetchDeleteMerchantCusExternalLink()
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
  const checkedIcon = <CheckBoxIcon fontSize="small" />
  const authoritiesNameAndId = useFetchMerchantAuthoritiesNameAndId()
  const [isClick, setIsClick] = useState(false)
  const [createData, setCreateData] = useState({
    name: '',
    url: '',
    isTop: false,
    userAuthIds: []
  })
  const handleGetValue = key => {
    return isCreate ? createData[key] : updateData[key]
  }

  const openSnack = (msg, variant = 'warning') => {
    setIsClick(false)
    variant !== 'success' && openSnackbar({
      message: msg,
      variant: variant,
    })
  }
  
  const handleCheckData = data => {
    if (data.name.trim() === '') {
      openSnack('請輸入名稱')
      return true
    }
    if (data.url.trim() === '') {
      openSnack('請輸入網址')
      return true
    }
  }

  const handleCreateLink = async() => {
    setIsClick(true)
    if (handleCheckData(createData)) return
    try {
      const returnData = isCus ? 
        await createCusLink({
          name: createData.name,
          url:  createData.url,
          isTop: createData.isTop
        })
        : await createLink({
          name: createData.name,
          url:  createData.url,
          userAuthIds: createData.userAuthIds.map(d => d.id)
        })

      if (returnData) {
        openSnack('新增成功', 'success')
        refetchLink()
        onModalClose()
      }
    } catch (error) {
      openSnack(error.message, 'error')
    }
  }

  const handleUpdateLink = async() => {
    setIsClick(true)
    if (handleCheckData(updateData)) return
    try {
      const returnData = isCus ? 
        await updateCusLink({
          id: updateData.id,
          name: updateData.name,
          url:  updateData.url,
          isTop:  updateData.isTop
        })
        : await updateLink({
          id: updateData.id,
          name: updateData.name,
          url:  updateData.url,
          userAuthIds: updateData.userAuthIds.map(d => d.id)
        })
        
      if (returnData) {
        openSnack('儲存成功', 'success')
        refetchLink()
        onModalClose()
      }
    } catch (error) {
      openSnack(error.message, 'error')
    }
  }

  const handleDeleteLink = async() => {
    setIsClick(true)
    try {
      const returnData = isCus ? await deleteCusLink(updateData.id) : await deleteLink(updateData.id)
      if (returnData) {
        openSnack('刪除成功', 'success')
        refetchLink()
        onModalClose()
      }
    } catch (error) {
      openSnack(error.message, 'error')
    }
  }

  const handleInputOnChange = (key , value) => {
    const newData = cloneDeep(isCreate ? createData : updateData)
    newData[key] = value
    isCreate ? setCreateData(newData) : setUpdateData(newData)
  }
  
  return (
    <Dialog css={styles.root} open={open} fullWidth>
      <DialogTitle>
        {`${isCreate ? '新增' : '編輯'}外部連結`}
        {isCus && (
          <FormControlLabel
            control={<Checkbox color="primary" />}
            label="置頂"
            checked={handleGetValue('isTop')}
            onChange={(e, v) => handleInputOnChange('isTop', v)}
          />
        )}
      </DialogTitle>
      <Divider />
      <DialogContent css={styles.Content}>
        <TextField
          variant='outlined'
          label='名稱'
          placeholder='請輸入名稱'
          value={handleGetValue('name')}
          onChange={e => handleInputOnChange('name', e.target.value)}
        />
        <TextField
          variant='outlined'
          label='網址'
          placeholder='請輸入網址 ex:https://www.mlgroup.io'
          value={handleGetValue('url')}
          onChange={e => handleInputOnChange('url', e.target.value)}
        />
        {!isCus && (
          <Autocomplete
            multiple
            fullWidth
            autoHighlight
            options={!authoritiesNameAndId.loading ? idx(authoritiesNameAndId, _ => _.data.getMerchantAuthorities) : []}
            disableCloseOnSelect
            disabled={authoritiesNameAndId.loading}
            getOptionLabel={option => option.authorityName}
            value={handleGetValue('userAuthIds')}
            onChange={(e, v) => handleInputOnChange('userAuthIds', v)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  style={{ color: 'rgb(var(--text))', marginRight: 8 }}
                  icon={icon}
                  checkedIcon={checkedIcon}
                  checked={selected}
                />
                {option.authorityName}
              </li>
            )}
            renderInput={params => (
              <TextField {...params} variant="outlined" label="套用的角色權限" placeholder="選擇權限" />
            )}
          /> 
        )}
      </DialogContent>
      <DialogActions>
        <div>
          {isCreate ? '' :
            <ThemeProvider theme={theme}>
              <Button
                onClick={handleDeleteLink}
                disabled={isClick}
                color='primary'
                variant='contained'>刪除</Button>
            </ThemeProvider>
          }
        </div>
        <div css={styles.ButtonGroup}>
          <Button disabled={isClick} variant='contained' onClick={onModalClose}>取消</Button>
          <Button
            disabled={isClick}
            color='primary'
            variant='contained'
            onClick={() => isCreate ? handleCreateLink() : handleUpdateLink()}
            >
            {isCreate ? '新增' : '儲存'}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  )
}

export default memo(OuterLinkModal)