<template>
  <div>
    <h1>Bitcoin Price Tracker</h1>
    <select v-model="selectedPeriod" @change="fetchData">
      <option value="day">Day</option>
      <option value="week">Week</option>
      <option value="month">Month</option>
      <option value="year">Year</option>
      <option value="custom">Custom</option>
    </select>
    <input v-if="selectedPeriod === 'custom'" type="date" v-model="startDate" />
    <input v-if="selectedPeriod === 'custom'" type="date" v-model="endDate" />
    <button @click="fetchData">Update Chart</button>
    <canvas ref="chart"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';

const selectedPeriod = ref('day');
const startDate = ref('');
const endDate = ref('');
const chart = ref(null);

const fetchData = async () => {
  const { data } = await useFetch('/api/prices', {
    params: {
      period: selectedPeriod.value,
      startDate: startDate.value,
      endDate: endDate.value,
    },
  });

  renderChart(data.value);
};

const renderChart = (data) => {
  if (chart.value) {
    chart.value.destroy();
  }
  const ctx = chart.value.getContext('2d');
  chart.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Bitcoin Price',
          data: data.prices,
          borderColor: 'blue',
          fill: false,
        },
      ],
    },
  });
};

onMounted(() => {
  fetchData();
});
</script>