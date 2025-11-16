import { importShared } from './__federation_fn_import-Dd9Y27se.js';
import { c as useDensity, u as useRender, Y as makeTagProps, b as makeDensityProps, m as makeComponentProps, o as useScopeId, f as forwardRefs, s as makeVOverlayProps, q as VOverlay, _ as _export_sfc, O as VCard, P as VCardTitle, V as VIcon, Q as VCardText, S as VRow, T as VCol, D as VList, E as VListItem, Z as VListItemTitle, X as VSpacer, J as VChip, W as VBtn, F as VDivider, U as VCardActions } from './VOverlay-IPlmzrQ8.js';
import { w as genericComponent, t as propsFactory, S as provideTheme, A as makeThemeProps, Y as convertToUnit, v as useProxiedModel, K as omit } from './theme-DPL3T32x.js';

const {createElementVNode:_createElementVNode$1,normalizeClass:_normalizeClass,normalizeStyle:_normalizeStyle,createVNode:_createVNode$2} = await importShared('vue');
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

const {mergeProps:_mergeProps,createVNode:_createVNode$1} = await importShared('vue');
const {computed,mergeProps,ref: ref$1,toRef,useId} = await importShared('vue');
const makeVTooltipProps = propsFactory({
  id: String,
  interactive: Boolean,
  text: String,
  ...omit(makeVOverlayProps({
    closeOnBack: false,
    location: 'end',
    locationStrategy: 'connected',
    eager: true,
    minWidth: 0,
    offset: 10,
    openOnClick: false,
    openOnHover: true,
    origin: 'auto',
    scrim: false,
    scrollStrategy: 'reposition',
    transition: null
  }), ['absolute', 'persistent'])
}, 'VTooltip');
const VTooltip = genericComponent()({
  name: 'VTooltip',
  props: makeVTooltipProps(),
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
    const uid = useId();
    const id = toRef(() => props.id || `v-tooltip-${uid}`);
    const overlay = ref$1();
    const location = computed(() => {
      return props.location.split(' ').length > 1 ? props.location : props.location + ' center';
    });
    const origin = computed(() => {
      return props.origin === 'auto' || props.origin === 'overlap' || props.origin.split(' ').length > 1 || props.location.split(' ').length > 1 ? props.origin : props.origin + ' center';
    });
    const transition = toRef(() => {
      if (props.transition != null) return props.transition;
      return isActive.value ? 'scale-transition' : 'fade-transition';
    });
    const activatorProps = computed(() => mergeProps({
      'aria-describedby': id.value
    }, props.activatorProps));
    useRender(() => {
      const overlayProps = VOverlay.filterProps(props);
      return _createVNode$1(VOverlay, _mergeProps({
        "ref": overlay,
        "class": ['v-tooltip', {
          'v-tooltip--interactive': props.interactive
        }, props.class],
        "style": props.style,
        "id": id.value
      }, overlayProps, {
        "modelValue": isActive.value,
        "onUpdate:modelValue": $event => isActive.value = $event,
        "transition": transition.value,
        "absolute": true,
        "location": location.value,
        "origin": origin.value,
        "persistent": true,
        "role": "tooltip",
        "activatorProps": activatorProps.value,
        "_disableGlobalStack": true
      }, scopeId), {
        activator: slots.activator,
        default: function () {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          return slots.default?.(...args) ?? props.text;
        }
      });
    });
    return forwardRefs({}, overlay);
  }
});

const {createVNode:_createVNode,createElementVNode:_createElementVNode,withCtx:_withCtx,toDisplayString:_toDisplayString,createTextVNode:_createTextVNode,renderList:_renderList,Fragment:_Fragment,openBlock:_openBlock,createElementBlock:_createElementBlock,createBlock:_createBlock,createCommentVNode:_createCommentVNode} = await importShared('vue');


const _hoisted_1 = { class: "plugin-page" };
const _hoisted_2 = {
  key: 1,
  class: "text-center text-grey pa-2"
};
const _hoisted_3 = { class: "text-caption" };
const _hoisted_4 = { class: "text-caption text-center" };
const _hoisted_5 = { class: "text-caption text-center" };
const _hoisted_6 = { class: "text-caption text-center" };
const _hoisted_7 = { class: "text-caption text-center" };
const _hoisted_8 = { class: "text-center" };
const _hoisted_9 = { class: "text-caption" };
const _hoisted_10 = { class: "text-caption" };
const _hoisted_11 = { class: "text-center" };
const _hoisted_12 = { class: "text-right" };
const _hoisted_13 = { class: "d-flex justify-end" };

const {ref,onMounted,onUnmounted} = await importShared('vue');



const _sfc_main = {
  __name: 'Page',
  props: {
  api: {
    type: Object,
    required: true
  }
},
  emits: ['switch', 'close'],
  setup(__props, { emit: __emit }) {

const props = __props;

const emit = __emit;

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
    const statsResponse = await props.api.get('plugin/DanmakuAutoImport/queue_stats');
    if (statsResponse.success && statsResponse.data) {
      Object.assign(stats.value, statsResponse.data);
    }

    // 调用插件API获取待处理任务
    const tasksResponse = await props.api.get('plugin/DanmakuAutoImport/pending_tasks');
    if (tasksResponse.success && tasksResponse.data) {
      tasks.value = tasksResponse.data;
    }

    // 调用插件API获取流控状态
    const rateLimitResponse = await props.api.get('plugin/DanmakuAutoImport/rate_limit_status');
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
    const response = await props.api.post('plugin/DanmakuAutoImport/delete_task', { task_id: task.task_id });
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

// 清空队列
const clearAllTasks = async () => {
  if (!confirm('确定要清空所有待处理任务吗?')) {
    return
  }

  try {
    // 删除所有待处理任务
    for (const task of tasks.value) {
      if (task.status !== 'processing') {
        await props.api.post('plugin/DanmakuAutoImport/delete_task', { task_id: task.task_id });
      }
    }
    // 刷新任务列表
    await refreshTasks();
  } catch (error) {
    console.error('清空队列失败:', error);
    alert('清空队列失败: ' + error.message);
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
                                                       
                                                                   
                                                                             
                                                                 
                                                       
                                                                 
                                                       
                                                     
                                                     
                                                           
                                                       
                                                         
                                                             
                                                     
                                                             
                                                                       

  return (_openBlock(), _createElementBlock("div", _hoisted_1, [
    _createVNode(VCard, {
      flat: "",
      class: "rounded border"
    }, {
      default: _withCtx(() => [
        _createVNode(VCardTitle, { class: "text-subtitle-1 d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
          default: _withCtx(() => [
            _createVNode(VIcon, {
              icon: "mdi-database-import",
              color: "primary",
              size: "small",
              class: "mr-2"
            }),
            _cache[2] || (_cache[2] = _createElementVNode("span", null, "弹幕库自动导入", -1))
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
                    _createVNode(VCard, {
                      flat: "",
                      class: "rounded mb-3 border config-card"
                    }, {
                      default: _withCtx(() => [
                        _createVNode(VCardTitle, { class: "text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
                          default: _withCtx(() => [
                            _createVNode(VIcon, {
                              icon: "mdi-information-outline",
                              color: "primary",
                              size: "small",
                              class: "mr-2"
                            }),
                            _cache[3] || (_cache[3] = _createElementVNode("span", null, "当前状态", -1))
                          ]),
                          _: 1
                        }),
                        _createVNode(VCardText, { class: "px-3 py-2" }, {
                          default: _withCtx(() => [
                            _createVNode(VList, { density: "compact" }, {
                              default: _withCtx(() => [
                                _createVNode(VListItem, null, {
                                  default: _withCtx(() => [
                                    _createVNode(VListItemTitle, { class: "text-caption" }, {
                                      default: _withCtx(() => [
                                        _createVNode(VIcon, {
                                          icon: "mdi-power",
                                          size: "small",
                                          color: stats.value.enabled ? 'success' : 'grey',
                                          class: "mr-2"
                                        }, null, 8, ["color"]),
                                        _createTextVNode(" 插件状态: " + _toDisplayString(stats.value.enabled ? '已启用' : '已禁用'), 1)
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                _createVNode(VListItem, null, {
                                  default: _withCtx(() => [
                                    _createVNode(VListItemTitle, { class: "text-caption" }, {
                                      default: _withCtx(() => [
                                        _createVNode(VIcon, {
                                          icon: "mdi-clock-time-five",
                                          size: "small",
                                          color: "primary",
                                          class: "mr-2"
                                        }),
                                        _createTextVNode(" 定时处理器: " + _toDisplayString(stats.value.cron || 'N/A'), 1)
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                _createVNode(VListItem, null, {
                                  default: _withCtx(() => [
                                    _createVNode(VListItemTitle, { class: "text-caption" }, {
                                      default: _withCtx(() => [
                                        _createVNode(VIcon, {
                                          icon: "mdi-clock-outline",
                                          size: "small",
                                          color: "info",
                                          class: "mr-2"
                                        }),
                                        _createTextVNode(" 下次运行时间: " + _toDisplayString(stats.value.next_run_time || 'N/A'), 1)
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
                _createVNode(VCol, {
                  cols: "12",
                  md: "6"
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
                              icon: "mdi-history",
                              color: "primary",
                              size: "small",
                              class: "mr-2"
                            }),
                            _cache[4] || (_cache[4] = _createElementVNode("span", null, "处理历史", -1))
                          ]),
                          _: 1
                        }),
                        _createVNode(VCardText, { class: "px-3 py-2" }, {
                          default: _withCtx(() => [
                            (stats.value.last_run_results && stats.value.last_run_results.length > 0)
                              ? (_openBlock(), _createBlock(VList, {
                                  key: 0,
                                  density: "compact"
                                }, {
                                  default: _withCtx(() => [
                                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(stats.value.last_run_results.slice(0, 3), (result, index) => {
                                      return (_openBlock(), _createBlock(VListItem, { key: index }, {
                                        default: _withCtx(() => [
                                          _createVNode(VListItemTitle, { class: "text-caption" }, {
                                            default: _withCtx(() => [
                                              _createTextVNode(_toDisplayString(result.title) + ": " + _toDisplayString(result.success ? '成功' : '失败'), 1)
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
                              : (_openBlock(), _createElementBlock("div", _hoisted_2, [
                                  _createVNode(VIcon, {
                                    icon: "mdi-information-outline",
                                    size: "small",
                                    class: "mb-1"
                                  }),
                                  _cache[5] || (_cache[5] = _createElementVNode("div", { class: "text-caption" }, "暂无处理历史", -1))
                                ]))
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
                      icon: "mdi-speedometer",
                      color: "primary",
                      size: "small",
                      class: "mr-2"
                    }),
                    _cache[6] || (_cache[6] = _createElementVNode("span", null, "流控状态", -1)),
                    _createVNode(VSpacer),
                    (rateLimitData.value)
                      ? (_openBlock(), _createBlock(VChip, {
                          key: 0,
                          size: "x-small",
                          color: rateLimitData.value.globalEnabled ? 'success' : 'grey',
                          variant: "flat"
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
                (rateLimitData.value)
                  ? (_openBlock(), _createBlock(VCardText, {
                      key: 0,
                      class: "pa-0"
                    }, {
                      default: _withCtx(() => [
                        _createVNode(VTable, {
                          density: "compact",
                          hover: "",
                          class: "text-body-2"
                        }, {
                          default: _withCtx(() => [
                            _cache[7] || (_cache[7] = _createElementVNode("thead", null, [
                              _createElementVNode("tr", null, [
                                _createElementVNode("th", { class: "text-body-2 font-weight-bold" }, "数据源"),
                                _createElementVNode("th", { class: "text-body-2 font-weight-bold text-center" }, "直接调用"),
                                _createElementVNode("th", { class: "text-body-2 font-weight-bold text-center" }, "后备调用"),
                                _createElementVNode("th", { class: "text-body-2 font-weight-bold text-center" }, "总调用"),
                                _createElementVNode("th", { class: "text-body-2 font-weight-bold text-center" }, "配额")
                              ])
                            ], -1)),
                            _createElementVNode("tbody", null, [
                              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(rateLimitData.value.providers, (provider) => {
                                return (_openBlock(), _createElementBlock("tr", {
                                  key: provider.providerName
                                }, [
                                  _createElementVNode("td", _hoisted_3, _toDisplayString(provider.providerName), 1),
                                  _createElementVNode("td", _hoisted_4, _toDisplayString(provider.directCount), 1),
                                  _createElementVNode("td", _hoisted_5, _toDisplayString(provider.fallbackCount), 1),
                                  _createElementVNode("td", _hoisted_6, _toDisplayString(provider.requestCount), 1),
                                  _createElementVNode("td", _hoisted_7, _toDisplayString(provider.quota === '∞' ? '无限' : provider.quota), 1)
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
                      class: "text-center text-grey pa-2"
                    }, {
                      default: _withCtx(() => [
                        _createVNode(VIcon, {
                          icon: "mdi-information-outline",
                          size: "small",
                          class: "mb-1"
                        }),
                        _cache[8] || (_cache[8] = _createElementVNode("div", { class: "text-caption" }, "无法获取流控状态", -1))
                      ]),
                      _: 1
                    }))
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
                      icon: "mdi-format-list-bulleted",
                      color: "primary",
                      size: "small",
                      class: "mr-2"
                    }),
                    _cache[9] || (_cache[9] = _createElementVNode("span", null, "待处理任务", -1)),
                    _createVNode(VChip, {
                      size: "x-small",
                      color: "info",
                      variant: "flat",
                      class: "ml-1"
                    }, {
                      default: _withCtx(() => [
                        _createTextVNode(_toDisplayString(tasks.value.length) + " 个任务 ", 1)
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                (tasks.value.length > 0)
                  ? (_openBlock(), _createBlock(VCardText, {
                      key: 0,
                      class: "pa-0"
                    }, {
                      default: _withCtx(() => [
                        _createVNode(VTable, {
                          density: "compact",
                          hover: "",
                          class: "text-body-2"
                        }, {
                          default: _withCtx(() => [
                            _cache[11] || (_cache[11] = _createElementVNode("thead", null, [
                              _createElementVNode("tr", null, [
                                _createElementVNode("th", { class: "text-body-2 font-weight-bold" }, "类型"),
                                _createElementVNode("th", { class: "text-body-2 font-weight-bold" }, "标题"),
                                _createElementVNode("th", { class: "text-body-2 font-weight-bold" }, "剧集信息"),
                                _createElementVNode("th", { class: "text-body-2 font-weight-bold text-center" }, "状态"),
                                _createElementVNode("th", { class: "text-body-2 font-weight-bold text-right" }, "操作")
                              ])
                            ], -1)),
                            _createElementVNode("tbody", null, [
                              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(tasks.value, (task) => {
                                return (_openBlock(), _createElementBlock("tr", {
                                  key: task.task_id
                                }, [
                                  _createElementVNode("td", _hoisted_8, [
                                    _createVNode(VChip, {
                                      size: "small",
                                      color: task.media_type === 'tv' ? 'primary' : 'secondary',
                                      variant: "flat"
                                    }, {
                                      default: _withCtx(() => [
                                        _createTextVNode(_toDisplayString(task.media_type === 'tv' ? '电视剧' : '电影'), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["color"])
                                  ]),
                                  _createElementVNode("td", _hoisted_9, _toDisplayString(task.title), 1),
                                  _createElementVNode("td", _hoisted_10, _toDisplayString(task.episode_info || '-'), 1),
                                  _createElementVNode("td", _hoisted_11, [
                                    _createVNode(VChip, {
                                      size: "small",
                                      color: getStatusColor(task.status),
                                      variant: "flat"
                                    }, {
                                      default: _withCtx(() => [
                                        _createTextVNode(_toDisplayString(getStatusText(task.status)), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["color"])
                                  ]),
                                  _createElementVNode("td", _hoisted_12, [
                                    _createElementVNode("div", _hoisted_13, [
                                      _createVNode(VBtn, {
                                        density: "comfortable",
                                        icon: "",
                                        variant: "text",
                                        color: "grey-darken-1",
                                        size: "small",
                                        disabled: task.status === 'processing',
                                        onClick: $event => (deleteTask(task))
                                      }, {
                                        default: _withCtx(() => [
                                          _createVNode(VIcon, {
                                            icon: "mdi-delete",
                                            size: "small"
                                          }),
                                          _createVNode(VTooltip, {
                                            activator: "parent",
                                            location: "top"
                                          }, {
                                            default: _withCtx(() => [...(_cache[10] || (_cache[10] = [
                                              _createTextVNode("删除此任务", -1)
                                            ]))]),
                                            _: 1
                                          })
                                        ]),
                                        _: 1
                                      }, 8, ["disabled", "onClick"])
                                    ])
                                  ])
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
                      class: "text-center text-grey pa-2"
                    }, {
                      default: _withCtx(() => [
                        _createVNode(VIcon, {
                          icon: "mdi-information-outline",
                          size: "small",
                          class: "mb-1"
                        }),
                        _cache[12] || (_cache[12] = _createElementVNode("div", { class: "text-caption" }, "暂无待处理任务", -1))
                      ]),
                      _: 1
                    }))
              ]),
              _: 1
            })
          ]),
          _: 1
        }),
        _createVNode(VDivider),
        _createVNode(VCardActions, { class: "px-2 py-1" }, {
          default: _withCtx(() => [
            _createVNode(VBtn, {
              color: "primary",
              onClick: _cache[0] || (_cache[0] = $event => (emit('switch'))),
              "prepend-icon": "mdi-cog",
              variant: "text",
              size: "small"
            }, {
              default: _withCtx(() => [...(_cache[13] || (_cache[13] = [
                _createTextVNode(" 配置 ", -1)
              ]))]),
              _: 1
            }),
            _createVNode(VSpacer),
            _createVNode(VBtn, {
              color: "info",
              onClick: refreshTasks,
              loading: loading.value,
              "prepend-icon": "mdi-refresh",
              variant: "text",
              size: "small"
            }, {
              default: _withCtx(() => [...(_cache[14] || (_cache[14] = [
                _createTextVNode(" 刷新状态 ", -1)
              ]))]),
              _: 1
            }, 8, ["loading"]),
            _createVNode(VBtn, {
              color: "success",
              onClick: clearAllTasks,
              "prepend-icon": "mdi-delete-sweep",
              variant: "text",
              size: "small"
            }, {
              default: _withCtx(() => [...(_cache[15] || (_cache[15] = [
                _createTextVNode(" 清空队列 ", -1)
              ]))]),
              _: 1
            }),
            _createVNode(VBtn, {
              color: "grey",
              onClick: _cache[1] || (_cache[1] = $event => (emit('close'))),
              "prepend-icon": "mdi-close",
              variant: "text",
              size: "small"
            }, {
              default: _withCtx(() => [...(_cache[16] || (_cache[16] = [
                _createTextVNode(" 关闭 ", -1)
              ]))]),
              _: 1
            })
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
const Page = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-4c756da5"]]);

export { Page as default };
