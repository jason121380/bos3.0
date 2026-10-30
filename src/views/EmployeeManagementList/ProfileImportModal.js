// 共用圖層支援窗內 Select；保留無 onClose 的受控開關。
import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogBody, DialogFooter } from 'ui/dialog'
import { FormControlLabel, Checkbox } from 'ui/checkbox'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（getJobTitle）；只在 [open] 變動時呼叫，補上會每次 render 重跑
  }, [open])

  useEffect(() => {
    if (!jobTitleData.loading && jobTitleData.data) {
      const data = jobTitleData.data.merchantJobTitlePoint
      setJobTitle(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [jobTitleData.loading])

  useEffect(() => {
    const check = inputData.jobTitlePointId && (inputData.jobTitlePoint || inputData.deductionWay || inputData.rakeRule)
    setVaild(check)
  }, [inputData])

  return (
    <Dialog open={open}>
      {/* 保留舊 sm Dialog 的 600px 寬度。 */}
      <DialogContent hideClose
        onOpenAutoFocus={event => {
          // 沿用舊 Modal：已有欄位焦點就保留，否則先聚焦面板，避免選人窗自動叫出手機鍵盤。
          event.preventDefault()
          if (!event.target.contains(document.activeElement)) event.target.focus()
        }}
        className="sm:max-w-[600px]" aria-describedby={undefined}>
        <DialogHeader><DialogTitle>由人員身分設定檔導入</DialogTitle></DialogHeader>
        <div className="h-px bg-border" />
        <DialogBody>
          <NativeSelect
            value={inputData.jobTitlePointId}
            onChange={({ target }) => handleSetInputData('jobTitlePointId', target.value)}
            displayEmpty={false}
            placeholder="請選擇…"
            label="選擇人員身份類別"
          >
            {jobTitle.map(({ id, jobTitle }) => (
              <NativeSelectOption value={id} key={id}>{jobTitle}</NativeSelectOption>
            ))}
          </NativeSelect>
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
        </DialogBody>
        <DialogFooter className="ui-root flex-wrap">
          {/* 停用原因（STYLE.md §6）：依 vaild（要選身份類別，且至少勾一項要導入的設定） */}
          {!vaild && (
            <p id="profile-import-missing" role="status" className="mr-auto text-caption text-text-secondary">
              尚缺：{[!inputData.jobTitlePointId && '人員身份類別', !(inputData.jobTitlePoint || inputData.deductionWay || inputData.rakeRule) && '至少勾選一項要導入的設定'].filter(Boolean).join('、')}
            </p>
          )}
          <Button variant='secondary' onClick={onClose} disabled={onSubmit}>關閉</Button>
          <Button variant='primary' onClick={handleSetProfileData} disabled={!vaild || onSubmit} aria-describedby={!vaild ? 'profile-import-missing' : undefined}>確認</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ProfileImportModal