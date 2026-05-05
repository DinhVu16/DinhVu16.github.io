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
  modelPath: string; // e.g., "../models/ferrari"
  lightColor?: number; // e.g., 0xffffff
  lightIntensity?: number; // e.g., 4.0
  ambientLightColor?: number; // e.g., 0xffffff
  ambientIntensity?: number; // e.g., 0.05
}

export class SceneManager {
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

  private config: SceneConfig; // Store the config

  constructor(container: HTMLElement, config: SceneConfig) {
    this.config = config;
    this.scene = new THREE.Scene();
    // Basic setup: camera, renderer, light, and a simple mesh
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );

    //Renderer setup with WebGPU
    this.renderer = new THREE.WebGPURenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearAlpha(0);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    //Light setup

    const ambColor = this.config.ambientLightColor ?? 0xffffff;
    const ambIntensity = this.config.ambientIntensity ?? 0.05;
    this.scene.add(new THREE.AmbientLight(ambColor, ambIntensity));
    const dirColor = this.config.lightColor ?? 0xffffff;
    this.light = new THREE.DirectionalLight(dirColor);

    this.light.intensity = this.config.lightIntensity ?? 3.0;
    this.scene.add(this.light);
    // Enable shadows for the light

    this.light.castShadow = true;
    this.light.shadow.mapSize.width = 2048;
    this.light.shadow.mapSize.height = 2048;
    this.light.shadow.bias = -0.001; // remove self-shadowing artifacts

    this.light.shadow.radius = 1;
    this.light.shadow.camera.top = 4;
    this.light.shadow.camera.bottom = -4;
    this.light.shadow.camera.left = -4;
    this.light.shadow.camera.right = 4;
    this.light.shadow.camera.near = 0.1;
    this.light.shadow.camera.far = 50;
    //this.light.shadow.autoUpdate = false;

    this.scene.add(this.light.target);

    // Load a GLTF model (replace with your model path)
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("../models/draco/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load(this.config.modelPath, (car) => {
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
    //shadow catcher
    const geometry = new THREE.PlaneGeometry(20, 20);
    geometry.rotateX(-Math.PI / 2);
    const material = new THREE.ShadowMaterial();
    material.opacity = 0.4;
    const plane = new THREE.Mesh(geometry, material);
    plane.position.y = 0.03;
    plane.receiveShadow = true;
    this.scene.add(plane);

    // === 2. THE COMPLETE CONTACT SHADOW SETUP ===
    // A. Make the camera match the approximate bounding box of a car
    // (Width: 4m, Length: 6m) -> left: -2, right: 2, top: 3, bottom: -3
    this.shadowCamera = new THREE.OrthographicCamera(-2, 2, 3, -3, 0, 10);
    this.shadowCamera.position.set(0, 0.01, 0);
    this.shadowCamera.rotation.x = Math.PI / 2;
    this.shadowCamera.updateProjectionMatrix();

    // B. Setup the Render Target to capture the silhouette
    this.contactShadowTarget = new THREE.RenderTarget(1024, 1024, {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });
    this.contactShadowTarget.texture.generateMipmaps = false;

    // C. Create the Depth Material (Renders the car purely black)
    this.depthMaterial = new THREE.NodeMaterial();
    this.depthMaterial.colorNode = vec3(0);
    this.depthMaterial.depthTest = false;
    this.depthMaterial.depthWrite = false;

    // D. Create the Shadow Material
    const shadowPlaneMaterial = new THREE.NodeMaterial();
    shadowPlaneMaterial.transparent = true;
    shadowPlaneMaterial.depthWrite = false;
    shadowPlaneMaterial.colorNode = vec3(0);

    // E. Blur and invert the shadow.
    // Adjusted the blur radius to 6 for a slightly tighter, realistic spread.
    const blurredShadow = gaussianBlur(
      texture(this.contactShadowTarget.texture),
      4,
    );
    shadowPlaneMaterial.opacityNode = blurredShadow.r.oneMinus().mul(0.95);

    // F. Create the physical plane
    // THE SIZE FIX: This MUST exactly match the OrthographicCamera bounds (Width 4, Height 6)
    const shadowPlaneGeometry = new THREE.PlaneGeometry(4, 6);
    shadowPlaneGeometry.rotateX(-Math.PI / 2);
    const contactShadowPlane = new THREE.Mesh(
      shadowPlaneGeometry,
      shadowPlaneMaterial,
    );

    // THE VISIBILITY FIX: Placed at 0.035 so it sits perfectly ON TOP of your base floor (0.03)
    contactShadowPlane.position.y = 0.031;
    this.scene.add(contactShadowPlane);

    //////////////////////////////////////////////////////////////////////
    //mouse event
    this.Mouse = new THREE.Vector2(0, 0);
    this.previousMouse = new THREE.Vector2(0, 0);
    this.targetVelocity = new THREE.Vector2(0, 0);
    this.crVelocity = new THREE.Vector2(0, 0); // Initialize crVelocity
    this.crMousePos = new THREE.Vector2(0, 0); // Initialize crMousePos

    document.addEventListener("mousemove", (e) => {
      this.Mouse.x = e.clientX / container.clientWidth;
      this.Mouse.y = e.clientY / container.clientHeight; // Flip Y for UV space
    });

    // Create a render pipeline
    this.renderPipeline = new THREE.RenderPipeline(this.renderer);
    this.renderPipeline.outputColorTransform = false; // disable default output color transform

    // pre-pass
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
    const prePassVelocity = prePass
      .getTextureNode("velocity")
      .toInspector("Velocity");

    // pre-pass - bandwidth optimization: store normals in 8-bit format instead of 16 or 32 bit float
    const normalTexture = prePass.getTexture("output");
    normalTexture.type = THREE.UnsignedByteType;

    //scenePass
    const scenePass = pass(this.scene, this.camera);
    scenePass.transparent = true;

    //bloomPass
    let bloomPass = bloom(scenePass, 0.1, 0.2, 0.3); // strength, radius, threshold
    //aoPass
    let aoPass = ao(prePassDepth, prePassNormal, this.camera); // depth, normal, and camera inputs
    aoPass.radius = uniform(0.15);
    aoPass.thickness = uniform(4);
    aoPass.distanceExponent = uniform(0.8);
    aoPass.distanceFallOff = uniform(0.5);
    aoPass.resolutionScale = 0.5;
    aoPass.useTemporalFiltering = true;
    const blurAOPass = bilateralBlur(aoPass.getTextureNode());
    blurAOPass.sigma = 2;
    const aoPassOutput = blurAOPass.getTextureNode();

    // scene context
    scenePass.contextNode = builtinAOContext(aoPassOutput.sample(screenUV).r);

    let adjustPass: any;
    adjustPass = scenePass.getTextureNode();

    //adjustPass = adjustPass.add(0.001);
    //adjustPass = adjustPass.mul(1.05);

    let outputPass: any;
    outputPass = adjustPass;
    outputPass = outputPass.add(bloomPass);
    //outputPass = outputPass.rgb.mul(clamp(sssSample, 0, 1));
    outputPass = toneMapping(6, float(1.5), outputPass);
    outputPass = workingToColorSpace(outputPass, THREE.SRGBColorSpace);
    outputPass = saturation(outputPass, 1.35);

    // The final output of the rendering pipeline should be the result of the custom tear effect.
    this.renderPipeline.outputNode = vec4(outputPass, adjustPass.a);
  }

  async init() {
    await this.renderer.init();

    await this.renderer.compileAsync(this.scene, this.camera);
    this.animate();
  }

  private time = new THREE.Timer();
  private animationId: number | null = null;
  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    this.time.update();

    this.light.shadow.camera.up.set(0, 0, 1);

    // 2. Force the Light and Target to calculate their absolute World Matrices
    this.light.updateMatrixWorld();
    this.light.target.updateMatrixWorld();

    // 3. Extract absolute world positions (ignores local group scaling/nesting)
    this.light.shadow.camera.position.setFromMatrixPosition(
      this.light.matrixWorld,
    );

    const targetPosition = new THREE.Vector3();
    targetPosition.setFromMatrixPosition(this.light.target.matrixWorld);

    // 4. Orient the camera and lock its matrix
    this.light.shadow.camera.lookAt(targetPosition);
    this.light.shadow.camera.updateMatrixWorld();

    // 5. Sync the FOV
    this.light.shadow.camera.updateProjectionMatrix();
    ///////////////////////////////////////////////////////////////////////////////////
    this.targetVelocity.x = this.Mouse.x - this.previousMouse.x;
    this.targetVelocity.y = this.Mouse.y - this.previousMouse.y;
    this.previousMouse.copy(this.Mouse);
    this.crVelocity.lerp(this.targetVelocity, 0.1);
    this.crMousePos.lerp(this.Mouse, 0.05);
    /////////////////////////////////////////////////////////////////////////////////////
    // === 3. RENDER THE CONTACT SHADOW ===
    // Save the current scene state
    const initialBackground = this.scene.background;
    const initialOverride = this.scene.overrideMaterial;

    // Setup the scene for silhouette capture
    this.scene.backgroundNode = color(0xffffff); // Clear to pure white
    this.scene.background = null;
    this.scene.overrideMaterial = this.depthMaterial; // Force car to be black

    // Take the snapshot!
    this.renderer.setRenderTarget(this.contactShadowTarget);
    this.renderer.render(this.scene, this.shadowCamera);

    // Restore the scene back to normal
    this.renderer.setRenderTarget(null);
    this.scene.backgroundNode = null;
    this.scene.background = initialBackground;
    this.scene.overrideMaterial = initialOverride;

    // Finally, run your main Post-Processing Pipeline
    this.renderPipeline.render();
  };

  public precompileShaders() {
    if (this.renderer && this.scene && this.camera) {
      // @ts-ignore - Bypass strict WebGPU typing if necessary, but compile is valid
      this.renderer.compile(this.scene, this.camera);
    }
  }

  // === 2. ADD THIS: Forces the textures to upload to VRAM ===
  public warmUpGPU() {
    if (this.renderer && this.scene && this.camera) {
      // 1. Physically render one hidden frame
      this.renderer.render(this.scene, this.camera);
      // 2. Instantly clear it so it doesn't flash on the screen early
      this.renderer.clear();
    }
  }

  // === 3. YOUR EXISTING CLEANUP METHOD ===
  public cleanup(container: HTMLElement) {
    if (this.animationId) cancelAnimationFrame(this.animationId);

    if (this.renderer && container.contains(this.renderer.domElement)) {
      container.removeChild(this.renderer.domElement);
    }

    // Nuke environment maps
    if (this.scene.environment) {
      this.scene.environment.dispose();
      delete (this.scene.environment as any)._webgpuTexture;
      delete (this.scene.environment as any).isWebGPUTexture;
      this.scene.environment = null;
    }

    // Traverse and clean meshes
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

    if (this.renderer) this.renderer.dispose();
    THREE.Cache.clear();
  }

  private disposeMaterialAssets(material: THREE.Material | any) {
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
