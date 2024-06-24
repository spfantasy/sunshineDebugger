<script setup>
import {inject, onMounted, ref, watch} from "vue";
import {Icon, List, ListItem, Spin, Tooltip} from "view-ui-plus";
import axios from "axios";
const targetEnv = inject("targetEnv");
const targetAccount = inject("targetAccount");
const serverConfig = ref({"services": []});
const env = inject("env");
const fetchTargetServices = async () => {
  try {
    // 加载服务列表
    serverConfig.value =  await window.electron.fetchData("json", {"filename": "targetService.json"});
    broadcastServicesFormat();
    await broadcastHealthCheck();

  } catch (error) {
    console.error('Error fetching data: '+ error);
  }
};

async function healthCheck(url) {
  try {
    const response = await axios.get(url,{timeout: env.value.backend.targetStats.TimeoutMilliseconds});
    return [response.status, new Date().toLocaleString()];
  } catch (error) {
    console.error("healthCheck failed: " + error);
    return [500, new Date().toLocaleString()];
  }

}

async function broadcastHealthCheck() {
  for (const item of serverConfig.value.services) {
    item.status = null;
    // time.sleep(200);
    await new Promise(r => setTimeout(r, 200));
    const [status, lastUpdated] = await healthCheck(item.formatted);
    item.status = status;
    item.lastUpdated = lastUpdated;
  }
}

function formatUrl(template, params) {
  return template.replace(/\${(.*?)}/g, (match, p1) => params[p1] || '');
}

// 坚挺环境变化更新网址
function broadcastServicesFormat() {
  for (let i = 0; i < serverConfig.value.services.length; i++) {
    serverConfig.value.services[i].formatted = formatUrl(serverConfig.value.services[i].value, {targetEnv: targetEnv.value.dns});
    serverConfig.value.services[i].status = 0;
  }
}
watch(targetEnv, (newVal) => {
  broadcastServicesFormat();
});
onMounted(() => {
  fetchTargetServices();
  setInterval(broadcastHealthCheck, 1000 * env.value.backend.targetStats.refreshSeconds);
})

</script>

<template>
  <List border size="large">
    <ListItem v-for="server in serverConfig.services">
      <Tooltip :content="server.formatted">
        <span>{{ server.label }}</span>
        <div v-if="server.status == null" >
          <Spin />
        </div>
        <div v-if="server.status != null">
          <Icon v-if="server.status === 0" type="ios-loading" />
          <Icon v-if="server.status === 200" type="md-checkmark-circle" />
          <Icon v-if="server.status === 500" type="md-close-circle" />
          <span>({{ server.lastUpdated }})</span>
        </div>
      </Tooltip>
    </ListItem>
  </List>
  <h1>targetEnv: {{targetEnv}}</h1>
  <h1>targetAccount: {{targetAccount}}</h1>
</template>

<style scoped>

</style>