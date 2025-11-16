import { importShared } from './__federation_fn_import-Tq99R_rR.js';
import { b as useDimension, v as useRender, l as makeTagProps, r as makeDimensionProps, t as makeComponentProps, c as createSimpleFunctional, W as VAvatar, V as VIcon, j as VDefaultsProvider, s as makeDensityProps, R as Ripple, a0 as useBorder, u as useVariant, a as useDensity, d as useElevation, I as useLoader, e as useLocation, f as usePosition, g as useRounded, a1 as useLink, m as makeVariantProps, a2 as makeRouterProps, n as makeRoundedProps, o as makePositionProps, p as makeLocationProps, H as makeLoaderProps, q as makeElevationProps, a3 as makeBorderProps, i as genOverlays, a4 as VImg, L as LoaderSlot, _ as VRow, $ as VCol, T as VDivider, X as VChip, k as VBtn, Q as VList, S as VListItem, a5 as VListItemTitle, a6 as VListItemSubtitle } from './VList-dZIrLW2m.js';
import { x as genericComponent, w as propsFactory, r as useRtl, J as provideDefaults, B as IconValue, z as provideTheme, A as makeThemeProps, Z as convertToUnit } from './theme-BgZDIKbD.js';

const {normalizeClass:_normalizeClass$5,normalizeStyle:_normalizeStyle$5,createVNode:_createVNode$7} = await importShared('vue');
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
    useRender(() => _createVNode$7(props.tag, {
      "class": _normalizeClass$5(['v-container', {
        'v-container--fluid': props.fluid
      }, rtlClasses.value, props.class]),
      "style": _normalizeStyle$5([dimensionStyles.value, props.style])
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

const {normalizeClass:_normalizeClass$4,normalizeStyle:_normalizeStyle$4,createVNode:_createVNode$6} = await importShared('vue');
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
    useRender(() => _createVNode$6(props.tag, {
      "class": _normalizeClass$4(['v-card-actions', props.class]),
      "style": _normalizeStyle$4(props.style)
    }, slots));
    return {};
  }
});

const {normalizeClass:_normalizeClass$3,normalizeStyle:_normalizeStyle$3,createVNode:_createVNode$5} = await importShared('vue');
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
    useRender(() => _createVNode$5(props.tag, {
      "class": _normalizeClass$3(['v-card-subtitle', props.class]),
      "style": _normalizeStyle$3([{
        '--v-card-subtitle-opacity': props.opacity
      }, props.style])
    }, slots));
    return {};
  }
});

// Utilities
const VCardTitle = createSimpleFunctional('v-card-title');

const {Fragment:_Fragment$1,createVNode:_createVNode$4,createElementVNode:_createElementVNode$3,normalizeClass:_normalizeClass$2,normalizeStyle:_normalizeStyle$2} = await importShared('vue');
const {toDisplayString} = await importShared('vue');
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
      return _createVNode$4(props.tag, {
        "class": _normalizeClass$2(['v-card-item', props.class]),
        "style": _normalizeStyle$2(props.style)
      }, {
        default: () => [hasPrepend && _createElementVNode$3("div", {
          "key": "prepend",
          "class": "v-card-item__prepend"
        }, [!slots.prepend ? _createElementVNode$3(_Fragment$1, null, [props.prependAvatar && _createVNode$4(VAvatar, {
          "key": "prepend-avatar",
          "density": props.density,
          "image": props.prependAvatar
        }, null), props.prependIcon && _createVNode$4(VIcon, {
          "key": "prepend-icon",
          "density": props.density,
          "icon": props.prependIcon
        }, null)]) : _createVNode$4(VDefaultsProvider, {
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
        }, slots.prepend)]), _createElementVNode$3("div", {
          "class": "v-card-item__content"
        }, [hasTitle && _createVNode$4(VCardTitle, {
          "key": "title"
        }, {
          default: () => [slots.title?.() ?? toDisplayString(props.title)]
        }), hasSubtitle && _createVNode$4(VCardSubtitle, {
          "key": "subtitle"
        }, {
          default: () => [slots.subtitle?.() ?? toDisplayString(props.subtitle)]
        }), slots.default?.()]), hasAppend && _createElementVNode$3("div", {
          "key": "append",
          "class": "v-card-item__append"
        }, [!slots.append ? _createElementVNode$3(_Fragment$1, null, [props.appendIcon && _createVNode$4(VIcon, {
          "key": "append-icon",
          "density": props.density,
          "icon": props.appendIcon
        }, null), props.appendAvatar && _createVNode$4(VAvatar, {
          "key": "append-avatar",
          "density": props.density,
          "image": props.appendAvatar
        }, null)]) : _createVNode$4(VDefaultsProvider, {
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

const {normalizeClass:_normalizeClass$1,normalizeStyle:_normalizeStyle$1,createVNode:_createVNode$3} = await importShared('vue');
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
    useRender(() => _createVNode$3(props.tag, {
      "class": _normalizeClass$1(['v-card-text', props.class]),
      "style": _normalizeStyle$1([{
        '--v-card-text-opacity': props.opacity
      }, props.style])
    }, slots));
    return {};
  }
});

const {createVNode:_createVNode$2,createElementVNode:_createElementVNode$2,mergeProps:_mergeProps,withDirectives:_withDirectives} = await importShared('vue');
const {shallowRef,watch} = await importShared('vue');
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
    const loadingColor = shallowRef(undefined);
    watch(() => props.loading, (val, old) => {
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
      return _withDirectives(_createVNode$2(Tag, _mergeProps(link.linkProps, {
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
        default: () => [hasImage && _createElementVNode$2("div", {
          "key": "image",
          "class": "v-card__image"
        }, [!slots.image ? _createVNode$2(VImg, {
          "key": "image-img",
          "cover": true,
          "src": props.image
        }, null) : _createVNode$2(VDefaultsProvider, {
          "key": "image-defaults",
          "disabled": !props.image,
          "defaults": {
            VImg: {
              cover: true,
              src: props.image
            }
          }
        }, slots.image)]), _createVNode$2(LoaderSlot, {
          "name": "v-card",
          "active": !!props.loading,
          "color": loadingColor.value
        }, {
          default: slots.loader
        }), hasCardItem && _createVNode$2(VCardItem, {
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
        }), hasText && _createVNode$2(VCardText, {
          "key": "text"
        }, {
          default: () => [slots.text?.() ?? props.text]
        }), slots.default?.(), slots.actions && _createVNode$2(VCardActions, null, {
          default: slots.actions
        }), genOverlays(isClickable, 'v-card')]
      }), [[Ripple, isClickable && props.ripple]]);
    });
    return {};
  }
});

const {createElementVNode:_createElementVNode$1,normalizeClass:_normalizeClass,normalizeStyle:_normalizeStyle,createVNode:_createVNode$1} = await importShared('vue');
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
    useRender(() => _createVNode$1(props.tag, {
      "class": _normalizeClass(['v-table', {
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
      default: () => [slots.top?.(), slots.default ? _createElementVNode$1("div", {
        "class": "v-table__wrapper",
        "style": {
          height: convertToUnit(props.height)
        }
      }, [_createElementVNode$1("table", null, [slots.default()])]) : slots.wrapper?.(), slots.bottom?.()]
    }));
    return {};
  }
});

const {createTextVNode:_createTextVNode,withCtx:_withCtx,createVNode:_createVNode,createElementVNode:_createElementVNode,toDisplayString:_toDisplayString,renderList:_renderList,Fragment:_Fragment,openBlock:_openBlock,createElementBlock:_createElementBlock,createCommentVNode:_createCommentVNode,createBlock:_createBlock} = await importShared('vue');


const _hoisted_1 = { class: "mb-2" };
const _hoisted_2 = { class: "mb-2" };
const _hoisted_3 = { class: "ml-2" };
const _hoisted_4 = { class: "mb-2" };
const _hoisted_5 = { class: "ml-2" };
const _hoisted_6 = { class: "mb-2" };
const _hoisted_7 = { class: "ml-2 font-weight-bold" };
const _hoisted_8 = { class: "ml-2 font-weight-bold" };
const _hoisted_9 = { key: 0 };
const _hoisted_10 = { class: "d-flex justify-space-between" };
const _hoisted_11 = { class: "text-caption" };
const _hoisted_12 = {
  key: 1,
  class: "text-center text-grey text-caption"
};
const _hoisted_13 = { class: "text-caption text-grey" };

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
  enabled: false,
  pending: 0,
  processing: 0,
  cron: '',
  next_run_time: '',
  max_queue_size: 0,
  last_run_results: []
});

const tasks = ref([]);
const loading = ref(false);
const autoRefreshTimer = ref(null);
const rateLimitData = ref(null);

const getStatusColor = (status) => {
  const colors = {
    'pending': 'primary',
    'processing': 'info',
    'success': 'success',
    'failed': 'error'
  };
  return colors[status] || 'grey'
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
      Object.assign(stats.value, statsResponse.data);
    }

    // 调用插件API获取待处理任务
    const tasksResponse = await props.api.get('pending_tasks');
    if (tasksResponse.success && tasksResponse.data) {
      tasks.value = tasksResponse.data;
    }

    // 调用插件API获取流控状态
    const rateLimitResponse = await props.api.get('rate_limit_status');
    if (rateLimitResponse.success && rateLimitResponse.data) {
      rateLimitData.value = rateLimitResponse.data;
    } else {
      rateLimitData.value = null;
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
            md: "6"
          }, {
            default: _withCtx(() => [
              _createVNode(VCard, null, {
                default: _withCtx(() => [
                  _createVNode(VCardTitle, { class: "text-subtitle-2" }, {
                    default: _withCtx(() => [...(_cache[0] || (_cache[0] = [
                      _createTextVNode("当前状态", -1)
                    ]))]),
                    _: 1
                  }),
                  _createVNode(VDivider),
                  _createVNode(VCardText, null, {
                    default: _withCtx(() => [
                      _createElementVNode("div", _hoisted_1, [
                        _cache[1] || (_cache[1] = _createElementVNode("span", { class: "text-caption text-grey" }, "插件状态:", -1)),
                        _createVNode(VChip, {
                          size: "small",
                          color: stats.value.enabled ? 'success' : 'grey',
                          class: "ml-2"
                        }, {
                          default: _withCtx(() => [
                            _createTextVNode(_toDisplayString(stats.value.enabled ? '已启用' : '未启用'), 1)
                          ]),
                          _: 1
                        }, 8, ["color"])
                      ]),
                      _createElementVNode("div", _hoisted_2, [
                        _cache[2] || (_cache[2] = _createElementVNode("span", { class: "text-caption text-grey" }, "定时处理器:", -1)),
                        _createElementVNode("span", _hoisted_3, _toDisplayString(stats.value.cron || '未设置'), 1)
                      ]),
                      _createElementVNode("div", _hoisted_4, [
                        _cache[3] || (_cache[3] = _createElementVNode("span", { class: "text-caption text-grey" }, "下次运行时间:", -1)),
                        _createElementVNode("span", _hoisted_5, _toDisplayString(stats.value.next_run_time || 'N/A'), 1)
                      ]),
                      _createElementVNode("div", _hoisted_6, [
                        _cache[4] || (_cache[4] = _createElementVNode("span", { class: "text-caption text-grey" }, "待处理任务:", -1)),
                        _createElementVNode("span", _hoisted_7, _toDisplayString(stats.value.pending), 1)
                      ]),
                      _createElementVNode("div", null, [
                        _cache[5] || (_cache[5] = _createElementVNode("span", { class: "text-caption text-grey" }, "处理中:", -1)),
                        _createElementVNode("span", _hoisted_8, _toDisplayString(stats.value.processing), 1)
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
            md: "6"
          }, {
            default: _withCtx(() => [
              _createVNode(VCard, null, {
                default: _withCtx(() => [
                  _createVNode(VCardTitle, { class: "text-subtitle-2" }, {
                    default: _withCtx(() => [...(_cache[6] || (_cache[6] = [
                      _createTextVNode("处理历史", -1)
                    ]))]),
                    _: 1
                  }),
                  _createVNode(VDivider),
                  _createVNode(VCardText, null, {
                    default: _withCtx(() => [
                      (stats.value.last_run_results && stats.value.last_run_results.length > 0)
                        ? (_openBlock(), _createElementBlock("div", _hoisted_9, [
                            (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(stats.value.last_run_results.slice(0, 5), (item, index) => {
                              return (_openBlock(), _createElementBlock("div", {
                                key: index,
                                class: "mb-2"
                              }, [
                                _createElementVNode("div", _hoisted_10, [
                                  _createElementVNode("span", _hoisted_11, _toDisplayString(item.title), 1),
                                  _createVNode(VChip, {
                                    size: "x-small",
                                    color: item.success ? 'success' : 'error'
                                  }, {
                                    default: _withCtx(() => [
                                      _createTextVNode(_toDisplayString(item.success ? '成功' : '失败'), 1)
                                    ]),
                                    _: 2
                                  }, 1032, ["color"])
                                ])
                              ]))
                            }), 128))
                          ]))
                        : (_openBlock(), _createElementBlock("div", _hoisted_12, " 暂无处理历史 "))
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
      _createVNode(VRow, { class: "mt-4" }, {
        default: _withCtx(() => [
          _createVNode(VCol, { cols: "12" }, {
            default: _withCtx(() => [
              _createVNode(VCard, null, {
                default: _withCtx(() => [
                  _createVNode(VCardTitle, { class: "text-subtitle-2 d-flex align-center" }, {
                    default: _withCtx(() => [
                      _cache[7] || (_cache[7] = _createTextVNode(" 流控状态 ", -1)),
                      _createVNode(VSpacer),
                      (rateLimitData.value)
                        ? (_openBlock(), _createBlock(VChip, {
                            key: 0,
                            size: "small",
                            color: rateLimitData.value.globalEnabled ? 'success' : 'grey'
                          }, {
                            default: _withCtx(() => [
                              _createTextVNode(_toDisplayString(rateLimitData.value.globalEnabled ? '已启用' : '未启用'), 1)
                            ]),
                            _: 1
                          }, 8, ["color"]))
                        : _createCommentVNode("", true)
                    ]),
                    _: 1
                  }),
                  _createVNode(VDivider),
                  (rateLimitData.value)
                    ? (_openBlock(), _createBlock(VCardText, { key: 0 }, {
                        default: _withCtx(() => [
                          _createVNode(VRow, null, {
                            default: _withCtx(() => [
                              _createVNode(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: _withCtx(() => [
                                  _cache[8] || (_cache[8] = _createElementVNode("div", { class: "text-caption text-grey" }, "全局流控", -1)),
                                  _createElementVNode("div", null, _toDisplayString(rateLimitData.value.globalRequestCount) + " / " + _toDisplayString(rateLimitData.value.globalLimit), 1),
                                  _createElementVNode("div", _hoisted_13, "重置: " + _toDisplayString(rateLimitData.value.secondsUntilReset) + "秒", 1)
                                ]),
                                _: 1
                              }),
                              _createVNode(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: _withCtx(() => [
                                  _cache[9] || (_cache[9] = _createElementVNode("div", { class: "text-caption text-grey" }, "后备流控", -1)),
                                  _createElementVNode("div", null, _toDisplayString(rateLimitData.value.fallback.totalCount) + " / " + _toDisplayString(rateLimitData.value.fallback.totalLimit), 1)
                                ]),
                                _: 1
                              }),
                              _createVNode(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: _withCtx(() => [
                                  _cache[10] || (_cache[10] = _createElementVNode("div", { class: "text-caption text-grey" }, "数据源", -1)),
                                  _createElementVNode("div", null, _toDisplayString(rateLimitData.value.providers.length) + " 个", 1)
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          _createVNode(VDivider, { class: "my-2" }),
                          _createVNode(VTable, { density: "compact" }, {
                            default: _withCtx(() => [
                              _cache[11] || (_cache[11] = _createElementVNode("thead", null, [
                                _createElementVNode("tr", null, [
                                  _createElementVNode("th", null, "数据源"),
                                  _createElementVNode("th", null, "直接调用"),
                                  _createElementVNode("th", null, "后备调用"),
                                  _createElementVNode("th", null, "总调用"),
                                  _createElementVNode("th", null, "配额")
                                ])
                              ], -1)),
                              _createElementVNode("tbody", null, [
                                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(rateLimitData.value.providers, (provider) => {
                                  return (_openBlock(), _createElementBlock("tr", {
                                    key: provider.providerName
                                  }, [
                                    _createElementVNode("td", null, _toDisplayString(provider.providerName), 1),
                                    _createElementVNode("td", null, _toDisplayString(provider.directCount), 1),
                                    _createElementVNode("td", null, _toDisplayString(provider.fallbackCount), 1),
                                    _createElementVNode("td", null, _toDisplayString(provider.requestCount), 1),
                                    _createElementVNode("td", null, _toDisplayString(provider.quota === '∞' ? '无限' : provider.quota), 1)
                                  ]))
                                }), 128))
                              ])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }))
                    : (_openBlock(), _createBlock(VCardText, {
                        key: 1,
                        class: "text-center text-grey text-caption"
                      }, {
                        default: _withCtx(() => [...(_cache[12] || (_cache[12] = [
                          _createTextVNode(" 无法获取流控状态 ", -1)
                        ]))]),
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
      }),
      _createVNode(VRow, { class: "mt-4" }, {
        default: _withCtx(() => [
          _createVNode(VCol, { cols: "12" }, {
            default: _withCtx(() => [
              _createVNode(VCard, null, {
                default: _withCtx(() => [
                  _createVNode(VCardTitle, { class: "text-subtitle-2 d-flex align-center" }, {
                    default: _withCtx(() => [
                      _cache[14] || (_cache[14] = _createTextVNode(" 待处理任务 ", -1)),
                      _createVNode(VSpacer),
                      _createVNode(VBtn, {
                        size: "small",
                        variant: "text",
                        onClick: refreshTasks,
                        loading: loading.value
                      }, {
                        default: _withCtx(() => [...(_cache[13] || (_cache[13] = [
                          _createTextVNode(" 刷新 ", -1)
                        ]))]),
                        _: 1
                      }, 8, ["loading"])
                    ]),
                    _: 1
                  }),
                  _createVNode(VDivider),
                  (tasks.value.length > 0)
                    ? (_openBlock(), _createBlock(VCardText, {
                        key: 0,
                        class: "pa-0"
                      }, {
                        default: _withCtx(() => [
                          _createVNode(VList, null, {
                            default: _withCtx(() => [
                              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(tasks.value, (task, index) => {
                                return (_openBlock(), _createElementBlock(_Fragment, {
                                  key: task.task_id
                                }, [
                                  _createVNode(VListItem, null, {
                                    prepend: _withCtx(() => [
                                      _createVNode(VChip, {
                                        size: "small",
                                        variant: "outlined"
                                      }, {
                                        default: _withCtx(() => [
                                          _createTextVNode(_toDisplayString(task.media_type === 'tv' ? '电视剧' : '电影'), 1)
                                        ]),
                                        _: 2
                                      }, 1024)
                                    ]),
                                    append: _withCtx(() => [
                                      _createVNode(VChip, {
                                        size: "small",
                                        color: getStatusColor(task.status),
                                        class: "mr-2"
                                      }, {
                                        default: _withCtx(() => [
                                          _createTextVNode(_toDisplayString(getStatusText(task.status)), 1)
                                        ]),
                                        _: 2
                                      }, 1032, ["color"]),
                                      _createVNode(VBtn, {
                                        icon: "mdi-delete",
                                        size: "small",
                                        variant: "text",
                                        color: "error",
                                        onClick: $event => (deleteTask(task)),
                                        disabled: task.status === 'processing'
                                      }, null, 8, ["onClick", "disabled"])
                                    ]),
                                    default: _withCtx(() => [
                                      _createVNode(VListItemTitle, null, {
                                        default: _withCtx(() => [
                                          _createTextVNode(_toDisplayString(task.title), 1)
                                        ]),
                                        _: 2
                                      }, 1024),
                                      (task.episode_info !== '-')
                                        ? (_openBlock(), _createBlock(VListItemSubtitle, { key: 0 }, {
                                            default: _withCtx(() => [
                                              _createTextVNode(_toDisplayString(task.episode_info), 1)
                                            ]),
                                            _: 2
                                          }, 1024))
                                        : _createCommentVNode("", true)
                                    ]),
                                    _: 2
                                  }, 1024),
                                  (index < tasks.value.length - 1)
                                    ? (_openBlock(), _createBlock(VDivider, { key: 0 }))
                                    : _createCommentVNode("", true)
                                ], 64))
                              }), 128))
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }))
                    : (_openBlock(), _createBlock(VCardText, {
                        key: 1,
                        class: "text-center text-grey text-caption"
                      }, {
                        default: _withCtx(() => [...(_cache[15] || (_cache[15] = [
                          _createTextVNode(" 暂无待处理任务 ", -1)
                        ]))]),
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
  }))
}
}

};
const Page = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-c8308dc0"]]);

export { Page as default };
