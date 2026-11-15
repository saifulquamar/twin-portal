import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  computeSyntheticSpeechMouthOpen,
  type FaceLikenessData,
} from './preserve-math';

type CameraPreset = 'portrait' | 'front' | 'closeup';
type RenderStyle = 'auto' | 'studio' | 'hologram';
type TwinViewMode = 'portrait3d' | 'fullbody3d';

function detectSoftwareGl(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
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
        const v = Math.round(118 + rand() * 20);
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
 * Feathers an uploaded portrait smoothly into the subject's extracted skin tone
 * using an offscreen 512x512 Canvas2D elliptical alpha mask so the face likeness
 * projects onto the sculpted 3D cranium with zero rectangular photo borders!
 */
function createFeatheredPortraitCanvasTexture(
  dataUrl: string,
  skinToneHex: string,
  maxAnisotropy: number
): Promise<THREE.CanvasTexture> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = 512;
      const baseCanvas = document.createElement('canvas');
      baseCanvas.width = size;
      baseCanvas.height = size;
      const bCtx = baseCanvas.getContext('2d');

      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = size;
      maskCanvas.height = size;
      const mCtx = maskCanvas.getContext('2d');

      if (!bCtx || !mCtx) {
        reject(new Error('Canvas 2D unavailable'));
        return;
      }

      // 1. Solid skin-tone base everywhere (temples, neck transition, back of head)
      bCtx.fillStyle = skinToneHex || '#c99474';
      bCtx.fillRect(0, 0, size, size);

      // 2. Tight face-centered crop onto mask canvas so eyes, nose & lips align with 3D facial sculpt (without shoulders on chin)
      const iw = img.width || size;
      const ih = img.height || size;
      const crop = Math.min(iw, ih) * 0.72;
      const sx = Math.max(0, (iw - crop) * 0.5);
      const sy = Math.max(0, ih * 0.08);
      const pad = Math.round(size * 0.06);
      mCtx.drawImage(img, sx, sy, crop, crop, pad, pad, size - pad * 2, size - pad * 2);

      // 3. Apply soft radial elliptical alpha feather so edges dissolve seamlessly into skin tone
      mCtx.globalCompositeOperation = 'destination-in';
      mCtx.save();
      mCtx.translate(size * 0.5, size * 0.48);
      mCtx.scale(0.84, 0.94);
      const grad = mCtx.createRadialGradient(0, 0, size * 0.18, 0, 0, size * 0.45);
      grad.addColorStop(0, 'rgba(255,255,255,0.98)');
      grad.addColorStop(0.62, 'rgba(255,255,255,0.9)');
      grad.addColorStop(0.86, 'rgba(255,255,255,0.32)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      mCtx.fillStyle = grad;
      mCtx.beginPath();
      mCtx.arc(0, 0, size * 0.46, 0, Math.PI * 2);
      mCtx.fill();
      mCtx.restore();

      // 4. Composite feathered face onto skin-tone base
      bCtx.drawImage(maskCanvas, 0, 0);

      const tex = new THREE.CanvasTexture(baseCanvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      tex.needsUpdate = true;
      resolve(tex);
    };
    img.onerror = () => reject(new Error('Failed to load portrait image'));
    img.src = dataUrl;
  });
}

/**
 * Sculpts a high-resolution sphere into an anatomical human cranial & facial topology:
 * supraorbital brow ridge, recessed orbital sockets, zygomatic cheek contours,
 * continuous nasal bridge, philtrum, chin projection, and tapered mandible.
 */
function buildSculptedHeadGeometry(): THREE.BufferGeometry {
  const geom = new THREE.SphereGeometry(0.68, 44, 36);
  const pos = geom.attributes.position;
  const uv = geom.attributes.uv;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const nx = v.x / 0.68;
    const ny = v.y / 0.68; // -1..1
    const nz = v.z / 0.68;

    // 1. Cranial proportions
    v.y *= 1.19;
    if (nz < 0) {
      // Slightly deeper occipital curve at back of skull
      v.z *= 1.04;
    }

    // 2. Mandibular taper & chin contour
    if (ny < -0.06) {
      const t = Math.min(1, (-ny - 0.06) / 0.94);
      const jawScale = 1 - 0.29 * Math.pow(t, 1.65);
      v.x *= jawScale;
      v.z *= 1 - 0.13 * t;
      if (nz > 0.22) {
        const chinCenter = Math.max(0, 1 - Math.pow(nx / 0.42, 2));
        v.z += 0.052 * chinCenter * Math.sin(Math.min(1, t * 1.25) * Math.PI * 0.85);
      }
    }

    // 3. Supraorbital brow ridge + orbital eye-socket hollows on front hemisphere
    if (nz > 0.25) {
      const browBand = Math.exp(-Math.pow((ny - 0.29) / 0.09, 2)) * Math.exp(-Math.pow(nx / 0.62, 2));
      v.z += 0.028 * browBand;

      const leftSocket = Math.exp(
        -(Math.pow((nx + 0.33) / 0.16, 2) + Math.pow((ny - 0.15) / 0.11, 2))
      );
      const rightSocket = Math.exp(
        -(Math.pow((nx - 0.33) / 0.16, 2) + Math.pow((ny - 0.15) / 0.11, 2))
      );
      v.z -= 0.038 * (leftSocket + rightSocket);

      // 4. Zygomatic cheekbone arch
      const cheekArch =
        Math.exp(-Math.pow((ny + 0.01) / 0.19, 2)) *
        Math.exp(-Math.pow((Math.abs(nx) - 0.48) / 0.24, 2));
      v.x *= 1 + 0.055 * cheekArch;
      v.z += 0.036 * cheekArch;

      // 5. Continuous anatomical nose bridge & tip sculpted directly into facial mesh
      const noseProfileY = Math.exp(-Math.pow((ny - 0.01) / 0.22, 2));
      const noseCenterX = Math.exp(-Math.pow(nx / 0.13, 2));
      const noseTipBoost = Math.exp(-Math.pow((ny + 0.08) / 0.085, 2)) * noseCenterX;
      v.z += (0.068 * noseProfileY * noseCenterX + 0.042 * noseTipBoost) * Math.max(0, nz);
    }

    // 6. Temporal narrowing
    if (ny > 0.06 && ny < 0.58) {
      v.x *= 0.945;
    }

    pos.setXYZ(i, v.x, v.y, v.z);

    // Frontal UV projection on +Z face; smooth edge clamp on sides/back so feathered skin-tone base fills cleanly
    if (v.z > 0.05) {
      const uCoord = THREE.MathUtils.clamp(0.5 + v.x / 1.24, 0.02, 0.98);
      const vCoord = THREE.MathUtils.clamp(0.51 + v.y / 1.56, 0.02, 0.98);
      uv.setXY(i, uCoord, vCoord);
    } else {
      uv.setXY(i, 0.02, 0.02);
    }
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
  compact = false,
  conversationState,
  processingStage = null,
  bundle,
  PatientTwin3D,
}: {
  patientName: string;
  convergencePct: number;
  stageLabel: string;
  faceProfile: FaceLikenessData | null;
  portraitDataUrl: string | null;
  isSpeaking: boolean;
  cadenceWpm?: number;
  getAudioLevel?: () => number;
  compact?: boolean;
  conversationState?: 'idle' | 'listening' | 'thinking' | 'speaking';
  processingStage?: string | null;
  bundle?: any;
  PatientTwin3D?: any;
}) {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<TwinViewMode>('portrait3d');
  const [preset, setPreset] = useState<CameraPreset>(compact ? 'front' : 'portrait');
  const [renderStyle, setRenderStyle] = useState<RenderStyle>('auto');
  const [contextLost, setContextLost] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(() =>
    compact ? true : typeof window !== 'undefined' ? window.innerWidth < 680 : false
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
    conversationState,
    viewMode,
  });
  liveStateRef.current = {
    convergencePct,
    faceProfile,
    isSpeaking,
    cadenceWpm,
    getAudioLevel,
    preset,
    renderStyle,
    conversationState,
    viewMode,
  };

  const textureUpdaterRef = useRef<((url: string | null, skinHex?: string) => void) | null>(null);

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const width = Math.max(260, mount.clientWidth || 560);
    const height = Math.max(compact ? 210 : 280, mount.clientHeight || (compact ? 230 : 380));

    const isSoftwareGl = detectSoftwareGl();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setContextLost(true);
      return;
    }

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const onLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onLost);
    renderer.domElement.addEventListener('webglcontextrestored', onRestored);

    const scene = new THREE.Scene();
    const bgHex = 0x0a1518;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.082);

    // Studio PBR environment matching clinical <mx-patient-twin> aesthetic
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(33, width / height, 0.1, 30);
    camera.position.set(0.42, 1.31, 4.25);
    camera.lookAt(0, 1.22, 0);

    // Balanced 3-point warm/cool studio lighting
    const hemiLight = new THREE.HemisphereLight(0xdaf3ff, 0x16262b, 0.88);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1dc, 1.82);
    keyLight.position.set(2.2, 3.4, 2.9);
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
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x1fc8cf, 1.12);
    rimLight.position.set(-2.4, 2.0, -1.9);
    scene.add(rimLight);

    // Ground plane + soft radial contact shadow (offset >= 0.02 on Y to prevent Z-fighting)
    const floorY = 0;
    const floorGeom = new THREE.CircleGeometry(6, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0d1c20,
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
      opacity: 0.48,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(contactShadowGeom, contactShadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = floorY + 0.02;
    scene.add(contactShadow);

    // === Multi-part Composite 3D Portrait Twin (11 distinct anatomical parts) ===
    const actorRoot = new THREE.Group();
    actorRoot.position.y = floorY;
    scene.add(actorRoot);

    const plinthGeom = new THREE.CylinderGeometry(0.72, 0.82, 0.18, 32);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x15252a,
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

    // Sculpted shoulders & collar
    const torsoGeom = new THREE.CylinderGeometry(0.36, 0.68, 0.62, 32, 1);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x1a3037,
      roughness: 0.78,
      metalness: 0.12,
    });
    const torsoMesh = new THREE.Mesh(torsoGeom, torsoMat);
    torsoMesh.scale.set(1.28, 1, 0.72);
    torsoMesh.position.y = 0.49;
    torsoMesh.castShadow = !isSoftwareGl;
    actorRoot.add(torsoMesh);

    // Skin material with subtle clearcoat sheen + micro-pore bump relief
    const skinBumpTex = createMicroSkinBumpTexture();
    const skinMat = new THREE.MeshPhysicalMaterial({
      color: 0xc99474,
      roughness: 0.54,
      metalness: 0.03,
      clearcoat: 0.14,
      clearcoatRoughness: 0.65,
      bumpMap: skinBumpTex,
      bumpScale: 0.006,
    });

    const neckGeom = new THREE.CylinderGeometry(0.21, 0.255, 0.38, 24);
    const neckMesh = new THREE.Mesh(neckGeom, skinMat);
    neckMesh.position.set(0, 0.92, -0.02);
    neckMesh.castShadow = !isSoftwareGl;
    actorRoot.add(neckMesh);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.46, 0);
    actorRoot.add(headGroup);

    const headSculptGroup = new THREE.Group();
    headGroup.add(headSculptGroup);

    const headGeom = buildSculptedHeadGeometry();
    const faceMat = new THREE.MeshPhysicalMaterial({
      color: 0xc99474,
      roughness: 0.52,
      metalness: 0.03,
      clearcoat: 0.16,
      clearcoatRoughness: 0.62,
      bumpMap: skinBumpTex,
      bumpScale: 0.005,
    });
    const headMesh = new THREE.Mesh(headGeom, faceMat);
    headMesh.castShadow = !isSoftwareGl;
    headSculptGroup.add(headMesh);

    // Clinical twin biopotential lattice shell (dissolves smoothly as likeness & voice converge)
    const holoMat = new THREE.MeshBasicMaterial({
      color: 0x2fd6de,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });
    const holoMesh = new THREE.Mesh(headGeom, holoMat);
    holoMesh.scale.setScalar(1.012);
    headSculptGroup.add(holoMesh);

    // Hair Crown + Style Accents (roughness 0.84 vs face 0.52 >= 0.25 contrast)
    const hairGroup = new THREE.Group();
    headSculptGroup.add(hairGroup);
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x1d1816,
      roughness: 0.84,
      metalness: 0.06,
    });
    const hairCapGeom = new THREE.SphereGeometry(
      0.704,
      32,
      22,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.44
    );
    const hairCap = new THREE.Mesh(hairCapGeom, hairMat);
    hairCap.scale.set(1.02, 1.18, 1.05);
    hairCap.position.set(0, 0.145, -0.095);
    hairCap.rotation.x = -0.46;
    hairGroup.add(hairCap);

    const sideLocksGeom = new THREE.CapsuleGeometry(0.155, 0.46, 8, 14);
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

    // Anatomical Ears
    const earGeom = new THREE.SphereGeometry(0.13, 14, 12);
    const leftEar = new THREE.Mesh(earGeom, skinMat);
    leftEar.scale.set(0.42, 1.15, 0.72);
    leftEar.position.set(-0.64, -0.02, -0.02);
    const rightEar = new THREE.Mesh(earGeom, skinMat);
    rightEar.scale.set(0.42, 1.15, 0.72);
    rightEar.position.set(0.64, -0.02, -0.02);
    headSculptGroup.add(leftEar, rightEar);

    // Eyes (glossy sclera roughness 0.12 + iris + pupil + blinking upper eyelids)
    const scleraGeom = new THREE.SphereGeometry(0.086, 16, 14);
    const scleraMat = new THREE.MeshStandardMaterial({
      color: 0xf7f9fa,
      roughness: 0.12,
      metalness: 0.02,
    });
    const irisGeom = new THREE.CircleGeometry(0.045, 18);
    const irisMat = new THREE.MeshStandardMaterial({
      color: 0x3b2a1e,
      roughness: 0.22,
      metalness: 0.08,
    });
    const pupilGeom = new THREE.CircleGeometry(0.02, 14);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090b0c });
    const lidGeom = new THREE.SphereGeometry(
      0.091,
      16,
      10,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.52
    );

    const buildEye = (xSign: number) => {
      const g = new THREE.Group();
      g.position.set(xSign * 0.225, 0.105, 0.555);
      const sclera = new THREE.Mesh(scleraGeom, scleraMat);
      sclera.scale.set(1.12, 0.92, 0.75);
      g.add(sclera);

      const iris = new THREE.Mesh(irisGeom, irisMat);
      iris.position.z = 0.066;
      g.add(iris);

      const pupil = new THREE.Mesh(pupilGeom, pupilMat);
      pupil.position.z = 0.069;
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

    // Sculpted Eyebrows
    const browGeom = new THREE.CapsuleGeometry(0.022, 0.155, 6, 10);
    const leftBrow = new THREE.Mesh(browGeom, hairMat);
    leftBrow.rotation.z = Math.PI / 2 - 0.08;
    leftBrow.position.set(-0.225, 0.235, 0.615);
    const rightBrow = new THREE.Mesh(browGeom, hairMat);
    rightBrow.rotation.z = Math.PI / 2 + 0.08;
    rightBrow.position.set(0.225, 0.235, 0.615);
    headSculptGroup.add(leftBrow, rightBrow);

    // Optional Eyeglasses Group
    const glassesGroup = new THREE.Group();
    glassesGroup.visible = false;
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x263238,
      roughness: 0.28,
      metalness: 0.78,
    });
    const lensRingGeom = new THREE.TorusGeometry(0.135, 0.012, 10, 28);
    const leftLens = new THREE.Mesh(lensRingGeom, frameMat);
    leftLens.position.set(-0.225, 0.105, 0.648);
    const rightLens = new THREE.Mesh(lensRingGeom, frameMat);
    rightLens.position.set(0.225, 0.105, 0.648);
    const bridgeGeom = new THREE.CylinderGeometry(0.01, 0.01, 0.19, 8);
    const bridge = new THREE.Mesh(bridgeGeom, frameMat);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.118, 0.648);
    glassesGroup.add(leftLens, rightLens, bridge);
    headSculptGroup.add(glassesGroup);

    // Articulated Upper Lip + Lower Jaw/Mouth Group (lip-sync driven!)
    const lipMat = new THREE.MeshStandardMaterial({
      color: 0xa65e58,
      roughness: 0.42,
      metalness: 0.04,
    });
    const upperLipGeom = new THREE.CapsuleGeometry(0.024, 0.165, 6, 12);
    const upperLip = new THREE.Mesh(upperLipGeom, lipMat);
    upperLip.rotation.z = Math.PI / 2;
    upperLip.position.set(0, -0.22, 0.615);
    headSculptGroup.add(upperLip);

    const mouthCavityGeom = new THREE.PlaneGeometry(0.19, 0.085);
    const mouthCavityMat = new THREE.MeshBasicMaterial({ color: 0x240d10 });
    const mouthCavity = new THREE.Mesh(mouthCavityGeom, mouthCavityMat);
    mouthCavity.position.set(0, -0.252, 0.598);
    mouthCavity.scale.set(1, 0.08, 1);
    headSculptGroup.add(mouthCavity);

    const jawPivot = new THREE.Group();
    jawPivot.position.set(0, -0.238, 0.42);
    headSculptGroup.add(jawPivot);

    const lowerLipGeom = new THREE.CapsuleGeometry(0.026, 0.145, 6, 12);
    const lowerLip = new THREE.Mesh(lowerLipGeom, lipMat);
    lowerLip.rotation.z = Math.PI / 2;
    lowerLip.position.set(0, -0.034, 0.195);
    jawPivot.add(lowerLip);

    let currentPortraitTex: THREE.Texture | null = null;
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    textureUpdaterRef.current = (dataUrl: string | null, skinHex?: string) => {
      if (!dataUrl) {
        if (currentPortraitTex) {
          currentPortraitTex.dispose();
          currentPortraitTex = null;
        }
        faceMat.map = null;
        leftEye.group.visible = true;
        rightEye.group.visible = true;
        leftBrow.visible = true;
        rightBrow.visible = true;
        faceMat.needsUpdate = true;
        return;
      }

      createFeatheredPortraitCanvasTexture(
        dataUrl,
        skinHex || liveStateRef.current.faceProfile?.skin_tone_hex || '#c99474',
        maxAniso
      )
        .then((tex) => {
          if (disposed) {
            tex.dispose();
            return;
          }
          if (currentPortraitTex) currentPortraitTex.dispose();
          currentPortraitTex = tex;
          faceMat.map = tex;
          faceMat.color.setHex(0xffffff); // Never darken sRGB texture map
          // Keep subtle blinking lids/lips active while letting portrait eyes read cleanly without cartoon double-iris overlap
          leftEye.group.visible = false;
          rightEye.group.visible = false;
          leftBrow.visible = false;
          rightBrow.visible = false;
          faceMat.needsUpdate = true;
        })
        .catch(() => {
          // Graceful fallback to sculpted 3D skin if image fails
        });
    };

    if (portraitDataUrl) {
      textureUpdaterRef.current(portraitDataUrl, faceProfile?.skin_tone_hex);
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const desiredCamPos = new THREE.Vector3();
    const desiredLookAt = new THREE.Vector3();
    const currentLookAt = new THREE.Vector3(0, 1.28, 0);
    const targetSkinColor = new THREE.Color();
    const targetHairColor = new THREE.Color();
    const targetEyeColor = new THREE.Color();
    const targetLipColor = new THREE.Color();

    let disposed = false;
    let frameId = 0;
    let lastTime = performance.now();
    let speakElapsed = 0;
    let smoothMouth = 0;

    const gl = renderer.getContext() as WebGL2RenderingContext;
    const afterDraw = (cb: () => void) => {
      if (disposed) return;
      if (typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const tSec = now * 0.001;

      const state = liveStateRef.current;

      // Pause rendering when Full-Body <mx-patient-twin> tab is active so two WebGL loops never compete
      if (state.viewMode === 'fullbody3d') {
        frameId = window.setTimeout(tick, 220);
        return;
      }

      const damp = 1 - Math.exp(-5.5 * dt);

      const aspectPullback = camera.aspect < 1.15 ? (1.15 - camera.aspect) * 1.3 : 0;
      if (state.preset === 'front') {
        desiredCamPos.set(0, compact ? 1.35 : 1.31, (compact ? 3.98 : 4.15) + aspectPullback);
        desiredLookAt.set(0, compact ? 1.29 : 1.24, 0);
      } else if (state.preset === 'closeup') {
        desiredCamPos.set(0.1, 1.43, 2.95 + aspectPullback * 0.75);
        desiredLookAt.set(0, 1.39, 0.12);
      } else {
        desiredCamPos.set(0.46, compact ? 1.35 : 1.32, (compact ? 4.02 : 4.15) + aspectPullback);
        desiredLookAt.set(0, compact ? 1.28 : 1.22, 0);
      }
      camera.position.lerp(desiredCamPos, damp);
      currentLookAt.lerp(desiredLookAt, damp);
      camera.lookAt(currentLookAt);

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

        const showLocks =
          fp.hair_style === 'long' || fp.hair_style === 'medium' || fp.hair_style === 'curly';
        leftLock.visible = showLocks;
        rightLock.visible = showLocks;
        topBun.visible = fp.hair_style === 'bun' || fp.hair_style === 'long';
      } else {
        leftLock.visible = true;
        rightLock.visible = true;
        topBun.visible = false;
        glassesGroup.visible = false;
      }

      const convNorm = THREE.MathUtils.clamp(state.convergencePct / 100, 0, 1);
      if (state.renderStyle === 'hologram') {
        holoMat.opacity = 0.56;
        holoMesh.visible = true;
      } else if (state.renderStyle === 'studio') {
        holoMat.opacity = 0.02;
        holoMesh.visible = false;
      } else {
        const targetOpacity = faceMat.map
          ? 0.02
          : Math.max(0.03, 0.42 * (1 - convNorm * 0.92));
        holoMat.opacity = THREE.MathUtils.lerp(holoMat.opacity, targetOpacity, damp);
        holoMesh.visible = holoMat.opacity > 0.045;
      }

      // Lip-sync & expressive conversational posture
      const activelySpeaking =
        state.isSpeaking || state.conversationState === 'speaking';
      let targetMouth = 0;
      if (activelySpeaking) {
        speakElapsed += dt;
        const measured = state.getAudioLevel ? state.getAudioLevel() : 0;
        const fallback = computeSyntheticSpeechMouthOpen(speakElapsed, state.cadenceWpm);
        targetMouth = measured > 0.035 ? Math.min(1, measured * 1.65) : fallback;
      } else {
        speakElapsed = 0;
      }
      smoothMouth = THREE.MathUtils.lerp(smoothMouth, targetMouth, 1 - Math.exp(-18 * dt));

      const showSculptedLips = !faceMat.map || smoothMouth > 0.04;
      upperLip.visible = showSculptedLips;
      lowerLip.visible = showSculptedLips;
      mouthCavity.visible = showSculptedLips;
      jawPivot.rotation.x = smoothMouth * 0.28;
      jawPivot.position.y = -0.238 - smoothMouth * 0.042;
      mouthCavity.scale.y = 0.08 + smoothMouth * 1.25;
      upperLip.scale.x = 1 - smoothMouth * 0.08;

      const isListening = state.conversationState === 'listening';
      const isThinking = state.conversationState === 'thinking';
      const listenTilt = isListening ? 0.055 : 0;
      const thinkYaw = isThinking ? Math.sin(tSec * 2.1) * 0.11 : Math.sin(tSec * 0.62) * 0.075;
      const speakNod = activelySpeaking
        ? Math.sin(tSec * 5.2) * 0.035 * (0.4 + smoothMouth)
        : 0;

      headGroup.rotation.y = thinkYaw;
      headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, listenTilt, damp);
      headGroup.rotation.x = Math.sin(tSec * 0.9) * 0.02 + speakNod;
      headGroup.position.y = 1.46 + Math.sin(tSec * 1.35) * 0.008;

      const blinkCycle = tSec % 4.2;
      const blinkAmt =
        blinkCycle > 3.98 ? Math.sin(((blinkCycle - 3.98) / 0.22) * Math.PI) : 0;
      const lidRot = -0.35 + blinkAmt * 0.95;
      leftEye.lid.rotation.x = lidRot;
      rightEye.lid.rotation.x = lidRot;

      vocalRingMat.emissiveIntensity = isListening
        ? 0.95 + Math.sin(tSec * 4) * 0.25
        : 0.55 + smoothMouth * 1.45;
      vocalRing.scale.setScalar(1 + smoothMouth * 0.045);

      renderer.render(scene, camera);
      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
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
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      ro.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', onLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onRestored);
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
  }, [compact]);

  useEffect(() => {
    if (textureUpdaterRef.current) {
      textureUpdaterRef.current(portraitDataUrl, faceProfile?.skin_tone_hex);
    }
  }, [portraitDataUrl, faceProfile?.skin_tone_hex]);

  const effectiveConvState: 'idle' | 'listening' | 'thinking' | 'speaking' =
    conversationState || (isSpeaking ? 'speaking' : 'idle');

  const statusText = processingStage
    ? processingStage
    : effectiveConvState === 'speaking'
      ? `Speaking in ${patientName}’s voice`
      : effectiveConvState === 'listening'
        ? 'Listening to your voice…'
        : effectiveConvState === 'thinking'
          ? 'Checking your Twin & evidence…'
          : portraitDataUrl
            ? '3D portrait likeness active'
            : 'Baseline 3D sculpt · upload photo to personalize';

  return (
    <div
      className={`mx-preserve-stage-shell${compact ? ' is-compact' : ''}`}
      data-testid="preserve-3d-stage"
      data-convergence={convergencePct}
      data-speaking={effectiveConvState === 'speaking' ? 'true' : 'false'}
      data-view-mode={viewMode}
    >
      {/* Dedicated empty canvas mount (never touched by React re-renders) */}
      <div
        ref={canvasMountRef}
        className="mx-preserve-canvas-mount"
        style={{ display: viewMode === 'portrait3d' ? 'block' : 'none' }}
      />

      {/* Full-body 3D Anatomical Twin view from the portal engine when toggled */}
      {viewMode === 'fullbody3d' && bundle && PatientTwin3D && (
        <div className="mx-preserve-fullbody-mount">
          <PatientTwin3D
            bundle={bundle}
            selected={null}
            onSelect={() => {}}
            side="front"
            layers="skin,bones,organs,vessels"
          />
        </div>
      )}

      {contextLost && viewMode === 'portrait3d' && (
        <div className="mx-preserve-fallback-banner">
          {portraitDataUrl ? (
            <img
              src={portraitDataUrl}
              alt={`${patientName} portrait`}
              referrerPolicy="no-referrer"
              className="mx-preserve-fallback-img"
            />
          ) : null}
          <span>3D preview paused on this graphics adapter — portrait likeness preserved.</span>
        </div>
      )}

      {/* Top HUD (solid rgba surface, zero backdrop-filter over WebGL) */}
      <div className="mx-preserve-hud-top">
        <div className="mx-preserve-score-chip">
          <b>{convergencePct}% Preserved</b>
          <small>
            {patientName} · {stageLabel}
          </small>
        </div>

        <span
          className={`mx-preserve-speaking-tag state-${effectiveConvState}`}
          role="status"
        >
          {statusText}
        </span>
      </div>

      {/* Collapsible bottom dock inside 3D stage */}
      <div className={`mx-preserve-dock${dockCollapsed ? ' is-collapsed' : ''}`}>
        {!dockCollapsed && (
          <div className="mx-preserve-dock-controls">
            {bundle && PatientTwin3D && (
              <div className="mx-preserve-seg" role="group" aria-label="Twin model mode">
                <button
                  type="button"
                  aria-pressed={viewMode === 'portrait3d'}
                  onClick={() => setViewMode('portrait3d')}
                >
                  3D Face Likeness
                </button>
                <button
                  type="button"
                  aria-pressed={viewMode === 'fullbody3d'}
                  onClick={() => setViewMode('fullbody3d')}
                >
                  Full-Body Twin
                </button>
              </div>
            )}

            {viewMode === 'portrait3d' && (
              <>
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
                {!compact && (
                  <div className="mx-preserve-seg" role="group" aria-label="3D surface mode">
                    {(
                      [
                        ['auto', 'Auto'],
                        ['studio', 'Realistic Skin'],
                        ['hologram', 'Mesh Topology'],
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
                )}
              </>
            )}
          </div>
        )}
        <button
          type="button"
          className="mx-preserve-dock-toggle"
          onClick={() => setDockCollapsed((v) => !v)}
          aria-expanded={!dockCollapsed}
          aria-label={dockCollapsed ? 'Show 3D controls' : 'Hide 3D controls'}
        >
          {dockCollapsed ? '3D View ▲' : 'Hide ▼'}
        </button>
      </div>
    </div>
  );
}
