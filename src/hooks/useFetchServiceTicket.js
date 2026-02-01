import { gql, useLazyQuery, useQuery } from '@apollo/client'

const GET_SERVICE_TICKET = gql`
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
      performanceCalculationMode
      handlingFeeDecountMode
      isLaunched
    }
  }
`

export default function useFetchServiceTicket({ serviceId }) {
  return useQuery(GET_SERVICE_TICKET, {
    variables: {
      serviceId,
    },
  })
}

export const useLazyFetchService = () => {
  const [getService, response] = useLazyQuery(GET_SERVICE_TICKET)
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

// const GET_SERVICE_TICKET = gql`
//   query GET_SERVICE($serviceId: ID!) {
//     service(serviceId: $serviceId) {
//       id
//       no
//       name
//       price
//       helperDeductionSetting {
//         type
//         nameList
//         peopleCount
//         point
//         cash
//         percent
//       }
//       serviceDetail {
//         isTicketCountNow
//         ticketAvailableCount
//         helperDeductionType
//         customerSellSetting {
//           category
//           percent
//           birthday
//         }
//         serviceDeductionItems {
//           type
//           isSpecial
//           specialDesignate
//           specialNotDesignate
//           fixedDeduction
//           itemSettings {
//             name
//             type
//             price
//           }
//         }
//       }
//       serviceCategory {
//         id
//         no
//         name
//       }
//     }
//   }
// `

// export default function useFetchServiceTicket({ serviceId }) {
//   const { data, loading, error, refetch } = useQuery(GET_SERVICE_TICKET, {
//     variables: {
//       serviceId,
//     },
//     fetchPolicy: 'cache-and-network',
//   })
//   return { data, loading, error, refetch }
// }
