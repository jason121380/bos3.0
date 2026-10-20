import { DialogBody, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { useState, useEffect, Fragment } from 'react'
// 外層為 ui Dialog（由行事曆 OrderTable 開啟），這裡只放標題、內容與底部動作三段
import { ToggleGroupItem } from 'ui/toggle-group'
import { cloneDeep } from 'lodash'
import { format } from 'date-fns'
import { Button as UiButton } from 'ui/button'
import { green, grey } from 'ui/colors'
import { openSnackbar } from 'elements/snackbars'
import useFetchSetAdminBookingTimes from 'hooks/useFetchSetAdminBookingTimes'

export default function HolidayEdit({ holidayData, setHolidayData, setHolidayModel, refetchData }) {
  const { setTimes } = useFetchSetAdminBookingTimes()
  const [timeOption, setTimeOption] = useState([])
  const [isClick, setIsClick] = useState(false)
  const { startTime, endTime, designerId } = holidayData

  useEffect(() => {
    const option = []
    for (let i = startTime; i < endTime; i += 1800000) {
      option.push({
        time: i,
        select: true
      })
    }
    setTimeOption(option)
    return () => {
      setHolidayData({})
      setTimeOption([])
      setIsClick(false)
    }
  }, [])

  const handleSelectTime = (value, index) => {
    const newOption = cloneDeep(timeOption)
    newOption[index].select = value
    setTimeOption(newOption)
  }

  const handleOnClose = () => {
    !isClick && setHolidayModel(false)
  }

  const handleSetHoliday = async () => {
    const time = []
    setIsClick(true)
    timeOption.forEach(d => {
      if (!d.select) {
        time.push(d.time)
      }
    })
    try {
      const res = await setTimes({
        input: {
          designerId: designerId,
          datetimes: time,
          appointable: true
        }
      })
      if (res.data.adminBookingTimes) {
        openSnackbar({
          message: '編輯成功',
          variant: 'success'
        })
        handleOnClose()
        refetchData()
      } else {
        openSnackbar({
          message: '編輯失敗',
          variant: 'warning'
        })
        setIsClick(false)
      }
    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error'
      })
      setIsClick(false)
    }
  }

  return (
    <Fragment>
      <DialogHeader className="border-0 border-b border-solid border-border pb-4">
        <DialogTitle>編輯公休</DialogTitle>
      </DialogHeader>
      <DialogBody className="flex flex-wrap gap-x-[10px] gap-y-[5px]">
        {timeOption.map(({ time, select }, i) => (
          <ToggleGroupItem
            key={time}
            selected={select}
            className="tabular-nums"
            onClick={() => handleSelectTime(!select, i)}
          >{format(time, 'HH:mm')}</ToggleGroupItem>
        ))}
      </DialogBody>
      <DialogFooter className="border-t-0">
        <UiButton variant='primary' disabled={isClick} onClick={handleSetHoliday}>確定</UiButton>
        <UiButton variant='ghost' disabled={isClick} onClick={handleOnClose}>取消</UiButton>
      </DialogFooter>
    </Fragment>
  )
}
