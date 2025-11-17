import { importShared } from './__federation_fn_import-DglrmYpL.js';
import { c as createForm, u as useRender, f as forwardRefs, m as makeFormProps, a as makeComponentProps, b as useResizeObserver, d as useDimension, g as getScrollParent, e as makeDimensionProps, h as useItems, i as useForm, j as deepEqual, k as makeTransitionProps, V as VDialogTransition, l as makeVTextFieldProps, n as makeItemsProps, o as VTextField, p as VIcon, q as VMenu, r as VList, s as VListItem, t as VDivider, v as VListSubheader, w as VCheckboxBtn, x as VAvatar, y as VChip, z as VDefaultsProvider, A as useLoader, B as useFocus, C as makeVSelectionControlProps, D as makeVInputProps, E as VInput, F as VSelectionControl, G as VScaleTransition, L as LoaderSlot, H as VProgressCircular, _ as _export_sfc, I as VCard, J as VCardTitle, K as VCardText, M as VRow, N as VCol, O as VCardActions, P as VBtn, Q as VSpacer } from './VTextField-xBUDvqdu.js';
import { t as genericComponent, v as propsFactory, o as useDisplay, w as debounce, x as clamp, y as getPropertyFromItem, I as IN_BROWSER, z as getCurrentInstance, A as useToggleScope, B as convertToUnit, u as useLocale, C as useProxiedModel, E as omit, F as wrapInArray, H as IconValue, J as camelizeProps, K as ensureValidVNode, M as checkPrintable, N as matchesSelector, S as SUPPORTS_MATCH_MEDIA, O as filterInputAttrs } from './theme-DITlnZcp.js';

const {normalizeClass:_normalizeClass$2,normalizeStyle:_normalizeStyle$2,createElementVNode:_createElementVNode$5} = await importShared('vue');
const {ref: ref$4} = await importShared('vue');
const makeVFormProps = propsFactory({
  ...makeComponentProps(),
  ...makeFormProps()
}, 'VForm');
const VForm = genericComponent()({
  name: 'VForm',
  props: makeVFormProps(),
  emits: {
    'update:modelValue': val => true,
    submit: e => true
  },
  setup(props, _ref) {
    let {
      slots,
      emit
    } = _ref;
    const form = createForm(props);
    const formRef = ref$4();
    function onReset(e) {
      e.preventDefault();
      form.reset();
    }
    function onSubmit(_e) {
      const e = _e;
      const ready = form.validate();
      e.then = ready.then.bind(ready);
      e.catch = ready.catch.bind(ready);
      e.finally = ready.finally.bind(ready);
      emit('submit', e);
      if (!e.defaultPrevented) {
        ready.then(_ref2 => {
          let {
            valid
          } = _ref2;
          if (valid) {
            formRef.value?.submit();
          }
        });
      }
      e.preventDefault();
    }
    useRender(() => _createElementVNode$5("form", {
      "ref": formRef,
      "class": _normalizeClass$2(['v-form', props.class]),
      "style": _normalizeStyle$2(props.style),
      "novalidate": true,
      "onReset": onReset,
      "onSubmit": onSubmit
    }, [slots.default?.(form)]));
    return forwardRefs(form, formRef);
  }
});

const {Fragment:_Fragment$3,createElementVNode:_createElementVNode$4,mergeProps:_mergeProps$2} = await importShared('vue');
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
    useRender(() => props.renderless ? _createElementVNode$4(_Fragment$3, null, [slots.default?.({
      itemRef: resizeRef
    })]) : _createElementVNode$4("div", _mergeProps$2({
      "ref": resizeRef,
      "class": ['v-virtual-scroll__item', props.class],
      "style": props.style
    }, attrs), [slots.default?.()]));
  }
});

const {computed: computed$2,nextTick: nextTick$1,onScopeDispose: onScopeDispose$1,ref: ref$3,shallowRef: shallowRef$2,watch: watch$2,watchEffect} = await importShared('vue');
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
  const containerRef = ref$3();
  /** An element marking the top of the scrollable area,
   * used to add an offset if there's padding or other elements above the virtual list */
  const markerRef = ref$3();
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

const {createVNode:_createVNode$3,Fragment:_Fragment$2,createElementVNode:_createElementVNode$3,normalizeClass:_normalizeClass$1,normalizeStyle:_normalizeStyle$1} = await importShared('vue');
const {onMounted,onScopeDispose,toRef: toRef$2} = await importShared('vue');
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
    } = useVirtual(props, toRef$2(() => props.items));
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
      const children = computedItems.value.map(item => _createVNode$3(VVirtualScrollItem, {
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
      return props.renderless ? _createElementVNode$3(_Fragment$2, null, [_createElementVNode$3("div", {
        "ref": markerRef,
        "class": "v-virtual-scroll__spacer",
        "style": {
          paddingTop: convertToUnit(paddingTop.value)
        }
      }, null), children, _createElementVNode$3("div", {
        "class": "v-virtual-scroll__spacer",
        "style": {
          paddingBottom: convertToUnit(paddingBottom.value)
        }
      }, null)]) : _createElementVNode$3("div", {
        "ref": containerRef,
        "class": _normalizeClass$1(['v-virtual-scroll', props.class]),
        "onScrollPassive": handleScroll,
        "onScrollend": handleScrollend,
        "style": _normalizeStyle$1([dimensionStyles.value, props.style])
      }, [_createElementVNode$3("div", {
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
const {computed: computed$1,toRef: toRef$1,toValue,useId: useId$1} = await importShared('vue');
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
  const uid = useId$1();
  const menuId = computed$1(() => `menu-${uid}`);
  const ariaExpanded = toRef$1(() => toValue(isOpen));
  const ariaControls = toRef$1(() => menuId.value);
  const ariaLabel = toRef$1(() => t(toValue(isOpen) ? props.closeText : props.openText));
  return {
    menuId,
    ariaExpanded,
    ariaControls,
    ariaLabel
  };
}

const {Fragment:_Fragment$1,createVNode:_createVNode$2,mergeProps:_mergeProps$1,createElementVNode:_createElementVNode$2,createTextVNode:_createTextVNode$1} = await importShared('vue');
const {computed,mergeProps,nextTick,ref: ref$2,shallowRef,watch} = await importShared('vue');
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
  ...makeTransitionProps({
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
    const vTextFieldRef = ref$2();
    const vMenuRef = ref$2();
    const vVirtualScrollRef = ref$2();
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
    const listRef = ref$2();
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
      return _createVNode$2(VTextField, _mergeProps$1({
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
        default: () => _createElementVNode$2(_Fragment$1, null, [_createVNode$2(VMenu, _mergeProps$1({
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
          default: () => [hasList && _createVNode$2(VList, _mergeProps$1({
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
            default: () => [slots['prepend-item']?.(), !displayItems.value.length && !props.hideNoData && (slots['no-data']?.() ?? _createVNode$2(VListItem, {
              "key": "no-data",
              "title": t(props.noDataText)
            }, null)), _createVNode$2(VVirtualScroll, {
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
                  }) ?? _createVNode$2(VDivider, _mergeProps$1(item.props, {
                    "key": `divider-${index}`
                  }), null);
                }
                if (item.type === 'subheader') {
                  return slots.subheader?.({
                    props: item.raw,
                    index
                  }) ?? _createVNode$2(VListSubheader, _mergeProps$1(item.props, {
                    "key": `subheader-${index}`
                  }), null);
                }
                return slots.item?.({
                  item,
                  index,
                  props: itemProps
                }) ?? _createVNode$2(VListItem, _mergeProps$1(itemProps, {
                  "role": "option"
                }), {
                  prepend: _ref3 => {
                    let {
                      isSelected
                    } = _ref3;
                    return _createElementVNode$2(_Fragment$1, null, [props.multiple && !props.hideSelected ? _createVNode$2(VCheckboxBtn, {
                      "key": item.value,
                      "modelValue": isSelected,
                      "ripple": false,
                      "tabindex": "-1",
                      "onClick": event => event.preventDefault()
                    }, null) : undefined, camelizedProps.prependAvatar && _createVNode$2(VAvatar, {
                      "image": camelizedProps.prependAvatar
                    }, null), camelizedProps.prependIcon && _createVNode$2(VIcon, {
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
          return _createElementVNode$2("div", {
            "key": item.value,
            "class": "v-select__selection"
          }, [hasChips ? !slots.chip ? _createVNode$2(VChip, _mergeProps$1({
            "key": "chip",
            "closable": props.closableChips,
            "size": "small",
            "text": item.title,
            "disabled": item.props.disabled
          }, slotProps), null) : _createVNode$2(VDefaultsProvider, {
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
          }) : slotContent ?? _createElementVNode$2("span", {
            "class": "v-select__selection-text"
          }, [item.title, props.multiple && index < model.value.length - 1 && _createElementVNode$2("span", {
            "class": "v-select__selection-comma"
          }, [_createTextVNode$1(",")])])]);
        })]),
        'append-inner': function () {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          return _createElementVNode$2(_Fragment$1, null, [slots['append-inner']?.(...args), props.menuIcon ? _createVNode$2(VIcon, {
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

const {createElementVNode:_createElementVNode$1,normalizeClass:_normalizeClass,normalizeStyle:_normalizeStyle,Fragment:_Fragment,createVNode:_createVNode$1,mergeProps:_mergeProps} = await importShared('vue');
const {ref: ref$1,toRef,useId} = await importShared('vue');
const makeVSwitchProps = propsFactory({
  indeterminate: Boolean,
  inset: Boolean,
  flat: Boolean,
  loading: {
    type: [Boolean, String],
    default: false
  },
  ...makeVInputProps(),
  ...makeVSelectionControlProps()
}, 'VSwitch');
const VSwitch = genericComponent()({
  name: 'VSwitch',
  inheritAttrs: false,
  props: makeVSwitchProps(),
  emits: {
    'update:focused': focused => true,
    'update:modelValue': value => true,
    'update:indeterminate': value => true
  },
  setup(props, _ref) {
    let {
      attrs,
      slots
    } = _ref;
    const indeterminate = useProxiedModel(props, 'indeterminate');
    const model = useProxiedModel(props, 'modelValue');
    const {
      loaderClasses
    } = useLoader(props);
    const {
      isFocused,
      focus,
      blur
    } = useFocus(props);
    const control = ref$1();
    const inputRef = ref$1();
    const isForcedColorsModeActive = SUPPORTS_MATCH_MEDIA && window.matchMedia('(forced-colors: active)').matches;
    const loaderColor = toRef(() => {
      return typeof props.loading === 'string' && props.loading !== '' ? props.loading : props.color;
    });
    const uid = useId();
    const id = toRef(() => props.id || `switch-${uid}`);
    function onChange() {
      if (indeterminate.value) {
        indeterminate.value = false;
      }
    }
    function onTrackClick(e) {
      e.stopPropagation();
      e.preventDefault();
      control.value?.input?.click();
    }
    useRender(() => {
      const [rootAttrs, controlAttrs] = filterInputAttrs(attrs);
      const inputProps = VInput.filterProps(props);
      const controlProps = VSelectionControl.filterProps(props);
      return _createVNode$1(VInput, _mergeProps({
        "ref": inputRef,
        "class": ['v-switch', {
          'v-switch--flat': props.flat
        }, {
          'v-switch--inset': props.inset
        }, {
          'v-switch--indeterminate': indeterminate.value
        }, loaderClasses.value, props.class]
      }, rootAttrs, inputProps, {
        "modelValue": model.value,
        "onUpdate:modelValue": $event => model.value = $event,
        "id": id.value,
        "focused": isFocused.value,
        "style": props.style
      }), {
        ...slots,
        default: _ref2 => {
          let {
            id,
            messagesId,
            isDisabled,
            isReadonly,
            isValid
          } = _ref2;
          const slotProps = {
            model,
            isValid
          };
          return _createVNode$1(VSelectionControl, _mergeProps({
            "ref": control
          }, controlProps, {
            "modelValue": model.value,
            "onUpdate:modelValue": [$event => model.value = $event, onChange],
            "id": id.value,
            "aria-describedby": messagesId.value,
            "type": "checkbox",
            "aria-checked": indeterminate.value ? 'mixed' : undefined,
            "disabled": isDisabled.value,
            "readonly": isReadonly.value,
            "onFocus": focus,
            "onBlur": blur
          }, controlAttrs), {
            ...slots,
            default: _ref3 => {
              let {
                backgroundColorClasses,
                backgroundColorStyles
              } = _ref3;
              return _createElementVNode$1("div", {
                "class": _normalizeClass(['v-switch__track', !isForcedColorsModeActive ? backgroundColorClasses.value : undefined]),
                "style": _normalizeStyle(backgroundColorStyles.value),
                "onClick": onTrackClick
              }, [slots['track-true'] && _createElementVNode$1("div", {
                "key": "prepend",
                "class": "v-switch__track-true"
              }, [slots['track-true'](slotProps)]), slots['track-false'] && _createElementVNode$1("div", {
                "key": "append",
                "class": "v-switch__track-false"
              }, [slots['track-false'](slotProps)])]);
            },
            input: _ref4 => {
              let {
                inputNode,
                icon,
                backgroundColorClasses,
                backgroundColorStyles
              } = _ref4;
              return _createElementVNode$1(_Fragment, null, [inputNode, _createElementVNode$1("div", {
                "class": _normalizeClass(['v-switch__thumb', {
                  'v-switch__thumb--filled': icon || props.loading
                }, props.inset || isForcedColorsModeActive ? undefined : backgroundColorClasses.value]),
                "style": _normalizeStyle(props.inset ? undefined : backgroundColorStyles.value)
              }, [slots.thumb ? _createVNode$1(VDefaultsProvider, {
                "defaults": {
                  VIcon: {
                    icon,
                    size: 'x-small'
                  }
                }
              }, {
                default: () => [slots.thumb({
                  ...slotProps,
                  icon
                })]
              }) : _createVNode$1(VScaleTransition, null, {
                default: () => [!props.loading ? icon && _createVNode$1(VIcon, {
                  "key": String(icon),
                  "icon": icon,
                  "size": "x-small"
                }, null) : _createVNode$1(LoaderSlot, {
                  "name": "v-switch",
                  "active": true,
                  "color": isValid.value === false ? undefined : loaderColor.value
                }, {
                  default: slotProps => slots.loader ? slots.loader(slotProps) : _createVNode$1(VProgressCircular, {
                    "active": slotProps.isActive,
                    "color": slotProps.color,
                    "indeterminate": true,
                    "size": "16",
                    "width": "2"
                  }, null)
                })]
              })])]);
            }
          });
        }
      });
    });
    return forwardRefs({}, inputRef);
  }
});

const {createVNode:_createVNode,createElementVNode:_createElementVNode,withCtx:_withCtx,createTextVNode:_createTextVNode,openBlock:_openBlock,createElementBlock:_createElementBlock} = await importShared('vue');


const _hoisted_1 = { class: "plugin-config" };
const _hoisted_2 = { class: "setting-item d-flex align-center py-2" };
const _hoisted_3 = { class: "setting-content flex-grow-1" };
const _hoisted_4 = { class: "d-flex justify-space-between align-center" };
const _hoisted_5 = { class: "setting-item d-flex align-center py-2" };
const _hoisted_6 = { class: "setting-content flex-grow-1" };
const _hoisted_7 = { class: "d-flex justify-space-between align-center" };
const _hoisted_8 = { class: "setting-item d-flex align-center py-2" };
const _hoisted_9 = { class: "setting-content flex-grow-1" };
const _hoisted_10 = { class: "d-flex justify-space-between align-center" };
const _hoisted_11 = { class: "setting-item d-flex align-center py-2" };
const _hoisted_12 = { class: "setting-content flex-grow-1" };
const _hoisted_13 = { class: "d-flex justify-space-between align-center" };

const {ref,reactive} = await importShared('vue');



const _sfc_main = {
  __name: 'Config',
  props: {
  api: {
    type: Object,
    required: true
  },
  initialConfig: {
    type: Object,
    default: () => ({})
  }
},
  emits: ['switch', 'close'],
  setup(__props, { emit: __emit }) {

const props = __props;

const emit = __emit;

// ✅ 参考logsclean: 使用函数获取插件ID
const getPluginId = () => {
  return "DanmakuAutoImport"
};

const form = ref(null);
const isFormValid = ref(true);
const testing = ref(false);
const saving = ref(false);

const localConfig = reactive({
  enable: false,
  notify: false,
  danmu_server_url: '',
  external_api_key: '',
  cron: '*/5 * * * *',
  delay_seconds: 0,
  max_queue_size: 100,
  only_anime: false,
  search_type: 'tmdb',
  auto_retry: true,
  retry_count: 3,
  ...props.initialConfig
});

const initialConfigBackup = reactive({
  ...props.initialConfig
});

const searchTypeItems = [
  { title: 'TMDB ID', value: 'tmdb' },
  { title: 'TVDB ID', value: 'tvdb' },
  { title: 'Douban ID', value: 'douban' },
  { title: 'IMDB ID', value: 'imdb' },
  { title: 'Bangumi ID', value: 'bangumi' },
  { title: '关键词', value: 'keyword' }
];

const saveConfigManually = async () => {
  if (!form.value) return
  const validation = await form.value.validate();
  if (!validation.valid) {
    console.error('表单验证失败');
    return
  }

  saving.value = true;
  try {
    const pluginId = getPluginId();
    const response = await props.api.post(`plugin/${pluginId}/config`, localConfig);
    if (response.success) {
      // 更新备份
      Object.assign(initialConfigBackup, localConfig);
      console.log('配置保存成功');
    } else {
      console.error('配置保存失败:', response.message);
    }
  } catch (error) {
    console.error('保存配置失败:', error);
  } finally {
    saving.value = false;
  }
};

const testConnection = async () => {
  if (!localConfig.danmu_server_url || !localConfig.external_api_key) {
    console.error('请先填写弹幕库服务器地址和API密钥');
    return
  }

  testing.value = true;
  try {
    const pluginId = getPluginId();
    const response = await props.api.get(`plugin/${pluginId}/test_connection`);
    if (response.error) {
      console.error('连接测试失败:', response.message);
    } else if (response.globalEnabled !== undefined) {
      console.log('连接测试成功,弹幕库服务器连接正常');
    } else {
      console.error('连接测试失败: 响应格式异常');
    }
  } catch (error) {
    console.error('测试连接失败:', error);
  } finally {
    testing.value = false;
  }
};

const resetConfig = () => {
  Object.assign(localConfig, initialConfigBackup);
  if (form.value) form.value.resetValidation();
  console.log('配置已重置');
};

return (_ctx, _cache) => {
                                                       
                                                                   
                                                           
                                                     
                                                     
                                                                 
                                                       
                                                                   
                                                           
                                                       
                                                             
                                                     
                                                           
                                                                       

  return (_openBlock(), _createElementBlock("div", _hoisted_1, [
    _createVNode(VCard, {
      flat: "",
      class: "rounded border"
    }, {
      default: _withCtx(() => [
        _createVNode(VCardTitle, { class: "text-subtitle-1 d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
          default: _withCtx(() => [
            _createVNode(VIcon, {
              icon: "mdi-cog",
              class: "mr-2",
              color: "primary",
              size: "small"
            }),
            _cache[13] || (_cache[13] = _createElementVNode("span", null, "弹幕库自动导入配置", -1))
          ]),
          _: 1
        }),
        _createVNode(VCardText, { class: "px-3 py-2" }, {
          default: _withCtx(() => [
            _createVNode(VForm, {
              ref_key: "form",
              ref: form,
              modelValue: isFormValid.value,
              "onUpdate:modelValue": _cache[11] || (_cache[11] = $event => ((isFormValid).value = $event))
            }, {
              default: _withCtx(() => [
                _createVNode(VCard, {
                  flat: "",
                  class: "rounded mb-3 border config-card"
                }, {
                  default: _withCtx(() => [
                    _createVNode(VCardTitle, { class: "text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
                      default: _withCtx(() => [
                        _createVNode(VIcon, {
                          icon: "mdi-tune",
                          class: "mr-2",
                          color: "primary",
                          size: "small"
                        }),
                        _cache[14] || (_cache[14] = _createElementVNode("span", null, "基本设置", -1))
                      ]),
                      _: 1
                    }),
                    _createVNode(VCardText, { class: "px-3 py-2" }, {
                      default: _withCtx(() => [
                        _createVNode(VRow, null, {
                          default: _withCtx(() => [
                            _createVNode(VCol, {
                              cols: "12",
                              md: "4"
                            }, {
                              default: _withCtx(() => [
                                _createElementVNode("div", _hoisted_2, [
                                  _createVNode(VIcon, {
                                    icon: "mdi-power",
                                    size: "small",
                                    color: localConfig.enable ? 'success' : 'grey',
                                    class: "mr-3"
                                  }, null, 8, ["color"]),
                                  _createElementVNode("div", _hoisted_3, [
                                    _createElementVNode("div", _hoisted_4, [
                                      _cache[15] || (_cache[15] = _createElementVNode("div", null, [
                                        _createElementVNode("div", { class: "text-subtitle-2" }, "启用插件"),
                                        _createElementVNode("div", { class: "text-caption text-grey" }, "是否启用弹幕自动导入")
                                      ], -1)),
                                      _createVNode(VSwitch, {
                                        modelValue: localConfig.enable,
                                        "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((localConfig.enable) = $event)),
                                        color: "primary",
                                        inset: "",
                                        density: "compact",
                                        "hide-details": "",
                                        class: "small-switch"
                                      }, null, 8, ["modelValue"])
                                    ])
                                  ])
                                ])
                              ]),
                              _: 1
                            }),
                            _createVNode(VCol, {
                              cols: "12",
                              md: "4"
                            }, {
                              default: _withCtx(() => [
                                _createElementVNode("div", _hoisted_5, [
                                  _createVNode(VIcon, {
                                    icon: "mdi-bell",
                                    size: "small",
                                    color: localConfig.notify ? 'info' : 'grey',
                                    class: "mr-3"
                                  }, null, 8, ["color"]),
                                  _createElementVNode("div", _hoisted_6, [
                                    _createElementVNode("div", _hoisted_7, [
                                      _cache[16] || (_cache[16] = _createElementVNode("div", null, [
                                        _createElementVNode("div", { class: "text-subtitle-2" }, "启用通知"),
                                        _createElementVNode("div", { class: "text-caption text-grey" }, "导入完成后发送通知")
                                      ], -1)),
                                      _createVNode(VSwitch, {
                                        modelValue: localConfig.notify,
                                        "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => ((localConfig.notify) = $event)),
                                        color: "info",
                                        inset: "",
                                        density: "compact",
                                        "hide-details": "",
                                        class: "small-switch"
                                      }, null, 8, ["modelValue"])
                                    ])
                                  ])
                                ])
                              ]),
                              _: 1
                            }),
                            _createVNode(VCol, {
                              cols: "12",
                              md: "4"
                            }, {
                              default: _withCtx(() => [
                                _createElementVNode("div", _hoisted_8, [
                                  _createVNode(VIcon, {
                                    icon: "mdi-animation",
                                    size: "small",
                                    color: localConfig.only_anime ? 'primary' : 'grey',
                                    class: "mr-3"
                                  }, null, 8, ["color"]),
                                  _createElementVNode("div", _hoisted_9, [
                                    _createElementVNode("div", _hoisted_10, [
                                      _cache[17] || (_cache[17] = _createElementVNode("div", null, [
                                        _createElementVNode("div", { class: "text-subtitle-2" }, "仅处理动漫"),
                                        _createElementVNode("div", { class: "text-caption text-grey" }, "只处理动漫类型媒体")
                                      ], -1)),
                                      _createVNode(VSwitch, {
                                        modelValue: localConfig.only_anime,
                                        "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => ((localConfig.only_anime) = $event)),
                                        color: "primary",
                                        inset: "",
                                        density: "compact",
                                        "hide-details": "",
                                        class: "small-switch"
                                      }, null, 8, ["modelValue"])
                                    ])
                                  ])
                                ])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                _createVNode(VCard, {
                  flat: "",
                  class: "rounded mb-3 border config-card"
                }, {
                  default: _withCtx(() => [
                    _createVNode(VCardTitle, { class: "text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
                      default: _withCtx(() => [
                        _createVNode(VIcon, {
                          icon: "mdi-server",
                          class: "mr-2",
                          color: "primary",
                          size: "small"
                        }),
                        _cache[18] || (_cache[18] = _createElementVNode("span", null, "服务器设置", -1))
                      ]),
                      _: 1
                    }),
                    _createVNode(VCardText, { class: "px-3 py-2" }, {
                      default: _withCtx(() => [
                        _createVNode(VRow, null, {
                          default: _withCtx(() => [
                            _createVNode(VCol, {
                              cols: "12",
                              md: "6"
                            }, {
                              default: _withCtx(() => [
                                _createVNode(VTextField, {
                                  modelValue: localConfig.danmu_server_url,
                                  "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => ((localConfig.danmu_server_url) = $event)),
                                  label: "弹幕库服务器地址",
                                  placeholder: "http://localhost:3000",
                                  hint: "弹幕库服务器的完整URL地址",
                                  "persistent-hint": "",
                                  variant: "outlined",
                                  density: "compact",
                                  class: "text-caption"
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            _createVNode(VCol, {
                              cols: "12",
                              md: "6"
                            }, {
                              default: _withCtx(() => [
                                _createVNode(VTextField, {
                                  modelValue: localConfig.external_api_key,
                                  "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => ((localConfig.external_api_key) = $event)),
                                  label: "外部控制API密钥",
                                  placeholder: "请输入API Key",
                                  type: "password",
                                  hint: "在弹幕库设置中获取外部控制API密钥",
                                  "persistent-hint": "",
                                  variant: "outlined",
                                  density: "compact",
                                  class: "text-caption"
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                _createVNode(VCard, {
                  flat: "",
                  class: "rounded mb-3 border config-card"
                }, {
                  default: _withCtx(() => [
                    _createVNode(VCardTitle, { class: "text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
                      default: _withCtx(() => [
                        _createVNode(VIcon, {
                          icon: "mdi-clock-time-five",
                          class: "mr-2",
                          color: "primary",
                          size: "small"
                        }),
                        _cache[19] || (_cache[19] = _createElementVNode("span", null, "任务设置", -1))
                      ]),
                      _: 1
                    }),
                    _createVNode(VCardText, { class: "px-3 py-2" }, {
                      default: _withCtx(() => [
                        _createVNode(VRow, null, {
                          default: _withCtx(() => [
                            _createVNode(VCol, {
                              cols: "12",
                              md: "4"
                            }, {
                              default: _withCtx(() => [
                                _createVNode(VTextField, {
                                  modelValue: localConfig.cron,
                                  "onUpdate:modelValue": _cache[5] || (_cache[5] = $event => ((localConfig.cron) = $event)),
                                  label: "定时任务Cron表达式",
                                  placeholder: "*/5 * * * *",
                                  hint: "定时处理队列的Cron表达式",
                                  "persistent-hint": "",
                                  variant: "outlined",
                                  density: "compact",
                                  class: "text-caption"
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            _createVNode(VCol, {
                              cols: "12",
                              md: "4"
                            }, {
                              default: _withCtx(() => [
                                _createVNode(VTextField, {
                                  modelValue: localConfig.delay_hours,
                                  "onUpdate:modelValue": _cache[6] || (_cache[6] = $event => ((localConfig.delay_hours) = $event)),
                                  modelModifiers: { number: true },
                                  label: "延时导入(小时)",
                                  type: "number",
                                  placeholder: "0",
                                  hint: "媒体下载完成后延时小时数",
                                  "persistent-hint": "",
                                  variant: "outlined",
                                  density: "compact",
                                  class: "text-caption"
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            _createVNode(VCol, {
                              cols: "12",
                              md: "4"
                            }, {
                              default: _withCtx(() => [
                                _createVNode(VTextField, {
                                  modelValue: localConfig.max_queue_size,
                                  "onUpdate:modelValue": _cache[7] || (_cache[7] = $event => ((localConfig.max_queue_size) = $event)),
                                  modelModifiers: { number: true },
                                  label: "最大队列长度",
                                  type: "number",
                                  placeholder: "100",
                                  hint: "任务队列最大长度",
                                  "persistent-hint": "",
                                  variant: "outlined",
                                  density: "compact",
                                  class: "text-caption"
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                _createVNode(VCard, {
                  flat: "",
                  class: "rounded mb-3 border config-card"
                }, {
                  default: _withCtx(() => [
                    _createVNode(VCardTitle, { class: "text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
                      default: _withCtx(() => [
                        _createVNode(VIcon, {
                          icon: "mdi-filter-settings",
                          class: "mr-2",
                          color: "primary",
                          size: "small"
                        }),
                        _cache[20] || (_cache[20] = _createElementVNode("span", null, "高级设置", -1))
                      ]),
                      _: 1
                    }),
                    _createVNode(VCardText, { class: "px-3 py-2" }, {
                      default: _withCtx(() => [
                        _createVNode(VRow, null, {
                          default: _withCtx(() => [
                            _createVNode(VCol, {
                              cols: "12",
                              md: "4"
                            }, {
                              default: _withCtx(() => [
                                _createVNode(VSelect, {
                                  modelValue: localConfig.search_type,
                                  "onUpdate:modelValue": _cache[8] || (_cache[8] = $event => ((localConfig.search_type) = $event)),
                                  label: "搜索类型",
                                  items: searchTypeItems,
                                  hint: "推送到弹幕库时使用的搜索类型",
                                  "persistent-hint": "",
                                  variant: "outlined",
                                  density: "compact",
                                  class: "text-caption",
                                  "menu-props": { zIndex: 9999 }
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            _createVNode(VCol, {
                              cols: "12",
                              md: "4"
                            }, {
                              default: _withCtx(() => [
                                _createElementVNode("div", _hoisted_11, [
                                  _createVNode(VIcon, {
                                    icon: "mdi-refresh",
                                    size: "small",
                                    color: localConfig.auto_retry ? 'warning' : 'grey',
                                    class: "mr-3"
                                  }, null, 8, ["color"]),
                                  _createElementVNode("div", _hoisted_12, [
                                    _createElementVNode("div", _hoisted_13, [
                                      _cache[21] || (_cache[21] = _createElementVNode("div", null, [
                                        _createElementVNode("div", { class: "text-subtitle-2" }, "失败自动重试"),
                                        _createElementVNode("div", { class: "text-caption text-grey" }, "导入失败后自动重试")
                                      ], -1)),
                                      _createVNode(VSwitch, {
                                        modelValue: localConfig.auto_retry,
                                        "onUpdate:modelValue": _cache[9] || (_cache[9] = $event => ((localConfig.auto_retry) = $event)),
                                        color: "warning",
                                        inset: "",
                                        density: "compact",
                                        "hide-details": "",
                                        class: "small-switch"
                                      }, null, 8, ["modelValue"])
                                    ])
                                  ])
                                ])
                              ]),
                              _: 1
                            }),
                            _createVNode(VCol, {
                              cols: "12",
                              md: "4"
                            }, {
                              default: _withCtx(() => [
                                _createVNode(VTextField, {
                                  modelValue: localConfig.retry_count,
                                  "onUpdate:modelValue": _cache[10] || (_cache[10] = $event => ((localConfig.retry_count) = $event)),
                                  modelModifiers: { number: true },
                                  label: "重试次数",
                                  type: "number",
                                  placeholder: "3",
                                  hint: "失败后最多重试次数",
                                  "persistent-hint": "",
                                  disabled: !localConfig.auto_retry,
                                  variant: "outlined",
                                  density: "compact",
                                  class: "text-caption"
                                }, null, 8, ["modelValue", "disabled"])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                _createVNode(VCard, {
                  flat: "",
                  class: "rounded mb-3 border config-card"
                }, {
                  default: _withCtx(() => [
                    _createVNode(VCardText, { class: "d-flex align-center px-3 py-2" }, {
                      default: _withCtx(() => [
                        _createVNode(VIcon, {
                          icon: "mdi-information",
                          color: "info",
                          class: "mr-2",
                          size: "small"
                        }),
                        _cache[22] || (_cache[22] = _createElementVNode("span", { class: "text-caption" }, " 插件会在媒体下载完成后自动将任务添加到队列,由定时任务处理。支持延时导入、失败重试等功能。 ", -1))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["modelValue"])
          ]),
          _: 1
        }),
        _createVNode(VDivider),
        _createVNode(VCardActions, { class: "px-2 py-1" }, {
          default: _withCtx(() => [
            _createVNode(VBtn, {
              color: "info",
              variant: "text",
              "prepend-icon": "mdi-database",
              size: "small",
              onClick: _cache[12] || (_cache[12] = $event => (emit('switch')))
            }, {
              default: _withCtx(() => [...(_cache[23] || (_cache[23] = [
                _createTextVNode(" 数据 ", -1)
              ]))]),
              _: 1
            }),
            _createVNode(VSpacer),
            _createVNode(VBtn, {
              color: "info",
              variant: "text",
              "prepend-icon": "mdi-test-tube",
              size: "small",
              onClick: testConnection,
              loading: testing.value
            }, {
              default: _withCtx(() => [...(_cache[24] || (_cache[24] = [
                _createTextVNode(" 测试连接 ", -1)
              ]))]),
              _: 1
            }, 8, ["loading"]),
            _createVNode(VBtn, {
              color: "secondary",
              variant: "text",
              "prepend-icon": "mdi-restore",
              size: "small",
              onClick: resetConfig
            }, {
              default: _withCtx(() => [...(_cache[25] || (_cache[25] = [
                _createTextVNode(" 重置 ", -1)
              ]))]),
              _: 1
            }),
            _createVNode(VBtn, {
              color: "primary",
              variant: "text",
              "prepend-icon": "mdi-content-save",
              size: "small",
              onClick: saveConfigManually,
              loading: saving.value
            }, {
              default: _withCtx(() => [...(_cache[26] || (_cache[26] = [
                _createTextVNode(" 保存配置 ", -1)
              ]))]),
              _: 1
            }, 8, ["loading"])
          ]),
          _: 1
        })
      ]),
      _: 1
    })
  ]))
}
}

};
const Config = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-2c9a7e3a"]]);

export { Config as default };
