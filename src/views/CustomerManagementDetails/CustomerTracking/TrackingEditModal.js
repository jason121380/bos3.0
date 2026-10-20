/** @jsxImportSource @emotion/react */
// 可刪除的 Chip 保留相容層（ui/badge 不可刪除）；兩層彈窗內只有 TextField、按鈕，改 ui/dialog
import { Chip } from 'ui/misc-compat'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { TextField } from 'ui/text-field'
import { useState, useEffect, useRef, Fragment } from 'react'
import { openSnackbar } from 'elements/snackbars'
import { Edit as EditIcon } from 'ui/icons'
import idx from 'idx';
import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types'
import { useFetchGetMerchantHairConditionLazy } from 'hooks/useFetchGetMerchantHairCondition'
import useFetchSetCustomerHairInfo from 'hooks/useFetchSetCustomerHairInfo'
import { green } from 'ui/colors';
import { css } from '@emotion/react'
// 動作與選項按鈕為 ui/button（選取綠色以 inline style 原樣保留）
import { Button as UiButton } from 'ui/button'

const styles = {
  root: css({
    '& .MuiDialogContent-root': {
      overflowY: 'visible'
    },
    '& .MuiInputLabel-root': {
      fontSize: 18
    },
    '& .MuiOutlinedInput-root': {
      gap: 10,
      minHeight: 50,
      padding: '10px 5px 10px 10px',
      flexWrap: 'wrap',
      '& input': {
        display: 'none'
      }
    },
    '& textarea': {
      padding: '0px !important'
    }
  }),
  title: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  }),
  container: css({
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 20
  }),
  optionContainer: css({
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap'
  }),
  box: css({
    minWidth: 'unset',
    maxWidth: 'unset',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }),
}

const TrackingEditModal = ({ open, setOpen, isLoading, hairCondition, optionsArray, customerId, refetchHairInfo }) => {
  const submitRef = useRef(null)
  const { setCustomerHairInfo } = useFetchSetCustomerHairInfo()
  const [submitValue, setSubmitValue] = useState({})
  const [openOption, setOpenOption] = useState(false);
  const [selectCondition, setSelectCondition] = useState({ key: '', title: '' });
  const [selectOption, setSelectOption] = useState([]);
  const [getMerchantHairCondition, merchantHairConditionData]  = useFetchGetMerchantHairConditionLazy()
  const conditionOptions = !merchantHairConditionData.loading && merchantHairConditionData.data && idx(merchantHairConditionData, _ => _.data.getMerchantHairCondition)

  const handleOnClose = () => {
    setOpen(false)
  }

  const handleOptionOnClose = () => {
    setOpenOption(false)
  }

  const handleDelete = (key, index) => {
    const newData = cloneDeep(submitValue)
    newData[key].splice(index, 1)
    setSubmitValue(newData)
  }

  const handleSelectItem = (data, select) => {
    let newSelectOption = cloneDeep(selectOption)
    if (select) {
      newSelectOption = newSelectOption.filter(d => d !== data)
    } else {
      newSelectOption.push(data)
    }
    setSelectOption(newSelectOption)
  }

  const handleInputChange = (value, key) => {
    const newData = cloneDeep(submitValue)
    newData[key] = value
    setSubmitValue(newData)
  }

  const handleComfirm = async() => {
    const value = cloneDeep({...submitValue, customerId: customerId})
    submitRef.current.disabled = true
    try {
      const returnData = await setCustomerHairInfo({
        input: value
      })
      if (returnData.data.setCustomerHairInfo) {
        openSnackbar({
          message: '編輯成功',
          variant: 'success',
        })
        refetchHairInfo()
        setOpen(false)
      } else {
        submitRef.current.disabled = false
        openSnackbar({
          message: '編輯失敗',
          variant: 'error',
        })
      }
    } catch (error) {
      submitRef.current.disabled = false
      openSnackbar({
        message: error.message,
        variant: 'error',
      })
    }
  }

  const handleOpenOptionModal = object => {
    const newValue = cloneDeep(submitValue[object.key])
    setSelectOption(newValue)
    setSelectCondition(object)
    setOpenOption(true)
  }

  const handleComfirmSelect = () => {
    const newSubmitValue = cloneDeep(submitValue)
    newSubmitValue[selectCondition.key] = selectOption
    setSubmitValue(newSubmitValue)
    handleOptionOnClose()
  }

  useEffect(() => {
    open && setSubmitValue(hairCondition)
  }, [hairCondition, open])

  useEffect(() => {
    open && getMerchantHairCondition()
  }, [open])

  return (
    <Fragment>
      <Dialog open={open} onOpenChange={o => !o && handleOnClose()}>
        <DialogContent size="lg" aria-describedby={undefined} css={styles.root} className='TrackingEditModal'>
          <DialogHeader>
            <DialogTitle css={styles.title}>
              編輯顧客髮況
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div css={styles.container}>
              {optionsArray.map((data, index) => {
                const [[key, title]] = Object.entries(data)
                return (
                  <div key={`${key}-${index}`} className="flex w-full flex-nowrap items-end gap-2">
                    <TextField
                      style={{ flexGrow: 1 }}
                      label={title}
                      InputProps={{
                        startAdornment: submitValue?.[key] && submitValue[key].map((value, i) => (
                          <Chip key={`${value}-${i}`} label={value} onDelete={() => handleDelete(key, i)} />
                        )),
                        readOnly: true
                      }}
                    />
                    <UiButton
                      variant="ghost" size="icon" className="h-8 w-8" aria-label="編輯選項" title="編輯選項"
                      disabled={merchantHairConditionData.loading || !merchantHairConditionData.data}
                      onClick={() => handleOpenOptionModal({ key: key, title: title })}
                    >
                      <EditIcon />
                    </UiButton>
                  </div>
                )
              })}
              <div className="flex w-full flex-wrap">
                <TextField
                  fullWidth
                  multiline
                  label='染髮配方'
                  value={submitValue.hairDyeFormula}
                  onChange={e => handleInputChange(e.target.value, 'hairDyeFormula')}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <UiButton variant="secondary" onClick={handleOnClose}>關閉</UiButton>
            <UiButton variant="primary" ref={submitRef} disabled={isLoading} onClick={handleComfirm}>確認</UiButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {openOption && <Dialog open={openOption} onOpenChange={o => !o && handleOptionOnClose()}>
        <DialogContent size="md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle css={styles.title}>
              選擇{selectCondition.title}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div css={styles.optionContainer}>
              {(selectCondition.key && conditionOptions[selectCondition.key].length > 0) ? conditionOptions[selectCondition.key].map((data, index) => {
                const select = selectOption.includes(data)
                return (
                  <UiButton
                    variant={select ? 'primary' : 'secondary'}
                    style={{ backgroundColor: select ? green[600] : '' }}
                    css={styles.box}
                    onClick={() => handleSelectItem(data, select)}
                  >{data}</UiButton>
                )
              }) : '無資料'}
            </div>
          </DialogBody>
          <DialogFooter>
            <UiButton variant="secondary" onClick={handleOptionOnClose}>關閉</UiButton>
            <UiButton variant="primary" onClick={handleComfirmSelect}>確認</UiButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>}
    </Fragment>
  )
}

TrackingEditModal.propTypes = {
  open: PropTypes.bool,
  isLoading: PropTypes.bool,
  hairCondition: PropTypes.object,
  setOpen: PropTypes.func,
  refetchHairInfo: PropTypes.func,
  customerId: PropTypes.string,
  optionsArray: PropTypes.array
}

export default TrackingEditModal