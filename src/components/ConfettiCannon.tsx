"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { gsap, Power4 } from 'gsap';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';

// Register GSAP plugins
gsap.registerPlugin(Physics2DPlugin);

// Utilities (replacing lodash for simplicity)
const util_random = (min: number, max: number) => Math.random() * (max - min) + min;
const util_uniqueId = (() => {
  let id = 0;
  return () => `confetti-${id++}`;
})();
const util_pull = (arr: string[], value: string) => {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
};

// Constants
const DECAY = 3.5; // confetti decay in seconds
const SPREAD = 120; // degrees to spread from the angle
const GRAVITY = 1000;
const PARTICLE_COUNT = 300; // Number of confetti particles
const PARTICLE_VELOCITY = 800; // Initial velocity of particles

interface ConfettiSprite {
  angle: number;
  velocity: number;
  x: number;
  y: number;
  r: number; // radius/size
  d: number; // density/thickness
  color: string;
  tilt: number;
  tiltAngleIncremental: number;
  tiltAngle: number;
}

interface ConfettiSprites {
  [id: string]: ConfettiSprite;
}

export interface ConfettiCannonRef {
  fire: (x: number, y: number) => void;
}

const ConfettiCannon = forwardRef<ConfettiCannonRef, object>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiSpriteIds = useRef<string[]>([]);
  const confettiSprites = useRef<ConfettiSprites>({});
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const dpr = useRef(1);

  const setCanvasSize = () => {
    if (canvasRef.current && ctxRef.current) {
      dpr.current = window.devicePixelRatio || 1;
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;

      canvas.width = window.innerWidth * dpr.current;
      canvas.height = window.innerHeight * dpr.current;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr.current, dpr.current);
    }
  };

  const addConfettiParticles = (amount: number, angle: number, velocity: number, x: number, y: number) => {
    let i = 0;
    while (i < amount) {
      const r = util_random(4, 7); // size in logical pixels - INCREASED SIZE
      const d = util_random(15, 25); // thickness/density in logical pixels

      const cr = Math.floor(util_random(50, 255));
      const cg = Math.floor(util_random(50, 200));
      const cb = Math.floor(util_random(50, 200));
      const color = `rgb(${cr}, ${cg}, ${cb})`;

      const tilt = util_random(-10, 10);
      const tiltAngleIncremental = util_random(0.05, 0.09);
      const tiltAngle = 0;

      const id = util_uniqueId();
      const sprite: ConfettiSprite = {
        angle,
        velocity,
        x,
        y,
        r,
        d,
        color,
        tilt,
        tiltAngleIncremental,
        tiltAngle,
      };

      confettiSprites.current[id] = sprite;
      confettiSpriteIds.current.push(id);
      tweenConfettiParticle(id);
      i++;
    }
  };

  const tweenConfettiParticle = (id: string) => {
    const sprite = confettiSprites.current[id];
    if (!sprite) return;

    const minAngle = sprite.angle - SPREAD / 2;
    const maxAngle = sprite.angle + SPREAD / 2;

    const minVelocity = sprite.velocity / 2;
    const maxVelocity = sprite.velocity;

    const particleVelocity = util_random(minVelocity, maxVelocity);
    const particleAngle = util_random(minAngle, maxAngle);
    
    // Use x and y from sprite as these are the particle's starting point
    gsap.to(sprite, {
      duration: DECAY,
      physics2D: {
        velocity: particleVelocity,
        angle: particleAngle,
        gravity: GRAVITY,
        friction: util_random(0.05, 0.15),
      },
      // d: 0, // This was for rectangle width, might not be needed for line style
      ease: Power4.easeIn,
      onComplete: () => {
        util_pull(confettiSpriteIds.current, id);
        delete confettiSprites.current[id];
      },
    });
  };

  const updateConfettiParticle = (id: string) => {
    const sprite = confettiSprites.current[id];
    if (!sprite) return;

    // const tiltAngle = 0.0005 * sprite.d; // Original calculation, d is thickness here
    
    sprite.tiltAngle += sprite.tiltAngleIncremental;
    sprite.tilt = (Math.sin(sprite.tiltAngle - (sprite.r / 2))) * sprite.r * 1.5; // Adjust multiplier for effect
    
    // GSAP's Physics2DPlugin handles x and y updates based on velocity, angle, gravity
    // We might not need manual x, y updates here unless for very specific effects outside physics
  };

  const drawConfetti = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    confettiSpriteIds.current.forEach(id => {
      const sprite = confettiSprites.current[id];
      if (!sprite) return;

      ctx.beginPath();
      // Simple line-style confetti, you can make this more complex (e.g., drawing rectangles)
      ctx.lineWidth = sprite.d / 15; // Adjust line width based on logical density (thinner lines)
      ctx.strokeStyle = sprite.color;
      ctx.moveTo(sprite.x + sprite.tilt, sprite.y);
      ctx.lineTo(sprite.x + sprite.tilt + sprite.r, sprite.y + sprite.tilt + sprite.r); // Draw a small line
      ctx.stroke();

      updateConfettiParticle(id); // For non-physics based visual updates like tilt
    });
  };
  
  const render = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width / dpr.current, canvas.height / dpr.current);
      drawConfetti();
    } else if (!confettiSpriteIds.current.length) { // Only log if not actively drawing
        // console.log("[ConfettiCannon] Render skipped: no ctx or canvas, or no particles to draw initially.");
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d');
      dpr.current = window.devicePixelRatio || 1;
      setCanvasSize();

      gsap.ticker.add(render);
      window.addEventListener('resize', setCanvasSize);

      return () => {
        gsap.ticker.remove(render);
        window.removeEventListener('resize', setCanvasSize);
        confettiSpriteIds.current = [];
        confettiSprites.current = {};
      };
    } else {
    //   console.warn("[ConfettiCannon] Canvas ref NOT found in useEffect.");
    }
  }, []); // Removed render from dependency array to avoid re-running setup on each render

  useImperativeHandle(ref, () => ({
    fire: (x: number, y: number) => {
      const screenCenterX = window.innerWidth / 2;
      addConfettiParticles(PARTICLE_COUNT, -90, PARTICLE_VELOCITY, screenCenterX, y);
    }
  }));

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none', // Make sure canvas doesn't block interactions
        zIndex: 9999, // Ensure it's on top
      }}
    />
  );
});

ConfettiCannon.displayName = "ConfettiCannon";
export default ConfettiCannon; 