// DOM element selection
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const imageUpload = document.getElementById('image-upload');
const zoomSlider = document.getElementById('zoom-slider');
const downloadBtn = document.getElementById('download-btn');

// Canvas setup
const canvasSize = 400;
canvas.width = canvasSize;
canvas.height = canvasSize;

// Image objects and state variables
let userImage = new Image();
let logoImage = new Image();
let imageX = 0;
let imageY = 0;
let imageScale = 1;
let isDragging = false;
let startX, startY;
let userImageLoaded = false;
let logoLoaded = false;

// Load the logo from a local file
logoImage.src = 'logo.png'; // Make sure this path is correct
logoImage.onload = () => {
    logoLoaded = true;
    drawCanvas();
};

// Main function to draw content on canvas
function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw user's image, if loaded, with current adjustments
    if (userImageLoaded) {
        const scaledWidth = userImage.width * imageScale;
        const scaledHeight = userImage.height * imageScale;
        
        const finalX = imageX + (canvas.width - scaledWidth) / 2;
        const finalY = imageY + (canvas.height - scaledHeight) / 2;

        ctx.drawImage(userImage, finalX, finalY, scaledWidth, scaledHeight);
    }
    
    // Draw the transparent logo on top
    if (logoLoaded) {
        ctx.drawImage(logoImage, 0, 0, canvas.width, canvas.height);
    }
}

// Function to handle the download of the final image
function downloadFinalImage() {
    if (!userImageLoaded) {
        showMessageBox("Please upload an image first!");
        return;
    }
    
    // Create a new temporary canvas for the final download
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = 400; // As per your requirement
    finalCanvas.height = 400; // As per your requirement
    const finalCtx = finalCanvas.getContext('2d');
    
    // Draw the user's image on the final canvas
    const scaledWidth = userImage.width * imageScale;
    const scaledHeight = userImage.height * imageScale;
    
    const finalX = imageX + (finalCanvas.width - scaledWidth) / 2;
    const finalY = imageY + (finalCanvas.height - scaledHeight) / 2;
    
    finalCtx.drawImage(userImage, finalX, finalY, scaledWidth, scaledHeight);
    
    // Draw the logo on top (no composite operations needed)
    finalCtx.drawImage(logoImage, 0, 0, finalCanvas.width, finalCanvas.height);

    // Create and trigger download link
    const link = document.createElement('a');
    link.download = 'framed_image.png';
    link.href = finalCanvas.toDataURL('image/png');
    link.click();
}

// Simple message box to replace alerts
function showMessageBox(message) {
    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';
    messageBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        text-align: center;
        font-family: 'Inter', sans-serif;
    `;
    messageBox.innerHTML = `
        <p>${message}</p>
        <button style="margin-top: 10px; padding: 8px 16px; background-color: #4b0082; color: white; border: none; border-radius: 5px; cursor: pointer;" onclick="this.parentElement.remove()">OK</button>
    `;
    document.body.appendChild(messageBox);
}

// Event listeners for user interaction
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            userImage.onload = () => {
                userImageLoaded = true;
                imageScale = 1;
                imageX = 0;
                imageY = 0;
                zoomSlider.value = 1;
                drawCanvas();
            };
            userImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

zoomSlider.addEventListener('input', (e) => {
    imageScale = parseFloat(e.target.value);
    drawCanvas();
});

canvas.addEventListener('mousedown', (e) => {
    if (!userImageLoaded) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    canvas.style.cursor = 'grabbing';
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || !userImageLoaded) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    imageX += dx;
    imageY += dy;
    startX = e.clientX;
    startY = e.clientY;
    drawCanvas();
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
});

downloadBtn.addEventListener('click', downloadFinalImage);
