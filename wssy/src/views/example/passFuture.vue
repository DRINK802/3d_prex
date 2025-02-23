<template>
  <div>
    <div ref="container" class="container">
      <div ref="leftPane" class="pane left-pane" id="leftPane"></div>
      <div ref="rightPane" class="pane right-pane" id="rightPane"></div>
    </div>
    <div class="range">
      <Slider
        id="timeline"
        v-model="timelineYear"
        :min="2000"
        :max="2024"
        :marks="historicalYears"
        :tooltip="{ always: false, placement: 'bottom' }"
      />
    </div>
  </div>
</template>

<script setup>
import Slider from '@vueform/slider';
import '@vueform/slider/themes/default.css';
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Viewer from '@/common/threeModules/Viewer';
import ModelLoader from '@/common/threeModules/ModelLoader';
import SunLight from '../../common/threeModules/Lights/SunLight';

// 模型路径映射
const modelPaths = {
  2005: '/glb/new.glb',
  2010: '/glb/wssy.glb',
};

//数字的年份数组作为 marks
const historicalYears = ref([2000, 2005, 2010, 2024]);

const timelineYear = ref(2010); // 初始年份
const container = ref(null);
const leftPane = ref(null);
const rightPane = ref(null);

let viewerLeft, viewerRight;
let modelLoader;
let leftmodel;
let camera, controls;

onMounted(() => {
  init();
});

const init = () => {
  // 创建相机
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500000);
  camera.position.set(0, 0, 5);

  // 初始化左右场景
  viewerLeft = new Viewer('leftPane');
  viewerRight = new Viewer('rightPane');
  viewerLeft.camera = camera;
  viewerRight.camera = camera;

  // 初始化模型加载器
  modelLoader = new ModelLoader(viewerRight);
  leftmodel = new ModelLoader(viewerLeft);

  // 初始化控制器
  controls = new OrbitControls(camera, container.value);
  controls.maxPolarAngle = Math.PI / 2.1;

  // 配置阴影
  viewerLeft.renderer.shadowMap.enabled = true;
  viewerRight.renderer.shadowMap.enabled = true;
  viewerLeft.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  viewerRight.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 添加灯光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  viewerLeft.scene.add(directionalLight);
  viewerRight.scene.add(directionalLight.clone());

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  viewerLeft.scene.add(ambientLight);
  viewerRight.scene.add(ambientLight.clone());

  const sunLight = new SunLight();
  viewerLeft.scene.add(sunLight);
  viewerRight.scene.add(sunLight.clone());

  // 加载初始模型
  modelLoader.loadAndReplaceModel(modelPaths[timelineYear.value]);
  leftmodel.loadAndReplaceModel('/glb/new.glb');
  

  // 监听年份变化
  watch(timelineYear, (newYear) => {
    if (modelPaths[newYear]) {
      modelLoader.loadAndReplaceModel(modelPaths[newYear]);
    }
  });

  // 渲染循环
  const render = () => {
    requestAnimationFrame(render);

    const width = container.value.clientWidth;
    const height = container.value.clientHeight;

    // 设置左侧渲染器的视口
    viewerLeft.renderer.setViewport(0, 0, width, height);
    viewerLeft.renderer.setScissor(0, 0, width / 2, height);
    viewerLeft.renderer.setScissorTest(true);
    viewerLeft.renderer.render(viewerLeft.scene, camera);

    // 设置右侧渲染器的视口
    viewerRight.renderer.setViewport(-width / 2, 0, width, height);
    viewerRight.renderer.setScissor(0, 0, width / 2, height);
    viewerRight.renderer.setScissorTest(true);
    viewerRight.renderer.render(viewerRight.scene, camera);

    controls.update();
  };
  render();

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
};

// 处理窗口大小变化
function handleResize() {
  const newWidth = leftPane.value.clientWidth;
  const newHeight = container.value.clientHeight;

  viewerLeft.renderer.setSize(newWidth * 2, newHeight);
  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();

  viewerRight.renderer.setSize(newWidth * 2, newHeight);
  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
}

// 移除监听器以防止内存泄漏
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* 确保 range div 在container div 同层的顶部并且不遮盖 container div */
.range .slider-connects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #f0f0f0;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider-connects {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.container {
  margin-top: 0px; /* 确保 container div 不被 range div 遮盖 */
  display: flex;
  height: 100vh; /* 减去 range div 的高度 */
}

.timeline {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

.pane {
  flex: 1;
  border: 1px solid #ccc;
  overflow: hidden;
}

.left-pane {
  background-color: #f0f0f0;
}

.right-pane {
  background-color: #e0e0e0;
}

.divider {
  width: 5px;
  background-color: #ccc;
  cursor: col-resize;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #000;
}

input[name="draw"] {
  position: absolute;
  top: 0;
  z-index: 100;
}

/*添加一些样式使滑块更美观 */
input[type="range"] {
  width: 100%;
  margin: 20px 0;
}

/* Vue 3 使用 :deep() */
:deep(.slider-track) {
  background-color: #ffd700;
}

:deep(.slider-handle) {
  background-color: #ff6347;
  border: 2px solid #fff;
}

:deep(.slider-tooltip) {
  background-color: #008080;
  color: #fff;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
}
</style>