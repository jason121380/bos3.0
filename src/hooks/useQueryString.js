import { useLocation } from 'react-router'

export default function useQueryString() {
  const location = useLocation()

  const getQueryString = query => {
    return decodeURIComponent(
      location.search.replace(new RegExp('^(?:.*[&\\?]' + encodeURIComponent(query).replace(/[.+*]/g, '\\$&') + '(?:\\=([^&]*))?)?.*$', 'i'), '$1')
    )
  }
  return [getQueryString]
}
