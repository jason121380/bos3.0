// 保護：店家 Logo 裁切（CropImage）——依旋轉角度算出外框大小、在畫布上旋轉後取出裁切範圍，回傳名為 avatar 的檔案；
// 圖片載入失敗時回傳錯誤（讓上傳流程顯示錯誤）、瀏覽器不支援畫布時回傳 null。
// jsdom 沒有圖片解碼與 canvas，以替身模擬；不連網。
import getCroppedImg, { createImage, getRadianAngle, rotateSize } from '../CropImage'

const RealImage = window.Image
let imageBehavior = 'load'
class FakeImage {
  constructor() {
    this.listeners = {}
    this.width = 200
    this.height = 100
  }
  addEventListener(type, fn) {
    this.listeners[type] = fn
  }
  set src(url) {
    this._src = url
    setTimeout(() => (imageBehavior === 'load' ? this.listeners.load() : this.listeners.error(new Error('load failed'))), 0)
  }
  get src() {
    return this._src
  }
}

beforeEach(() => {
  imageBehavior = 'load'
  window.Image = FakeImage
})
afterEach(() => {
  window.Image = RealImage
  jest.restoreAllMocks()
})

describe('CropImage 幾何計算', () => {
  it('角度轉弧度、旋轉後的外框大小', () => {
    expect(getRadianAngle(180)).toBeCloseTo(Math.PI)
    expect(rotateSize(200, 100, 0)).toEqual({ width: 200, height: 100 })
    const r90 = rotateSize(200, 100, 90)
    expect(r90.width).toBeCloseTo(100)
    expect(r90.height).toBeCloseTo(200)
  })
})

describe('createImage', () => {
  it('圖片載入成功回傳圖片，失敗回傳錯誤', async () => {
    const img = await createImage('data:image/png;base64,AAA')
    expect(img.src).toBe('data:image/png;base64,AAA')
    imageBehavior = 'error'
    await expect(createImage('bad')).rejects.toThrow('load failed')
  })
})

describe('getCroppedImg', () => {
  it('旋轉畫布後取出裁切範圍，回傳名為 avatar 的檔案', async () => {
    const ctx = {
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      drawImage: jest.fn(),
      getImageData: jest.fn(() => 'pixels'),
      putImageData: jest.fn(),
    }
    const canvases = []
    const realCreate = document.createElement.bind(document)
    jest.spyOn(document, 'createElement').mockImplementation(tag => {
      if (tag !== 'canvas') return realCreate(tag)
      const canvas = { getContext: () => ctx, toBlob: cb => cb(new Blob(['png'])), width: 0, height: 0 }
      canvases.push(canvas)
      return canvas
    })
    const file = await getCroppedImg('data:x', { x: 5, y: 6, width: 40, height: 30 }, 90, { horizontal: true, vertical: false })
    expect(file).toBeInstanceOf(File)
    expect(file.name).toBe('avatar')
    expect(ctx.rotate).toHaveBeenCalledWith(Math.PI / 2)
    expect(ctx.scale).toHaveBeenCalledWith(-1, 1)
    expect(ctx.getImageData).toHaveBeenCalledWith(5, 6, 40, 30)
    expect(ctx.putImageData).toHaveBeenCalledWith('pixels', 0, 0)
    // 最後畫布大小為裁切大小
    expect(canvases[0].width).toBe(40)
    expect(canvases[0].height).toBe(30)

    // 預設不旋轉、不翻轉（垂直翻轉也照設定）
    await getCroppedImg('data:x', { x: 0, y: 0, width: 10, height: 10 })
    expect(ctx.rotate).toHaveBeenLastCalledWith(0)
    expect(ctx.scale).toHaveBeenLastCalledWith(1, 1)
    await getCroppedImg('data:x', { x: 0, y: 0, width: 10, height: 10 }, 0, { horizontal: false, vertical: true })
    expect(ctx.scale).toHaveBeenLastCalledWith(1, -1)
  })

  it('瀏覽器不支援畫布時回傳 null', async () => {
    const realCreate = document.createElement.bind(document)
    jest.spyOn(document, 'createElement').mockImplementation(tag => (tag === 'canvas' ? { getContext: () => null } : realCreate(tag)))
    await expect(getCroppedImg('data:x', { x: 0, y: 0, width: 1, height: 1 })).resolves.toBeNull()
  })
})
