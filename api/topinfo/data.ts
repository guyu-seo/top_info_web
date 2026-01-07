import { HmacSHA256 } from 'crypto-js'

const generateHmacSignature = (params: Record<string, any>, secret: string): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return HmacSHA256(sortedParams, secret).toString()
}

export default async function handler(req: any, res: any) {
  const { type } = req.query

  // 检查请求方法
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 从环境变量获取密钥
  const secret = process.env.VITE_HMAC_SECRET
  if (!secret) {
    console.error('HMAC secret not configured')
    return res.status(500).json({ error: 'Server configuration error: HMAC secret not configured' })
  }

  try {
    const params = { type }
    const signature = generateHmacSignature(params, secret)

    console.log(`Making request to: http://139.224.135.232:9000/topinfo/data?type=${type}`)

    const response = await fetch(`http://139.224.135.232:9000/topinfo/data?type=${type}`, {
      headers: {
        'X-SIGN': signature,
        'Content-Type': 'application/json'
      }
    })

    console.log(`Backend response status: ${response.status}`)

    if (!response.ok) {
      throw new Error(`Backend API request failed with status ${response.status}`)
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error: any) {
    console.error('API request failed:', error)
    res.status(500).json({
      error: 'API request failed',
      details: error.message
    })
  }
}
