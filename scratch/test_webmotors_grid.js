const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');
const path = require('path');

async function testWebmotorsGrid() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();

  console.log('--- Iniciando Testes Gabriel Motos ---');
  await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });

  // 1. TEXTO DA SESSÃO 2
  const s2FooterText = await page.$eval('.styles-footer__text', el => el.textContent.trim());
  console.log('1. Sessão 2 footer text:', s2FooterText);
  if (s2FooterText === 'NOSSO ESTOQUE') {
    console.log('   [PASS] Footer agora é "NOSSO ESTOQUE"');
  } else {
    console.error('   [FAIL] Footer text incorreto:', s2FooterText);
  }

  // Verifica carrossel da Sessão 2 intacto
  const s2CardsCount = await page.$$eval('.style-card', els => els.length);
  console.log('   Sessão 2 style cards count:', s2CardsCount);

  // 2. TEXTOS REMOVIDOS DO BLOCO DE FILTRO
  const pageContent = await page.content();
  const hasEstoqueSelecionado = pageContent.includes('ESTOQUE SELECIONADO');
  const hasQualidadeProcedencia = pageContent.includes('QUALIDADE E PROCEDÊNCIA GARANTIDAS');
  const hasFilterProgress = await page.$('#filter-progress');

  console.log('2. Remoções do bloco de filtro:');
  console.log('   "ESTOQUE SELECIONADO" ausente?', !hasEstoqueSelecionado);
  console.log('   "QUALIDADE E PROCEDÊNCIA GARANTIDAS" ausente?', !hasQualidadeProcedencia);
  console.log('   Indicador de progresso ausente?', !hasFilterProgress);

  // Título e Abas
  const filterTitle = await page.$eval('#filter-section-title', el => el.textContent.trim());
  console.log('   Título do filtro:', filterTitle);
  const tabNames = await page.$$eval('.filter-tab', els => els.map(e => e.textContent.trim()));
  console.log('   Abas de filtro:', tabNames.join(', '));

  // 3. GRADE DE CARDS NO DESKTOP (3 Colunas)
  const gridComputed = await page.$eval('#motos-grid', el => {
    const style = window.getComputedStyle(el);
    return {
      display: style.display,
      gridTemplateColumns: style.gridTemplateColumns,
      columnsCount: style.gridTemplateColumns.split(' ').length
    };
  });
  console.log('3. Grade Desktop:');
  console.log('   Display:', gridComputed.display);
  console.log('   Colunas:', gridComputed.columnsCount, `(${gridComputed.gridTemplateColumns})`);

  // Cards sob "Todas"
  let initialCards = await page.$$eval('.moto-grid-card', els => els.length);
  console.log('   Cards sob "Todas":', initialCards, '(máximo 6)');

  // 4. TESTE DAS ABAS E FILTROS
  console.log('4. Teste de filtros por categoria:');

  // Aba Urbana
  await page.click('button[data-filter="Urbana"]');
  await page.waitForTimeout(350);
  const urbanaCards = await page.$$eval('.moto-grid-card', els => els.length);
  const urbanaModels = await page.$$eval('.moto-grid-card__model', els => els.map(e => e.textContent.trim()));
  console.log(`   [Urbana] ${urbanaCards} cards encontrados:`, urbanaModels.join(' | '));

  // Aba Alta Performance
  await page.click('button[data-filter="Alta Performance"]');
  await page.waitForTimeout(350);
  const apCards = await page.$$eval('.moto-grid-card', els => els.length);
  const apModels = await page.$$eval('.moto-grid-card__model', els => els.map(e => e.textContent.trim()));
  console.log(`   [Alta Performance] ${apCards} cards encontrados:`, apModels.join(' | '));

  // Aba Aventura
  await page.click('button[data-filter="Aventura"]');
  await page.waitForTimeout(350);
  const avCards = await page.$$eval('.moto-grid-card', els => els.length);
  const avModels = await page.$$eval('.moto-grid-card__model', els => els.map(e => e.textContent.trim()));
  console.log(`   [Aventura] ${avCards} cards encontrados:`, avModels.join(' | '));

  // Aba Dia a dia
  await page.click('button[data-filter="Dia a dia"]');
  await page.waitForTimeout(350);
  const diaCards = await page.$$eval('.moto-grid-card', els => els.length);
  const diaModels = await page.$$eval('.moto-grid-card__model', els => els.map(e => e.textContent.trim()));
  console.log(`   [Dia a dia] ${diaCards} cards encontrados:`, diaModels.join(' | '));

  // Volta para Todas
  await page.click('button[data-filter="Todas"]');
  await page.waitForTimeout(350);
  const todasCards = await page.$$eval('.moto-grid-card', els => els.length);
  console.log(`   [Todas] Restaurado com ${todasCards} cards`);

  // 5. TESTE DE INTERAÇÕES NOS CARDS (Coração, WhatsApp e Modal)
  console.log('5. Teste de botões e cliques no Card:');
  const firstCard = await page.$('.moto-grid-card');

  // Testa clique no coração (Favoritar)
  const heartBtn = await firstCard.$('.moto-grid-card__btn-favorite');
  await heartBtn.click();
  await page.waitForTimeout(200);
  const favPopupVisible = await page.$eval('#favorite-popup', el => !el.classList.contains('is-hidden'));
  console.log('   Clique no coração abriu pop-up de favoritos?', favPopupVisible);

  // Fecha popup de favorito
  await page.click('#fav-popup-close');
  await page.waitForTimeout(200);

  // Testa botão WhatsApp
  const waBtn = await firstCard.$('.moto-grid-card__btn-whatsapp');
  const waHref = await waBtn.getAttribute('href');
  console.log('   Botão WhatsApp link formatado:', waHref.includes('wa.me') && waHref.includes('CB1000R'));

  // Testa clique no corpo do card para abrir Modal de Detalhes
  await firstCard.click();
  await page.waitForTimeout(300);
  const modalVisible = await page.$eval('#moto-modal-backdrop', el => !el.classList.contains('is-hidden'));
  const modalTitle = await page.$eval('#modal-modelo-title', el => el.textContent.trim());
  console.log('   Clique no card abriu modal?', modalVisible);
  console.log('   Modelo no modal:', modalTitle);

  // Tira screenshot do modal aberto
  await page.screenshot({ path: 'scratch/grid_modal.png' });

  // Fecha modal
  await page.click('#moto-modal-close');
  await page.waitForTimeout(300);

  // 6. BOTÃO "VER ESTOQUE COMPLETO"
  const ctaBtn = await page.$('#btn-ver-estoque');
  const ctaText = await page.$eval('#btn-ver-estoque .btn-ver-estoque__text', el => el.textContent.trim());
  const ctaHref = await ctaBtn.getAttribute('href');
  console.log('6. Botão "VER ESTOQUE COMPLETO":', ctaText, 'href:', ctaHref);

  // Scroll até a seção de filtro para capturar o screenshot Desktop
  await page.$eval('#filtro-motos', el => el.scrollIntoView());
  await page.waitForTimeout(400);
  const filterSec = await page.$('#filtro-motos');
  await filterSec.screenshot({ path: 'scratch/grid_full_section.png' });
  await page.screenshot({ path: 'scratch/grid_desktop.png' });

  // 7. RESPONSIVIDADE TABLET (768px - 2 colunas)
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(300);
  const tabletCols = await page.$eval('#motos-grid', el => window.getComputedStyle(el).gridTemplateColumns.split(' ').length);
  console.log('7. Colunas em Tablet (768px):', tabletCols);
  await page.screenshot({ path: 'scratch/grid_tablet.png' });

  // 8. RESPONSIVIDADE MOBILE (375px - 1 coluna)
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(300);
  const mobileCols = await page.$eval('#motos-grid', el => window.getComputedStyle(el).gridTemplateColumns.split(' ').length);
  console.log('8. Colunas em Mobile (375px):', mobileCols);
  await page.screenshot({ path: 'scratch/grid_mobile.png' });

  await browser.close();
  console.log('--- Todos os testes concluídos com sucesso! ---');
}

testWebmotorsGrid().catch(err => {
  console.error('Erro na execução dos testes:', err);
  process.exit(1);
});
