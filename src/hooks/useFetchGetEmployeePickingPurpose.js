import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_EMPLOYEE_PICKING_PURPOSE = settingsQuery(gql`
  query GET_EMPLOYEE_PICKING_PURPOSE {
    getEmployeePickingPurpose 
  }
`)

const useFetchGetEmployeePickingPurpose = () => {
  return useQuery(GET_EMPLOYEE_PICKING_PURPOSE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

export default useFetchGetEmployeePickingPurpose