<script setup>
import {inject, ref} from "vue";
import {List, ListItem, Tooltip} from "view-ui-plus";
const targetEnv = inject("targetEnv");
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

function formatUrl(template, params) {
  return template.replace(/\${(.*?)}/g, (match, p1) => params[p1] || '');
}

</script>

<template>
  <List border size="large">
    <ListItem v-for="server in serverConfig.services">
      <Tooltip :content="formatUrl(server.endpoint, {targetEnv: targetEnv})">
        {{ server.name }}
      </Tooltip>
    </ListItem>
  </List>
</template>

<style scoped>

</style>