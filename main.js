"use strict";

(() => {
  const button = document.getElementById("open-letter-button");
  const opening = document.querySelector(".opening");
  const envelopeContainer = document.getElementById("envelope-sheets-container");
  const rainContainer = document.getElementById("rain-sheets-container");

  if (!button || !opening || !envelopeContainer || !rainContainer) return;

  const messages = [
  "🌸 Chúc bạn luôn xinh đẹp, tự tin và gặp nhiều may mắn nhé! 💖",
  "🌷 Chúc bạn luôn rạng rỡ, công việc thuận lợi và tràn đầy năng lượng tích cực! ✨",
  "💐 Chúc bạn luôn ngập tràn niềm vui, nhận được nhiều yêu thương và thật hạnh phúc! 🥰",
  "🌻 Chúc bạn luôn vui tươi, yêu đời và thành công trên con đường mình chọn! 💕",
  "🎀 Chúc bạn ngày càng xinh đẹp, bản lĩnh và gặp nhiều điều tốt đẹp! 🌸",
  "🩷 Chúc bạn luôn được yêu thương, trân trọng và mọi cố gắng đều được đền đáp! 🌷",
  "🌹 Chúc bạn luôn vui vẻ, tiền bạc rủng rỉnh, công việc hanh thông! 🍀",
  "🦋 Chúc bạn luôn tự tin, bình an và có một tuổi trẻ thật rực rỡ! 💐",
  "🌺 Chúc bạn luôn xinh tươi, may mắn và mọi chuyện đều thuận lợi! 💝",
  "✨ Chúc bạn luôn lạc quan, gặp nhiều cơ hội tốt và sớm đạt mục tiêu! 🌷",
  "💖 Chúc bạn mạnh khỏe, vui vẻ và luôn có những người bạn tốt bên cạnh! 🌸",
  "🌼 Chúc bạn mỗi ngày đều trọn vẹn niềm vui, nhận được nhiều yêu thương và những bất ngờ đáng yêu! 🎁",
  "🥳 Chúc bạn ngày càng xinh đẹp, thành công và giàu có nhé! 💐",
  "🌈 Chúc bạn luôn mạnh mẽ, kiên trì và gặp nhiều điều may mắn! 💕",
  "🌹 Chúc bạn luôn vui vẻ, công việc như ý và cuộc sống ngập tràn tiếng cười! 🥰",
  "🎉 Chúc bạn ngày càng trưởng thành, thành công và luôn yêu đời! 💗",
  "🌷 Chúc bạn luôn tươi trẻ, mọi việc suôn sẻ và gặp nhiều may mắn! 🍀",
  "🩷 Chúc bạn luôn tự tin, tỏa sáng và hạnh phúc theo cách riêng! 🦋",
  "💐 Chúc bạn luôn ấm áp, ngập tràn tiếng cười và có thật nhiều khoảnh khắc hạnh phúc! 🌸",
  "🌻 Chúc bạn luôn xinh đẹp, độc lập và sớm đạt được ước mơ! ✨",
  "🎀 Chúc bạn gặp nhiều cơ hội tốt, công việc thuận lợi và thành công! 💖",
  "🌺 Chúc bạn mỗi ngày đều vui vẻ, bình an và có nhiều điều đáng nhớ! 🥰",
  "🍀 Chúc bạn may mắn, thành công và mọi điều tốt đẹp đều đến! 🌷",
  "💝 Chúc bạn luôn rạng rỡ, tích cực và giữ mãi nụ cười trên môi! 🌼"
];

  let started = false;

  button.addEventListener("click", () => {
    if (started) return;
    started = true;
    button.disabled = true;
    opening.classList.add("is-open");

    // Phase 1: Thư bắn ra từ phong bì
    setTimeout(() => {
      shootLettersFromEnvelope();
    }, 300);

    // Phase 2: Mưa thư rơi dồn dập lấp đầy màn hình
    setTimeout(() => {
      startRainOfLetters();
    }, 1500);
  });

  function shootLettersFromEnvelope() {
    for (let i = 0; i < 8; i++) {
      const sheet = document.createElement("div");
      sheet.className = "envelope-sheet shoot-out";
      
      const shootX = (Math.random() - 0.5) * (window.innerWidth * 0.8);
      const rot = (Math.random() - 0.5) * 40;
      
      sheet.style.setProperty("--shootX", `${shootX}px`);
      sheet.style.setProperty("--rot", `${rot}deg`);
      sheet.style.animationDelay = `${i * 120}ms`;

      envelopeContainer.appendChild(sheet);
    }
  }

  function startRainOfLetters() {
    const isMobile = window.innerWidth <= 600;
    
    const sheetW = isMobile ? 160 : 280;
    const sheetH = isMobile ? 90 : 120;
    
    const cols = Math.ceil(window.innerWidth / (sheetW * 0.85)) + 1;
    const rows = Math.ceil(window.innerHeight / (sheetH * 0.85)) + 1;

    let letters = [];
    let dropDelay = 0; 

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sheet = document.createElement("div");
        sheet.className = "falling-sheet";
        
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        sheet.innerHTML = `<p style="margin:0">${randomMsg}</p>`;

        const posX = (c * sheetW * 0.8) + (Math.random() - 0.5) * 40; 
        const posY = (r * sheetH * 0.8) + (Math.random() - 0.5) * 40;

        sheet.style.left = `${posX}px`;
        sheet.style.top = `${posY}px`;

        const duration = 4.5 + Math.random() * 2; 
        const rotStart = (Math.random() - 0.5) * 40;
        const rotEnd = (Math.random() - 0.5) * 15;

        sheet.style.setProperty("--duration", `${duration}s`);
        sheet.style.setProperty("--rotStart", `${rotStart}deg`);
        sheet.style.setProperty("--rotEnd", `${rotEnd}deg`);
        sheet.style.animationDelay = `${dropDelay}ms`;

        rainContainer.appendChild(sheet);
        
        // Lưu chỉ số hàng (r) và cột (c)
        letters.push({ el: sheet, row: r, col: c });
        
        dropDelay += 80; 
      }
    }

    const dropCompleteTime = dropDelay + 3000; 

    // Bắt đầu làm mờ từ trên xuống, từ trái sang phải
    setTimeout(() => {
      // Sắp xếp: Ưu tiên hàng trên trước (row nhỏ), cùng hàng thì ưu tiên bên trái trước (col nhỏ)
      letters.sort((a, b) => a.row - b.row || a.col - b.col);
      
      const fadeDelayStep = 100; // Độ trễ giữa các lá thư (100ms) để hiệu ứng lướt mượt mà

      letters.forEach((item, index) => {
        setTimeout(() => {
          // Kích hoạt hiệu ứng mờ dần
          item.el.classList.add("fade-out");
          
          // Dọn dẹp DOM sau khi mờ xong (3000ms)
          setTimeout(() => {
            item.el.remove();
          }, 3000);
          
        }, index * fadeDelayStep); // Tuần tự từng thư từ góc trên-trái sang dưới-phải
      });

      // Khi mờ được một nửa tổng số thư -> bắt đầu chuyển nền sang màu đen
      const halfwayTime = (letters.length / 2) * fadeDelayStep;
      setTimeout(() => {
        document.querySelector("body > div.opening.is-open").classList.add("transparent");
      }, halfwayTime);
      setTimeout(() => {
const textLayer = document.getElementById('text');
        const ids = ["tiny-sky", "lower-stars", "anh-hai-nguoi", "co-hoa", "natureCanvas", "laCanvas", "text"];
        ids.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.classList.add("hien-thi");
          document.querySelector("#vang-overlay").classList.add('loe'); 
          document.querySelector("#vang-overlay").style.opacity = '1';

          const letters = textLayer.querySelectorAll('.decode-char');

          letters.forEach((letter, i) => {
              letter.style.transition =
                  `transform 1.25s cubic-bezier(.2,.8,.15,1),
                   opacity 1.25s ease`;
              letter.style.transitionDelay = `${i * 8}ms`;
          });

          requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                  letters.forEach(letter => {
                      letter.style.transform = 'translate(0, 0) rotate(0deg)';
                      letter.style.opacity = '1';
                  });
              });
          });
        });
      }, letters.length * fadeDelayStep)
    }, dropCompleteTime);

  }
})();
