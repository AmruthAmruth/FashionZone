/**
 * Add product page: image preview, crop modal, client-side validation
 */
(function () {
  'use strict';

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
  let cropper = null;
  let currentImageIndex = null;
  let cropperModal = null;

  const cropperModalEl = document.getElementById('cropperModal');
  const imageForCrop = document.getElementById('imageForCrop');
  const form = document.getElementById('addProductForm');

  function initCropperModal() {
    if (!cropperModalEl || typeof bootstrap === 'undefined') return;
    cropperModal = bootstrap.Modal.getOrCreateInstance(cropperModalEl);

    cropperModalEl.addEventListener('shown.bs.modal', function () {
      if (cropper) {
        cropper.destroy();
        cropper = null;
      }
      cropper = new Cropper(imageForCrop, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 0.8,
        responsive: true,
        zoomable: true,
        scalable: true,
        rotatable: true,
      });
    });

    cropperModalEl.addEventListener('hidden.bs.modal', function () {
      if (cropper) {
        cropper.destroy();
        cropper = null;
      }
      imageForCrop.removeAttribute('src');
    });
  }

  window.showPreview = function (input, previewId) {
    const file = input.files && input.files[0];
    const preview = document.getElementById(previewId);
    const slotNum = input.id.replace('imageInput', '');
    const errorEl = document.getElementById('imageError' + slotNum);

    if (!file || !preview) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      input.value = '';
      preview.style.display = 'none';
      preview.removeAttribute('src');
      if (errorEl) {
        errorEl.textContent = 'Only JPG and PNG files are allowed.';
        errorEl.style.display = 'block';
      }
      return;
    }

    if (errorEl) errorEl.style.display = 'none';

    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  };

  window.openCropModal = function (inputElement, index) {
    if (!cropperModal) initCropperModal();

    const file = inputElement.files && inputElement.files[0];
    if (!file || !cropperModal) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return;

    currentImageIndex = index;
    const reader = new FileReader();
    reader.onload = function (e) {
      imageForCrop.src = e.target.result;
      cropperModal.show();
    };
    reader.readAsDataURL(file);
  };

  function bindApplyCrop() {
    const btn = document.getElementById('applyCropBtn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      if (!cropper) return;

      const croppedCanvas = cropper.getCroppedCanvas({
        width: 800,
        height: 800,
        imageSmoothingQuality: 'high',
      });
      if (!croppedCanvas) return;

      const croppedImageDataURL = croppedCanvas.toDataURL('image/jpeg', 0.92);
      croppedCanvas.toBlob(function (blob) {
        if (!blob) return;

        const croppedFile = new File([blob], 'cropped-' + Date.now() + '.jpeg', {
          type: 'image/jpeg',
        });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(croppedFile);

        const fileInput = document.getElementById('imageInput' + currentImageIndex);
        const preview = document.getElementById('imagePreview' + currentImageIndex);
        if (fileInput) fileInput.files = dataTransfer.files;
        if (preview) {
          preview.src = croppedImageDataURL;
          preview.style.display = 'block';
        }
        cropperModal.hide();
      }, 'image/jpeg', 0.92);
    });
  }

  function clearFormErrors() {
    document.querySelectorAll('.form-error').forEach(function (el) {
      el.style.display = 'none';
      el.textContent = '';
    });
    document.querySelectorAll('.image-slot-error').forEach(function (el) {
      el.style.display = 'none';
      el.textContent = '';
    });
    const imagesErr = document.getElementById('imagesErr');
    if (imagesErr) imagesErr.style.display = 'none';
  }

  function showError(id, message) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.style.display = 'block';
  }

  window.validateAddProductForm = function (event) {
    event.preventDefault();
    clearFormErrors();

    let isValid = true;
    const validText = /^[a-zA-Z0-9\s]+$/;
    const validPrice = /^\d+(\.\d{1,2})?$/;

    const brand = document.getElementById('product-brand');
    const title = document.getElementById('product-title');
    const description = document.getElementById('product-description');
    const price = document.getElementById('product-price');
    const discountPrice = document.getElementById('product-discount-price');

    function checkField(field, errorId, message, regex) {
      const value = (field.value || '').trim();
      if (!value || (regex && !regex.test(value))) {
        showError(errorId, message);
        isValid = false;
      }
    }

    checkField(brand, 'error-brand', 'Brand is required (letters and numbers only).', validText);
    checkField(title, 'error-title', 'Title is required (letters and numbers only).', validText);
    checkField(description, 'error-description', 'Description is required (letters and numbers only).', validText);
    checkField(price, 'error-price', 'Enter a valid price greater than 0.', validPrice);

    ['color', 'size', 'category', 'gender', 'status', 'stock'].forEach(function (name) {
      const field = document.getElementById(name);
      if (!field || !field.value) {
        showError('error-' + name, 'This field is required.');
        isValid = false;
      }
    });

    const tags = document.getElementById('product-tags');
    if (!tags || !tags.value.trim()) {
      showError('error-tags', 'At least one tag is required.');
      isValid = false;
    }

    const priceVal = parseFloat(price.value);
    if (!priceVal || priceVal <= 0) {
      showError('error-price', 'Price must be greater than 0.');
      isValid = false;
    }

    const discountVal = discountPrice.value.trim();
    if (discountVal) {
      if (!validPrice.test(discountVal) || parseFloat(discountVal) <= 0) {
        showError('error-discount-price', 'Enter a valid discount price greater than 0.');
        isValid = false;
      } else if (parseFloat(discountVal) >= priceVal) {
        showError('error-discount-price', 'Discount price must be less than the regular price.');
        isValid = false;
      }
    }

    const imageInputs = document.querySelectorAll('.product-image-input');
    let allImages = true;
    imageInputs.forEach(function (input) {
      const slot = input.id.replace('imageInput', '');
      const errorEl = document.getElementById('imageError' + slot);
      if (!input.files || !input.files.length) {
        if (errorEl) {
          errorEl.textContent = 'This image is required.';
          errorEl.style.display = 'block';
        }
        allImages = false;
      }
    });

    if (!allImages) {
      showError('imagesErr', 'Please upload and crop all four images.');
      isValid = false;
    }

    if (isValid) form.submit();
  };

  initCropperModal();
  bindApplyCrop();
})();
