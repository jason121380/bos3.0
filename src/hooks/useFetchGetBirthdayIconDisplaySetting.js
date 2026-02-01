import { gql, useQuery } from '@apollo/client'

const GET_BIRTHDAY_ICOB_DISPLAY_SETTING = gql`
  query GET_BIRTHDAY_ICOB_DISPLAY_SETTING {
    getBirthdayIconDisplaySetting
  }
`

export default function useFetchGetBirthdayIconDisplaySetting() {
  return useQuery(GET_BIRTHDAY_ICOB_DISPLAY_SETTING, {
    fetchPolicy: 'cache-and-network',
  })
}
