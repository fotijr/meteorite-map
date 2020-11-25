<template>
  <label class="uppercase text-gray-500 text-sm font-thin tracking-tight">{{ text }}</label>
  <div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/**
 * Meteorite map label component.
 */
export default defineComponent({
  name: 'mm-label',
  props: {
    text: String,
  },
});
</script>
