const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function runSeleniumTest() {
  console.log('================================================================');
  console.log('            INSTEIP - INICIANDO TEST CON SELENIUM               ');
  console.log('================================================================');

  let options = new chrome.Options();
  // Opciones del navegador para asegurar compatibilidad y estabilidad local
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');

  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    // ------------------------------------------------------------------
    // STEP 1: VALIDATE PUBLIC LANDING PAGE
    // ------------------------------------------------------------------
    console.log('\n[1/3] Navegando a la Página de Inicio pública...');
    await driver.get('http://localhost:4200/inicio');

    // Esperar a que el titular principal de la landing se renderice
    await driver.wait(until.elementLocated(By.xpath("//h1")), 10000);
    const mainTitle = await driver.findElement(By.xpath("//h1")).getText();
    console.log(`     Título principal encontrado: "${mainTitle.replace(/\n/g, ' ')}"`);
    console.log('✔ Página de inicio validada correctamente.');

    // ------------------------------------------------------------------
    // STEP 2: VALIDATE PUBLIC COURSE CATALOG
    // ------------------------------------------------------------------
    console.log('\n[2/3] Navegando al Catálogo de Cursos público...');
    await driver.get('http://localhost:4200/cursos');

    // Esperar a que se cargue la grilla de cursos
    await driver.wait(until.elementLocated(By.css('.grid')), 10000);
    const courseCards = await driver.findElements(By.css('.grid > div'));
    console.log(`     Cantidad de cursos visibles en catálogo: ${courseCards.length}`);
    if (courseCards.length === 0) {
      throw new Error('El catálogo de cursos está vacío o no se renderizó ningún curso.');
    }
    console.log('✔ Catálogo de cursos público verificado.');

    // ------------------------------------------------------------------
    // STEP 3: VALIDATE PUBLIC CERTIFICATE VERIFIER
    // ------------------------------------------------------------------
    console.log('\n[3/3] Probando pasarela de validación con código de prueba...');
    // Código semilla cargado por defecto en la base de datos (seed.sql)
    const testCode = 'CERT-ANG-2026-8891';
    await driver.get(`http://localhost:4200/certificados/validar/${testCode}`);

    // Esperar a que la pasarela devuelva el estado exitoso
    await driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'CERTIFICADO VÁLIDO')]")), 10000);
    const verificationBadge = await driver.findElement(By.xpath("//span[contains(text(), 'CERTIFICADO VÁLIDO')]")).getText();
    console.log(`     Estado de validación devuelto por Selenium: ${verificationBadge}`);

    console.log('\n================================================================');
    console.log('       ★ TEST DE SELENIUM COMPLETADO CON ÉXITO: OK ★            ');
    console.log('================================================================');
  } catch (error) {
    console.error('\n❌ ERROR DURANTE EL TEST DE SELENIUM:', error.message);
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

runSeleniumTest();
