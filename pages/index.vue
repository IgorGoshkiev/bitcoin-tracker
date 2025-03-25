<template>
  <div class="bitcoin-tracker">
    <h1>Bitcoin Price Tracker</h1>
    
    <div v-if="showTestDataWarning" class="test-data-warning">
      <div class="warning-content">
        <p>Using test data. For real Bitcoin prices, configure CoinGecko API key.</p>
        <div class="test-values">
          <span v-for="(item, index) in testDataPreview" :key="index">
            {{ item.label }}: ${{ item.value.toLocaleString() }}
          </span>
        </div>
      </div>
    </div>
    
    <BitcoinSelector 
      @update="fetchData" 
      :disabled="isLoading" 
    />
    
    <div v-if="isLoading" class="status loading">
      <span class="loader"></span> Loading data...
    </div>
    
    <ClientOnly>
      <BitcoinChart 
        :labels="chartLabels"
        :prices="chartPrices"
      />
      <template #fallback>
        <div class="chart-placeholder">
          Loading chart...
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const chartLabels = ref<string[]>([]);
const chartPrices = ref<number[]>([]);
const isLoading = ref(false);
const showTestDataWarning = ref(false);

// Загрузка структуры тестовых данных с сервера
const { data: serverTestData } = await useFetch('/api/test-data');

// Подготовка тестовых данных
const testData = computed(() => {
  if (!serverTestData.value?.data) {
    return {
      labels: ['1 day ago', '2 days ago', '3 days ago'],
      prices: [42000, 43000, 44000]
    };
  }
  
  return {
    labels: serverTestData.value.data.map(item => item.label),
    prices: serverTestData.value.data.map(item => item.price)
  };
});

const testDataPreview = computed(() => {
  return testData.value.prices.slice(0, 3).map((price, index) => ({
    label: `${index + 1} day`,
    value: price
  }));
});

const fetchData = async (params: {
  period: string
  startDate: string
  endDate: string
}) => {
  try {
    isLoading.value = true;
    showTestDataWarning.value = false;
    
    const { data } = await $fetch('/api/prices', {
      params,
      retry: 2,
      timeout: 10000
    });
    
    if (data?.prices?.length) {
      // Реальные данные из БД
      chartLabels.value = data.labels;
      chartPrices.value = data.prices;
    } else {
      // Тестовые данные
      showTestDataWarning.value = true;
      chartLabels.value = testData.value.labels;
      chartPrices.value = testData.value.prices;
    }

    console.log('Chart data after fetch:', {
      labels: chartLabels.value,
      prices: chartPrices.value
    });

  } catch (err) {
    console.error('API request failed:', err);
    // Fallback на тестовые данные
    showTestDataWarning.value = true;
    chartLabels.value = testData.value.labels;
    chartPrices.value = testData.value.prices;
  } finally {
    isLoading.value = false;
  }
};

// Первая загрузка
onMounted(async () => {
  // Сразу показываем тестовые данные, затем пробуем загрузить реальные
  // chartLabels.value = testData.value.labels;
  // chartPrices.value = testData.value.prices;
  // showTestDataWarning.value = true;
  console.log('Initial chart data:', {
    labels: chartLabels.value,
    prices: chartPrices.value
  });

  await fetchData({ period: 'day', startDate: '', endDate: '' });
});
</script>

<style scoped>
.bitcoin-tracker {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.test-data-warning {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 12px;
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  border-radius: 4px;
}

.warning-icon {
  font-size: 24px;
  color: #ffc107;
}

.warning-content {
  flex: 1;
}

.test-values {
  display: flex;
  gap: 15px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.test-values span {
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
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

.loader {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.chart-placeholder {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  margin-top: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>