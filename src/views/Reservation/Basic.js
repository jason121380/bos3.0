import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { DatePicker } from 'ui/date-picker'
import ReservationContext from 'context/ReservationContext'
import { format } from 'date-fns'
import { useLazyFetchDesignerBookingTimes } from 'hooks/useFetchDesignerBookingTimes'
import { useLazyFetchUnspecifiedBookingTimes } from 'hooks/useFetchUnspecifiedBookingTimes'
import useFetchViewer from 'hooks/useFetchViewer'
import idx from 'idx'
import React from 'react'
import { Card, CardContent } from 'ui/card'
import StaffCombobox from 'components/StaffCombobox'

import reference from './reference'

const designerLabel = designer => designer.nickName || designer.name

export default function ReservationBasic({ assignDesigner, onChange, onAssignChange, onDesignerChange }) {
  const { merchantId, values } = React.useContext(ReservationContext)
  const selectRef = React.useRef()
  const serviceTimeRef = React.useRef()
  const referenceRef = React.useRef()
  const [serviceTimeLabelWidth, setServiceTimeLabelWidth] = React.useState(0)
  const [referenceWidth, setReferenceWidth] = React.useState(0)
  const designers = useFetchViewer({ merchantId, usagelimit: 'BOOKING' })
  React.useEffect(() => {
    if (serviceTimeRef.current && serviceTimeRef.current.offsetWidth) {
      setServiceTimeLabelWidth(serviceTimeRef.current.offsetWidth)
    }
    if (referenceRef.current && referenceRef.current.offsetWidth) {
      setReferenceWidth(referenceRef.current.offsetWidth)
    }
  }, [])

  // 網址帶入設計師（?designerId=）、顧客沒有重選時，也要記下設計師名稱給傳回 LINE 的訊息用
  // （原本只在從選單選取時才記，訊息的「設計師:」會是空白；Jason 2026/10/31 同意修正）
  const designerList = idx(designers, _ => _.data.viewer.anonymous.designers.data)
  React.useEffect(() => {
    if (!values.designerId || !designerList) return
    const preset = designerList.find(designer => designer.id === values.designerId)
    if (preset) onDesignerChange(designerLabel(preset))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onDesignerChange 是父層每次 render 重建的函式，只在帶入的設計師或清單變動時補名稱
  }, [values.designerId, designerList])

  const { fetchUnspecifiedBookingTimes, unspecifiedBookingTimesResponse } = useLazyFetchUnspecifiedBookingTimes({
    storeId: merchantId,
    date: values.date,
  })

  React.useEffect(() => {
    if (values.date) {
      fetchUnspecifiedBookingTimes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（fetchUnspecifiedBookingTimes）；只在 [values.date] 變動時呼叫，補上會每次 render 重跑
  }, [values.date])

  const { fetchDesignerBookingTimes, designerBookingTimesResponse } = useLazyFetchDesignerBookingTimes({
    designerId: values.designerId,
    storeId: merchantId,
    date: values.date,
  })

  React.useEffect(() => {
    if (values.designerId) {
      fetchDesignerBookingTimes()
    }
  }, [values.designerId, fetchDesignerBookingTimes])

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <DatePicker
          format="yyyy/MM/dd"
          label="希望服務日期"
          value={values.date}
          onChange={event => {
            if (!isNaN(new Date(event)) && event !== null) {
              onChange({
                key: 'date',
                value: new Date(event).getTime(),
              })
            }
          }}
          localeText={{
            toolbarTitle: '選擇日期',
          }}
          slotProps={{
            toolbar: {
              toolbarFormat: 'yyyy年M月d日',
            },
            textField: {
              variant: 'outlined',
              fullWidth: true,
            },
          }}
        />

        <ToggleGroup fullWidth value={assignDesigner} exclusive onChange={onAssignChange} aria-label="指定不指定設計師">
          <ToggleGroupItem className="h-10" value={true} aria-label="assign" data-testid="designer-assigned">
            指定
          </ToggleGroupItem>
          <ToggleGroupItem className="h-10" value={false} aria-label="notAssign" data-testid="designer-not-assigned">
            不指定
          </ToggleGroupItem>
        </ToggleGroup>
        {idx(
          designers,
          _ =>
            _.data.viewer.anonymous.designers.data &&
            assignDesigner && (
              // 服務設計師可打字搜尋（Jason 2026/10/30）：StaffCombobox 選取時交給原 handler { target: { value: 設計師 id } }，
              // 按清除鈕為 ''（與原本選回空白相同）；清單與欄位文字維持「有暱稱用暱稱，沒有用本名」。
              <div ref={selectRef} className="min-w-0">
                <StaffCombobox
                  onChange={event => {
                    onChange({
                      key: 'designerId',
                      value: idx(event, _ => idx(event, _ => _.target.value)),
                    })
                    // 與選單顯示一致：有暱稱用暱稱，沒有用本名；選回空白時清空（原本判斷陣列的 nickName、永遠用本名，Jason 2026/10/22 fix all）
                    const picked = _.data.viewer.anonymous.designers.data.find(d => d.id === event.target.value)
                    onDesignerChange(picked ? picked.nickName || picked.name : '')
                  }}
                  value={values.designerId}
                  users={_.data.viewer.anonymous.designers.data}
                  getLabel={designerLabel}
                  inputProps={{
                    'data-testid': 'designer-name',
                  }}
                  label={<>服務設計師{assignDesigner && <span className="text-danger"> *</span>}</>}
                />
              </div>
            )
        )}
        {(designerBookingTimesResponse.data || unspecifiedBookingTimesResponse.data) && (
          <NativeSelect
            value={values.dateTime}
            onChange={event => {
              onChange({
                key: 'dateTime',
                value: +event.target.value,
              })
            }}
            inputProps={{
              'data-testid': 'service-time',
            }}
            displayEmpty={false}
            placeholder="請選擇…"
            label={
              <>
                服務時間<span className="text-danger"> *</span>
              </>
            }
            labelRef={serviceTimeRef}
          >
            <NativeSelectOption aria-label="None" value="" />
            {idx(designerBookingTimesResponse, _ =>
              _.data.getBookingTimes.map(data => {
                return (
                  assignDesigner && (
                    <NativeSelectOption value={data.time} key={data.time} disabled={data.status === '不可預約'}>
                      {format(new Date(data.time), 'HH:mm')}
                    </NativeSelectOption>
                  )
                )
              })
            )}

            {idx(unspecifiedBookingTimesResponse, _ =>
              _.data.unspecifiedBookingTimes.map(data => {
                return (
                  !assignDesigner && (
                    <NativeSelectOption value={data.time} key={data.time} disabled={data.status === '不可預約'}>
                      {format(new Date(data.time), 'HH:mm')}
                    </NativeSelectOption>
                  )
                )
              })
            )}
          </NativeSelect>
        )}
        <NativeSelect
          value={values.reference}
          onChange={event =>
            onChange({
              key: 'reference',
              value: idx(event, _ => _.target.value),
            })
          }
          inputProps={{
            'data-testid': 'reference',
          }}
          displayEmpty={false}
          placeholder="請選擇…"
          label="您是如何知道我們的呢"
          labelRef={referenceRef}
        >
          <NativeSelectOption aria-label="None" value="" />
          {reference.map((data, index) => (
            <NativeSelectOption aria-label="None" value={data.value} key={index}>
              {data.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </CardContent>
    </Card>
  )
}
