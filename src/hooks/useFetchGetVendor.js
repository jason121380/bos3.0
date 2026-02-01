import { gql, useQuery } from '@apollo/client'

const GET_VENDOR = gql`
  query GET_VENDOR {
    getVendor {
      uuid
      name
    }
  }
`

export default function useFetchGetVendor() {
  return useQuery(GET_VENDOR, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_MERCHANT_VENDOR_LIST = gql`
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
`

export function useFetchGetMerchantVendorList() {
  return useQuery(GET_MERCHANT_VENDOR_LIST, {
    fetchPolicy: 'cache-and-network',
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