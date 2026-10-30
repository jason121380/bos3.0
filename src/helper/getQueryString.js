export default function getQueryStringValue({ key, location }) {
  return decodeURIComponent(
    location.search.replace(new RegExp('^(?:.*[&\\?]' + encodeURIComponent(key).replace(/[.+*]/g, '\\$&') + '(?:\\=([^&]*))?)?.*$', 'i'), '$1')
  )
}
