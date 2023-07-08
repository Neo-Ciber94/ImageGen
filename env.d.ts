declare module 'process' {
  declare global {
    namespace NodeJS {
      interface ProcessEnv {
        NEXT_OUTPUT: 'standalone' | 'export' | undefined;
      }
    }
  }
}
