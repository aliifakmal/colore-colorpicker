let selectedColor = '#FF0000';
let currentHue = 0;

// Generate color recommendations from palette
function generatePaletteRecommendations() {
    const baseHsl = hexToHsl(selectedColor);
    const recommendations = [];
    
    // 1. Complementary color (opposite on color wheel)
    const complementary = hslToHex((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l);
    recommendations.push(complementary);
    
    // 2. Triadic colors (120 degrees apart)
    const triadic1 = hslToHex((baseHsl.h + 120) % 360, baseHsl.s, baseHsl.l);
    const triadic2 = hslToHex((baseHsl.h + 240) % 360, baseHsl.s, baseHsl.l);
    recommendations.push(triadic1);
    recommendations.push(triadic2);
    
    // 3. Analogous colors (adjacent colors)
    const analogous1 = hslToHex((baseHsl.h + 30) % 360, baseHsl.s, baseHsl.l);
    const analogous2 = hslToHex((baseHsl.h - 30 + 360) % 360, baseHsl.s, baseHsl.l);
    recommendations.push(analogous1);
    recommendations.push(analogous2);
    
    // 4. Monochromatic variations (same hue, different lightness)
    const mono1 = hslToHex(baseHsl.h, baseHsl.s, Math.min(90, baseHsl.l + 20));
    const mono2 = hslToHex(baseHsl.h, baseHsl.s, Math.max(10, baseHsl.l - 20));
    recommendations.push(mono1);
    recommendations.push(mono2);
    
    displayColorRecommendations(recommendations);
}

// Initialize with palette recommendations
function init() {
    addCustomStyles();
    setupEventListeners();
    updateColorInfo('#FF0000');
    updateSaturationLightnessBackground(0);
    updateSLCrosshairPosition(100, 50); // Start at full saturation, middle lightness
    updateHueSliderPosition(0);
}

// Setup event listeners
function setupEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const photoUploadArea = document.getElementById('photoUploadArea');
    const saturationLightnessPicker = document.getElementById('saturationLightnessPicker');
    const hueSlider = document.getElementById('hueSlider');
    const hexInput = document.getElementById('hexInput');
    const rgbInput = document.getElementById('rgbInput');
    const hslInput = document.getElementById('hslInput');

    // Saturation/Lightness picker click handler
    saturationLightnessPicker.addEventListener('click', handleSLPickerClick);
    
    // Hue slider click handler
    hueSlider.addEventListener('click', handleHueSliderClick);
    
    // Input change handlers
    hexInput.addEventListener('input', handleHexChange);
    rgbInput.addEventListener('input', handleRgbChange);
    hslInput.addEventListener('input', handleHslChange);

    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop functionality
    photoUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#667eea';
        this.style.background = 'rgba(102, 126, 234, 0.05)';
    });

    photoUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = 'rgba(102, 126, 234, 0.4)';
        this.style.background = 'rgba(255, 255, 255, 0.3)';
    });

    photoUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = 'rgba(102, 126, 234, 0.4)';
        this.style.background = 'rgba(255, 255, 255, 0.3)';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
}

// Handle saturation/lightness picker click
function handleSLPickerClick(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const saturation = (x / rect.width) * 100;
    const lightness = 100 - ((y / rect.height) * 100);
    
    const color = hslToHex(currentHue, saturation, lightness);
    updateColorInfo(color);
    updateSLCrosshairPosition(x, y);
}

// Handle hue slider click
function handleHueSliderClick(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    
    currentHue = (x / rect.width) * 360;
    updateSaturationLightnessBackground(currentHue);
    updateHueSliderPosition(x);
    
    // Update color with new hue but keep current saturation and lightness
    const currentHsl = hexToHsl(selectedColor);
    const newColor = hslToHex(currentHue, currentHsl.s, currentHsl.l);
    updateColorInfo(newColor);
}

// Update saturation/lightness background based on hue
function updateSaturationLightnessBackground(hue) {
    const picker = document.getElementById('saturationLightnessPicker');
    const baseColor = hslToHex(hue, 100, 50);
    picker.style.background = `
        linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%),
        linear-gradient(to right, rgba(255,255,255,1) 0%, ${baseColor} 100%)
    `;
}

// Update crosshair position for saturation/lightness picker
function updateSLCrosshairPosition(x, y) {
    const crosshair = document.getElementById('slCrosshair');
    crosshair.style.left = x + 'px';
    crosshair.style.top = y + 'px';
}

// Update hue slider handle position
function updateHueSliderPosition(x) {
    const handle = document.getElementById('hueHandle');
    handle.style.left = x + 'px';
}

// Update color information
function updateColorInfo(hexColor) {
    selectedColor = hexColor;
    
    // Update preview
    document.getElementById('colorPreview').style.backgroundColor = hexColor;
    
    // Update inputs
    document.getElementById('hexInput').value = hexColor.toUpperCase();
    
    const rgb = hexToRgb(hexColor);
    document.getElementById('rgbInput').value = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
    
    const hsl = hexToHsl(hexColor);
    document.getElementById('hslInput').value = `${Math.round(hsl.h)}°, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%`;
    
    // Auto-generate recommendations when color changes
    generatePaletteRecommendations();
}

// Handle input changes
function handleHexChange(event) {
    const hex = event.target.value;
    if (isValidHex(hex)) {
        updateColorFromHex(hex);
    }
}

function handleRgbChange(event) {
    const rgbStr = event.target.value;
    const rgbMatch = rgbStr.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        if (r <= 255 && g <= 255 && b <= 255) {
            const hex = rgbToHex(r, g, b);
            updateColorFromHex(hex);
        }
    }
}

function handleHslChange(event) {
    const hslStr = event.target.value;
    const hslMatch = hslStr.match(/(\d+)°?,\s*(\d+)%?,\s*(\d+)%?/);
    if (hslMatch) {
        const h = parseInt(hslMatch[1]);
        const s = parseInt(hslMatch[2]);
        const l = parseInt(hslMatch[3]);
        if (h <= 360 && s <= 100 && l <= 100) {
            const hex = hslToHex(h, s, l);
            updateColorFromHex(hex);
        }
    }
}

// Update color from hex and sync all controls
function updateColorFromHex(hex) {
    const hsl = hexToHsl(hex);
    currentHue = hsl.h;
    
    updateColorInfo(hex);
    updateSaturationLightnessBackground(currentHue);
    
    // Calculate positions for controls
    const picker = document.getElementById('saturationLightnessPicker');
    const rect = picker.getBoundingClientRect();
    const sliderRect = document.getElementById('hueSlider').getBoundingClientRect();
    
    const slX = (hsl.s / 100) * rect.width;
    const slY = ((100 - hsl.l) / 100) * rect.height;
    const hueX = (hsl.h / 360) * sliderRect.width;
    
    updateSLCrosshairPosition(slX, slY);
    updateHueSliderPosition(hueX);
}

// Validation functions
function isValidHex(hex) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// Handle file processing
function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        showNotification('File harus berupa gambar!', 'error');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showNotification('Ukuran file maksimal 10MB!', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        displayUploadedImage(e.target.result);
        extractColorsFromImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Display uploaded image
function displayUploadedImage(imageSrc) {
    const uploadArea = document.getElementById('photoUploadArea');
    uploadArea.classList.add('has-image'); 
    
     // Sembunyikan icon + text
    const uploadIcon = uploadArea.querySelector(".upload-icon");
    const uploadText = uploadArea.querySelector(".upload-text");
    const uploadSubtext = uploadArea.querySelector(".upload-subtext");
    if (uploadIcon) uploadIcon.style.display = "none";
    if (uploadText) uploadText.style.display = "none";
    if (uploadSubtext) uploadSubtext.style.display = "none";

    // Hapus gambar lama jika ada
    let oldImg = uploadArea.querySelector(".uploaded-image");
    if (oldImg) {
        oldImg.remove();
    }

    // Buat elemen img baru
    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = "Uploaded Image";
    img.className = "uploaded-image";

    // Sisipkan sebelum input file agar input tetap ada
    const fileInput = document.getElementById("fileInput");
    uploadArea.insertBefore(img, fileInput);
}

// Extract colors from image
function extractColorsFromImage(imageSrc) {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    setTimeout(() => {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Resize image for better performance
            const maxSize = 150;
            const ratio = Math.min(maxSize / img.width, maxSize / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Extract colors
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const colors = extractDominantColors(imageData, 5);
            
            loading.style.display = 'none';
            displayColorRecommendations(colors);
        };
        img.src = imageSrc;
    }, 500);
}

// Extract dominant colors using k-means clustering approach
function extractDominantColors(imageData, numColors) {
    const data = imageData.data;
    const pixels = [];
    
    // Sample pixels (every 8th pixel for performance)
    for (let i = 0; i < data.length; i += 32) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const alpha = data[i + 3];
        
        // Skip transparent pixels and very light/dark pixels
        if (alpha > 128 && (r + g + b) > 50 && (r + g + b) < 700) {
            pixels.push([r, g, b]);
        }
    }
    
    if (pixels.length === 0) {
        return ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    }
    
    // Simple color clustering
    const clusters = kMeansColors(pixels, numColors);
    return clusters.map(cluster => rgbToHex(Math.round(cluster[0]), Math.round(cluster[1]), Math.round(cluster[2])));
}

// Simple k-means clustering for colors
function kMeansColors(pixels, k) {
    if (pixels.length <= k) {
        return pixels;
    }
    
    // Initialize centroids randomly
    let centroids = [];
    for (let i = 0; i < k; i++) {
        centroids.push([...pixels[Math.floor(Math.random() * pixels.length)]]);
    }
    
    // Run k-means iterations
    for (let iter = 0; iter < 10; iter++) {
        const clusters = Array(k).fill().map(() => []);
        
        // Assign pixels to nearest centroid
        pixels.forEach(pixel => {
            let minDist = Infinity;
            let clusterIndex = 0;
            
            centroids.forEach((centroid, index) => {
                const dist = Math.sqrt(
                    Math.pow(pixel[0] - centroid[0], 2) +
                    Math.pow(pixel[1] - centroid[1], 2) +
                    Math.pow(pixel[2] - centroid[2], 2)
                );
                if (dist < minDist) {
                    minDist = dist;
                    clusterIndex = index;
                }
            });
            
            clusters[clusterIndex].push(pixel);
        });
        
        // Update centroids
        centroids = clusters.map(cluster => {
            if (cluster.length === 0) return [128, 128, 128];
            
            const sum = cluster.reduce((acc, pixel) => [
                acc[0] + pixel[0],
                acc[1] + pixel[1],
                acc[2] + pixel[2]
            ], [0, 0, 0]);
            
            return [
                sum[0] / cluster.length,
                sum[1] / cluster.length,
                sum[2] / cluster.length
            ];
        });
    }
    
    return centroids.filter(centroid => centroid[0] !== 128 || centroid[1] !== 128 || centroid[2] !== 128);
}

// PERBAIKAN: Display color recommendations dengan kontrol terpisah
function displayColorRecommendations(colors) {
    const recommendations = document.getElementById('colorRecommendations');
    
    if (colors.length === 0) {
        recommendations.innerHTML = '<div class="empty-state">Tidak dapat menghasilkan rekomendasi warna</div>';
        return;
    }
    
    const colorStrip = document.createElement('div');
    colorStrip.className = 'color-strip';
    
    colors.forEach((color, index) => {
        const colorBand = document.createElement('div');
        colorBand.className = 'color-band';
        colorBand.style.backgroundColor = color;
        colorBand.style.position = 'relative';
        colorBand.style.cursor = 'pointer';
        
        // Buat overlay untuk kode warna
        const codeOverlay = document.createElement('div');
        codeOverlay.className = 'color-code-overlay';
        codeOverlay.textContent = color.toUpperCase();
        codeOverlay.style.pointerEvents = 'none';
        
        // Buat kontainer untuk tombol aksi
        const actionContainer = document.createElement('div');
        actionContainer.className = 'color-actions';
        actionContainer.style.position = 'absolute';
        actionContainer.style.top = '50%';
        actionContainer.style.left = '50%';
        actionContainer.style.transform = 'translate(-50%, -50%)';
        actionContainer.style.display = 'flex';
        actionContainer.style.gap = '8px';
        actionContainer.style.opacity = '0';
        actionContainer.style.transition = 'opacity 0.2s ease';
        actionContainer.style.zIndex = '10';
        
        // Tombol Copy
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy';
        copyBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(0,0,0,0.1);
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            color: #333;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            transition: all 0.2s ease;
        `;
        copyBtn.onclick = (e) => {
            e.stopPropagation();
            copyToClipboard(color);
        };
        
        // Tombol Use (untuk menggunakan warna ini di palette)
        const useBtn = document.createElement('button');
        useBtn.textContent = 'Use';
        useBtn.style.cssText = `
            background: rgba(59, 130, 246, 0.9);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            color: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            transition: all 0.2s ease;
        `;
        useBtn.onclick = (e) => {
            e.stopPropagation();
            updateColorFromHex(color);
            showNotification(`Warna ${color.toUpperCase()} diterapkan ke palette`);
        };
        
        actionContainer.appendChild(copyBtn);
        actionContainer.appendChild(useBtn);
        
        // Event untuk menampilkan tombol saat hover
        colorBand.addEventListener('mouseenter', () => {
            actionContainer.style.opacity = '1';
            codeOverlay.style.opacity = '0.2';
        });
        
        colorBand.addEventListener('mouseleave', () => {
            actionContainer.style.opacity = '0';
            codeOverlay.style.opacity = '1';
        });
        
        // Default click hanya untuk copy
        colorBand.onclick = (e) => {
            // Jika bukan tombol yang diklik, lakukan copy
            if (!e.target.tagName || e.target.tagName.toLowerCase() !== 'button') {
                copyToClipboard(color);
            }
        };
        
        colorBand.appendChild(codeOverlay);
        colorBand.appendChild(actionContainer);
        colorStrip.appendChild(colorBand);
    });
    
    recommendations.innerHTML = '';
    recommendations.appendChild(colorStrip);
}

// Color conversion functions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function hexToHsl(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return { h: 0, s: 0, l: 0 };
    
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return {
        h: h * 360,
        s: s * 100,
        l: l * 100
    };
}

function hslToHex(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    
    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };
    
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}

function getContrastColor(hexcolor) {
    const r = parseInt(hexcolor.substr(1, 2), 16);
    const g = parseInt(hexcolor.substr(3, 2), 16);
    const b = parseInt(hexcolor.substr(5, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
}

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification(`Disalin: ${text}`);
    }).catch(err => {
        showNotification('Gagal menyalin ke clipboard', 'error');
    });
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// PERBAIKAN: Tambahkan CSS untuk styling yang lebih baik
function addCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .color-band {
            position: relative;
            transition: all 0.2s ease;
            overflow: hidden;
        }

        .color-band:hover {
            transform: scale(1.02);
            z-index: 10;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .color-code-overlay {
            transition: opacity 0.2s ease;
            position: absolute;
            bottom: 8px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
            pointer-events: none;
        }

        .color-actions button:hover {
            transform: scale(1.05) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25) !important;
        }

        .color-actions button:active {
            transform: scale(0.95) !important;
        }

        /* Responsif untuk mobile */
        @media (max-width: 768px) {
            .color-actions {
                gap: 4px !important;
            }
            
            .color-actions button {
                padding: 4px 8px !important;
                font-size: 10px !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);