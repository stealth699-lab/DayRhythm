import { corsHeaders } from '../_shared/cors.ts';
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  try {
    const { year } = await req.json();
    if (!Number.isInteger(year) || year < 2000 || year > 2100) return respond({ error: 'Год должен быть от 2000 до 2100.' }, 400);
    const response = await fetch(`https://isdayoff.ru/api/getdata?year=${year}&cc=ru&pre=1`, { signal: AbortSignal.timeout(15000) });
    const data = (await response.text()).trim();
    const days = new Date(Date.UTC(year + 1, 0, 1)).getTime() - new Date(Date.UTC(year, 0, 1)).getTime();
    if (!response.ok || data.length !== days / 86400000 || !/^[012]+$/.test(data)) return respond({ error: `Производственный календарь за ${year} недоступен. Попробуйте позже.` }, 502);
    return respond({ data, updated: new Date().toISOString() });
  } catch (error) { console.error('Russian calendar fetch failed', String(error)); return respond({ error: 'Не удалось получить производственный календарь России.' }, 502); }
});
