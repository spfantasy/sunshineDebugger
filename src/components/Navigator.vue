<script setup>
import {Icon, MenuItem} from "view-ui-plus";
import {ref} from "vue";

const theme = ref('light');

function changeTheme() {
  if (theme.value === 'light') {
    theme.value = 'dark';
  } else {
    theme.value = 'light';
  }
}
</script>
<template>
  <Menu :theme="theme" active-name="1" mode="horizontal">
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
      <Button :ghost="theme === 'dark'" :loading="false" shape="circle" type="default"
              @click="changeTheme">
        <Icon v-if="theme === 'dark'" type="ios-sunny"/>
        <Icon v-if="theme === 'light'" type="ios-moon"/>
      </Button>
    </div>
  </Menu>
  <br>
</template>

<style scoped>
.menu-right {
  width: 80px;
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
</style>