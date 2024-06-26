<script setup>
import { computed } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import {Icon, Select} from 'view-ui-plus';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
})

const { updateNodeData } = useVueFlow()

const selection = computed({
  get: () => props.data.selection,
  set: (selection) => updateNodeData(props.id, { selection }),
})
</script>

<template>
  <span>
    {{props.data.label}}
    <Button shape="circle" size="small" icon="ios-lock"></Button>
  </span>
  <br/>
  <Select v-model="selection" size="small" style="width:100px">
    <Option v-for="item in props.data.choices" :value="item.value" :label="item.value">
      <span>{{ item.value }}</span>
      <span style="float:right;color:#ccc">{{ item.label }}</span>
    </Option>
  </Select>
  <Handle type="source" :position="Position.Bottom" :connectable="false" />
  <Handle type="target" :position="Position.Top" :connectable="false" />
</template>
<style scoped>
</style>