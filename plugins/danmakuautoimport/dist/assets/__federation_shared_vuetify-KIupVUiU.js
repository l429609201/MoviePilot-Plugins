import { importShared } from './__federation_fn_import-DDSy82QP.js';
import { p as padStart, c as consoleWarn, a as createRange, u as useLocale, m as mergeDeep, I as IN_BROWSER, i as isObject, b as createDefaults, d as createDisplay, e as createTheme, f as createIcons, g as createLocale, h as createGoTo, j as defineComponent, D as DefaultsSymbol, k as DisplaySymbol, T as ThemeSymbol, l as IconSymbol, L as LocaleSymbol, G as GoToSymbol } from './theme-DTes7M_Y.js';
export { n as useDefaults, o as useDisplay, q as useGoTo, r as useRtl, s as useTheme } from './theme-DTes7M_Y.js';

// Utilities
function weekInfo(locale) {
  // https://simplelocalize.io/data/locales/
  // then `new Intl.Locale(...).getWeekInfo()`
  const code = locale.slice(-2).toUpperCase();
  switch (true) {
    case locale === 'GB-alt-variant':
      {
        return {
          firstDay: 0,
          firstWeekSize: 4
        };
      }
    case locale === '001':
      {
        return {
          firstDay: 1,
          firstWeekSize: 1
        };
      }
    case `AG AS BD BR BS BT BW BZ CA CO DM DO ET GT GU HK HN ID IL IN JM JP KE
    KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PY SA SG SV TH TT TW UM US
    VE VI WS YE ZA ZW`.includes(code):
      {
        return {
          firstDay: 0,
          firstWeekSize: 1
        };
      }
    case `AI AL AM AR AU AZ BA BM BN BY CL CM CN CR CY EC GE HR KG KZ LB LK LV
    MD ME MK MN MY NZ RO RS SI TJ TM TR UA UY UZ VN XK`.includes(code):
      {
        return {
          firstDay: 1,
          firstWeekSize: 1
        };
      }
    case `AD AN AT AX BE BG CH CZ DE DK EE ES FI FJ FO FR GB GF GP GR HU IE IS
    IT LI LT LU MC MQ NL NO PL RE RU SE SK SM VA`.includes(code):
      {
        return {
          firstDay: 1,
          firstWeekSize: 4
        };
      }
    case `AE AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY`.includes(code):
      {
        return {
          firstDay: 6,
          firstWeekSize: 1
        };
      }
    case code === 'MV':
      {
        return {
          firstDay: 5,
          firstWeekSize: 1
        };
      }
    case code === 'PT':
      {
        return {
          firstDay: 0,
          firstWeekSize: 4
        };
      }
    default:
      return null;
  }
}
function getWeekArray(date, locale, firstDayOfWeek) {
  const weeks = [];
  let currentWeek = [];
  const firstDayOfMonth = startOfMonth(date);
  const lastDayOfMonth = endOfMonth(date);
  const first = firstDayOfWeek ?? weekInfo(locale)?.firstDay ?? 0;
  const firstDayWeekIndex = (firstDayOfMonth.getDay() - first + 7) % 7;
  const lastDayWeekIndex = (lastDayOfMonth.getDay() - first + 7) % 7;
  for (let i = 0; i < firstDayWeekIndex; i++) {
    const adjacentDay = new Date(firstDayOfMonth);
    adjacentDay.setDate(adjacentDay.getDate() - (firstDayWeekIndex - i));
    currentWeek.push(adjacentDay);
  }
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const day = new Date(date.getFullYear(), date.getMonth(), i);

    // Add the day to the current week
    currentWeek.push(day);

    // If the current week has 7 days, add it to the weeks array and start a new week
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  for (let i = 1; i < 7 - lastDayWeekIndex; i++) {
    const adjacentDay = new Date(lastDayOfMonth);
    adjacentDay.setDate(adjacentDay.getDate() + i);
    currentWeek.push(adjacentDay);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }
  return weeks;
}
function startOfWeek(date, locale, firstDayOfWeek) {
  let day = (firstDayOfWeek ?? weekInfo(locale)?.firstDay ?? 0) % 7;

  // prevent infinite loop
  if (![0, 1, 2, 3, 4, 5, 6].includes(day)) {
    consoleWarn('Invalid firstDayOfWeek, expected discrete number in range [0-6]');
    day = 0;
  }
  const d = new Date(date);
  while (d.getDay() !== day) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}
function endOfWeek(date, locale) {
  const d = new Date(date);
  const lastDay = ((weekInfo(locale)?.firstDay ?? 0) + 6) % 7;
  while (d.getDay() !== lastDay) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}
function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function parseLocalDate(value) {
  const parts = value.split('-').map(Number);

  // new Date() uses local time zone when passing individual date component values
  return new Date(parts[0], parts[1] - 1, parts[2]);
}
const _YYYMMDD = /^([12]\d{3}-([1-9]|0[1-9]|1[0-2])-([1-9]|0[1-9]|[12]\d|3[01]))$/;
function date(value) {
  if (value == null) return new Date();
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    let parsed;
    if (_YYYMMDD.test(value)) {
      return parseLocalDate(value);
    } else {
      parsed = Date.parse(value);
    }
    if (!isNaN(parsed)) return new Date(parsed);
  }
  return null;
}
const sundayJanuarySecond2000 = new Date(2000, 0, 2);
function getWeekdays(locale, firstDayOfWeek, weekdayFormat) {
  const daysFromSunday = firstDayOfWeek ?? weekInfo(locale)?.firstDay ?? 0;
  return createRange(7).map(i => {
    const weekday = new Date(sundayJanuarySecond2000);
    weekday.setDate(sundayJanuarySecond2000.getDate() + daysFromSunday + i);
    return new Intl.DateTimeFormat(locale, {
      weekday: weekdayFormat ?? 'narrow'
    }).format(weekday);
  });
}
function format(value, formatString, locale, formats) {
  const newDate = date(value) ?? new Date();
  const customFormat = formats?.[formatString];
  if (typeof customFormat === 'function') {
    return customFormat(newDate, formatString, locale);
  }
  let options = {};
  switch (formatString) {
    case 'fullDate':
      options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      break;
    case 'fullDateWithWeekday':
      options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      break;
    case 'normalDate':
      const day = newDate.getDate();
      const month = new Intl.DateTimeFormat(locale, {
        month: 'long'
      }).format(newDate);
      return `${day} ${month}`;
    case 'normalDateWithWeekday':
      options = {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      };
      break;
    case 'shortDate':
      options = {
        month: 'short',
        day: 'numeric'
      };
      break;
    case 'year':
      options = {
        year: 'numeric'
      };
      break;
    case 'month':
      options = {
        month: 'long'
      };
      break;
    case 'monthShort':
      options = {
        month: 'short'
      };
      break;
    case 'monthAndYear':
      options = {
        month: 'long',
        year: 'numeric'
      };
      break;
    case 'monthAndDate':
      options = {
        month: 'long',
        day: 'numeric'
      };
      break;
    case 'weekday':
      options = {
        weekday: 'long'
      };
      break;
    case 'weekdayShort':
      options = {
        weekday: 'short'
      };
      break;
    case 'dayOfMonth':
      return new Intl.NumberFormat(locale).format(newDate.getDate());
    case 'hours12h':
      options = {
        hour: 'numeric',
        hour12: true
      };
      break;
    case 'hours24h':
      options = {
        hour: 'numeric',
        hour12: false
      };
      break;
    case 'minutes':
      options = {
        minute: 'numeric'
      };
      break;
    case 'seconds':
      options = {
        second: 'numeric'
      };
      break;
    case 'fullTime':
      options = {
        hour: 'numeric',
        minute: 'numeric'
      };
      break;
    case 'fullTime12h':
      options = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      };
      break;
    case 'fullTime24h':
      options = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      };
      break;
    case 'fullDateTime':
      options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      };
      break;
    case 'fullDateTime12h':
      options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      };
      break;
    case 'fullDateTime24h':
      options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      };
      break;
    case 'keyboardDate':
      options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };
      break;
    case 'keyboardDateTime':
      options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric'
      };
      return new Intl.DateTimeFormat(locale, options).format(newDate).replace(/, /g, ' ');
    case 'keyboardDateTime12h':
      options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      };
      return new Intl.DateTimeFormat(locale, options).format(newDate).replace(/, /g, ' ');
    case 'keyboardDateTime24h':
      options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      };
      return new Intl.DateTimeFormat(locale, options).format(newDate).replace(/, /g, ' ');
    default:
      options = customFormat ?? {
        timeZone: 'UTC',
        timeZoneName: 'short'
      };
  }
  return new Intl.DateTimeFormat(locale, options).format(newDate);
}
function toISO(adapter, value) {
  const date = adapter.toJsDate(value);
  const year = date.getFullYear();
  const month = padStart(String(date.getMonth() + 1), 2, '0');
  const day = padStart(String(date.getDate()), 2, '0');
  return `${year}-${month}-${day}`;
}
function parseISO(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}
function addMinutes(date, amount) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + amount);
  return d;
}
function addHours(date, amount) {
  const d = new Date(date);
  d.setHours(d.getHours() + amount);
  return d;
}
function addDays(date, amount) {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}
function addWeeks(date, amount) {
  const d = new Date(date);
  d.setDate(d.getDate() + amount * 7);
  return d;
}
function addMonths(date, amount) {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() + amount);
  return d;
}
function getYear(date) {
  return date.getFullYear();
}
function getMonth(date) {
  return date.getMonth();
}
function getWeek(date, locale, firstDayOfWeek, firstDayOfYear) {
  const weekInfoFromLocale = weekInfo(locale);
  const weekStart = firstDayOfWeek ?? weekInfoFromLocale?.firstDay ?? 0;
  const minWeekSize = weekInfoFromLocale?.firstWeekSize ?? 1;
  return firstDayOfYear !== undefined ? calculateWeekWithFirstDayOfYear(date, locale, weekStart, firstDayOfYear) : calculateWeekWithMinWeekSize(date, locale, weekStart, minWeekSize);
}
function calculateWeekWithFirstDayOfYear(date, locale, weekStart, firstDayOfYear) {
  const firstDayOfYearOffset = (7 + firstDayOfYear - weekStart) % 7;
  const currentWeekStart = startOfWeek(date, locale, weekStart);
  const currentWeekEnd = addDays(currentWeekStart, 6);
  function yearStartWeekdayOffset(year) {
    return (7 + new Date(year, 0, 1).getDay() - weekStart) % 7;
  }
  let year = getYear(date);
  if (year < getYear(currentWeekEnd) && yearStartWeekdayOffset(year + 1) <= firstDayOfYearOffset) {
    year++;
  }
  const yearStart = new Date(year, 0, 1);
  const offset = yearStartWeekdayOffset(year);
  const d1w1 = offset <= firstDayOfYearOffset ? addDays(yearStart, -offset) : addDays(yearStart, 7 - offset);
  return 1 + getDiff(endOfDay(date), startOfDay(d1w1), 'weeks');
}
function calculateWeekWithMinWeekSize(date, locale, weekStart, minWeekSize) {
  const currentWeekEnd = addDays(startOfWeek(date, locale, weekStart), 6);
  function firstWeekSize(year) {
    const yearStart = new Date(year, 0, 1);
    return 7 - getDiff(yearStart, startOfWeek(yearStart, locale, weekStart), 'days');
  }
  let year = getYear(date);
  if (year < getYear(currentWeekEnd) && firstWeekSize(year + 1) >= minWeekSize) {
    year++;
  }
  const yearStart = new Date(year, 0, 1);
  const size = firstWeekSize(year);
  const d1w1 = size >= minWeekSize ? addDays(yearStart, size - 7) : addDays(yearStart, size);
  return 1 + getDiff(endOfDay(date), startOfDay(d1w1), 'weeks');
}
function getDate(date) {
  return date.getDate();
}
function getNextMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}
function getPreviousMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}
function getHours(date) {
  return date.getHours();
}
function getMinutes(date) {
  return date.getMinutes();
}
function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1);
}
function endOfYear(date) {
  return new Date(date.getFullYear(), 11, 31);
}
function isWithinRange(date, range) {
  return isAfter(date, range[0]) && isBefore(date, range[1]);
}
function isValid(date) {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}
function isAfter(date, comparing) {
  return date.getTime() > comparing.getTime();
}
function isAfterDay(date, comparing) {
  return isAfter(startOfDay(date), startOfDay(comparing));
}
function isBefore(date, comparing) {
  return date.getTime() < comparing.getTime();
}
function isEqual(date, comparing) {
  return date.getTime() === comparing.getTime();
}
function isSameDay(date, comparing) {
  return date.getDate() === comparing.getDate() && date.getMonth() === comparing.getMonth() && date.getFullYear() === comparing.getFullYear();
}
function isSameMonth(date, comparing) {
  return date.getMonth() === comparing.getMonth() && date.getFullYear() === comparing.getFullYear();
}
function isSameYear(date, comparing) {
  return date.getFullYear() === comparing.getFullYear();
}
function getDiff(date, comparing, unit) {
  const d = new Date(date);
  const c = new Date(comparing);
  switch (unit) {
    case 'years':
      return d.getFullYear() - c.getFullYear();
    case 'quarters':
      return Math.floor((d.getMonth() - c.getMonth() + (d.getFullYear() - c.getFullYear()) * 12) / 4);
    case 'months':
      return d.getMonth() - c.getMonth() + (d.getFullYear() - c.getFullYear()) * 12;
    case 'weeks':
      return Math.floor((d.getTime() - c.getTime()) / (1000 * 60 * 60 * 24 * 7));
    case 'days':
      return Math.floor((d.getTime() - c.getTime()) / (1000 * 60 * 60 * 24));
    case 'hours':
      return Math.floor((d.getTime() - c.getTime()) / (1000 * 60 * 60));
    case 'minutes':
      return Math.floor((d.getTime() - c.getTime()) / (1000 * 60));
    case 'seconds':
      return Math.floor((d.getTime() - c.getTime()) / 1000);
    default:
      {
        return d.getTime() - c.getTime();
      }
  }
}
function setHours(date, count) {
  const d = new Date(date);
  d.setHours(count);
  return d;
}
function setMinutes(date, count) {
  const d = new Date(date);
  d.setMinutes(count);
  return d;
}
function setMonth(date, count) {
  const d = new Date(date);
  d.setMonth(count);
  return d;
}
function setDate(date, day) {
  const d = new Date(date);
  d.setDate(day);
  return d;
}
function setYear(date, year) {
  const d = new Date(date);
  d.setFullYear(year);
  return d;
}
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}
function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}
class VuetifyDateAdapter {
  constructor(options) {
    this.locale = options.locale;
    this.formats = options.formats;
  }
  date(value) {
    return date(value);
  }
  toJsDate(date) {
    return date;
  }
  toISO(date) {
    return toISO(this, date);
  }
  parseISO(date) {
    return parseISO(date);
  }
  addMinutes(date, amount) {
    return addMinutes(date, amount);
  }
  addHours(date, amount) {
    return addHours(date, amount);
  }
  addDays(date, amount) {
    return addDays(date, amount);
  }
  addWeeks(date, amount) {
    return addWeeks(date, amount);
  }
  addMonths(date, amount) {
    return addMonths(date, amount);
  }
  getWeekArray(date, firstDayOfWeek) {
    const firstDay = firstDayOfWeek !== undefined ? Number(firstDayOfWeek) : undefined;
    return getWeekArray(date, this.locale, firstDay);
  }
  startOfWeek(date, firstDayOfWeek) {
    const firstDay = firstDayOfWeek !== undefined ? Number(firstDayOfWeek) : undefined;
    return startOfWeek(date, this.locale, firstDay);
  }
  endOfWeek(date) {
    return endOfWeek(date, this.locale);
  }
  startOfMonth(date) {
    return startOfMonth(date);
  }
  endOfMonth(date) {
    return endOfMonth(date);
  }
  format(date, formatString) {
    return format(date, formatString, this.locale, this.formats);
  }
  isEqual(date, comparing) {
    return isEqual(date, comparing);
  }
  isValid(date) {
    return isValid(date);
  }
  isWithinRange(date, range) {
    return isWithinRange(date, range);
  }
  isAfter(date, comparing) {
    return isAfter(date, comparing);
  }
  isAfterDay(date, comparing) {
    return isAfterDay(date, comparing);
  }
  isBefore(date, comparing) {
    return !isAfter(date, comparing) && !isEqual(date, comparing);
  }
  isSameDay(date, comparing) {
    return isSameDay(date, comparing);
  }
  isSameMonth(date, comparing) {
    return isSameMonth(date, comparing);
  }
  isSameYear(date, comparing) {
    return isSameYear(date, comparing);
  }
  setMinutes(date, count) {
    return setMinutes(date, count);
  }
  setHours(date, count) {
    return setHours(date, count);
  }
  setMonth(date, count) {
    return setMonth(date, count);
  }
  setDate(date, day) {
    return setDate(date, day);
  }
  setYear(date, year) {
    return setYear(date, year);
  }
  getDiff(date, comparing, unit) {
    return getDiff(date, comparing, unit);
  }
  getWeekdays(firstDayOfWeek, weekdayFormat) {
    const firstDay = firstDayOfWeek !== undefined ? Number(firstDayOfWeek) : undefined;
    return getWeekdays(this.locale, firstDay, weekdayFormat);
  }
  getYear(date) {
    return getYear(date);
  }
  getMonth(date) {
    return getMonth(date);
  }
  getWeek(date, firstDayOfWeek, firstDayOfYear) {
    const firstDay = firstDayOfWeek !== undefined ? Number(firstDayOfWeek) : undefined;
    const firstWeekStart = firstDayOfYear !== undefined ? Number(firstDayOfYear) : undefined;
    return getWeek(date, this.locale, firstDay, firstWeekStart);
  }
  getDate(date) {
    return getDate(date);
  }
  getNextMonth(date) {
    return getNextMonth(date);
  }
  getPreviousMonth(date) {
    return getPreviousMonth(date);
  }
  getHours(date) {
    return getHours(date);
  }
  getMinutes(date) {
    return getMinutes(date);
  }
  startOfDay(date) {
    return startOfDay(date);
  }
  endOfDay(date) {
    return endOfDay(date);
  }
  startOfYear(date) {
    return startOfYear(date);
  }
  endOfYear(date) {
    return endOfYear(date);
  }
}

const {inject: inject$2,reactive: reactive$2,watch: watch$1} = await importShared('vue');
const DateOptionsSymbol = Symbol.for('vuetify:date-options');
const DateAdapterSymbol = Symbol.for('vuetify:date-adapter');
function createDate(options, locale) {
  const _options = mergeDeep({
    adapter: VuetifyDateAdapter,
    locale: {
      af: 'af-ZA',
      // ar: '', # not the same value for all variants
      bg: 'bg-BG',
      ca: 'ca-ES',
      ckb: '',
      cs: 'cs-CZ',
      de: 'de-DE',
      el: 'el-GR',
      en: 'en-US',
      // es: '', # not the same value for all variants
      et: 'et-EE',
      fa: 'fa-IR',
      fi: 'fi-FI',
      // fr: '', #not the same value for all variants
      hr: 'hr-HR',
      hu: 'hu-HU',
      he: 'he-IL',
      id: 'id-ID',
      it: 'it-IT',
      ja: 'ja-JP',
      ko: 'ko-KR',
      lv: 'lv-LV',
      lt: 'lt-LT',
      nl: 'nl-NL',
      no: 'no-NO',
      pl: 'pl-PL',
      pt: 'pt-PT',
      ro: 'ro-RO',
      ru: 'ru-RU',
      sk: 'sk-SK',
      sl: 'sl-SI',
      srCyrl: 'sr-SP',
      srLatn: 'sr-SP',
      sv: 'sv-SE',
      th: 'th-TH',
      tr: 'tr-TR',
      az: 'az-AZ',
      uk: 'uk-UA',
      vi: 'vi-VN',
      zhHans: 'zh-CN',
      zhHant: 'zh-TW'
    }
  }, options);
  return {
    options: _options,
    instance: createInstance(_options, locale)
  };
}
function createInstance(options, locale) {
  const instance = reactive$2(typeof options.adapter === 'function'
  // eslint-disable-next-line new-cap
  ? new options.adapter({
    locale: options.locale[locale.current.value] ?? locale.current.value,
    formats: options.formats
  }) : options.adapter);
  watch$1(locale.current, value => {
    instance.locale = options.locale[value] ?? value ?? instance.locale;
  });
  return instance;
}
function useDate() {
  const options = inject$2(DateOptionsSymbol);
  if (!options) throw new Error('[Vuetify] Could not find injected date options');
  const locale = useLocale();
  return createInstance(options, locale);
}

const {computed: computed$1,inject: inject$1,onActivated,onBeforeUnmount,onDeactivated,onMounted,provide,reactive: reactive$1,ref,shallowRef,toRef,useId} = await importShared('vue');
const VuetifyLayoutKey = Symbol.for('vuetify:layout');
function useLayout() {
  const layout = inject$1(VuetifyLayoutKey);
  if (!layout) throw new Error('[Vuetify] Could not find injected layout');
  return {
    getLayoutItem: layout.getLayoutItem,
    mainRect: layout.mainRect,
    mainStyles: layout.mainStyles
  };
}

/**
 * Centralized key alias mapping for consistent key normalization across the hotkey system.
 *
 * This maps various user-friendly aliases to canonical key names that match
 * KeyboardEvent.key values (in lowercase) where possible.
 */
const keyAliasMap = {
  // Modifier aliases (from vue-use, other libraries, and current implementation)
  control: 'ctrl',
  command: 'cmd',
  option: 'alt',
  // Arrow key aliases (common abbreviations)
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  // Other common key aliases
  esc: 'escape',
  spacebar: ' ',
  space: ' ',
  return: 'enter',
  del: 'delete',
  // Symbol aliases (existing from hotkey-parsing.ts)
  minus: '-',
  hyphen: '-'
};

/**
 * Normalizes a key string to its canonical form using the alias map.
 *
 * @param key - The key string to normalize
 * @returns The canonical key name in lowercase
 */
function normalizeKey(key) {
  const lowerKey = key.toLowerCase();
  return keyAliasMap[lowerKey] || lowerKey;
}

// Utilities

/**
 * Splits a single combination string into individual key parts.
 *
 * A combination is a set of keys that must be pressed simultaneously.
 * e.g. `ctrl+k`, `shift--`
 */
function splitKeyCombination(combination) {
  let isInternal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (!combination) {
    if (!isInternal) consoleWarn('Invalid hotkey combination: empty string provided');
    return [];
  }

  // --- VALIDATION ---
  const startsWithPlusOrUnderscore = combination.startsWith('+') || combination.startsWith('_');
  const hasInvalidLeadingSeparator =
  // Starts with a single '+' or '_' followed by a non-separator character (e.g. '+a', '_a')
  startsWithPlusOrUnderscore && !(combination.startsWith('++') || combination.startsWith('__'));
  const hasInvalidStructure =
  // Invalid leading separator patterns
  combination.length > 1 && hasInvalidLeadingSeparator ||
  // Disallow literal + or _ keys (they require shift)
  combination.includes('++') || combination.includes('__') || combination === '+' || combination === '_' ||
  // Ends with a separator that is not part of a doubled literal
  combination.length > 1 && (combination.endsWith('+') || combination.endsWith('_')) && combination.at(-2) !== combination.at(-1) ||
  // Stand-alone doubled separators (dangling)
  combination === '++' || combination === '--' || combination === '__';
  if (hasInvalidStructure) {
    if (!isInternal) consoleWarn(`Invalid hotkey combination: "${combination}" has invalid structure`);
    return [];
  }
  const keys = [];
  let buffer = '';
  const flushBuffer = () => {
    if (buffer) {
      keys.push(normalizeKey(buffer));
      buffer = '';
    }
  };
  for (let i = 0; i < combination.length; i++) {
    const char = combination[i];
    const nextChar = combination[i + 1];
    if (char === '+' || char === '_' || char === '-') {
      if (char === nextChar) {
        flushBuffer();
        keys.push(char);
        i++;
      } else if (char === '+' || char === '_') {
        flushBuffer();
      } else {
        buffer += char;
      }
    } else {
      buffer += char;
    }
  }
  flushBuffer();

  // Within a combination, `-` is only valid as a literal key (e.g., `ctrl+-`).
  // `-` cannot be part of a longer key name within a combination.
  const hasInvalidMinus = keys.some(key => key.length > 1 && key.includes('-') && key !== '--');
  if (hasInvalidMinus) {
    if (!isInternal) consoleWarn(`Invalid hotkey combination: "${combination}" has invalid structure`);
    return [];
  }
  if (keys.length === 0 && combination) {
    return [normalizeKey(combination)];
  }
  return keys;
}

/**
 * Splits a hotkey string into its constituent combination groups.
 *
 * A sequence is a series of combinations that must be pressed in order.
 * e.g. `a-b`, `ctrl+k-p`
 */
function splitKeySequence(str) {
  if (!str) {
    consoleWarn('Invalid hotkey sequence: empty string provided');
    return [];
  }

  // A sequence is invalid if it starts or ends with a separator,
  // unless it is part of a combination (e.g., `shift+-`).
  const hasInvalidStart = str.startsWith('-') && !['---', '--+'].includes(str);
  const hasInvalidEnd = str.endsWith('-') && !str.endsWith('+-') && !str.endsWith('_-') && str !== '-' && str !== '---';
  if (hasInvalidStart || hasInvalidEnd) {
    consoleWarn(`Invalid hotkey sequence: "${str}" contains invalid combinations`);
    return [];
  }
  const result = [];
  let buffer = '';
  let i = 0;
  while (i < str.length) {
    const char = str[i];
    if (char === '-') {
      // Determine if this hyphen is part of the current combination
      const prevChar = str[i - 1];
      const prevPrevChar = i > 1 ? str[i - 2] : undefined;
      const precededBySinglePlusOrUnderscore = (prevChar === '+' || prevChar === '_') && prevPrevChar !== '+';
      if (precededBySinglePlusOrUnderscore) {
        // Treat as part of the combination (e.g., 'ctrl+-')
        buffer += char;
        i++;
      } else {
        // Treat as sequence separator
        if (buffer) {
          result.push(buffer);
          buffer = '';
        } else {
          // Empty buffer means we have a literal '-' key
          result.push('-');
        }
        i++;
      }
    } else {
      buffer += char;
      i++;
    }
  }

  // Add final buffer if it exists
  if (buffer) {
    result.push(buffer);
  }

  // Collapse runs of '-' so that every second '-' is removed
  const collapsed = [];
  let minusCount = 0;
  for (const part of result) {
    if (part === '-') {
      if (minusCount % 2 === 0) collapsed.push('-');
      minusCount++;
    } else {
      minusCount = 0;
      collapsed.push(part);
    }
  }

  // Validate that each part of the sequence is a valid combination
  const areAllValid = collapsed.every(s => splitKeyCombination(s, true).length > 0);
  if (!areAllValid) {
    consoleWarn(`Invalid hotkey sequence: "${str}" contains invalid combinations`);
    return [];
  }
  return collapsed;
}

const {onScopeDispose,toValue,watch} = await importShared('vue');
function useHotkey(keys, callback) {
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  if (!IN_BROWSER) return function () {};
  const {
    event = 'keydown',
    inputs = false,
    preventDefault = true,
    sequenceTimeout = 1000
  } = options;
  const isMac = navigator?.userAgent?.includes('Macintosh') ?? false;
  let timeout = 0;
  let keyGroups;
  let isSequence = false;
  let groupIndex = 0;
  function isInputFocused() {
    if (toValue(inputs)) return false;
    const activeElement = document.activeElement;
    return activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable || activeElement.contentEditable === 'true');
  }
  function resetSequence() {
    groupIndex = 0;
    clearTimeout(timeout);
  }
  function handler(e) {
    const group = keyGroups[groupIndex];
    if (!group || isInputFocused()) return;
    if (!matchesKeyGroup(e, group, isMac)) {
      if (isSequence) resetSequence();
      return;
    }
    if (toValue(preventDefault)) e.preventDefault();
    if (!isSequence) {
      callback(e);
      return;
    }
    clearTimeout(timeout);
    groupIndex++;
    if (groupIndex === keyGroups.length) {
      callback(e);
      resetSequence();
      return;
    }
    timeout = window.setTimeout(resetSequence, toValue(sequenceTimeout));
  }
  function cleanup() {
    window.removeEventListener(toValue(event), handler);
    clearTimeout(timeout);
  }
  watch(() => toValue(keys), newKeys => {
    cleanup();
    if (newKeys) {
      const groups = splitKeySequence(newKeys.toLowerCase());
      isSequence = groups.length > 1;
      keyGroups = groups;
      resetSequence();
      window.addEventListener(toValue(event), handler);
    }
  }, {
    immediate: true
  });

  // Watch for changes in the event type to re-register the listener
  watch(() => toValue(event), (newEvent, oldEvent) => {
    if (oldEvent && keyGroups && keyGroups.length > 0) {
      window.removeEventListener(oldEvent, handler);
      window.addEventListener(newEvent, handler);
    }
  });
  onScopeDispose(cleanup, true);
  return cleanup;
}
function matchesKeyGroup(e, group, isMac) {
  const {
    modifiers,
    actualKey
  } = parseKeyGroup(group);
  const expectCtrl = modifiers.ctrl || !isMac && (modifiers.cmd || modifiers.meta);
  const expectMeta = isMac && (modifiers.cmd || modifiers.meta);
  return e.ctrlKey === expectCtrl && e.metaKey === expectMeta && e.shiftKey === modifiers.shift && e.altKey === modifiers.alt && e.key.toLowerCase() === actualKey?.toLowerCase();
}
function parseKeyGroup(group) {
  const MODIFIERS = ['ctrl', 'shift', 'alt', 'meta', 'cmd'];

  // Use the shared combination splitting logic
  const parts = splitKeyCombination(group.toLowerCase());

  // If the combination is invalid, return empty result
  if (parts.length === 0) {
    return {
      modifiers: Object.fromEntries(MODIFIERS.map(m => [m, false])),
      actualKey: undefined
    };
  }
  const modifiers = Object.fromEntries(MODIFIERS.map(m => [m, false]));
  let actualKey;
  for (const part of parts) {
    if (MODIFIERS.includes(part)) {
      modifiers[part] = true;
    } else {
      actualKey = part;
    }
  }
  return {
    modifiers,
    actualKey
  };
}

// Utilities
const {computed} = await importShared('vue');
const defaultDelimiters = /[-!$%^&*()_+|~=`{}[\]:";'<>?,./\\ ]/;
const presets = {
  'credit-card': '#### - #### - #### - ####',
  date: '##/##/####',
  'date-time': '##/##/#### ##:##',
  'iso-date': '####-##-##',
  'iso-date-time': '####-##-## ##:##',
  phone: '(###) ### - ####',
  social: '###-##-####',
  time: '##:##',
  'time-with-seconds': '##:##:##'
};
const defaultTokens = {
  '#': {
    pattern: /[0-9]/
  },
  A: {
    pattern: /[A-Z]/i,
    convert: v => v.toUpperCase()
  },
  a: {
    pattern: /[a-z]/i,
    convert: v => v.toLowerCase()
  },
  N: {
    pattern: /[0-9A-Z]/i,
    convert: v => v.toUpperCase()
  },
  n: {
    pattern: /[0-9a-z]/i,
    convert: v => v.toLowerCase()
  },
  X: {
    pattern: defaultDelimiters
  }
};
function useMask(props) {
  const mask = computed(() => {
    if (typeof props.mask === 'string') {
      if (props.mask in presets) return presets[props.mask];
      return props.mask;
    }
    return props.mask?.mask ?? '';
  });
  const tokens = computed(() => {
    return {
      ...defaultTokens,
      ...(isObject(props.mask) ? props.mask.tokens : null)
    };
  });
  function isMask(char) {
    return char in tokens.value;
  }
  function maskValidates(mask, char) {
    if (char == null || !isMask(mask)) return false;
    const item = tokens.value[mask];
    if (item.pattern) return item.pattern.test(char);
    return item.test(char);
  }
  function convert(mask, char) {
    const item = tokens.value[mask];
    return item.convert ? item.convert(char) : char;
  }
  function maskText(text) {
    const trimmedText = text?.trim().replace(/\s+/g, ' ');
    if (trimmedText == null) return '';
    if (!mask.value.length || !trimmedText.length) return trimmedText;
    let textIndex = 0;
    let maskIndex = 0;
    let newText = '';
    while (maskIndex < mask.value.length) {
      const mchar = mask.value[maskIndex];
      const tchar = trimmedText[textIndex];

      // Escaped character in mask, the next mask character is inserted
      if (mchar === '\\') {
        newText += mask.value[maskIndex + 1];
        maskIndex += 2;
        continue;
      }
      if (!isMask(mchar)) {
        newText += mchar;
        if (tchar === mchar) {
          textIndex++;
        }
      } else if (maskValidates(mchar, tchar)) {
        newText += convert(mchar, tchar);
        textIndex++;
      } else {
        break;
      }
      maskIndex++;
    }
    return newText;
  }
  function unmaskText(text) {
    if (text == null) return null;
    if (!mask.value.length || !text.length) return text;
    let textIndex = 0;
    let maskIndex = 0;
    let newText = '';
    while (true) {
      const mchar = mask.value[maskIndex];
      const tchar = text[textIndex];
      if (tchar == null) break;
      if (mchar == null) {
        newText += tchar;
        textIndex++;
        continue;
      }

      // Escaped character in mask, skip the next input character
      if (mchar === '\\') {
        if (tchar === mask.value[maskIndex + 1]) {
          textIndex++;
        }
        maskIndex += 2;
        continue;
      }
      if (maskValidates(mchar, tchar)) {
        // masked char
        newText += tchar;
        textIndex++;
        maskIndex++;
        continue;
      } else if (mchar !== tchar) {
        // input doesn't match mask, skip forward until it does
        while (true) {
          const mchar = mask.value[maskIndex++];
          if (mchar == null || maskValidates(mchar, tchar)) break;
        }
        continue;
      }
      textIndex++;
      maskIndex++;
    }
    return newText;
  }
  function isValid(text) {
    if (!text) return false;
    return unmaskText(text) === unmaskText(maskText(text));
  }
  function isComplete(text) {
    if (!text) return false;
    const maskedText = maskText(text);
    return maskedText.length === mask.value.length && isValid(text);
  }
  return {
    isValid,
    isComplete,
    mask: maskText,
    unmask: unmaskText
  };
}

const {effectScope,nextTick,reactive} = await importShared('vue');
function createVuetify() {
  let vuetify = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  const {
    blueprint,
    ...rest
  } = vuetify;
  const options = mergeDeep(blueprint, rest);
  const {
    aliases = {},
    components = {},
    directives = {}
  } = options;
  const scope = effectScope();
  return scope.run(() => {
    const defaults = createDefaults(options.defaults);
    const display = createDisplay(options.display, options.ssr);
    const theme = createTheme(options.theme);
    const icons = createIcons(options.icons);
    const locale = createLocale(options.locale);
    const date = createDate(options.date, locale);
    const goTo = createGoTo(options.goTo, locale);
    function install(app) {
      for (const key in directives) {
        app.directive(key, directives[key]);
      }
      for (const key in components) {
        app.component(key, components[key]);
      }
      for (const key in aliases) {
        app.component(key, defineComponent({
          ...aliases[key],
          name: key,
          aliasName: aliases[key].name
        }));
      }
      const appScope = effectScope();
      appScope.run(() => {
        theme.install(app);
      });
      app.onUnmount(() => appScope.stop());
      app.provide(DefaultsSymbol, defaults);
      app.provide(DisplaySymbol, display);
      app.provide(ThemeSymbol, theme);
      app.provide(IconSymbol, icons);
      app.provide(LocaleSymbol, locale);
      app.provide(DateOptionsSymbol, date.options);
      app.provide(DateAdapterSymbol, date.instance);
      app.provide(GoToSymbol, goTo);
      if (IN_BROWSER && options.ssr) {
        if (app.$nuxt) {
          app.$nuxt.hook("app:suspense:resolve", () => {
            display.update();
          });
        } else {
          const {
            mount
          } = app;
          app.mount = function() {
            const vm = mount(...arguments);
            nextTick(() => display.update());
            app.mount = mount;
            return vm;
          };
        }
      }
      {
        app.mixin({
          computed: {
            $vuetify() {
              return reactive({
                defaults: inject.call(this, DefaultsSymbol),
                display: inject.call(this, DisplaySymbol),
                theme: inject.call(this, ThemeSymbol),
                icons: inject.call(this, IconSymbol),
                locale: inject.call(this, LocaleSymbol),
                date: inject.call(this, DateAdapterSymbol)
              });
            }
          }
        });
      }
    }
    function unmount() {
      scope.stop();
    }
    return {
      install,
      unmount,
      defaults,
      display,
      theme,
      icons,
      locale,
      date,
      goTo
    };
  });
}
const version = "3.10.11";
createVuetify.version = version;
function inject(key) {
  const vm = this.$;
  const provides = vm.parent?.provides ?? vm.vnode.appContext?.provides;
  if (provides && key in provides) {
    return provides[key];
  }
}

export { createVuetify, useDate, useHotkey, useLayout, useLocale, useMask, version };
