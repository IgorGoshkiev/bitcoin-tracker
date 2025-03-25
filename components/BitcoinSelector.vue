<template>
  <div class="selector-container">
    <div class="input-group">
      <label for="period-select">Time Period:</label>
      <select
        id="period-select"
        v-model="selectedPeriod"
        @change="handlePeriodChange"
        class="select"
      >
        <option value="day">24 Hours</option>
        <option value="week">1 Week</option>
        <option value="month">1 Month</option>
        <option value="year">1 Year</option>
        <option value="custom">Custom Range</option>
      </select>
    </div>

    <div v-if="selectedPeriod === 'custom'" class="date-range">
      <div class="input-group">
        <label for="start-date">From:</label>
        <input
          id="start-date"
          type="date"
          v-model="startDate"
          :max="endDate || maxDate"
          class="date-input"
        >
      </div>
      <div class="input-group">
        <label for="end-date">To:</label>
        <input
          id="end-date"
          type="date"
          v-model="endDate"
          :min="startDate || minDate"
          :max="maxDate"
          class="date-input"
        >
      </div>
    </div>

    <button
      @click="handleUpdate"
      class="update-button"
      :disabled="isUpdating"
    >
      <span v-if="isUpdating">Updating...</span>
      <span v-else>Update Chart</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['update'])

const selectedPeriod = ref('day')
const startDate = ref('')
const endDate = ref('')
const isUpdating = ref(false)

const today = new Date()
const maxDate = computed(() => today.toISOString().split('T')[0])
const minDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 5)
  return date.toISOString().split('T')[0]
})

const handlePeriodChange = () => {
  if (selectedPeriod.value !== 'custom') {
    startDate.value = ''
    endDate.value = ''
  }
}

const handleUpdate = () => {
  isUpdating.value = true
  emit('update', {
    period: selectedPeriod.value,
    startDate: startDate.value,
    endDate: endDate.value
  })
  
  // Сбросить состояние через короткое время
  setTimeout(() => {
    isUpdating.value = false
  }, 1000)
}
</script>

<style scoped>
.selector-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

label {
  font-size: 0.875rem;
  color: #4b5563;
}

.select, .date-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
}

.date-range {
  display: flex;
  gap: 1rem;
}

.update-button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.update-button:hover {
  background-color: #2563eb;
}

.update-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
</style>