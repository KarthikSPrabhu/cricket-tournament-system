import React, { useState, useRef, useEffect } from 'react';

const GroundView = ({ onShotSelect, selectedArea }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const zones = [
    { name: 'cover', color: '#3B82F6', coordinates: { x: 150, y: 100 } },
    { name: 'midwicket', color: '#10B981', coordinates: { x: 150, y: 200 } },
    { name: 'square', color: '#F59E0B', coordinates: { x: 100, y: 150 } },
    { name: 'fine', color: '#EF4444', coordinates: { x: 200, y: 150 } },
    { name: 'straight', color: '#8B5CF6', coordinates: { x: 150, y: 150 } },
    { name: 'third man', color: '#EC4899', coordinates: { x: 50, y: 100 } },
    { name: 'point', color: '#06B6D4', coordinates: { x: 250, y: 100 } },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Draw cricket ground
    drawGround(ctx);
    
    // Draw zones
    zones.forEach(zone => {
      drawZone(ctx, zone);
    });
    
    // Draw selected area
    if (selectedArea) {
      drawShot(ctx, selectedArea);
    }
  }, [selectedArea]);

  const drawGround = (ctx) => {
    // Clear canvas
    ctx.clearRect(0, 0, 300, 300);
    
    // Draw boundary
    ctx.beginPath();
    ctx.arc(150, 150, 140, 0, Math.PI * 2);
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw pitch
    ctx.fillStyle = '#D1D5DB';
    ctx.fillRect(140, 140, 20, 40);
    
    // Draw crease
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 1;
    ctx.strokeRect(145, 140, 10, 5);
    ctx.strokeRect(145, 175, 10, 5);
    
    // Draw stumps
    ctx.fillStyle = '#374151';
    ctx.fillRect(148, 140, 4, 15);
    ctx.fillRect(148, 175, 4, 15);
  };

  const drawZone = (ctx, zone) => {
    ctx.beginPath();
    ctx.arc(zone.coordinates.x, zone.coordinates.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = zone.color;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Zone label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(zone.name, zone.coordinates.x, zone.coordinates.y - 20);
  };

  const drawShot = (ctx, shot) => {
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#DC2626';
    ctx.fill();
    
    // Draw trajectory line from pitch
    ctx.beginPath();
    ctx.moveTo(150, 160);
    ctx.lineTo(shot.x, shot.y);
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw shot effect
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, 15, 0, Math.PI * 2);
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find closest zone
    let closestZone = zones[0];
    let minDistance = Infinity;
    
    zones.forEach(zone => {
      const distance = Math.sqrt(
        Math.pow(x - zone.coordinates.x, 2) + 
        Math.pow(y - zone.coordinates.y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestZone = zone;
      }
    });
    
    if (minDistance < 30) {
      onShotSelect(closestZone.name, { x, y });
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Click on fielding zones to select shot area</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {zones.map(zone => (
            <div key={zone.name} className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: zone.color }}
              />
              <span className="text-sm capitalize">{zone.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          onClick={handleCanvasClick}
          className="border border-gray-300 rounded-lg cursor-crosshair w-full"
        />
        
        {/* Legend */}
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 p-2 rounded text-xs">
          <div>🏏 Pitch</div>
          <div>🎯 Shot Placement</div>
          <div>⭕ Fielding Zones</div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>• Click on colored circles to select shot placement</p>
        <p>• Red dot shows selected shot location</p>
        <p>• Line shows trajectory from batsman</p>
      </div>
    </div>
  );
};

export default GroundView;