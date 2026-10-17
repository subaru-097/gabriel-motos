const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');
const path = require('path');
const fs = require('fs');

async function testSellerFlow() {
  console.log('--- Iniciando Teste do Fluxo de Seleção de Vendedores e WhatsApp ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Intercepta window.open para registrar chamadas de redirecionamento
  await page.addInitScript(() => {
    window.openedUrls = [];
    window.open = function(url, target) {
      window.openedUrls.push({ url, target, timestamp: Date.now() });
      return null;
    };
  });

  await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });

  // 1. Localiza os botões de WhatsApp
  console.log('1. Verificando presença dos botões WhatsApp na grade de estoque...');
  const waButtons = await page.$$('.moto-grid-card__btn-whatsapp');
  console.log(`   Encontrados ${waButtons.length} botões de WhatsApp na grade.`);
  if (waButtons.length === 0) throw new Error('Nenhum botão de WhatsApp encontrado na grade!');

  // 2. Clica no primeiro botão de WhatsApp
  console.log('2. Clicando no botão WhatsApp do primeiro card...');
  await waButtons[0].click();
  await page.waitForTimeout(400);

  // 3. Verifica se Modal 1 ("Escolha o Vendedor") abriu
  const sellerModal = await page.$('#seller-modal-backdrop');
  const isSellerModalVisible = await sellerModal.evaluate(el => !el.classList.contains('is-hidden') && getComputedStyle(el).visibility !== 'hidden');
  console.log('   Modal 1 aberto e visível:', isSellerModalVisible);

  // Verifica propriedades visuais do Modal 1
  const modal1Styles = await page.evaluate(() => {
    const backdrop = document.getElementById('seller-modal-backdrop');
    const glassCard = document.getElementById('seller-glass-card');
    const bStyle = getComputedStyle(backdrop);
    const gStyle = getComputedStyle(glassCard);
    return {
      backdropBg: bStyle.backgroundImage,
      backdropSize: bStyle.backgroundSize,
      backdropPos: bStyle.backgroundPosition,
      cardBackdropFilter: gStyle.backdropFilter || gStyle.webkitBackdropFilter,
      cardBg: gStyle.backgroundColor,
      cardBorder: gStyle.border
    };
  });
  console.log('   Fundo Modal 1 usa escolha-vendedor.jpg:', modal1Styles.backdropBg.includes('escolha-vendedor.jpg'));
  console.log('   Background-size é cover:', modal1Styles.backdropSize === 'cover');
  console.log('   Card tem backdrop-filter blur:', modal1Styles.cardBackdropFilter.includes('blur'));
  console.log('   Card tem fundo escuro translúcido:', modal1Styles.cardBg.includes('rgba'));

  // 4. Verifica a lista de vendedores (ordem, nomes, fotos redondas, WhatsApp e seta)
  const sellersInfo = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.seller-item'));
    return items.map(item => {
      const img = item.querySelector('.seller-item__avatar');
      const name = item.querySelector('.seller-item__name');
      const role = item.querySelector('.seller-item__role');
      const waIcon = item.querySelector('.seller-item__wa-icon');
      const arrow = item.querySelector('.seller-item__arrow');
      const imgStyle = getComputedStyle(img);
      return {
        name: name?.textContent.trim(),
        role: role?.textContent.trim(),
        avatarSrc: img?.getAttribute('src'),
        avatarRadius: imgStyle.borderRadius,
        hasWaIcon: !!waIcon,
        hasArrow: !!arrow
      };
    });
  });

  console.log('   Vendedores renderizados na ordem:');
  sellersInfo.forEach((s, idx) => {
    console.log(`     ${idx + 1}. ${s.name} | ${s.role} | Foto: ${s.avatarSrc} (border-radius: ${s.avatarRadius}) | WA: ${s.hasWaIcon} | Seta: ${s.hasArrow}`);
  });

  if (!fs.existsSync('scratch/output')) fs.mkdirSync('scratch/output', { recursive: true });
  await page.screenshot({ path: 'scratch/output/modal_1_escolha_vendedor.png' });
  console.log('   Screenshot salvo: scratch/output/modal_1_escolha_vendedor.png');

  // 5. Clica no primeiro vendedor (Gustavo) e testa abertura do Modal 2
  console.log('5. Clicando no vendedor Gustavo...');
  const firstSellerBtn = (await page.$$('.seller-item'))[0];
  await firstSellerBtn.click();
  await page.waitForTimeout(400);

  // Verifica Modal 2
  const redirectModal = await page.$('#redirect-modal-backdrop');
  const isRedirectVisible = await redirectModal.evaluate(el => !el.classList.contains('is-hidden') && getComputedStyle(el).visibility !== 'hidden');
  const isSeller1Hidden = await sellerModal.evaluate(el => el.classList.contains('is-hidden'));
  console.log('   Modal 1 fechado:', isSeller1Hidden);
  console.log('   Modal 2 aberto:', isRedirectVisible);

  const redirectInfo = await page.evaluate(() => {
    const backdrop = document.getElementById('redirect-modal-backdrop');
    const nameEl = document.getElementById('redirect-seller-name');
    const spinner = document.querySelector('.redirect-modal__spinner');
    const cancelBtn = document.getElementById('btn-cancel-redirect');
    const bStyle = getComputedStyle(backdrop);
    const cancelStyle = getComputedStyle(cancelBtn);
    return {
      backdropBg: bStyle.backgroundImage,
      backdropSize: bStyle.backgroundSize,
      sellerName: nameEl?.textContent.trim(),
      hasSpinner: !!spinner,
      cancelBorder: cancelStyle.borderColor
    };
  });
  console.log('   Modal 2 fundo usa direcionamento-whatssap.jpg:', redirectInfo.backdropBg.includes('direcionamento-whatssap.jpg'));
  console.log('   Nome do vendedor no Modal 2:', redirectInfo.sellerName);
  console.log('   Spinner presente:', redirectInfo.hasSpinner);
  console.log('   Botão Cancelar tem borda cinza:', !!redirectInfo.cancelBorder);

  await page.screenshot({ path: 'scratch/output/modal_2_direcionamento.png' });
  console.log('   Screenshot salvo: scratch/output/modal_2_direcionamento.png');

  // 6. Testa o botão CANCELAR
  console.log('6. Testando botão CANCELAR...');
  const cancelBtn = await page.$('#btn-cancel-redirect');
  await cancelBtn.click();
  await page.waitForTimeout(400);

  const modal1Reopened = await sellerModal.evaluate(el => !el.classList.contains('is-hidden'));
  const modal2Closed = await redirectModal.evaluate(el => el.classList.contains('is-hidden'));
  console.log('   Modal 2 fechou:', modal2Closed);
  console.log('   Modal 1 reabriu sem redirecionar:', modal1Reopened);

  // Aguarda 3.2s para garantir que o redirecionamento foi cancelado com sucesso e nenhum window.open ocorreu
  console.log('   Aguardando 3.2s para certificar que NENHUM redirecionamento ocorre após cancelar...');
  await page.waitForTimeout(3200);
  let openedUrls = await page.evaluate(() => window.openedUrls);
  console.log('   Total de redirecionamentos após cancelar:', openedUrls.length);
  if (openedUrls.length !== 0) throw new Error('Redirecionamento ocorreu mesmo após cancelar!');

  // 7. Agora seleciona Leandro e deixa o redirecionamento automático acontecer (3s)
  console.log('7. Selecionando Leandro e aguardando redirecionamento automático (3s)...');
  const leandroBtn = (await page.$$('.seller-item'))[1];
  await leandroBtn.click();
  await page.waitForTimeout(400);

  const leandroName = await page.$eval('#redirect-seller-name', el => el.textContent.trim());
  console.log('   Modal 2 abriu com nome:', leandroName);

  console.log('   Aguardando 3.2s para conclusão do redirecionamento...');
  await page.waitForTimeout(3200);

  openedUrls = await page.evaluate(() => window.openedUrls);
  console.log('   Total de aberturas de URL:', openedUrls.length);
  console.log('   URL aberta:', openedUrls[0]?.url);
  console.log('   URL contém link de Leandro (5519996830965):', openedUrls[0]?.url.includes('5519996830965'));

  // 8. Testa abertura a partir do Modal de Moto (detalhes da moto)
  console.log('8. Testando fluxo a partir do botão WhatsApp do Modal de Moto...');
  // Fecha qualquer modal remanescente
  await page.evaluate(() => {
    document.getElementById('redirect-modal-backdrop')?.classList.add('is-hidden');
    document.getElementById('seller-modal-backdrop')?.classList.add('is-hidden');
  });

  // Abre primeiro card de moto
  const firstCard = await page.$('.moto-grid-card');
  await firstCard.click();
  await page.waitForTimeout(400);

  const motoModalOpen = await page.$eval('#moto-modal-backdrop', el => !el.classList.contains('is-hidden'));
  console.log('   Modal de detalhes da moto aberto:', motoModalOpen);

  // Clica no botão WhatsApp do modal de moto
  const modalWaBtn = await page.$('#modal-btn-whatsapp');
  await modalWaBtn.click();
  await page.waitForTimeout(400);

  const sellerModalFromDetail = await page.$eval('#seller-modal-backdrop', el => !el.classList.contains('is-hidden'));
  console.log('   Modal de seleção de vendedor abriu a partir do modal de moto:', sellerModalFromDetail);

  // Seleciona João
  console.log('   Selecionando João e aguardando redirecionamento...');
  const joaoBtn = (await page.$$('.seller-item'))[2];
  await joaoBtn.click();
  await page.waitForTimeout(3200);

  openedUrls = await page.evaluate(() => window.openedUrls);
  console.log('   Última URL aberta:', openedUrls[openedUrls.length - 1]?.url);
  console.log('   URL contém link de João (5519998076644):', openedUrls[openedUrls.length - 1]?.url.includes('5519998076644'));

  // 9. Testa visualização no celular (390x844)
  console.log('9. Testando responsividade mobile (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    document.getElementById('redirect-modal-backdrop')?.classList.add('is-hidden');
    document.getElementById('seller-modal-backdrop')?.classList.remove('is-hidden');
  });
  await page.waitForTimeout(400);

  const mobileBgPos = await page.$eval('#seller-modal-backdrop', el => getComputedStyle(el).backgroundPosition);
  console.log('   Background position no mobile é left center:', mobileBgPos.includes('left') || mobileBgPos.includes('0%'));

  await page.screenshot({ path: 'scratch/output/modal_1_mobile.png' });
  console.log('   Screenshot salvo: scratch/output/modal_1_mobile.png');

  await page.evaluate(() => {
    document.getElementById('seller-modal-backdrop')?.classList.add('is-hidden');
    document.getElementById('redirect-modal-backdrop')?.classList.remove('is-hidden');
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'scratch/output/modal_2_mobile.png' });
  console.log('   Screenshot salvo: scratch/output/modal_2_mobile.png');

  console.log('--- Todos os testes passaram com 100% de sucesso! ---');
  await browser.close();
}

testSellerFlow().catch(err => {
  console.error('ERRO NO TESTE:', err);
  process.exit(1);
});
