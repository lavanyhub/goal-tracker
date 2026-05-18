'use client';
import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = mouseX + 'px';
        dotRef.current.style.top = mouseY + 'px';
      }
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = ringX + 'px';
        ringRef.current.style.top = ringY + 'px';
      }
      requestAnimationFrame(animate);
    };

    const onEnter = () => {
      if (dotRef.current) dotRef.current.style.transform = 'translate(-50%,-50%) scale(3)';
      if (ringRef.current) ringRef.current.style.transform = 'translate(-50%,-50%) scale(1.5)';
    };

    const onLeave = () => {
      if (dotRef.current) dotRef.current.style.transform = 'translate(-50%,-50%) scale(1)';
      if (ringRef.current) ringRef.current.style.transform = 'translate(-50%,-50%) scale(1)';
    };

    document.addEventListener('mousemove', onMove);
    animate();

    const addListeners = () => {
      document.querySelectorAll('button, a').forEach(el => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };

    addListeners();
    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', onMove);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={dotRef} style={{
        position: 'fixed',
        width: '8px',
        height: '8px',
        background: '#00d4ff',
        borderRadius: '50%',
        pointerEvents: 'none',
        transform: 'translate(-50%,-50%)',
        transition: 'transform 0.2s ease, background 0.2s ease',
        zIndex: 99999,
        boxShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff55'
      }} />
      <div ref={ringRef} style={{
        position: 'fixed',
        width: '36px',
        height: '36px',
        border: '1.5px solid rgba(0,212,255,0.6)',
        borderRadius: '50%',
        pointerEvents: 'none',
        transform: 'translate(-50%,-50%)',
        transition: 'transform 0.3s ease',
        zIndex: 99998,
      }} />
    </>
  );
}