<template>
  <div class="chart-container">
    <ClientOnly>
      <template v-if="error">
        <div class="chart-error">
          <div>Error loading chart: {{ error }}</div>
        </div>
      </template>
      <template v-else-if="!hasData">
        <div class="no-data">
          <div>No price data available</div>
        </div>
      </template>
      <template v-else>
        <canvas ref="chartRef" :key="`chart-${chartKey}`"></canvas>
      </template>
      <template #fallback>
        <div class="chart-fallback">
          <span class="loader"></span> Loading chart...
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { Chart, type ChartOptions } from 'chart.js/auto'
import { debounce } from 'lodash-es'

const props = defineProps({
  labels: {
    type: Array as () => string[],
    default: () => []
  },
  prices: {
    type: Array as () => number[],
    default: () => [],
    validator: (value: number[]) => value.every(v => typeof v === 'number')
  }
})

const chartRef = ref<HTMLCanvasElement | null>(null)
const chartInstance = ref<Chart | null>(null)
const error = ref<string | null>(null)
const chartKey = ref(0)
const isMounted = ref(false)

const hasData = computed(() => {
  return props.labels?.length > 0 && props.prices?.length > 0
})

const initChart = () => {
  try {
    if (!isMounted.value || !hasData.value) return
    
    error.value = null
    
    const canvas = chartRef.value
    if (!canvas) {
      throw new Error('Canvas element not found')
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    // Очищаем предыдущий график
    if (chartInstance.value) {
      chartInstance.value.destroy()
      chartInstance.value = null
    }

    // Даем время на обновление DOM
    nextTick(() => {
      try {
        chartInstance.value = new Chart(ctx, {
          type: 'line',
          data: {
            labels: props.labels,
            datasets: [{
              label: 'Bitcoin Price (USD)',
              data: props.prices,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              borderWidth: 2,
              tension: 0.1,
              fill: true,
              pointRadius: 0,
              pointHoverRadius: 5,
              pointHitRadius: 10
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 1000,
              easing: 'easeInOutQuad'
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                  label: (context) => {
                    return `$${context.parsed.y.toLocaleString()}`
                  }
                }
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                }
              },
              y: {
                ticks: {
                  callback: (value) => `$${Number(value).toLocaleString()}`
                }
              }
            },
            interaction: {
              mode: 'nearest',
              intersect: false
            }
          }
        })
      } catch (err) {
        error.value = err.message
        console.error('Chart creation error:', err)
        chartKey.value++ // Принудительно пересоздаем компонент при ошибке
      }
    })
  } catch (err) {
    error.value = err.message
    console.error('Chart initialization error:', err)
  }
}

// Инициализация после монтирования
onMounted(() => {
  isMounted.value = true
  // Добавляем небольшую задержку для SSR гидратации
  setTimeout(() => {
    initChart()
  }, 100)
})

// Обновление при изменении данных
watch(
  () => [props.labels, props.prices],
  debounce(() => {
    initChart()
  }, 300),
  { deep: true }
)

// Очистка
onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }
  isMounted.value = false
})
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 400px;
  margin: 20px 0;
}

@media (max-width: 768px) {
  .chart-container {
    height: 300px;
  }
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.chart-error,
.no-data,
.chart-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
  border-radius: 8px;
}

.chart-error {
  background-color: #fee2e2;
  color: #b91c1c;
}

.no-data {
  background-color: #f5f5f5;
  color: #666;
}

.chart-fallback {
  background-color: #f5f5f5;
  color: #333;
}

.error-icon,
.no-data-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.loader {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>