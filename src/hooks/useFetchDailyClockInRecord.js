import { gql, useQuery, useLazyQuery } from '@apollo/client'

const FETCH_DAILY_CLOCKIN_RECORD = gql`
  query FETCH_DAILY_CLOCKIN_RECORD($date: DateTime, $designerId: ID, $distanceFilter: [DistanceEnum]) {
    dailyClockInRecord(date: $date, designerId: $designerId, distanceFilter: $distanceFilter) {
      userId
      userName
      userNickName
      userNo
      isLate
      isLeaveEarly
      clockInRecord {
        in {
          time
          distanceValue
        }
        out {
          time
          distanceValue
        }
        breakRecord {
          start {
            time
            distanceValue
          }
          end {
            time
            distanceValue
          }
        }
      }
      clockInSetting {
        name
      }
    }
  }
`
export default function useFetchDailyClockInRecord({ date, designerId, distanceFilter }) {
  return useQuery(FETCH_DAILY_CLOCKIN_RECORD, {
    variables: {
      date,
      designerId,
      distanceFilter,
    },
    fetchPolicy: 'cache-and-network',
  })
}
export function useFetchDailyClockInRecordLazy() {
  const [dailyClockInRecordLazy, dailyClockInRecordLazyData] = useLazyQuery(FETCH_DAILY_CLOCKIN_RECORD, {
    fetchPolicy: 'cache-and-network',
  })
  return [dailyClockInRecordLazy, dailyClockInRecordLazyData]
}
