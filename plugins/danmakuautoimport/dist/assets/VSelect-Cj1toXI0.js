import { importShared } from './__federation_fn_import-oc7trqad.js';
import { Y as includes, y as isOn, Z as eventName, v as propsFactory, t as genericComponent, P as isPrimitive, H as getCurrentInstance, _ as templateRef, I as IN_BROWSER, $ as getCurrentInstanceName, a0 as destructComputed, a1 as isCssColor, a2 as isParsableColor, a3 as parseColor, a4 as getForeground, C as makeThemeProps, A as provideTheme, B as provideDefaults, w as useProxiedModel, O as wrapInArray, c as consoleWarn, a5 as findChildrenWithProvide, M as convertToUnit, s as useTheme, a6 as useIcon, E as IconValue, a7 as flattenFragments, a8 as SUPPORTS_INTERSECTION, J as clamp, a9 as PREFERS_REDUCED_MOTION, r as useRtl, aa as useToggleScope, ab as hasEvent, i as isObject, u as useLocale, ac as onlyDefinedProps, ad as breakpoints, ae as acceleratedEasing, af as deceleratedEasing, ag as standardEasing, V as EventProp, x as filterInputAttrs, ah as matchesSelector, ai as omit, z as callEvent, W as pick, U as makeDisplayProps, o as useDisplay, q as useGoTo, aj as focusableChildren, N as consoleError, j as defineComponent, ak as deprecate, X as getPropertyFromItem, al as focusChild, am as CircularBuffer, an as defer, ao as isClickInsideElement, ap as getNextElement, aq as debounce, ar as camelizeProps, as as ensureValidVNode, at as checkPrintable } from './theme-BAWxfzBN.js';

// Utilities
const block = ['top', 'bottom'];
const inline = ['start', 'end', 'left', 'right'];
/** Parse a raw anchor string into an object */
function parseAnchor(anchor, isRtl) {
  let [side, align] = anchor.split(' ');
  if (!align) {
    align = includes(block, side) ? 'start' : includes(inline, side) ? 'top' : 'center';
  }
  return {
    side: toPhysical(side, isRtl),
    align: toPhysical(align, isRtl)
  };
}
function toPhysical(str, isRtl) {
  if (str === 'start') return isRtl ? 'right' : 'left';
  if (str === 'end') return isRtl ? 'left' : 'right';
  return str;
}
function flipSide(anchor) {
  return {
    side: {
      center: 'center',
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left'
    }[anchor.side],
    align: anchor.align
  };
}
function flipAlign(anchor) {
  return {
    side: anchor.side,
    align: {
      center: 'center',
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left'
    }[anchor.align]
  };
}
function flipCorner(anchor) {
  return {
    side: anchor.align,
    align: anchor.side
  };
}
function getAxis(anchor) {
  return includes(block, anchor.side) ? 'y' : 'x';
}

class Box {
  constructor(args) {
    const pageScale = document.body.currentCSSZoom ?? 1;
    const ignoreZoom = args.top === undefined; // detect DOMRect without breaking in jsdom
    const factor = ignoreZoom ? 1 : 1 + (1 - pageScale) / pageScale;
    const {
      x,
      y,
      width,
      height
    } = args;
    this.x = x * factor;
    this.y = y * factor;
    this.width = width * factor;
    this.height = height * factor;
  }
  get top() {
    return this.y;
  }
  get bottom() {
    return this.y + this.height;
  }
  get left() {
    return this.x;
  }
  get right() {
    return this.x + this.width;
  }
}
function getOverflow(a, b) {
  return {
    x: {
      before: Math.max(0, b.left - a.left),
      after: Math.max(0, a.right - b.right)
    },
    y: {
      before: Math.max(0, b.top - a.top),
      after: Math.max(0, a.bottom - b.bottom)
    }
  };
}
function getTargetBox(target) {
  if (Array.isArray(target)) {
    const pageScale = document.body.currentCSSZoom ?? 1;
    const factor = 1 + (1 - pageScale) / pageScale;
    return new Box({
      x: target[0] * factor,
      y: target[1] * factor,
      width: 0 * factor,
      height: 0 * factor
    });
  } else {
    return new Box(target.getBoundingClientRect());
  }
}
function getElementBox(el) {
  if (el === document.documentElement) {
    if (!visualViewport) {
      return new Box({
        x: 0,
        y: 0,
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
      });
    } else {
      const pageScale = document.body.currentCSSZoom ?? 1;
      return new Box({
        x: visualViewport.scale > 1 ? 0 : visualViewport.offsetLeft,
        y: visualViewport.scale > 1 ? 0 : visualViewport.offsetTop,
        width: visualViewport.width * visualViewport.scale / pageScale,
        height: visualViewport.height * visualViewport.scale / pageScale
      });
    }
  } else {
    return new Box(el.getBoundingClientRect());
  }
}

// Utilities
/** @see https://stackoverflow.com/a/57876601/2074736 */
function nullifyTransforms(el) {
  const rect = new Box(el.getBoundingClientRect());
  const style = getComputedStyle(el);
  const tx = style.transform;
  if (tx) {
    let ta, sx, sy, dx, dy;
    if (tx.startsWith('matrix3d(')) {
      ta = tx.slice(9, -1).split(/, /);
      sx = Number(ta[0]);
      sy = Number(ta[5]);
      dx = Number(ta[12]);
      dy = Number(ta[13]);
    } else if (tx.startsWith('matrix(')) {
      ta = tx.slice(7, -1).split(/, /);
      sx = Number(ta[0]);
      sy = Number(ta[3]);
      dx = Number(ta[4]);
      dy = Number(ta[5]);
    } else {
      return new Box(rect);
    }
    const to = style.transformOrigin;
    const x = rect.x - dx - (1 - sx) * parseFloat(to);
    const y = rect.y - dy - (1 - sy) * parseFloat(to.slice(to.indexOf(' ') + 1));
    const w = sx ? rect.width / sx : el.offsetWidth + 1;
    const h = sy ? rect.height / sy : el.offsetHeight + 1;
    return new Box({
      x,
      y,
      width: w,
      height: h
    });
  } else {
    return new Box(rect);
  }
}
function animate(el, keyframes, options) {
  if (typeof el.animate === 'undefined') return {
    finished: Promise.resolve()
  };
  let animation;
  try {
    animation = el.animate(keyframes, options);
  } catch (err) {
    return {
      finished: Promise.resolve()
    };
  }
  if (typeof animation.finished === 'undefined') {
    animation.finished = new Promise(resolve => {
      animation.onfinish = () => {
        resolve(animation);
      };
    });
  }
  return animation;
}

// Utilities
const handlers = new WeakMap();
function bindProps(el, props) {
  Object.keys(props).forEach(k => {
    if (isOn(k)) {
      const name = eventName(k);
      const handler = handlers.get(el);
      if (props[k] == null) {
        handler?.forEach(v => {
          const [n, fn] = v;
          if (n === name) {
            el.removeEventListener(name, fn);
            handler.delete(v);
          }
        });
      } else if (!handler || ![...handler]?.some(v => v[0] === name && v[1] === props[k])) {
        el.addEventListener(name, props[k]);
        const _handler = handler || new Set();
        _handler.add([name, props[k]]);
        if (!handlers.has(el)) handlers.set(el, _handler);
      }
    } else {
      if (props[k] == null) {
        el.removeAttribute(k);
      } else {
        el.setAttribute(k, props[k]);
      }
    }
  });
}
function unbindProps(el, props) {
  Object.keys(props).forEach(k => {
    if (isOn(k)) {
      const name = eventName(k);
      const handler = handlers.get(el);
      handler?.forEach(v => {
        const [n, fn] = v;
        if (n === name) {
          el.removeEventListener(name, fn);
          handler.delete(v);
        }
      });
    } else {
      el.removeAttribute(k);
    }
  });
}

// Utilities
// Composables
const makeComponentProps = propsFactory({
  class: [String, Array, Object],
  style: {
    type: [String, Array, Object],
    default: null
  }
}, 'component');

const {camelize: camelize$1,capitalize: capitalize$2,h: h$4} = await importShared('vue');
function createSimpleFunctional(klass) {
  let tag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'div';
  let name = arguments.length > 2 ? arguments[2] : undefined;
  return genericComponent()({
    name: name ?? capitalize$2(camelize$1(klass.replace(/__/g, '-'))),
    props: {
      tag: {
        type: String,
        default: tag
      },
      ...makeComponentProps()
    },
    setup(props, _ref) {
      let {
        slots
      } = _ref;
      return () => {
        return h$4(props.tag, {
          class: [klass, props.class],
          style: props.style
        }, slots.default?.());
      };
    }
  });
}

function updateRecursionCache(a, b, cache, result) {
  if (!cache || isPrimitive(a) || isPrimitive(b)) return;
  const visitedObject = cache.get(a);
  if (visitedObject) {
    visitedObject.set(b, result);
  } else {
    const newCacheItem = new WeakMap();
    newCacheItem.set(b, result);
    cache.set(a, newCacheItem);
  }
}
function findCachedComparison(a, b, cache) {
  if (!cache || isPrimitive(a) || isPrimitive(b)) return null;
  const r1 = cache.get(a)?.get(b);
  if (typeof r1 === 'boolean') return r1;
  const r2 = cache.get(b)?.get(a);
  if (typeof r2 === 'boolean') return r2;
  return null;
}
function deepEqual(a, b) {
  let recursionCache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new WeakMap();
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date && a.getTime() !== b.getTime()) {
    // If the values are Date, compare them as timestamps
    return false;
  }
  if (a !== Object(a) || b !== Object(b)) {
    // If the values aren't objects, they were already checked for equality
    return false;
  }
  const props = Object.keys(a);
  if (props.length !== Object.keys(b).length) {
    // Different number of props, don't bother to check
    return false;
  }
  const cachedComparisonResult = findCachedComparison(a, b, recursionCache);
  if (cachedComparisonResult) {
    return cachedComparisonResult;
  }
  updateRecursionCache(a, b, recursionCache, true);
  return props.every(p => deepEqual(a[p], b[p], recursionCache));
}

/**
 * Returns:
 *  - 'null' if the node is not attached to the DOM
 *  - the root node (HTMLDocument | ShadowRoot) otherwise
 */
function attachedRoot(node) {
  /* istanbul ignore next */
  if (typeof node.getRootNode !== 'function') {
    // Shadow DOM not supported (IE11), lets find the root of this node
    while (node.parentNode) node = node.parentNode;

    // The root parent is the document if the node is attached to the DOM
    if (node !== document) return null;
    return document;
  }
  const root = node.getRootNode();

  // The composed root node is the document if the node is attached to the DOM
  if (root !== document && root.getRootNode({
    composed: true
  }) !== document) return null;
  return root;
}

function getScrollParent(el) {
  let includeHidden = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  while (el) {
    if (includeHidden ? isPotentiallyScrollable(el) : hasScrollbar(el)) return el;
    el = el.parentElement;
  }
  return document.scrollingElement;
}
function getScrollParents(el, stopAt) {
  const elements = [];
  if (stopAt && el && !stopAt.contains(el)) return elements;
  while (el) {
    if (hasScrollbar(el)) elements.push(el);
    if (el === stopAt) break;
    el = el.parentElement;
  }
  return elements;
}
function hasScrollbar(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
  const style = window.getComputedStyle(el);
  const hasVerticalScrollbar = style.overflowY === 'scroll' || style.overflowY === 'auto' && el.scrollHeight > el.clientHeight;
  const hasHorizontalScrollbar = style.overflowX === 'scroll' || style.overflowX === 'auto' && el.scrollWidth > el.clientWidth;
  return hasVerticalScrollbar || hasHorizontalScrollbar;
}
function isPotentiallyScrollable(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
  const style = window.getComputedStyle(el);
  return ['scroll', 'auto'].includes(style.overflowY);
}

function isFixedPosition(el) {
  while (el) {
    if (window.getComputedStyle(el).position === 'fixed') {
      return true;
    }
    el = el.offsetParent;
  }
  return false;
}

// Utilities
function useRender(render) {
  const vm = getCurrentInstance('useRender');
  vm.render = render;
}

function throttle(fn, delay) {
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    leading: true,
    trailing: true
  };
  let timeoutId = 0;
  let lastExec = 0;
  let throttling = false;
  let start = 0;
  function clear() {
    clearTimeout(timeoutId);
    throttling = false;
    start = 0;
  }
  const wrap = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    clearTimeout(timeoutId);
    const now = Date.now();
    if (!start) start = now;
    const elapsed = now - Math.max(start, lastExec);
    function invoke() {
      lastExec = Date.now();
      timeoutId = setTimeout(clear, delay);
      fn(...args);
    }
    if (!throttling) {
      throttling = true;
      if (options.leading) {
        invoke();
      }
    } else if (elapsed >= delay) {
      invoke();
    } else if (options.trailing) {
      timeoutId = setTimeout(invoke, delay - elapsed);
    }
  };
  wrap.clear = clear;
  wrap.immediate = fn;
  return wrap;
}

// Utilities
const {onBeforeUnmount: onBeforeUnmount$6,readonly: readonly$2,ref: ref$h,watch: watch$l} = await importShared('vue');
function useResizeObserver(callback) {
  let box = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'content';
  const resizeRef = templateRef();
  const contentRect = ref$h();
  if (IN_BROWSER) {
    const observer = new ResizeObserver(entries => {
      callback?.(entries, observer);
      if (!entries.length) return;
      if (box === 'content') {
        contentRect.value = entries[0].contentRect;
      } else {
        contentRect.value = entries[0].target.getBoundingClientRect();
      }
    });
    onBeforeUnmount$6(() => {
      observer.disconnect();
    });
    watch$l(() => resizeRef.el, (newValue, oldValue) => {
      if (oldValue) {
        observer.unobserve(oldValue);
        contentRect.value = undefined;
      }
      if (newValue) observer.observe(newValue);
    }, {
      flush: 'post'
    });
  }
  return {
    resizeRef,
    contentRect: readonly$2(contentRect)
  };
}

// Utilities
const VAlertTitle = createSimpleFunctional('v-alert-title');

// Utilities
const {computed: computed$C} = await importShared('vue');
// Composables
const makeBorderProps = propsFactory({
  border: [Boolean, Number, String]
}, 'border');
function useBorder(props) {
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getCurrentInstanceName();
  const borderClasses = computed$C(() => {
    const border = props.border;
    if (border === true || border === '') {
      return `${name}--border`;
    } else if (typeof border === 'string' || border === 0) {
      return String(border).split(' ').map(v => `border-${v}`);
    }
    return [];
  });
  return {
    borderClasses
  };
}

// Utilities
const {toRef: toRef$x} = await importShared('vue');
const allowedDensities = [null, 'default', 'comfortable', 'compact'];

// typeof allowedDensities[number] evaluates to any
// when generating api types for whatever reason.

// Composables
const makeDensityProps = propsFactory({
  density: {
    type: String,
    default: 'default',
    validator: v => allowedDensities.includes(v)
  }
}, 'density');
function useDensity(props) {
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getCurrentInstanceName();
  const densityClasses = toRef$x(() => {
    return `${name}--density-${props.density}`;
  });
  return {
    densityClasses
  };
}

// Utilities
const {isRef: isRef$1,toRef: toRef$w} = await importShared('vue');
// Composables
const makeElevationProps = propsFactory({
  elevation: {
    type: [Number, String],
    validator(v) {
      const value = parseInt(v);
      return !isNaN(value) && value >= 0 &&
      // Material Design has a maximum elevation of 24
      // https://material.io/design/environment/elevation.html#default-elevations
      value <= 24;
    }
  }
}, 'elevation');
function useElevation(props) {
  const elevationClasses = toRef$w(() => {
    const elevation = isRef$1(props) ? props.value : props.elevation;
    if (elevation == null) return [];
    return [`elevation-${elevation}`];
  });
  return {
    elevationClasses
  };
}

// Utilities
const {computed: computed$B,isRef} = await importShared('vue');
// Composables
const makeRoundedProps = propsFactory({
  rounded: {
    type: [Boolean, Number, String],
    default: undefined
  },
  tile: Boolean
}, 'rounded');
function useRounded(props) {
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getCurrentInstanceName();
  const roundedClasses = computed$B(() => {
    const rounded = isRef(props) ? props.value : props.rounded;
    const tile = isRef(props) ? false : props.tile;
    const classes = [];
    if (tile || rounded === false) {
      classes.push('rounded-0');
    } else if (rounded === true || rounded === '') {
      classes.push(`${name}--rounded`);
    } else if (typeof rounded === 'string' || rounded === 0) {
      for (const value of String(rounded).split(' ')) {
        classes.push(`rounded-${value}`);
      }
    }
    return classes;
  });
  return {
    roundedClasses
  };
}

// Utilities
// Types
// Composables
const makeTagProps = propsFactory({
  tag: {
    type: [String, Object, Function],
    default: 'div'
  }
}, 'tag');

// Utilities
const {toValue: toValue$5} = await importShared('vue');
// Composables
function useColor(colors) {
  return destructComputed(() => {
    const {
      class: colorClasses,
      style: colorStyles
    } = computeColor(colors);
    return {
      colorClasses,
      colorStyles
    };
  });
}
function useTextColor(color) {
  const {
    colorClasses: textColorClasses,
    colorStyles: textColorStyles
  } = useColor(() => ({
    text: toValue$5(color)
  }));
  return {
    textColorClasses,
    textColorStyles
  };
}
function useBackgroundColor(color) {
  const {
    colorClasses: backgroundColorClasses,
    colorStyles: backgroundColorStyles
  } = useColor(() => ({
    background: toValue$5(color)
  }));
  return {
    backgroundColorClasses,
    backgroundColorStyles
  };
}
function computeColor(colors) {
  const _colors = toValue$5(colors);
  const classes = [];
  const styles = {};
  if (_colors.background) {
    if (isCssColor(_colors.background)) {
      styles.backgroundColor = _colors.background;
      if (!_colors.text && isParsableColor(_colors.background)) {
        const backgroundColor = parseColor(_colors.background);
        if (backgroundColor.a == null || backgroundColor.a === 1) {
          const textColor = getForeground(backgroundColor);
          styles.color = textColor;
          styles.caretColor = textColor;
        }
      }
    } else {
      classes.push(`bg-${_colors.background}`);
    }
  }
  if (_colors.text) {
    if (isCssColor(_colors.text)) {
      styles.color = _colors.text;
      styles.caretColor = _colors.text;
    } else {
      classes.push(`text-${_colors.text}`);
    }
  }
  return {
    class: classes,
    style: styles
  };
}

const {Fragment:_Fragment$b,normalizeClass:_normalizeClass$t,createElementVNode:_createElementVNode$r} = await importShared('vue');
const {toRef: toRef$v,toValue: toValue$4} = await importShared('vue');
const allowedVariants$1 = ['elevated', 'flat', 'tonal', 'outlined', 'text', 'plain'];
function genOverlays(isClickable, name) {
  return _createElementVNode$r(_Fragment$b, null, [isClickable && _createElementVNode$r("span", {
    "key": "overlay",
    "class": _normalizeClass$t(`${name}__overlay`)
  }, null), _createElementVNode$r("span", {
    "key": "underlay",
    "class": _normalizeClass$t(`${name}__underlay`)
  }, null)]);
}
const makeVariantProps = propsFactory({
  color: String,
  variant: {
    type: String,
    default: 'elevated',
    validator: v => allowedVariants$1.includes(v)
  }
}, 'variant');
function useVariant(props) {
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getCurrentInstanceName();
  const variantClasses = toRef$v(() => {
    const {
      variant
    } = toValue$4(props);
    return `${name}--variant-${variant}`;
  });
  const {
    colorClasses,
    colorStyles
  } = useColor(() => {
    const {
      variant,
      color
    } = toValue$4(props);
    return {
      [['elevated', 'flat'].includes(variant) ? 'background' : 'text']: color
    };
  });
  return {
    colorClasses,
    colorStyles,
    variantClasses
  };
}

const {normalizeClass:_normalizeClass$s,normalizeStyle:_normalizeStyle$p,createVNode:_createVNode$B} = await importShared('vue');
const {toRef: toRef$u} = await importShared('vue');
const makeVBtnGroupProps = propsFactory({
  baseColor: String,
  divided: Boolean,
  direction: {
    type: String,
    default: 'horizontal'
  },
  ...makeBorderProps(),
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeElevationProps(),
  ...makeRoundedProps(),
  ...makeTagProps(),
  ...makeThemeProps(),
  ...makeVariantProps()
}, 'VBtnGroup');
const VBtnGroup = genericComponent()({
  name: 'VBtnGroup',
  props: makeVBtnGroupProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      themeClasses
    } = provideTheme(props);
    const {
      densityClasses
    } = useDensity(props);
    const {
      borderClasses
    } = useBorder(props);
    const {
      elevationClasses
    } = useElevation(props);
    const {
      roundedClasses
    } = useRounded(props);
    provideDefaults({
      VBtn: {
        height: toRef$u(() => props.direction === 'horizontal' ? 'auto' : null),
        baseColor: toRef$u(() => props.baseColor),
        color: toRef$u(() => props.color),
        density: toRef$u(() => props.density),
        flat: true,
        variant: toRef$u(() => props.variant)
      }
    });
    useRender(() => {
      return _createVNode$B(props.tag, {
        "class": _normalizeClass$s(['v-btn-group', `v-btn-group--${props.direction}`, {
          'v-btn-group--divided': props.divided
        }, themeClasses.value, borderClasses.value, densityClasses.value, elevationClasses.value, roundedClasses.value, props.class]),
        "style": _normalizeStyle$p(props.style)
      }, slots);
    });
  }
});

const {computed: computed$A,inject: inject$8,onBeforeUnmount: onBeforeUnmount$5,onMounted: onMounted$4,onUpdated,provide: provide$6,reactive: reactive$2,toRef: toRef$t,unref: unref$1,useId: useId$8,watch: watch$k} = await importShared('vue');
const makeGroupProps = propsFactory({
  modelValue: {
    type: null,
    default: undefined
  },
  multiple: Boolean,
  mandatory: [Boolean, String],
  max: Number,
  selectedClass: String,
  disabled: Boolean
}, 'group');
const makeGroupItemProps = propsFactory({
  value: null,
  disabled: Boolean,
  selectedClass: String
}, 'group-item');

// Composables

function useGroupItem(props, injectKey) {
  let required = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  const vm = getCurrentInstance('useGroupItem');
  if (!vm) {
    throw new Error('[Vuetify] useGroupItem composable must be used inside a component setup function');
  }
  const id = useId$8();
  provide$6(Symbol.for(`${injectKey.description}:id`), id);
  const group = inject$8(injectKey, null);
  if (!group) {
    if (!required) return group;
    throw new Error(`[Vuetify] Could not find useGroup injection with symbol ${injectKey.description}`);
  }
  const value = toRef$t(() => props.value);
  const disabled = computed$A(() => !!(group.disabled.value || props.disabled));
  function register() {
    group?.register({
      id,
      value,
      disabled
    }, vm);
  }
  function unregister() {
    group?.unregister(id);
  }
  register();
  onBeforeUnmount$5(() => unregister());
  const isSelected = computed$A(() => {
    return group.isSelected(id);
  });
  const isFirst = computed$A(() => {
    return group.items.value[0].id === id;
  });
  const isLast = computed$A(() => {
    return group.items.value[group.items.value.length - 1].id === id;
  });
  const selectedClass = computed$A(() => isSelected.value && [group.selectedClass.value, props.selectedClass]);
  watch$k(isSelected, value => {
    vm.emit('group:selected', {
      value
    });
  }, {
    flush: 'sync'
  });
  return {
    id,
    isSelected,
    isFirst,
    isLast,
    toggle: () => group.select(id, !isSelected.value),
    select: value => group.select(id, value),
    selectedClass,
    value,
    disabled,
    group,
    register,
    unregister
  };
}
function useGroup(props, injectKey) {
  let isUnmounted = false;
  const items = reactive$2([]);
  const selected = useProxiedModel(props, 'modelValue', [], v => {
    if (v === undefined) return [];
    return getIds(items, v === null ? [null] : wrapInArray(v));
  }, v => {
    const arr = getValues(items, v);
    return props.multiple ? arr : arr[0];
  });
  const groupVm = getCurrentInstance('useGroup');
  function register(item, vm) {
    // Is there a better way to fix this typing?
    const unwrapped = item;
    const key = Symbol.for(`${injectKey.description}:id`);
    const children = findChildrenWithProvide(key, groupVm?.vnode);
    const index = children.indexOf(vm);
    if (unref$1(unwrapped.value) === undefined) {
      unwrapped.value = index;
      unwrapped.useIndexAsValue = true;
    }
    if (index > -1) {
      items.splice(index, 0, unwrapped);
    } else {
      items.push(unwrapped);
    }
  }
  function unregister(id) {
    if (isUnmounted) return;

    // TODO: re-evaluate this line's importance in the future
    // should we only modify the model if mandatory is set.
    // selected.value = selected.value.filter(v => v !== id)

    forceMandatoryValue();
    const index = items.findIndex(item => item.id === id);
    items.splice(index, 1);
  }

  // If mandatory and nothing is selected, then select first non-disabled item
  function forceMandatoryValue() {
    const item = items.find(item => !item.disabled);
    if (item && props.mandatory === 'force' && !selected.value.length) {
      selected.value = [item.id];
    }
  }
  onMounted$4(() => {
    forceMandatoryValue();
  });
  onBeforeUnmount$5(() => {
    isUnmounted = true;
  });
  onUpdated(() => {
    // #19655 update the items that use the index as the value.
    for (let i = 0; i < items.length; i++) {
      if (items[i].useIndexAsValue) {
        items[i].value = i;
      }
    }
  });
  function select(id, value) {
    const item = items.find(item => item.id === id);
    if (value && item?.disabled) return;
    if (props.multiple) {
      const internalValue = selected.value.slice();
      const index = internalValue.findIndex(v => v === id);
      const isSelected = ~index;
      value = value ?? !isSelected;

      // We can't remove value if group is
      // mandatory, value already exists,
      // and it is the only value
      if (isSelected && props.mandatory && internalValue.length <= 1) return;

      // We can't add value if it would
      // cause max limit to be exceeded
      if (!isSelected && props.max != null && internalValue.length + 1 > props.max) return;
      if (index < 0 && value) internalValue.push(id);else if (index >= 0 && !value) internalValue.splice(index, 1);
      selected.value = internalValue;
    } else {
      const isSelected = selected.value.includes(id);
      if (props.mandatory && isSelected) return;
      if (!isSelected && !value) return;
      selected.value = value ?? !isSelected ? [id] : [];
    }
  }
  function step(offset) {
    // getting an offset from selected value obviously won't work with multiple values
    if (props.multiple) consoleWarn('This method is not supported when using "multiple" prop');
    if (!selected.value.length) {
      const item = items.find(item => !item.disabled);
      item && (selected.value = [item.id]);
    } else {
      const currentId = selected.value[0];
      const currentIndex = items.findIndex(i => i.id === currentId);
      let newIndex = (currentIndex + offset) % items.length;
      let newItem = items[newIndex];
      while (newItem.disabled && newIndex !== currentIndex) {
        newIndex = (newIndex + offset) % items.length;
        newItem = items[newIndex];
      }
      if (newItem.disabled) return;
      selected.value = [items[newIndex].id];
    }
  }
  const state = {
    register,
    unregister,
    selected,
    select,
    disabled: toRef$t(() => props.disabled),
    prev: () => step(items.length - 1),
    next: () => step(1),
    isSelected: id => selected.value.includes(id),
    selectedClass: toRef$t(() => props.selectedClass),
    items: toRef$t(() => items),
    getItemIndex: value => getItemIndex(items, value)
  };
  provide$6(injectKey, state);
  return state;
}
function getItemIndex(items, value) {
  const ids = getIds(items, [value]);
  if (!ids.length) return -1;
  return items.findIndex(item => item.id === ids[0]);
}
function getIds(items, modelValue) {
  const ids = [];
  modelValue.forEach(value => {
    const item = items.find(item => deepEqual(value, item.value));
    const itemByIndex = items[value];
    if (item?.value !== undefined) {
      ids.push(item.id);
    } else if (itemByIndex?.useIndexAsValue) {
      ids.push(itemByIndex.id);
    }
  });
  return ids;
}
function getValues(items, ids) {
  const values = [];
  ids.forEach(id => {
    const itemIndex = items.findIndex(item => item.id === id);
    if (~itemIndex) {
      const item = items[itemIndex];
      values.push(item.value !== undefined ? item.value : itemIndex);
    }
  });
  return values;
}

const {mergeProps:_mergeProps$i,createVNode:_createVNode$A} = await importShared('vue');
const VBtnToggleSymbol = Symbol.for('vuetify:v-btn-toggle');
const makeVBtnToggleProps = propsFactory({
  ...makeVBtnGroupProps(),
  ...makeGroupProps()
}, 'VBtnToggle');
genericComponent()({
  name: 'VBtnToggle',
  props: makeVBtnToggleProps(),
  emits: {
    'update:modelValue': value => true
  },
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      isSelected,
      next,
      prev,
      select,
      selected
    } = useGroup(props, VBtnToggleSymbol);
    useRender(() => {
      const btnGroupProps = VBtnGroup.filterProps(props);
      return _createVNode$A(VBtnGroup, _mergeProps$i({
        "class": ['v-btn-toggle', props.class]
      }, btnGroupProps, {
        "style": props.style
      }), {
        default: () => [slots.default?.({
          isSelected,
          next,
          prev,
          select,
          selected
        })]
      });
    });
    return {
      next,
      prev,
      select
    };
  }
});

const {toRefs} = await importShared('vue');
const makeVDefaultsProviderProps = propsFactory({
  defaults: Object,
  disabled: Boolean,
  reset: [Number, String],
  root: [Boolean, String],
  scoped: Boolean
}, 'VDefaultsProvider');
const VDefaultsProvider = genericComponent(false)({
  name: 'VDefaultsProvider',
  props: makeVDefaultsProviderProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      defaults,
      disabled,
      reset,
      root,
      scoped
    } = toRefs(props);
    provideDefaults(defaults, {
      reset,
      root,
      scoped,
      disabled
    });
    return () => slots.default?.();
  }
});

// Utilities
const predefinedSizes = ['x-small', 'small', 'default', 'large', 'x-large'];
// Composables
const makeSizeProps = propsFactory({
  size: {
    type: [String, Number],
    default: 'default'
  }
}, 'size');
function useSize(props) {
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getCurrentInstanceName();
  return destructComputed(() => {
    const size = props.size;
    let sizeClasses;
    let sizeStyles;
    if (includes(predefinedSizes, size)) {
      sizeClasses = `${name}--size-${size}`;
    } else if (size) {
      sizeStyles = {
        width: convertToUnit(size),
        height: convertToUnit(size)
      };
    }
    return {
      sizeClasses,
      sizeStyles
    };
  });
}

const {normalizeClass:_normalizeClass$r,normalizeStyle:_normalizeStyle$o,createVNode:_createVNode$z} = await importShared('vue');
const {shallowRef: shallowRef$l,Text} = await importShared('vue');
const makeVIconProps = propsFactory({
  color: String,
  disabled: Boolean,
  start: Boolean,
  end: Boolean,
  icon: IconValue,
  opacity: [String, Number],
  ...makeComponentProps(),
  ...makeSizeProps(),
  ...makeTagProps({
    tag: 'i'
  }),
  ...makeThemeProps()
}, 'VIcon');
const VIcon = genericComponent()({
  name: 'VIcon',
  props: makeVIconProps(),
  setup(props, _ref) {
    let {
      attrs,
      slots
    } = _ref;
    const slotIcon = shallowRef$l();
    const {
      themeClasses
    } = useTheme();
    const {
      iconData
    } = useIcon(() => slotIcon.value || props.icon);
    const {
      sizeClasses
    } = useSize(props);
    const {
      textColorClasses,
      textColorStyles
    } = useTextColor(() => props.color);
    useRender(() => {
      const slotValue = slots.default?.();
      if (slotValue) {
        slotIcon.value = flattenFragments(slotValue).filter(node => node.type === Text && node.children && typeof node.children === 'string')[0]?.children;
      }
      const hasClick = !!(attrs.onClick || attrs.onClickOnce);
      return _createVNode$z(iconData.value.component, {
        "tag": props.tag,
        "icon": iconData.value.icon,
        "class": _normalizeClass$r(['v-icon', 'notranslate', themeClasses.value, sizeClasses.value, textColorClasses.value, {
          'v-icon--clickable': hasClick,
          'v-icon--disabled': props.disabled,
          'v-icon--start': props.start,
          'v-icon--end': props.end
        }, props.class]),
        "style": _normalizeStyle$o([{
          '--v-icon-opacity': props.opacity
        }, !sizeClasses.value ? {
          fontSize: convertToUnit(props.size),
          height: convertToUnit(props.size),
          width: convertToUnit(props.size)
        } : undefined, textColorStyles.value, props.style]),
        "role": hasClick ? 'button' : undefined,
        "aria-hidden": !hasClick,
        "tabindex": hasClick ? props.disabled ? -1 : 0 : undefined
      }, {
        default: () => [slotValue]
      });
    });
    return {};
  }
});

// Utilities
const {onScopeDispose: onScopeDispose$8,ref: ref$g,shallowRef: shallowRef$k,watch: watch$j} = await importShared('vue');
function useIntersectionObserver(callback, options) {
  const intersectionRef = ref$g();
  const isIntersecting = shallowRef$k(false);
  if (SUPPORTS_INTERSECTION) {
    const observer = new IntersectionObserver(entries => {
      isIntersecting.value = !!entries.find(entry => entry.isIntersecting);
    }, options);
    onScopeDispose$8(() => {
      observer.disconnect();
    });
    watch$j(intersectionRef, (newValue, oldValue) => {
      if (oldValue) {
        observer.unobserve(oldValue);
        isIntersecting.value = false;
      }
      if (newValue) observer.observe(newValue);
    }, {
      flush: 'post'
    });
  }
  return {
    intersectionRef,
    isIntersecting
  };
}

const {normalizeClass:_normalizeClass$q,normalizeStyle:_normalizeStyle$n,createElementVNode:_createElementVNode$q,createVNode:_createVNode$y} = await importShared('vue');
const {ref: ref$f,toRef: toRef$s,watchEffect: watchEffect$6} = await importShared('vue');
const makeVProgressCircularProps = propsFactory({
  bgColor: String,
  color: String,
  indeterminate: [Boolean, String],
  modelValue: {
    type: [Number, String],
    default: 0
  },
  rotate: {
    type: [Number, String],
    default: 0
  },
  width: {
    type: [Number, String],
    default: 4
  },
  ...makeComponentProps(),
  ...makeSizeProps(),
  ...makeTagProps({
    tag: 'div'
  }),
  ...makeThemeProps()
}, 'VProgressCircular');
const VProgressCircular = genericComponent()({
  name: 'VProgressCircular',
  props: makeVProgressCircularProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const MAGIC_RADIUS_CONSTANT = 20;
    const CIRCUMFERENCE = 2 * Math.PI * MAGIC_RADIUS_CONSTANT;
    const root = ref$f();
    const {
      themeClasses
    } = provideTheme(props);
    const {
      sizeClasses,
      sizeStyles
    } = useSize(props);
    const {
      textColorClasses,
      textColorStyles
    } = useTextColor(() => props.color);
    const {
      textColorClasses: underlayColorClasses,
      textColorStyles: underlayColorStyles
    } = useTextColor(() => props.bgColor);
    const {
      intersectionRef,
      isIntersecting
    } = useIntersectionObserver();
    const {
      resizeRef,
      contentRect
    } = useResizeObserver();
    const normalizedValue = toRef$s(() => clamp(parseFloat(props.modelValue), 0, 100));
    const width = toRef$s(() => Number(props.width));
    const size = toRef$s(() => {
      // Get size from element if size prop value is small, large etc
      return sizeStyles.value ? Number(props.size) : contentRect.value ? contentRect.value.width : Math.max(width.value, 32);
    });
    const diameter = toRef$s(() => MAGIC_RADIUS_CONSTANT / (1 - width.value / size.value) * 2);
    const strokeWidth = toRef$s(() => width.value / size.value * diameter.value);
    const strokeDashOffset = toRef$s(() => convertToUnit((100 - normalizedValue.value) / 100 * CIRCUMFERENCE));
    watchEffect$6(() => {
      intersectionRef.value = root.value;
      resizeRef.value = root.value;
    });
    useRender(() => _createVNode$y(props.tag, {
      "ref": root,
      "class": _normalizeClass$q(['v-progress-circular', {
        'v-progress-circular--indeterminate': !!props.indeterminate,
        'v-progress-circular--visible': isIntersecting.value,
        'v-progress-circular--disable-shrink': props.indeterminate && (props.indeterminate === 'disable-shrink' || PREFERS_REDUCED_MOTION())
      }, themeClasses.value, sizeClasses.value, textColorClasses.value, props.class]),
      "style": _normalizeStyle$n([sizeStyles.value, textColorStyles.value, props.style]),
      "role": "progressbar",
      "aria-valuemin": "0",
      "aria-valuemax": "100",
      "aria-valuenow": props.indeterminate ? undefined : normalizedValue.value
    }, {
      default: () => [_createElementVNode$q("svg", {
        "style": {
          transform: `rotate(calc(-90deg + ${Number(props.rotate)}deg))`
        },
        "xmlns": "http://www.w3.org/2000/svg",
        "viewBox": `0 0 ${diameter.value} ${diameter.value}`
      }, [_createElementVNode$q("circle", {
        "class": _normalizeClass$q(['v-progress-circular__underlay', underlayColorClasses.value]),
        "style": _normalizeStyle$n(underlayColorStyles.value),
        "fill": "transparent",
        "cx": "50%",
        "cy": "50%",
        "r": MAGIC_RADIUS_CONSTANT,
        "stroke-width": strokeWidth.value,
        "stroke-dasharray": CIRCUMFERENCE,
        "stroke-dashoffset": 0
      }, null), _createElementVNode$q("circle", {
        "class": "v-progress-circular__overlay",
        "fill": "transparent",
        "cx": "50%",
        "cy": "50%",
        "r": MAGIC_RADIUS_CONSTANT,
        "stroke-width": strokeWidth.value,
        "stroke-dasharray": CIRCUMFERENCE,
        "stroke-dashoffset": strokeDashOffset.value
      }, null)]), slots.default && _createElementVNode$q("div", {
        "class": "v-progress-circular__content"
      }, [slots.default({
        value: normalizedValue.value
      })])]
    }));
    return {};
  }
});

// Utilities
const {computed: computed$z} = await importShared('vue');
// Composables
const makeDimensionProps = propsFactory({
  height: [Number, String],
  maxHeight: [Number, String],
  maxWidth: [Number, String],
  minHeight: [Number, String],
  minWidth: [Number, String],
  width: [Number, String]
}, 'dimension');
function useDimension(props) {
  const dimensionStyles = computed$z(() => {
    const styles = {};
    const height = convertToUnit(props.height);
    const maxHeight = convertToUnit(props.maxHeight);
    const maxWidth = convertToUnit(props.maxWidth);
    const minHeight = convertToUnit(props.minHeight);
    const minWidth = convertToUnit(props.minWidth);
    const width = convertToUnit(props.width);
    if (height != null) styles.height = height;
    if (maxHeight != null) styles.maxHeight = maxHeight;
    if (maxWidth != null) styles.maxWidth = maxWidth;
    if (minHeight != null) styles.minHeight = minHeight;
    if (minWidth != null) styles.minWidth = minWidth;
    if (width != null) styles.width = width;
    return styles;
  });
  return {
    dimensionStyles
  };
}

const {computed: computed$y} = await importShared('vue');
const oppositeMap = {
  center: 'center',
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left'
};
const makeLocationProps = propsFactory({
  location: String
}, 'location');
function useLocation(props) {
  let opposite = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  let offset = arguments.length > 2 ? arguments[2] : undefined;
  const {
    isRtl
  } = useRtl();
  const locationStyles = computed$y(() => {
    if (!props.location) return {};
    const {
      side,
      align
    } = parseAnchor(props.location.split(' ').length > 1 ? props.location : `${props.location} center`, isRtl.value);
    function getOffset(side) {
      return offset ? offset(side) : 0;
    }
    const styles = {};
    if (side !== 'center') {
      if (opposite) styles[oppositeMap[side]] = `calc(100% - ${getOffset(side)}px)`;else styles[side] = 0;
    }
    if (align !== 'center') {
      if (opposite) styles[oppositeMap[align]] = `calc(100% - ${getOffset(align)}px)`;else styles[align] = 0;
    } else {
      if (side === 'center') styles.top = styles.left = '50%';else {
        styles[{
          top: 'left',
          bottom: 'left',
          left: 'top',
          right: 'top'
        }[side]] = '50%';
      }
      styles.transform = {
        top: 'translateX(-50%)',
        bottom: 'translateX(-50%)',
        left: 'translateY(-50%)',
        right: 'translateY(-50%)',
        center: 'translate(-50%, -50%)'
      }[side];
    }
    return styles;
  });
  return {
    locationStyles
  };
}

// Utilities
const {computed: computed$x,toRef: toRef$r,toValue: toValue$3} = await importShared('vue');
// Composables
const makeChunksProps = propsFactory({
  chunkCount: {
    type: [Number, String],
    default: null
  },
  chunkWidth: {
    type: [Number, String],
    default: null
  },
  chunkGap: {
    type: [Number, String],
    default: 4
  }
}, 'chunks');
function useChunks(props, containerWidth) {
  const hasChunks = toRef$r(() => !!props.chunkCount || !!props.chunkWidth);
  const chunkWidth = computed$x(() => {
    const containerSize = toValue$3(containerWidth);
    if (!containerSize) {
      return 0;
    }
    if (!props.chunkCount) {
      return Number(props.chunkWidth);
    }
    const count = Number(props.chunkCount);
    const availableWidth = containerSize - Number(props.chunkGap) * (count - 1);
    return availableWidth / count;
  });
  const chunkGap = toRef$r(() => Number(props.chunkGap));
  const chunksMaskStyles = computed$x(() => {
    if (!hasChunks.value) {
      return {};
    }
    const chunkGapPx = convertToUnit(chunkGap.value);
    const chunkWidthPx = convertToUnit(chunkWidth.value);
    return {
      maskRepeat: 'repeat-x',
      maskImage: `linear-gradient(90deg, #000, #000 ${chunkWidthPx}, transparent ${chunkWidthPx}, transparent)`,
      maskSize: `calc(${chunkWidthPx} + ${chunkGapPx}) 100%`
    };
  });
  function snapValueToChunk(val) {
    const containerSize = toValue$3(containerWidth);
    if (!containerSize) {
      return val;
    }
    const gapRelativeSize = 100 * chunkGap.value / containerSize;
    const chunkRelativeSize = 100 * (chunkWidth.value + chunkGap.value) / containerSize;
    const filledChunks = Math.floor((val + gapRelativeSize) / chunkRelativeSize);
    return clamp(0, filledChunks * chunkRelativeSize - gapRelativeSize / 2, 100);
  }
  return {
    hasChunks,
    chunksMaskStyles,
    snapValueToChunk
  };
}

const {normalizeClass:_normalizeClass$p,createElementVNode:_createElementVNode$p,normalizeStyle:_normalizeStyle$m,createVNode:_createVNode$x} = await importShared('vue');
const {computed: computed$w,ref: ref$e,shallowRef: shallowRef$j,Transition: Transition$4,watchEffect: watchEffect$5} = await importShared('vue');
const makeVProgressLinearProps = propsFactory({
  absolute: Boolean,
  active: {
    type: Boolean,
    default: true
  },
  bgColor: String,
  bgOpacity: [Number, String],
  bufferValue: {
    type: [Number, String],
    default: 0
  },
  bufferColor: String,
  bufferOpacity: [Number, String],
  clickable: Boolean,
  color: String,
  height: {
    type: [Number, String],
    default: 4
  },
  indeterminate: Boolean,
  max: {
    type: [Number, String],
    default: 100
  },
  modelValue: {
    type: [Number, String],
    default: 0
  },
  opacity: [Number, String],
  reverse: Boolean,
  stream: Boolean,
  striped: Boolean,
  roundedBar: Boolean,
  ...makeChunksProps(),
  ...makeComponentProps(),
  ...makeLocationProps({
    location: 'top'
  }),
  ...makeRoundedProps(),
  ...makeTagProps(),
  ...makeThemeProps()
}, 'VProgressLinear');
const VProgressLinear = genericComponent()({
  name: 'VProgressLinear',
  props: makeVProgressLinearProps(),
  emits: {
    'update:modelValue': value => true
  },
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const root = ref$e();
    const progress = useProxiedModel(props, 'modelValue');
    const {
      isRtl,
      rtlClasses
    } = useRtl();
    const {
      themeClasses
    } = provideTheme(props);
    const {
      locationStyles
    } = useLocation(props);
    const {
      textColorClasses,
      textColorStyles
    } = useTextColor(() => props.color);
    const {
      backgroundColorClasses,
      backgroundColorStyles
    } = useBackgroundColor(() => props.bgColor || props.color);
    const {
      backgroundColorClasses: bufferColorClasses,
      backgroundColorStyles: bufferColorStyles
    } = useBackgroundColor(() => props.bufferColor || props.bgColor || props.color);
    const {
      backgroundColorClasses: barColorClasses,
      backgroundColorStyles: barColorStyles
    } = useBackgroundColor(() => props.color);
    const {
      roundedClasses
    } = useRounded(props);
    const {
      intersectionRef,
      isIntersecting
    } = useIntersectionObserver();
    const max = computed$w(() => parseFloat(props.max));
    const height = computed$w(() => parseFloat(props.height));
    const normalizedBuffer = computed$w(() => clamp(parseFloat(props.bufferValue) / max.value * 100, 0, 100));
    const normalizedValue = computed$w(() => clamp(parseFloat(progress.value) / max.value * 100, 0, 100));
    const isReversed = computed$w(() => isRtl.value !== props.reverse);
    const transition = computed$w(() => props.indeterminate ? 'fade-transition' : 'slide-x-transition');
    const containerWidth = shallowRef$j(0);
    const {
      hasChunks,
      chunksMaskStyles,
      snapValueToChunk
    } = useChunks(props, containerWidth);
    useToggleScope(hasChunks, () => {
      const {
        resizeRef
      } = useResizeObserver(entries => containerWidth.value = entries[0].contentRect.width);
      watchEffect$5(() => resizeRef.value = root.value);
    });
    const bufferWidth = computed$w(() => {
      return hasChunks.value ? snapValueToChunk(normalizedBuffer.value) : normalizedBuffer.value;
    });
    const barWidth = computed$w(() => {
      return hasChunks.value ? snapValueToChunk(normalizedValue.value) : normalizedValue.value;
    });
    function handleClick(e) {
      if (!intersectionRef.value) return;
      const {
        left,
        right,
        width
      } = intersectionRef.value.getBoundingClientRect();
      const value = isReversed.value ? width - e.clientX + (right - width) : e.clientX - left;
      progress.value = Math.round(value / width * max.value);
    }
    watchEffect$5(() => {
      intersectionRef.value = root.value;
    });
    useRender(() => _createVNode$x(props.tag, {
      "ref": root,
      "class": _normalizeClass$p(['v-progress-linear', {
        'v-progress-linear--absolute': props.absolute,
        'v-progress-linear--active': props.active && isIntersecting.value,
        'v-progress-linear--reverse': isReversed.value,
        'v-progress-linear--rounded': props.rounded,
        'v-progress-linear--rounded-bar': props.roundedBar,
        'v-progress-linear--striped': props.striped,
        'v-progress-linear--clickable': props.clickable
      }, roundedClasses.value, themeClasses.value, rtlClasses.value, props.class]),
      "style": _normalizeStyle$m([{
        bottom: props.location === 'bottom' ? 0 : undefined,
        top: props.location === 'top' ? 0 : undefined,
        height: props.active ? convertToUnit(height.value) : 0,
        '--v-progress-linear-height': convertToUnit(height.value),
        ...(props.absolute ? locationStyles.value : {})
      }, chunksMaskStyles.value, props.style]),
      "role": "progressbar",
      "aria-hidden": props.active ? 'false' : 'true',
      "aria-valuemin": "0",
      "aria-valuemax": props.max,
      "aria-valuenow": props.indeterminate ? undefined : Math.min(parseFloat(progress.value), max.value),
      "onClick": props.clickable && handleClick
    }, {
      default: () => [props.stream && _createElementVNode$p("div", {
        "key": "stream",
        "class": _normalizeClass$p(['v-progress-linear__stream', textColorClasses.value]),
        "style": {
          ...textColorStyles.value,
          [isReversed.value ? 'left' : 'right']: convertToUnit(-height.value),
          borderTop: `${convertToUnit(height.value / 2)} dotted`,
          opacity: parseFloat(props.bufferOpacity),
          top: `calc(50% - ${convertToUnit(height.value / 4)})`,
          width: convertToUnit(100 - normalizedBuffer.value, '%'),
          '--v-progress-linear-stream-to': convertToUnit(height.value * (isReversed.value ? 1 : -1))
        }
      }, null), _createElementVNode$p("div", {
        "class": _normalizeClass$p(['v-progress-linear__background', backgroundColorClasses.value]),
        "style": _normalizeStyle$m([backgroundColorStyles.value, {
          opacity: parseFloat(props.bgOpacity),
          width: props.stream ? 0 : undefined
        }])
      }, null), _createElementVNode$p("div", {
        "class": _normalizeClass$p(['v-progress-linear__buffer', bufferColorClasses.value]),
        "style": _normalizeStyle$m([bufferColorStyles.value, {
          opacity: parseFloat(props.bufferOpacity),
          width: convertToUnit(bufferWidth.value, '%')
        }])
      }, null), _createVNode$x(Transition$4, {
        "name": transition.value
      }, {
        default: () => [!props.indeterminate ? _createElementVNode$p("div", {
          "class": _normalizeClass$p(['v-progress-linear__determinate', barColorClasses.value]),
          "style": _normalizeStyle$m([barColorStyles.value, {
            width: convertToUnit(barWidth.value, '%')
          }])
        }, null) : _createElementVNode$p("div", {
          "class": "v-progress-linear__indeterminate"
        }, [['long', 'short'].map(bar => _createElementVNode$p("div", {
          "key": bar,
          "class": _normalizeClass$p(['v-progress-linear__indeterminate', bar, barColorClasses.value]),
          "style": _normalizeStyle$m(barColorStyles.value)
        }, null))])]
      }), slots.default && _createElementVNode$p("div", {
        "class": "v-progress-linear__content"
      }, [slots.default({
        value: normalizedValue.value,
        buffer: normalizedBuffer.value
      })])]
    }));
    return {};
  }
});

const {createVNode:_createVNode$w,normalizeClass:_normalizeClass$o,createElementVNode:_createElementVNode$o} = await importShared('vue');
const {toRef: toRef$q} = await importShared('vue');
// Composables
const makeLoaderProps = propsFactory({
  loading: [Boolean, String]
}, 'loader');
function useLoader(props) {
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getCurrentInstanceName();
  const loaderClasses = toRef$q(() => ({
    [`${name}--loading`]: props.loading
  }));
  return {
    loaderClasses
  };
}
function LoaderSlot(props, _ref) {
  let {
    slots
  } = _ref;
  return _createElementVNode$o("div", {
    "class": _normalizeClass$o(`${props.name}__loader`)
  }, [slots.default?.({
    color: props.color,
    isActive: props.active
  }) || _createVNode$w(VProgressLinear, {
    "absolute": props.absolute,
    "active": props.active,
    "color": props.color,
    "height": "2",
    "indeterminate": true
  }, null)]);
}

// Utilities
const {toRef: toRef$p} = await importShared('vue');
const positionValues = ['static', 'relative', 'fixed', 'absolute', 'sticky'];
// Composables
const makePositionProps = propsFactory({
  position: {
    type: String,
    validator: /* istanbul ignore next */v => positionValues.includes(v)
  }
}, 'position');
function usePosition(props) {
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getCurrentInstanceName();
  const positionClasses = toRef$p(() => {
    return props.position ? `${name}--${props.position}` : undefined;
  });
  return {
    positionClasses
  };
}

// Utilities
const {computed: computed$v,nextTick: nextTick$c,onScopeDispose: onScopeDispose$7,reactive: reactive$1,resolveDynamicComponent,toRef: toRef$o} = await importShared('vue');
function useRoute() {
  const vm = getCurrentInstance('useRoute');
  return computed$v(() => vm?.proxy?.$route);
}
function useRouter() {
  return getCurrentInstance('useRouter')?.proxy?.$router;
}
function useLink(props, attrs) {
  const RouterLink = resolveDynamicComponent('RouterLink');
  const isLink = toRef$o(() => !!(props.href || props.to));
  const isClickable = computed$v(() => {
    return isLink?.value || hasEvent(attrs, 'click') || hasEvent(props, 'click');
  });
  if (typeof RouterLink === 'string' || !('useLink' in RouterLink)) {
    const href = toRef$o(() => props.href);
    return {
      isLink,
      isRouterLink: toRef$o(() => false),
      isClickable,
      href,
      linkProps: reactive$1({
        href
      })
    };
  }

  // vue-router useLink `to` prop needs to be reactive and useLink will crash if undefined
  const routerLink = RouterLink.useLink({
    to: toRef$o(() => props.to || ''),
    replace: toRef$o(() => props.replace)
  });
  // Actual link needs to be undefined when to prop is not used
  const link = computed$v(() => props.to ? routerLink : undefined);
  const route = useRoute();
  const isActive = computed$v(() => {
    if (!link.value) return false;
    if (!props.exact) return link.value.isActive?.value ?? false;
    if (!route.value) return link.value.isExactActive?.value ?? false;
    return link.value.isExactActive?.value && deepEqual(link.value.route.value.query, route.value.query);
  });
  const href = computed$v(() => props.to ? link.value?.route.value.href : props.href);
  const isRouterLink = toRef$o(() => !!props.to);
  return {
    isLink,
    isRouterLink,
    isClickable,
    isActive,
    route: link.value?.route,
    navigate: link.value?.navigate,
    href,
    linkProps: reactive$1({
      href,
      'aria-current': toRef$o(() => isActive.value ? 'page' : undefined),
      'aria-disabled': toRef$o(() => props.disabled && isLink.value ? 'true' : undefined),
      tabindex: toRef$o(() => props.disabled && isLink.value ? '-1' : undefined)
    })
  };
}
const makeRouterProps = propsFactory({
  href: String,
  replace: Boolean,
  to: [String, Object],
  exact: Boolean
}, 'router');
let inTransition = false;
function useBackButton(router, cb) {
  let popped = false;
  let removeBefore;
  let removeAfter;
  if (IN_BROWSER && router?.beforeEach) {
    nextTick$c(() => {
      window.addEventListener('popstate', onPopstate);
      removeBefore = router.beforeEach((to, from, next) => {
        if (!inTransition) {
          setTimeout(() => popped ? cb(next) : next());
        } else {
          popped ? cb(next) : next();
        }
        inTransition = true;
      });
      removeAfter = router?.afterEach(() => {
        inTransition = false;
      });
    });
    onScopeDispose$7(() => {
      window.removeEventListener('popstate', onPopstate);
      removeBefore?.();
      removeAfter?.();
    });
  }
  function onPopstate(e) {
    if (e.state?.replaced) return;
    popped = true;
    setTimeout(() => popped = false);
  }
}

// Utilities
const {nextTick: nextTick$b,watch: watch$i} = await importShared('vue');


// Types

function useSelectLink(link, select) {
  watch$i(() => link.isActive?.value, isActive => {
    if (link.isLink.value && isActive != null && select) {
      nextTick$b(() => {
        select(isActive);
      });
    }
  }, {
    immediate: true
  });
}

// Styles
const stopSymbol = Symbol('rippleStop');
const DELAY_RIPPLE = 80;
function transform(el, value) {
  el.style.transform = value;
  el.style.webkitTransform = value;
}
function isTouchEvent(e) {
  return e.constructor.name === 'TouchEvent';
}
function isKeyboardEvent(e) {
  return e.constructor.name === 'KeyboardEvent';
}
const calculate = function (e, el) {
  let value = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  let localX = 0;
  let localY = 0;
  if (!isKeyboardEvent(e)) {
    const offset = el.getBoundingClientRect();
    const target = isTouchEvent(e) ? e.touches[e.touches.length - 1] : e;
    localX = target.clientX - offset.left;
    localY = target.clientY - offset.top;
  }
  let radius = 0;
  let scale = 0.3;
  if (el._ripple?.circle) {
    scale = 0.15;
    radius = el.clientWidth / 2;
    radius = value.center ? radius : radius + Math.sqrt((localX - radius) ** 2 + (localY - radius) ** 2) / 4;
  } else {
    radius = Math.sqrt(el.clientWidth ** 2 + el.clientHeight ** 2) / 2;
  }
  const centerX = `${(el.clientWidth - radius * 2) / 2}px`;
  const centerY = `${(el.clientHeight - radius * 2) / 2}px`;
  const x = value.center ? centerX : `${localX - radius}px`;
  const y = value.center ? centerY : `${localY - radius}px`;
  return {
    radius,
    scale,
    x,
    y,
    centerX,
    centerY
  };
};
const ripples = {
  /* eslint-disable max-statements */
  show(e, el) {
    let value = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    if (!el?._ripple?.enabled) {
      return;
    }
    const container = document.createElement('span');
    const animation = document.createElement('span');
    container.appendChild(animation);
    container.className = 'v-ripple__container';
    if (value.class) {
      container.className += ` ${value.class}`;
    }
    const {
      radius,
      scale,
      x,
      y,
      centerX,
      centerY
    } = calculate(e, el, value);
    const size = `${radius * 2}px`;
    animation.className = 'v-ripple__animation';
    animation.style.width = size;
    animation.style.height = size;
    el.appendChild(container);
    const computed = window.getComputedStyle(el);
    if (computed && computed.position === 'static') {
      el.style.position = 'relative';
      el.dataset.previousPosition = 'static';
    }
    animation.classList.add('v-ripple__animation--enter');
    animation.classList.add('v-ripple__animation--visible');
    transform(animation, `translate(${x}, ${y}) scale3d(${scale},${scale},${scale})`);
    animation.dataset.activated = String(performance.now());
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        animation.classList.remove('v-ripple__animation--enter');
        animation.classList.add('v-ripple__animation--in');
        transform(animation, `translate(${centerX}, ${centerY}) scale3d(1,1,1)`);
      });
    });
  },
  hide(el) {
    if (!el?._ripple?.enabled) return;
    const ripples = el.getElementsByClassName('v-ripple__animation');
    if (ripples.length === 0) return;
    const animation = Array.from(ripples).findLast(ripple => !ripple.dataset.isHiding);
    if (!animation) return;else animation.dataset.isHiding = 'true';
    const diff = performance.now() - Number(animation.dataset.activated);
    const delay = Math.max(250 - diff, 0);
    setTimeout(() => {
      animation.classList.remove('v-ripple__animation--in');
      animation.classList.add('v-ripple__animation--out');
      setTimeout(() => {
        const ripples = el.getElementsByClassName('v-ripple__animation');
        if (ripples.length === 1 && el.dataset.previousPosition) {
          el.style.position = el.dataset.previousPosition;
          delete el.dataset.previousPosition;
        }
        if (animation.parentNode?.parentNode === el) el.removeChild(animation.parentNode);
      }, 300);
    }, delay);
  }
};
function isRippleEnabled(value) {
  return typeof value === 'undefined' || !!value;
}
function rippleShow(e) {
  const value = {};
  const element = e.currentTarget;
  if (!element?._ripple || element._ripple.touched || e[stopSymbol]) return;

  // Don't allow the event to trigger ripples on any other elements
  e[stopSymbol] = true;
  if (isTouchEvent(e)) {
    element._ripple.touched = true;
    element._ripple.isTouch = true;
  } else {
    // It's possible for touch events to fire
    // as mouse events on Android/iOS, this
    // will skip the event call if it has
    // already been registered as touch
    if (element._ripple.isTouch) return;
  }
  value.center = element._ripple.centered || isKeyboardEvent(e);
  if (element._ripple.class) {
    value.class = element._ripple.class;
  }
  if (isTouchEvent(e)) {
    // already queued that shows or hides the ripple
    if (element._ripple.showTimerCommit) return;
    element._ripple.showTimerCommit = () => {
      ripples.show(e, element, value);
    };
    element._ripple.showTimer = window.setTimeout(() => {
      if (element?._ripple?.showTimerCommit) {
        element._ripple.showTimerCommit();
        element._ripple.showTimerCommit = null;
      }
    }, DELAY_RIPPLE);
  } else {
    ripples.show(e, element, value);
  }
}
function rippleStop(e) {
  e[stopSymbol] = true;
}
function rippleHide(e) {
  const element = e.currentTarget;
  if (!element?._ripple) return;
  window.clearTimeout(element._ripple.showTimer);

  // The touch interaction occurs before the show timer is triggered.
  // We still want to show ripple effect.
  if (e.type === 'touchend' && element._ripple.showTimerCommit) {
    element._ripple.showTimerCommit();
    element._ripple.showTimerCommit = null;

    // re-queue ripple hiding
    element._ripple.showTimer = window.setTimeout(() => {
      rippleHide(e);
    });
    return;
  }
  window.setTimeout(() => {
    if (element._ripple) {
      element._ripple.touched = false;
    }
  });
  ripples.hide(element);
}
function rippleCancelShow(e) {
  const element = e.currentTarget;
  if (!element?._ripple) return;
  if (element._ripple.showTimerCommit) {
    element._ripple.showTimerCommit = null;
  }
  window.clearTimeout(element._ripple.showTimer);
}
let keyboardRipple = false;
function keyboardRippleShow(e, keys) {
  if (!keyboardRipple && keys.includes(e.key)) {
    keyboardRipple = true;
    rippleShow(e);
  }
}
function keyboardRippleHide(e) {
  keyboardRipple = false;
  rippleHide(e);
}
function focusRippleHide(e) {
  if (keyboardRipple) {
    keyboardRipple = false;
    rippleHide(e);
  }
}
function updateRipple(el, binding, wasEnabled) {
  const {
    value,
    modifiers
  } = binding;
  const enabled = isRippleEnabled(value);
  if (!enabled) {
    ripples.hide(el);
  }
  el._ripple = el._ripple ?? {};
  el._ripple.enabled = enabled;
  el._ripple.centered = modifiers.center;
  el._ripple.circle = modifiers.circle;
  const bindingValue = isObject(value) ? value : {};
  if (bindingValue.class) {
    el._ripple.class = bindingValue.class;
  }
  const allowedKeys = bindingValue.keys ?? ['Enter', 'Space'];
  el._ripple.keyDownHandler = e => keyboardRippleShow(e, allowedKeys);
  if (enabled && !wasEnabled) {
    if (modifiers.stop) {
      el.addEventListener('touchstart', rippleStop, {
        passive: true
      });
      el.addEventListener('mousedown', rippleStop);
      return;
    }
    el.addEventListener('touchstart', rippleShow, {
      passive: true
    });
    el.addEventListener('touchend', rippleHide, {
      passive: true
    });
    el.addEventListener('touchmove', rippleCancelShow, {
      passive: true
    });
    el.addEventListener('touchcancel', rippleHide);
    el.addEventListener('mousedown', rippleShow);
    el.addEventListener('mouseup', rippleHide);
    el.addEventListener('mouseleave', rippleHide);
    el.addEventListener('keydown', e => keyboardRippleShow(e, allowedKeys));
    el.addEventListener('keyup', keyboardRippleHide);
    el.addEventListener('blur', focusRippleHide);

    // Anchor tags can be dragged, causes other hides to fail - #1537
    el.addEventListener('dragstart', rippleHide, {
      passive: true
    });
  } else if (!enabled && wasEnabled) {
    removeListeners(el);
  }
}
function removeListeners(el) {
  el.removeEventListener('mousedown', rippleShow);
  el.removeEventListener('touchstart', rippleShow);
  el.removeEventListener('touchend', rippleHide);
  el.removeEventListener('touchmove', rippleCancelShow);
  el.removeEventListener('touchcancel', rippleHide);
  el.removeEventListener('mouseup', rippleHide);
  el.removeEventListener('mouseleave', rippleHide);
  if (el._ripple?.keyDownHandler) {
    el.removeEventListener('keydown', el._ripple.keyDownHandler);
  }
  el.removeEventListener('keyup', keyboardRippleHide);
  el.removeEventListener('dragstart', rippleHide);
  el.removeEventListener('blur', focusRippleHide);
}
function mounted$1(el, binding) {
  updateRipple(el, binding, false);
}
function unmounted$1(el) {
  removeListeners(el);
  delete el._ripple;
}
function updated(el, binding) {
  if (binding.value === binding.oldValue) {
    return;
  }
  const wasEnabled = isRippleEnabled(binding.oldValue);
  updateRipple(el, binding, wasEnabled);
}
const Ripple = {
  mounted: mounted$1,
  unmounted: unmounted$1,
  updated
};

const {createVNode:_createVNode$v,createElementVNode:_createElementVNode$n,mergeProps:_mergeProps$h} = await importShared('vue');
const {computed: computed$u,toDisplayString: toDisplayString$3,toRef: toRef$n,withDirectives: withDirectives$1} = await importShared('vue');
const makeVBtnProps = propsFactory({
  active: {
    type: Boolean,
    default: undefined
  },
  activeColor: String,
  baseColor: String,
  symbol: {
    type: null,
    default: VBtnToggleSymbol
  },
  flat: Boolean,
  icon: [Boolean, String, Function, Object],
  prependIcon: IconValue,
  appendIcon: IconValue,
  block: Boolean,
  readonly: Boolean,
  slim: Boolean,
  stacked: Boolean,
  spaced: String,
  ripple: {
    type: [Boolean, Object],
    default: true
  },
  text: {
    type: [String, Number, Boolean],
    default: undefined
  },
  ...makeBorderProps(),
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeDimensionProps(),
  ...makeElevationProps(),
  ...makeGroupItemProps(),
  ...makeLoaderProps(),
  ...makeLocationProps(),
  ...makePositionProps(),
  ...makeRoundedProps(),
  ...makeRouterProps(),
  ...makeSizeProps(),
  ...makeTagProps({
    tag: 'button'
  }),
  ...makeThemeProps(),
  ...makeVariantProps({
    variant: 'elevated'
  })
}, 'VBtn');
const VBtn = genericComponent()({
  name: 'VBtn',
  props: makeVBtnProps(),
  emits: {
    'group:selected': val => true
  },
  setup(props, _ref) {
    let {
      attrs,
      slots
    } = _ref;
    const {
      themeClasses
    } = provideTheme(props);
    const {
      borderClasses
    } = useBorder(props);
    const {
      densityClasses
    } = useDensity(props);
    const {
      dimensionStyles
    } = useDimension(props);
    const {
      elevationClasses
    } = useElevation(props);
    const {
      loaderClasses
    } = useLoader(props);
    const {
      locationStyles
    } = useLocation(props);
    const {
      positionClasses
    } = usePosition(props);
    const {
      roundedClasses
    } = useRounded(props);
    const {
      sizeClasses,
      sizeStyles
    } = useSize(props);
    const group = useGroupItem(props, props.symbol, false);
    const link = useLink(props, attrs);
    const isActive = computed$u(() => {
      if (props.active !== undefined) {
        return props.active;
      }
      if (link.isRouterLink.value) {
        return link.isActive?.value;
      }
      return group?.isSelected.value;
    });
    const color = toRef$n(() => isActive.value ? props.activeColor ?? props.color : props.color);
    const variantProps = computed$u(() => {
      const showColor = group?.isSelected.value && (!link.isLink.value || link.isActive?.value) || !group || link.isActive?.value;
      return {
        color: showColor ? color.value ?? props.baseColor : props.baseColor,
        variant: props.variant
      };
    });
    const {
      colorClasses,
      colorStyles,
      variantClasses
    } = useVariant(variantProps);
    const isDisabled = computed$u(() => group?.disabled.value || props.disabled);
    const isElevated = toRef$n(() => {
      return props.variant === 'elevated' && !(props.disabled || props.flat || props.border);
    });
    const valueAttr = computed$u(() => {
      if (props.value === undefined || typeof props.value === 'symbol') return undefined;
      return Object(props.value) === props.value ? JSON.stringify(props.value, null, 0) : props.value;
    });
    function onClick(e) {
      if (isDisabled.value || link.isLink.value && (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || attrs.target === '_blank')) return;
      if (link.isRouterLink.value) {
        link.navigate?.(e);
      } else {
        // Group active state for links is handled by useSelectLink
        group?.toggle();
      }
    }
    useSelectLink(link, group?.select);
    useRender(() => {
      const Tag = link.isLink.value ? 'a' : props.tag;
      const hasPrepend = !!(props.prependIcon || slots.prepend);
      const hasAppend = !!(props.appendIcon || slots.append);
      const hasIcon = !!(props.icon && props.icon !== true);
      return withDirectives$1(_createVNode$v(Tag, _mergeProps$h(link.linkProps, {
        "type": Tag === 'a' ? undefined : 'button',
        "class": ['v-btn', group?.selectedClass.value, {
          'v-btn--active': isActive.value,
          'v-btn--block': props.block,
          'v-btn--disabled': isDisabled.value,
          'v-btn--elevated': isElevated.value,
          'v-btn--flat': props.flat,
          'v-btn--icon': !!props.icon,
          'v-btn--loading': props.loading,
          'v-btn--readonly': props.readonly,
          'v-btn--slim': props.slim,
          'v-btn--stacked': props.stacked
        }, props.spaced ? ['v-btn--spaced', `v-btn--spaced-${props.spaced}`] : [], themeClasses.value, borderClasses.value, colorClasses.value, densityClasses.value, elevationClasses.value, loaderClasses.value, positionClasses.value, roundedClasses.value, sizeClasses.value, variantClasses.value, props.class],
        "style": [colorStyles.value, dimensionStyles.value, locationStyles.value, sizeStyles.value, props.style],
        "aria-busy": props.loading ? true : undefined,
        "disabled": isDisabled.value && Tag !== 'a' || undefined,
        "tabindex": props.loading || props.readonly ? -1 : undefined,
        "onClick": onClick,
        "value": valueAttr.value
      }), {
        default: () => [genOverlays(true, 'v-btn'), !props.icon && hasPrepend && _createElementVNode$n("span", {
          "key": "prepend",
          "class": "v-btn__prepend"
        }, [!slots.prepend ? _createVNode$v(VIcon, {
          "key": "prepend-icon",
          "icon": props.prependIcon
        }, null) : _createVNode$v(VDefaultsProvider, {
          "key": "prepend-defaults",
          "disabled": !props.prependIcon,
          "defaults": {
            VIcon: {
              icon: props.prependIcon
            }
          }
        }, slots.prepend)]), _createElementVNode$n("span", {
          "class": "v-btn__content",
          "data-no-activator": ""
        }, [!slots.default && hasIcon ? _createVNode$v(VIcon, {
          "key": "content-icon",
          "icon": props.icon
        }, null) : _createVNode$v(VDefaultsProvider, {
          "key": "content-defaults",
          "disabled": !hasIcon,
          "defaults": {
            VIcon: {
              icon: props.icon
            }
          }
        }, {
          default: () => [slots.default?.() ?? toDisplayString$3(props.text)]
        })]), !props.icon && hasAppend && _createElementVNode$n("span", {
          "key": "append",
          "class": "v-btn__append"
        }, [!slots.append ? _createVNode$v(VIcon, {
          "key": "append-icon",
          "icon": props.appendIcon
        }, null) : _createVNode$v(VDefaultsProvider, {
          "key": "append-defaults",
          "disabled": !props.appendIcon,
          "defaults": {
            VIcon: {
              icon: props.appendIcon
            }
          }
        }, slots.append)]), !!props.loading && _createElementVNode$n("span", {
          "key": "loader",
          "class": "v-btn__loader"
        }, [slots.loader?.() ?? _createVNode$v(VProgressCircular, {
          "color": typeof props.loading === 'boolean' ? undefined : props.loading,
          "indeterminate": true,
          "width": "2"
        }, null)])]
      }), [[Ripple, !isDisabled.value && props.ripple, '', {
        center: !!props.icon
      }]]);
    });
    return {
      group
    };
  }
});

// Utilities
const {computed: computed$t} = await importShared('vue');
// Types
// Composables
const makeIconSizeProps = propsFactory({
  iconSize: [Number, String],
  iconSizes: {
    type: Array,
    default: () => [['x-small', 10], ['small', 16], ['default', 24], ['large', 28], ['x-large', 32]]
  }
}, 'iconSize');
function useIconSizes(props, fallback) {
  const iconSize = computed$t(() => {
    const iconSizeMap = new Map(props.iconSizes);
    const _iconSize = props.iconSize ?? fallback() ?? 'default';
    return iconSizeMap.has(_iconSize) ? iconSizeMap.get(_iconSize) : _iconSize;
  });
  return {
    iconSize
  };
}

const {normalizeClass:_normalizeClass$n,normalizeStyle:_normalizeStyle$l,createElementVNode:_createElementVNode$m,mergeProps:_mergeProps$g,createVNode:_createVNode$u} = await importShared('vue');
const {toRef: toRef$m} = await importShared('vue');
const allowedTypes = ['success', 'info', 'warning', 'error'];
const makeVAlertProps = propsFactory({
  border: {
    type: [Boolean, String],
    validator: val => {
      return typeof val === 'boolean' || ['top', 'end', 'bottom', 'start'].includes(val);
    }
  },
  borderColor: String,
  closable: Boolean,
  closeIcon: {
    type: IconValue,
    default: '$close'
  },
  closeLabel: {
    type: String,
    default: '$vuetify.close'
  },
  icon: {
    type: [Boolean, String, Function, Object],
    default: null
  },
  modelValue: {
    type: Boolean,
    default: true
  },
  prominent: Boolean,
  title: String,
  text: String,
  type: {
    type: String,
    validator: val => allowedTypes.includes(val)
  },
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeDimensionProps(),
  ...makeElevationProps(),
  ...makeIconSizeProps(),
  ...makeLocationProps(),
  ...makePositionProps(),
  ...makeRoundedProps(),
  ...makeTagProps(),
  ...makeThemeProps(),
  ...makeVariantProps({
    variant: 'flat'
  })
}, 'VAlert');
const VAlert = genericComponent()({
  name: 'VAlert',
  props: makeVAlertProps(),
  emits: {
    'click:close': e => true,
    'update:modelValue': value => true
  },
  setup(props, _ref) {
    let {
      emit,
      slots
    } = _ref;
    const isActive = useProxiedModel(props, 'modelValue');
    const icon = toRef$m(() => {
      if (props.icon === false) return undefined;
      if (!props.type) return props.icon;
      return props.icon ?? `$${props.type}`;
    });
    const {
      iconSize
    } = useIconSizes(props, () => props.prominent ? 44 : undefined);
    const {
      themeClasses
    } = provideTheme(props);
    const {
      colorClasses,
      colorStyles,
      variantClasses
    } = useVariant(() => ({
      color: props.color ?? props.type,
      variant: props.variant
    }));
    const {
      densityClasses
    } = useDensity(props);
    const {
      dimensionStyles
    } = useDimension(props);
    const {
      elevationClasses
    } = useElevation(props);
    const {
      locationStyles
    } = useLocation(props);
    const {
      positionClasses
    } = usePosition(props);
    const {
      roundedClasses
    } = useRounded(props);
    const {
      textColorClasses,
      textColorStyles
    } = useTextColor(() => props.borderColor);
    const {
      t
    } = useLocale();
    const closeProps = toRef$m(() => ({
      'aria-label': t(props.closeLabel),
      onClick(e) {
        isActive.value = false;
        emit('click:close', e);
      }
    }));
    return () => {
      const hasPrepend = !!(slots.prepend || icon.value);
      const hasTitle = !!(slots.title || props.title);
      const hasClose = !!(slots.close || props.closable);
      const iconProps = {
        density: props.density,
        icon: icon.value,
        size: props.iconSize || props.prominent ? iconSize.value : undefined
      };
      return isActive.value && _createVNode$u(props.tag, {
        "class": _normalizeClass$n(['v-alert', props.border && {
          'v-alert--border': !!props.border,
          [`v-alert--border-${props.border === true ? 'start' : props.border}`]: true
        }, {
          'v-alert--prominent': props.prominent
        }, themeClasses.value, colorClasses.value, densityClasses.value, elevationClasses.value, positionClasses.value, roundedClasses.value, variantClasses.value, props.class]),
        "style": _normalizeStyle$l([colorStyles.value, dimensionStyles.value, locationStyles.value, props.style]),
        "role": "alert"
      }, {
        default: () => [genOverlays(false, 'v-alert'), props.border && _createElementVNode$m("div", {
          "key": "border",
          "class": _normalizeClass$n(['v-alert__border', textColorClasses.value]),
          "style": _normalizeStyle$l(textColorStyles.value)
        }, null), hasPrepend && _createElementVNode$m("div", {
          "key": "prepend",
          "class": "v-alert__prepend"
        }, [!slots.prepend ? _createVNode$u(VIcon, _mergeProps$g({
          "key": "prepend-icon"
        }, iconProps), null) : _createVNode$u(VDefaultsProvider, {
          "key": "prepend-defaults",
          "disabled": !icon.value,
          "defaults": {
            VIcon: {
              ...iconProps
            }
          }
        }, slots.prepend)]), _createElementVNode$m("div", {
          "class": "v-alert__content"
        }, [hasTitle && _createVNode$u(VAlertTitle, {
          "key": "title"
        }, {
          default: () => [slots.title?.() ?? props.title]
        }), slots.text?.() ?? props.text, slots.default?.()]), slots.append && _createElementVNode$m("div", {
          "key": "append",
          "class": "v-alert__append"
        }, [slots.append()]), hasClose && _createElementVNode$m("div", {
          "key": "close",
          "class": "v-alert__close"
        }, [!slots.close ? _createVNode$u(VBtn, _mergeProps$g({
          "key": "close-btn",
          "icon": props.closeIcon,
          "size": "x-small",
          "variant": "text"
        }, closeProps.value), null) : _createVNode$u(VDefaultsProvider, {
          "key": "close-defaults",
          "defaults": {
            VBtn: {
              icon: props.closeIcon,
              size: 'x-small',
              variant: 'text'
            }
          }
        }, {
          default: () => [slots.close?.({
            props: closeProps.value
          })]
        })])]
      });
    };
  }
});

const {normalizeClass:_normalizeClass$m,normalizeStyle:_normalizeStyle$k,createVNode:_createVNode$t} = await importShared('vue');
const makeVCardActionsProps = propsFactory({
  ...makeComponentProps(),
  ...makeTagProps()
}, 'VCardActions');
const VCardActions = genericComponent()({
  name: 'VCardActions',
  props: makeVCardActionsProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    provideDefaults({
      VBtn: {
        slim: true,
        variant: 'text'
      }
    });
    useRender(() => _createVNode$t(props.tag, {
      "class": _normalizeClass$m(['v-card-actions', props.class]),
      "style": _normalizeStyle$k(props.style)
    }, slots));
    return {};
  }
});

const {normalizeClass:_normalizeClass$l,normalizeStyle:_normalizeStyle$j,createVNode:_createVNode$s} = await importShared('vue');
const makeVCardSubtitleProps = propsFactory({
  opacity: [Number, String],
  ...makeComponentProps(),
  ...makeTagProps()
}, 'VCardSubtitle');
const VCardSubtitle = genericComponent()({
  name: 'VCardSubtitle',
  props: makeVCardSubtitleProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    useRender(() => _createVNode$s(props.tag, {
      "class": _normalizeClass$l(['v-card-subtitle', props.class]),
      "style": _normalizeStyle$j([{
        '--v-card-subtitle-opacity': props.opacity
      }, props.style])
    }, slots));
    return {};
  }
});

// Utilities
const VCardTitle = createSimpleFunctional('v-card-title');

const {normalizeStyle:_normalizeStyle$i,createElementVNode:_createElementVNode$l,normalizeClass:_normalizeClass$k} = await importShared('vue');
const {computed: computed$s} = await importShared('vue');
function useAspectStyles(props) {
  return {
    aspectStyles: computed$s(() => {
      const ratio = Number(props.aspectRatio);
      return ratio ? {
        paddingBottom: String(1 / ratio * 100) + '%'
      } : undefined;
    })
  };
}
const makeVResponsiveProps = propsFactory({
  aspectRatio: [String, Number],
  contentClass: null,
  inline: Boolean,
  ...makeComponentProps(),
  ...makeDimensionProps()
}, 'VResponsive');
const VResponsive = genericComponent()({
  name: 'VResponsive',
  props: makeVResponsiveProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      aspectStyles
    } = useAspectStyles(props);
    const {
      dimensionStyles
    } = useDimension(props);
    useRender(() => _createElementVNode$l("div", {
      "class": _normalizeClass$k(['v-responsive', {
        'v-responsive--inline': props.inline
      }, props.class]),
      "style": _normalizeStyle$i([dimensionStyles.value, props.style])
    }, [_createElementVNode$l("div", {
      "class": "v-responsive__sizer",
      "style": _normalizeStyle$i(aspectStyles.value)
    }, null), slots.additional?.(), slots.default && _createElementVNode$l("div", {
      "class": _normalizeClass$k(['v-responsive__content', props.contentClass])
    }, [slots.default()])]));
    return {};
  }
});

// Utilities
const {h: h$3,mergeProps: mergeProps$5,Transition: Transition$3,TransitionGroup: TransitionGroup$1} = await importShared('vue');
const makeTransitionProps$1 = propsFactory({
  transition: {
    type: null,
    default: 'fade-transition',
    validator: val => val !== true
  }
}, 'transition');
const MaybeTransition = (props, _ref) => {
  let {
    slots
  } = _ref;
  const {
    transition,
    disabled,
    group,
    ...rest
  } = props;
  const {
    component = group ? TransitionGroup$1 : Transition$3,
    ...customProps
  } = isObject(transition) ? transition : {};
  let transitionProps;
  if (isObject(transition)) {
    transitionProps = mergeProps$5(customProps, onlyDefinedProps({
      disabled,
      group
    }), rest);
  } else {
    transitionProps = mergeProps$5({
      name: disabled || !transition ? '' : transition
    }, rest);
  }
  return h$3(component, transitionProps, slots);
};

// Utilities
function mounted(el, binding) {
  if (!SUPPORTS_INTERSECTION) return;
  const modifiers = binding.modifiers || {};
  const value = binding.value;
  const {
    handler,
    options
  } = typeof value === 'object' ? value : {
    handler: value,
    options: {}
  };
  const observer = new IntersectionObserver(function () {
    let entries = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    let observer = arguments.length > 1 ? arguments[1] : undefined;
    const _observe = el._observe?.[binding.instance.$.uid];
    if (!_observe) return; // Just in case, should never fire

    const isIntersecting = entries.some(entry => entry.isIntersecting);

    // If is not quiet or has already been
    // initted, invoke the user callback
    if (handler && (!modifiers.quiet || _observe.init) && (!modifiers.once || isIntersecting || _observe.init)) {
      handler(isIntersecting, entries, observer);
    }
    if (isIntersecting && modifiers.once) unmounted(el, binding);else _observe.init = true;
  }, options);
  el._observe = Object(el._observe);
  el._observe[binding.instance.$.uid] = {
    init: false,
    observer
  };
  observer.observe(el);
}
function unmounted(el, binding) {
  const observe = el._observe?.[binding.instance.$.uid];
  if (!observe) return;
  observe.observer.unobserve(el);
  delete el._observe[binding.instance.$.uid];
}
const Intersect = {
  mounted,
  unmounted
};

const {normalizeClass:_normalizeClass$j,createElementVNode:_createElementVNode$k,createVNode:_createVNode$r,Fragment:_Fragment$a,mergeProps:_mergeProps$f,withDirectives:_withDirectives$9} = await importShared('vue');
const {computed: computed$r,nextTick: nextTick$a,onBeforeMount: onBeforeMount$3,onBeforeUnmount: onBeforeUnmount$4,ref: ref$d,shallowRef: shallowRef$i,toRef: toRef$l,vShow,watch: watch$h,withDirectives} = await importShared('vue');
// not intended for public use, this is passed in by vuetify-loader
const makeVImgProps = propsFactory({
  absolute: Boolean,
  alt: String,
  cover: Boolean,
  color: String,
  draggable: {
    type: [Boolean, String],
    default: undefined
  },
  eager: Boolean,
  gradient: String,
  lazySrc: String,
  options: {
    type: Object,
    // For more information on types, navigate to:
    // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
    default: () => ({
      root: undefined,
      rootMargin: undefined,
      threshold: undefined
    })
  },
  sizes: String,
  src: {
    type: [String, Object],
    default: ''
  },
  crossorigin: String,
  referrerpolicy: String,
  srcset: String,
  position: String,
  ...makeVResponsiveProps(),
  ...makeComponentProps(),
  ...makeRoundedProps(),
  ...makeTransitionProps$1()
}, 'VImg');
const VImg = genericComponent()({
  name: 'VImg',
  directives: {
    vIntersect: Intersect
  },
  props: makeVImgProps(),
  emits: {
    loadstart: value => true,
    load: value => true,
    error: value => true
  },
  setup(props, _ref) {
    let {
      emit,
      slots
    } = _ref;
    const {
      backgroundColorClasses,
      backgroundColorStyles
    } = useBackgroundColor(() => props.color);
    const {
      roundedClasses
    } = useRounded(props);
    const vm = getCurrentInstance('VImg');
    const currentSrc = shallowRef$i(''); // Set from srcset
    const image = ref$d();
    const state = shallowRef$i(props.eager ? 'loading' : 'idle');
    const naturalWidth = shallowRef$i();
    const naturalHeight = shallowRef$i();
    const normalisedSrc = computed$r(() => {
      return props.src && typeof props.src === 'object' ? {
        src: props.src.src,
        srcset: props.srcset || props.src.srcset,
        lazySrc: props.lazySrc || props.src.lazySrc,
        aspect: Number(props.aspectRatio || props.src.aspect || 0)
      } : {
        src: props.src,
        srcset: props.srcset,
        lazySrc: props.lazySrc,
        aspect: Number(props.aspectRatio || 0)
      };
    });
    const aspectRatio = computed$r(() => {
      return normalisedSrc.value.aspect || naturalWidth.value / naturalHeight.value || 0;
    });
    watch$h(() => props.src, () => {
      init(state.value !== 'idle');
    });
    watch$h(aspectRatio, (val, oldVal) => {
      if (!val && oldVal && image.value) {
        pollForSize(image.value);
      }
    });

    // TODO: getSrc when window width changes

    onBeforeMount$3(() => init());
    function init(isIntersecting) {
      if (props.eager && isIntersecting) return;
      if (SUPPORTS_INTERSECTION && !isIntersecting && !props.eager) return;
      state.value = 'loading';
      if (normalisedSrc.value.lazySrc) {
        const lazyImg = new Image();
        lazyImg.src = normalisedSrc.value.lazySrc;
        pollForSize(lazyImg, null);
      }
      if (!normalisedSrc.value.src) return;
      nextTick$a(() => {
        emit('loadstart', image.value?.currentSrc || normalisedSrc.value.src);
        setTimeout(() => {
          if (vm.isUnmounted) return;
          if (image.value?.complete) {
            if (!image.value.naturalWidth) {
              onError();
            }
            if (state.value === 'error') return;
            if (!aspectRatio.value) pollForSize(image.value, null);
            if (state.value === 'loading') onLoad();
          } else {
            if (!aspectRatio.value) pollForSize(image.value);
            getSrc();
          }
        });
      });
    }
    function onLoad() {
      if (vm.isUnmounted) return;
      getSrc();
      pollForSize(image.value);
      state.value = 'loaded';
      emit('load', image.value?.currentSrc || normalisedSrc.value.src);
    }
    function onError() {
      if (vm.isUnmounted) return;
      state.value = 'error';
      emit('error', image.value?.currentSrc || normalisedSrc.value.src);
    }
    function getSrc() {
      const img = image.value;
      if (img) currentSrc.value = img.currentSrc || img.src;
    }
    let timer = -1;
    onBeforeUnmount$4(() => {
      clearTimeout(timer);
    });
    function pollForSize(img) {
      let timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
      const poll = () => {
        clearTimeout(timer);
        if (vm.isUnmounted) return;
        const {
          naturalHeight: imgHeight,
          naturalWidth: imgWidth
        } = img;
        if (imgHeight || imgWidth) {
          naturalWidth.value = imgWidth;
          naturalHeight.value = imgHeight;
        } else if (!img.complete && state.value === 'loading' && timeout != null) {
          timer = window.setTimeout(poll, timeout);
        } else if (img.currentSrc.endsWith('.svg') || img.currentSrc.startsWith('data:image/svg+xml')) {
          naturalWidth.value = 1;
          naturalHeight.value = 1;
        }
      };
      poll();
    }
    const containClasses = toRef$l(() => ({
      'v-img__img--cover': props.cover,
      'v-img__img--contain': !props.cover
    }));
    const __image = () => {
      if (!normalisedSrc.value.src || state.value === 'idle') return null;
      const img = _createElementVNode$k("img", {
        "class": _normalizeClass$j(['v-img__img', containClasses.value]),
        "style": {
          objectPosition: props.position
        },
        "crossorigin": props.crossorigin,
        "src": normalisedSrc.value.src,
        "srcset": normalisedSrc.value.srcset,
        "alt": props.alt,
        "referrerpolicy": props.referrerpolicy,
        "draggable": props.draggable,
        "sizes": props.sizes,
        "ref": image,
        "onLoad": onLoad,
        "onError": onError
      }, null);
      const sources = slots.sources?.();
      return _createVNode$r(MaybeTransition, {
        "transition": props.transition,
        "appear": true
      }, {
        default: () => [withDirectives(sources ? _createElementVNode$k("picture", {
          "class": "v-img__picture"
        }, [sources, img]) : img, [[vShow, state.value === 'loaded']])]
      });
    };
    const __preloadImage = () => _createVNode$r(MaybeTransition, {
      "transition": props.transition
    }, {
      default: () => [normalisedSrc.value.lazySrc && state.value !== 'loaded' && _createElementVNode$k("img", {
        "class": _normalizeClass$j(['v-img__img', 'v-img__img--preload', containClasses.value]),
        "style": {
          objectPosition: props.position
        },
        "crossorigin": props.crossorigin,
        "src": normalisedSrc.value.lazySrc,
        "alt": props.alt,
        "referrerpolicy": props.referrerpolicy,
        "draggable": props.draggable
      }, null)]
    });
    const __placeholder = () => {
      if (!slots.placeholder) return null;
      return _createVNode$r(MaybeTransition, {
        "transition": props.transition,
        "appear": true
      }, {
        default: () => [(state.value === 'loading' || state.value === 'error' && !slots.error) && _createElementVNode$k("div", {
          "class": "v-img__placeholder"
        }, [slots.placeholder()])]
      });
    };
    const __error = () => {
      if (!slots.error) return null;
      return _createVNode$r(MaybeTransition, {
        "transition": props.transition,
        "appear": true
      }, {
        default: () => [state.value === 'error' && _createElementVNode$k("div", {
          "class": "v-img__error"
        }, [slots.error()])]
      });
    };
    const __gradient = () => {
      if (!props.gradient) return null;
      return _createElementVNode$k("div", {
        "class": "v-img__gradient",
        "style": {
          backgroundImage: `linear-gradient(${props.gradient})`
        }
      }, null);
    };
    const isBooted = shallowRef$i(false);
    {
      const stop = watch$h(aspectRatio, val => {
        if (val) {
          // Doesn't work with nextTick, idk why
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              isBooted.value = true;
            });
          });
          stop();
        }
      });
    }
    useRender(() => {
      const responsiveProps = VResponsive.filterProps(props);
      return _withDirectives$9(_createVNode$r(VResponsive, _mergeProps$f({
        "class": ['v-img', {
          'v-img--absolute': props.absolute,
          'v-img--booting': !isBooted.value
        }, backgroundColorClasses.value, roundedClasses.value, props.class],
        "style": [{
          width: convertToUnit(props.width === 'auto' ? naturalWidth.value : props.width)
        }, backgroundColorStyles.value, props.style]
      }, responsiveProps, {
        "aspectRatio": aspectRatio.value,
        "aria-label": props.alt,
        "role": props.alt ? 'img' : undefined
      }), {
        additional: () => _createElementVNode$k(_Fragment$a, null, [_createVNode$r(__image, null, null), _createVNode$r(__preloadImage, null, null), _createVNode$r(__gradient, null, null), _createVNode$r(__placeholder, null, null), _createVNode$r(__error, null, null)]),
        default: slots.default
      }), [[Intersect, {
        handler: init,
        options: props.options
      }, null, {
        once: true
      }]]);
    });
    return {
      currentSrc,
      image,
      state,
      naturalWidth,
      naturalHeight
    };
  }
});

const {createVNode:_createVNode$q,normalizeClass:_normalizeClass$i,normalizeStyle:_normalizeStyle$h} = await importShared('vue');
const makeVAvatarProps = propsFactory({
  start: Boolean,
  end: Boolean,
  icon: IconValue,
  image: String,
  text: String,
  ...makeBorderProps(),
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeRoundedProps(),
  ...makeSizeProps(),
  ...makeTagProps(),
  ...makeThemeProps(),
  ...makeVariantProps({
    variant: 'flat'
  })
}, 'VAvatar');
const VAvatar = genericComponent()({
  name: 'VAvatar',
  props: makeVAvatarProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      themeClasses
    } = provideTheme(props);
    const {
      borderClasses
    } = useBorder(props);
    const {
      colorClasses,
      colorStyles,
      variantClasses
    } = useVariant(props);
    const {
      densityClasses
    } = useDensity(props);
    const {
      roundedClasses
    } = useRounded(props);
    const {
      sizeClasses,
      sizeStyles
    } = useSize(props);
    useRender(() => _createVNode$q(props.tag, {
      "class": _normalizeClass$i(['v-avatar', {
        'v-avatar--start': props.start,
        'v-avatar--end': props.end
      }, themeClasses.value, borderClasses.value, colorClasses.value, densityClasses.value, roundedClasses.value, sizeClasses.value, variantClasses.value, props.class]),
      "style": _normalizeStyle$h([colorStyles.value, sizeStyles.value, props.style])
    }, {
      default: () => [!slots.default ? props.image ? _createVNode$q(VImg, {
        "key": "image",
        "src": props.image,
        "alt": "",
        "cover": true
      }, null) : props.icon ? _createVNode$q(VIcon, {
        "key": "icon",
        "icon": props.icon
      }, null) : props.text : _createVNode$q(VDefaultsProvider, {
        "key": "content-defaults",
        "defaults": {
          VImg: {
            cover: true,
            src: props.image
          },
          VIcon: {
            icon: props.icon
          }
        }
      }, {
        default: () => [slots.default()]
      }), genOverlays(false, 'v-avatar')]
    }));
    return {};
  }
});

const {Fragment:_Fragment$9,createVNode:_createVNode$p,createElementVNode:_createElementVNode$j,normalizeClass:_normalizeClass$h,normalizeStyle:_normalizeStyle$g} = await importShared('vue');
const {toDisplayString: toDisplayString$2} = await importShared('vue');
const makeCardItemProps = propsFactory({
  appendAvatar: String,
  appendIcon: IconValue,
  prependAvatar: String,
  prependIcon: IconValue,
  subtitle: {
    type: [String, Number, Boolean],
    default: undefined
  },
  title: {
    type: [String, Number, Boolean],
    default: undefined
  },
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeTagProps()
}, 'VCardItem');
const VCardItem = genericComponent()({
  name: 'VCardItem',
  props: makeCardItemProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    useRender(() => {
      const hasPrependMedia = !!(props.prependAvatar || props.prependIcon);
      const hasPrepend = !!(hasPrependMedia || slots.prepend);
      const hasAppendMedia = !!(props.appendAvatar || props.appendIcon);
      const hasAppend = !!(hasAppendMedia || slots.append);
      const hasTitle = !!(props.title != null || slots.title);
      const hasSubtitle = !!(props.subtitle != null || slots.subtitle);
      return _createVNode$p(props.tag, {
        "class": _normalizeClass$h(['v-card-item', props.class]),
        "style": _normalizeStyle$g(props.style)
      }, {
        default: () => [hasPrepend && _createElementVNode$j("div", {
          "key": "prepend",
          "class": "v-card-item__prepend"
        }, [!slots.prepend ? _createElementVNode$j(_Fragment$9, null, [props.prependAvatar && _createVNode$p(VAvatar, {
          "key": "prepend-avatar",
          "density": props.density,
          "image": props.prependAvatar
        }, null), props.prependIcon && _createVNode$p(VIcon, {
          "key": "prepend-icon",
          "density": props.density,
          "icon": props.prependIcon
        }, null)]) : _createVNode$p(VDefaultsProvider, {
          "key": "prepend-defaults",
          "disabled": !hasPrependMedia,
          "defaults": {
            VAvatar: {
              density: props.density,
              image: props.prependAvatar
            },
            VIcon: {
              density: props.density,
              icon: props.prependIcon
            }
          }
        }, slots.prepend)]), _createElementVNode$j("div", {
          "class": "v-card-item__content"
        }, [hasTitle && _createVNode$p(VCardTitle, {
          "key": "title"
        }, {
          default: () => [slots.title?.() ?? toDisplayString$2(props.title)]
        }), hasSubtitle && _createVNode$p(VCardSubtitle, {
          "key": "subtitle"
        }, {
          default: () => [slots.subtitle?.() ?? toDisplayString$2(props.subtitle)]
        }), slots.default?.()]), hasAppend && _createElementVNode$j("div", {
          "key": "append",
          "class": "v-card-item__append"
        }, [!slots.append ? _createElementVNode$j(_Fragment$9, null, [props.appendIcon && _createVNode$p(VIcon, {
          "key": "append-icon",
          "density": props.density,
          "icon": props.appendIcon
        }, null), props.appendAvatar && _createVNode$p(VAvatar, {
          "key": "append-avatar",
          "density": props.density,
          "image": props.appendAvatar
        }, null)]) : _createVNode$p(VDefaultsProvider, {
          "key": "append-defaults",
          "disabled": !hasAppendMedia,
          "defaults": {
            VAvatar: {
              density: props.density,
              image: props.appendAvatar
            },
            VIcon: {
              density: props.density,
              icon: props.appendIcon
            }
          }
        }, slots.append)])]
      });
    });
    return {};
  }
});

const {normalizeClass:_normalizeClass$g,normalizeStyle:_normalizeStyle$f,createVNode:_createVNode$o} = await importShared('vue');
const makeVCardTextProps = propsFactory({
  opacity: [Number, String],
  ...makeComponentProps(),
  ...makeTagProps()
}, 'VCardText');
const VCardText = genericComponent()({
  name: 'VCardText',
  props: makeVCardTextProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    useRender(() => _createVNode$o(props.tag, {
      "class": _normalizeClass$g(['v-card-text', props.class]),
      "style": _normalizeStyle$f([{
        '--v-card-text-opacity': props.opacity
      }, props.style])
    }, slots));
    return {};
  }
});

const {createVNode:_createVNode$n,createElementVNode:_createElementVNode$i,mergeProps:_mergeProps$e,withDirectives:_withDirectives$8} = await importShared('vue');
const {shallowRef: shallowRef$h,watch: watch$g} = await importShared('vue');
const makeVCardProps = propsFactory({
  appendAvatar: String,
  appendIcon: IconValue,
  disabled: Boolean,
  flat: Boolean,
  hover: Boolean,
  image: String,
  link: {
    type: Boolean,
    default: undefined
  },
  prependAvatar: String,
  prependIcon: IconValue,
  ripple: {
    type: [Boolean, Object],
    default: true
  },
  subtitle: {
    type: [String, Number, Boolean],
    default: undefined
  },
  text: {
    type: [String, Number, Boolean],
    default: undefined
  },
  title: {
    type: [String, Number, Boolean],
    default: undefined
  },
  ...makeBorderProps(),
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeDimensionProps(),
  ...makeElevationProps(),
  ...makeLoaderProps(),
  ...makeLocationProps(),
  ...makePositionProps(),
  ...makeRoundedProps(),
  ...makeRouterProps(),
  ...makeTagProps(),
  ...makeThemeProps(),
  ...makeVariantProps({
    variant: 'elevated'
  })
}, 'VCard');
const VCard = genericComponent()({
  name: 'VCard',
  directives: {
    vRipple: Ripple
  },
  props: makeVCardProps(),
  setup(props, _ref) {
    let {
      attrs,
      slots
    } = _ref;
    const {
      themeClasses
    } = provideTheme(props);
    const {
      borderClasses
    } = useBorder(props);
    const {
      colorClasses,
      colorStyles,
      variantClasses
    } = useVariant(props);
    const {
      densityClasses
    } = useDensity(props);
    const {
      dimensionStyles
    } = useDimension(props);
    const {
      elevationClasses
    } = useElevation(props);
    const {
      loaderClasses
    } = useLoader(props);
    const {
      locationStyles
    } = useLocation(props);
    const {
      positionClasses
    } = usePosition(props);
    const {
      roundedClasses
    } = useRounded(props);
    const link = useLink(props, attrs);
    const loadingColor = shallowRef$h(undefined);
    watch$g(() => props.loading, (val, old) => {
      loadingColor.value = !val && typeof old === 'string' ? old : typeof val === 'boolean' ? undefined : val;
    }, {
      immediate: true
    });
    useRender(() => {
      const isLink = props.link !== false && link.isLink.value;
      const isClickable = !props.disabled && props.link !== false && (props.link || link.isClickable.value);
      const Tag = isLink ? 'a' : props.tag;
      const hasTitle = !!(slots.title || props.title != null);
      const hasSubtitle = !!(slots.subtitle || props.subtitle != null);
      const hasHeader = hasTitle || hasSubtitle;
      const hasAppend = !!(slots.append || props.appendAvatar || props.appendIcon);
      const hasPrepend = !!(slots.prepend || props.prependAvatar || props.prependIcon);
      const hasImage = !!(slots.image || props.image);
      const hasCardItem = hasHeader || hasPrepend || hasAppend;
      const hasText = !!(slots.text || props.text != null);
      return _withDirectives$8(_createVNode$n(Tag, _mergeProps$e(link.linkProps, {
        "class": ['v-card', {
          'v-card--disabled': props.disabled,
          'v-card--flat': props.flat,
          'v-card--hover': props.hover && !(props.disabled || props.flat),
          'v-card--link': isClickable
        }, themeClasses.value, borderClasses.value, colorClasses.value, densityClasses.value, elevationClasses.value, loaderClasses.value, positionClasses.value, roundedClasses.value, variantClasses.value, props.class],
        "style": [colorStyles.value, dimensionStyles.value, locationStyles.value, props.style],
        "onClick": isClickable && link.navigate,
        "tabindex": props.disabled ? -1 : undefined
      }), {
        default: () => [hasImage && _createElementVNode$i("div", {
          "key": "image",
          "class": "v-card__image"
        }, [!slots.image ? _createVNode$n(VImg, {
          "key": "image-img",
          "cover": true,
          "src": props.image
        }, null) : _createVNode$n(VDefaultsProvider, {
          "key": "image-defaults",
          "disabled": !props.image,
          "defaults": {
            VImg: {
              cover: true,
              src: props.image
            }
          }
        }, slots.image)]), _createVNode$n(LoaderSlot, {
          "name": "v-card",
          "active": !!props.loading,
          "color": loadingColor.value
        }, {
          default: slots.loader
        }), hasCardItem && _createVNode$n(VCardItem, {
          "key": "item",
          "prependAvatar": props.prependAvatar,
          "prependIcon": props.prependIcon,
          "title": props.title,
          "subtitle": props.subtitle,
          "appendAvatar": props.appendAvatar,
          "appendIcon": props.appendIcon
        }, {
          default: slots.item,
          prepend: slots.prepend,
          title: slots.title,
          subtitle: slots.subtitle,
          append: slots.append
        }), hasText && _createVNode$n(VCardText, {
          "key": "text"
        }, {
          default: () => [slots.text?.() ?? props.text]
        }), slots.default?.(), slots.actions && _createVNode$n(VCardActions, null, {
          default: slots.actions
        }), genOverlays(isClickable, 'v-card')]
      }), [[Ripple, isClickable && props.ripple]]);
    });
    return {};
  }
});

const {computed: computed$q,inject: inject$7,markRaw,provide: provide$5,ref: ref$c,shallowRef: shallowRef$g,toRef: toRef$k,watch: watch$f} = await importShared('vue');
const FormKey = Symbol.for('vuetify:form');
const makeFormProps = propsFactory({
  disabled: Boolean,
  fastFail: Boolean,
  readonly: Boolean,
  modelValue: {
    type: Boolean,
    default: null
  },
  validateOn: {
    type: String,
    default: 'input'
  }
}, 'form');
function createForm(props) {
  const model = useProxiedModel(props, 'modelValue');
  const isDisabled = toRef$k(() => props.disabled);
  const isReadonly = toRef$k(() => props.readonly);
  const isValidating = shallowRef$g(false);
  const items = ref$c([]);
  const errors = ref$c([]);
  async function validate() {
    const results = [];
    let valid = true;
    errors.value = [];
    isValidating.value = true;
    for (const item of items.value) {
      const itemErrorMessages = await item.validate();
      if (itemErrorMessages.length > 0) {
        valid = false;
        results.push({
          id: item.id,
          errorMessages: itemErrorMessages
        });
      }
      if (!valid && props.fastFail) break;
    }
    errors.value = results;
    isValidating.value = false;
    return {
      valid,
      errors: errors.value
    };
  }
  function reset() {
    items.value.forEach(item => item.reset());
  }
  function resetValidation() {
    items.value.forEach(item => item.resetValidation());
  }
  watch$f(items, () => {
    let valid = 0;
    let invalid = 0;
    const results = [];
    for (const item of items.value) {
      if (item.isValid === false) {
        invalid++;
        results.push({
          id: item.id,
          errorMessages: item.errorMessages
        });
      } else if (item.isValid === true) valid++;
    }
    errors.value = results;
    model.value = invalid > 0 ? false : valid === items.value.length ? true : null;
  }, {
    deep: true,
    flush: 'post'
  });
  provide$5(FormKey, {
    register: _ref => {
      let {
        id,
        vm,
        validate,
        reset,
        resetValidation
      } = _ref;
      if (items.value.some(item => item.id === id)) {
        consoleWarn(`Duplicate input name "${id}"`);
      }
      items.value.push({
        id,
        validate,
        reset,
        resetValidation,
        vm: markRaw(vm),
        isValid: null,
        errorMessages: []
      });
    },
    unregister: id => {
      items.value = items.value.filter(item => {
        return item.id !== id;
      });
    },
    update: (id, isValid, errorMessages) => {
      const found = items.value.find(item => item.id === id);
      if (!found) return;
      found.isValid = isValid;
      found.errorMessages = errorMessages;
    },
    isDisabled,
    isReadonly,
    isValidating,
    isValid: model,
    items,
    validateOn: toRef$k(() => props.validateOn)
  });
  return {
    errors,
    isDisabled,
    isReadonly,
    isValidating,
    isValid: model,
    items,
    validate,
    reset,
    resetValidation
  };
}
function useForm(props) {
  const form = inject$7(FormKey, null);
  return {
    ...form,
    isReadonly: computed$q(() => !!(props?.readonly ?? form?.isReadonly.value)),
    isDisabled: computed$q(() => !!(props?.disabled ?? form?.isDisabled.value))
  };
}

// Types

const Refs = Symbol('Forwarded refs');

/** Omit properties starting with P */

/** Omit keyof $props from T */

function getDescriptor(obj, key) {
  let currentObj = obj;
  while (currentObj) {
    const descriptor = Reflect.getOwnPropertyDescriptor(currentObj, key);
    if (descriptor) return descriptor;
    currentObj = Object.getPrototypeOf(currentObj);
  }
  return undefined;
}
function forwardRefs(target) {
  for (var _len = arguments.length, refs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    refs[_key - 1] = arguments[_key];
  }
  target[Refs] = refs;
  return new Proxy(target, {
    get(target, key) {
      if (Reflect.has(target, key)) {
        return Reflect.get(target, key);
      }

      // Skip internal properties
      if (typeof key === 'symbol' || key.startsWith('$') || key.startsWith('__')) return;
      for (const ref of refs) {
        if (ref.value && Reflect.has(ref.value, key)) {
          const val = Reflect.get(ref.value, key);
          return typeof val === 'function' ? val.bind(ref.value) : val;
        }
      }
    },
    has(target, key) {
      if (Reflect.has(target, key)) {
        return true;
      }

      // Skip internal properties
      if (typeof key === 'symbol' || key.startsWith('$') || key.startsWith('__')) return false;
      for (const ref of refs) {
        if (ref.value && Reflect.has(ref.value, key)) {
          return true;
        }
      }
      return false;
    },
    set(target, key, value) {
      if (Reflect.has(target, key)) {
        return Reflect.set(target, key, value);
      }

      // Skip internal properties
      if (typeof key === 'symbol' || key.startsWith('$') || key.startsWith('__')) return false;
      for (const ref of refs) {
        if (ref.value && Reflect.has(ref.value, key)) {
          return Reflect.set(ref.value, key, value);
        }
      }
      return false;
    },
    getOwnPropertyDescriptor(target, key) {
      const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
      if (descriptor) return descriptor;

      // Skip internal properties
      if (typeof key === 'symbol' || key.startsWith('$') || key.startsWith('__')) return;

      // Check each ref's own properties
      for (const ref of refs) {
        if (!ref.value) continue;
        const descriptor = getDescriptor(ref.value, key) ?? ('_' in ref.value ? getDescriptor(ref.value._?.setupState, key) : undefined);
        if (descriptor) return descriptor;
      }

      // Recursive search up each ref's prototype
      for (const ref of refs) {
        const childRefs = ref.value && ref.value[Refs];
        if (!childRefs) continue;
        const queue = childRefs.slice();
        while (queue.length) {
          const ref = queue.shift();
          const descriptor = getDescriptor(ref.value, key);
          if (descriptor) return descriptor;
          const childRefs = ref.value && ref.value[Refs];
          if (childRefs) queue.push(...childRefs);
        }
      }
      return undefined;
    }
  });
}

const {capitalize: capitalize$1,computed: computed$p,h: h$2} = await importShared('vue');
const breakpointProps = (() => {
  return breakpoints.reduce((props, val) => {
    props[val] = {
      type: [Boolean, String, Number],
      default: false
    };
    return props;
  }, {});
})();
const offsetProps = (() => {
  return breakpoints.reduce((props, val) => {
    const offsetKey = 'offset' + capitalize$1(val);
    props[offsetKey] = {
      type: [String, Number],
      default: null
    };
    return props;
  }, {});
})();
const orderProps = (() => {
  return breakpoints.reduce((props, val) => {
    const orderKey = 'order' + capitalize$1(val);
    props[orderKey] = {
      type: [String, Number],
      default: null
    };
    return props;
  }, {});
})();
const propMap$1 = {
  col: Object.keys(breakpointProps),
  offset: Object.keys(offsetProps),
  order: Object.keys(orderProps)
};
function breakpointClass$1(type, prop, val) {
  let className = type;
  if (val == null || val === false) {
    return undefined;
  }
  if (prop) {
    const breakpoint = prop.replace(type, '');
    className += `-${breakpoint}`;
  }
  if (type === 'col') {
    className = 'v-' + className;
  }
  // Handling the boolean style prop when accepting [Boolean, String, Number]
  // means Vue will not convert <v-col sm></v-col> to sm: true for us.
  // Since the default is false, an empty string indicates the prop's presence.
  if (type === 'col' && (val === '' || val === true)) {
    // .v-col-md
    return className.toLowerCase();
  }
  // .order-md-6
  className += `-${val}`;
  return className.toLowerCase();
}
const ALIGN_SELF_VALUES = ['auto', 'start', 'end', 'center', 'baseline', 'stretch'];
const makeVColProps = propsFactory({
  cols: {
    type: [Boolean, String, Number],
    default: false
  },
  ...breakpointProps,
  offset: {
    type: [String, Number],
    default: null
  },
  ...offsetProps,
  order: {
    type: [String, Number],
    default: null
  },
  ...orderProps,
  alignSelf: {
    type: String,
    default: null,
    validator: str => ALIGN_SELF_VALUES.includes(str)
  },
  ...makeComponentProps(),
  ...makeTagProps()
}, 'VCol');
const VCol = genericComponent()({
  name: 'VCol',
  props: makeVColProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const classes = computed$p(() => {
      const classList = [];

      // Loop through `col`, `offset`, `order` breakpoint props
      let type;
      for (type in propMap$1) {
        propMap$1[type].forEach(prop => {
          const value = props[prop];
          const className = breakpointClass$1(type, prop, value);
          if (className) classList.push(className);
        });
      }
      const hasColClasses = classList.some(className => className.startsWith('v-col-'));
      classList.push({
        // Default to .v-col if no other col-{bp}-* classes generated nor `cols` specified.
        'v-col': !hasColClasses || !props.cols,
        [`v-col-${props.cols}`]: props.cols,
        [`offset-${props.offset}`]: props.offset,
        [`order-${props.order}`]: props.order,
        [`align-self-${props.alignSelf}`]: props.alignSelf
      });
      return classList;
    });
    return () => h$2(props.tag, {
      class: [classes.value, props.class],
      style: props.style
    }, slots.default?.());
  }
});

const {capitalize,computed: computed$o,h: h$1} = await importShared('vue');
const ALIGNMENT = ['start', 'end', 'center'];
const SPACE = ['space-between', 'space-around', 'space-evenly'];
function makeRowProps(prefix, def) {
  return breakpoints.reduce((props, val) => {
    const prefixKey = prefix + capitalize(val);
    props[prefixKey] = def();
    return props;
  }, {});
}
const ALIGN_VALUES = [...ALIGNMENT, 'baseline', 'stretch'];
const alignValidator = str => ALIGN_VALUES.includes(str);
const alignProps = makeRowProps('align', () => ({
  type: String,
  default: null,
  validator: alignValidator
}));
const JUSTIFY_VALUES = [...ALIGNMENT, ...SPACE];
const justifyValidator = str => JUSTIFY_VALUES.includes(str);
const justifyProps = makeRowProps('justify', () => ({
  type: String,
  default: null,
  validator: justifyValidator
}));
const ALIGN_CONTENT_VALUES = [...ALIGNMENT, ...SPACE, 'stretch'];
const alignContentValidator = str => ALIGN_CONTENT_VALUES.includes(str);
const alignContentProps = makeRowProps('alignContent', () => ({
  type: String,
  default: null,
  validator: alignContentValidator
}));
const propMap = {
  align: Object.keys(alignProps),
  justify: Object.keys(justifyProps),
  alignContent: Object.keys(alignContentProps)
};
const classMap = {
  align: 'align',
  justify: 'justify',
  alignContent: 'align-content'
};
function breakpointClass(type, prop, val) {
  let className = classMap[type];
  if (val == null) {
    return undefined;
  }
  if (prop) {
    // alignSm -> Sm
    const breakpoint = prop.replace(type, '');
    className += `-${breakpoint}`;
  }
  // .align-items-sm-center
  className += `-${val}`;
  return className.toLowerCase();
}
const makeVRowProps = propsFactory({
  dense: Boolean,
  noGutters: Boolean,
  align: {
    type: String,
    default: null,
    validator: alignValidator
  },
  ...alignProps,
  justify: {
    type: String,
    default: null,
    validator: justifyValidator
  },
  ...justifyProps,
  alignContent: {
    type: String,
    default: null,
    validator: alignContentValidator
  },
  ...alignContentProps,
  ...makeComponentProps(),
  ...makeTagProps()
}, 'VRow');
const VRow = genericComponent()({
  name: 'VRow',
  props: makeVRowProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const classes = computed$o(() => {
      const classList = [];

      // Loop through `align`, `justify`, `alignContent` breakpoint props
      let type;
      for (type in propMap) {
        propMap[type].forEach(prop => {
          const value = props[prop];
          const className = breakpointClass(type, prop, value);
          if (className) classList.push(className);
        });
      }
      classList.push({
        'v-row--no-gutters': props.noGutters,
        'v-row--dense': props.dense,
        [`align-${props.align}`]: props.align,
        [`justify-${props.justify}`]: props.justify,
        [`align-content-${props.alignContent}`]: props.alignContent
      });
      return classList;
    });
    return () => h$1(props.tag, {
      class: ['v-row', classes.value, props.class],
      style: props.style
    }, slots.default?.());
  }
});

// Utilities
const {h,Transition: Transition$2,TransitionGroup} = await importShared('vue');
const makeTransitionProps = propsFactory({
  disabled: Boolean,
  group: Boolean,
  hideOnLeave: Boolean,
  leaveAbsolute: Boolean,
  mode: String,
  origin: String
}, 'transition');
function createCssTransition(name, origin, mode) {
  return genericComponent()({
    name,
    props: makeTransitionProps({
      mode,
      origin
    }),
    setup(props, _ref) {
      let {
        slots
      } = _ref;
      const functions = {
        onBeforeEnter(el) {
          if (props.origin) {
            el.style.transformOrigin = props.origin;
          }
        },
        onLeave(el) {
          if (props.leaveAbsolute) {
            const {
              offsetTop,
              offsetLeft,
              offsetWidth,
              offsetHeight
            } = el;
            el._transitionInitialStyles = {
              position: el.style.position,
              top: el.style.top,
              left: el.style.left,
              width: el.style.width,
              height: el.style.height
            };
            el.style.position = 'absolute';
            el.style.top = `${offsetTop}px`;
            el.style.left = `${offsetLeft}px`;
            el.style.width = `${offsetWidth}px`;
            el.style.height = `${offsetHeight}px`;
          }
          if (props.hideOnLeave) {
            el.style.setProperty('display', 'none', 'important');
          }
        },
        onAfterLeave(el) {
          if (props.leaveAbsolute && el?._transitionInitialStyles) {
            const {
              position,
              top,
              left,
              width,
              height
            } = el._transitionInitialStyles;
            delete el._transitionInitialStyles;
            el.style.position = position || '';
            el.style.top = top || '';
            el.style.left = left || '';
            el.style.width = width || '';
            el.style.height = height || '';
          }
        }
      };
      return () => {
        const tag = props.group ? TransitionGroup : Transition$2;
        return h(tag, {
          name: props.disabled ? '' : name,
          css: !props.disabled,
          ...(props.group ? undefined : {
            mode: props.mode
          }),
          ...(props.disabled ? {} : functions)
        }, slots.default);
      };
    }
  });
}
function createJavascriptTransition(name, functions) {
  let mode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'in-out';
  return genericComponent()({
    name,
    props: {
      mode: {
        type: String,
        default: mode
      },
      disabled: {
        type: Boolean,
        default: PREFERS_REDUCED_MOTION()
      },
      group: Boolean
    },
    setup(props, _ref2) {
      let {
        slots
      } = _ref2;
      const tag = props.group ? TransitionGroup : Transition$2;
      return () => {
        return h(tag, {
          name: props.disabled ? '' : name,
          css: !props.disabled,
          // mode: props.mode, // TODO: vuejs/vue-next#3104
          ...(props.disabled ? {} : functions)
        }, slots.default);
      };
    }
  });
}

// Utilities
const {camelize} = await importShared('vue');

function ExpandTransitionGenerator () {
  let expandedParentClass = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  let x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  const sizeProperty = x ? 'width' : 'height';
  const offsetProperty = camelize(`offset-${sizeProperty}`);
  return {
    onBeforeEnter(el) {
      el._parent = el.parentNode;
      el._initialStyle = {
        transition: el.style.transition,
        overflow: el.style.overflow,
        [sizeProperty]: el.style[sizeProperty]
      };
    },
    onEnter(el) {
      const initialStyle = el._initialStyle;
      if (!initialStyle) return;
      el.style.setProperty('transition', 'none', 'important');
      // Hide overflow to account for collapsed margins in the calculated height
      el.style.overflow = 'hidden';
      const offset = `${el[offsetProperty]}px`;
      el.style[sizeProperty] = '0';
      void el.offsetHeight; // force reflow

      el.style.transition = initialStyle.transition;
      if (expandedParentClass && el._parent) {
        el._parent.classList.add(expandedParentClass);
      }
      requestAnimationFrame(() => {
        el.style[sizeProperty] = offset;
      });
    },
    onAfterEnter: resetStyles,
    onEnterCancelled: resetStyles,
    onLeave(el) {
      el._initialStyle = {
        transition: '',
        overflow: el.style.overflow,
        [sizeProperty]: el.style[sizeProperty]
      };
      el.style.overflow = 'hidden';
      el.style[sizeProperty] = `${el[offsetProperty]}px`;
      void el.offsetHeight; // force reflow

      requestAnimationFrame(() => el.style[sizeProperty] = '0');
    },
    onAfterLeave,
    onLeaveCancelled: onAfterLeave
  };
  function onAfterLeave(el) {
    if (expandedParentClass && el._parent) {
      el._parent.classList.remove(expandedParentClass);
    }
    resetStyles(el);
  }
  function resetStyles(el) {
    if (!el._initialStyle) return;
    const size = el._initialStyle[sizeProperty];
    el.style.overflow = el._initialStyle.overflow;
    if (size != null) el.style[sizeProperty] = size;
    delete el._initialStyle;
  }
}

// Utilities
const {Transition: Transition$1,mergeProps:_mergeProps$d,createVNode:_createVNode$m} = await importShared('vue');
const makeVDialogTransitionProps = propsFactory({
  target: [Object, Array]
}, 'v-dialog-transition');
const saved = new WeakMap();
const VDialogTransition = genericComponent()({
  name: 'VDialogTransition',
  props: makeVDialogTransitionProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const functions = {
      onBeforeEnter(el) {
        el.style.pointerEvents = 'none';
        el.style.visibility = 'hidden';
      },
      async onEnter(el, done) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));
        el.style.visibility = '';
        const dimensions = getDimensions(props.target, el);
        const {
          x,
          y,
          sx,
          sy,
          speed
        } = dimensions;
        saved.set(el, dimensions);
        if (PREFERS_REDUCED_MOTION()) {
          animate(el, [{
            opacity: 0
          }, {}], {
            duration: 125 * speed,
            easing: deceleratedEasing
          }).finished.then(() => done());
        } else {
          const animation = animate(el, [{
            transform: `translate(${x}px, ${y}px) scale(${sx}, ${sy})`,
            opacity: 0
          }, {}], {
            duration: 225 * speed,
            easing: deceleratedEasing
          });
          getChildren(el)?.forEach(el => {
            animate(el, [{
              opacity: 0
            }, {
              opacity: 0,
              offset: 0.33
            }, {}], {
              duration: 225 * 2 * speed,
              easing: standardEasing
            });
          });
          animation.finished.then(() => done());
        }
      },
      onAfterEnter(el) {
        el.style.removeProperty('pointer-events');
      },
      onBeforeLeave(el) {
        el.style.pointerEvents = 'none';
      },
      async onLeave(el, done) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        let dimensions;
        if (!saved.has(el) || Array.isArray(props.target) || props.target.offsetParent || props.target.getClientRects().length) {
          dimensions = getDimensions(props.target, el);
        } else {
          dimensions = saved.get(el);
        }
        const {
          x,
          y,
          sx,
          sy,
          speed
        } = dimensions;
        if (PREFERS_REDUCED_MOTION()) {
          animate(el, [{}, {
            opacity: 0
          }], {
            duration: 85 * speed,
            easing: acceleratedEasing
          }).finished.then(() => done());
        } else {
          const animation = animate(el, [{}, {
            transform: `translate(${x}px, ${y}px) scale(${sx}, ${sy})`,
            opacity: 0
          }], {
            duration: 125 * speed,
            easing: acceleratedEasing
          });
          animation.finished.then(() => done());
          getChildren(el)?.forEach(el => {
            animate(el, [{}, {
              opacity: 0,
              offset: 0.2
            }, {
              opacity: 0
            }], {
              duration: 125 * 2 * speed,
              easing: standardEasing
            });
          });
        }
      },
      onAfterLeave(el) {
        el.style.removeProperty('pointer-events');
      }
    };
    return () => {
      return props.target ? _createVNode$m(Transition$1, _mergeProps$d({
        "name": "dialog-transition"
      }, functions, {
        "css": false
      }), slots) : _createVNode$m(Transition$1, {
        "name": "dialog-transition"
      }, slots);
    };
  }
});

/** Animatable children (card, sheet, list) */
function getChildren(el) {
  const els = el.querySelector(':scope > .v-card, :scope > .v-sheet, :scope > .v-list')?.children;
  return els && [...els];
}
function getDimensions(target, el) {
  const targetBox = getTargetBox(target);
  const elBox = nullifyTransforms(el);
  const [originX, originY] = getComputedStyle(el).transformOrigin.split(' ').map(v => parseFloat(v));
  const [anchorSide, anchorOffset] = getComputedStyle(el).getPropertyValue('--v-overlay-anchor-origin').split(' ');
  let offsetX = targetBox.left + targetBox.width / 2;
  if (anchorSide === 'left' || anchorOffset === 'left') {
    offsetX -= targetBox.width / 2;
  } else if (anchorSide === 'right' || anchorOffset === 'right') {
    offsetX += targetBox.width / 2;
  }
  let offsetY = targetBox.top + targetBox.height / 2;
  if (anchorSide === 'top' || anchorOffset === 'top') {
    offsetY -= targetBox.height / 2;
  } else if (anchorSide === 'bottom' || anchorOffset === 'bottom') {
    offsetY += targetBox.height / 2;
  }
  const tsx = targetBox.width / elBox.width;
  const tsy = targetBox.height / elBox.height;
  const maxs = Math.max(1, tsx, tsy);
  const sx = tsx / maxs || 0;
  const sy = tsy / maxs || 0;

  // Animate elements larger than 12% of the screen area up to 1.5x slower
  const asa = elBox.width * elBox.height / (window.innerWidth * window.innerHeight);
  const speed = asa > 0.12 ? Math.min(1.5, (asa - 0.12) * 10 + 1) : 1;
  return {
    x: offsetX - (originX + elBox.left),
    y: offsetY - (originY + elBox.top),
    sx,
    sy,
    speed
  };
}

createCssTransition('fab-transition', 'center center', 'out-in');

// Generic transitions
createCssTransition('dialog-bottom-transition');
createCssTransition('dialog-top-transition');
const VFadeTransition = createCssTransition('fade-transition');
const VScaleTransition = createCssTransition('scale-transition');
createCssTransition('scroll-x-transition');
createCssTransition('scroll-x-reverse-transition');
createCssTransition('scroll-y-transition');
createCssTransition('scroll-y-reverse-transition');
createCssTransition('slide-x-transition');
createCssTransition('slide-x-reverse-transition');
const VSlideYTransition = createCssTransition('slide-y-transition');
createCssTransition('slide-y-reverse-transition');

// Javascript transitions
const VExpandTransition = createJavascriptTransition('expand-transition', ExpandTransitionGenerator());
const VExpandXTransition = createJavascriptTransition('expand-x-transition', ExpandTransitionGenerator('', true));

const {normalizeClass:_normalizeClass$f,normalizeStyle:_normalizeStyle$e,createElementVNode:_createElementVNode$h} = await importShared('vue');
const makeVLabelProps = propsFactory({
  text: String,
  onClick: EventProp(),
  ...makeComponentProps(),
  ...makeThemeProps()
}, 'VLabel');
const VLabel = genericComponent()({
  name: 'VLabel',
  props: makeVLabelProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    useRender(() => _createElementVNode$h("label", {
      "class": _normalizeClass$f(['v-label', {
        'v-label--clickable': !!props.onClick
      }, props.class]),
      "style": _normalizeStyle$e(props.style),
      "onClick": props.onClick
    }, [props.text, slots.default?.()]));
    return {};
  }
});

const {normalizeClass:_normalizeClass$e,normalizeStyle:_normalizeStyle$d,createElementVNode:_createElementVNode$g} = await importShared('vue');
const {onScopeDispose: onScopeDispose$6,provide: provide$4,toRef: toRef$j,useId: useId$7} = await importShared('vue');
const VSelectionControlGroupSymbol = Symbol.for('vuetify:selection-control-group');
const makeSelectionControlGroupProps = propsFactory({
  color: String,
  disabled: {
    type: Boolean,
    default: null
  },
  defaultsTarget: String,
  error: Boolean,
  id: String,
  inline: Boolean,
  falseIcon: IconValue,
  trueIcon: IconValue,
  ripple: {
    type: [Boolean, Object],
    default: true
  },
  multiple: {
    type: Boolean,
    default: null
  },
  name: String,
  readonly: {
    type: Boolean,
    default: null
  },
  modelValue: null,
  type: String,
  valueComparator: {
    type: Function,
    default: deepEqual
  },
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeThemeProps()
}, 'SelectionControlGroup');
const makeVSelectionControlGroupProps = propsFactory({
  ...makeSelectionControlGroupProps({
    defaultsTarget: 'VSelectionControl'
  })
}, 'VSelectionControlGroup');
genericComponent()({
  name: 'VSelectionControlGroup',
  props: makeVSelectionControlGroupProps(),
  emits: {
    'update:modelValue': value => true
  },
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const modelValue = useProxiedModel(props, 'modelValue');
    const uid = useId$7();
    const id = toRef$j(() => props.id || `v-selection-control-group-${uid}`);
    const name = toRef$j(() => props.name || id.value);
    const updateHandlers = new Set();
    provide$4(VSelectionControlGroupSymbol, {
      modelValue,
      forceUpdate: () => {
        updateHandlers.forEach(fn => fn());
      },
      onForceUpdate: cb => {
        updateHandlers.add(cb);
        onScopeDispose$6(() => {
          updateHandlers.delete(cb);
        });
      }
    });
    provideDefaults({
      [props.defaultsTarget]: {
        color: toRef$j(() => props.color),
        disabled: toRef$j(() => props.disabled),
        density: toRef$j(() => props.density),
        error: toRef$j(() => props.error),
        inline: toRef$j(() => props.inline),
        modelValue,
        multiple: toRef$j(() => !!props.multiple || props.multiple == null && Array.isArray(modelValue.value)),
        name,
        falseIcon: toRef$j(() => props.falseIcon),
        trueIcon: toRef$j(() => props.trueIcon),
        readonly: toRef$j(() => props.readonly),
        ripple: toRef$j(() => props.ripple),
        type: toRef$j(() => props.type),
        valueComparator: toRef$j(() => props.valueComparator)
      }
    });
    useRender(() => _createElementVNode$g("div", {
      "class": _normalizeClass$e(['v-selection-control-group', {
        'v-selection-control-group--inline': props.inline
      }, props.class]),
      "style": _normalizeStyle$d(props.style),
      "role": props.type === 'radio' ? 'radiogroup' : undefined
    }, [slots.default?.()]));
    return {};
  }
});

const {mergeProps:_mergeProps$c,createElementVNode:_createElementVNode$f,Fragment:_Fragment$8,createVNode:_createVNode$l,normalizeClass:_normalizeClass$d,withDirectives:_withDirectives$7,normalizeStyle:_normalizeStyle$c} = await importShared('vue');
const {computed: computed$n,inject: inject$6,nextTick: nextTick$9,ref: ref$b,shallowRef: shallowRef$f,toRef: toRef$i,useId: useId$6} = await importShared('vue');
const makeVSelectionControlProps = propsFactory({
  label: String,
  baseColor: String,
  trueValue: null,
  falseValue: null,
  value: null,
  ...makeComponentProps(),
  ...makeSelectionControlGroupProps()
}, 'VSelectionControl');
function useSelectionControl(props) {
  const group = inject$6(VSelectionControlGroupSymbol, undefined);
  const {
    densityClasses
  } = useDensity(props);
  const modelValue = useProxiedModel(props, 'modelValue');
  const trueValue = computed$n(() => props.trueValue !== undefined ? props.trueValue : props.value !== undefined ? props.value : true);
  const falseValue = computed$n(() => props.falseValue !== undefined ? props.falseValue : false);
  const isMultiple = computed$n(() => !!props.multiple || props.multiple == null && Array.isArray(modelValue.value));
  const model = computed$n({
    get() {
      const val = group ? group.modelValue.value : modelValue.value;
      return isMultiple.value ? wrapInArray(val).some(v => props.valueComparator(v, trueValue.value)) : props.valueComparator(val, trueValue.value);
    },
    set(val) {
      if (props.readonly) return;
      const currentValue = val ? trueValue.value : falseValue.value;
      let newVal = currentValue;
      if (isMultiple.value) {
        newVal = val ? [...wrapInArray(modelValue.value), currentValue] : wrapInArray(modelValue.value).filter(item => !props.valueComparator(item, trueValue.value));
      }
      if (group) {
        group.modelValue.value = newVal;
      } else {
        modelValue.value = newVal;
      }
    }
  });
  const {
    textColorClasses,
    textColorStyles
  } = useTextColor(() => {
    if (props.error || props.disabled) return undefined;
    return model.value ? props.color : props.baseColor;
  });
  const {
    backgroundColorClasses,
    backgroundColorStyles
  } = useBackgroundColor(() => {
    return model.value && !props.error && !props.disabled ? props.color : props.baseColor;
  });
  const icon = computed$n(() => model.value ? props.trueIcon : props.falseIcon);
  return {
    group,
    densityClasses,
    trueValue,
    falseValue,
    model,
    textColorClasses,
    textColorStyles,
    backgroundColorClasses,
    backgroundColorStyles,
    icon
  };
}
const VSelectionControl = genericComponent()({
  name: 'VSelectionControl',
  directives: {
    vRipple: Ripple
  },
  inheritAttrs: false,
  props: makeVSelectionControlProps(),
  emits: {
    'update:modelValue': value => true
  },
  setup(props, _ref) {
    let {
      attrs,
      slots
    } = _ref;
    const {
      group,
      densityClasses,
      icon,
      model,
      textColorClasses,
      textColorStyles,
      backgroundColorClasses,
      backgroundColorStyles,
      trueValue
    } = useSelectionControl(props);
    const uid = useId$6();
    const isFocused = shallowRef$f(false);
    const isFocusVisible = shallowRef$f(false);
    const input = ref$b();
    const id = toRef$i(() => props.id || `input-${uid}`);
    const isInteractive = toRef$i(() => !props.disabled && !props.readonly);
    group?.onForceUpdate(() => {
      if (input.value) {
        input.value.checked = model.value;
      }
    });
    function onFocus(e) {
      if (!isInteractive.value) return;
      isFocused.value = true;
      if (matchesSelector(e.target, ':focus-visible') !== false) {
        isFocusVisible.value = true;
      }
    }
    function onBlur() {
      isFocused.value = false;
      isFocusVisible.value = false;
    }
    function onClickLabel(e) {
      e.stopPropagation();
    }
    function onInput(e) {
      if (!isInteractive.value) {
        if (input.value) {
          // model value is not updated when input is not interactive
          // but the internal checked state of the input is still updated,
          // so here it's value is restored
          input.value.checked = model.value;
        }
        return;
      }
      if (props.readonly && group) {
        nextTick$9(() => group.forceUpdate());
      }
      model.value = e.target.checked;
    }
    useRender(() => {
      const label = slots.label ? slots.label({
        label: props.label,
        props: {
          for: id.value
        }
      }) : props.label;
      const [rootAttrs, inputAttrs] = filterInputAttrs(attrs);
      const inputNode = _createElementVNode$f("input", _mergeProps$c({
        "ref": input,
        "checked": model.value,
        "disabled": !!props.disabled,
        "id": id.value,
        "onBlur": onBlur,
        "onFocus": onFocus,
        "onInput": onInput,
        "aria-disabled": !!props.disabled,
        "aria-label": props.label,
        "type": props.type,
        "value": trueValue.value,
        "name": props.name,
        "aria-checked": props.type === 'checkbox' ? model.value : undefined
      }, inputAttrs), null);
      return _createElementVNode$f("div", _mergeProps$c({
        "class": ['v-selection-control', {
          'v-selection-control--dirty': model.value,
          'v-selection-control--disabled': props.disabled,
          'v-selection-control--error': props.error,
          'v-selection-control--focused': isFocused.value,
          'v-selection-control--focus-visible': isFocusVisible.value,
          'v-selection-control--inline': props.inline
        }, densityClasses.value, props.class]
      }, rootAttrs, {
        "style": props.style
      }), [_createElementVNode$f("div", {
        "class": _normalizeClass$d(['v-selection-control__wrapper', textColorClasses.value]),
        "style": _normalizeStyle$c(textColorStyles.value)
      }, [slots.default?.({
        backgroundColorClasses,
        backgroundColorStyles
      }), _withDirectives$7(_createElementVNode$f("div", {
        "class": _normalizeClass$d(['v-selection-control__input'])
      }, [slots.input?.({
        model,
        textColorClasses,
        textColorStyles,
        backgroundColorClasses,
        backgroundColorStyles,
        inputNode,
        icon: icon.value,
        props: {
          onFocus,
          onBlur,
          id: id.value
        }
      }) ?? _createElementVNode$f(_Fragment$8, null, [icon.value && _createVNode$l(VIcon, {
        "key": "icon",
        "icon": icon.value
      }, null), inputNode])]), [[Ripple, !props.disabled && !props.readonly && props.ripple, null, {
        center: true,
        circle: true
      }]])]), label && _createVNode$l(VLabel, {
        "for": id.value,
        "onClick": onClickLabel
      }, {
        default: () => [label]
      })]);
    });
    return {
      isFocused,
      input
    };
  }
});

const {mergeProps:_mergeProps$b,createVNode:_createVNode$k} = await importShared('vue');
const {toRef: toRef$h} = await importShared('vue');
const makeVCheckboxBtnProps = propsFactory({
  indeterminate: Boolean,
  indeterminateIcon: {
    type: IconValue,
    default: '$checkboxIndeterminate'
  },
  ...makeVSelectionControlProps({
    falseIcon: '$checkboxOff',
    trueIcon: '$checkboxOn'
  })
}, 'VCheckboxBtn');
const VCheckboxBtn = genericComponent()({
  name: 'VCheckboxBtn',
  props: makeVCheckboxBtnProps(),
  emits: {
    'update:modelValue': value => true,
    'update:indeterminate': value => true
  },
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const indeterminate = useProxiedModel(props, 'indeterminate');
    const model = useProxiedModel(props, 'modelValue');
    function onChange(v) {
      if (indeterminate.value) {
        indeterminate.value = false;
      }
    }
    const falseIcon = toRef$h(() => {
      return indeterminate.value ? props.indeterminateIcon : props.falseIcon;
    });
    const trueIcon = toRef$h(() => {
      return indeterminate.value ? props.indeterminateIcon : props.trueIcon;
    });
    useRender(() => {
      const controlProps = omit(VSelectionControl.filterProps(props), ['modelValue']);
      return _createVNode$k(VSelectionControl, _mergeProps$b(controlProps, {
        "modelValue": model.value,
        "onUpdate:modelValue": [$event => model.value = $event, onChange],
        "class": ['v-checkbox-btn', props.class],
        "style": props.style,
        "type": "checkbox",
        "falseIcon": falseIcon.value,
        "trueIcon": trueIcon.value,
        "aria-checked": indeterminate.value ? 'mixed' : undefined
      }), slots);
    });
    return {};
  }
});

const {mergeProps:_mergeProps$a,createVNode:_createVNode$j} = await importShared('vue');
function useInputIcon(props) {
  const {
    t
  } = useLocale();
  function InputIcon(_ref) {
    let {
      name,
      color,
      ...attrs
    } = _ref;
    const localeKey = {
      prepend: 'prependAction',
      prependInner: 'prependAction',
      append: 'appendAction',
      appendInner: 'appendAction',
      clear: 'clear'
    }[name];
    const listener = props[`onClick:${name}`];
    function onKeydown(e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      e.stopPropagation();
      callEvent(listener, new PointerEvent('click', e));
    }
    const label = listener && localeKey ? t(`$vuetify.input.${localeKey}`, props.label ?? '') : undefined;
    return _createVNode$j(VIcon, _mergeProps$a({
      "icon": props[`${name}Icon`],
      "aria-label": label,
      "onClick": listener,
      "onKeydown": onKeydown,
      "color": color
    }, attrs), null);
  }
  return {
    InputIcon
  };
}

const {createElementVNode:_createElementVNode$e,normalizeClass:_normalizeClass$c,normalizeStyle:_normalizeStyle$b,createVNode:_createVNode$i} = await importShared('vue');
const {computed: computed$m} = await importShared('vue');
const makeVMessagesProps = propsFactory({
  active: Boolean,
  color: String,
  messages: {
    type: [Array, String],
    default: () => []
  },
  ...makeComponentProps(),
  ...makeTransitionProps$1({
    transition: {
      component: VSlideYTransition,
      leaveAbsolute: true,
      group: true
    }
  })
}, 'VMessages');
const VMessages = genericComponent()({
  name: 'VMessages',
  props: makeVMessagesProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const messages = computed$m(() => wrapInArray(props.messages));
    const {
      textColorClasses,
      textColorStyles
    } = useTextColor(() => props.color);
    useRender(() => _createVNode$i(MaybeTransition, {
      "transition": props.transition,
      "tag": "div",
      "class": _normalizeClass$c(['v-messages', textColorClasses.value, props.class]),
      "style": _normalizeStyle$b([textColorStyles.value, props.style])
    }, {
      default: () => [props.active && messages.value.map((message, i) => _createElementVNode$e("div", {
        "class": "v-messages__message",
        "key": `${i}-${messages.value}`
      }, [slots.message ? slots.message({
        message
      }) : message]))]
    }));
    return {};
  }
});

const {toRef: toRef$g} = await importShared('vue');
// Composables
const makeFocusProps = propsFactory({
  focused: Boolean,
  'onUpdate:focused': EventProp()
}, 'focus');
function useFocus(props) {
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getCurrentInstanceName();
  const isFocused = useProxiedModel(props, 'focused');
  const focusClasses = toRef$g(() => {
    return {
      [`${name}--focused`]: isFocused.value
    };
  });
  function focus() {
    isFocused.value = true;
  }
  function blur() {
    isFocused.value = false;
  }
  return {
    focusClasses,
    isFocused,
    focus,
    blur
  };
}

// Utilities
const {computed: computed$l,inject: inject$5,toRef: toRef$f} = await importShared('vue');
const RulesSymbol = Symbol.for('vuetify:rules');
function useRules(fn) {
  const rules = inject$5(RulesSymbol, null);
  if (!fn) {
    if (!rules) {
      throw new Error('Could not find Vuetify rules injection');
    }
    return rules.aliases;
  }
  return rules?.resolve(fn) ?? toRef$f(fn);
}

const {computed: computed$k,nextTick: nextTick$8,onBeforeMount: onBeforeMount$2,onBeforeUnmount: onBeforeUnmount$3,onMounted: onMounted$3,ref: ref$a,shallowRef: shallowRef$e,unref,useId: useId$5,watch: watch$e} = await importShared('vue');
const makeValidationProps = propsFactory({
  disabled: {
    type: Boolean,
    default: null
  },
  error: Boolean,
  errorMessages: {
    type: [Array, String],
    default: () => []
  },
  maxErrors: {
    type: [Number, String],
    default: 1
  },
  name: String,
  label: String,
  readonly: {
    type: Boolean,
    default: null
  },
  rules: {
    type: Array,
    default: () => []
  },
  modelValue: null,
  validateOn: String,
  validationValue: null,
  ...makeFocusProps()
}, 'validation');
function useValidation(props) {
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getCurrentInstanceName();
  let id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : useId$5();
  const model = useProxiedModel(props, 'modelValue');
  const validationModel = computed$k(() => props.validationValue === undefined ? model.value : props.validationValue);
  const form = useForm(props);
  const rules = useRules(() => props.rules);
  const internalErrorMessages = ref$a([]);
  const isPristine = shallowRef$e(true);
  const isDirty = computed$k(() => !!(wrapInArray(model.value === '' ? null : model.value).length || wrapInArray(validationModel.value === '' ? null : validationModel.value).length));
  const errorMessages = computed$k(() => {
    return props.errorMessages?.length ? wrapInArray(props.errorMessages).concat(internalErrorMessages.value).slice(0, Math.max(0, Number(props.maxErrors))) : internalErrorMessages.value;
  });
  const validateOn = computed$k(() => {
    let value = (props.validateOn ?? form.validateOn?.value) || 'input';
    if (value === 'lazy') value = 'input lazy';
    if (value === 'eager') value = 'input eager';
    const set = new Set(value?.split(' ') ?? []);
    return {
      input: set.has('input'),
      blur: set.has('blur') || set.has('input') || set.has('invalid-input'),
      invalidInput: set.has('invalid-input'),
      lazy: set.has('lazy'),
      eager: set.has('eager')
    };
  });
  const isValid = computed$k(() => {
    if (props.error || props.errorMessages?.length) return false;
    if (!props.rules.length) return true;
    if (isPristine.value) {
      return internalErrorMessages.value.length || validateOn.value.lazy ? null : true;
    } else {
      return !internalErrorMessages.value.length;
    }
  });
  const isValidating = shallowRef$e(false);
  const validationClasses = computed$k(() => {
    return {
      [`${name}--error`]: isValid.value === false,
      [`${name}--dirty`]: isDirty.value,
      [`${name}--disabled`]: form.isDisabled.value,
      [`${name}--readonly`]: form.isReadonly.value
    };
  });
  const vm = getCurrentInstance('validation');
  const uid = computed$k(() => props.name ?? unref(id));
  onBeforeMount$2(() => {
    form.register?.({
      id: uid.value,
      vm,
      validate,
      reset,
      resetValidation
    });
  });
  onBeforeUnmount$3(() => {
    form.unregister?.(uid.value);
  });
  onMounted$3(async () => {
    if (!validateOn.value.lazy) {
      await validate(!validateOn.value.eager);
    }
    form.update?.(uid.value, isValid.value, errorMessages.value);
  });
  useToggleScope(() => validateOn.value.input || validateOn.value.invalidInput && isValid.value === false, () => {
    watch$e(validationModel, () => {
      if (validationModel.value != null) {
        validate();
      } else if (props.focused) {
        const unwatch = watch$e(() => props.focused, val => {
          if (!val) validate();
          unwatch();
        });
      }
    });
  });
  useToggleScope(() => validateOn.value.blur, () => {
    watch$e(() => props.focused, val => {
      if (!val) validate();
    });
  });
  watch$e([isValid, errorMessages], () => {
    form.update?.(uid.value, isValid.value, errorMessages.value);
  });
  async function reset() {
    model.value = null;
    await nextTick$8();
    await resetValidation();
  }
  async function resetValidation() {
    isPristine.value = true;
    if (!validateOn.value.lazy) {
      await validate(!validateOn.value.eager);
    } else {
      internalErrorMessages.value = [];
    }
  }
  async function validate() {
    let silent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    const results = [];
    isValidating.value = true;
    for (const rule of rules.value) {
      if (results.length >= Number(props.maxErrors ?? 1)) {
        break;
      }
      const handler = typeof rule === 'function' ? rule : () => rule;
      const result = await handler(validationModel.value);
      if (result === true) continue;
      if (result !== false && typeof result !== 'string') {
        // eslint-disable-next-line no-console
        console.warn(`${result} is not a valid value. Rule functions must return boolean true or a string.`);
        continue;
      }
      results.push(result || '');
    }
    internalErrorMessages.value = results;
    isValidating.value = false;
    isPristine.value = silent;
    return internalErrorMessages.value;
  }
  return {
    errorMessages,
    isDirty,
    isDisabled: form.isDisabled,
    isReadonly: form.isReadonly,
    isPristine,
    isValid,
    isValidating,
    reset,
    resetValidation,
    validate,
    validationClasses
  };
}

const {createVNode:_createVNode$h,createElementVNode:_createElementVNode$d,normalizeClass:_normalizeClass$b,normalizeStyle:_normalizeStyle$a} = await importShared('vue');
const {computed: computed$j,toRef: toRef$e,useId: useId$4} = await importShared('vue');
const makeVInputProps = propsFactory({
  id: String,
  appendIcon: IconValue,
  baseColor: String,
  centerAffix: {
    type: Boolean,
    default: true
  },
  color: String,
  glow: Boolean,
  iconColor: [Boolean, String],
  prependIcon: IconValue,
  hideDetails: [Boolean, String],
  hideSpinButtons: Boolean,
  hint: String,
  persistentHint: Boolean,
  messages: {
    type: [Array, String],
    default: () => []
  },
  direction: {
    type: String,
    default: 'horizontal',
    validator: v => ['horizontal', 'vertical'].includes(v)
  },
  'onClick:prepend': EventProp(),
  'onClick:append': EventProp(),
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...pick(makeDimensionProps(), ['maxWidth', 'minWidth', 'width']),
  ...makeThemeProps(),
  ...makeValidationProps()
}, 'VInput');
const VInput = genericComponent()({
  name: 'VInput',
  props: {
    ...makeVInputProps()
  },
  emits: {
    'update:modelValue': value => true
  },
  setup(props, _ref) {
    let {
      attrs,
      slots,
      emit
    } = _ref;
    const {
      densityClasses
    } = useDensity(props);
    const {
      dimensionStyles
    } = useDimension(props);
    const {
      themeClasses
    } = provideTheme(props);
    const {
      rtlClasses
    } = useRtl();
    const {
      InputIcon
    } = useInputIcon(props);
    const uid = useId$4();
    const id = computed$j(() => props.id || `input-${uid}`);
    const {
      errorMessages,
      isDirty,
      isDisabled,
      isReadonly,
      isPristine,
      isValid,
      isValidating,
      reset,
      resetValidation,
      validate,
      validationClasses
    } = useValidation(props, 'v-input', id);
    const messages = computed$j(() => {
      if (props.errorMessages?.length || !isPristine.value && errorMessages.value.length) {
        return errorMessages.value;
      } else if (props.hint && (props.persistentHint || props.focused)) {
        return props.hint;
      } else {
        return props.messages;
      }
    });
    const hasMessages = toRef$e(() => messages.value.length > 0);
    const hasDetails = toRef$e(() => !props.hideDetails || props.hideDetails === 'auto' && (hasMessages.value || !!slots.details));
    const messagesId = computed$j(() => hasDetails.value ? `${id.value}-messages` : undefined);
    const slotProps = computed$j(() => ({
      id,
      messagesId,
      isDirty,
      isDisabled,
      isReadonly,
      isPristine,
      isValid,
      isValidating,
      hasDetails,
      reset,
      resetValidation,
      validate
    }));
    const color = toRef$e(() => {
      return props.error || props.disabled ? undefined : props.focused ? props.color : props.baseColor;
    });
    const iconColor = toRef$e(() => {
      if (!props.iconColor) return undefined;
      return props.iconColor === true ? color.value : props.iconColor;
    });
    useRender(() => {
      const hasPrepend = !!(slots.prepend || props.prependIcon);
      const hasAppend = !!(slots.append || props.appendIcon);
      return _createElementVNode$d("div", {
        "class": _normalizeClass$b(['v-input', `v-input--${props.direction}`, {
          'v-input--center-affix': props.centerAffix,
          'v-input--focused': props.focused,
          'v-input--glow': props.glow,
          'v-input--hide-spin-buttons': props.hideSpinButtons
        }, densityClasses.value, themeClasses.value, rtlClasses.value, validationClasses.value, props.class]),
        "style": _normalizeStyle$a([dimensionStyles.value, props.style])
      }, [hasPrepend && _createElementVNode$d("div", {
        "key": "prepend",
        "class": "v-input__prepend"
      }, [slots.prepend?.(slotProps.value), props.prependIcon && _createVNode$h(InputIcon, {
        "key": "prepend-icon",
        "name": "prepend",
        "color": iconColor.value
      }, null)]), slots.default && _createElementVNode$d("div", {
        "class": "v-input__control"
      }, [slots.default?.(slotProps.value)]), hasAppend && _createElementVNode$d("div", {
        "key": "append",
        "class": "v-input__append"
      }, [props.appendIcon && _createVNode$h(InputIcon, {
        "key": "append-icon",
        "name": "append",
        "color": iconColor.value
      }, null), slots.append?.(slotProps.value)]), hasDetails.value && _createElementVNode$d("div", {
        "id": messagesId.value,
        "class": "v-input__details",
        "role": "alert",
        "aria-live": "polite"
      }, [_createVNode$h(VMessages, {
        "active": hasMessages.value,
        "messages": messages.value
      }, {
        message: slots.message
      }), slots.details?.(slotProps.value)])]);
    });
    return {
      reset,
      resetValidation,
      validate,
      isValid,
      errorMessages
    };
  }
});

function calculateUpdatedTarget(_ref) {
  let {
    selectedElement,
    containerElement,
    isRtl,
    isHorizontal
  } = _ref;
  const containerSize = getOffsetSize(isHorizontal, containerElement);
  const scrollPosition = getScrollPosition(isHorizontal, isRtl, containerElement);
  const childrenSize = getOffsetSize(isHorizontal, selectedElement);
  const childrenStartPosition = getOffsetPosition(isHorizontal, selectedElement);
  const additionalOffset = childrenSize * 0.4;
  if (scrollPosition > childrenStartPosition) {
    return childrenStartPosition - additionalOffset;
  } else if (scrollPosition + containerSize < childrenStartPosition + childrenSize) {
    return childrenStartPosition - containerSize + childrenSize + additionalOffset;
  }
  return scrollPosition;
}
function calculateCenteredTarget(_ref2) {
  let {
    selectedElement,
    containerElement,
    isHorizontal
  } = _ref2;
  const containerOffsetSize = getOffsetSize(isHorizontal, containerElement);
  const childrenOffsetPosition = getOffsetPosition(isHorizontal, selectedElement);
  const childrenOffsetSize = getOffsetSize(isHorizontal, selectedElement);
  return childrenOffsetPosition - containerOffsetSize / 2 + childrenOffsetSize / 2;
}
function getScrollSize(isHorizontal, element) {
  const key = isHorizontal ? 'scrollWidth' : 'scrollHeight';
  return element?.[key] || 0;
}
function getClientSize(isHorizontal, element) {
  const key = isHorizontal ? 'clientWidth' : 'clientHeight';
  return element?.[key] || 0;
}
function getScrollPosition(isHorizontal, rtl, element) {
  if (!element) {
    return 0;
  }
  const {
    scrollLeft,
    offsetWidth,
    scrollWidth
  } = element;
  if (isHorizontal) {
    return rtl ? scrollWidth - offsetWidth + scrollLeft : scrollLeft;
  }
  return element.scrollTop;
}
function getOffsetSize(isHorizontal, element) {
  const key = isHorizontal ? 'offsetWidth' : 'offsetHeight';
  return element?.[key] || 0;
}
function getOffsetPosition(isHorizontal, element) {
  const key = isHorizontal ? 'offsetLeft' : 'offsetTop';
  return element?.[key] || 0;
}

const {createVNode:_createVNode$g,normalizeClass:_normalizeClass$a,createElementVNode:_createElementVNode$c,normalizeStyle:_normalizeStyle$9} = await importShared('vue');
const {computed: computed$i,shallowRef: shallowRef$d,watch: watch$d} = await importShared('vue');
const VSlideGroupSymbol = Symbol.for('vuetify:v-slide-group');
const makeVSlideGroupProps = propsFactory({
  centerActive: Boolean,
  scrollToActive: {
    type: Boolean,
    default: true
  },
  contentClass: null,
  direction: {
    type: String,
    default: 'horizontal'
  },
  symbol: {
    type: null,
    default: VSlideGroupSymbol
  },
  nextIcon: {
    type: IconValue,
    default: '$next'
  },
  prevIcon: {
    type: IconValue,
    default: '$prev'
  },
  showArrows: {
    type: [Boolean, String],
    validator: v => typeof v === 'boolean' || ['always', 'desktop', 'mobile'].includes(v)
  },
  ...makeComponentProps(),
  ...makeDisplayProps({
    mobile: null
  }),
  ...makeTagProps(),
  ...makeGroupProps({
    selectedClass: 'v-slide-group-item--active'
  })
}, 'VSlideGroup');
const VSlideGroup = genericComponent()({
  name: 'VSlideGroup',
  props: makeVSlideGroupProps(),
  emits: {
    'update:modelValue': value => true
  },
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      isRtl
    } = useRtl();
    const {
      displayClasses,
      mobile
    } = useDisplay(props);
    const group = useGroup(props, props.symbol);
    const isOverflowing = shallowRef$d(false);
    const scrollOffset = shallowRef$d(0);
    const containerSize = shallowRef$d(0);
    const contentSize = shallowRef$d(0);
    const isHorizontal = computed$i(() => props.direction === 'horizontal');
    const {
      resizeRef: containerRef,
      contentRect: containerRect
    } = useResizeObserver();
    const {
      resizeRef: contentRef,
      contentRect
    } = useResizeObserver();
    const goTo = useGoTo();
    const goToOptions = computed$i(() => {
      return {
        container: containerRef.el,
        duration: 200,
        easing: 'easeOutQuart'
      };
    });
    const firstSelectedIndex = computed$i(() => {
      if (!group.selected.value.length) return -1;
      return group.items.value.findIndex(item => item.id === group.selected.value[0]);
    });
    const lastSelectedIndex = computed$i(() => {
      if (!group.selected.value.length) return -1;
      return group.items.value.findIndex(item => item.id === group.selected.value[group.selected.value.length - 1]);
    });
    if (IN_BROWSER) {
      let frame = -1;
      watch$d(() => [group.selected.value, containerRect.value, contentRect.value, isHorizontal.value], () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          if (containerRect.value && contentRect.value) {
            const sizeProperty = isHorizontal.value ? 'width' : 'height';
            containerSize.value = containerRect.value[sizeProperty];
            contentSize.value = contentRect.value[sizeProperty];
            isOverflowing.value = containerSize.value + 1 < contentSize.value;
          }
          if (props.scrollToActive && firstSelectedIndex.value >= 0 && contentRef.el) {
            // TODO: Is this too naive? Should we store element references in group composable?
            const selectedElement = contentRef.el.children[lastSelectedIndex.value];
            scrollToChildren(selectedElement, props.centerActive);
          }
        });
      });
    }
    const isFocused = shallowRef$d(false);
    function scrollToChildren(children, center) {
      let target = 0;
      if (center) {
        target = calculateCenteredTarget({
          containerElement: containerRef.el,
          isHorizontal: isHorizontal.value,
          selectedElement: children
        });
      } else {
        target = calculateUpdatedTarget({
          containerElement: containerRef.el,
          isHorizontal: isHorizontal.value,
          isRtl: isRtl.value,
          selectedElement: children
        });
      }
      scrollToPosition(target);
    }
    function scrollToPosition(newPosition) {
      if (!IN_BROWSER || !containerRef.el) return;
      const offsetSize = getOffsetSize(isHorizontal.value, containerRef.el);
      const scrollPosition = getScrollPosition(isHorizontal.value, isRtl.value, containerRef.el);
      const scrollSize = getScrollSize(isHorizontal.value, containerRef.el);
      if (scrollSize <= offsetSize ||
      // Prevent scrolling by only a couple of pixels, which doesn't look smooth
      Math.abs(newPosition - scrollPosition) < 16) return;
      if (isHorizontal.value && isRtl.value && containerRef.el) {
        const {
          scrollWidth,
          offsetWidth: containerWidth
        } = containerRef.el;
        newPosition = scrollWidth - containerWidth - newPosition;
      }
      if (isHorizontal.value) {
        goTo.horizontal(newPosition, goToOptions.value);
      } else {
        goTo(newPosition, goToOptions.value);
      }
    }
    function onScroll(e) {
      const {
        scrollTop,
        scrollLeft
      } = e.target;
      scrollOffset.value = isHorizontal.value ? scrollLeft : scrollTop;
    }
    function onFocusin(e) {
      isFocused.value = true;
      if (!isOverflowing.value || !contentRef.el) return;

      // Focused element is likely to be the root of an item, so a
      // breadth-first search will probably find it in the first iteration
      for (const el of e.composedPath()) {
        for (const item of contentRef.el.children) {
          if (item === el) {
            scrollToChildren(item);
            return;
          }
        }
      }
    }
    function onFocusout(e) {
      isFocused.value = false;
    }

    // Affix clicks produce onFocus that we have to ignore to avoid extra scrollToChildren
    let ignoreFocusEvent = false;
    function onFocus(e) {
      if (!ignoreFocusEvent && !isFocused.value && !(e.relatedTarget && contentRef.el?.contains(e.relatedTarget))) focus();
      ignoreFocusEvent = false;
    }
    function onFocusAffixes() {
      ignoreFocusEvent = true;
    }
    function onKeydown(e) {
      if (!contentRef.el) return;
      function toFocus(location) {
        e.preventDefault();
        focus(location);
      }
      if (isHorizontal.value) {
        if (e.key === 'ArrowRight') {
          toFocus(isRtl.value ? 'prev' : 'next');
        } else if (e.key === 'ArrowLeft') {
          toFocus(isRtl.value ? 'next' : 'prev');
        }
      } else {
        if (e.key === 'ArrowDown') {
          toFocus('next');
        } else if (e.key === 'ArrowUp') {
          toFocus('prev');
        }
      }
      if (e.key === 'Home') {
        toFocus('first');
      } else if (e.key === 'End') {
        toFocus('last');
      }
    }
    function getSiblingElement(el, location) {
      if (!el) return undefined;
      let sibling = el;
      do {
        sibling = sibling?.[location === 'next' ? 'nextElementSibling' : 'previousElementSibling'];
      } while (sibling?.hasAttribute('disabled'));
      return sibling;
    }
    function focus(location) {
      if (!contentRef.el) return;
      let el;
      if (!location) {
        const focusable = focusableChildren(contentRef.el);
        el = focusable[0];
      } else if (location === 'next') {
        el = getSiblingElement(contentRef.el.querySelector(':focus'), location);
        if (!el) return focus('first');
      } else if (location === 'prev') {
        el = getSiblingElement(contentRef.el.querySelector(':focus'), location);
        if (!el) return focus('last');
      } else if (location === 'first') {
        el = contentRef.el.firstElementChild;
        if (el?.hasAttribute('disabled')) el = getSiblingElement(el, 'next');
      } else if (location === 'last') {
        el = contentRef.el.lastElementChild;
        if (el?.hasAttribute('disabled')) el = getSiblingElement(el, 'prev');
      }
      if (el) {
        el.focus({
          preventScroll: true
        });
      }
    }
    function scrollTo(location) {
      const direction = isHorizontal.value && isRtl.value ? -1 : 1;
      const offsetStep = (location === 'prev' ? -direction : direction) * containerSize.value;
      let newPosition = scrollOffset.value + offsetStep;

      // TODO: improve it
      if (isHorizontal.value && isRtl.value && containerRef.el) {
        const {
          scrollWidth,
          offsetWidth: containerWidth
        } = containerRef.el;
        newPosition += scrollWidth - containerWidth;
      }
      scrollToPosition(newPosition);
    }
    const slotProps = computed$i(() => ({
      next: group.next,
      prev: group.prev,
      select: group.select,
      isSelected: group.isSelected
    }));
    const hasOverflowOrScroll = computed$i(() => isOverflowing.value || Math.abs(scrollOffset.value) > 0);
    const hasAffixes = computed$i(() => {
      switch (props.showArrows) {
        // Always show arrows on desktop & mobile
        case 'always':
          return true;

        // Always show arrows on desktop
        case 'desktop':
          return !mobile.value;

        // Show arrows on mobile when overflowing.
        // This matches the default 2.2 behavior
        case true:
          return hasOverflowOrScroll.value;

        // Always show on mobile
        case 'mobile':
          return mobile.value || hasOverflowOrScroll.value;

        // https://material.io/components/tabs#scrollable-tabs
        // Always show arrows when
        // overflowed on desktop
        default:
          return !mobile.value && hasOverflowOrScroll.value;
      }
    });
    const hasPrev = computed$i(() => {
      // 1 pixel in reserve, may be lost after rounding
      return Math.abs(scrollOffset.value) > 1;
    });
    const hasNext = computed$i(() => {
      if (!containerRef.value || !hasOverflowOrScroll.value) return false;
      const scrollSize = getScrollSize(isHorizontal.value, containerRef.el);
      const clientSize = getClientSize(isHorizontal.value, containerRef.el);
      const scrollSizeMax = scrollSize - clientSize;

      // 1 pixel in reserve, may be lost after rounding
      return scrollSizeMax - Math.abs(scrollOffset.value) > 1;
    });
    useRender(() => _createVNode$g(props.tag, {
      "class": _normalizeClass$a(['v-slide-group', {
        'v-slide-group--vertical': !isHorizontal.value,
        'v-slide-group--has-affixes': hasAffixes.value,
        'v-slide-group--is-overflowing': isOverflowing.value
      }, displayClasses.value, props.class]),
      "style": _normalizeStyle$9(props.style),
      "tabindex": isFocused.value || group.selected.value.length ? -1 : 0,
      "onFocus": onFocus
    }, {
      default: () => [hasAffixes.value && _createElementVNode$c("div", {
        "key": "prev",
        "class": _normalizeClass$a(['v-slide-group__prev', {
          'v-slide-group__prev--disabled': !hasPrev.value
        }]),
        "onMousedown": onFocusAffixes,
        "onClick": () => hasPrev.value && scrollTo('prev')
      }, [slots.prev?.(slotProps.value) ?? _createVNode$g(VFadeTransition, null, {
        default: () => [_createVNode$g(VIcon, {
          "icon": isRtl.value ? props.nextIcon : props.prevIcon
        }, null)]
      })]), _createElementVNode$c("div", {
        "key": "container",
        "ref": containerRef,
        "class": _normalizeClass$a(['v-slide-group__container', props.contentClass]),
        "onScroll": onScroll
      }, [_createElementVNode$c("div", {
        "ref": contentRef,
        "class": "v-slide-group__content",
        "onFocusin": onFocusin,
        "onFocusout": onFocusout,
        "onKeydown": onKeydown
      }, [slots.default?.(slotProps.value)])]), hasAffixes.value && _createElementVNode$c("div", {
        "key": "next",
        "class": _normalizeClass$a(['v-slide-group__next', {
          'v-slide-group__next--disabled': !hasNext.value
        }]),
        "onMousedown": onFocusAffixes,
        "onClick": () => hasNext.value && scrollTo('next')
      }, [slots.next?.(slotProps.value) ?? _createVNode$g(VFadeTransition, null, {
        default: () => [_createVNode$g(VIcon, {
          "icon": isRtl.value ? props.prevIcon : props.nextIcon
        }, null)]
      })])]
    }));
    return {
      selected: group.selected,
      scrollTo,
      scrollOffset,
      focus,
      hasPrev,
      hasNext
    };
  }
});

const {mergeProps:_mergeProps$9,createVNode:_createVNode$f} = await importShared('vue');
const {toRef: toRef$d} = await importShared('vue');
const VChipGroupSymbol = Symbol.for('vuetify:v-chip-group');
const makeVChipGroupProps = propsFactory({
  baseColor: String,
  column: Boolean,
  filter: Boolean,
  valueComparator: {
    type: Function,
    default: deepEqual
  },
  ...makeVSlideGroupProps({
    scrollToActive: false
  }),
  ...makeComponentProps(),
  ...makeGroupProps({
    selectedClass: 'v-chip--selected'
  }),
  ...makeTagProps(),
  ...makeThemeProps(),
  ...makeVariantProps({
    variant: 'tonal'
  })
}, 'VChipGroup');
genericComponent()({
  name: 'VChipGroup',
  props: makeVChipGroupProps(),
  emits: {
    'update:modelValue': value => true
  },
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      themeClasses
    } = provideTheme(props);
    const {
      isSelected,
      select,
      next,
      prev,
      selected
    } = useGroup(props, VChipGroupSymbol);
    provideDefaults({
      VChip: {
        baseColor: toRef$d(() => props.baseColor),
        color: toRef$d(() => props.color),
        disabled: toRef$d(() => props.disabled),
        filter: toRef$d(() => props.filter),
        variant: toRef$d(() => props.variant)
      }
    });
    useRender(() => {
      const slideGroupProps = VSlideGroup.filterProps(props);
      return _createVNode$f(VSlideGroup, _mergeProps$9(slideGroupProps, {
        "class": ['v-chip-group', {
          'v-chip-group--column': props.column
        }, themeClasses.value, props.class],
        "style": props.style
      }), {
        default: () => [slots.default?.({
          isSelected,
          select,
          next,
          prev,
          selected: selected.value
        })]
      });
    });
    return {};
  }
});

const {createVNode:_createVNode$e,vShow:_vShow$4,createElementVNode:_createElementVNode$b,withDirectives:_withDirectives$6,Fragment:_Fragment$7,mergeProps:_mergeProps$8} = await importShared('vue');
const {computed: computed$h,toDisplayString: toDisplayString$1,toRef: toRef$c,watch: watch$c} = await importShared('vue');
const makeVChipProps = propsFactory({
  activeClass: String,
  appendAvatar: String,
  appendIcon: IconValue,
  baseColor: String,
  closable: Boolean,
  closeIcon: {
    type: IconValue,
    default: '$delete'
  },
  closeLabel: {
    type: String,
    default: '$vuetify.close'
  },
  draggable: Boolean,
  filter: Boolean,
  filterIcon: {
    type: IconValue,
    default: '$complete'
  },
  label: Boolean,
  link: {
    type: Boolean,
    default: undefined
  },
  pill: Boolean,
  prependAvatar: String,
  prependIcon: IconValue,
  ripple: {
    type: [Boolean, Object],
    default: true
  },
  text: {
    type: [String, Number, Boolean],
    default: undefined
  },
  modelValue: {
    type: Boolean,
    default: true
  },
  onClick: EventProp(),
  onClickOnce: EventProp(),
  ...makeBorderProps(),
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeElevationProps(),
  ...makeGroupItemProps(),
  ...makeRoundedProps(),
  ...makeRouterProps(),
  ...makeSizeProps(),
  ...makeTagProps({
    tag: 'span'
  }),
  ...makeThemeProps(),
  ...makeVariantProps({
    variant: 'tonal'
  })
}, 'VChip');
const VChip = genericComponent()({
  name: 'VChip',
  directives: {
    vRipple: Ripple
  },
  props: makeVChipProps(),
  emits: {
    'click:close': e => true,
    'update:modelValue': value => true,
    'group:selected': val => true,
    click: e => true
  },
  setup(props, _ref) {
    let {
      attrs,
      emit,
      slots
    } = _ref;
    const {
      t
    } = useLocale();
    const {
      borderClasses
    } = useBorder(props);
    const {
      densityClasses
    } = useDensity(props);
    const {
      elevationClasses
    } = useElevation(props);
    const {
      roundedClasses
    } = useRounded(props);
    const {
      sizeClasses
    } = useSize(props);
    const {
      themeClasses
    } = provideTheme(props);
    const isActive = useProxiedModel(props, 'modelValue');
    const group = useGroupItem(props, VChipGroupSymbol, false);
    const slideGroup = useGroupItem(props, VSlideGroupSymbol, false);
    const link = useLink(props, attrs);
    const isLink = toRef$c(() => props.link !== false && link.isLink.value);
    const isClickable = computed$h(() => !props.disabled && props.link !== false && (!!group || props.link || link.isClickable.value));
    const closeProps = toRef$c(() => ({
      'aria-label': t(props.closeLabel),
      disabled: props.disabled,
      onClick(e) {
        e.preventDefault();
        e.stopPropagation();
        isActive.value = false;
        emit('click:close', e);
      }
    }));
    watch$c(isActive, val => {
      if (val) {
        group?.register();
        slideGroup?.register();
      } else {
        group?.unregister();
        slideGroup?.unregister();
      }
    });
    const {
      colorClasses,
      colorStyles,
      variantClasses
    } = useVariant(() => {
      const showColor = !group || group.isSelected.value;
      return {
        color: showColor ? props.color ?? props.baseColor : props.baseColor,
        variant: props.variant
      };
    });
    function onClick(e) {
      emit('click', e);
      if (!isClickable.value) return;
      link.navigate?.(e);
      group?.toggle();
    }
    function onKeyDown(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e);
      }
    }
    return () => {
      const Tag = link.isLink.value ? 'a' : props.tag;
      const hasAppendMedia = !!(props.appendIcon || props.appendAvatar);
      const hasAppend = !!(hasAppendMedia || slots.append);
      const hasClose = !!(slots.close || props.closable);
      const hasFilter = !!(slots.filter || props.filter) && group;
      const hasPrependMedia = !!(props.prependIcon || props.prependAvatar);
      const hasPrepend = !!(hasPrependMedia || slots.prepend);
      return isActive.value && _withDirectives$6(_createVNode$e(Tag, _mergeProps$8(link.linkProps, {
        "class": ['v-chip', {
          'v-chip--disabled': props.disabled,
          'v-chip--label': props.label,
          'v-chip--link': isClickable.value,
          'v-chip--filter': hasFilter,
          'v-chip--pill': props.pill,
          [`${props.activeClass}`]: props.activeClass && link.isActive?.value
        }, themeClasses.value, borderClasses.value, colorClasses.value, densityClasses.value, elevationClasses.value, roundedClasses.value, sizeClasses.value, variantClasses.value, group?.selectedClass.value, props.class],
        "style": [colorStyles.value, props.style],
        "disabled": props.disabled || undefined,
        "draggable": props.draggable,
        "tabindex": isClickable.value ? 0 : undefined,
        "onClick": onClick,
        "onKeydown": isClickable.value && !isLink.value && onKeyDown
      }), {
        default: () => [genOverlays(isClickable.value, 'v-chip'), hasFilter && _createVNode$e(VExpandXTransition, {
          "key": "filter"
        }, {
          default: () => [_withDirectives$6(_createElementVNode$b("div", {
            "class": "v-chip__filter"
          }, [!slots.filter ? _createVNode$e(VIcon, {
            "key": "filter-icon",
            "icon": props.filterIcon
          }, null) : _createVNode$e(VDefaultsProvider, {
            "key": "filter-defaults",
            "disabled": !props.filterIcon,
            "defaults": {
              VIcon: {
                icon: props.filterIcon
              }
            }
          }, slots.filter)]), [[_vShow$4, group.isSelected.value]])]
        }), hasPrepend && _createElementVNode$b("div", {
          "key": "prepend",
          "class": "v-chip__prepend"
        }, [!slots.prepend ? _createElementVNode$b(_Fragment$7, null, [props.prependIcon && _createVNode$e(VIcon, {
          "key": "prepend-icon",
          "icon": props.prependIcon,
          "start": true
        }, null), props.prependAvatar && _createVNode$e(VAvatar, {
          "key": "prepend-avatar",
          "image": props.prependAvatar,
          "start": true
        }, null)]) : _createVNode$e(VDefaultsProvider, {
          "key": "prepend-defaults",
          "disabled": !hasPrependMedia,
          "defaults": {
            VAvatar: {
              image: props.prependAvatar,
              start: true
            },
            VIcon: {
              icon: props.prependIcon,
              start: true
            }
          }
        }, slots.prepend)]), _createElementVNode$b("div", {
          "class": "v-chip__content",
          "data-no-activator": ""
        }, [slots.default?.({
          isSelected: group?.isSelected.value,
          selectedClass: group?.selectedClass.value,
          select: group?.select,
          toggle: group?.toggle,
          value: group?.value.value,
          disabled: props.disabled
        }) ?? toDisplayString$1(props.text)]), hasAppend && _createElementVNode$b("div", {
          "key": "append",
          "class": "v-chip__append"
        }, [!slots.append ? _createElementVNode$b(_Fragment$7, null, [props.appendIcon && _createVNode$e(VIcon, {
          "key": "append-icon",
          "end": true,
          "icon": props.appendIcon
        }, null), props.appendAvatar && _createVNode$e(VAvatar, {
          "key": "append-avatar",
          "end": true,
          "image": props.appendAvatar
        }, null)]) : _createVNode$e(VDefaultsProvider, {
          "key": "append-defaults",
          "disabled": !hasAppendMedia,
          "defaults": {
            VAvatar: {
              end: true,
              image: props.appendAvatar
            },
            VIcon: {
              end: true,
              icon: props.appendIcon
            }
          }
        }, slots.append)]), hasClose && _createElementVNode$b("button", _mergeProps$8({
          "key": "close",
          "class": "v-chip__close",
          "type": "button",
          "data-testid": "close-chip"
        }, closeProps.value), [!slots.close ? _createVNode$e(VIcon, {
          "key": "close-icon",
          "icon": props.closeIcon,
          "size": "x-small"
        }, null) : _createVNode$e(VDefaultsProvider, {
          "key": "close-defaults",
          "defaults": {
            VIcon: {
              icon: props.closeIcon,
              size: 'x-small'
            }
          }
        }, slots.close)])]
      }), [[Ripple, isClickable.value && props.ripple, null]]);
    };
  }
});

const {normalizeClass:_normalizeClass$9,normalizeStyle:_normalizeStyle$8,createElementVNode:_createElementVNode$a} = await importShared('vue');
const {computed: computed$g} = await importShared('vue');
const makeVDividerProps = propsFactory({
  color: String,
  inset: Boolean,
  length: [Number, String],
  opacity: [Number, String],
  thickness: [Number, String],
  vertical: Boolean,
  ...makeComponentProps(),
  ...makeThemeProps()
}, 'VDivider');
const VDivider = genericComponent()({
  name: 'VDivider',
  props: makeVDividerProps(),
  setup(props, _ref) {
    let {
      attrs,
      slots
    } = _ref;
    const {
      themeClasses
    } = provideTheme(props);
    const {
      textColorClasses,
      textColorStyles
    } = useTextColor(() => props.color);
    const dividerStyles = computed$g(() => {
      const styles = {};
      if (props.length) {
        styles[props.vertical ? 'height' : 'width'] = convertToUnit(props.length);
      }
      if (props.thickness) {
        styles[props.vertical ? 'borderRightWidth' : 'borderTopWidth'] = convertToUnit(props.thickness);
      }
      return styles;
    });
    useRender(() => {
      const divider = _createElementVNode$a("hr", {
        "class": _normalizeClass$9([{
          'v-divider': true,
          'v-divider--inset': props.inset,
          'v-divider--vertical': props.vertical
        }, themeClasses.value, textColorClasses.value, props.class]),
        "style": _normalizeStyle$8([dividerStyles.value, textColorStyles.value, {
          '--v-border-opacity': props.opacity
        }, props.style]),
        "aria-orientation": !attrs.role || attrs.role === 'separator' ? props.vertical ? 'vertical' : 'horizontal' : undefined,
        "role": `${attrs.role || 'separator'}`
      }, null);
      if (!slots.default) return divider;
      return _createElementVNode$a("div", {
        "class": _normalizeClass$9(['v-divider__wrapper', {
          'v-divider__wrapper--vertical': props.vertical,
          'v-divider__wrapper--inset': props.inset
        }])
      }, [divider, _createElementVNode$a("div", {
        "class": "v-divider__content"
      }, [slots.default()]), divider]);
    });
    return {};
  }
});

// Utilities
const {computed: computed$f,inject: inject$4,provide: provide$3,shallowRef: shallowRef$c} = await importShared('vue');

// List
const ListKey = Symbol.for('vuetify:list');
function createList() {
  let {
    filterable
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    filterable: false
  };
  const parent = inject$4(ListKey, {
    filterable: false,
    hasPrepend: shallowRef$c(false),
    updateHasPrepend: () => null
  });
  const data = {
    filterable: parent.filterable || filterable,
    hasPrepend: shallowRef$c(false),
    updateHasPrepend: value => {
      if (value) data.hasPrepend.value = value;
    }
  };
  provide$3(ListKey, data);
  return parent;
}
function useList() {
  return inject$4(ListKey, null);
}

/* eslint-disable sonarjs/no-identical-functions */
// Utilities
const {toRaw: toRaw$3} = await importShared('vue');
const independentActiveStrategy = mandatory => {
  const strategy = {
    activate: _ref => {
      let {
        id,
        value,
        activated
      } = _ref;
      id = toRaw$3(id);

      // When mandatory and we're trying to deselect when id
      // is the only currently selected item then do nothing
      if (mandatory && !value && activated.size === 1 && activated.has(id)) return activated;
      if (value) {
        activated.add(id);
      } else {
        activated.delete(id);
      }
      return activated;
    },
    in: (v, children, parents) => {
      let set = new Set();
      if (v != null) {
        for (const id of wrapInArray(v)) {
          set = strategy.activate({
            id,
            value: true,
            activated: new Set(set),
            children,
            parents
          });
        }
      }
      return set;
    },
    out: v => {
      return Array.from(v);
    }
  };
  return strategy;
};
const independentSingleActiveStrategy = mandatory => {
  const parentStrategy = independentActiveStrategy(mandatory);
  const strategy = {
    activate: _ref2 => {
      let {
        activated,
        id,
        ...rest
      } = _ref2;
      id = toRaw$3(id);
      const singleSelected = activated.has(id) ? new Set([id]) : new Set();
      return parentStrategy.activate({
        ...rest,
        id,
        activated: singleSelected
      });
    },
    in: (v, children, parents) => {
      let set = new Set();
      if (v != null) {
        const arr = wrapInArray(v);
        if (arr.length) {
          set = parentStrategy.in(arr.slice(0, 1), children, parents);
        }
      }
      return set;
    },
    out: (v, children, parents) => {
      return parentStrategy.out(v, children, parents);
    }
  };
  return strategy;
};
const leafActiveStrategy = mandatory => {
  const parentStrategy = independentActiveStrategy(mandatory);
  const strategy = {
    activate: _ref3 => {
      let {
        id,
        activated,
        children,
        ...rest
      } = _ref3;
      id = toRaw$3(id);
      if (children.has(id)) return activated;
      return parentStrategy.activate({
        id,
        activated,
        children,
        ...rest
      });
    },
    in: parentStrategy.in,
    out: parentStrategy.out
  };
  return strategy;
};
const leafSingleActiveStrategy = mandatory => {
  const parentStrategy = independentSingleActiveStrategy(mandatory);
  const strategy = {
    activate: _ref4 => {
      let {
        id,
        activated,
        children,
        ...rest
      } = _ref4;
      id = toRaw$3(id);
      if (children.has(id)) return activated;
      return parentStrategy.activate({
        id,
        activated,
        children,
        ...rest
      });
    },
    in: parentStrategy.in,
    out: parentStrategy.out
  };
  return strategy;
};

const singleOpenStrategy = {
  open: _ref => {
    let {
      id,
      value,
      opened,
      parents
    } = _ref;
    if (value) {
      const newOpened = new Set();
      newOpened.add(id);
      let parent = parents.get(id);
      while (parent != null) {
        newOpened.add(parent);
        parent = parents.get(parent);
      }
      return newOpened;
    } else {
      opened.delete(id);
      return opened;
    }
  },
  select: () => null
};
const multipleOpenStrategy = {
  open: _ref2 => {
    let {
      id,
      value,
      opened,
      parents
    } = _ref2;
    if (value) {
      let parent = parents.get(id);
      opened.add(id);
      while (parent != null && parent !== id) {
        opened.add(parent);
        parent = parents.get(parent);
      }
      return opened;
    } else {
      opened.delete(id);
    }
    return opened;
  },
  select: () => null
};
const listOpenStrategy = {
  open: multipleOpenStrategy.open,
  select: _ref3 => {
    let {
      id,
      value,
      opened,
      parents
    } = _ref3;
    if (!value) return opened;
    const path = [];
    let parent = parents.get(id);
    while (parent != null) {
      path.push(parent);
      parent = parents.get(parent);
    }
    return new Set(path);
  }
};

/* eslint-disable sonarjs/no-identical-functions */
// Utilities
const {toRaw: toRaw$2} = await importShared('vue');

const independentSelectStrategy = mandatory => {
  const strategy = {
    select: _ref => {
      let {
        id,
        value,
        selected
      } = _ref;
      id = toRaw$2(id);

      // When mandatory and we're trying to deselect when id
      // is the only currently selected item then do nothing
      if (mandatory && !value) {
        const on = Array.from(selected.entries()).reduce((arr, _ref2) => {
          let [key, value] = _ref2;
          if (value === 'on') arr.push(key);
          return arr;
        }, []);
        if (on.length === 1 && on[0] === id) return selected;
      }
      selected.set(id, value ? 'on' : 'off');
      return selected;
    },
    in: (v, children, parents, disabled) => {
      const map = new Map();
      for (const id of v || []) {
        strategy.select({
          id,
          value: true,
          selected: map,
          children,
          parents,
          disabled
        });
      }
      return map;
    },
    out: v => {
      const arr = [];
      for (const [key, value] of v.entries()) {
        if (value === 'on') arr.push(key);
      }
      return arr;
    }
  };
  return strategy;
};
const independentSingleSelectStrategy = mandatory => {
  const parentStrategy = independentSelectStrategy(mandatory);
  const strategy = {
    select: _ref3 => {
      let {
        selected,
        id,
        ...rest
      } = _ref3;
      id = toRaw$2(id);
      const singleSelected = selected.has(id) ? new Map([[id, selected.get(id)]]) : new Map();
      return parentStrategy.select({
        ...rest,
        id,
        selected: singleSelected
      });
    },
    in: (v, children, parents, disabled) => {
      if (v?.length) {
        return parentStrategy.in(v.slice(0, 1), children, parents, disabled);
      }
      return new Map();
    },
    out: (v, children, parents) => {
      return parentStrategy.out(v, children, parents);
    }
  };
  return strategy;
};
const leafSelectStrategy = mandatory => {
  const parentStrategy = independentSelectStrategy(mandatory);
  const strategy = {
    select: _ref4 => {
      let {
        id,
        selected,
        children,
        ...rest
      } = _ref4;
      id = toRaw$2(id);
      if (children.has(id)) return selected;
      return parentStrategy.select({
        id,
        selected,
        children,
        ...rest
      });
    },
    in: parentStrategy.in,
    out: parentStrategy.out
  };
  return strategy;
};
const leafSingleSelectStrategy = mandatory => {
  const parentStrategy = independentSingleSelectStrategy(mandatory);
  const strategy = {
    select: _ref5 => {
      let {
        id,
        selected,
        children,
        ...rest
      } = _ref5;
      id = toRaw$2(id);
      if (children.has(id)) return selected;
      return parentStrategy.select({
        id,
        selected,
        children,
        ...rest
      });
    },
    in: parentStrategy.in,
    out: parentStrategy.out
  };
  return strategy;
};
const classicSelectStrategy = mandatory => {
  const strategy = {
    select: _ref6 => {
      let {
        id,
        value,
        selected,
        children,
        parents,
        disabled
      } = _ref6;
      id = toRaw$2(id);
      const original = new Map(selected);
      const items = [id];
      while (items.length) {
        const item = items.shift();
        if (!disabled.has(item)) {
          selected.set(toRaw$2(item), value ? 'on' : 'off');
        }
        if (children.has(item)) {
          items.push(...children.get(item));
        }
      }
      let parent = toRaw$2(parents.get(id));
      while (parent) {
        let everySelected = true;
        let noneSelected = true;
        for (const child of children.get(parent)) {
          const cid = toRaw$2(child);
          if (disabled.has(cid)) continue;
          if (selected.get(cid) !== 'on') everySelected = false;
          if (selected.has(cid) && selected.get(cid) !== 'off') noneSelected = false;
          if (!everySelected && !noneSelected) break;
        }
        selected.set(parent, everySelected ? 'on' : noneSelected ? 'off' : 'indeterminate');
        parent = toRaw$2(parents.get(parent));
      }

      // If mandatory and planned deselect results in no selected
      // items then we can't do it, so return original state
      if (mandatory && !value) {
        const on = Array.from(selected.entries()).reduce((arr, _ref7) => {
          let [key, value] = _ref7;
          if (value === 'on') arr.push(key);
          return arr;
        }, []);
        if (on.length === 0) return original;
      }
      return selected;
    },
    in: (v, children, parents, disabled) => {
      let map = new Map();
      for (const id of v || []) {
        map = strategy.select({
          id,
          value: true,
          selected: map,
          children,
          parents,
          disabled
        });
      }
      return map;
    },
    out: (v, children) => {
      const arr = [];
      for (const [key, value] of v.entries()) {
        if (value === 'on' && !children.has(key)) arr.push(key);
      }
      return arr;
    }
  };
  return strategy;
};
const trunkSelectStrategy = mandatory => {
  const parentStrategy = classicSelectStrategy(mandatory);
  const strategy = {
    select: parentStrategy.select,
    in: parentStrategy.in,
    out: (v, children, parents) => {
      const arr = [];
      for (const [key, value] of v.entries()) {
        if (value === 'on') {
          if (parents.has(key)) {
            const parent = parents.get(key);
            if (v.get(parent) === 'on') continue;
          }
          arr.push(key);
        }
      }
      return arr;
    }
  };
  return strategy;
};

const {computed: computed$e,inject: inject$3,nextTick: nextTick$7,onBeforeMount: onBeforeMount$1,onBeforeUnmount: onBeforeUnmount$2,provide: provide$2,ref: ref$9,shallowRef: shallowRef$b,toRaw: toRaw$1,toRef: toRef$b,toValue: toValue$2,watch: watch$b} = await importShared('vue');
const VNestedSymbol = Symbol.for('vuetify:nested');
const emptyNested = {
  id: shallowRef$b(),
  root: {
    register: () => null,
    unregister: () => null,
    children: ref$9(new Map()),
    parents: ref$9(new Map()),
    disabled: ref$9(new Set()),
    open: () => null,
    openOnSelect: () => null,
    activate: () => null,
    select: () => null,
    activatable: ref$9(false),
    selectable: ref$9(false),
    opened: ref$9(new Set()),
    activated: ref$9(new Set()),
    selected: ref$9(new Map()),
    selectedValues: ref$9([]),
    getPath: () => []
  }
};
const makeNestedProps = propsFactory({
  activatable: Boolean,
  selectable: Boolean,
  activeStrategy: [String, Function, Object],
  selectStrategy: [String, Function, Object],
  openStrategy: [String, Object],
  opened: null,
  activated: null,
  selected: null,
  mandatory: Boolean
}, 'nested');
const useNested = props => {
  let isUnmounted = false;
  const children = shallowRef$b(new Map());
  const parents = shallowRef$b(new Map());
  const disabled = shallowRef$b(new Set());
  const opened = useProxiedModel(props, 'opened', props.opened, v => new Set(Array.isArray(v) ? v.map(i => toRaw$1(i)) : v), v => [...v.values()]);
  const activeStrategy = computed$e(() => {
    if (typeof props.activeStrategy === 'object') return props.activeStrategy;
    if (typeof props.activeStrategy === 'function') return props.activeStrategy(props.mandatory);
    switch (props.activeStrategy) {
      case 'leaf':
        return leafActiveStrategy(props.mandatory);
      case 'single-leaf':
        return leafSingleActiveStrategy(props.mandatory);
      case 'independent':
        return independentActiveStrategy(props.mandatory);
      case 'single-independent':
      default:
        return independentSingleActiveStrategy(props.mandatory);
    }
  });
  const selectStrategy = computed$e(() => {
    if (typeof props.selectStrategy === 'object') return props.selectStrategy;
    if (typeof props.selectStrategy === 'function') return props.selectStrategy(props.mandatory);
    switch (props.selectStrategy) {
      case 'single-leaf':
        return leafSingleSelectStrategy(props.mandatory);
      case 'leaf':
        return leafSelectStrategy(props.mandatory);
      case 'independent':
        return independentSelectStrategy(props.mandatory);
      case 'single-independent':
        return independentSingleSelectStrategy(props.mandatory);
      case 'trunk':
        return trunkSelectStrategy(props.mandatory);
      case 'classic':
      default:
        return classicSelectStrategy(props.mandatory);
    }
  });
  const openStrategy = computed$e(() => {
    if (typeof props.openStrategy === 'object') return props.openStrategy;
    switch (props.openStrategy) {
      case 'list':
        return listOpenStrategy;
      case 'single':
        return singleOpenStrategy;
      case 'multiple':
      default:
        return multipleOpenStrategy;
    }
  });
  const activated = useProxiedModel(props, 'activated', props.activated, v => activeStrategy.value.in(v, children.value, parents.value), v => activeStrategy.value.out(v, children.value, parents.value));
  const selected = useProxiedModel(props, 'selected', props.selected, v => selectStrategy.value.in(v, children.value, parents.value, disabled.value), v => selectStrategy.value.out(v, children.value, parents.value));
  onBeforeUnmount$2(() => {
    isUnmounted = true;
  });
  function getPath(id) {
    const path = [];
    let parent = toRaw$1(id);
    while (parent !== undefined) {
      path.unshift(parent);
      parent = parents.value.get(parent);
    }
    return path;
  }
  const vm = getCurrentInstance('nested');
  const nodeIds = new Set();
  const itemsUpdatePropagation = throttle(() => {
    nextTick$7(() => {
      children.value = new Map(children.value);
      parents.value = new Map(parents.value);
    });
  }, 100);
  const nested = {
    id: shallowRef$b(),
    root: {
      opened,
      activatable: toRef$b(() => props.activatable),
      selectable: toRef$b(() => props.selectable),
      activated,
      selected,
      selectedValues: computed$e(() => {
        const arr = [];
        for (const [key, value] of selected.value.entries()) {
          if (value === 'on') arr.push(key);
        }
        return arr;
      }),
      register: (id, parentId, isDisabled, isGroup) => {
        if (nodeIds.has(id)) {
          const path = getPath(id).map(String).join(' -> ');
          const newPath = getPath(parentId).concat(id).map(String).join(' -> ');
          consoleError(`Multiple nodes with the same ID\n\t${path}\n\t${newPath}`);
          return;
        } else {
          nodeIds.add(id);
        }
        parentId && id !== parentId && parents.value.set(id, parentId);
        isDisabled && disabled.value.add(id);
        isGroup && children.value.set(id, []);
        if (parentId != null) {
          children.value.set(parentId, [...(children.value.get(parentId) || []), id]);
        }
        itemsUpdatePropagation();
      },
      unregister: id => {
        if (isUnmounted) return;
        nodeIds.delete(id);
        children.value.delete(id);
        disabled.value.delete(id);
        const parent = parents.value.get(id);
        if (parent) {
          const list = children.value.get(parent) ?? [];
          children.value.set(parent, list.filter(child => child !== id));
        }
        parents.value.delete(id);
        itemsUpdatePropagation();
      },
      open: (id, value, event) => {
        vm.emit('click:open', {
          id,
          value,
          path: getPath(id),
          event
        });
        const newOpened = openStrategy.value.open({
          id,
          value,
          opened: new Set(opened.value),
          children: children.value,
          parents: parents.value,
          event
        });
        newOpened && (opened.value = newOpened);
      },
      openOnSelect: (id, value, event) => {
        const newOpened = openStrategy.value.select({
          id,
          value,
          selected: new Map(selected.value),
          opened: new Set(opened.value),
          children: children.value,
          parents: parents.value,
          event
        });
        newOpened && (opened.value = newOpened);
      },
      select: (id, value, event) => {
        vm.emit('click:select', {
          id,
          value,
          path: getPath(id),
          event
        });
        const newSelected = selectStrategy.value.select({
          id,
          value,
          selected: new Map(selected.value),
          children: children.value,
          parents: parents.value,
          disabled: disabled.value,
          event
        });
        newSelected && (selected.value = newSelected);
        nested.root.openOnSelect(id, value, event);
      },
      activate: (id, value, event) => {
        if (!props.activatable) {
          return nested.root.select(id, true, event);
        }
        vm.emit('click:activate', {
          id,
          value,
          path: getPath(id),
          event
        });
        const newActivated = activeStrategy.value.activate({
          id,
          value,
          activated: new Set(activated.value),
          children: children.value,
          parents: parents.value,
          event
        });
        if (newActivated.size !== activated.value.size) {
          activated.value = newActivated;
        } else {
          for (const value of newActivated) {
            if (!activated.value.has(value)) {
              activated.value = newActivated;
              return;
            }
          }
          for (const value of activated.value) {
            if (!newActivated.has(value)) {
              activated.value = newActivated;
              return;
            }
          }
        }
      },
      children,
      parents,
      disabled,
      getPath
    }
  };
  provide$2(VNestedSymbol, nested);
  return nested.root;
};
const useNestedItem = (id, isDisabled, isGroup) => {
  const parent = inject$3(VNestedSymbol, emptyNested);
  const uidSymbol = Symbol('nested item');
  const computedId = computed$e(() => {
    const idValue = toRaw$1(toValue$2(id));
    return idValue !== undefined ? idValue : uidSymbol;
  });
  const item = {
    ...parent,
    id: computedId,
    open: (open, e) => parent.root.open(computedId.value, open, e),
    openOnSelect: (open, e) => parent.root.openOnSelect(computedId.value, open, e),
    isOpen: computed$e(() => parent.root.opened.value.has(computedId.value)),
    parent: computed$e(() => parent.root.parents.value.get(computedId.value)),
    activate: (activated, e) => parent.root.activate(computedId.value, activated, e),
    isActivated: computed$e(() => parent.root.activated.value.has(computedId.value)),
    select: (selected, e) => parent.root.select(computedId.value, selected, e),
    isSelected: computed$e(() => parent.root.selected.value.get(computedId.value) === 'on'),
    isIndeterminate: computed$e(() => parent.root.selected.value.get(computedId.value) === 'indeterminate'),
    isLeaf: computed$e(() => !parent.root.children.value.get(computedId.value)),
    isGroupActivator: parent.isGroupActivator
  };
  onBeforeMount$1(() => {
    if (!parent.isGroupActivator) {
      nextTick$7(() => {
        parent.root.register(computedId.value, parent.id.value, toValue$2(isDisabled), isGroup);
      });
    }
  });
  onBeforeUnmount$2(() => {
    if (!parent.isGroupActivator) {
      parent.root.unregister(computedId.value);
    }
  });
  watch$b(computedId, (val, oldVal) => {
    if (!parent.isGroupActivator) {
      parent.root.unregister(oldVal);
      nextTick$7(() => {
        parent.root.register(val, parent.id.value, toValue$2(isDisabled), isGroup);
      });
    }
  });
  isGroup && provide$2(VNestedSymbol, item);
  return item;
};
const useNestedGroupActivator = () => {
  const parent = inject$3(VNestedSymbol, emptyNested);
  provide$2(VNestedSymbol, {
    ...parent,
    isGroupActivator: true
  });
};

// Utilities
const {onMounted: onMounted$2,readonly: readonly$1,shallowRef: shallowRef$a,toRef: toRef$a} = await importShared('vue');


// Composables
function useSsrBoot() {
  const isBooted = shallowRef$a(false);
  onMounted$2(() => {
    window.requestAnimationFrame(() => {
      isBooted.value = true;
    });
  });
  const ssrBootStyles = toRef$a(() => !isBooted.value ? {
    transition: 'none !important'
  } : undefined);
  return {
    ssrBootStyles,
    isBooted: readonly$1(isBooted)
  };
}

const {createVNode:_createVNode$d,vShow:_vShow$3,createElementVNode:_createElementVNode$9,withDirectives:_withDirectives$5,normalizeClass:_normalizeClass$8,normalizeStyle:_normalizeStyle$7} = await importShared('vue');
const {computed: computed$d} = await importShared('vue');
const VListGroupActivator = defineComponent({
  name: 'VListGroupActivator',
  setup(_, _ref) {
    let {
      slots
    } = _ref;
    useNestedGroupActivator();
    return () => slots.default?.();
  }
});
const makeVListGroupProps = propsFactory({
  /* @deprecated */
  activeColor: String,
  baseColor: String,
  color: String,
  collapseIcon: {
    type: IconValue,
    default: '$collapse'
  },
  disabled: Boolean,
  expandIcon: {
    type: IconValue,
    default: '$expand'
  },
  rawId: [String, Number],
  prependIcon: IconValue,
  appendIcon: IconValue,
  fluid: Boolean,
  subgroup: Boolean,
  title: String,
  value: null,
  ...makeComponentProps(),
  ...makeTagProps()
}, 'VListGroup');
const VListGroup = genericComponent()({
  name: 'VListGroup',
  props: makeVListGroupProps(),
  setup(props, _ref2) {
    let {
      slots
    } = _ref2;
    const {
      isOpen,
      open,
      id: _id
    } = useNestedItem(() => props.value, () => props.disabled, true);
    const id = computed$d(() => `v-list-group--id-${String(props.rawId ?? _id.value)}`);
    const list = useList();
    const {
      isBooted
    } = useSsrBoot();
    function onClick(e) {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      open(!isOpen.value, e);
    }
    const activatorProps = computed$d(() => ({
      onClick,
      class: 'v-list-group__header',
      id: id.value
    }));
    const toggleIcon = computed$d(() => isOpen.value ? props.collapseIcon : props.expandIcon);
    const activatorDefaults = computed$d(() => ({
      VListItem: {
        activeColor: props.activeColor,
        baseColor: props.baseColor,
        color: props.color,
        prependIcon: props.prependIcon || props.subgroup && toggleIcon.value,
        appendIcon: props.appendIcon || !props.subgroup && toggleIcon.value,
        title: props.title,
        value: props.value
      }
    }));
    useRender(() => _createVNode$d(props.tag, {
      "class": _normalizeClass$8(['v-list-group', {
        'v-list-group--prepend': list?.hasPrepend.value,
        'v-list-group--fluid': props.fluid,
        'v-list-group--subgroup': props.subgroup,
        'v-list-group--open': isOpen.value
      }, props.class]),
      "style": _normalizeStyle$7(props.style)
    }, {
      default: () => [slots.activator && _createVNode$d(VDefaultsProvider, {
        "defaults": activatorDefaults.value
      }, {
        default: () => [_createVNode$d(VListGroupActivator, null, {
          default: () => [slots.activator({
            props: activatorProps.value,
            isOpen: isOpen.value
          })]
        })]
      }), _createVNode$d(MaybeTransition, {
        "transition": {
          component: VExpandTransition
        },
        "disabled": !isBooted.value
      }, {
        default: () => [_withDirectives$5(_createElementVNode$9("div", {
          "class": "v-list-group__items",
          "role": "group",
          "aria-labelledby": id.value
        }, [slots.default?.()]), [[_vShow$3, isOpen.value]])]
      })]
    }));
    return {
      isOpen
    };
  }
});

const {normalizeClass:_normalizeClass$7,normalizeStyle:_normalizeStyle$6,createVNode:_createVNode$c} = await importShared('vue');
const makeVListItemSubtitleProps = propsFactory({
  opacity: [Number, String],
  ...makeComponentProps(),
  ...makeTagProps()
}, 'VListItemSubtitle');
const VListItemSubtitle = genericComponent()({
  name: 'VListItemSubtitle',
  props: makeVListItemSubtitleProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    useRender(() => _createVNode$c(props.tag, {
      "class": _normalizeClass$7(['v-list-item-subtitle', props.class]),
      "style": _normalizeStyle$6([{
        '--v-list-item-subtitle-opacity': props.opacity
      }, props.style])
    }, slots));
    return {};
  }
});

// Utilities
const VListItemTitle = createSimpleFunctional('v-list-item-title');

const {Fragment:_Fragment$6,createVNode:_createVNode$b,createElementVNode:_createElementVNode$8,mergeProps:_mergeProps$7,withDirectives:_withDirectives$4} = await importShared('vue');
const {computed: computed$c,nextTick: nextTick$6,onBeforeMount,toDisplayString,toRef: toRef$9,watch: watch$a} = await importShared('vue');
const makeVListItemProps = propsFactory({
  active: {
    type: Boolean,
    default: undefined
  },
  activeClass: String,
  /* @deprecated */
  activeColor: String,
  appendAvatar: String,
  appendIcon: IconValue,
  baseColor: String,
  disabled: Boolean,
  lines: [Boolean, String],
  link: {
    type: Boolean,
    default: undefined
  },
  nav: Boolean,
  prependAvatar: String,
  prependIcon: IconValue,
  ripple: {
    type: [Boolean, Object],
    default: true
  },
  slim: Boolean,
  subtitle: {
    type: [String, Number, Boolean],
    default: undefined
  },
  title: {
    type: [String, Number, Boolean],
    default: undefined
  },
  value: null,
  onClick: EventProp(),
  onClickOnce: EventProp(),
  ...makeBorderProps(),
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeDimensionProps(),
  ...makeElevationProps(),
  ...makeRoundedProps(),
  ...makeRouterProps(),
  ...makeTagProps(),
  ...makeThemeProps(),
  ...makeVariantProps({
    variant: 'text'
  })
}, 'VListItem');
const VListItem = genericComponent()({
  name: 'VListItem',
  directives: {
    vRipple: Ripple
  },
  props: makeVListItemProps(),
  emits: {
    click: e => true
  },
  setup(props, _ref) {
    let {
      attrs,
      slots,
      emit
    } = _ref;
    const link = useLink(props, attrs);
    const id = computed$c(() => props.value === undefined ? link.href.value : props.value);
    const {
      activate,
      isActivated,
      select,
      isOpen,
      isSelected,
      isIndeterminate,
      isGroupActivator,
      root,
      parent,
      openOnSelect,
      id: uid
    } = useNestedItem(id, () => props.disabled, false);
    const list = useList();
    const isActive = computed$c(() => props.active !== false && (props.active || link.isActive?.value || (root.activatable.value ? isActivated.value : isSelected.value)));
    const isLink = toRef$9(() => props.link !== false && link.isLink.value);
    const isSelectable = computed$c(() => !!list && (root.selectable.value || root.activatable.value || props.value != null));
    const isClickable = computed$c(() => !props.disabled && props.link !== false && (props.link || link.isClickable.value || isSelectable.value));
    const role = computed$c(() => list ? isLink.value ? 'link' : isSelectable.value ? 'option' : 'listitem' : undefined);
    const ariaSelected = computed$c(() => {
      if (!isSelectable.value) return undefined;
      return root.activatable.value ? isActivated.value : root.selectable.value ? isSelected.value : isActive.value;
    });
    const roundedProps = toRef$9(() => props.rounded || props.nav);
    const color = toRef$9(() => props.color ?? props.activeColor);
    const variantProps = toRef$9(() => ({
      color: isActive.value ? color.value ?? props.baseColor : props.baseColor,
      variant: props.variant
    }));

    // useNestedItem doesn't call register until beforeMount,
    // so this can't be an immediate watcher as we don't know parent yet
    watch$a(() => link.isActive?.value, val => {
      if (!val) return;
      handleActiveLink();
    });
    onBeforeMount(() => {
      if (link.isActive?.value) {
        nextTick$6(() => handleActiveLink());
      }
    });
    function handleActiveLink() {
      if (parent.value != null) {
        root.open(parent.value, true);
      }
      openOnSelect(true);
    }
    const {
      themeClasses
    } = provideTheme(props);
    const {
      borderClasses
    } = useBorder(props);
    const {
      colorClasses,
      colorStyles,
      variantClasses
    } = useVariant(variantProps);
    const {
      densityClasses
    } = useDensity(props);
    const {
      dimensionStyles
    } = useDimension(props);
    const {
      elevationClasses
    } = useElevation(props);
    const {
      roundedClasses
    } = useRounded(roundedProps);
    const lineClasses = toRef$9(() => props.lines ? `v-list-item--${props.lines}-line` : undefined);
    const rippleOptions = toRef$9(() => props.ripple !== undefined && !!props.ripple && list?.filterable ? {
      keys: ['Enter']
    } : props.ripple);
    const slotProps = computed$c(() => ({
      isActive: isActive.value,
      select,
      isOpen: isOpen.value,
      isSelected: isSelected.value,
      isIndeterminate: isIndeterminate.value
    }));
    function onClick(e) {
      emit('click', e);
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if (!isClickable.value) return;
      link.navigate?.(e);
      if (isGroupActivator) return;
      if (root.activatable.value) {
        activate(!isActivated.value, e);
      } else if (root.selectable.value) {
        select(!isSelected.value, e);
      } else if (props.value != null && !isLink.value) {
        select(!isSelected.value, e);
      }
    }
    function onKeyDown(e) {
      const target = e.target;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      if (e.key === 'Enter' || e.key === ' ' && !list?.filterable) {
        e.preventDefault();
        e.stopPropagation();
        e.target.dispatchEvent(new MouseEvent('click', e));
      }
    }
    useRender(() => {
      const Tag = isLink.value ? 'a' : props.tag;
      const hasTitle = slots.title || props.title != null;
      const hasSubtitle = slots.subtitle || props.subtitle != null;
      const hasAppendMedia = !!(props.appendAvatar || props.appendIcon);
      const hasAppend = !!(hasAppendMedia || slots.append);
      const hasPrependMedia = !!(props.prependAvatar || props.prependIcon);
      const hasPrepend = !!(hasPrependMedia || slots.prepend);
      list?.updateHasPrepend(hasPrepend);
      if (props.activeColor) {
        deprecate('active-color', ['color', 'base-color']);
      }
      return _withDirectives$4(_createVNode$b(Tag, _mergeProps$7(link.linkProps, {
        "class": ['v-list-item', {
          'v-list-item--active': isActive.value,
          'v-list-item--disabled': props.disabled,
          'v-list-item--link': isClickable.value,
          'v-list-item--nav': props.nav,
          'v-list-item--prepend': !hasPrepend && list?.hasPrepend.value,
          'v-list-item--slim': props.slim,
          [`${props.activeClass}`]: props.activeClass && isActive.value
        }, themeClasses.value, borderClasses.value, colorClasses.value, densityClasses.value, elevationClasses.value, lineClasses.value, roundedClasses.value, variantClasses.value, props.class],
        "style": [colorStyles.value, dimensionStyles.value, props.style],
        "tabindex": isClickable.value ? list ? -2 : 0 : undefined,
        "aria-selected": ariaSelected.value,
        "role": role.value,
        "onClick": onClick,
        "onKeydown": isClickable.value && !isLink.value && onKeyDown
      }), {
        default: () => [genOverlays(isClickable.value || isActive.value, 'v-list-item'), hasPrepend && _createElementVNode$8("div", {
          "key": "prepend",
          "class": "v-list-item__prepend"
        }, [!slots.prepend ? _createElementVNode$8(_Fragment$6, null, [props.prependAvatar && _createVNode$b(VAvatar, {
          "key": "prepend-avatar",
          "density": props.density,
          "image": props.prependAvatar
        }, null), props.prependIcon && _createVNode$b(VIcon, {
          "key": "prepend-icon",
          "density": props.density,
          "icon": props.prependIcon
        }, null)]) : _createVNode$b(VDefaultsProvider, {
          "key": "prepend-defaults",
          "disabled": !hasPrependMedia,
          "defaults": {
            VAvatar: {
              density: props.density,
              image: props.prependAvatar
            },
            VIcon: {
              density: props.density,
              icon: props.prependIcon
            },
            VListItemAction: {
              start: true
            }
          }
        }, {
          default: () => [slots.prepend?.(slotProps.value)]
        }), _createElementVNode$8("div", {
          "class": "v-list-item__spacer"
        }, null)]), _createElementVNode$8("div", {
          "class": "v-list-item__content",
          "data-no-activator": ""
        }, [hasTitle && _createVNode$b(VListItemTitle, {
          "key": "title"
        }, {
          default: () => [slots.title?.({
            title: props.title
          }) ?? toDisplayString(props.title)]
        }), hasSubtitle && _createVNode$b(VListItemSubtitle, {
          "key": "subtitle"
        }, {
          default: () => [slots.subtitle?.({
            subtitle: props.subtitle
          }) ?? toDisplayString(props.subtitle)]
        }), slots.default?.(slotProps.value)]), hasAppend && _createElementVNode$8("div", {
          "key": "append",
          "class": "v-list-item__append"
        }, [!slots.append ? _createElementVNode$8(_Fragment$6, null, [props.appendIcon && _createVNode$b(VIcon, {
          "key": "append-icon",
          "density": props.density,
          "icon": props.appendIcon
        }, null), props.appendAvatar && _createVNode$b(VAvatar, {
          "key": "append-avatar",
          "density": props.density,
          "image": props.appendAvatar
        }, null)]) : _createVNode$b(VDefaultsProvider, {
          "key": "append-defaults",
          "disabled": !hasAppendMedia,
          "defaults": {
            VAvatar: {
              density: props.density,
              image: props.appendAvatar
            },
            VIcon: {
              density: props.density,
              icon: props.appendIcon
            },
            VListItemAction: {
              end: true
            }
          }
        }, {
          default: () => [slots.append?.(slotProps.value)]
        }), _createElementVNode$8("div", {
          "class": "v-list-item__spacer"
        }, null)])]
      }), [[Ripple, isClickable.value && rippleOptions.value]]);
    });
    return {
      activate,
      isActivated,
      isGroupActivator,
      isSelected,
      list,
      select,
      root,
      id: uid,
      link
    };
  }
});

const {createElementVNode:_createElementVNode$7,normalizeClass:_normalizeClass$6,normalizeStyle:_normalizeStyle$5,createVNode:_createVNode$a} = await importShared('vue');
const makeVListSubheaderProps = propsFactory({
  color: String,
  inset: Boolean,
  sticky: Boolean,
  title: String,
  ...makeComponentProps(),
  ...makeTagProps()
}, 'VListSubheader');
const VListSubheader = genericComponent()({
  name: 'VListSubheader',
  props: makeVListSubheaderProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      textColorClasses,
      textColorStyles
    } = useTextColor(() => props.color);
    useRender(() => {
      const hasText = !!(slots.default || props.title);
      return _createVNode$a(props.tag, {
        "class": _normalizeClass$6(['v-list-subheader', {
          'v-list-subheader--inset': props.inset,
          'v-list-subheader--sticky': props.sticky
        }, textColorClasses.value, props.class]),
        "style": _normalizeStyle$5([{
          textColorStyles
        }, props.style])
      }, {
        default: () => [hasText && _createElementVNode$7("div", {
          "class": "v-list-subheader__text"
        }, [slots.default?.() ?? props.title])]
      });
    });
    return {};
  }
});

const {createVNode:_createVNode$9,mergeProps:_mergeProps$6} = await importShared('vue');
const {mergeProps: mergeProps$4} = await importShared('vue');
const makeVListChildrenProps = propsFactory({
  items: Array,
  returnObject: Boolean
}, 'VListChildren');
const VListChildren = genericComponent()({
  name: 'VListChildren',
  props: makeVListChildrenProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    createList();
    return () => slots.default?.() ?? props.items?.map(_ref2 => {
      let {
        children,
        props: itemProps,
        type,
        raw: item
      } = _ref2;
      if (type === 'divider') {
        return slots.divider?.({
          props: itemProps
        }) ?? _createVNode$9(VDivider, itemProps, null);
      }
      if (type === 'subheader') {
        return slots.subheader?.({
          props: itemProps
        }) ?? _createVNode$9(VListSubheader, itemProps, null);
      }
      const slotsWithItem = {
        subtitle: slots.subtitle ? slotProps => slots.subtitle?.({
          ...slotProps,
          item
        }) : undefined,
        prepend: slots.prepend ? slotProps => slots.prepend?.({
          ...slotProps,
          item
        }) : undefined,
        append: slots.append ? slotProps => slots.append?.({
          ...slotProps,
          item
        }) : undefined,
        title: slots.title ? slotProps => slots.title?.({
          ...slotProps,
          item
        }) : undefined
      };
      const listGroupProps = VListGroup.filterProps(itemProps);
      return children ? _createVNode$9(VListGroup, _mergeProps$6(listGroupProps, {
        "value": props.returnObject ? item : itemProps?.value,
        "rawId": itemProps?.value
      }), {
        activator: _ref3 => {
          let {
            props: activatorProps
          } = _ref3;
          const listItemProps = mergeProps$4(itemProps, activatorProps, {
            value: props.returnObject ? item : itemProps.value
          });
          return slots.header ? slots.header({
            props: listItemProps
          }) : _createVNode$9(VListItem, listItemProps, slotsWithItem);
        },
        default: () => _createVNode$9(VListChildren, {
          "items": children,
          "returnObject": props.returnObject
        }, slots)
      }) : slots.item ? slots.item({
        props: itemProps
      }) : _createVNode$9(VListItem, _mergeProps$6(itemProps, {
        "value": props.returnObject ? item : itemProps.value
      }), slotsWithItem);
    });
  }
});

// Utilities
const {computed: computed$b,shallowRef: shallowRef$9,watchEffect: watchEffect$4} = await importShared('vue');
// Composables
const makeItemsProps = propsFactory({
  items: {
    type: Array,
    default: () => []
  },
  itemTitle: {
    type: [String, Array, Function],
    default: 'title'
  },
  itemValue: {
    type: [String, Array, Function],
    default: 'value'
  },
  itemChildren: {
    type: [Boolean, String, Array, Function],
    default: 'children'
  },
  itemProps: {
    type: [Boolean, String, Array, Function],
    default: 'props'
  },
  itemType: {
    type: [Boolean, String, Array, Function],
    default: 'type'
  },
  returnObject: Boolean,
  valueComparator: Function
}, 'list-items');
const itemTypes$1 = new Set(['item', 'divider', 'subheader']);
function transformItem$1(props, item) {
  const title = getPropertyFromItem(item, props.itemTitle, item);
  const value = getPropertyFromItem(item, props.itemValue, title);
  const children = getPropertyFromItem(item, props.itemChildren);
  const itemProps = props.itemProps === true ? typeof item === 'object' && item != null && !Array.isArray(item) ? 'children' in item ? omit(item, ['children']) : item : undefined : getPropertyFromItem(item, props.itemProps);
  let type = getPropertyFromItem(item, props.itemType, 'item');
  if (!itemTypes$1.has(type)) {
    type = 'item';
  }
  const _props = {
    title,
    value,
    ...itemProps
  };
  return {
    type,
    title: String(_props.title ?? ''),
    value: _props.value,
    props: _props,
    children: type === 'item' && Array.isArray(children) ? transformItems$1(props, children) : undefined,
    raw: item
  };
}
transformItem$1.neededProps = ['itemTitle', 'itemValue', 'itemChildren', 'itemProps', 'itemType'];
function transformItems$1(props, items) {
  // avoid reactive access in the loop
  const _props = pick(props, transformItem$1.neededProps);
  const array = [];
  for (const item of items) {
    array.push(transformItem$1(_props, item));
  }
  return array;
}
function useItems(props) {
  const items = computed$b(() => transformItems$1(props, props.items));
  const hasNullItem = computed$b(() => items.value.some(item => item.value === null));
  const itemsMap = shallowRef$9(new Map());
  const keylessItems = shallowRef$9([]);
  watchEffect$4(() => {
    const _items = items.value;
    const map = new Map();
    const keyless = [];
    for (let i = 0; i < _items.length; i++) {
      const item = _items[i];
      if (isPrimitive(item.value) || item.value === null) {
        let values = map.get(item.value);
        if (!values) {
          values = [];
          map.set(item.value, values);
        }
        values.push(item);
      } else {
        keyless.push(item);
      }
    }
    itemsMap.value = map;
    keylessItems.value = keyless;
  });
  function transformIn(value) {
    // Cache unrefed values outside the loop,
    // proxy getters can be slow when you call them a billion times
    const _items = itemsMap.value;
    const _allItems = items.value;
    const _keylessItems = keylessItems.value;
    const _hasNullItem = hasNullItem.value;
    const _returnObject = props.returnObject;
    const hasValueComparator = !!props.valueComparator;
    const valueComparator = props.valueComparator || deepEqual;
    const _props = pick(props, transformItem$1.neededProps);
    const returnValue = [];
    main: for (const v of value) {
      // When the model value is null, return an InternalItem
      // based on null only if null is one of the items
      if (!_hasNullItem && v === null) continue;

      // String model value means value is a custom input value from combobox
      // Don't look up existing items if the model value is a string
      if (_returnObject && typeof v === 'string') {
        returnValue.push(transformItem$1(_props, v));
        continue;
      }

      // Fast path, items with primitive values and no
      // custom valueComparator can use a constant-time
      // map lookup instead of searching the items array
      const fastItems = _items.get(v);

      // Slow path, always use valueComparator.
      // This is O(n^2) so we really don't want to
      // do it for more than a couple hundred items.
      if (hasValueComparator || !fastItems) {
        for (const item of hasValueComparator ? _allItems : _keylessItems) {
          if (valueComparator(v, item.value)) {
            returnValue.push(item);
            continue main;
          }
        }
        // Not an existing item, construct it from the model (#4000)
        returnValue.push(transformItem$1(_props, v));
        continue;
      }
      returnValue.push(...fastItems);
    }
    return returnValue;
  }
  function transformOut(value) {
    return props.returnObject ? value.map(_ref => {
      let {
        raw
      } = _ref;
      return raw;
    }) : value.map(_ref2 => {
      let {
        value
      } = _ref2;
      return value;
    });
  }
  return {
    items,
    transformIn,
    transformOut
  };
}

const {createVNode:_createVNode$8,normalizeClass:_normalizeClass$5,normalizeStyle:_normalizeStyle$4} = await importShared('vue');
const {computed: computed$a,ref: ref$8,shallowRef: shallowRef$8,toRef: toRef$8} = await importShared('vue');
const itemTypes = new Set(['item', 'divider', 'subheader']);
function transformItem(props, item) {
  const title = isPrimitive(item) ? item : getPropertyFromItem(item, props.itemTitle);
  const value = isPrimitive(item) ? item : getPropertyFromItem(item, props.itemValue, undefined);
  const children = getPropertyFromItem(item, props.itemChildren);
  const itemProps = props.itemProps === true ? omit(item, ['children']) : getPropertyFromItem(item, props.itemProps);
  let type = getPropertyFromItem(item, props.itemType, 'item');
  if (!itemTypes.has(type)) {
    type = 'item';
  }
  const _props = {
    title,
    value,
    ...itemProps
  };
  return {
    type,
    title: _props.title,
    value: _props.value,
    props: _props,
    children: type === 'item' && children ? transformItems(props, children) : undefined,
    raw: item
  };
}
function transformItems(props, items) {
  const array = [];
  for (const item of items) {
    array.push(transformItem(props, item));
  }
  return array;
}
function useListItems(props) {
  const items = computed$a(() => transformItems(props, props.items));
  return {
    items
  };
}
const makeVListProps = propsFactory({
  baseColor: String,
  /* @deprecated */
  activeColor: String,
  activeClass: String,
  bgColor: String,
  disabled: Boolean,
  filterable: Boolean,
  expandIcon: IconValue,
  collapseIcon: IconValue,
  lines: {
    type: [Boolean, String],
    default: 'one'
  },
  slim: Boolean,
  nav: Boolean,
  'onClick:open': EventProp(),
  'onClick:select': EventProp(),
  'onUpdate:opened': EventProp(),
  ...makeNestedProps({
    selectStrategy: 'single-leaf',
    openStrategy: 'list'
  }),
  ...makeBorderProps(),
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeDimensionProps(),
  ...makeElevationProps(),
  ...makeItemsProps(),
  ...makeRoundedProps(),
  ...makeTagProps(),
  ...makeThemeProps(),
  ...makeVariantProps({
    variant: 'text'
  })
}, 'VList');
const VList = genericComponent()({
  name: 'VList',
  props: makeVListProps(),
  emits: {
    'update:selected': value => true,
    'update:activated': value => true,
    'update:opened': value => true,
    'click:open': value => true,
    'click:activate': value => true,
    'click:select': value => true
  },
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      items
    } = useListItems(props);
    const {
      themeClasses
    } = provideTheme(props);
    const {
      backgroundColorClasses,
      backgroundColorStyles
    } = useBackgroundColor(() => props.bgColor);
    const {
      borderClasses
    } = useBorder(props);
    const {
      densityClasses
    } = useDensity(props);
    const {
      dimensionStyles
    } = useDimension(props);
    const {
      elevationClasses
    } = useElevation(props);
    const {
      roundedClasses
    } = useRounded(props);
    const {
      children,
      open,
      parents,
      select,
      getPath
    } = useNested(props);
    const lineClasses = toRef$8(() => props.lines ? `v-list--${props.lines}-line` : undefined);
    const activeColor = toRef$8(() => props.activeColor);
    const baseColor = toRef$8(() => props.baseColor);
    const color = toRef$8(() => props.color);
    const isSelectable = toRef$8(() => props.selectable || props.activatable);
    createList({
      filterable: props.filterable
    });
    provideDefaults({
      VListGroup: {
        activeColor,
        baseColor,
        color,
        expandIcon: toRef$8(() => props.expandIcon),
        collapseIcon: toRef$8(() => props.collapseIcon)
      },
      VListItem: {
        activeClass: toRef$8(() => props.activeClass),
        activeColor,
        baseColor,
        color,
        density: toRef$8(() => props.density),
        disabled: toRef$8(() => props.disabled),
        lines: toRef$8(() => props.lines),
        nav: toRef$8(() => props.nav),
        slim: toRef$8(() => props.slim),
        variant: toRef$8(() => props.variant)
      }
    });
    const isFocused = shallowRef$8(false);
    const contentRef = ref$8();
    function onFocusin(e) {
      isFocused.value = true;
    }
    function onFocusout(e) {
      isFocused.value = false;
    }
    function onFocus(e) {
      if (!isFocused.value && !(e.relatedTarget && contentRef.value?.contains(e.relatedTarget))) focus();
    }
    function onKeydown(e) {
      const target = e.target;
      if (!contentRef.value || target.tagName === 'INPUT' && ['Home', 'End'].includes(e.key) || target.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowDown') {
        focus('next');
      } else if (e.key === 'ArrowUp') {
        focus('prev');
      } else if (e.key === 'Home') {
        focus('first');
      } else if (e.key === 'End') {
        focus('last');
      } else {
        return;
      }
      e.preventDefault();
    }
    function onMousedown(e) {
      isFocused.value = true;
    }
    function focus(location) {
      if (contentRef.value) {
        return focusChild(contentRef.value, location);
      }
    }
    useRender(() => {
      return _createVNode$8(props.tag, {
        "ref": contentRef,
        "class": _normalizeClass$5(['v-list', {
          'v-list--disabled': props.disabled,
          'v-list--nav': props.nav,
          'v-list--slim': props.slim
        }, themeClasses.value, backgroundColorClasses.value, borderClasses.value, densityClasses.value, elevationClasses.value, lineClasses.value, roundedClasses.value, props.class]),
        "style": _normalizeStyle$4([backgroundColorStyles.value, dimensionStyles.value, props.style]),
        "tabindex": props.disabled ? -1 : 0,
        "role": isSelectable.value ? 'listbox' : 'list',
        "aria-activedescendant": undefined,
        "onFocusin": onFocusin,
        "onFocusout": onFocusout,
        "onFocus": onFocus,
        "onKeydown": onKeydown,
        "onMousedown": onMousedown
      }, {
        default: () => [_createVNode$8(VListChildren, {
          "items": items.value,
          "returnObject": props.returnObject
        }, slots)]
      });
    });
    return {
      open,
      select,
      focus,
      children,
      parents,
      getPath
    };
  }
});

// Types

/** Convert a point in local space to viewport space */
function elementToViewport(point, offset) {
  return {
    x: point.x + offset.x,
    y: point.y + offset.y
  };
}

/** Get the difference between two points */
function getOffset(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}

/** Convert an anchor object to a point in local space */
function anchorToPoint(anchor, box) {
  if (anchor.side === 'top' || anchor.side === 'bottom') {
    const {
      side,
      align
    } = anchor;
    const x = align === 'left' ? 0 : align === 'center' ? box.width / 2 : align === 'right' ? box.width : align;
    const y = side === 'top' ? 0 : side === 'bottom' ? box.height : side;
    return elementToViewport({
      x,
      y
    }, box);
  } else if (anchor.side === 'left' || anchor.side === 'right') {
    const {
      side,
      align
    } = anchor;
    const x = side === 'left' ? 0 : side === 'right' ? box.width : side;
    const y = align === 'top' ? 0 : align === 'center' ? box.height / 2 : align === 'bottom' ? box.height : align;
    return elementToViewport({
      x,
      y
    }, box);
  }
  return elementToViewport({
    x: box.width / 2,
    y: box.height / 2
  }, box);
}

const {computed: computed$9,nextTick: nextTick$5,onScopeDispose: onScopeDispose$5,ref: ref$7,watch: watch$9} = await importShared('vue');
const locationStrategies = {
  static: staticLocationStrategy,
  // specific viewport position, usually centered
  connected: connectedLocationStrategy // connected to a certain element
};
const makeLocationStrategyProps = propsFactory({
  locationStrategy: {
    type: [String, Function],
    default: 'static',
    validator: val => typeof val === 'function' || val in locationStrategies
  },
  location: {
    type: String,
    default: 'bottom'
  },
  origin: {
    type: String,
    default: 'auto'
  },
  offset: [Number, String, Array],
  stickToTarget: Boolean
}, 'VOverlay-location-strategies');
function useLocationStrategies(props, data) {
  const contentStyles = ref$7({});
  const updateLocation = ref$7();
  if (IN_BROWSER) {
    useToggleScope(() => !!(data.isActive.value && props.locationStrategy), reset => {
      watch$9(() => props.locationStrategy, reset);
      onScopeDispose$5(() => {
        window.removeEventListener('resize', onResize);
        visualViewport?.removeEventListener('resize', onVisualResize);
        visualViewport?.removeEventListener('scroll', onVisualScroll);
        updateLocation.value = undefined;
      });
      window.addEventListener('resize', onResize, {
        passive: true
      });
      visualViewport?.addEventListener('resize', onVisualResize, {
        passive: true
      });
      visualViewport?.addEventListener('scroll', onVisualScroll, {
        passive: true
      });
      if (typeof props.locationStrategy === 'function') {
        updateLocation.value = props.locationStrategy(data, props, contentStyles)?.updateLocation;
      } else {
        updateLocation.value = locationStrategies[props.locationStrategy](data, props, contentStyles)?.updateLocation;
      }
    });
  }
  function onResize(e) {
    updateLocation.value?.(e);
  }
  function onVisualResize(e) {
    updateLocation.value?.(e);
  }
  function onVisualScroll(e) {
    updateLocation.value?.(e);
  }
  return {
    contentStyles,
    updateLocation
  };
}
function staticLocationStrategy() {
  // TODO
}

/** Get size of element ignoring max-width/max-height */
function getIntrinsicSize(el, isRtl) {
  // const scrollables = new Map<Element, [number, number]>()
  // el.querySelectorAll('*').forEach(el => {
  //   const x = el.scrollLeft
  //   const y = el.scrollTop
  //   if (x || y) {
  //     scrollables.set(el, [x, y])
  //   }
  // })

  // const initialMaxWidth = el.style.maxWidth
  // const initialMaxHeight = el.style.maxHeight
  // el.style.removeProperty('max-width')
  // el.style.removeProperty('max-height')

  /* eslint-disable-next-line sonarjs/prefer-immediate-return */
  const contentBox = nullifyTransforms(el);
  if (isRtl) {
    contentBox.x += parseFloat(el.style.right || 0);
  } else {
    contentBox.x -= parseFloat(el.style.left || 0);
  }
  contentBox.y -= parseFloat(el.style.top || 0);

  // el.style.maxWidth = initialMaxWidth
  // el.style.maxHeight = initialMaxHeight
  // scrollables.forEach((position, el) => {
  //   el.scrollTo(...position)
  // })

  return contentBox;
}
function connectedLocationStrategy(data, props, contentStyles) {
  const activatorFixed = Array.isArray(data.target.value) || isFixedPosition(data.target.value);
  if (activatorFixed) {
    Object.assign(contentStyles.value, {
      position: 'fixed',
      top: 0,
      [data.isRtl.value ? 'right' : 'left']: 0
    });
  }
  const {
    preferredAnchor,
    preferredOrigin
  } = destructComputed(() => {
    const parsedAnchor = parseAnchor(props.location, data.isRtl.value);
    const parsedOrigin = props.origin === 'overlap' ? parsedAnchor : props.origin === 'auto' ? flipSide(parsedAnchor) : parseAnchor(props.origin, data.isRtl.value);

    // Some combinations of props may produce an invalid origin
    if (parsedAnchor.side === parsedOrigin.side && parsedAnchor.align === flipAlign(parsedOrigin).align) {
      return {
        preferredAnchor: flipCorner(parsedAnchor),
        preferredOrigin: flipCorner(parsedOrigin)
      };
    } else {
      return {
        preferredAnchor: parsedAnchor,
        preferredOrigin: parsedOrigin
      };
    }
  });
  const [minWidth, minHeight, maxWidth, maxHeight] = ['minWidth', 'minHeight', 'maxWidth', 'maxHeight'].map(key => {
    return computed$9(() => {
      const val = parseFloat(props[key]);
      return isNaN(val) ? Infinity : val;
    });
  });
  const offset = computed$9(() => {
    if (Array.isArray(props.offset)) {
      return props.offset;
    }
    if (typeof props.offset === 'string') {
      const offset = props.offset.split(' ').map(parseFloat);
      if (offset.length < 2) offset.push(0);
      return offset;
    }
    return typeof props.offset === 'number' ? [props.offset, 0] : [0, 0];
  });
  let observe = false;
  let lastFrame = -1;
  const flipped = new CircularBuffer(4);
  const observer = new ResizeObserver(() => {
    if (!observe) return;

    // Detect consecutive frames
    requestAnimationFrame(newTime => {
      if (newTime !== lastFrame) flipped.clear();
      requestAnimationFrame(newNewTime => {
        lastFrame = newNewTime;
      });
    });
    if (flipped.isFull) {
      const values = flipped.values();
      if (deepEqual(values.at(-1), values.at(-3)) && !deepEqual(values.at(-1), values.at(-2))) {
        // Flipping is causing a container resize loop
        return;
      }
    }
    const result = updateLocation();
    if (result) flipped.push(result.flipped);
  });
  let targetBox = new Box({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  watch$9(data.target, (newTarget, oldTarget) => {
    if (oldTarget && !Array.isArray(oldTarget)) observer.unobserve(oldTarget);
    if (!Array.isArray(newTarget)) {
      if (newTarget) observer.observe(newTarget);
    } else if (!deepEqual(newTarget, oldTarget)) {
      updateLocation();
    }
  }, {
    immediate: true
  });
  watch$9(data.contentEl, (newContentEl, oldContentEl) => {
    if (oldContentEl) observer.unobserve(oldContentEl);
    if (newContentEl) observer.observe(newContentEl);
  }, {
    immediate: true
  });
  onScopeDispose$5(() => {
    observer.disconnect();
  });

  // eslint-disable-next-line max-statements
  function updateLocation() {
    observe = false;
    requestAnimationFrame(() => observe = true);
    if (!data.target.value || !data.contentEl.value) return;
    if (Array.isArray(data.target.value) || data.target.value.offsetParent || data.target.value.getClientRects().length) {
      targetBox = getTargetBox(data.target.value);
    } // Otherwise target element is hidden, use last known value

    const contentBox = getIntrinsicSize(data.contentEl.value, data.isRtl.value);
    const scrollParents = getScrollParents(data.contentEl.value);
    const viewportMargin = props.stickToTarget ? 0 : 12; // TOOD: prop.viewportMargin

    if (!scrollParents.length) {
      scrollParents.push(document.documentElement);
      if (!(data.contentEl.value.style.top && data.contentEl.value.style.left)) {
        contentBox.x -= parseFloat(document.documentElement.style.getPropertyValue('--v-body-scroll-x') || 0);
        contentBox.y -= parseFloat(document.documentElement.style.getPropertyValue('--v-body-scroll-y') || 0);
      }
    }
    const viewport = scrollParents.reduce((box, el) => {
      const scrollBox = getElementBox(el);
      if (box) {
        return new Box({
          x: Math.max(box.left, scrollBox.left),
          y: Math.max(box.top, scrollBox.top),
          width: Math.min(box.right, scrollBox.right) - Math.max(box.left, scrollBox.left),
          height: Math.min(box.bottom, scrollBox.bottom) - Math.max(box.top, scrollBox.top)
        });
      }
      return scrollBox;
    }, undefined);
    if (props.stickToTarget) {
      viewport.x += Math.min(0, targetBox.x);
      viewport.y += Math.min(0, targetBox.y);
      viewport.width = Math.max(viewport.width, targetBox.x + targetBox.width);
      viewport.height = Math.max(viewport.height, targetBox.y + targetBox.height);
    } else {
      viewport.x += viewportMargin;
      viewport.y += viewportMargin;
      viewport.width -= viewportMargin * 2;
      viewport.height -= viewportMargin * 2;
    }
    let placement = {
      anchor: preferredAnchor.value,
      origin: preferredOrigin.value
    };
    function checkOverflow(_placement) {
      const box = new Box(contentBox);
      const targetPoint = anchorToPoint(_placement.anchor, targetBox);
      const contentPoint = anchorToPoint(_placement.origin, box);
      let {
        x,
        y
      } = getOffset(targetPoint, contentPoint);
      switch (_placement.anchor.side) {
        case 'top':
          y -= offset.value[0];
          break;
        case 'bottom':
          y += offset.value[0];
          break;
        case 'left':
          x -= offset.value[0];
          break;
        case 'right':
          x += offset.value[0];
          break;
      }
      switch (_placement.anchor.align) {
        case 'top':
          y -= offset.value[1];
          break;
        case 'bottom':
          y += offset.value[1];
          break;
        case 'left':
          x -= offset.value[1];
          break;
        case 'right':
          x += offset.value[1];
          break;
      }
      box.x += x;
      box.y += y;
      box.width = Math.min(box.width, maxWidth.value);
      box.height = Math.min(box.height, maxHeight.value);
      const overflows = getOverflow(box, viewport);
      return {
        overflows,
        x,
        y
      };
    }
    let x = 0;
    let y = 0;
    const available = {
      x: 0,
      y: 0
    };
    const flipped = {
      x: false,
      y: false
    };
    let resets = -1;
    while (true) {
      if (resets++ > 10) {
        consoleError('Infinite loop detected in connectedLocationStrategy');
        break;
      }
      const {
        x: _x,
        y: _y,
        overflows
      } = checkOverflow(placement);
      x += _x;
      y += _y;
      contentBox.x += _x;
      contentBox.y += _y;

      // flip
      {
        const axis = getAxis(placement.anchor);
        const hasOverflowX = overflows.x.before || overflows.x.after;
        const hasOverflowY = overflows.y.before || overflows.y.after;
        let reset = false;
        ['x', 'y'].forEach(key => {
          if (key === 'x' && hasOverflowX && !flipped.x || key === 'y' && hasOverflowY && !flipped.y) {
            const newPlacement = {
              anchor: {
                ...placement.anchor
              },
              origin: {
                ...placement.origin
              }
            };
            const flip = key === 'x' ? axis === 'y' ? flipAlign : flipSide : axis === 'y' ? flipSide : flipAlign;
            newPlacement.anchor = flip(newPlacement.anchor);
            newPlacement.origin = flip(newPlacement.origin);
            const {
              overflows: newOverflows
            } = checkOverflow(newPlacement);
            if (newOverflows[key].before <= overflows[key].before && newOverflows[key].after <= overflows[key].after || newOverflows[key].before + newOverflows[key].after < (overflows[key].before + overflows[key].after) / 2) {
              placement = newPlacement;
              reset = flipped[key] = true;
            }
          }
        });
        if (reset) continue;
      }

      // shift
      if (overflows.x.before) {
        x += overflows.x.before;
        contentBox.x += overflows.x.before;
      }
      if (overflows.x.after) {
        x -= overflows.x.after;
        contentBox.x -= overflows.x.after;
      }
      if (overflows.y.before) {
        y += overflows.y.before;
        contentBox.y += overflows.y.before;
      }
      if (overflows.y.after) {
        y -= overflows.y.after;
        contentBox.y -= overflows.y.after;
      }

      // size
      {
        const overflows = getOverflow(contentBox, viewport);
        available.x = viewport.width - overflows.x.before - overflows.x.after;
        available.y = viewport.height - overflows.y.before - overflows.y.after;
        x += overflows.x.before;
        contentBox.x += overflows.x.before;
        y += overflows.y.before;
        contentBox.y += overflows.y.before;
      }
      break;
    }
    const axis = getAxis(placement.anchor);
    Object.assign(contentStyles.value, {
      '--v-overlay-anchor-origin': `${placement.anchor.side} ${placement.anchor.align}`,
      transformOrigin: `${placement.origin.side} ${placement.origin.align}`,
      // transform: `translate(${pixelRound(x)}px, ${pixelRound(y)}px)`,
      top: convertToUnit(pixelRound(y)),
      left: data.isRtl.value ? undefined : convertToUnit(pixelRound(x)),
      right: data.isRtl.value ? convertToUnit(pixelRound(-x)) : undefined,
      minWidth: convertToUnit(axis === 'y' ? Math.min(minWidth.value, targetBox.width) : minWidth.value),
      maxWidth: convertToUnit(pixelCeil(clamp(available.x, minWidth.value === Infinity ? 0 : minWidth.value, maxWidth.value))),
      maxHeight: convertToUnit(pixelCeil(clamp(available.y, minHeight.value === Infinity ? 0 : minHeight.value, maxHeight.value)))
    });
    return {
      available,
      contentBox,
      flipped
    };
  }
  watch$9(() => [preferredAnchor.value, preferredOrigin.value, props.offset, props.minWidth, props.minHeight, props.maxWidth, props.maxHeight], () => updateLocation());
  nextTick$5(() => {
    const result = updateLocation();

    // TODO: overflowing content should only require a single updateLocation call
    // Icky hack to make sure the content is positioned consistently
    if (!result) return;
    const {
      available,
      contentBox
    } = result;
    if (contentBox.height > available.y) {
      requestAnimationFrame(() => {
        updateLocation();
        requestAnimationFrame(() => {
          updateLocation();
        });
      });
    }
  });
  return {
    updateLocation
  };
}
function pixelRound(val) {
  return Math.round(val * devicePixelRatio) / devicePixelRatio;
}
function pixelCeil(val) {
  return Math.ceil(val * devicePixelRatio) / devicePixelRatio;
}

let clean = true;
const frames = [];

/**
 * Schedule a task to run in an animation frame on its own
 * This is useful for heavy tasks that may cause jank if all ran together
 */
function requestNewFrame(cb) {
  if (!clean || frames.length) {
    frames.push(cb);
    run();
  } else {
    clean = false;
    cb();
    run();
  }
}
let raf = -1;
function run() {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    const frame = frames.shift();
    if (frame) frame();
    if (frames.length) run();else clean = true;
  });
}

// Utilities
const {effectScope: effectScope$1,onScopeDispose: onScopeDispose$4,watchEffect: watchEffect$3} = await importShared('vue');
const scrollStrategies = {
  none: null,
  close: closeScrollStrategy,
  block: blockScrollStrategy,
  reposition: repositionScrollStrategy
};
const makeScrollStrategyProps = propsFactory({
  scrollStrategy: {
    type: [String, Function],
    default: 'block',
    validator: val => typeof val === 'function' || val in scrollStrategies
  }
}, 'VOverlay-scroll-strategies');
function useScrollStrategies(props, data) {
  if (!IN_BROWSER) return;
  let scope;
  watchEffect$3(async () => {
    scope?.stop();
    if (!(data.isActive.value && props.scrollStrategy)) return;
    scope = effectScope$1();
    await new Promise(resolve => setTimeout(resolve));
    scope.active && scope.run(() => {
      if (typeof props.scrollStrategy === 'function') {
        props.scrollStrategy(data, props, scope);
      } else {
        scrollStrategies[props.scrollStrategy]?.(data, props, scope);
      }
    });
  });
  onScopeDispose$4(() => {
    scope?.stop();
  });
}
function closeScrollStrategy(data) {
  function onScroll(e) {
    data.isActive.value = false;
  }
  bindScroll(getTargetEl(data.target.value, data.contentEl.value), onScroll);
}
function blockScrollStrategy(data, props) {
  const offsetParent = data.root.value?.offsetParent;
  const target = getTargetEl(data.target.value, data.contentEl.value);
  const scrollElements = [...new Set([...getScrollParents(target, props.contained ? offsetParent : undefined), ...getScrollParents(data.contentEl.value, props.contained ? offsetParent : undefined)])].filter(el => !el.classList.contains('v-overlay-scroll-blocked'));
  const scrollbarWidth = window.innerWidth - document.documentElement.offsetWidth;
  const scrollableParent = (el => hasScrollbar(el) && el)(offsetParent || document.documentElement);
  if (scrollableParent) {
    data.root.value.classList.add('v-overlay--scroll-blocked');
  }
  scrollElements.forEach((el, i) => {
    el.style.setProperty('--v-body-scroll-x', convertToUnit(-el.scrollLeft));
    el.style.setProperty('--v-body-scroll-y', convertToUnit(-el.scrollTop));
    if (el !== document.documentElement) {
      el.style.setProperty('--v-scrollbar-offset', convertToUnit(scrollbarWidth));
    }
    el.classList.add('v-overlay-scroll-blocked');
  });
  onScopeDispose$4(() => {
    scrollElements.forEach((el, i) => {
      const x = parseFloat(el.style.getPropertyValue('--v-body-scroll-x'));
      const y = parseFloat(el.style.getPropertyValue('--v-body-scroll-y'));
      const scrollBehavior = el.style.scrollBehavior;
      el.style.scrollBehavior = 'auto';
      el.style.removeProperty('--v-body-scroll-x');
      el.style.removeProperty('--v-body-scroll-y');
      el.style.removeProperty('--v-scrollbar-offset');
      el.classList.remove('v-overlay-scroll-blocked');
      el.scrollLeft = -x;
      el.scrollTop = -y;
      el.style.scrollBehavior = scrollBehavior;
    });
    if (scrollableParent) {
      data.root.value.classList.remove('v-overlay--scroll-blocked');
    }
  });
}
function repositionScrollStrategy(data, props, scope) {
  let slow = false;
  let raf = -1;
  let ric = -1;
  function update(e) {
    requestNewFrame(() => {
      const start = performance.now();
      data.updateLocation.value?.(e);
      const time = performance.now() - start;
      slow = time / (1000 / 60) > 2;
    });
  }
  ric = (typeof requestIdleCallback === 'undefined' ? cb => cb() : requestIdleCallback)(() => {
    scope.run(() => {
      bindScroll(getTargetEl(data.target.value, data.contentEl.value), e => {
        if (slow) {
          // If the position calculation is slow,
          // defer updates until scrolling is finished.
          // Browsers usually fire one scroll event per frame so
          // we just wait until we've got two frames without an event
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            raf = requestAnimationFrame(() => {
              update(e);
            });
          });
        } else {
          update(e);
        }
      });
    });
  });
  onScopeDispose$4(() => {
    typeof cancelIdleCallback !== 'undefined' && cancelIdleCallback(ric);
    cancelAnimationFrame(raf);
  });
}
function getTargetEl(target, contentEl) {
  return Array.isArray(target) ? document.elementsFromPoint(...target).find(el => !contentEl?.contains(el)) : target ?? contentEl;
}
function bindScroll(el, onScroll) {
  const scrollElements = [document, ...getScrollParents(el)];
  scrollElements.forEach(el => {
    el.addEventListener('scroll', onScroll, {
      passive: true
    });
  });
  onScopeDispose$4(() => {
    scrollElements.forEach(el => {
      el.removeEventListener('scroll', onScroll);
    });
  });
}

// Types

const VMenuSymbol = Symbol.for('vuetify:v-menu');

// Utilities
// Composables
const makeDelayProps = propsFactory({
  closeDelay: [Number, String],
  openDelay: [Number, String]
}, 'delay');
function useDelay(props, cb) {
  let clearDelay = () => {};
  function runDelay(isOpening, options) {
    clearDelay?.();
    const delay = isOpening ? props.openDelay : props.closeDelay;
    const normalizedDelay = Math.max(options?.minDelay ?? 0, Number(delay ?? 0));
    return new Promise(resolve => {
      clearDelay = defer(normalizedDelay, () => {
        cb?.(isOpening);
        resolve(isOpening);
      });
    });
  }
  function runOpenDelay() {
    return runDelay(true);
  }
  function runCloseDelay(options) {
    return runDelay(false, options);
  }
  return {
    clearDelay,
    runOpenDelay,
    runCloseDelay
  };
}

const {computed: computed$8,effectScope,inject: inject$2,mergeProps: mergeProps$3,nextTick: nextTick$4,onScopeDispose: onScopeDispose$3,ref: ref$6,watch: watch$8,watchEffect: watchEffect$2} = await importShared('vue');
const makeActivatorProps = propsFactory({
  target: [String, Object],
  activator: [String, Object],
  activatorProps: {
    type: Object,
    default: () => ({})
  },
  openOnClick: {
    type: Boolean,
    default: undefined
  },
  openOnHover: Boolean,
  openOnFocus: {
    type: Boolean,
    default: undefined
  },
  closeOnContentClick: Boolean,
  ...makeDelayProps()
}, 'VOverlay-activator');
function useActivator(props, _ref) {
  let {
    isActive,
    isTop,
    contentEl
  } = _ref;
  const vm = getCurrentInstance('useActivator');
  const activatorEl = ref$6();
  let isHovered = false;
  let isFocused = false;
  let firstEnter = true;
  const openOnFocus = computed$8(() => props.openOnFocus || props.openOnFocus == null && props.openOnHover);
  const openOnClick = computed$8(() => props.openOnClick || props.openOnClick == null && !props.openOnHover && !openOnFocus.value);
  const {
    runOpenDelay,
    runCloseDelay
  } = useDelay(props, value => {
    if (value === (props.openOnHover && isHovered || openOnFocus.value && isFocused) && !(props.openOnHover && isActive.value && !isTop.value)) {
      if (isActive.value !== value) {
        firstEnter = true;
      }
      isActive.value = value;
    }
  });
  const cursorTarget = ref$6();
  const availableEvents = {
    onClick: e => {
      e.stopPropagation();
      activatorEl.value = e.currentTarget || e.target;
      if (!isActive.value) {
        cursorTarget.value = [e.clientX, e.clientY];
      }
      isActive.value = !isActive.value;
    },
    onMouseenter: e => {
      isHovered = true;
      activatorEl.value = e.currentTarget || e.target;
      runOpenDelay();
    },
    onMouseleave: e => {
      isHovered = false;
      runCloseDelay();
    },
    onFocus: e => {
      if (matchesSelector(e.target, ':focus-visible') === false) return;
      isFocused = true;
      e.stopPropagation();
      activatorEl.value = e.currentTarget || e.target;
      runOpenDelay();
    },
    onBlur: e => {
      isFocused = false;
      e.stopPropagation();
      runCloseDelay({
        minDelay: 1
      });
    }
  };
  const activatorEvents = computed$8(() => {
    const events = {};
    if (openOnClick.value) {
      events.onClick = availableEvents.onClick;
    }
    if (props.openOnHover) {
      events.onMouseenter = availableEvents.onMouseenter;
      events.onMouseleave = availableEvents.onMouseleave;
    }
    if (openOnFocus.value) {
      events.onFocus = availableEvents.onFocus;
      events.onBlur = availableEvents.onBlur;
    }
    return events;
  });
  const contentEvents = computed$8(() => {
    const events = {};
    if (props.openOnHover) {
      events.onMouseenter = () => {
        isHovered = true;
        runOpenDelay();
      };
      events.onMouseleave = () => {
        isHovered = false;
        runCloseDelay();
      };
    }
    if (openOnFocus.value) {
      events.onFocusin = e => {
        if (!e.target.matches(':focus-visible')) return;
        isFocused = true;
        runOpenDelay();
      };
      events.onFocusout = () => {
        isFocused = false;
        runCloseDelay({
          minDelay: 1
        });
      };
    }
    if (props.closeOnContentClick) {
      const menu = inject$2(VMenuSymbol, null);
      events.onClick = () => {
        isActive.value = false;
        menu?.closeParents();
      };
    }
    return events;
  });
  const scrimEvents = computed$8(() => {
    const events = {};
    if (props.openOnHover) {
      events.onMouseenter = () => {
        if (firstEnter) {
          isHovered = true;
          firstEnter = false;
          runOpenDelay();
        }
      };
      events.onMouseleave = () => {
        isHovered = false;
        runCloseDelay();
      };
    }
    return events;
  });
  watch$8(isTop, val => {
    if (val && (props.openOnHover && !isHovered && (!openOnFocus.value || !isFocused) || openOnFocus.value && !isFocused && (!props.openOnHover || !isHovered)) && !contentEl.value?.contains(document.activeElement)) {
      isActive.value = false;
    }
  });
  watch$8(isActive, val => {
    if (!val) {
      setTimeout(() => {
        cursorTarget.value = undefined;
      });
    }
  }, {
    flush: 'post'
  });
  const activatorRef = templateRef();
  watchEffect$2(() => {
    if (!activatorRef.value) return;
    nextTick$4(() => {
      activatorEl.value = activatorRef.el;
    });
  });
  const targetRef = templateRef();
  const target = computed$8(() => {
    if (props.target === 'cursor' && cursorTarget.value) return cursorTarget.value;
    if (targetRef.value) return targetRef.el;
    return getTarget(props.target, vm) || activatorEl.value;
  });
  const targetEl = computed$8(() => {
    return Array.isArray(target.value) ? undefined : target.value;
  });
  let scope;
  watch$8(() => !!props.activator, val => {
    if (val && IN_BROWSER) {
      scope = effectScope();
      scope.run(() => {
        _useActivator(props, vm, {
          activatorEl,
          activatorEvents
        });
      });
    } else if (scope) {
      scope.stop();
    }
  }, {
    flush: 'post',
    immediate: true
  });
  onScopeDispose$3(() => {
    scope?.stop();
  });
  return {
    activatorEl,
    activatorRef,
    target,
    targetEl,
    targetRef,
    activatorEvents,
    contentEvents,
    scrimEvents
  };
}
function _useActivator(props, vm, _ref2) {
  let {
    activatorEl,
    activatorEvents
  } = _ref2;
  watch$8(() => props.activator, (val, oldVal) => {
    if (oldVal && val !== oldVal) {
      const activator = getActivator(oldVal);
      activator && unbindActivatorProps(activator);
    }
    if (val) {
      nextTick$4(() => bindActivatorProps());
    }
  }, {
    immediate: true
  });
  watch$8(() => props.activatorProps, () => {
    bindActivatorProps();
  });
  onScopeDispose$3(() => {
    unbindActivatorProps();
  });
  function bindActivatorProps() {
    let el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getActivator();
    let _props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : props.activatorProps;
    if (!el) return;
    bindProps(el, mergeProps$3(activatorEvents.value, _props));
  }
  function unbindActivatorProps() {
    let el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getActivator();
    let _props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : props.activatorProps;
    if (!el) return;
    unbindProps(el, mergeProps$3(activatorEvents.value, _props));
  }
  function getActivator() {
    let selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : props.activator;
    const activator = getTarget(selector, vm);

    // The activator should only be a valid element (Ignore comments and text nodes)
    activatorEl.value = activator?.nodeType === Node.ELEMENT_NODE ? activator : undefined;
    return activatorEl.value;
  }
}
function getTarget(selector, vm) {
  if (!selector) return;
  let target;
  if (selector === 'parent') {
    let el = vm?.proxy?.$el?.parentNode;
    while (el?.hasAttribute('data-no-activator')) {
      el = el.parentNode;
    }
    target = el;
  } else if (typeof selector === 'string') {
    // Selector
    target = document.querySelector(selector);
  } else if ('$el' in selector) {
    // Component (ref)
    target = selector.$el;
  } else {
    // HTMLElement | Element | [x, y]
    target = selector;
  }
  return target;
}

const {onMounted: onMounted$1,shallowRef: shallowRef$7} = await importShared('vue');
function useHydration() {
  if (!IN_BROWSER) return shallowRef$7(false);
  const {
    ssr
  } = useDisplay();
  if (ssr) {
    const isMounted = shallowRef$7(false);
    onMounted$1(() => {
      isMounted.value = true;
    });
    return isMounted;
  } else {
    return shallowRef$7(true);
  }
}

// Utilities
const {shallowRef: shallowRef$6,toRef: toRef$7,watch: watch$7} = await importShared('vue');
const makeLazyProps = propsFactory({
  eager: Boolean
}, 'lazy');
function useLazy(props, active) {
  const isBooted = shallowRef$6(false);
  const hasContent = toRef$7(() => isBooted.value || props.eager || active.value);
  watch$7(active, () => isBooted.value = true);
  function onAfterLeave() {
    if (!props.eager) isBooted.value = false;
  }
  return {
    isBooted,
    hasContent,
    onAfterLeave
  };
}

// Utilities
function useScopeId() {
  const vm = getCurrentInstance('useScopeId');
  const scopeId = vm.vnode.scopeId;
  return {
    scopeId: scopeId ? {
      [scopeId]: ''
    } : undefined
  };
}

const {inject: inject$1,onScopeDispose: onScopeDispose$2,provide: provide$1,reactive,readonly,shallowRef: shallowRef$5,toRaw,toRef: toRef$6,toValue: toValue$1,watchEffect: watchEffect$1} = await importShared('vue');
const StackSymbol = Symbol.for('vuetify:stack');
const globalStack = reactive([]);
function useStack(isActive, zIndex, disableGlobalStack) {
  const vm = getCurrentInstance('useStack');
  const createStackEntry = !disableGlobalStack;
  const parent = inject$1(StackSymbol, undefined);
  const stack = reactive({
    activeChildren: new Set()
  });
  provide$1(StackSymbol, stack);
  const _zIndex = shallowRef$5(Number(toValue$1(zIndex)));
  useToggleScope(isActive, () => {
    const lastZIndex = globalStack.at(-1)?.[1];
    _zIndex.value = lastZIndex ? lastZIndex + 10 : Number(toValue$1(zIndex));
    if (createStackEntry) {
      globalStack.push([vm.uid, _zIndex.value]);
    }
    parent?.activeChildren.add(vm.uid);
    onScopeDispose$2(() => {
      if (createStackEntry) {
        const idx = toRaw(globalStack).findIndex(v => v[0] === vm.uid);
        globalStack.splice(idx, 1);
      }
      parent?.activeChildren.delete(vm.uid);
    });
  });
  const globalTop = shallowRef$5(true);
  if (createStackEntry) {
    watchEffect$1(() => {
      const _isTop = globalStack.at(-1)?.[0] === vm.uid;
      setTimeout(() => globalTop.value = _isTop);
    });
  }
  const localTop = toRef$6(() => !stack.activeChildren.size);
  return {
    globalTop: readonly(globalTop),
    localTop,
    stackStyles: toRef$6(() => ({
      zIndex: _zIndex.value
    }))
  };
}

// Utilities
const {computed: computed$7,warn} = await importShared('vue');
function useTeleport(target) {
  const teleportTarget = computed$7(() => {
    const _target = target();
    if (_target === true || !IN_BROWSER) return undefined;
    const targetElement = _target === false ? document.body : typeof _target === 'string' ? document.querySelector(_target) : _target;
    if (targetElement == null) {
      warn(`Unable to locate target ${_target}`);
      return undefined;
    }
    let container = [...targetElement.children].find(el => el.matches('.v-overlay-container'));
    if (!container) {
      container = document.createElement('div');
      container.className = 'v-overlay-container';
      targetElement.appendChild(container);
    }
    return container;
  });
  return {
    teleportTarget
  };
}

// Utilities
function defaultConditional() {
  return true;
}
function checkEvent(e, el, binding) {
  // The include element callbacks below can be expensive
  // so we should avoid calling them when we're not active.
  // Explicitly check for false to allow fallback compatibility
  // with non-toggleable components
  if (!e || checkIsActive(e, binding) === false) return false;

  // If we're clicking inside the shadowroot, then the app root doesn't get the same
  // level of introspection as to _what_ we're clicking. We want to check to see if
  // our target is the shadowroot parent container, and if it is, ignore.
  const root = attachedRoot(el);
  if (typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot && root.host === e.target) return false;

  // Check if additional elements were passed to be included in check
  // (click must be outside all included elements, if any)
  const elements = (typeof binding.value === 'object' && binding.value.include || (() => []))();
  // Add the root element for the component this directive was defined on
  elements.push(el);

  // Check if it's a click outside our elements, and then if our callback returns true.
  // Non-toggleable components should take action in their callback and return falsy.
  // Toggleable can return true if it wants to deactivate.
  // Note that, because we're in the capture phase, this callback will occur before
  // the bubbling click event on any outside elements.
  return !elements.some(el => el?.contains(e.target));
}
function checkIsActive(e, binding) {
  const isActive = typeof binding.value === 'object' && binding.value.closeConditional || defaultConditional;
  return isActive(e);
}
function directive(e, el, binding) {
  const handler = typeof binding.value === 'function' ? binding.value : binding.value.handler;

  // Clicks in the Shadow DOM change their target while using setTimeout, so the original target is saved here
  e.shadowTarget = e.target;
  el._clickOutside.lastMousedownWasOutside && checkEvent(e, el, binding) && setTimeout(() => {
    checkIsActive(e, binding) && handler && handler(e);
  }, 0);
}
function handleShadow(el, callback) {
  const root = attachedRoot(el);
  callback(document);
  if (typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot) {
    callback(root);
  }
}
const ClickOutside = {
  // [data-app] may not be found
  // if using bind, inserted makes
  // sure that the root element is
  // available, iOS does not support
  // clicks on body
  mounted(el, binding) {
    const onClick = e => directive(e, el, binding);
    const onMousedown = e => {
      el._clickOutside.lastMousedownWasOutside = checkEvent(e, el, binding);
    };
    handleShadow(el, app => {
      app.addEventListener('click', onClick, true);
      app.addEventListener('mousedown', onMousedown, true);
    });
    if (!el._clickOutside) {
      el._clickOutside = {
        lastMousedownWasOutside: false
      };
    }
    el._clickOutside[binding.instance.$.uid] = {
      onClick,
      onMousedown
    };
  },
  beforeUnmount(el, binding) {
    if (!el._clickOutside) return;
    handleShadow(el, app => {
      if (!app || !el._clickOutside?.[binding.instance.$.uid]) return;
      const {
        onClick,
        onMousedown
      } = el._clickOutside[binding.instance.$.uid];
      app.removeEventListener('click', onClick, true);
      app.removeEventListener('mousedown', onMousedown, true);
    });
    delete el._clickOutside[binding.instance.$.uid];
  }
};

const {mergeProps:_mergeProps$5,createElementVNode:_createElementVNode$6,createVNode:_createVNode$7,Fragment:_Fragment$5,vShow:_vShow$2,withDirectives:_withDirectives$3} = await importShared('vue');
const {computed: computed$6,mergeProps: mergeProps$2,onBeforeUnmount: onBeforeUnmount$1,ref: ref$5,Teleport,Transition,watch: watch$6} = await importShared('vue');
function Scrim(props) {
  const {
    modelValue,
    color,
    ...rest
  } = props;
  return _createVNode$7(Transition, {
    "name": "fade-transition",
    "appear": true
  }, {
    default: () => [props.modelValue && _createElementVNode$6("div", _mergeProps$5({
      "class": ['v-overlay__scrim', props.color.backgroundColorClasses.value],
      "style": props.color.backgroundColorStyles.value
    }, rest), null)]
  });
}
const makeVOverlayProps = propsFactory({
  absolute: Boolean,
  attach: [Boolean, String, Object],
  closeOnBack: {
    type: Boolean,
    default: true
  },
  contained: Boolean,
  contentClass: null,
  contentProps: null,
  disabled: Boolean,
  opacity: [Number, String],
  noClickAnimation: Boolean,
  modelValue: Boolean,
  persistent: Boolean,
  scrim: {
    type: [Boolean, String],
    default: true
  },
  zIndex: {
    type: [Number, String],
    default: 2000
  },
  ...makeActivatorProps(),
  ...makeComponentProps(),
  ...makeDimensionProps(),
  ...makeLazyProps(),
  ...makeLocationStrategyProps(),
  ...makeScrollStrategyProps(),
  ...makeThemeProps(),
  ...makeTransitionProps$1()
}, 'VOverlay');
const VOverlay = genericComponent()({
  name: 'VOverlay',
  directives: {
    vClickOutside: ClickOutside
  },
  inheritAttrs: false,
  props: {
    _disableGlobalStack: Boolean,
    ...makeVOverlayProps()
  },
  emits: {
    'click:outside': e => true,
    'update:modelValue': value => true,
    keydown: e => true,
    afterEnter: () => true,
    afterLeave: () => true
  },
  setup(props, _ref) {
    let {
      slots,
      attrs,
      emit
    } = _ref;
    const vm = getCurrentInstance('VOverlay');
    const root = ref$5();
    const scrimEl = ref$5();
    const contentEl = ref$5();
    const model = useProxiedModel(props, 'modelValue');
    const isActive = computed$6({
      get: () => model.value,
      set: v => {
        if (!(v && props.disabled)) model.value = v;
      }
    });
    const {
      themeClasses
    } = provideTheme(props);
    const {
      rtlClasses,
      isRtl
    } = useRtl();
    const {
      hasContent,
      onAfterLeave: _onAfterLeave
    } = useLazy(props, isActive);
    const scrimColor = useBackgroundColor(() => {
      return typeof props.scrim === 'string' ? props.scrim : null;
    });
    const {
      globalTop,
      localTop,
      stackStyles
    } = useStack(isActive, () => props.zIndex, props._disableGlobalStack);
    const {
      activatorEl,
      activatorRef,
      target,
      targetEl,
      targetRef,
      activatorEvents,
      contentEvents,
      scrimEvents
    } = useActivator(props, {
      isActive,
      isTop: localTop,
      contentEl
    });
    const {
      teleportTarget
    } = useTeleport(() => {
      const target = props.attach || props.contained;
      if (target) return target;
      const rootNode = activatorEl?.value?.getRootNode() || vm.proxy?.$el?.getRootNode();
      if (rootNode instanceof ShadowRoot) return rootNode;
      return false;
    });
    const {
      dimensionStyles
    } = useDimension(props);
    const isMounted = useHydration();
    const {
      scopeId
    } = useScopeId();
    watch$6(() => props.disabled, v => {
      if (v) isActive.value = false;
    });
    const {
      contentStyles,
      updateLocation
    } = useLocationStrategies(props, {
      isRtl,
      contentEl,
      target,
      isActive
    });
    useScrollStrategies(props, {
      root,
      contentEl,
      targetEl,
      target,
      isActive,
      updateLocation
    });
    function onClickOutside(e) {
      emit('click:outside', e);
      if (!props.persistent) isActive.value = false;else animateClick();
    }
    function closeConditional(e) {
      return isActive.value && globalTop.value && (
      // If using scrim, only close if clicking on it rather than anything opened on top
      !props.scrim || e.target === scrimEl.value || e instanceof MouseEvent && e.shadowTarget === scrimEl.value);
    }
    IN_BROWSER && watch$6(isActive, val => {
      if (val) {
        window.addEventListener('keydown', onKeydown);
      } else {
        window.removeEventListener('keydown', onKeydown);
      }
    }, {
      immediate: true
    });
    onBeforeUnmount$1(() => {
      if (!IN_BROWSER) return;
      window.removeEventListener('keydown', onKeydown);
    });
    function onKeydown(e) {
      if (e.key === 'Escape' && globalTop.value) {
        if (!contentEl.value?.contains(document.activeElement)) {
          emit('keydown', e);
        }
        if (!props.persistent) {
          isActive.value = false;
          if (contentEl.value?.contains(document.activeElement)) {
            activatorEl.value?.focus();
          }
        } else animateClick();
      }
    }
    function onKeydownSelf(e) {
      if (e.key === 'Escape' && !globalTop.value) return;
      emit('keydown', e);
    }
    const router = useRouter();
    useToggleScope(() => props.closeOnBack, () => {
      useBackButton(router, next => {
        if (globalTop.value && isActive.value) {
          next(false);
          if (!props.persistent) isActive.value = false;else animateClick();
        } else {
          next();
        }
      });
    });
    const top = ref$5();
    watch$6(() => isActive.value && (props.absolute || props.contained) && teleportTarget.value == null, val => {
      if (val) {
        const scrollParent = getScrollParent(root.value);
        if (scrollParent && scrollParent !== document.scrollingElement) {
          top.value = scrollParent.scrollTop;
        }
      }
    });

    // Add a quick "bounce" animation to the content
    function animateClick() {
      if (props.noClickAnimation) return;
      contentEl.value && animate(contentEl.value, [{
        transformOrigin: 'center'
      }, {
        transform: 'scale(1.03)'
      }, {
        transformOrigin: 'center'
      }], {
        duration: 150,
        easing: standardEasing
      });
    }
    function onAfterEnter() {
      emit('afterEnter');
    }
    function onAfterLeave() {
      _onAfterLeave();
      emit('afterLeave');
    }
    useRender(() => _createElementVNode$6(_Fragment$5, null, [slots.activator?.({
      isActive: isActive.value,
      targetRef,
      props: mergeProps$2({
        ref: activatorRef
      }, activatorEvents.value, props.activatorProps)
    }), isMounted.value && hasContent.value && _createVNode$7(Teleport, {
      "disabled": !teleportTarget.value,
      "to": teleportTarget.value
    }, {
      default: () => [_createElementVNode$6("div", _mergeProps$5({
        "class": ['v-overlay', {
          'v-overlay--absolute': props.absolute || props.contained,
          'v-overlay--active': isActive.value,
          'v-overlay--contained': props.contained
        }, themeClasses.value, rtlClasses.value, props.class],
        "style": [stackStyles.value, {
          '--v-overlay-opacity': props.opacity,
          top: convertToUnit(top.value)
        }, props.style],
        "ref": root,
        "onKeydown": onKeydownSelf
      }, scopeId, attrs), [_createVNode$7(Scrim, _mergeProps$5({
        "color": scrimColor,
        "modelValue": isActive.value && !!props.scrim,
        "ref": scrimEl
      }, scrimEvents.value), null), _createVNode$7(MaybeTransition, {
        "appear": true,
        "persisted": true,
        "transition": props.transition,
        "target": target.value,
        "onAfterEnter": onAfterEnter,
        "onAfterLeave": onAfterLeave
      }, {
        default: () => [_withDirectives$3(_createElementVNode$6("div", _mergeProps$5({
          "ref": contentEl,
          "class": ['v-overlay__content', props.contentClass],
          "style": [dimensionStyles.value, contentStyles.value]
        }, contentEvents.value, props.contentProps), [slots.default?.({
          isActive
        })]), [[_vShow$2, isActive.value], [ClickOutside, {
          handler: onClickOutside,
          closeConditional,
          include: () => [activatorEl.value]
        }]])]
      })])]
    })]));
    return {
      activatorEl,
      scrimEl,
      target,
      animateClick,
      contentEl,
      rootEl: root,
      globalTop,
      localTop,
      updateLocation
    };
  }
});

const {createVNode:_createVNode$6,mergeProps:_mergeProps$4} = await importShared('vue');
const {computed: computed$5,inject,mergeProps: mergeProps$1,nextTick: nextTick$3,onBeforeUnmount,onDeactivated,provide,ref: ref$4,shallowRef: shallowRef$4,toRef: toRef$5,useId: useId$3,watch: watch$5} = await importShared('vue');
const makeVMenuProps = propsFactory({
  // TODO
  // disableKeys: Boolean,
  id: String,
  submenu: Boolean,
  disableInitialFocus: Boolean,
  ...omit(makeVOverlayProps({
    closeDelay: 250,
    closeOnContentClick: true,
    locationStrategy: 'connected',
    location: undefined,
    openDelay: 300,
    scrim: false,
    scrollStrategy: 'reposition',
    transition: {
      component: VDialogTransition
    }
  }), ['absolute'])
}, 'VMenu');
const VMenu = genericComponent()({
  name: 'VMenu',
  props: makeVMenuProps(),
  emits: {
    'update:modelValue': value => true
  },
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const isActive = useProxiedModel(props, 'modelValue');
    const {
      scopeId
    } = useScopeId();
    const {
      isRtl
    } = useRtl();
    const uid = useId$3();
    const id = toRef$5(() => props.id || `v-menu-${uid}`);
    const overlay = ref$4();
    const parent = inject(VMenuSymbol, null);
    const openChildren = shallowRef$4(new Set());
    provide(VMenuSymbol, {
      register() {
        openChildren.value.add(uid);
      },
      unregister() {
        openChildren.value.delete(uid);
      },
      closeParents(e) {
        setTimeout(() => {
          if (!openChildren.value.size && !props.persistent && (e == null || overlay.value?.contentEl && !isClickInsideElement(e, overlay.value.contentEl))) {
            isActive.value = false;
            parent?.closeParents();
          }
        }, 40);
      }
    });
    onBeforeUnmount(() => {
      parent?.unregister();
      document.removeEventListener('focusin', onFocusIn);
    });
    onDeactivated(() => isActive.value = false);
    let focusTrapSuppressed = false;
    let focusTrapSuppressionTimeout = -1;
    async function onPointerdown() {
      focusTrapSuppressed = true;
      focusTrapSuppressionTimeout = window.setTimeout(() => {
        focusTrapSuppressed = false;
      }, 100);
    }
    async function onFocusIn(e) {
      const before = e.relatedTarget;
      const after = e.target;
      await nextTick$3();
      if (isActive.value && before !== after && overlay.value?.rootEl && overlay.value?.contentEl &&
      // We're the menu without open submenus or overlays
      overlay.value?.localTop &&
      // It isn't the document or the menu body
      ![document, overlay.value.rootEl].includes(after) &&
      // It isn't inside the menu body
      !overlay.value.rootEl.contains(after)) {
        if (focusTrapSuppressed) {
          if (!props.openOnHover && !overlay.value.activatorEl?.contains(after)) {
            isActive.value = false;
          }
        } else {
          const focusable = focusableChildren(overlay.value.contentEl);
          focusable[0]?.focus();
          document.removeEventListener('pointerdown', onPointerdown);
        }
      }
    }
    watch$5(isActive, val => {
      if (val) {
        parent?.register();
        if (IN_BROWSER && !props.disableInitialFocus) {
          document.addEventListener('pointerdown', onPointerdown);
          document.addEventListener('focusin', onFocusIn, {
            once: true
          });
        }
      } else {
        parent?.unregister();
        if (IN_BROWSER) {
          clearTimeout(focusTrapSuppressionTimeout);
          document.removeEventListener('pointerdown', onPointerdown);
          document.removeEventListener('focusin', onFocusIn);
        }
      }
    }, {
      immediate: true
    });
    function onClickOutside(e) {
      parent?.closeParents(e);
    }
    function onKeydown(e) {
      if (props.disabled) return;
      if (e.key === 'Tab' || e.key === 'Enter' && !props.closeOnContentClick) {
        if (e.key === 'Enter' && (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement && !!e.target.closest('form'))) return;
        if (e.key === 'Enter') e.preventDefault();
        const nextElement = getNextElement(focusableChildren(overlay.value?.contentEl, false), e.shiftKey ? 'prev' : 'next', el => el.tabIndex >= 0);
        if (!nextElement) {
          isActive.value = false;
          overlay.value?.activatorEl?.focus();
        }
      } else if (props.submenu && e.key === (isRtl.value ? 'ArrowRight' : 'ArrowLeft')) {
        isActive.value = false;
        overlay.value?.activatorEl?.focus();
      }
    }
    function onActivatorKeydown(e) {
      if (props.disabled) return;
      const el = overlay.value?.contentEl;
      if (el && isActive.value) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopImmediatePropagation();
          focusChild(el, 'next');
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          e.stopImmediatePropagation();
          focusChild(el, 'prev');
        } else if (props.submenu) {
          if (e.key === (isRtl.value ? 'ArrowRight' : 'ArrowLeft')) {
            isActive.value = false;
          } else if (e.key === (isRtl.value ? 'ArrowLeft' : 'ArrowRight')) {
            e.preventDefault();
            focusChild(el, 'first');
          }
        }
      } else if (props.submenu ? e.key === (isRtl.value ? 'ArrowLeft' : 'ArrowRight') : ['ArrowDown', 'ArrowUp'].includes(e.key)) {
        isActive.value = true;
        e.preventDefault();
        setTimeout(() => setTimeout(() => onActivatorKeydown(e)));
      }
    }
    const activatorProps = computed$5(() => mergeProps$1({
      'aria-haspopup': 'menu',
      'aria-expanded': String(isActive.value),
      'aria-controls': id.value,
      'aria-owns': id.value,
      onKeydown: onActivatorKeydown
    }, props.activatorProps));
    useRender(() => {
      const overlayProps = VOverlay.filterProps(props);
      return _createVNode$6(VOverlay, _mergeProps$4({
        "ref": overlay,
        "id": id.value,
        "class": ['v-menu', props.class],
        "style": props.style
      }, overlayProps, {
        "modelValue": isActive.value,
        "onUpdate:modelValue": $event => isActive.value = $event,
        "absolute": true,
        "activatorProps": activatorProps.value,
        "location": props.location ?? (props.submenu ? 'end' : 'bottom'),
        "onClick:outside": onClickOutside,
        "onKeydown": onKeydown
      }, scopeId), {
        activator: slots.activator,
        default: function () {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          return _createVNode$6(VDefaultsProvider, {
            "root": "VMenu"
          }, {
            default: () => [slots.default?.(...args)]
          });
        }
      });
    });
    return forwardRefs({
      id,
      ΨopenChildren: openChildren
    }, overlay);
  }
});

const {vShow:_vShow$1,normalizeClass:_normalizeClass$4,normalizeStyle:_normalizeStyle$3,createElementVNode:_createElementVNode$5,withDirectives:_withDirectives$2,createVNode:_createVNode$5} = await importShared('vue');
const {toRef: toRef$4} = await importShared('vue');
const makeVCounterProps = propsFactory({
  active: Boolean,
  disabled: Boolean,
  max: [Number, String],
  value: {
    type: [Number, String],
    default: 0
  },
  ...makeComponentProps(),
  ...makeTransitionProps$1({
    transition: {
      component: VSlideYTransition
    }
  })
}, 'VCounter');
const VCounter = genericComponent()({
  name: 'VCounter',
  functional: true,
  props: makeVCounterProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const counter = toRef$4(() => {
      return props.max ? `${props.value} / ${props.max}` : String(props.value);
    });
    useRender(() => _createVNode$5(MaybeTransition, {
      "transition": props.transition
    }, {
      default: () => [_withDirectives$2(_createElementVNode$5("div", {
        "class": _normalizeClass$4(['v-counter', {
          'text-error': props.max && !props.disabled && parseFloat(props.value) > parseFloat(props.max)
        }, props.class]),
        "style": _normalizeStyle$3(props.style)
      }, [slots.default ? slots.default({
        counter: counter.value,
        max: props.max,
        value: props.value
      }) : counter.value]), [[_vShow$1, props.active]])]
    }));
    return {};
  }
});

const {normalizeClass:_normalizeClass$3,normalizeStyle:_normalizeStyle$2,createVNode:_createVNode$4} = await importShared('vue');
const makeVFieldLabelProps = propsFactory({
  floating: Boolean,
  ...makeComponentProps()
}, 'VFieldLabel');
const VFieldLabel = genericComponent()({
  name: 'VFieldLabel',
  props: makeVFieldLabelProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    useRender(() => _createVNode$4(VLabel, {
      "class": _normalizeClass$3(['v-field-label', {
        'v-field-label--floating': props.floating
      }, props.class]),
      "style": _normalizeStyle$2(props.style)
    }, slots));
    return {};
  }
});

const {createElementVNode:_createElementVNode$4,createVNode:_createVNode$3,normalizeClass:_normalizeClass$2,normalizeStyle:_normalizeStyle$1,vShow:_vShow,withDirectives:_withDirectives$1,Fragment:_Fragment$4,mergeProps:_mergeProps$3} = await importShared('vue');
const {computed: computed$4,ref: ref$3,toRef: toRef$3,useId: useId$2,watch: watch$4} = await importShared('vue');
const allowedVariants = ['underlined', 'outlined', 'filled', 'solo', 'solo-inverted', 'solo-filled', 'plain'];
const makeVFieldProps = propsFactory({
  appendInnerIcon: IconValue,
  bgColor: String,
  clearable: Boolean,
  clearIcon: {
    type: IconValue,
    default: '$clear'
  },
  active: Boolean,
  centerAffix: {
    type: Boolean,
    default: undefined
  },
  color: String,
  baseColor: String,
  dirty: Boolean,
  disabled: {
    type: Boolean,
    default: null
  },
  glow: Boolean,
  error: Boolean,
  flat: Boolean,
  iconColor: [Boolean, String],
  label: String,
  persistentClear: Boolean,
  prependInnerIcon: IconValue,
  reverse: Boolean,
  singleLine: Boolean,
  variant: {
    type: String,
    default: 'filled',
    validator: v => allowedVariants.includes(v)
  },
  'onClick:clear': EventProp(),
  'onClick:appendInner': EventProp(),
  'onClick:prependInner': EventProp(),
  ...makeComponentProps(),
  ...makeLoaderProps(),
  ...makeRoundedProps(),
  ...makeThemeProps()
}, 'VField');
const VField = genericComponent()({
  name: 'VField',
  inheritAttrs: false,
  props: {
    id: String,
    details: Boolean,
    ...makeFocusProps(),
    ...makeVFieldProps()
  },
  emits: {
    'update:focused': focused => true,
    'update:modelValue': value => true
  },
  setup(props, _ref) {
    let {
      attrs,
      emit,
      slots
    } = _ref;
    const {
      themeClasses
    } = provideTheme(props);
    const {
      loaderClasses
    } = useLoader(props);
    const {
      focusClasses,
      isFocused,
      focus,
      blur
    } = useFocus(props);
    const {
      InputIcon
    } = useInputIcon(props);
    const {
      roundedClasses
    } = useRounded(props);
    const {
      rtlClasses
    } = useRtl();
    const isActive = toRef$3(() => props.dirty || props.active);
    const hasLabel = toRef$3(() => !!(props.label || slots.label));
    const hasFloatingLabel = toRef$3(() => !props.singleLine && hasLabel.value);
    const uid = useId$2();
    const id = computed$4(() => props.id || `input-${uid}`);
    const messagesId = toRef$3(() => !props.details ? undefined : `${id.value}-messages`);
    const labelRef = ref$3();
    const floatingLabelRef = ref$3();
    const controlRef = ref$3();
    const isPlainOrUnderlined = computed$4(() => ['plain', 'underlined'].includes(props.variant));
    const color = computed$4(() => {
      return props.error || props.disabled ? undefined : isActive.value && isFocused.value ? props.color : props.baseColor;
    });
    const iconColor = computed$4(() => {
      if (!props.iconColor || props.glow && !isFocused.value) return undefined;
      return props.iconColor === true ? color.value : props.iconColor;
    });
    const {
      backgroundColorClasses,
      backgroundColorStyles
    } = useBackgroundColor(() => props.bgColor);
    const {
      textColorClasses,
      textColorStyles
    } = useTextColor(color);
    watch$4(isActive, val => {
      if (hasFloatingLabel.value && !PREFERS_REDUCED_MOTION()) {
        const el = labelRef.value.$el;
        const targetEl = floatingLabelRef.value.$el;
        requestAnimationFrame(() => {
          const rect = nullifyTransforms(el);
          const targetRect = targetEl.getBoundingClientRect();
          const x = targetRect.x - rect.x;
          const y = targetRect.y - rect.y - (rect.height / 2 - targetRect.height / 2);
          const targetWidth = targetRect.width / 0.75;
          const width = Math.abs(targetWidth - rect.width) > 1 ? {
            maxWidth: convertToUnit(targetWidth)
          } : undefined;
          const style = getComputedStyle(el);
          const targetStyle = getComputedStyle(targetEl);
          const duration = parseFloat(style.transitionDuration) * 1000 || 150;
          const scale = parseFloat(targetStyle.getPropertyValue('--v-field-label-scale'));
          const color = targetStyle.getPropertyValue('color');
          el.style.visibility = 'visible';
          targetEl.style.visibility = 'hidden';
          animate(el, {
            transform: `translate(${x}px, ${y}px) scale(${scale})`,
            color,
            ...width
          }, {
            duration,
            easing: standardEasing,
            direction: val ? 'normal' : 'reverse'
          }).finished.then(() => {
            el.style.removeProperty('visibility');
            targetEl.style.removeProperty('visibility');
          });
        });
      }
    }, {
      flush: 'post'
    });
    const slotProps = computed$4(() => ({
      isActive,
      isFocused,
      controlRef,
      blur,
      focus
    }));
    function onClick(e) {
      if (e.target !== document.activeElement) {
        e.preventDefault();
      }
    }
    useRender(() => {
      const isOutlined = props.variant === 'outlined';
      const hasPrepend = !!(slots['prepend-inner'] || props.prependInnerIcon);
      const hasClear = !!(props.clearable || slots.clear) && !props.disabled;
      const hasAppend = !!(slots['append-inner'] || props.appendInnerIcon || hasClear);
      const label = () => slots.label ? slots.label({
        ...slotProps.value,
        label: props.label,
        props: {
          for: id.value
        }
      }) : props.label;
      return _createElementVNode$4("div", _mergeProps$3({
        "class": ['v-field', {
          'v-field--active': isActive.value,
          'v-field--appended': hasAppend,
          'v-field--center-affix': props.centerAffix ?? !isPlainOrUnderlined.value,
          'v-field--disabled': props.disabled,
          'v-field--dirty': props.dirty,
          'v-field--error': props.error,
          'v-field--glow': props.glow,
          'v-field--flat': props.flat,
          'v-field--has-background': !!props.bgColor,
          'v-field--persistent-clear': props.persistentClear,
          'v-field--prepended': hasPrepend,
          'v-field--reverse': props.reverse,
          'v-field--single-line': props.singleLine,
          'v-field--no-label': !label(),
          [`v-field--variant-${props.variant}`]: true
        }, themeClasses.value, backgroundColorClasses.value, focusClasses.value, loaderClasses.value, roundedClasses.value, rtlClasses.value, props.class],
        "style": [backgroundColorStyles.value, props.style],
        "onClick": onClick
      }, attrs), [_createElementVNode$4("div", {
        "class": "v-field__overlay"
      }, null), _createVNode$3(LoaderSlot, {
        "name": "v-field",
        "active": !!props.loading,
        "color": props.error ? 'error' : typeof props.loading === 'string' ? props.loading : props.color
      }, {
        default: slots.loader
      }), hasPrepend && _createElementVNode$4("div", {
        "key": "prepend",
        "class": "v-field__prepend-inner"
      }, [props.prependInnerIcon && _createVNode$3(InputIcon, {
        "key": "prepend-icon",
        "name": "prependInner",
        "color": iconColor.value
      }, null), slots['prepend-inner']?.(slotProps.value)]), _createElementVNode$4("div", {
        "class": "v-field__field",
        "data-no-activator": ""
      }, [['filled', 'solo', 'solo-inverted', 'solo-filled'].includes(props.variant) && hasFloatingLabel.value && _createVNode$3(VFieldLabel, {
        "key": "floating-label",
        "ref": floatingLabelRef,
        "class": _normalizeClass$2([textColorClasses.value]),
        "floating": true,
        "for": id.value,
        "aria-hidden": !isActive.value,
        "style": _normalizeStyle$1(textColorStyles.value)
      }, {
        default: () => [label()]
      }), hasLabel.value && _createVNode$3(VFieldLabel, {
        "key": "label",
        "ref": labelRef,
        "for": id.value
      }, {
        default: () => [label()]
      }), slots.default?.({
        ...slotProps.value,
        props: {
          id: id.value,
          class: 'v-field__input',
          'aria-describedby': messagesId.value
        },
        focus,
        blur
      }) ?? _createElementVNode$4("div", {
        "id": id.value,
        "class": "v-field__input",
        "aria-describedby": messagesId.value
      }, null)]), hasClear && _createVNode$3(VExpandXTransition, {
        "key": "clear"
      }, {
        default: () => [_withDirectives$1(_createElementVNode$4("div", {
          "class": "v-field__clearable",
          "onMousedown": e => {
            e.preventDefault();
            e.stopPropagation();
          }
        }, [_createVNode$3(VDefaultsProvider, {
          "defaults": {
            VIcon: {
              icon: props.clearIcon
            }
          }
        }, {
          default: () => [slots.clear ? slots.clear({
            ...slotProps.value,
            props: {
              onFocus: focus,
              onBlur: blur,
              onClick: props['onClick:clear'],
              tabindex: -1
            }
          }) : _createVNode$3(InputIcon, {
            "name": "clear",
            "onFocus": focus,
            "onBlur": blur,
            "tabindex": -1
          }, null)]
        })]), [[_vShow, props.dirty]])]
      }), hasAppend && _createElementVNode$4("div", {
        "key": "append",
        "class": "v-field__append-inner"
      }, [slots['append-inner']?.(slotProps.value), props.appendInnerIcon && _createVNode$3(InputIcon, {
        "key": "append-icon",
        "name": "appendInner",
        "color": iconColor.value
      }, null)]), _createElementVNode$4("div", {
        "class": _normalizeClass$2(['v-field__outline', textColorClasses.value]),
        "style": _normalizeStyle$1(textColorStyles.value)
      }, [isOutlined && _createElementVNode$4(_Fragment$4, null, [_createElementVNode$4("div", {
        "class": "v-field__outline__start"
      }, null), hasFloatingLabel.value && _createElementVNode$4("div", {
        "class": "v-field__outline__notch"
      }, [_createVNode$3(VFieldLabel, {
        "ref": floatingLabelRef,
        "floating": true,
        "for": id.value,
        "aria-hidden": !isActive.value
      }, {
        default: () => [label()]
      })]), _createElementVNode$4("div", {
        "class": "v-field__outline__end"
      }, null)]), isPlainOrUnderlined.value && hasFloatingLabel.value && _createVNode$3(VFieldLabel, {
        "ref": floatingLabelRef,
        "floating": true,
        "for": id.value,
        "aria-hidden": !isActive.value
      }, {
        default: () => [label()]
      })])]);
    });
    return {
      controlRef,
      fieldIconColor: iconColor
    };
  }
});

// Utilities
const {shallowRef: shallowRef$3,toRef: toRef$2,useId: useId$1} = await importShared('vue');
// Types
// Composables
const makeAutocompleteProps = propsFactory({
  autocomplete: String
}, 'autocomplete');
function useAutocomplete(props) {
  const uniqueId = useId$1();
  const reloadTrigger = shallowRef$3(0);
  const isSuppressing = toRef$2(() => props.autocomplete === 'suppress');
  const fieldName = toRef$2(() => {
    return isSuppressing.value ? `${props.name}-${uniqueId}-${reloadTrigger.value}` : props.name;
  });
  const fieldAutocomplete = toRef$2(() => {
    return isSuppressing.value ? 'off' : props.autocomplete;
  });
  return {
    isSuppressing,
    fieldAutocomplete,
    fieldName,
    update: () => reloadTrigger.value = new Date().getTime()
  };
}

function useAutofocus(props) {
  function onIntersect(isIntersecting, entries) {
    if (!props.autofocus || !isIntersecting) return;
    entries[0].target?.focus?.();
  }
  return {
    onIntersect
  };
}

const {mergeProps:_mergeProps$2,createElementVNode:_createElementVNode$3,withDirectives:_withDirectives,Fragment:_Fragment$3,normalizeClass:_normalizeClass$1,createVNode:_createVNode$2} = await importShared('vue');
const {cloneVNode,computed: computed$3,nextTick: nextTick$2,ref: ref$2} = await importShared('vue');
const activeTypes = ['color', 'file', 'time', 'date', 'datetime-local', 'week', 'month'];
const makeVTextFieldProps = propsFactory({
  autofocus: Boolean,
  counter: [Boolean, Number, String],
  counterValue: [Number, Function],
  prefix: String,
  placeholder: String,
  persistentPlaceholder: Boolean,
  persistentCounter: Boolean,
  suffix: String,
  role: String,
  type: {
    type: String,
    default: 'text'
  },
  modelModifiers: Object,
  ...makeAutocompleteProps(),
  ...makeVInputProps(),
  ...makeVFieldProps()
}, 'VTextField');
const VTextField = genericComponent()({
  name: 'VTextField',
  directives: {
    vIntersect: Intersect
  },
  inheritAttrs: false,
  props: makeVTextFieldProps(),
  emits: {
    'click:control': e => true,
    'mousedown:control': e => true,
    'update:focused': focused => true,
    'update:modelValue': val => true
  },
  setup(props, _ref) {
    let {
      attrs,
      emit,
      slots
    } = _ref;
    const model = useProxiedModel(props, 'modelValue');
    const {
      isFocused,
      focus,
      blur
    } = useFocus(props);
    const {
      onIntersect
    } = useAutofocus(props);
    const counterValue = computed$3(() => {
      return typeof props.counterValue === 'function' ? props.counterValue(model.value) : typeof props.counterValue === 'number' ? props.counterValue : (model.value ?? '').toString().length;
    });
    const max = computed$3(() => {
      if (attrs.maxlength) return attrs.maxlength;
      if (!props.counter || typeof props.counter !== 'number' && typeof props.counter !== 'string') return undefined;
      return props.counter;
    });
    const isPlainOrUnderlined = computed$3(() => ['plain', 'underlined'].includes(props.variant));
    const vInputRef = ref$2();
    const vFieldRef = ref$2();
    const inputRef = ref$2();
    const autocomplete = useAutocomplete(props);
    const isActive = computed$3(() => activeTypes.includes(props.type) || props.persistentPlaceholder || isFocused.value || props.active);
    function onFocus() {
      if (autocomplete.isSuppressing.value) {
        autocomplete.update();
      }
      if (!isFocused.value) focus();
      nextTick$2(() => {
        if (inputRef.value !== document.activeElement) {
          inputRef.value?.focus();
        }
      });
    }
    function onControlMousedown(e) {
      emit('mousedown:control', e);
      if (e.target === inputRef.value) return;
      onFocus();
      e.preventDefault();
    }
    function onControlClick(e) {
      emit('click:control', e);
    }
    function onClear(e, reset) {
      e.stopPropagation();
      onFocus();
      nextTick$2(() => {
        reset();
        callEvent(props['onClick:clear'], e);
      });
    }
    function onInput(e) {
      const el = e.target;
      if (!(props.modelModifiers?.trim && ['text', 'search', 'password', 'tel', 'url'].includes(props.type))) {
        model.value = el.value;
        return;
      }
      const value = el.value;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      model.value = value;
      nextTick$2(() => {
        let offset = 0;
        if (value.trimStart().length === el.value.length) {
          // #22307 - Whitespace has been removed from the
          // start, offset the caret position to compensate
          offset = value.length - el.value.length;
        }
        if (start != null) el.selectionStart = start - offset;
        if (end != null) el.selectionEnd = end - offset;
      });
    }
    useRender(() => {
      const hasCounter = !!(slots.counter || props.counter !== false && props.counter != null);
      const hasDetails = !!(hasCounter || slots.details);
      const [rootAttrs, inputAttrs] = filterInputAttrs(attrs);
      const {
        modelValue: _,
        ...inputProps
      } = VInput.filterProps(props);
      const fieldProps = VField.filterProps(props);
      return _createVNode$2(VInput, _mergeProps$2({
        "ref": vInputRef,
        "modelValue": model.value,
        "onUpdate:modelValue": $event => model.value = $event,
        "class": ['v-text-field', {
          'v-text-field--prefixed': props.prefix,
          'v-text-field--suffixed': props.suffix,
          'v-input--plain-underlined': isPlainOrUnderlined.value
        }, props.class],
        "style": props.style
      }, rootAttrs, inputProps, {
        "centerAffix": !isPlainOrUnderlined.value,
        "focused": isFocused.value
      }), {
        ...slots,
        default: _ref2 => {
          let {
            id,
            isDisabled,
            isDirty,
            isReadonly,
            isValid,
            hasDetails,
            reset
          } = _ref2;
          return _createVNode$2(VField, _mergeProps$2({
            "ref": vFieldRef,
            "onMousedown": onControlMousedown,
            "onClick": onControlClick,
            "onClick:clear": e => onClear(e, reset),
            "role": props.role
          }, omit(fieldProps, ['onClick:clear']), {
            "id": id.value,
            "active": isActive.value || isDirty.value,
            "dirty": isDirty.value || props.dirty,
            "disabled": isDisabled.value,
            "focused": isFocused.value,
            "details": hasDetails.value,
            "error": isValid.value === false
          }), {
            ...slots,
            default: _ref3 => {
              let {
                props: {
                  class: fieldClass,
                  ...slotProps
                },
                controlRef
              } = _ref3;
              const inputNode = _withDirectives(_createElementVNode$3("input", _mergeProps$2({
                "ref": val => inputRef.value = controlRef.value = val,
                "value": model.value,
                "onInput": onInput,
                "autofocus": props.autofocus,
                "readonly": isReadonly.value,
                "disabled": isDisabled.value,
                "name": autocomplete.fieldName.value,
                "autocomplete": autocomplete.fieldAutocomplete.value,
                "placeholder": props.placeholder,
                "size": 1,
                "role": props.role,
                "type": props.type,
                "onFocus": focus,
                "onBlur": blur
              }, slotProps, inputAttrs), null), [[Intersect, {
                handler: onIntersect
              }, null, {
                once: true
              }]]);
              return _createElementVNode$3(_Fragment$3, null, [props.prefix && _createElementVNode$3("span", {
                "class": "v-text-field__prefix"
              }, [_createElementVNode$3("span", {
                "class": "v-text-field__prefix__text"
              }, [props.prefix])]), slots.default ? _createElementVNode$3("div", {
                "class": _normalizeClass$1(fieldClass),
                "data-no-activator": ""
              }, [slots.default(), inputNode]) : cloneVNode(inputNode, {
                class: fieldClass
              }), props.suffix && _createElementVNode$3("span", {
                "class": "v-text-field__suffix"
              }, [_createElementVNode$3("span", {
                "class": "v-text-field__suffix__text"
              }, [props.suffix])])]);
            }
          });
        },
        details: hasDetails ? slotProps => _createElementVNode$3(_Fragment$3, null, [slots.details?.(slotProps), hasCounter && _createElementVNode$3(_Fragment$3, null, [_createElementVNode$3("span", null, null), _createVNode$2(VCounter, {
          "active": props.persistentCounter || isFocused.value,
          "value": counterValue.value,
          "max": max.value,
          "disabled": props.disabled
        }, slots.counter)])]) : undefined
      });
    });
    return forwardRefs({}, vInputRef, vFieldRef, inputRef);
  }
});

const {Fragment:_Fragment$2,createElementVNode:_createElementVNode$2,mergeProps:_mergeProps$1} = await importShared('vue');
const {watch: watch$3} = await importShared('vue');
const makeVVirtualScrollItemProps = propsFactory({
  renderless: Boolean,
  ...makeComponentProps()
}, 'VVirtualScrollItem');
const VVirtualScrollItem = genericComponent()({
  name: 'VVirtualScrollItem',
  inheritAttrs: false,
  props: makeVVirtualScrollItemProps(),
  emits: {
    'update:height': height => true
  },
  setup(props, _ref) {
    let {
      attrs,
      emit,
      slots
    } = _ref;
    const {
      resizeRef,
      contentRect
    } = useResizeObserver(undefined, 'border');
    watch$3(() => contentRect.value?.height, height => {
      if (height != null) emit('update:height', height);
    });
    useRender(() => props.renderless ? _createElementVNode$2(_Fragment$2, null, [slots.default?.({
      itemRef: resizeRef
    })]) : _createElementVNode$2("div", _mergeProps$1({
      "ref": resizeRef,
      "class": ['v-virtual-scroll__item', props.class],
      "style": props.style
    }, attrs), [slots.default?.()]));
  }
});

const {computed: computed$2,nextTick: nextTick$1,onScopeDispose: onScopeDispose$1,ref: ref$1,shallowRef: shallowRef$2,watch: watch$2,watchEffect} = await importShared('vue');
const UP = -1;
const DOWN = 1;

/** Determines how large each batch of items should be */
const BUFFER_PX = 100;
const makeVirtualProps = propsFactory({
  itemHeight: {
    type: [Number, String],
    default: null
  },
  itemKey: {
    type: [String, Array, Function],
    default: null
  },
  height: [Number, String]
}, 'virtual');
function useVirtual(props, items) {
  const display = useDisplay();
  const itemHeight = shallowRef$2(0);
  watchEffect(() => {
    itemHeight.value = parseFloat(props.itemHeight || 0);
  });
  const first = shallowRef$2(0);
  const last = shallowRef$2(Math.ceil(
  // Assume 16px items filling the entire screen height if
  // not provided. This is probably incorrect but it minimises
  // the chance of ending up with empty space at the bottom.
  // The default value is set here to avoid poisoning getSize()
  (parseInt(props.height) || display.height.value) / (itemHeight.value || 16)) || 1);
  const paddingTop = shallowRef$2(0);
  const paddingBottom = shallowRef$2(0);

  /** The scrollable element */
  const containerRef = ref$1();
  /** An element marking the top of the scrollable area,
   * used to add an offset if there's padding or other elements above the virtual list */
  const markerRef = ref$1();
  /** markerRef's offsetTop, lazily evaluated */
  let markerOffset = 0;
  const {
    resizeRef,
    contentRect
  } = useResizeObserver();
  watchEffect(() => {
    resizeRef.value = containerRef.value;
  });
  const viewportHeight = computed$2(() => {
    return containerRef.value === document.documentElement ? display.height.value : contentRect.value?.height || parseInt(props.height) || 0;
  });
  /** All static elements have been rendered and we have an assumed item height */
  const hasInitialRender = computed$2(() => {
    return !!(containerRef.value && markerRef.value && viewportHeight.value && itemHeight.value);
  });
  let sizes = Array.from({
    length: items.value.length
  });
  let offsets = Array.from({
    length: items.value.length
  });
  const updateTime = shallowRef$2(0);
  let targetScrollIndex = -1;
  function getSize(index) {
    return sizes[index] || itemHeight.value;
  }
  const updateOffsets = debounce(() => {
    const start = performance.now();
    offsets[0] = 0;
    const length = items.value.length;
    for (let i = 1; i <= length; i++) {
      offsets[i] = (offsets[i - 1] || 0) + getSize(i - 1);
    }
    updateTime.value = Math.max(updateTime.value, performance.now() - start);
  }, updateTime);
  const unwatch = watch$2(hasInitialRender, v => {
    if (!v) return;
    // First render is complete, update offsets and visible
    // items in case our assumed item height was incorrect

    unwatch();
    markerOffset = markerRef.value.offsetTop;
    updateOffsets.immediate();
    calculateVisibleItems();
    if (!~targetScrollIndex) return;
    nextTick$1(() => {
      IN_BROWSER && window.requestAnimationFrame(() => {
        scrollToIndex(targetScrollIndex);
        targetScrollIndex = -1;
      });
    });
  });
  onScopeDispose$1(() => {
    updateOffsets.clear();
  });
  function handleItemResize(index, height) {
    const prevHeight = sizes[index];
    const prevMinHeight = itemHeight.value;
    itemHeight.value = prevMinHeight ? Math.min(itemHeight.value, height) : height;
    if (prevHeight !== height || prevMinHeight !== itemHeight.value) {
      sizes[index] = height;
      updateOffsets();
    }
  }
  function calculateOffset(index) {
    index = clamp(index, 0, items.value.length);
    const whole = Math.floor(index);
    const fraction = index % 1;
    const next = whole + 1;
    const wholeOffset = offsets[whole] || 0;
    const nextOffset = offsets[next] || wholeOffset;
    return wholeOffset + (nextOffset - wholeOffset) * fraction;
  }
  function calculateIndex(scrollTop) {
    return binaryClosest(offsets, scrollTop);
  }
  let lastScrollTop = 0;
  let scrollVelocity = 0;
  let lastScrollTime = 0;
  watch$2(viewportHeight, (val, oldVal) => {
    if (oldVal) {
      calculateVisibleItems();
      if (val < oldVal) {
        requestAnimationFrame(() => {
          scrollVelocity = 0;
          calculateVisibleItems();
        });
      }
    }
  });
  let scrollTimeout = -1;
  function handleScroll() {
    if (!containerRef.value || !markerRef.value) return;
    const scrollTop = containerRef.value.scrollTop;
    const scrollTime = performance.now();
    const scrollDeltaT = scrollTime - lastScrollTime;
    if (scrollDeltaT > 500) {
      scrollVelocity = Math.sign(scrollTop - lastScrollTop);

      // Not super important, only update at the
      // start of a scroll sequence to avoid reflows
      markerOffset = markerRef.value.offsetTop;
    } else {
      scrollVelocity = scrollTop - lastScrollTop;
    }
    lastScrollTop = scrollTop;
    lastScrollTime = scrollTime;
    window.clearTimeout(scrollTimeout);
    scrollTimeout = window.setTimeout(handleScrollend, 500);
    calculateVisibleItems();
  }
  function handleScrollend() {
    if (!containerRef.value || !markerRef.value) return;
    scrollVelocity = 0;
    lastScrollTime = 0;
    window.clearTimeout(scrollTimeout);
    calculateVisibleItems();
  }
  let raf = -1;
  function calculateVisibleItems() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(_calculateVisibleItems);
  }
  function _calculateVisibleItems() {
    if (!containerRef.value || !viewportHeight.value || !itemHeight.value) return;
    const scrollTop = lastScrollTop - markerOffset;
    const direction = Math.sign(scrollVelocity);
    const startPx = Math.max(0, scrollTop - BUFFER_PX);
    const start = clamp(calculateIndex(startPx), 0, items.value.length);
    const endPx = scrollTop + viewportHeight.value + BUFFER_PX;
    const end = clamp(calculateIndex(endPx) + 1, start + 1, items.value.length);
    if (
    // Only update the side we're scrolling towards,
    // the other side will be updated incidentally
    (direction !== UP || start < first.value) && (direction !== DOWN || end > last.value)) {
      const topOverflow = calculateOffset(first.value) - calculateOffset(start);
      const bottomOverflow = calculateOffset(end) - calculateOffset(last.value);
      const bufferOverflow = Math.max(topOverflow, bottomOverflow);
      if (bufferOverflow > BUFFER_PX) {
        first.value = start;
        last.value = end;
      } else {
        // Only update the side that's reached its limit if there's still buffer left
        if (start <= 0) first.value = start;
        if (end >= items.value.length) last.value = end;
      }
    }
    paddingTop.value = calculateOffset(first.value);
    paddingBottom.value = calculateOffset(items.value.length) - calculateOffset(last.value);
  }
  function scrollToIndex(index) {
    const offset = calculateOffset(index);
    if (!containerRef.value || index && !offset) {
      targetScrollIndex = index;
    } else {
      containerRef.value.scrollTop = offset;
    }
  }
  const computedItems = computed$2(() => {
    return items.value.slice(first.value, last.value).map((item, index) => {
      const _index = index + first.value;
      return {
        raw: item,
        index: _index,
        key: getPropertyFromItem(item, props.itemKey, _index)
      };
    });
  });
  watch$2(items, () => {
    sizes = Array.from({
      length: items.value.length
    });
    offsets = Array.from({
      length: items.value.length
    });
    updateOffsets.immediate();
    calculateVisibleItems();
  }, {
    deep: 1
  });
  return {
    calculateVisibleItems,
    containerRef,
    markerRef,
    computedItems,
    paddingTop,
    paddingBottom,
    scrollToIndex,
    handleScroll,
    handleScrollend,
    handleItemResize
  };
}

// https://gist.github.com/robertleeplummerjr/1cc657191d34ecd0a324
function binaryClosest(arr, val) {
  let high = arr.length - 1;
  let low = 0;
  let mid = 0;
  let item = null;
  let target = -1;
  if (arr[high] < val) {
    return high;
  }
  while (low <= high) {
    mid = low + high >> 1;
    item = arr[mid];
    if (item > val) {
      high = mid - 1;
    } else if (item < val) {
      target = mid;
      low = mid + 1;
    } else if (item === val) {
      return mid;
    } else {
      return low;
    }
  }
  return target;
}

const {createVNode:_createVNode$1,Fragment:_Fragment$1,createElementVNode:_createElementVNode$1,normalizeClass:_normalizeClass,normalizeStyle:_normalizeStyle} = await importShared('vue');
const {onMounted,onScopeDispose,toRef: toRef$1} = await importShared('vue');
const makeVVirtualScrollProps = propsFactory({
  items: {
    type: Array,
    default: () => []
  },
  renderless: Boolean,
  ...makeVirtualProps(),
  ...makeComponentProps(),
  ...makeDimensionProps()
}, 'VVirtualScroll');
const VVirtualScroll = genericComponent()({
  name: 'VVirtualScroll',
  props: makeVVirtualScrollProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const vm = getCurrentInstance('VVirtualScroll');
    const {
      dimensionStyles
    } = useDimension(props);
    const {
      calculateVisibleItems,
      containerRef,
      markerRef,
      handleScroll,
      handleScrollend,
      handleItemResize,
      scrollToIndex,
      paddingTop,
      paddingBottom,
      computedItems
    } = useVirtual(props, toRef$1(() => props.items));
    useToggleScope(() => props.renderless, () => {
      function handleListeners() {
        let add = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        const method = add ? 'addEventListener' : 'removeEventListener';
        if (containerRef.value === document.documentElement) {
          document[method]('scroll', handleScroll, {
            passive: true
          });
          document[method]('scrollend', handleScrollend);
        } else {
          containerRef.value?.[method]('scroll', handleScroll, {
            passive: true
          });
          containerRef.value?.[method]('scrollend', handleScrollend);
        }
      }
      onMounted(() => {
        containerRef.value = getScrollParent(vm.vnode.el, true);
        handleListeners(true);
      });
      onScopeDispose(handleListeners);
    });
    useRender(() => {
      const children = computedItems.value.map(item => _createVNode$1(VVirtualScrollItem, {
        "key": item.key,
        "renderless": props.renderless,
        "onUpdate:height": height => handleItemResize(item.index, height)
      }, {
        default: slotProps => slots.default?.({
          item: item.raw,
          index: item.index,
          ...slotProps
        })
      }));
      return props.renderless ? _createElementVNode$1(_Fragment$1, null, [_createElementVNode$1("div", {
        "ref": markerRef,
        "class": "v-virtual-scroll__spacer",
        "style": {
          paddingTop: convertToUnit(paddingTop.value)
        }
      }, null), children, _createElementVNode$1("div", {
        "class": "v-virtual-scroll__spacer",
        "style": {
          paddingBottom: convertToUnit(paddingBottom.value)
        }
      }, null)]) : _createElementVNode$1("div", {
        "ref": containerRef,
        "class": _normalizeClass(['v-virtual-scroll', props.class]),
        "onScrollPassive": handleScroll,
        "onScrollend": handleScrollend,
        "style": _normalizeStyle([dimensionStyles.value, props.style])
      }, [_createElementVNode$1("div", {
        "ref": markerRef,
        "class": "v-virtual-scroll__container",
        "style": {
          paddingTop: convertToUnit(paddingTop.value),
          paddingBottom: convertToUnit(paddingBottom.value)
        }
      }, [children])]);
    });
    return {
      calculateVisibleItems,
      scrollToIndex
    };
  }
});

// Utilities
const {shallowRef: shallowRef$1,watch: watch$1} = await importShared('vue');


// Types

function useScrolling(listRef, textFieldRef) {
  const isScrolling = shallowRef$1(false);
  let scrollTimeout;
  function onListScroll(e) {
    cancelAnimationFrame(scrollTimeout);
    isScrolling.value = true;
    scrollTimeout = requestAnimationFrame(() => {
      scrollTimeout = requestAnimationFrame(() => {
        isScrolling.value = false;
      });
    });
  }
  async function finishScrolling() {
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => {
      if (isScrolling.value) {
        const stop = watch$1(isScrolling, () => {
          stop();
          resolve();
        });
      } else resolve();
    });
  }
  async function onListKeydown(e) {
    if (e.key === 'Tab') {
      textFieldRef.value?.focus();
    }
    if (!['PageDown', 'PageUp', 'Home', 'End'].includes(e.key)) return;
    const el = listRef.value?.$el;
    if (!el) return;
    if (e.key === 'Home' || e.key === 'End') {
      el.scrollTo({
        top: e.key === 'Home' ? 0 : el.scrollHeight,
        behavior: 'smooth'
      });
    }
    await finishScrolling();
    const children = el.querySelectorAll(':scope > :not(.v-virtual-scroll__spacer)');
    if (e.key === 'PageDown' || e.key === 'Home') {
      const top = el.getBoundingClientRect().top;
      for (const child of children) {
        if (child.getBoundingClientRect().top >= top) {
          child.focus();
          break;
        }
      }
    } else {
      const bottom = el.getBoundingClientRect().bottom;
      for (const child of [...children].reverse()) {
        if (child.getBoundingClientRect().bottom <= bottom) {
          child.focus();
          break;
        }
      }
    }
  }
  return {
    onScrollPassive: onListScroll,
    onKeydown: onListKeydown
  }; // typescript doesn't know about vue's event merging
}

// Utilities
const {computed: computed$1,toRef,toValue,useId} = await importShared('vue');
// Composables
const makeMenuActivatorProps = propsFactory({
  closeText: {
    type: String,
    default: '$vuetify.close'
  },
  openText: {
    type: String,
    default: '$vuetify.open'
  }
}, 'autocomplete');
function useMenuActivator(props, isOpen) {
  const {
    t
  } = useLocale();
  const uid = useId();
  const menuId = computed$1(() => `menu-${uid}`);
  const ariaExpanded = toRef(() => toValue(isOpen));
  const ariaControls = toRef(() => menuId.value);
  const ariaLabel = toRef(() => t(toValue(isOpen) ? props.closeText : props.openText));
  return {
    menuId,
    ariaExpanded,
    ariaControls,
    ariaLabel
  };
}

const {Fragment:_Fragment,createVNode:_createVNode,mergeProps:_mergeProps,createElementVNode:_createElementVNode,createTextVNode:_createTextVNode} = await importShared('vue');
const {computed,mergeProps,nextTick,ref,shallowRef,watch} = await importShared('vue');
const makeSelectProps = propsFactory({
  chips: Boolean,
  closableChips: Boolean,
  eager: Boolean,
  hideNoData: Boolean,
  hideSelected: Boolean,
  listProps: {
    type: Object
  },
  menu: Boolean,
  menuIcon: {
    type: IconValue,
    default: '$dropdown'
  },
  menuProps: {
    type: Object
  },
  multiple: Boolean,
  noDataText: {
    type: String,
    default: '$vuetify.noDataText'
  },
  openOnClear: Boolean,
  itemColor: String,
  noAutoScroll: Boolean,
  ...makeMenuActivatorProps(),
  ...makeItemsProps({
    itemChildren: false
  })
}, 'Select');
const makeVSelectProps = propsFactory({
  ...makeSelectProps(),
  ...omit(makeVTextFieldProps({
    modelValue: null,
    role: 'combobox'
  }), ['validationValue', 'dirty', 'appendInnerIcon']),
  ...makeTransitionProps$1({
    transition: {
      component: VDialogTransition
    }
  })
}, 'VSelect');
const VSelect = genericComponent()({
  name: 'VSelect',
  props: makeVSelectProps(),
  emits: {
    'update:focused': focused => true,
    'update:modelValue': value => true,
    'update:menu': ue => true
  },
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      t
    } = useLocale();
    const vTextFieldRef = ref();
    const vMenuRef = ref();
    const vVirtualScrollRef = ref();
    const {
      items,
      transformIn,
      transformOut
    } = useItems(props);
    const model = useProxiedModel(props, 'modelValue', [], v => transformIn(v === null ? [null] : wrapInArray(v)), v => {
      const transformed = transformOut(v);
      return props.multiple ? transformed : transformed[0] ?? null;
    });
    const counterValue = computed(() => {
      return typeof props.counterValue === 'function' ? props.counterValue(model.value) : typeof props.counterValue === 'number' ? props.counterValue : model.value.length;
    });
    const form = useForm(props);
    const selectedValues = computed(() => model.value.map(selection => selection.value));
    const isFocused = shallowRef(false);
    let keyboardLookupPrefix = '';
    let keyboardLookupIndex = -1;
    let keyboardLookupLastTime;
    const displayItems = computed(() => {
      if (props.hideSelected) {
        return items.value.filter(item => !model.value.some(s => (props.valueComparator || deepEqual)(s, item)));
      }
      return items.value;
    });
    const menuDisabled = computed(() => props.hideNoData && !displayItems.value.length || form.isReadonly.value || form.isDisabled.value);
    const _menu = useProxiedModel(props, 'menu');
    const menu = computed({
      get: () => _menu.value,
      set: v => {
        if (_menu.value && !v && vMenuRef.value?.ΨopenChildren.size) return;
        if (v && menuDisabled.value) return;
        _menu.value = v;
      }
    });
    const {
      menuId,
      ariaExpanded,
      ariaControls,
      ariaLabel
    } = useMenuActivator(props, menu);
    const computedMenuProps = computed(() => {
      return {
        ...props.menuProps,
        activatorProps: {
          ...(props.menuProps?.activatorProps || {}),
          'aria-haspopup': 'listbox' // Set aria-haspopup to 'listbox'
        }
      };
    });
    const listRef = ref();
    const listEvents = useScrolling(listRef, vTextFieldRef);
    function onClear(e) {
      if (props.openOnClear) {
        menu.value = true;
      }
    }
    function onMousedownControl() {
      if (menuDisabled.value) return;
      menu.value = !menu.value;
    }
    function onListKeydown(e) {
      if (checkPrintable(e)) {
        onKeydown(e);
      }
    }
    function onKeydown(e) {
      if (!e.key || form.isReadonly.value) return;
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
      }
      if (['Enter', 'ArrowDown', ' '].includes(e.key)) {
        menu.value = true;
      }
      if (['Escape', 'Tab'].includes(e.key)) {
        menu.value = false;
      }
      if (e.key === 'Home') {
        listRef.value?.focus('first');
      } else if (e.key === 'End') {
        listRef.value?.focus('last');
      }

      // html select hotkeys
      const KEYBOARD_LOOKUP_THRESHOLD = 1000; // milliseconds

      if (!checkPrintable(e)) return;
      const now = performance.now();
      if (now - keyboardLookupLastTime > KEYBOARD_LOOKUP_THRESHOLD) {
        keyboardLookupPrefix = '';
        keyboardLookupIndex = -1;
      }
      keyboardLookupPrefix += e.key.toLowerCase();
      keyboardLookupLastTime = now;
      const items = displayItems.value;
      function findItem() {
        let result = findItemBase();
        if (result) return result;
        if (keyboardLookupPrefix.at(-1) === keyboardLookupPrefix.at(-2)) {
          // No matches but we have a repeated letter, try the next item with that prefix
          keyboardLookupPrefix = keyboardLookupPrefix.slice(0, -1);
          result = findItemBase();
          if (result) return result;
        }

        // Still nothing, wrap around to the top
        keyboardLookupIndex = -1;
        result = findItemBase();
        if (result) return result;

        // Still nothing, try just the new letter
        keyboardLookupPrefix = e.key.toLowerCase();
        return findItemBase();
      }
      function findItemBase() {
        for (let i = keyboardLookupIndex + 1; i < items.length; i++) {
          const _item = items[i];
          if (_item.title.toLowerCase().startsWith(keyboardLookupPrefix)) {
            return [_item, i];
          }
        }
        return undefined;
      }
      const result = findItem();
      if (!result) return;
      const [item, index] = result;
      keyboardLookupIndex = index;
      listRef.value?.focus(index);
      if (!props.multiple) {
        model.value = [item];
      }
    }

    /** @param set - null means toggle */
    function select(item) {
      let set = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      if (item.props.disabled) return;
      if (props.multiple) {
        const index = model.value.findIndex(selection => (props.valueComparator || deepEqual)(selection.value, item.value));
        const add = set == null ? !~index : set;
        if (~index) {
          const value = add ? [...model.value, item] : [...model.value];
          value.splice(index, 1);
          model.value = value;
        } else if (add) {
          model.value = [...model.value, item];
        }
      } else {
        const add = set !== false;
        model.value = add ? [item] : [];
        nextTick(() => {
          menu.value = false;
        });
      }
    }
    function onBlur(e) {
      if (!listRef.value?.$el.contains(e.relatedTarget)) {
        menu.value = false;
      }
    }
    function onAfterEnter() {
      if (props.eager) {
        vVirtualScrollRef.value?.calculateVisibleItems();
      }
    }
    function onAfterLeave() {
      if (isFocused.value) {
        vTextFieldRef.value?.focus();
      }
    }
    function onFocusin(e) {
      isFocused.value = true;
    }
    function onModelUpdate(v) {
      if (v == null) model.value = [];else if (matchesSelector(vTextFieldRef.value, ':autofill') || matchesSelector(vTextFieldRef.value, ':-webkit-autofill')) {
        const item = items.value.find(item => item.title === v);
        if (item) {
          select(item);
        }
      } else if (vTextFieldRef.value) {
        vTextFieldRef.value.value = '';
      }
    }
    watch(menu, () => {
      if (!props.hideSelected && menu.value && model.value.length) {
        const index = displayItems.value.findIndex(item => model.value.some(s => (props.valueComparator || deepEqual)(s.value, item.value)));
        IN_BROWSER && !props.noAutoScroll && window.requestAnimationFrame(() => {
          index >= 0 && vVirtualScrollRef.value?.scrollToIndex(index);
        });
      }
    });
    watch(items, (newVal, oldVal) => {
      if (menu.value) return;
      if (isFocused.value && props.hideNoData && !oldVal.length && newVal.length) {
        menu.value = true;
      }
    });
    useRender(() => {
      const hasChips = !!(props.chips || slots.chip);
      const hasList = !!(!props.hideNoData || displayItems.value.length || slots['prepend-item'] || slots['append-item'] || slots['no-data']);
      const isDirty = model.value.length > 0;
      const textFieldProps = VTextField.filterProps(props);
      const placeholder = isDirty || !isFocused.value && props.label && !props.persistentPlaceholder ? undefined : props.placeholder;
      return _createVNode(VTextField, _mergeProps({
        "ref": vTextFieldRef
      }, textFieldProps, {
        "modelValue": model.value.map(v => v.props.value).join(', '),
        "onUpdate:modelValue": onModelUpdate,
        "focused": isFocused.value,
        "onUpdate:focused": $event => isFocused.value = $event,
        "validationValue": model.externalValue,
        "counterValue": counterValue.value,
        "dirty": isDirty,
        "class": ['v-select', {
          'v-select--active-menu': menu.value,
          'v-select--chips': !!props.chips,
          [`v-select--${props.multiple ? 'multiple' : 'single'}`]: true,
          'v-select--selected': model.value.length,
          'v-select--selection-slot': !!slots.selection
        }, props.class],
        "style": props.style,
        "inputmode": "none",
        "placeholder": placeholder,
        "onClick:clear": onClear,
        "onMousedown:control": onMousedownControl,
        "onBlur": onBlur,
        "onKeydown": onKeydown,
        "aria-expanded": ariaExpanded.value,
        "aria-controls": ariaControls.value,
        "aria-label": ariaLabel.value,
        "title": ariaLabel.value
      }), {
        ...slots,
        default: () => _createElementVNode(_Fragment, null, [_createVNode(VMenu, _mergeProps({
          "id": menuId.value,
          "ref": vMenuRef,
          "modelValue": menu.value,
          "onUpdate:modelValue": $event => menu.value = $event,
          "activator": "parent",
          "contentClass": "v-select__content",
          "disabled": menuDisabled.value,
          "eager": props.eager,
          "maxHeight": 310,
          "openOnClick": false,
          "closeOnContentClick": false,
          "transition": props.transition,
          "onAfterEnter": onAfterEnter,
          "onAfterLeave": onAfterLeave
        }, computedMenuProps.value), {
          default: () => [hasList && _createVNode(VList, _mergeProps({
            "ref": listRef,
            "selected": selectedValues.value,
            "selectStrategy": props.multiple ? 'independent' : 'single-independent',
            "onMousedown": e => e.preventDefault(),
            "onKeydown": onListKeydown,
            "onFocusin": onFocusin,
            "tabindex": "-1",
            "selectable": true,
            "aria-live": "polite",
            "aria-label": `${props.label}-list`,
            "color": props.itemColor ?? props.color
          }, listEvents, props.listProps), {
            default: () => [slots['prepend-item']?.(), !displayItems.value.length && !props.hideNoData && (slots['no-data']?.() ?? _createVNode(VListItem, {
              "key": "no-data",
              "title": t(props.noDataText)
            }, null)), _createVNode(VVirtualScroll, {
              "ref": vVirtualScrollRef,
              "renderless": true,
              "items": displayItems.value,
              "itemKey": "value"
            }, {
              default: _ref2 => {
                let {
                  item,
                  index,
                  itemRef
                } = _ref2;
                const camelizedProps = camelizeProps(item.props);
                const itemProps = mergeProps(item.props, {
                  ref: itemRef,
                  key: item.value,
                  onClick: () => select(item, null)
                });
                if (item.type === 'divider') {
                  return slots.divider?.({
                    props: item.raw,
                    index
                  }) ?? _createVNode(VDivider, _mergeProps(item.props, {
                    "key": `divider-${index}`
                  }), null);
                }
                if (item.type === 'subheader') {
                  return slots.subheader?.({
                    props: item.raw,
                    index
                  }) ?? _createVNode(VListSubheader, _mergeProps(item.props, {
                    "key": `subheader-${index}`
                  }), null);
                }
                return slots.item?.({
                  item,
                  index,
                  props: itemProps
                }) ?? _createVNode(VListItem, _mergeProps(itemProps, {
                  "role": "option"
                }), {
                  prepend: _ref3 => {
                    let {
                      isSelected
                    } = _ref3;
                    return _createElementVNode(_Fragment, null, [props.multiple && !props.hideSelected ? _createVNode(VCheckboxBtn, {
                      "key": item.value,
                      "modelValue": isSelected,
                      "ripple": false,
                      "tabindex": "-1",
                      "onClick": event => event.preventDefault()
                    }, null) : undefined, camelizedProps.prependAvatar && _createVNode(VAvatar, {
                      "image": camelizedProps.prependAvatar
                    }, null), camelizedProps.prependIcon && _createVNode(VIcon, {
                      "icon": camelizedProps.prependIcon
                    }, null)]);
                  }
                });
              }
            }), slots['append-item']?.()]
          })]
        }), model.value.map((item, index) => {
          function onChipClose(e) {
            e.stopPropagation();
            e.preventDefault();
            select(item, false);
          }
          const slotProps = {
            'onClick:close': onChipClose,
            onKeydown(e) {
              if (e.key !== 'Enter' && e.key !== ' ') return;
              e.preventDefault();
              e.stopPropagation();
              onChipClose(e);
            },
            onMousedown(e) {
              e.preventDefault();
              e.stopPropagation();
            },
            modelValue: true,
            'onUpdate:modelValue': undefined
          };
          const hasSlot = hasChips ? !!slots.chip : !!slots.selection;
          const slotContent = hasSlot ? ensureValidVNode(hasChips ? slots.chip({
            item,
            index,
            props: slotProps
          }) : slots.selection({
            item,
            index
          })) : undefined;
          if (hasSlot && !slotContent) return undefined;
          return _createElementVNode("div", {
            "key": item.value,
            "class": "v-select__selection"
          }, [hasChips ? !slots.chip ? _createVNode(VChip, _mergeProps({
            "key": "chip",
            "closable": props.closableChips,
            "size": "small",
            "text": item.title,
            "disabled": item.props.disabled
          }, slotProps), null) : _createVNode(VDefaultsProvider, {
            "key": "chip-defaults",
            "defaults": {
              VChip: {
                closable: props.closableChips,
                size: 'small',
                text: item.title
              }
            }
          }, {
            default: () => [slotContent]
          }) : slotContent ?? _createElementVNode("span", {
            "class": "v-select__selection-text"
          }, [item.title, props.multiple && index < model.value.length - 1 && _createElementVNode("span", {
            "class": "v-select__selection-comma"
          }, [_createTextVNode(",")])])]);
        })]),
        'append-inner': function () {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          return _createElementVNode(_Fragment, null, [slots['append-inner']?.(...args), props.menuIcon ? _createVNode(VIcon, {
            "class": "v-select__menu-icon",
            "color": vTextFieldRef.value?.fieldIconColor,
            "icon": props.menuIcon
          }, null) : undefined]);
        }
      });
    });
    return forwardRefs({
      isFocused,
      menu,
      select
    }, vTextFieldRef);
  }
});

export { useResizeObserver as A, VBtn as B, makeVariantProps as C, makeSizeProps as D, makeRoundedProps as E, makeElevationProps as F, makeDensityProps as G, makeBorderProps as H, deepEqual as I, makeLoaderProps as J, useBackgroundColor as K, LoaderSlot as L, VChip as M, VCheckboxBtn as N, useDensity as O, VDivider as P, VInput as V, makeComponentProps as a, useLoader as b, createForm as c, useFocus as d, makeVSelectionControlProps as e, forwardRefs as f, makeVInputProps as g, VSelectionControl as h, VDefaultsProvider as i, VScaleTransition as j, VIcon as k, VProgressCircular as l, makeFormProps as m, VCard as n, VCardTitle as o, VCardText as p, VRow as q, VCol as r, VTextField as s, VSelect as t, useRender as u, VAlert as v, useDimension as w, makeTagProps as x, makeDimensionProps as y, createSimpleFunctional as z };
