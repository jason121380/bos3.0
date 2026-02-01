import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_POINT_VALUE_SETTING = gql`
  query GET_MERCHANT_POINT_VALUE_SETTING {
    getMerchantPointValueSettings {
      id
      name
      paidFixed
      retrievePointWay
      retrieveFixed
      retrieveSegmentSetting {
        threshold
        price
      }
    }
  }
`

export default function useFetchGetMerchantPointValueSettings() {
  return useQuery(GET_MERCHANT_POINT_VALUE_SETTING, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_MERCHANT_POINT_VALUE_SETTING_FOR_SELECT = gql`
  query GET_MERCHANT_POINT_VALUE_SETTING_FOR_SELECT {
    getMerchantPointValueSettings {
      id
      name
      paidFixed
      retrievePointWay
    }
  }
`

export function useFetchGetMerchantPointValueSettingsForSelect() {
  return useQuery(GET_MERCHANT_POINT_VALUE_SETTING_FOR_SELECT, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_MERCHANT_POINT_VALUE_SETTING_FOR_EDIT = gql`
  query GET_MERCHANT_POINT_VALUE_SETTING_FOR_EDIT ($input: ID!) {
    getMerchantPointValueSetting (input : $input) {
      id
      name
      paidFixed
      retrievePointWay
      retrieveFixed
      retrieveSegmentSetting {
        threshold
        price
      }
      isAccordingToHelper
    }
  }
`

export function useFetchGetMerchantPointValueSettingsForEdit(input) {
  return useQuery(GET_MERCHANT_POINT_VALUE_SETTING_FOR_EDIT, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
