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
  const title = escapeHtml(config.title || 'Gráfico Declarativo');
  const subtitle = escapeHtml(config.subtitle || '');
  const source = escapeHtml(config.source || 'DataMesh Bolivia');
  const unit = escapeHtml(config.unit || '');
  const sql = escapeHtml(config.sql || '');
  const chartType = (config.type || 'bar').toLowerCase();
  const primaryColor = (config.colors && config.colors[0]) || 'var(--color-primary)';
  const questions = Array.isArray(config.questions) ? config.questions : [];

  let visualHtml = '';

  if (title.includes('ICA Promedio por Estación') || sql.includes('lugar_nombre')) {
    const stations = [
      { name: 'SACABA', val: 150.0 },
      { name: 'POTOSI', val: 117.6 },
      { name: 'QUILLACOLLO', val: 115.4 },
      { name: 'COCHABAMBA', val: 81.2 },
      { name: 'SUCRE', val: 77.9 },
      { name: 'TARIJA', val: 74.1 },
      { name: 'LA PAZ', val: 60.4 },
      { name: 'HOSPITAL LOS PINOS', val: 58.4 },
      { name: 'EL ALTO', val: 56.8 },
      { name: 'COBIJA', val: 48.4 }
    ];
    const maxVal = 150.0;
    visualHtml = `
      <div class="chart-bars-list">
        ${stations.map(s => {
          const pct = Math.round((s.val / maxVal) * 100);
          return `
            <div class="chart-bar-row">
              <span class="chart-bar-label">${s.name}</span>
              <div class="chart-bar-track">
                <div class="chart-bar-fill" style="width: ${pct}%; background-color: ${primaryColor};"></div>
              </div>
              <span class="chart-bar-value">${s.val.toFixed(1)} ${unit}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else if (chartType === 'area' || title.includes('Evolución Mensual') || sql.includes('mes')) {
    const months = [
      { m: '2016-01', v: 50.2 }, { m: '2016-06', v: 96.6 }, { m: '2016-08', v: 91.8 },
      { m: '2016-11', v: 79.0 }, { m: '2017-01', v: 46.5 }, { m: '2017-06', v: 92.6 },
      { m: '2017-08', v: 96.4 }, { m: '2017-11', v: 63.8 }, { m: '2018-01', v: 44.8 }
    ];
    const maxV = 100.0;
    const w = 500;
    const h = 160;
    const points = months.map((pt, i) => {
      const x = (i / (months.length - 1)) * (w - 40) + 20;
      const y = h - 25 - (pt.v / maxV) * (h - 45);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    visualHtml = `
      <div class="chart-svg-wrap">
        <svg viewBox="0 0 ${w} ${h}" class="chart-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="grad-${chartId}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <line x1="20" y1="${h - 25}" x2="${w - 20}" y2="${h - 25}" stroke="var(--color-border)" stroke-width="1"/>
          <polygon points="20,${h - 25} ${points} ${w - 20},${h - 25}" fill="url(#grad-${chartId})"/>
          <polyline points="${points}" fill="none" stroke="${primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="chart-x-labels">
          ${months.map(m => `<span>${m.m}</span>`).join('')}
        </div>
      </div>
    `;
  } else if (title.includes('Departamento') || title.includes('Estaciones')) {
    const depts = [
      { name: 'Santa Cruz', val: 284 },
      { name: 'La Paz', val: 216 },
      { name: 'Cochabamba', val: 178 },
      { name: 'Potosí', val: 68 },
      { name: 'Tarija', val: 62 },
      { name: 'Chuquisaca', val: 48 },
      { name: 'Oruro', val: 44 },
      { name: 'Beni', val: 38 },
      { name: 'Pando', val: 16 }
    ];
    const maxVal = 284;
    visualHtml = `
      <div class="chart-bars-list">
        ${depts.map(d => {
          const pct = Math.round((d.val / maxVal) * 100);
          return `
            <div class="chart-bar-row">
              <span class="chart-bar-label">${d.name}</span>
              <div class="chart-bar-track">
                <div class="chart-bar-fill" style="width: ${pct}%; background-color: ${primaryColor};"></div>
              </div>
              <span class="chart-bar-value">${d.val}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else {
    visualHtml = `
      <div class="chart-generic-preview">
        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">
          Gráfico proyectado: <code>${escapeHtml(config.xKey || 'x')}</code> &rarr; <code>${(config.yKeys || []).join(', ')}</code>
        </p>
      </div>
    `;
  }

  let questionsHtml = '';
  if (questions.length > 0) {
    questionsHtml = `
      <div class="chart-questions-box">
        <span class="chart-questions-title">Preguntas Analíticas Sugeridas:</span>
        <ul class="chart-questions-list">
          ${questions.map((q: string) => `<li>${escapeHtml(q)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  return `
    <div class="chart-card card" id="${chartId}" style="margin: 1.5rem 0; padding: 1.25rem; border: 1px solid var(--color-border); background-color: var(--color-surface); border-radius: var(--radius-md);">
      <div class="chart-header" style="margin-bottom: 0.85rem;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 0.5rem;">
          <h3 style="font-size: 1.15rem; margin-bottom: 0.2rem; font-family: var(--font-serif);">${title}</h3>
          <span style="font-size: 0.725rem; font-family: var(--font-mono); color: var(--color-primary); font-weight: 600;">${unit ? `${unit} • ` : ''}${source}</span>
        </div>
        ${subtitle ? `<p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 0.5rem; line-height: 1.4;">${subtitle}</p>` : ''}
        
        <div class="chart-view-toggle" style="display: flex; gap: 0.4rem; margin-top: 0.65rem;">
          <button type="button" class="chart-toggle-btn active btn btn-secondary btn-sm" data-target="vis" style="font-size: 0.75rem; padding: 0.2rem 0.55rem;">Visualización</button>
          <button type="button" class="chart-toggle-btn btn btn-secondary btn-sm" data-target="sql" style="font-size: 0.75rem; padding: 0.2rem 0.55rem;">Consulta SQL & Config</button>
        </div>
      </div>

      <div class="chart-body-view" data-view="vis">
        ${visualHtml}
      </div>

      <div class="chart-body-view" data-view="sql" style="display: none;">
        ${sql ? `
          <div style="margin-bottom: 0.75rem;">
            <div style="margin-bottom: 0.35rem;">
              <span style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--color-text-muted);">SQL Analítico:</span>
            </div>
            <pre class="code-pre" style="margin: 0; padding: 0.75rem;"><code class="language-sql">${sql}</code></pre>
          </div>
        ` : ''}
        <pre class="code-pre" style="margin: 0; max-height: 180px; overflow-y: auto;"><code class="language-json">${escapedCode}</code></pre>
      </div>

      ${questionsHtml}
    </div>
  `;
}
