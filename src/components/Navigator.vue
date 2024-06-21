<script setup>
import {Icon, MenuItem, Space, Message} from "view-ui-plus";
import {inject, ref} from "vue";
const theme = inject("theme");
const targetEnvChoices = ref();
const targetAccountChoices = ref();
const targetEnv = inject("env");
const account = inject("account");
// 主题切换函数
function changeTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
}
// 加载右上角外系统环境
const fetchTargetData = async () => {
  try {
    console.log('fetchTargetEnv called');
    targetEnvChoices.value = await window.electron.fetchTargetEnv();
    targetEnv.value = targetEnvChoices.value[0].key;
    console.log('Env fetched:', targetEnvChoices.value);
    console.log('fetchTargetAccount called');
    const response = await window.electron.fetchTargetAccount();
    targetAccountChoices.value = response.users;
    account.value = response.users[0].key;
    console.log('Account fetched:', targetAccountChoices.value);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
fetchTargetData();

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
        <Select v-model="targetEnv" style="width:150px" prefix="md-code-working" filterable>
          <Option v-for="env in targetEnvChoices" :value="env.key" >{{ env.name }}</Option>
        </Select>
        <Select v-model="account" style="width:80px" filterable>
          <Option v-for="account in targetAccountChoices" :value="account.key" >{{ account.name }}</Option>
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
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000; /* 确保菜单在其他元素之上 */
}
</style>