document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".image-frame img").forEach((image) => {
    image.addEventListener("error", () => {
      image.closest(".image-frame")?.classList.add("image-missing");
    });
  });

  document.querySelectorAll(".protected-image").forEach((image) => {
    image.addEventListener("contextmenu", (event) => event.preventDefault());
    image.addEventListener("dragstart", (event) => event.preventDefault());
    image.setAttribute("draggable", "false");
  });

  document.querySelectorAll(".product-media").forEach((media) => {
    const thumbs = Array.from(media.querySelectorAll("[data-product-thumb]"));
    const previous = media.querySelector("[data-product-prev]");
    const next = media.querySelector("[data-product-next]");
    const openButton = media.querySelector("[data-product-open]");
    if (!thumbs.length) return;

    let currentIndex = 0;
    const visibleThumbs = 5;
    let lightbox;
    let lightboxImage;

    const showImage = (index) => {
      currentIndex = (index + thumbs.length) % thumbs.length;
      const button = thumbs[currentIndex];
      const target = document.querySelector(button.dataset.productTarget);
      if (!target) return;

      target.src = button.dataset.productSrc;
      target.alt = button.dataset.productAlt || "";
      target.closest(".image-frame")?.classList.remove("image-missing");

      const firstVisible = Math.min(
        Math.max(currentIndex - Math.floor(visibleThumbs / 2), 0),
        Math.max(thumbs.length - visibleThumbs, 0)
      );

      thumbs.forEach((thumb, thumbIndex) => {
        const isActive = thumbIndex === currentIndex;
        const isVisible = thumbIndex >= firstVisible && thumbIndex < firstVisible + visibleThumbs;
        thumb.classList.toggle("is-active", isActive);
        thumb.classList.toggle("is-thumb-hidden", !isVisible);
        thumb.setAttribute("aria-current", isActive ? "true" : "false");
      });

      if (lightboxImage) {
        lightboxImage.src = button.dataset.productSrc;
        lightboxImage.alt = button.dataset.productAlt || "";
      }
    };

    const closeLightbox = () => {
      lightbox?.remove();
      lightbox = null;
      lightboxImage = null;
      document.body.classList.remove("is-product-lightbox-open");
    };

    const openLightbox = () => {
      if (lightbox) return;
      const button = thumbs[currentIndex];
      lightbox = document.createElement("div");
      lightbox.className = "product-lightbox";
      lightbox.innerHTML = `
        <button class="product-lightbox-close" type="button" aria-label="Close larger image">×</button>
        <button class="product-lightbox-nav product-lightbox-prev" type="button" aria-label="Previous image">‹</button>
        <img class="product-lightbox-image protected-image" src="${button.dataset.productSrc}" alt="${button.dataset.productAlt || ""}" draggable="false">
        <button class="product-lightbox-nav product-lightbox-next" type="button" aria-label="Next image">›</button>
      `;
      document.body.append(lightbox);
      document.body.classList.add("is-product-lightbox-open");
      lightboxImage = lightbox.querySelector(".product-lightbox-image");
      lightboxImage?.addEventListener("contextmenu", (event) => event.preventDefault());
      lightboxImage?.addEventListener("dragstart", (event) => event.preventDefault());

      lightbox.querySelector(".product-lightbox-close")?.addEventListener("click", closeLightbox);
      lightbox.querySelector(".product-lightbox-prev")?.addEventListener("click", () => showImage(currentIndex - 1));
      lightbox.querySelector(".product-lightbox-next")?.addEventListener("click", () => showImage(currentIndex + 1));
      lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) closeLightbox();
      });
    };

    thumbs.forEach((button, index) => {
      button.addEventListener("click", () => showImage(index));
    });

    previous?.addEventListener("click", () => showImage(currentIndex - 1));
    next?.addEventListener("click", () => showImage(currentIndex + 1));
    openButton?.addEventListener("click", openLightbox);
    document.addEventListener("keydown", (event) => {
      if (!lightbox) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showImage(currentIndex - 1);
      if (event.key === "ArrowRight") showImage(currentIndex + 1);
    });
    showImage(0);
  });
});
