/** @jsxImportSource @emotion/react */
import { useState, useEffect, useRef, Fragment } from 'react'
import {
  Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Chip, IconButton,
  TextField, Grid, ThemeProvider
} from '@mui/material'
import { openSnackbar } from 'elements/snackbars'
import EditIcon from '@mui/icons-material/Edit'
import idx from 'idx';
import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types'
import { useFetchGetMerchantHairConditionLazy } from 'hooks/useFetchGetMerchantHairCondition'
import useFetchSetCustomerHairInfo from 'hooks/useFetchSetCustomerHairInfo'
import { green } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles'
import { css } from '@emotion/react'

const theme = createTheme({
  palette: {
    primary: {
      main: green[600]
    }
  }
})

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
      <Dialog maxWidth='md' fullWidth open={open} onClose={handleOnClose} css={styles.root} className='TrackingEditModal'>
        <DialogTitle css={styles.title}>
          編輯顧客髮況
        </DialogTitle>
        <DialogContent>
          <div css={styles.container}>
            {optionsArray.map((data, index) => {
              const [[key, title]] = Object.entries(data)
              return (
                <Grid key={`${key}-${index}`} container direction='row' alignItems='center' gap={1} flexWrap='nowrap'>
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
                  <IconButton
                    disabled={merchantHairConditionData.loading || !merchantHairConditionData.data}
                    onClick={() => handleOpenOptionModal({ key: key, title: title })}
                  >
                    <EditIcon />
                  </IconButton>
                </Grid>
              )
            })}
            <Grid container>
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
            </Grid>
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='inherit' onClick={handleOnClose}>關閉</Button>
          <Button variant='contained' ref={submitRef} disabled={isLoading} onClick={handleComfirm}>確認</Button>
        </DialogActions>
      </Dialog>
      {openOption && <Dialog maxWidth='sm' fullWidth open={openOption} onClose={handleOptionOnClose}>
        <DialogTitle css={styles.title}>
          選擇{selectCondition.title}
        </DialogTitle>
        <DialogContent>
          <div css={styles.optionContainer}>
            {(selectCondition.key && conditionOptions[selectCondition.key].length > 0) ? conditionOptions[selectCondition.key].map((data, index) => {
              const select = selectOption.includes(data)
              return (
                <ThemeProvider theme={theme} key={`${data}-${index}`}>
                  <Button
                    variant={select ? 'contained' : 'outlined'}
                    color='primary'
                    style={{ backgroundColor: select ? green[600] : '' }}
                    css={styles.box}
                    onClick={() => handleSelectItem(data, select)}
                  >{data}</Button>
                </ThemeProvider>
              )
            }) : '無資料'}
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='inherit' onClick={handleOptionOnClose}>關閉</Button>
          <Button variant='contained' onClick={handleComfirmSelect}>確認</Button>
        </DialogActions>
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