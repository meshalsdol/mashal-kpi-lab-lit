const formatNumber = new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 2 });
const formatPercent = new Intl.NumberFormat('ar-SA', { style: 'percent', maximumFractionDigits: 2 });

export function parseValue(text) {
  const normalized = text.trim()
    .replace(/[٠-٩]/g, digit => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit))
    .replace(/[۰-۹]/g, digit => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))
    .replace(/٫/g, '.')
    .replace(/−/g, '-');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function measure(target, actual, direction) {
  if (target === null || actual === null) return null;
  const gap = direction === 'lower' ? target - actual : actual - target;
  const ratio = target === 0 ? null : 1 + gap / Math.abs(target);
  return {
    achieved: direction === 'lower' ? actual <= target : actual >= target,
    gap: Number.isFinite(gap) ? gap : null,
    ratio: Number.isFinite(ratio) ? ratio : null,
  };
}

if (typeof document !== 'undefined') {
  const form = document.querySelector('#kpi-form');
  const target = form.elements.namedItem('target');
  const actual = form.elements.namedItem('actual');
  const direction = form.elements.namedItem('direction');
  const rate = document.querySelector('#rate');
  const status = document.querySelector('#status');
  const gapLabel = document.querySelector('#gap');
  const fill = document.querySelector('#fill');

  function update() {
    const targetValue = parseValue(target.value);
    const actualValue = parseValue(actual.value);
    target.setAttribute('aria-invalid', String(Boolean(target.value.trim()) && targetValue === null));
    actual.setAttribute('aria-invalid', String(Boolean(actual.value.trim()) && actualValue === null));
    const result = measure(targetValue, actualValue, direction.value);
    rate.textContent = result?.ratio == null ? '—' : formatPercent.format(result.ratio);
    fill.style.width = result?.ratio == null ? '0%' : Math.max(0, Math.min(100, result.ratio * 80)) + '%';
    gapLabel.textContent = '';
    if (!result) {
      status.textContent = 'أدخل قيمتين رقميتين لحساب الإنجاز.';
      return;
    }
    status.textContent = result.achieved ? 'تحقق المستهدف' : 'دون المستهدف';
    if (targetValue === 0) {
      gapLabel.textContent = 'نسبة الإنجاز غير معرّفة عندما يكون المستهدف صفرًا.';
    } else if (result.gap !== null) {
      gapLabel.textContent = 'الفجوة الموجهة ' + formatNumber.format(result.gap);
    }
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', event => event.preventDefault());
  document.querySelector('#load-example').addEventListener('click', () => {
    target.value = '95';
    actual.value = '87';
    direction.value = 'higher';
    update();
    target.focus();
  });
  update();
}
