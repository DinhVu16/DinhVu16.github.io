"use client";

import { useEffect, useRef } from "react";

export default function SimulatedSmokeShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;

      vec3 Effect(float speed, vec2 uv, float time) {
          float t = mod(time * speed, 60.0);
          float rt = 0.1 * sin(t * 0.45);
          
          mat2 m1 = mat2(cos(rt), -sin(rt), -sin(rt), cos(rt));
          vec2 uva = uv * m1;
          
          float irt = 0.5 * cos(t * 0.05);
          mat2 m2 = mat2(sin(irt), cos(irt), -cos(irt), sin(irt));
          
          // MATHEMATICAL OPTIMIZATION: Loop Unrolling
          // Stepping by 2.0 to skip dead trig calculations on odd iterations.
          for(float i = 1.0; i < 50.0; i += 2.0) {   
              
              // --- THE ODD ITERATION ---
              uva *= m2;
              uva.y -= 1.0; 
              uva.x += 1.0 + (0.5 / i) * cos(t + i * uva.y + 0.5 * (i + 15.0));

              // --- THE EVEN ITERATION ---
              float j = i + 1.0; 
              uva *= m2;
              uva.y += -1.0 + (0.6 / j) * cos(t + j * uva.x + 0.5 * j); 
              uva.x += 1.0 + (0.5 / j) * cos(t + j * uva.y + 0.5 * (j + 15.0));
          }
          
          float n = 0.5;
          float r = n + n * sin(4.0 * uva.x + t);
          float gb = n + n * sin(3.0 * uva.y);
          
          // Color mapped for the F1 Red/Plasma transition
          return vec3(r, gb * 0.8 * r, gb * r);
      }

      void main() {
          // Normalize and fix aspect ratio
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          uv = uv * 2.0 - 1.0; 
          uv.x *= u_resolution.x / u_resolution.y;

          // Call the effect with a fluid speed of 0.8
          vec3 col = Effect(0.05, uv * 0.5, u_time);
          
          // Output with a slight darkening multiplier so it acts as a studio backdrop
          gl_FragColor = vec4(col, 1.0);
      }
    `;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    };
    
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    let animationFrameId: number;
    const startTime = performance.now();

    const render = () => {
      gl.uniform1f(timeLocation, (performance.now() - startTime) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}