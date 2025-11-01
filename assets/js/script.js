"use strict";

// Utility: toggle class
const elementToggleFunc = (elem) => elem.classList.toggle("active");

// Sidebar toggle
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");
if (sidebar && sidebarBtn) {
  sidebarBtn.addEventListener("click", () => elementToggleFunc(sidebar));
}

// Testimonials modal
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal content nodes
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

const testimonialsModalFunc = () => {
  if (!modalContainer || !overlay) return;
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
};

for (let i = 0; i < testimonialsItem.length; i++) {
  testimonialsItem[i].addEventListener("click", function () {
    if (!modalImg || !modalTitle || !modalText) return;
    const avatar = this.querySelector("[data-testimonials-avatar]");
    const titleEl = this.querySelector("[data-testimonials-title]");
    const textEl = this.querySelector("[data-testimonials-text]");

    if (avatar) {
      modalImg.src = avatar.src;
      modalImg.alt = avatar.alt || "Testimonial avatar";
    }
    if (titleEl) modalTitle.innerHTML = titleEl.innerHTML;
    if (textEl) modalText.innerHTML = textEl.innerHTML;

    testimonialsModalFunc();
  });
}

if (modalCloseBtn) modalCloseBtn.addEventListener("click", testimonialsModalFunc);
if (overlay) overlay.addEventListener("click", testimonialsModalFunc);

// Custom select (portfolio filters)
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

if (select) {
  select.addEventListener("click", function () {
    elementToggleFunc(this);
  });
}

const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {
  for (let i = 0; i < filterItems.length; i++) {
    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }
  }
};

for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {
    const selectedValue = this.innerText.toLowerCase();
    if (selectValue) selectValue.innerText = this.innerText;
    if (select) elementToggleFunc(select);
    filterFunc(selectedValue);
  });
}

// Large screen filter buttons
let lastClickedBtn = filterBtn[0] || null;
for (let i = 0; i < filterBtn.length; i++) {
  filterBtn[i].addEventListener("click", function () {
    const selectedValue = this.innerText.toLowerCase();
    if (selectValue) selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    if (lastClickedBtn) lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;
  });
}

// Contact form enable/disable + submit via Formspree
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");
const statusEl = document.querySelector("#formStatus");
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mpwooroj";

for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {
    if (form && form.checkValidity()) {
      formBtn && formBtn.removeAttribute("disabled");
    } else {
      formBtn && formBtn.setAttribute("disabled", "");
    }
  });
}

if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!formBtn) return;
    formBtn.setAttribute("disabled", "");
    const oldLabel = formBtn.querySelector("span")?.innerText || "Send Message";
    if (formBtn.querySelector("span")) formBtn.querySelector("span").innerText = "Sending...";

    const data = new FormData(form);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });

      if (res.ok) {
        if (statusEl) {
          statusEl.style.color = "green";
          statusEl.textContent = "Thanks! Your message has been sent.";
        }
        form.reset();
        formBtn.setAttribute("disabled", "");

        // Optional GA4 event
        if (window.gtag) window.gtag("event", "generate_lead", { form: "contact" });
      } else {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.errors?.[0]?.message || "Something went wrong.");
      }
    } catch (err) {
      if (statusEl) {
        statusEl.style.color = "crimson";
        statusEl.textContent = "Failed to send. Please try again.";
      }
      console.error(err);
    } finally {
      if (formBtn.querySelector("span")) formBtn.querySelector("span").innerText = oldLabel;
    }
  });
}

// SPA navigation with anchor links (#about, #resume, ...)
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

const setActivePage = (pageId) => {
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const link = navigationLinks[i];
    const isTarget = page.dataset.page === pageId;
    if (isTarget) {
      page.classList.add("active");
      if (link) link.classList.add("active");
    } else {
      page.classList.remove("active");
      if (link) link.classList.remove("active");
    }
  }
};

const handleHash = () => {
  const hash = (location.hash || "#about").replace("#", "");
  setActivePage(hash);
  // Smooth scroll to top of main content
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Init: set by hash if present
window.addEventListener("hashchange", handleHash);
window.addEventListener("DOMContentLoaded", handleHash);

// Also intercept nav link clicks for smooth UX
navigationLinks.forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (href && href.startsWith("#")) {
      e.preventDefault();
      const id = href.slice(1);
      if (location.hash !== href) location.hash = href; else handleHash();
    }
  });
});
