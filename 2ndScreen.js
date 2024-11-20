// Variables to reference DOM elements
const videoElement = document.getElementById('videoElement');
const resolutionSelect = document.getElementById('resolutionSelect');
const inputSelect = document.getElementById('inputSelect');
const exitButton = document.getElementById('exitButton');

// Store media devices and current video stream
let mediaDevices = [];
let currentStream = null;

// Helper function to toggle fullscreen
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    document.body.classList.add('fullscreen');
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      document.body.classList.remove('fullscreen');
    }
  }
}

// Exit fullscreen mode
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
    document.body.classList.remove('fullscreen');
  }
}

// Request camera permissions and get the list of video input devices
async function getVideoInputs() {
  try {
    // Request permissions to access media devices (camera and microphone)
    await navigator.mediaDevices.getUserMedia({ video: true });

    // Once permissions are granted, enumerate the devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    mediaDevices = devices.filter(device => device.kind === 'videoinput');

    // If no video devices found, alert the user
    if (mediaDevices.length === 0) {
      const option = document.createElement('option');
      option.textContent = 'No cameras found';
      inputSelect.appendChild(option);
      return;
    }

    // Populate the camera input dropdown
    inputSelect.innerHTML = '';  // Clear existing options
    mediaDevices.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.textContent = device.label || `Camera ${index + 1}`;
      inputSelect.appendChild(option);
    });

    // Start video stream from the first device by default
    if (mediaDevices.length > 0) {
      inputSelect.selectedIndex = 0;
      startVideoStream(mediaDevices[0]);
    }
  } catch (error) {
    console.error('Error accessing media devices:', error);
    alert('Could not access camera. Please allow camera permissions.');
  }
}

// Start video stream based on selected camera
async function startVideoStream(device) {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  const resolution = resolutionSelect.value.split('x');
  const constraints = {
    video: {
      deviceId: { exact: device.deviceId },
      width: { ideal: parseInt(resolution[0]) },
      height: { ideal: parseInt(resolution[1]) }
    }
  };

  try {
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = currentStream;
  } catch (error) {
    console.error('Error starting video stream:', error);
  }
}

// Event listener for resolution change
resolutionSelect.addEventListener('change', () => {
  const selectedDevice = mediaDevices[inputSelect.selectedIndex];
  if (selectedDevice) {
    startVideoStream(selectedDevice);
  }
});

// Event listener for input device change (camera selection)
inputSelect.addEventListener('change', () => {
  const selectedDevice = mediaDevices.find(device => device.deviceId === inputSelect.value);
  if (selectedDevice) {
    startVideoStream(selectedDevice);
  }
});

// Initialize the video input devices and start video
getVideoInputs();

// Add fullscreen toggle functionality on video click
videoElement.addEventListener('click', toggleFullscreen);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(error => {
      console.log('Service Worker registration failed:', error);
    });
}