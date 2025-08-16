interface ImportMetaEnv {
  readonly VITE_DPS_WOW_APP_ID: string;
  readonly VITE_BACKEND_URL: string;

}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
