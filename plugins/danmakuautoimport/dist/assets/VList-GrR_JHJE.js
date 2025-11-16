import { importShared } from './__federation_fn_import-9Z7hiN6o.js';
import { ab as includes, w as propsFactory, y as genericComponent, ac as isPrimitive, R as getCurrentInstance, a0 as templateRef, I as IN_BROWSER, Q as getCurrentInstanceName, W as destructComputed, ad as isCssColor, ae as isParsableColor, af as parseColor, ag as getForeground, C as makeThemeProps, V as provideTheme, H as provideDefaults, x as useProxiedModel, K as wrapInArray, c as consoleWarn, ah as findChildrenWithProvide, Z as convertToUnit, s as useTheme, ai as useIcon, F as IconValue, aj as flattenFragments, ak as SUPPORTS_INTERSECTION, _ as clamp, P as PREFERS_REDUCED_MOTION, r as useRtl, S as useToggleScope, al as hasEvent, i as isObject, am as onlyDefinedProps, an as breakpoints, ao as makeDisplayProps, o as useDisplay, q as useGoTo, a2 as focusableChildren, u as useLocale, E as EventProp, Y as consoleError, j as defineComponent, ap as deprecate, U as pick, a6 as getPropertyFromItem, N as omit, a3 as focusChild } from './theme-BcIEhh1k.js';

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
const {onBeforeUnmount: onBeforeUnmount$3,readonly: readonly$1,ref: ref$6,watch: watch$9} = await importShared('vue');
function useResizeObserver(callback) {
  let box = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'content';
  const resizeRef = templateRef();
  const contentRect = ref$6();
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
    onBeforeUnmount$3(() => {
      observer.disconnect();
    });
    watch$9(() => resizeRef.el, (newValue, oldValue) => {
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
    contentRect: readonly$1(contentRect)
  };
}

const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

// Utilities
const {computed: computed$l} = await importShared('vue');
// Composables
const makeBorderProps = propsFactory({
  border: [Boolean, Number, String]
}, 'border');
function useBorder(props) {
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getCurrentInstanceName();
  const borderClasses = computed$l(() => {
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
const {toRef: toRef$h} = await importShared('vue');
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
  const densityClasses = toRef$h(() => {
    return `${name}--density-${props.density}`;
  });
  return {
    densityClasses
  };
}

// Utilities
const {isRef: isRef$1,toRef: toRef$g} = await importShared('vue');
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
  const elevationClasses = toRef$g(() => {
    const elevation = isRef$1(props) ? props.value : props.elevation;
    if (elevation == null) return [];
    return [`elevation-${elevation}`];
  });
  return {
    elevationClasses
  };
}

// Utilities
const {computed: computed$k,isRef} = await importShared('vue');
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
  const roundedClasses = computed$k(() => {
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
const {toValue: toValue$3} = await importShared('vue');
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
    text: toValue$3(color)
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
    background: toValue$3(color)
  }));
  return {
    backgroundColorClasses,
    backgroundColorStyles
  };
}
function computeColor(colors) {
  const _colors = toValue$3(colors);
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

const {Fragment:_Fragment$4,normalizeClass:_normalizeClass$i,createElementVNode:_createElementVNode$e} = await importShared('vue');
const {toRef: toRef$f,toValue: toValue$2} = await importShared('vue');
const allowedVariants = ['elevated', 'flat', 'tonal', 'outlined', 'text', 'plain'];
function genOverlays(isClickable, name) {
  return _createElementVNode$e(_Fragment$4, null, [isClickable && _createElementVNode$e("span", {
    "key": "overlay",
    "class": _normalizeClass$i(`${name}__overlay`)
  }, null), _createElementVNode$e("span", {
    "key": "underlay",
    "class": _normalizeClass$i(`${name}__underlay`)
  }, null)]);
}
const makeVariantProps = propsFactory({
  color: String,
  variant: {
    type: String,
    default: 'elevated',
    validator: v => allowedVariants.includes(v)
  }
}, 'variant');
function useVariant(props) {
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getCurrentInstanceName();
  const variantClasses = toRef$f(() => {
    const {
      variant
    } = toValue$2(props);
    return `${name}--variant-${variant}`;
  });
  const {
    colorClasses,
    colorStyles
  } = useColor(() => {
    const {
      variant,
      color
    } = toValue$2(props);
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

const {normalizeClass:_normalizeClass$h,normalizeStyle:_normalizeStyle$f,createVNode:_createVNode$m} = await importShared('vue');
const {toRef: toRef$e} = await importShared('vue');
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
        height: toRef$e(() => props.direction === 'horizontal' ? 'auto' : null),
        baseColor: toRef$e(() => props.baseColor),
        color: toRef$e(() => props.color),
        density: toRef$e(() => props.density),
        flat: true,
        variant: toRef$e(() => props.variant)
      }
    });
    useRender(() => {
      return _createVNode$m(props.tag, {
        "class": _normalizeClass$h(['v-btn-group', `v-btn-group--${props.direction}`, {
          'v-btn-group--divided': props.divided
        }, themeClasses.value, borderClasses.value, densityClasses.value, elevationClasses.value, roundedClasses.value, props.class]),
        "style": _normalizeStyle$f(props.style)
      }, slots);
    });
  }
});

const {computed: computed$j,inject: inject$2,onBeforeUnmount: onBeforeUnmount$2,onMounted: onMounted$1,onUpdated,provide: provide$2,reactive: reactive$1,toRef: toRef$d,unref,useId,watch: watch$8} = await importShared('vue');
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
  const id = useId();
  provide$2(Symbol.for(`${injectKey.description}:id`), id);
  const group = inject$2(injectKey, null);
  if (!group) {
    if (!required) return group;
    throw new Error(`[Vuetify] Could not find useGroup injection with symbol ${injectKey.description}`);
  }
  const value = toRef$d(() => props.value);
  const disabled = computed$j(() => !!(group.disabled.value || props.disabled));
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
  onBeforeUnmount$2(() => unregister());
  const isSelected = computed$j(() => {
    return group.isSelected(id);
  });
  const isFirst = computed$j(() => {
    return group.items.value[0].id === id;
  });
  const isLast = computed$j(() => {
    return group.items.value[group.items.value.length - 1].id === id;
  });
  const selectedClass = computed$j(() => isSelected.value && [group.selectedClass.value, props.selectedClass]);
  watch$8(isSelected, value => {
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
  const items = reactive$1([]);
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
    if (unref(unwrapped.value) === undefined) {
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
  onMounted$1(() => {
    forceMandatoryValue();
  });
  onBeforeUnmount$2(() => {
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
    disabled: toRef$d(() => props.disabled),
    prev: () => step(items.length - 1),
    next: () => step(1),
    isSelected: id => selected.value.includes(id),
    selectedClass: toRef$d(() => props.selectedClass),
    items: toRef$d(() => items),
    getItemIndex: value => getItemIndex(items, value)
  };
  provide$2(injectKey, state);
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

const {mergeProps:_mergeProps$7,createVNode:_createVNode$l} = await importShared('vue');
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
      return _createVNode$l(VBtnGroup, _mergeProps$7({
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

const {normalizeClass:_normalizeClass$g,normalizeStyle:_normalizeStyle$e,createVNode:_createVNode$k} = await importShared('vue');
const {shallowRef: shallowRef$a,Text} = await importShared('vue');
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
    const slotIcon = shallowRef$a();
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
      return _createVNode$k(iconData.value.component, {
        "tag": props.tag,
        "icon": iconData.value.icon,
        "class": _normalizeClass$g(['v-icon', 'notranslate', themeClasses.value, sizeClasses.value, textColorClasses.value, {
          'v-icon--clickable': hasClick,
          'v-icon--disabled': props.disabled,
          'v-icon--start': props.start,
          'v-icon--end': props.end
        }, props.class]),
        "style": _normalizeStyle$e([{
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
const {onScopeDispose: onScopeDispose$1,ref: ref$5,shallowRef: shallowRef$9,watch: watch$7} = await importShared('vue');
function useIntersectionObserver(callback, options) {
  const intersectionRef = ref$5();
  const isIntersecting = shallowRef$9(false);
  if (SUPPORTS_INTERSECTION) {
    const observer = new IntersectionObserver(entries => {
      isIntersecting.value = !!entries.find(entry => entry.isIntersecting);
    }, options);
    onScopeDispose$1(() => {
      observer.disconnect();
    });
    watch$7(intersectionRef, (newValue, oldValue) => {
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

const {normalizeClass:_normalizeClass$f,normalizeStyle:_normalizeStyle$d,createElementVNode:_createElementVNode$d,createVNode:_createVNode$j} = await importShared('vue');
const {ref: ref$4,toRef: toRef$c,watchEffect: watchEffect$2} = await importShared('vue');
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
    const root = ref$4();
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
    const normalizedValue = toRef$c(() => clamp(parseFloat(props.modelValue), 0, 100));
    const width = toRef$c(() => Number(props.width));
    const size = toRef$c(() => {
      // Get size from element if size prop value is small, large etc
      return sizeStyles.value ? Number(props.size) : contentRect.value ? contentRect.value.width : Math.max(width.value, 32);
    });
    const diameter = toRef$c(() => MAGIC_RADIUS_CONSTANT / (1 - width.value / size.value) * 2);
    const strokeWidth = toRef$c(() => width.value / size.value * diameter.value);
    const strokeDashOffset = toRef$c(() => convertToUnit((100 - normalizedValue.value) / 100 * CIRCUMFERENCE));
    watchEffect$2(() => {
      intersectionRef.value = root.value;
      resizeRef.value = root.value;
    });
    useRender(() => _createVNode$j(props.tag, {
      "ref": root,
      "class": _normalizeClass$f(['v-progress-circular', {
        'v-progress-circular--indeterminate': !!props.indeterminate,
        'v-progress-circular--visible': isIntersecting.value,
        'v-progress-circular--disable-shrink': props.indeterminate && (props.indeterminate === 'disable-shrink' || PREFERS_REDUCED_MOTION())
      }, themeClasses.value, sizeClasses.value, textColorClasses.value, props.class]),
      "style": _normalizeStyle$d([sizeStyles.value, textColorStyles.value, props.style]),
      "role": "progressbar",
      "aria-valuemin": "0",
      "aria-valuemax": "100",
      "aria-valuenow": props.indeterminate ? undefined : normalizedValue.value
    }, {
      default: () => [_createElementVNode$d("svg", {
        "style": {
          transform: `rotate(calc(-90deg + ${Number(props.rotate)}deg))`
        },
        "xmlns": "http://www.w3.org/2000/svg",
        "viewBox": `0 0 ${diameter.value} ${diameter.value}`
      }, [_createElementVNode$d("circle", {
        "class": _normalizeClass$f(['v-progress-circular__underlay', underlayColorClasses.value]),
        "style": _normalizeStyle$d(underlayColorStyles.value),
        "fill": "transparent",
        "cx": "50%",
        "cy": "50%",
        "r": MAGIC_RADIUS_CONSTANT,
        "stroke-width": strokeWidth.value,
        "stroke-dasharray": CIRCUMFERENCE,
        "stroke-dashoffset": 0
      }, null), _createElementVNode$d("circle", {
        "class": "v-progress-circular__overlay",
        "fill": "transparent",
        "cx": "50%",
        "cy": "50%",
        "r": MAGIC_RADIUS_CONSTANT,
        "stroke-width": strokeWidth.value,
        "stroke-dasharray": CIRCUMFERENCE,
        "stroke-dashoffset": strokeDashOffset.value
      }, null)]), slots.default && _createElementVNode$d("div", {
        "class": "v-progress-circular__content"
      }, [slots.default({
        value: normalizedValue.value
      })])]
    }));
    return {};
  }
});

// Utilities
const {computed: computed$i} = await importShared('vue');
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
  const dimensionStyles = computed$i(() => {
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

const {computed: computed$h} = await importShared('vue');
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
  const locationStyles = computed$h(() => {
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
const {computed: computed$g,toRef: toRef$b,toValue: toValue$1} = await importShared('vue');
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
  const hasChunks = toRef$b(() => !!props.chunkCount || !!props.chunkWidth);
  const chunkWidth = computed$g(() => {
    const containerSize = toValue$1(containerWidth);
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
  const chunkGap = toRef$b(() => Number(props.chunkGap));
  const chunksMaskStyles = computed$g(() => {
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
    const containerSize = toValue$1(containerWidth);
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

const {normalizeClass:_normalizeClass$e,createElementVNode:_createElementVNode$c,normalizeStyle:_normalizeStyle$c,createVNode:_createVNode$i} = await importShared('vue');
const {computed: computed$f,ref: ref$3,shallowRef: shallowRef$8,Transition: Transition$2,watchEffect: watchEffect$1} = await importShared('vue');
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
    const root = ref$3();
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
    const max = computed$f(() => parseFloat(props.max));
    const height = computed$f(() => parseFloat(props.height));
    const normalizedBuffer = computed$f(() => clamp(parseFloat(props.bufferValue) / max.value * 100, 0, 100));
    const normalizedValue = computed$f(() => clamp(parseFloat(progress.value) / max.value * 100, 0, 100));
    const isReversed = computed$f(() => isRtl.value !== props.reverse);
    const transition = computed$f(() => props.indeterminate ? 'fade-transition' : 'slide-x-transition');
    const containerWidth = shallowRef$8(0);
    const {
      hasChunks,
      chunksMaskStyles,
      snapValueToChunk
    } = useChunks(props, containerWidth);
    useToggleScope(hasChunks, () => {
      const {
        resizeRef
      } = useResizeObserver(entries => containerWidth.value = entries[0].contentRect.width);
      watchEffect$1(() => resizeRef.value = root.value);
    });
    const bufferWidth = computed$f(() => {
      return hasChunks.value ? snapValueToChunk(normalizedBuffer.value) : normalizedBuffer.value;
    });
    const barWidth = computed$f(() => {
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
    watchEffect$1(() => {
      intersectionRef.value = root.value;
    });
    useRender(() => _createVNode$i(props.tag, {
      "ref": root,
      "class": _normalizeClass$e(['v-progress-linear', {
        'v-progress-linear--absolute': props.absolute,
        'v-progress-linear--active': props.active && isIntersecting.value,
        'v-progress-linear--reverse': isReversed.value,
        'v-progress-linear--rounded': props.rounded,
        'v-progress-linear--rounded-bar': props.roundedBar,
        'v-progress-linear--striped': props.striped,
        'v-progress-linear--clickable': props.clickable
      }, roundedClasses.value, themeClasses.value, rtlClasses.value, props.class]),
      "style": _normalizeStyle$c([{
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
      default: () => [props.stream && _createElementVNode$c("div", {
        "key": "stream",
        "class": _normalizeClass$e(['v-progress-linear__stream', textColorClasses.value]),
        "style": {
          ...textColorStyles.value,
          [isReversed.value ? 'left' : 'right']: convertToUnit(-height.value),
          borderTop: `${convertToUnit(height.value / 2)} dotted`,
          opacity: parseFloat(props.bufferOpacity),
          top: `calc(50% - ${convertToUnit(height.value / 4)})`,
          width: convertToUnit(100 - normalizedBuffer.value, '%'),
          '--v-progress-linear-stream-to': convertToUnit(height.value * (isReversed.value ? 1 : -1))
        }
      }, null), _createElementVNode$c("div", {
        "class": _normalizeClass$e(['v-progress-linear__background', backgroundColorClasses.value]),
        "style": _normalizeStyle$c([backgroundColorStyles.value, {
          opacity: parseFloat(props.bgOpacity),
          width: props.stream ? 0 : undefined
        }])
      }, null), _createElementVNode$c("div", {
        "class": _normalizeClass$e(['v-progress-linear__buffer', bufferColorClasses.value]),
        "style": _normalizeStyle$c([bufferColorStyles.value, {
          opacity: parseFloat(props.bufferOpacity),
          width: convertToUnit(bufferWidth.value, '%')
        }])
      }, null), _createVNode$i(Transition$2, {
        "name": transition.value
      }, {
        default: () => [!props.indeterminate ? _createElementVNode$c("div", {
          "class": _normalizeClass$e(['v-progress-linear__determinate', barColorClasses.value]),
          "style": _normalizeStyle$c([barColorStyles.value, {
            width: convertToUnit(barWidth.value, '%')
          }])
        }, null) : _createElementVNode$c("div", {
          "class": "v-progress-linear__indeterminate"
        }, [['long', 'short'].map(bar => _createElementVNode$c("div", {
          "key": bar,
          "class": _normalizeClass$e(['v-progress-linear__indeterminate', bar, barColorClasses.value]),
          "style": _normalizeStyle$c(barColorStyles.value)
        }, null))])]
      }), slots.default && _createElementVNode$c("div", {
        "class": "v-progress-linear__content"
      }, [slots.default({
        value: normalizedValue.value,
        buffer: normalizedBuffer.value
      })])]
    }));
    return {};
  }
});

const {createVNode:_createVNode$h,normalizeClass:_normalizeClass$d,createElementVNode:_createElementVNode$b} = await importShared('vue');
const {toRef: toRef$a} = await importShared('vue');
// Composables
const makeLoaderProps = propsFactory({
  loading: [Boolean, String]
}, 'loader');
function useLoader(props) {
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getCurrentInstanceName();
  const loaderClasses = toRef$a(() => ({
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
  return _createElementVNode$b("div", {
    "class": _normalizeClass$d(`${props.name}__loader`)
  }, [slots.default?.({
    color: props.color,
    isActive: props.active
  }) || _createVNode$h(VProgressLinear, {
    "absolute": props.absolute,
    "active": props.active,
    "color": props.color,
    "height": "2",
    "indeterminate": true
  }, null)]);
}

// Utilities
const {toRef: toRef$9} = await importShared('vue');
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
  const positionClasses = toRef$9(() => {
    return props.position ? `${name}--${props.position}` : undefined;
  });
  return {
    positionClasses
  };
}

// Utilities
const {computed: computed$e,nextTick: nextTick$4,onScopeDispose,reactive,resolveDynamicComponent,toRef: toRef$8} = await importShared('vue');
function useRoute() {
  const vm = getCurrentInstance('useRoute');
  return computed$e(() => vm?.proxy?.$route);
}
function useRouter() {
  return getCurrentInstance('useRouter')?.proxy?.$router;
}
function useLink(props, attrs) {
  const RouterLink = resolveDynamicComponent('RouterLink');
  const isLink = toRef$8(() => !!(props.href || props.to));
  const isClickable = computed$e(() => {
    return isLink?.value || hasEvent(attrs, 'click') || hasEvent(props, 'click');
  });
  if (typeof RouterLink === 'string' || !('useLink' in RouterLink)) {
    const href = toRef$8(() => props.href);
    return {
      isLink,
      isRouterLink: toRef$8(() => false),
      isClickable,
      href,
      linkProps: reactive({
        href
      })
    };
  }

  // vue-router useLink `to` prop needs to be reactive and useLink will crash if undefined
  const routerLink = RouterLink.useLink({
    to: toRef$8(() => props.to || ''),
    replace: toRef$8(() => props.replace)
  });
  // Actual link needs to be undefined when to prop is not used
  const link = computed$e(() => props.to ? routerLink : undefined);
  const route = useRoute();
  const isActive = computed$e(() => {
    if (!link.value) return false;
    if (!props.exact) return link.value.isActive?.value ?? false;
    if (!route.value) return link.value.isExactActive?.value ?? false;
    return link.value.isExactActive?.value && deepEqual(link.value.route.value.query, route.value.query);
  });
  const href = computed$e(() => props.to ? link.value?.route.value.href : props.href);
  const isRouterLink = toRef$8(() => !!props.to);
  return {
    isLink,
    isRouterLink,
    isClickable,
    isActive,
    route: link.value?.route,
    navigate: link.value?.navigate,
    href,
    linkProps: reactive({
      href,
      'aria-current': toRef$8(() => isActive.value ? 'page' : undefined),
      'aria-disabled': toRef$8(() => props.disabled && isLink.value ? 'true' : undefined),
      tabindex: toRef$8(() => props.disabled && isLink.value ? '-1' : undefined)
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
    nextTick$4(() => {
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
    onScopeDispose(() => {
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
const {nextTick: nextTick$3,watch: watch$6} = await importShared('vue');


// Types

function useSelectLink(link, select) {
  watch$6(() => link.isActive?.value, isActive => {
    if (link.isLink.value && isActive != null && select) {
      nextTick$3(() => {
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

const {createVNode:_createVNode$g,createElementVNode:_createElementVNode$a,mergeProps:_mergeProps$6} = await importShared('vue');
const {computed: computed$d,toDisplayString: toDisplayString$3,toRef: toRef$7,withDirectives: withDirectives$1} = await importShared('vue');
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
    const isActive = computed$d(() => {
      if (props.active !== undefined) {
        return props.active;
      }
      if (link.isRouterLink.value) {
        return link.isActive?.value;
      }
      return group?.isSelected.value;
    });
    const color = toRef$7(() => isActive.value ? props.activeColor ?? props.color : props.color);
    const variantProps = computed$d(() => {
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
    const isDisabled = computed$d(() => group?.disabled.value || props.disabled);
    const isElevated = toRef$7(() => {
      return props.variant === 'elevated' && !(props.disabled || props.flat || props.border);
    });
    const valueAttr = computed$d(() => {
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
      return withDirectives$1(_createVNode$g(Tag, _mergeProps$6(link.linkProps, {
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
        default: () => [genOverlays(true, 'v-btn'), !props.icon && hasPrepend && _createElementVNode$a("span", {
          "key": "prepend",
          "class": "v-btn__prepend"
        }, [!slots.prepend ? _createVNode$g(VIcon, {
          "key": "prepend-icon",
          "icon": props.prependIcon
        }, null) : _createVNode$g(VDefaultsProvider, {
          "key": "prepend-defaults",
          "disabled": !props.prependIcon,
          "defaults": {
            VIcon: {
              icon: props.prependIcon
            }
          }
        }, slots.prepend)]), _createElementVNode$a("span", {
          "class": "v-btn__content",
          "data-no-activator": ""
        }, [!slots.default && hasIcon ? _createVNode$g(VIcon, {
          "key": "content-icon",
          "icon": props.icon
        }, null) : _createVNode$g(VDefaultsProvider, {
          "key": "content-defaults",
          "disabled": !hasIcon,
          "defaults": {
            VIcon: {
              icon: props.icon
            }
          }
        }, {
          default: () => [slots.default?.() ?? toDisplayString$3(props.text)]
        })]), !props.icon && hasAppend && _createElementVNode$a("span", {
          "key": "append",
          "class": "v-btn__append"
        }, [!slots.append ? _createVNode$g(VIcon, {
          "key": "append-icon",
          "icon": props.appendIcon
        }, null) : _createVNode$g(VDefaultsProvider, {
          "key": "append-defaults",
          "disabled": !props.appendIcon,
          "defaults": {
            VIcon: {
              icon: props.appendIcon
            }
          }
        }, slots.append)]), !!props.loading && _createElementVNode$a("span", {
          "key": "loader",
          "class": "v-btn__loader"
        }, [slots.loader?.() ?? _createVNode$g(VProgressCircular, {
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

const {normalizeClass:_normalizeClass$c,normalizeStyle:_normalizeStyle$b,createVNode:_createVNode$f} = await importShared('vue');
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
    useRender(() => _createVNode$f(props.tag, {
      "class": _normalizeClass$c(['v-card-actions', props.class]),
      "style": _normalizeStyle$b(props.style)
    }, slots));
    return {};
  }
});

const {normalizeClass:_normalizeClass$b,normalizeStyle:_normalizeStyle$a,createVNode:_createVNode$e} = await importShared('vue');
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
    useRender(() => _createVNode$e(props.tag, {
      "class": _normalizeClass$b(['v-card-subtitle', props.class]),
      "style": _normalizeStyle$a([{
        '--v-card-subtitle-opacity': props.opacity
      }, props.style])
    }, slots));
    return {};
  }
});

// Utilities
const VCardTitle = createSimpleFunctional('v-card-title');

const {normalizeStyle:_normalizeStyle$9,createElementVNode:_createElementVNode$9,normalizeClass:_normalizeClass$a} = await importShared('vue');
const {computed: computed$c} = await importShared('vue');
function useAspectStyles(props) {
  return {
    aspectStyles: computed$c(() => {
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
    useRender(() => _createElementVNode$9("div", {
      "class": _normalizeClass$a(['v-responsive', {
        'v-responsive--inline': props.inline
      }, props.class]),
      "style": _normalizeStyle$9([dimensionStyles.value, props.style])
    }, [_createElementVNode$9("div", {
      "class": "v-responsive__sizer",
      "style": _normalizeStyle$9(aspectStyles.value)
    }, null), slots.additional?.(), slots.default && _createElementVNode$9("div", {
      "class": _normalizeClass$a(['v-responsive__content', props.contentClass])
    }, [slots.default()])]));
    return {};
  }
});

// Utilities
const {h: h$3,mergeProps: mergeProps$1,Transition: Transition$1,TransitionGroup: TransitionGroup$1} = await importShared('vue');
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
    component = group ? TransitionGroup$1 : Transition$1,
    ...customProps
  } = isObject(transition) ? transition : {};
  let transitionProps;
  if (isObject(transition)) {
    transitionProps = mergeProps$1(customProps, onlyDefinedProps({
      disabled,
      group
    }), rest);
  } else {
    transitionProps = mergeProps$1({
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

const {normalizeClass:_normalizeClass$9,createElementVNode:_createElementVNode$8,createVNode:_createVNode$d,Fragment:_Fragment$3,mergeProps:_mergeProps$5,withDirectives:_withDirectives$4} = await importShared('vue');
const {computed: computed$b,nextTick: nextTick$2,onBeforeMount: onBeforeMount$2,onBeforeUnmount: onBeforeUnmount$1,ref: ref$2,shallowRef: shallowRef$7,toRef: toRef$6,vShow,watch: watch$5,withDirectives} = await importShared('vue');
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
    const currentSrc = shallowRef$7(''); // Set from srcset
    const image = ref$2();
    const state = shallowRef$7(props.eager ? 'loading' : 'idle');
    const naturalWidth = shallowRef$7();
    const naturalHeight = shallowRef$7();
    const normalisedSrc = computed$b(() => {
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
    const aspectRatio = computed$b(() => {
      return normalisedSrc.value.aspect || naturalWidth.value / naturalHeight.value || 0;
    });
    watch$5(() => props.src, () => {
      init(state.value !== 'idle');
    });
    watch$5(aspectRatio, (val, oldVal) => {
      if (!val && oldVal && image.value) {
        pollForSize(image.value);
      }
    });

    // TODO: getSrc when window width changes

    onBeforeMount$2(() => init());
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
      nextTick$2(() => {
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
    onBeforeUnmount$1(() => {
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
    const containClasses = toRef$6(() => ({
      'v-img__img--cover': props.cover,
      'v-img__img--contain': !props.cover
    }));
    const __image = () => {
      if (!normalisedSrc.value.src || state.value === 'idle') return null;
      const img = _createElementVNode$8("img", {
        "class": _normalizeClass$9(['v-img__img', containClasses.value]),
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
      return _createVNode$d(MaybeTransition, {
        "transition": props.transition,
        "appear": true
      }, {
        default: () => [withDirectives(sources ? _createElementVNode$8("picture", {
          "class": "v-img__picture"
        }, [sources, img]) : img, [[vShow, state.value === 'loaded']])]
      });
    };
    const __preloadImage = () => _createVNode$d(MaybeTransition, {
      "transition": props.transition
    }, {
      default: () => [normalisedSrc.value.lazySrc && state.value !== 'loaded' && _createElementVNode$8("img", {
        "class": _normalizeClass$9(['v-img__img', 'v-img__img--preload', containClasses.value]),
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
      return _createVNode$d(MaybeTransition, {
        "transition": props.transition,
        "appear": true
      }, {
        default: () => [(state.value === 'loading' || state.value === 'error' && !slots.error) && _createElementVNode$8("div", {
          "class": "v-img__placeholder"
        }, [slots.placeholder()])]
      });
    };
    const __error = () => {
      if (!slots.error) return null;
      return _createVNode$d(MaybeTransition, {
        "transition": props.transition,
        "appear": true
      }, {
        default: () => [state.value === 'error' && _createElementVNode$8("div", {
          "class": "v-img__error"
        }, [slots.error()])]
      });
    };
    const __gradient = () => {
      if (!props.gradient) return null;
      return _createElementVNode$8("div", {
        "class": "v-img__gradient",
        "style": {
          backgroundImage: `linear-gradient(${props.gradient})`
        }
      }, null);
    };
    const isBooted = shallowRef$7(false);
    {
      const stop = watch$5(aspectRatio, val => {
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
      return _withDirectives$4(_createVNode$d(VResponsive, _mergeProps$5({
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
        additional: () => _createElementVNode$8(_Fragment$3, null, [_createVNode$d(__image, null, null), _createVNode$d(__preloadImage, null, null), _createVNode$d(__gradient, null, null), _createVNode$d(__placeholder, null, null), _createVNode$d(__error, null, null)]),
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

const {createVNode:_createVNode$c,normalizeClass:_normalizeClass$8,normalizeStyle:_normalizeStyle$8} = await importShared('vue');
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
    useRender(() => _createVNode$c(props.tag, {
      "class": _normalizeClass$8(['v-avatar', {
        'v-avatar--start': props.start,
        'v-avatar--end': props.end
      }, themeClasses.value, borderClasses.value, colorClasses.value, densityClasses.value, roundedClasses.value, sizeClasses.value, variantClasses.value, props.class]),
      "style": _normalizeStyle$8([colorStyles.value, sizeStyles.value, props.style])
    }, {
      default: () => [!slots.default ? props.image ? _createVNode$c(VImg, {
        "key": "image",
        "src": props.image,
        "alt": "",
        "cover": true
      }, null) : props.icon ? _createVNode$c(VIcon, {
        "key": "icon",
        "icon": props.icon
      }, null) : props.text : _createVNode$c(VDefaultsProvider, {
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

const {Fragment:_Fragment$2,createVNode:_createVNode$b,createElementVNode:_createElementVNode$7,normalizeClass:_normalizeClass$7,normalizeStyle:_normalizeStyle$7} = await importShared('vue');
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
      return _createVNode$b(props.tag, {
        "class": _normalizeClass$7(['v-card-item', props.class]),
        "style": _normalizeStyle$7(props.style)
      }, {
        default: () => [hasPrepend && _createElementVNode$7("div", {
          "key": "prepend",
          "class": "v-card-item__prepend"
        }, [!slots.prepend ? _createElementVNode$7(_Fragment$2, null, [props.prependAvatar && _createVNode$b(VAvatar, {
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
            }
          }
        }, slots.prepend)]), _createElementVNode$7("div", {
          "class": "v-card-item__content"
        }, [hasTitle && _createVNode$b(VCardTitle, {
          "key": "title"
        }, {
          default: () => [slots.title?.() ?? toDisplayString$2(props.title)]
        }), hasSubtitle && _createVNode$b(VCardSubtitle, {
          "key": "subtitle"
        }, {
          default: () => [slots.subtitle?.() ?? toDisplayString$2(props.subtitle)]
        }), slots.default?.()]), hasAppend && _createElementVNode$7("div", {
          "key": "append",
          "class": "v-card-item__append"
        }, [!slots.append ? _createElementVNode$7(_Fragment$2, null, [props.appendIcon && _createVNode$b(VIcon, {
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
            }
          }
        }, slots.append)])]
      });
    });
    return {};
  }
});

const {normalizeClass:_normalizeClass$6,normalizeStyle:_normalizeStyle$6,createVNode:_createVNode$a} = await importShared('vue');
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
    useRender(() => _createVNode$a(props.tag, {
      "class": _normalizeClass$6(['v-card-text', props.class]),
      "style": _normalizeStyle$6([{
        '--v-card-text-opacity': props.opacity
      }, props.style])
    }, slots));
    return {};
  }
});

const {createVNode:_createVNode$9,createElementVNode:_createElementVNode$6,mergeProps:_mergeProps$4,withDirectives:_withDirectives$3} = await importShared('vue');
const {shallowRef: shallowRef$6,watch: watch$4} = await importShared('vue');
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
    const loadingColor = shallowRef$6(undefined);
    watch$4(() => props.loading, (val, old) => {
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
      return _withDirectives$3(_createVNode$9(Tag, _mergeProps$4(link.linkProps, {
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
        default: () => [hasImage && _createElementVNode$6("div", {
          "key": "image",
          "class": "v-card__image"
        }, [!slots.image ? _createVNode$9(VImg, {
          "key": "image-img",
          "cover": true,
          "src": props.image
        }, null) : _createVNode$9(VDefaultsProvider, {
          "key": "image-defaults",
          "disabled": !props.image,
          "defaults": {
            VImg: {
              cover: true,
              src: props.image
            }
          }
        }, slots.image)]), _createVNode$9(LoaderSlot, {
          "name": "v-card",
          "active": !!props.loading,
          "color": loadingColor.value
        }, {
          default: slots.loader
        }), hasCardItem && _createVNode$9(VCardItem, {
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
        }), hasText && _createVNode$9(VCardText, {
          "key": "text"
        }, {
          default: () => [slots.text?.() ?? props.text]
        }), slots.default?.(), slots.actions && _createVNode$9(VCardActions, null, {
          default: slots.actions
        }), genOverlays(isClickable, 'v-card')]
      }), [[Ripple, isClickable && props.ripple]]);
    });
    return {};
  }
});

const {normalizeClass:_normalizeClass$5,normalizeStyle:_normalizeStyle$5,createElementVNode:_createElementVNode$5} = await importShared('vue');
const {computed: computed$a} = await importShared('vue');
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
    const dividerStyles = computed$a(() => {
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
      const divider = _createElementVNode$5("hr", {
        "class": _normalizeClass$5([{
          'v-divider': true,
          'v-divider--inset': props.inset,
          'v-divider--vertical': props.vertical
        }, themeClasses.value, textColorClasses.value, props.class]),
        "style": _normalizeStyle$5([dividerStyles.value, textColorStyles.value, {
          '--v-border-opacity': props.opacity
        }, props.style]),
        "aria-orientation": !attrs.role || attrs.role === 'separator' ? props.vertical ? 'vertical' : 'horizontal' : undefined,
        "role": `${attrs.role || 'separator'}`
      }, null);
      if (!slots.default) return divider;
      return _createElementVNode$5("div", {
        "class": _normalizeClass$5(['v-divider__wrapper', {
          'v-divider__wrapper--vertical': props.vertical,
          'v-divider__wrapper--inset': props.inset
        }])
      }, [divider, _createElementVNode$5("div", {
        "class": "v-divider__content"
      }, [slots.default()]), divider]);
    });
    return {};
  }
});

const {capitalize: capitalize$1,computed: computed$9,h: h$2} = await importShared('vue');
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
    const classes = computed$9(() => {
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

const {capitalize,computed: computed$8,h: h$1} = await importShared('vue');
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
    const classes = computed$8(() => {
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

// Styles
const VSpacer = createSimpleFunctional('v-spacer', 'div', 'VSpacer');

// Utilities
const {h,Transition,TransitionGroup} = await importShared('vue');
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
        const tag = props.group ? TransitionGroup : Transition;
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
      const tag = props.group ? TransitionGroup : Transition;
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

const {createVNode:_createVNode$8,normalizeClass:_normalizeClass$4,createElementVNode:_createElementVNode$4,normalizeStyle:_normalizeStyle$4} = await importShared('vue');
const {computed: computed$7,shallowRef: shallowRef$5,watch: watch$3} = await importShared('vue');
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
    const isOverflowing = shallowRef$5(false);
    const scrollOffset = shallowRef$5(0);
    const containerSize = shallowRef$5(0);
    const contentSize = shallowRef$5(0);
    const isHorizontal = computed$7(() => props.direction === 'horizontal');
    const {
      resizeRef: containerRef,
      contentRect: containerRect
    } = useResizeObserver();
    const {
      resizeRef: contentRef,
      contentRect
    } = useResizeObserver();
    const goTo = useGoTo();
    const goToOptions = computed$7(() => {
      return {
        container: containerRef.el,
        duration: 200,
        easing: 'easeOutQuart'
      };
    });
    const firstSelectedIndex = computed$7(() => {
      if (!group.selected.value.length) return -1;
      return group.items.value.findIndex(item => item.id === group.selected.value[0]);
    });
    const lastSelectedIndex = computed$7(() => {
      if (!group.selected.value.length) return -1;
      return group.items.value.findIndex(item => item.id === group.selected.value[group.selected.value.length - 1]);
    });
    if (IN_BROWSER) {
      let frame = -1;
      watch$3(() => [group.selected.value, containerRect.value, contentRect.value, isHorizontal.value], () => {
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
    const isFocused = shallowRef$5(false);
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
    const slotProps = computed$7(() => ({
      next: group.next,
      prev: group.prev,
      select: group.select,
      isSelected: group.isSelected
    }));
    const hasOverflowOrScroll = computed$7(() => isOverflowing.value || Math.abs(scrollOffset.value) > 0);
    const hasAffixes = computed$7(() => {
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
    const hasPrev = computed$7(() => {
      // 1 pixel in reserve, may be lost after rounding
      return Math.abs(scrollOffset.value) > 1;
    });
    const hasNext = computed$7(() => {
      if (!containerRef.value || !hasOverflowOrScroll.value) return false;
      const scrollSize = getScrollSize(isHorizontal.value, containerRef.el);
      const clientSize = getClientSize(isHorizontal.value, containerRef.el);
      const scrollSizeMax = scrollSize - clientSize;

      // 1 pixel in reserve, may be lost after rounding
      return scrollSizeMax - Math.abs(scrollOffset.value) > 1;
    });
    useRender(() => _createVNode$8(props.tag, {
      "class": _normalizeClass$4(['v-slide-group', {
        'v-slide-group--vertical': !isHorizontal.value,
        'v-slide-group--has-affixes': hasAffixes.value,
        'v-slide-group--is-overflowing': isOverflowing.value
      }, displayClasses.value, props.class]),
      "style": _normalizeStyle$4(props.style),
      "tabindex": isFocused.value || group.selected.value.length ? -1 : 0,
      "onFocus": onFocus
    }, {
      default: () => [hasAffixes.value && _createElementVNode$4("div", {
        "key": "prev",
        "class": _normalizeClass$4(['v-slide-group__prev', {
          'v-slide-group__prev--disabled': !hasPrev.value
        }]),
        "onMousedown": onFocusAffixes,
        "onClick": () => hasPrev.value && scrollTo('prev')
      }, [slots.prev?.(slotProps.value) ?? _createVNode$8(VFadeTransition, null, {
        default: () => [_createVNode$8(VIcon, {
          "icon": isRtl.value ? props.nextIcon : props.prevIcon
        }, null)]
      })]), _createElementVNode$4("div", {
        "key": "container",
        "ref": containerRef,
        "class": _normalizeClass$4(['v-slide-group__container', props.contentClass]),
        "onScroll": onScroll
      }, [_createElementVNode$4("div", {
        "ref": contentRef,
        "class": "v-slide-group__content",
        "onFocusin": onFocusin,
        "onFocusout": onFocusout,
        "onKeydown": onKeydown
      }, [slots.default?.(slotProps.value)])]), hasAffixes.value && _createElementVNode$4("div", {
        "key": "next",
        "class": _normalizeClass$4(['v-slide-group__next', {
          'v-slide-group__next--disabled': !hasNext.value
        }]),
        "onMousedown": onFocusAffixes,
        "onClick": () => hasNext.value && scrollTo('next')
      }, [slots.next?.(slotProps.value) ?? _createVNode$8(VFadeTransition, null, {
        default: () => [_createVNode$8(VIcon, {
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

const {mergeProps:_mergeProps$3,createVNode:_createVNode$7} = await importShared('vue');
const {toRef: toRef$5} = await importShared('vue');
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
        baseColor: toRef$5(() => props.baseColor),
        color: toRef$5(() => props.color),
        disabled: toRef$5(() => props.disabled),
        filter: toRef$5(() => props.filter),
        variant: toRef$5(() => props.variant)
      }
    });
    useRender(() => {
      const slideGroupProps = VSlideGroup.filterProps(props);
      return _createVNode$7(VSlideGroup, _mergeProps$3(slideGroupProps, {
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

const {createVNode:_createVNode$6,vShow:_vShow$1,createElementVNode:_createElementVNode$3,withDirectives:_withDirectives$2,Fragment:_Fragment$1,mergeProps:_mergeProps$2} = await importShared('vue');
const {computed: computed$6,toDisplayString: toDisplayString$1,toRef: toRef$4,watch: watch$2} = await importShared('vue');
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
    const isLink = toRef$4(() => props.link !== false && link.isLink.value);
    const isClickable = computed$6(() => !props.disabled && props.link !== false && (!!group || props.link || link.isClickable.value));
    const closeProps = toRef$4(() => ({
      'aria-label': t(props.closeLabel),
      disabled: props.disabled,
      onClick(e) {
        e.preventDefault();
        e.stopPropagation();
        isActive.value = false;
        emit('click:close', e);
      }
    }));
    watch$2(isActive, val => {
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
      return isActive.value && _withDirectives$2(_createVNode$6(Tag, _mergeProps$2(link.linkProps, {
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
        default: () => [genOverlays(isClickable.value, 'v-chip'), hasFilter && _createVNode$6(VExpandXTransition, {
          "key": "filter"
        }, {
          default: () => [_withDirectives$2(_createElementVNode$3("div", {
            "class": "v-chip__filter"
          }, [!slots.filter ? _createVNode$6(VIcon, {
            "key": "filter-icon",
            "icon": props.filterIcon
          }, null) : _createVNode$6(VDefaultsProvider, {
            "key": "filter-defaults",
            "disabled": !props.filterIcon,
            "defaults": {
              VIcon: {
                icon: props.filterIcon
              }
            }
          }, slots.filter)]), [[_vShow$1, group.isSelected.value]])]
        }), hasPrepend && _createElementVNode$3("div", {
          "key": "prepend",
          "class": "v-chip__prepend"
        }, [!slots.prepend ? _createElementVNode$3(_Fragment$1, null, [props.prependIcon && _createVNode$6(VIcon, {
          "key": "prepend-icon",
          "icon": props.prependIcon,
          "start": true
        }, null), props.prependAvatar && _createVNode$6(VAvatar, {
          "key": "prepend-avatar",
          "image": props.prependAvatar,
          "start": true
        }, null)]) : _createVNode$6(VDefaultsProvider, {
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
        }, slots.prepend)]), _createElementVNode$3("div", {
          "class": "v-chip__content",
          "data-no-activator": ""
        }, [slots.default?.({
          isSelected: group?.isSelected.value,
          selectedClass: group?.selectedClass.value,
          select: group?.select,
          toggle: group?.toggle,
          value: group?.value.value,
          disabled: props.disabled
        }) ?? toDisplayString$1(props.text)]), hasAppend && _createElementVNode$3("div", {
          "key": "append",
          "class": "v-chip__append"
        }, [!slots.append ? _createElementVNode$3(_Fragment$1, null, [props.appendIcon && _createVNode$6(VIcon, {
          "key": "append-icon",
          "end": true,
          "icon": props.appendIcon
        }, null), props.appendAvatar && _createVNode$6(VAvatar, {
          "key": "append-avatar",
          "end": true,
          "image": props.appendAvatar
        }, null)]) : _createVNode$6(VDefaultsProvider, {
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
        }, slots.append)]), hasClose && _createElementVNode$3("button", _mergeProps$2({
          "key": "close",
          "class": "v-chip__close",
          "type": "button",
          "data-testid": "close-chip"
        }, closeProps.value), [!slots.close ? _createVNode$6(VIcon, {
          "key": "close-icon",
          "icon": props.closeIcon,
          "size": "x-small"
        }, null) : _createVNode$6(VDefaultsProvider, {
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

// Utilities
const {computed: computed$5,inject: inject$1,provide: provide$1,shallowRef: shallowRef$4} = await importShared('vue');

// List
const ListKey = Symbol.for('vuetify:list');
function createList() {
  let {
    filterable
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    filterable: false
  };
  const parent = inject$1(ListKey, {
    filterable: false,
    hasPrepend: shallowRef$4(false),
    updateHasPrepend: () => null
  });
  const data = {
    filterable: parent.filterable || filterable,
    hasPrepend: shallowRef$4(false),
    updateHasPrepend: value => {
      if (value) data.hasPrepend.value = value;
    }
  };
  provide$1(ListKey, data);
  return parent;
}
function useList() {
  return inject$1(ListKey, null);
}

/* eslint-disable sonarjs/no-identical-functions */
// Utilities
const {toRaw: toRaw$2} = await importShared('vue');
const independentActiveStrategy = mandatory => {
  const strategy = {
    activate: _ref => {
      let {
        id,
        value,
        activated
      } = _ref;
      id = toRaw$2(id);

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
      id = toRaw$2(id);
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
      id = toRaw$2(id);
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
      id = toRaw$2(id);
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
const {toRaw: toRaw$1} = await importShared('vue');

const independentSelectStrategy = mandatory => {
  const strategy = {
    select: _ref => {
      let {
        id,
        value,
        selected
      } = _ref;
      id = toRaw$1(id);

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
      id = toRaw$1(id);
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
      id = toRaw$1(id);
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
      id = toRaw$1(id);
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
      id = toRaw$1(id);
      const original = new Map(selected);
      const items = [id];
      while (items.length) {
        const item = items.shift();
        if (!disabled.has(item)) {
          selected.set(toRaw$1(item), value ? 'on' : 'off');
        }
        if (children.has(item)) {
          items.push(...children.get(item));
        }
      }
      let parent = toRaw$1(parents.get(id));
      while (parent) {
        let everySelected = true;
        let noneSelected = true;
        for (const child of children.get(parent)) {
          const cid = toRaw$1(child);
          if (disabled.has(cid)) continue;
          if (selected.get(cid) !== 'on') everySelected = false;
          if (selected.has(cid) && selected.get(cid) !== 'off') noneSelected = false;
          if (!everySelected && !noneSelected) break;
        }
        selected.set(parent, everySelected ? 'on' : noneSelected ? 'off' : 'indeterminate');
        parent = toRaw$1(parents.get(parent));
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

const {computed: computed$4,inject,nextTick: nextTick$1,onBeforeMount: onBeforeMount$1,onBeforeUnmount,provide,ref: ref$1,shallowRef: shallowRef$3,toRaw,toRef: toRef$3,toValue,watch: watch$1} = await importShared('vue');
const VNestedSymbol = Symbol.for('vuetify:nested');
const emptyNested = {
  id: shallowRef$3(),
  root: {
    register: () => null,
    unregister: () => null,
    children: ref$1(new Map()),
    parents: ref$1(new Map()),
    disabled: ref$1(new Set()),
    open: () => null,
    openOnSelect: () => null,
    activate: () => null,
    select: () => null,
    activatable: ref$1(false),
    selectable: ref$1(false),
    opened: ref$1(new Set()),
    activated: ref$1(new Set()),
    selected: ref$1(new Map()),
    selectedValues: ref$1([]),
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
  const children = shallowRef$3(new Map());
  const parents = shallowRef$3(new Map());
  const disabled = shallowRef$3(new Set());
  const opened = useProxiedModel(props, 'opened', props.opened, v => new Set(Array.isArray(v) ? v.map(i => toRaw(i)) : v), v => [...v.values()]);
  const activeStrategy = computed$4(() => {
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
  const selectStrategy = computed$4(() => {
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
  const openStrategy = computed$4(() => {
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
  onBeforeUnmount(() => {
    isUnmounted = true;
  });
  function getPath(id) {
    const path = [];
    let parent = toRaw(id);
    while (parent !== undefined) {
      path.unshift(parent);
      parent = parents.value.get(parent);
    }
    return path;
  }
  const vm = getCurrentInstance('nested');
  const nodeIds = new Set();
  const itemsUpdatePropagation = throttle(() => {
    nextTick$1(() => {
      children.value = new Map(children.value);
      parents.value = new Map(parents.value);
    });
  }, 100);
  const nested = {
    id: shallowRef$3(),
    root: {
      opened,
      activatable: toRef$3(() => props.activatable),
      selectable: toRef$3(() => props.selectable),
      activated,
      selected,
      selectedValues: computed$4(() => {
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
  provide(VNestedSymbol, nested);
  return nested.root;
};
const useNestedItem = (id, isDisabled, isGroup) => {
  const parent = inject(VNestedSymbol, emptyNested);
  const uidSymbol = Symbol('nested item');
  const computedId = computed$4(() => {
    const idValue = toRaw(toValue(id));
    return idValue !== undefined ? idValue : uidSymbol;
  });
  const item = {
    ...parent,
    id: computedId,
    open: (open, e) => parent.root.open(computedId.value, open, e),
    openOnSelect: (open, e) => parent.root.openOnSelect(computedId.value, open, e),
    isOpen: computed$4(() => parent.root.opened.value.has(computedId.value)),
    parent: computed$4(() => parent.root.parents.value.get(computedId.value)),
    activate: (activated, e) => parent.root.activate(computedId.value, activated, e),
    isActivated: computed$4(() => parent.root.activated.value.has(computedId.value)),
    select: (selected, e) => parent.root.select(computedId.value, selected, e),
    isSelected: computed$4(() => parent.root.selected.value.get(computedId.value) === 'on'),
    isIndeterminate: computed$4(() => parent.root.selected.value.get(computedId.value) === 'indeterminate'),
    isLeaf: computed$4(() => !parent.root.children.value.get(computedId.value)),
    isGroupActivator: parent.isGroupActivator
  };
  onBeforeMount$1(() => {
    if (!parent.isGroupActivator) {
      nextTick$1(() => {
        parent.root.register(computedId.value, parent.id.value, toValue(isDisabled), isGroup);
      });
    }
  });
  onBeforeUnmount(() => {
    if (!parent.isGroupActivator) {
      parent.root.unregister(computedId.value);
    }
  });
  watch$1(computedId, (val, oldVal) => {
    if (!parent.isGroupActivator) {
      parent.root.unregister(oldVal);
      nextTick$1(() => {
        parent.root.register(val, parent.id.value, toValue(isDisabled), isGroup);
      });
    }
  });
  isGroup && provide(VNestedSymbol, item);
  return item;
};
const useNestedGroupActivator = () => {
  const parent = inject(VNestedSymbol, emptyNested);
  provide(VNestedSymbol, {
    ...parent,
    isGroupActivator: true
  });
};

// Utilities
const {onMounted,readonly,shallowRef: shallowRef$2,toRef: toRef$2} = await importShared('vue');


// Composables
function useSsrBoot() {
  const isBooted = shallowRef$2(false);
  onMounted(() => {
    window.requestAnimationFrame(() => {
      isBooted.value = true;
    });
  });
  const ssrBootStyles = toRef$2(() => !isBooted.value ? {
    transition: 'none !important'
  } : undefined);
  return {
    ssrBootStyles,
    isBooted: readonly(isBooted)
  };
}

const {createVNode:_createVNode$5,vShow:_vShow,createElementVNode:_createElementVNode$2,withDirectives:_withDirectives$1,normalizeClass:_normalizeClass$3,normalizeStyle:_normalizeStyle$3} = await importShared('vue');
const {computed: computed$3} = await importShared('vue');
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
    const id = computed$3(() => `v-list-group--id-${String(props.rawId ?? _id.value)}`);
    const list = useList();
    const {
      isBooted
    } = useSsrBoot();
    function onClick(e) {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      open(!isOpen.value, e);
    }
    const activatorProps = computed$3(() => ({
      onClick,
      class: 'v-list-group__header',
      id: id.value
    }));
    const toggleIcon = computed$3(() => isOpen.value ? props.collapseIcon : props.expandIcon);
    const activatorDefaults = computed$3(() => ({
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
    useRender(() => _createVNode$5(props.tag, {
      "class": _normalizeClass$3(['v-list-group', {
        'v-list-group--prepend': list?.hasPrepend.value,
        'v-list-group--fluid': props.fluid,
        'v-list-group--subgroup': props.subgroup,
        'v-list-group--open': isOpen.value
      }, props.class]),
      "style": _normalizeStyle$3(props.style)
    }, {
      default: () => [slots.activator && _createVNode$5(VDefaultsProvider, {
        "defaults": activatorDefaults.value
      }, {
        default: () => [_createVNode$5(VListGroupActivator, null, {
          default: () => [slots.activator({
            props: activatorProps.value,
            isOpen: isOpen.value
          })]
        })]
      }), _createVNode$5(MaybeTransition, {
        "transition": {
          component: VExpandTransition
        },
        "disabled": !isBooted.value
      }, {
        default: () => [_withDirectives$1(_createElementVNode$2("div", {
          "class": "v-list-group__items",
          "role": "group",
          "aria-labelledby": id.value
        }, [slots.default?.()]), [[_vShow, isOpen.value]])]
      })]
    }));
    return {
      isOpen
    };
  }
});

const {normalizeClass:_normalizeClass$2,normalizeStyle:_normalizeStyle$2,createVNode:_createVNode$4} = await importShared('vue');
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
    useRender(() => _createVNode$4(props.tag, {
      "class": _normalizeClass$2(['v-list-item-subtitle', props.class]),
      "style": _normalizeStyle$2([{
        '--v-list-item-subtitle-opacity': props.opacity
      }, props.style])
    }, slots));
    return {};
  }
});

// Utilities
const VListItemTitle = createSimpleFunctional('v-list-item-title');

const {Fragment:_Fragment,createVNode:_createVNode$3,createElementVNode:_createElementVNode$1,mergeProps:_mergeProps$1,withDirectives:_withDirectives} = await importShared('vue');
const {computed: computed$2,nextTick,onBeforeMount,toDisplayString,toRef: toRef$1,watch} = await importShared('vue');
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
    const id = computed$2(() => props.value === undefined ? link.href.value : props.value);
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
    const isActive = computed$2(() => props.active !== false && (props.active || link.isActive?.value || (root.activatable.value ? isActivated.value : isSelected.value)));
    const isLink = toRef$1(() => props.link !== false && link.isLink.value);
    const isSelectable = computed$2(() => !!list && (root.selectable.value || root.activatable.value || props.value != null));
    const isClickable = computed$2(() => !props.disabled && props.link !== false && (props.link || link.isClickable.value || isSelectable.value));
    const role = computed$2(() => list ? isLink.value ? 'link' : isSelectable.value ? 'option' : 'listitem' : undefined);
    const ariaSelected = computed$2(() => {
      if (!isSelectable.value) return undefined;
      return root.activatable.value ? isActivated.value : root.selectable.value ? isSelected.value : isActive.value;
    });
    const roundedProps = toRef$1(() => props.rounded || props.nav);
    const color = toRef$1(() => props.color ?? props.activeColor);
    const variantProps = toRef$1(() => ({
      color: isActive.value ? color.value ?? props.baseColor : props.baseColor,
      variant: props.variant
    }));

    // useNestedItem doesn't call register until beforeMount,
    // so this can't be an immediate watcher as we don't know parent yet
    watch(() => link.isActive?.value, val => {
      if (!val) return;
      handleActiveLink();
    });
    onBeforeMount(() => {
      if (link.isActive?.value) {
        nextTick(() => handleActiveLink());
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
    const lineClasses = toRef$1(() => props.lines ? `v-list-item--${props.lines}-line` : undefined);
    const rippleOptions = toRef$1(() => props.ripple !== undefined && !!props.ripple && list?.filterable ? {
      keys: ['Enter']
    } : props.ripple);
    const slotProps = computed$2(() => ({
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
      return _withDirectives(_createVNode$3(Tag, _mergeProps$1(link.linkProps, {
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
        default: () => [genOverlays(isClickable.value || isActive.value, 'v-list-item'), hasPrepend && _createElementVNode$1("div", {
          "key": "prepend",
          "class": "v-list-item__prepend"
        }, [!slots.prepend ? _createElementVNode$1(_Fragment, null, [props.prependAvatar && _createVNode$3(VAvatar, {
          "key": "prepend-avatar",
          "density": props.density,
          "image": props.prependAvatar
        }, null), props.prependIcon && _createVNode$3(VIcon, {
          "key": "prepend-icon",
          "density": props.density,
          "icon": props.prependIcon
        }, null)]) : _createVNode$3(VDefaultsProvider, {
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
        }), _createElementVNode$1("div", {
          "class": "v-list-item__spacer"
        }, null)]), _createElementVNode$1("div", {
          "class": "v-list-item__content",
          "data-no-activator": ""
        }, [hasTitle && _createVNode$3(VListItemTitle, {
          "key": "title"
        }, {
          default: () => [slots.title?.({
            title: props.title
          }) ?? toDisplayString(props.title)]
        }), hasSubtitle && _createVNode$3(VListItemSubtitle, {
          "key": "subtitle"
        }, {
          default: () => [slots.subtitle?.({
            subtitle: props.subtitle
          }) ?? toDisplayString(props.subtitle)]
        }), slots.default?.(slotProps.value)]), hasAppend && _createElementVNode$1("div", {
          "key": "append",
          "class": "v-list-item__append"
        }, [!slots.append ? _createElementVNode$1(_Fragment, null, [props.appendIcon && _createVNode$3(VIcon, {
          "key": "append-icon",
          "density": props.density,
          "icon": props.appendIcon
        }, null), props.appendAvatar && _createVNode$3(VAvatar, {
          "key": "append-avatar",
          "density": props.density,
          "image": props.appendAvatar
        }, null)]) : _createVNode$3(VDefaultsProvider, {
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
        }), _createElementVNode$1("div", {
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

const {createElementVNode:_createElementVNode,normalizeClass:_normalizeClass$1,normalizeStyle:_normalizeStyle$1,createVNode:_createVNode$2} = await importShared('vue');
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
      return _createVNode$2(props.tag, {
        "class": _normalizeClass$1(['v-list-subheader', {
          'v-list-subheader--inset': props.inset,
          'v-list-subheader--sticky': props.sticky
        }, textColorClasses.value, props.class]),
        "style": _normalizeStyle$1([{
          textColorStyles
        }, props.style])
      }, {
        default: () => [hasText && _createElementVNode("div", {
          "class": "v-list-subheader__text"
        }, [slots.default?.() ?? props.title])]
      });
    });
    return {};
  }
});

const {createVNode:_createVNode$1,mergeProps:_mergeProps} = await importShared('vue');
const {mergeProps} = await importShared('vue');
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
        }) ?? _createVNode$1(VDivider, itemProps, null);
      }
      if (type === 'subheader') {
        return slots.subheader?.({
          props: itemProps
        }) ?? _createVNode$1(VListSubheader, itemProps, null);
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
      return children ? _createVNode$1(VListGroup, _mergeProps(listGroupProps, {
        "value": props.returnObject ? item : itemProps?.value,
        "rawId": itemProps?.value
      }), {
        activator: _ref3 => {
          let {
            props: activatorProps
          } = _ref3;
          const listItemProps = mergeProps(itemProps, activatorProps, {
            value: props.returnObject ? item : itemProps.value
          });
          return slots.header ? slots.header({
            props: listItemProps
          }) : _createVNode$1(VListItem, listItemProps, slotsWithItem);
        },
        default: () => _createVNode$1(VListChildren, {
          "items": children,
          "returnObject": props.returnObject
        }, slots)
      }) : slots.item ? slots.item({
        props: itemProps
      }) : _createVNode$1(VListItem, _mergeProps(itemProps, {
        "value": props.returnObject ? item : itemProps.value
      }), slotsWithItem);
    });
  }
});

// Utilities
const {computed: computed$1,shallowRef: shallowRef$1,watchEffect} = await importShared('vue');
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
  const items = computed$1(() => transformItems$1(props, props.items));
  const hasNullItem = computed$1(() => items.value.some(item => item.value === null));
  const itemsMap = shallowRef$1(new Map());
  const keylessItems = shallowRef$1([]);
  watchEffect(() => {
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

const {createVNode:_createVNode,normalizeClass:_normalizeClass,normalizeStyle:_normalizeStyle} = await importShared('vue');
const {computed,ref,shallowRef,toRef} = await importShared('vue');
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
  const items = computed(() => transformItems(props, props.items));
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
    const lineClasses = toRef(() => props.lines ? `v-list--${props.lines}-line` : undefined);
    const activeColor = toRef(() => props.activeColor);
    const baseColor = toRef(() => props.baseColor);
    const color = toRef(() => props.color);
    const isSelectable = toRef(() => props.selectable || props.activatable);
    createList({
      filterable: props.filterable
    });
    provideDefaults({
      VListGroup: {
        activeColor,
        baseColor,
        color,
        expandIcon: toRef(() => props.expandIcon),
        collapseIcon: toRef(() => props.collapseIcon)
      },
      VListItem: {
        activeClass: toRef(() => props.activeClass),
        activeColor,
        baseColor,
        color,
        density: toRef(() => props.density),
        disabled: toRef(() => props.disabled),
        lines: toRef(() => props.lines),
        nav: toRef(() => props.nav),
        slim: toRef(() => props.slim),
        variant: toRef(() => props.variant)
      }
    });
    const isFocused = shallowRef(false);
    const contentRef = ref();
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
      return _createVNode(props.tag, {
        "ref": contentRef,
        "class": _normalizeClass(['v-list', {
          'v-list--disabled': props.disabled,
          'v-list--nav': props.nav,
          'v-list--slim': props.slim
        }, themeClasses.value, backgroundColorClasses.value, borderClasses.value, densityClasses.value, elevationClasses.value, lineClasses.value, roundedClasses.value, props.class]),
        "style": _normalizeStyle([backgroundColorStyles.value, dimensionStyles.value, props.style]),
        "tabindex": props.disabled ? -1 : 0,
        "role": isSelectable.value ? 'listbox' : 'list',
        "aria-activedescendant": undefined,
        "onFocusin": onFocusin,
        "onFocusout": onFocusout,
        "onFocus": onFocus,
        "onKeydown": onKeydown,
        "onMousedown": onMousedown
      }, {
        default: () => [_createVNode(VListChildren, {
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

export { makeItemsProps as A, VList as B, VListItem as C, VDivider as D, VListSubheader as E, VAvatar as F, VChip as G, VScaleTransition as H, Intersect as I, VProgressCircular as J, VCard as K, LoaderSlot as L, MaybeTransition as M, VCardTitle as N, VCardText as O, VRow as P, VCol as Q, Ripple as R, VCardActions as S, VBtn as T, VSpacer as U, VIcon as V, makeTagProps as W, VListItemTitle as X, VListItemSubtitle as Y, _export_sfc as _, makeDensityProps as a, useDensity as b, useTextColor as c, deepEqual as d, useBackgroundColor as e, makeTransitionProps$1 as f, VSlideYTransition as g, makeDimensionProps as h, useDimension as i, flipSide as j, flipAlign as k, flipCorner as l, makeComponentProps as m, getAxis as n, useRouter as o, parseAnchor as p, useBackButton as q, VDefaultsProvider as r, makeRoundedProps as s, makeLoaderProps as t, useRender as u, useLoader as v, useRounded as w, VExpandXTransition as x, useResizeObserver as y, useItems as z };
