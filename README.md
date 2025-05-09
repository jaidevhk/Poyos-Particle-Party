# Interactive Circle Packing Visualization

An interactive HTML5 canvas-based visualization where editable text outlines are filled with circles using a circle packing algorithm. When your mouse or touch input gets close to the circles, they are pushed away, creating an interactive experience.

## Features

- Type any text in the textarea to create an outline filled with circles
- Interactive mouse/touch repulsion - circles get pushed away as you move closer
- Adjust circle density with the slider
- Responsive design that works on both desktop and mobile devices
- Minimalist clean design

## How to Use

1. Open `index.html` in a modern web browser
2. Type or edit the text in the text area at the bottom
3. Move your mouse (or finger on touch devices) near the circles to see them react
4. Adjust the density slider to change how many circles are used

## Technical Details

This project uses:
- HTML5 Canvas for rendering
- JavaScript for animation and interactivity
- CSS for styling
- No external libraries or dependencies

The circle packing algorithm works by:
1. Rendering the text to a temporary canvas
2. Detecting the outline of the text
3. Placing circles along the detected outline
4. Adding physics-based interaction for the repulsion effect

## Browser Compatibility

Works in all modern browsers that support HTML5 Canvas:
- Chrome
- Firefox
- Safari
- Edge 

# Poyo Particle Party

An interactive particle system that generates circles from text and allows you to interact with them using mouse/touch input.

## Features

- Text-to-particles conversion: Type any text and watch it come to life as interactive particles
- Interactive physics: Push particles with your mouse/touch and watch them bounce back into place
- Particle trails: Enable particle trails for a more dynamic visual effect
- Customizable appearance: Change colors, size, density and physics properties
- Responsive design: Works on desktop, tablet, and mobile devices

## How to Run

Simply open the `PoyoParticleParty.html` file in a modern web browser.

## Controls

Press the **H** key to toggle the controls panel.

### Basic Controls
- **Circle Density**: Adjust how many particles are used to form the text
- **Circle Size**: Change the size of the particles
- **Particle Trails**: Enable/disable trails that follow particles when moving
- **Trail Length**: Adjust how long the trails are when enabled

### Physics Controls
- **Gravity**: Add gravitational pull (positive values) or antigravity (negative values)
- **Bounce**: Control how bouncy the particles are when hitting boundaries
- **Chaos Level**: Add random movement when interacting with particles
- **Explode**: Send all particles flying in random directions
- **Reset Position**: Return all particles to their original positions

### Color Controls
- **Text Color**: Change the color used to generate particles
- **Background Color**: Change the canvas background color
- **Circle Hue/Saturation/Lightness**: Fine-tune the particle colors
- **Circle Outline**: Add and customize particle outlines

## Responsive Design

The interface is designed to work well on various screen sizes:

- **Desktop/Laptop**: Side-by-side layout with controls on the right
- **Tablet**: Controls below the canvas with optimized spacing
- **Mobile**: Vertical layout with collapsible control sections
- **Ultrawide**: Extra spacing and larger controls for better usability
- **Landscape Mobile**: Special layout optimization for horizontal orientation

## Browser Compatibility

The application works best in modern browsers that support:
- Canvas
- CSS Backdrop Filter
- ES6+ JavaScript

## Created With

- HTML5 Canvas
- CSS3 with modern features (glass morphism, flexbox, grid)
- Vanilla JavaScript (no external libraries) 