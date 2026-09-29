/**
 * Renderizador de Markdown Robusto y Seguro para DataMesh Bolivia
 * Soporta:
 *  - Bloques de código con 3+ backticks, header de lenguaje, botón de copia y Lucide icons
 *  - Tablas Markdown GFM completas
 *  - Callouts estilo Obsidian (> [!NOTE], > [!TIP], > [!WARNING], > [!INFO], > [!CAUTION])
 *  - Wikilinks Obsidian ([[Nota]] y [[Nota|Texto]])
 *  - Enlaces relativos a documentos del dataset y enlaces externos seguros con iconos Lucide
 */

export interface RenderMarkdownOptions {
  datasetSlug?: string;
  currentDocPath?: string;
}

export function renderMarkdown(content: string, options: RenderMarkdownOptions = {}): string {
  if (!content) return '';

  const { datasetSlug = '' } = options;

  // Normalizar saltos de línea a LF
  const normalized = content.replace(/\r\n/g, '\n');

  // 1. Extraer bloques de código (soporta 3 o más backticks e indentaciones)
  const codeBlocks: string[] = [];
  const codeRegex = /(?:^|\n)(`{3,})([a-zA-Z0-9_-]*)[^\S\n]*\n([\s\S]*?)\n\1[ \t]*(?=\n|$)/g;

  let processed = normalized.replace(codeRegex, (match, fence, lang, code) => {
    const placeholder = `\n__CODE_BLOCK_${codeBlocks.length}__\n`;
    const escapedCode = escapeHtml(code.trimEnd());
    const displayLang = (lang || 'code').toLowerCase();

    if (displayLang === 'chart') {
      codeBlocks.push(renderChartCard(code));
    } else {
      codeBlocks.push(
        `<div class="code-block-wrapper">
          <div class="code-block-header">
            <span class="code-lang-tag">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
              ${displayLang}
            </span>
            <button type="button" class="code-copy-btn" aria-label="Copiar código al portapapeles" title="Copiar código">
              <svg class="copy-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              <span class="copy-label">Copiar</span>
            </button>
          </div>
          <pre class="code-pre"><code class="language-${displayLang}">${escapedCode}</code></pre>
        </div>`
      );
    }

    return placeholder;
  });

  // 2. Extraer bloques de tablas Markdown
  const tableBlocks: string[] = [];
  processed = processed.replace(
    /((?:(?:\|[^\n]+\|)\n)+)/g,
    (match) => {
      const lines = match.trim().split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) return match;

      // Verificar si la segunda línea es un separador |---|---|
      const isSeparator = /^\|(?:\s*:?-+:?\s*\|)+$/.test(lines[1]);
      if (!isSeparator) return match;

      const placeholder = `\n__TABLE_BLOCK_${tableBlocks.length}__\n`;
      
      const parseRow = (line: string) => {
        return line
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map(cell => cell.trim());
      };

      const headerCells = parseRow(lines[0]);
      const rows = lines.slice(2).map(parseRow);

      let tableHtml = `<div class="table-wrapper" style="margin: 1.5rem 0;"><table><thead><tr>`;
      for (const h of headerCells) {
        tableHtml += `<th>${processInline(h, datasetSlug)}</th>`;
      }
      tableHtml += `</tr></thead><tbody>`;

      for (const row of rows) {
        tableHtml += `<tr>`;
        for (let i = 0; i < headerCells.length; i++) {
          const cell = row[i] || '';
          tableHtml += `<td>${processInline(cell, datasetSlug)}</td>`;
        }
        tableHtml += `</tr>`;
      }

      tableHtml += `</tbody></table></div>`;
      tableBlocks.push(tableHtml);
      return placeholder;
    }
  );

  // 3. Procesar líneas estructurales (encabezados, citas, listas, líneas)
  const lines = processed.split('\n');
  const outputLines: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Encabezados
    if (line.startsWith('# ')) {
      if (inList) { outputLines.push('</ul>'); inList = false; }
      outputLines.push(`<h1 style="font-size: 1.85rem; margin-top: 1.75rem; margin-bottom: 0.75rem;">${processInline(line.slice(2), datasetSlug)}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { outputLines.push('</ul>'); inList = false; }
      outputLines.push(`<h2 style="font-size: 1.45rem; margin-top: 1.5rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.35rem;">${processInline(line.slice(3), datasetSlug)}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      if (inList) { outputLines.push('</ul>'); inList = false; }
      outputLines.push(`<h3 style="font-size: 1.2rem; margin-top: 1.25rem; margin-bottom: 0.4rem;">${processInline(line.slice(4), datasetSlug)}</h3>`);
      continue;
    }
    if (line.startsWith('#### ')) {
      if (inList) { outputLines.push('</ul>'); inList = false; }
      outputLines.push(`<h4 style="font-size: 1.05rem; margin-top: 1rem; margin-bottom: 0.35rem;">${processInline(line.slice(5), datasetSlug)}</h4>`);
      continue;
    }

    // Regla horizontal
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      if (inList) { outputLines.push('</ul>'); inList = false; }
      outputLines.push('<hr style="border: none; border-top: 1px solid var(--color-border); margin: 2rem 0;" />');
      continue;
    }

    // Callouts estilo Obsidian (> [!NOTE] o > [!TIP] ...)
    const calloutMatch = line.match(/^>\s*\[!([a-zA-Z]+)\]\s*(.*)$/);
    if (calloutMatch) {
      if (inList) { outputLines.push('</ul>'); inList = false; }
      const calloutType = calloutMatch[1].toLowerCase();
      const calloutTitle = calloutMatch[2].trim() || calloutMatch[1].toUpperCase();
      
      const calloutBody: string[] = [];
      while (i + 1 < lines.length && lines[i + 1].startsWith('>')) {
        i++;
        calloutBody.push(lines[i].replace(/^>\s?/, ''));
      }
      
      const bodyHtml = calloutBody.map(l => `<p style="margin: 0.25rem 0;">${processInline(l, datasetSlug)}</p>`).join('');
      outputLines.push(
        `<div class="callout callout-${calloutType}">
          <div class="callout-title">${escapeHtml(calloutTitle)}</div>
          <div class="callout-content">${bodyHtml || ''}</div>
        </div>`
      );
      continue;
    }

    // Blockquote estándar
    if (line.startsWith('> ')) {
      if (inList) { outputLines.push('</ul>'); inList = false; }
      outputLines.push(`<blockquote>${processInline(line.slice(2), datasetSlug)}</blockquote>`);
      continue;
    }

    // Listas desordenadas
    if (/^\s*[\-\*]\s+/.test(line)) {
      if (!inList) {
        outputLines.push('<ul style="padding-left: 1.5rem; margin: 0.75rem 0;">');
        inList = true;
      }
      const itemText = line.replace(/^\s*[\-\*]\s+/, '');
      outputLines.push(`<li style="margin-bottom: 0.35rem;">${processInline(itemText, datasetSlug)}</li>`);
      continue;
    } else if (inList) {
      outputLines.push('</ul>');
      inList = false;
    }

    // Placeholders de bloques (código o tabla) se insertan directos
    if (/^__(CODE|TABLE)_BLOCK_\d+__$/.test(line.trim())) {
      outputLines.push(line.trim());
      continue;
    }

    // Párrafos o líneas normales
    if (line.trim()) {
      outputLines.push(`<p style="margin-bottom: 0.85rem; line-height: 1.6;">${processInline(line, datasetSlug)}</p>`);
    }
  }

  if (inList) {
    outputLines.push('</ul>');
  }

  let finalHtml = outputLines.join('\n');

  // 4. Restaurar tablas usando split-join para prevenir sustitución indebida de $
  for (let idx = 0; idx < tableBlocks.length; idx++) {
    finalHtml = finalHtml.split(`__TABLE_BLOCK_${idx}__`).join(tableBlocks[idx]);
  }

  // 5. Restaurar bloques de código usando split-join
  for (let idx = 0; idx < codeBlocks.length; idx++) {
    finalHtml = finalHtml.split(`__CODE_BLOCK_${idx}__`).join(codeBlocks[idx]);
  }

  return finalHtml;
}

function processInline(text: string, datasetSlug: string): string {
  let res = text;

  // Negrita
  res = res.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  res = res.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Cursiva
  res = res.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  res = res.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Código inline
  res = res.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Obsidian Wikilinks: [[Nota]] o [[Nota|Texto Visible]]
  res = res.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, target, display) => {
    const cleanTarget = target.trim();
    const label = (display || cleanTarget).trim();

    if (cleanTarget.startsWith('#')) {
      return `<a href="${cleanTarget}">${label}</a>`;
    }

    if (datasetSlug) {
      const cleanPath = cleanTarget.replace(/^\.\//, '').replace(/\.md$/, '');
      const targetTabId = `doc-${cleanPath.replace(/\//g, '-')}`;
      return `<a href="/datasets/${datasetSlug}/${cleanPath}" data-doc-target="${targetTabId}" class="internal-doc-link" title="Abrir nota: ${cleanTarget}">${label}</a>`;
    }

    return `<a href="${cleanTarget}" class="internal-doc-link">${label}</a>`;
  });

  // Enlaces Markdown [texto](url)
  res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
    const trimmedUrl = url.trim();

    // 1. Enlace externo (http / https) -> Abrir en ventana nueva con icono Lucide ExternalLink
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return `<a href="${trimmedUrl}" target="_blank" rel="noopener noreferrer" class="external-link" title="Abrir enlace externo en nueva pestaña">${label} <svg style="display:inline-block; vertical-align:middle;" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>`;
    }

    // 2. Anclas en la misma página (#...)
    if (trimmedUrl.startsWith('#')) {
      return `<a href="${trimmedUrl}">${label}</a>`;
    }

    // 3. Enlace relativo a archivo Markdown del dataset (concepts/..., knowledge/..., etc.)
    if (trimmedUrl.endsWith('.md')) {
      const cleanPath = trimmedUrl.replace(/^\.\//, '').replace(/\.md$/, '');
      if (datasetSlug) {
        const targetTabId = `doc-${cleanPath.replace(/\//g, '-')}`;
        return `<a href="/datasets/${datasetSlug}/${cleanPath}" data-doc-target="${targetTabId}" class="internal-doc-link" title="Ver documento de referencia: ${cleanPath}">${label}</a>`;
      }
      return `<a href="${trimmedUrl}" class="internal-doc-link">${label}</a>`;
    }

    // Otros enlaces relativos
    return `<a href="${trimmedUrl}">${label}</a>`;
  });

  return res;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderChartCard(code: string): string {
  let config: any = null;
  try {
    config = JSON.parse(code.trim());
  } catch (e) {
    config = null;
  }

  const escapedCode = escapeHtml(code.trimEnd());
  if (!config || !config.title) {
    return `<div class="chart-card card" style="margin: 1.5rem 0; padding: 1.25rem;">
      <pre class="code-pre"><code class="language-json">${escapedCode}</code></pre>
    </div>`;
  }

  const chartId = `chart-${Math.random().toString(36).substring(2, 9)}`;
  const title = escapeHtml(config.title || 'Grafico Declarativo');
  const subtitle = escapeHtml(config.subtitle || '');
  const source = escapeHtml(config.source || 'DataMesh Bolivia');
  const unit = escapeHtml(config.unit || '');
  const rawSql: string = config.sql || '';
  const sql = escapeHtml(rawSql);
  const chartType: string = (config.type || 'bar').toLowerCase();
  const colors: string[] = Array.isArray(config.colors) && config.colors.length > 0
    ? config.colors
    : ['var(--color-primary)', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#ec4899', '#475569'];
  const primaryColor: string = colors[0];
  const xKey: string = config.xKey || 'x';
  const yKeys: string[] = Array.isArray(config.yKeys) ? config.yKeys : ['y'];
  const rows: any[] = Array.isArray(config.data) ? config.data : [];

  const sqlBadge = `<div class="chart-sql-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>Grafico calculado en tiempo real</div>`;

  let visualHtml = '';

  if (chartType === 'bar') {
    if (rows.length > 0) {
      const rawVals: number[] = rows.map((r: any) => { const v = parseFloat(r[yKeys[0]]); return isNaN(v) ? 0 : v; });
      const maxVal: number = Math.max(...rawVals, 1);
      const barsHtml: string = rows.map((r: any, idx: number) => {
        const label = escapeHtml(String(r[xKey] ?? ''));
        const val = rawVals[idx];
        const pct = Math.round((val / maxVal) * 100);
        const display = Number.isInteger(val) ? String(val) : val.toFixed(1);
        return `<div class="chart-bar-row"><span class="chart-bar-label">${label}</span><div class="chart-bar-track"><div class="chart-bar-fill" style="width:${pct}%;background-color:${primaryColor};"></div></div><span class="chart-bar-value">${display}${unit ? ` ${unit}` : ''}</span></div>`;
      }).join('');
      visualHtml = `<div class="chart-bars-list">${barsHtml}</div>`;
    } else {
      const skelBars: string = yKeys.map((yk: string, ki: number) =>
        `<div class="chart-bar-row"><span class="chart-bar-label" style="color:var(--color-text-muted);">${escapeHtml(yk)}</span><div class="chart-bar-track"><div class="chart-bar-fill" style="width:${45 + ki * 20}%;background-color:${colors[ki % colors.length]};opacity:0.45;"></div></div><span class="chart-bar-value" style="color:var(--color-text-muted);">--</span></div>`
      ).join('');
      visualHtml = `<div class="chart-sql-preview">${sqlBadge}<div class="chart-bars-list chart-bars-skeleton">${skelBars}</div><p style="font-size:0.8rem;color:var(--color-text-muted);margin-top:0.5rem;">Eje X: <code>${escapeHtml(xKey)}</code> &middot; Eje Y: <code>${yKeys.map((k: string) => escapeHtml(k)).join(', ')}</code></p></div>`;
    }
  } else if (chartType === 'area' || chartType === 'line') {
    const w = 520, h = 170;
    const padL = 20, padR = 20, padT = 10, padB = 35;
    const innerW = w - padL - padR;
    const innerH = h - padT - padB;
    const pts: Array<{label: string; vals: number[]}> = rows.map((r: any) => ({
      label: String(r[xKey] ?? ''),
      vals: yKeys.map((yk: string) => { const v = parseFloat(r[yk]); return isNaN(v) ? 0 : v; })
    }));
    if (pts.length >= 2) {
      const allVals: number[] = pts.flatMap((p: {label: string; vals: number[]}) => p.vals);
      const minV = Math.min(0, ...allVals);
      const maxV = Math.max(...allVals);
      const rangeV = maxV === minV ? 1 : maxV - minV;
      const baseY = (padT + innerH - ((0 - minV) / rangeV) * innerH).toFixed(1);
      const serHtml: string = yKeys.map((yk: string, ki: number) => {
        const col = colors[ki % colors.length];
        const polyPts: string = pts.map((p: {label: string; vals: number[]}, i: number) => {
          const x = padL + (i / (pts.length - 1)) * innerW;
          const y = padT + innerH - ((p.vals[ki] - minV) / rangeV) * innerH;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');
        const firstX = padL.toFixed(1);
        const lastX = (padL + innerW).toFixed(1);
        return `<defs><linearGradient id="ag${chartId}${ki}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${col}" stop-opacity="0.25"/><stop offset="100%" stop-color="${col}" stop-opacity="0.0"/></linearGradient></defs><polygon points="${firstX},${baseY} ${polyPts} ${lastX},${baseY}" fill="url(#ag${chartId}${ki})"/><polyline points="${polyPts}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
      }).join('');
      const step = Math.ceil(pts.length / 5);
      const xLbls: string = pts.filter((_: any, i: number) => i === 0 || i === pts.length - 1 || pts.length <= 6 || i % step === 0)
        .map((p: {label: string; vals: number[]}) => `<span>${escapeHtml(p.label)}</span>`).join('');
      const legendHtml: string = yKeys.length > 1
        ? `<div class="chart-legend" style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-top:0.5rem;">${yKeys.map((yk: string, ki: number) => `<span style="display:flex;align-items:center;gap:0.3rem;font-size:0.775rem;font-family:var(--font-mono);"><span style="width:10px;height:10px;border-radius:50%;background:${colors[ki % colors.length]};display:inline-block;"></span>${escapeHtml(yk)}</span>`).join('')}</div>`
        : '';
      visualHtml = `<div class="chart-svg-wrap"><svg viewBox="0 0 ${w} ${h}" class="chart-svg" preserveAspectRatio="none"><line x1="${padL}" y1="${h - padB}" x2="${w - padR}" y2="${h - padB}" stroke="var(--color-border)" stroke-width="1"/>${serHtml}</svg><div class="chart-x-labels">${xLbls}</div></div>${legendHtml}`;
    } else {
      const dv: number[] = [0.4, 0.6, 0.35, 0.75, 0.55, 0.9, 0.65];
      const demoPts: string = dv.map((v: number, i: number, arr: number[]) => {
        const x = padL + (i / (arr.length - 1)) * innerW;
        const y = padT + innerH * (1 - v);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
      const bly = (padT + innerH).toFixed(1);
      visualHtml = `<div class="chart-sql-preview">${sqlBadge}<div class="chart-svg-wrap" style="opacity:0.4;"><svg viewBox="0 0 ${w} ${h}" class="chart-svg" preserveAspectRatio="none"><defs><linearGradient id="sg${chartId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.25"/><stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.0"/></linearGradient></defs><line x1="${padL}" y1="${bly}" x2="${w - padR}" y2="${bly}" stroke="var(--color-border)" stroke-width="1"/><polygon points="${padL},${bly} ${demoPts} ${w - padR},${bly}" fill="url(#sg${chartId})"/><polyline points="${demoPts}" fill="none" stroke="${primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><p style="font-size:0.8rem;color:var(--color-text-muted);margin-top:0.4rem;">Eje X: <code>${escapeHtml(xKey)}</code> &middot; Serie: <code>${yKeys.map((k: string) => escapeHtml(k)).join(', ')}</code></p></div>`;
    }
  } else if (chartType === 'pie' || chartType === 'donut') {
    const cx = 90, cy = 90, r = 70, innerR = chartType === 'donut' ? 35 : 0;
    if (rows.length > 0) {
      const total: number = rows.reduce((s: number, row: any) => { const v = parseFloat(row[yKeys[0]]); return s + (isNaN(v) ? 0 : v); }, 0);
      const safeTotal = total === 0 ? 1 : total;
      let ang = -Math.PI / 2;
      const sliceHtml: string = rows.map((row: any, i: number) => {
        const val = parseFloat(row[yKeys[0]]);
        const safeVal = isNaN(val) ? 0 : val;
        const frac = safeVal / safeTotal;
        const a = frac * 2 * Math.PI;
        const x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang);
        ang += a;
        const x2 = cx + r * Math.cos(ang), y2 = cy + r * Math.sin(ang);
        const la = a > Math.PI ? 1 : 0;
        const col = colors[i % colors.length];
        let d: string;
        if (innerR > 0) {
          const ix1 = cx + innerR * Math.cos(ang - a), iy1 = cy + innerR * Math.sin(ang - a);
          const ix2 = cx + innerR * Math.cos(ang), iy2 = cy + innerR * Math.sin(ang);
          d = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${la} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${ix2.toFixed(2)} ${iy2.toFixed(2)} A ${innerR} ${innerR} 0 ${la} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)} Z`;
        } else {
          d = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${la} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
        }
        const label = escapeHtml(String(row[xKey] ?? ''));
        const pct = Math.round(frac * 100);
        return `<path d="${d}" fill="${col}" stroke="var(--color-surface)" stroke-width="1.5" data-label="${label}" data-pct="${pct}"/>`;
      }).join('');
      const legendItems: string = rows.map((row: any, i: number) => {
        const label = escapeHtml(String(row[xKey] ?? ''));
        const val = parseFloat(row[yKeys[0]]);
        const safeVal = isNaN(val) ? 0 : val;
        const pct = Math.round((safeVal / safeTotal) * 100);
        const col = colors[i % colors.length];
        return `<div style="display:flex;align-items:center;gap:0.45rem;font-size:0.775rem;font-family:var(--font-mono);"><span style="width:10px;height:10px;border-radius:50%;background:${col};flex-shrink:0;"></span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--color-text);">${label}</span><span style="margin-left:auto;padding-left:0.5rem;font-weight:600;color:var(--color-text-muted);">${pct}%</span></div>`;
      }).join('');
      visualHtml = `<div class="chart-pie-wrap" style="display:flex;gap:1.5rem;align-items:center;flex-wrap:wrap;"><svg viewBox="0 0 180 180" style="width:160px;height:160px;flex-shrink:0;">${sliceHtml}</svg><div style="display:flex;flex-direction:column;gap:0.4rem;min-width:0;">${legendItems}</div></div>`;
    } else {
      const dv2: number[] = [35, 25, 20, 12, 8];
      const dt: number = dv2.reduce((a: number, b: number) => a + b, 0);
      let sa = -Math.PI / 2;
      const skelPie: string = dv2.map((v: number, i: number) => {
        const a = (v / dt) * 2 * Math.PI;
        const x1 = cx + r * Math.cos(sa), y1 = cy + r * Math.sin(sa);
        sa += a;
        const x2 = cx + r * Math.cos(sa), y2 = cy + r * Math.sin(sa);
        const la = a > Math.PI ? 1 : 0;
        return `<path d="M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${la} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="${colors[i % colors.length]}" opacity="0.4" stroke="var(--color-surface)" stroke-width="1.5"/>`;
      }).join('');
      visualHtml = `<div class="chart-sql-preview">${sqlBadge}<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;"><svg viewBox="0 0 180 180" style="width:130px;height:130px;flex-shrink:0;opacity:0.5;">${skelPie}</svg><p style="font-size:0.8rem;color:var(--color-text-muted);">Categoria: <code>${escapeHtml(xKey)}</code> &middot; Valor: <code>${yKeys.map((k: string) => escapeHtml(k)).join(', ')}</code></p></div></div>`;
    }
  } else {
    visualHtml = `<div class="chart-generic-preview"><p style="font-size:0.85rem;color:var(--color-text-muted);margin-bottom:0.5rem;">Grafico <strong>${escapeHtml(chartType)}</strong> &mdash; Eje X: <code>${escapeHtml(xKey)}</code> &rarr; <code>${yKeys.map((k: string) => escapeHtml(k)).join(', ')}</code></p></div>`;
  }

  const copyIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
  const checkIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

  return `<div class="chart-card card" id="${chartId}" style="margin:1.5rem 0;padding:1.25rem;border:1px solid var(--color-border);background-color:var(--color-surface);border-radius:var(--radius-md);">
  <div class="chart-header" style="margin-bottom:0.85rem;">
    <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:0.5rem;">
      <h3 style="font-size:1.15rem;margin-bottom:0.2rem;font-family:var(--font-serif);">${title}</h3>
      <span style="font-size:0.725rem;font-family:var(--font-mono);color:var(--color-primary);font-weight:600;">${unit ? `${unit} &bull; ` : ''}${source}</span>
    </div>
    ${subtitle ? `<p style="font-size:0.85rem;color:var(--color-text-muted);margin-bottom:0.5rem;line-height:1.4;">${subtitle}</p>` : ''}
    <div style="display:flex;gap:0.4rem;margin-top:0.65rem;flex-wrap:wrap;align-items:center;">
      <div class="chart-view-toggle" style="display:flex;gap:0.4rem;">
        <button type="button" class="chart-toggle-btn active btn btn-secondary btn-sm" data-target="vis" style="font-size:0.75rem;padding:0.2rem 0.55rem;">Visualizacion</button>
        <button type="button" class="chart-toggle-btn btn btn-secondary btn-sm" data-target="sql" style="font-size:0.75rem;padding:0.2rem 0.55rem;">Consulta SQL &amp; Config</button>
      </div>
      <button type="button" class="chart-copy-btn btn btn-secondary btn-sm" data-chart-id="${chartId}" aria-label="Copiar configuracion al portapapeles" title="Copiar JSON al portapapeles" style="margin-left:auto;font-size:0.75rem;padding:0.2rem 0.55rem;display:flex;align-items:center;gap:0.3rem;">
        <span class="chart-copy-icon">${copyIcon}</span>
        <span class="chart-copy-check" style="display:none;">${checkIcon}</span>
        <span class="chart-copy-label">Copiar</span>
      </button>
    </div>
  </div>
  <div class="chart-body-view" data-view="vis">${visualHtml}</div>
  <div class="chart-body-view" data-view="sql" style="display:none;">
    ${rawSql ? `<div style="margin-bottom:0.75rem;"><div style="margin-bottom:0.35rem;"><span style="font-size:0.75rem;font-family:var(--font-mono);color:var(--color-text-muted);">SQL Analitico:</span></div><pre class="code-pre" style="margin:0;padding:0.75rem;"><code class="language-sql">${sql}</code></pre></div>` : ''}
    <pre class="code-pre" style="margin:0;max-height:180px;overflow-y:auto;"><code class="language-json">${escapedCode}</code></pre>
  </div>
</div>`;
}


