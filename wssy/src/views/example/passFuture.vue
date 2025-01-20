<template>
  <div>
    <div class="range">
      <p>当前选择的模型编号: {{ sliderValue }}</p>
      <input type="range" v-model="sliderValue" @input="loadModel" min="1" max="4" />
    </div>
    <div ref="container" class="container">
      <div ref="leftPane" class="pane left-pane" id="leftPane"></div>
      <div ref="rightPane" class="pane right-pane" id="rightPane"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Viewer from '@/common/threeModules/Viewer';
import ModelLoader from '@/common/threeModules/ModelLoader';
import Lights from '@/common/threeModules/Lights';
import SunLight from '@/common/threeModules/Lights';

const container = ref(null);
const leftPane = ref(null);
const rightPane = ref(null);
const sliderValue = ref(1); // 滑块的初始值

let viewerLeft, viewerRight;
let modelLoader;
let isSyncing = false; // 用于跟踪是否正在进行同步
let camera, controls;

onMounted(() => {
  init();
});

const init = () => {

  // 创建一个相机
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500000);
  camera.position.set(0, 0, 5);

  viewerLeft = new Viewer('leftPane');
  viewerRight = new Viewer('rightPane');

  // 使用同一个相机
  viewerLeft.camera = camera;
  viewerRight.camera = camera;

  modelLoader = new ModelLoader(viewerLeft);

  controls = new OrbitControls(camera, container.value);
  controls.maxPolarAngle = Math.PI / 2.1;

  viewerLeft.renderer.shadowMap.enabled = true;
  viewerRight.renderer.shadowMap.enabled = true;

  viewerLeft.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  viewerRight.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 添加与现实时间同步的天光（日光）
  const sunLightLeft = new SunLight(viewerLeft.scene);
  const sunLightRight = new SunLight(viewerRight.scene);

  // 添加环境光
  viewerLeft.scene.add(sunLightLeft.light);
  viewerRight.scene.add(sunLightLeft.light);

  loadModel();


  // 监听 sliderValue 的变化
  watch(sliderValue, (newValue, oldValue) => {
    if (newValue !== oldValue) {
      loadModel();
    }
  });

  // 渲染循环
  const render = () => {
    requestAnimationFrame(render);

    const width = container.value.clientWidth;
    const height = container.value.clientHeight;
    // 设置左侧渲染器的视口
    viewerLeft.renderer.setViewport(0, 0, width , height);
    viewerLeft.renderer.setScissor(0, 0, width / 2, height);
    viewerLeft.renderer.setScissorTest(true);
    viewerLeft.renderer.render(viewerLeft.scene, camera);

    // 设置右侧渲染器的视口
    viewerRight.renderer.setViewport(-width/2, 0, width , height);
    viewerRight.renderer.setScissor(0, 0, width/2 , height);
    viewerRight.renderer.setScissorTest(true);
    viewerRight.renderer.render(viewerRight.scene, camera);

    controls.update();
};
  render();

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
};

const modelPaths = {
  1: '/glb/new.glb',
  2: '/glb/wssy.glb',
};

const loadModel = async () => {
  console.log(`加载模型编号: ${sliderValue.value}`);
  const loader = new GLTFLoader();

  // 加载左侧场景中的模型
  try {
    const gltf = await loader.loadAsync('/glb/wssy.glb');
    viewerLeft.scene.add(gltf.scene);
  } catch (error) {
    console.error('加载左侧模型时出错:', error);
  }

  // 根据 sliderValue 加载相应的模型
  const modelPath = modelPaths[sliderValue.value];
  if (modelPath) {
    try {
      const gltf = await loader.loadAsync(modelPath);
      viewerRight.scene.add(gltf.scene);
      console.log('模型加载成功');
    } catch (error) {
      console.error('加载右侧模型时出错:', error);
    }
  } else {
    console.warn('无效的模型编号:', sliderValue.value);
  }
};

// 处理上下文丢失
function handleContextLost(event) {
  event.preventDefault();
  console.warn('WebGL context lost.');
}

// 处理上下文恢复
function handleContextRestored() {
  console.warn('WebGL context restored.');
  // 重新初始化渲染器和其他相关对象
  initRenderer();
  loadModel();
}

// 初始化渲染器
function initRenderer() {
  const width = leftPane.value.clientWidth;
  const height = container.value.clientHeight;
  const tWidth = container.value.clientWidth;

  viewerLeft.renderer.setSize(width * 2, height);
  viewerLeft.renderer.domElement.style.width = `${width * 2}px`;
  viewerLeft.renderer.domElement.style.height = `${height}px`;

  viewerRight.renderer.setSize(width * 2, height);
  viewerRight.renderer.domElement.style.width = `${width * 2}px`;
  viewerRight.renderer.domElement.style.height = `${height}px`;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

// 处理窗口大小变化
function handleResize() {
  const newWidth = leftPane.value.clientWidth;
  const newHeight = container.value.clientHeight;
  const newTWidth = container.value.clientWidth;

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
  viewerLeft.renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
  viewerLeft.renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
  viewerRight.renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
  viewerRight.renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
});
</script>

<style scoped>
/* 确保 range div 在container div 同层的顶部并且不遮盖 container div */
.range {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #f0f0f0;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.container {
  margin-top: 80px; /* 确保 container div 不被 range div 遮盖 */
  display: flex;
  height: calc(100vh - 80px); /* 减去 range div 的高度 */
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

/* 添加一些样式使滑块更美观 */
input[type="range"] {
  width: 100%;
  margin: 20px 0;
}
</style>
