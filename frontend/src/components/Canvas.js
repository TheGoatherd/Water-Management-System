import React, { useRef, useEffect, useState } from 'react';
import './Canvas.css';

function Canvas({ data, mode, onAddTank, onAddHome, onDeleteTank, onDeleteHome, onUpdatePosition, onConnectHomeToTank }) {
  const canvasRef = useRef(null);
  const [tankImage, setTankImage] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [drawingLine, setDrawingLine] = useState(null);
  const [animationOffset, setAnimationOffset] = useState(0);
  const [hoveredHouse, setHoveredHouse] = useState(null);
  const [pressureFluctuation, setPressureFluctuation] = useState(0);
  const animationRef = useRef(null);

  // Load tank image
  useEffect(() => {
    const img = new Image();
    img.src = '/images/tank.png';
    img.onload = () => setTankImage(img);
  }, []);

  // Function to draw city background
  const drawCityBackground = (ctx, width, height) => {
    // Modern gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#E3F2FD');
    gradient.addColorStop(1, '#BBDEFB');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw designated reservoir area (top right)
    ctx.fillStyle = 'rgba(96, 125, 139, 0.1)';
    ctx.fillRect(750, 20, 230, 180);
    ctx.strokeStyle = '#607D8B';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(750, 20, 230, 180);
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#546E7A';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('RESERVOIR ZONE', 865, 40); // Centered at 750 + 230/2 = 865
    ctx.textAlign = 'left';
    
    // Draw designated residential zones
    const zones = [
      { x: 50, y: 80, w: 300, h: 200, label: 'RESIDENTIAL ZONE A' },
      { x: 400, y: 80, w: 300, h: 200, label: 'RESIDENTIAL ZONE B' },
      { x: 50, y: 320, w: 300, h: 200, label: 'RESIDENTIAL ZONE C' },
      { x: 400, y: 320, w: 300, h: 200, label: 'RESIDENTIAL ZONE D' },
      { x: 750, y: 320, w: 230, h: 200, label: 'RESIDENTIAL ZONE E' }
    ];
    
    zones.forEach(zone => {
      ctx.fillStyle = 'rgba(76, 175, 80, 0.08)';
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
      ctx.strokeStyle = '#81C784';
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#66BB6A';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(zone.label, zone.x + zone.w / 2, zone.y + 15);
      ctx.textAlign = 'left';
    });
    
    // Draw modern roads
    ctx.strokeStyle = '#90A4AE';
    ctx.lineWidth = 6;
    
    // Horizontal roads
    const hRoads = [70, 290, 530];
    hRoads.forEach(y => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      
      // Road markings
      ctx.strokeStyle = '#ECEFF1';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([15, 15]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = '#90A4AE';
      ctx.lineWidth = 6;
    });
    
    // Vertical roads
    const vRoads = [360, 740];
    vRoads.forEach(x => {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      // Road markings
      ctx.strokeStyle = '#ECEFF1';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([15, 15]);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = '#90A4AE';
      ctx.lineWidth = 6;
    });
    
    // Draw modern buildings
    const buildings = [
      { x: 20, y: 10, w: 50, h: 50, color: '#78909C' },
      { x: 760, y: 240, w: 60, h: 70, color: '#90A4AE' },
      { x: 850, y: 240, w: 50, h: 60, color: '#78909C' },
      { x: 920, y: 240, w: 55, h: 75, color: '#90A4AE' },
      { x: 20, y: 540, w: 45, h: 50, color: '#90A4AE' },
      { x: 760, y: 540, w: 50, h: 50, color: '#78909C' }
    ];
    
    buildings.forEach(b => {
      // Building shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(b.x + 3, b.y + 3, b.w, b.h);
      
      // Building body
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = '#546E7A';
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      
      // Windows
      ctx.fillStyle = '#455A64';
      const rows = Math.floor(b.h / 12);
      const cols = Math.floor(b.w / 12);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          ctx.fillRect(b.x + 5 + i * 12, b.y + 5 + j * 12, 6, 6);
        }
      }
    });
    
    // Draw trees and greenery
    const trees = [
      { x: 100, y: 25 }, { x: 150, y: 25 }, { x: 250, y: 25 },
      { x: 450, y: 25 }, { x: 550, y: 25 }, { x: 650, y: 25 },
      { x: 100, y: 555 }, { x: 200, y: 555 }, { x: 450, y: 555 }, { x: 650, y: 555 }
    ];
    
    trees.forEach(t => {
      // Tree shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.ellipse(t.x, t.y + 15, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Tree trunk
      ctx.fillStyle = '#6D4C41';
      ctx.fillRect(t.x - 2, t.y + 8, 4, 10);
      
      // Tree foliage
      ctx.fillStyle = '#66BB6A';
      ctx.beginPath();
      ctx.arc(t.x, t.y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = 'rgba(129, 199, 132, 0.6)';
      ctx.beginPath();
      ctx.arc(t.x - 3, t.y - 3, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // Helper function to draw animated water flow arrows
  const drawWaterFlowArrows = (ctx, offset) => {
    data.sectors.forEach(sector => {
      sector.tanks.forEach(tank => {
        const connectedHomes = sector.homes.filter(h => h.tankId === tank.id);
        
        if (connectedHomes.length > 0) {
          const tankHeight = 45;
          const tankBottom = tank.y + tankHeight / 2 + 10;
          const mainLineY = tank.y + 40;
          const arrowSpacing = 30;
          const arrowSize = 6;
          
          // Draw arrows on vertical pipe from tank bottom
          const verticalLength = mainLineY - tankBottom;
          for (let i = 0; i < verticalLength; i += arrowSpacing) {
            const arrowY = tankBottom + ((i + offset) % arrowSpacing);
            if (arrowY < mainLineY - 5) {
              ctx.fillStyle = '#00E5FF'; // Cyan for high visibility on green pipes
              ctx.beginPath();
              ctx.moveTo(tank.x, arrowY);
              ctx.lineTo(tank.x - arrowSize / 2, arrowY - arrowSize);
              ctx.lineTo(tank.x + arrowSize / 2, arrowY - arrowSize);
              ctx.closePath();
              ctx.fill();
            }
          }
          
          // Draw arrows on branches to each home
          connectedHomes.forEach(home => {
            const branchLength = Math.abs(home.y - mainLineY);
            const isUpward = home.y < mainLineY; // Check if house is above the main line
            
            // Calculate number of arrows that fit in this branch
            const numArrows = Math.ceil(branchLength / arrowSpacing);
            
            for (let i = 0; i <= numArrows; i++) {
              const progress = ((i * arrowSpacing + offset) % (branchLength + arrowSpacing));
              let arrowY;
              
              if (isUpward) {
                // For houses above the main line, arrows flow upward
                arrowY = mainLineY - progress;
                if (arrowY < mainLineY - 5 && arrowY > home.y + 5) {
                  ctx.fillStyle = '#00E5FF'; // Cyan for high visibility on green pipes
                  ctx.beginPath();
                  ctx.moveTo(home.x, arrowY);
                  ctx.lineTo(home.x - arrowSize / 2, arrowY + arrowSize); // Arrow points up
                  ctx.lineTo(home.x + arrowSize / 2, arrowY + arrowSize);
                  ctx.closePath();
                  ctx.fill();
                }
              } else {
                // For houses below the main line, arrows flow downward
                arrowY = mainLineY + progress;
                if (arrowY > mainLineY + 5 && arrowY < home.y - 5) {
                  ctx.fillStyle = '#00E5FF'; // Cyan for high visibility on green pipes
                  ctx.beginPath();
                  ctx.moveTo(home.x, arrowY);
                  ctx.lineTo(home.x - arrowSize / 2, arrowY - arrowSize); // Arrow points down
                  ctx.lineTo(home.x + arrowSize / 2, arrowY - arrowSize);
                  ctx.closePath();
                  ctx.fill();
                }
              }
            }
            
            // Draw arrows on horizontal main line towards this home
            const direction = home.x > tank.x ? 1 : -1;
            const horizontalLength = Math.abs(home.x - tank.x);
            const numHorizontalArrows = Math.ceil(horizontalLength / arrowSpacing);
            
            for (let i = 0; i <= numHorizontalArrows; i++) {
              const arrowX = tank.x + direction * ((i * arrowSpacing + offset) % (horizontalLength + arrowSpacing));
              const isInRange = direction > 0 ? (arrowX > tank.x + 5 && arrowX < home.x - 5) : (arrowX < tank.x - 5 && arrowX > home.x + 5);
              
              if (isInRange) {
                ctx.fillStyle = '#00E5FF'; // Cyan for high visibility on green pipes
                ctx.beginPath();
                ctx.moveTo(arrowX, mainLineY);
                ctx.lineTo(arrowX - direction * arrowSize, mainLineY - arrowSize / 2);
                ctx.lineTo(arrowX - direction * arrowSize, mainLineY + arrowSize / 2);
                ctx.closePath();
                ctx.fill();
              }
            }
          });
        }
      });
    });
  };

  // Helper function to draw all scene elements
  const drawAllElements = (ctx) => {
    // Draw sectors (no visible boundaries, just for logic)
    data.sectors.forEach(sector => {
      // Draw brown pipes from reservoir to tanks with realistic 3D effect
      sector.tanks.forEach(tank => {
        const pipeWidth = 6;
        
        // Helper function to draw realistic brown pipe segment
        const drawBrownPipeSegment = (x1, y1, x2, y2, isVertical) => {
          // Draw pipe shadow
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = pipeWidth + 2;
          ctx.beginPath();
          ctx.moveTo(x1 + 1, y1 + 1);
          ctx.lineTo(x2 + 1, y2 + 1);
          ctx.stroke();
          
          // Draw main pipe body
          ctx.strokeStyle = '#8B4513';
          ctx.lineWidth = pipeWidth;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          
          // Draw highlight for 3D effect
          ctx.strokeStyle = 'rgba(205, 133, 63, 0.7)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (isVertical) {
            ctx.moveTo(x1 - 1, y1);
            ctx.lineTo(x2 - 1, y2);
          } else {
            ctx.moveTo(x1, y1 - 1);
            ctx.lineTo(x2, y2 - 1);
          }
          ctx.stroke();
        };
        
        // Determine which zone the tank is in to route appropriately
        const tankZone = sector.name.split(' ').pop(); // Gets A, B, C, D, or E
        
        // From reservoir, go down to the top horizontal road (y=70)
        drawBrownPipeSegment(data.reservoir.x, data.reservoir.y, data.reservoir.x, 70, true);
        
        if (tankZone === 'A' || tankZone === 'B') {
          // For zones A and B (top row)
          if (tank.x < 360) {
            // Zone A - use left vertical road
            drawBrownPipeSegment(data.reservoir.x, 70, 360, 70, false);
            drawBrownPipeSegment(360, 70, 360, tank.y, true);
            drawBrownPipeSegment(360, tank.y, tank.x, tank.y, false);
          } else {
            // Zone B - use right vertical road
            drawBrownPipeSegment(data.reservoir.x, 70, 740, 70, false);
            drawBrownPipeSegment(740, 70, 740, tank.y, true);
            drawBrownPipeSegment(740, tank.y, tank.x, tank.y, false);
          }
        } else if (tankZone === 'E') {
          // For zone E (right side)
          drawBrownPipeSegment(data.reservoir.x, 70, 740, 70, false);
          drawBrownPipeSegment(740, 70, 740, tank.y, true);
          drawBrownPipeSegment(740, tank.y, tank.x, tank.y, false);
        } else {
          // For zones C and D (bottom row)
          drawBrownPipeSegment(data.reservoir.x, 70, 740, 70, false);
          drawBrownPipeSegment(740, 70, 740, 290, true);
          
          if (tank.x < 360) {
            // Zone C - go along middle road to left vertical road
            drawBrownPipeSegment(740, 290, 360, 290, false);
            drawBrownPipeSegment(360, 290, 360, tank.y, true);
            drawBrownPipeSegment(360, tank.y, tank.x, tank.y, false);
          } else {
            // Zone D - stay on right vertical road
            drawBrownPipeSegment(740, 290, 740, tank.y, true);
            drawBrownPipeSegment(740, tank.y, tank.x, tank.y, false);
          }
        }
      });
      
      // Draw green water pipes from tanks to homes with realistic 3D effect
      sector.tanks.forEach(tank => {
        const connectedHomes = sector.homes.filter(h => h.tankId === tank.id);
        
        if (connectedHomes.length > 0) {
          const pipeWidth = 6;
          const mainLineY = tank.y + 40;
          const minX = Math.min(...connectedHomes.map(h => h.x));
          const maxX = Math.max(...connectedHomes.map(h => h.x));
          
          // Helper function to draw realistic pipe segment
          const drawPipeSegment = (x1, y1, x2, y2, isVertical) => {
            // Draw pipe shadow
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = pipeWidth + 2;
            ctx.beginPath();
            ctx.moveTo(x1 + 1, y1 + 1);
            ctx.lineTo(x2 + 1, y2 + 1);
            ctx.stroke();
            
            // Draw main pipe body
            ctx.strokeStyle = '#388E3C';
            ctx.lineWidth = pipeWidth;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            
            // Draw highlight for 3D effect
            ctx.strokeStyle = 'rgba(129, 199, 132, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (isVertical) {
              ctx.moveTo(x1 - 1, y1);
              ctx.lineTo(x2 - 1, y2);
            } else {
              ctx.moveTo(x1, y1 - 1);
              ctx.lineTo(x2, y2 - 1);
            }
            ctx.stroke();
          };
          
          // Calculate tank bottom position
          const tankHeight = 45;
          const tankBottom = tank.y + tankHeight / 2 + 10; // Bottom of tank including legs
          
          // Draw vertical pipe from tank bottom to main line
          drawPipeSegment(tank.x, tankBottom, tank.x, mainLineY, true);
          
          // Draw horizontal main line spanning all homes
          drawPipeSegment(minX, mainLineY, maxX, mainLineY, false);
          
          // Draw vertical branches to each home
          connectedHomes.forEach(home => {
            drawPipeSegment(home.x, mainLineY, home.x, home.y, true);
            
            // Draw junction point (valve)
            ctx.fillStyle = '#2E7D32';
            ctx.beginPath();
            ctx.arc(home.x, mainLineY, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#1B5E20';
            ctx.lineWidth = 1;
            ctx.stroke();
          });
          
          // Draw junction point at tank connection (main valve)
          ctx.fillStyle = '#2E7D32';
          ctx.beginPath();
          ctx.arc(tank.x, mainLineY, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#1B5E20';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });
      
      // Draw tanks with water tank design
      sector.tanks.forEach(tank => {
        const tankWidth = 35;
        const tankHeight = 45;
        const tankX = tank.x - tankWidth / 2;
        const tankY = tank.y - tankHeight / 2;
        
        // Draw legs
        ctx.fillStyle = '#1565C0';
        ctx.fillRect(tankX + 5, tankY + tankHeight - 5, 5, 10);
        ctx.fillRect(tankX + tankWidth - 10, tankY + tankHeight - 5, 5, 10);
        
        // Draw main tank body (rounded rectangle)
        ctx.fillStyle = '#42A5F5';
        ctx.beginPath();
        ctx.roundRect(tankX, tankY, tankWidth, tankHeight - 5, 5);
        ctx.fill();
        
        // Draw water level lines
        ctx.strokeStyle = '#1976D2';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tankX, tankY + 15);
        ctx.lineTo(tankX + tankWidth, tankY + 15);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(tankX, tankY + 30);
        ctx.lineTo(tankX + tankWidth, tankY + 30);
        ctx.stroke();
        
        // Draw top pipe
        ctx.fillStyle = '#616161';
        ctx.fillRect(tankX + tankWidth / 2 - 3, tankY - 8, 6, 8);
        
        // Draw ladder
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tankX + tankWidth - 5, tankY + 5);
        ctx.lineTo(tankX + tankWidth - 5, tankY + tankHeight - 5);
        ctx.stroke();
        
        // Ladder rungs
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(tankX + tankWidth - 8, tankY + 10 + i * 8);
          ctx.lineTo(tankX + tankWidth - 2, tankY + 10 + i * 8);
          ctx.stroke();
        }
        
        // Add shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(tankX + 10, tankY + 12, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add label below tank
        ctx.fillStyle = '#333333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Tank', tank.x, tankY + tankHeight + 15);
      });
      
      // Draw homes with house design
      sector.homes.forEach(home => {
        const houseWidth = 24;
        const houseHeight = 20;
        const houseX = home.x - houseWidth / 2;
        const houseY = home.y - houseHeight / 2;
        
        // Draw house base
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(houseX, houseY + 8, houseWidth, houseHeight - 8);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(houseX, houseY + 8, houseWidth, houseHeight - 8);
        
        // Draw roof (triangle)
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.moveTo(houseX - 2, houseY + 8);
        ctx.lineTo(home.x, houseY - 2);
        ctx.lineTo(houseX + houseWidth + 2, houseY + 8);
        ctx.closePath();
        ctx.fill();
        
        // Draw door
        ctx.fillStyle = '#333333';
        ctx.fillRect(houseX + 4, houseY + 14, 6, 8);
        
        // Draw door knob
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(houseX + 8, houseY + 18, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw window
        ctx.fillStyle = '#333333';
        ctx.fillRect(houseX + 14, houseY + 14, 6, 6);
        
        // Draw window panes
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(houseX + 17, houseY + 14);
        ctx.lineTo(houseX + 17, houseY + 20);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(houseX + 14, houseY + 17);
        ctx.lineTo(houseX + 20, houseY + 17);
        ctx.stroke();
        
        // Add label below house
        ctx.fillStyle = '#333333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('House', home.x, houseY + houseHeight + 10);
        
        // Show indicator if not connected
        if (!home.tankId) {
          ctx.fillStyle = 'rgba(255, 152, 0, 0.8)';
          ctx.beginPath();
          ctx.arc(home.x + 10, home.y - 10, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FF6F00';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    });
    
    // Draw reservoir - industrial storage facility with two tanks
    const { x, y } = data.reservoir;
    const resWidth = 120;
    const resHeight = 70;
    const resX = x - resWidth / 2;
    const resY = y - resHeight / 2;
    
    // Draw platform/base
    ctx.fillStyle = '#37474F';
    ctx.fillRect(resX - 5, resY + resHeight - 10, resWidth + 10, 10);
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 2;
    ctx.strokeRect(resX - 5, resY + resHeight - 10, resWidth + 10, 10);
    
    // Draw platform supports
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = '#455A64';
      ctx.fillRect(resX + i * 20, resY + resHeight - 10, 8, 5);
    }
    
    // Function to draw a single storage tank
    const drawStorageTank = (tankX, tankY, width, height) => {
      // Main tank body
      ctx.fillStyle = '#607D8B';
      ctx.fillRect(tankX, tankY, width, height);
      
      // Darker side for 3D effect
      ctx.fillStyle = '#455A64';
      ctx.fillRect(tankX + width * 0.6, tankY, width * 0.4, height);
      
      // Top cap
      ctx.fillStyle = '#78909C';
      ctx.fillRect(tankX + width * 0.4, tankY - 5, width * 0.2, 5);
      
      // Water level lines
      ctx.strokeStyle = '#546E7A';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tankX, tankY + height * 0.33);
      ctx.lineTo(tankX + width, tankY + height * 0.33);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(tankX, tankY + height * 0.66);
      ctx.lineTo(tankX + width, tankY + height * 0.66);
      ctx.stroke();
      
      // Circular hatch/valve
      ctx.strokeStyle = '#37474F';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tankX + width * 0.3, tankY + height * 0.5, 8, 0, Math.PI * 2);
      ctx.stroke();
      
      // Hatch details
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(tankX + width * 0.3, tankY + height * 0.5);
        ctx.lineTo(
          tankX + width * 0.3 + Math.cos(angle) * 6,
          tankY + height * 0.5 + Math.sin(angle) * 6
        );
        ctx.stroke();
      }
    };
    
    // Draw left tank
    drawStorageTank(resX + 5, resY + 10, 45, 50);
    
    // Draw right tank
    drawStorageTank(resX + 65, resY + 10, 45, 50);
    
    // Draw connecting pipes
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 3;
    
    // Top pipes
    ctx.beginPath();
    ctx.moveTo(resX + 27, resY + 5);
    ctx.lineTo(resX + 27, resY - 10);
    ctx.lineTo(resX + 60, resY - 10);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(resX + 87, resY + 5);
    ctx.lineTo(resX + 87, resY - 10);
    ctx.lineTo(resX + 60, resY - 10);
    ctx.stroke();
    
    // Central pipe connector
    ctx.fillStyle = '#37474F';
    ctx.fillRect(resX + 55, resY - 15, 10, 10);
    ctx.strokeRect(resX + 55, resY - 15, 10, 10);
    
    // Label
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Water Storage Reservoir', x, resY + resHeight + 18);
  };

  // Function to calculate pressure based on distance from tank
  const calculatePressure = (home, tank) => {
    if (!home.tankId || !tank) return 0;
    
    // Calculate distance from tank to home
    const distance = Math.sqrt(Math.pow(home.x - tank.x, 2) + Math.pow(home.y - tank.y, 2));
    
    // Max distance in canvas (approximate)
    const maxDistance = 400;
    
    // Pressure ranges from 70 kPa (close) to 35 kPa (far)
    const maxPressure = 70;
    const minPressure = 35;
    
    // Calculate base pressure (inverse relationship with distance)
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    const basePressure = maxPressure - (normalizedDistance * (maxPressure - minPressure));
    
    // Add fluctuation (±2 kPa)
    const pressure = basePressure + pressureFluctuation;
    
    return Math.round(pressure * 10) / 10; // Round to 1 decimal
  };

  // Animation loop for water flow and pressure fluctuation
  useEffect(() => {
    const animate = () => {
      setAnimationOffset(prev => (prev + 0.5) % 30);
      // Fluctuate pressure between -2 and +2 kPa
      setPressureFluctuation(Math.sin(Date.now() / 500) * 2);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw city layout background
    drawCityBackground(ctx, canvas.width, canvas.height);
    
    // Draw all elements
    drawAllElements(ctx);
    
    // Draw animated water flow arrows
    drawWaterFlowArrows(ctx, animationOffset);
    
    // Draw pressure tooltip if hovering over a house
    if (hoveredHouse) {
      const sector = data.sectors.find(s => s.id === hoveredHouse.sectorId);
      if (sector) {
        const home = sector.homes.find(h => h.id === hoveredHouse.homeId);
        const tank = sector.tanks.find(t => t.id === home?.tankId);
        
        if (home && tank) {
          const pressure = calculatePressure(home, tank);
          
          // Draw tooltip background
          const tooltipWidth = 120;
          const tooltipHeight = 50;
          const tooltipX = home.x + 20;
          const tooltipY = home.y - 40;
          
          // Tooltip shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(tooltipX + 2, tooltipY + 2, tooltipWidth, tooltipHeight);
          
          // Tooltip background
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 2;
          ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
          
          // Tooltip text
          ctx.fillStyle = '#333';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('Water Pressure', tooltipX + 10, tooltipY + 20);
          
          // Pressure value with color coding
          const pressureColor = pressure > 55 ? '#4CAF50' : pressure > 45 ? '#FF9800' : '#F44336';
          ctx.fillStyle = pressureColor;
          ctx.font = 'bold 16px Arial';
          ctx.fillText(`${pressure} kPa`, tooltipX + 10, tooltipY + 40);
        }
      }
    }
    
    // Draw preview line if in drawing mode
    if (drawingLine && mode === 'drawLine') {
      const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Redraw everything
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawCityBackground(ctx, canvas.width, canvas.height);
        drawAllElements(ctx);
        drawWaterFlowArrows(ctx, animationOffset);
        
        // Draw preview line on top
        ctx.strokeStyle = 'rgba(156, 39, 176, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(drawingLine.tankX, drawingLine.tankY);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
        ctx.setLineDash([]);
      };
      
      canvas.addEventListener('mousemove', handleMouseMove);
      return () => canvas.removeEventListener('mousemove', handleMouseMove);
    }
    
  }, [data, tankImage, drawingLine, mode, animationOffset, hoveredHouse, pressureFluctuation]);

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (mode === 'addTank') {
      const sector = data.sectors.find(s => 
        x >= s.bounds.x && x <= s.bounds.x + s.bounds.width &&
        y >= s.bounds.y && y <= s.bounds.y + s.bounds.height
      );
      if (sector) {
        onAddTank(sector.id, x, y);
      } else {
        alert('Click inside a residential zone to add a tank');
      }
    } else if (mode === 'addHome') {
      // Place home anywhere in a residential zone
      const sector = data.sectors.find(s => 
        x >= s.bounds.x && x <= s.bounds.x + s.bounds.width &&
        y >= s.bounds.y && y <= s.bounds.y + s.bounds.height
      );
      if (sector) {
        onAddHome(sector.id, x, y);
      } else {
        alert('Click inside a residential zone to place a home');
      }
    } else if (mode === 'drawLine') {
      if (!drawingLine) {
        // First click - select tank
        const sector = data.sectors.find(s => 
          s.tanks.some(t => Math.abs(t.x - x) < 20 && Math.abs(t.y - y) < 25)
        );
        if (sector) {
          const tank = sector.tanks.find(t => Math.abs(t.x - x) < 20 && Math.abs(t.y - y) < 25);
          setDrawingLine({ sectorId: sector.id, tankId: tank.id, tankX: tank.x, tankY: tank.y });
        } else {
          alert('First click on a tank to start drawing a line');
        }
      } else {
        // Second click - select home to connect
        const sector = data.sectors.find(s => s.id === drawingLine.sectorId);
        if (sector) {
          const home = sector.homes.find(h => Math.abs(h.x - x) < 15 && Math.abs(h.y - y) < 15);
          if (home) {
            if (home.tankId === drawingLine.tankId) {
              alert('This home is already connected to this tank!');
            } else if (home.tankId) {
              alert('This home is already connected to another tank. Delete the connection first.');
            } else {
              // Connect home to tank
              onConnectHomeToTank(drawingLine.sectorId, home.id, drawingLine.tankId);
            }
          } else {
            alert('Click on a home to complete the connection');
          }
        }
        setDrawingLine(null);
      }
    } else if (mode === 'delete') {
      // Check if clicked on a tank
      for (const sector of data.sectors) {
        const tank = sector.tanks.find(t => Math.abs(t.x - x) < 20 && Math.abs(t.y - y) < 25);
        if (tank) {
          if (window.confirm('Delete this tank? All connected homes will also be deleted.')) {
            onDeleteTank(sector.id, tank.id);
          }
          return;
        }
      }
      
      // Check if clicked on a home
      for (const sector of data.sectors) {
        const home = sector.homes.find(h => Math.abs(h.x - x) < 15 && Math.abs(h.y - y) < 15);
        if (home) {
          if (window.confirm('Delete this home?')) {
            onDeleteHome(sector.id, home.id);
          }
          return;
        }
      }
      
      alert('Click on a tank or home to delete it');
    }
  };

  const handleMouseDown = (e) => {
    if (mode !== 'view') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicked on a tank
    for (const sector of data.sectors) {
      const tank = sector.tanks.find(t => Math.abs(t.x - x) < 20 && Math.abs(t.y - y) < 25);
      if (tank) {
        setDragging({ type: 'tank', sectorId: sector.id, id: tank.id, offsetX: x - tank.x, offsetY: y - tank.y });
        return;
      }
    }
    
    // Check if clicked on a home
    for (const sector of data.sectors) {
      const home = sector.homes.find(h => Math.abs(h.x - x) < 15 && Math.abs(h.y - y) < 15);
      if (home) {
        setDragging({ type: 'home', sectorId: sector.id, id: home.id, offsetX: x - home.x, offsetY: y - home.y });
        return;
      }
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Handle dragging
    if (dragging && mode === 'view') {
      const newX = x - dragging.offsetX;
      const newY = y - dragging.offsetY;
      onUpdatePosition(dragging.sectorId, dragging.type, dragging.id, newX, newY);
      return;
    }
    
    // Check if hovering over a house (only in view mode)
    if (mode === 'view') {
      let foundHouse = null;
      
      for (const sector of data.sectors) {
        const home = sector.homes.find(h => {
          const houseWidth = 24;
          const houseHeight = 20;
          return Math.abs(h.x - x) < houseWidth / 2 && Math.abs(h.y - y) < houseHeight / 2;
        });
        
        if (home && home.tankId) {
          foundHouse = { sectorId: sector.id, homeId: home.id };
          break;
        }
      }
      
      setHoveredHouse(foundHouse);
    }
  };

  const handleMouseUp = (e) => {
    if (dragging && mode === 'view') {
      // Final position update when mouse is released
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - dragging.offsetX;
      const y = e.clientY - rect.top - dragging.offsetY;
      onUpdatePosition(dragging.sectorId, dragging.type, dragging.id, x, y);
    }
    setDragging(null);
  };

  return (
    <div className="canvas-container">
      <canvas 
        ref={canvasRef} 
        width={1000} 
        height={600}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: mode === 'view' && !dragging ? 'grab' : mode === 'view' && dragging ? 'grabbing' : 'crosshair' }}
      />
      {mode === 'addTank' && (
        <div className="instruction">Click inside a residential zone to place a tank (1 per zone).</div>
      )}
      {mode === 'addHome' && (
        <div className="instruction">Click anywhere in a residential zone to place a home.</div>
      )}
      {mode === 'drawLine' && !drawingLine && (
        <div className="instruction" style={{ background: 'rgba(156, 39, 176, 0.95)' }}>Connect Line: Click on a tank to start.</div>
      )}
      {mode === 'drawLine' && drawingLine && (
        <div className="instruction" style={{ background: 'rgba(156, 39, 176, 0.95)' }}>Tank selected. Click on a home to connect.</div>
      )}
      {mode === 'delete' && (
        <div className="instruction" style={{ background: 'rgba(244, 67, 54, 0.95)' }}>Delete Mode: Click on a tank or home to delete it.</div>
      )}
      {mode === 'view' && (
        <div className="instruction" style={{ background: 'rgba(33, 150, 243, 0.95)' }}>View Mode: Drag tanks and homes to reposition them.</div>
      )}
    </div>
  );
}

export default Canvas;
