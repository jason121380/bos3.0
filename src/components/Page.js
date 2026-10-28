import PropTypes from 'prop-types'
/* eslint-disable no-undef */
import React, { useEffect } from 'react'
import { useLocation } from 'react-router'

const { NODE_ENV, REACT_APP_GA_MEASUREMENT_ID: GA_MEASUREMENT_ID } = process.env

function Page({ title, children, ...rest }) {
  const location = useLocation()
  useEffect(() => {
    if (NODE_ENV !== 'production') {
      return
    }
    if (window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname,
        page_name: title,
      })
    }
  }, [location.pathname, title])
  // 頁面標題直接寫 document.title（原 react-helmet 只用來做這件事；移除後入口 chunk 少 14 KB）
  useEffect(() => {
    if (title !== undefined) document.title = title
  }, [title])
  return (
    <div {...rest}>
      {children}
    </div>
  )
}

Page.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
}

export default Page
