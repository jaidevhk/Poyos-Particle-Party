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
    let trailLength = 5;          // Default trail length
    let screenshots = [];         // Array to store screenshots
    let isTextAreaFocused = false;
    
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
        tempCtx.font = `bold ${calculatedFontSize}px ${fontFamily}`;
        
        // Measure text and adjust font size if needed
        let metrics = tempCtx.measureText(text);
        let textWidth = metrics.width;
        
        // Adjust font size to fit width while maintaining aspect ratio
        if (textWidth > maxTextWidth) {
            calculatedFontSize *= maxTextWidth / textWidth;
            tempCtx.font = `bold ${calculatedFontSize}px ${fontFamily}`;
            metrics = tempCtx.measureText(text);
            textWidth = metrics.width;
        }
        
        // Set text properties
        tempCtx.font = `bold ${calculatedFontSize}px ${fontFamily}`;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        
        // Center position
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Draw the text
        tempCtx.fillStyle = textFillColor;
        if (textOutlineWidth > 0) {
            tempCtx.strokeStyle = textOutlineColor;
            tempCtx.lineWidth = textOutlineWidth;
            tempCtx.strokeText(text, centerX, centerY);
        }
        tempCtx.fillText(text, centerX, centerY);
        
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
            if (enableTrails && (physicsEnabled || mousePressed)) {
                // Only store position when moving fast enough
                if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
                    this.trail.push({ x: this.x, y: this.y });
                    // Limit trail length
                    if (this.trail.length > trailLength) {
                        this.trail.shift();
                    }
                }
            } else if (!enableTrails && this.trail.length > 0) {
                this.trail = [];
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
            if (enableTrails && this.trail.length > 1) {
                ctx.beginPath();
                ctx.moveTo(this.trail[0].x, this.trail[0].y);
                
                for (let i = 1; i < this.trail.length; i++) {
                    ctx.lineTo(this.trail[i].x, this.trail[i].y);
                }
                
                // Draw line to current position
                ctx.lineTo(this.x, this.y);
                
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
        
        // Reset physics state when circles are regenerated
        physicsEnabled = false;
    }
    
    // Explode effect - send all circles flying
    function explodeCircles() {
        circles.forEach(circle => {
            circle.explode();
        });
    }
    
    // Reset all circles to their original positions
    function resetCircles() {
        circles.forEach(circle => {
            circle.resetPosition();
        });
        
        // Turn off physics after reset
        physicsEnabled = false;
        mousePressed = false;
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Update and draw circles
        circles.forEach(circle => {
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
        handlePointerMove(e);
    }
    
    function handlePointerEnd() {
        touchActive = false;
        mousePressed = false;
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
        }
        
        // Take screenshot with 's' key
        if (e.code === 'KeyS') {
            takeScreenshot();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            mousePressed = false;
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
            trailsControl.classList.add('active');
        } else {
            trailsControl.classList.remove('active');
        }
    });
    
    trailLengthSlider.addEventListener('input', () => {
        trailLength = parseInt(trailLengthSlider.value);
    });
    
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
}); 