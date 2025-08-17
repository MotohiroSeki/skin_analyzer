// Entry point for Skin Analyzer frontend
// Initializes camera button functionality.

console.log('Skin Analyzer initialized');

const cameraButton = document.getElementById('camera-button');
const cameraInput = document.getElementById('camera-input');
const photo = document.getElementById('photo');

if (cameraButton && cameraInput && photo) {
  cameraButton.addEventListener('click', () => {
    cameraInput.click();
  });

  cameraInput.addEventListener('change', () => {
    const file = cameraInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        photo.src = e.target.result;
        photo.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });
}
