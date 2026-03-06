// // // // import { useEffect, useRef } from "react"
// // // // import * as THREE from "three"

// // // // export default function HeroParticles() {
// // // //   const mountRef = useRef(null)

// // // //   useEffect(() => {
// // // //     const scene = new THREE.Scene()

// // // //     const camera = new THREE.PerspectiveCamera(
// // // //       75,
// // // //       window.innerWidth / window.innerHeight,
// // // //       0.1,
// // // //       1000
// // // //     )
// // // //     camera.position.z = 5

// // // //     const renderer = new THREE.WebGLRenderer({
// // // //       alpha: true,
// // // //       antialias: true,
// // // //     })

// // // //     renderer.setSize(window.innerWidth, window.innerHeight)
// // // //     mountRef.current.appendChild(renderer.domElement)

// // // //     // ===== PARTICLES =====
// // // //     const particlesCount = 1200
// // // //     const geometry = new THREE.BufferGeometry()
// // // //     const positions = new Float32Array(particlesCount * 3)

// // // //     for (let i = 0; i < particlesCount * 3; i++) {
// // // //       positions[i] = (Math.random() - 0.5) * 20
// // // //     }

// // // //     geometry.setAttribute(
// // // //       "position",
// // // //       new THREE.BufferAttribute(positions, 3)
// // // //     )

// // // //     const material = new THREE.PointsMaterial({
// // // //       size: 0.03,
// // // //       color: "#6366f1",
// // // //       transparent: true,
// // // //       opacity: 0.8,
// // // //     })

// // // //     const particles = new THREE.Points(geometry, material)
// // // //     scene.add(particles)

// // // //     // ===== MOUSE EFFECT =====
// // // //     let mouseX = 0
// // // //     let mouseY = 0

// // // //     window.addEventListener("mousemove", (event) => {
// // // //       mouseX = (event.clientX / window.innerWidth - 0.5) * 2
// // // //       mouseY = (event.clientY / window.innerHeight - 0.5) * 2
// // // //     })

// // // //     // ===== ANIMATE =====
// // // //     const animate = () => {
// // // //       requestAnimationFrame(animate)

// // // //       particles.rotation.y += 0.0008
// // // //       particles.rotation.x += 0.0005

// // // //       particles.rotation.y += mouseX * 0.001
// // // //       particles.rotation.x += mouseY * 0.001

// // // //       renderer.render(scene, camera)
// // // //     }

// // // //     animate()

// // // //     // ===== RESPONSIVE =====
// // // //     window.addEventListener("resize", () => {
// // // //       camera.aspect = window.innerWidth / window.innerHeight
// // // //       camera.updateProjectionMatrix()
// // // //       renderer.setSize(window.innerWidth, window.innerHeight)
// // // //     })

// // // //     return () => {
// // // //       mountRef.current.removeChild(renderer.domElement)
// // // //     }
// // // //   }, [])

// // // //   return <div
// // // //     ref={mountRef}
// // // //     className="absolute inset-0 w-full h-full pointer-events-none"
// // // //   />
// // // // }


// // import { useEffect, useRef } from "react"
// // import * as THREE from "three"

// // export default function HeroParticles() {
// //   const mountRef = useRef(null)

// //   useEffect(() => {
// //     const scene = new THREE.Scene()

// //     const camera = new THREE.PerspectiveCamera(
// //       75,
// //       window.innerWidth / window.innerHeight,
// //       0.1,
// //       1000
// //     )
// //     camera.position.z = 6

// //     const renderer = new THREE.WebGLRenderer({
// //       alpha: true,
// //       antialias: true,
// //     })
// //     renderer.setSize(window.innerWidth, window.innerHeight)
// //     renderer.setPixelRatio(window.devicePixelRatio)
// //     mountRef.current.appendChild(renderer.domElement)

// //     // ===== PARTICLES =====
// //     const particlesCount = 1500
// //     const geometry = new THREE.BufferGeometry()
// //     const positions = new Float32Array(particlesCount * 3)
// //     const velocities = []
// //     const originalPositions = []

// //     for (let i = 0; i < particlesCount; i++) {
// //       const x = (Math.random() - 0.5) * 20
// //       const y = (Math.random() - 0.5) * 20
// //       const z = (Math.random() - 0.5) * 20

// //       positions[i * 3] = x
// //       positions[i * 3 + 1] = y
// //       positions[i * 3 + 2] = z

// //       // Store original position for mouse parallax
// //       originalPositions.push({ x, y, z })

// //       // Give each particle a small random velocity
// //       velocities.push({
// //         x: (Math.random() - 0.5) * 0.002,
// //         y: (Math.random() - 0.5) * 0.002,
// //         z: (Math.random() - 0.5) * 0.002,
// //       })
// //     }

// //     geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

// //     const material = new THREE.PointsMaterial({
// //       size: 0.04,
// //       color: "#6366f1",
// //       transparent: true,
// //       opacity: 0.6,
// //       depthWrite: true,
// //     })

// //     const particles = new THREE.Points(geometry, material)
// //     scene.add(particles)

// //     // ===== MOUSE =====
// //     const mouse = { x: 0, y: 0 }
// //     const handleMouseMove = (event) => {
// //       mouse.x = (event.clientX / window.innerWidth) * 2 - 1
// //       mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
// //     }
// //     window.addEventListener("mousemove", handleMouseMove)

// //     // ===== ANIMATE =====
// //     const animate = () => {
// //       requestAnimationFrame(animate)

// //       const posArray = geometry.attributes.position.array

// //       for (let i = 0; i < particlesCount; i++) {
// //         const i3 = i * 3
// //         const original = originalPositions[i]
// //         const velocity = velocities[i]

// //         // Autonomous movement
// //         posArray[i3] += velocity.x
// //         posArray[i3 + 1] += velocity.y
// //         posArray[i3 + 2] += velocity.z

// //         // Bounce particles within a cube of size ~20
// //         if (posArray[i3] > 10 || posArray[i3] < -10) velocity.x = -velocity.x
// //         if (posArray[i3 + 1] > 10 || posArray[i3 + 1] < -10) velocity.y = -velocity.y
// //         if (posArray[i3 + 2] > 10 || posArray[i3 + 2] < -10) velocity.z = -velocity.z

// //         // Mouse parallax effect
// //         const dx = original.x - mouse.x * 5
// //         const dy = original.y - mouse.y * 5
// //         const distance = Math.sqrt(dx * dx + dy * dy)
// //         const force = Math.max(0, 1 - distance / 5)

// //         posArray[i3] += (dx / distance) * force * 0.02
// //         posArray[i3 + 1] += (dy / distance) * force * 0.02
// //       }

// //       geometry.attributes.position.needsUpdate = true

// //       // Smooth camera parallax
// //       camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.05
// //       camera.position.y += (mouse.y * 1.5 - camera.position.y) * 0.05

// //       renderer.render(scene, camera)
// //     }

// //     animate()

// //     // ===== RESIZE =====
// //     const handleResize = () => {
// //       camera.aspect = window.innerWidth / window.innerHeight
// //       camera.updateProjectionMatrix()
// //       renderer.setSize(window.innerWidth, window.innerHeight)
// //     }
// //     window.addEventListener("resize", handleResize)

// //     return () => {
// //       window.removeEventListener("mousemove", handleMouseMove)
// //       window.removeEventListener("resize", handleResize)
// //       mountRef.current.removeChild(renderer.domElement)
// //     }
// //   }, [])

// //   return (
// //     <div
// //       ref={mountRef}
// //       className="absolute inset-0 w-full h-full pointer-events-none"
// //     />
// //   )
// // }













// import { useRef, useEffect } from 'react';
// import * as THREE from 'three';

// const vertexShader = `
// uniform float time;
// varying vec2 vUv;
// varying vec3 vPosition;

// void main() {
//   vUv = uv;
//   vPosition = position;
//   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
// }`;

// const fragmentShader = `
// uniform sampler2D uDataTexture;
// uniform sampler2D uTexture;
// uniform vec4 resolution;
// varying vec2 vUv;

// void main() {
//   vec2 uv = vUv;
//   vec4 offset = texture2D(uDataTexture, vUv);
//   gl_FragColor = texture2D(uTexture, uv - 0.02 * offset.rg);
// }`;

// const GridDistortion = ({ grid = 15, mouse = 0.1, strength = 0.15, relaxation = 0.9, imageSrc, className = '' }) => {
//   const containerRef = useRef(null);
//   const sceneRef = useRef(null);
//   const rendererRef = useRef(null);
//   const cameraRef = useRef(null);
//   const planeRef = useRef(null);
//   const imageAspectRef = useRef(1);
//   const animationIdRef = useRef(null);
//   const resizeObserverRef = useRef(null);

//   useEffect(() => {
//     if (!containerRef.current) return;

//     const container = containerRef.current;

//     const scene = new THREE.Scene();
//     sceneRef.current = scene;

//     const renderer = new THREE.WebGLRenderer({
//       antialias: true,
//       alpha: true,
//       powerPreference: 'high-performance'
//     });
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     renderer.setClearColor(0x000000, 0);
//     rendererRef.current = renderer;

//     container.innerHTML = '';
//     container.appendChild(renderer.domElement);

//     const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000);
//     camera.position.z = 2;
//     cameraRef.current = camera;

//     const uniforms = {
//       time: { value: 0 },
//       resolution: { value: new THREE.Vector4() },
//       uTexture: { value: null },
//       uDataTexture: { value: null }
//     };

//     const textureLoader = new THREE.TextureLoader();
//     textureLoader.load(imageSrc, texture => {
//       texture.minFilter = THREE.LinearFilter;
//       texture.magFilter = THREE.LinearFilter;
//       texture.wrapS = THREE.ClampToEdgeWrapping;
//       texture.wrapT = THREE.ClampToEdgeWrapping;
//       imageAspectRef.current = texture.image.width / texture.image.height;
//       uniforms.uTexture.value = texture;
//       handleResize();
//     });

//     const size = grid;
//     const data = new Float32Array(4 * size * size);
//     for (let i = 0; i < size * size; i++) {
//       data[i * 4] = Math.random() * 255 - 125;
//       data[i * 4 + 1] = Math.random() * 255 - 125;
//     }

//     const dataTexture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
//     dataTexture.needsUpdate = true;
//     uniforms.uDataTexture.value = dataTexture;

//     const material = new THREE.ShaderMaterial({
//       side: THREE.DoubleSide,
//       uniforms,
//       vertexShader,
//       fragmentShader,
//       transparent: true
//     });

//     const geometry = new THREE.PlaneGeometry(1, 1, size - 1, size - 1);
//     const plane = new THREE.Mesh(geometry, material);
//     planeRef.current = plane;
//     scene.add(plane);

//     const handleResize = () => {
//       if (!container || !renderer || !camera) return;

//       const rect = container.getBoundingClientRect();
//       const width = rect.width;
//       const height = rect.height;

//       if (width === 0 || height === 0) return;

//       const containerAspect = width / height;

//       renderer.setSize(width, height);

//       if (plane) {
//         plane.scale.set(containerAspect, 1, 1);
//       }

//       const frustumHeight = 1;
//       const frustumWidth = frustumHeight * containerAspect;
//       camera.left = -frustumWidth / 2;
//       camera.right = frustumWidth / 2;
//       camera.top = frustumHeight / 2;
//       camera.bottom = -frustumHeight / 2;
//       camera.updateProjectionMatrix();

//       uniforms.resolution.value.set(width, height, 1, 1);
//     };

//     if (window.ResizeObserver) {
//       const resizeObserver = new ResizeObserver(() => {
//         handleResize();
//       });
//       resizeObserver.observe(container);
//       resizeObserverRef.current = resizeObserver;
//     } else {
//       window.addEventListener('resize', handleResize);
//     }

//     const mouseState = {
//       x: 0,
//       y: 0,
//       prevX: 0,
//       prevY: 0,
//       vX: 0,
//       vY: 0
//     };

//     const handleMouseMove = e => {
//       const rect = container.getBoundingClientRect();
//       const x = (e.clientX - rect.left) / rect.width;
//       const y = 1 - (e.clientY - rect.top) / rect.height;
//       mouseState.vX = x - mouseState.prevX;
//       mouseState.vY = y - mouseState.prevY;
//       Object.assign(mouseState, { x, y, prevX: x, prevY: y });
//     };

//     const handleMouseLeave = () => {
//       if (dataTexture) {
//         dataTexture.needsUpdate = true;
//       }
//       Object.assign(mouseState, {
//         x: 0,
//         y: 0,
//         prevX: 0,
//         prevY: 0,
//         vX: 0,
//         vY: 0
//       });
//     };

//     container.addEventListener('mousemove', handleMouseMove);
//     container.addEventListener('mouseleave', handleMouseLeave);

//     handleResize();

//     const animate = () => {
//       animationIdRef.current = requestAnimationFrame(animate);

//       if (!renderer || !scene || !camera) return;

//       uniforms.time.value += 0.05;

//       const data = dataTexture.image.data;
//       for (let i = 0; i < size * size; i++) {
//         data[i * 4] *= relaxation;
//         data[i * 4 + 1] *= relaxation;
//       }

//       const gridMouseX = size * mouseState.x;
//       const gridMouseY = size * mouseState.y;
//       const maxDist = size * mouse;

//       for (let i = 0; i < size; i++) {
//         for (let j = 0; j < size; j++) {
//           const distSq = Math.pow(gridMouseX - i, 2) + Math.pow(gridMouseY - j, 2);
//           if (distSq < maxDist * maxDist) {
//             const index = 4 * (i + size * j);
//             const power = Math.min(maxDist / Math.sqrt(distSq), 10);
//             data[index] += strength * 100 * mouseState.vX * power;
//             data[index + 1] -= strength * 100 * mouseState.vY * power;
//           }
//         }
//       }

//       dataTexture.needsUpdate = true;
//       renderer.render(scene, camera);
//     };

//     animate();

//     return () => {
//       if (animationIdRef.current) {
//         cancelAnimationFrame(animationIdRef.current);
//       }

//       if (resizeObserverRef.current) {
//         resizeObserverRef.current.disconnect();
//       } else {
//         window.removeEventListener('resize', handleResize);
//       }

//       container.removeEventListener('mousemove', handleMouseMove);
//       container.removeEventListener('mouseleave', handleMouseLeave);

//       if (renderer) {
//         renderer.dispose();
//         if (container.contains(renderer.domElement)) {
//           container.removeChild(renderer.domElement);
//         }
//       }

//       if (geometry) geometry.dispose();
//       if (material) material.dispose();
//       if (dataTexture) dataTexture.dispose();
//       if (uniforms.uTexture.value) uniforms.uTexture.value.dispose();

//       sceneRef.current = null;
//       rendererRef.current = null;
//       cameraRef.current = null;
//       planeRef.current = null;
//     };
//   }, [grid, mouse, strength, relaxation, imageSrc]);

//   return (
//     <div
//       ref={containerRef}
//       className={`distortion-container ${className}`}
//       style={{
//         width: '100%',
//         height: '100%',
//         minWidth: '0',
//         minHeight: '0'
//       }}
//     />
//   );
// };

// export default GridDistortion;














import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 0.5, 0.2];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const vertex = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;
  
  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);
  
  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y)); 
    p.z -= 4.; 
    S = p;
    d = p.y-T;
    
    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05); 
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T)); 
    z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4; 
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
  }
  
  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);
  
  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));
  
  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}`;

export const Plasma = ({
  color = '#ffffff',
  speed = 1,
  direction = 'forward',
  scale = 1,
  opacity = 1,
  mouseInteractive = true
}) => {
  const containerRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const containerEl = containerRef.current;

    const useCustomColor = color ? 1.0 : 0.0;
    const customColorRgb = color ? hexToRgb(color) : [1, 1, 1];

    const directionMultiplier = direction === 'reverse' ? -1.0 : 1.0;

    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });
    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    containerRef.current.appendChild(canvas);

    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex: vertex,
      fragment: fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uCustomColor: { value: new Float32Array(customColorRgb) },
        uUseCustomColor: { value: useCustomColor },
        uSpeed: { value: speed * 0.4 },
        uDirection: { value: directionMultiplier },
        uScale: { value: scale },
        uOpacity: { value: opacity },
        uMouse: { value: new Float32Array([0, 0]) },
        uMouseInteractive: { value: mouseInteractive ? 1.0 : 0.0 }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    const handleMouseMove = e => {
      if (!mouseInteractive) return;
      const rect = containerRef.current.getBoundingClientRect();
      mousePos.current.x = e.clientX - rect.left;
      mousePos.current.y = e.clientY - rect.top;
      const mouseUniform = program.uniforms.uMouse.value;
      mouseUniform[0] = mousePos.current.x;
      mouseUniform[1] = mousePos.current.y;
    };

    if (mouseInteractive) {
      containerEl.addEventListener('mousemove', handleMouseMove);
    }

    const setSize = () => {
      const rect = containerRef.current.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height);
      const res = program.uniforms.iResolution.value;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(containerEl);
    setSize();

    let raf = 0;
    const t0 = performance.now();
    const loop = t => {
      let timeValue = (t - t0) * 0.001;
      if (direction === 'pingpong') {
        const pingpongDuration = 10;
        const segmentTime = timeValue % pingpongDuration;
        const isForward = Math.floor(timeValue / pingpongDuration) % 2 === 0;
        const u = segmentTime / pingpongDuration;
        const smooth = u * u * (3 - 2 * u);
        const pingpongTime = isForward ? smooth * pingpongDuration : (1 - smooth) * pingpongDuration;
        program.uniforms.uDirection.value = 1.0;
        program.uniforms.iTime.value = pingpongTime;
      } else {
        program.uniforms.iTime.value = timeValue;
      }
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (mouseInteractive && containerEl) {
        containerEl.removeEventListener('mousemove', handleMouseMove);
      }
      try {
        containerEl?.removeChild(canvas);
      } catch {
        console.warn('Canvas already removed from container');
      }
    };
  }, [color, speed, direction, scale, opacity, mouseInteractive]);

  return <div ref={containerRef} className="plasma-container" />;
};

export default Plasma;
