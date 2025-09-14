// Загальна функція для перегортання сторінок книги
function setupBookTurning() {
  const book = document.getElementById("book");
  if (!book) return;

  let pages = Array.from(book.querySelectorAll(".page"));
  let current = 0; // Встановлюємо початкову сторінку на 0 (перша)
  let startX = 0;
  let isDragging = false;
  let isModalOpen = false;

  function updatePages() {
    const thickness = 6;
    pages.forEach((page, i) => {
      const isFlipped = i < current;

      page.classList.toggle("flipped", isFlipped);
      page.classList.remove("flipping");

      page.style.zIndex = isFlipped ? pages.length - i + 100 : pages.length - i;

      if (isFlipped) {
        page.style.transform = `rotateY(-180deg) translateZ(${i * thickness}px)`;
      } else {
        page.style.transform = `rotateY(0deg) translateZ(${i * thickness}px)`;
      }
    });

    const lastPage = pages[pages.length - 1];
    if (lastPage) {
      lastPage.style.zIndex = 1;
      lastPage.style.transform = `rotateY(0deg) translateZ(0px)`;
    }
  }

  // Обробники подій для книги
  function handleStart(e) {
    if (isModalOpen) return;
    isDragging = true;
    startX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
  }

  function handleMove(e) {
    if (!isDragging || isModalOpen) return;
    const currentX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
    const diff = startX - currentX;
    const progress = Math.min(Math.max(diff / book.offsetWidth, 0), 1);

    if (pages[current]) {
      const rotate = progress * -180;
      const skew = rotate / 6;
      pages[current].style.transform = `rotateY(${rotate}deg) translateZ(${
        current * 6
      }px) skewY(${skew}deg)`;
      pages[current].classList.add("flipping");
    }
  }

  function handleEnd(e) {
    if (!isDragging) return;
    const endX = e.type.startsWith("touch") ? e.changedTouches[0].clientX : e.clientX;
    const diff = startX - endX;

    if (diff > 50 && current < pages.length - 1) {
      current++;
    } else if (diff < -50 && current > 0) {
      current--;
    }

    isDragging = false;
    updatePages();
  }

  book.addEventListener("touchstart", handleStart, { passive: true });
  book.addEventListener("touchmove", handleMove, { passive: true });
  book.addEventListener("touchend", handleEnd);
  book.addEventListener("mousedown", handleStart);
  book.addEventListener("mousemove", handleMove);
  book.addEventListener("mouseup", handleEnd);

  // Оновлюємо сторінки після динамічного додавання фото
  window.addEventListener("photos-generated", () => {
    pages = Array.from(book.querySelectorAll(".page"));
    updatePages();
  });

  // Викликаємо функцію оновлення сторінок для початкового стану
  updatePages();

  const activateButton = document.getElementById("activate-button");
  const activationMessage = document.getElementById("activation-message");

  if (activateButton) {
    activateButton.addEventListener("click", () => {
      activateButton.disabled = true;
      activationMessage.classList.remove("hidden");
      activationMessage.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }
}

// Функція для генерації сторінок з фото
function generatePhotoPages() {
  const photoContainer = document.getElementById("photo-gallery-container");
  if (!photoContainer) return;

  const photoPaths = [
    "./images/s.png",
    "./images/m.png",
    "./images/1.jpg",
    "./images/2.jpg",
    "./images/3.jpg",
    "./images/4.jpg",
    "./images/5.jpg",
    "./images/6.jpg",
    "./images/7.jpg",
    "./images/8.jpg",
    "./images/9.jpg",
  ];

  const photosPerPage = 4;
  let pageContent = "";

  for (let i = 0; i < photoPaths.length; i += photosPerPage) {
    const photosForThisPage = photoPaths.slice(i, i + photosPerPage);

    pageContent += `
      <div class="page">
        <div class="shadow-overlay"></div>
        <h2>Фотогалерея</h2>
        <div class="photo-grid">
    `;

    photosForThisPage.forEach(path => {
      pageContent += `
        <div class="photo-item">
          <a href="#" class="photo-link" data-src="${path}">
            <img src="${path}" alt="Фото з події" />
          </a>
        </div>
      `;
    });

    pageContent += `</div></div>`;
  }

  photoContainer.innerHTML = pageContent;

  window.dispatchEvent(new Event("photos-generated"));
}

// Логіка слайдера модального вікна
function setupPhotoSlider() {
  const modal = document.getElementById("photo-modal");
  if (!modal) return;

  const modalImg = document.getElementById("modal-image");
  const closeBtn = document.querySelector(".modal-close");
  const prevBtn = document.getElementById("modal-prev");
  const nextBtn = document.getElementById("modal-next");
  const pagination = document.getElementById("modal-pagination");

  let allPhotoPaths = [];
  let currentIndex = 0;
  let touchStartX = 0;

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  function collectPhotoPaths() {
    allPhotoPaths = Array.from(document.querySelectorAll(".photo-link")).map(
      link => link.dataset.src
    );
  }

  function updateModalImage() {
    modalImg.src = allPhotoPaths[currentIndex];
    modalImg.alt = `Фото ${currentIndex + 1}`;

    if (pagination) {
      pagination.innerHTML = "";
      allPhotoPaths.forEach((_, i) => {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        if (i === currentIndex) {
          dot.classList.add("active");
        }
        dot.addEventListener("click", () => {
          currentIndex = i;
          updateModalImage();
        });
        pagination.appendChild(dot);
      });
    }

    if (!isMobile) {
      prevBtn.style.display = currentIndex === 0 ? "none" : "block";
      nextBtn.style.display = currentIndex === allPhotoPaths.length - 1 ? "none" : "block";
    }
  }

  // Використовуємо класи для керування відображенням
  function openModal(src) {
    collectPhotoPaths();
    currentIndex = allPhotoPaths.indexOf(src);
    modal.classList.add("active");
    updateModalImage();
  }

  function closeModal() {
    modal.classList.remove("active");
  }

  if (!isMobile) {
    prevBtn.addEventListener("click", e => {
      e.stopPropagation();
      if (currentIndex > 0) {
        currentIndex--;
        updateModalImage();
      }
    });

    nextBtn.addEventListener("click", e => {
      e.stopPropagation();
      if (currentIndex < allPhotoPaths.length - 1) {
        currentIndex++;
        updateModalImage();
      }
    });

    document.addEventListener("keydown", e => {
      if (modal.classList.contains("active")) {
        if (e.key === "ArrowLeft" && currentIndex > 0) {
          currentIndex--;
          updateModalImage();
        } else if (e.key === "ArrowRight" && currentIndex < allPhotoPaths.length - 1) {
          currentIndex++;
          updateModalImage();
        }
      }
    });
  } else {
    modal.addEventListener(
      "touchstart",
      e => {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true }
    );

    modal.addEventListener("touchend", e => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;

      if (diff > 50) {
        if (currentIndex < allPhotoPaths.length - 1) {
          currentIndex++;
          updateModalImage();
        }
      } else if (diff < -50) {
        if (currentIndex > 0) {
          currentIndex--;
          updateModalImage();
        }
      }
    });
  }

  document.addEventListener("click", e => {
    const photoLink = e.target.closest(".photo-link");
    if (photoLink) {
      e.preventDefault();
      openModal(photoLink.dataset.src);
    }
  });

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  generatePhotoPages();
  setupBookTurning();
  setupPhotoSlider();
});
