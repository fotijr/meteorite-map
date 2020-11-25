<template>
  <div class="bg-gray-50 p-2 border-gray-700 rounded-lg border-2">
    <h5 class="mb-0.5 text-gray-800">{{ landing?.name }}</h5>
    <div class="flex">
      <div class="text-sm mr-4">
        <mm-label text="Year">
          {{ landing?.year }}
        </mm-label>
      </div>
      <div class="text-sm mr-1">
        <mm-label text="Mass">
          {{ $filters.massKg(landing?.mass) }}
        </mm-label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { MeteoriteLanding } from '../models/meteorites';

export default defineComponent({
  name: 'LandingTooltip',
  props: {
    landing: {
      type: Object as PropType<MeteoriteLanding>,
    },
  },
});
</script>

<style>
/* .landing-tooltip {
  pointer-events: none;
} */
</style>
