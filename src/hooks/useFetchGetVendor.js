import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_VENDOR = settingsQuery(gql`
  query GET_VENDOR {
    getVendor {
      uuid
      name
    }
  }
`)

export default function useFetchGetVendor() {
  return useQuery(GET_VENDOR, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_MERCHANT_VENDOR_LIST = settingsQuery(gql`
  query GET_MERCHANT_VENDOR_LIST {
    getMerchantVendorList {
      uuid
      no
      name
      nickname
      cellphone
      remark
      vendor {
        uuid
      }
    }
  }
`)

export function useFetchGetMerchantVendorList() {
  return useQuery(GET_MERCHANT_VENDOR_LIST, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_MERCHANT_VENDOR = gql`
  query getMerchantVendor($input: ID!) {
    getMerchantVendor(input: $input) {
      uuid
      no
      name
      nickname
      cellphone
      remark
      vendor {
        uuid
      }
    }
  }
`

export function useFetchGetMerchantVendor({ input }) {
  return useQuery(GET_MERCHANT_VENDOR, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}