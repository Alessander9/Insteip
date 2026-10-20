/**
 * Script de configuración automatizada de Cloudflare para Insteip.com
 * Aplica:
 * 1. Regla WAF Custom: Bloqueo de escaneo de certificados (.pfx, .p12, .env, .git, etc.)
 * 2. Regla de Caché Edge: Almacenamiento a largo plazo para assets estáticos
 * 3. Regla de Redirección: Redirección canónica 301 insteip.com -> www.insteip.com
 * 4. Verificación de configuración general de seguridad de la zona.
 */

import fs from 'fs';
import path from 'path';

// Carga simple de variables desde .env local si existe
function loadEnv() {
  const envFiles = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'scripts/cloudflare/.env')
  ];
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      const lines = fs.readFileSync(envFile, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
    }
  }
}

loadEnv();

const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN;
const ZONE_NAME = process.env.CLOUDFLARE_ZONE_NAME || 'insteip.com';

if (!API_TOKEN) {
  console.error('\n❌ ERROR: No se encontró la variable CLOUDFLARE_API_TOKEN.');
  console.error('Por favor, define la variable de entorno o colócala en un archivo .env.');
  console.error('Ejemplo en PowerShell:');
  console.error('  $env:CLOUDFLARE_API_TOKEN = "tu_token_aqui"');
  console.error('  node scripts/cloudflare/apply-cloudflare-config.mjs\n');
  process.exit(1);
}

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

async function cfRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${CF_API_BASE}${endpoint}`, options);
  const data = await res.json();
  if (!res.ok || !data.success) {
    const errorMsg = data.errors && data.errors.length > 0
      ? data.errors.map(e => `[${e.code}] ${e.message}`).join(', ')
      : `HTTP ${res.status} ${res.statusText}`;
    throw new Error(`Error en Cloudflare API (${method} ${endpoint}): ${errorMsg}`);
  }
  return data.result;
}

async function verifyToken() {
  console.log('🔍 1. Verificando token de API de Cloudflare...');
  const verifyResult = await cfRequest('/user/tokens/verify');
  console.log(`✅ Token válido. Estado: ${verifyResult.status}`);
}

async function getZoneId() {
  console.log(`🔍 2. Obteniendo Zone ID para el dominio "${ZONE_NAME}"...`);
  const zones = await cfRequest(`/zones?name=${encodeURIComponent(ZONE_NAME)}`);
  if (!zones || zones.length === 0) {
    throw new Error(`No se encontró la zona para el dominio ${ZONE_NAME} en la cuenta asociada al token.`);
  }
  const zone = zones[0];
  console.log(`✅ Zona encontrada: ${zone.name} (ID: ${zone.id})`);
  return zone.id;
}

async function configureWafRule(zoneId) {
  console.log('\n🛡️ 3. Configurando regla WAF de bloqueo de escaneo sensible (.pfx, .p12, .env, etc.)...');
  const phase = 'http_request_firewall_custom';
  
  let entrypoint;
  try {
    entrypoint = await cfRequest(`/zones/${zoneId}/rulesets/phases/${phase}/entrypoint`);
  } catch (err) {
    // Si no existe, se creará
    entrypoint = null;
  }

  const targetRule = {
    action: 'block',
    description: 'Insteip Security: Block Sensitive File & Cert Scanning (.pfx, .p12, .env)',
    expression: '(http.request.uri.path contains ".pfx") or (http.request.uri.path contains ".p12") or (http.request.uri.path contains ".env") or (http.request.uri.path contains ".git") or (http.request.uri.path contains ".bak") or (http.request.uri.path contains ".sql") or (http.request.uri.path contains "id_rsa") or (http.request.uri.path contains "wp-login")',
    enabled: true
  };

  if (!entrypoint) {
    console.log('   Creando nuevo ruleset para WAF Custom Rules...');
    await cfRequest(`/zones/${zoneId}/rulesets`, 'POST', {
      name: 'Custom WAF Rules for Insteip',
      kind: 'zone',
      phase: phase,
      rules: [targetRule]
    });
    console.log('✅ Regla WAF creada exitosamente.');
  } else {
    const rules = entrypoint.rules || [];
    const existingIndex = rules.findIndex(r => r.description && r.description.includes('Insteip Security'));
    if (existingIndex !== -1) {
      console.log('   Actualizando regla existente...');
      rules[existingIndex] = { ...rules[existingIndex], ...targetRule };
    } else {
      console.log('   Añadiendo regla al ruleset existente...');
      rules.unshift(targetRule);
    }

    await cfRequest(`/zones/${zoneId}/rulesets/${entrypoint.id}`, 'PUT', {
      rules: rules
    });
    console.log('✅ Regla WAF actualizada exitosamente.');
  }
}

async function configureCacheRule(zoneId) {
  console.log('\n⚡ 4. Configurando regla de Caché Edge para assets estáticos de Angular...');
  const phase = 'http_request_cache_settings';
  
  let entrypoint;
  try {
    entrypoint = await cfRequest(`/zones/${zoneId}/rulesets/phases/${phase}/entrypoint`);
  } catch (err) {
    entrypoint = null;
  }

  const targetRule = {
    action: 'set_cache_settings',
    description: 'Insteip Optimization: Cache Static Angular Assets Long-term',
    expression: '(http.request.uri.path starts_with "/assets/") or (http.request.uri.path rmatches "\\.(js|css|woff2|woff|ttf|svg|png|jpg|jpeg|webp|ico)$")',
    action_parameters: {
      cache: true,
      edge_ttl: {
        mode: 'override_origin',
        default: 2592000 // 30 días
      },
      browser_ttl: {
        mode: 'override_origin',
        default: 31536000 // 1 año
      }
    },
    enabled: true
  };

  if (!entrypoint) {
    console.log('   Creando nuevo ruleset para Cache Settings...');
    await cfRequest(`/zones/${zoneId}/rulesets`, 'POST', {
      name: 'Cache Rules for Insteip',
      kind: 'zone',
      phase: phase,
      rules: [targetRule]
    });
    console.log('✅ Regla de Caché creada exitosamente.');
  } else {
    const rules = entrypoint.rules || [];
    const existingIndex = rules.findIndex(r => r.description && r.description.includes('Insteip Optimization'));
    if (existingIndex !== -1) {
      console.log('   Actualizando regla de caché existente...');
      rules[existingIndex] = { ...rules[existingIndex], ...targetRule };
    } else {
      console.log('   Añadiendo regla al ruleset de caché existente...');
      rules.unshift(targetRule);
    }

    await cfRequest(`/zones/${zoneId}/rulesets/${entrypoint.id}`, 'PUT', {
      rules: rules
    });
    console.log('✅ Regla de Caché actualizada exitosamente.');
  }
}

async function configureCanonicalRedirect(zoneId) {
  console.log('\n🔀 5. Configurando regla de redirección canónica (insteip.com -> www.insteip.com)...');
  const phase = 'http_request_dynamic_redirect';
  
  let entrypoint;
  try {
    entrypoint = await cfRequest(`/zones/${zoneId}/rulesets/phases/${phase}/entrypoint`);
  } catch (err) {
    entrypoint = null;
  }

  const targetRule = {
    action: 'redirect',
    description: 'Insteip Canonical: Redirect apex to www',
    expression: '(http.host eq "insteip.com")',
    action_parameters: {
      from_value: {
        status_code: 301,
        target_url: {
          expression: 'concat("https://www.insteip.com", http.request.uri.path)'
        },
        preserve_query_string: true
      }
    },
    enabled: true
  };

  if (!entrypoint) {
    console.log('   Creando nuevo ruleset para Dynamic Redirect...');
    await cfRequest(`/zones/${zoneId}/rulesets`, 'POST', {
      name: 'Dynamic Redirects for Insteip',
      kind: 'zone',
      phase: phase,
      rules: [targetRule]
    });
    console.log('✅ Regla de redirección 301 creada exitosamente.');
  } else {
    const rules = entrypoint.rules || [];
    const existingIndex = rules.findIndex(r => r.description && r.description.includes('Insteip Canonical'));
    if (existingIndex !== -1) {
      console.log('   Actualizando regla de redirección existente...');
      rules[existingIndex] = { ...rules[existingIndex], ...targetRule };
    } else {
      console.log('   Añadiendo regla al ruleset de redirección existente...');
      rules.unshift(targetRule);
    }

    await cfRequest(`/zones/${zoneId}/rulesets/${entrypoint.id}`, 'PUT', {
      rules: rules
    });
    console.log('✅ Regla de redirección 301 actualizada exitosamente.');
  }
}

async function ensureHttps(zoneId) {
  console.log('\n🔒 6. Verificando Always Use HTTPS...');
  try {
    const res = await cfRequest(`/zones/${zoneId}/settings/always_use_https`, 'PATCH', {
      value: 'on'
    });
    console.log(`✅ Always Use HTTPS activado: ${res.value}`);
  } catch (e) {
    console.warn(`   No se pudo actualizar Always Use HTTPS: ${e.message}`);
  }
}

async function main() {
  console.log('====================================================');
  console.log('🚀 APLICADOR DE REGLAS DE OPTIMIZACIÓN Y SEGURIDAD');
  console.log('====================================================\n');
  try {
    await verifyToken();
    const zoneId = await getZoneId();
    await configureWafRule(zoneId);
    await configureCacheRule(zoneId);
    await configureCanonicalRedirect(zoneId);
    await ensureHttps(zoneId);

    console.log('\n====================================================');
    console.log('🎉 ¡Todas las reglas han sido aplicadas con éxito!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ ERROR AL APLICAR CONFIGURACIÓN:');
    console.error(err.message);
    process.exit(1);
  }
}

main();
