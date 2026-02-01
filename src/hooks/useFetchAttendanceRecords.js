import { gql, useQuery, useLazyQuery } from '@apollo/client'

const GET_ALL_ATTENDANCE = gql`
  query GET_ALL_ATTENDANCE($input: AllAttendanceInput!) {
    attendanceRecords(input: $input) {
      userId
      userName
      userNickName
      attendanceRecord {
        date
        clockInRecord {
          in {
            uuid
            time
            latitude
            longitude
            isLine
            checkinType
            distanceValue
          }
          out {
            uuid
            time
            latitude
            longitude
            isLine
            checkinType
            distanceValue
          }
          breakRecord {
            start {
              uuid
              time
              latitude
              longitude
              isLine
              checkinType
              distanceValue
            }
            end {
              uuid
              time
              latitude
              longitude
              isLine
              checkinType
              distanceValue
            }
          }
        }
        isLate
        isLeaveEarly
      }
      totalLateMinutes
      totalLateTime
      totalClockInDays
      absenteeismDays
    }
  }
`

export default function useFetchAttendanceRecords(input) {
  return useQuery(GET_ALL_ATTENDANCE, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

export function useFetchAttendanceRecordsLazy(input) {
  const [attendanceRecordsLazy , attendanceRecordsLazyData] = useLazyQuery(GET_ALL_ATTENDANCE, {
    fetchPolicy: 'cache-and-network',
  })
  return [attendanceRecordsLazy , attendanceRecordsLazyData]
}

const GET_ATTENDANCE_STATUS = gql`
  query GET_ATTENDANCE_STATUS($input: AllAttendanceInput!) {
    attendanceRecords(input: $input) {
      absenteeismDays
      totalLateMinutes
      totalClockInDays
    }
  }
`

export function useFetchGetAttendanceStatus(input) {
  return useQuery(GET_ATTENDANCE_STATUS, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}