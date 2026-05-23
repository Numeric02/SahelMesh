import os
import zipfile

# Create the folder structure
output_dir = "SahelMesh_App_Assets"
os.makedirs(output_dir, exist_ok=True)

# 1. Generate the 1024x1024 SVG for the Icon
icon_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0B1528" />
            <stop offset="50%" stop-color="#070E1A" />
            <stop offset="100%" stop-color="#020408" />
        </linearGradient>
        
        <linearGradient id="primaryGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#3B82F6" />
            <stop offset="100%" stop-color="#00FFFF" />
        </linearGradient>

        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#00FFFF" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#00FFFF" stop-opacity="0" />
        </radialGradient>
        
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
    </defs>

    <rect width="1024" height="1024" fill="url(#bgGrad)"/>

    <g stroke="#3B82F6" stroke-width="3" opacity="0.25" stroke-dasharray="8,8">
        <line x1="512" y1="180" x2="220" y2="360" />
        <line x1="512" y1="180" x2="804" y2="360" />
        <line x1="220" y1="360" x2="220" y2="680" />
        <line x1="804" y1="360" x2="804" y2="680" />
        <line x1="220" y1="680" x2="512" y2="844" />
        <line x1="804" y1="680" x2="512" y2="844" />
        <line x1="512" y1="180" x2="512" y2="844" />
        <line x1="220" y1="360" x2="804" y2="680" />
        <line x1="220" y1="680" x2="804" y2="360" />
    </g>

    <g fill="#3B82F6" opacity="0.5">
        <circle cx="512" cy="180" r="16" fill="#00FFFF" />
        <circle cx="220" cy="360" r="12" />
        <circle cx="804" cy="360" r="12" />
        <circle cx="220" cy="680" r="12" />
        <circle cx="804" cy="680" r="12" />
        <circle cx="512" cy="844" r="16" fill="#00FFFF" />
    </g>

    <circle cx="512" cy="512" r="280" fill="url(#glow)" />

    <circle cx="512" cy="512" r="200" fill="#0F2347" fill-opacity="0.4" stroke="url(#primaryGrad)" stroke-width="6" filter="url(#dropShadow)" />

    <g fill="none" stroke="url(#primaryGrad)" stroke-width="28" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 440 420 C 360 420, 360 500, 440 510 C 520 520, 520 600, 440 604" />
        <path d="M 550 604 L 550 420 L 610 510 L 670 420 L 670 604" />
    </g>

    <circle cx="440" cy="420" r="12" fill="#00FFFF" />
    <circle cx="440" cy="604" r="12" fill="#3B82F6" />
    <circle cx="550" cy="420" r="12" fill="#3B82F6" />
    <circle cx="670" cy="420" r="12" fill="#00FFFF" />
    <circle cx="670" cy="604" r="12" fill="#3B82F6" />
</svg>
"""

# 2. Generate the 2208x2208 SVG for the Splash Screen (Portrait Focus)
splash_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2208 2208" width="2208" height="2208">
    <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#070E1A" />
            <stop offset="40%" stop-color="#0B1528" />
            <stop offset="70%" stop-color="#0F2347" />
            <stop offset="100%" stop-color="#020408" />
        </linearGradient>
        
        <linearGradient id="primaryGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#3B82F6" />
            <stop offset="100%" stop-color="#00FFFF" />
        </linearGradient>

        <radialGradient id="largeGlow" cx="50%" cy="45%" r="40%">
            <stop offset="0%" stop-color="#00FFFF" stop-opacity="0.18" />
            <stop offset="100%" stop-color="#00FFFF" stop-opacity="0" />
        </radialGradient>
        
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#000000" flood-opacity="0.7"/>
        </filter>
    </defs>

    <rect width="2208" height="2208" fill="url(#bgGrad)"/>

    <g stroke="#3B82F6" stroke-width="4" opacity="0.15" stroke-dasharray="12,12">
        <line x1="1104" y1="400" x2="500" y2="750" />
        <line x1="1104" y1="400" x2="1708" y2="750" />
        <line x1="500" y1="750" x2="500" y2="1350" />
        <line x1="1708" y1="750" x2="1708" y2="1350" />
        <line x1="500" y1="1350" x2="1104" y2="1700" />
        <line x1="1708" y1="1350" x2="1104" y2="1700" />
        
        <line x1="1104" y1="400" x2="1104" y2="1700" />
        <line x1="500" y1="750" x2="1708" y2="1350" />
        <line x1="500" y1="1350" x2="1708" y2="750" />
        
        <line x1="250" y1="1050" x2="500" y2="750" />
        <line x1="250" y1="1050" x2="500" y2="1350" />
        <line x1="1958" y1="1050" x2="1708" y2="750" />
        <line x1="1958" y1="1050" x2="1708" y2="1350" />
    </g>

    <g fill="#3B82F6" opacity="0.4">
        <circle cx="1104" cy="400" r="24" fill="#00FFFF" />
        <circle cx="500" cy="750" r="18" />
        <circle cx="1708" cy="750" r="18" />
        <circle cx="500" cy="1350" r="18" />
        <circle cx="1708" cy="1350" r="18" />
        <circle cx="1104" cy="1700" r="24" fill="#00FFFF" />
        <circle cx="250" cy="1050" r="14" />
        <circle cx="1958" cy="1050" r="14" />
    </g>

    <circle cx="1104" cy="950" r="550" fill="url(#largeGlow)" />

    <circle cx="1104" cy="950" r="340" fill="#0F2347" fill-opacity="0.4" stroke="url(#primaryGrad)" stroke-width="10" filter="url(#dropShadow)" />

    <g fill="none" stroke="url(#primaryGrad)" stroke-width="48" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 980 800 C 840 800, 840 930, 980 945 C 1120 960, 1120 1090, 980 1100" />
        <path d="M 1170 1100 L 1170 800 L 1270 950 L 1370 800 L 1370 1100" />
    </g>

    <circle cx="980" cy="800" r="20" fill="#00FFFF" />
    <circle cx="980" cy="1100" r="20" fill="#3B82F6" />
    <circle cx="1170" cy="800" r="20" fill="#3B82F6" />
    <circle cx="1370" cy="800" r="20" fill="#00FFFF" />
    <circle cx="1370" cy="1100" r="20" fill="#3B82F6" />

    <text x="1104" y="1520" font-family="'Segoe UI', Roboto, Helvetica, sans-serif" font-weight="800" font-size="110" fill="#FFFFFF" text-anchor="middle" letter-spacing="8">SahelMesh</text>
    <text x="1104" y="1610" font-family="'Segoe UI', Roboto, Helvetica, sans-serif" font-weight="600" font-size="42" fill="#00FFFF" text-anchor="middle" letter-spacing="4" opacity="0.9">OFFLINE EMERGENCY MESH NETWORK</text>
</svg>
"""

# Write the SVG assets to the directory
with open(os.path.join(output_dir, "icon.svg"), "w", encoding="utf-8") as f:
    f.write(icon_svg)
with open(os.path.join(output_dir, "splash.svg"), "w", encoding="utf-8") as f:
    f.write(splash_svg)

# Create a zip containing the vector source codes structured perfectly
zip_filename = "SahelMesh_Assets_Vectors.zip"
with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(output_dir):
        for file in files:
            file_path = os.path.join(root, file)
            archive_name = os.path.relpath(file_path, output_dir)
            zipf.write(file_path, archive_name)

print(f"Vector ZIP generated successfully: {zip_filename}")