import { gql, useQuery, useLazyQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_MERCHANT_JOBTITLE_POINT = settingsQuery(gql`
  query MERCHANT_JOBTITLE_POINT($merchantId: ID!) {
    merchantJobTitlePoint(merchantId: $merchantId) {
      id
      jobTitle
      pointValue
      DeductionSettingId
      MerchantCommissionWayId
      merchantPointValueSettingId
      isDefaultValue
      usingPeopleCount
    }
  }
`)

export default function useFetchMerchantJobTitlePoint() {
  const merchantId = localStorage.getItem('userMerchant') ? JSON.parse(localStorage.getItem('userMerchant')).id : null
  return useQuery(GET_MERCHANT_JOBTITLE_POINT, {
    variables: {
      merchantId,
    },
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_MERCHANT_JOBTITLE = settingsQuery(gql`
  query GET_MERCHANT_JOBTITLE($merchantId: ID!) {
    merchantJobTitlePoint(merchantId: $merchantId) {
      id
      jobTitle
    }
  }
`)

export function useFetchMerchantJobTitleForEmployeeList() {
  const merchantId = localStorage.getItem('userMerchant') ? JSON.parse(localStorage.getItem('userMerchant')).id : null
  const [getJobTitle, jobTitleData] = useLazyQuery(GET_MERCHANT_JOBTITLE, {
    variables: {
      merchantId,
    },
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
  return [getJobTitle, jobTitleData]
}
