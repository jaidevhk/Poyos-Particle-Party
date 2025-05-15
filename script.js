document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const textArea = document.getElementById('outline-text');
    const densitySlider = document.getElementById('density-slider');
    const sizeSlider = document.getElementById('size-slider');
    const textFillColorInput = document.getElementById('text-fill-color');
    const textOutlineColorInput = document.getElementById('text-outline-color');
    const textOutlineWidthInput = document.getElementById('text-outline-width');
    const trailColorInput = document.getElementById('trail-color');
    const trailOpacityInput = document.getElementById('trail-opacity');
    const bgColorInput = document.getElementById('bg-color');
    const sectionHeaders = document.querySelectorAll('.section-header');
    const gravitySlider = document.getElementById('gravity-slider');
    const bounceSlider = document.getElementById('bounce-slider');
    const chaosSlider = document.getElementById('chaos-slider');
    const explodeBtn = document.getElementById('explode-btn');
    const resetBtn = document.getElementById('reset-btn');
    const controlsContainer = document.querySelector('.controls-sidebar');
    const trailsCheckbox = document.getElementById('trails-checkbox');
    const trailLengthSlider = document.getElementById('trail-length-slider');
    const trailElasticitySlider = document.getElementById('trail-elasticity-slider');
    const trailQuantitySlider = document.getElementById('trail-quantity-slider');
    const fontSelect = document.getElementById('font-select');
    const fontUpload = document.getElementById('font-upload');
    const customFontInfo = document.querySelector('.custom-font-info');
    
    console.log('Trail elasticity slider element:', trailElasticitySlider); // Debug log
    
    const trailsControl = document.querySelector('.trails-control');
    const screenshotBtn = document.getElementById('screenshot-btn');
    const screenshotsSidebar = document.querySelector('.screenshots-sidebar');
    const screenshotsContainer = document.querySelector('.screenshots-container');
    const closeScreenshotsBtn = document.getElementById('close-screenshots-btn');
    
    let circles = [];
    let width, height;
    let mouseX = 0, mouseY = 0;
    let touchActive = false;
    let mousePressed = false;
    let frameId;
    let textPoints = [];
    let density = 50;
    let circleMinSize = 1;
    let circleMaxSize = 50;
    let textFillColor = '#FFA7CD';
    let textOutlineColor = '#FFFFFF';
    let textOutlineWidth = 1;
    let trailColor = '#FF0000';
    let trailOpacity = 0.5;
    let bgColor = '#000000';
    let gravity = 0;              // Default: no gravity
    let bounce = 0.5;             // Default: medium bounce
    let chaosLevel = 0;           // Default: no chaos
    let physicsEnabled = false;
    let forceFactor = 10;         // Force multiplier for mouse/touch interaction
    let enableTrails = false;     // Default: trails off
    let trailLength = 12;         // Default trail length
    let trailElasticity = 0.5;    // Default trail elasticity (0-1)
    let screenshots = [];         // Array to store screenshots
    let isTextAreaFocused = false;
    let trailQuantity = 100; // Default, will be set to number of circles
    
    // Font management variables
    let selectedFont = 'Arial'; // Default font
    let customFont = null;
    let customFontName = '';
    let customFontLoaded = false;
    let fontFaceObject = null;
    
    // Create batch download button
    const batchDownloadBtn = document.createElement('button');
    batchDownloadBtn.id = 'batch-download-btn';
    batchDownloadBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download All
    `;
    batchDownloadBtn.style.display = 'none';
    batchDownloadBtn.style.alignItems = 'center';
    batchDownloadBtn.style.gap = '8px';
    batchDownloadBtn.style.padding = '8px 16px';
    batchDownloadBtn.style.backgroundColor = 'rgba(100, 100, 220, 0.3)';
    batchDownloadBtn.style.border = '1px solid rgba(100, 100, 220, 0.3)';
    batchDownloadBtn.style.borderRadius = '6px';
    batchDownloadBtn.style.color = '#fff';
    batchDownloadBtn.style.cursor = 'pointer';
    batchDownloadBtn.style.marginLeft = '10px';
    screenshotBtn.parentNode.insertBefore(batchDownloadBtn, screenshotBtn.nextSibling);
    
    // Mobile collapsible sections
    sectionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            // Skip Basic Controls section on all screen sizes
            if (header.querySelector('h3').textContent === 'Basic Controls') return;
            
            const content = header.nextElementSibling;
            const icon = header.querySelector('.toggle-icon');
            
            // Toggle the section
            if (content.classList.contains('open')) {
                content.classList.remove('open');
                icon.classList.remove('open');
            } else {
                content.classList.add('open');
                icon.classList.add('open');
            }
        });
    });
    
    // Add focus tracking for text area
    textArea.addEventListener('focus', () => {
        isTextAreaFocused = true;
    });
    
    textArea.addEventListener('blur', () => {
        isTextAreaFocused = false;
    });
    
    // Screenshots management
    function takeScreenshot() {
        // Don't take screenshot if text area is focused
        if (isTextAreaFocused) return;
        
        try {
            // Create a temporary canvas for the screenshot
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Clear the canvas to ensure transparency
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Draw only the canvas content without background
            tempCtx.drawImage(canvas, 0, 0);
            
            // Create a data URL from the temp canvas
            const dataURL = tempCanvas.toDataURL('image/png');
            
            // Add to screenshots array with timestamp, unique ID, and current background color
            const timestamp = new Date().toLocaleString();
            const id = `screenshot-${Date.now()}`;
            screenshots.push({ 
                id, 
                dataURL, 
                timestamp,
                backgroundColor: bgColor
            });
            
            // Update screenshots sidebar
            updateScreenshotsThumbnails();
            
            // Show the screenshots sidebar if hidden
            screenshotsSidebar.classList.remove('hidden');
            
            // Update batch download button visibility
            updateBatchDownloadButton();
            
            // Provide visual feedback
            provideVisualFeedback();
            
            return dataURL;
        } catch (error) {
            console.error('Error taking screenshot:', error);
            return null;
        }
    }
    
    function provideVisualFeedback() {
        // Create a flash effect on the canvas
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'rgba(255,255,255,0.3)';
        flash.style.zIndex = '5';
        flash.style.animation = 'screenshot-flash 1.5s ease-in-out';
        
        // Add the flash animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes screenshot-flash {
                0% { opacity: 0.3; }
                50% { opacity: 0.9; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        canvas.parentNode.appendChild(flash);
        
        // Remove flash after animation completes
        setTimeout(() => {
            canvas.parentNode.removeChild(flash);
            document.head.removeChild(style);
        }, 1500);
    }
    
    function updateScreenshotsThumbnails() {
        // Clear the container
        screenshotsContainer.innerHTML = '';
        
        // Add each screenshot as a thumbnail in reverse chronological order
        [...screenshots].reverse().forEach(screenshot => {
            const thumbnailItem = document.createElement('div');
            thumbnailItem.classList.add('screenshot-item');
            thumbnailItem.dataset.id = screenshot.id;
            
            // Create a temporary canvas for the thumbnail with background
            const tempCanvas = document.createElement('canvas');
            const img = new Image();
            img.onload = () => {
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                const tempCtx = tempCanvas.getContext('2d');
                
                // Draw background using the screenshot's stored background color
                tempCtx.fillStyle = screenshot.backgroundColor;
                tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                
                // Draw screenshot content
                tempCtx.drawImage(img, 0, 0);
                
                // Create and set up the thumbnail image
                const thumbnailImg = document.createElement('img');
                thumbnailImg.src = tempCanvas.toDataURL('image/png');
                thumbnailImg.alt = `Screenshot ${screenshot.timestamp}`;
                thumbnailImg.title = screenshot.timestamp;
                
                // Add the image to the thumbnail item
                thumbnailItem.appendChild(thumbnailImg);
            
            // Create actions overlay
            const actions = document.createElement('div');
            actions.classList.add('screenshot-actions');
            
            // Download button
            const downloadBtn = document.createElement('button');
            downloadBtn.classList.add('screenshot-download');
            downloadBtn.title = 'Download';
            downloadBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
            `;
            downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                downloadScreenshot(screenshot.id);
            });
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('screenshot-delete');
            deleteBtn.title = 'Delete';
            deleteBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            `;
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteScreenshot(screenshot.id);
            });
            
            // Add buttons to actions
            actions.appendChild(downloadBtn);
            actions.appendChild(deleteBtn);
            
            // Add click to view full-size
            thumbnailItem.addEventListener('click', () => {
                viewFullScreenshot(screenshot.id);
            });
            
                // Add actions to thumbnail
            thumbnailItem.appendChild(actions);
            };
            img.src = screenshot.dataURL;
            
            screenshotsContainer.appendChild(thumbnailItem);
        });
    }
    
    function downloadScreenshot(id) {
        const screenshot = screenshots.find(s => s.id === id);
        if (!screenshot) return;
        
        // Create popup dialog
        const dialog = document.createElement('div');
        dialog.style.position = 'fixed';
        dialog.style.top = '50%';
        dialog.style.left = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.backgroundColor = 'rgba(30, 30, 40, 0.95)';
        dialog.style.padding = '25px';
        dialog.style.borderRadius = '12px';
        dialog.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        dialog.style.zIndex = '10000';
        dialog.style.minWidth = '300px';
        dialog.style.backdropFilter = 'blur(10px)';
        dialog.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        
        // Add title
        const title = document.createElement('h3');
        title.textContent = 'Download Options';
        title.style.color = '#fff';
        title.style.marginBottom = '20px';
        title.style.fontSize = '18px';
        
        // Add filename input
        const filenameGroup = document.createElement('div');
        filenameGroup.style.marginBottom = '20px';
        
        const filenameLabel = document.createElement('label');
        filenameLabel.textContent = 'Filename:';
        filenameLabel.style.display = 'block';
        filenameLabel.style.color = 'rgba(255, 255, 255, 0.9)';
        filenameLabel.style.marginBottom = '8px';
        
        const filenameInput = document.createElement('input');
        filenameInput.type = 'text';
        filenameInput.value = `particle-artwork-${new Date().toISOString().slice(0, 10)}`;
        filenameInput.style.width = '100%';
        filenameInput.style.padding = '8px 12px';
        filenameInput.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        filenameInput.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        filenameInput.style.borderRadius = '6px';
        filenameInput.style.color = '#fff';
        filenameInput.style.fontSize = '14px';
        
        // Add background toggle
        const bgGroup = document.createElement('div');
        bgGroup.style.marginBottom = '25px';
        
        const bgCheckbox = document.createElement('input');
        bgCheckbox.type = 'checkbox';
        bgCheckbox.id = 'bg-toggle';
        bgCheckbox.style.marginRight = '10px';
        
        const bgLabel = document.createElement('label');
        bgLabel.htmlFor = 'bg-toggle';
        bgLabel.textContent = 'Transparent Background';
        bgLabel.style.color = 'rgba(255, 255, 255, 0.9)';
        bgLabel.style.cursor = 'pointer';
        
        // Add buttons
        const buttonGroup = document.createElement('div');
        buttonGroup.style.display = 'flex';
        buttonGroup.style.gap = '10px';
        buttonGroup.style.justifyContent = 'flex-end';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.padding = '8px 16px';
        cancelBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        cancelBtn.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        cancelBtn.style.borderRadius = '6px';
        cancelBtn.style.color = '#fff';
        cancelBtn.style.cursor = 'pointer';
        
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download';
        downloadBtn.style.padding = '8px 16px';
        downloadBtn.style.backgroundColor = 'rgba(100, 100, 220, 0.3)';
        downloadBtn.style.border = '1px solid rgba(100, 100, 220, 0.3)';
        downloadBtn.style.borderRadius = '6px';
        downloadBtn.style.color = '#fff';
        downloadBtn.style.cursor = 'pointer';
        
        // Add hover effects
        [cancelBtn, downloadBtn].forEach(btn => {
            btn.addEventListener('mouseover', () => {
                btn.style.opacity = '0.8';
            });
            btn.addEventListener('mouseout', () => {
                btn.style.opacity = '1';
            });
        });
        
        // Assemble dialog
        filenameGroup.appendChild(filenameLabel);
        filenameGroup.appendChild(filenameInput);
        
        bgGroup.appendChild(bgCheckbox);
        bgGroup.appendChild(bgLabel);
        
        buttonGroup.appendChild(cancelBtn);
        buttonGroup.appendChild(downloadBtn);
        
        dialog.appendChild(title);
        dialog.appendChild(filenameGroup);
        dialog.appendChild(bgGroup);
        dialog.appendChild(buttonGroup);
        
        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100%';
        backdrop.style.height = '100%';
        backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        backdrop.style.backdropFilter = 'blur(3px)';
        backdrop.style.zIndex = '9999';
        
        // Add to document
        document.body.appendChild(backdrop);
        document.body.appendChild(dialog);
        
        // Handle download
        downloadBtn.addEventListener('click', () => {
            const filename = filenameInput.value.trim() || `particle-artwork-${new Date().toISOString().slice(0, 10)}`;
            const transparentBg = bgCheckbox.checked;
            
            // Create a temporary canvas to handle background
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Clear the canvas to ensure transparency
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Get the original screenshot image
            const img = new Image();
            img.onload = () => {
                if (!transparentBg) {
                    // If background is enabled, fill it with the screenshot's stored background color
                    tempCtx.fillStyle = screenshot.backgroundColor;
                    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                }
                
                // Draw the content
                tempCtx.drawImage(img, 0, 0);
                
                // Create download link
                const link = document.createElement('a');
                link.href = tempCanvas.toDataURL('image/png');
                link.download = `${filename}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up
                document.body.removeChild(backdrop);
                document.body.removeChild(dialog);
            };
            img.src = screenshot.dataURL;
        });
        
        // Handle cancel
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(backdrop);
            document.body.removeChild(dialog);
        });
        
        // Handle backdrop click
        backdrop.addEventListener('click', () => {
            document.body.removeChild(backdrop);
            document.body.removeChild(dialog);
        });
        
        // Handle escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(backdrop);
                document.body.removeChild(dialog);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Focus filename input
        filenameInput.focus();
        filenameInput.select();
    }
    
    function deleteScreenshot(id) {
        // Remove from array
        screenshots = screenshots.filter(s => s.id !== id);
        
        // Update UI
        updateScreenshotsThumbnails();
        
        // Update batch download button visibility
        updateBatchDownloadButton();
        
        // Hide sidebar if empty
        if (screenshots.length === 0) {
            screenshotsSidebar.classList.add('hidden');
        }
    }
    
    function viewFullScreenshot(id) {
        const screenshot = screenshots.find(s => s.id === id);
        if (!screenshot) return;
        
        // Create a temporary canvas for the full-size preview
        const tempCanvas = document.createElement('canvas');
        const img = new Image();
        img.onload = () => {
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Draw background using the screenshot's stored background color
            tempCtx.fillStyle = screenshot.backgroundColor;
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Draw screenshot content
            tempCtx.drawImage(img, 0, 0);
            
            // Create the preview overlay
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
            overlay.style.zIndex = '9999';
            overlay.style.display = 'flex';
            overlay.style.flexDirection = 'column';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.padding = '20px';
            overlay.style.cursor = 'pointer';
            
            // Create image
            const previewImg = document.createElement('img');
            previewImg.src = tempCanvas.toDataURL('image/png');
            previewImg.style.maxWidth = '90%';
            previewImg.style.maxHeight = '80%';
            previewImg.style.objectFit = 'contain';
            previewImg.style.border = '1px solid rgba(255,255,255,0.2)';
            previewImg.style.borderRadius = '4px';
            previewImg.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
            
            // Create close button
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = 'Close';
            closeBtn.style.marginTop = '20px';
            closeBtn.style.padding = '10px 20px';
            closeBtn.style.background = 'rgba(255,255,255,0.2)';
            closeBtn.style.color = 'white';
            closeBtn.style.border = 'none';
            closeBtn.style.borderRadius = '4px';
            closeBtn.style.cursor = 'pointer';
            
            // Add to overlay
            overlay.appendChild(previewImg);
            overlay.appendChild(closeBtn);
            document.body.appendChild(overlay);
            
            // Close when clicking anywhere
            overlay.addEventListener('click', () => {
                document.body.removeChild(overlay);
            });
        };
        img.src = screenshot.dataURL;
    }
    
    // Apply canvas background color
    function applyCanvasBackground() {
        document.querySelector('.canvas-container').style.backgroundColor = bgColor;
    }
    
    // Resize handler to maintain canvas clarity
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);
        
        generateCircles();
    }
    
    // Generate text points along the outline
    function getTextPoints(text, fontSize = 120, fontFamily = 'Arial') {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        // Calculate responsive font size based on canvas dimensions
        const minDimension = Math.min(width, height);
        const maxTextWidth = width * 0.8; // Maximum text width is 80% of canvas width
        
        // Start with initial font size
        let calculatedFontSize = Math.min(minDimension * 0.3, fontSize);
        
        // Use the selected font or default to Arial
        const effectiveFontFamily = customFontLoaded ? customFontName : selectedFont;
        tempCtx.font = `bold ${calculatedFontSize}px ${effectiveFontFamily}`;
        
        // Split text by line breaks
        const lines = text.split('\n');
        
        // Calculate total height needed for all lines
        const lineHeight = calculatedFontSize * 1.2; // Add some spacing between lines
        const totalTextHeight = lineHeight * lines.length;
        
        // Measure the widest line
        let maxLineWidth = 0;
        for (const line of lines) {
            const metrics = tempCtx.measureText(line);
            maxLineWidth = Math.max(maxLineWidth, metrics.width);
        }
        
        // Adjust font size to fit width while maintaining aspect ratio
        if (maxLineWidth > maxTextWidth) {
            calculatedFontSize *= maxTextWidth / maxLineWidth;
            tempCtx.font = `bold ${calculatedFontSize}px ${effectiveFontFamily}`;
            
            // Recalculate line height with new font size
            const lineHeight = calculatedFontSize * 1.2;
            const totalTextHeight = lineHeight * lines.length;
        }
        
        // Set text properties
        tempCtx.font = `bold ${calculatedFontSize}px ${effectiveFontFamily}`;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        
        // Center position
        const centerX = width / 2;
        let startY = height / 2 - (totalTextHeight / 2) + (calculatedFontSize / 2);
        
        // Draw each line of text
        lines.forEach((line, index) => {
            const lineY = startY + (index * calculatedFontSize * 1.2);
            
            // Draw the text
            tempCtx.fillStyle = textFillColor;
            if (textOutlineWidth > 0) {
                tempCtx.strokeStyle = textOutlineColor;
                tempCtx.lineWidth = textOutlineWidth;
                tempCtx.strokeText(line, centerX, lineY);
            }
            tempCtx.fillText(line, centerX, lineY);
        });
        
        // Get image data to find filled text points
        const imageData = tempCtx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const points = [];
        
        // Calculate step size based on density and screen size
        const baseStep = Math.max(2, Math.floor(100 / density));
        const step = Math.max(2, Math.floor(baseStep * (minDimension / 1000))); // Scale step with screen size
        
        // Find all pixels that are part of the text
        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const index = (y * width + x) * 4;
                if (data[index + 3] > 0) {
                    points.push({ x, y });
                }
            }
        }
        
        // Adjust number of points based on screen size
        const maxPoints = Math.min(5000, Math.floor(minDimension * 3));
        if (points.length > maxPoints) {
            const selectedPoints = [];
            while (selectedPoints.length < maxPoints) {
                const randomIndex = Math.floor(Math.random() * points.length);
                selectedPoints.push(points[randomIndex]);
                points.splice(randomIndex, 1);
            }
            return selectedPoints;
        }
        
        return points;
    }
    
    // Circle class with physics properties
    class Circle {
        constructor(x, y, radius) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.baseRadius = radius;
            this.targetX = x;
            this.targetY = y;
            this.vx = 0;
            this.vy = 0;
            this.fillColor = textFillColor;
            this.outlineColor = textOutlineColor;
            this.outlineWidth = textOutlineWidth;
            this.mass = this.radius * this.radius;
            this.friction = 0.98;
            this.trail = [];
            this.trailSagging = false; // Track if trail is in sagging state
            this.trailVelocities = []; // Store velocities for each trail point
            this.lockedEndPoint = null; // Store locked position of the trail end
            this._enableTrail = false; // Added for trail control
        }
        
        applyForce(forceX, forceY) {
            // F = m * a, so a = F / m
            const ax = forceX / this.mass;
            const ay = forceY / this.mass;
            
            this.vx += ax;
            this.vy += ay;
        }
        
        explode() {
            const angle = Math.random() * Math.PI * 2;
            const force = 5 + Math.random() * 10;
            this.vx = Math.cos(angle) * force;
            this.vy = Math.sin(angle) * force;
            physicsEnabled = true;
        }
        
        addChaos() {
            if (mousePressed) {
                // Get chaos from slider
                const effectiveChaos = parseFloat(chaosSlider.value);
                this.vx += (Math.random() - 0.5) * effectiveChaos * 0.1;
                this.vy += (Math.random() - 0.5) * effectiveChaos * 0.1;
            }
        }
        
        resetPosition() {
            this.x = this.targetX;
            this.y = this.targetY;
            this.vx = 0;
            this.vy = 0;
        }
        
        update() {
            // Track position for trail if enabled
            if (this._enableTrail && (physicsEnabled || mousePressed)) {
                // Add the current position to the trail
                const currentPoint = { x: this.x, y: this.y };
                
                // If there's already a trail, add intermediate points between the last position and current
                if (this.trail.length > 0) {
                    const lastPoint = this.trail[this.trail.length - 1];
                    const dx = currentPoint.x - lastPoint.x;
                    const dy = currentPoint.y - lastPoint.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // If distance is large enough, add intermediate points
                    const minDistance = this.radius * 0.5; // Minimum distance threshold
                    if (distance > minDistance) {
                        // Calculate how many points to add based on distance
                        const pointsToAdd = Math.min(3, Math.floor(distance / minDistance));
                        
                        if (pointsToAdd > 0) {
                            // Add interpolated points
                            for (let i = 1; i <= pointsToAdd; i++) {
                                const t = i / (pointsToAdd + 1);
                                const interpX = lastPoint.x + dx * t;
                                const interpY = lastPoint.y + dy * t;
                                this.trail.push({ x: interpX, y: interpY });
                                this.trailVelocities.push({ vx: 0, vy: 0 });
                            }
                        }
                    }
                }
                
                // Add the current position
                this.trail.push(currentPoint);
                this.trailVelocities.push({ vx: 0, vy: 0 });
                
                // Limit trail length
                while (this.trail.length > trailLength) {
                    this.trail.shift();
                    this.trailVelocities.shift();
                }
                
                // Reset sagging state when mouse is pressed
                if (mousePressed) {
                    this.trailSagging = false;
                }
            } else if (!this._enableTrail && this.trail.length > 0) {
                this.trail = [];
                this.trailVelocities = [];
            }
            
            // Set trail to sagging state when mouse is released and trails exist
            if (this._enableTrail && !mousePressed && this.trail.length > 0 && !this.trailSagging) {
                this.trailSagging = true;
            }
            
            // Apply gravity to trail points when in sagging state
            if (this.trailSagging && this.trail.length > 1) {
                // First pass: Apply gravity and handle collisions
                for (let i = 0; i < this.trail.length; i++) {
                    // Handle special cases for endpoints
                    if (i === this.trail.length - 1) {
                        // Always update the last point (newest) to match the particle position
                        this.trail[i].x = this.x;
                        this.trail[i].y = this.y;
                        continue;
                    } else if (i === 0 && this.lockedEndPoint) {
                        // Lock the first point (oldest) in place if we have a locked position
                        this.trail[i].x = this.lockedEndPoint.x;
                        this.trail[i].y = this.lockedEndPoint.y;
                        // Clear velocities to prevent movement
                        this.trailVelocities[i].vx = 0;
                        this.trailVelocities[i].vy = 0;
                        continue;
                    }
                    
                    // Calculate distance from ends of the trail
                    const normalizedPos = i / (this.trail.length - 1); // 0 to 1
                    
                    // Create parabolic sagging effect (maximum in middle, zero at ends)
                    // Use a modified curve that allows more sag in the front portion too
                    let sagFactor;
                    
                    if (normalizedPos < 0.2) {
                        // Front part of trail (closest to particle): gradual increase
                        sagFactor = normalizedPos * 5; // 0 to 1 in the first 20%
                    } else if (normalizedPos > 0.8) {
                        // End part of trail (furthest from particle): gradual decrease
                        sagFactor = (1 - normalizedPos) * 5; // 1 to 0 in the last 20%
                    } else {
                        // Middle part: full effect
                        sagFactor = 1.0;
                    }
                    
                    // Apply elasticity factor to control overall sag amount
                    // Make elasticity effect much stronger
                    const amplifiedElasticity = trailElasticity * 10;
                    const effectiveGravity = gravity * sagFactor * amplifiedElasticity * 0.2;
                    
                    // Debugging - log values occasionally
                    if (Math.random() < 0.0001) {
                        console.log('Trail sagging debug:', {
                            gravity,
                            trailElasticity,
                            amplifiedElasticity,
                            sagFactor,
                            effectiveGravity,
                            normalizedPos
                        });
                    }
                    
                    // Apply gravity based on current gravity setting
                    this.trailVelocities[i].vy += effectiveGravity;
                    
                    // Apply some friction
                    this.trailVelocities[i].vx *= 0.98;
                    this.trailVelocities[i].vy *= 0.98;
                    
                    // Update trail point position
                    this.trail[i].x += this.trailVelocities[i].vx;
                    this.trail[i].y += this.trailVelocities[i].vy;
                    
                    // Apply collision with viewport boundaries
                    const trailPointRadius = this.radius * 0.4; // Approximate radius for trail points
                    const dragZoneSize = trailPointRadius * 5; // Size of the drag zone near borders
                    const dragFactor = 0.85; // Strength of drag effect
                    
                    // Check horizontal boundaries
                    if (this.trail[i].x < trailPointRadius) {
                        // Hard collision with left edge
                        this.trail[i].x = trailPointRadius;
                        this.trailVelocities[i].vx *= -bounce * 0.8; // Slightly reduced bounce
                    } else if (this.trail[i].x > width - trailPointRadius) {
                        // Hard collision with right edge
                        this.trail[i].x = width - trailPointRadius;
                        this.trailVelocities[i].vx *= -bounce * 0.8;
                    } else if (this.trail[i].x < dragZoneSize) {
                        // Viscous drag near left edge
                        const dragStrength = 1 - (this.trail[i].x / dragZoneSize);
                        this.trailVelocities[i].vx *= 1 - (dragStrength * dragFactor);
                    } else if (this.trail[i].x > width - dragZoneSize) {
                        // Viscous drag near right edge
                        const dragStrength = 1 - ((width - this.trail[i].x) / dragZoneSize);
                        this.trailVelocities[i].vx *= 1 - (dragStrength * dragFactor);
                    }
                    
                    // Check vertical boundaries
                    if (this.trail[i].y < trailPointRadius) {
                        // Hard collision with top edge
                        this.trail[i].y = trailPointRadius;
                        this.trailVelocities[i].vy *= -bounce * 0.8;
                    } else if (this.trail[i].y > height - trailPointRadius) {
                        // Hard collision with bottom edge
                        this.trail[i].y = height - trailPointRadius;
                        this.trailVelocities[i].vy *= -bounce * 0.8;
                    } else if (this.trail[i].y < dragZoneSize) {
                        // Viscous drag near top edge
                        const dragStrength = 1 - (this.trail[i].y / dragZoneSize);
                        this.trailVelocities[i].vy *= 1 - (dragStrength * dragFactor);
                    } else if (this.trail[i].y > height - dragZoneSize) {
                        // Viscous drag near bottom edge
                        const dragStrength = 1 - ((height - this.trail[i].y) / dragZoneSize);
                        this.trailVelocities[i].vy *= 1 - (dragStrength * dragFactor);
                    }
                }
                
                // Second pass: Apply distance constraints to simulate string-like behavior
                // Do multiple iterations for better stability
                const iterations = 3;
                const maxStretch = this.radius * 1.5; // Maximum distance between points
                
                for (let iter = 0; iter < iterations; iter++) {
                    // Start from second-to-last point and work backwards
                    // (last point is fixed to particle position)
                    for (let i = this.trail.length - 2; i >= 0; i--) {
                        const point = this.trail[i];
                        const nextPoint = this.trail[i + 1];
                        
                        // Calculate distance between points
                        const dx = nextPoint.x - point.x;
                        const dy = nextPoint.y - point.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        // If distance exceeds maximum, move points closer
                        if (distance > maxStretch) {
                            const correction = (distance - maxStretch) / distance;
                            
                            // Calculate displacement
                            const moveX = dx * correction * 0.5;
                            const moveY = dy * correction * 0.5;
                            
                            // Move current point half the distance
                            point.x += moveX;
                            point.y += moveY;
                            
                            // Move next point the other half, unless it's the particle point
                            if (i < this.trail.length - 2) {
                                nextPoint.x -= moveX;
                                nextPoint.y -= moveY;
                            }
                        }
                    }
                }
            }
            
            // Mouse interaction
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const repulsionRange = 100;
            
            // Apply mouse force
            if (distance < repulsionRange) {
                const force = (repulsionRange - distance) / repulsionRange;
                const angle = Math.atan2(dy, dx);
                
                // Push away from mouse with increased force when pressed
                const strengthMultiplier = mousePressed ? forceFactor : 2;
                this.vx -= Math.cos(angle) * force * strengthMultiplier;
                this.vy -= Math.sin(angle) * force * strengthMultiplier;
            }
            
            // Apply chaos when mouse is pressed
            if (mousePressed) {
                physicsEnabled = true;
                this.addChaos();
                
                // Apply gravity if enabled
                this.vy += gravity * 0.1;
                
                // Apply friction
                this.vx *= this.friction;
                this.vy *= this.friction;
                
                // Update position with velocity
                this.x += this.vx;
                this.y += this.vy;
                
                // Boundary collision with bounce effect
                if (this.x < this.radius) {
                    this.x = this.radius;
                    this.vx *= -bounce;
                } else if (this.x > width - this.radius) {
                    this.x = width - this.radius;
                    this.vx *= -bounce;
                }
                
                if (this.y < this.radius) {
                    this.y = this.radius;
                    this.vy *= -bounce;
                } else if (this.y > height - this.radius) {
                    this.y = height - this.radius;
                    this.vy *= -bounce;
                }
            } else {
                // Return to original position when mouse is not pressed
                const targetDx = this.targetX - this.x;
                const targetDy = this.targetY - this.y;
                
                // Stronger return force
                this.vx += targetDx * 0.08;
                this.vy += targetDy * 0.08;
                
                // Damping
                this.vx *= 0.9;
                this.vy *= 0.9;
                
                // Update position
                this.x += this.vx;
                this.y += this.vy;
            }
        }
        
        draw(ctx) {
            // Draw trail if enabled
            if (this._enableTrail && this.trail.length > 1) {
                ctx.beginPath();
                
                // Start at the first trail point
                ctx.moveTo(this.trail[0].x, this.trail[0].y);
                
                // Draw the trail with smooth curve for better visual effect
                if (this.trail.length >= 3) {
                    // Use a cardinal spline for smoother curves with more points
                    for (let i = 1; i < this.trail.length - 1; i++) {
                        // Calculate control points for smoother curves
                        const p0 = i > 0 ? this.trail[i - 1] : this.trail[0];
                        const p1 = this.trail[i];
                        const p2 = this.trail[i + 1];
                        const p3 = i < this.trail.length - 2 ? this.trail[i + 2] : p2;
                        
                        // Tension controls how tight the curve is (0 to 1)
                        const tension = 0.3;
                        
                        // Calculate control points for the curve
                        const cp1x = p1.x + (p2.x - p0.x) * tension;
                        const cp1y = p1.y + (p2.y - p0.y) * tension;
                        const cp2x = p2.x - (p3.x - p1.x) * tension;
                        const cp2y = p2.y - (p3.y - p1.y) * tension;
                        
                        // Draw a bezier curve segment
                        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
                    }
                } else {
                    // If only 2 points, just draw a line
                    for (let i = 1; i < this.trail.length; i++) {
                        ctx.lineTo(this.trail[i].x, this.trail[i].y);
                    }
                }
                
                // Set trail style
                ctx.strokeStyle = trailColor;
                ctx.lineWidth = this.radius * 0.5;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.globalAlpha = trailOpacity;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
            
            // Fill the circle
            ctx.fillStyle = this.fillColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw outline if width > 0
            if (this.outlineWidth > 0) {
                ctx.strokeStyle = this.outlineColor;
                ctx.lineWidth = this.outlineWidth;
                ctx.stroke();
            }
        }
    }
    
    // Circle packing algorithm to avoid overlaps
    function packCircles(points) {
        const packedCircles = [];
        const baseSize = parseInt(sizeSlider.value);
        circleMinSize = baseSize * 0.4;
        circleMaxSize = baseSize * 1.2;
        
        // Randomize the order of points to ensure even distribution
        shuffleArray(points);
        
        // Try to place circles at each point, avoiding overlaps
        points.forEach(point => {
            // Start with a random radius within our range
            const initialRadius = circleMinSize + Math.random() * (circleMaxSize - circleMinSize);
            let radius = initialRadius;
            let canPlace = true;
            
            // Check if this circle overlaps with any existing circle
            for (const circle of packedCircles) {
                const dx = point.x - circle.x;
                const dy = point.y - circle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // If circles would overlap
                if (distance < radius + circle.radius) {
                    // Try to reduce radius to avoid overlap
                    const newRadius = Math.max(circleMinSize, distance - circle.radius - 1);
                    if (newRadius < circleMinSize) {
                        canPlace = false;
                        break;
                    }
                    radius = newRadius;
                }
            }
            
            // If we can place the circle, add it
            if (canPlace) {
                packedCircles.push(new Circle(point.x, point.y, radius));
            }
        });
        
        return packedCircles;
    }
    
    // Helper function to shuffle array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Generate circles based on text
    function generateCircles() {
        circles = [];
        const text = textArea.value;
        
        if (!text.trim()) {
            textPoints = [];
            return;
        }
        
        // Get initial font size based on canvas height
        const minDimension = Math.min(width, height);
        const fontSize = Math.max(minDimension * 0.2, 40);
        textPoints = getTextPoints(text, fontSize);
        
        if (textPoints.length === 0) return;
        
        // Use circle packing to avoid overlaps
        circles = packCircles(textPoints);
        
        // Set trail quantity slider max and value
        if (trailQuantitySlider) {
            trailQuantitySlider.max = circles.length;
            if (trailQuantity > circles.length) trailQuantity = circles.length;
            trailQuantitySlider.value = trailQuantity;
        }
        
        // Reset physics state when circles are regenerated
        physicsEnabled = false;
    }
    
    // Explode effect - send all circles flying
    function explodeCircles() {
        circles.forEach(circle => {
            circle.explode();
            // Reset trail sagging on explode
            circle.trailSagging = false;
            // Clear locked end point
            circle.lockedEndPoint = null;
            // Clear existing trail velocities
            circle.trailVelocities = new Array(circle.trail.length).fill().map(() => ({ vx: 0, vy: 0 }));
        });
    }
    
    // Reset all circles to their original positions
    function resetCircles() {
        circles.forEach(circle => {
            circle.resetPosition();
            // Reset trails and trail sagging on position reset
            circle.trail = [];
            circle.trailVelocities = [];
            circle.trailSagging = false;
            circle.lockedEndPoint = null;
        });
        
        // Turn off physics after reset
        physicsEnabled = false;
        mousePressed = false;
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Update and draw circles
        circles.forEach((circle, i) => {
            // Only enable trails for first trailQuantity circles
            circle._enableTrail = enableTrails && i < trailQuantity;
            circle.update();
            circle.draw(ctx);
        });
        
        frameId = requestAnimationFrame(animate);
    }
    
    // Event listeners
    function handlePointerMove(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        
        // Handle both mouse and touch events
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        
        mouseX = (clientX - rect.left) * (canvas.width / rect.width / window.devicePixelRatio);
        mouseY = (clientY - rect.top) * (canvas.height / rect.height / window.devicePixelRatio);
    }
    
    function handlePointerStart(e) {
        touchActive = true;
        mousePressed = true;
        
        // When starting interaction, reset trail sagging for all particles
        circles.forEach(circle => {
            circle.trailSagging = false;
            circle.lockedEndPoint = null; // Clear the locked end point when interaction starts
        });
        
        handlePointerMove(e);
    }
    
    function handlePointerEnd() {
        touchActive = false;
        mousePressed = false;
        
        // When ending interaction, enable trail sagging for all particles with trails
        circles.forEach(circle => {
            if (circle.trail.length > 0) {
                circle.trailSagging = true;
                
                // Store the position of the oldest point (first in the array) to keep it locked
                if (circle.trail[0]) {
                    circle.lockedEndPoint = { 
                        x: circle.trail[0].x, 
                        y: circle.trail[0].y 
                    };
                }
            }
        });
        
        // Return to text formation gradually
        physicsEnabled = false;
    }
    
    // Event listeners for text control
    textArea.addEventListener('input', () => {
        generateCircles();
    });
    
    // Event listeners for circle appearance controls
    densitySlider.addEventListener('input', () => {
        density = densitySlider.value;
        generateCircles();
    });
    
    sizeSlider.addEventListener('input', () => {
        generateCircles();
    });
    
    // Event listeners for color controls
    textFillColorInput.addEventListener('input', () => {
        textFillColor = textFillColorInput.value;
        circles.forEach(circle => {
            circle.fillColor = textFillColor;
        });
    });
    
    textOutlineColorInput.addEventListener('input', () => {
        textOutlineColor = textOutlineColorInput.value;
        circles.forEach(circle => {
            circle.outlineColor = textOutlineColor;
        });
    });
    
    textOutlineWidthInput.addEventListener('input', () => {
        textOutlineWidth = parseFloat(textOutlineWidthInput.value);
        circles.forEach(circle => {
            circle.outlineWidth = textOutlineWidth;
        });
        generateCircles();
    });
    
    trailColorInput.addEventListener('input', () => {
        trailColor = trailColorInput.value;
    });
    
    trailOpacityInput.addEventListener('input', () => {
        trailOpacity = parseInt(trailOpacityInput.value) / 100;
    });
    
    bgColorInput.addEventListener('input', () => {
        bgColor = bgColorInput.value;
        applyCanvasBackground();
    });
    
    // Event listeners for physics controls
    gravitySlider.addEventListener('input', () => {
        gravity = parseFloat(gravitySlider.value);
    });
    
    bounceSlider.addEventListener('input', () => {
        bounce = parseFloat(bounceSlider.value);
    });
    
    chaosSlider.addEventListener('input', () => {
        // Now chaos is controlled by mouse/touch press
    });
    
    explodeBtn.addEventListener('click', explodeCircles);
    resetBtn.addEventListener('click', resetCircles);
    
    // Unified pointer events for both mouse and touch
    canvas.addEventListener('pointerdown', handlePointerStart);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerEnd);
    canvas.addEventListener('pointerleave', handlePointerEnd);
    
    // Prevent default touch behavior to avoid scrolling while interacting with canvas
    canvas.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    canvas.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    
    // Add keyboard support for space bar to trigger mouse press
    document.addEventListener('keydown', (e) => {
        // Skip keyboard shortcuts if text area is focused
        if (isTextAreaFocused) {
            return;
        }

        if (e.code === 'Space') {
            mousePressed = true;
            // Reset trail sagging when space is pressed
            circles.forEach(circle => {
                circle.trailSagging = false;
                circle.lockedEndPoint = null; // Clear the locked end point
            });
        }
        
        // Take screenshot with 's' key
        if (e.code === 'KeyS') {
            takeScreenshot();
        }
        
        // Trigger explode effect with 'e' key
        if (e.code === 'KeyE') {
            explodeCircles();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            mousePressed = false;
            
            // Enable trail sagging when space is released
            circles.forEach(circle => {
                if (circle.trail.length > 0) {
                    circle.trailSagging = true;
                    
                    // Store the position of the oldest point to keep it locked
                    if (circle.trail[0]) {
                        circle.lockedEndPoint = { 
                            x: circle.trail[0].x, 
                            y: circle.trail[0].y 
                        };
                    }
                }
            });
        }
    });
    
    window.addEventListener('resize', debounce(() => {
        initializeSections();
        resizeCanvas();
    }, 250));
    
    // Helper function for debouncing
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    // Initialize section states
    function initializeSections() {
        document.querySelectorAll('.controls-section').forEach(section => {
            const header = section.querySelector('.section-header');
            const content = section.querySelector('.section-content');
            const icon = header.querySelector('.toggle-icon');
            const title = header.querySelector('h3').textContent;
            
            if (title === 'Basic Controls') {
                content.classList.add('open');
                icon.classList.add('open');
            } else {
                content.classList.remove('open');
                icon.classList.remove('open');
            }
        });
    }
    
    // Initialize
    applyCanvasBackground();
    initializeSections();
    
    // Initially open first section on mobile
    if (window.innerWidth < 768) {
        const firstSection = document.querySelector('.section-content');
        if (firstSection) firstSection.classList.add('open');
    } else {
        // Open all sections on desktop
        document.querySelectorAll('.section-content').forEach(section => {
            section.classList.add('open');
        });
    }
    
    // Hide screenshots sidebar initially
    screenshotsSidebar.classList.add('hidden');
    
    resizeCanvas();
    animate();
    
    // Event listeners for trails control
    trailsCheckbox.addEventListener('change', () => {
        enableTrails = trailsCheckbox.checked;
        if (enableTrails) {
            // Activate all trail control UI elements
            document.querySelectorAll('.trails-control').forEach(control => {
                control.classList.add('active');
            });
            
            // Initialize trail elasticity when trails are enabled
            if (trailElasticitySlider) {
                trailElasticity = parseInt(trailElasticitySlider.value) / 100;
                console.log('Trail elasticity initialized on enable:', trailElasticity);
            }
        } else {
            // Deactivate all trail control UI elements
            document.querySelectorAll('.trails-control').forEach(control => {
                control.classList.remove('active');
            });
        }
    });
    
    trailLengthSlider.addEventListener('input', () => {
        trailLength = parseInt(trailLengthSlider.value);
    });
    
    // Set initial values explicitly
    if (trailElasticitySlider) {
        trailElasticity = parseInt(trailElasticitySlider.value) / 100;
        console.log('Initial trail elasticity:', trailElasticity);
        
        // Add event listener
        trailElasticitySlider.addEventListener('input', () => {
            trailElasticity = parseInt(trailElasticitySlider.value) / 100;
            console.log('Trail elasticity updated to:', trailElasticity);
        });
    } else {
        console.error('Trail elasticity slider not found in DOM');
    }
    
    // Event listeners for screenshot functionality
    screenshotBtn.addEventListener('click', takeScreenshot);
    
    closeScreenshotsBtn.addEventListener('click', () => {
        screenshotsSidebar.classList.add('hidden');
    });

    function updateBatchDownloadButton() {
        if (screenshots.length > 2) {
            batchDownloadBtn.style.display = 'inline-flex';
            console.log('Showing batch download button, screenshots:', screenshots.length); // Debug log
        } else {
            batchDownloadBtn.style.display = 'none';
            console.log('Hiding batch download button, screenshots:', screenshots.length); // Debug log
        }
    }

    function batchDownloadScreenshots() {
        // Create popup dialog
        const dialog = document.createElement('div');
        dialog.style.position = 'fixed';
        dialog.style.top = '50%';
        dialog.style.left = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.backgroundColor = 'rgba(30, 30, 40, 0.95)';
        dialog.style.padding = '25px';
        dialog.style.borderRadius = '12px';
        dialog.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        dialog.style.zIndex = '10000';
        dialog.style.minWidth = '300px';
        dialog.style.backdropFilter = 'blur(10px)';
        dialog.style.border = '1px solid rgba(255, 255, 255, 0.1)';

        // Add title
        const title = document.createElement('h3');
        title.textContent = 'Batch Download Options';
        title.style.color = '#fff';
        title.style.marginBottom = '20px';
        title.style.fontSize = '18px';

        // Add filename prefix input
        const filenameGroup = document.createElement('div');
        filenameGroup.style.marginBottom = '20px';

        const filenameLabel = document.createElement('label');
        filenameLabel.textContent = 'Filename Prefix:';
        filenameLabel.style.display = 'block';
        filenameLabel.style.color = 'rgba(255, 255, 255, 0.9)';
        filenameLabel.style.marginBottom = '8px';

        const filenameInput = document.createElement('input');
        filenameInput.type = 'text';
        filenameInput.value = `particle-artwork-${new Date().toISOString().slice(0, 10)}`;
        filenameInput.style.width = '100%';
        filenameInput.style.padding = '8px 12px';
        filenameInput.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        filenameInput.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        filenameInput.style.borderRadius = '6px';
        filenameInput.style.color = '#fff';
        filenameInput.style.fontSize = '14px';

        // Add background toggle
        const bgGroup = document.createElement('div');
        bgGroup.style.marginBottom = '25px';

        const bgCheckbox = document.createElement('input');
        bgCheckbox.type = 'checkbox';
        bgCheckbox.id = 'batch-bg-toggle';
        bgCheckbox.style.marginRight = '10px';

        const bgLabel = document.createElement('label');
        bgLabel.htmlFor = 'batch-bg-toggle';
        bgLabel.textContent = 'Transparent Background';
        bgLabel.style.color = 'rgba(255, 255, 255, 0.9)';
        bgLabel.style.cursor = 'pointer';

        // Add buttons
        const buttonGroup = document.createElement('div');
        buttonGroup.style.display = 'flex';
        buttonGroup.style.gap = '10px';
        buttonGroup.style.justifyContent = 'flex-end';

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.padding = '8px 16px';
        cancelBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        cancelBtn.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        cancelBtn.style.borderRadius = '6px';
        cancelBtn.style.color = '#fff';
        cancelBtn.style.cursor = 'pointer';

        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download All';
        downloadBtn.style.padding = '8px 16px';
        downloadBtn.style.backgroundColor = 'rgba(100, 100, 220, 0.3)';
        downloadBtn.style.border = '1px solid rgba(100, 100, 220, 0.3)';
        downloadBtn.style.borderRadius = '6px';
        downloadBtn.style.color = '#fff';
        downloadBtn.style.cursor = 'pointer';

        // Add hover effects
        [cancelBtn, downloadBtn].forEach(btn => {
            btn.addEventListener('mouseover', () => {
                btn.style.opacity = '0.8';
            });
            btn.addEventListener('mouseout', () => {
                btn.style.opacity = '1';
            });
        });

        // Assemble dialog
        filenameGroup.appendChild(filenameLabel);
        filenameGroup.appendChild(filenameInput);

        bgGroup.appendChild(bgCheckbox);
        bgGroup.appendChild(bgLabel);

        buttonGroup.appendChild(cancelBtn);
        buttonGroup.appendChild(downloadBtn);

        dialog.appendChild(title);
        dialog.appendChild(filenameGroup);
        dialog.appendChild(bgGroup);
        dialog.appendChild(buttonGroup);

        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100%';
        backdrop.style.height = '100%';
        backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        backdrop.style.backdropFilter = 'blur(3px)';
        backdrop.style.zIndex = '9999';

        // Add to document
        document.body.appendChild(backdrop);
        document.body.appendChild(dialog);

        // Handle batch download
        downloadBtn.addEventListener('click', async () => {
            const filenamePrefix = filenameInput.value.trim() || `particle-artwork-${new Date().toISOString().slice(0, 10)}`;
            const transparentBg = bgCheckbox.checked;

            // Create a zip file
            const zip = new JSZip();

            // Process each screenshot
            for (let i = 0; i < screenshots.length; i++) {
                const screenshot = screenshots[i];
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');

                // Create a promise to handle the image loading
                await new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        // Clear the canvas
                        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

                        if (!transparentBg) {
                            // If background is enabled, fill it with the screenshot's stored background color
                            tempCtx.fillStyle = screenshot.backgroundColor;
                            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                        }

                        // Draw the content
                        tempCtx.drawImage(img, 0, 0);

                        // Convert to blob and add to zip
                        tempCanvas.toBlob((blob) => {
                            zip.file(`${filenamePrefix}-${i + 1}.png`, blob);
                            resolve();
                        }, 'image/png');
                    };
                    img.src = screenshot.dataURL;
                });
            }

            // Generate and download the zip file
            zip.generateAsync({ type: 'blob' }).then((content) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = `${filenamePrefix}-all.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up
                document.body.removeChild(backdrop);
                document.body.removeChild(dialog);
            });
        });

        // Handle cancel
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(backdrop);
            document.body.removeChild(dialog);
        });

        // Handle backdrop click
        backdrop.addEventListener('click', () => {
            document.body.removeChild(backdrop);
            document.body.removeChild(dialog);
        });

        // Handle escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(backdrop);
                document.body.removeChild(dialog);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Focus filename input
        filenameInput.focus();
        filenameInput.select();
    }

    // Add JSZip script dynamically
    function loadJSZip() {
        return new Promise((resolve, reject) => {
            if (window.JSZip) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Add batch download button event listener
    batchDownloadBtn.addEventListener('click', async () => {
        try {
            await loadJSZip();
            batchDownloadScreenshots();
        } catch (error) {
            console.error('Error loading JSZip:', error);
            alert('Failed to load required dependencies. Please try again.');
        }
    });

    if (trailQuantitySlider) {
        trailQuantitySlider.addEventListener('input', () => {
            trailQuantity = parseInt(trailQuantitySlider.value);
        });
    }
    
    // Font control event listeners
    fontSelect.addEventListener('change', () => {
        selectedFont = fontSelect.value;
        
        // If custom font was loaded before, reset it
        if (customFontLoaded) {
            customFontLoaded = false;
            customFont = null;
            customFontName = '';
            customFontInfo.textContent = 'No font uploaded';
        }
        
        // Update text with new font
        generateCircles();
    });
    
    // Font file upload handler
    fontUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            // Create object URL for the font file
            const fontURL = URL.createObjectURL(file);
            
            // Get font name from filename (remove extension)
            customFontName = file.name.replace(/\.[^/.]+$/, "");
            
            // Create a new FontFace object
            fontFaceObject = new FontFace(customFontName, `url(${fontURL})`);
            
            // Load the font and add it to the document fonts
            customFont = await fontFaceObject.load();
            document.fonts.add(customFont);
            
            // Mark custom font as loaded and update UI
            customFontLoaded = true;
            customFontInfo.textContent = `Using custom font: ${customFontName}`;
            
            // Generate circles with the new font
            generateCircles();
        } catch (error) {
            console.error('Error loading custom font:', error);
            customFontInfo.textContent = 'Error loading font: ' + error.message;
            
            // Reset custom font state
            customFontLoaded = false;
            customFont = null;
            customFontName = '';
        }
    });
}); 