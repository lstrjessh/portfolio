export const posts = [
  {
    slug: "geosafe-satellite-mapping", period: "2025", category: "Geospatial", title: "Trying satellite data for landslide mapping",
    summary: "GeoSafe brings together landslide mapping and satellite comparisons. Its assessment tools are integrated in GAKIT.",
    paragraphs: [
      "I submitted the original version of GeoSafe to the PhilSA Space Business Innovation Challenge in 2025. I’ve since rebuilt it with React and FastAPI, giving the map more room and separating location assessment from satellite change analysis.",
      "The map streams NOAH landslide susceptibility tiles, so you can inspect a location against the published mapping. For satellite comparisons, the backend reads Sentinel-2 imagery and Copernicus elevation data without Earth Engine. You can compare dates, upload local rasters and field observations, and export GeoTIFF results.",
      "Its landslide assessment tools are integrated in GAKIT.",
      "The two views answer different questions: what susceptibility has been mapped here, and what changed between these images? Neither is a live landslide warning. I want that distinction to stay clear when someone uses the app."
    ],
    links: [{ label: "Open GeoSafe", href: "https://geosafe-amber.vercel.app/" }, { label: "Code", href: "https://github.com/lstrjessh/geosafe" }]
  },
  {
    slug: "bakas-typhoon-tracking", period: "2026", category: "Geospatial", title: "Following typhoons with Bakas",
    summary: "Current advisories, satellite imagery, and past storm tracks in one map. Its tracking tools are integrated in GAKIT.",
    paragraphs: [
      "Bakas brings current typhoon advisories, satellite imagery, and past storm tracks into one map. You can follow PAGASA advisories, replay storms from the NOAA IBTrACS archive, and view near-real-time Himawari imagery.",
      "I wanted it to be easy to explore a storm without jumping between sites. You can search by name or season, step through its track, and inspect the reported wind speed and pressure. Track files and satellite playback can be downloaded too.",
      "Its typhoon tracking tools are integrated in GAKIT. Bakas gives those tools a focused workspace for exploring current and archived storms.",
      "The satellite imagery has its own timestamps. Replaying an old storm doesn’t turn the latest satellite view into historical imagery, so the two timelines stay separate."
    ],
    links: [{ label: "Open Bakas", href: "https://bakas-tau.vercel.app/" }, { label: "Code", href: "https://github.com/lstrjessh/bakas" }]
  },
  {
    slug: "working-on-gakit", period: "Current", category: "Research", title: "What I’m working on: GAKIT",
    summary: "I’m leading development on GAKIT, an internally funded research project at MSU-IIT. Here’s what we’re building.",
    paragraphs: [
      "I’m leading development on GAKIT, an internally funded research project at MSU-IIT focused on geohazard assessment and community flood information.",
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
    links: [{ label: "Code", href: "https://github.com/lstrjessh/spectrophotometer" }, { label: "Paper", href: "https://dx.doi.org/10.2139/ssrn.7397594" }]
  },
  {
    slug: "drowsiness-detection-on-device", period: "2025", category: "Embedded AI", title: "Running drowsiness detection on a microcontroller",
    summary: "A small CNN, a MAX78000 board, and the firmware to put them together.",
    paragraphs: [
      "This project runs drowsiness detection on a MAX78000FTHR board. I prepared the image data and trained a small CNN that could fit the device.",
      "After training, I quantized the model for the board and paired it with an embedded C detection algorithm. The repository covers the model work and the firmware that uses its predictions."
    ],
    links: [{ label: "Code", href: "https://github.com/lstrjessh/drowsiness-detection" }]
  },
  {
    slug: "scanning-and-classifying-3d-shapes", period: "2024", category: "Embedded & ML", title: "From an infrared sensor to a 3D shape",
    summary: "A look at the scanner and classifier we presented at COIL in 2024.",
    paragraphs: [
      "I worked on a 3D scanner that uses an infrared distance sensor and stepper motors to capture an object’s shape. The repo has both an Arduino sketch and a bare-metal C version for the ATmega328P.",
      "In the C version, the firmware controls GPIO, timers, UART, ADC, and SPI through the AVR registers. It saves the captured coordinates to an SD card using FatFs.",
      "The next part is recognizing what was scanned. I used PointNet in PyTorch to classify the point clouds into shapes like spheres, cubes, and cylinders. We presented the project at COIL with MSU-IIT and Kyushu Sangyo University in 2024."
    ],
    links: [{ label: "Scanner code", href: "https://github.com/lstrjessh/3d-scanner" }, { label: "Classifier code", href: "https://github.com/lstrjessh/shape-classifier" }]
  }
];
