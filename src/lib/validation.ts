import type {
  Driver,
  Shipment,
  ValidationError,
} from '@/types/domain';
import { isSunday } from '@/lib/date';
import { parseTonsInput, roundToStep } from '@/lib/units';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_RE = /^\+7\d{10}$/;

export function validateShipment(s: Shipment): ValidationError[] {
  const errors: ValidationError[] = [];

  if (s.items.length < 1) {
    errors.push({ field: 'items', message: 'Нужна минимум одна позиция', code: 'I1' });
  }

  s.items.forEach((it, idx) => {
    if (!it.rawId) {
      errors.push({ field: `items[${idx}].rawId`, message: 'Выберите сырьё' });
    }
    if (!Number.isInteger(it.kg) || it.kg <= 0) {
      errors.push({
        field: `items[${idx}].kg`,
        message: 'Введите вес > 0',
        code: 'I3',
      });
    }
    if (!it.supplierId) {
      errors.push({
        field: `items[${idx}].supplierId`,
        message: 'Выберите поставщика',
      });
    }
  });

  if (!s.shipDate || !ISO_DATE_RE.test(s.shipDate)) {
    errors.push({ field: 'shipDate', message: 'Укажите дату отгрузки' });
  }
  if (!s.arrDate || !ISO_DATE_RE.test(s.arrDate)) {
    errors.push({ field: 'arrDate', message: 'Укажите дату поступления' });
  }
  if (
    ISO_DATE_RE.test(s.shipDate) &&
    ISO_DATE_RE.test(s.arrDate) &&
    s.arrDate < s.shipDate
  ) {
    errors.push({
      field: 'arrDate',
      message: 'Дата поступления должна быть ≥ даты отгрузки',
      code: 'I2',
    });
  }
  if (ISO_DATE_RE.test(s.arrDate) && isSunday(s.arrDate)) {
    errors.push({
      field: 'arrDate',
      message: 'Воскресенье — нерабочий день. Выберите ПН–СБ',
      code: 'I21',
    });
  }

  if (!s.driverId) {
    errors.push({ field: 'driverId', message: 'Выберите водителя', code: 'I4' });
  }

  if (s.comment.length > 200) {
    errors.push({ field: 'comment', message: 'Не более 200 символов' });
  }

  return errors;
}

export function validateDriver(d: Driver): ValidationError[] {
  const errors: ValidationError[] = [];

  if (d.fio.trim().length < 2) {
    errors.push({ field: 'fio', message: 'ФИО минимум 2 символа', code: 'I14' });
  }
  if (!PHONE_RE.test(d.phone)) {
    errors.push({
      field: 'phone',
      message: 'Телефон должен быть в формате +7XXXXXXXXXX',
      code: 'I13',
    });
  }
  if (!d.tkId) {
    errors.push({ field: 'tkId', message: 'Выберите ТК' });
  }
  if (d.info.length > 500) {
    errors.push({ field: 'info', message: 'Не более 500 символов' });
  }

  return errors;
}

export function validatePlanInput(
  t: string | number,
): { value: number } | { error: string } {
  const parsed = typeof t === 'number' ? t : parseTonsInput(t);
  if (parsed === null || !Number.isFinite(parsed)) {
    return { error: 'Введите число' };
  }
  if (parsed < 0) {
    return { error: 'План не может быть отрицательным' };
  }
  return { value: roundToStep(parsed, 0.1) };
}
