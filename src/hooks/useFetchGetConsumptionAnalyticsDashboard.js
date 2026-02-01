import { gql, useLazyQuery } from '@apollo/client'

const GET_CONSUMPTION_ANALYTICS_DASHDOARD = gql`
  query GET_CONSUMPTION_ANALYTICS_DASHDOARD($input: CADInput!) {
    consumptionAnalyticsDashboard(input: $input) {
      orderCustomer {
        orderGenderRatio {
          male {
            count
            percentage
          }
          female {
            count
            percentage
          }
          unknown {
            count
            percentage
          }
        }
        orderAgeDistribution {
          sorting
          ageRange
          count
          percentage
        }
        customerConsumptionRanking {
          customerConsumptionCountRanking {
            name
            cellphone
            orderCount
            totalPrice
            pricePerCount
          }
          customerConsumptionPriceRanking {
            name
            cellphone
            orderCount
            totalPrice
            pricePerCount
          }
          customerConsumptionPricePerCountRanking {
            name
            cellphone
            orderCount
            totalPrice
            pricePerCount
          }
        }
        sourceRatio {
          name
          count
          percentage
        }
        returnedRatio {
          new {
            count
            percentage
          }
          retented {
            count
            percentage
          }
          unReturned {
            count
            percentage
          }
        }
        newCusStatistics {
          newCusTotalCount
          newCusPercentage
          designer {
            id
            name
          }
          newCusGenderRatio {
            male {
              count
              percentage
            }
            female {
              count
              percentage
            }
            unknown {
              count
              percentage
            }
          }
        }
      }
      weeklyOrderCountRanking {
        sorting
        week
        orderCount
        pricePerCount
      }
      productSalesRanking {
        productSalesVolumeRanking {
          name
          categoryName
          count
          price
        }
        productSalesPriceRanking {
          name
          categoryName
          count
          price
        }
      }
      performanceTrend {
        date
        performances {
          userName
          performance
          performanceDetail {
            membership
            product
            service
            ticketSell
            ticketUse
          }
        }
      }
    }
  }
`

export default function useFetchGetConsumptionAnalyticsDashboard() {
  const [getConsumptionAnalyticsDashboardLazy, getConsumptionAnalyticsDashboardLazyData] = useLazyQuery(GET_CONSUMPTION_ANALYTICS_DASHDOARD, {
    fetchPolicy: 'cache-and-network',
  })
  return [getConsumptionAnalyticsDashboardLazy, getConsumptionAnalyticsDashboardLazyData]
}
