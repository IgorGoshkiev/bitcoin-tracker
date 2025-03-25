<template>
  <div class="bitcoin-tracker">
    <h1>Bitcoin Price Tracker</h1>
    <BitcoinSelector 
      @update="fetchData" 
      :disabled="isLoading" 
    />
    
    <!-- Состояние загрузки -->
    <div v-if="isLoading" class="status loading">
      <span class="loader"></span> Loading data...
    </div>
    
    <!-- Состояние ошибки -->
    <div v-else-if="error" class="status error">
      <div class="error-message">{{ error }}</div>
      <button @click="retry" class="retry-button">Retry</button>
    </div>
    
    <!-- Успешная загрузка -->
    <template v-else>
      <BitcoinChart 
        :labels="labels"
        :prices="prices"
        :isLoading="isLoading"
      />
      <div v-if="!prices.length" class="status no-data">
        No price data available for selected period
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const labels = ref<string[]>([])
const prices = ref<number[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const config = useRuntimeConfig()

const fetchData = async (params: {
  period: string
  startDate: string
  endDate: string
}) => {
  try {
    isLoading.value = true
    error.value = null
    labels.value = []
    prices.value = []
    
    // Проверка API ключа перед запросом
    if (!config.coingeckoApiKey) {
      throw new Error('API key is missing. Please configure CoinGecko API key in server settings.')
    }

    const { data, error: fetchError } = await $fetch('/api/prices', {
      params,
      retry: 2,
      timeout: 10000
    }).catch(e => {
      throw new Error(e.message || 'Failed to fetch data from server')
    })

    labels.value = data?.labels || []
    prices.value = data?.prices || []
    
    if (!prices.value.length) {
      throw new Error('No price data received from server')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    console.error('Fetch error:', err)
    
    // Показываем тестовые данные при ошибке
    if (error.value.includes('API key')) {
      labels.value = [
        new Date(Date.now() - 86400000).toLocaleDateString(),
        new Date(Date.now() - 172800000).toLocaleDateString(),
        new Date(Date.now() - 259200000).toLocaleDateString()
      ]
      prices.value = [42000, 43000, 44000]
      error.value += ' (showing test data)'
    }
  } finally {
    isLoading.value = false
  }
}

const retry = () => {
  fetchData({ period: 'day', startDate: '', endDate: '' })
}

onMounted(() => {
  fetchData({ period: 'day', startDate: '', endDate: '' })
})
</script>

<style scoped>
/* Стили остаются без изменений из предыдущего примера */
.bitcoin-tracker {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.status {
  padding: 1rem;
  text-align: center;
  margin-top: 20px;
}

.loading {
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.error {
  color: #d32f2f;
}

.no-data {
  color: #666;
}

.error-message {
  margin-bottom: 10px;
  white-space: pre-line;
}

.retry-button {
  padding: 5px 15px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #e0e0e0;
}

.loader {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>