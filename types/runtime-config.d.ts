declare module 'nitropack' {
    interface RuntimeConfig {
      dbUser: string
      dbPassword: string
      dbHost: string
      dbName: string
      dbPort: number
      
      public: {
        apiBase: string
        enableAnalytics: boolean
      }
    }
  }