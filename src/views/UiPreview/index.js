import React, { useEffect, useState } from 'react'
import { Plus, Download, Search, Trash2 } from 'lucide-react'
import { Button } from 'ui/button'
import { Input, Field } from 'ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TablePagination } from 'ui/table'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose } from 'ui/dialog'
import { Badge } from 'ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from 'ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'ui/tabs'
import { toast, Toaster } from 'ui/toast'
import { EmptyState } from 'ui/empty-state'
import { Skeleton } from 'ui/skeleton'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Switch } from 'ui/switch'
import { CheckboxField } from 'ui/checkbox'
import { Avatar } from 'ui/avatar'
import { StatGrid, Stat, StatCard } from 'ui/stat'

// 開發用元件預覽頁（/ui-preview），只在非正式建置註冊路由。資料皆為假資料，不呼叫任何 API。
const rows = [
  { no: 'A20261018001', customer: '王小明', designer: 'Lydia', amount: 1880, status: 'paid' },
  { no: 'A20261018002', customer: '陳美玲', designer: 'Mika', amount: 3200, status: 'pending' },
  { no: 'A20261018003', customer: '林志豪', designer: 'Darren', amount: 650, status: 'refund' },
]
const STATUS = { paid: ['success', '已付款'], pending: ['warning', '待處理'], refund: ['danger', '已退款'] }
const money = n => `NT$ ${n.toLocaleString('en-US')}`

const Section = ({ title, children }) => (
  <section className="flex flex-col gap-3">
    <h2 className="text-heading text-text">{title}</h2>
    {children}
  </section>
)

export default function UiPreview() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [dark, setDark] = useState(false)
  const [range, setRange] = useState('day')
  const [status, setStatus] = useState(true)
  const [checkIn, setCheckIn] = useState(true)
  const [chip, setChip] = useState(false)
  // 深色切換掛在 <html>，讓 Dialog / Select 等浮層一併套用
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    return () => document.documentElement.classList.remove('dark')
  }, [dark])

  return (
    <div className="ui-root min-h-screen bg-canvas">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-8 py-6">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-title text-text">元件預覽</h1>
            <p className="text-body text-text-secondary">src/ui 依 STYLE.md 建立的基礎元件</p>
          </div>
          <Button variant="ghost" onClick={() => setDark(d => !d)}>{dark ? '淺色' : '深色'}</Button>
        </header>

        <Section title="Button">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary"><Plus strokeWidth={1.75} />新增帳單</Button>
            <Button variant="secondary"><Download strokeWidth={1.75} />匯出</Button>
            <Button variant="ghost">取消</Button>
            <Button variant="danger"><Trash2 strokeWidth={1.75} />刪除</Button>
            <Button variant="secondary" disabled>停用</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">sm 32</Button>
            <Button size="md">md 36</Button>
            <Button size="lg">lg 40</Button>
            <Button size="icon" variant="ghost" aria-label="搜尋"><Search strokeWidth={1.75} /></Button>
          </div>
        </Section>

        <Section title="Input / Select">
          <div className="grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="顧客姓名" htmlFor="p-name" required hint="與身分證相同">
              <Input id="p-name" placeholder="請輸入姓名" />
            </Field>
            <Field label="手機" htmlFor="p-phone" required error="手機格式錯誤，請輸入 10 碼數字">
              <Input id="p-phone" defaultValue="0912" invalid />
            </Field>
            <Field label="付款方式">
              <Select defaultValue="cash">
                <SelectTrigger><SelectValue placeholder="請選擇" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">現金</SelectItem>
                  <SelectItem value="card">信用卡</SelectItem>
                  <SelectItem value="linepay">LINE Pay</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="停用欄位">
              <Input disabled defaultValue="不可編輯" />
            </Field>
          </div>
        </Section>

        <Section title="Table / Badge">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>帳單編號</TableHead>
                <TableHead>顧客</TableHead>
                <TableHead>設計師</TableHead>
                <TableHead numeric>金額</TableHead>
                <TableHead>狀態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.no}>
                  <TableCell className="tabular-nums">{r.no}</TableCell>
                  <TableCell>{r.customer}</TableCell>
                  <TableCell>{r.designer}</TableCell>
                  <TableCell numeric>{money(r.amount)}</TableCell>
                  <TableCell><Badge variant={STATUS[r.status][0]}>{STATUS[r.status][1]}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            count={128}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={e => { setRowsPerPage(e.target.value); setPage(0) }}
          />
        </Section>

        <Section title="Card / Tabs">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[['今日營收', 'NT$ 48,320'], ['今日客數', '37'], ['平均客單', 'NT$ 1,306']].map(([k, v]) => (
              <Card key={k}>
                <CardContent className="flex flex-col gap-1">
                  <span className="text-label text-text-secondary">{k}</span>
                  <span className="text-display tabular-nums text-text">{v}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader action={<Button size="sm">查看全部</Button>}>
              <CardTitle>本月業績</CardTitle>
              <CardDescription>2026/10/01 – 2026/10/18</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="service">
                <TabsList>
                  <TabsTrigger value="service">服務</TabsTrigger>
                  <TabsTrigger value="product">店販</TabsTrigger>
                  <TabsTrigger value="card">會員卡</TabsTrigger>
                </TabsList>
                <TabsContent value="service"><p className="text-body text-text-secondary">服務業績內容</p></TabsContent>
                <TabsContent value="product"><EmptyState title="尚無店販資料" description="選擇其他日期區間，或先新增帳單。" action={<Button variant="primary">新增帳單</Button>} /></TabsContent>
                <TabsContent value="card">
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-11 w-full" />
                    <Skeleton className="h-11 w-full" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </Section>

        <Section title="Dialog / Toast">
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild><Button variant="danger">刪除帳單</Button></DialogTrigger>
              <DialogContent size="sm">
                <DialogHeader>
                  <DialogTitle>確定要刪除這張帳單？</DialogTitle>
                  <DialogDescription>刪除後此帳單的業績、抽成與庫存扣減都會一併取消，且無法復原。</DialogDescription>
                </DialogHeader>
                <DialogBody><p className="text-body text-text">帳單編號 A20261018001・NT$ 1,880</p></DialogBody>
                <DialogFooter>
                  <DialogClose asChild><Button variant="ghost">取消</Button></DialogClose>
                  <DialogClose asChild><Button variant="danger">刪除</Button></DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={() => toast.success('已儲存帳單')}>成功提示</Button>
            <Button onClick={() => toast.error('儲存失敗', '網路連線中斷，請確認網路後再按一次儲存。')}>錯誤提示</Button>
          </div>
        </Section>

        <Section title="第二輪：NativeSelect / ToggleGroup / Switch / Checkbox">
          <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
            <NativeSelect label="帳號狀態" value={status} onChange={e => setStatus(e.target.value)}>
              <NativeSelectOption value={true}>啟用</NativeSelectOption>
              <NativeSelectOption value={false}>停用</NativeSelectOption>
            </NativeSelect>
            <NativeSelect label="服務類別" value="" placeholder="請選擇" onChange={() => {}}>
              <NativeSelectOption value="1">剪髮</NativeSelectOption>
            </NativeSelect>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <ToggleGroup exclusive value={range} onChange={(e, v) => v && setRange(v)}>
              <ToggleGroupItem value="day">日</ToggleGroupItem>
              <ToggleGroupItem value="week">週</ToggleGroupItem>
              <ToggleGroupItem value="month">月</ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroupItem selected={chip} onChange={() => setChip(c => !c)}>只看指定</ToggleGroupItem>
            <Switch label="報到模式" checked={checkIn} onChange={(e, c) => setCheckIn(c)} />
            <CheckboxField label="連續新增" defaultChecked />
          </div>
        </Section>

        <Section title="第二輪：Avatar / Stat">
          <div className="flex items-center gap-3">
            <Avatar size="sm">王</Avatar>
            <Avatar>林</Avatar>
            <Avatar size="lg" />
          </div>
          <StatGrid cols={4}>
            <Stat label="服務消費">12,880</Stat>
            <Stat label="店販消費">3,200</Stat>
            <Stat label="業績收入" hint="含卡券入業績">16,080</Stat>
            <Stat label="營業現金應收">9,500</Stat>
          </StatGrid>
          <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard label="入金餘額" hint="最後異動 2026/10/18">NT$ 12,000</StatCard>
            <StatCard label="紅利點數">1,880</StatCard>
          </div>
        </Section>
      </div>
      <Toaster />
    </div>
  )
}
