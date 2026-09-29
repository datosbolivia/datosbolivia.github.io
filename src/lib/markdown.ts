/**
 * Renderizador de Markdown Robusto y Seguro para DataMesh Bolivia
 * Maneja encabezados, tablas, listas, citas, bloques de código,
 * enlaces externos en nueva ventana y enlaces relativos a subdocumentos de dataset.
 */

export interface RenderMarkdownOptions {
  datasetSlug?: string;
  currentDocPath?: string;
}

export function renderMarkdown(content: string, options: RenderMarkdownOptions = {}): string {
  if (!content) return '';

  const { datasetSlug = '' } = options;

  // 1. Extraer bloques de código para evitar que se procese su interior
  const codeBlocks: string[] = [];
  let processed = content.replace(/```([a-zA-Z0-9_]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    const escapedCode = escapeHtml(code.trim());
    if (lang === 'chart') {
      codeBlocks.push(
        `<div class="chart-container card" style="margin: 1.5rem 0; padding: 1rem; background-color: var(--color-surface); border: 1px solid var(--color-primary);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <strong style="font-size:0.85rem; color:var(--color-primary); font-family:var(--font-mono);">Configuración de Gráfico Declarativo</strong>
            <span style="font-size:0.75rem; font-family:var(--font-mono); color:var(--color-text-muted);">JSON</span>
          </div>
          <pre style="margin:0; max-height:260px; overflow-y:auto;"><code class="language-json">${escapedCode}</code></pre>
        </div>`
      );
    } else {
      codeBlocks.push(
        `<pre style="margin: 1rem 0;"><code class="language-${lang || 'text'}">${escapedCode}</code></pre>`
      );
    }
    return placeholder;
  });

  // 2. Extraer bloques de tablas Markdown
  const tableBlocks: string[] = [];
  processed = processed.replace(
    /((?:(?:\|[^\n]+\|)\r?\n)+)/g,
    (match) => {
      const lines = match.trim().split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) return match;

      // Verificar si la segunda línea es un separador |---|---|
      const isSeparator = /^\|(?:\s*:?-+:?\s*\|)+$/.test(lines[1]);
      if (!isSeparator) return match;

      const placeholder = `__TABLE_BLOCK_${tableBlocks.length}__`;
      
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

  // 4. Restaurar tablas
  for (let idx = 0; idx < tableBlocks.length; idx++) {
    finalHtml = finalHtml.replace(`__TABLE_BLOCK_${idx}__`, tableBlocks[idx]);
  }

  // 5. Restaurar bloques de código
  for (let idx = 0; idx < codeBlocks.length; idx++) {
    finalHtml = finalHtml.replace(`__CODE_BLOCK_${idx}__`, codeBlocks[idx]);
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

    // 1. Enlace externo (http / https) -> Abrir en ventana nueva
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return `<a href="${trimmedUrl}" target="_blank" rel="noopener noreferrer" class="external-link" title="Abrir enlace externo en nueva pestaña">${label} <svg style="display:inline-block; vertical-align:middle;" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>`;
    }

    // 2. Anclas en la misma página (#...)
    if (trimmedUrl.startsWith('#')) {
      return `<a href="${trimmedUrl}">${label}</a>`;
    }

    // 3. Enlace relativo a archivo Markdown del dataset (concepts/..., knowledge/..., etc.)
    if (trimmedUrl.endsWith('.md')) {
      const cleanPath = trimmedUrl.replace(/^\.\//, '').replace(/\.md$/, '');
      if (datasetSlug) {
        // Enlaza al visor de documento dentro del dataset o tab interno
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
