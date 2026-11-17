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
  Check,
  Paintbrush,
  Layers,
} from 'lucide-react';
import { WALL_COLOR_SWATCHES } from '../data/constants';
import {
  HouseCustomization,
  Language,
  Project,
  WallColorId,
} from '../types/gharmap';
import { Logo } from './Logo';

interface House3DViewScreenProps {
  language: Language;
  project: Project;
  onBack: () => void;
  onSwitchTo2D: () => void;
  onUpdateCustomization: (c: HouseCustomization) => void;
  onShowToast: (msg: string) => void;
}

const TILE_COLORS: Record<HouseCustomization['floorTiles'], string> = {
  'Italian Marble': '#ECEEEB',
  'Warm Oak Wood': '#B58456',
  'Travertine Beige': '#D9C8AF',
  'Charcoal Slate': '#3E4644',
  'Terrazzo Mint': '#C7E0D1',
};

const DOOR_COLORS: Record<HouseCustomization['frontDoor'], number> = {
  'Walnut Timber': 0x6b3e26,
  'Emerald Steel': 0x166341,
  'Double Glass Pivot': 0x29434d,
};

const CLADDING_COLORS: Record<HouseCustomization['exteriorCladding'], string> = {
  'Smooth Stucco': '#F4EFE6',
  'Architectural Brick': '#9F4E3B',
  'Travertine Stone': '#DDD1BE',
  'Timber Louvers': '#8B5D3B',
  'Glass Curtain': '#5E8799',
};

export const House3DViewScreen: React.FC<House3DViewScreenProps> = ({
  project,
  onBack,
  onSwitchTo2D,
  onUpdateCustomization,
  onShowToast,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [tab, setTab] = useState<'exterior' | 'interior'>('exterior');
  const [draft, setDraft] = useState<HouseCustomization>(project.customization);
  const [autoRotate, setAutoRotate] = useState(false);
  const [activeFloorSlice, setActiveFloorSlice] = useState<number>(1);

  const activeVariation =
    project.variations.find((v) => v.id === project.selectedVariationId) ||
    project.variations[0];

  useEffect(() => {
    setDraft(project.customization);
  }, [project.id, project.customization]);

  const threeRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    controls?: OrbitControls;
    dynamicGroup?: THREE.Group;
    sunLight?: THREE.DirectionalLight;
    hemiLight?: THREE.HemisphereLight;
    requestRender?: () => void;
  }>({});

  // Initialize Three.js WebGL once
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

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#8AC0E6');
    scene.fog = new THREE.Fog('#A8D2EE', 45, 110);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 180);
    camera.position.set(17, 13, 21);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2.5, 0);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 8;
    controls.maxDistance = 48;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.minPolarAngle = 0.12;

    const hemiLight = new THREE.HemisphereLight(0xdff3ff, 0x4b6b45, 0.72);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff4de, 1.9);
    sunLight.position.set(18, 26, 16);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.left = -22;
    sunLight.shadow.camera.right = 22;
    sunLight.shadow.camera.top = 22;
    sunLight.shadow.camera.bottom = -22;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xc2e6ff, 0.5);
    rimLight.position.set(-16, 10, -18);
    scene.add(rimLight);

    // Rich Landscape Ground + Asphalt Street + Sidewalk (high contrast vs building)
    const lawn = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 140),
      new THREE.MeshStandardMaterial({ color: '#58854E', roughness: 0.92 }),
    );
    lawn.rotation.x = -Math.PI / 2;
    lawn.receiveShadow = true;
    scene.add(lawn);

    const road = new THREE.Mesh(
      new THREE.BoxGeometry(120, 0.06, 7.5),
      new THREE.MeshStandardMaterial({ color: '#394147', roughness: 0.85 }),
    );
    road.position.set(0, 0.03, 14.5);
    road.receiveShadow = true;
    scene.add(road);

    const sidewalk = new THREE.Mesh(
      new THREE.BoxGeometry(120, 0.12, 2.2),
      new THREE.MeshStandardMaterial({ color: '#C2C8C4', roughness: 0.8 }),
    );
    sidewalk.position.set(0, 0.06, 9.8);
    sidewalk.receiveShadow = true;
    scene.add(sidewalk);

    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);

    // Coalesced On-Demand Render Loop
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
          if (renderDirty || controls.autoRotate) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    };

    controls.addEventListener('change', requestRender);

    const handleResize = () => {
      if (!container || isUnmounted) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', handleResize);

    if (!isSoftwareGl) renderer.compile(scene, camera);

    threeRef.current = {
      renderer,
      scene,
      camera,
      controls,
      dynamicGroup,
      sunLight,
      hemiLight,
      requestRender,
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

  // Rebuild Exact 1:1 3D Model whenever active 2D variation, plot sides, floors, customization, or tab changes!
  useEffect(() => {
    const st = threeRef.current;
    if (!st.scene || !st.dynamicGroup || !st.sunLight || !st.hemiLight || !st.requestRender) return;

    const grp = st.dynamicGroup;
    while (grp.children.length > 0) {
      const obj = grp.children[0];
      obj.traverse((c) => {
        if (c instanceof THREE.Mesh) {
          c.geometry.dispose();
          if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
          else c.material.dispose();
        }
      });
      grp.remove(obj);
    }

    // Day / Night atmosphere
    if (draft.nightMode) {
      st.scene.background = new THREE.Color('#0B1726');
      if (st.scene.fog instanceof THREE.Fog) st.scene.fog.color.set('#0B1726');
      st.sunLight.intensity = 0.32;
      st.sunLight.color.set('#8EB3E6');
      st.hemiLight.intensity = 0.25;
    } else {
      st.scene.background = new THREE.Color('#8AC0E6');
      if (st.scene.fog instanceof THREE.Fog) st.scene.fog.color.set('#A8D2EE');
      st.sunLight.intensity = 1.9;
      st.sunLight.color.set('#FFF4DE');
      st.hemiLight.intensity = 0.72;
    }

    const { frontWidth, backWidth, leftLength, rightLength } = project.plot.sides;
    const maxW = Math.max(frontWidth, backWidth);
    const maxL = Math.max(leftLength, rightLength);
    // Normalize plot into ~14 scene units max span
    const scale = 14 / Math.max(maxW, maxL, 30);
    const halfW = (maxW * scale) / 2;
    const halfL = (maxL * scale) / 2;

    const swatch =
      WALL_COLOR_SWATCHES.find((s) => s.id === draft.wallColor) ||
      WALL_COLOR_SWATCHES[0];

    const mainWallMat = new THREE.MeshStandardMaterial({
      color: swatch.hex,
      roughness: 0.72,
      metalness: 0.05,
    });
    const cladMat = new THREE.MeshStandardMaterial({
      color: CLADDING_COLORS[draft.exteriorCladding],
      roughness: draft.exteriorCladding === 'Glass Curtain' ? 0.15 : 0.78,
      metalness: draft.exteriorCladding === 'Glass Curtain' ? 0.45 : 0.05,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: draft.trimWhite ? '#F5F7F5' : '#2C3732',
      roughness: 0.45,
    });
    const doorMat = new THREE.MeshStandardMaterial({
      color: DOOR_COLORS[draft.frontDoor],
      roughness: 0.42,
      metalness: 0.15,
    });
    const frameMat = new THREE.MeshStandardMaterial({
      color: '#1E2723',
      roughness: 0.35,
      metalness: 0.65,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#95C2D6',
      roughness: 0.1,
      metalness: 0.15,
      transparent: true,
      opacity: 0.72,
      emissive: new THREE.Color(draft.nightMode ? '#FFC86B' : '#000000'),
      emissiveIntensity: draft.nightMode ? 1.3 : 0,
    });

    // Procedural floor tile texture
    const tCanvas = document.createElement('canvas');
    tCanvas.width = 256;
    tCanvas.height = 256;
    const tCtx = tCanvas.getContext('2d');
    if (tCtx) {
      tCtx.fillStyle = TILE_COLORS[draft.floorTiles];
      tCtx.fillRect(0, 0, 256, 256);
      tCtx.strokeStyle = 'rgba(20,30,25,0.16)';
      tCtx.lineWidth = 2;
      for (let i = 0; i <= 256; i += 64) {
        tCtx.beginPath();
        tCtx.moveTo(i, 0);
        tCtx.lineTo(i, 256);
        tCtx.stroke();
        tCtx.beginPath();
        tCtx.moveTo(0, i);
        tCtx.lineTo(256, i);
        tCtx.stroke();
      }
    }
    const tileTex = new THREE.CanvasTexture(tCanvas);
    tileTex.colorSpace = THREE.SRGBColorSpace;
    tileTex.wrapS = THREE.RepeatWrapping;
    tileTex.wrapT = THREE.RepeatWrapping;
    tileTex.repeat.set(5, 5);
    const tileMat = new THREE.MeshStandardMaterial({
      map: tileTex,
      roughness: 0.32,
      metalness: 0.08,
    });

    // 1. Custom 4-Sided Irregular Plot Plinth via ExtrudeGeometry!
    const backHalfW = (backWidth * scale) / 2;
    const frontHalfW = (frontWidth * scale) / 2;
    const leftZ = (leftLength * scale) / 2;
    const rightZ = (rightLength * scale) / 2;

    const plotShape = new THREE.Shape();
    plotShape.moveTo(-backHalfW, -halfL);
    plotShape.lineTo(backHalfW, -halfL);
    plotShape.lineTo(frontHalfW, rightZ);
    plotShape.lineTo(-frontHalfW, leftZ);
    plotShape.closePath();

    const plinthGeo = new THREE.ExtrudeGeometry(plotShape, {
      depth: 0.28,
      bevelEnabled: false,
    });
    plinthGeo.rotateX(Math.PI / 2);
    const plinth = new THREE.Mesh(
      plinthGeo,
      new THREE.MeshStandardMaterial({ color: '#9DA8A1', roughness: 0.88 }),
    );
    plinth.position.y = 0.28;
    plinth.receiveShadow = true;
    plinth.castShadow = true;
    grp.add(plinth);

    const floorCount = Math.max(1, Math.min(6, project.plot.infrastructure.currentFloors));
    const isCommercial =
      project.plot.category === 'Commercial Market' ||
      project.plot.category === 'Multi-Story Building' ||
      project.plot.category === 'Mixed-Use Infrastructure';

    const storyH = isCommercial ? 2.9 : 2.55;
    const visibleFloors =
      tab === 'interior' ? Math.min(activeFloorSlice, floorCount) : floorCount;

    // 2. Build Each Floor Directly From Selected 2D Variation Rooms!
    for (let f = 0; f < visibleFloors; f++) {
      const floorBaseY = 0.28 + f * storyH;
      const isTopVisibleFloor = f === visibleFloors - 1;
      const showInteriorHere = tab === 'interior' && isTopVisibleFloor;

      // Floor slab
      const slabMesh = new THREE.Mesh(
        new THREE.BoxGeometry(maxW * scale + 0.3, 0.18, maxL * scale + 0.3),
        f === 0 ? tileMat : trimMat,
      );
      slabMesh.position.set(0, floorBaseY + 0.05, 0);
      slabMesh.receiveShadow = true;
      grp.add(slabMesh);

      activeVariation.rooms.forEach((rm, rIdx) => {
        const rx = (rm.x + rm.w / 2) * scale - halfW;
        const rz = (rm.y + rm.h / 2) * scale - halfL;
        const rw = Math.max(0.8, rm.w * scale);
        const rd = Math.max(0.8, rm.h * scale);
        const wallH = showInteriorHere ? storyH * 0.62 : storyH - 0.18;
        const wallThick = Math.max(0.12, (rm.wallThicknessIn / 12) * scale * 0.7);

        if (rm.type === 'sehan') {
          // Open Courtyard / Atrium with greenery + pergola beams on top
          const yardFloor = new THREE.Mesh(
            new THREE.BoxGeometry(rw - 0.1, 0.08, rd - 0.1),
            new THREE.MeshStandardMaterial({ color: '#6E9A62', roughness: 0.9 }),
          );
          yardFloor.position.set(rx, floorBaseY + 0.14, rz);
          grp.add(yardFloor);

          if (f === 0) {
            const bush = new THREE.Mesh(
              new THREE.DodecahedronGeometry(0.45, 1),
              new THREE.MeshStandardMaterial({ color: '#276B3E', roughness: 0.75 }),
            );
            bush.position.set(rx - rw * 0.22, floorBaseY + 0.55, rz);
            bush.castShadow = true;
            grp.add(bush);
          }
          return;
        }

        // Floor tile inside room when inspecting interior
        if (showInteriorHere) {
          const roomTile = new THREE.Mesh(
            new THREE.BoxGeometry(rw - 0.14, 0.04, rd - 0.14),
            tileMat,
          );
          roomTile.position.set(rx, floorBaseY + 0.16, rz);
          roomTile.receiveShadow = true;
          grp.add(roomTile);
        }

        // Build 4 perimeter walls of the room (or low cutaway walls in interior mode)
        const useAccentWall = rIdx % 2 === 0 ? mainWallMat : cladMat;
        const nWall = new THREE.Mesh(
          new THREE.BoxGeometry(rw, wallH, wallThick),
          useAccentWall,
        );
        nWall.position.set(rx, floorBaseY + wallH / 2 + 0.1, rz - rd / 2 + wallThick / 2);
        nWall.castShadow = true;
        nWall.receiveShadow = true;
        grp.add(nWall);

        const sWall = new THREE.Mesh(
          new THREE.BoxGeometry(rw, wallH, wallThick),
          useAccentWall,
        );
        sWall.position.set(rx, floorBaseY + wallH / 2 + 0.1, rz + rd / 2 - wallThick / 2);
        sWall.castShadow = true;
        grp.add(sWall);

        const wWall = new THREE.Mesh(
          new THREE.BoxGeometry(wallThick, wallH, rd),
          useAccentWall,
        );
        wWall.position.set(rx - rw / 2 + wallThick / 2, floorBaseY + wallH / 2 + 0.1, rz);
        wWall.castShadow = true;
        grp.add(wWall);

        const eWall = new THREE.Mesh(
          new THREE.BoxGeometry(wallThick, wallH, rd),
          useAccentWall,
        );
        eWall.position.set(rx + rw / 2 - wallThick / 2, floorBaseY + wallH / 2 + 0.1, rz);
        eWall.castShadow = true;
        grp.add(eWall);

        // Exterior Windows / Commercial Storefront Glass on Front/Back rooms
        if (!showInteriorHere && (rm.type === 'bedroom' || rm.type === 'shop' || rm.type === 'lounge' || rm.type === 'lobby')) {
          const winW = Math.min(rw * 0.62, isCommercial ? rw * 0.78 : 2.1);
          const winH = isCommercial ? wallH * 0.68 : wallH * 0.52;
          const winFrame = new THREE.Mesh(
            new THREE.BoxGeometry(winW + 0.16, winH + 0.16, 0.24),
            frameMat,
          );
          winFrame.position.set(rx, floorBaseY + wallH * 0.54, rz + rd / 2 + 0.02);
          grp.add(winFrame);

          const winGlass = new THREE.Mesh(
            new THREE.BoxGeometry(winW, winH, 0.28),
            glassMat,
          );
          winGlass.position.set(rx, floorBaseY + wallH * 0.54, rz + rd / 2 + 0.03);
          grp.add(winGlass);
        }

        // Front Door on Ground Floor Baramda / Lobby / Garage
        if (f === 0 && (rm.type === 'baramda' || rm.type === 'lobby' || rm.type === 'garage')) {
          const doorW = rm.type === 'garage' ? Math.min(rw * 0.6, 2.2) : 0.95;
          const doorH = wallH * 0.76;
          const doorMesh = new THREE.Mesh(
            new THREE.BoxGeometry(doorW, doorH, 0.28),
            rm.type === 'garage' ? frameMat : doorMat,
          );
          doorMesh.position.set(rx, floorBaseY + doorH / 2 + 0.14, rz + rd / 2 + 0.04);
          grp.add(doorMesh);
        }

        // Detailed 3D Interior Furniture when Interior Tab is active!
        if (showInteriorHere) {
          const furnWoodMat = new THREE.MeshStandardMaterial({
            color: draft.furnitureStyle === 'Classic Luxury' ? '#5E3A24' : '#8E6B4B',
            roughness: 0.6,
          });
          const fabricMat = new THREE.MeshStandardMaterial({
            color:
              draft.furnitureStyle === 'Commercial Retail'
                ? '#2B5B45'
                : draft.furnitureStyle === 'Executive Office'
                  ? '#38464E'
                  : '#4E7A62',
            roughness: 0.85,
          });

          if (rm.type === 'bedroom') {
            const bedFrame = new THREE.Mesh(
              new THREE.BoxGeometry(Math.min(1.5, rw * 0.55), 0.34, Math.min(1.8, rd * 0.55)),
              furnWoodMat,
            );
            bedFrame.position.set(rx, floorBaseY + 0.34, rz - rd * 0.1);
            grp.add(bedFrame);

            const mattress = new THREE.Mesh(
              new THREE.BoxGeometry(Math.min(1.4, rw * 0.5), 0.18, Math.min(1.7, rd * 0.5)),
              new THREE.MeshStandardMaterial({ color: '#F6F4EF', roughness: 0.8 }),
            );
            mattress.position.set(rx, floorBaseY + 0.52, rz - rd * 0.1);
            grp.add(mattress);
          } else if (rm.type === 'lounge' || rm.type === 'lobby') {
            const sofa = new THREE.Mesh(
              new THREE.BoxGeometry(Math.min(2.1, rw * 0.58), 0.48, 0.8),
              fabricMat,
            );
            sofa.position.set(rx, floorBaseY + 0.4, rz - rd * 0.15);
            grp.add(sofa);
            const table = new THREE.Mesh(
              new THREE.BoxGeometry(1.0, 0.28, 0.55),
              furnWoodMat,
            );
            table.position.set(rx, floorBaseY + 0.3, rz + rd * 0.12);
            grp.add(table);
          } else if (rm.type === 'kitchen') {
            const counterColor =
              draft.kitchenFinish === 'Matte Emerald'
                ? '#1F5C40'
                : draft.kitchenFinish === 'White Carrara'
                  ? '#F2F4F2'
                  : '#5C3D28';
            const counter = new THREE.Mesh(
              new THREE.BoxGeometry(rw * 0.72, 0.65, 0.65),
              new THREE.MeshStandardMaterial({ color: counterColor, roughness: 0.45 }),
            );
            counter.position.set(rx, floorBaseY + 0.48, rz - rd * 0.25);
            grp.add(counter);
          } else if (rm.type === 'washroom') {
            const vanityColor =
              draft.washroomDesign === 'Dark Slate & Brass' ? '#2B3230' : '#E8ECEA';
            const vanity = new THREE.Mesh(
              new THREE.BoxGeometry(rw * 0.5, 0.55, 0.5),
              new THREE.MeshStandardMaterial({ color: vanityColor, roughness: 0.3 }),
            );
            vanity.position.set(rx, floorBaseY + 0.42, rz - rd * 0.2);
            grp.add(vanity);
          } else if (rm.type === 'shop') {
            const rack = new THREE.Mesh(
              new THREE.BoxGeometry(rw * 0.6, 0.75, 0.55),
              furnWoodMat,
            );
            rack.position.set(rx, floorBaseY + 0.54, rz);
            grp.add(rack);
          }

          // Warm interior lighting bulb per room when Night or Warm lighting selected
          if (draft.nightMode || draft.interiorLighting === 'Warm 3000K Chandeliers') {
            const bulb = new THREE.PointLight(
              draft.interiorLighting === 'Cool 5000K Recessed' ? 0xe0f2ff : 0xffcb78,
              draft.nightMode ? 3.5 : 1.1,
              6,
            );
            bulb.position.set(rx, floorBaseY + wallH * 0.9, rz);
            grp.add(bulb);
          }
        }
      });

      // Balcony Slab + Railing on upper floors in Exterior Mode
      if (tab === 'exterior' && f > 0) {
        const balcSlab = new THREE.Mesh(
          new THREE.BoxGeometry(maxW * scale + 0.5, 0.16, 1.3),
          trimMat,
        );
        balcSlab.position.set(0, floorBaseY, halfL + 0.55);
        balcSlab.castShadow = true;
        grp.add(balcSlab);

        const railMat =
          draft.balconyRailing === 'Tempered Glass'
            ? glassMat
            : new THREE.MeshStandardMaterial({ color: '#1F2924', metalness: 0.7, roughness: 0.3 });
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(maxW * scale + 0.4, 0.68, 0.08),
          railMat,
        );
        rail.position.set(0, floorBaseY + 0.42, halfL + 1.12);
        grp.add(rail);
      }
    }

    // 3. Roof Geometry (Hidden in Interior Cutaway Mode)
    if (tab === 'exterior') {
      const roofY = 0.28 + visibleFloors * storyH;
      if (draft.roofStyle === 'Pitched Architectural') {
        const pitch = new THREE.Mesh(
          new THREE.ConeGeometry(Math.max(halfW, halfL) * 1.48, 2.4, 4),
          new THREE.MeshStandardMaterial({ color: '#9D4A36', roughness: 0.72 }),
        );
        pitch.rotation.y = Math.PI / 4;
        pitch.position.set(0, roofY + 1.15, 0);
        pitch.castShadow = true;
        grp.add(pitch);
      } else {
        const roofSlab = new THREE.Mesh(
          new THREE.BoxGeometry(maxW * scale + 0.65, 0.28, maxL * scale + 0.65),
          trimMat,
        );
        roofSlab.position.set(0, roofY + 0.1, 0);
        roofSlab.castShadow = true;
        grp.add(roofSlab);

        if (draft.roofStyle === 'Pergola Terrace') {
          for (let px = -halfW + 0.6; px <= halfW - 0.6; px += 0.9) {
            const beam = new THREE.Mesh(
              new THREE.BoxGeometry(0.14, 0.2, maxL * scale * 0.8),
              new THREE.MeshStandardMaterial({ color: '#6E472B', roughness: 0.6 }),
            );
            beam.position.set(px, roofY + 0.42, 0);
            grp.add(beam);
          }
        } else if (draft.roofStyle === 'Skylight Atrium') {
          const skylight = new THREE.Mesh(
            new THREE.BoxGeometry(maxW * scale * 0.42, 0.36, maxL * scale * 0.35),
            glassMat,
          );
          skylight.position.set(0, roofY + 0.36, 0);
          grp.add(skylight);
        }
      }
    }

    // 4. Exterior Front Gate + Boundary Fence + Trees
    const gateColor =
      draft.gateDesign === 'Royal Iron Arch'
        ? '#1C2621'
        : draft.gateDesign === 'Commercial Glass & Steel'
          ? '#4D7384'
          : '#2D6B4F';
    const gateMesh = new THREE.Mesh(
      new THREE.BoxGeometry(frontWidth * scale * 0.45, 1.25, 0.14),
      new THREE.MeshStandardMaterial({ color: gateColor, metalness: 0.55, roughness: 0.35 }),
    );
    gateMesh.position.set(0, 0.75, Math.max(leftZ, rightZ) + 0.9);
    gateMesh.castShadow = true;
    grp.add(gateMesh);

    const addTree = (tx: number, tz: number) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.2, 1.4, 8),
        new THREE.MeshStandardMaterial({ color: '#694932', roughness: 0.9 }),
      );
      trunk.position.y = 0.7;
      tree.add(trunk);
      const canopy = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.95, 1),
        new THREE.MeshStandardMaterial({ color: '#2F7043', roughness: 0.78 }),
      );
      canopy.position.y = 1.85;
      canopy.castShadow = true;
      tree.add(canopy);
      tree.position.set(tx, 0, tz);
      grp.add(tree);
    };
    addTree(-halfW - 2.2, halfL + 1.5);
    addTree(halfW + 2.2, halfL + 1.5);

    if (draft.nightMode) {
      const facadeLight = new THREE.PointLight(0xffca7a, 12, 18);
      facadeLight.position.set(0, 2.8, halfL + 2.5);
      grp.add(facadeLight);
    }

    st.requestRender();
  }, [activeVariation, project.plot, draft, tab, activeFloorSlice]);

  // Camera view adjustment for Exterior vs Interior
  useEffect(() => {
    const st = threeRef.current;
    if (!st.camera || !st.controls || !st.requestRender) return;
    if (tab === 'interior') {
      st.camera.position.set(11, 16, 13);
      st.controls.target.set(0, 1.2, 0);
    } else {
      st.camera.position.set(17, 13, 21);
      st.controls.target.set(0, 2.5, 0);
    }
    st.requestRender();
  }, [tab]);

  useEffect(() => {
    const st = threeRef.current;
    if (!st.controls || !st.requestRender) return;
    st.controls.autoRotate = autoRotate;
    st.controls.autoRotateSpeed = 2.0;
    st.requestRender();
  }, [autoRotate]);

  const handleZoom = (dir: 'in' | 'out') => {
    const st = threeRef.current;
    if (!st.camera || !st.controls || !st.requestRender) return;
    const offset = st.camera.position.clone().sub(st.controls.target);
    offset.setLength(
      THREE.MathUtils.clamp(offset.length() * (dir === 'in' ? 0.82 : 1.2), 8, 48),
    );
    st.camera.position.copy(st.controls.target).add(offset);
    st.requestRender();
  };

  const updateDraft = <K extends keyof HouseCustomization>(
    key: K,
    val: HouseCustomization[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: val }));
  };

  const handleAiPalette = () => {
    const presets: Partial<HouseCustomization>[] = [
      {
        wallColor: 'emerald-sage',
        exteriorCladding: 'Travertine Stone',
        frontDoor: 'Walnut Timber',
        floorTiles: 'Italian Marble',
      },
      {
        wallColor: 'terracotta-clay',
        exteriorCladding: 'Architectural Brick',
        roofStyle: 'Pitched Architectural',
        floorTiles: 'Warm Oak Wood',
      },
      {
        wallColor: 'slate-charcoal',
        exteriorCladding: 'Glass Curtain',
        balconyRailing: 'Tempered Glass',
        floorTiles: 'Charcoal Slate',
      },
      {
        wallColor: 'sandstone-gold',
        exteriorCladding: 'Timber Louvers',
        roofStyle: 'Pergola Terrace',
        floorTiles: 'Travertine Beige',
      },
    ];
    const idx = presets.findIndex((p) => p.wallColor === draft.wallColor);
    const next = presets[(idx + 1) % presets.length];
    setDraft((prev) => ({ ...prev, ...next }));
    onShowToast('Applied AI curated exterior & interior finish!');
  };

  const totalFloors = project.plot.infrastructure.currentFloors;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#DCE8E1] rounded-2xl px-4 py-3 flex items-center justify-between gap-2 shadow-xs">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl hover:bg-[#E7F6EE] flex items-center justify-center text-[#112A1E]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center min-w-0">
          <h1 className="text-base sm:text-lg font-extrabold text-[#112A1E] truncate">
            3D Studio · {activeVariation.name}
          </h1>
          <p className="text-[11px] text-[#546E60] truncate">
            Synced 1:1 with selected 2D blueprint ({totalFloors} {totalFloors === 1 ? 'Floor' : 'Floors'})
          </p>
        </div>
        <button
          type="button"
          onClick={onSwitchTo2D}
          className="px-3 py-1.5 rounded-xl bg-[#E7F6EE] text-[#0E9F5D] text-xs font-bold"
        >
          2D Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* 3D WebGL Viewport */}
        <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-[#DCE8E1] bg-[#8AC0E6] shadow-sm">
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-xl border border-[#DCE8E1] pointer-events-auto">
              <Logo size={22} />
              <span className="text-xs font-extrabold text-[#0E9F5D]">
                {project.plot.category}
              </span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => updateDraft('nightMode', !draft.nightMode)}
                aria-label="Toggle Day / Night Lighting"
                className="w-11 h-11 rounded-full bg-white border border-[#DCE8E1] shadow-xs flex items-center justify-center"
              >
                {draft.nightMode ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-[#112A1E]" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setAutoRotate((r) => !r)}
                aria-label="Toggle 360 Rotation"
                className={`w-11 h-11 rounded-full border shadow-xs flex items-center justify-center ${
                  autoRotate
                    ? 'bg-[#0E9F5D] text-white border-[#0E9F5D]'
                    : 'bg-white text-[#112A1E] border-[#DCE8E1]'
                }`}
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div ref={mountRef} className="w-full h-[380px] sm:h-[480px]" />

          <div className="absolute right-3 bottom-14 z-10 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleZoom('in')}
              className="w-11 h-11 rounded-2xl bg-white border border-[#DCE8E1] shadow-sm flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom('out')}
              className="w-11 h-11 rounded-2xl bg-white border border-[#DCE8E1] shadow-sm flex items-center justify-center"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-3 left-3 right-3 z-10 flex justify-center pointer-events-none">
            <div className="bg-white/95 border border-[#DCE8E1] rounded-full px-4 py-1.5 text-xs font-semibold text-[#112A1E] flex items-center gap-2 shadow-xs">
              <RotateCw className="w-3.5 h-3.5 text-[#0E9F5D]" />
              <span>Drag to rotate 360° · Scroll/pinch to zoom · 100% Free</span>
            </div>
          </div>
        </div>

        {/* A-Z Exterior & Interior Studio Panel */}
        <div className="lg:col-span-5 bg-white border border-[#DCE8E1] rounded-3xl p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F0F4F1] rounded-2xl">
            <button
              type="button"
              onClick={() => setTab('exterior')}
              className={`min-h-[42px] rounded-xl text-sm font-bold ${
                tab === 'exterior' ? 'bg-[#0E9F5D] text-white shadow-xs' : 'text-[#405B4D]'
              }`}
            >
              Exterior A–Z
            </button>
            <button
              type="button"
              onClick={() => setTab('interior')}
              className={`min-h-[42px] rounded-xl text-sm font-bold ${
                tab === 'interior' ? 'bg-[#0E9F5D] text-white shadow-xs' : 'text-[#405B4D]'
              }`}
            >
              Interior A–Z
            </button>
          </div>

          {tab === 'exterior' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-[#112A1E] mb-2">
                  Facade Wall Paint Palette
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {WALL_COLOR_SWATCHES.map((sw) => {
                    const selected = draft.wallColor === sw.id;
                    return (
                      <button
                        key={sw.id}
                        type="button"
                        onClick={() => updateDraft('wallColor', sw.id as WallColorId)}
                        className="flex flex-col items-center gap-1"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                            selected
                              ? 'border-[#0E9F5D] ring-2 ring-[#0E9F5D]/30 scale-105'
                              : 'border-[#DCE8E1]'
                          }`}
                          style={{ backgroundColor: sw.hex }}
                        >
                          {selected && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-[10px] font-semibold text-center leading-tight">
                          {sw.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="block font-semibold text-[#546E60] mb-1">
                    Exterior Cladding
                  </label>
                  <select
                    value={draft.exteriorCladding}
                    onChange={(e) =>
                      updateDraft(
                        'exteriorCladding',
                        e.target.value as HouseCustomization['exteriorCladding'],
                      )
                    }
                    className="w-full min-h-[40px] px-2.5 rounded-xl bg-[#F6F9F7] border border-[#DCE8E1] font-bold"
                  >
                    <option value="Travertine Stone">Travertine Stone</option>
                    <option value="Smooth Stucco">Smooth Stucco</option>
                    <option value="Architectural Brick">Architectural Brick</option>
                    <option value="Timber Louvers">Timber Louvers</option>
                    <option value="Glass Curtain">Glass Curtain</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#546E60] mb-1">
                    Roof Style
                  </label>
                  <select
                    value={draft.roofStyle}
                    onChange={(e) =>
                      updateDraft('roofStyle', e.target.value as HouseCustomization['roofStyle'])
                    }
                    className="w-full min-h-[40px] px-2.5 rounded-xl bg-[#F6F9F7] border border-[#DCE8E1] font-bold"
                  >
                    <option value="Flat Modern Parapet">Flat Modern Parapet</option>
                    <option value="Pitched Architectural">Pitched Architectural</option>
                    <option value="Pergola Terrace">Pergola Terrace</option>
                    <option value="Skylight Atrium">Skylight Atrium</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#546E60] mb-1">
                    Gate / Entrance
                  </label>
                  <select
                    value={draft.gateDesign}
                    onChange={(e) =>
                      updateDraft(
                        'gateDesign',
                        e.target.value as HouseCustomization['gateDesign'],
                      )
                    }
                    className="w-full min-h-[40px] px-2.5 rounded-xl bg-[#F6F9F7] border border-[#DCE8E1] font-bold"
                  >
                    <option value="Modern Slatted">Modern Slatted</option>
                    <option value="Royal Iron Arch">Royal Iron Arch</option>
                    <option value="Commercial Glass & Steel">Commercial Glass &amp; Steel</option>
                    <option value="Minimal Laser-Cut">Minimal Laser-Cut</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#546E60] mb-1">
                    Balcony Railing
                  </label>
                  <select
                    value={draft.balconyRailing}
                    onChange={(e) =>
                      updateDraft(
                        'balconyRailing',
                        e.target.value as HouseCustomization['balconyRailing'],
                      )
                    }
                    className="w-full min-h-[40px] px-2.5 rounded-xl bg-[#F6F9F7] border border-[#DCE8E1] font-bold"
                  >
                    <option value="Tempered Glass">Tempered Glass</option>
                    <option value="Matte Black Steel">Matte Black Steel</option>
                    <option value="Perforated Screen">Perforated Screen</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#546E60] mb-1">Front Door</label>
                  <select
                    value={draft.frontDoor}
                    onChange={(e) =>
                      updateDraft(
                        'frontDoor',
                        e.target.value as HouseCustomization['frontDoor'],
                      )
                    }
                    className="w-full min-h-[40px] px-2.5 rounded-xl bg-[#F6F9F7] border border-[#DCE8E1] font-bold"
                  >
                    <option value="Walnut Timber">Walnut Timber</option>
                    <option value="Emerald Steel">Emerald Steel</option>
                    <option value="Double Glass Pivot">Double Glass Pivot</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => updateDraft('trimWhite', !draft.trimWhite)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-[#F6F9F7] border border-[#DCE8E1] font-bold flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1">
                      <Paintbrush className="w-3.5 h-3.5 text-[#0E9F5D]" />
                      White Trim
                    </span>
                    <span className="text-[#0E9F5D]">{draft.trimWhite ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {totalFloors > 1 && (
                <div className="bg-[#E7F6EE] rounded-2xl p-3 flex items-center justify-between">
                  <span className="font-bold text-[#1D4E35] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#0E9F5D]" />
                    Inspect Floor Level
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: totalFloors }, (_, i) => i + 1).map((fl) => (
                      <button
                        key={fl}
                        type="button"
                        onClick={() => setActiveFloorSlice(fl)}
                        className={`px-2.5 py-1 rounded-lg font-bold ${
                          activeFloorSlice === fl
                            ? 'bg-[#0E9F5D] text-white'
                            : 'bg-white text-[#112A1E]'
                        }`}
                      >
                        F{fl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#546E60] mb-1">
                  Flooring &amp; Tiles
                </label>
                <select
                  value={draft.floorTiles}
                  onChange={(e) =>
                    updateDraft('floorTiles', e.target.value as HouseCustomization['floorTiles'])
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#F6F9F7] border border-[#DCE8E1] font-bold"
                >
                  <option value="Italian Marble">Italian Marble</option>
                  <option value="Warm Oak Wood">Warm Oak Wood</option>
                  <option value="Travertine Beige">Travertine Beige</option>
                  <option value="Charcoal Slate">Charcoal Slate</option>
                  <option value="Terrazzo Mint">Terrazzo Mint</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#546E60] mb-1">
                  Furniture Collection
                </label>
                <select
                  value={draft.furnitureStyle}
                  onChange={(e) =>
                    updateDraft(
                      'furnitureStyle',
                      e.target.value as HouseCustomization['furnitureStyle'],
                    )
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#F6F9F7] border border-[#DCE8E1] font-bold"
                >
                  <option value="Modern Minimal">Modern Minimal</option>
                  <option value="Classic Luxury">Classic Luxury</option>
                  <option value="Commercial Retail">Commercial Retail / Display</option>
                  <option value="Executive Office">Executive Office</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#546E60] mb-1">
                  Interior Lighting Mood
                </label>
                <select
                  value={draft.interiorLighting}
                  onChange={(e) =>
                    updateDraft(
                      'interiorLighting',
                      e.target.value as HouseCustomization['interiorLighting'],
                    )
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#F6F9F7] border border-[#DCE8E1] font-bold"
                >
                  <option value="Warm 3000K Chandeliers">Warm 3000K Chandeliers</option>
                  <option value="Cool 5000K Recessed">Cool 5000K Recessed LEDs</option>
                  <option value="Studio Track Lights">Studio Track Lights</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-[#546E60] mb-1">
                    Kitchen / Pantry Finish
                  </label>
                  <select
                    value={draft.kitchenFinish}
                    onChange={(e) =>
                      updateDraft(
                        'kitchenFinish',
                        e.target.value as HouseCustomization['kitchenFinish'],
                      )
                    }
                    className="w-full min-h-[40px] px-2.5 rounded-xl bg-[#F6F9F7] border border-[#DCE8E1] font-bold"
                  >
                    <option value="Walnut & Quartz">Walnut &amp; Quartz</option>
                    <option value="Matte Emerald">Matte Emerald</option>
                    <option value="White Carrara">White Carrara</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#546E60] mb-1">
                    Washroom Design
                  </label>
                  <select
                    value={draft.washroomDesign}
                    onChange={(e) =>
                      updateDraft(
                        'washroomDesign',
                        e.target.value as HouseCustomization['washroomDesign'],
                      )
                    }
                    className="w-full min-h-[40px] px-2.5 rounded-xl bg-[#F6F9F7] border border-[#DCE8E1] font-bold"
                  >
                    <option value="Spa Marble & Glass">Spa Marble &amp; Glass</option>
                    <option value="Dark Slate & Brass">Dark Slate &amp; Brass</option>
                    <option value="Minimal Ceramic">Minimal Ceramic</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                onUpdateCustomization(draft);
                onShowToast('Saved 3D Exterior & Interior styling!');
              }}
              className="w-full min-h-[48px] rounded-2xl bg-[#0E9F5D] hover:bg-[#0A7D49] text-white font-bold text-sm"
            >
              Apply &amp; Save Styling
            </button>
            <button
              type="button"
              onClick={handleAiPalette}
              className="w-full min-h-[46px] rounded-2xl bg-white border border-[#0E9F5D] text-[#0E9F5D] hover:bg-[#E7F6EE] font-bold text-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Palette &amp; Finish Suggestion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
