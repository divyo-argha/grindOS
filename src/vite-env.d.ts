/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string
    readonly VITE_APP_DESCRIPTION: string
    readonly VITE_DB_PATH: string
    readonly VITE_ENABLE_ANALYTICS: string
    readonly VITE_MOCK_DATA: string
    readonly VITE_API_URL?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
