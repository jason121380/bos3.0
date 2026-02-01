import { gql, useLazyQuery, useQuery } from '@apollo/client'

const GET_SERVICE = gql`
  query service($serviceId: ID!) {
    service(serviceId: $serviceId) {
      id
      no
      name
      price
      helperDeductionSetting {
        type
        helperDeductionType
        nameList
        peopleCount
        point
        cash
        percent
        designatePoint
        designateCash
        designatePercent
        nonDesignatePoint
        nonDesignateCash
        nonDesignatePercent
        isSplitted
      }
      serviceDetail {
        customerSellSetting {
          category
          percent
          birthday
        }
        serviceDeductionItems {
          type
          itemSettings {
            name
            type
            price
            isSpecial
            deductionWay
            designatePrice
            nonDesignatePrice
            deductionOrder
            deductionReference
          }
        }
        isTicketCountNow
        ticketAvailableCount
      }
      isUsing
      serviceCategory {
        id
        no
        name
        attribution
        remark
        isUsing
        updatedAt
        creator {
          id
          name
        }
      }
      updatedAt
      creator {
        id
        name
      }
      deletedAt
      isLocked
      isLockedOriginalValue
      isNoCash
      isSpecialRakeUsing
      specialRake
      bindedThirdPartTicket {
        id
      }
      isBindedThirdPartTicketLocked
    }
  }
`

const GET_SERVICE_FOR_RENDER_HELPER = gql`
  query service($serviceId: ID!) {
    service(serviceId: $serviceId) {
      helperDeductionSetting {
        type
        helperDeductionType
        nameList
      }
    }
  }
`

export default function useFetchService({ serviceId }) {
  return useQuery(GET_SERVICE, {
    variables: {
      serviceId,
    },
  })
}

export const useLazyFetchService = () => {
  const [getService, response] = useLazyQuery(GET_SERVICE_FOR_RENDER_HELPER)
  return {
    getService: ({ serviceId }) =>
      getService({
        variables: {
          serviceId,
        },
      }),
    ...response,
  }
}

export const useLazyFetchServiceNew = () => {
  const [getService, serviceDetail] = useLazyQuery(GET_SERVICE_FOR_RENDER_HELPER, {
    fetchPolicy: 'cache-and-network'
  })
  return [getService, serviceDetail]
}
