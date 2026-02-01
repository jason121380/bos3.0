import { gql, useLazyQuery, useQuery } from '@apollo/client'

const SERVICE_ORDER_HELPERS = gql`
  query SERVICE_ORDER_HELPERS($input: ServiceOrderHelpersInput!) {
    serviceOrderHelpers(input: $input) {
      data {
        id
        fixCommissionAmount
        point
        commissionPercent
        commissionAmount
        serviceOrder {
          id
          name
          order {
            id
            no
            date
            previewItem
            designer {
              id
              name
              designerNo
            }
          }
        }
      }
    }
  }
`

export const useLazyFetchServiceOrderHelpers = input => {
  const [fetchServiceOrderHelpers, serviceOrderHelpers] = useLazyQuery(SERVICE_ORDER_HELPERS, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
  return {
    fetchServiceOrderHelpers,
    serviceOrderHelpers,
  }
}

const DECREASE_HELP_RECORD = gql`
  query DECREASE_HELP_RECORD($input: ServiceOrderHelpersInput!) {
    serviceOrderHelpers(input: $input) {
      totalCount
      pageLimit
      pageOffset
      serviceData {
        id
        type
        commissionPercent
        # 抽固定金額
        fixCommissionAmount
        # 點數
        point
        # 點數換算
        pointAmount
        helper {
          id
          name
          designerNo
        }
        serviceOrder {
          id
          # 服務項目
          name
          helperList {
            type
          }
          order {
            id
            date
            previewItem
            no
            serviceTotal
            helperDeductionPrice
          }
        }
      }
      ticketData {
        id
        type
        commissionPercent
        commissionAmount
        # 抽固定金額
        fixCommissionAmount
        # 點數
        point
        # 點數換算
        pointAmount
        helper {
          id
          name
          designerNo
        }
        ticketOrder {
          id
          name
          price
          order {
            date
            no
            designer {
              name
            }
          }
          service {
            id
            name
            price
          }
        }
      }
    }
  }
`

export const useFetchDecreaseHelpRecord = input =>
  useQuery(DECREASE_HELP_RECORD, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
