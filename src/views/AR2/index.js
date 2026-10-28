import Page from 'components/Page'
import { useEffect, useState } from 'react'

const a = {
  'hair-color': [
    // {
    //   color: '#26261E',
    //   skuGuid: 'HAIR_DYE_01',
    //   itemGuid: 'HAIR_DYE_01_37'
    // },
    // {
    //   color: '#755629',
    //   skuGuid: 'HAIR_DYE_01',
    //   itemGuid: 'HAIR_DYE_01_38'
    // },
    // {
    //   color: '#401C28',
    //   skuGuid: 'HAIR_DYE_01',
    //   itemGuid: 'HAIR_DYE_01_39'
    // },
    // {
    //   color: '#381616',
    //   skuGuid: 'HAIR_DYE_01',
    //   itemGuid: 'HAIR_DYE_01_40'
    // },
    // {
    //   color: '#6B534F',
    //   skuGuid: 'HAIR_DYE_01',
    //   itemGuid: 'HAIR_DYE_01_41'
    // },
    // {
    //   color: '#4E3D3B',
    //   skuGuid: 'HAIR_DYE_01',
    //   itemGuid: 'HAIR_DYE_01_42'
    // },
    // {
    //   color: '#84482E',
    //   skuGuid: 'HAIR_DYE_01',
    //   itemGuid: 'HAIR_DYE_01_43'
    // },
    // {
    //   color: '#563025',
    //   skuGuid: 'HAIR_DYE_01',
    //   itemGuid: 'HAIR_DYE_01_44'
    // },
    // {
    //   color: '#ff0074',
    //   skuGuid: 'HAIR_DYE_01',
    //   itemGuid: 'HAIR_DYE_01_45'
    // },
    // {
    //   color: '#602ff7',
    //   skuGuid: 'HAIR_DYE_01',
    //   itemGuid: 'HAIR_DYE_01_46'
    // }

    {
      color: '#ff9f2d',
      skuGuid: 'HAIR_DYE_01',
      itemGuid: 'HAIR_DYE_01_01',
    },
    {
      color: '#bf5484',
      skuGuid: 'HAIR_DYE_01',
      itemGuid: 'HAIR_DYE_01_07',
    },
    {
      color: '#8d354a',
      skuGuid: 'HAIR_DYE_01',
      itemGuid: 'HAIR_DYE_01_08',
    },
    {
      color: '#9c6550',
      skuGuid: 'HAIR_DYE_01',
      itemGuid: 'HAIR_DYE_01_19',
    },
    {
      color: '#9d0109',
      skuGuid: 'HAIR_DYE_01',
      itemGuid: 'HAIR_DYE_01_05',
    },
    {
      color: '#005db2',
      skuGuid: 'HAIR_DYE_01',
      itemGuid: 'HAIR_DYE_01_24',
    },
    {
      color: '#31455e',
      skuGuid: 'HAIR_DYE_01',
      itemGuid: 'HAIR_DYE_01_26',
    },
    {
      color: '#45337a',
      skuGuid: 'HAIR_DYE_01',
      itemGuid: 'HAIR_DYE_01_30',
    },
    {
      color: '#2b3a1c',
      skuGuid: 'HAIR_DYE_01',
      itemGuid: 'HAIR_DYE_01_04',
    },
    {
      color: '#000000',
      skuGuid: 'HAIR_DYE_01',
      itemGuid: 'HAIR_DYE_01_31',
    },
    {
      color: '#eedee9',
      skuGuid: 'HAIR_DYE_01',
      itemGuid: 'HAIR_DYE_01_32',
    },
    {
      color: '#ffffff',
      skuGuid: 'HAIR_DYE_01',
      itemGuid: 'HAIR_DYE_01_36',
    },
  ],
}
const b = {
  HAIR_DYE_01: {
    patterns: [],
    items: [
      {
        guid: 'HAIR_DYE_01_01',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '00ff9f2d',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_02',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '00344f18',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_03',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '0015644e',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_04',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '002b3a1c',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_05',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '009d0109',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_06',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '00fd0db1',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_07',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '00bf5484',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_08',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '008d354a',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_09',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '00d57d70',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_10',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '00ff9f2d',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_11',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '00df4a0d',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_12',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '009b4a01',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_13',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '00642b32',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_14',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '004a251b',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_15',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '003d0109',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_16',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '00d5bd5c',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_17',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '00a9792a',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_18',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '00a1662a',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_19',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '009c6550',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_20',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '00855c39',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_21',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '006f3d1b',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_22',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '0068200e',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_23',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '002c1212',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_24',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '00005db2',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_25',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '001c398f',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_26',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '0031455e',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_27',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '008a32af',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_28',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '00633b64',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_29',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '0087345d',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_30',
        color_intensities: '70',
        color_number: 'CHROM',
        colors: {
          color: '0045337a',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_31',
        color_intensities: '80',
        color_number: 'CHROM',
        colors: {
          color: '00000000',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_32',
        color_intensities: '80',
        color_number: 'CHROM',
        colors: {
          color: '00eedee9',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_33',
        color_intensities: '80',
        color_number: 'CHROM',
        colors: {
          color: '00ffded0',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_34',
        color_intensities: '80',
        color_number: 'CHROM',
        colors: {
          color: '00c3e1e5',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_35',
        color_intensities: '80',
        color_number: 'CHROM',
        colors: {
          color: '00ffffc3',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_36',
        color_intensities: '80',
        color_number: 'CHROM',
        colors: {
          color: '00ffffff',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      // 萊雅
      {
        guid: 'HAIR_DYE_01_37',
        color_intensities: '50',
        color_number: 'CHROM',
        colors: {
          color: '0026261E',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_38',
        color_intensities: '50',
        color_number: 'CHROM',
        colors: {
          color: '00755629',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_39',
        color_intensities: '50',
        color_number: 'CHROM',
        colors: {
          color: '00401C28',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_40',
        color_intensities: '50',
        color_number: 'CHROM',
        colors: {
          color: '00381616',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_41',
        color_intensities: '50',
        color_number: 'CHROM',
        colors: {
          color: '006B534F',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_42',
        color_intensities: '50',
        color_number: 'CHROM',
        colors: {
          color: '004E3D3B',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_43',
        color_intensities: '50',
        color_number: 'CHROM',
        colors: {
          color: '0084482E',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_44',
        color_intensities: '50',
        color_number: 'CHROM',
        colors: {
          color: '00563025',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_45',
        color_intensities: '50',
        color_number: 'CHROM',
        colors: {
          color: '00ff0074',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
      {
        guid: 'HAIR_DYE_01_46',
        color_intensities: '50',
        color_number: 'CHROM',
        colors: {
          color: '00602ff7',
        },
        shine_intensities: '50',
        sku_guid: 'HAIR_DYE_01',
        hair_dye_mode: 'salon',
      },
    ],
    sku: {
      skuGuid: 'HAIR_DYE_01',
      skuId: '0',
      type: 'hair_dye',
    },
  },
}

const styles = {
  root: 'text-center',
  ar: 'w-[540px] h-[810px] left-0 right-0 m-auto',
  container: 'pt-[24px] pb-[24px]',
  ul: 'mt-[20px] absolute left-[1280px] top-0',
  li: 'list-none w-[50px] h-[50px] rounded-[50%] mt-[10px] mr-[10px]',
}

export default function Employees() {
  const [err, setErr] = useState('')
  useEffect(() => {
    window.ymkAsyncInit = function () {
      window.YMK.init({
        // autoOpen: true,
        width: 540,
        height: 810,
        skinSmoothStrength: 100,
        // hideButtonsOnResultPage: true,
        countlyHost: 'http://pos.envystudio.tw/',
        language: 'cht',
        debug: true,
      })
      // window.YMK.applyMakeupBySkuItem(b,'HAIR_DYE_01_01')

      // window.YMK.openSkincare()
      window.YMK.open()
    }
  }, [])

  // 原 react-helmet：頁名與 YMK SDK 載入腳本；改為掛載時直接設定／插入（只插一次）
  useEffect(() => {
    document.title = 'AR 變髮色'
    const src = 'https://storage.googleapis.com/storage.lambor.io/sdk10.js?apiKey=for-smb'
    if (document.querySelector(`script[src="${src}"]`)) return
    const s = document.createElement('script')
    s.type = 'text/javascript'
    s.async = true
    s.src = src
    const x = document.getElementsByTagName('script')[0]
    if (x && x.parentNode) x.parentNode.insertBefore(s, x)
    else document.head.appendChild(s)
  }, [])
  return (
    <Page className={styles.root} title="打卡記錄">
      {/* 原 Container maxWidth={false}：滿版、左右內距 16／24px（600px 起） */}
      <div className={`mx-auto box-border block w-full px-4 min-[600px]:px-6 ${styles.container}`}>
        <div className={styles.ar} id="YMK-module" />
        {/* <button onClick={()=>{
          window.YMK.open ();
          window.ymkAsyncInit = function () {
          };

        }}>test</button> */}
        <ul className={styles.ul}>
          {a['hair-color'].map(data => {
            return (
              <li
                key={data.itemGuid}
                className={styles.li}
                style={{ backgroundColor: data.color }}
                onClick={() => {
                  window.YMK.applyMakeupBySkuItem(b.HAIR_DYE_01, data.itemGuid)

                  // window.YMK.applyMakeupBySku(data.id)
                  // window.YMK.setIntensity(10)
                }}
              ></li>
            )
          })}
        </ul>
        <div
          onClick={() => {
            window.navigator.getUserMedia(
              // constraints
              {
                video: true,
              },

              // successCallback
              function (localMediaStream) {
                alert('SUCCESS')
                setErr('SUCCESS')
                // var video = document.querySelector('video');
                // video.src = window.URL.createObjectURL(localMediaStream);
                // video.onloadedmetadata = function (e) {
                //   // Do something with the video here.
                // };
              },

              // errorCallback
              function (err) {
                if (err === 'PERMISSION_DENIED') {
                  // Explain why you need permission and how to update the permission setting
                  alert('PERMISSION_DENIED')
                  setErr('PERMISSION_DENIED')
                } else {
                  console.log('The following error occurred: ' + err.name)
                  setErr('The following error occurred: ' + err.name)
                }
              }
            )
          }}
        ></div>
        <div>{err}</div>
        {/* 
        <div>
          <a href="https://inforcharge.page.link">Back</a>
        </div> */}
      </div>
    </Page>
  )
}
