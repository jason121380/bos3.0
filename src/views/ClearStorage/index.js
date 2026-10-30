import useMounted from 'hooks/useMounted'
import React from 'react'
import { Redirect } from 'react-router-dom'

// 先顯示「清除快取中...」，清空 localStorage 後才導回首頁（Jason 2026/10/22 fix all：原本一開始就導頁、文字永遠不顯示）
export default function ClearStorage() {
  return useMounted(() => localStorage.clear()) ? (
    <Redirect to="/" />
  ) : (
    <p className="py-12 text-center text-body text-text-secondary">清除快取中...</p>
  )
}
