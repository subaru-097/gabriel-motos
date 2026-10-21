/**
 * Gabriel Motors — Script Principal
 * Controle da Sequência de Vídeos da Hero (Intro + Loop Contínuo),
 * Tela de Carregamento com Progresso Real e Transparência de Marca
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elementos da Hero e Vídeos
  const hero = document.getElementById('hero');
  const introVideo = document.getElementById('hero-video-intro') || document.getElementById('introVideo');
  const loopVideo = document.getElementById('hero-video-loop');
  const heroText = document.getElementById('heroText') || document.getElementById('hero-content');
  const scrollIndicator = document.querySelector('.hero__scroll-indicator');
  const categoriesSection = document.getElementById('categorias');

  // Elementos da Tela de Carregamento (Loading)
  const loader = document.getElementById('hero-loader');
  const loaderPercent = document.getElementById('hero-loader-percent');
  const loaderBar = document.getElementById('hero-loader-bar');
  const heroLogo = document.getElementById('hero-logo');
  const loaderLogo = document.getElementById('loader-logo');

  let isLoaderDismissed = false;
  let isHandoverDone = false;
  let progressInterval = null;
  let fallbackTimer = null;

  /**
   * Garante a transparência pura da logo em tela, removendo o padrão
   * quadriculado de fundo da imagem via canvas em memória, sem alterar o arquivo em disco.
   */
  function applyLogoTransparency(imgEl) {
    if (!imgEl) return;

    const process = () => {
      try {
        const w = imgEl.naturalWidth || 816;
        const h = imgEl.naturalHeight || 816;
        if (w === 0 || h === 0) return;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(imgEl, 0, 0);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Identifica pixels neutros claros do padrão de fundo externo
        const isBg = (x, y) => {
          const idx = (y * w + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          return r > 165 && g > 165 && b > 165 && Math.abs(r - g) < 22 && Math.abs(g - b) < 22;
        };

        const visited = new Uint8Array(w * h);
        const queue = new Int32Array(w * h);
        let head = 0, tail = 0;

        // Inicia flood-fill a partir das bordas externas
        for (let x = 0; x < w; x++) {
          if (isBg(x, 0)) { queue[tail++] = x; visited[x] = 1; }
          const btm = (h - 1) * w + x;
          if (isBg(x, h - 1) && !visited[btm]) { queue[tail++] = btm; visited[btm] = 1; }
        }
        for (let y = 0; y < h; y++) {
          const lft = y * w;
          if (isBg(0, y) && !visited[lft]) { queue[tail++] = lft; visited[lft] = 1; }
          const rgt = y * w + (w - 1);
          if (isBg(w - 1, y) && !visited[rgt]) { queue[tail++] = rgt; visited[rgt] = 1; }
        }

        // Executa BFS flood-fill tornando o fundo externo transparente (Alpha = 0)
        while (head < tail) {
          const pos = queue[head++];
          data[pos * 4 + 3] = 0;

          const px = pos % w;
          const py = (pos / w) | 0;

          if (px > 0) {
            const n = pos - 1;
            if (!visited[n] && isBg(px - 1, py)) { visited[n] = 1; queue[tail++] = n; }
          }
          if (px < w - 1) {
            const n = pos + 1;
            if (!visited[n] && isBg(px + 1, py)) { visited[n] = 1; queue[tail++] = n; }
          }
          if (py > 0) {
            const n = pos - w;
            if (!visited[n] && isBg(px, py - 1)) { visited[n] = 1; queue[tail++] = n; }
          }
          if (py < h - 1) {
            const n = pos + w;
            if (!visited[n] && isBg(px, py + 1)) { visited[n] = 1; queue[tail++] = n; }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        imgEl.src = canvas.toDataURL('image/png');
      } catch (err) {
        console.warn('Gabriel Motors: Logotipo renderizado com fallback padrão.', err);
      }
    };

    if (imgEl.complete && imgEl.naturalWidth > 0) {
      process();
    } else {
      imgEl.addEventListener('load', process, { once: true });
    }
  }

  const heroTitleImg = document.getElementById('hero-title-img');

  applyLogoTransparency(heroLogo);
  applyLogoTransparency(loaderLogo);

  /**
   * Garante a transparência pura do PNG do título ("A PRÓXIMA CURVA PODE SER SUA."),
   * removendo o padrão quadriculado de fundo via canvas em memória sem alterar o arquivo em disco.
   */
  function applyTitleTransparency(imgEl) {
    if (!imgEl) return;

    const process = () => {
      try {
        const w = imgEl.naturalWidth || 1024;
        const h = imgEl.naturalHeight || 438;
        if (w === 0 || h === 0) return;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(imgEl, 0, 0);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const diff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));

          // Padrão de fundo quadriculado (cinzas neutros ~124 ou ~184)
          if (diff <= 9 && r < 192) {
            data[i + 3] = 0;
          } else if (r > 192 && g > 192 && b > 192) {
            // Letras brancas nítidas
            data[i + 3] = 255;
          } else if (r > 140 && g > 120 && b < 100) {
            // Letras amarelas e traço nítidos
            data[i + 3] = 255;
          } else if (diff <= 14 && r < 205) {
            // Transição suave nas bordas de pincel seco
            const factor = (r - 124) / (255 - 124);
            const a = Math.min(255, Math.max(0, Math.round(factor * 255)));
            data[i + 3] = a < 25 ? 0 : a;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        imgEl.src = canvas.toDataURL('image/png');
      } catch (err) {
        console.warn('Gabriel Motors: Título renderizado com fallback padrão.', err);
      }
    };

    if (imgEl.complete && imgEl.naturalWidth > 0) {
      process();
    } else {
      imgEl.addEventListener('load', process, { once: true });
    }
  }

  applyTitleTransparency(heroTitleImg);

  const stylesTitleImg = document.getElementById('styles-title-img');

  /**
   * Garante a transparência pura do PNG do título da Seção 2 ("ESCOLHA O ESTILO DA SUA PRÓXIMA MOTO"),
   * removendo o padrão quadriculado escuro via canvas em memória sem alterar o arquivo em disco.
   */
  function applySection2TitleTransparency(imgEl) {
    if (!imgEl) return;

    const process = () => {
      try {
        const w = imgEl.naturalWidth || 1024;
        const h = imgEl.naturalHeight || 285;
        if (w === 0 || h === 0) return;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(imgEl, 0, 0);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const diff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));

          // Padrão de fundo quadriculado (cinzas neutros ~40 e ~90, diff <= 6 e r <= 98)
          if (diff <= 6 && r <= 98) {
            data[i + 3] = 0;
          } else if (r > 160 && diff <= 15) {
            // Letras brancas nítidas
            data[i + 3] = 255;
          } else if (r > 110 && g > 100 && b < 80) {
            // Letras amarelas e traço nítidos
            data[i + 3] = 255;
          } else if (diff <= 15 && r > 98 && r <= 160) {
            // Transição suave nas bordas de pincel seco
            const factor = (r - 98) / (160 - 98);
            const a = Math.min(255, Math.max(0, Math.round(factor * 255)));
            data[i + 3] = a < 25 ? 0 : a;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        imgEl.src = canvas.toDataURL('image/png');
      } catch (err) {
        console.warn('Gabriel Motors: Título da Seção 2 renderizado com fallback padrão.', err);
      }
    };

    if (imgEl.complete && imgEl.naturalWidth > 0) {
      process();
    } else {
      imgEl.addEventListener('load', process, { once: true });
    }
  }

  applySection2TitleTransparency(stylesTitleImg);

  // =========================================================================
  // 1. TELA DE CARREGAMENTO (LOADING EM TEMPO REAL)
  // =========================================================================

  /**
   * Calcula o percentual de carregamento (buffered) de um vídeo específico.
   */
  function getVideoProgress(videoEl) {
    if (!videoEl) return 100;
    
    // Se o readyState já atingiu canplaythrough
    if (videoEl.readyState >= 4) {
      return 100;
    }

    if (videoEl.duration && videoEl.duration > 0) {
      const b = videoEl.buffered;
      if (b && b.length > 0) {
        const bufferedEnd = b.end(b.length - 1);
        const pct = (bufferedEnd / videoEl.duration) * 100;
        return Math.min(99, Math.max(pct, videoEl.readyState >= 3 ? 60 : (videoEl.readyState >= 2 ? 30 : 10)));
      }
    }

    if (videoEl.readyState >= 3) return 60;
    if (videoEl.readyState >= 2) return 30;
    if (videoEl.readyState >= 1) return 15;
    return 5;
  }

  /**
   * Atualiza a interface da barra e porcentagem do loader
   */
  function updateProgressUI(pct) {
    const clamped = Math.min(100, Math.max(0, Math.round(pct)));
    if (loaderPercent) {
      loaderPercent.textContent = `${clamped}%`;
    }
    if (loaderBar) {
      loaderBar.style.width = `${clamped}%`;
    }
    if (loader) {
      loader.setAttribute('aria-valuenow', clamped.toString());
    }
  }

  /**
   * Remove a tela de carregamento com fade-out de 500ms e inicia o vídeo intro
   */
  function dismissLoaderAndStart() {
    if (isLoaderDismissed) return;
    isLoaderDismissed = true;

    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }

    updateProgressUI(100);

    // Exibe 100% por 300ms antes do fade-out do overlay
    setTimeout(() => {
      if (loader) {
        loader.classList.add('is-hidden');
      }

      // Garante que o vídeo de loop permaneça pausado no início até a intro terminar
      if (loopVideo) {
        try {
          loopVideo.pause();
          loopVideo.currentTime = 0;
        } catch (e) {
          /* no-op */
        }
      }

      // Inicia a reprodução do vídeo da introdução
      if (introVideo) {
        const playPromise = introVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.info('Gabriel Motors: Autoplay restringido pelo navegador.', err);
            // Fallback imediato: se o autoplay for bloqueado, revela o conteúdo da Hero
            triggerHeroText('autoplay restriction fallback');
          });
        }
      }

      // Fallback de segurança para garantir a entrada do texto caso o evento timeupdate não dispare
      setTimeout(() => {
        if (!textShown) {
          triggerHeroText('safety timeout 7.5s fallback');
        }
      }, 7500);
    }, 300);
  }

  /**
   * Verifica se ambos os vídeos estão prontos para exibição sem travar a tela
   */
  function checkVideosReady() {
    if (isLoaderDismissed) return;

    // Com preload="metadata", readyState >= 2 (HAVE_CURRENT_DATA) ou superior é suficiente para reprodução imediata
    const introReady = !introVideo || introVideo.readyState >= 2;
    const loopReady = !loopVideo || loopVideo.readyState >= 1;

    const introPct = getVideoProgress(introVideo);
    const loopPct = getVideoProgress(loopVideo);
    const avgPct = (introPct * 0.5) + (loopPct * 0.5);

    updateProgressUI(avgPct);

    if (introReady && loopReady) {
      dismissLoaderAndStart();
    }
  }

  // Monitora o progresso em tempo real a cada 60ms
  progressInterval = setInterval(checkVideosReady, 60);

  // Listeners de eventos de buffer e prontidão em ambos os vídeos
  [introVideo, loopVideo].forEach((v) => {
    if (!v) return;
    v.addEventListener('progress', checkVideosReady);
    v.addEventListener('loadedmetadata', checkVideosReady);
    v.addEventListener('canplay', checkVideosReady);
    v.addEventListener('canplaythrough', checkVideosReady);
    v.addEventListener('loadeddata', checkVideosReady);
  });

  // Fallback de segurança: se em 12 segundos os vídeos não estiverem prontos, inicia mesmo assim
  fallbackTimer = setTimeout(() => {
    if (!isLoaderDismissed) {
      console.warn('Gabriel Motors: Fallback de 12s ativado para liberação da Hero.');
      dismissLoaderAndStart();
    }
  }, 12000);

  // =========================================================================
  // 2. TIMING E TRANSIÇÃO DA HERO: INTRO -> LOOP (COM ENTRADA DO TEXTO AOS 6,0s)
  // =========================================================================

  // Constante configurável exigida: segundo exato em que o texto deve começar a entrar
  const HERO_TEXT_SHOW_AT = 6.0;

  // Flag de execução única: garante que o texto só dispara uma vez e nunca some
  let textShown = false;
  let loopCycleCount = 0;

  /**
   * Dispara a entrada suave do texto editorial.
   * Executa exatamente uma vez por sessão e nunca remove a classe .show.
   */
  function triggerHeroText(triggerReason) {
    if (textShown) return;
    textShown = true;

    if (heroText) {
      heroText.classList.add('show');
      const curTime = (introVideo && !isNaN(introVideo.currentTime)) ? introVideo.currentTime.toFixed(3) : 'N/A';
      console.log(`[Hero Animation] Texto editorial disparado com sucesso! Razão: ${triggerReason} | introVideo.currentTime: ${curTime}s | HERO_TEXT_SHOW_AT: ${HERO_TEXT_SHOW_AT}s`);
    }
  }

  function handoverToLoop() {
    if (isHandoverDone) return;
    isHandoverDone = true;

    if (loopVideo) {
      // Garante que o loop inicie exatamente do início do arquivo hero.2
      try {
        loopVideo.currentTime = 0;
      } catch (e) {
        /* no-op */
      }

      // Dispara play no vídeo do loop
      const loopPromise = loopVideo.play();
      if (loopPromise !== undefined) {
        loopPromise.catch((err) => {
          console.warn('[Hero Animation] Falha ao iniciar vídeo do loop.', err);
          if (!textShown) {
            triggerHeroText('loop play failure fallback');
          }
        });
      }

      // Crossfade de 300ms via CSS (intro esmaece para 0, loop surge para 1)
      if (introVideo) {
        introVideo.classList.add('is-faded');
      }
      loopVideo.classList.add('is-active');

      const isTextVisible = heroText ? heroText.classList.contains('show') : false;
      console.log(`[Hero Animation] Transição de intro para loop concluída. textShown = ${textShown}, .show presente no DOM = ${isTextVisible}`);
    }
  }

  if (introVideo) {
    // Monitora o tempo exato para disparar aos 6.0s
    introVideo.addEventListener('timeupdate', () => {
      if (!textShown && introVideo.currentTime >= HERO_TEXT_SHOW_AT) {
        triggerHeroText(`introVideo.currentTime >= ${HERO_TEXT_SHOW_AT}s`);
      }
    });

    // Ao disparar o evento "ended" da intro (executa uma única vez)
    introVideo.addEventListener('ended', () => {
      console.log(`[Hero Animation] introVideo 'ended' disparado no segundo ${introVideo.currentTime.toFixed(3)}s.`);
      if (!textShown) {
        triggerHeroText('introVideo ended fallback');
      }
      handoverToLoop();
    });

    // Fallback caso o evento ended falhe por travamento do arquivo de vídeo
    introVideo.addEventListener('error', (err) => {
      console.warn('[Hero Animation] Erro na reprodução da intro, alternando para o loop.', err);
      if (!textShown) {
        triggerHeroText('introVideo error fallback');
      }
      handoverToLoop();
    });
  }

  if (loopVideo) {
    loopVideo.addEventListener('play', () => {
      const isTextVisible = heroText ? heroText.classList.contains('show') : false;
      console.log(`[Hero Animation] loopVideo iniciado (play). textShown = ${textShown}, .show presente = ${isTextVisible}`);
    });

    // Fallback caso ocorra erro no loop
    loopVideo.addEventListener('error', (err) => {
      console.warn('[Hero Animation] Erro na reprodução do loop.', err);
      if (!textShown) {
        triggerHeroText('loopVideo error fallback');
      }
    });

    // Monitora os ciclos de loop para certificar a permanência eterna do texto
    loopVideo.addEventListener('seeked', () => {
      loopCycleCount++;
      const isTextVisible = heroText ? heroText.classList.contains('show') : false;
      console.log(`[Hero Animation] loopVideo reiniciou ciclo #${loopCycleCount}. textShown = ${textShown}, .show mantida permanentemente = ${isTextVisible}`);
    });
  }

  // =========================================================================
  // 3. MENU HAMBÚRGUER (ABERTURA POR HOVER/TOUCH, ANIMAÇÃO E FECHAMENTO)
  // =========================================================================

  const menuToggle = document.getElementById('hero-menu-toggle');
  const menuDrawer = document.getElementById('hero-drawer');
  const drawerBackdrop = document.getElementById('hero-drawer-backdrop');
  const drawerCloseBtn = document.getElementById('hero-drawer-close');
  const drawerLinks = document.querySelectorAll('.hero__drawer-link');

  let isDrawerOpen = false;
  let drawerHoverTimer = null;

  function openDrawer() {
    if (drawerHoverTimer) {
      clearTimeout(drawerHoverTimer);
      drawerHoverTimer = null;
    }
    if (isDrawerOpen) return;
    isDrawerOpen = true;

    if (menuDrawer) {
      menuDrawer.classList.add('is-open');
      menuDrawer.setAttribute('aria-hidden', 'false');
    }
    if (drawerBackdrop) {
      drawerBackdrop.classList.add('is-open');
      drawerBackdrop.setAttribute('aria-hidden', 'false');
    }
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'true');
    }
  }

  function closeDrawer() {
    if (drawerHoverTimer) {
      clearTimeout(drawerHoverTimer);
      drawerHoverTimer = null;
    }
    if (!isDrawerOpen) return;
    isDrawerOpen = false;

    if (menuDrawer) {
      menuDrawer.classList.remove('is-open');
      menuDrawer.setAttribute('aria-hidden', 'true');
    }
    if (drawerBackdrop) {
      drawerBackdrop.classList.remove('is-open');
      drawerBackdrop.setAttribute('aria-hidden', 'true');
    }
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  }

  function scheduleCloseDrawer(delay = 350) {
    if (drawerHoverTimer) clearTimeout(drawerHoverTimer);
    drawerHoverTimer = setTimeout(() => {
      closeDrawer();
    }, delay);
  }

  function cancelCloseDrawer() {
    if (drawerHoverTimer) {
      clearTimeout(drawerHoverTimer);
      drawerHoverTimer = null;
    }
  }

  // Suporte a hover no Desktop (com ponteiro fino)
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  if (menuToggle) {
    // Clique ou toque: alternância manual
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isDrawerOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    // Hover no botão hambúrguer (desktop)
    menuToggle.addEventListener('mouseenter', () => {
      if (isFinePointer.matches) {
        openDrawer();
      }
    });

    menuToggle.addEventListener('mouseleave', () => {
      if (isFinePointer.matches) {
        scheduleCloseDrawer(350);
      }
    });
  }

  if (menuDrawer) {
    // Se o ponteiro entrar no drawer, cancela o timer de fechamento
    menuDrawer.addEventListener('mouseenter', () => {
      if (isFinePointer.matches) {
        cancelCloseDrawer();
      }
    });

    // Se o ponteiro sair do drawer, fecha após debounce
    menuDrawer.addEventListener('mouseleave', () => {
      if (isFinePointer.matches) {
        scheduleCloseDrawer(350);
      }
    });
  }

  // Botão fechar (X)
  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDrawer();
    });
  }

  // Fechar ao clicar fora (backdrop)
  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', () => {
      closeDrawer();
    });
  }

  // Fechar ao clicar em qualquer link do menu
  drawerLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      closeDrawer();

      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({
            behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // Fechar ao pressionar a tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDrawerOpen) {
      closeDrawer();
      if (menuToggle) menuToggle.focus();
    }
  });

  // =========================================================================
  // 4. ROLAGEM E ACESSIBILIDADE
  // =========================================================================

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function scrollToCategories(event) {
    if (event) event.preventDefault();
    if (!categoriesSection) return;

    categoriesSection.scrollIntoView({
      behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
      block: 'start'
    });

    const sectionTitle = document.getElementById('categorias-titulo');
    if (sectionTitle) {
      sectionTitle.setAttribute('tabindex', '-1');
      sectionTitle.focus({ preventScroll: true });
    }
  }

  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', scrollToCategories);
  }

  // =========================================================================
  // 5. PILHA DE CARTAS DE ESTILOS DE MOTO (SEÇÃO 2 — DECK STACK)
  // =========================================================================

  const styleCards = Array.from(document.querySelectorAll('.style-card'));
  const styleProgressBars = Array.from(document.querySelectorAll('.styles-progress__bar'));
  const btnStylePrev = document.getElementById('styles-prev');
  const btnStyleNext = document.getElementById('styles-next');
  const deckContainer = document.getElementById('styles-deck-container');

  // Mapeamento das cartas da Sessão 2 para categorias da grade de estoque
  const STYLE_INDEX_TO_CATEGORY = [
    'Urbana',           // Carta 0: Urbana / Naked
    'Alta Performance', // Carta 1: Alta Performance / Esportiva
    'Aventura',         // Carta 2: Aventura / Big Trail
    'Dia a dia',        // Carta 3: Dia a dia / Touring
    'Todas'             // Carta 4: Todas as Categorias
  ];

  let currentStyleIndex = 1; // "Alta Performance / Esportiva" como destaque inicial (conforme referência)
  let animationCleanupRaf = null;

  function updateDeckPositions() {
    const total = styleCards.length;
    const isReduced = prefersReducedMotion.matches;

    styleCards.forEach((card, idx) => {
      // Posição simétrica na pilha horizontal: -2 (esquerda atrás), -1 (esquerda), 0 (centro ativo), 1 (direita), 2 (direita atrás)
      let pos = (idx - currentStyleIndex) % total;
      if (pos > total / 2) pos -= total;
      if (pos < -total / 2) pos += total;

      const oldPos = parseInt(card.dataset.pos, 10);
      const isWrapping = !isNaN(oldPos) && ((oldPos === -2 && pos === 2) || (oldPos === 2 && pos === -2) || Math.abs(pos - oldPos) > 2);

      if (isWrapping && !isReduced) {
        // Carta dando a volta pelos fundos: reposiciona sem transição visível através do centro
        card.style.transition = 'none';
        card.style.opacity = '0';
        card.dataset.pos = pos;
        card.dataset.stack = pos;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            card.style.transition = '';
            card.style.opacity = '';
          });
        });
      } else {
        card.style.transition = '';
        card.dataset.pos = pos;
        card.dataset.stack = pos;
      }

      if (pos === 0) {
        card.classList.add('is-active');
        card.setAttribute('aria-selected', 'true');
        card.setAttribute('tabindex', '0');
      } else {
        card.classList.remove('is-active');
        card.setAttribute('aria-selected', 'false');
        card.setAttribute('tabindex', '0');
      }

      // Remove qualquer badge residual para manter a imagem limpa e original
      const badge = card.querySelector('.style-card__badge-top');
      if (badge) badge.remove();
    });

    styleProgressBars.forEach((bar, idx) => {
      bar.classList.toggle('is-active', idx === currentStyleIndex);
    });
  }

  // Inicializa posições da pilha
  updateDeckPositions();

  function setActiveStyle(index, explicitDirection = 0) {
    if (!styleCards.length) return;
    const total = styleCards.length;
    const targetIndex = ((index % total) + total) % total;

    // Se já é a carta da frente e sem direção explícita, não dispara
    if (targetIndex === currentStyleIndex && explicitDirection === 0) return;

    currentStyleIndex = targetIndex;

    // Sincroniza dinamicamente a grade de estoque abaixo com a carta ativa (fade de 200-300ms)
    syncGridWithActiveStyle(targetIndex);

    // Atualiza imediatamente a pilha de cartas via requestAnimationFrame, permitindo encadeamento contínuo
    if (animationCleanupRaf) {
      cancelAnimationFrame(animationCleanupRaf);
    }
    animationCleanupRaf = requestAnimationFrame(() => {
      updateDeckPositions();
    });
  }

  if (btnStylePrev) {
    btnStylePrev.addEventListener('click', () => {
      setActiveStyle(currentStyleIndex - 1, -1);
    });
  }

  if (btnStyleNext) {
    btnStyleNext.addEventListener('click', () => {
      setActiveStyle(currentStyleIndex + 1, 1);
    });
  }

  styleProgressBars.forEach((bar) => {
    bar.addEventListener('click', () => {
      const idx = parseInt(bar.dataset.index, 10);
      if (!isNaN(idx)) {
        setActiveStyle(idx);
      }
    });
  });

  styleCards.forEach((card) => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.index, 10);
      if (!isNaN(idx)) {
        const pos = parseInt(card.dataset.pos, 10);
        // Na carta "Todas as Categorias" (índice 4), apenas gira o baralho e não abre modal
        if (idx === 4) {
          if (pos !== 0) {
            const dir = pos > 0 ? 1 : -1;
            setActiveStyle(idx, dir);
          }
          return;
        }

        // Mapeamento dos cards para a moto correspondente:
        // Card 0: Urbana -> id 1 (Honda CB1000R Branca)
        // Card 1: Alta Performance -> id 5 (Kawasaki Ninja ZX-6R)
        // Card 2: Aventura -> id 4 (BMW F 800 GS)
        // Card 3: Dia a dia -> id 6 (Bajaj Dominar 400)
        const MOTO_MAP = {
          0: 1,
          1: 5,
          2: 4,
          3: 6
        };

        if (pos === 0) {
          // Carta da frente ativa: abre o modal imediatamente
          openMotoModal(MOTO_MAP[idx] || 1);
        } else {
          // Carta lateral: sincroniza o deck e abre o modal da respectiva moto
          const dir = pos > 0 ? 1 : -1;
          setActiveStyle(idx, dir);
          openMotoModal(MOTO_MAP[idx] || 1);
        }
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const idx = parseInt(card.dataset.index, 10);
        if (!isNaN(idx) && idx !== 4) {
          const MOTO_MAP = { 0: 1, 1: 5, 2: 4, 3: 6 };
          openMotoModal(MOTO_MAP[idx] || 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveStyle(currentStyleIndex - 1, -1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveStyle(currentStyleIndex + 1, 1);
      }
    });
  });

  // Suporte a swipe por toque no mobile com acompanhamento do dedo em tempo real
  if (deckContainer) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchDeltaX = 0;
    let isSwiping = false;
    let isHorizontalSwipe = false;

    deckContainer.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchDeltaX = 0;
        isSwiping = true;
        isHorizontalSwipe = false;

        const activeCard = document.querySelector('.style-card[data-pos="0"]');
        if (activeCard) {
          activeCard.style.transition = 'none';
          activeCard.style.willChange = 'transform';
        }
      }
    }, { passive: true });

    deckContainer.addEventListener('touchmove', (e) => {
      if (!isSwiping || e.touches.length !== 1) return;
      const curX = e.touches[0].clientX;
      const curY = e.touches[0].clientY;
      const diffX = curX - touchStartX;
      const diffY = curY - touchStartY;

      if (!isHorizontalSwipe) {
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
          isHorizontalSwipe = true;
        } else if (Math.abs(diffY) > 8) {
          isSwiping = false;
          const activeCard = document.querySelector('.style-card[data-pos="0"]');
          if (activeCard) {
            activeCard.style.transition = '';
            activeCard.style.transform = '';
            activeCard.style.willChange = 'auto';
          }
          return;
        }
      }

      if (isHorizontalSwipe) {
        touchDeltaX = diffX;
        const activeCard = document.querySelector('.style-card[data-pos="0"]');
        if (activeCard) {
          // A carta acompanha o dedo em tempo real perfeitamente reta (sem rotação)
          activeCard.style.transform = `translate3d(${touchDeltaX}px, 0, 0) scale(1.02)`;
        }
      }
    }, { passive: true });

    deckContainer.addEventListener('touchend', () => {
      if (!isSwiping || !isHorizontalSwipe) {
        isSwiping = false;
        return;
      }
      isSwiping = false;

      const activeCard = document.querySelector('.style-card[data-pos="0"]');
      if (activeCard) {
        activeCard.style.transition = 'transform 480ms cubic-bezier(0.22, 1, 0.36, 1), opacity 480ms cubic-bezier(0.22, 1, 0.36, 1)';
      }

      const threshold = 45;
      if (touchDeltaX < -threshold) {
        setActiveStyle(currentStyleIndex + 1, 1);
      } else if (touchDeltaX > threshold) {
        setActiveStyle(currentStyleIndex - 1, -1);
      } else {
        // Retorna suavemente para a posição frontal da pilha
        if (activeCard) {
          activeCard.style.transform = 'translate3d(0, 0, 0) scale(1.02)';
          setTimeout(() => {
            activeCard.style.transition = '';
            activeCard.style.willChange = 'auto';
          }, 480);
        }
      }
    }, { passive: true });
  }

  // =========================================================================
  // 6. ÁREA DE MODAIS DE MOTOCICLETAS E POP-UP DE FAVORITAR (SESSÃO 2)
  // =========================================================================

  const WHATSAPP_NUMBER = '5519999999999';

  // Base de dados fictícia no front-end (conforme especificação exata)
  const MOTOS_DATA = [
    {
      id: 1,
      categoria: "Urbana",
      marca: "HONDA",
      modelo: "Honda CB1000R",
      cor: "Branca",
      imagem: "moto-cb1000r-branca.webp",
      ano: 2023,
      km: "4.200",
      cidade: "Sumaré (SP)",
      preco: "R$ 62.900"
    },
    {
      id: 2,
      categoria: "Urbana",
      marca: "HONDA",
      modelo: "Honda CB1000R",
      cor: "Vermelha",
      imagem: "moto-cb1000r-vermelha.webp",
      ano: 2022,
      km: "8.900",
      cidade: "Americana (SP)",
      preco: "R$ 58.500"
    },
    {
      id: 3,
      categoria: "Urbana",
      marca: "HONDA",
      modelo: "Honda CB1000R",
      cor: "Azul",
      imagem: "moto-cb1000r-azul.webp",
      ano: 2024,
      km: "1.100",
      cidade: "Campinas (SP)",
      preco: "R$ 66.300"
    },
    {
      id: 4,
      categoria: "Aventura",
      marca: "BMW",
      modelo: "BMW F 800 GS",
      cor: "Azul e prata",
      imagem: "big-trail.webp",
      ano: 2021,
      km: "22.500",
      cidade: "Indaiatuba (SP)",
      preco: "R$ 49.900"
    },
    {
      id: 5,
      categoria: "Alta Performance",
      marca: "KAWASAKI",
      modelo: "Kawasaki Ninja ZX-6R",
      cor: "Preta",
      imagem: "alta-performance.webp",
      ano: 2023,
      km: "3.000",
      cidade: "Porto Feliz (SP)",
      preco: "R$ 79.900"
    },
    {
      id: 6,
      categoria: "Dia a dia",
      marca: "BAJAJ",
      modelo: "Bajaj Dominar 400",
      cor: "Padrão",
      imagem: "dia-dia-versatil.webp",
      ano: 2022,
      km: "12.000",
      cidade: "Sumaré (SP)",
      preco: "R$ 28.900"
    }
  ];

  // Elementos do Modal
  const modalBackdrop = document.getElementById('moto-modal-backdrop');
  const modalCloseBtn = document.getElementById('moto-modal-close');
  const modalNavPrev = document.getElementById('modal-nav-prev');
  const modalNavNext = document.getElementById('modal-nav-next');
  const modalCategoria = document.getElementById('modal-categoria');
  const modalImg = document.getElementById('modal-img');
  const modalMarca = document.getElementById('modal-marca');
  const modalModeloTitle = document.getElementById('modal-modelo-title');
  const modalCor = document.getElementById('modal-cor');
  const modalColorPills = document.getElementById('modal-color-pills');
  const modalAno = document.getElementById('modal-ano');
  const modalKm = document.getElementById('modal-km');
  const modalCidade = document.getElementById('modal-cidade');
  const modalPreco = document.getElementById('modal-preco');
  const modalBtnFavorite = document.getElementById('modal-btn-favorite');
  const modalFavoriteText = document.getElementById('modal-favorite-text');
  const modalBtnWhatsapp = document.getElementById('modal-btn-whatsapp');

  // Elementos do Pop-up de Favoritar
  const favoritePopup = document.getElementById('favorite-popup');
  const favPopupClose = document.getElementById('fav-popup-close');
  const favoriteForm = document.getElementById('favorite-form');
  const favPhoneInput = document.getElementById('fav-phone');
  const favEmailInput = document.getElementById('fav-email');
  const favErrorMsg = document.getElementById('fav-error-msg');
  const favSuccessMsg = document.getElementById('fav-success-msg');

  let currentMotoIndex = 0; // Índice no array MOTOS_DATA
  let modalOpenedOnlyForFavorite = false;

  // Gerenciamento no localStorage (contato e lista de favoritos)
  function getStoredUser() {
    try {
      const data = localStorage.getItem('gabriel_motos_user');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function saveStoredUser(userData) {
    try {
      localStorage.setItem('gabriel_motos_user', JSON.stringify(userData));
    } catch (e) {
      console.warn('Gabriel Motos: erro ao salvar no localStorage', e);
    }
  }

  function getFavorites() {
    try {
      const favs = localStorage.getItem('gabriel_motos_favorites');
      return favs ? JSON.parse(favs) : [];
    } catch (e) {
      return [];
    }
  }

  function isMotoFavorited(id) {
    const favs = getFavorites();
    return favs.includes(id);
  }

  function updateFavoriteButtonUI(id) {
    if (!modalBtnFavorite) return;
    const favorited = isMotoFavorited(id);
    modalBtnFavorite.classList.toggle('is-favorited', favorited);
    modalBtnFavorite.setAttribute('aria-label', favorited ? 'Favoritado' : 'Favoritar motocicleta');
    if (modalFavoriteText) {
      modalFavoriteText.textContent = favorited ? 'Favoritado' : 'Favoritar';
    }
  }

  // Máscara dinâmica de Celular: (00) 00000-0000
  function formatPhone(val) {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) {
      return digits ? `(${digits}` : '';
    }
    if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }

  if (favPhoneInput) {
    favPhoneInput.addEventListener('input', (e) => {
      e.target.value = formatPhone(e.target.value);
    });
  }

  // Renderização e Atualização dos Dados da Moto no Modal
  function renderMotoData(moto) {
    if (!moto) return;
    currentMotoIndex = MOTOS_DATA.findIndex(m => m.id === moto.id);
    if (currentMotoIndex === -1) currentMotoIndex = 0;

    // Transição suave de foto (transform e opacity)
    if (modalImg) {
      modalImg.style.opacity = '0';
      modalImg.style.transform = 'scale(0.97)';
      setTimeout(() => {
        modalImg.src = moto.imagem;
        modalImg.alt = `${moto.modelo} ${moto.cor}`;
        modalImg.style.opacity = '1';
        modalImg.style.transform = 'scale(1)';
      }, 150);
    }

    if (modalCategoria) modalCategoria.textContent = moto.categoria.toUpperCase();
    if (modalMarca) modalMarca.textContent = moto.marca;
    if (modalModeloTitle) modalModeloTitle.textContent = moto.modelo;
    if (modalCor) modalCor.textContent = moto.cor;
    if (modalAno) modalAno.textContent = moto.ano;
    if (modalKm) modalKm.textContent = `${moto.km} Km`;
    if (modalCidade) modalCidade.textContent = moto.cidade;
    if (modalPreco) modalPreco.textContent = moto.preco;

    // Seletor de cores da CB1000R (ids 1, 2, 3)
    if (modalColorPills) {
      modalColorPills.innerHTML = '';
      if (moto.categoria === "Urbana") {
        const variants = MOTOS_DATA.filter(m => m.categoria === "Urbana");
        variants.forEach(variant => {
          const pill = document.createElement('button');
          pill.type = 'button';
          pill.className = `moto-modal__color-pill ${variant.id === moto.id ? 'is-active' : ''}`;
          pill.textContent = variant.cor;
          pill.addEventListener('click', (e) => {
            e.stopPropagation();
            renderMotoData(variant);
          });
          modalColorPills.appendChild(pill);
        });
      }
    }

    // Atualiza estado visual do botão Favoritar
    updateFavoriteButtonUI(moto.id);
  }

  // Botão WhatsApp no Modal de Moto abre o fluxo de seleção de vendedor
  if (modalBtnWhatsapp) {
    modalBtnWhatsapp.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const currentMoto = MOTOS_DATA[currentMotoIndex];
      openSellerModal(currentMoto);
    });
  }

  // Clique na foto da moto para foco e detalhes
  const modalMediaTrigger = document.getElementById('modal-media-trigger');
  if (modalMediaTrigger) {
    modalMediaTrigger.addEventListener('click', () => {
      if (modalImg) {
        modalImg.style.transform = 'scale(1.03)';
        setTimeout(() => {
          if (modalImg) modalImg.style.transform = 'scale(1)';
        }, 250);
      }
    });
  }

  function openMotoModal(motoId) {
    modalOpenedOnlyForFavorite = false;
    const moto = MOTOS_DATA.find(m => m.id === motoId) || MOTOS_DATA[0];
    renderMotoData(moto);

    if (modalBackdrop) {
      modalBackdrop.classList.remove('is-hidden');
      document.body.style.overflow = 'hidden'; // impede rolagem de fundo
    }
  }

  function closeMotoModal() {
    if (favoritePopup) favoritePopup.classList.add('is-hidden');
    if (modalBackdrop) {
      modalBackdrop.classList.add('is-hidden');
      document.body.style.overflow = '';
    }
  }

  // Listeners de fechamento do Modal (botão X, clique fora no backdrop e Escape)
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMotoModal();
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeMotoModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop && !modalBackdrop.classList.contains('is-hidden')) {
      if (favoritePopup && !favoritePopup.classList.contains('is-hidden')) {
        favoritePopup.classList.add('is-hidden');
      } else {
        closeMotoModal();
      }
    }
  });

  // Abertura do Pop-up de Favoritar
  if (modalBtnFavorite) {
    modalBtnFavorite.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentMoto = MOTOS_DATA[currentMotoIndex];
      if (!currentMoto) return;

      const user = getStoredUser();

      // Se já temos os dados salvos no localStorage, preenche automaticamente os campos
      if (favPhoneInput && user && user.phone) {
        favPhoneInput.value = user.phone;
      }
      if (favEmailInput && user && user.email) {
        favEmailInput.value = user.email;
      }

      if (favErrorMsg) favErrorMsg.classList.add('is-hidden');
      if (favSuccessMsg) favSuccessMsg.classList.add('is-hidden');
      if (favoriteForm) favoriteForm.style.display = 'flex';

      // Abre o pop-up sobreposto
      if (favoritePopup) {
        favoritePopup.classList.remove('is-hidden');
        if (favPhoneInput && !favPhoneInput.value) {
          favPhoneInput.focus();
        }
      }
    });
  }

  if (favPopupClose) {
    favPopupClose.addEventListener('click', (e) => {
      e.stopPropagation();
      if (favoritePopup) favoritePopup.classList.add('is-hidden');
      if (modalOpenedOnlyForFavorite) {
        closeMotoModal();
        modalOpenedOnlyForFavorite = false;
      }
    });
  }

  // Submissão do formulário de favoritos com validação e persistência no localStorage
  if (favoriteForm) {
    favoriteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = (favPhoneInput ? favPhoneInput.value : '').trim();
      const email = (favEmailInput ? favEmailInput.value : '').trim();

      // Validação de telefone (mínimo 10 dígitos)
      const cleanDigits = phone.replace(/\D/g, '');
      if (cleanDigits.length < 10) {
        if (favErrorMsg) {
          favErrorMsg.textContent = 'Por favor, insira um número de telefone celular válido.';
          favErrorMsg.classList.remove('is-hidden');
        }
        return;
      }

      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (favErrorMsg) {
          favErrorMsg.textContent = 'Por favor, insira um endereço de e-mail válido.';
          favErrorMsg.classList.remove('is-hidden');
        }
        return;
      }

      if (favErrorMsg) favErrorMsg.classList.add('is-hidden');

      // Salva no localStorage do navegador (sem backend/API)
      saveStoredUser({ phone, email });

      // Marca a moto atual como favorita no localStorage
      const currentMoto = MOTOS_DATA[currentMotoIndex];
      if (currentMoto) {
        let favs = getFavorites();
        if (!favs.includes(currentMoto.id)) {
          favs.push(currentMoto.id);
          try {
            localStorage.setItem('gabriel_motos_favorites', JSON.stringify(favs));
          } catch (err) {}
        }
        updateFavoriteButtonUI(currentMoto.id);
      }

      // Mensagem curta de confirmação
      favoriteForm.style.display = 'none';
      if (favSuccessMsg) favSuccessMsg.classList.remove('is-hidden');

      // Fecha o pop-up após breve confirmação
      setTimeout(() => {
        if (favoritePopup) favoritePopup.classList.add('is-hidden');
        if (favoriteForm) favoriteForm.style.display = 'flex';
        if (favSuccessMsg) favSuccessMsg.classList.add('is-hidden');
        if (modalOpenedOnlyForFavorite) {
          closeMotoModal();
          modalOpenedOnlyForFavorite = false;
        }
      }, 1200);
    });
  }

  // =========================================================================
  // 7. SEÇÃO 3 — GRADE DE MOTOS (SINCRONIZADA COM A SESSÃO 2)
  // =========================================================================
  const motosGrid = document.getElementById('motos-grid');

  let currentCategoryFilter = STYLE_INDEX_TO_CATEGORY[currentStyleIndex] || 'Alta Performance';

  /**
   * Sincroniza a grade com a carta ativa da Sessão 2, com transição de fade suave (220ms)
   */
  function syncGridWithActiveStyle(styleIndex) {
    const category = STYLE_INDEX_TO_CATEGORY[styleIndex] || 'Todas';
    if (category === currentCategoryFilter) return;

    currentCategoryFilter = category;

    const isReduced = prefersReducedMotion.matches;
    if (isReduced || !motosGrid) {
      renderMotosGrid();
      return;
    }

    motosGrid.classList.add('is-fading');
    setTimeout(() => {
      renderMotosGrid();
      motosGrid.classList.remove('is-fading');
    }, 220);
  }

  function getFilteredMotos(category) {
    if (category === 'Todas') {
      return MOTOS_DATA.slice(0, 6);
    }
    return MOTOS_DATA.filter(m => m.categoria === category).slice(0, 6);
  }

  function updateGridFavoritesUI() {
    if (!motosGrid) return;
    const favButtons = motosGrid.querySelectorAll('.moto-grid-card__btn-favorite');
    favButtons.forEach(btn => {
      const id = parseInt(btn.dataset.favId, 10);
      const isFav = isMotoFavorited(id);
      btn.classList.toggle('is-favorited', isFav);
      const svg = btn.querySelector('.moto-grid-card__heart-svg');
      if (svg) {
        svg.setAttribute('fill', isFav ? '#F43F5E' : 'none');
      }
    });
  }

  function renderMotosGrid() {
    if (!motosGrid) return;

    const motos = getFilteredMotos(currentCategoryFilter);
    motosGrid.innerHTML = '';

    motos.forEach(moto => {
      const isFav = isMotoFavorited(moto.id);
      const msg = `Olá! Tenho interesse na ${moto.modelo} ${moto.cor} (${moto.ano}) anunciada no site Gabriel Motos.`;
      const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

      const card = document.createElement('article');
      card.className = 'moto-grid-card';
      card.dataset.motoId = moto.id;
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `${moto.modelo} ${moto.cor} - ${moto.preco}`);

      card.innerHTML = `
        <!-- Topo: Imagem 4:5 com Badges Flutuantes -->
        <div class="moto-grid-card__media">
          <img src="${moto.imagem}" alt="${moto.modelo} ${moto.cor}" class="moto-grid-card__img" loading="lazy">
          
          <!-- Badge de Categoria -->
          <span class="moto-grid-card__badge-cat">${moto.categoria.toUpperCase()}</span>

          <!-- Botão Favoritar Rosa -->
          <button type="button" class="moto-grid-card__btn-favorite ${isFav ? 'is-favorited' : ''}" data-fav-id="${moto.id}" aria-label="Favoritar ${moto.modelo}">
            <svg class="moto-grid-card__heart-svg" width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? '#F43F5E' : 'none'}" stroke="#F43F5E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>

        <!-- Corpo do Card -->
        <div class="moto-grid-card__body">
          <div class="moto-grid-card__header-row">
            <span class="moto-grid-card__brand">${moto.marca}</span>
            <span class="moto-grid-card__year">${moto.ano}</span>
          </div>

          <h3 class="moto-grid-card__model">${moto.modelo} ${moto.cor !== 'Padrão' ? moto.cor : ''}</h3>

          <!-- Caixa de Informações em Grade 2x2 com Borda Cinza -->
          <div class="moto-grid-card__specs-box">
            <!-- Item 1: Km (Velocímetro) -->
            <div class="moto-grid-card__spec-item">
              <svg class="moto-grid-card__spec-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9"></circle>
                <polyline points="12 7 12 12 15 15"></polyline>
              </svg>
              <span class="moto-grid-card__spec-text">${moto.km} km</span>
            </div>

            <!-- Item 2: Cidade (Localização) -->
            <div class="moto-grid-card__spec-item">
              <svg class="moto-grid-card__spec-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span class="moto-grid-card__spec-text">${moto.cidade}</span>
            </div>

            <!-- Item 3: Cor -->
            <div class="moto-grid-card__spec-item">
              <svg class="moto-grid-card__spec-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
              </svg>
              <span class="moto-grid-card__spec-text">${moto.cor}</span>
            </div>

            <!-- Item 4: Categoria -->
            <div class="moto-grid-card__spec-item">
              <svg class="moto-grid-card__spec-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
              <span class="moto-grid-card__spec-text">${moto.categoria}</span>
            </div>
          </div>

          <!-- Rodapé do Card: Preço em Monospace + Botão WhatsApp Verde -->
          <div class="moto-grid-card__footer">
            <span class="moto-grid-card__price">${moto.preco}</span>
            <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="moto-grid-card__btn-whatsapp" data-wa-id="${moto.id}" aria-label="Chamar no WhatsApp sobre ${moto.modelo}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.477-.15-.678.15s-.778.98-.954 1.18c-.176.2-.351.226-.653.075s-1.272-.469-2.424-1.496c-.896-.799-1.501-1.787-1.677-2.088s-.019-.464.132-.614c.135-.135.301-.351.452-.527s.201-.301.301-.502.05-.376-.025-.527c-.075-.15-.678-1.631-.929-2.234-.245-.588-.494-.508-.678-.517l-.578-.01c-.2 0-.527.075-.803.376s-1.054 1.03-1.054 2.511 1.079 2.912 1.23 3.113c.15.201 2.124 3.243 5.145 4.549.719.311 1.28.497 1.718.636.723.23 1.381.197 1.902.12.58-.086 1.782-.728 2.033-1.431s.251-1.305.176-1.431c-.075-.126-.276-.201-.577-.351zM12.042 21.928c-1.776 0-3.518-.466-5.053-1.348l-.362-.208-3.754.985 1.002-3.66-.228-.363c-.968-1.541-1.479-3.328-1.479-5.161 0-5.405 4.398-9.803 9.806-9.803 2.618 0 5.08 1.02 6.929 2.871s2.868 4.314 2.868 6.932c-.001 5.407-4.4 9.805-9.729 9.805zM12.042 0C5.402 0 0 5.402 0 12.042c0 2.119.553 4.185 1.603 6.007L0 24l6.104-1.599c1.764.962 3.766 1.468 5.938 1.468 6.64 0 12.042-5.402 12.042-12.042 0-3.217-1.253-6.241-3.528-8.516s-5.299-3.529-8.514-3.529z"/>
              </svg>
            </a>
          </div>
        </div>
      `;

      // Clicar em qualquer parte do card (exceto coração e WhatsApp) abre o modal da moto
      card.addEventListener('click', (e) => {
        if (e.target.closest('.moto-grid-card__btn-favorite') || e.target.closest('.moto-grid-card__btn-whatsapp')) {
          return;
        }
        openMotoModal(moto.id);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.closest('.moto-grid-card__btn-favorite') || e.target.closest('.moto-grid-card__btn-whatsapp')) {
            return;
          }
          e.preventDefault();
          openMotoModal(moto.id);
        }
      });

      // Botão Favoritar no Card abre o pop-up de favoritar
      const favBtn = card.querySelector('.moto-grid-card__btn-favorite');
      if (favBtn) {
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          currentMotoIndex = MOTOS_DATA.findIndex(m => m.id === moto.id);
          const currentMoto = MOTOS_DATA[currentMotoIndex] || moto;
          renderMotoData(currentMoto);
          modalOpenedOnlyForFavorite = true;
          const user = getStoredUser();

          if (favPhoneInput && user && user.phone) {
            favPhoneInput.value = user.phone;
          }
          if (favEmailInput && user && user.email) {
            favEmailInput.value = user.email;
          }

          if (favErrorMsg) favErrorMsg.classList.add('is-hidden');
          if (favSuccessMsg) favSuccessMsg.classList.add('is-hidden');
          if (favoriteForm) favoriteForm.style.display = 'flex';

          if (modalBackdrop) {
            modalBackdrop.classList.remove('is-hidden');
            document.body.style.overflow = 'hidden';
          }
          if (favoritePopup) {
            favoritePopup.classList.remove('is-hidden');
            if (favPhoneInput && !favPhoneInput.value) {
              favPhoneInput.focus();
            }
          }
        });
      }

      // Botão WhatsApp no Card abre o fluxo de seleção de vendedor
      const waBtn = card.querySelector('.moto-grid-card__btn-whatsapp');
      if (waBtn) {
        waBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openSellerModal(moto);
        });
      }

      motosGrid.appendChild(card);
    });
  }

  // Atualiza estado de favoritos nos cards da grade ao salvar no popup
  const origSaveSubmit = favoriteForm ? favoriteForm.onsubmit : null;
  favoriteForm?.addEventListener('submit', () => {
    setTimeout(() => {
      updateGridFavoritesUI();
    }, 50);
  });

  // =========================================================================
  // 8. FLUXO DE SELEÇÃO DE VENDEDOR E REDIRECIONAMENTO AO WHATSAPP (ETAPA 2)
  // =========================================================================

  // Variáveis separadas de links e fotos dos vendedores para facilitar alterações futuras
  const WHATSAPP_LINK_GUSTAVO = 'https://wa.me/5519997065506';
  const CAMINHO_FOTO_GUSTAVO  = 'vendedor-gustavo.jpeg';

  const WHATSAPP_LINK_LEANDRO = 'https://wa.me/5519996830965';
  const CAMINHO_FOTO_LEANDRO  = 'vendedor-leandro.jpg';

  const WHATSAPP_LINK_JOAO    = 'https://wa.me/5519998076644';
  const CAMINHO_FOTO_JOAO     = 'vendedor-joão.jpg';

  // Base estática de dados dos vendedores (ordem estrita: Gustavo, Leandro, João)
  const VENDEDORES_DATA = [
    {
      id: 'gustavo',
      nome: 'Gustavo',
      cargo: 'Vendas • Especialista em esportivas',
      link: WHATSAPP_LINK_GUSTAVO,
      foto: CAMINHO_FOTO_GUSTAVO,
      destaque: true
    },
    {
      id: 'leandro',
      nome: 'Leandro',
      cargo: 'Vendas',
      link: WHATSAPP_LINK_LEANDRO,
      foto: CAMINHO_FOTO_LEANDRO,
      destaque: false
    },
    {
      id: 'joao',
      nome: 'João',
      cargo: 'Vendas',
      link: WHATSAPP_LINK_JOAO,
      foto: CAMINHO_FOTO_JOAO,
      destaque: false
    }
  ];

  let activeMotoForSeller = null;

  const sellerModalBackdrop = document.getElementById('seller-modal-backdrop');
  const sellerModalClose = document.getElementById('seller-modal-close');
  const sellerList = document.getElementById('seller-list');
  const redirectModalBackdrop = document.getElementById('redirect-modal-backdrop');
  const redirectModalClose = document.getElementById('redirect-modal-close');
  const redirectSellerName = document.getElementById('redirect-seller-name');

  /**
   * Renderiza a lista de vendedores no painel de película fumê
   */
  function renderSellerList() {
    if (!sellerList) return;
    sellerList.innerHTML = '';

    VENDEDORES_DATA.forEach((vendedor) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = `seller-item${vendedor.destaque ? ' seller-item--highlight' : ''}`;
      item.setAttribute('role', 'listitem');
      item.setAttribute('aria-label', `Conversar com ${vendedor.nome} pelo WhatsApp`);
      item.innerHTML = `
        <div class="seller-item__left">
          <img src="${encodeURI(vendedor.foto)}" alt="Foto de ${vendedor.nome}" class="seller-item__avatar" loading="lazy">
          <div class="seller-item__info">
            <strong class="seller-item__name">${vendedor.nome}</strong>
            <span class="seller-item__role">${vendedor.cargo}</span>
          </div>
        </div>
        <div class="seller-item__right">
          <span class="seller-item__wa-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.477-.15-.678.15s-.778.98-.954 1.18c-.176.2-.351.226-.653.075s-1.272-.469-2.424-1.496c-.896-.799-1.501-1.787-1.677-2.088s-.019-.464.132-.614c.135-.135.301-.351.452-.527s.201-.301.301-.502.05-.376-.025-.527c-.075-.15-.678-1.631-.929-2.234-.245-.588-.494-.508-.678-.517l-.578-.01c-.2 0-.527.075-.803.376s-1.054 1.03-1.054 2.511 1.079 2.912 1.23 3.113c.15.201 2.124 3.243 5.145 4.549.719.311 1.28.497 1.718.636.723.23 1.381.197 1.902.12.58-.086 1.782-.728 2.033-1.431s.251-1.305.176-1.431c-.075-.126-.276-.201-.577-.351zM12.042 21.928c-1.776 0-3.518-.466-5.053-1.348l-.362-.208-3.754.985 1.002-3.66-.228-.363c-.968-1.541-1.479-3.328-1.479-5.161 0-5.405 4.398-9.803 9.806-9.803 2.618 0 5.08 1.02 6.929 2.871s2.868 4.314 2.868 6.932c-.001 5.407-4.4 9.805-9.729 9.805zM12.042 0C5.402 0 0 5.402 0 12.042c0 2.119.553 4.185 1.603 6.007L0 24l6.104-1.599c1.764.962 3.766 1.468 5.938 1.468 6.64 0 12.042-5.402 12.042-12.042 0-3.217-1.253-6.241-3.528-8.516s-5.299-3.529-8.514-3.529z"/>
            </svg>
          </span>
          <span class="seller-item__arrow" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </span>
        </div>
      `;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        chooseSeller(vendedor);
      });

      sellerList.appendChild(item);
    });
  }

  /**
   * Abre o Modal "Escolha o Vendedor" (Modal 1)
   */
  function openSellerModal(motoContext = null) {
    if (motoContext) {
      activeMotoForSeller = motoContext;
    }
    if (redirectModalBackdrop) {
      redirectModalBackdrop.classList.add('is-hidden');
    }
    if (sellerModalBackdrop) {
      sellerModalBackdrop.classList.remove('is-hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Fecha o Modal de Seleção de Vendedor (Modal 1)
   */
  function closeSellerModal() {
    if (sellerModalBackdrop) {
      sellerModalBackdrop.classList.add('is-hidden');
    }
    const motoModal = document.getElementById('moto-modal-backdrop');
    if (!motoModal || motoModal.classList.contains('is-hidden')) {
      document.body.style.overflow = '';
    }
  }

  /**
   * Fecha o Modal de Redirecionamento (Modal 2)
   */
  function closeRedirectModal() {
    if (redirectModalBackdrop) {
      redirectModalBackdrop.classList.add('is-hidden');
    }
    const motoModal = document.getElementById('moto-modal-backdrop');
    if (!motoModal || motoModal.classList.contains('is-hidden')) {
      document.body.style.overflow = '';
    }
  }

  /**
   * Etapa 2: Ao clicar em um vendedor, fecha o modal 1 e abre o modal 2 com o nome dele.
   * Não implementa spinner nem CANCELAR nesta etapa.
   */
  function chooseSeller(vendedor) {
    closeSellerModal();

    if (redirectSellerName) {
      redirectSellerName.textContent = vendedor.nome;
    }

    if (redirectModalBackdrop) {
      redirectModalBackdrop.classList.remove('is-hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  // Event listeners para fechamento via botão X
  sellerModalClose?.addEventListener('click', closeSellerModal);
  redirectModalClose?.addEventListener('click', closeRedirectModal);

  // Fechar ao clicar no fundo escuro fora do card
  sellerModalBackdrop?.addEventListener('click', (e) => {
    if (e.target === sellerModalBackdrop) {
      closeSellerModal();
    }
  });

  redirectModalBackdrop?.addEventListener('click', (e) => {
    if (e.target === redirectModalBackdrop) {
      closeRedirectModal();
    }
  });

  // Tecla ESC para fechar modais
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (redirectModalBackdrop && !redirectModalBackdrop.classList.contains('is-hidden')) {
        closeRedirectModal();
      } else if (sellerModalBackdrop && !sellerModalBackdrop.classList.contains('is-hidden')) {
        closeSellerModal();
      }
    }
  });

  // Inicializa lista de vendedores
  renderSellerList();

  // Renderiza a grade de motos inicial
  renderMotosGrid();
});

