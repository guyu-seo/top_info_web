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

  // 从环境变量获取密钥
  const secret = process.env.VITE_HMAC_SECRET
  if (!secret) {
    return res.status(500).json({ error: 'HMAC secret not configured' })
  }

  try {
    const params = { type }
    const signature = generateHmacSignature(params, secret)

    const response = await fetch(`http://139.224.135.232:9000/topinfo/data?type=${type}`, {
      headers: {
        'X-SIGN': signature,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('API request failed:', error)
    res.status(500).json({ error: 'API request failed' })
  }
}
