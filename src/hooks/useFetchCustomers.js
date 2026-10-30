import { gql, useQuery } from '@apollo/client'

const FETCH_CUSTOMERS = gql`
  query FETCH_CUSTOMERS($input: CustomersInput!) {
    customers(input: $input) {
      customers {
        id
        name
        cellphone
        email
        no
        address
        category
        lineId
        nickName
        latestDesigner {
          id
          name
        }
        preferDesigner {
          id
          name
        }
        lastTime
        birthday {
          year
          month
          day
        }
        gender
        source
        membershipPurchaseRecord {
          membershipName
          validityDay
          expiryDay
          purchaseDate
          remark
        }
        isUnwelcome
      }
      pageLimit
      pageOffset
      totalCount
    }
  }
`

export default function useFetchCustomers({ ...data }) {
  return useQuery(FETCH_CUSTOMERS, {
    variables: {
      input: { ...data, merchantId: localStorage.getItem('userMerchant') ? JSON.parse(localStorage.getItem('userMerchant')).id : null },
    },
    fetchPolicy: 'cache-and-network',
  })
}

const FETCH_CUSTOMER_WITHOUT_SORTING = gql`
  query FETCH_CUSTOMER_WITHOUT_SORTING($input: CustomersWithoutSortingInput!) {
    customersWithoutSorting(input: $input) {
      customers {
        id
        category
        no
        name
        userCode
        nickName
        cellphone
        email
        address
        lastTime
        lineId
        gender
        birthday {
          year
          month
          day
        }
        latestDesigner {
          name
        }
        preferDesigner {
          name
        }
        source
        lastTime
        isUnwelcome
      }
      pageLimit
      pageOffset
      totalCount
    }
  }
`

export function useFetchCustomersWithoutSorting(input) {
  return useQuery(FETCH_CUSTOMER_WITHOUT_SORTING, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const FETCH_CUSTOMERS_IN_AUTO_COMPLETE = gql`
  query FETCH_CUSTOMERS_IN_AUTO_COMPLETE($input: CustomersInput!) {
    customers(input: $input) {
      customers {
        id
        name
        cellphone
        no
      }
    }
  }
`

export function useFetchCustomersInAutoComplete({ pageLimit, pageOffset, keyword = '', customerId, startDate, endDate, employeeId }) {
  return useQuery(FETCH_CUSTOMERS_IN_AUTO_COMPLETE, {
    variables: {
      input: customerId
        ? {
            merchantId: localStorage.getItem('userMerchant') ? JSON.parse(localStorage.getItem('userMerchant')).id : null,
            pageLimit,
            keyword,
            pageOffset,
            customerId,
            // birthdayStart: startDate,
            // birthdayEnd: endDate,
            preferDesigner: employeeId,
          }
        : {
            merchantId: localStorage.getItem('userMerchant') ? JSON.parse(localStorage.getItem('userMerchant')).id : null,
            pageLimit,
            keyword,
            pageOffset,
            // birthdayStart: startDate,
            // birthdayEnd: endDate,
            preferDesigner: employeeId,
          },
    },
    fetchPolicy: 'cache-and-network',
  })
}
