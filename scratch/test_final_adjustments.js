const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');

async function testFinalAdjustments() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();

  console.log('--- Testando Ajustes Finais do Estoque e Filtro ---');
  await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });

  // 1. VERIFICAR SE TÍTULO E ABAS FORAM REMOVIDOS
  const filterTitle = await page.$('#filter-section-title');
  const filterTabs = await page.$$('.filter-tab');
  const filterHeader = await page.$('.filter-section__header');
  const pageContent = await page.content();
  const hasSelecioneProximaMoto = pageContent.includes('SELECIONE A PRÓXIMA MOTO');

  console.log('1. Remoção do bloco de filtro intermediário:');
  console.log('   Título "SELECIONE A PRÓXIMA MOTO" removido?', !hasSelecioneProximaMoto && !filterTitle);
  console.log('   Abas de filtro removidas?', filterTabs.length === 0);
  console.log('   Header do filtro removido?', !filterHeader);

  // 2. POSIÇÃO DA GRADE (Aproximação da Sessão 2)
  const spacingInfo = await page.evaluate(() => {
    const s2 = document.getElementById('categorias');
    const footer = s2.querySelector('.styles-footer');
    const filterSec = document.getElementById('filtro-motos');
    const grid = document.getElementById('motos-grid');

    const footerRect = footer.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    const distance = gridRect.top - footerRect.bottom;

    return {
      distance,
      filterSecPaddingTop: window.getComputedStyle(filterSec).paddingTop
    };
  });
  console.log('2. Posição da grade:');
  console.log('   Distância entre "NOSSO ESTOQUE" e a grade:', spacingInfo.distance + 'px');
  console.log('   Padding-top da filter-section:', spacingInfo.filterSecPaddingTop);

  // 3. FILTRO PELA SESSÃO 2
  console.log('3. Testando filtro reativo pela carta ativa da Sessão 2:');

  // Inicial (Alta Performance / Card 1)
  const initialCardsCount = await page.$$eval('.moto-grid-card', els => els.length);
  const initialModels = await page.$$eval('.moto-grid-card__model', els => els.map(e => e.textContent.trim()));
  console.log(`   [Card Inicial (Alta Performance)] ${initialCardsCount} card(s):`, initialModels.join(' | '));

  // Próxima carta (Aventura / Card 2)
  await page.click('#styles-next');
  await page.waitForTimeout(800);
  const avCardsCount = await page.$$eval('.moto-grid-card', els => els.length);
  const avModels = await page.$$eval('.moto-grid-card__model', els => els.map(e => e.textContent.trim()));
  console.log(`   [Próxima carta (Aventura)] ${avCardsCount} card(s):`, avModels.join(' | '));

  // Próxima carta (Dia a dia / Card 3)
  await page.click('#styles-next');
  await page.waitForTimeout(800);
  const diaCardsCount = await page.$$eval('.moto-grid-card', els => els.length);
  const diaModels = await page.$$eval('.moto-grid-card__model', els => els.map(e => e.textContent.trim()));
  console.log(`   [Próxima carta (Dia a dia)] ${diaCardsCount} card(s):`, diaModels.join(' | '));

  // Próxima carta (Todas as Categorias / Card 4)
  await page.click('#styles-next');
  await page.waitForTimeout(800);
  const todasCardsCount = await page.$$eval('.moto-grid-card', els => els.length);
  const todasModels = await page.$$eval('.moto-grid-card__model', els => els.map(e => e.textContent.trim()));
  console.log(`   [Próxima carta (Todas as Categorias)] ${todasCardsCount} card(s) (máx 6):`, todasModels.join(' | '));

  // Próxima carta (Urbana / Card 0)
  await page.click('#styles-next');
  await page.waitForTimeout(800);
  const urbanaCardsCount = await page.$$eval('.moto-grid-card', els => els.length);
  const urbanaModels = await page.$$eval('.moto-grid-card__model', els => els.map(e => e.textContent.trim()));
  console.log(`   [Próxima carta (Urbana)] ${urbanaCardsCount} card(s):`, urbanaModels.join(' | '));

  // 4. MEDIÇÃO DAS DIMENSÕES (Desktop e Mobile)
  console.log('4. Medição de dimensões dos Cards e Modal:');
  const desktopCardDims = await page.$eval('.moto-grid-card', card => {
    const rect = card.getBoundingClientRect();
    const media = card.querySelector('.moto-grid-card__media').getBoundingClientRect();
    return {
      cardWidth: Math.round(rect.width),
      cardHeight: Math.round(rect.height),
      mediaHeight: Math.round(media.height)
    };
  });
  console.log('   Card Desktop:', `${desktopCardDims.cardWidth}px largura x ${desktopCardDims.cardHeight}px altura (foto: ${desktopCardDims.mediaHeight}px)`);

  // Abre Modal clicando no card
  await page.click('.moto-grid-card');
  await page.waitForTimeout(350);

  const desktopModalDims = await page.$eval('.moto-modal', modal => {
    const rect = modal.getBoundingClientRect();
    const media = modal.querySelector('.moto-modal__media').getBoundingClientRect();
    return {
      modalWidth: Math.round(rect.width),
      modalHeight: Math.round(rect.height),
      mediaHeight: Math.round(media.height)
    };
  });
  console.log('   Modal Desktop:', `${desktopModalDims.modalWidth}px largura x ${desktopModalDims.modalHeight}px altura (foto: ${desktopModalDims.mediaHeight}px)`);
  await page.screenshot({ path: 'scratch/final_modal.png' });

  // Fecha modal
  await page.click('#moto-modal-close');
  await page.waitForTimeout(300);

  // 5. BOTÃO "VER ESTOQUE COMPLETO"
  const btnEstoqueStyle = await page.$eval('#btn-ver-estoque', btn => {
    const style = window.getComputedStyle(btn);
    const rect = btn.getBoundingClientRect();
    return {
      background: style.backgroundColor,
      color: style.color,
      fontWeight: style.fontWeight,
      fontSize: style.fontSize,
      padding: `${style.paddingTop} ${style.paddingRight}`,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      boxShadow: style.boxShadow
    };
  });
  console.log('5. Botão "VER ESTOQUE COMPLETO":');
  console.log('   Background:', btnEstoqueStyle.background);
  console.log('   Cor do texto:', btnEstoqueStyle.color);
  console.log('   Dimensões:', `${btnEstoqueStyle.width}px x ${btnEstoqueStyle.height}px (padding: ${btnEstoqueStyle.padding})`);
  console.log('   Sombra:', btnEstoqueStyle.boxShadow);

  // Scroll e screenshot da transição da Sessão 2 para o estoque
  await page.$eval('.styles-footer', el => el.scrollIntoView());
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'scratch/final_desktop.png' });

  // 6. RESPONSIVIDADE MOBILE (375px)
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(300);

  const mobileCardDims = await page.$eval('.moto-grid-card', card => {
    const rect = card.getBoundingClientRect();
    return {
      cardWidth: Math.round(rect.width),
      cardHeight: Math.round(rect.height)
    };
  });
  console.log('6. Mobile (375px) Card:', `${mobileCardDims.cardWidth}px largura x ${mobileCardDims.cardHeight}px altura`);
  await page.screenshot({ path: 'scratch/final_mobile_grid.png' });

  // Abre modal no mobile para medir
  await page.click('.moto-grid-card');
  await page.waitForTimeout(350);
  const mobileModalDims = await page.$eval('.moto-modal', modal => {
    const rect = modal.getBoundingClientRect();
    return {
      modalWidth: Math.round(rect.width),
      modalHeight: Math.round(rect.height)
    };
  });
  console.log('   Mobile Modal:', `${mobileModalDims.modalWidth}px largura x ${mobileModalDims.modalHeight}px altura`);
  await page.screenshot({ path: 'scratch/final_mobile.png' });

  await browser.close();
  console.log('--- Testes de Ajustes Finais Concluídos com Sucesso! ---');
}

testFinalAdjustments().catch(err => {
  console.error('Erro nos testes:', err);
  process.exit(1);
});
