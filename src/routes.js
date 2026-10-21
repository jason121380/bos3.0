import Customer from 'layouts/Customer'
import Line from 'layouts/Line'
import React, { lazy, Suspense } from 'react'
import { Redirect } from 'react-router-dom'

import AuthLayout from './layouts/Auth'
import DashboardLayout from './layouts/Dashboard'
import ErrorLayout from './layouts/Error'
import EHSLayout from './layouts/EHS'
import dashboardRoutes from './dashboardRoutes'

// 顧客端（LINE）頁面改為延遲載入：原本同步 import，連後台使用者的首屏都要下載這 10 頁與 google-map-react、superagent。
// Customer／Line 版面已用 Suspense 包住子路由；AR2 是頂層路由，自行包 Suspense。
const AR2Lazy = lazy(() => import('views/AR2'))
const AR2 = props => (
  <Suspense fallback={null}>
    <AR2Lazy {...props} />
  </Suspense>
)
const LineMap = lazy(() => import('views/Line/map'))
const MemberCard = lazy(() => import('views/MemberCard'))
const MemberCreate = lazy(() => import('views/MemberCreate'))
const ReservationPage = lazy(() => import('views/Reservation'))
const ReservationList = lazy(() => import('views/ReservationList'))
const CustomerSelfCreate = lazy(() => import('views/CustomerSelfCreate'))
const CustomerEventTicketSearch = lazy(() => import('views/CustomerEventTicketSearch'))
const CustomerSendEventTicket = lazy(() => import('views/CustomerSendEventTicket'))
const CustomerRating = lazy(() => import('views/CustomerRating'))

const UiPreview = lazy(() => import('views/UiPreview'))

export default [
  {
    path: '/',
    exact: true,
    component: () => <Redirect to="/order/create" />,
  },
  {
    path: '/line',
    component: Line,
    routes: [
      {
        path: '/line/map/:id',
        exact: true,
        component: LineMap,
      },
    ],
  },
  {
    path: '/ar',
    component: AR2,
  },
  {
    path: '/ar2',
    component: AR2,
  },
  // 開發用：src/ui 元件預覽，正式建置不包含
  ...(process.env.NODE_ENV !== 'production'
    ? [
        {
          path: '/ui-preview',
          exact: true,
          component: () => (
            <Suspense fallback={null}>
              <UiPreview />
            </Suspense>
          ),
        },
      ]
    : []),
  // {
  //   path: '/ar2',
  //   component: AR2
  // },
  {
    path: '/manager',
    component: DashboardLayout,
    routes: [
      {
        path: '/manager/memberChangeLineMenu',
        exact: true,
        component: lazy(() => import('views/ChangeLineMenuPage/memberChangeLineMenu')),
      },
      {
        path: '/manager/temp/attendanceRecord',
        exact: true,
        component: lazy(() => import('views/ChangeLineMenuPage/temp')),
      },
    ],
  },
  {
    path: '/customer',
    component: Customer,
    routes: [
      {
        path: '/customer/clearstorage',
        exact: true,
        component: lazy(() => import('views/ClearStorage')),
      },
      {
        path: '/customer/member/card',
        exact: true,
        component: MemberCard,
      },
      {
        path: '/customer/member/create',
        exact: true,
        component: MemberCreate,
      },
      {
        path: '/customer/reservation/list',
        exact: true,
        component: ReservationList,
      },
      {
        path: '/customer/reservation/:id',
        exact: true,
        component: ReservationPage,
      },
      {
        path: '/customer/login',
        exact: true,
        component: lazy(() => import('views/CustomerLogin')),
      },
      {
        path: '/customer/consumption/records',
        exact: true,
        component: lazy(() => import('views/ConsumptionRecords')),
      },
      {
        path: '/customer/self-create/:id',
        exact: true,
        component: CustomerSelfCreate,
      },
      {
        path: '/customer/send-event-ticket/:id',
        exact: true,
        component: CustomerSendEventTicket,
      },
      {
        path: '/customer/rating/:orderId/:rank',
        exact: true,
        component: CustomerRating,
      },
      {
        path: '/customer/event-ticket-search',
        exact: true,
        component: CustomerEventTicketSearch,
      },
    ],
  },
  {
    path: '/ets',
    component: Customer,
    routes: [
      {
        path: '/ets',
        exact: true,
        component: CustomerEventTicketSearch,
      },
    ],
  },
  {
    path: '/changelinemenu',
    component: EHSLayout,
    routes: [
      {
        path: '/changelinemenu/index2',
        exact: true,
        component: lazy(() => import('views/ChangeLineMenuPage/index')),
      },
      {
        path: '/changelinemenu/default',
        exact: true,
        component: lazy(() => import('views/ChangeLineMenuPage/defaultMenu')),
      },
    ],
  },
  {
    path: '/ehs2',
    component: EHSLayout,
    routes: [
      {
        path: '/ehs2/ehs',
        exact: true,
        component: lazy(() => import('views/EHS2Page/ehs')),
      },
      {
        path: '/ehs2/ehs2',
        exact: true,
        component: lazy(() => import('views/EHS2Page/ehs2')),
      },
      {
        path: '/ehs2/privacy',
        exact: true,
        component: lazy(() => import('views/EHS2Page/privacy')),
      },
    ],
  },
  {
    path: '/auth',
    component: AuthLayout,
    routes: [
      {
        path: '/auth/login',
        exact: true,
        component: lazy(() => import('views/Login')),
      },
      {
        path: '/auth/register',
        exact: true,
        component: lazy(() => import('views/Register')),
      },
      {
        path: '/auth/resetpassword',
        exact: true,
        component: lazy(() => import('views/Resetpassword')),
      },
      {
        component: () => <Redirect to="/errors/error-404" />,
      },
    ],
  },
  {
    path: '/errors',
    component: ErrorLayout,
    routes: [
      {
        path: '/errors/error-401',
        exact: true,
        component: lazy(() => import('views/Error401')),
      },
      {
        path: '/errors/error-404',
        exact: true,
        component: lazy(() => import('views/Error404')),
      },
      {
        path: '/errors/error-500',
        exact: true,
        component: lazy(() => import('views/Error500')),
      },
      {
        component: () => <Redirect to="/errors/error-404" />,
      },
    ],
  },
  {
    route: '*',
    component: DashboardLayout,
    routes: dashboardRoutes,
  },
]
