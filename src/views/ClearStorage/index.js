import useMounted from 'hooks/useMounted'
import React from 'react'
import { Redirect } from 'react-router-dom'

export default function () {
  return useMounted(() => localStorage.clear()) ? <p className="py-12 text-center text-body text-text-secondary">清除快取中...</p> : <Redirect to="/" />
}
