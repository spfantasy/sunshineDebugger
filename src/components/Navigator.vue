<script setup>
import {Icon, MenuItem, Space} from "view-ui-plus";
import {inject} from "vue";
import targetEnvJson from "../store/targetEnv.json"
const theme = inject("theme");
const env = inject("env");
function changeTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
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
        <Select v-model="env" style="width:200px" prefix="md-code-working" filterable>
          <Option v-for="env in targetEnvJson" :value="env.key" >{{ env.name }}</Option>
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