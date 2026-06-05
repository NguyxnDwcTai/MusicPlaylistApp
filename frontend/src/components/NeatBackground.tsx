import { useEffect, useRef } from 'react';
import { NeatGradient } from '@firecms/neat';

export default function NeatBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<NeatGradient | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    gradientRef.current = new NeatGradient({
      ref: canvasRef.current,
      colors: [
        { color: '#000000', enabled: true },
        { color: '#001129', enabled: true },
        { color: '#0F0025', enabled: true },
        { color: '#14080A', enabled: true },
        { color: '#001129', enabled: true },
      ],
      speed: 2,
      horizontalPressure: 4,
      verticalPressure: 4,
      waveFrequencyX: 3,
      waveFrequencyY: 2,
      waveAmplitude: 1,
      shadows: 2,
      highlights: 2,
      colorBrightness: 1,
      colorSaturation: -1,
      wireframe: false,
      colorBlending: 7,
      backgroundColor: '#010101',
      backgroundAlpha: 1,
      grainScale: 2,
      grainSparsity: 0,
      grainIntensity: 0,
      grainSpeed: 1,
      resolution: 0.75,
      yOffset: -0.16668701171875,
      yOffsetWaveMultiplier: 2.2,
      yOffsetColorMultiplier: 2.5,
      yOffsetFlowMultiplier: 2.8,
      flowDistortionA: 0.4,
      flowDistortionB: 3,
      flowScale: 3.3,
      flowEase: 0.53,
      flowEnabled: false,
      enableProceduralTexture: false,
      transparentTextureVoid: false,
      textureVoidLikelihood: 0.06,
      textureVoidWidthMin: 10,
      textureVoidWidthMax: 500,
      textureBandDensity: 0.8,
      textureColorBlending: 0.06,
      textureSeed: 333,
      textureEase: 0.68,
      proceduralBackgroundColor: '#003FFF',
      textureShapeTriangles: 20,
      textureShapeCircles: 15,
      textureShapeBars: 15,
      textureShapeSquiggles: 10,
      domainWarpEnabled: false,
      domainWarpIntensity: 0,
      domainWarpScale: 3,
      vignetteIntensity: 0,
      vignetteRadius: 0.8,
      fresnelEnabled: false,
      fresnelPower: 2,
      fresnelIntensity: 0.5,
      fresnelColor: '#FFFFFF',
      iridescenceEnabled: false,
      iridescenceIntensity: 0.5,
      iridescenceSpeed: 1,
      bloomIntensity: 0,
      bloomThreshold: 0.7,
      chromaticAberration: 0,
      shapeType: 'plane',
      shapeRotationX: 0,
      shapeRotationY: 0,
      shapeRotationZ: 0,
      shapeAutoRotateSpeedX: 0,
      shapeAutoRotateSpeedY: 0,
      sphereRadius: 15,
      torusRadius: 15,
      torusTube: 5,
      cylinderRadius: 10,
      cylinderHeight: 40,
      planeBend: 0,
      planeTwist: 0,
      silhouetteFade: 0.25,
      cylinderFade: 0.08,
      ribbonFade: 0.05,
      cameraLock: true,
      cameraX: 0,
      cameraY: 0,
      cameraZ: 0,
      cameraRotationX: 0,
      cameraRotationY: 0,
      cameraRotationZ: 0,
      cameraZoom: 1,
    });

    // React to scroll — update yOffset
    const handleScroll = () => {
      if (gradientRef.current) {
        gradientRef.current.yOffset = window.scrollY * 0.0003;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      gradientRef.current?.destroy();
      gradientRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -20,
        pointerEvents: 'none',
      }}
    />
  );
}
