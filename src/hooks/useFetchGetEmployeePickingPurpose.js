import { gql, useQuery } from '@apollo/client'

const GET_EMPLOYEE_PICKING_PURPOSE = gql`
  query GET_EMPLOYEE_PICKING_PURPOSE {
    getEmployeePickingPurpose 
  }
`

const useFetchGetEmployeePickingPurpose = () => {
  return useQuery(GET_EMPLOYEE_PICKING_PURPOSE, {
    fetchPolicy: 'cache-and-network',
  })
}

export default useFetchGetEmployeePickingPurpose