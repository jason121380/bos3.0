import { gql, useQuery } from '@apollo/client'

const FETCH_GET_USER_SALARY_TRANSFER_REPORT = gql`
  query FETCH_GET_USER_SALARY_TRANSFER_REPORT($date: DateTime!) {
    userSalaryTransferReport(date: $date) {
      id
      name
      designerNo
      bankCode
      bankName
      bankBranchName
      bankAccount
      increaseItem
      decreaseItem
    }
  }
`
export default function useFetchGetUserSalaryTransferReport({ date }) {
  return useQuery(FETCH_GET_USER_SALARY_TRANSFER_REPORT, {
    variables: {
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}
