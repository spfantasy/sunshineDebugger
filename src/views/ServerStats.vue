<script setup>
import {ref} from "vue";
import {Button} from "view-ui-plus";

const data = ref("123");
async function getData() {
  data.value = await window.electron.fetchData();
}
</script>

<template>
  <h1>Page1</h1>
  <h1>Page1</h1>
  <h1>Page1 {{data}}</h1>
  <Button :on-click="getData"></Button>
</template>
