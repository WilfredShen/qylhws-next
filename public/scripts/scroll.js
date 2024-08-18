document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll('a.ws-heading-anchor[href^="#"]')
    .forEach(anchor => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
          behavior: "smooth",
        });
      });
    });
});
