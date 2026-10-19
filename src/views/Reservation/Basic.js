import { FormControl, InputLabel, Select } from 'ui/form-control'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { DatePicker } from 'ui/date-picker'
import useReservationContext from 'context/useReservationContext'
import { format } from 'date-fns'
import { useLazyFetchDesignerBookingTimes } from 'hooks/useFetchDesignerBookingTimes'
import { useLazyFetchUnspecifiedBookingTimes } from 'hooks/useFetchUnspecifiedBookingTimes'
import useFetchViewer from 'hooks/useFetchViewer'
import idx from 'idx'
import React from 'react'
import { Card, CardContent } from 'ui/card'

import reference from './reference'

export default function ({ asignDesigner, onChange, onAssignChange, onDesignerChange }) {
  const { merchantId, values } = React.useContext(useReservationContext)
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

  const {
    fetchUnspecifiedBookingTimes,
    unspecifiedBookingTimesResponse,
  } = useLazyFetchUnspecifiedBookingTimes({
    storeId: merchantId,
    date: values.date,
  })

  React.useEffect(() => {
    if (values.date) {
      fetchUnspecifiedBookingTimes()
    }
  }, [values.date])

  const {
    fetchDesignerBookingTimes,
    designerBookingTimesResponse,
  } = useLazyFetchDesignerBookingTimes({
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
          format='yyyy/MM/dd'
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
            toolbarTitle: '選擇日期'
          }}
          slotProps={{
            toolbar: {
              toolbarFormat: 'yyyy年M月d日'
            },
            textField: {
              variant: 'outlined',
              fullWidth: true,
            }
          }}
        />

        <ToggleGroup
          fullWidth
          value={asignDesigner}
          exclusive
          onChange={onAssignChange}
          aria-label="指定不指定設計師"
        >
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
            asignDesigner && (
              <FormControl
                variant="outlined"
                fullWidth
                required={asignDesigner}
              >
                <InputLabel ref={selectRef}>服務設計師</InputLabel>
                <Select
                  native
                  onChange={event => {
                    onChange({
                      key: 'designerId',
                      value: idx(event, _ => idx(event, _ => _.target.value)),
                    })
                    if (_.data.viewer.anonymous.designers.data.nickName) {
                      onDesignerChange(
                        _.data.viewer.anonymous.designers.data.find(d => d.id === event.target.value)
                          .nickName
                      )
                    } else {
                      onDesignerChange(
                        _.data.viewer.anonymous.designers.data.find(d => d.id === event.target.value)
                          .name
                      )
                    }
                  }}
                  label="服務設計師"
                  value={values.designerId}
                  inputProps={{
                    'data-testid': 'designer-name',
                  }}
                >
                  <option aria-label="None" value="" />
                  {idx(designers, _ =>
                    _.data.viewer.anonymous.designers.data.map(data => {
                      return (
                        asignDesigner && (
                          <option value={data.id} key={data.id}>
                            {data.nickName || data.name}
                          </option>
                        )
                      )
                    })
                  )}
                </Select>
              </FormControl>
            )
        )}
        {(designerBookingTimesResponse.data || unspecifiedBookingTimesResponse.data) && (
          <FormControl variant="outlined" fullWidth required>
            <InputLabel ref={serviceTimeRef} htmlFor="outlined-age-native-simple">
              服務時間
            </InputLabel>
            <Select
              native
              label="服務時間"
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
            >
              <option aria-label="None" value="" />
              {idx(designerBookingTimesResponse, _ =>
                _.data.getBookingTimes.map(data => {
                  return (
                    asignDesigner && (
                      <option
                        value={data.time}
                        key={data.time}
                        disabled={data.status === '不可預約'}
                      >
                        {format(new Date(data.time), 'HH:mm')}
                      </option>
                    )
                  )
                })
              )}

              {idx(unspecifiedBookingTimesResponse, _ =>
                _.data.unspecifiedBookingTimes.map(data => {
                  return (
                    !asignDesigner && (
                      <option
                        value={data.time}
                        key={data.time}
                        disabled={data.status === '不可預約'}
                      >
                        {format(new Date(data.time), 'HH:mm')}
                      </option>
                    )
                  )
                })
              )}
            </Select>
          </FormControl>
        )}
        <FormControl variant="outlined" fullWidth>
          <InputLabel ref={referenceRef}>您是如何知道我們的呢</InputLabel>
          <Select
            native
            value={values.reference}
            label="您是如何知道我們的呢"
            onChange={event =>
              onChange({
                key: 'reference',
                value: idx(event, _ => _.target.value),
              })
            }
            inputProps={{
              'data-testid': 'reference',
            }}
          >
            <option aria-label="None" value="" />
            {reference.map((data, index) => (
              <option aria-label="None" value={data.value} key={index}>
                {data.label}
              </option>
            ))}
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  )
}
