interface ImportMetaEnv {
  readonly VITE_HMAC_SECRET: string
  // 可以添加其他环境变量
  // readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
