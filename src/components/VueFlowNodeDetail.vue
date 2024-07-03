<script setup>
import {Modal, Space} from "view-ui-plus";
import {ref} from "vue";

const props = defineProps({
  header: {
    type: String,
    required: true,
  },
  allowSubmit: {
    type: Boolean,
    required: true,
  },
  allowDelete: {
    type: Boolean,
    required: true,
  },
  allowCancel: {
    type: Boolean,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
})

const loading = ref(false);

function cancel() {
  loading.value = false;
  props.active = false;
}
</script>

<template>
  <Modal v-if="props.active" v-model="props.data" width="720" :mask-closable="false">
    <template #header>
      <p style="text-align:center">
        <span>{{ props.header }}</span>
      </p>
    </template>
    <div>
      <Form>

      </Form>
    </div>
    <template #footer>
      <Space>
        <Button type="primary" size="large" :loading="loading"  @click="submit">提交</Button>
        <Button type="error" size="large" :loading="loading" @click="del">删除</Button>
        <Button size="large" :loading="loading" @click="cancel">取消</Button>
      </Space>
    </template>
  </Modal>
</template>

<style scoped>

</style>