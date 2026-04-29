const body = document.body;
const menuButton = document.querySelector(".menu-toggle");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const updateHeaderState = () => {
  body.classList.toggle("is-scrolled", window.scrollY > 12);
};

menuButton?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("nav-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("nav-open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
);

sections.forEach((section) => navObserver.observe(section));

const revealItems = document.querySelectorAll(
  ".section, .timeline-item, .info-card, .experience-list article, .work-card, .skill-cloud span"
);

revealItems.forEach((item) => item.classList.add("reveal"));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const previewModal = document.querySelector(".preview-modal");
const modalImage = document.querySelector(".modal-image");
const modalTitle = document.querySelector("#modal-title");
const modalDescription = document.querySelector(".modal-description");
const modalCloseButtons = document.querySelectorAll(".modal-close, .modal-backdrop");

const workCards = [...document.querySelectorAll(".work-card")];
const processSteps = ["Research", "Analysis", "Design", "Prototype", "Evaluation"];

const openPreview = (link) => {
  if (!previewModal || !modalImage || !modalTitle || !modalDescription) return;
  const image = link.querySelector("img");
  modalImage.src = link.href;
  modalImage.alt = image?.alt || link.dataset.title || "";
  modalTitle.textContent = link.dataset.title || "";
  modalDescription.textContent = link.dataset.description || "";
  previewModal.classList.add("is-open");
  previewModal.setAttribute("aria-hidden", "false");
  body.classList.add("modal-open");
};

const closePreview = () => {
  if (!previewModal || !modalImage) return;
  previewModal.classList.remove("is-open");
  previewModal.setAttribute("aria-hidden", "true");
  body.classList.remove("modal-open");
  modalImage.src = "";
};

// Works cards: create a lightweight expandable research/detail layer without changing the original card content.
const buildWorkDetails = (card) => {
  if (card.querySelector(".work-details")) return;

  const link = card.querySelector("[data-preview='true']");
  const cardNumber = card.querySelector(".year")?.textContent?.trim() || "—";
  const category = card.querySelector(".work-type")?.textContent?.trim() || "—";
  const tools = card.dataset.tools || "—";
  const description = link?.dataset.description || "—";
  const keywords = (card.dataset.keywords || "Research, Interaction Design")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  const details = document.createElement("div");
  details.className = "work-details";
  details.setAttribute("aria-hidden", "true");
  details.innerHTML = `
    <div class="work-details-inner">
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Project year</span>
          <p class="detail-value">—</p>
        </div>
        <div class="detail-item">
          <span class="detail-label">Category</span>
          <p class="detail-value">${category}</p>
        </div>
        <div class="detail-item">
          <span class="detail-label">Tools</span>
          <p class="detail-value">${tools}</p>
        </div>
      </div>
      <p class="detail-description">${cardNumber} · ${description}</p>
      <div class="keyword-tags" aria-label="Research keyword tags">
        ${keywords.map((keyword, index) => `<span style="--tag-index: ${index}">${keyword}</span>`).join("")}
      </div>
      <div class="process-timeline" aria-label="Project process timeline">
        ${processSteps.map((step, index) => `<span class="process-step" style="--step-index: ${index}">${step}</span>`).join("")}
      </div>
      <button class="detail-button" type="button">View Detail</button>
    </div>
  `;

  card.append(details);
};

const closeExpandedCards = (exceptCard) => {
  workCards.forEach((card) => {
    if (card !== exceptCard) {
      card.classList.remove("is-expanded");
      card.setAttribute("aria-expanded", "false");
      card.querySelector(".work-details")?.setAttribute("aria-hidden", "true");
    }
  });
};

const toggleWorkCard = (card) => {
  buildWorkDetails(card);
  const shouldOpen = !card.classList.contains("is-expanded");
  closeExpandedCards(card);
  card.classList.toggle("is-expanded", shouldOpen);
  card.setAttribute("aria-expanded", String(shouldOpen));
  card.querySelector(".work-details")?.setAttribute("aria-hidden", String(!shouldOpen));
};

workCards.forEach((card) => {
  card.setAttribute("aria-expanded", "false");
  buildWorkDetails(card);

  const media = card.querySelector(".work-media");
  const info = card.querySelector(".work-info");
  const link = card.querySelector("[data-preview='true']");

  media?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (link) openPreview(link);
  });

  info?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWorkCard(card);
  });

  card.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : event.target.parentElement;
    const detailButton = target?.closest(".detail-button");
    const clickedMedia = target?.closest(".work-media");

    if (detailButton || clickedMedia) {
      event.preventDefault();
      event.stopPropagation();
      if (link) openPreview(link);
      return;
    }

    if (target?.closest("a")) {
      event.preventDefault();
    }

    toggleWorkCard(card);
  });
});

modalCloseButtons.forEach((button) => {
  button.addEventListener("click", closePreview);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePreview();
});

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });
