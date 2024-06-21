<script setup>
import {Icon, MenuItem, Space, Message} from "view-ui-plus";
import {inject, onBeforeMount, onMounted, ref} from "vue";
const theme = inject("theme");
const targetEnvChoices = ref();
const targetAccountChoices = ref();
const targetEnv = inject("targetEnv");
const targetAccount = inject("targetAccount");
const defaultTargetEnv = ref();
const defaultTargetAccount = ref();
const env = inject("env");

// 主题切换函数
function changeTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
}

const fetchTargetData = async () => {
  try {
    // 加载系统配置
    env.value =  await window.electron.fetchData("json", {"filename": "env.json"});
    console.log(env.value);
    // 加载右上角外系统环境
    targetEnvChoices.value = await window.electron.fetchData("json", {"filename": "targetEnv.json"});
    targetEnv.value = targetEnvChoices.value[0];
    defaultTargetEnv.value = targetEnv.value.value;
    // 加载右上角账号
    const response = await window.electron.fetchData("json", {"filename": "targetAccount.json"});
    targetAccountChoices.value = response.users;
    targetAccount.value = targetAccountChoices.value[0];
    defaultTargetAccount.value = targetAccount.value.value;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
onBeforeMount(fetchTargetData);

function targetEnvOnSelect(model) {
  for (let i = 0; i < targetEnvChoices.value.length; i++) {
    if (targetEnvChoices.value[i].value === model.value) {
      targetEnv.value = targetEnvChoices.value[i];
    }
  }
}

function targetAccountOnSelect(model) {
  for (let i = 0; i < targetAccountChoices.value.length; i++) {
    if (targetAccountChoices.value[i].value === model.value) {
      targetAccount.value = targetAccountChoices.value[i];
    }
  }
}

</script>
<template>
  <Menu :theme="theme" active-name="1" mode="horizontal" class="fixed-menu">
    <div class="menu-left">
      <MenuItem name="1">
        <RouterLink class="custom-link" to="/status">
        <Icon type="ios-paper"/>
        服务状态
        </RouterLink>
      </MenuItem>
      <MenuItem name="2">
        <RouterLink class="custom-link" to="/flow">
        <Icon type="ios-people"/>
        调用流
        </RouterLink>
      </MenuItem>
    </div>
    <div class="menu-right">
      <Space>
        <Select v-model="defaultTargetEnv" @on-select="targetEnvOnSelect" :style="env.frontend.targetEnvStyle" prefix="md-code-working" filterable>
          <Option v-for="env in targetEnvChoices" :value="env.value" >{{ env.label }}</Option>
        </Select>
        <Select v-model="defaultTargetAccount" @on-select="targetAccountOnSelect" :style="env.frontend.accountStyle" filterable>
          <Option v-for="account in targetAccountChoices" :value="account.value" >{{ account.label }}</Option>
        </Select>
        <Button :ghost="theme === 'dark'" :loading="false" shape="circle" type="default"
                @click="changeTheme">
          <Icon v-if="theme === 'dark'" type="ios-sunny"/>
          <Icon v-if="theme === 'light'" type="ios-moon"/>
        </Button>
      </Space>
    </div>
  </Menu>
  <br>
</template>

<style scoped>
.menu-right {
  width: 300px;
  margin: 0 20px 0 auto;
}

.custom-link {
  color: inherit; /* 继承父元素的颜色 */
  text-decoration: none; /* 去掉下划线 */
  display: block;
  width: 100%;
  height: 100%;
}

.custom-link:hover, .custom-link:focus, .custom-link:active {
  color: inherit; /* 继承父元素的颜色 */
  text-decoration: none; /* 去掉下划线 */
}
.fixed-menu {
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000; /* 确保菜单在其他元素之上 */
}
</style>