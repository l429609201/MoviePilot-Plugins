import { importShared } from './__federation_fn_import-oc7trqad.js';
import { w as useDimension, u as useRender, x as makeTagProps, y as makeDimensionProps, a as makeComponentProps, z as createSimpleFunctional, A as useResizeObserver, B as VBtn, C as makeVariantProps, D as makeSizeProps, E as makeRoundedProps, F as makeElevationProps, G as makeDensityProps, H as makeBorderProps, t as VSelect, I as deepEqual, J as makeLoaderProps, b as useLoader, K as useBackgroundColor, L as LoaderSlot, M as VChip, k as VIcon, N as VCheckboxBtn, O as useDensity, P as VDivider, q as VRow, r as VCol, n as VCard, p as VCardText, o as VCardTitle, v as VAlert } from './VSelect-Cj1toXI0.js';
import { y as isOn, z as callEvent, t as genericComponent, v as propsFactory, r as useRtl, w as useProxiedModel, u as useLocale, A as provideTheme, o as useDisplay, B as provideDefaults, a as createRange, C as makeThemeProps, E as IconValue, F as keyValues, H as getCurrentInstance, J as clamp, K as defineFunctionalComponent, M as convertToUnit, N as consoleError, O as wrapInArray, P as isPrimitive, Q as getObjectValueByPath, R as isEmpty, U as makeDisplayProps, V as EventProp, W as pick, X as getPropertyFromItem } from './theme-BAWxfzBN.js';

// Utilities
function getPrefixedEventHandlers(attrs, suffix, getData) {
  return Object.keys(attrs).filter(key => isOn(key) && key.endsWith(suffix)).reduce((acc, key) => {
    acc[key.slice(0, -suffix.length)] = event => callEvent(attrs[key], event, getData(event));
    return acc;
  }, {});
}

const {normalizeClass:_normalizeClass$6,normalizeStyle:_normalizeStyle$3,createVNode:_createVNode$a} = await importShared('vue');
const makeVContainerProps = propsFactory({
  fluid: {
    type: Boolean,
    default: false
  },
  ...makeComponentProps(),
  ...makeDimensionProps(),
  ...makeTagProps()
}, 'VContainer');
const VContainer = genericComponent()({
  name: 'VContainer',
  props: makeVContainerProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      rtlClasses
    } = useRtl();
    const {
      dimensionStyles
    } = useDimension(props);
    useRender(() => _createVNode$a(props.tag, {
      "class": _normalizeClass$6(['v-container', {
        'v-container--fluid': props.fluid
      }, rtlClasses.value, props.class]),
      "style": _normalizeStyle$3([dimensionStyles.value, props.style])
    }, slots));
    return {};
  }
});

// Styles
const VSpacer = createSimpleFunctional('v-spacer', 'div', 'VSpacer');

const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

// Utilities
const {onBeforeUpdate,ref: ref$3} = await importShared('vue');


// Types

function useRefs() {
  const refs = ref$3([]);
  onBeforeUpdate(() => refs.value = []);
  function updateRef(e, i) {
    refs.value[i] = e;
  }
  return {
    refs,
    updateRef
  };
}

const {mergeProps:_mergeProps$5,createVNode:_createVNode$9,createElementVNode:_createElementVNode$9,normalizeClass:_normalizeClass$5,normalizeStyle:_normalizeStyle$2} = await importShared('vue');
const {computed: computed$a,nextTick,shallowRef: shallowRef$2,toRef: toRef$5} = await importShared('vue');
const makeVPaginationProps = propsFactory({
  activeColor: String,
  start: {
    type: [Number, String],
    default: 1
  },
  modelValue: {
    type: Number,
    default: props => props.start
  },
  disabled: Boolean,
  length: {
    type: [Number, String],
    default: 1,
    validator: val => val % 1 === 0
  },
  totalVisible: [Number, String],
  firstIcon: {
    type: IconValue,
    default: '$first'
  },
  prevIcon: {
    type: IconValue,
    default: '$prev'
  },
  nextIcon: {
    type: IconValue,
    default: '$next'
  },
  lastIcon: {
    type: IconValue,
    default: '$last'
  },
  ariaLabel: {
    type: String,
    default: '$vuetify.pagination.ariaLabel.root'
  },
  pageAriaLabel: {
    type: String,
    default: '$vuetify.pagination.ariaLabel.page'
  },
  currentPageAriaLabel: {
    type: String,
    default: '$vuetify.pagination.ariaLabel.currentPage'
  },
  firstAriaLabel: {
    type: String,
    default: '$vuetify.pagination.ariaLabel.first'
  },
  previousAriaLabel: {
    type: String,
    default: '$vuetify.pagination.ariaLabel.previous'
  },
  nextAriaLabel: {
    type: String,
    default: '$vuetify.pagination.ariaLabel.next'
  },
  lastAriaLabel: {
    type: String,
    default: '$vuetify.pagination.ariaLabel.last'
  },
  ellipsis: {
    type: String,
    default: '...'
  },
  showFirstLastPage: Boolean,
  ...makeBorderProps(),
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeElevationProps(),
  ...makeRoundedProps(),
  ...makeSizeProps(),
  ...makeTagProps({
    tag: 'nav'
  }),
  ...makeThemeProps(),
  ...makeVariantProps({
    variant: 'text'
  })
}, 'VPagination');
const VPagination = genericComponent()({
  name: 'VPagination',
  props: makeVPaginationProps(),
  emits: {
    'update:modelValue': value => true,
    first: value => true,
    prev: value => true,
    next: value => true,
    last: value => true
  },
  setup(props, _ref) {
    let {
      slots,
      emit
    } = _ref;
    const page = useProxiedModel(props, 'modelValue');
    const {
      t,
      n
    } = useLocale();
    const {
      isRtl
    } = useRtl();
    const {
      themeClasses
    } = provideTheme(props);
    const {
      width
    } = useDisplay();
    const maxButtons = shallowRef$2(-1);
    provideDefaults(undefined, {
      scoped: true
    });
    const {
      resizeRef
    } = useResizeObserver(entries => {
      if (!entries.length) return;
      const {
        target,
        contentRect
      } = entries[0];
      const firstItem = target.querySelector('.v-pagination__list > *');
      if (!firstItem) return;
      const totalWidth = contentRect.width;
      const itemWidth = firstItem.offsetWidth + parseFloat(getComputedStyle(firstItem).marginRight) * 2;
      maxButtons.value = getMax(totalWidth, itemWidth);
    });
    const length = computed$a(() => parseInt(props.length, 10));
    const start = computed$a(() => parseInt(props.start, 10));
    const totalVisible = computed$a(() => {
      if (props.totalVisible != null) return parseInt(props.totalVisible, 10);else if (maxButtons.value >= 0) return maxButtons.value;
      return getMax(width.value, 58);
    });
    function getMax(totalWidth, itemWidth) {
      const minButtons = props.showFirstLastPage ? 5 : 3;
      return Math.max(0, Math.floor(
      // Round to two decimal places to avoid floating point errors
      Number(((totalWidth - itemWidth * minButtons) / itemWidth).toFixed(2))));
    }
    const range = computed$a(() => {
      if (length.value <= 0 || isNaN(length.value) || length.value > Number.MAX_SAFE_INTEGER) return [];
      if (totalVisible.value <= 0) return [];else if (totalVisible.value === 1) return [page.value];
      if (length.value <= totalVisible.value) {
        return createRange(length.value, start.value);
      }
      const even = totalVisible.value % 2 === 0;
      const middle = even ? totalVisible.value / 2 : Math.floor(totalVisible.value / 2);
      const left = even ? middle : middle + 1;
      const right = length.value - middle;
      if (left - page.value >= 0) {
        return [...createRange(Math.max(1, totalVisible.value - 1), start.value), props.ellipsis, length.value];
      } else if (page.value - right >= (even ? 1 : 0)) {
        const rangeLength = totalVisible.value - 1;
        const rangeStart = length.value - rangeLength + start.value;
        return [start.value, props.ellipsis, ...createRange(rangeLength, rangeStart)];
      } else {
        const rangeLength = Math.max(1, totalVisible.value - 2);
        const rangeStart = rangeLength === 1 ? page.value : page.value - Math.ceil(rangeLength / 2) + start.value;
        return [start.value, props.ellipsis, ...createRange(rangeLength, rangeStart), props.ellipsis, length.value];
      }
    });

    // TODO: 'first' | 'prev' | 'next' | 'last' does not work here?
    function setValue(e, value, event) {
      e.preventDefault();
      page.value = value;
      event && emit(event, value);
    }
    const {
      refs,
      updateRef
    } = useRefs();
    provideDefaults({
      VPaginationBtn: {
        color: toRef$5(() => props.color),
        border: toRef$5(() => props.border),
        density: toRef$5(() => props.density),
        size: toRef$5(() => props.size),
        variant: toRef$5(() => props.variant),
        rounded: toRef$5(() => props.rounded),
        elevation: toRef$5(() => props.elevation)
      }
    });
    const items = computed$a(() => {
      return range.value.map((item, index) => {
        const ref = e => updateRef(e, index);
        if (typeof item === 'string') {
          return {
            isActive: false,
            key: `ellipsis-${index}`,
            page: item,
            props: {
              ref,
              ellipsis: true,
              icon: true,
              disabled: true
            }
          };
        } else {
          const isActive = item === page.value;
          return {
            isActive,
            key: item,
            page: n(item),
            props: {
              ref,
              ellipsis: false,
              icon: true,
              disabled: !!props.disabled || Number(props.length) < 2,
              color: isActive ? props.activeColor : props.color,
              'aria-current': isActive,
              'aria-label': t(isActive ? props.currentPageAriaLabel : props.pageAriaLabel, item),
              onClick: e => setValue(e, item)
            }
          };
        }
      });
    });
    const controls = computed$a(() => {
      const prevDisabled = !!props.disabled || page.value <= start.value;
      const nextDisabled = !!props.disabled || page.value >= start.value + length.value - 1;
      return {
        first: props.showFirstLastPage ? {
          icon: isRtl.value ? props.lastIcon : props.firstIcon,
          onClick: e => setValue(e, start.value, 'first'),
          disabled: prevDisabled,
          'aria-label': t(props.firstAriaLabel),
          'aria-disabled': prevDisabled
        } : undefined,
        prev: {
          icon: isRtl.value ? props.nextIcon : props.prevIcon,
          onClick: e => setValue(e, page.value - 1, 'prev'),
          disabled: prevDisabled,
          'aria-label': t(props.previousAriaLabel),
          'aria-disabled': prevDisabled
        },
        next: {
          icon: isRtl.value ? props.prevIcon : props.nextIcon,
          onClick: e => setValue(e, page.value + 1, 'next'),
          disabled: nextDisabled,
          'aria-label': t(props.nextAriaLabel),
          'aria-disabled': nextDisabled
        },
        last: props.showFirstLastPage ? {
          icon: isRtl.value ? props.firstIcon : props.lastIcon,
          onClick: e => setValue(e, start.value + length.value - 1, 'last'),
          disabled: nextDisabled,
          'aria-label': t(props.lastAriaLabel),
          'aria-disabled': nextDisabled
        } : undefined
      };
    });
    function updateFocus() {
      const currentIndex = page.value - start.value;
      refs.value[currentIndex]?.$el.focus();
    }
    function onKeydown(e) {
      if (e.key === keyValues.left && !props.disabled && page.value > Number(props.start)) {
        page.value = page.value - 1;
        nextTick(updateFocus);
      } else if (e.key === keyValues.right && !props.disabled && page.value < start.value + length.value - 1) {
        page.value = page.value + 1;
        nextTick(updateFocus);
      }
    }
    useRender(() => _createVNode$9(props.tag, {
      "ref": resizeRef,
      "class": _normalizeClass$5(['v-pagination', themeClasses.value, props.class]),
      "style": _normalizeStyle$2(props.style),
      "role": "navigation",
      "aria-label": t(props.ariaLabel),
      "onKeydown": onKeydown,
      "data-test": "v-pagination-root"
    }, {
      default: () => [_createElementVNode$9("ul", {
        "class": "v-pagination__list"
      }, [props.showFirstLastPage && _createElementVNode$9("li", {
        "key": "first",
        "class": "v-pagination__first",
        "data-test": "v-pagination-first"
      }, [slots.first ? slots.first(controls.value.first) : _createVNode$9(VBtn, _mergeProps$5({
        "_as": "VPaginationBtn"
      }, controls.value.first), null)]), _createElementVNode$9("li", {
        "key": "prev",
        "class": "v-pagination__prev",
        "data-test": "v-pagination-prev"
      }, [slots.prev ? slots.prev(controls.value.prev) : _createVNode$9(VBtn, _mergeProps$5({
        "_as": "VPaginationBtn"
      }, controls.value.prev), null)]), items.value.map((item, index) => _createElementVNode$9("li", {
        "key": item.key,
        "class": _normalizeClass$5(['v-pagination__item', {
          'v-pagination__item--is-active': item.isActive
        }]),
        "data-test": "v-pagination-item"
      }, [slots.item ? slots.item(item) : _createVNode$9(VBtn, _mergeProps$5({
        "_as": "VPaginationBtn"
      }, item.props), {
        default: () => [item.page]
      })])), _createElementVNode$9("li", {
        "key": "next",
        "class": "v-pagination__next",
        "data-test": "v-pagination-next"
      }, [slots.next ? slots.next(controls.value.next) : _createVNode$9(VBtn, _mergeProps$5({
        "_as": "VPaginationBtn"
      }, controls.value.next), null)]), props.showFirstLastPage && _createElementVNode$9("li", {
        "key": "last",
        "class": "v-pagination__last",
        "data-test": "v-pagination-last"
      }, [slots.last ? slots.last(controls.value.last) : _createVNode$9(VBtn, _mergeProps$5({
        "_as": "VPaginationBtn"
      }, controls.value.last), null)])])]
    }));
    return {};
  }
});

const {computed: computed$9,inject: inject$5,provide: provide$5,watch: watch$1} = await importShared('vue');
const makeDataTablePaginateProps = propsFactory({
  page: {
    type: [Number, String],
    default: 1
  },
  itemsPerPage: {
    type: [Number, String],
    default: 10
  }
}, 'DataTable-paginate');
const VDataTablePaginationSymbol = Symbol.for('vuetify:data-table-pagination');
function createPagination(props) {
  const page = useProxiedModel(props, 'page', undefined, value => Number(value ?? 1));
  const itemsPerPage = useProxiedModel(props, 'itemsPerPage', undefined, value => Number(value ?? 10));
  return {
    page,
    itemsPerPage
  };
}
function providePagination(options) {
  const {
    page,
    itemsPerPage,
    itemsLength
  } = options;
  const startIndex = computed$9(() => {
    if (itemsPerPage.value === -1) return 0;
    return itemsPerPage.value * (page.value - 1);
  });
  const stopIndex = computed$9(() => {
    if (itemsPerPage.value === -1) return itemsLength.value;
    return Math.min(itemsLength.value, startIndex.value + itemsPerPage.value);
  });
  const pageCount = computed$9(() => {
    if (itemsPerPage.value === -1 || itemsLength.value === 0) return 1;
    return Math.ceil(itemsLength.value / itemsPerPage.value);
  });

  // Don't run immediately, items may not have been loaded yet: #17966
  watch$1([page, pageCount], () => {
    if (page.value > pageCount.value) {
      page.value = pageCount.value;
    }
  });
  function setItemsPerPage(value) {
    itemsPerPage.value = value;
    page.value = 1;
  }
  function nextPage() {
    page.value = clamp(page.value + 1, 1, pageCount.value);
  }
  function prevPage() {
    page.value = clamp(page.value - 1, 1, pageCount.value);
  }
  function setPage(value) {
    page.value = clamp(value, 1, pageCount.value);
  }
  const data = {
    page,
    itemsPerPage,
    startIndex,
    stopIndex,
    pageCount,
    itemsLength,
    nextPage,
    prevPage,
    setPage,
    setItemsPerPage
  };
  provide$5(VDataTablePaginationSymbol, data);
  return data;
}
function usePagination() {
  const data = inject$5(VDataTablePaginationSymbol);
  if (!data) throw new Error('Missing pagination!');
  return data;
}
function usePaginatedItems(options) {
  const vm = getCurrentInstance('usePaginatedItems');
  const {
    items,
    startIndex,
    stopIndex,
    itemsPerPage
  } = options;
  const paginatedItems = computed$9(() => {
    if (itemsPerPage.value <= 0) return items.value;
    return items.value.slice(startIndex.value, stopIndex.value);
  });
  watch$1(paginatedItems, val => {
    vm.emit('update:currentItems', val);
  }, {
    immediate: true
  });
  return {
    paginatedItems
  };
}

const {createElementVNode:_createElementVNode$8,createVNode:_createVNode$8,mergeProps:_mergeProps$4} = await importShared('vue');
const {computed: computed$8} = await importShared('vue');
const makeVDataTableFooterProps = propsFactory({
  prevIcon: {
    type: IconValue,
    default: '$prev'
  },
  nextIcon: {
    type: IconValue,
    default: '$next'
  },
  firstIcon: {
    type: IconValue,
    default: '$first'
  },
  lastIcon: {
    type: IconValue,
    default: '$last'
  },
  itemsPerPageText: {
    type: String,
    default: '$vuetify.dataFooter.itemsPerPageText'
  },
  pageText: {
    type: String,
    default: '$vuetify.dataFooter.pageText'
  },
  firstPageLabel: {
    type: String,
    default: '$vuetify.dataFooter.firstPage'
  },
  prevPageLabel: {
    type: String,
    default: '$vuetify.dataFooter.prevPage'
  },
  nextPageLabel: {
    type: String,
    default: '$vuetify.dataFooter.nextPage'
  },
  lastPageLabel: {
    type: String,
    default: '$vuetify.dataFooter.lastPage'
  },
  itemsPerPageOptions: {
    type: Array,
    default: () => [{
      value: 10,
      title: '10'
    }, {
      value: 25,
      title: '25'
    }, {
      value: 50,
      title: '50'
    }, {
      value: 100,
      title: '100'
    }, {
      value: -1,
      title: '$vuetify.dataFooter.itemsPerPageAll'
    }]
  },
  showCurrentPage: Boolean
}, 'VDataTableFooter');
const VDataTableFooter = genericComponent()({
  name: 'VDataTableFooter',
  props: makeVDataTableFooterProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      t
    } = useLocale();
    const {
      page,
      pageCount,
      startIndex,
      stopIndex,
      itemsLength,
      itemsPerPage,
      setItemsPerPage
    } = usePagination();
    const itemsPerPageOptions = computed$8(() => props.itemsPerPageOptions.map(option => {
      if (typeof option === 'number') {
        return {
          value: option,
          title: option === -1 ? t('$vuetify.dataFooter.itemsPerPageAll') : String(option)
        };
      }
      return {
        ...option,
        title: !isNaN(Number(option.title)) ? option.title : t(option.title)
      };
    }));
    useRender(() => {
      const paginationProps = VPagination.filterProps(props);
      return _createElementVNode$8("div", {
        "class": "v-data-table-footer"
      }, [slots.prepend?.(), _createElementVNode$8("div", {
        "class": "v-data-table-footer__items-per-page"
      }, [_createElementVNode$8("span", {
        "aria-label": t(props.itemsPerPageText)
      }, [t(props.itemsPerPageText)]), _createVNode$8(VSelect, {
        "items": itemsPerPageOptions.value,
        "modelValue": itemsPerPage.value,
        "onUpdate:modelValue": v => setItemsPerPage(Number(v)),
        "density": "compact",
        "variant": "outlined",
        "hideDetails": true
      }, null)]), _createElementVNode$8("div", {
        "class": "v-data-table-footer__info"
      }, [_createElementVNode$8("div", null, [t(props.pageText, !itemsLength.value ? 0 : startIndex.value + 1, stopIndex.value, itemsLength.value)])]), _createElementVNode$8("div", {
        "class": "v-data-table-footer__pagination"
      }, [_createVNode$8(VPagination, _mergeProps$4({
        "modelValue": page.value,
        "onUpdate:modelValue": $event => page.value = $event,
        "density": "comfortable",
        "firstAriaLabel": props.firstPageLabel,
        "lastAriaLabel": props.lastPageLabel,
        "length": pageCount.value,
        "nextAriaLabel": props.nextPageLabel,
        "previousAriaLabel": props.prevPageLabel,
        "rounded": true,
        "showFirstLastPage": true,
        "totalVisible": props.showCurrentPage ? 1 : 0,
        "variant": "plain"
      }, paginationProps), null)])]);
    });
    return {};
  }
});

const {normalizeClass:_normalizeClass$4,createVNode:_createVNode$7} = await importShared('vue');
const VDataTableColumn = defineFunctionalComponent({
  align: {
    type: String,
    default: 'start'
  },
  fixed: {
    type: [Boolean, String],
    default: false
  },
  fixedOffset: [Number, String],
  fixedEndOffset: [Number, String],
  height: [Number, String],
  lastFixed: Boolean,
  firstFixedEnd: Boolean,
  noPadding: Boolean,
  indent: [Number, String],
  empty: Boolean,
  tag: String,
  width: [Number, String],
  maxWidth: [Number, String],
  nowrap: Boolean
}, (props, _ref) => {
  let {
    slots
  } = _ref;
  const Tag = props.tag ?? 'td';
  const fixedSide = typeof props.fixed === 'string' ? props.fixed : props.fixed ? 'start' : 'none';
  return _createVNode$7(Tag, {
    "class": _normalizeClass$4(['v-data-table__td', {
      'v-data-table-column--fixed': fixedSide === 'start',
      'v-data-table-column--fixed-end': fixedSide === 'end',
      'v-data-table-column--last-fixed': props.lastFixed,
      'v-data-table-column--first-fixed-end': props.firstFixedEnd,
      'v-data-table-column--no-padding': props.noPadding,
      'v-data-table-column--nowrap': props.nowrap,
      'v-data-table-column--empty': props.empty
    }, `v-data-table-column--align-${props.align}`]),
    "style": {
      height: convertToUnit(props.height),
      width: convertToUnit(props.width),
      maxWidth: convertToUnit(props.maxWidth),
      left: fixedSide === 'start' ? convertToUnit(props.fixedOffset || null) : undefined,
      right: fixedSide === 'end' ? convertToUnit(props.fixedEndOffset || null) : undefined,
      paddingInlineStart: props.indent ? convertToUnit(props.indent) : undefined
    }
  }, {
    default: () => [slots.default?.()]
  });
});

// Utilities
const {capitalize,inject: inject$4,provide: provide$4,ref: ref$2,watchEffect: watchEffect$1} = await importShared('vue');
const makeDataTableHeaderProps = propsFactory({
  headers: Array
}, 'DataTable-header');
const VDataTableHeadersSymbol = Symbol.for('vuetify:data-table-headers');
const defaultHeader = {
  title: '',
  sortable: false
};
const defaultActionHeader = {
  ...defaultHeader,
  width: 48
};
function priorityQueue() {
  let arr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  const queue = arr.map(element => ({
    element,
    priority: 0
  }));
  return {
    enqueue: (element, priority) => {
      let added = false;
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        if (item.priority > priority) {
          queue.splice(i, 0, {
            element,
            priority
          });
          added = true;
          break;
        }
      }
      if (!added) queue.push({
        element,
        priority
      });
    },
    size: () => queue.length,
    count: () => {
      let count = 0;
      if (!queue.length) return 0;
      const whole = Math.floor(queue[0].priority);
      for (let i = 0; i < queue.length; i++) {
        if (Math.floor(queue[i].priority) === whole) count += 1;
      }
      return count;
    },
    dequeue: () => {
      return queue.shift();
    }
  };
}
function extractLeaves(item) {
  let columns = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  if (!item.children) {
    columns.push(item);
  } else {
    for (const child of item.children) {
      extractLeaves(child, columns);
    }
  }
  return columns;
}
function extractKeys(headers) {
  let keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Set();
  for (const item of headers) {
    if (item.key) keys.add(item.key);
    if (item.children) {
      extractKeys(item.children, keys);
    }
  }
  return keys;
}
function getDefaultItem(item) {
  if (!item.key) return undefined;
  if (item.key === 'data-table-group') return defaultHeader;
  if (['data-table-expand', 'data-table-select'].includes(item.key)) return defaultActionHeader;
  return undefined;
}
function getDepth(item) {
  let depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  if (!item.children) return depth;
  return Math.max(depth, ...item.children.map(child => getDepth(child, depth + 1)));
}
function parseFixedColumns(items) {
  let seenFixed = false;
  function setFixed(item, side) {
    let parentFixedSide = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'none';
    if (!item) return;
    if (parentFixedSide !== 'none') {
      item.fixed = parentFixedSide;
    }

    // normalize to simplify logic below
    if (item.fixed === true) {
      item.fixed = 'start';
    }
    if (item.fixed === side) {
      if (item.children) {
        if (side === 'start') {
          for (let i = item.children.length - 1; i >= 0; i--) {
            setFixed(item.children[i], side, side);
          }
        } else {
          for (let i = 0; i < item.children.length; i++) {
            setFixed(item.children[i], side, side);
          }
        }
      } else {
        if (!seenFixed && side === 'start') {
          item.lastFixed = true;
        } else if (!seenFixed && side === 'end') {
          item.firstFixedEnd = true;
        } else if (isNaN(Number(item.width))) {
          consoleError(`Multiple fixed columns should have a static width (key: ${item.key})`);
        } else {
          item.minWidth = Math.max(Number(item.width) || 0, Number(item.minWidth) || 0);
        }
        seenFixed = true;
      }
    } else {
      if (item.children) {
        if (side === 'start') {
          for (let i = item.children.length - 1; i >= 0; i--) {
            setFixed(item.children[i], side);
          }
        } else {
          for (let i = 0; i < item.children.length; i++) {
            setFixed(item.children[i], side);
          }
        }
      } else {
        seenFixed = false;
      }
    }
  }
  for (let i = items.length - 1; i >= 0; i--) {
    setFixed(items[i], 'start');
  }
  for (let i = 0; i < items.length; i++) {
    setFixed(items[i], 'end');
  }
  let fixedOffset = 0;
  for (let i = 0; i < items.length; i++) {
    fixedOffset = setFixedOffset(items[i], fixedOffset);
  }
  let fixedEndOffset = 0;
  for (let i = items.length - 1; i >= 0; i--) {
    fixedEndOffset = setFixedEndOffset(items[i], fixedEndOffset);
  }
}
function setFixedOffset(item) {
  let offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  if (!item) return offset;
  if (item.children) {
    item.fixedOffset = offset;
    for (const child of item.children) {
      offset = setFixedOffset(child, offset);
    }
  } else if (item.fixed && item.fixed !== 'end') {
    item.fixedOffset = offset;
    offset += parseFloat(item.width || '0') || 0;
  }
  return offset;
}
function setFixedEndOffset(item) {
  let offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  if (!item) return offset;
  if (item.children) {
    item.fixedEndOffset = offset;
    for (const child of item.children) {
      offset = setFixedEndOffset(child, offset);
    }
  } else if (item.fixed === 'end') {
    item.fixedEndOffset = offset;
    offset += parseFloat(item.width || '0') || 0;
  }
  return offset;
}
function parse(items, maxDepth) {
  const headers = [];
  let currentDepth = 0;
  const queue = priorityQueue(items);
  while (queue.size() > 0) {
    let rowSize = queue.count();
    const row = [];
    let fraction = 1;
    while (rowSize > 0) {
      const {
        element: item,
        priority
      } = queue.dequeue();
      const diff = maxDepth - currentDepth - getDepth(item);
      row.push({
        ...item,
        rowspan: diff ?? 1,
        colspan: item.children ? extractLeaves(item).length : 1
      });
      if (item.children) {
        for (const child of item.children) {
          // This internally sorts items that are on the same priority "row"
          const sort = priority % 1 + fraction / Math.pow(10, currentDepth + 2);
          queue.enqueue(child, currentDepth + diff + sort);
        }
      }
      fraction += 1;
      rowSize -= 1;
    }
    currentDepth += 1;
    headers.push(row);
  }
  const columns = items.map(item => extractLeaves(item)).flat();
  return {
    columns,
    headers
  };
}
function convertToInternalHeaders(items) {
  const internalHeaders = [];
  for (const item of items) {
    const defaultItem = {
      ...getDefaultItem(item),
      ...item
    };
    const key = defaultItem.key ?? (typeof defaultItem.value === 'string' ? defaultItem.value : null);
    const value = defaultItem.value ?? key ?? null;
    const internalItem = {
      ...defaultItem,
      key,
      value,
      sortable: defaultItem.sortable ?? (defaultItem.key != null || !!defaultItem.sort),
      children: defaultItem.children ? convertToInternalHeaders(defaultItem.children) : undefined
    };
    internalHeaders.push(internalItem);
  }
  return internalHeaders;
}
function createHeaders(props, options) {
  const headers = ref$2([]);
  const columns = ref$2([]);
  const sortFunctions = ref$2({});
  const sortRawFunctions = ref$2({});
  const filterFunctions = ref$2({});
  watchEffect$1(() => {
    const _headers = props.headers || Object.keys(props.items[0] ?? {}).map(key => ({
      key,
      title: capitalize(key)
    }));
    const items = _headers.slice();
    const keys = extractKeys(items);
    if (options?.groupBy?.value.length && !keys.has('data-table-group')) {
      items.unshift({
        key: 'data-table-group',
        title: 'Group'
      });
    }
    if (options?.showSelect?.value && !keys.has('data-table-select')) {
      items.unshift({
        key: 'data-table-select'
      });
    }
    if (options?.showExpand?.value && !keys.has('data-table-expand')) {
      items.push({
        key: 'data-table-expand'
      });
    }
    const internalHeaders = convertToInternalHeaders(items);
    parseFixedColumns(internalHeaders);
    const maxDepth = Math.max(...internalHeaders.map(item => getDepth(item))) + 1;
    const parsed = parse(internalHeaders, maxDepth);
    headers.value = parsed.headers;
    columns.value = parsed.columns;
    const flatHeaders = parsed.headers.flat(1);
    for (const header of flatHeaders) {
      if (!header.key) continue;
      if (header.sortable) {
        if (header.sort) {
          sortFunctions.value[header.key] = header.sort;
        }
        if (header.sortRaw) {
          sortRawFunctions.value[header.key] = header.sortRaw;
        }
      }
      if (header.filter) {
        filterFunctions.value[header.key] = header.filter;
      }
    }
  });
  const data = {
    headers,
    columns,
    sortFunctions,
    sortRawFunctions,
    filterFunctions
  };
  provide$4(VDataTableHeadersSymbol, data);
  return data;
}
function useHeaders() {
  const data = inject$4(VDataTableHeadersSymbol);
  if (!data) throw new Error('Missing headers!');
  return data;
}

const {computed: computed$7,inject: inject$3,provide: provide$3,shallowRef: shallowRef$1,toRef: toRef$4} = await importShared('vue');
const singleSelectStrategy = {
  showSelectAll: false,
  allSelected: () => [],
  select: _ref => {
    let {
      items,
      value
    } = _ref;
    return new Set(value ? [items[0]?.value] : []);
  },
  selectAll: _ref2 => {
    let {
      selected
    } = _ref2;
    return selected;
  }
};
const pageSelectStrategy = {
  showSelectAll: true,
  allSelected: _ref3 => {
    let {
      currentPage
    } = _ref3;
    return currentPage;
  },
  select: _ref4 => {
    let {
      items,
      value,
      selected
    } = _ref4;
    for (const item of items) {
      if (value) selected.add(item.value);else selected.delete(item.value);
    }
    return selected;
  },
  selectAll: _ref5 => {
    let {
      value,
      currentPage,
      selected
    } = _ref5;
    return pageSelectStrategy.select({
      items: currentPage,
      value,
      selected
    });
  }
};
const allSelectStrategy = {
  showSelectAll: true,
  allSelected: _ref6 => {
    let {
      allItems
    } = _ref6;
    return allItems;
  },
  select: _ref7 => {
    let {
      items,
      value,
      selected
    } = _ref7;
    for (const item of items) {
      if (value) selected.add(item.value);else selected.delete(item.value);
    }
    return selected;
  },
  selectAll: _ref8 => {
    let {
      value,
      allItems
    } = _ref8;
    return new Set(value ? allItems.map(item => item.value) : []);
  }
};
const makeDataTableSelectProps = propsFactory({
  showSelect: Boolean,
  selectStrategy: {
    type: [String, Object],
    default: 'page'
  },
  modelValue: {
    type: Array,
    default: () => []
  },
  valueComparator: Function
}, 'DataTable-select');
const VDataTableSelectionSymbol = Symbol.for('vuetify:data-table-selection');
function provideSelection(props, _ref9) {
  let {
    allItems,
    currentPage
  } = _ref9;
  const selected = useProxiedModel(props, 'modelValue', props.modelValue, v => {
    const customComparator = props.valueComparator;
    if (customComparator) {
      return new Set(wrapInArray(v).map(v => {
        return allItems.value.find(item => customComparator(v, item.value))?.value ?? v;
      }));
    }
    return new Set(wrapInArray(v).map(v => {
      return isPrimitive(v) ? allItems.value.find(item => v === item.value)?.value ?? v : allItems.value.find(item => deepEqual(v, item.value))?.value ?? v;
    }));
  }, v => {
    return [...v.values()];
  });
  const allSelectable = computed$7(() => allItems.value.filter(item => item.selectable));
  const currentPageSelectable = computed$7(() => currentPage.value.filter(item => item.selectable));
  const selectStrategy = computed$7(() => {
    if (typeof props.selectStrategy === 'object') return props.selectStrategy;
    switch (props.selectStrategy) {
      case 'single':
        return singleSelectStrategy;
      case 'all':
        return allSelectStrategy;
      case 'page':
      default:
        return pageSelectStrategy;
    }
  });
  const lastSelectedIndex = shallowRef$1(null);
  function isSelected(items) {
    return wrapInArray(items).every(item => selected.value.has(item.value));
  }
  function isSomeSelected(items) {
    return wrapInArray(items).some(item => selected.value.has(item.value));
  }
  function select(items, value) {
    const newSelected = selectStrategy.value.select({
      items,
      value,
      selected: new Set(selected.value)
    });
    selected.value = newSelected;
  }
  function toggleSelect(item, index, event) {
    const items = [];
    index = index ?? currentPage.value.findIndex(i => i.value === item.value);
    if (props.selectStrategy !== 'single' && event?.shiftKey && lastSelectedIndex.value !== null) {
      const [start, end] = [lastSelectedIndex.value, index].sort((a, b) => a - b);
      items.push(...currentPage.value.slice(start, end + 1).filter(item => item.selectable));
    } else {
      items.push(item);
      lastSelectedIndex.value = index;
    }
    select(items, !isSelected([item]));
  }
  function selectAll(value) {
    const newSelected = selectStrategy.value.selectAll({
      value,
      allItems: allSelectable.value,
      currentPage: currentPageSelectable.value,
      selected: new Set(selected.value)
    });
    selected.value = newSelected;
  }
  const someSelected = computed$7(() => selected.value.size > 0);
  const allSelected = computed$7(() => {
    const items = selectStrategy.value.allSelected({
      allItems: allSelectable.value,
      currentPage: currentPageSelectable.value
    });
    return !!items.length && isSelected(items);
  });
  const showSelectAll = toRef$4(() => selectStrategy.value.showSelectAll);
  const data = {
    toggleSelect,
    select,
    selectAll,
    isSelected,
    isSomeSelected,
    someSelected,
    allSelected,
    showSelectAll,
    lastSelectedIndex,
    selectStrategy
  };
  provide$3(VDataTableSelectionSymbol, data);
  return data;
}
function useSelection() {
  const data = inject$3(VDataTableSelectionSymbol);
  if (!data) throw new Error('Missing selection!');
  return data;
}

const {computed: computed$6,inject: inject$2,provide: provide$2,toRef: toRef$3} = await importShared('vue');
const makeDataTableSortProps = propsFactory({
  sortBy: {
    type: Array,
    default: () => []
  },
  customKeySort: Object,
  multiSort: Boolean,
  mustSort: Boolean
}, 'DataTable-sort');
const VDataTableSortSymbol = Symbol.for('vuetify:data-table-sort');
function createSort(props) {
  const sortBy = useProxiedModel(props, 'sortBy');
  const mustSort = toRef$3(() => props.mustSort);
  const multiSort = toRef$3(() => props.multiSort);
  return {
    sortBy,
    mustSort,
    multiSort
  };
}
function provideSort(options) {
  const {
    sortBy,
    mustSort,
    multiSort,
    page
  } = options;
  const toggleSort = column => {
    if (column.key == null) return;
    let newSortBy = sortBy.value.map(x => ({
      ...x
    })) ?? [];
    const item = newSortBy.find(x => x.key === column.key);
    if (!item) {
      if (multiSort.value) {
        newSortBy.push({
          key: column.key,
          order: 'asc'
        });
      } else {
        newSortBy = [{
          key: column.key,
          order: 'asc'
        }];
      }
    } else if (item.order === 'desc') {
      if (mustSort.value && newSortBy.length === 1) {
        item.order = 'asc';
      } else {
        newSortBy = newSortBy.filter(x => x.key !== column.key);
      }
    } else {
      item.order = 'desc';
    }
    sortBy.value = newSortBy;
    if (page) page.value = 1;
  };
  function isSorted(column) {
    return !!sortBy.value.find(item => item.key === column.key);
  }
  const data = {
    sortBy,
    toggleSort,
    isSorted
  };
  provide$2(VDataTableSortSymbol, data);
  return data;
}
function useSort() {
  const data = inject$2(VDataTableSortSymbol);
  if (!data) throw new Error('Missing sort!');
  return data;
}

// TODO: abstract into project composable
function useSortedItems(props, items, sortBy, options) {
  const locale = useLocale();
  const sortedItems = computed$6(() => {
    if (!sortBy.value.length) return items.value;
    return sortItems(items.value, sortBy.value, locale.current.value, {
      transform: options?.transform,
      sortFunctions: {
        ...props.customKeySort,
        ...options?.sortFunctions?.value
      },
      sortRawFunctions: options?.sortRawFunctions?.value
    });
  });
  return {
    sortedItems
  };
}
function sortItems(items, sortByItems, locale, options) {
  const stringCollator = new Intl.Collator(locale, {
    sensitivity: 'accent',
    usage: 'sort'
  });
  const transformedItems = items.map(item => [item, options?.transform ? options.transform(item) : item]);
  return transformedItems.sort((a, b) => {
    for (let i = 0; i < sortByItems.length; i++) {
      let hasCustomResult = false;
      const sortKey = sortByItems[i].key;
      const sortOrder = sortByItems[i].order ?? 'asc';
      if (sortOrder === false) continue;
      let sortA = getObjectValueByPath(a[1], sortKey);
      let sortB = getObjectValueByPath(b[1], sortKey);
      let sortARaw = a[0].raw;
      let sortBRaw = b[0].raw;
      if (sortOrder === 'desc') {
        [sortA, sortB] = [sortB, sortA];
        [sortARaw, sortBRaw] = [sortBRaw, sortARaw];
      }
      if (options?.sortRawFunctions?.[sortKey]) {
        const customResult = options.sortRawFunctions[sortKey](sortARaw, sortBRaw);
        if (customResult == null) continue;
        hasCustomResult = true;
        if (customResult) return customResult;
      }
      if (options?.sortFunctions?.[sortKey]) {
        const customResult = options.sortFunctions[sortKey](sortA, sortB);
        if (customResult == null) continue;
        hasCustomResult = true;
        if (customResult) return customResult;
      }
      if (hasCustomResult) continue;

      // Dates should be compared numerically
      if (sortA instanceof Date && sortB instanceof Date) {
        sortA = sortA.getTime();
        sortB = sortB.getTime();
      }
      [sortA, sortB] = [sortA, sortB].map(s => s != null ? s.toString().toLocaleLowerCase() : s);
      if (sortA !== sortB) {
        if (isEmpty(sortA) && isEmpty(sortB)) return 0;
        if (isEmpty(sortA)) return -1;
        if (isEmpty(sortB)) return 1;
        if (!isNaN(sortA) && !isNaN(sortB)) return Number(sortA) - Number(sortB);
        return stringCollator.compare(sortA, sortB);
      }
    }
    return 0;
  }).map(_ref => {
    let [item] = _ref;
    return item;
  });
}

const {createVNode:_createVNode$6,createElementVNode:_createElementVNode$7,normalizeClass:_normalizeClass$3,normalizeStyle:_normalizeStyle$1,mergeProps:_mergeProps$3,Fragment:_Fragment$4} = await importShared('vue');
const {computed: computed$5,mergeProps: mergeProps$1} = await importShared('vue');
const makeVDataTableHeadersProps = propsFactory({
  color: String,
  disableSort: Boolean,
  fixedHeader: Boolean,
  multiSort: Boolean,
  sortAscIcon: {
    type: IconValue,
    default: '$sortAsc'
  },
  sortDescIcon: {
    type: IconValue,
    default: '$sortDesc'
  },
  headerProps: {
    type: Object
  },
  /** @deprecated */
  sticky: Boolean,
  ...makeDensityProps(),
  ...makeDisplayProps(),
  ...makeLoaderProps()
}, 'VDataTableHeaders');
const VDataTableHeaders = genericComponent()({
  name: 'VDataTableHeaders',
  props: makeVDataTableHeadersProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      t
    } = useLocale();
    const {
      toggleSort,
      sortBy,
      isSorted
    } = useSort();
    const {
      someSelected,
      allSelected,
      selectAll,
      showSelectAll
    } = useSelection();
    const {
      columns,
      headers
    } = useHeaders();
    const {
      loaderClasses
    } = useLoader(props);
    function getFixedStyles(column, y) {
      if (!(props.sticky || props.fixedHeader) && !column.fixed) return undefined;
      const fixedSide = typeof column.fixed === 'string' ? column.fixed : column.fixed ? 'start' : 'none';
      return {
        position: 'sticky',
        left: fixedSide === 'start' ? convertToUnit(column.fixedOffset) : undefined,
        right: fixedSide === 'end' ? convertToUnit(column.fixedEndOffset) : undefined,
        top: props.sticky || props.fixedHeader ? `calc(var(--v-table-header-height) * ${y})` : undefined
      };
    }
    function handleEnterKeyPress(event, column) {
      if (event.key === 'Enter' && !props.disableSort) {
        toggleSort(column);
      }
    }
    function getSortIcon(column) {
      const item = sortBy.value.find(item => item.key === column.key);
      if (!item) return props.sortAscIcon;
      return item.order === 'asc' ? props.sortAscIcon : props.sortDescIcon;
    }
    const {
      backgroundColorClasses,
      backgroundColorStyles
    } = useBackgroundColor(() => props.color);
    const {
      displayClasses,
      mobile
    } = useDisplay(props);
    const slotProps = computed$5(() => ({
      headers: headers.value,
      columns: columns.value,
      toggleSort,
      isSorted,
      sortBy: sortBy.value,
      someSelected: someSelected.value,
      allSelected: allSelected.value,
      selectAll,
      getSortIcon
    }));
    const headerCellClasses = computed$5(() => ['v-data-table__th', {
      'v-data-table__th--sticky': props.sticky || props.fixedHeader
    }, displayClasses.value, loaderClasses.value]);
    const VDataTableHeaderCell = _ref2 => {
      let {
        column,
        x,
        y
      } = _ref2;
      const noPadding = column.key === 'data-table-select' || column.key === 'data-table-expand';
      const isEmpty = column.key === 'data-table-group' && column.width === 0 && !column.title;
      const headerProps = mergeProps$1(props.headerProps ?? {}, column.headerProps ?? {});
      return _createVNode$6(VDataTableColumn, _mergeProps$3({
        "tag": "th",
        "align": column.align,
        "class": [{
          'v-data-table__th--sortable': column.sortable && !props.disableSort,
          'v-data-table__th--sorted': isSorted(column),
          'v-data-table__th--fixed': column.fixed
        }, ...headerCellClasses.value],
        "style": {
          width: convertToUnit(column.width),
          minWidth: convertToUnit(column.minWidth),
          maxWidth: convertToUnit(column.maxWidth),
          ...getFixedStyles(column, y)
        },
        "colspan": column.colspan,
        "rowspan": column.rowspan,
        "fixed": column.fixed,
        "nowrap": column.nowrap,
        "lastFixed": column.lastFixed,
        "firstFixedEnd": column.firstFixedEnd,
        "noPadding": noPadding,
        "empty": isEmpty,
        "tabindex": column.sortable ? 0 : undefined,
        "onClick": column.sortable ? () => toggleSort(column) : undefined,
        "onKeydown": column.sortable ? event => handleEnterKeyPress(event, column) : undefined
      }, headerProps), {
        default: () => {
          const columnSlotName = `header.${column.key}`;
          const columnSlotProps = {
            column,
            selectAll,
            isSorted,
            toggleSort,
            sortBy: sortBy.value,
            someSelected: someSelected.value,
            allSelected: allSelected.value,
            getSortIcon
          };
          if (slots[columnSlotName]) return slots[columnSlotName](columnSlotProps);
          if (isEmpty) return '';
          if (column.key === 'data-table-select') {
            return slots['header.data-table-select']?.(columnSlotProps) ?? (showSelectAll.value && _createVNode$6(VCheckboxBtn, {
              "density": props.density,
              "modelValue": allSelected.value,
              "indeterminate": someSelected.value && !allSelected.value,
              "onUpdate:modelValue": selectAll
            }, null));
          }
          return _createElementVNode$7("div", {
            "class": "v-data-table-header__content"
          }, [_createElementVNode$7("span", null, [column.title]), column.sortable && !props.disableSort && _createVNode$6(VIcon, {
            "key": "icon",
            "class": "v-data-table-header__sort-icon",
            "icon": getSortIcon(column)
          }, null), props.multiSort && isSorted(column) && _createElementVNode$7("div", {
            "key": "badge",
            "class": _normalizeClass$3(['v-data-table-header__sort-badge', ...backgroundColorClasses.value]),
            "style": _normalizeStyle$1(backgroundColorStyles.value)
          }, [sortBy.value.findIndex(x => x.key === column.key) + 1])]);
        }
      });
    };
    const VDataTableMobileHeaderCell = () => {
      const displayItems = computed$5(() => {
        return columns.value.filter(column => column?.sortable && !props.disableSort);
      });
      const appendIcon = computed$5(() => {
        const showSelectColumn = columns.value.find(column => column.key === 'data-table-select');
        if (showSelectColumn == null) return;
        return allSelected.value ? '$checkboxOn' : someSelected.value ? '$checkboxIndeterminate' : '$checkboxOff';
      });
      return _createVNode$6(VDataTableColumn, _mergeProps$3({
        "tag": "th",
        "class": [...headerCellClasses.value],
        "colspan": headers.value.length + 1
      }, props.headerProps), {
        default: () => [_createElementVNode$7("div", {
          "class": "v-data-table-header__content"
        }, [_createVNode$6(VSelect, {
          "chips": true,
          "class": "v-data-table__td-sort-select",
          "clearable": true,
          "density": "default",
          "items": displayItems.value,
          "label": t('$vuetify.dataTable.sortBy'),
          "multiple": props.multiSort,
          "variant": "underlined",
          "onClick:clear": () => sortBy.value = [],
          "appendIcon": appendIcon.value,
          "onClick:append": () => selectAll(!allSelected.value)
        }, {
          chip: props => _createVNode$6(VChip, {
            "onClick": props.item.raw?.sortable ? () => toggleSort(props.item.raw) : undefined,
            "onMousedown": e => {
              e.preventDefault();
              e.stopPropagation();
            }
          }, {
            default: () => [props.item.title, _createVNode$6(VIcon, {
              "class": _normalizeClass$3(['v-data-table__td-sort-icon', isSorted(props.item.raw) && 'v-data-table__td-sort-icon-active']),
              "icon": getSortIcon(props.item.raw),
              "size": "small"
            }, null)]
          })
        })])]
      });
    };
    useRender(() => {
      return mobile.value ? _createElementVNode$7("tr", null, [_createVNode$6(VDataTableMobileHeaderCell, null, null)]) : _createElementVNode$7(_Fragment$4, null, [slots.headers ? slots.headers(slotProps.value) : headers.value.map((row, y) => _createElementVNode$7("tr", null, [row.map((column, x) => _createVNode$6(VDataTableHeaderCell, {
        "column": column,
        "x": x,
        "y": y
      }, null))])), props.loading && _createElementVNode$7("tr", {
        "class": "v-data-table-progress"
      }, [_createElementVNode$7("th", {
        "colspan": columns.value.length
      }, [_createVNode$6(LoaderSlot, {
        "name": "v-data-table-progress",
        "absolute": true,
        "active": true,
        "color": typeof props.loading === 'boolean' ? undefined : props.loading,
        "indeterminate": true
      }, {
        default: slots.loader
      })])])]);
    });
  }
});

const {computed: computed$4,inject: inject$1,provide: provide$1,ref: ref$1,toValue} = await importShared('vue');
const makeDataTableGroupProps = propsFactory({
  groupBy: {
    type: Array,
    default: () => []
  }
}, 'DataTable-group');
const VDataTableGroupSymbol = Symbol.for('vuetify:data-table-group');
function createGroupBy(props) {
  const groupBy = useProxiedModel(props, 'groupBy');
  return {
    groupBy
  };
}
function provideGroupBy(options) {
  const {
    disableSort,
    groupBy,
    sortBy
  } = options;
  const opened = ref$1(new Set());
  const sortByWithGroups = computed$4(() => {
    return groupBy.value.map(val => ({
      ...val,
      order: val.order ?? false
    })).concat(disableSort?.value ? [] : sortBy.value);
  });
  function isGroupOpen(group) {
    return opened.value.has(group.id);
  }
  function toggleGroup(group) {
    const newOpened = new Set(opened.value);
    if (!isGroupOpen(group)) newOpened.add(group.id);else newOpened.delete(group.id);
    opened.value = newOpened;
  }
  function extractRows(items) {
    function dive(group) {
      const arr = [];
      for (const item of group.items) {
        if ('type' in item && item.type === 'group') {
          arr.push(...dive(item));
        } else {
          arr.push(item);
        }
      }
      return [...new Set(arr)];
    }
    return dive({
      items});
  }

  // onBeforeMount(() => {
  //   for (const key of groupedItems.value.keys()) {
  //     opened.value.add(key)
  //   }
  // })

  const data = {
    sortByWithGroups,
    toggleGroup,
    opened,
    groupBy,
    extractRows,
    isGroupOpen
  };
  provide$1(VDataTableGroupSymbol, data);
  return data;
}
function useGroupBy() {
  const data = inject$1(VDataTableGroupSymbol);
  if (!data) throw new Error('Missing group!');
  return data;
}
function groupItemsByProperty(items, groupBy) {
  if (!items.length) return [];
  const groups = new Map();
  for (const item of items) {
    const value = getObjectValueByPath(item.raw, groupBy);
    if (!groups.has(value)) {
      groups.set(value, []);
    }
    groups.get(value).push(item);
  }
  return groups;
}
function groupItems(items, groupBy) {
  let depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  let prefix = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'root';
  if (!groupBy.length) return [];
  const groupedItems = groupItemsByProperty(items, groupBy[0]);
  const groups = [];
  const rest = groupBy.slice(1);
  groupedItems.forEach((items, value) => {
    const key = groupBy[0];
    const id = `${prefix}_${key}_${value}`;
    groups.push({
      depth,
      id,
      key,
      value,
      items: rest.length ? groupItems(items, rest, depth + 1, id) : items,
      type: 'group'
    });
  });
  return groups;
}
function flattenItems(items, opened, hasSummary) {
  const flatItems = [];
  for (const item of items) {
    // TODO: make this better
    if ('type' in item && item.type === 'group') {
      if (item.value != null) {
        flatItems.push(item);
      }
      if (opened.has(item.id) || item.value == null) {
        flatItems.push(...flattenItems(item.items, opened, hasSummary));
        if (hasSummary) {
          flatItems.push({
            ...item,
            type: 'group-summary'
          });
        }
      }
    } else {
      flatItems.push(item);
    }
  }
  return flatItems;
}
function useGroupedItems(items, groupBy, opened, hasSummary) {
  const flatItems = computed$4(() => {
    if (!groupBy.value.length) return items.value;
    const groupedItems = groupItems(items.value, groupBy.value.map(item => item.key));
    return flattenItems(groupedItems, opened.value, toValue(hasSummary));
  });
  return {
    flatItems
  };
}

const {createVNode:_createVNode$5,createElementVNode:_createElementVNode$6,createTextVNode:_createTextVNode$1} = await importShared('vue');
const {computed: computed$3,toRef: toRef$2} = await importShared('vue');
const makeVDataTableGroupHeaderRowProps = propsFactory({
  item: {
    type: Object,
    required: true
  },
  groupCollapseIcon: {
    type: IconValue,
    default: '$tableGroupCollapse'
  },
  groupExpandIcon: {
    type: IconValue,
    default: '$tableGroupExpand'
  },
  ...makeDensityProps()
}, 'VDataTableGroupHeaderRow');
const VDataTableGroupHeaderRow = genericComponent()({
  name: 'VDataTableGroupHeaderRow',
  props: makeVDataTableGroupHeaderRowProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      isGroupOpen,
      toggleGroup,
      extractRows
    } = useGroupBy();
    const {
      isSelected,
      isSomeSelected,
      select
    } = useSelection();
    const {
      columns
    } = useHeaders();
    const rows = computed$3(() => {
      return extractRows([props.item]);
    });
    const colspan = toRef$2(() => columns.value.length - (columns.value.some(c => c.key === 'data-table-select') ? 1 : 0));
    return () => _createElementVNode$6("tr", {
      "class": "v-data-table-group-header-row",
      "style": {
        '--v-data-table-group-header-row-depth': props.item.depth
      }
    }, [columns.value.map(column => {
      if (column.key === 'data-table-group') {
        const icon = isGroupOpen(props.item) ? props.groupCollapseIcon : props.groupExpandIcon;
        const onClick = () => toggleGroup(props.item);
        return slots['data-table-group']?.({
          item: props.item,
          count: rows.value.length,
          props: {
            icon,
            onClick
          }
        }) ?? _createVNode$5(VDataTableColumn, {
          "class": "v-data-table-group-header-row__column",
          "colspan": colspan.value
        }, {
          default: () => [_createVNode$5(VBtn, {
            "size": "small",
            "variant": "text",
            "icon": icon,
            "onClick": onClick
          }, null), _createElementVNode$6("span", null, [props.item.value]), _createElementVNode$6("span", null, [_createTextVNode$1("("), rows.value.length, _createTextVNode$1(")")])]
        });
      } else if (column.key === 'data-table-select') {
        const modelValue = isSelected(rows.value);
        const indeterminate = isSomeSelected(rows.value) && !modelValue;
        const selectGroup = v => select(rows.value, v);
        return slots['data-table-select']?.({
          props: {
            modelValue,
            indeterminate,
            'onUpdate:modelValue': selectGroup
          }
        }) ?? _createVNode$5(VDataTableColumn, {
          "class": "v-data-table__td--select-row",
          "noPadding": true
        }, {
          default: () => [_createVNode$5(VCheckboxBtn, {
            "density": props.density,
            "modelValue": modelValue,
            "indeterminate": indeterminate,
            "onUpdate:modelValue": selectGroup
          }, null)]
        });
      }
      return '';
    })]);
  }
});

const {inject,provide,toRaw,toRef: toRef$1} = await importShared('vue');
const makeDataTableExpandProps = propsFactory({
  expandOnClick: Boolean,
  showExpand: Boolean,
  expanded: {
    type: Array,
    default: () => []
  }
}, 'DataTable-expand');
const VDataTableExpandedKey = Symbol.for('vuetify:datatable:expanded');
function provideExpanded(props) {
  const expandOnClick = toRef$1(() => props.expandOnClick);
  const expanded = useProxiedModel(props, 'expanded', props.expanded, v => {
    return new Set(v);
  }, v => {
    return [...v.values()];
  });
  function expand(item, value) {
    const newExpanded = new Set(expanded.value);
    const rawValue = toRaw(item.value);
    if (!value) {
      const item = [...expanded.value].find(x => toRaw(x) === rawValue);
      newExpanded.delete(item);
    } else {
      newExpanded.add(rawValue);
    }
    expanded.value = newExpanded;
  }
  function isExpanded(item) {
    const rawValue = toRaw(item.value);
    return [...expanded.value].some(x => toRaw(x) === rawValue);
  }
  function toggleExpand(item) {
    expand(item, !isExpanded(item));
  }
  const data = {
    expand,
    expanded,
    expandOnClick,
    isExpanded,
    toggleExpand
  };
  provide(VDataTableExpandedKey, data);
  return data;
}
function useExpanded() {
  const data = inject(VDataTableExpandedKey);
  if (!data) throw new Error('foo');
  return data;
}

const {createVNode:_createVNode$4,Fragment:_Fragment$3,createElementVNode:_createElementVNode$5,mergeProps:_mergeProps$2,normalizeClass:_normalizeClass$2} = await importShared('vue');
const {toDisplayString,withModifiers} = await importShared('vue');
const makeVDataTableRowProps = propsFactory({
  index: Number,
  item: Object,
  cellProps: [Object, Function],
  collapseIcon: {
    type: IconValue,
    default: '$collapse'
  },
  expandIcon: {
    type: IconValue,
    default: '$expand'
  },
  onClick: EventProp(),
  onContextmenu: EventProp(),
  onDblclick: EventProp(),
  ...makeDensityProps(),
  ...makeDisplayProps()
}, 'VDataTableRow');
const VDataTableRow = genericComponent()({
  name: 'VDataTableRow',
  props: makeVDataTableRowProps(),
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      displayClasses,
      mobile
    } = useDisplay(props, 'v-data-table__tr');
    const {
      isSelected,
      toggleSelect,
      someSelected,
      allSelected,
      selectAll
    } = useSelection();
    const {
      isExpanded,
      toggleExpand
    } = useExpanded();
    const {
      toggleSort,
      sortBy,
      isSorted
    } = useSort();
    const {
      columns
    } = useHeaders();
    useRender(() => _createElementVNode$5("tr", {
      "class": _normalizeClass$2(['v-data-table__tr', {
        'v-data-table__tr--clickable': !!(props.onClick || props.onContextmenu || props.onDblclick)
      }, displayClasses.value]),
      "onClick": props.onClick,
      "onContextmenu": props.onContextmenu,
      "onDblclick": props.onDblclick
    }, [props.item && columns.value.map((column, i) => {
      const item = props.item;
      const slotName = `item.${column.key}`;
      const headerSlotName = `header.${column.key}`;
      const slotProps = {
        index: props.index,
        item: item.raw,
        internalItem: item,
        value: getObjectValueByPath(item.columns, column.key),
        column,
        isSelected,
        toggleSelect,
        isExpanded,
        toggleExpand
      };
      const columnSlotProps = {
        column,
        selectAll,
        isSorted,
        toggleSort,
        sortBy: sortBy.value,
        someSelected: someSelected.value,
        allSelected: allSelected.value,
        getSortIcon: () => ''
      };
      const cellProps = typeof props.cellProps === 'function' ? props.cellProps({
        index: slotProps.index,
        item: slotProps.item,
        internalItem: slotProps.internalItem,
        value: slotProps.value,
        column
      }) : props.cellProps;
      const columnCellProps = typeof column.cellProps === 'function' ? column.cellProps({
        index: slotProps.index,
        item: slotProps.item,
        internalItem: slotProps.internalItem,
        value: slotProps.value
      }) : column.cellProps;
      const noPadding = column.key === 'data-table-select' || column.key === 'data-table-expand';
      const isEmpty = column.key === 'data-table-group' && column.width === 0 && !column.title;
      return _createVNode$4(VDataTableColumn, _mergeProps$2({
        "align": column.align,
        "indent": column.intent,
        "class": {
          'v-data-table__td--expanded-row': column.key === 'data-table-expand',
          'v-data-table__td--select-row': column.key === 'data-table-select'
        },
        "fixed": column.fixed,
        "fixedOffset": column.fixedOffset,
        "fixedEndOffset": column.fixedEndOffset,
        "lastFixed": column.lastFixed,
        "firstFixedEnd": column.firstFixedEnd,
        "maxWidth": !mobile.value ? column.maxWidth : undefined,
        "noPadding": noPadding,
        "empty": isEmpty,
        "nowrap": column.nowrap,
        "width": !mobile.value ? column.width : undefined
      }, cellProps, columnCellProps), {
        default: () => {
          if (column.key === 'data-table-select') {
            return slots['item.data-table-select']?.({
              ...slotProps,
              props: {
                disabled: !item.selectable,
                modelValue: isSelected([item]),
                onClick: withModifiers(() => toggleSelect(item), ['stop'])
              }
            }) ?? _createVNode$4(VCheckboxBtn, {
              "disabled": !item.selectable,
              "density": props.density,
              "modelValue": isSelected([item]),
              "onClick": withModifiers(event => toggleSelect(item, props.index, event), ['stop'])
            }, null);
          }
          if (column.key === 'data-table-expand') {
            return slots['item.data-table-expand']?.({
              ...slotProps,
              props: {
                icon: isExpanded(item) ? props.collapseIcon : props.expandIcon,
                size: 'small',
                variant: 'text',
                onClick: withModifiers(() => toggleExpand(item), ['stop'])
              }
            }) ?? _createVNode$4(VBtn, {
              "icon": isExpanded(item) ? props.collapseIcon : props.expandIcon,
              "size": "small",
              "variant": "text",
              "onClick": withModifiers(() => toggleExpand(item), ['stop'])
            }, null);
          }
          if (slots[slotName] && !mobile.value) return slots[slotName](slotProps);
          const displayValue = toDisplayString(slotProps.value);
          return !mobile.value ? displayValue : _createElementVNode$5(_Fragment$3, null, [_createElementVNode$5("div", {
            "class": "v-data-table__td-title"
          }, [slots[headerSlotName]?.(columnSlotProps) ?? column.title]), _createElementVNode$5("div", {
            "class": "v-data-table__td-value"
          }, [slots[slotName]?.(slotProps) ?? displayValue])]);
        }
      });
    })]));
  }
});

const {createElementVNode:_createElementVNode$4,Fragment:_Fragment$2,mergeProps:_mergeProps$1,createVNode:_createVNode$3} = await importShared('vue');
const {Fragment,mergeProps} = await importShared('vue');
const makeVDataTableRowsProps = propsFactory({
  loading: [Boolean, String],
  loadingText: {
    type: String,
    default: '$vuetify.dataIterator.loadingText'
  },
  hideNoData: Boolean,
  items: {
    type: Array,
    default: () => []
  },
  noDataText: {
    type: String,
    default: '$vuetify.noDataText'
  },
  rowProps: [Object, Function],
  cellProps: [Object, Function],
  ...pick(makeVDataTableRowProps(), ['collapseIcon', 'expandIcon', 'density']),
  ...pick(makeVDataTableGroupHeaderRowProps(), ['groupCollapseIcon', 'groupExpandIcon', 'density']),
  ...makeDisplayProps()
}, 'VDataTableRows');
const VDataTableRows = genericComponent()({
  name: 'VDataTableRows',
  inheritAttrs: false,
  props: makeVDataTableRowsProps(),
  setup(props, _ref) {
    let {
      attrs,
      slots
    } = _ref;
    const {
      columns
    } = useHeaders();
    const {
      expandOnClick,
      toggleExpand,
      isExpanded
    } = useExpanded();
    const {
      isSelected,
      toggleSelect
    } = useSelection();
    const {
      toggleGroup,
      isGroupOpen
    } = useGroupBy();
    const {
      t
    } = useLocale();
    const {
      mobile
    } = useDisplay(props);
    useRender(() => {
      const groupHeaderRowProps = pick(props, ['groupCollapseIcon', 'groupExpandIcon', 'density']);
      if (props.loading && (!props.items.length || slots.loading)) {
        return _createElementVNode$4("tr", {
          "class": "v-data-table-rows-loading",
          "key": "loading"
        }, [_createElementVNode$4("td", {
          "colspan": columns.value.length
        }, [slots.loading?.() ?? t(props.loadingText)])]);
      }
      if (!props.loading && !props.items.length && !props.hideNoData) {
        return _createElementVNode$4("tr", {
          "class": "v-data-table-rows-no-data",
          "key": "no-data"
        }, [_createElementVNode$4("td", {
          "colspan": columns.value.length
        }, [slots['no-data']?.() ?? t(props.noDataText)])]);
      }
      return _createElementVNode$4(_Fragment$2, null, [props.items.map((item, index) => {
        if (item.type === 'group') {
          const slotProps = {
            index,
            item,
            columns: columns.value,
            isExpanded,
            toggleExpand,
            isSelected,
            toggleSelect,
            toggleGroup,
            isGroupOpen
          };
          return slots['group-header'] ? slots['group-header'](slotProps) : _createVNode$3(VDataTableGroupHeaderRow, _mergeProps$1({
            "key": `group-header_${item.id}`,
            "item": item
          }, getPrefixedEventHandlers(attrs, ':groupHeader', () => slotProps), groupHeaderRowProps), slots);
        }
        if (item.type === 'group-summary') {
          const slotProps = {
            index,
            item,
            columns: columns.value,
            toggleGroup
          };
          return slots['group-summary']?.(slotProps) ?? '';
        }
        const slotProps = {
          index,
          item: item.raw,
          internalItem: item,
          columns: columns.value,
          isExpanded,
          toggleExpand,
          isSelected,
          toggleSelect
        };
        const itemSlotProps = {
          ...slotProps,
          props: mergeProps({
            key: `item_${item.key ?? item.index}`,
            onClick: expandOnClick.value ? () => {
              toggleExpand(item);
            } : undefined,
            index,
            item,
            cellProps: props.cellProps,
            collapseIcon: props.collapseIcon,
            expandIcon: props.expandIcon,
            density: props.density,
            mobile: mobile.value
          }, getPrefixedEventHandlers(attrs, ':row', () => slotProps), typeof props.rowProps === 'function' ? props.rowProps({
            item: slotProps.item,
            index: slotProps.index,
            internalItem: slotProps.internalItem
          }) : props.rowProps)
        };
        return _createElementVNode$4(_Fragment$2, {
          "key": itemSlotProps.props.key
        }, [slots.item ? slots.item(itemSlotProps) : _createVNode$3(VDataTableRow, itemSlotProps.props, slots), isExpanded(item) && slots['expanded-row']?.(slotProps)]);
      })]);
    });
    return {};
  }
});

const {createElementVNode:_createElementVNode$3,normalizeClass:_normalizeClass$1,normalizeStyle:_normalizeStyle,createVNode:_createVNode$2} = await importShared('vue');
const makeVTableProps = propsFactory({
  fixedHeader: Boolean,
  fixedFooter: Boolean,
  height: [Number, String],
  hover: Boolean,
  striped: {
    type: String,
    default: null,
    validator: v => ['even', 'odd'].includes(v)
  },
  ...makeComponentProps(),
  ...makeDensityProps(),
  ...makeTagProps(),
  ...makeThemeProps()
}, 'VTable');
const VTable = genericComponent()({
  name: 'VTable',
  props: makeVTableProps(),
  setup(props, _ref) {
    let {
      slots,
      emit
    } = _ref;
    const {
      themeClasses
    } = provideTheme(props);
    const {
      densityClasses
    } = useDensity(props);
    useRender(() => _createVNode$2(props.tag, {
      "class": _normalizeClass$1(['v-table', {
        'v-table--fixed-height': !!props.height,
        'v-table--fixed-header': props.fixedHeader,
        'v-table--fixed-footer': props.fixedFooter,
        'v-table--has-top': !!slots.top,
        'v-table--has-bottom': !!slots.bottom,
        'v-table--hover': props.hover,
        'v-table--striped-even': props.striped === 'even',
        'v-table--striped-odd': props.striped === 'odd'
      }, themeClasses.value, densityClasses.value, props.class]),
      "style": _normalizeStyle(props.style)
    }, {
      default: () => [slots.top?.(), slots.default ? _createElementVNode$3("div", {
        "class": "v-table__wrapper",
        "style": {
          height: convertToUnit(props.height)
        }
      }, [_createElementVNode$3("table", null, [slots.default()])]) : slots.wrapper?.(), slots.bottom?.()]
    }));
    return {};
  }
});

// Utilities
const {computed: computed$2} = await importShared('vue');
// Composables
const makeDataTableItemsProps = propsFactory({
  items: {
    type: Array,
    default: () => []
  },
  itemValue: {
    type: [String, Array, Function],
    default: 'id'
  },
  itemSelectable: {
    type: [String, Array, Function],
    default: null
  },
  rowProps: [Object, Function],
  cellProps: [Object, Function],
  returnObject: Boolean
}, 'DataTable-items');
function transformItem(props, item, index, columns) {
  const value = props.returnObject ? item : getPropertyFromItem(item, props.itemValue);
  const selectable = getPropertyFromItem(item, props.itemSelectable, true);
  const itemColumns = columns.reduce((obj, column) => {
    if (column.key != null) obj[column.key] = getPropertyFromItem(item, column.value);
    return obj;
  }, {});
  return {
    type: 'item',
    key: props.returnObject ? getPropertyFromItem(item, props.itemValue) : value,
    index,
    value,
    selectable,
    columns: itemColumns,
    raw: item
  };
}
function transformItems(props, items, columns) {
  return items.map((item, index) => transformItem(props, item, index, columns));
}
function useDataTableItems(props, columns) {
  const items = computed$2(() => transformItems(props, props.items, columns.value));
  return {
    items
  };
}

// Utilities
const {watch} = await importShared('vue');
function useOptions(_ref) {
  let {
    page,
    itemsPerPage,
    sortBy,
    groupBy,
    search
  } = _ref;
  const vm = getCurrentInstance('VDataTable');
  const options = () => ({
    page: page.value,
    itemsPerPage: itemsPerPage.value,
    sortBy: sortBy.value,
    groupBy: groupBy.value,
    search: search.value
  });
  let oldOptions = null;
  watch(options, value => {
    if (deepEqual(oldOptions, value)) return;

    // Reset page when searching
    if (oldOptions && oldOptions.search !== value.search) {
      page.value = 1;
    }
    vm.emit('update:options', value);
    oldOptions = value;
  }, {
    deep: true,
    immediate: true
  });
}

/* eslint-disable max-statements */
/* eslint-disable no-labels */

// Utilities
const {computed: computed$1,shallowRef,unref,watchEffect,normalizeClass:_normalizeClass,createElementVNode:_createElementVNode$2,Fragment:_Fragment$1} = await importShared('vue');
/**
 * - boolean: match without highlight
 * - number: single match (index), length already known
 * - []: single match (start, end)
 * - [][]: multiple matches (start, end), shouldn't overlap
 */
// Composables
const defaultFilter = (value, query, item) => {
  if (value == null || query == null) return -1;
  if (!query.length) return 0;
  value = value.toString().toLocaleLowerCase();
  query = query.toString().toLocaleLowerCase();
  const result = [];
  let idx = value.indexOf(query);
  while (~idx) {
    result.push([idx, idx + query.length]);
    idx = value.indexOf(query, idx + query.length);
  }
  return result.length ? result : -1;
};
function normaliseMatch(match, query) {
  if (match == null || typeof match === 'boolean' || match === -1) return;
  if (typeof match === 'number') return [[match, match + query.length]];
  if (Array.isArray(match[0])) return match;
  return [match];
}
const makeFilterProps = propsFactory({
  customFilter: Function,
  customKeyFilter: Object,
  filterKeys: [Array, String],
  filterMode: {
    type: String,
    default: 'intersection'
  },
  noFilter: Boolean
}, 'filter');

// eslint-disable-next-line complexity
function filterItems(items, query, options) {
  const array = [];
  // always ensure we fall back to a functioning filter
  const filter = options?.default ?? defaultFilter;
  const keys = options?.filterKeys ? wrapInArray(options.filterKeys) : false;
  const customFiltersLength = Object.keys(options?.customKeyFilter ?? {}).length;
  if (!items?.length) return array;
  let lookAheadItem = null;
  loop: for (let i = 0; i < items.length; i++) {
    const [item, transformed = item] = wrapInArray(items[i]);
    const customMatches = {};
    const defaultMatches = {};
    let match = -1;
    if ((query || customFiltersLength > 0) && !options?.noFilter) {
      let hasOnlyCustomFilters = false;
      if (typeof item === 'object') {
        if (item.type === 'divider' || item.type === 'subheader') {
          if (lookAheadItem?.type === 'divider' && item.type === 'subheader') {
            array.push(lookAheadItem); // divider before subheader
          }
          lookAheadItem = {
            index: i,
            matches: {},
            type: item.type
          };
          continue;
        }
        const filterKeys = keys || Object.keys(transformed);
        hasOnlyCustomFilters = filterKeys.length === customFiltersLength;
        for (const key of filterKeys) {
          const value = getPropertyFromItem(transformed, key);
          const keyFilter = options?.customKeyFilter?.[key];
          match = keyFilter ? keyFilter(value, query, item) : filter(value, query, item);
          if (match !== -1 && match !== false) {
            if (keyFilter) customMatches[key] = normaliseMatch(match, query);else defaultMatches[key] = normaliseMatch(match, query);
          } else if (options?.filterMode === 'every') {
            continue loop;
          }
        }
      } else {
        match = filter(item, query, item);
        if (match !== -1 && match !== false) {
          defaultMatches.title = normaliseMatch(match, query);
        }
      }
      const defaultMatchesLength = Object.keys(defaultMatches).length;
      const customMatchesLength = Object.keys(customMatches).length;
      if (!defaultMatchesLength && !customMatchesLength) continue;
      if (options?.filterMode === 'union' && customMatchesLength !== customFiltersLength && !defaultMatchesLength) continue;
      if (options?.filterMode === 'intersection' && (customMatchesLength !== customFiltersLength || !defaultMatchesLength && customFiltersLength > 0 && !hasOnlyCustomFilters)) continue;
    }
    if (lookAheadItem) {
      array.push(lookAheadItem);
      lookAheadItem = null;
    }
    array.push({
      index: i,
      matches: {
        ...defaultMatches,
        ...customMatches
      }
    });
  }
  return array;
}
function useFilter(props, items, query, options) {
  const filteredItems = shallowRef([]);
  const filteredMatches = shallowRef(new Map());
  const transformedItems = computed$1(() => options?.transform ? unref(items).map(item => [item, options.transform(item)]) : unref(items));
  watchEffect(() => {
    const _query = typeof query === 'function' ? query() : unref(query);
    const strQuery = typeof _query !== 'string' && typeof _query !== 'number' ? '' : String(_query);
    const results = filterItems(transformedItems.value, strQuery, {
      customKeyFilter: {
        ...props.customKeyFilter,
        ...unref(options?.customKeyFilter)
      },
      default: props.customFilter,
      filterKeys: props.filterKeys,
      filterMode: props.filterMode,
      noFilter: props.noFilter
    });
    const originalItems = unref(items);
    const _filteredItems = [];
    const _filteredMatches = new Map();
    results.forEach(_ref => {
      let {
        index,
        matches
      } = _ref;
      const item = originalItems[index];
      _filteredItems.push(item);
      _filteredMatches.set(item.value, matches);
    });
    filteredItems.value = _filteredItems;
    filteredMatches.value = _filteredMatches;
  });
  function getMatches(item) {
    return filteredMatches.value.get(item.value);
  }
  return {
    filteredItems,
    filteredMatches,
    getMatches
  };
}

const {Fragment:_Fragment,createVNode:_createVNode$1,createElementVNode:_createElementVNode$1,mergeProps:_mergeProps} = await importShared('vue');
const {computed,toRef,toRefs} = await importShared('vue');
const makeDataTableProps = propsFactory({
  ...makeVDataTableRowsProps(),
  hideDefaultBody: Boolean,
  hideDefaultFooter: Boolean,
  hideDefaultHeader: Boolean,
  width: [String, Number],
  search: String,
  ...makeDataTableExpandProps(),
  ...makeDataTableGroupProps(),
  ...makeDataTableHeaderProps(),
  ...makeDataTableItemsProps(),
  ...makeDataTableSelectProps(),
  ...makeDataTableSortProps(),
  ...makeVDataTableHeadersProps(),
  ...makeVTableProps()
}, 'DataTable');
const makeVDataTableProps = propsFactory({
  ...makeDataTablePaginateProps(),
  ...makeDataTableProps(),
  ...makeFilterProps(),
  ...makeVDataTableFooterProps()
}, 'VDataTable');
const VDataTable = genericComponent()({
  name: 'VDataTable',
  props: makeVDataTableProps(),
  emits: {
    'update:modelValue': value => true,
    'update:page': value => true,
    'update:itemsPerPage': value => true,
    'update:sortBy': value => true,
    'update:options': value => true,
    'update:groupBy': value => true,
    'update:expanded': value => true,
    'update:currentItems': value => true
  },
  setup(props, _ref) {
    let {
      attrs,
      slots
    } = _ref;
    const {
      groupBy
    } = createGroupBy(props);
    const {
      sortBy,
      multiSort,
      mustSort
    } = createSort(props);
    const {
      page,
      itemsPerPage
    } = createPagination(props);
    const {
      disableSort
    } = toRefs(props);
    const {
      columns,
      headers,
      sortFunctions,
      sortRawFunctions,
      filterFunctions
    } = createHeaders(props, {
      groupBy,
      showSelect: toRef(() => props.showSelect),
      showExpand: toRef(() => props.showExpand)
    });
    const {
      items
    } = useDataTableItems(props, columns);
    const search = toRef(() => props.search);
    const {
      filteredItems
    } = useFilter(props, items, search, {
      transform: item => item.columns,
      customKeyFilter: filterFunctions
    });
    const {
      toggleSort
    } = provideSort({
      sortBy,
      multiSort,
      mustSort,
      page
    });
    const {
      sortByWithGroups,
      opened,
      extractRows,
      isGroupOpen,
      toggleGroup
    } = provideGroupBy({
      groupBy,
      sortBy,
      disableSort
    });
    const {
      sortedItems
    } = useSortedItems(props, filteredItems, sortByWithGroups, {
      transform: item => ({
        ...item.raw,
        ...item.columns
      }),
      sortFunctions,
      sortRawFunctions
    });
    const {
      flatItems
    } = useGroupedItems(sortedItems, groupBy, opened, () => !!slots['group-summary']);
    const itemsLength = computed(() => flatItems.value.length);
    const {
      startIndex,
      stopIndex,
      pageCount,
      setItemsPerPage
    } = providePagination({
      page,
      itemsPerPage,
      itemsLength
    });
    const {
      paginatedItems
    } = usePaginatedItems({
      items: flatItems,
      startIndex,
      stopIndex,
      itemsPerPage
    });
    const paginatedItemsWithoutGroups = computed(() => extractRows(paginatedItems.value));
    const {
      isSelected,
      select,
      selectAll,
      toggleSelect,
      someSelected,
      allSelected
    } = provideSelection(props, {
      allItems: items,
      currentPage: paginatedItemsWithoutGroups
    });
    const {
      isExpanded,
      toggleExpand
    } = provideExpanded(props);
    useOptions({
      page,
      itemsPerPage,
      sortBy,
      groupBy,
      search
    });
    provideDefaults({
      VDataTableRows: {
        hideNoData: toRef(() => props.hideNoData),
        noDataText: toRef(() => props.noDataText),
        loading: toRef(() => props.loading),
        loadingText: toRef(() => props.loadingText)
      }
    });
    const slotProps = computed(() => ({
      page: page.value,
      itemsPerPage: itemsPerPage.value,
      sortBy: sortBy.value,
      pageCount: pageCount.value,
      toggleSort,
      setItemsPerPage,
      someSelected: someSelected.value,
      allSelected: allSelected.value,
      isSelected,
      select,
      selectAll,
      toggleSelect,
      isExpanded,
      toggleExpand,
      isGroupOpen,
      toggleGroup,
      items: paginatedItemsWithoutGroups.value.map(item => item.raw),
      internalItems: paginatedItemsWithoutGroups.value,
      groupedItems: paginatedItems.value,
      columns: columns.value,
      headers: headers.value
    }));
    useRender(() => {
      const dataTableFooterProps = VDataTableFooter.filterProps(props);
      const dataTableHeadersProps = VDataTableHeaders.filterProps(props);
      const dataTableRowsProps = VDataTableRows.filterProps(props);
      const tableProps = VTable.filterProps(props);
      return _createVNode$1(VTable, _mergeProps({
        "class": ['v-data-table', {
          'v-data-table--show-select': props.showSelect,
          'v-data-table--loading': props.loading
        }, props.class],
        "style": props.style
      }, tableProps, {
        "fixedHeader": props.fixedHeader || props.sticky
      }), {
        top: () => slots.top?.(slotProps.value),
        default: () => slots.default ? slots.default(slotProps.value) : _createElementVNode$1(_Fragment, null, [slots.colgroup?.(slotProps.value), !props.hideDefaultHeader && _createElementVNode$1("thead", {
          "key": "thead"
        }, [_createVNode$1(VDataTableHeaders, dataTableHeadersProps, slots)]), slots.thead?.(slotProps.value), !props.hideDefaultBody && _createElementVNode$1("tbody", null, [slots['body.prepend']?.(slotProps.value), slots.body ? slots.body(slotProps.value) : _createVNode$1(VDataTableRows, _mergeProps(attrs, dataTableRowsProps, {
          "items": paginatedItems.value
        }), slots), slots['body.append']?.(slotProps.value)]), slots.tbody?.(slotProps.value), slots.tfoot?.(slotProps.value)]),
        bottom: () => slots.bottom ? slots.bottom(slotProps.value) : !props.hideDefaultFooter && _createElementVNode$1(_Fragment, null, [_createVNode$1(VDivider, null, null), _createVNode$1(VDataTableFooter, dataTableFooterProps, {
          prepend: slots['footer.prepend']
        })])
      });
    });
    return {};
  }
});

const {createTextVNode:_createTextVNode,withCtx:_withCtx,createVNode:_createVNode,toDisplayString:_toDisplayString,createElementVNode:_createElementVNode,openBlock:_openBlock,createBlock:_createBlock,createCommentVNode:_createCommentVNode} = await importShared('vue');


const _hoisted_1 = { class: "d-flex align-center" };
const _hoisted_2 = { class: "text-h4" };
const _hoisted_3 = { class: "d-flex align-center" };
const _hoisted_4 = { class: "text-h4" };
const _hoisted_5 = { class: "d-flex align-center" };
const _hoisted_6 = { class: "text-subtitle-1" };
const _hoisted_7 = { class: "d-flex align-center" };
const _hoisted_8 = { class: "text-h4" };

const {ref,onMounted,onUnmounted} = await importShared('vue');



const _sfc_main = {
  __name: 'Page',
  props: {
  api: {
    type: Object,
    required: true
  }
},
  setup(__props) {

const props = __props;

const stats = ref({
  pending: 0,
  processing: 0,
  cron: '',
  max_queue_size: 0
});

const tasks = ref([]);
const loading = ref(false);
const autoRefreshTimer = ref(null);

const headers = [
  { title: '标题', key: 'title', sortable: true },
  { title: '类型', key: 'media_type', sortable: true },
  { title: '季/集', key: 'episode_info', sortable: false },
  { title: '状态', key: 'status', sortable: true },
  { title: '添加时间', key: 'add_time', sortable: true },
  { title: '操作', key: 'actions', sortable: false, align: 'center' }
];

const getStatusColor = (status) => {
  const colors = {
    'pending': 'primary',
    'processing': 'info',
    'success': 'success',
    'failed': 'error'
  };
  return colors[status] || 'grey'
};

const getStatusIcon = (status) => {
  const icons = {
    'pending': 'mdi-clock-outline',
    'processing': 'mdi-loading mdi-spin',
    'success': 'mdi-check-circle',
    'failed': 'mdi-alert-circle'
  };
  return icons[status] || 'mdi-help-circle'
};

const getStatusText = (status) => {
  const texts = {
    'pending': '待处理',
    'processing': '处理中',
    'success': '成功',
    'failed': '失败'
  };
  return texts[status] || status
};

const refreshTasks = async () => {
  loading.value = true;
  try {
    // 调用插件API获取队列统计
    const statsResponse = await props.api.get('queue_stats');
    if (statsResponse.success && statsResponse.data) {
      stats.value = statsResponse.data;
    }

    // 调用插件API获取待处理任务
    const tasksResponse = await props.api.get('pending_tasks');
    if (tasksResponse.success && tasksResponse.data) {
      tasks.value = tasksResponse.data;
    }
  } catch (error) {
    console.error('获取数据失败:', error);
  } finally {
    loading.value = false;
  }
};

const deleteTask = async (task) => {
  if (!confirm(`确定要删除任务"${task.title}"吗?`)) {
    return
  }

  try {
    const response = await props.api.post('delete_task', { task_id: task.task_id });
    if (response.success) {
      // 刷新任务列表
      await refreshTasks();
    } else {
      alert('删除失败: ' + (response.message || '未知错误'));
    }
  } catch (error) {
    console.error('删除任务失败:', error);
    alert('删除任务失败: ' + error.message);
  }
};

// 自动刷新
const startAutoRefresh = () => {
  // 每30秒自动刷新一次
  autoRefreshTimer.value = setInterval(() => {
    refreshTasks();
  }, 30000);
};

const stopAutoRefresh = () => {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value);
    autoRefreshTimer.value = null;
  }
};

onMounted(() => {
  refreshTasks();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});

return (_ctx, _cache) => {
                                                       
                                                                 
                                                       
                                                     
                                                     
                                                           
                                                     
                                                                   
                                                             
                                                       
                                                                   
                                                         
                                                                 

  return (_openBlock(), _createBlock(VContainer, { fluid: "" }, {
    default: _withCtx(() => [
      _createVNode(VRow, null, {
        default: _withCtx(() => [
          _createVNode(VCol, {
            cols: "12",
            md: "3"
          }, {
            default: _withCtx(() => [
              _createVNode(VCard, {
                color: "primary",
                variant: "tonal"
              }, {
                default: _withCtx(() => [
                  _createVNode(VCardText, null, {
                    default: _withCtx(() => [
                      _createElementVNode("div", _hoisted_1, [
                        _createVNode(VIcon, {
                          size: "40",
                          class: "mr-3"
                        }, {
                          default: _withCtx(() => [...(_cache[0] || (_cache[0] = [
                            _createTextVNode("mdi-clock-outline", -1)
                          ]))]),
                          _: 1
                        }),
                        _createElementVNode("div", null, [
                          _createElementVNode("div", _hoisted_2, _toDisplayString(stats.value.pending), 1),
                          _cache[1] || (_cache[1] = _createElementVNode("div", { class: "text-caption" }, "待处理任务", -1))
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
          }),
          _createVNode(VCol, {
            cols: "12",
            md: "3"
          }, {
            default: _withCtx(() => [
              _createVNode(VCard, {
                color: "info",
                variant: "tonal"
              }, {
                default: _withCtx(() => [
                  _createVNode(VCardText, null, {
                    default: _withCtx(() => [
                      _createElementVNode("div", _hoisted_3, [
                        _createVNode(VIcon, {
                          size: "40",
                          class: "mr-3"
                        }, {
                          default: _withCtx(() => [...(_cache[2] || (_cache[2] = [
                            _createTextVNode("mdi-loading", -1)
                          ]))]),
                          _: 1
                        }),
                        _createElementVNode("div", null, [
                          _createElementVNode("div", _hoisted_4, _toDisplayString(stats.value.processing), 1),
                          _cache[3] || (_cache[3] = _createElementVNode("div", { class: "text-caption" }, "处理中", -1))
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
          }),
          _createVNode(VCol, {
            cols: "12",
            md: "3"
          }, {
            default: _withCtx(() => [
              _createVNode(VCard, { variant: "tonal" }, {
                default: _withCtx(() => [
                  _createVNode(VCardText, null, {
                    default: _withCtx(() => [
                      _createElementVNode("div", _hoisted_5, [
                        _createVNode(VIcon, {
                          size: "40",
                          class: "mr-3"
                        }, {
                          default: _withCtx(() => [...(_cache[4] || (_cache[4] = [
                            _createTextVNode("mdi-timer-outline", -1)
                          ]))]),
                          _: 1
                        }),
                        _createElementVNode("div", null, [
                          _createElementVNode("div", _hoisted_6, _toDisplayString(stats.value.cron || '未设置'), 1),
                          _cache[5] || (_cache[5] = _createElementVNode("div", { class: "text-caption" }, "定时任务", -1))
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
          }),
          _createVNode(VCol, {
            cols: "12",
            md: "3"
          }, {
            default: _withCtx(() => [
              _createVNode(VCard, { variant: "tonal" }, {
                default: _withCtx(() => [
                  _createVNode(VCardText, null, {
                    default: _withCtx(() => [
                      _createElementVNode("div", _hoisted_7, [
                        _createVNode(VIcon, {
                          size: "40",
                          class: "mr-3"
                        }, {
                          default: _withCtx(() => [...(_cache[6] || (_cache[6] = [
                            _createTextVNode("mdi-format-list-numbered", -1)
                          ]))]),
                          _: 1
                        }),
                        _createElementVNode("div", null, [
                          _createElementVNode("div", _hoisted_8, _toDisplayString(stats.value.max_queue_size), 1),
                          _cache[7] || (_cache[7] = _createElementVNode("div", { class: "text-caption" }, "队列上限", -1))
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
      _createVNode(VRow, null, {
        default: _withCtx(() => [
          _createVNode(VCol, { cols: "12" }, {
            default: _withCtx(() => [
              _createVNode(VCard, null, {
                default: _withCtx(() => [
                  _createVNode(VCardTitle, { class: "d-flex align-center" }, {
                    default: _withCtx(() => [
                      _createVNode(VIcon, { class: "mr-2" }, {
                        default: _withCtx(() => [...(_cache[8] || (_cache[8] = [
                          _createTextVNode("mdi-format-list-bulleted", -1)
                        ]))]),
                        _: 1
                      }),
                      _cache[11] || (_cache[11] = _createTextVNode(" 待处理任务列表 ", -1)),
                      _createVNode(VSpacer),
                      _createVNode(VBtn, {
                        color: "primary",
                        variant: "text",
                        onClick: refreshTasks,
                        loading: loading.value
                      }, {
                        default: _withCtx(() => [
                          _createVNode(VIcon, null, {
                            default: _withCtx(() => [...(_cache[9] || (_cache[9] = [
                              _createTextVNode("mdi-refresh", -1)
                            ]))]),
                            _: 1
                          }),
                          _cache[10] || (_cache[10] = _createTextVNode(" 刷新 ", -1))
                        ]),
                        _: 1
                      }, 8, ["loading"])
                    ]),
                    _: 1
                  }),
                  _createVNode(VDivider),
                  _createVNode(VCardText, { class: "pa-0" }, {
                    default: _withCtx(() => [
                      (tasks.value.length > 0)
                        ? (_openBlock(), _createBlock(VDataTable, {
                            key: 0,
                            headers: headers,
                            items: tasks.value,
                            "items-per-page": 10,
                            class: "elevation-0"
                          }, {
                            "item.status": _withCtx(({ item }) => [
                              _createVNode(VChip, {
                                color: getStatusColor(item.status),
                                size: "small",
                                variant: "flat"
                              }, {
                                default: _withCtx(() => [
                                  _createVNode(VIcon, {
                                    start: "",
                                    size: "small"
                                  }, {
                                    default: _withCtx(() => [
                                      _createTextVNode(_toDisplayString(getStatusIcon(item.status)), 1)
                                    ]),
                                    _: 2
                                  }, 1024),
                                  _createTextVNode(" " + _toDisplayString(getStatusText(item.status)), 1)
                                ]),
                                _: 2
                              }, 1032, ["color"])
                            ]),
                            "item.media_type": _withCtx(({ item }) => [
                              _createVNode(VChip, {
                                size: "small",
                                variant: "outlined"
                              }, {
                                default: _withCtx(() => [
                                  _createTextVNode(_toDisplayString(item.media_type === 'tv' ? '电视剧' : '电影'), 1)
                                ]),
                                _: 2
                              }, 1024)
                            ]),
                            "item.actions": _withCtx(({ item }) => [
                              _createVNode(VBtn, {
                                icon: "mdi-delete",
                                size: "small",
                                variant: "text",
                                color: "error",
                                onClick: $event => (deleteTask(item)),
                                disabled: item.status === 'processing'
                              }, null, 8, ["onClick", "disabled"])
                            ]),
                            _: 1
                          }, 8, ["items"]))
                        : (_openBlock(), _createBlock(VAlert, {
                            key: 1,
                            type: "info",
                            variant: "tonal",
                            class: "ma-4"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(VIcon, { class: "mr-2" }, {
                                default: _withCtx(() => [...(_cache[12] || (_cache[12] = [
                                  _createTextVNode("mdi-information", -1)
                                ]))]),
                                _: 1
                              }),
                              _cache[13] || (_cache[13] = _createTextVNode(" 暂无待处理任务 ", -1))
                            ]),
                            _: 1
                          }))
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
      })
    ]),
    _: 1
  }))
}
}

};
const Page = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-74d17ea8"]]);

export { Page as default };
