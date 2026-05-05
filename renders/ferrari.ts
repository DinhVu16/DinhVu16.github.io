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
  saturation,
  renderOutput,
  toneMapping,
  ShaderNode,
  any,
  mul,
  pow,
  float,
  uniform,
} from "three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { ao } from "three/addons/tsl/display/GTAONode.js";
import { traa } from "three/addons/tsl/display/TRAANode.js";
import { CustomTear } from "./custom_shader/glicth_custom.js";
import { PixelMorph } from "./custom_shader/pixel_morph.js";

export class SceneManager {
  private renderer: THREE.WebGPURenderer;
  private renderPipeline: THREE.RenderPipeline;
  private Mouse: THREE.Vector2;
  private previousMouse: THREE.Vector2;
  private targetVelocity: THREE.Vector2;
  private crVelocity: THREE.Vector2;
  private crMousePos: THREE.Vector2;

  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public mesh: THREE.Object3D | undefined = undefined;
  public light: THREE.SpotLight;
  public fls: ReturnType<typeof uniform>; // This type is already correct from previous fixes

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    // Basic setup: camera, renderer, light, and a simple mesh
    this.camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );

    //Renderer setup with WebGPU
    this.renderer = new THREE.WebGPURenderer({ antialias: false, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    //Light setup
    this.light = new THREE.SpotLight(0xffffff, 1);
    this.light.position.set(0, 5, 0);
    this.light.intensity = 30.0;
    this.scene.add(this.light);
    // Enable shadows for the light
    this.light.castShadow = true;
    this.light.shadow.mapSize.width = 1024;
    this.light.shadow.mapSize.height = 1024;
    this.light.shadow.camera.near = 500;
    this.light.shadow.camera.far = 4000;
    this.light.shadow.camera.fov = 30;
    this.light.shadow.autoUpdate = false;
    this.light.shadow.needsUpdate = true;

    this.scene.add(new THREE.AmbientLight(0xdddddd, 0.5)); // Add some ambient light to soften shadows

    // Load a GLTF model (replace with your model path)
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("../models/draco/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load("../models/F1_Ferrari_Draco", (gltf) => {
      this.mesh = gltf.scene;
      this.scene.add(gltf.scene);
    });
    dracoLoader.dispose();

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
    prePass.transparent = false;

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
    //bloomPass
    let bloomPass = bloom(scenePass, 0.8, 0.4, 0.3); // strength, radius, threshold
    //aoPass
    let aoPass = ao(prePassDepth, prePassNormal, this.camera); // depth, normal, and camera inputs
    aoPass.resolutionScale = 0.25;
    aoPass.useTemporalFiltering = true;
    const aoPassOutput = aoPass.getTextureNode();

    //Adjust Render
    let currentTexture: any;
    // Apply the customTear effect to the scenePass output
    currentTexture = scenePass.getTextureNode();
    currentTexture = mul(currentTexture, pow(2, 1.3));
    currentTexture = saturation(currentTexture, 1.3);

    // scene context
    scenePass.contextNode = builtinAOContext(aoPassOutput.sample(screenUV).r);
    //post-processing pipeline

    // final output + traa
    let traaPass = traa(
      currentTexture.add(bloomPass),
      prePassDepth,
      prePassVelocity,
      this.camera,
    );
    traaPass.useSubpixelCorrection = false;
    const outputPass = renderOutput(
      traaPass,
      THREE.AgXToneMapping,
      THREE.SRGBColorSpace,
    );
    this.fls = uniform(float(0)); // Initialize fls as a UniformNode with a float value of 0.
    const trans = CustomTear(
      // Let TypeScript infer the type of 'trans' as CustomTearNode
      outputPass,
      22,
      1,
      this.fls,
    );

    // The final output of the rendering pipeline should be the result of the custom tear effect.
    this.renderPipeline.outputNode = trans as any; // Temporarily use 'any' to bypass type checking
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
    const delta = this.time.getDelta();
    this.targetVelocity.x = this.Mouse.x - this.previousMouse.x;
    this.targetVelocity.y = this.Mouse.y - this.previousMouse.y;
    this.previousMouse.copy(this.Mouse);
    this.crVelocity.lerp(this.targetVelocity, 0.1);
    this.crMousePos.lerp(this.Mouse, 0.05);

    this.renderPipeline.render();
  };

  public cleanup(container: HTMLElement) {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer.dispose();
    if (container && this.renderer.domElement) {
      if (container.contains(this.renderer.domElement)) {
        container.removeChild(this.renderer.domElement);
      }
    }
    console.log("F1 Engine Shutdown Successfully");
  }
}
