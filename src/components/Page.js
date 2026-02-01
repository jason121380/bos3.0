import PropTypes from 'prop-types'
/* eslint-disable no-undef */
import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'
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
  return (
    <div {...rest}>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {children}
    </div>
  )
}

Page.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
}

export default Page
