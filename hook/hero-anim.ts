import gsap from "gsap";
import { Lightflash, trans_Flash } from "./effect/effect";
import { SceneManager } from "../renders/ferrari";

export const startMainShow = (engine: SceneManager) => {
  const orbitData = { angle: 0.1 * Math.PI }; // Start at 270 degrees (behind the car)
  const masterTl = gsap.timeline({ repeat: -1 });
  //section 1
  masterTl.addLabel("Label1");
  masterTl
    .set(engine.fls, { value: 1 })
    .to(engine.fls, { value: 0, duration: 1, ease: "steps(1)" }, "Label1");
  masterTl
    .set(engine.camera.position, { y: 1, z: 5 }, "Label1")
    .to(
      engine.camera.position,
      {
        y: 0.7,
        z: 5.5,
        duration: 8,
        ease: "none",
      },
      "Label1",
    )
    .addLabel("Label2"); // Ensure camera starts at the correct position
  masterTl.add(Lightflash(engine.camera, engine.light), "Label1");
  masterTl.add(trans_Flash(engine.fls), "Label1+=7.5");
  //section 2
  masterTl.set(
    engine.camera.rotation,
    {
      x: Math.PI * -0.2,
      y: Math.PI * -0.25,
      z: Math.PI * -0.15,
    },
    "Label2",
  );
  masterTl
    .set(engine.camera.position, { x: -1.5, y: 1.5, z: 1 }, "Label2")
    .to(
      engine.camera.position,
      {
        x: -1.5,
        y: 1.5,
        z: 2.5,
        duration: 8,
        ease: "none",
      },
      "Label2",
    )
    .addLabel("Label3");
  masterTl.add(Lightflash(engine.camera, engine.light), "Label2"); // Start at the same time as the previous animation;
  masterTl.add(trans_Flash(engine.fls), "Label2+=7.5");
  //section 3
  masterTl.set(engine.camera.position, { y: 0.4 }, "Label3");
  masterTl.to(
    orbitData,
    {
      angle: Math.PI * 0.25,
      duration: 8,
      ease: "none",
      onUpdate: () => {
        // 2. Calculate new X and Z based on the current angle
        engine.camera.position.x = 3 * Math.cos(orbitData.angle);
        engine.camera.position.z = 3 * Math.sin(orbitData.angle);

        // 3. Keep the camera pointed at the center of the scene
        engine.camera.lookAt(1, 0.4, 1.5);
      },
    },
    "Label3",
  );
  masterTl.add(Lightflash(engine.camera, engine.light), "Label3"); // Start at the same time as the previous animation;
  masterTl
    .set(engine.fls, { value: 0 })
    .to(engine.fls, { value: 1, duration: 1, ease: "steps(1)" }, "Label3+=7");
};
