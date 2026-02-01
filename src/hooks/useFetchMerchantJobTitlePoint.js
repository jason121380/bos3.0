import { gql, useQuery, useLazyQuery } from '@apollo/client'

const GET_MERCHANT_JOBTITLE_POINT = gql`
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
`

export default function useFetchMerchantJobTitlePoint() {
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null
  return useQuery(GET_MERCHANT_JOBTITLE_POINT, {
    variables: {
      merchantId,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const GET_MERCHANT_JOBTITLE = gql`
  query GET_MERCHANT_JOBTITLE($merchantId: ID!) {
    merchantJobTitlePoint(merchantId: $merchantId) {
      id
      jobTitle
    }
  }
`

export function useFetchMerchantJobTitleForEmployeeList() {
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null
  const [getJobTitle, jobTitleData] = useLazyQuery(GET_MERCHANT_JOBTITLE, {
    variables: {
      merchantId,
    },
    fetchPolicy: 'cache-and-network',
  })
  return [getJobTitle, jobTitleData]
}
