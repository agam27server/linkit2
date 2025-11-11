import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Draw a rounded rectangle on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} width - Width
 * @param {number} height - Height
 * @param {number} radius - Corner radius
 */
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draw a stylish QR code eye (corner square) with gradient
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} size - Size of the eye
 * @param {string} color1 - Primary color
 * @param {string} color2 - Secondary color for gradient
 */
function drawStylishEye(ctx, x, y, size, color1, color2) {
  const outerSize = size;
  const innerSize = size * 0.43;
  const outerRadius = size * 0.25;
  const innerRadius = size * 0.15;
  
  // Outer square with gradient
  const gradient = ctx.createLinearGradient(x, y, x + outerSize, y + outerSize);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  
  ctx.fillStyle = gradient;
  roundRect(ctx, x, y, outerSize, outerSize, outerRadius);
  ctx.fill();
  
  // Inner white square
  const innerX = x + (outerSize - innerSize) / 2;
  const innerY = y + (outerSize - innerSize) / 2;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, innerX, innerY, innerSize, innerSize, innerRadius);
  ctx.fill();
  
  // Inner colored dot
  const dotSize = innerSize * 0.6;
  const dotX = innerX + (innerSize - dotSize) / 2;
  const dotY = innerY + (innerSize - dotSize) / 2;
  ctx.fillStyle = color1;
  roundRect(ctx, dotX, dotY, dotSize, dotSize, dotSize * 0.3);
  ctx.fill();
}

/**
 * Generate a beautiful styled QR code with logo
 * @param {string} url - The URL to encode in the QR code
 * @returns {Promise<string>} - Base64 data URL of the styled QR code
 */
export const generateQRCode = async (url) => {
  try {
    console.log('QR Helper: Generating styled QR code for URL:', url);
    
    // Validate URL
    if (!url || typeof url !== 'string' || url.trim() === '') {
      throw new Error('Invalid URL provided for QR code generation');
    }
    
    // Generate QR code matrix data
    const qrMatrix = await QRCode.create(url, {
      errorCorrectionLevel: 'H',
    });
    
    const moduleCount = qrMatrix.modules.size;
    const canvasSize = 600;
    const margin = 30;
    const qrSize = canvasSize - margin * 2;
    const moduleSize = qrSize / moduleCount;
    const dotSize = moduleSize * 0.85; // Size of each dot (smaller than module for gaps)
    
    // Create canvas with white background
    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext('2d');
    
    // Background with subtle gradient
    const bgGradient = ctx.createRadialGradient(
      canvasSize / 2, canvasSize / 2, 0,
      canvasSize / 2, canvasSize / 2, canvasSize / 2
    );
    bgGradient.addColorStop(0, '#FFFFFF');
    bgGradient.addColorStop(1, '#F8F9FA');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // Color scheme
    const primaryColor = '#4caf50';
    const secondaryColor = '#45a049';
    
    // Eye positions (0-indexed)
    const eyePositions = [
      { x: 0, y: 0 }, // Top-left
      { x: moduleCount - 7, y: 0 }, // Top-right
      { x: 0, y: moduleCount - 7 }, // Bottom-left
    ];
    
    // Track eye modules to skip
    const isEye = (x, y) => {
      for (const eye of eyePositions) {
        if (x >= eye.x && x < eye.x + 7 && y >= eye.y && y < eye.y + 7) {
          return true;
        }
      }
      return false;
    };
    
    // Draw data modules as rounded dots with gradient
    for (let y = 0; y < moduleCount; y++) {
      for (let x = 0; x < moduleCount; x++) {
        const module = qrMatrix.modules.get(y * moduleCount + x);
        
        if (module && !isEye(x, y)) {
          const xPos = margin + x * moduleSize + (moduleSize - dotSize) / 2;
          const yPos = margin + y * moduleSize + (moduleSize - dotSize) / 2;
          
          // Create subtle gradient for each dot
          const dotGradient = ctx.createLinearGradient(xPos, yPos, xPos + dotSize, yPos + dotSize);
          dotGradient.addColorStop(0, primaryColor);
          dotGradient.addColorStop(1, secondaryColor);
          
          ctx.fillStyle = dotGradient;
          ctx.beginPath();
          ctx.arc(
            xPos + dotSize / 2,
            yPos + dotSize / 2,
            dotSize / 2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
    
    // Draw stylish eyes
    const eyeSize = moduleSize * 7;
    eyePositions.forEach(eye => {
      const xPos = margin + eye.x * moduleSize;
      const yPos = margin + eye.y * moduleSize;
      drawStylishEye(ctx, xPos, yPos, eyeSize, primaryColor, secondaryColor);
    });
    
    // Add logo in center
    const possibleLogoPaths = [
      path.join(__dirname, '../../frontend2/public/images/newLogo.png'),
      path.join(__dirname, '../../frontend2/public/images/logo.svg'),
      path.join(__dirname, '../../frontend2/public/images/logo_light_mode.svg'),
    ];
    
    let logoPath = null;
    for (const testPath of possibleLogoPaths) {
      if (fs.existsSync(testPath)) {
        logoPath = testPath;
        console.log('QR Helper: Found logo at:', logoPath);
        break;
      }
    }
    
    if (logoPath) {
      try {
        const logo = await loadImage(logoPath);
        const logoSize = 90;
        const logoX = (canvasSize - logoSize) / 2;
        const logoY = (canvasSize - logoSize) / 2;
        
        // Draw circular white background with shadow
        const bgSize = logoSize + 24;
        const bgX = (canvasSize - bgSize) / 2;
        const bgY = (canvasSize - bgSize) / 2;
        
        // Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;
        
        // White circle background
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(bgX + bgSize / 2, bgY + bgSize / 2, bgSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw logo
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        
        console.log('QR Helper: Logo added successfully to styled QR code');
      } catch (logoError) {
        console.warn('QR Helper: Could not load logo:', logoError.message);
      }
    }
    
    // Convert to data URL
    const finalDataUrl = canvas.toDataURL('image/png', 1.0);
    
    // Validate result
    if (!finalDataUrl || !finalDataUrl.startsWith('data:image')) {
      throw new Error('QR code generation returned invalid result');
    }
    
    console.log('QR Helper: Styled QR code generated successfully, length:', finalDataUrl.length);
    return finalDataUrl;
  } catch (error) {
    console.error('QR Helper: Error generating QR code:', error);
    console.error('QR Helper: Error stack:', error.stack);
    throw error;
  }
};

/**
 * Generate QR code for user profile URL
 * @param {string} username - The username to generate profile URL for
 * @param {string} baseUrl - Base URL of the application (e.g., http://localhost:3000)
 * @returns {Promise<string>} - Base64 data URL of the QR code
 */
export const generateProfileQRCode = async (username, baseUrl) => {
  try {
    const profileUrl = `${baseUrl}/profile/${username}`;
    console.log('QR Helper: Generating profile QR code for:', username);
    console.log('QR Helper: Profile URL will be:', profileUrl);
    const result = await generateQRCode(profileUrl);
    console.log('QR Helper: Profile QR code generated successfully');
    return result;
  } catch (error) {
    console.error('QR Helper: Error in generateProfileQRCode:', error);
    throw error;
  }
};

