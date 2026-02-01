import { gql, useQuery } from '@apollo/client'

const GET_EMPLOYEE_RESIGNATION_LIST = gql`
  query GET_EMPLOYEE_RESIGNATION_LIST {
    getEmployeeResignationList {
      id
      cellphone
      firstName
      lastName
      nickName
      avatar
      designerNo
      deletedAt
    }
  }
`

const useFetchGetEmployeeResignationList = () =>
  useQuery(GET_EMPLOYEE_RESIGNATION_LIST, {
    fetchPolicy: 'cache-and-network',
  })
export default useFetchGetEmployeeResignationList