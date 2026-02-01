import { gql, useLazyQuery } from '@apollo/client'

const FETCH_GET_SIMGLE_SERVICE_ITEM_V2 = gql`
  query FETCH_GET_SIMGLE_SERVICE_ITEM_V2($input: SingleServiceItemV2Input!) {
    singleServiceItemV2(input: $input) {
      serviceIds
      date {
        date
        designerServices {
          designerId
          designerName
          designerNo
          singleServices {
            serviceId
            serviceName
            serviceNo
            singleServiceItem {
              date
              serviceName
              performance
              orderCount
              designerName
              designerNo
            }
          }
        }
        summary {
          designerId
          designerName
          designerNo
          singleServices {
            serviceId
            serviceName
            serviceNo
            singleServiceItem {
              date
              serviceName
              performance
              orderCount
              designerName
              designerNo
            }
          }
        }
      }
      designer {
        designerId
        designerName
        designerNo
        datePerformances {
          date
          singleServices {
            serviceId
            serviceName
            serviceNo
            summary {
              date
              performance
              orderCount
            }
            singleServiceItem {
              date
              performance
              orderCount
            }
          }
        }
        summary {
          serviceId
          serviceName
          summary {
            date
            performance
            orderCount
          }
        }
      }
      all {
        date
        singleServices {
          serviceId
          serviceName
          serviceNo
          singleServiceItem {
            date
            serviceName
            performance
            orderCount
            designerName
            designerNo
          }
          summary {
            date
            serviceName
            performance
            orderCount
            designerName
            designerNo
          }
        }
      }
    }
  }
`

export default function useFetchGetSingleServiceItemV2() {
  const [getServiceItem, serviceItemData] = useLazyQuery(FETCH_GET_SIMGLE_SERVICE_ITEM_V2, {
    fetchPolicy: 'cache-and-network',
  })
  return [getServiceItem, serviceItemData]
}
