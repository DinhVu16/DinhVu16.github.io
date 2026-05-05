import { TempNode } from "three/webgpu";
import {
  Fn,
  uv,
  convertToTexture,
  vec2,
  vec3,
  vec4,
  add,
  mul,
  fract,
  floor,
  div,
  sub,
  smoothstep,
  distance,
  float,
  screenSize,
} from "three/tsl";
import { nodeObject } from "three/src/nodes/TSL.js";

class PixelMorphNode extends TempNode {
  static get type() {
    return "PixelMorphNode";
  }

  constructor(
    textureNode,
    speedNode,
    gridSizeNode,
    offsetNode,
    rangeNode,
    opacityNode,
    velocityNode,
    mouseNode,
  ) {
    super("vec4");

    this.textureNode = textureNode;
    this.speedNode = speedNode;
    this.gridSizeNode = gridSizeNode;
    this.offsetNode = offsetNode;
    this.rangeNode = rangeNode;
    this.opacityNode = opacityNode;
    this.velocityNode = velocityNode;
    this.mouseNode = mouseNode;
  }

  setup(/* builder */) {
    const textureNode = this.textureNode;
    const uvNode = textureNode.uvNode || uv();

    const pixelMorph = Fn(() => {
      const gridSize = this.gridSizeNode;
      const aspect = screenSize.x.div(screenSize.y);
      const grid = vec2(gridSize.mul(aspect), gridSize);

      const gridUV = floor(uvNode.mul(grid)).div(grid);
      const halfTile = float(0.5).div(grid);
      const tileCenter = gridUV.add(halfTile);

      const aspectCenter = vec2(tileCenter.x.mul(aspect), tileCenter.y);
      const aspectMouse = vec2(this.mouseNode.x.mul(aspect), this.mouseNode.y);
      const dist = distance(aspectCenter, aspectMouse);

      const mask = smoothstep(this.rangeNode, 0.0, dist);
      const offset = this.velocityNode.mul(this.offsetNode).mul(mask);
      const finalUV = uvNode.sub(offset);

      const color = textureNode.sample(finalUV);
      return vec4(color);
    });

    return pixelMorph();
  }
}

export default PixelMorphNode;
export const PixelMorph = (node, speed, gridSize, offset, range, opacity, velocity, mouse) => {
  return nodeObject(
    new PixelMorphNode(
      convertToTexture(node),
      nodeObject(speed),
      nodeObject(gridSize),
      nodeObject(offset),
      nodeObject(range),
      nodeObject(opacity),
      velocity, // Already a UniformNode
      mouse, // Already a UniformNode
    ),
  );
};
