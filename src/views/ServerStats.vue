<script setup>
import {ref} from "vue";
import {Button} from "view-ui-plus";

const data = ref("123");
const getData = async () => {
  console.log('getData called');
  try {
    // 调用预加载脚本中暴露的方法
    const response = await window.electron.fetchData("query");
    data.value = response;
    console.log('Data fetched:', response);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
</script>

<template>
  <h1>Page1</h1>
  <h1>Page1</h1>
  <h1>Page1 {{data}}</h1>
  <Button @click="getData"></Button>
</template>
