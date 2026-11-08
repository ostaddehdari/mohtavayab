'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { shouldUseContinuousAnimation } from '@/lib/motion-policy';

export function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduceMotion) return;
    let disposed = false;
    let destroy: (() => void) | undefined;

    void (async () => {
      const THREE = await import('three');
      if (disposed) return;

      const contextOptions = { alpha: true, antialias: true };
      const context = (canvas.getContext('webgl2', contextOptions) ??
        canvas.getContext('webgl', contextOptions)) as
        WebGLRenderingContext | WebGL2RenderingContext | null;
      if (!context) {
        canvas.dataset.ready = 'fallback';
        return;
      }
      const renderer = new THREE.WebGLRenderer({
        canvas,
        context,
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.z = 4.8;

      const group = new THREE.Group();
      scene.add(group);
      const geometry = new THREE.IcosahedronGeometry(1.55, 3);
      const wireMaterial = new THREE.LineBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.2,
      });
      const pointMaterial = new THREE.PointsMaterial({
        color: 0xa78bfa,
        size: 0.035,
        transparent: true,
        opacity: 0.9,
      });
      const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), wireMaterial);
      const points = new THREE.Points(geometry, pointMaterial);
      group.add(wireframe, points);

      let elementVisible = true;
      let documentVisible = document.visibilityState === 'visible';
      let frame = 0;
      let lastFrame = 0;

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(rect.width, 1);
        const height = Math.max(rect.height, 1);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const render = (time: number) => {
        frame = window.requestAnimationFrame(render);
        if (!shouldUseContinuousAnimation(false, documentVisible, elementVisible)) return;
        if (time - lastFrame < 1000 / 30) return;
        lastFrame = time;
        group.rotation.y += 0.0028;
        group.rotation.x = Math.sin(time * 0.00025) * 0.12;
        renderer.render(scene, camera);
      };

      const intersection = new IntersectionObserver(([entry]) => {
        elementVisible = Boolean(entry?.isIntersecting);
      });
      const resizeObserver = new ResizeObserver(resize);
      const handleVisibility = () => {
        documentVisible = document.visibilityState === 'visible';
      };

      intersection.observe(canvas);
      resizeObserver.observe(canvas);
      document.addEventListener('visibilitychange', handleVisibility);
      resize();
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);

      const cleanup = () => {
        window.cancelAnimationFrame(frame);
        intersection.disconnect();
        resizeObserver.disconnect();
        document.removeEventListener('visibilitychange', handleVisibility);
        geometry.dispose();
        wireframe.geometry.dispose();
        wireMaterial.dispose();
        pointMaterial.dispose();
        renderer.dispose();
      };

      if (disposed) cleanup();
      else {
        canvas.dataset.ready = 'true';
        destroy = cleanup;
      }
    })();

    return () => {
      disposed = true;
      destroy?.();
    };
  }, [reduceMotion]);

  return (
    <div className="network-visual" aria-hidden="true">
      <div className="network-fallback" />
      <canvas ref={canvasRef} />
      <span className="network-chip network-chip--one">تلگرام</span>
      <span className="network-chip network-chip--two">اینستاگرام</span>
      <span className="network-chip network-chip--three">ایتا</span>
    </div>
  );
}
