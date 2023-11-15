
function colorizeUrls(text) {
  const urlRegex = /(\b(https?|ftp|file):\/\/|www\.)\S+/g;
    
  const result = text.replace(urlRegex, (url) => {
    if (url.startsWith("www.")) {
      url = "http://" + url;
    }
    return `<a href="${url}" class="url" target="_blank">${url}</a>`;
  });

  return result;
}

  
document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.querySelector(".menu");
    const body = document.body;
  
    menuButton.addEventListener("click", function () {
      if (body.classList.contains("show-aside")) {
        body.classList.remove("show-aside");
        body.classList.add("hide-aside");
      } else {
        body.classList.remove("hide-aside");
        body.classList.add("show-aside");
      }
    });
  

    body.classList.add("show-aside");
});
