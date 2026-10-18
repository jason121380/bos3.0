// 彈窗內有 MUI Select（Radix Dialog 會擋住其彈出層），保留 MUI Dialog；只換按鈕與分隔線
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem
} from "@mui/material"
import { useEffect, useState } from "react"
import { useFetchMerchantJobTitleForEmployeeList } from 'hooks/useFetchMerchantJobTitlePoint'
import useFetchSetPerformanceRuleFromPersonProfile from 'hooks/useFetchSetPerformanceRuleFromPersonProfile'
import produce from "immer"
import { openSnackbar } from "elements/snackbars"
import { Button } from 'ui/button'

const options = [
  { label: '人員身份', key: 'jobTitlePoint' },
  { label: '扣項方式', key: 'deductionWay' },
  { label: '抽成方式', key: 'rakeRule' }
]

const ProfileImportModal = ({ open, onClose, selectedDesigners, setSelectedDesigners }) => {
  const { setPersonProfile } = useFetchSetPerformanceRuleFromPersonProfile()
  const [onSubmit, setOnSubmit] = useState(false)
  const [getJobTitle, jobTitleData] = useFetchMerchantJobTitleForEmployeeList()
  const [vaild, setVaild] = useState(false)
  const [jobTitle, setJobTitle] = useState([])
  const [inputData, setInputData] = useState({
    jobTitlePointId: '',
    jobTitlePoint: false,
    deductionWay: false,
    rakeRule: false
  })

  const reset = () => {
    setJobTitle([])
    setOnSubmit(false)
    setInputData({
      jobTitlePointId: '',
      jobTitlePoint: false,
      deductionWay: false,
      rakeRule: false
    })
  }

  const handleSetProfileData = async () => {
    setOnSubmit(true)
    try {
      const res = await setPersonProfile({
        input: {
          ...inputData,
          userIds: selectedDesigners
        }
      })
      if (res.data.setPerformanceRuleFromPersonProfile) {
        reset()
        onClose()
        setSelectedDesigners([])
        openSnackbar({
          variant: 'success',
          message: '設定成功'
        })
      } else {
        openSnackbar({
          variant: 'warning',
          message: '設定失敗'
        })
        setOnSubmit(false)
      }
    } catch (error) {
      openSnackbar({
        variant: 'error',
        message: error.message
      })
      setOnSubmit(false)
    }
  }

  const handleSetInputData = (key, value) => {
    setInputData(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  useEffect(() => {
    if (open) {
      getJobTitle()
    } else {
      reset()
    }
  }, [open])

  useEffect(() => {
    if (!jobTitleData.loading && jobTitleData.data) {
      const data = jobTitleData.data.merchantJobTitlePoint
      setJobTitle(data)
    }
  }, [jobTitleData.loading])

  useEffect(() => {
    const check = inputData.jobTitlePointId && (inputData.jobTitlePoint || inputData.deductionWay || inputData.rakeRule)
    setVaild(check)
  }, [inputData])

  return (
    <Dialog fullWidth maxWidth='sm' open={open}>
      <DialogTitle>由人員身分設定檔導入</DialogTitle>
      <div className="h-px bg-border" />
      <DialogContent>
        <FormControl fullWidth variant="outlined" >
          <InputLabel>選擇人員身份類別</InputLabel>
          <Select
            label='選擇人員身份類別'
            value={inputData.jobTitlePointId}
            onChange={({ target }) => handleSetInputData('jobTitlePointId', target.value)}
          >
            {jobTitle.map(({ id, jobTitle }) => (
              <MenuItem value={id} key={id}>{jobTitle}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {options.map(({ label, key }) => (
          <div key={label}>
            <FormControlLabel
              control={<Checkbox color="primary" />}
              label={label}
              checked={inputData[key]}
              onChange={(e, v) => handleSetInputData(key, v)}
            />
          </div>
        ))}
      </DialogContent>
      <DialogActions className="ui-root">
        <Button variant='secondary' onClick={onClose} disabled={onSubmit}>關閉</Button>
        <Button variant='primary' onClick={handleSetProfileData} disabled={!vaild || onSubmit}>確認</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProfileImportModal