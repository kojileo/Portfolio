import React, { useRef, useEffect } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { TextureLoader } from "three";
import { OrbitControls } from "@react-three/drei";
import earthTextureUrl from "../assets/3d/earth.jpg";

export function Earth({
  isRotating,
  setIsRotating,
  setCurrentStage,
  ...props
}) {
  const earthRef = useRef();
  const texture = useLoader(TextureLoader, earthTextureUrl);
  const { viewport } = useThree();

  // 回転速度と最後のマウスX位置の参照
  const lastX = useRef(0);
  const rotationSpeed = useRef(0);
  const dampingFactor = 0.95;

  const handlePointerDown = (event) => {
    event.stopPropagation();
    setIsRotating(true);
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    lastX.current = clientX;
  };

  const handlePointerUp = (event) => {
    event.stopPropagation();
    setIsRotating(false);
  };

  const handlePointerMove = (event) => {
    if (isRotating) {
      event.stopPropagation();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const delta = (clientX - lastX.current) / viewport.width;
      earthRef.current.rotation.y += delta * 2 * Math.PI; // 地球の回転速度を調整
      lastX.current = clientX;
      rotationSpeed.current = delta;
    }
  };

  useEffect(() => {
    // ポインタイベントとキーボードイベントのリスナーを設定
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [isRotating]); // 依存関係に isRotating を追加

  useFrame(() => {
    if (!isRotating) {
      rotationSpeed.current *= dampingFactor;
      if (Math.abs(rotationSpeed.current) < 0.001) {
        rotationSpeed.current = 0;
      }
      earthRef.current.rotation.y += rotationSpeed.current;
    }
  });

  return (
    <mesh ref={earthRef} {...props}>
      <sphereGeometry args={[20, 32, 32]} />
      <meshStandardMaterial map={texture} />
      <OrbitControls />
    </mesh>
  );
}
