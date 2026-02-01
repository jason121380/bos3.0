import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_SCHADULE_DISPLAY_SETTING = gql`
  query GET_MERCHANT_SCHADULE_DISPLAY_SETTING {
    getMerchantScheduleDisplaySetting
  }
`

export default function useFetchGetMerchantScheduleDisplaySetting() {
  return useQuery(GET_MERCHANT_SCHADULE_DISPLAY_SETTING, {
    fetchPolicy: 'cache-and-network',
  })
}