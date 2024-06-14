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
        <Icon type="ios-paper"/>
        Page1
        <RouterLink to="/page1"/>
      </MenuItem>
      <MenuItem name="2">
        <RouterLink to="/page2"/>
        <Icon type="ios-people"/>
        Page2
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
</style>