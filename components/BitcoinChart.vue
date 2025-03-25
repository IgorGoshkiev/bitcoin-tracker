<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
    <div v-if="isLoading" class="chart-overlay">
      <span class="loader"></span>
    </div>
    <div v-else-if="!prices.length" class="no-data">
      No price data available
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, type ChartOptions } from 'chart.js/auto'

const props = defineProps({
  labels: {
    type: Array as () => string[],
    required: true,
    default: () => []
  },
  prices: {
    type: Array as () => number[],
    required: true,
    default: () => [],
    validator: (value: number[]) => value.every(v => typeof v === 'number')
  },
  isLoading: Boolean
})
const chartRef = ref<HTMLCanvasElement | null>(null)
const chart = ref<Chart<'line'> | null>(null)

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: (context) => {
          return `$${context.parsed.y.toLocaleString()}`
        }
      }
    },
    legend: {
      display: false
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

const renderChart = () => {
  if (!chartRef.value) return

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  if (chart.value) {
    chart.value.destroy()
  }

  chart.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: props.labels,
      datasets: [{
        label: 'Bitcoin Price (USD)',
        data: props.prices,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.1,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5
      }]
    },
    options: chartOptions
  })
}

watch(() => [props.labels, props.prices], renderChart, { immediate: true })

onBeforeUnmount(() => {
  chart.value?.destroy()
})
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}

.chart-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.7);
}

.no-data {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 1.2rem;
}

.loader {
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>