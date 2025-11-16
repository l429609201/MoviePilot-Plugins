import { importShared } from './__federation_fn_import-DDSy82QP.js';
import { i as useDimension, u as useRender, P as makeTagProps, h as makeDimensionProps, m as makeComponentProps, Q as createSimpleFunctional, F as VAvatar, V as VIcon, r as VDefaultsProvider, a as makeDensityProps, R as Ripple, S as useBorder, T as useVariant, b as useDensity, U as useElevation, v as useLoader, W as useLocation, X as usePosition, w as useRounded, Y as useLink, Z as makeVariantProps, _ as makeRouterProps, s as makeRoundedProps, $ as makePositionProps, a0 as makeLocationProps, t as makeLoaderProps, a1 as makeElevationProps, a2 as makeBorderProps, a3 as genOverlays, a4 as VImg, L as LoaderSlot, K as VRow, N as VCol, a5 as VBtn, B as VList, C as VListItem, a6 as VListItemTitle, a7 as VListItemSubtitle, G as VChip, O as VAlert } from './VList-BYN6cBPy.js';
import { y as genericComponent, w as propsFactory, r as useRtl, H as provideDefaults, F as IconValue, V as provideTheme, C as makeThemeProps } from './theme-DTes7M_Y.js';

const {normalizeClass:_normalizeClass$4,normalizeStyle:_normalizeStyle$4,createVNode:_createVNode$6} = await importShared('vue');
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
    useRender(() => _createVNode$6(props.tag, {
      "class": _normalizeClass$4(['v-container', {
        'v-container--fluid': props.fluid
      }, rtlClasses.value, props.class]),
      "style": _normalizeStyle$4([dimensionStyles.value, props.style])
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

const {normalizeClass:_normalizeClass$3,normalizeStyle:_normalizeStyle$3,createVNode:_createVNode$5} = await importShared('vue');
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
    useRender(() => _createVNode$5(props.tag, {
      "class": _normalizeClass$3(['v-card-actions', props.class]),
      "style": _normalizeStyle$3(props.style)
    }, slots));
    return {};
  }
});

const {normalizeClass:_normalizeClass$2,normalizeStyle:_normalizeStyle$2,createVNode:_createVNode$4} = await importShared('vue');
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
    useRender(() => _createVNode$4(props.tag, {
      "class": _normalizeClass$2(['v-card-subtitle', props.class]),
      "style": _normalizeStyle$2([{
        '--v-card-subtitle-opacity': props.opacity
      }, props.style])
    }, slots));
    return {};
  }
});

// Utilities
const VCardTitle = createSimpleFunctional('v-card-title');

const {Fragment:_Fragment$1,createVNode:_createVNode$3,createElementVNode:_createElementVNode$2,normalizeClass:_normalizeClass$1,normalizeStyle:_normalizeStyle$1} = await importShared('vue');
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
      return _createVNode$3(props.tag, {
        "class": _normalizeClass$1(['v-card-item', props.class]),
        "style": _normalizeStyle$1(props.style)
      }, {
        default: () => [hasPrepend && _createElementVNode$2("div", {
          "key": "prepend",
          "class": "v-card-item__prepend"
        }, [!slots.prepend ? _createElementVNode$2(_Fragment$1, null, [props.prependAvatar && _createVNode$3(VAvatar, {
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
            }
          }
        }, slots.prepend)]), _createElementVNode$2("div", {
          "class": "v-card-item__content"
        }, [hasTitle && _createVNode$3(VCardTitle, {
          "key": "title"
        }, {
          default: () => [slots.title?.() ?? toDisplayString(props.title)]
        }), hasSubtitle && _createVNode$3(VCardSubtitle, {
          "key": "subtitle"
        }, {
          default: () => [slots.subtitle?.() ?? toDisplayString(props.subtitle)]
        }), slots.default?.()]), hasAppend && _createElementVNode$2("div", {
          "key": "append",
          "class": "v-card-item__append"
        }, [!slots.append ? _createElementVNode$2(_Fragment$1, null, [props.appendIcon && _createVNode$3(VIcon, {
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
            }
          }
        }, slots.append)])]
      });
    });
    return {};
  }
});

const {normalizeClass:_normalizeClass,normalizeStyle:_normalizeStyle,createVNode:_createVNode$2} = await importShared('vue');
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
    useRender(() => _createVNode$2(props.tag, {
      "class": _normalizeClass(['v-card-text', props.class]),
      "style": _normalizeStyle([{
        '--v-card-text-opacity': props.opacity
      }, props.style])
    }, slots));
    return {};
  }
});

const {createVNode:_createVNode$1,createElementVNode:_createElementVNode$1,mergeProps:_mergeProps,withDirectives:_withDirectives} = await importShared('vue');
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
      return _withDirectives(_createVNode$1(Tag, _mergeProps(link.linkProps, {
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
        default: () => [hasImage && _createElementVNode$1("div", {
          "key": "image",
          "class": "v-card__image"
        }, [!slots.image ? _createVNode$1(VImg, {
          "key": "image-img",
          "cover": true,
          "src": props.image
        }, null) : _createVNode$1(VDefaultsProvider, {
          "key": "image-defaults",
          "disabled": !props.image,
          "defaults": {
            VImg: {
              cover: true,
              src: props.image
            }
          }
        }, slots.image)]), _createVNode$1(LoaderSlot, {
          "name": "v-card",
          "active": !!props.loading,
          "color": loadingColor.value
        }, {
          default: slots.loader
        }), hasCardItem && _createVNode$1(VCardItem, {
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
        }), hasText && _createVNode$1(VCardText, {
          "key": "text"
        }, {
          default: () => [slots.text?.() ?? props.text]
        }), slots.default?.(), slots.actions && _createVNode$1(VCardActions, null, {
          default: slots.actions
        }), genOverlays(isClickable, 'v-card')]
      }), [[Ripple, isClickable && props.ripple]]);
    });
    return {};
  }
});

const {createTextVNode:_createTextVNode,withCtx:_withCtx,createVNode:_createVNode,toDisplayString:_toDisplayString,createElementVNode:_createElementVNode,renderList:_renderList,Fragment:_Fragment,openBlock:_openBlock,createElementBlock:_createElementBlock,createBlock:_createBlock,createCommentVNode:_createCommentVNode} = await importShared('vue');


const _hoisted_1 = { class: "text-h4 text-primary" };
const _hoisted_2 = { class: "text-h4 text-info" };
const _hoisted_3 = { class: "text-h6 text-grey" };
const _hoisted_4 = { class: "text-h6 text-grey" };

const {ref,onMounted} = await importShared('vue');



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
    'processing': 'mdi-loading',
    'success': 'mdi-check-circle',
    'failed': 'mdi-alert-circle'
  };
  return icons[status] || 'mdi-help-circle'
};

const refreshTasks = async () => {
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
  }
};

onMounted(() => {
  refreshTasks();
});

return (_ctx, _cache) => {
                                                                   
                                                     
                                                     
                                                                 
                                                       
                                                           
                                                       
                                                     
                                                           
                                                                             
                                                                                   
                                                       
                                                                 
                                                       
                                                         
                                                                 

  return (_openBlock(), _createBlock(VContainer, { fluid: "" }, {
    default: _withCtx(() => [
      _createVNode(VRow, null, {
        default: _withCtx(() => [
          _createVNode(VCol, { cols: "12" }, {
            default: _withCtx(() => [
              _createVNode(VCard, null, {
                default: _withCtx(() => [
                  _createVNode(VCardTitle, null, {
                    default: _withCtx(() => [...(_cache[0] || (_cache[0] = [
                      _createTextVNode("任务队列统计", -1)
                    ]))]),
                    _: 1
                  }),
                  _createVNode(VCardText, null, {
                    default: _withCtx(() => [
                      _createVNode(VRow, null, {
                        default: _withCtx(() => [
                          _createVNode(VCol, { cols: "3" }, {
                            default: _withCtx(() => [
                              _createElementVNode("div", _hoisted_1, _toDisplayString(stats.value.pending), 1),
                              _cache[1] || (_cache[1] = _createElementVNode("div", { class: "text-caption" }, "待处理", -1))
                            ]),
                            _: 1
                          }),
                          _createVNode(VCol, { cols: "3" }, {
                            default: _withCtx(() => [
                              _createElementVNode("div", _hoisted_2, _toDisplayString(stats.value.processing), 1),
                              _cache[2] || (_cache[2] = _createElementVNode("div", { class: "text-caption" }, "处理中", -1))
                            ]),
                            _: 1
                          }),
                          _createVNode(VCol, { cols: "3" }, {
                            default: _withCtx(() => [
                              _createElementVNode("div", _hoisted_3, _toDisplayString(stats.value.cron), 1),
                              _cache[3] || (_cache[3] = _createElementVNode("div", { class: "text-caption" }, "定时任务", -1))
                            ]),
                            _: 1
                          }),
                          _createVNode(VCol, { cols: "3" }, {
                            default: _withCtx(() => [
                              _createElementVNode("div", _hoisted_4, _toDisplayString(stats.value.max_queue_size), 1),
                              _cache[4] || (_cache[4] = _createElementVNode("div", { class: "text-caption" }, "队列上限", -1))
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
                  _createVNode(VCardTitle, null, {
                    default: _withCtx(() => [
                      _cache[7] || (_cache[7] = _createTextVNode(" 待处理任务 ", -1)),
                      _createVNode(VSpacer),
                      _createVNode(VBtn, {
                        color: "primary",
                        onClick: refreshTasks
                      }, {
                        default: _withCtx(() => [
                          _createVNode(VIcon, { left: "" }, {
                            default: _withCtx(() => [...(_cache[5] || (_cache[5] = [
                              _createTextVNode("mdi-refresh", -1)
                            ]))]),
                            _: 1
                          }),
                          _cache[6] || (_cache[6] = _createTextVNode(" 刷新 ", -1))
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  _createVNode(VCardText, null, {
                    default: _withCtx(() => [
                      (tasks.value.length > 0)
                        ? (_openBlock(), _createBlock(VList, { key: 0 }, {
                            default: _withCtx(() => [
                              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(tasks.value, (task, index) => {
                                return (_openBlock(), _createBlock(VListItem, { key: index }, {
                                  prepend: _withCtx(() => [
                                    _createVNode(VAvatar, {
                                      color: getStatusColor(task.status)
                                    }, {
                                      default: _withCtx(() => [
                                        _createVNode(VIcon, null, {
                                          default: _withCtx(() => [
                                            _createTextVNode(_toDisplayString(getStatusIcon(task.status)), 1)
                                          ]),
                                          _: 2
                                        }, 1024)
                                      ]),
                                      _: 2
                                    }, 1032, ["color"])
                                  ]),
                                  append: _withCtx(() => [
                                    _createVNode(VChip, {
                                      color: getStatusColor(task.status),
                                      size: "small"
                                    }, {
                                      default: _withCtx(() => [
                                        _createTextVNode(_toDisplayString(task.status), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["color"])
                                  ]),
                                  default: _withCtx(() => [
                                    _createVNode(VListItemTitle, null, {
                                      default: _withCtx(() => [
                                        _createTextVNode(_toDisplayString(task.title), 1)
                                      ]),
                                      _: 2
                                    }, 1024),
                                    _createVNode(VListItemSubtitle, null, {
                                      default: _withCtx(() => [
                                        _createTextVNode(_toDisplayString(task.subtitle), 1)
                                      ]),
                                      _: 2
                                    }, 1024)
                                  ]),
                                  _: 2
                                }, 1024))
                              }), 128))
                            ]),
                            _: 1
                          }))
                        : (_openBlock(), _createBlock(VAlert, {
                            key: 1,
                            type: "info",
                            variant: "tonal"
                          }, {
                            default: _withCtx(() => [...(_cache[8] || (_cache[8] = [
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
      })
    ]),
    _: 1
  }))
}
}

};
const Page = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-3c335802"]]);

export { Page as default };
