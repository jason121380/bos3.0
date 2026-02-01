import { gql, useQuery, useLazyQuery } from '@apollo/client'

const USE_FETCH_GET_ATTRIBUTIONS = gql`
  query USE_FETCH_GET_ATTRIBUTIONS {
    getAttribution {
      name
      value
    }
  }
`

export default function useFetchGetAttribution() {
  return useQuery(USE_FETCH_GET_ATTRIBUTIONS, {
    fetchPolicy: 'cache-and-network',
  })
}

export function useFetchGetAttributionLazy() {
  const [getAttributionLazy, attributionLazyData] = useLazyQuery(USE_FETCH_GET_ATTRIBUTIONS, {
    fetchPolicy: 'cache-and-network',
  })
  return [getAttributionLazy, attributionLazyData]
}

const USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE = gql`
  query USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE {
    getAttributionForRake {
      label
      value
    }
  }
`

export function useFetchGetAttributionForRake() {
  return useQuery(USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE, {
    fetchPolicy: 'cache-and-network',
  })
}