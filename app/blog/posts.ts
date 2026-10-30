export const posts = [
  {
    slug: "working-on-gakit", period: "Current", category: "Research", title: "What I’m working on: GAKIT",
    summary: "I’m leading development on GAKIT, an internally funded research project at MSU-IIT. Here’s what we’re building.",
    paragraphs: [
      "Right now, I’m working as the lead developer for Project GAKIT at MSU-IIT. It’s an internally funded research project focused on geohazard assessment and community flood information.",
      "There’s more to it than reporting flooded streets. You can look up a location and check flood, landslide, and storm surge exposure alongside rainfall, heat, and drought information. Staff use a separate workspace to review reports and keep track of conditions.",
      "I’m using Next.js and MapLibre for the web app, with FastAPI and PostGIS behind it. There’s also an inference component running through ONNX Runtime. I’ll use this space to share more specific parts of the work as the project develops."
    ],
    links: [{ label: "Open GAKIT", href: "https://project-gakit-client-2026-three.vercel.app/" }]
  },
  {
    slug: "portable-spectrophotometer", period: "2025", category: "Hardware & ML", title: "Building a low-cost spectrophotometer",
    summary: "My thesis brought together a physical instrument and software for working with its measurements.",
    paragraphs: [
      "For my thesis, I worked on a portable spectrophotometer and the software to analyze its readings. The aim was to estimate concentrations in water samples using a low-cost instrument and machine learning.",
      "The software takes absorbance data, fits calibration models, and lets you evaluate their predictions. It has a PyQt6 desktop interface, with scikit-learn, PyTorch, and XGBoost handling the modeling.",
      "The project was recognized as Best Thesis in our program and won the Academe Expo 2025 project demonstration. The code and paper are linked below if you’d like a closer look."
    ],
    links: [{ label: "Code", href: "https://github.com/lstrjessh/Spectral-Analysis-Platform" }, { label: "Paper", href: "https://dx.doi.org/10.2139/ssrn.7397594" }]
  },
  {
    slug: "geosafe-satellite-mapping", period: "2025", category: "Geospatial", title: "Trying satellite data for landslide mapping",
    summary: "GeoSafe started as a prototype for the PhilSA Space Business Innovation Challenge. Here’s what the map is actually showing.",
    paragraphs: [
      "I built GeoSafe as a prototype for the PhilSA Space Business Innovation Challenge in 2025. It uses satellite imagery and terrain data to flag possible landslide risk hotspots.",
      "The calculation combines vegetation change, a moisture indicator called NDWI, and slope. Google Earth Engine handles the satellite data. You can change the weights, compare time periods, and export the map layers.",
      "A few details matter when looking at the results. NDWI doesn’t directly measure soil moisture. The sensor monitoring and AI hybrid display are simulated. This is a prototype for exploring risk indicators, so the map shouldn’t be read as a validated landslide forecast."
    ],
    links: [{ label: "Code", href: "https://github.com/lstrjessh/PhilSA-GeoSafe-Landslide-Risk-Mapper" }]
  },
  {
    slug: "drowsiness-detection-on-device", period: "2025", category: "Embedded AI", title: "Running drowsiness detection on a microcontroller",
    summary: "A small CNN, a MAX78000 board, and the firmware to put them together.",
    paragraphs: [
      "This project runs drowsiness detection on a MAX78000FTHR board. I prepared the image data and trained a small CNN that could fit the device.",
      "After training, I quantized the model for the board and paired it with an embedded C detection algorithm. The repository covers the model work and the firmware that uses its predictions."
    ],
    links: [{ label: "Code", href: "https://github.com/lstrjessh/MAX78000-FTHR-Drowsiness-Detection" }]
  },
  {
    slug: "scanning-and-classifying-3d-shapes", period: "2024", category: "Embedded & ML", title: "From an infrared sensor to a 3D shape",
    summary: "A look at the scanner and classifier we presented at COIL in 2024.",
    paragraphs: [
      "I worked on a low-cost 3D scanner that uses an infrared distance sensor and stepper motors to capture an object’s shape. The repo has both an Arduino sketch and a bare-metal C version for the ATmega328P.",
      "In the C version, the firmware controls GPIO, timers, UART, ADC, and SPI through the AVR registers. It saves the captured coordinates to an SD card using FatFs.",
      "The next part is recognizing what was scanned. I used PointNet in PyTorch to classify the point clouds into shapes like spheres, cubes, and cylinders. We presented the project at COIL with MSU-IIT and Kyushu Sangyo University in 2024."
    ],
    links: [{ label: "Scanner code", href: "https://github.com/lstrjessh/PID-Adaptive-Speed-Arduino-based-3D-Scanner-Using-an-IR-Analog-Distance-Sensor" }, { label: "Classifier code", href: "https://github.com/lstrjessh/PointNet-NeuralNetwork-Shape-Classifier-for-Arduino-3D-Scanner-Point-Cloud-Data" }]
  }
];
