import { useMediaQuery } from 'ui/misc-compat'
import { theme } from 'theme'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import useFetchAdminBookingTime from 'hooks/useFetchAdminBookingTime'
import useFetchMerchantOrders from 'hooks/useFetchMerchantOrders'
import idx from 'idx'
import React from 'react'

const statusColor = {
  不可預約: 'grey',
  已完成: 'purple',
  待審核: '#69b8dd',
  已接受: '#e56969',
}
export default function useHandleMerchantOrders({
  defaultDate,
  defaultRangeLimit = 'DAY',
  defaultDesignerList = [],
  mobileView = 'listWeek',
  defaultView = 'resourceTimelineDay',
}) {
  const mobileDevice = useMediaQuery(theme.breakpoints.down('sm'))
  const [view, setView] = React.useState(mobileDevice ? mobileView : defaultView)
  const [seletedDesignerId, setSeletedDesignerId] = React.useState('')
  const [date, setDate] = React.useState(defaultDate || new Date())
  const [seletedDate, setSeletedDate] = React.useState({})
  const { adminBookingTime } = useFetchAdminBookingTime()
  const calendarRef = React.useRef(null)
  const handleModalClose = () => {
    setEventModal({
      open: false,
      event: null,
    })
    setSeletedDate({})
  }

  const handleDateToday = () => {
    const calendarApi = calendarRef.current.getApi()

    calendarApi.today()
    setDate(calendarApi.getDate())
  }

  const handleViewChange = newView => {
    const calendarApi = calendarRef.current.getApi()

    calendarApi.changeView(newView)
    setView(newView)
  }

  const handleDatePrev = () => {
    const calendarApi = calendarRef.current.getApi()

    calendarApi.prev()
    setDate(calendarApi.getDate())
  }

  const handleDateNext = () => {
    const calendarApi = calendarRef.current.getApi()

    calendarApi.next()
    setDate(calendarApi.getDate())
  }

  const handleDatePickerChange = value => {
    setDate(new Date(value))
    const calendarApi = calendarRef.current.getApi()
    calendarApi.gotoDate(new Date(value))
  }
  const [eventModal, setEventModal] = React.useState({
    open: false,
    event: null,
  })
  const [designers, setDesigners] = React.useState({
    designers: [],
    designersById: {},
  })

  const [events, setEvents] = React.useState([])
  const merchantOrders = useFetchMerchantOrders({
    date: date.getTime(),
    rangeLimit: defaultRangeLimit,
    designerList: defaultDesignerList,
  })

  const handleDateClick = info => {
    const selected = events.find(event => event.id === info.event.id)
    setEventModal({
      open: true,
      event: selected,
    })
    setSeletedDate(info)
  }
  const handleChoseEvent = value => {
    setEventModal({
      open: true,
      event: null,
    })
    setSeletedDate(value)

    idx(value, _ => {
      setSeletedDesignerId(_.resource._resource.id)
    })
  }
  const handleDisableDate = () => {
    adminBookingTime({
      datetime: new Date(seletedDate.event ? seletedDate.event.start : seletedDate.date).getTime(),
      designerId: seletedDate.resource
        ? seletedDate.resource._resource.id
        : seletedDate.event._def.resourceIds[0],
      appointable: !!(seletedDate.event && seletedDate.event._def.title === '不可預約'),
    }).then(() => {
      merchantOrders.refetch()
      setEventModal({
        open: false,
        event: null,
      })
      openSnackbar({
        variant: 'success',
        message: '變更預約狀態成功',
      })
    })
  }

  const handleDateChange = date => {
    const calendarApi = calendarRef.current.getApi()
    calendarApi.gotoDate(new Date(date))
    setDate(new Date(date))
  }
  React.useEffect(() => {
    if (!merchantOrders.loading && merchantOrders.data) {
      // designers
      const designers = merchantOrders.data.merchantOrders.map(data => ({
        ...data.designer,
        title: data.designer.name,
      }))

      const designersById = {}
      designers.forEach(item => {
        designersById[item.id] = item
      })
      setDesigners({
        designersById,
        designers,
      })

      // events
      const events = merchantOrders.data.merchantOrders
        .map(item =>
          item.servicesTimesList
            .map(data => {
              const bookingSuccess = data.orders.map(order => ({
                resourceId: item.designer.id,
                title:
                  order.customer && order.customer.name
                    ? order.customer.name + ' ' + data.status
                    : data.status,
                start: format(new Date(data.startTime), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
                end: format(new Date(data.endTime), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
                color: statusColor[data.status],
                allDay: false,
                extendedProps: {
                  department: 'BioChemistry',
                },
              }))
              const withoutBookingSuccess = data.orders.length === 0 && {
                resourceId: item.designer.id,
                title:
                  view !== 'resourceTimelineDay'
                    ? item.designer.name + ' ' + data.status
                    : data.status,
                start: format(new Date(data.startTime), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
                end: format(new Date(data.endTime), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
                color: statusColor[data.status],
                allDay: false,
                extendedProps: {
                  department: 'BioChemistry',
                },
              }
              return !withoutBookingSuccess
                ? bookingSuccess
                : [withoutBookingSuccess, ...bookingSuccess]
            })
            .reduce((total, item) => total.concat(item), [])
        )
        .reduce((previousValue, currentValue) => previousValue.concat(currentValue), [])
      setEvents(events)
    }
  }, [merchantOrders, view])
  React.useEffect(() => {
    const calendarApi = calendarRef.current.getApi()
    const newView = mobileDevice ? 'listWeek' : 'resourceTimelineDay'
    calendarApi.changeView(newView)
    setView(newView)
  }, [mobileDevice])

  return {
    designers,
    events,
    handleDatePickerChange,
    handleDateNext,
    handleDatePrev,
    handleViewChange,
    handleDateToday,
    handleModalClose,
    handleDisableDate,
    handleDateChange,
    handleDateClick,
    handleChoseEvent,
    seletedDate,
    eventModal,
    calendarRef,
    date,
    seletedDesignerId,
    view,
  }
}
