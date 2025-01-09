<template>
  <div ref="container" class="container">
    <div ref="leftPane" class="pane left-pane"></div>
    <div ref="rightPane" class="pane right-pane"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const container = ref(null)
const leftPane = ref(null)
const rightPane = ref(null)
const divider = ref(null)

onMounted(() => {
  const width = leftPane.value.clientWidth
  const height = container.value.clientHeight
  const tWidth = container.value.clientWidth

  // 创建渲染器
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(width * 2, height) // 设置渲染器的宽度为两个面板的总宽度
  container.value.appendChild(renderer.domElement)

  // 创建场景
  const sceneLeft = new THREE.Scene()
  const sceneRight = new THREE.Scene()

  // 创建相机
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.set(0, 1, 5)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // 添加光源到左侧场景
  const lightLeft = new THREE.DirectionalLight(0xffffff, 1)
  lightLeft.position.set(-100, 100, 10)
  sceneLeft.add(lightLeft)

  // 添加光源到右侧场景
  const lightRight = new THREE.DirectionalLight(0xffffff, 1)
  lightRight.position.set(-100, 100, 10)
  sceneRight.add(lightRight)

  // 添加模型到场景
  const loader = new GLTFLoader()
  loader.load('/glb/wssy.glb', (gltf) => {
    sceneLeft.add(gltf.scene)
  })
  loader.load('/glb/wssy.glb', (gltf) => {
    sceneRight.add(gltf.scene)
  })

  // 渲染循环
  const render = () => {
    requestAnimationFrame(render)

    // 渲染左侧场景
    renderer.setViewport(0, 0, width*2, height)
    renderer.setScissor(0, 0, width, height)
    renderer.setScissorTest(true)
    renderer.render(sceneLeft, camera)

    // 渲染右侧场景
    renderer.setViewport(width, 0, width*2, height)
    renderer.setScissor(width, 0, width, height)
    renderer.setScissorTest(true)
    renderer.render(sceneRight, camera)

    controls.update()
  }
  render()

  // 处理拖动事件
  let isDragging = false

  const onMouseDown = (e) => {
    isDragging = true
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const onMouseMove = (e) => {
    if (!isDragging) return
    const containerRect = container.value.getBoundingClientRect()
    const newLeftWidth = e.clientX - containerRect.left
    const newRightWidth = containerRect.right - e.clientX
    leftPane.value.style.width = `${newLeftWidth}px`
    rightPane.value.style.width = `${newRightWidth}px`
    renderer.setSize(newLeftWidth + newRightWidth, height)
  }

  const onMouseUp = () => {
    isDragging = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  divider.value.addEventListener('mousedown', onMouseDown)
})
</script>

<style scoped>
.container {
  display: flex;
  width: 100%;
  height: 100vh;
  position: relative;
}

.pane {
  flex: 1;
  overflow: hidden;
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
</style>