import * as THREE from 'three';

class SunLight {
  constructor(scene) {
    this.scene = scene;
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
    this.sunLight.castShadow = true;
    this.scene.add(this.sunLight);

    this.updateSunPosition();
    setInterval(() => this.updateSunPosition(), 60000); // 每分钟更新一次太阳位置
  }

  updateSunPosition() {
    const now = new Date();
    const hours = now.getHours() + now.getMinutes() / 60;
    const angle = (hours / 24) * 2 * Math.PI - Math.PI / 2; // 计算太阳角度

    const radius = 100;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const z = 50; // 固定高度

    this.sunLight.position.set(x, y, z);
    this.sunLight.lookAt(0, 0, 0); // 太阳光照向场景中心
  }
}

export default SunLight;