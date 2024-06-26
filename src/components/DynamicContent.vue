<template>
  <component is="div" v-bind="attrs">
    <template v-for="(content, index) in contents" :key="index">
      <DynamicContent v-if="content.type" :json="content" />
      <span v-else>{{ content }}</span>
    </template>
  </component>
</template>

<script>
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'DynamicContent',
  props: {
    json: {
      required: true
    }
  },
  components: {
    DynamicContent: defineComponent(() => import('./DynamicContent.vue'))
  },
  setup(props) {
    const attrs = computed(() => props.json.attrs || {});
    const contents = computed(() => props.json.contents || []);

    return {
      attrs,
      contents
    };
  }
});
</script>