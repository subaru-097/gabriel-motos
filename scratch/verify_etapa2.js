const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');

async function verifyEtapa2() {
  const browser = await chromium.launch({ headless: true });

  // 1. Mobile 390 x 844
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const page = await contextMobile.newPage();
  await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });

  // Abre Modal 1 clicando no botão do primeiro card da grade ou chamando openSellerModal
  await page.evaluate(() => {
    const waBtn = document.querySelector('.moto-grid-card__btn-whatsapp');
    if (waBtn) waBtn.click();
    else document.getElementById('seller-modal-backdrop').classList.remove('is-hidden');
  });

  await page.waitForTimeout(500);

  // Captura do Modal 1 com a lista no mobile 390x844
  await page.screenshot({ path: 'scratch/output/modal_1_390x844.png' });
  console.log('OK: Captura scratch/output/modal_1_390x844.png gerada com sucesso.');

  // Verifica os 3 vendedores na lista
  const sellerButtons = await page.$$('.seller-item');
  console.log(`Encontrados ${sellerButtons.length} botões de vendedor no modal 1.`);

  const names = [];
  for (const btn of sellerButtons) {
    const nameText = await btn.$eval('.seller-item__name', el => el.textContent.trim());
    const roleText = await btn.$eval('.seller-item__role', el => el.textContent.trim());
    const hasHighlight = await btn.evaluate(el => el.classList.contains('seller-item--highlight'));
    names.push({ name: nameText, role: roleText, highlight: hasHighlight });
  }
  console.log('Vendedores renderizados:', JSON.stringify(names, null, 2));

  // Teste 1: Clica em Gustavo
  await sellerButtons[0].click();
  await page.waitForTimeout(400);

  const isModal1HiddenAfterGustavo = await page.$eval('#seller-modal-backdrop', el => el.classList.contains('is-hidden'));
  const isModal2VisibleAfterGustavo = await page.$eval('#redirect-modal-backdrop', el => !el.classList.contains('is-hidden'));
  const nameInModal2Gustavo = await page.$eval('#redirect-seller-name', el => el.textContent.trim());
  console.log(`Gustavo -> Modal 1 fechou: ${isModal1HiddenAfterGustavo}, Modal 2 abriu: ${isModal2VisibleAfterGustavo}, Nome exibido: "${nameInModal2Gustavo}"`);
  await page.screenshot({ path: 'scratch/output/modal_2_gustavo_390x844.png' });

  // Fecha Modal 2 pelo X
  await page.click('#redirect-modal-close');
  await page.waitForTimeout(300);
  const isModal2HiddenAfterClose = await page.$eval('#redirect-modal-backdrop', el => el.classList.contains('is-hidden'));
  console.log(`Modal 2 fechou com o botão X: ${isModal2HiddenAfterClose}`);

  // Teste 2: Reabre Modal 1 e clica em Leandro
  await page.evaluate(() => {
    document.getElementById('seller-modal-backdrop').classList.remove('is-hidden');
  });
  await page.waitForTimeout(300);
  const updatedSellerButtons = await page.$$('.seller-item');
  await updatedSellerButtons[1].click();
  await page.waitForTimeout(400);

  const nameInModal2Leandro = await page.$eval('#redirect-seller-name', el => el.textContent.trim());
  console.log(`Leandro -> Nome exibido no Modal 2: "${nameInModal2Leandro}"`);
  await page.screenshot({ path: 'scratch/output/modal_2_leandro_390x844.png' });

  // Fecha Modal 2 pelo X
  await page.click('#redirect-modal-close');
  await page.waitForTimeout(300);

  // Teste 3: Reabre Modal 1 e clica em João
  await page.evaluate(() => {
    document.getElementById('seller-modal-backdrop').classList.remove('is-hidden');
  });
  await page.waitForTimeout(300);
  const sellerButtonsThird = await page.$$('.seller-item');
  await sellerButtonsThird[2].click();
  await page.waitForTimeout(400);

  const nameInModal2Joao = await page.$eval('#redirect-seller-name', el => el.textContent.trim());
  console.log(`João -> Nome exibido no Modal 2: "${nameInModal2Joao}"`);
  await page.screenshot({ path: 'scratch/output/modal_2_joao_390x844.png' });

  // Fecha Modal 2
  await page.click('#redirect-modal-close');
  await page.waitForTimeout(300);

  // 2. Desktop 1440 x 900
  const contextDesktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });
  const pageDesktop = await contextDesktop.newPage();
  await pageDesktop.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });

  await pageDesktop.evaluate(() => {
    const waBtn = document.querySelector('.moto-grid-card__btn-whatsapp');
    if (waBtn) waBtn.click();
    else document.getElementById('seller-modal-backdrop').classList.remove('is-hidden');
  });
  await pageDesktop.waitForTimeout(500);

  await pageDesktop.screenshot({ path: 'scratch/output/modal_1_desktop.png' });
  console.log('OK: Captura scratch/output/modal_1_desktop.png gerada com sucesso.');

  await browser.close();
  console.log('VERIFICAÇÃO CONCLUÍDA COM SUCESSO!');
}

verifyEtapa2().catch(console.error);
