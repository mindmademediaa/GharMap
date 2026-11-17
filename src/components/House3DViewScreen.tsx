import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ArrowLeft,
  RotateCw,
  Plus,
  Minus,
  Sparkles,
  Sun,
  Moon,
  Lock,
  Check,
  Paintbrush,
  DoorOpen,
  Grid,
  Home,
} from 'lucide-react';
import { WALL_COLOR_SWATCHES } from '../data/constants';
import {
  HouseCustomization,
  Language,
  PlanTier,
  Project,
  WallColorId,
} from '../types/gharmap';
import { Logo } from './Logo';

interface House3DViewScreenProps {
  language: Language;
  plan: PlanTier;
  project: Project;
  onBack: () => void;
  onSwitchTo2D: () => void;
  onUpdateCustomization: (c: HouseCustomization) => void;
  onUpgradeRequest: () => void;
  onShowToast: (msg: string) => void;
}

const TILE_COLORS: Record<HouseCustomization['floorTiles'], string> = {
  'Marble White': '#F1F3F2',
  'Travertine Beige': '#DFD1BC',
  'Charcoal Slate': '#3E4744',
  'Terrazzo Mint': '#CFE5D8',
};

const DOOR_COLORS: Record<HouseCustomization['frontDoor'], number> = {
  'Forest Green Steel': 0x1e5c3e,
  'Walnut Timber': 0x6b3e26,
  'Glass Pivot': 0x26383e,
};

export const House3DViewScreen: React.FC<House3DViewScreenProps> = ({
  plan,
  project,
  onBack,
  onSwitchTo2D,
  onUpdateCustomization,
  onUpgradeRequest,
  onShowToast,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [tab, setTab] = useState<'exterior' | 'interior'>('exterior');
  const [draft, setDraft] = useState<HouseCustomization>(project.customization);
  const [autoRotate, setAutoRotate] = useState(false);

  const canCustomize = plan !== 'free' || Boolean(project.unlockedSingleMap);

  // Sync draft when switching projects
  useEffect(() => {
    setDraft(project.customization);
  }, [project.id, project.customization]);

  // Refs for Three.js imperative control
  const sceneStateRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    controls?: OrbitControls;
    requestRender?: () => void;
    wallMat?: THREE.MeshStandardMaterial;
    accentMat?: THREE.MeshStandardMaterial;
    trimMat?: THREE.MeshStandardMaterial;
    doorMat?: THREE.MeshStandardMaterial;
    tileMat?: THREE.MeshStandardMaterial;
    windowGlassMat?: THREE.MeshPhysicalMaterial;
    roofGroup?: THREE.Group;
    upperShellGroup?: THREE.Group;
    slopedRoofMesh?: THREE.Mesh;
    pergolaGroup?: THREE.Group;
    flatParapetGroup?: THREE.Group;
    jaliGroup?: THREE.Group;
    gateGroup?: THREE.Group;
    sunLight?: THREE.DirectionalLight;
    hemiLight?: THREE.HemisphereLight;
    nightLights?: THREE.PointLight[];
  }>({});

  // Initialize Three.js WebGL scene once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#EEF4F0');
    scene.fog = new THREE.Fog('#EEF4F0', 28, 70);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120);
    camera.position.set(14.5, 9.5, 16.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2.4, 0);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 9;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minPolarAngle = 0.15;

    // 3-Point Warm/Cool Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xdff2ff, 0x5c6e58, 0.75);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e4, 1.8);
    sunLight.position.set(14, 20, 12);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.left = -14;
    sunLight.shadow.camera.right = 14;
    sunLight.shadow.camera.top = 14;
    sunLight.shadow.camera.bottom = -14;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xd2f1e1, 0.45);
    rimLight.position.set(-12, 8, -14);
    scene.add(rimLight);

    // Night warm point lights (off by default)
    const porchLight = new THREE.PointLight(0xffcb7d, 0, 12, 1.5);
    porchLight.position.set(2.4, 2.5, 4.6);
    scene.add(porchLight);

    const upperLight = new THREE.PointLight(0xffd89c, 0, 12, 1.5);
    upperLight.position.set(-1.5, 5.2, 3.8);
    scene.add(upperLight);

    // Materials
    const wallMat = new THREE.MeshStandardMaterial({
      color: '#F6F7F5',
      roughness: 0.78,
      metalness: 0.02,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: '#2F6B4E',
      roughness: 0.65,
      metalness: 0.05,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.45,
      metalness: 0.1,
    });
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x6b3e26,
      roughness: 0.42,
      metalness: 0.15,
    });
    const darkFrameMat = new THREE.MeshStandardMaterial({
      color: '#1D2923',
      roughness: 0.35,
      metalness: 0.65,
    });
    const windowGlassMat = new THREE.MeshPhysicalMaterial({
      color: '#A9C8D4',
      roughness: 0.08,
      metalness: 0.1,
      transparent: true,
      opacity: isSoftwareGl ? 0.48 : 0.75,
      emissive: new THREE.Color('#FFBD59'),
      emissiveIntensity: 0,
    });

    // Procedural tile texture
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = 256;
    tileCanvas.height = 256;
    const ctx = tileCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#EAECEB';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = 'rgba(20,40,30,0.14)';
      ctx.lineWidth = 2;
      for (let i = 0; i <= 256; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 256);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(256, i);
        ctx.stroke();
      }
    }
    const tileTex = new THREE.CanvasTexture(tileCanvas);
    tileTex.colorSpace = THREE.SRGBColorSpace;
    tileTex.wrapS = THREE.RepeatWrapping;
    tileTex.wrapT = THREE.RepeatWrapping;
    tileTex.repeat.set(4, 4);
    const tileMat = new THREE.MeshStandardMaterial({
      color: '#F1F3F2',
      map: tileTex,
      roughness: 0.3,
      metalness: 0.05,
    });

    // Ground & Yard Plinth
    const groundGeo = new THREE.PlaneGeometry(70, 70);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#DCE6DF',
      roughness: 0.95,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    const houseGroup = new THREE.Group();
    scene.add(houseGroup);

    // Base concrete plinth
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(10.6, 0.35, 11.4),
      new THREE.MeshStandardMaterial({ color: '#AEB8B2', roughness: 0.85 }),
    );
    plinth.position.set(0, 0.175, 0);
    plinth.receiveShadow = true;
    plinth.castShadow = true;
    houseGroup.add(plinth);

    // Ground Floor Tiled Slab (visible in interior mode)
    const groundFloorSlab = new THREE.Mesh(
      new THREE.BoxGeometry(8.6, 0.08, 8.2),
      tileMat,
    );
    groundFloorSlab.position.set(0, 0.38, -0.4);
    groundFloorSlab.receiveShadow = true;
    houseGroup.add(groundFloorSlab);

    // Ground Floor Exterior Shell
    const groundBackWall = new THREE.Mesh(
      new THREE.BoxGeometry(8.6, 3.1, 0.28),
      wallMat,
    );
    groundBackWall.position.set(0, 1.9, -4.35);
    groundBackWall.castShadow = true;
    groundBackWall.receiveShadow = true;
    houseGroup.add(groundBackWall);

    const groundLeftWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 3.1, 8.2),
      wallMat,
    );
    groundLeftWall.position.set(-4.15, 1.9, -0.4);
    groundLeftWall.castShadow = true;
    houseGroup.add(groundLeftWall);

    const groundRightWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 3.1, 8.2),
      wallMat,
    );
    groundRightWall.position.set(4.15, 1.9, -0.4);
    groundRightWall.castShadow = true;
    houseGroup.add(groundRightWall);

    // Front Facade Ground Pillars & Accent Entrance Frame
    const frontLeftWall = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 3.1, 0.3),
      wallMat,
    );
    frontLeftWall.position.set(-2.25, 1.9, 3.55);
    frontLeftWall.castShadow = true;
    houseGroup.add(frontLeftWall);

    // Large Ground Panoramic Window
    const gWindowFrame = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 2.1, 0.36),
      darkFrameMat,
    );
    gWindowFrame.position.set(-2.25, 1.75, 3.58);
    houseGroup.add(gWindowFrame);
    const gWindowGlass = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 1.9, 0.38),
      windowGlassMat,
    );
    gWindowGlass.position.set(-2.25, 1.75, 3.59);
    houseGroup.add(gWindowGlass);

    // Entrance Accent Block
    const entryAccent = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 3.1, 0.35),
      accentMat,
    );
    entryAccent.position.set(2.8, 1.9, 3.55);
    entryAccent.castShadow = true;
    houseGroup.add(entryAccent);

    // Front Door
    const frontDoorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 2.35, 0.42),
      doorMat,
    );
    frontDoorMesh.position.set(2.8, 1.55, 3.6);
    frontDoorMesh.castShadow = true;
    houseGroup.add(frontDoorMesh);

    // Interior Furniture (visible when Interior tab is selected)
    const interiorGroup = new THREE.Group();
    const sofaMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.7, 1.1),
      new THREE.MeshStandardMaterial({ color: '#3E6B53', roughness: 0.8 }),
    );
    sofaMesh.position.set(-2.0, 0.76, 0.2);
    interiorGroup.add(sofaMesh);

    const bedMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.55, 2.8),
      new THREE.MeshStandardMaterial({ color: '#E8ECEA', roughness: 0.7 }),
    );
    bedMesh.position.set(-2.1, 0.68, -2.5);
    interiorGroup.add(bedMesh);

    const kitchenCounter = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.9, 0.9),
      new THREE.MeshStandardMaterial({ color: '#2F463B', roughness: 0.4 }),
    );
    kitchenCounter.position.set(2.3, 0.86, -2.7);
    interiorGroup.add(kitchenCounter);

    const innerDivider = new THREE.Mesh(
      new THREE.BoxGeometry(8.1, 2.8, 0.18),
      wallMat,
    );
    innerDivider.position.set(0, 1.8, -0.9);
    interiorGroup.add(innerDivider);
    houseGroup.add(interiorGroup);

    // Upper Floor Shell Group (can be hidden in Interior cutaway mode)
    const upperShellGroup = new THREE.Group();
    houseGroup.add(upperShellGroup);

    // Mid-level cantilevered slab
    const midSlab = new THREE.Mesh(
      new THREE.BoxGeometry(9.4, 0.34, 9.6),
      trimMat,
    );
    midSlab.position.set(0, 3.55, 0.1);
    midSlab.castShadow = true;
    midSlab.receiveShadow = true;
    upperShellGroup.add(midSlab);

    // Upper Main Volume
    const upperMainBox = new THREE.Mesh(
      new THREE.BoxGeometry(8.2, 2.95, 7.2),
      wallMat,
    );
    upperMainBox.position.set(0.2, 5.15, -0.7);
    upperMainBox.castShadow = true;
    upperMainBox.receiveShadow = true;
    upperShellGroup.add(upperMainBox);

    // Upper Accent Balcony Box
    const upperAccentBox = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 2.95, 1.6),
      accentMat,
    );
    upperAccentBox.position.set(2.1, 5.15, 2.9);
    upperAccentBox.castShadow = true;
    upperShellGroup.add(upperAccentBox);

    // Upper Balcony Window
    const uWinFrame = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 2.1, 0.25),
      darkFrameMat,
    );
    uWinFrame.position.set(-2.1, 5.1, 2.92);
    upperShellGroup.add(uWinFrame);
    const uWinGlass = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 1.9, 0.28),
      windowGlassMat,
    );
    uWinGlass.position.set(-2.1, 5.1, 2.93);
    upperShellGroup.add(uWinGlass);

    // Balcony Glass Railing
    const balconyRail = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.9, 0.08),
      windowGlassMat,
    );
    balconyRail.position.set(-2.1, 4.15, 4.4);
    upperShellGroup.add(balconyRail);

    // Decorative Jali Screen Group
    const jaliGroup = new THREE.Group();
    jaliGroup.position.set(2.2, 5.15, 3.76);
    upperShellGroup.add(jaliGroup);

    // Roof Styles Group
    const roofGroup = new THREE.Group();
    upperShellGroup.add(roofGroup);

    const flatParapetGroup = new THREE.Group();
    const roofSlab = new THREE.Mesh(
      new THREE.BoxGeometry(9.6, 0.35, 8.8),
      trimMat,
    );
    roofSlab.position.set(0.1, 6.78, -0.2);
    roofSlab.castShadow = true;
    flatParapetGroup.add(roofSlab);
    const mumtyBox = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 1.7, 2.8),
      wallMat,
    );
    mumtyBox.position.set(-2.2, 7.75, -1.6);
    mumtyBox.castShadow = true;
    flatParapetGroup.add(mumtyBox);
    roofGroup.add(flatParapetGroup);

    const slopedRoofMesh = new THREE.Mesh(
      new THREE.ConeGeometry(6.8, 2.2, 4),
      new THREE.MeshStandardMaterial({ color: '#9E4B35', roughness: 0.7 }),
    );
    slopedRoofMesh.rotation.y = Math.PI / 4;
    slopedRoofMesh.position.set(0.1, 7.8, -0.2);
    slopedRoofMesh.visible = false;
    roofGroup.add(slopedRoofMesh);

    const pergolaGroup = new THREE.Group();
    for (let i = -3.5; i <= 3.5; i += 0.9) {
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.22, 8.6),
        new THREE.MeshStandardMaterial({ color: '#6E472B', roughness: 0.6 }),
      );
      beam.position.set(i, 7.05, 0.1);
      pergolaGroup.add(beam);
    }
    pergolaGroup.visible = false;
    roofGroup.add(pergolaGroup);

    // Front Boundary Wall & Gate Group
    const gateGroup = new THREE.Group();
    const leftBoundary = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 1.55, 0.25),
      wallMat,
    );
    leftBoundary.position.set(-3.6, 0.85, 5.55);
    leftBoundary.castShadow = true;
    gateGroup.add(leftBoundary);
    const rightBoundary = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.55, 0.25),
      wallMat,
    );
    rightBoundary.position.set(4.1, 0.85, 5.55);
    rightBoundary.castShadow = true;
    gateGroup.add(rightBoundary);

    // Gate Leaf (rebuilt/recolored dynamically)
    const gatePanel = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 1.45, 0.14),
      darkFrameMat,
    );
    gatePanel.position.set(0.4, 0.85, 5.55);
    gatePanel.name = 'gatePanel';
    gateGroup.add(gatePanel);
    houseGroup.add(gateGroup);

    // Stylized Courtyard Palm / Plant Pots (Composite 3-part foliage)
    const createPlant = (px: number, pz: number, scale = 1) => {
      const plant = new THREE.Group();
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28 * scale, 0.22 * scale, 0.45 * scale, 10),
        trimMat,
      );
      pot.position.y = 0.22 * scale;
      plant.add(pot);
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08 * scale, 0.11 * scale, 0.9 * scale, 8),
        new THREE.MeshStandardMaterial({ color: '#6B4C35', roughness: 0.9 }),
      );
      trunk.position.y = 0.7 * scale;
      plant.add(trunk);
      const crown = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.55 * scale, 1),
        new THREE.MeshStandardMaterial({ color: '#1F6F43', roughness: 0.75 }),
      );
      crown.position.y = 1.25 * scale;
      crown.castShadow = true;
      plant.add(crown);
      plant.position.set(px, 0.35, pz);
      houseGroup.add(plant);
    };
    createPlant(-4.4, 4.4, 1.35);
    createPlant(0.8, 4.3, 0.85);
    createPlant(4.3, 4.3, 0.9);

    // Coalesced On-Demand Render Scheduler (software WebGL safe)
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let isUnmounted = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (isUnmounted) return;
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

    const requestRender = () => {
      if (isUnmounted) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (isUnmounted) return;
        renderDirty = false;
        controls.update();
        renderer.render(scene, camera);
        const done = () => {
          renderBusy = false;
          if (renderDirty || controls.autoRotate) {
            requestRender();
          }
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    };

    controls.addEventListener('change', requestRender);

    const handleResize = () => {
      if (!container || isUnmounted) return;
      const w = container.clientWidth || 380;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', handleResize);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    sceneStateRef.current = {
      renderer,
      scene,
      camera,
      controls,
      requestRender,
      wallMat,
      accentMat,
      trimMat,
      doorMat,
      tileMat,
      windowGlassMat,
      roofGroup,
      upperShellGroup,
      slopedRoofMesh,
      pergolaGroup,
      flatParapetGroup,
      jaliGroup,
      gateGroup,
      sunLight,
      hemiLight,
      nightLights: [porchLight, upperLight],
    };

    requestRender();

    return () => {
      isUnmounted = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sync OrbitControls lock state (Free Plan vs Paid/Unlocked) + AutoRotate
  useEffect(() => {
    const st = sceneStateRef.current;
    if (!st.controls || !st.requestRender) return;
    st.controls.enableRotate = canCustomize;
    st.controls.enableZoom = canCustomize;
    st.controls.autoRotate = canCustomize && autoRotate;
    st.controls.autoRotateSpeed = 2.2;
    st.requestRender();
  }, [canCustomize, autoRotate]);

  // Sync Exterior / Interior Camera + Cutaway Shell
  useEffect(() => {
    const st = sceneStateRef.current;
    if (!st.upperShellGroup || !st.camera || !st.controls || !st.requestRender) return;

    if (tab === 'interior') {
      st.upperShellGroup.visible = false;
      st.camera.position.set(8.5, 11.5, 9.5);
      st.controls.target.set(0, 1.0, -0.5);
    } else {
      st.upperShellGroup.visible = true;
      st.camera.position.set(14.5, 9.5, 16.5);
      st.controls.target.set(0, 2.4, 0);
    }
    st.requestRender();
  }, [tab]);

  // Sync Visual Customization Draft to 3D Materials & Geometry
  useEffect(() => {
    const st = sceneStateRef.current;
    if (
      !st.scene ||
      !st.wallMat ||
      !st.accentMat ||
      !st.trimMat ||
      !st.doorMat ||
      !st.tileMat ||
      !st.windowGlassMat ||
      !st.jaliGroup ||
      !st.slopedRoofMesh ||
      !st.pergolaGroup ||
      !st.flatParapetGroup ||
      !st.sunLight ||
      !st.hemiLight ||
      !st.requestRender
    ) {
      return;
    }

    const swatch =
      WALL_COLOR_SWATCHES.find((s) => s.id === draft.wallColor) ||
      WALL_COLOR_SWATCHES[0];

    st.accentMat.color.set(swatch.hex);
    st.wallMat.color.set(
      draft.wallColor === 'classic-white' ? '#F8F9F8' : '#F3F6F4',
    );
    st.trimMat.color.set(draft.trimJaliWhite ? '#FFFFFF' : '#CBD6CF');
    st.doorMat.color.setHex(DOOR_COLORS[draft.frontDoor]);
    st.tileMat.color.set(TILE_COLORS[draft.floorTiles]);

    // Roof style visibility
    st.slopedRoofMesh.visible = draft.roofStyle === 'Terracotta Slope';
    st.pergolaGroup.visible = draft.roofStyle === 'Pergola Terrace';
    st.flatParapetGroup.visible = draft.roofStyle !== 'Terracotta Slope';

    // Rebuild Jali pattern dynamically
    while (st.jaliGroup.children.length > 0) {
      const child = st.jaliGroup.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      st.jaliGroup.remove(child);
    }
    const jaliColor = draft.trimJaliWhite ? '#FFFFFF' : '#1E3D2E';
    const jaliMat = new THREE.MeshStandardMaterial({
      color: jaliColor,
      roughness: 0.45,
      metalness: 0.15,
    });
    const count = draft.jaliDesign === 'Vertical Louvers' ? 7 : 5;
    for (let i = 0; i < count; i++) {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 2.3, 0.08),
        jaliMat,
      );
      bar.position.x = -0.8 + (i / (count - 1)) * 1.6;
      st.jaliGroup.add(bar);
    }
    if (draft.jaliDesign !== 'Vertical Louvers') {
      for (let j = 0; j < 4; j++) {
        const cross = new THREE.Mesh(
          new THREE.BoxGeometry(1.75, 0.09, 0.08),
          jaliMat,
        );
        cross.position.y = -0.9 + (j / 3) * 1.8;
        st.jaliGroup.add(cross);
      }
    }

    // Gate design style
    if (st.gateGroup) {
      const gatePanel = st.gateGroup.getObjectByName('gatePanel') as THREE.Mesh | undefined;
      if (gatePanel) {
        const gMat = gatePanel.material as THREE.MeshStandardMaterial;
        if (draft.gateDesign === 'Royal Arch Iron') {
          gMat.color.set('#1C2621');
          gMat.metalness = 0.8;
        } else if (draft.gateDesign === 'Minimal Laser-Cut') {
          gMat.color.set('#2F6B4E');
          gMat.metalness = 0.4;
        } else {
          gMat.color.set('#3A3F3D');
          gMat.metalness = 0.6;
        }
      }
    }

    // Day / Night Mode
    if (draft.nightMode) {
      st.scene.background = new THREE.Color('#102119');
      if (st.scene.fog instanceof THREE.Fog) {
        st.scene.fog.color.set('#102119');
      }
      st.sunLight.intensity = 0.35;
      st.sunLight.color.set('#93B5E1');
      st.hemiLight.intensity = 0.28;
      st.windowGlassMat.emissiveIntensity = 1.4;
      st.nightLights?.forEach((l) => {
        l.intensity = 6;
      });
    } else {
      st.scene.background = new THREE.Color('#EEF4F0');
      if (st.scene.fog instanceof THREE.Fog) {
        st.scene.fog.color.set('#EEF4F0');
      }
      st.sunLight.intensity = 1.8;
      st.sunLight.color.set('#FFF5E4');
      st.hemiLight.intensity = 0.75;
      st.windowGlassMat.emissiveIntensity = 0;
      st.nightLights?.forEach((l) => {
        l.intensity = 0;
      });
    }

    st.requestRender();
  }, [draft]);

  const handleZoom = (direction: 'in' | 'out') => {
    if (!canCustomize) {
      onUpgradeRequest();
      return;
    }
    const st = sceneStateRef.current;
    if (!st.camera || !st.controls || !st.requestRender) return;
    const offset = st.camera.position.clone().sub(st.controls.target);
    const factor = direction === 'in' ? 0.85 : 1.18;
    const newLen = THREE.MathUtils.clamp(offset.length() * factor, 9, 30);
    offset.setLength(newLen);
    st.camera.position.copy(st.controls.target).add(offset);
    st.requestRender();
  };

  const handleAiRecolor = () => {
    if (!canCustomize) {
      onUpgradeRequest();
      return;
    }
    const palettes: Partial<HouseCustomization>[] = [
      {
        wallColor: 'forest-green',
        trimJaliWhite: true,
        frontDoor: 'Walnut Timber',
        jaliDesign: 'Geometric Moroccan',
      },
      {
        wallColor: 'sand',
        trimJaliWhite: true,
        frontDoor: 'Walnut Timber',
        roofStyle: 'Pergola Terrace',
      },
      {
        wallColor: 'sage',
        trimJaliWhite: true,
        frontDoor: 'Forest Green Steel',
        floorTiles: 'Terrazzo Mint',
      },
      {
        wallColor: 'concrete-grey',
        trimJaliWhite: false,
        frontDoor: 'Glass Pivot',
        roofStyle: 'Flat Modern Parapet',
      },
    ];
    const currentIdx = palettes.findIndex((p) => p.wallColor === draft.wallColor);
    const next = palettes[(currentIdx + 1) % palettes.length];
    setDraft((prev) => ({ ...prev, ...next }));
    onShowToast('AI suggested a curated Pakistani elevation palette!');
  };

  const handleApplyChanges = () => {
    if (!canCustomize) {
      onUpgradeRequest();
      return;
    }
    onUpdateCustomization(draft);
    onShowToast('3D House customization saved to project!');
  };

  const updateDraft = <K extends keyof HouseCustomization>(
    key: K,
    val: HouseCustomization[K],
  ) => {
    if (!canCustomize && key !== 'nightMode') {
      onUpgradeRequest();
      return;
    }
    setDraft((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-4">
      {/* Header matching Screenshot 3 */}
      <div className="bg-white border border-[#DCE8E1] rounded-2xl px-4 py-3 flex items-center justify-between gap-2 shadow-xs">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl hover:bg-[#E7F6EE] flex items-center justify-center text-[#112A1E]"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base sm:text-lg font-extrabold text-[#112A1E]">3D House View</h1>
        <button
          type="button"
          onClick={onSwitchTo2D}
          className="px-3 py-1.5 rounded-xl bg-[#E7F6EE] text-[#0E9F5D] text-xs font-bold hover:bg-[#D5EFE1] transition-colors"
        >
          2D Plan
        </button>
      </div>

      {/* Main Split: 3D Viewport + Customization Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* 3D WebGL Viewport */}
        <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-[#DCE8E1] bg-[#EEF4F0] shadow-xs">
          {/* Top Overlay Brand + Day/Night + 360 AutoRotate */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-xl border border-[#DCE8E1] pointer-events-auto">
              <Logo size={24} />
              <span className="text-xs font-extrabold text-[#0E9F5D]">GharMap AI</span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => updateDraft('nightMode', !draft.nightMode)}
                aria-label="Toggle Day or Night Mode"
                className="w-11 h-11 rounded-full bg-white border border-[#DCE8E1] shadow-xs flex items-center justify-center text-[#112A1E] hover:border-[#0E9F5D]"
              >
                {draft.nightMode ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-[#112A1E]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!canCustomize) {
                    onUpgradeRequest();
                    return;
                  }
                  setAutoRotate((r) => !r);
                }}
                aria-label="Toggle 360 Auto Rotate"
                className={`w-11 h-11 rounded-full border shadow-xs flex items-center justify-center transition-colors ${
                  autoRotate
                    ? 'bg-[#0E9F5D] text-white border-[#0E9F5D]'
                    : 'bg-white text-[#112A1E] border-[#DCE8E1]'
                }`}
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Dedicated WebGL Mount Container (never inside blur) */}
          <div ref={mountRef} className="w-full h-[360px] sm:h-[440px]" />

          {/* Zoom Controls (+ / -) */}
          <div className="absolute right-3 bottom-14 z-10 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleZoom('in')}
              aria-label="Zoom In"
              className="w-11 h-11 rounded-2xl bg-white border border-[#DCE8E1] shadow-sm flex items-center justify-center text-[#112A1E] hover:border-[#0E9F5D]"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom('out')}
              aria-label="Zoom Out"
              className="w-11 h-11 rounded-2xl bg-white border border-[#DCE8E1] shadow-sm flex items-center justify-center text-[#112A1E] hover:border-[#0E9F5D]"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Interaction Hint or Free-Plan Lock Bar */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex justify-center pointer-events-none">
            {canCustomize ? (
              <div className="bg-white/95 border border-[#DCE8E1] rounded-full px-4 py-1.5 text-xs font-semibold text-[#112A1E] flex items-center gap-2 shadow-xs">
                <RotateCw className="w-3.5 h-3.5 text-[#0E9F5D]" />
                <span>Drag to rotate 360° · Pinch or scroll to zoom</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onUpgradeRequest}
                className="pointer-events-auto bg-[#112A1E] text-white rounded-full px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-md hover:bg-[#0E9F5D] transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sample 3D Preview · Unlock 360° Rotation in Pro</span>
              </button>
            )}
          </div>
        </div>

        {/* Customization Controls Panel matching Screenshot 3 */}
        <div className="lg:col-span-5 bg-white border border-[#DCE8E1] rounded-3xl p-5 shadow-xs space-y-5">
          {/* Exterior / Interior Segmented Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F0F4F1] rounded-2xl">
            <button
              type="button"
              onClick={() => setTab('exterior')}
              className={`min-h-[42px] rounded-xl text-sm font-bold transition-colors ${
                tab === 'exterior'
                  ? 'bg-[#0E9F5D] text-white shadow-xs'
                  : 'text-[#405B4D] hover:text-[#112A1E]'
              }`}
            >
              Exterior
            </button>
            <button
              type="button"
              onClick={() => setTab('interior')}
              className={`min-h-[42px] rounded-xl text-sm font-bold transition-colors ${
                tab === 'interior'
                  ? 'bg-[#0E9F5D] text-white shadow-xs'
                  : 'text-[#405B4D] hover:text-[#112A1E]'
              }`}
            >
              Interior
            </button>
          </div>

          {/* Color Picker Swatches */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-extrabold text-[#112A1E]">Color Picker</h2>
                <Sparkles className="w-4 h-4 text-[#0E9F5D]" />
              </div>
              <span className="text-[11px] font-semibold bg-[#E7F6EE] text-[#0E9F5D] px-2.5 py-1 rounded-lg">
                AI Suggested
              </span>
            </div>
            <p className="text-xs text-[#546E60] mb-3">
              {tab === 'exterior'
                ? 'Exterior · Wall Paint & Elevation'
                : 'Interior · Accent Wall & Floor Finish'}
            </p>

            <div className="grid grid-cols-5 gap-2">
              {WALL_COLOR_SWATCHES.map((sw) => {
                const selected = draft.wallColor === sw.id;
                return (
                  <button
                    key={sw.id}
                    type="button"
                    onClick={() => updateDraft('wallColor', sw.id as WallColorId)}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border-2 ${
                        selected
                          ? 'border-[#0E9F5D] ring-2 ring-[#0E9F5D]/30 scale-105'
                          : 'border-[#DCE8E1] group-hover:border-[#0E9F5D]/50'
                      }`}
                      style={{ backgroundColor: sw.hex }}
                    >
                      {selected && (
                        <Check
                          className={`w-5 h-5 ${
                            sw.id === 'classic-white' ? 'text-[#0E9F5D]' : 'text-white'
                          }`}
                        />
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-[#112A1E] text-center leading-tight">
                      {sw.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Controls */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-extrabold text-[#112A1E]">Details</h3>

            {/* Trim & Jali White Toggle */}
            <div className="bg-[#F6F9F7] border border-[#E2ECE6] rounded-2xl px-3.5 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-[#112A1E]">
                <Paintbrush className="w-4 h-4 text-[#0E9F5D]" />
                <span>Trim & Jali - White</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={draft.trimJaliWhite}
                onClick={() => updateDraft('trimJaliWhite', !draft.trimJaliWhite)}
                className={`w-12 h-7 rounded-full p-0.5 transition-colors flex items-center ${
                  draft.trimJaliWhite ? 'bg-[#0E9F5D] justify-end' : 'bg-[#C5D2CB] justify-start'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white shadow-xs" />
              </button>
            </div>

            {/* Front Door Selector */}
            <div className="bg-[#F6F9F7] border border-[#E2ECE6] rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#112A1E]">
                <DoorOpen className="w-4 h-4 text-[#0E9F5D] shrink-0" />
                <span>Front Door</span>
              </div>
              <select
                value={draft.frontDoor}
                onChange={(e) =>
                  updateDraft(
                    'frontDoor',
                    e.target.value as HouseCustomization['frontDoor'],
                  )
                }
                className="bg-white border border-[#DCE8E1] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#112A1E] focus:outline-none focus:ring-2 focus:ring-[#0E9F5D]"
              >
                <option value="Forest Green Steel">Forest Green Steel</option>
                <option value="Walnut Timber">Walnut Timber</option>
                <option value="Glass Pivot">Glass Pivot</option>
              </select>
            </div>

            {/* Gate Design Selector */}
            <div className="bg-[#F6F9F7] border border-[#E2ECE6] rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#112A1E]">
                <Grid className="w-4 h-4 text-[#0E9F5D] shrink-0" />
                <span>Gate Design</span>
              </div>
              <select
                value={draft.gateDesign}
                onChange={(e) =>
                  updateDraft(
                    'gateDesign',
                    e.target.value as HouseCustomization['gateDesign'],
                  )
                }
                className="bg-white border border-[#DCE8E1] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#112A1E] focus:outline-none focus:ring-2 focus:ring-[#0E9F5D]"
              >
                <option value="Modern Slatted">Modern Slatted</option>
                <option value="Royal Arch Iron">Royal Arch Iron</option>
                <option value="Minimal Laser-Cut">Minimal Laser-Cut</option>
              </select>
            </div>

            {/* Roof Style Selector */}
            <div className="bg-[#F6F9F7] border border-[#E2ECE6] rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#112A1E]">
                <Home className="w-4 h-4 text-[#0E9F5D] shrink-0" />
                <span>Roof Style</span>
              </div>
              <select
                value={draft.roofStyle}
                onChange={(e) =>
                  updateDraft(
                    'roofStyle',
                    e.target.value as HouseCustomization['roofStyle'],
                  )
                }
                className="bg-white border border-[#DCE8E1] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#112A1E] focus:outline-none focus:ring-2 focus:ring-[#0E9F5D]"
              >
                <option value="Flat Modern Parapet">Flat Modern Parapet</option>
                <option value="Terracotta Slope">Terracotta Slope</option>
                <option value="Pergola Terrace">Pergola Terrace</option>
              </select>
            </div>

            {/* Jali Design & Floor Tiles */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#F6F9F7] border border-[#E2ECE6] rounded-2xl p-2.5">
                <label className="block text-[11px] font-semibold text-[#546E60] mb-1">
                  Jali Design
                </label>
                <select
                  value={draft.jaliDesign}
                  onChange={(e) =>
                    updateDraft(
                      'jaliDesign',
                      e.target.value as HouseCustomization['jaliDesign'],
                    )
                  }
                  className="w-full bg-white border border-[#DCE8E1] rounded-xl px-2 py-1.5 text-xs font-bold text-[#112A1E]"
                >
                  <option value="Geometric Moroccan">Geometric Moroccan</option>
                  <option value="Floral Lattice">Floral Lattice</option>
                  <option value="Vertical Louvers">Vertical Louvers</option>
                </select>
              </div>
              <div className="bg-[#F6F9F7] border border-[#E2ECE6] rounded-2xl p-2.5">
                <label className="block text-[11px] font-semibold text-[#546E60] mb-1">
                  Floor Tiles
                </label>
                <select
                  value={draft.floorTiles}
                  onChange={(e) =>
                    updateDraft(
                      'floorTiles',
                      e.target.value as HouseCustomization['floorTiles'],
                    )
                  }
                  className="w-full bg-white border border-[#DCE8E1] rounded-xl px-2 py-1.5 text-xs font-bold text-[#112A1E]"
                >
                  <option value="Marble White">Marble White</option>
                  <option value="Travertine Beige">Travertine Beige</option>
                  <option value="Charcoal Slate">Charcoal Slate</option>
                  <option value="Terrazzo Mint">Terrazzo Mint</option>
                </select>
              </div>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={handleApplyChanges}
              className="w-full min-h-[48px] rounded-2xl bg-[#0E9F5D] hover:bg-[#0A7D49] text-white font-bold text-sm shadow-xs transition-colors"
            >
              Apply Changes
            </button>
            <button
              type="button"
              onClick={handleAiRecolor}
              className="w-full min-h-[46px] rounded-2xl bg-white border border-[#0E9F5D] text-[#0E9F5D] hover:bg-[#E7F6EE] font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Recolor Suggestion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
