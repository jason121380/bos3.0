// 對話框內有 MUI Autocomplete，保留 MUI Dialog；名稱／網址已換 Field＋Input
import { Dialog, DialogContent, DialogTitle, DialogActions } from 'ui/modal-compat'
import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { CheckboxField } from 'ui/checkbox'
import { Button } from 'ui/button'
import { Field, Input } from 'ui/input'
import { useState, memo } from 'react'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import { useFetchMerchantAuthoritiesNameAndId } from 'hooks/useFetchGetMerchantAuthorities'
import useFetchCreateMerchantExternalLink from 'hooks/useFetchCreateMerchantExternalLink'
import useFetchUpdateMerchantExternalLink from 'hooks/useFetchUpdateMerchantExternalLink'
import useFetchDeleteMerchantExternalLink from 'hooks/useFetchDeleteMerchantExternalLink'
import useFetchCreateMerchantCusExternalLink from 'hooks/useFetchCreateMerchantCusExternalLink'
import useFetchUpdateMerchantCusExternalLink from 'hooks/useFetchUpdateMerchantCusExternalLink'
import useFetchDeleteMerchantCusExternalLink from 'hooks/useFetchDeleteMerchantCusExternalLink'
import { openSnackbar } from 'elements/snackbars'
import cloneDeep from 'lodash/cloneDeep'
import idx from 'idx'
import { Autocomplete } from 'ui/combobox'

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
      // mutation 失敗會拋錯（進 catch），成功一定有回傳
      await (isCus ?
        createCusLink({
          name: createData.name,
          url:  createData.url,
          isTop: createData.isTop
        })
        : createLink({
          name: createData.name,
          url:  createData.url,
          userAuthIds: createData.userAuthIds.map(d => d.id)
        }))
      openSnack('新增成功', 'success')
      refetchLink()
      onModalClose()
    } catch (error) {
      openSnack(error.message, 'error')
    }
  }

  const handleUpdateLink = async() => {
    setIsClick(true)
    if (handleCheckData(updateData)) return
    try {
      await (isCus ?
        updateCusLink({
          id: updateData.id,
          name: updateData.name,
          url:  updateData.url,
          isTop:  updateData.isTop
        })
        : updateLink({
          id: updateData.id,
          name: updateData.name,
          url:  updateData.url,
          userAuthIds: updateData.userAuthIds.map(d => d.id)
        }))
      openSnack('儲存成功', 'success')
      refetchLink()
      onModalClose()
    } catch (error) {
      openSnack(error.message, 'error')
    }
  }

  const handleDeleteLink = async() => {
    setIsClick(true)
    try {
      await (isCus ? deleteCusLink(updateData.id) : deleteLink(updateData.id))
      openSnack('刪除成功', 'success')
      refetchLink()
      onModalClose()
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
    <Dialog
      className="[&_.MuiDialog-paper]:overflow-y-visible [&_.MuiDialogContent-root]:overflow-y-visible [&_.MuiTypography-root]:text-[16px] [&_div.MuiDialogContent-root]:px-[24px] [&_div.MuiDialogContent-root]:py-[16px] [&_.MuiDialogActions-root]:flex [&_.MuiDialogActions-root]:justify-between [&_.MuiDialogActions-root]:px-[24px] [&_.MuiDialogActions-root]:pt-0 [&_.MuiDialogActions-root]:pb-[16px] [&_.MuiDialogActions-root]:flex-wrap [&_.MuiDialogActions-root]:gap-[10px] [&_.MuiDialogActions-spacing>:not(:first-child)]:ml-0 [&_.MuiDialogTitle-root]:pt-[8px] [&_.MuiDialogTitle-root]:pb-0"
      open={open}
      fullWidth
    >
      <DialogTitle>
        {`${isCreate ? '新增' : '編輯'}外部連結`}
        {isCus && (
          <CheckboxField
            className="ml-3"
            label="置頂"
            checked={handleGetValue('isTop')}
            onChange={(e, v) => handleInputOnChange('isTop', v)}
          />
        )}
      </DialogTitle>
      <div className="h-px bg-border" />
      <DialogContent className="flex flex-col gap-[10px]">
        <Field label="名稱">
          <Input
            placeholder='請輸入名稱'
            value={handleGetValue('name')}
            onChange={e => handleInputOnChange('name', e.target.value)}
          />
        </Field>
        <Field label="網址">
          <Input
            placeholder='請輸入網址 ex:https://www.mlgroup.io'
            value={handleGetValue('url')}
            onChange={e => handleInputOnChange('url', e.target.value)}
          />
        </Field>
        {!isCus && (
          <Field label="套用的角色權限">
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
                <TextField {...params} variant="outlined" placeholder="選擇權限" />
              )}
            />
          </Field>
        )}
      </DialogContent>
      <DialogActions>
        <div>
          {isCreate ? '' :
            <Button
              onClick={handleDeleteLink}
              disabled={isClick}
              variant="danger">刪除</Button>
          }
        </div>
        <div className="flex gap-[10px] flex-wrap">
          <Button disabled={isClick} variant="secondary" onClick={onModalClose}>取消</Button>
          <Button
            disabled={isClick}
            variant="primary"
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
