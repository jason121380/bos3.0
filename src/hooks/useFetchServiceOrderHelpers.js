import { gql, useLazyQuery } from '@apollo/client'

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
