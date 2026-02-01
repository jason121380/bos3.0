import { gql, useLazyQuery } from '@apollo/client'

const FETCH_DESIGNER_SERVICE = gql`
  query getDesignerService($input: GetDesignerServiceInput!) {
    getDesignerService(input: $input) {
      id
      name
      lowestPrice
      highestPrice
    }
  }
`
export const useLazyFetchDesignerService = ({ designerId }) => {
  const [fetchDesignerService, designerService] = useLazyQuery(FETCH_DESIGNER_SERVICE, {
    fetchPolicy: 'cache-and-network',
    variables: {
      input: {
        designerId,
      },
    },
  })
  return {
    fetchDesignerService,
    designerService,
  }
}
