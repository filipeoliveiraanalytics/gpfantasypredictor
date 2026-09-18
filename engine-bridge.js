(() => {
  const SOURCE = "gp-fantasy-optimizer";
  const parentOrigin = window.location.origin;

  function isReady() {
    return document.querySelector("#data-status")?.textContent.includes("model ready");
  }

  function waitFor(condition, timeout = 30000) {
    const started = Date.now();
    return new Promise((resolve, reject) => {
      const check = () => {
        if (condition()) return resolve();
        if (Date.now() - started > timeout) return reject(new Error("The optimizer engine did not finish loading."));
        window.setTimeout(check, 80);
      };
      check();
    });
  }

  function send(type, payload = {}) {
    if (window.parent === window) return;
    window.parent.postMessage({ source: SOURCE, type, ...payload }, parentOrigin);
  }

  function setValue(selector, value) {
    const input = document.querySelector(selector);
    if (!input) throw new Error(`Missing optimizer field: ${selector}`);
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  async function optimise({ requestId, input }) {
    try {
      await waitFor(isReady);
      setValue("#budget", input.budget);
      setValue("#free-transfers", input.transfers);
      setValue("#drivers", input.drivers.join(", "));
      setValue("#constructors", input.constructors.join(", "));
      setValue("#strategy", input.strategy);
      document.querySelectorAll("#available-chip-options input").forEach((chip) => {
        chip.checked = input.chips.includes(chip.value);
      });
      document.querySelector("#optimize-button").click();
      await waitFor(() => document.querySelectorAll("#driver-list .chip").length === 5 && document.querySelectorAll("#constructor-list .chip").length === 2);
      const names = [...document.querySelectorAll("#driver-list .chip strong, #constructor-list .chip strong")].map((element) => element.textContent.trim());
      send("result", {
        requestId,
        names,
        boostName: document.querySelector("#boost-driver small")?.textContent.trim() || "",
        transferText: document.querySelector("#transfer-penalty")?.textContent || "0",
        points: document.querySelector("#net-points")?.textContent.trim() || "--",
        cost: document.querySelector("#team-cost")?.textContent.trim() || "--",
        chip: document.querySelector("#why-lineup .chip-recommendation-badge")?.textContent.trim() || "",
      });
    } catch (error) {
      send("error", { requestId, message: error.message || "The optimizer could not complete this request." });
    }
  }

  window.addEventListener("message", (event) => {
    if (event.origin !== parentOrigin || event.data?.source !== SOURCE || event.data?.type !== "optimise") return;
    optimise(event.data);
  });

  waitFor(isReady).then(() => send("ready")).catch((error) => send("error", { message: error.message }));
})();
