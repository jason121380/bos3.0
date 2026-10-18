/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, CardHeader, Divider, TextField, FormControl, InputLabel,
  MenuItem, Select, Button, CircularProgress, IconButton
} from '@mui/material'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import { memo, Fragment, useState, useEffect } from 'react'
import _ from 'lodash'
import useFetchSettingCommissionWay from 'hooks/useFetchSettingCommissionWay'
import styles from './styles/Services'
import produce from 'immer'
import idx from 'idx'
import { openSnackbar } from 'elements/snackbars'

const basisForDeductionSelection = [
  {
    value: 'BYORIGIN',
    label: '依原業績',
  },
  {
    value: 'BYFIXED',
    label: '依扣除手續費後業績',
  },
]

function Service({ className,
  merchantCommissionWay, 
  isSubmitForType,
  isSubmitForPoint,
  isSubmitForCommission,
  setIsSubmitForCommission,
  setIsSubmitForPoint,
  setIsSubmitForType
}) {
  const [service, setService] = useState({
    commission: [{ name: '', basisForDeduction: '' }],
  })

  const { setCommission } = useFetchSettingCommissionWay()

  useEffect(() => {
    if (!merchantCommissionWay.loading) {
      const commission = idx(merchantCommissionWay.data, _ =>
        _.merchantCommissionWay.length > 0
          ? _.merchantCommissionWay.map(d => ({
              name: d.name,
              basisForDeduction: d.basisForDeduction,
            }))
          : [{ name: '', basisForDeduction: '' }]
      )

      setService({commission})
    }
  }, [merchantCommissionWay.loading ])

  const handleServiceChange = ({ changedData, key }) => {
    setService(
      produce(draft => {
        draft[key] = changedData
      })
    )
  }
  const handleSubmit = async () => {
    let checkArray = []
    service.commission.map(d => {
      if (checkArray.indexOf(d.name) === -1) {
        checkArray.push(d.name)
      }
    })
    const basisForDeductionCount = service.commission.filter(d => d.basisForDeduction === '').length
    if (checkArray.length === service.commission.length) {
      if (basisForDeductionCount > 0) {
        openSnackbar({
          message: "請選擇服務扣項依據方式",
          variant: 'error',
        })
      } else {
        setCommission({ 
          input: service.commission
        }).then(res => {
          if(res.data.settingCommissionWay){
            openSnackbar({
              message: "編輯成功",
              variant: 'success',
            })
            merchantCommissionWay.refetch()
          } else {
            openSnackbar({
              message: "編輯失敗",
              variant: 'warning',
            })
          }
          setIsSubmitForCommission(false)
          setIsSubmitForPoint(false)
          setIsSubmitForType(false)
      }).catch(error => {
          openSnackbar({
            message: error.message,
            variant: 'error',
          })
          setIsSubmitForCommission(false)
          setIsSubmitForPoint(false)
          setIsSubmitForType(false)
        })
      }
    } else {
      openSnackbar({
        message: "服務扣項名稱已被重複",
        variant: 'error',
      })
    }
    
  }

  const handleAddSetting = (...rest) => {
    const newService = _.cloneDeep(service)
    switch (rest[0]) {
      case 'commission':
        newService.commission.push({ name: '', basisForDeduction: '' })
        handleServiceChange({ changedData: newService.commission, key: 'commission' })
        break
      case 'deductionItems':
        newService.deductionItems.push({ name: '' })
        handleServiceChange({ changedData: newService.deductionItems, key: 'deductionItems' })
        break
      default:
        break
    }
  }
  const handleDeleteSetting = (...rest) => {
    const newService = _.cloneDeep(service)
    switch (rest[0]) {
      case 'commission':
        newService.commission.splice(rest[1], 1)
        handleServiceChange({ changedData: newService.commission, key: 'commission' })
        break
      case 'deductionItems':
        newService.deductionItems.splice(rest[1], 1)
        handleServiceChange({ changedData: newService.deductionItems, key: 'deductionItems' })
        break
      default:
        break
    }
  }

  const handleCommissionName = (index, event) => {
    const newService = _.cloneDeep(service)
    newService.commission[index].name = event.target.value
    handleServiceChange({ changedData: newService.commission, key: 'commission' })
  }
  const handleCommissionBasisForDeduction = (index, event) => {
    const newService = _.cloneDeep(service)
    newService.commission[index].basisForDeduction = event.target.value
    handleServiceChange({ changedData: newService.commission, key: 'commission' })
  }
  const handleEdit = () =>{
    setIsSubmitForCommission(true)
    setIsSubmitForPoint(false)
    setIsSubmitForType(false)
  }
  return (
    <Fragment>
      <Card css={className}>
        <CardHeader 
          title="服務扣項方式命名" 
          action={
            isSubmitForCommission ? (
            <Button
              css={styles.saveButton}
              variant="contained"
              onClick={handleSubmit}
              data-testid="parameter"
            >
              儲存
            </Button>
            ) : (
            <Button
              color='primary'
              variant="contained"
              onClick={handleEdit}
              data-testid="parameter"
              disabled={merchantCommissionWay.loading || isSubmitForType || isSubmitForPoint}
            >
              編輯
            </Button>
          )}
        />
        <Divider />
        <CardContent>
          {!merchantCommissionWay.loading ? (
            service.commission.map((data, index) => (
              <div css={styles.serviceInputGroup} key={index}>
                <TextField
                  type="text"
                  variant="outlined"
                  label="服務扣項命名"
                  value={data.name}
                  disabled={!isSubmitForCommission}
                  onChange={event => handleCommissionName(index, event)}
                />
                <FormControl disabled={!isSubmitForCommission} variant="outlined" css={styles.field}>
                  <InputLabel>扣項依據方式</InputLabel>
                  <Select
                    label='扣項依據方式'
                    value={data.basisForDeduction}
                    onChange={event => handleCommissionBasisForDeduction(index, event)}
                  >
                    {basisForDeductionSelection.map((data, idx) => (
                      <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                        {data.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {service.commission.length > 1 && (
                  <IconButton
                    css={styles.action}
                    disabled={!isSubmitForCommission}
                    onClick={() => handleDeleteSetting('commission', index)}
                  >
                  <DeleteForeverIcon/>
                  </IconButton>
                )}
                {index === service.commission.length - 1 && (
                  <IconButton
                    css={styles.action}
                    disabled={!isSubmitForCommission}
                    onClick={() =>  handleAddSetting('commission')}
                  >
                    <AddIcon/>
                  </IconButton>
              )}
              </div>
          ))):(
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </div>
          )}
        </CardContent>
      </Card>
    </Fragment>
  )
}

export default memo(Service)
