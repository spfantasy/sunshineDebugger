<script setup>
import {ref} from "vue";
import {List, ListItem, Tooltip} from "view-ui-plus";

const serverConfig = ref({"services": []});
const fetchTargetServices = async () => {
  try {
    // 加载服务列表
    serverConfig.value =  await window.electron.fetchData("json", {"filename": "targetService.json"});
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
fetchTargetServices();
</script>

<template>
  <List border size="large">
    <ListItem v-for="server in serverConfig.services">
      <Tooltip :content="server.endpoint">
        {{ server.name }}
      </Tooltip>
    </ListItem>
  </List>
</template>

<style scoped>

</style>