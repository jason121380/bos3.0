import { gql, useLazyQuery } from '@apollo/client'

const FETCH_ATTENDANCE_RECORDS_EXCELV2 = gql`
  query FETCH_ATTENDANCE_RECORDS_EXCELV2($input: AllAttendanceExcelV2Input!) {
    attendanceRecordsExcelV2(input: $input)
  }
`
export function useFetchAttendanceRecordsExcelV2() {
  const [attendanceRecordsExcelLazyV2, attendanceRecordsExcelLazyDataV2] = useLazyQuery(FETCH_ATTENDANCE_RECORDS_EXCELV2, {
    fetchPolicy: 'cache-and-network',
  })
  return [attendanceRecordsExcelLazyV2, attendanceRecordsExcelLazyDataV2]
}

const FETCH_ATTENDANCE_RECORDS_EXCELV2_FOR_HR = gql`
  query FETCH_ATTENDANCE_RECORDS_EXCELV2_FOR_HR($input: AllAttendanceExcelV2Input!) {
    attendanceRecordsExcelV2ForHR(input: $input)
  }
`
export function useFetchAttendanceRecordsExcelV2ForHR() {
  const [attendanceRecordsExcelLazyV2ForHR, attendanceRecordsExcelLazyDataV2ForHR] = useLazyQuery(FETCH_ATTENDANCE_RECORDS_EXCELV2_FOR_HR, {
    fetchPolicy: 'cache-and-network',
  })
  return [attendanceRecordsExcelLazyV2ForHR, attendanceRecordsExcelLazyDataV2ForHR]
}
