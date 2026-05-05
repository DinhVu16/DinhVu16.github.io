import gsap from "gsap";
import * as THREE from "three";
import { SceneManager } from "../renders/ferrari";

export const startMainShow = (
  engine: SceneManager,
  topBar: HTMLDivElement | null,
  bottomBar: HTMLDivElement | null,
  onComplete?: () => void,
) => {
  engine.camera.position.set(-5, 0.7, 8);
  engine.camera.rotation.set(0, -Math.PI / 2, 0);
  engine.light.position.set(0, 3, 0);

  const masterTl = gsap.timeline({
    repeat: 0,
    delay: 0.5,
    onComplete: onComplete,
  });

  if (topBar && bottomBar) {
    masterTl.to(topBar, { y: "-38vh", duration: 1.8, ease: "power3.inOut" }, 0);
    masterTl.to(
      bottomBar,
      { y: "38vh", duration: 1.8, ease: "power3.inOut" },
      0,
    );
  }

  masterTl.addLabel("Label1", 0);
  masterTl
    .to(
      engine.camera.position,
      { z: 0, duration: 2, ease: "power2.inOut" },
      "Label1",
    )
    .to(
      engine.camera.rotation,
      { y: -Math.PI / 2, duration: 2, ease: "power2.inOut" },
      "Label1",
    );
};

export const triggerCameraView = (
  engine: SceneManager,
  view: "side" | "front" | "cockpit",
  topBar: HTMLDivElement | null,
  bottomBar: HTMLDivElement | null,
  barsContainer: HTMLDivElement | null,
) => {
  gsap.killTweensOf(engine.camera.rotation);
  gsap.killTweensOf(engine.camera.position);
  gsap.killTweensOf(engine.light.position);
  gsap.killTweensOf("cameraSweep");
  if (topBar && bottomBar) gsap.killTweensOf([topBar, bottomBar]);
  if (barsContainer) gsap.killTweensOf(barsContainer);

  let targetPosition = { x: 0, y: 0, z: 0 };
  let targetRotation = { x: 0, y: 0, z: 0 };
  let LightPosition = { x: 0, y: 0, z: 0 };

  // === 1. SPLIT THE OFFSETS ===
  let topBarOffset = "38vh";
  let bottomBarOffset = "38vh";
  let containerRotation = 0;

  if (view === "side") {
    targetPosition = { x: -5, y: 0.7, z: 0 };
    targetRotation = { x: 0, y: -Math.PI / 2, z: 0 };
    LightPosition = { x: 0, y: 3, z: 0 };
    topBarOffset = "40vh";
    bottomBarOffset = "40vh";
    containerRotation = 0;
  } else if (view === "front") {
    targetPosition = { x: -1.7, y: 0.5, z: 3.5 };
    targetRotation = { x: 0, y: -Math.PI * 0.2, z: 0 };
    LightPosition = { x: 2, y: 3, z: 0 };
    topBarOffset = "150vh";
    bottomBarOffset = "20vh";
    containerRotation = 20;
  } else if (view === "cockpit") {
    targetPosition = { x: -0, y: 8, z: 0.2 };
    targetRotation = { x: -Math.PI / 2, y: 0, z: 0 };
    LightPosition = { x: 3, y: 3, z: 0 };
    topBarOffset = "84vh";
    bottomBarOffset = "84vh";
    containerRotation = 90;
  }

  const startPos = engine.camera.position.clone();
  const endPos = new THREE.Vector3(
    targetPosition.x,
    targetPosition.y,
    targetPosition.z,
  );
  const controlPoint = new THREE.Vector3()
    .addVectors(startPos, endPos)
    .multiplyScalar(0.5);
  const travelDistance = startPos.distanceTo(endPos);
  controlPoint.x *= 1.3;
  controlPoint.z *= 1.3;
  controlPoint.y += travelDistance * 0.05;

  const curve = new THREE.QuadraticBezierCurve3(startPos, controlPoint, endPos);
  const proxy = { progress: 0 };

  gsap.to(proxy, {
    progress: 1,
    duration: 1.8,
    ease: "power2.inOut",
    id: "cameraSweep",
    onUpdate: () => {
      curve.getPoint(proxy.progress, engine.camera.position);
    },
  });

  gsap.to(engine.camera.rotation, {
    x: targetRotation.x,
    y: targetRotation.y,
    z: targetRotation.z,
    duration: 1.8,
    ease: "power2.inOut",
  });

  gsap.to(engine.light.position, {
    x: LightPosition.x,
    y: LightPosition.y,
    z: LightPosition.z,
    duration: 1.8,
    ease: "power2.inOut",
  });

  // === 3. APPLY THE INDEPENDENT OFFSETS ===
  if (topBar && bottomBar) {
    gsap.to(topBar, {
      y: `-${topBarOffset}`,
      duration: 1.8,
      ease: "power3.inOut",
    });
    gsap.to(bottomBar, {
      y: bottomBarOffset,
      duration: 1.8,
      ease: "power3.inOut",
    });
  }

  if (barsContainer) {
    gsap.to(barsContainer, {
      rotate: containerRotation,
      duration: 1.8,
      ease: "power3.inOut",
    });
  }
};
