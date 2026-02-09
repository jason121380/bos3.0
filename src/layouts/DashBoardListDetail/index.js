/** @jsxImportSource @emotion/react */
import { useEffect, useState } from 'react'
import {
  List, ListItem, ListSubheader, ListItemText, Card,
  Container, Link, Grid,
} from '@mui/material'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import { Link as RouterLink } from 'react-router-dom'
import idx from 'idx'
import useFetchUserPermission from 'hooks/useFetchUser'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  center: css({
    width: '90%',
    // height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    margin: '20px auto',
    backgroundColor: '',
  }),
  center1: css({
    width: 300,
    // height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    margin: '50px auto',
    backgroundColor: '',
  }),
  content: css({
    padding: 0,
  }),
  textColor: css({
    color: '#0f1a3a',
    marginTop: '40px',
    // alignItems: 'center',
    // justifyContent: 'center',
    width: 150,
  }),
}

export default function DashBoardListDetail() {
  function LinkItem(props) {
    // 拿權限
    const [userPageAuth, setUserPageAuth] = useState([])

    const designerId =
      localStorage.getItem('user') === null
        ? (window.location = '/auth/login')
        : JSON.parse(localStorage.getItem('user')).id
    const apiUserPermissions = useFetchUserPermission({
      id: designerId === undefined ? null : designerId,
    })

    useEffect(() => {
      if (apiUserPermissions.data && !apiUserPermissions.loading) {
        const userPageAuth = idx(apiUserPermissions, _ => _.data.user.pageAuthority.pageAuthority)
        setUserPageAuth(userPageAuth)
      }
    }, [apiUserPermissions.data, apiUserPermissions.loading])
    let item = ''
    userPageAuth
      .filter(a => a.pageTitle === '報表及分析')
      .map(a => {
        a.pageAuthority.filter(a => {
          if (a.pageName === props.itemName && a.authority === true) {
            item = props.itemName
          }
        })
      })

    if (item) {
      return (
        <Link
          component={RouterLink}
          variant="h5"
          to={props.link}
          color="textPrimary"
          underline="none"
        >
          <ListItem>
            <ListItemText primary={item} />
          </ListItem>
        </Link>
      )
    } else {
      return ''
    }
  }
  function SubMenuItem(Arr) {
    // 拿權限
    const [userPageAuth, setUserPageAuth] = useState([])

    const designerId =
      localStorage.getItem('user') === null
        ? (window.location = '/auth/login')
        : JSON.parse(localStorage.getItem('user')).id
    const apiUserPermissions = useFetchUserPermission({
      id: designerId === undefined ? null : designerId,
    })

    useEffect(() => {
      if (apiUserPermissions.data && !apiUserPermissions.loading) {
        const userPageAuth = idx(apiUserPermissions, _ => _.data.user.pageAuthority.pageAuthority)
        setUserPageAuth(userPageAuth)
      }
    }, [apiUserPermissions.data, apiUserPermissions.loading])
    const subItem = []
    userPageAuth
      .filter(a => a.pageTitle === '報表及分析')
      .map(a => {
        a.pageAuthority.filter(a => {
          Arr.map(i => {
            if (a.pageName === i && a.authority === true) {
              subItem.push(i)
            }
          })
        })
      })
    if (subItem.length > 0) {
      return true
    } else {
      return false
    }
  }
  return (
    <Page css={styles.root} title='報表目錄'>
      <Container maxWidth={false}>
        <AdminPageHeader title='報表目錄' />
        <Grid
          container
          spacing={3}
          columns={{ xs: 4, sm: 8, md: 12 }}
          style={{ margin: '20px auto !important' }}
        >
          {SubMenuItem(['店家日報表', '設計師日報表', '互助日報表']) && (
            <Grid item xs={12} sm={4} md={2}>
              <Card css={styles.center}>
                <List subheader={<ListSubheader>日報表</ListSubheader>}>
                  <LinkItem itemName={'店家日報表'} link={'/merchant-daily-report'} />
                  <LinkItem itemName={'設計師日報表'} link={'/employee-daily-report'} />
                  <LinkItem itemName={'互助日報表'} link={'/decrease-daily-report'} />
                </List>
              </Card>
            </Grid>
          )}
          {SubMenuItem([
            '店家區間累計表',
            '全店業績分析表',
            '每日業績分析表',
            '每日收支明細',
            '收支分類明細表',
            '收支匯款表',
            '每日非現金明細',
            '非現金明細對帳單',
            '顧客入金餘額表',
            '店家排行榜',
            '單一服務項目查詢',
            '營業統計分析表',
            '顧客卡券餘額表',
            '營業項目月分析表',
          ]) && (
              <Grid item xs={12} sm={4} md={2}>
                <Card css={styles.center}>
                  <List subheader={<ListSubheader>營業</ListSubheader>}>
                    <LinkItem itemName={'店家區間累計表'} link={'/merchant-business-interval-report'} />
                    <LinkItem itemName={'店家排行榜'} link={'/merchant-leader-board'} />
                    <LinkItem itemName={'全店業績分析表'} link={'/designer/perform/overview'} />
                    <LinkItem itemName={'每日業績分析表'} link={'/merchant-daily-performance-report'} />
                    <LinkItem itemName={'每日收支明細'} link={'/money-flow-daily-report'} />
                    <LinkItem itemName={'收支分類明細表'} link={'/money-flow-category-report'} />
                    <LinkItem itemName={'收支匯款表'} link={'/money-flow-transfer-report'} />
                    <LinkItem itemName={'每日非現金明細'} link={'/payment-report'} />
                    <LinkItem itemName={'單一服務項目查詢'} link={'/single-service-report'} />
                    <LinkItem itemName={'非現金明細對帳單'} link={'/non-cash-statement-report'} />
                    <LinkItem itemName={'顧客卡券餘額表'} link={'/customer-coupon-report'} />
                    <LinkItem itemName={'顧客入金餘額表'} link={'/customer-wallet-balance'} />
                    <LinkItem itemName={'營業統計分析表'} link={'/business-analysis-report'} />
                    <LinkItem itemName={'營業項目月分析表'} link={'/business-items-monthly-analyze-report'} />
                  </List>
                </Card>
              </Grid>
            )}{' '}
          {SubMenuItem(['設計師排行榜', '設計師抽成報表', '設計師業績月報表', '服務扣項明細表', '設計師業績表']) && (
            <Grid item xs={12} sm={4} md={2}>
              <Card css={styles.center}>
                <List subheader={<ListSubheader>設計師</ListSubheader>}>
                  <LinkItem
                    itemName={'設計師業績分析表'}
                    link={'/designer-perforamnce-analyze-report'}
                  />
                  <LinkItem itemName={'設計師排行榜'} link={'/designer-perform-basic'} />
                  <LinkItem itemName={'設計師抽成報表'} link={'/designer-rake-report'} />
                  <LinkItem itemName={'設計師業績月報表'} link={'/designer-monthly-report'} />
                  <LinkItem itemName={'服務扣項明細表'} link={'/service-deduction-detail-report'} />
                  <LinkItem itemName={'設計師業績表'} link={'/designer-performance-report'} />
                </List>
              </Card>
            </Grid>
          )}{' '}
          {SubMenuItem(['互助排行榜', '互助點數明細', '互助月報表', '互助業績報表']) && (
            <Grid item xs={12} sm={4} md={2}>
              <Card css={styles.center}>
                <List subheader={<ListSubheader>互助</ListSubheader>}>
                  <LinkItem itemName={'互助排行榜'} link={'/helper-leaderboard'} />
                  <LinkItem itemName={'互助點數明細'} link={'/decrease/detail'} />
                  <LinkItem itemName={'互助月報表'} link={'/helper-monthly-report'} />
                  <LinkItem itemName={'互助業績報表'} link={'/helper-performance'} />
                </List>
              </Card>
            </Grid>
          )}{' '}
          {SubMenuItem(['店販抽成明細', '店販分類抽成明細', '商品銷售排行榜', '商品消耗明細', '設計師店販抽成明細', '商品進銷貨報表', '會員卡銷售報表', '商品庫存盤點表']) && (
            <Grid item xs={12} sm={4} md={2}>
              <Card css={styles.center}>
                <List subheader={<ListSubheader>商品</ListSubheader>}>
                  <LinkItem itemName={'店販抽成明細'} link={'/merchant/sells/records'} />
                  <LinkItem itemName={'店販分類抽成明細'} link={'/merchant/category/sells/records'} />
                  <LinkItem itemName={'商品銷售排行榜'} link={'/product-leader-board'} />
                  <LinkItem itemName={'商品消耗明細'} link={'/product-consume-report'} />
                  <LinkItem itemName={'商品進銷貨報表'} link={'/product-invoicing-record-report'} />
                  <LinkItem itemName={'商品庫存表'} link={'/product-inventoryList'} />
                  <LinkItem itemName={'商品庫存盤點表'} link={'/product-reserve-check'} />
                  <LinkItem itemName={'會員卡銷售報表'} link={'/membership-sell-report'} />
                </List>
              </Card>
            </Grid>
          )}{' '}
          {SubMenuItem(['費用分析表', '損益表', '多店業績統計表', '消費分析儀表板', '多店店販銷售排行']) && (
            <Grid item xs={12} sm={4} md={2}>
              <Card css={styles.center}>
                <List subheader={<ListSubheader>管理分析</ListSubheader>}>
                  <LinkItem itemName={'費用分析表'} link={'/cost-analysis-report'} />
                  <LinkItem itemName={'損益表'} link={'/income-statement-report'} />
                  <LinkItem itemName={'多店業績統計表'} link={'/overall-performance-analysis-report'} />
                  <LinkItem itemName={'顧客消費排行榜'} link={'/customer-consumption-leaderboard'} />
                  <LinkItem itemName={'顧客入金排行榜'} link={'/customer-wallet-leaderboard'} />
                  <LinkItem itemName={'消費分析儀表板'} link={'/consumption-analytics-dashboard'} />
                  <LinkItem itemName={'多店店販銷售排行'} link={'/multi-merchants-leader-board'} />
                </List>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>
    </Page>
  )
}
