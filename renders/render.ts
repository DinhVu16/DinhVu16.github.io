import * as THREE from "three/webgpu";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/Addons.js";

import {
  sample,
  pass,
  mrt,
  screenUV,
  normalView,
  velocity,
  directionToColor,
  colorToDirection,
  builtinAOContext,
  texture,
  saturation,
  pow,
  float,
  uniform,
  vec3,
  vec4,
  color,
  workingToColorSpace,
  toneMapping,
} from "three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { ao } from "three/addons/tsl/display/GTAONode.js";
import { bilateralBlur } from "three/addons/tsl/display/BilateralBlurNode.js";
import { gaussianBlur } from "three/examples/jsm/tsl/display/GaussianBlurNode.js";

export interface SceneConfig {
  modelPath: string;
  lightColor?: number;
  lightIntensity?: number;
  ambientLightColor?: number;
  ambientIntensity?: number;
}

// 🚨 THE FIX: Singleton Loaders placed OUTSIDE the class.
// This prevents Web Workers from infinitely multiplying and crashing the tab.
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("../models/draco/");
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

export class SceneManager {
  // === FIX: Circuit breaker flag ===
  public isDestroyed: boolean = false;

  public renderer: THREE.WebGPURenderer;
  private renderPipeline: THREE.RenderPipeline;
  private Mouse: THREE.Vector2;
  private previousMouse: THREE.Vector2;
  private targetVelocity: THREE.Vector2;
  private crVelocity: THREE.Vector2;
  private crMousePos: THREE.Vector2;
  private shadowCamera!: THREE.OrthographicCamera;
  private contactShadowTarget!: THREE.RenderTarget;
  private depthMaterial!: THREE.NodeMaterial;

  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public mesh: THREE.Object3D | undefined = undefined;
  public light: THREE.DirectionalLight;

  private config: SceneConfig;

  constructor(container: HTMLElement, config: SceneConfig) {
    this.config = config;
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );

    this.renderer = new THREE.WebGPURenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearAlpha(0);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    const ambColor = this.config.ambientLightColor ?? 0xffffff;
    const ambIntensity = this.config.ambientIntensity ?? 0.05;
    this.scene.add(new THREE.AmbientLight(ambColor, ambIntensity));

    const dirColor = this.config.lightColor ?? 0xffffff;
    this.light = new THREE.DirectionalLight(dirColor);
    this.light.intensity = this.config.lightIntensity ?? 3.0;
    this.scene.add(this.light);

    this.light.castShadow = true;
    this.light.shadow.mapSize.width = 2048;
    this.light.shadow.mapSize.height = 2048;
    this.light.shadow.bias = -0.001;

    this.light.shadow.radius = 1;
    this.light.shadow.camera.top = 4;
    this.light.shadow.camera.bottom = -4;
    this.light.shadow.camera.left = -4;
    this.light.shadow.camera.right = 4;
    this.light.shadow.camera.near = 0.1;
    this.light.shadow.camera.far = 50;

    this.scene.add(this.light.target);

    // 🚨 THE FIX: Use the global gltfLoader here
    gltfLoader.load(this.config.modelPath, (car) => {
      // Prevent orphaned models from leaking VRAM if downloaded after leaving page
      if (this.isDestroyed) {
        car.scene.traverse((child: any) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat: any) =>
                  this.disposeMaterialAssets(mat),
                );
              } else {
                this.disposeMaterialAssets(child.material);
              }
            }
          }
        });
        return;
      }

      car.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      this.mesh = car.scene;
      this.scene.add(car.scene);

      this.light.shadow.needsUpdate = true;
    });

    const geometry = new THREE.PlaneGeometry(20, 20);
    geometry.rotateX(-Math.PI / 2);
    const material = new THREE.ShadowMaterial();
    material.opacity = 0.4;
    const plane = new THREE.Mesh(geometry, material);
    plane.position.y = 0.03;
    plane.receiveShadow = true;
    this.scene.add(plane);

    this.shadowCamera = new THREE.OrthographicCamera(-2, 2, 3, -3, 0, 10);
    this.shadowCamera.position.set(0, 0.01, 0);
    this.shadowCamera.rotation.x = Math.PI / 2;
    this.shadowCamera.updateProjectionMatrix();

    this.contactShadowTarget = new THREE.RenderTarget(1024, 1024, {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });
    this.contactShadowTarget.texture.generateMipmaps = false;

    this.depthMaterial = new THREE.NodeMaterial();
    this.depthMaterial.colorNode = vec3(0);
    this.depthMaterial.depthTest = false;
    this.depthMaterial.depthWrite = false;

    const shadowPlaneMaterial = new THREE.NodeMaterial();
    shadowPlaneMaterial.transparent = true;
    shadowPlaneMaterial.depthWrite = false;
    shadowPlaneMaterial.colorNode = vec3(0);

    const blurredShadow = gaussianBlur(
      texture(this.contactShadowTarget.texture),
      4,
    );
    shadowPlaneMaterial.opacityNode = blurredShadow.r.oneMinus().mul(0.95);

    const shadowPlaneGeometry = new THREE.PlaneGeometry(4, 6);
    shadowPlaneGeometry.rotateX(-Math.PI / 2);
    const contactShadowPlane = new THREE.Mesh(
      shadowPlaneGeometry,
      shadowPlaneMaterial,
    );

    contactShadowPlane.position.y = 0.031;
    this.scene.add(contactShadowPlane);

    this.Mouse = new THREE.Vector2(0, 0);
    this.previousMouse = new THREE.Vector2(0, 0);
    this.targetVelocity = new THREE.Vector2(0, 0);
    this.crVelocity = new THREE.Vector2(0, 0);
    this.crMousePos = new THREE.Vector2(0, 0);

    document.addEventListener("mousemove", (e) => {
      this.Mouse.x = e.clientX / container.clientWidth;
      this.Mouse.y = e.clientY / container.clientHeight;
    });

    this.renderPipeline = new THREE.RenderPipeline(this.renderer);
    this.renderPipeline.outputColorTransform = false;

    const prePass = pass(this.scene, this.camera);
    prePass.name = "Pre-Pass";
    prePass.transparent = true;

    prePass.setMRT(
      mrt({
        output: directionToColor(normalView),
        velocity: velocity,
      }),
    );

    const prePassNormal = sample((uv) => {
      return colorToDirection(prePass.getTextureNode().sample(uv));
    });
    const prePassDepth = prePass
      .getTextureNode("depth")
      .toInspector("Depth", () => prePass.getLinearDepthNode());

    const normalTexture = prePass.getTexture("output");
    normalTexture.type = THREE.UnsignedByteType;

    const scenePass = pass(this.scene, this.camera);
    scenePass.transparent = true;

    let bloomPass = bloom(scenePass, 0.1, 0.2, 0.3);
    let aoPass = ao(prePassDepth, prePassNormal, this.camera);
    aoPass.radius = uniform(0.15);
    aoPass.thickness = uniform(4);
    aoPass.distanceExponent = uniform(0.8);
    aoPass.distanceFallOff = uniform(0.5);
    aoPass.resolutionScale = 0.5;
    aoPass.useTemporalFiltering = true;
    const blurAOPass = bilateralBlur(aoPass.getTextureNode());
    blurAOPass.sigma = 2;
    const aoPassOutput = blurAOPass.getTextureNode();

    scenePass.contextNode = builtinAOContext(aoPassOutput.sample(screenUV).r);

    let adjustPass: any = scenePass.getTextureNode();
    let outputPass: any = adjustPass;
    outputPass = outputPass.add(bloomPass);
    outputPass = toneMapping(6, float(1.5), outputPass);
    outputPass = workingToColorSpace(outputPass, THREE.SRGBColorSpace);
    outputPass = saturation(outputPass, 1.35);

    this.renderPipeline.outputNode = vec4(outputPass, adjustPass.a);
  }

  async init() {
    try {
      await this.renderer.init();

      // If destroyed while waiting for the GPU to initialize, dump the new device immediately!
      if (this.isDestroyed) {
        if (this.renderer && typeof this.renderer.dispose === "function") {
          this.renderer.dispose();
        }
        return;
      }

      await this.renderer.compileAsync(this.scene, this.camera);
      if (this.isDestroyed) return;

      this.animate();
    } catch (error) {
      console.warn("WebGPU initialization aborted:", error);
    }
  }

  private time = new THREE.Timer();
  private animationId: number | null = null;

  private animate = () => {
    // Instantly reject render calls if context is destroyed
    if (this.isDestroyed) return;

    this.animationId = requestAnimationFrame(this.animate);
    this.time.update();

    this.light.shadow.camera.up.set(0, 0, 1);
    this.light.updateMatrixWorld();
    this.light.target.updateMatrixWorld();

    this.light.shadow.camera.position.setFromMatrixPosition(
      this.light.matrixWorld,
    );

    const targetPosition = new THREE.Vector3();
    targetPosition.setFromMatrixPosition(this.light.target.matrixWorld);

    this.light.shadow.camera.lookAt(targetPosition);
    this.light.shadow.camera.updateMatrixWorld();
    this.light.shadow.camera.updateProjectionMatrix();

    this.targetVelocity.x = this.Mouse.x - this.previousMouse.x;
    this.targetVelocity.y = this.Mouse.y - this.previousMouse.y;
    this.previousMouse.copy(this.Mouse);
    this.crVelocity.lerp(this.targetVelocity, 0.1);
    this.crMousePos.lerp(this.Mouse, 0.05);

    const initialBackground = this.scene.background;
    const initialOverride = this.scene.overrideMaterial;

    this.scene.backgroundNode = color(0xffffff);
    this.scene.background = null;
    this.scene.overrideMaterial = this.depthMaterial;

    this.renderer.setRenderTarget(this.contactShadowTarget);
    this.renderer.render(this.scene, this.shadowCamera);

    this.renderer.setRenderTarget(null);
    this.scene.backgroundNode = null;
    this.scene.background = initialBackground;
    this.scene.overrideMaterial = initialOverride;

    this.renderPipeline.render();
  };

  public precompileShaders() {
    if (this.renderer && this.scene && this.camera && !this.isDestroyed) {
      // @ts-ignore
      this.renderer.compile(this.scene, this.camera);
    }
  }

  public warmUpGPU() {
    if (this.renderer && this.scene && this.camera && !this.isDestroyed) {
      this.renderer.render(this.scene, this.camera);
      this.renderer.clear();
    }
  }

  public destroy() {
    this.isDestroyed = true; // Trip the breaker

    if (this.animationId) cancelAnimationFrame(this.animationId);

    if (this.contactShadowTarget) {
      this.contactShadowTarget.dispose();
      if (this.contactShadowTarget.texture) {
        this.contactShadowTarget.texture.dispose();
      }
      if (this.contactShadowTarget.depthTexture) {
        this.contactShadowTarget.depthTexture.dispose();
      }
    }

    if (this.scene.environment) {
      this.scene.environment.dispose();
      delete (this.scene.environment as any)._webgpuTexture;
      delete (this.scene.environment as any).isWebGPUTexture;
      this.scene.environment = null;
    }

    this.scene.traverse((object: any) => {
      if (!object.isMesh) return;
      if (object.geometry) object.geometry.dispose();

      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((mat: THREE.Material) =>
            this.disposeMaterialAssets(mat),
          );
        } else {
          this.disposeMaterialAssets(object.material);
        }
      }
    });

    if (this.renderer && typeof this.renderer.dispose === "function") {
      this.renderer.dispose();
    }
  }

  public disposeMaterialAssets(material: THREE.Material | any) {
    material.dispose();
    for (const key in material) {
      const value = material[key];
      if (value && value.isTexture) {
        value.dispose();
        delete value._webgpuTexture;
        delete value.isWebGPUTexture;
      }
    }
  }
}
