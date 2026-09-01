const stageData = {
  baseline: {
    number: "Stage 01",
    title: "Represent baseline heterogeneity",
    description: "A cross-sectional variational model generates plausible starting profiles while keeping baseline sampling distinct from the longitudinal transition process.",
    core: "Variational baseline model",
    icon: "β",
    output: "Diverse synthetic starting states",
    list: ["Cross-sectional representation", "Controlled synthetic sampling", "No source rows published"]
  },
  dynamics: {
    number: "Stage 02",
    title: "Learn longitudinal transitions",
    description: "A frozen multi-task LSTM reads five previous visits and jointly models disability change, treatment tier, the next visit interval and relapse probability.",
    core: "Multi-task sequence model",
    icon: "Δ",
    output: "Four next-visit predictions",
    list: ["Five-visit context window", "Twenty-nine input features", "Four linked prediction heads"]
  },
  generation: {
    number: "Stage 03",
    title: "Generate in closed loop",
    description: "Predicted outputs are assembled into the next visit, clinically constrained and returned to the history window so a full ten-visit trajectory can unfold.",
    core: "Hybrid SIMS generator",
    icon: "↻",
    output: "Longitudinal synthetic cohort",
    list: ["Autoregressive generation", "Clinical constraint enforcement", "Hybrid empirical and model process"]
  },
  release: {
    number: "Stage 04",
    title: "Release only after validation",
    description: "Candidate cohorts must pass structural and clinical checks, frozen-reference validation and checksum governance before they can become an approved SIMS release.",
    core: "Governed release gate",
    icon: "✓",
    output: "Checksum-governed candidate",
    list: ["20,000-patient validation run", "Aggregate drift sentinels", "Versioned release manifest"]
  }
};

const outputData = {
  edss: {
    label: "Continuous output",
    title: "Change in disability",
    description: "Predicts the change in Expanded Disability Status Scale score used to construct the next visit.",
    head: "Regression",
    role: "Updates disability state",
    key: "delta_edss"
  },
  dmt: {
    label: "Ordinal output",
    title: "Treatment tier",
    description: "Predicts the next four-level disease-modifying therapy tier as part of the evolving treatment history.",
    head: "Ordinal classification",
    role: "Updates treatment state",
    key: "dmt_tier"
  },
  gap: {
    label: "Continuous output",
    title: "Time to next visit",
    description: "Predicts the interval in days before the next modelled clinical visit, preserving irregular follow-up timing.",
    head: "Regression",
    role: "Advances longitudinal time",
    key: "visit_gap_days"
  },
  relapse: {
    label: "Probabilistic output",
    title: "Relapse occurrence",
    description: "Predicts relapse probability for the next visit, using the frozen operating threshold only inside the governed workflow.",
    head: "Binary classification",
    role: "Updates relapse history",
    key: "relapse_probability"
  }
};

const stageButtons = document.querySelectorAll("[data-stage]");
const stageFields = {
  number: document.querySelector("[data-stage-number]"),
  title: document.querySelector("[data-stage-title]"),
  description: document.querySelector("[data-stage-description]"),
  core: document.querySelector("[data-stage-core]"),
  icon: document.querySelector("[data-stage-icon]"),
  output: document.querySelector("[data-stage-output]"),
  list: document.querySelector("[data-stage-list]")
};

stageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = stageData[button.dataset.stage];
    stageButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });
    stageFields.number.textContent = selected.number;
    stageFields.title.textContent = selected.title;
    stageFields.description.textContent = selected.description;
    stageFields.core.textContent = selected.core;
    stageFields.icon.textContent = selected.icon;
    stageFields.output.textContent = selected.output;
    stageFields.list.replaceChildren(...selected.list.map((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    }));
  });
});

const outputButtons = document.querySelectorAll("[data-output]");
const outputFields = {
  label: document.querySelector("[data-output-label]"),
  title: document.querySelector("[data-output-title]"),
  description: document.querySelector("[data-output-description]"),
  head: document.querySelector("[data-output-head]"),
  role: document.querySelector("[data-output-role]"),
  json: document.querySelector("[data-contract-json]")
};

outputButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = outputData[button.dataset.output];
    outputButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });
    outputFields.label.textContent = selected.label;
    outputFields.title.textContent = selected.title;
    outputFields.description.textContent = selected.description;
    outputFields.head.textContent = selected.head;
    outputFields.role.textContent = selected.role;
    outputFields.json.textContent = JSON.stringify({
      sequence_length: 5,
      input_features: 29,
      selected_output: selected.key,
      clinical_use: false
    }, null, 2);
  });
});

const header = document.querySelector("[data-header]");
window.addEventListener("scroll", () => header.classList.toggle("compact", window.scrollY > 40), { passive: true });

const menuButton = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));

const modal = document.querySelector("[data-contract-modal]");
const openModal = () => {
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modal.querySelector("[data-close-contract]").focus();
};
const closeModal = () => {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
};
document.querySelector("[data-open-contract]").addEventListener("click", openModal);
modal.querySelectorAll("[data-close-contract]").forEach((item) => item.addEventListener("click", closeModal));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeModal();
});

const revealTargets = document.querySelectorAll(".overview-grid, .method-heading, .method-stage, .explorer-grid, .evidence-heading, .evidence-grid, .evidence-boundary, .access-heading, .access-grid, .researcher");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  revealTargets.forEach((item) => item.setAttribute("data-reveal", ""));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((item) => observer.observe(item));
}
