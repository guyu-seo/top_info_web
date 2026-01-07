<template>
  <section class="www_vvhan_com">
    <header>
      <div class="main">
        <div class="logo">
          <img src="./assets/images/logo.svg" />
          <span>今日热榜</span>
        </div>
      </div>
    </header>
    <main>
      <section class="hotlist">
        <ListItem v-for="i in hotlistKey" :key="i.name" :item="i" />
      </section>
    </main>
    <footer>
      <p><img src="./assets/svg/ing.svg" /></p>
      <p>
        <a href="https://pages.cloudflare.com" target="_blank" rel="noopener noreferrer"><img src="./assets/svg/framework.svg" /></a>
        <a href="https://www.cloudflare.com/zh-cn/application-services/products/cdn/" target="_blank" rel="noopener noreferrer"><img src="./assets/svg/cdn.svg" /></a>
        <a href="https://vuejs.org" target="_blank" rel="noopener noreferrer"><img src="./assets/svg/web.svg" /></a>
        <a href="#" target="_blank"><img src="./assets/svg/surppot.svg" /></a>
      </p>
    </footer>
  </section>
  <Toaster />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import moment from 'moment'
import { DrawingPinIcon } from '@radix-icons/vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import ListItem from '@/components/ListItem/ListItem.vue'
import { Toaster } from '@/components/ui/toast'
import { useToast } from '@/components/ui/toast/use-toast'
import { HmacSHA256 } from 'crypto-js'
const { toast } = useToast()
// 热榜列表
const hotlistKey = ref<any[]>([
  { key: 'douyinHot', name: '抖音热榜', sub: '热点榜', data: [] },
  { key: 'kuaishouHot', name: '快手热榜', sub: '热度', data: [] },
  { key: 'bilibiliHot', name: 'B站热榜', sub: '热度', data: [] },
  { key: 'wbHot', name: '微博', sub: '热搜榜', data: [] },
  { key: 'toutiao', name: '今日头条', sub: '热点', data: [] },
  { key: 'zhihuHot', name: '知乎热榜', sub: '热度', data: [] },
  { key: 'wxHot', name: '微信公众号热榜', sub: '文化', data: [] },
  { key: 'huXiu', name: '虎嗅', sub: '24小时', data: [] }
])

const generateHmacSignature = (params: Record<string, any>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return HmacSHA256(sortedParams, import.meta.env.VITE_HMAC_SECRET).toString()
}

// 初始化数据请求
const vhInit = async () => {
  try {
    // 构建请求参数
    const params = { type: 'all' }
    // 生成签名
    const signature = generateHmacSignature(params)
    const res = await fetch('/api/topinfo/data?type=all', {
      headers: {
        'X-SIGN': signature,
        'Content-Type': 'application/json'
      }
    })
    await new Promise((r) => setTimeout(r, 666))
    toast({ title: 'Init', description: '热榜获取成功' })
    const { data } = await res.json()
    hotlistKey.value.forEach((i: any) => {
      const currentItem = data.find((item: any) => item.name == i.name && item.subtitle == i.sub)
      if (currentItem) {
        i.data = currentItem.data
        i.updateStr = formatTime(currentItem.update_time)
      }
    })
  } catch (error) {
    toast({ description: '今日热榜 获取失败', variant: 'destructive' })
  }
}

// 刷新数据
const updateStatus = ref<boolean>(false)
const refreshFn = async (item: any) => {
  if (updateStatus.value) return
  updateStatus.value = true

  const params = { type: item.key }
  const signature = generateHmacSignature(params)
  const res = await fetch(`/api/topinfo/data?type=${item.key}`, {
    headers: {
      'X-SIGN': signature,
      'Content-Type': 'application/json'
    }
  })
  const data = await res.json()
  await new Promise((r) => setTimeout(r, 666))
  // 找到对应的项并更新数据

  const index = hotlistKey.value.findIndex((i: any) => i.key === item.key)
  if (index !== -1) {
    // 创建新对象以确保响应式更新
    hotlistKey.value[index] = {
      ...hotlistKey.value[index],
      data: [...data.data], // 使用新数组确保响应式
      updateStr: formatTime(data.update_time)
    }
  }
  toast({ title: 'Update', description: `${item.name} 更新成功` })
  updateStatus.value = false
}
vhInit()

// 时间处理
const formatTime = (time: string) => {
  const targetDateTime = moment(time)
  const now = moment()
  const duration = moment.duration(now.diff(targetDateTime))
  return `${duration.hours()}小时${duration.minutes()}分钟前`
}
</script>

<style scoped>
@import '@/assets/index.less';
</style>
