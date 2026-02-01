import { gql, useQuery } from '@apollo/client'

const GET_DESIGNER_PERFORMANCE = gql`
  query GET_DESIGNER_PERFORMANCE($input: DesignerPerformanceInput!) {
    designerPerformance(input: $input) {
			designerPerformanceData {
				designerName
				serviceCategory {
					categoryName
					servicePerformance
					designateServicePerformance
					nonDesignateServicePerformance
					servicePerformanceCount
					designateCount
					nonDesignateCount
				}
				totalCustomer
				totalDesignateCustomer
				totalNonDesignateCustomer
				performance
				designatePerformance
				nonDesignatePerformance
				totalPerformance
				designateTotalPerformance
				nonDesignateTotalPerformance
				productPerformance
				designateProductPerformance
				nonDesignateProductPerformance
				membershipPerformance
				designateMembershipPerformance
				nonDesignateMembershipPerformance
				totalPerformanceCustomerUnit
				designateTotalPerformanceCustomerUnit
				nonDesignateTotalPerformanceCustomerUnit
				performanceDay
				designatePerformanceDay
			}
			designerPerformanceSum {
				designerName
				serviceCategory {
					categoryName
					servicePerformance
					designateServicePerformance
					nonDesignateServicePerformance
					servicePerformanceCount
					designateCount
					nonDesignateCount
				}
				totalCustomer
				totalDesignateCustomer
				totalNonDesignateCustomer
				performance
				designatePerformance
				nonDesignatePerformance
				totalPerformance
				designateTotalPerformance
				nonDesignateTotalPerformance
				productPerformance
				designateProductPerformance
				nonDesignateProductPerformance
				membershipPerformance
				designateMembershipPerformance
				nonDesignateMembershipPerformance
				totalPerformanceCustomerUnit
				designateTotalPerformanceCustomerUnit
				nonDesignateTotalPerformanceCustomerUnit
				performanceDay
				designatePerformanceDay
			}
			designerPerformanceMale {
				designerName
				serviceCategory {
					categoryName
					servicePerformance
					designateServicePerformance
					nonDesignateServicePerformance
					servicePerformanceCount
					designateCount
					nonDesignateCount
				}
				totalCustomer
				totalDesignateCustomer
				totalNonDesignateCustomer
				performance
				designatePerformance
				nonDesignatePerformance
				totalPerformance
				designateTotalPerformance
				nonDesignateTotalPerformance
				productPerformance
				designateProductPerformance
				nonDesignateProductPerformance
				membershipPerformance
				designateMembershipPerformance
				nonDesignateMembershipPerformance
				totalPerformanceCustomerUnit
				designateTotalPerformanceCustomerUnit
				nonDesignateTotalPerformanceCustomerUnit
				performanceDay
				designatePerformanceDay
			}
			designerPerformanceFemale {
				designerName
				serviceCategory {
					categoryName
					servicePerformance
					designateServicePerformance
					nonDesignateServicePerformance
					servicePerformanceCount
					designateCount
					nonDesignateCount
				}
				totalCustomer
				totalDesignateCustomer
				totalNonDesignateCustomer
				performance
				designatePerformance
				nonDesignatePerformance
				totalPerformance
				designateTotalPerformance
				nonDesignateTotalPerformance
				productPerformance
				designateProductPerformance
				nonDesignateProductPerformance
				membershipPerformance
				designateMembershipPerformance
				nonDesignateMembershipPerformance
				totalPerformanceCustomerUnit
				designateTotalPerformanceCustomerUnit
				nonDesignateTotalPerformanceCustomerUnit
				performanceDay
				designatePerformanceDay
			}
			designerPerformanceUnknown {
				designerName
				serviceCategory {
					categoryName
					servicePerformance
					designateServicePerformance
					nonDesignateServicePerformance
					servicePerformanceCount
					designateCount
					nonDesignateCount
				}
				totalCustomer
				totalDesignateCustomer
				totalNonDesignateCustomer
				performance
				designatePerformance
				nonDesignatePerformance
				totalPerformance
				designateTotalPerformance
				nonDesignateTotalPerformance
				productPerformance
				designateProductPerformance
				nonDesignateProductPerformance
				membershipPerformance
				designateMembershipPerformance
				nonDesignateMembershipPerformance
				totalPerformanceCustomerUnit
				designateTotalPerformanceCustomerUnit
				nonDesignateTotalPerformanceCustomerUnit
				performanceDay
				designatePerformanceDay
			}
			designerPerformancePercented {
				designerName
				serviceCategory {
					categoryName
					servicePerformance
					designateServicePerformance
					nonDesignateServicePerformance
					servicePerformanceCount
					designateCount
					nonDesignateCount
				}
				totalCustomer
				totalDesignateCustomer
				totalNonDesignateCustomer
				performance
				designatePerformance
				nonDesignatePerformance
				totalPerformance
				designateTotalPerformance
				nonDesignateTotalPerformance
				productPerformance
				designateProductPerformance
				nonDesignateProductPerformance
				membershipPerformance
				designateMembershipPerformance
				nonDesignateMembershipPerformance
				totalPerformanceCustomerUnit
				designateTotalPerformanceCustomerUnit
				nonDesignateTotalPerformanceCustomerUnit
				performanceDay
				designatePerformanceDay
			}
    }
  }
`

export default function useFetchGetDesignerPerformance({ input }) {
  return useQuery(GET_DESIGNER_PERFORMANCE, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
