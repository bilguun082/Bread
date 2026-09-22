import { ReceiptData } from '@/types';
import { formatTugrik } from './currencyFormatter';

/**
 * 58mm цаасанд зориулсан мөрийн урт (ихэнх 58мм принтер 32 тэмдэгттэй байдаг)
 */
const LINE_WIDTH = 32;

/**
 * Баруун ба зүүн тийш тэгшилсэн мөр үүсгэх (жишээ: "Дүн:                 65,000₮")
 */
function formatTwoColumns(left: string, right: string, width = LINE_WIDTH): string {
  const spaceNeeded = width - (left.length + right.length);
  if (spaceNeeded <= 0) {
    return left + ' ' + right;
  }
  return left + ' '.repeat(spaceNeeded) + right;
}

/**
 * Төвд байрлуулсан гарчиг үүсгэх
 */
function formatCentered(text: string, width = LINE_WIDTH): string {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(padding) + text;
}

/**
 * 58mm жижиг кассын чект зориулсан текстийг бүтээнэ.
 */
export function generateReceiptPlainText(data: ReceiptData): string {
  const lineDivider = '='.repeat(LINE_WIDTH);
  const subDivider = '-'.repeat(LINE_WIDTH);

  const lines: string[] = [
    lineDivider,
    formatCentered('GARYN SAIN TALKH'),
    formatCentered('(KHORONGO TALKH KHURGELT)'),
    lineDivider,
    `Ognoo:  ${data.dateTime}`,
    `Delguur: ${data.storeName}`,
    ...(data.storeAddress ? [`Hayag:   ${data.storeAddress}`] : []),
    subDivider,
    'BARAA          OGS  BUC      DUN',
    subDivider,
  ];

  for (const item of data.items) {
    // Жишээ: "1-r guril      10    1  40,500T"
    const nameShort = item.name.substring(0, 13).padEnd(13, ' ');
    const ogsStr = String(item.delivered).padStart(3, ' ');
    const bucStr = String(item.returned).padStart(3, ' ');
    const dunStr = formatTugrik(item.lineTotal).replace('₮', 'T').padStart(9, ' ');
    lines.push(`${nameShort}${ogsStr} ${bucStr} ${dunStr}`);
  }

  lines.push(subDivider);
  lines.push(formatTwoColumns('Shine hurgelt:', formatTugrik(data.subtotalAmount).replace('₮', 'T')));
  if (data.returnAmount > 0) {
    lines.push(formatTwoColumns('Butsaalt hasalt:', `-${formatTugrik(data.returnAmount).replace('₮', 'T')}`));
  }
  lines.push(formatTwoColumns('Onoodor tulukh:', formatTugrik(data.todayDue).replace('₮', 'T')));
  lines.push(formatTwoColumns('Omnokh uldegdel:', formatTugrik(data.prevBalance).replace('₮', 'T')));
  lines.push(lineDivider);
  lines.push(formatTwoColumns('NIIT TULBUR:', formatTugrik(data.totalPayable).replace('₮', 'T')));
  lines.push(subDivider);
  lines.push('Tulsun:');
  lines.push(formatTwoColumns('  - Belneer:', formatTugrik(data.paidCash).replace('₮', 'T')));
  lines.push(formatTwoColumns('  - Dansaar:', formatTugrik(data.paidTransfer).replace('₮', 'T')));
  lines.push(lineDivider);
  lines.push(formatTwoColumns('ULDEGDEL UR:', formatTugrik(data.newBalance).replace('₮', 'T')));
  lines.push(lineDivider);
  lines.push('');
  lines.push('Khuleelgen ogson: .............');
  lines.push('Khuleen avsan:    .............');
  lines.push('');
  lines.push(formatCentered('Bayarlalaa!'))
  lines.push('\n\n\n'); // Цаас татах зайн төгсгөл

  return lines.join('\n');
}

/**
 * ESC/POS комманд бүхий Uint8Array үүсгэх (Bluetooth принтер рүү илгээхэд)
 */
export function generateEscPosBuffer(plainText: string): Uint8Array {
  // ESC @ : Initialize printer
  const init = [0x1b, 0x40];
  // Convert text to bytes
  const textBytes: number[] = [];
  for (let i = 0; i < plainText.length; i++) {
    const code = plainText.charCodeAt(i);
    textBytes.push(code < 128 ? code : 63); // ASCII or '?'
  }
  // Feed 3 lines & Partial cut (GS V 66 0)
  const cut = [0x1b, 0x64, 0x03, 0x1d, 0x56, 0x42, 0x00];

  return new Uint8Array([...init, ...textBytes, ...cut]);
}
