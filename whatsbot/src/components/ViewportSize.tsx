import { useState, useEffect } from 'react';

function ViewportSize() {
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Só executa no cliente (não no servidor)
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Se ainda não sabemos o tamanho (porque tá no servidor), não renderiza nada
  if (size.width === 0 || size.height === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      left: 10,
      background: 'rgba(0,0,0,0.6)',
      color: 'white',
      padding: '6px 10px',
      fontSize: '12px',
      borderRadius: '8px',
      zIndex: 9999,
    }}>
      {size.width} x {size.height}
    </div>
  );
}

export default ViewportSize;
