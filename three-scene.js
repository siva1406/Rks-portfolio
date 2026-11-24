/**
 * ==========================================================================
 * KARTHICK SIVA R - 3D THREE.JS VISUAL ANIMATION ENGINE
 * Features:
 * - Holographic Cyber Torus Knot & Dual Wireframe Core
 * - 1,500+ Dynamic Star Particles in Palette Colors (#FF69B4, #C24366, #243A66)
 * - Orbiting Planetary Gyroscope Rings
 * - Cursor Parallax with Damped Spring Motion (lerp)
 * - Scroll-linked 3D Trajectory
 * - Click Ripple Particle Burst
 * - Bulletproof WebGL error-handling & fallbacks
 * ==========================================================================
 */

/* global THREE */
(function () {
  'use strict';

  // Palette color definitions for Three.js
  const PALETTE = {
    burgundy: 0x800021,
    crimson: 0x881144,
    navy: 0x243A66,
    rose: 0xC24366,
    hotpink: 0xFF69B4,
    pearl: 0xFFE4D8
  };

  const container = document.getElementById('canvasContainer');
  if (!container || typeof window.THREE === 'undefined') return;

  // Check WebGL availability safely
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  if (typeof THREE === 'undefined' || !isWebGLAvailable()) {
    console.warn('WebGL or Three.js not supported. Utilizing CSS fallback background.');
    createFallbackVisual(container);
    return;
  }

  // Fallback visual in case WebGL is disabled
  function createFallbackVisual(parent) {
    const fallback = document.createElement('div');
    fallback.style.position = 'absolute';
    fallback.style.top = '0';
    fallback.style.left = '0';
    fallback.style.width = '100%';
    fallback.style.height = '100%';
    fallback.style.background = 'radial-gradient(circle at center, rgba(255,105,180,0.15) 0%, rgba(36,58,102,0.2) 50%, transparent 80%)';
    fallback.style.pointerEvents = 'none';
    parent.appendChild(fallback);
  }

  // Three.js Scene Variables
  let scene, camera, renderer;
  let mainCoreGroup, torusKnot, wireframeIcosa, ringGroup;
  let starParticles, particleGeo, particleMat;
  let burstParticles = [];
  
  // Mouse & Scroll Tracking with Damping
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const windowHalf = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let scrollY = 0;
  let targetScrollY = 0;
  let isDragging = false;
  let previousPointer = { x: 0, y: 0 };

  function init() {
    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080d17, 0.0018);

    // 2. Camera Setup
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 2000);
    camera.position.set(0, 0, 48);

    // 3. Renderer Setup with high-performance configuration
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.error('Three.js renderer creation error:', err);
      createFallbackVisual(container);
      return;
    }

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pinkLight = new THREE.PointLight(PALETTE.hotpink, 4, 180);
    pinkLight.position.set(40, 30, 40);
    scene.add(pinkLight);

    const blueLight = new THREE.PointLight(PALETTE.navy, 3, 200);
    blueLight.position.set(-45, -30, 30);
    scene.add(blueLight);

    const roseLight = new THREE.PointLight(PALETTE.rose, 3, 160);
    roseLight.position.set(0, -40, 20);
    scene.add(roseLight);

    // 5. Build 3D Objects
    buildMainCore();
    buildStarField();
    buildOrbitalRings();

    // 6. Event Listeners
    setupEvents();

    // 7. Start Animation Loop
    animate();
  }

  // Construct the central interactive 3D core
  function buildMainCore() {
    mainCoreGroup = new THREE.Group();

    // Holographic Torus Knot
    const knotGeometry = new THREE.TorusKnotGeometry(9, 2.6, 120, 24, 2, 3);
    const knotMaterial = new THREE.MeshPhysicalMaterial({
      color: PALETTE.crimson,
      emissive: PALETTE.burgundy,
      emissiveIntensity: 0.5,
      roughness: 0.25,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
      transparent: true,
      opacity: 0.88
    });
    torusKnot = new THREE.Mesh(knotGeometry, knotMaterial);
    mainCoreGroup.add(torusKnot);

    // Inner Glowing Wireframe Icosahedron
    const icosaGeometry = new THREE.IcosahedronGeometry(7, 2);
    const icosaMaterial = new THREE.MeshStandardMaterial({
      color: PALETTE.hotpink,
      emissive: PALETTE.hotpink,
      emissiveIntensity: 0.6,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    wireframeIcosa = new THREE.Mesh(icosaGeometry, icosaMaterial);
    mainCoreGroup.add(wireframeIcosa);

    // Center Core sphere of pure light
    const coreSphereGeo = new THREE.SphereGeometry(2.5, 32, 32);
    const coreSphereMat = new THREE.MeshBasicMaterial({
      color: PALETTE.pearl,
      wireframe: false
    });
    const innerLightSphere = new THREE.Mesh(coreSphereGeo, coreSphereMat);
    mainCoreGroup.add(innerLightSphere);

    // Initial positioning: shift slightly to right for aesthetic desktop balance
    if (window.innerWidth > 992) {
      mainCoreGroup.position.set(16, 2, 0);
    } else {
      mainCoreGroup.position.set(0, 5, -5);
      mainCoreGroup.scale.set(0.75, 0.75, 0.75);
    }

    scene.add(mainCoreGroup);
  }

  // Construct Orbiting Gyroscope Cyber Rings
  function buildOrbitalRings() {
    ringGroup = new THREE.Group();

    const createRing = (radius, tube, color, rotX, rotY) => {
      const ringGeo = new THREE.TorusGeometry(radius, tube, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
        transparent: true,
        opacity: 0.35
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = rotX;
      ringMesh.rotation.y = rotY;
      return ringMesh;
    };

    const ring1 = createRing(16, 0.12, PALETTE.hotpink, Math.PI / 3, Math.PI / 6);
    const ring2 = createRing(20, 0.1, PALETTE.rose, Math.PI / 4, -Math.PI / 4);
    const ring3 = createRing(24, 0.08, PALETTE.navy, -Math.PI / 3, Math.PI / 3);

    ringGroup.add(ring1);
    ringGroup.add(ring2);
    ringGroup.add(ring3);

    mainCoreGroup.add(ringGroup);
  }

  // Generate 1,500+ Star/Constellation Particles in 3D Space
  function buildStarField() {
    const particleCount = 1400;
    particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const paletteColors = [
      new THREE.Color(PALETTE.hotpink),
      new THREE.Color(PALETTE.rose),
      new THREE.Color(PALETTE.navy),
      new THREE.Color(PALETTE.crimson),
      new THREE.Color(PALETTE.pearl)
    ];

    for (let i = 0; i < particleCount; i++) {
      // Spread in a large 3D sphere radius
      const r = THREE.MathUtils.randFloat(25, 250);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = THREE.MathUtils.randFloat(0, Math.PI);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const chosenColor = paletteColors[Math.floor(Math.random() * paletteColors.length)];
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle sprite texture using dynamic canvas to eliminate external asset dependency
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 105, 180, 0.8)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const particleTexture = new THREE.CanvasTexture(canvas);

    particleMat = new THREE.PointsMaterial({
      size: 1.6,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    starParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(starParticles);
  }

  // Interactive Particle Burst on Click
  function triggerParticleBurst(clientX, clientY) {
    const burstCount = 40;
    const burstGeo = new THREE.BufferGeometry();
    const burstPos = new Float32Array(burstCount * 3);
    const burstVel = [];

    // Map screen click to 3D world coords
    const vector = new THREE.Vector3(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1,
      0.5
    );
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = 40;
    const origin = camera.position.clone().add(dir.multiplyScalar(distance));

    for (let i = 0; i < burstCount; i++) {
      burstPos[i * 3] = origin.x;
      burstPos[i * 3 + 1] = origin.y;
      burstPos[i * 3 + 2] = origin.z;

      burstVel.push({
        x: (Math.random() - 0.5) * 1.2,
        y: (Math.random() - 0.5) * 1.2,
        z: (Math.random() - 0.5) * 1.2
      });
    }

    burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPos, 3));

    const burstMat = new THREE.PointsMaterial({
      color: PALETTE.hotpink,
      size: 1.8,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });

    const burstPoints = new THREE.Points(burstGeo, burstMat);
    scene.add(burstPoints);

    burstParticles.push({
      mesh: burstPoints,
      velocities: burstVel,
      life: 1.0
    });
  }

  // Event Listeners Setup
  function setupEvents() {
    window.addEventListener('resize', onWindowResize, { passive: true });

    // Pointer Move for Parallax
    window.addEventListener('mousemove', (e) => {
      mouse.targetX = (e.clientX - windowHalf.x) * 0.0015;
      mouse.targetY = (e.clientY - windowHalf.y) * 0.0015;
    }, { passive: true });

    // Touch Support
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        mouse.targetX = (e.touches[0].clientX - windowHalf.x) * 0.002;
        mouse.targetY = (e.touches[0].clientY - windowHalf.y) * 0.002;
      }
    }, { passive: true });

    // Drag Orbit interaction on Canvas
    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousPointer.x = e.clientX;
      previousPointer.y = e.clientY;
      triggerParticleBurst(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging || !mainCoreGroup) return;
      const deltaX = e.clientX - previousPointer.x;
      const deltaY = e.clientY - previousPointer.y;

      mainCoreGroup.rotation.y += deltaX * 0.008;
      mainCoreGroup.rotation.x += deltaY * 0.008;

      previousPointer.x = e.clientX;
      previousPointer.y = e.clientY;
    });

    // Scroll Position
    window.addEventListener('scroll', () => {
      targetScrollY = window.scrollY;
    }, { passive: true });
  }

  function onWindowResize() {
    windowHalf.x = window.innerWidth / 2;
    windowHalf.y = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    // Responsive repositioning of 3D core
    if (mainCoreGroup) {
      if (window.innerWidth > 992) {
        mainCoreGroup.position.set(16, 2, 0);
        mainCoreGroup.scale.set(1, 1, 1);
      } else {
        mainCoreGroup.position.set(0, 4, -4);
        mainCoreGroup.scale.set(0.72, 0.72, 0.72);
      }
    }
  }

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // 1. Smooth mouse parallax interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.06;
    mouse.y += (mouse.targetY - mouse.y) * 0.06;

    // 2. Smooth scroll interpolation
    scrollY += (targetScrollY - scrollY) * 0.08;

    // 3. Central Core Animations
    if (mainCoreGroup) {
      // Natural floating idle rotation
      if (!isDragging) {
        mainCoreGroup.rotation.y = elapsedTime * 0.28 + mouse.x * 2.5;
        mainCoreGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2 + mouse.y * 2.0;
        mainCoreGroup.rotation.z = Math.cos(elapsedTime * 0.2) * 0.15;
      }

      // Breathing scale effect
      const breathe = 1 + Math.sin(elapsedTime * 1.5) * 0.04;
      if (window.innerWidth > 992) {
        mainCoreGroup.scale.set(breathe, breathe, breathe);
      }

      // Torus knot inner twist
      if (torusKnot) {
        torusKnot.rotation.z = elapsedTime * 0.15;
      }

      // Wireframe icosahedron counter-rotation
      if (wireframeIcosa) {
        wireframeIcosa.rotation.x = -elapsedTime * 0.35;
        wireframeIcosa.rotation.y = -elapsedTime * 0.4;
      }

      // Orbital rings rotation
      if (ringGroup) {
        ringGroup.children[0].rotation.z = elapsedTime * 0.4;
        ringGroup.children[1].rotation.x = -elapsedTime * 0.3;
        ringGroup.children[2].rotation.y = elapsedTime * 0.25;
      }

      // Scroll-driven camera and core movement
      camera.position.y = -scrollY * 0.025;
      camera.position.z = 48 + Math.sin(scrollY * 0.002) * 8;
    }

    // 4. Starfield gentle cosmic rotation
    if (starParticles) {
      starParticles.rotation.y = elapsedTime * 0.03;
      starParticles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05;
    }

    // 5. Update and clean up particle bursts
    for (let i = burstParticles.length - 1; i >= 0; i--) {
      const burst = burstParticles[i];
      const positions = burst.mesh.geometry.attributes.position.array;

      for (let j = 0; j < burst.velocities.length; j++) {
        positions[j * 3] += burst.velocities[j].x;
        positions[j * 3 + 1] += burst.velocities[j].y;
        positions[j * 3 + 2] += burst.velocities[j].z;
      }
      burst.mesh.geometry.attributes.position.needsUpdate = true;

      burst.life -= 0.03;
      burst.mesh.material.opacity = burst.life;

      if (burst.life <= 0) {
        scene.remove(burst.mesh);
        burst.mesh.geometry.dispose();
        burst.mesh.material.dispose();
        burstParticles.splice(i, 1);
      }
    }

    // 6. Render
    renderer.render(scene, camera);
  }

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
