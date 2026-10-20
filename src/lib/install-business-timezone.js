// 由 src/index.js 最早載入：在任何頁面程式建立日期之前，把日期換算固定為台灣時間（說明見 business-timezone.js）
import { installBusinessTimeZone } from './business-timezone'

installBusinessTimeZone()
