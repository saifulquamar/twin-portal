import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  computeSyntheticSpeechMouthOpen,
  type FaceLikenessData,
} from './preserve-math';

type CameraPreset = 'portrait' | 'front' | 'closeup';
type RenderStyle = 'auto' | 'studio' | 'hologram';

function detectSoftwareGl(renderer: THREE.WebGLRenderer): boolean {
  try {
    const gl = renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const unmasked = dbg
      ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '')
      : String(gl.getParameter(gl.RENDERER) || '');
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(unmasked);
  } catch {
    return false;
  }
}

function createMicroSkinBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 128, 128);
    let seed = 1337;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let y = 0; y < 128; y += 2) {
      for (let x = 0; x < 128; x += 2) {
        const v = Math.round(116 + rand() * 24);
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function createRadialShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
    grad.addColorStop(0, 'rgba(8, 22, 26, 0.55)');
    grad.addColorStop(0.55, 'rgba(8, 22, 26, 0.22)');
    grad.addColorStop(1, 'rgba(8, 22, 26, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(canvas);
}

/**
 * Sculpts a sphere geometry into a recognizable human cranial + facial silhouette
 * with frontal planar UV projection on the face front (+Z) so uploaded portraits
 * map cleanly onto the face while skin tone blends smoothly around the sides/back.
 */
function buildSculptedHeadGeometry(): THREE.BufferGeometry {
  const geom = new THREE.SphereGeometry(0.68, 32, 28);
  const pos = geom.attributes.position;
  const uv = geom.attributes.uv;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const ny = v.y / 0.68; // -1..1
    const nz = v.z / 0.68;

    // Elongate cranium slightly vertically
    v.y *= 1.18;

    // Taper lower jaw & chin
    if (ny < -0.1) {
      const t = Math.min(1, (-ny - 0.1) / 0.9);
      const jawScale = 1 - 0.26 * t * t;
      v.x *= jawScale;
      v.z *= 1 - 0.12 * t;
      if (nz > 0.2) {
        // Subtle chin projection
        v.z += 0.045 * (1 - Math.abs(v.x) / 0.5) * t;
      }
    }

    // Cheekbone subtle contour around mid-face
    if (ny > -0.25 && ny < 0.25 && nz > 0.15) {
      const cheek = Math.exp(-Math.pow((ny + 0.02) / 0.22, 2));
      v.x *= 1 + 0.05 * cheek;
      v.z += 0.03 * cheek;
    }

    // Slight flattening at temples
    if (ny > 0.05 && ny < 0.55) {
      v.x *= 0.95;
    }

    pos.setXYZ(i, v.x, v.y, v.z);

    // Frontal planar UV mapping for portrait projection on front hemisphere
    const uCoord = THREE.MathUtils.clamp(0.5 + v.x / 1.18, 0.02, 0.98);
    const vCoord = THREE.MathUtils.clamp(0.52 + v.y / 1.52, 0.02, 0.98);
    uv.setXY(i, uCoord, vCoord);
  }

  geom.computeVertexNormals();
  return geom;
}

export function PreserveAvatarStage({
  patientName,
  convergencePct,
  stageLabel,
  faceProfile,
  portraitDataUrl,
  isSpeaking,
  cadenceWpm = 148,
  getAudioLevel,
}: {
  patientName: string;
  convergencePct: number;
  stageLabel: string;
  faceProfile: FaceLikenessData | null;
  portraitDataUrl: string | null;
  isSpeaking: boolean;
  cadenceWpm?: number;
  getAudioLevel?: () => number;
}) {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [preset, setPreset] = useState<CameraPreset>('portrait');
  const [renderStyle, setRenderStyle] = useState<RenderStyle>('auto');
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 680 : false
  );

  // Store live props in refs so HUD updates never tear down WebGLRenderer
  const liveStateRef = useRef({
    convergencePct,
    faceProfile,
    isSpeaking,
    cadenceWpm,
    getAudioLevel,
    preset,
    renderStyle,
  });
  liveStateRef.current = {
    convergencePct,
    faceProfile,
    isSpeaking,
    cadenceWpm,
    getAudioLevel,
    preset,
    renderStyle,
  };

  const textureUpdaterRef = useRef<((url: string | null) => void) | null>(null);

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const width = Math.max(280, mount.clientWidth || 560);
    const height = Math.max(280, mount.clientHeight || 380);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const isSoftwareGl = detectSoftwareGl(renderer);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bgHex = 0x0b1619;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.085);

    // Studio PBR environment
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 30);
    camera.position.set(0.42, 1.28, 4.35);
    camera.lookAt(0, 1.18, 0);

    // Deliberate warm key + cool sky/ground fill + teal rim lighting
    const hemiLight = new THREE.HemisphereLight(0xd9f2ff, 0x18282d, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1dc, 1.85);
    keyLight.position.set(2.2, 3.4, 2.8);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 9;
      keyLight.shadow.camera.left = -1.6;
      keyLight.shadow.camera.right = 1.6;
      keyLight.shadow.camera.top = 2.4;
      keyLight.shadow.camera.bottom = -0.5;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x2ce0e6, 1.15);
    rimLight.position.set(-2.4, 2.0, -1.9);
    scene.add(rimLight);

    // Ground plane + soft radial contact shadow (offset >= 0.015 on Y to prevent Z-fighting)
    const floorY = 0;
    const floorGeom = new THREE.CircleGeometry(6, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0e1d21,
      roughness: 0.9,
      metalness: 0.1,
    });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = floorY;
    floorMesh.receiveShadow = !isSoftwareGl;
    scene.add(floorMesh);

    const shadowTex = createRadialShadowTexture();
    const contactShadowGeom = new THREE.CircleGeometry(1.18, 28);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(contactShadowGeom, contactShadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = floorY + 0.016;
    scene.add(contactShadow);

    // === Multi-part Composite 3D Portrait Bust (11 distinct parts across 3 scales) ===
    const actorRoot = new THREE.Group();
    actorRoot.position.y = floorY;
    scene.add(actorRoot);

    // 1. Pedestal plinth + brushed accent ring
    const plinthGeom = new THREE.CylinderGeometry(0.72, 0.82, 0.18, 32);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x16262b,
      roughness: 0.42,
      metalness: 0.65,
    });
    const plinthMesh = new THREE.Mesh(plinthGeom, plinthMat);
    plinthMesh.position.y = 0.09;
    plinthMesh.castShadow = !isSoftwareGl;
    plinthMesh.receiveShadow = !isSoftwareGl;
    actorRoot.add(plinthMesh);

    const vocalRingGeom = new THREE.TorusGeometry(0.76, 0.018, 12, 48);
    const vocalRingMat = new THREE.MeshStandardMaterial({
      color: 0x1fc8cf,
      emissive: 0x0b7a80,
      emissiveIntensity: 0.65,
      roughness: 0.22,
      metalness: 0.5,
    });
    const vocalRing = new THREE.Mesh(vocalRingGeom, vocalRingMat);
    vocalRing.rotation.x = Math.PI / 2;
    vocalRing.position.y = 0.185;
    actorRoot.add(vocalRing);

    // 2. Sculpted shoulders & upper torso
    const torsoGeom = new THREE.CylinderGeometry(0.36, 0.66, 0.62, 28, 1);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x1c3138,
      roughness: 0.78,
      metalness: 0.12,
    });
    const torsoMesh = new THREE.Mesh(torsoGeom, torsoMat);
    torsoMesh.scale.set(1.26, 1, 0.72);
    torsoMesh.position.y = 0.49;
    torsoMesh.castShadow = !isSoftwareGl;
    actorRoot.add(torsoMesh);

    // 3. Anatomical neck column
    const skinBumpTex = createMicroSkinBumpTexture();
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xc99474,
      roughness: 0.62,
      metalness: 0.05,
      bumpMap: skinBumpTex,
      bumpScale: 0.008,
    });

    const neckGeom = new THREE.CylinderGeometry(0.21, 0.25, 0.36, 24);
    const neckMesh = new THREE.Mesh(neckGeom, skinMat);
    neckMesh.position.set(0, 0.92, -0.02);
    neckMesh.castShadow = !isSoftwareGl;
    actorRoot.add(neckMesh);

    // 4. Articulated Head Pivot Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.46, 0);
    actorRoot.add(headGroup);

    const headSculptGroup = new THREE.Group();
    headGroup.add(headSculptGroup);

    const headGeom = buildSculptedHeadGeometry();
    const faceMat = new THREE.MeshStandardMaterial({
      color: 0xc99474,
      roughness: 0.56,
      metalness: 0.04,
      bumpMap: skinBumpTex,
      bumpScale: 0.007,
    });
    const headMesh = new THREE.Mesh(headGeom, faceMat);
    headMesh.castShadow = !isSoftwareGl;
    headSculptGroup.add(headMesh);

    // Holographic wireframe lattice shell (fades smoothly as preservation converges)
    const holoMat = new THREE.MeshBasicMaterial({
      color: 0x35e0e6,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const holoMesh = new THREE.Mesh(headGeom, holoMat);
    holoMesh.scale.setScalar(1.014);
    headSculptGroup.add(holoMesh);

    // 5. Hair Crown + Style Accents (roughness 0.84 vs face 0.56 >= 0.25 contrast)
    const hairGroup = new THREE.Group();
    headSculptGroup.add(hairGroup);
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x1d1816,
      roughness: 0.84,
      metalness: 0.06,
    });
    const hairCapGeom = new THREE.SphereGeometry(
      0.705,
      28,
      20,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.58
    );
    const hairCap = new THREE.Mesh(hairCapGeom, hairMat);
    hairCap.scale.set(1.02, 1.18, 1.04);
    hairCap.position.set(0, 0.05, -0.05);
    hairCap.rotation.x = -0.22;
    hairGroup.add(hairCap);

    const sideLocksGeom = new THREE.CapsuleGeometry(0.16, 0.46, 8, 14);
    const leftLock = new THREE.Mesh(sideLocksGeom, hairMat);
    leftLock.position.set(-0.56, -0.14, -0.08);
    leftLock.rotation.z = 0.12;
    const rightLock = new THREE.Mesh(sideLocksGeom, hairMat);
    rightLock.position.set(0.56, -0.14, -0.08);
    rightLock.rotation.z = -0.12;
    hairGroup.add(leftLock, rightLock);

    const bunGeom = new THREE.SphereGeometry(0.24, 18, 14);
    const topBun = new THREE.Mesh(bunGeom, hairMat);
    topBun.position.set(0, 0.68, -0.44);
    hairGroup.add(topBun);

    // 6. Nose bridge & tip
    const noseGeom = new THREE.ConeGeometry(0.085, 0.28, 14);
    const noseMesh = new THREE.Mesh(noseGeom, skinMat);
    noseMesh.position.set(0, -0.02, 0.67);
    noseMesh.rotation.x = 0.28;
    noseMesh.scale.set(0.85, 1, 1.1);
    headSculptGroup.add(noseMesh);

    // 7. Ears
    const earGeom = new THREE.SphereGeometry(0.13, 14, 12);
    const leftEar = new THREE.Mesh(earGeom, skinMat);
    leftEar.scale.set(0.42, 1.15, 0.72);
    leftEar.position.set(-0.65, -0.02, -0.02);
    const rightEar = new THREE.Mesh(earGeom, skinMat);
    rightEar.scale.set(0.42, 1.15, 0.72);
    rightEar.position.set(0.65, -0.02, -0.02);
    headSculptGroup.add(leftEar, rightEar);

    // 8. Eyes (glossy sclera roughness 0.12 + iris + pupil + blinking upper eyelids)
    const scleraGeom = new THREE.SphereGeometry(0.088, 16, 14);
    const scleraMat = new THREE.MeshStandardMaterial({
      color: 0xf7f9fa,
      roughness: 0.12,
      metalness: 0.02,
    });
    const irisGeom = new THREE.CircleGeometry(0.046, 18);
    const irisMat = new THREE.MeshStandardMaterial({
      color: 0x3b2a1e,
      roughness: 0.22,
      metalness: 0.08,
    });
    const pupilGeom = new THREE.CircleGeometry(0.021, 14);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090b0c });
    const lidGeom = new THREE.SphereGeometry(
      0.093,
      16,
      10,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.52
    );

    const buildEye = (xSign: number) => {
      const g = new THREE.Group();
      g.position.set(xSign * 0.23, 0.11, 0.56);
      const sclera = new THREE.Mesh(scleraGeom, scleraMat);
      sclera.scale.set(1.12, 0.92, 0.75);
      g.add(sclera);

      const iris = new THREE.Mesh(irisGeom, irisMat);
      iris.position.z = 0.068;
      g.add(iris);

      const pupil = new THREE.Mesh(pupilGeom, pupilMat);
      pupil.position.z = 0.071;
      g.add(pupil);

      const lid = new THREE.Mesh(lidGeom, skinMat);
      lid.scale.set(1.14, 0.95, 0.8);
      lid.rotation.x = -0.35;
      g.add(lid);
      return { group: g, lid };
    };

    const leftEye = buildEye(-1);
    const rightEye = buildEye(1);
    headSculptGroup.add(leftEye.group, rightEye.group);

    // 9. Sculpted Eyebrows
    const browGeom = new THREE.CapsuleGeometry(0.024, 0.16, 6, 10);
    const leftBrow = new THREE.Mesh(browGeom, hairMat);
    leftBrow.rotation.z = Math.PI / 2 - 0.08;
    leftBrow.position.set(-0.23, 0.24, 0.61);
    const rightBrow = new THREE.Mesh(browGeom, hairMat);
    rightBrow.rotation.z = Math.PI / 2 + 0.08;
    rightBrow.position.set(0.23, 0.24, 0.61);
    headSculptGroup.add(leftBrow, rightBrow);

    // 10. Optional Eyeglasses Group
    const glassesGroup = new THREE.Group();
    glassesGroup.visible = false;
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x263238,
      roughness: 0.28,
      metalness: 0.78,
    });
    const lensRingGeom = new THREE.TorusGeometry(0.135, 0.012, 10, 28);
    const leftLens = new THREE.Mesh(lensRingGeom, frameMat);
    leftLens.position.set(-0.23, 0.11, 0.65);
    const rightLens = new THREE.Mesh(lensRingGeom, frameMat);
    rightLens.position.set(0.23, 0.11, 0.65);
    const bridgeGeom = new THREE.CylinderGeometry(0.01, 0.01, 0.19, 8);
    const bridge = new THREE.Mesh(bridgeGeom, frameMat);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.12, 0.65);
    glassesGroup.add(leftLens, rightLens, bridge);
    headSculptGroup.add(glassesGroup);

    // 11. Articulated Upper Lip + Lower Jaw/Mouth Group (lip-sync driven!)
    const lipMat = new THREE.MeshStandardMaterial({
      color: 0xa65e58,
      roughness: 0.42,
      metalness: 0.04,
    });
    const upperLipGeom = new THREE.CapsuleGeometry(0.026, 0.17, 6, 12);
    const upperLip = new THREE.Mesh(upperLipGeom, lipMat);
    upperLip.rotation.z = Math.PI / 2;
    upperLip.position.set(0, -0.22, 0.62);
    headSculptGroup.add(upperLip);

    const mouthCavityGeom = new THREE.PlaneGeometry(0.2, 0.09);
    const mouthCavityMat = new THREE.MeshBasicMaterial({ color: 0x240d10 });
    const mouthCavity = new THREE.Mesh(mouthCavityGeom, mouthCavityMat);
    mouthCavity.position.set(0, -0.255, 0.602);
    mouthCavity.scale.set(1, 0.08, 1);
    headSculptGroup.add(mouthCavity);

    const jawPivot = new THREE.Group();
    jawPivot.position.set(0, -0.24, 0.42);
    headSculptGroup.add(jawPivot);

    const lowerLipGeom = new THREE.CapsuleGeometry(0.028, 0.15, 6, 12);
    const lowerLip = new THREE.Mesh(lowerLipGeom, lipMat);
    lowerLip.rotation.z = Math.PI / 2;
    lowerLip.position.set(0, -0.035, 0.2);
    jawPivot.add(lowerLip);

    // Texture loader for portrait likeness projection
    const textureLoader = new THREE.TextureLoader();
    let currentPortraitTex: THREE.Texture | null = null;

    textureUpdaterRef.current = (dataUrl: string | null) => {
      if (!dataUrl) {
        if (currentPortraitTex) {
          currentPortraitTex.dispose();
          currentPortraitTex = null;
        }
        faceMat.map = null;
        faceMat.needsUpdate = true;
        return;
      }
      textureLoader.load(
        dataUrl,
        (tex) => {
          if (currentPortraitTex) {
            currentPortraitTex.dispose();
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          currentPortraitTex = tex;
          faceMat.map = tex;
          faceMat.color.setHex(0xffffff); // Never tint/darken a mapped sRGB texture
          faceMat.needsUpdate = true;
        },
        undefined,
        () => {
          // Ignore load error gracefully
        }
      );
    };

    if (portraitDataUrl) {
      textureUpdaterRef.current(portraitDataUrl);
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Pre-allocated scratch vectors outside render loop
    const desiredCamPos = new THREE.Vector3();
    const desiredLookAt = new THREE.Vector3();
    const currentLookAt = new THREE.Vector3(0, 1.28, 0);
    const targetSkinColor = new THREE.Color();
    const targetHairColor = new THREE.Color();
    const targetEyeColor = new THREE.Color();
    const targetLipColor = new THREE.Color();

    let disposed = false;
    let rafId = 0;
    let fenceTimerId = 0;
    let lastTime = performance.now();
    let speakElapsed = 0;
    let smoothMouth = 0;

    const gl = renderer.getContext() as WebGL2RenderingContext;
    const scheduleNextFrame = (cb: () => void) => {
      if (disposed) return;
      if (isSoftwareGl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          if (!sync) {
            rafId = requestAnimationFrame(cb);
            return;
          }
          const status = gl.clientWaitSync(sync, 0, 0);
          if (status === gl.ALREADY_SIGNALED || status === gl.CONDITION_SATISFIED) {
            gl.deleteSync(sync);
            rafId = requestAnimationFrame(cb);
          } else {
            fenceTimerId = window.setTimeout(poll, 12);
          }
        };
        fenceTimerId = window.setTimeout(poll, 8);
      } else {
        rafId = requestAnimationFrame(cb);
      }
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const tSec = now * 0.001;

      const state = liveStateRef.current;
      const damp = 1 - Math.exp(-5.5 * dt);

      // Camera framing presets (pull back smoothly on narrow mobile aspect ratios)
      const aspectPullback = camera.aspect < 1.15 ? (1.15 - camera.aspect) * 1.35 : 0;
      if (state.preset === 'front') {
        desiredCamPos.set(0, 1.28, 4.25 + aspectPullback);
        desiredLookAt.set(0, 1.18, 0);
      } else if (state.preset === 'closeup') {
        desiredCamPos.set(0.12, 1.42, 2.95 + aspectPullback * 0.75);
        desiredLookAt.set(0, 1.38, 0.12);
      } else {
        desiredCamPos.set(0.52, 1.31, 4.2 + aspectPullback);
        desiredLookAt.set(0, 1.18, 0);
      }
      camera.position.lerp(desiredCamPos, damp);
      currentLookAt.lerp(desiredLookAt, damp);
      camera.lookAt(currentLookAt);

      // Apply facial likeness parameters smoothly
      const fp = state.faceProfile;
      if (fp) {
        targetSkinColor.set(fp.skin_tone_hex || '#c99474');
        targetHairColor.set(fp.hair_color_hex || '#1d1816');
        targetEyeColor.set(fp.eye_color_hex || '#3b2a1e');
        targetLipColor.set(fp.lip_color_hex || '#a65e58');

        skinMat.color.lerp(targetSkinColor, damp);
        if (!faceMat.map) {
          faceMat.color.lerp(targetSkinColor, damp);
        } else {
          faceMat.color.setHex(0xffffff);
        }
        hairMat.color.lerp(targetHairColor, damp);
        irisMat.color.lerp(targetEyeColor, damp);
        lipMat.color.lerp(targetLipColor, damp);

        const widthScale = THREE.MathUtils.clamp(fp.face_width_ratio / 0.78, 0.88, 1.14);
        headSculptGroup.scale.set(widthScale, 1, 1);

        const arch = THREE.MathUtils.clamp(fp.brow_arch, 0, 1);
        leftBrow.rotation.z = Math.PI / 2 - (0.04 + arch * 0.14);
        rightBrow.rotation.z = Math.PI / 2 + (0.04 + arch * 0.14);
        glassesGroup.visible = Boolean(fp.glasses);

        const showLocks = fp.hair_style === 'long' || fp.hair_style === 'medium' || fp.hair_style === 'curly';
        leftLock.visible = showLocks;
        rightLock.visible = showLocks;
        topBun.visible = fp.hair_style === 'bun' || fp.hair_style === 'long';
      } else {
        leftLock.visible = true;
        rightLock.visible = true;
        topBun.visible = false;
        glassesGroup.visible = false;
      }

      // Hologram-to-Studio convergence blend
      const convNorm = THREE.MathUtils.clamp(state.convergencePct / 100, 0, 1);
      if (state.renderStyle === 'hologram') {
        holoMat.opacity = 0.62;
        holoMesh.visible = true;
      } else if (state.renderStyle === 'studio') {
        holoMat.opacity = 0.03;
        holoMesh.visible = false;
      } else {
        const targetOpacity = Math.max(0.04, 0.56 * (1 - convNorm * 0.92));
        holoMat.opacity = THREE.MathUtils.lerp(holoMat.opacity, targetOpacity, damp);
        holoMesh.visible = holoMat.opacity > 0.05;
      }

      // Lip-sync & speech animation
      let targetMouth = 0;
      if (state.isSpeaking) {
        speakElapsed += dt;
        const measured = state.getAudioLevel ? state.getAudioLevel() : 0;
        const fallback = computeSyntheticSpeechMouthOpen(speakElapsed, state.cadenceWpm);
        targetMouth = measured > 0.04 ? Math.min(1, measured * 1.65) : fallback;
      } else {
        speakElapsed = 0;
      }
      smoothMouth = THREE.MathUtils.lerp(smoothMouth, targetMouth, 1 - Math.exp(-18 * dt));

      jawPivot.rotation.x = smoothMouth * 0.28;
      jawPivot.position.y = -0.24 - smoothMouth * 0.042;
      mouthCavity.scale.y = 0.08 + smoothMouth * 1.25;
      upperLip.scale.x = 1 - smoothMouth * 0.08;

      // Natural idle breathing, micro head movement & expressive nod when speaking
      const speakNod = state.isSpeaking ? Math.sin(tSec * 5.2) * 0.035 * (0.4 + smoothMouth) : 0;
      headGroup.rotation.y = Math.sin(tSec * 0.65) * 0.085;
      headGroup.rotation.x = Math.sin(tSec * 0.9) * 0.022 + speakNod;
      headGroup.position.y = 1.46 + Math.sin(tSec * 1.4) * 0.009;

      // Periodic natural eye blink every ~4.2 seconds
      const blinkCycle = tSec % 4.2;
      const blinkAmt =
        blinkCycle > 3.98 ? Math.sin(((blinkCycle - 3.98) / 0.22) * Math.PI) : 0;
      const lidRot = -0.35 + blinkAmt * 0.95;
      leftEye.lid.rotation.x = lidRot;
      rightEye.lid.rotation.x = lidRot;

      // Vocal ring response
      vocalRingMat.emissiveIntensity = 0.55 + smoothMouth * 1.45;
      vocalRing.scale.setScalar(1 + smoothMouth * 0.045);

      renderer.render(scene, camera);
      scheduleNextFrame(tick);
    };

    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect || rect.width < 80 || rect.height < 80) return;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height, false);
    });
    ro.observe(mount);

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(fenceTimerId);
      ro.disconnect();
      textureUpdaterRef.current = null;
      if (currentPortraitTex) currentPortraitTex.dispose();
      envRT.dispose();
      skinBumpTex.dispose();
      shadowTex.dispose();
      headGeom.dispose();
      plinthGeom.dispose();
      vocalRingGeom.dispose();
      torsoGeom.dispose();
      neckGeom.dispose();
      hairCapGeom.dispose();
      sideLocksGeom.dispose();
      bunGeom.dispose();
      noseGeom.dispose();
      earGeom.dispose();
      scleraGeom.dispose();
      irisGeom.dispose();
      pupilGeom.dispose();
      lidGeom.dispose();
      browGeom.dispose();
      lensRingGeom.dispose();
      bridgeGeom.dispose();
      upperLipGeom.dispose();
      mouthCavityGeom.dispose();
      lowerLipGeom.dispose();
      floorGeom.dispose();
      contactShadowGeom.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (textureUpdaterRef.current) {
      textureUpdaterRef.current(portraitDataUrl);
    }
  }, [portraitDataUrl]);

  return (
    <div
      className="mx-preserve-stage-shell"
      data-testid="preserve-3d-stage"
      data-convergence={convergencePct}
      data-speaking={isSpeaking ? 'true' : 'false'}
    >
      {/* Dedicated empty canvas mount (never touched by React re-renders) */}
      <div ref={canvasMountRef} className="mx-preserve-canvas-mount" />

      {/* Top-left convergence readout (solid/rgba surface, zero backdrop-filter) */}
      <div className="mx-preserve-hud-top">
        <div className="mx-preserve-score-chip">
          <b>{convergencePct}% Preserved</b>
          <small>
            {patientName} · {stageLabel}
          </small>
        </div>
        {isSpeaking ? (
          <span className="mx-preserve-speaking-tag" role="status">
            Speaking in preserved voice
          </span>
        ) : null}
      </div>

      {/* Collapsible bottom dock inside 3D stage */}
      <div className={`mx-preserve-dock${dockCollapsed ? ' is-collapsed' : ''}`}>
        {!dockCollapsed && (
          <div className="mx-preserve-dock-controls">
            <div className="mx-preserve-seg" role="group" aria-label="Camera angle">
              {(
                [
                  ['portrait', '3/4 View'],
                  ['front', 'Front'],
                  ['closeup', 'Close-up'],
                ] as Array<[CameraPreset, string]>
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={preset === id}
                  onClick={() => setPreset(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mx-preserve-seg" role="group" aria-label="3D surface mode">
              {(
                [
                  ['auto', 'Auto Convergence'],
                  ['studio', '3D Likeness'],
                  ['hologram', 'Mesh Wireframe'],
                ] as Array<[RenderStyle, string]>
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={renderStyle === id}
                  onClick={() => setRenderStyle(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          type="button"
          className="mx-preserve-dock-toggle"
          onClick={() => setDockCollapsed((v) => !v)}
          aria-expanded={!dockCollapsed}
          aria-label={dockCollapsed ? 'Show 3D controls' : 'Hide 3D controls'}
        >
          {dockCollapsed ? 'Controls ▲' : 'Hide ▼'}
        </button>
      </div>
    </div>
  );
}
