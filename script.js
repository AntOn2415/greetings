const book = document.getElementById("book");
const pages = Array.from(book.querySelectorAll(".page"));
let current = 0;
let startX = 0;
let isDragging = false;

function updatePages(progress = null) {
  const thickness = 6;
  pages.forEach((page, i) => {
    if (i === pages.length - 1) {
      page.classList.remove("flipped", "flipping");
      page.style.transform = "rotateY(0deg) translateZ(0px)";
      page.style.zIndex = pages.length - i;
      return;
    }

    if (progress !== null && i === current) {
      const rotate = Math.min(Math.max(progress, 0), 1) * -180;
      const skew = rotate / 6;
      page.style.transform = `rotateY(${rotate}deg) translateZ(${
        i * thickness
      }px) skewY(${skew}deg)`;
      page.style.zIndex = pages.length - i;
      page.classList.add("flipping");

      page.style.setProperty("--shadow-x", `${(rotate / 180) * 50}%`);
      page.querySelector(":after");
    } else {
      page.classList.remove("flipping");
      if (i < current) {
        page.classList.add("flipped");
        page.style.transform = `rotateY(-180deg) translateZ(${i * thickness}px)`;
        page.style.zIndex = pages.length - i;
      } else {
        page.classList.remove("flipped");
        page.style.transform = `rotateY(0deg) translateZ(${i * thickness}px)`;
        page.style.zIndex = pages.length - i;
      }
    }
  });
}

book.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  isDragging = true;
});
book.addEventListener("touchmove", e => {
  const currentX = e.touches[0].clientX;
  let diff = startX - currentX;
  let progress = diff / book.offsetWidth;
  progress = Math.min(Math.max(progress, 0), 1);
  updatePages(progress);
});
book.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  let diff = startX - endX;
  if (diff > 50 && current < pages.length - 1) current++;
  else if (diff < -50 && current > 0) current--;
  isDragging = false;
  updatePages();
});

book.addEventListener("mousedown", e => {
  startX = e.clientX;
  isDragging = true;
});
book.addEventListener("mousemove", e => {
  if (!isDragging) return;
  const currentX = e.clientX;
  let diff = startX - currentX;
  let progress = diff / book.offsetWidth;
  progress = Math.min(Math.max(progress, 0), 1);
  updatePages(progress);
});
book.addEventListener("mouseup", e => {
  if (!isDragging) return;
  const endX = e.clientX;
  let diff = startX - endX;
  if (diff > 50 && current < pages.length - 1) current++;
  else if (diff < -50 && current > 0) current--;
  isDragging = false;
  updatePages();
});

updatePages();

// ---
// Логіка для кнопки "Активувати сертифікат"
// ---
const activateButton = document.getElementById("activate-button");
const activationMessage = document.getElementById("activation-message");

if (activateButton) {
  activateButton.addEventListener("click", () => {
    activateButton.disabled = true;
    activationMessage.classList.remove("hidden");
    activationMessage.scrollIntoView({ behavior: "smooth", block: "end" });
  });
}

// ---
// Логіка для модального вікна фотографій
// ---
const modal = document.getElementById("photo-modal");
const modalImg = document.getElementById("modal-image");
const closeBtn = document.querySelector(".modal-close");
const photoLinks = document.querySelectorAll(".photo-link");

photoLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    modal.style.display = "flex";
    modalImg.src = e.target.closest("a").querySelector("img").dataset.src;
  });
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

modal.addEventListener("click", e => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Запобігання гортанню книги, якщо відкрито модальне вікно
book.addEventListener("mousedown", e => {
  if (modal.style.display === "flex") {
    isDragging = false;
    e.stopPropagation();
  } else {
    startX = e.clientX;
    isDragging = true;
  }
});
