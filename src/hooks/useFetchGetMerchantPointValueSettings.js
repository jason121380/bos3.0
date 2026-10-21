import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_MERCHANT_POINT_VALUE_SETTING = settingsQuery(gql`
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
`)

export default function useFetchGetMerchantPointValueSettings() {
  return useQuery(GET_MERCHANT_POINT_VALUE_SETTING, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_MERCHANT_POINT_VALUE_SETTING_FOR_SELECT = settingsQuery(gql`
  query GET_MERCHANT_POINT_VALUE_SETTING_FOR_SELECT {
    getMerchantPointValueSettings {
      id
      name
      paidFixed
      retrievePointWay
    }
  }
`)

export function useFetchGetMerchantPointValueSettingsForSelect() {
  return useQuery(GET_MERCHANT_POINT_VALUE_SETTING_FOR_SELECT, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
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
