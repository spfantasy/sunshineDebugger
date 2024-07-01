<!-- DynamicComponent.vue -->
<template>
  <component
      :is="currentComponent"
      v-bind="componentProps"
  >
    <template v-for="(child, index) in children" :key="index">
      <DynamicComponent :componentData="child" />
    </template>
  </component>
</template>

<script>
import { defineComponent, computed } from 'vue';
import {Row, Col} from 'view-ui-plus';
const components = {
  Row,
  Col,
  // 可以在这里添加更多的自定义组件
};

export default defineComponent({
  name: 'DynamicComponent',
  components: {
    ...components
  },
  props: {
    componentData: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const currentComponent = computed(() => components[props.componentData.type] || props.componentData.type);
    const componentProps = computed(() => {
      const { type, children, ...rest } = props.componentData;
      return rest;
    });
    const children = computed(() => props.componentData.children || []);

    return {
      currentComponent,
      componentProps,
      children
    };
  }
});
</script>

<style scoped>
/* 这里可以定义你的样式 */
</style>