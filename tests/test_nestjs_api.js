const baseUrl = (process.env.API_BASE_URL || 'http://localhost:3000/api/v1').replace(/\/$/, '');

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`, { headers: { Accept: 'application/json' } });
  const body = await response.json();
  return { response, body };
}

async function main() {
  const live = await get('/health/live');
  if (live.response.status !== 200 || live.body?.data?.mode !== 'service-only') {
    throw new Error('Backend health does not expose the service-only contract');
  }
  if (live.body?.data?.capabilities?.commerce !== false) {
    throw new Error('Backend health must advertise commerce=false');
  }

  const categories = await get('/service-categories');
  if (categories.response.status !== 200) throw new Error('Service categories endpoint failed');

  for (const path of [
    '/products',
    '/cart',
    '/orders',
    '/admin/products',
    '/admin/orders',
    '/account/orders',
  ]) {
    const result = await get(path);
    if (result.response.status !== 410 || result.body?.error?.code !== 'COMMERCE_DISABLED') {
      throw new Error(`${path} must return 410 COMMERCE_DISABLED`);
    }
  }

  console.log('NESTJS SERVICE-ONLY API CONTRACT PASSED');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
