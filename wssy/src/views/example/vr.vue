<template>
  <div ref="container" class="container">
    <div ref="canvasContainer" id="canvas-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const container = ref(null)
const canvasContainer = ref(null)

let housePast, housePresent

onMounted(() => {
  // 创建Three.js场景
  const scene = new THREE.Scene()
  // 创建透视相机
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5
  // 创建渲染器
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  canvasContainer.value.appendChild(renderer.domElement)

  // 创建竖线几何体和材质并添加到场景
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(1, 0, 0)
  ])
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
  const verticalLine = new THREE.Line(lineGeometry, lineMaterial)
  scene.add(verticalLine)

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  // 添加方向光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 10, 7.5)
  scene.add(directionalLight)

  // 添加点光源
  const pointLight = new THREE.PointLight(0xffffff, 1, 100)
  pointLight.position.set(0, 10, 0)
  scene.add(pointLight)

  // 用于标记是否正在拖动竖线
  let isDragging = false
  // 记录鼠标按下时的横坐标和竖线初始横坐标
  let startMouseX, startLineX

  // 鼠标按下事件处理函数
  const onDocumentMouseDown = (event) => {
    const mouse = new THREE.Vector2()
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObject(verticalLine)
    if (intersects.length > 0) {
      isDragging = true
      startMouseX = event.clientX
      startLineX = verticalLine.position.x
    }
  }

  // 鼠标移动事件处理函数
  const onDocumentMouseMove = (event) => {
    if (isDragging) {
      const deltaX = event.clientX - startMouseX
      verticalLine.position.x = startLineX + (deltaX / window.innerWidth) * 2
    }
  }

  // 鼠标松开事件处理函数
  const onDocumentMouseUp = () => {
    isDragging = false
  }

  document.addEventListener('mousedown', onDocumentMouseDown)
  document.addEventListener('mousemove', onDocumentMouseMove)
  document.addEventListener('mouseup', onDocumentMouseUp)

  // 加载房子模型
  const loader = new GLTFLoader()
  loader.load('/glb/wssy.glb', (gltf) => {
    housePast = gltf.scene
    housePast.traverse((child) => {
      if (child.isMesh) {
        child.material.transparent = true
      }
    })
    scene.add(housePast)
  })
  loader.load('/glb/wssy.glb', (gltf) => {
    housePresent = gltf.scene
    housePresent.traverse((child) => {
      if (child.isMesh) {
        child.material.transparent = true
      }
    })
    scene.add(housePresent)
  })

  // 根据竖线位置更新房子显示状态（透明度）的函数
  const updateHouseVisibility = () => {
    const lineX = verticalLine.position.x
    const alphaPast = (1 - lineX) / 2
    const alphaPresent = (1 + lineX) / 2
    if (housePast) {
      housePast.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.opacity = alphaPast
        }
      })
    }
    if (housePresent) {
      housePresent.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.opacity = alphaPresent
        }
      })
    }
  }

  // 渲染循环函数
  const animate = () => {
    requestAnimationFrame(animate)
    updateHouseVisibility()
    renderer.render(scene, camera)
  }
  animate()
})
</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
  position: relative;
}

#canvas-container {
  width: 100%;
  height: 100%;
}
</style>