import useMounted from 'hooks/useMounted'
import React from 'react'
import { Redirect } from 'react-router-dom'

export default function () {
  return useMounted(() => localStorage.clear()) ? '清除快取中...' : <Redirect to="/" />
}
