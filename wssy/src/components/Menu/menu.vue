<template>
  <el-menu
    active-text-color="#ffd04b"
    class="el-menu-vertical-demo common-glass-style"
    text-color="#fff"
    :collapse="isCollapse"
    :default-openeds="defaultOpenArr"
    :default-active="activePath"
  >
    <el-sub-menu
      popper-class="pop-item"
      v-for="item in routes"
      :key="item.path"
      :index="item.path"
    >
      <template #title>
        <span>{{ item.meta.title }}</span>
      </template>
      <template v-if="item.children">
        <el-menu-item
          v-for="el in item.children"
          :key="el.meta?.activePath"
          @click="linkTo(el.name, el.meta?.activePath)"
          :index="el.meta?.activePath"
        >
          {{ el.meta?.title }}
        </el-menu-item>
      </template>
    </el-sub-menu>
    <el-icon class="expand-icon" :size="20" color="#fff" @click="onExpand">
      <Expand v-if="isCollapse" />
      <Fold v-else />
    </el-icon>
  </el-menu>
</template>

<script setup>
import { ref, watch } from "vue";
import routes from "@/router/router.js";
import { useRouter, useRoute } from "vue-router";
import { Expand, Fold } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const isCollapse = ref(false);
const activePath = ref();

const onExpand = () => {
isCollapse.value = !isCollapse.value;
};

const linkTo = (name, path) => {
activePath.value = path;
router.push({
  name,
});
};

const defaultOpenArr = routes.map((item) => item.path);

watch(
() => route.meta.activePath,
(newPath, oldPath) => {
  if (newPath !== oldPath) {
    activePath.value = newPath;
  }
},
{
  immediate: true,
}
);
</script>

<style scoped lang="less">
// 定义混合样式
.common-glass-style() {
background-color: rgba(84, 92, 100, 0.5);
backdrop-filter: blur(10px);
z-index: 1000;
}

// 为 el-menu 应用样式
.common-glass-style {
.common-glass-style();
}

.el-menu--el-menu--inline
.el-menu-item  {
  background-color: rgb(55 55 55 / 50%);
}
.el-menu-item {
  background-color: rgb(55 55 55 / 50%);
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
min-height: 100vh;
position: fixed;
padding-bottom: 30px;
width: 150px;
}

.el-menu--collapse {
position: fixed;
min-height: 100vh;
}

.expand-icon {
display: block;
width: 100%;
text-align: center;
cursor: pointer;
position: absolute;
bottom: 10px;
}
</style>