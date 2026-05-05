import { TempNode } from "three/webgpu";
import {
  Fn,
  uv,
  convertToTexture,
  vec2,
  vec3,
  vec4,
  fract,
  step,
  nodeObject,
  rand,
  time,
  float,
  mix,
  clamp,
  floor,
  div,
  smoothstep,
  array,
} from "three/tsl";

class CustomTearNode extends TempNode {
  static get type() {
    return "CustomTearNode";
  }

  constructor(textureNode, speedNode, amountNode, opacityNode) {
    super("vec4");

    this.textureNode = textureNode;
    this.speedNode = speedNode;
    this.amountNode = amountNode;
    this.opacityNode = opacityNode;
  }

  setup(/* builder */) {
    const textureNode = this.textureNode;
    const uvNode = textureNode.uvNode || uv();

    const tearEff = Fn(() => {
      const amount = this.amountNode;
      const slide_off = amount.mul(0.5);
      const color = textureNode.sample(uvNode);
      const speed = floor(time.mul(this.speedNode));
      let col = color;

      const rand_range = Fn(({ t, min, max }) => {
        return min.add(rand(t)).mul(max.mul(2));
      });

      const inside_range = Fn(({ t, btm, top }) => {
        return step(btm, t).sub(step(top, t));
      });

      const gradientMap = array([
        vec4(249, 243, 200, 0).div(vec4(255, 255, 255, 1)),
        vec4(255, 125, 73, 0.3).div(vec4(255, 255, 255, 1)),
        vec4(189, 55, 37, 0.7).div(vec4(255, 255, 255, 1)),
        vec4(84, 14, 31, 1).div(vec4(255, 255, 255, 1)),
      ]);

      const colorRamp = Fn(({ grad, col }) => {
        const value = col.r.add(col.g).add(col.b).mul(0.3333);

        const blend1 = smoothstep(grad[0].w, grad[1].w, value);
        const blend2 = smoothstep(grad[1].w, grad[2].w, value);
        const blend3 = smoothstep(grad[2].w, grad[3].w, value);

        let color = vec3(0);
        color = mix(grad[0].rgb, grad[1].rgb, blend1);
        color = mix(color, grad[2].rgb, blend2);
        color = mix(color, grad[3].rgb, blend3);

        return color;
      });

      let modUV;
      let a;

      for (let i = 0; i < 2; i++) {
        const slice1 = rand(vec2(speed, float(i).add(4722.8448)));
        const slice2 = rand(vec2(speed, float(i).add(845.1345)));

        const offset = vec2(
          rand_range(vec2(speed, 5883.3), float(0).sub(slide_off), slide_off),
          rand_range(
            vec2(speed, float(-589.3)),
            float(0).sub(slide_off),
            slide_off,
          ),
        );

        modUV = fract(uvNode.add(offset));
        a = inside_range(uvNode.y.mul(0.5), slice1, fract(slice1.add(slice2)));
      }

      const gcol = textureNode.sample(modUV);
      const remap = colorRamp(gradientMap, gcol);
      col = mix(col, remap, a);
      col = mix(color, col, this.opacityNode);
      return vec4(col);
    });

    return tearEff();
  }
}
export default CustomTearNode;

export const CustomTear = (node, speed, amount, opacity) => {
  return nodeObject(
    new CustomTearNode(
      convertToTexture(node),
      nodeObject(speed),
      nodeObject(amount),
      nodeObject(opacity),
    ),
  );
};
