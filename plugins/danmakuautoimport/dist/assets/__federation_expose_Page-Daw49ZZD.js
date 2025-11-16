import { importShared } from './__federation_fn_import-9Z7hiN6o.js';
import { i as useDimension, u as useRender, W as makeTagProps, h as makeDimensionProps, m as makeComponentProps, b as useDensity, a as makeDensityProps, _ as _export_sfc, P as VRow, Q as VCol, K as VCard, N as VCardTitle, V as VIcon, D as VDivider, O as VCardText, G as VChip, U as VSpacer, B as VList, C as VListItem, X as VListItemTitle, Y as VListItemSubtitle, T as VBtn } from './VList-GrR_JHJE.js';
import { y as genericComponent, w as propsFactory, r as useRtl, V as provideTheme, C as makeThemeProps, Z as convertToUnit } from './theme-BcIEhh1k.js';

const {normalizeClass:_normalizeClass$1,normalizeStyle:_normalizeStyle$1,createVNode:_createVNode$2} = await importShared('vue');
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
    useRender(() => _createVNode$2(props.tag, {
      "class": _normalizeClass$1(['v-container', {
        'v-container--fluid': props.fluid
      }, rtlClasses.value, props.class]),
      "style": _normalizeStyle$1([dimensionStyles.value, props.style])
    }, slots));
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

const {createVNode:_createVNode,createTextVNode:_createTextVNode,withCtx:_withCtx,createElementVNode:_createElementVNode,toDisplayString:_toDisplayString,renderList:_renderList,Fragment:_Fragment,openBlock:_openBlock,createElementBlock:_createElementBlock,createCommentVNode:_createCommentVNode,createBlock:_createBlock} = await importShared('vue');


const _hoisted_1 = { class: "mb-2" };
const _hoisted_2 = { class: "mb-2" };
const _hoisted_3 = { class: "ml-2 text-body-2" };
const _hoisted_4 = { class: "mb-2" };
const _hoisted_5 = { class: "ml-2 text-body-2" };
const _hoisted_6 = { class: "mb-2" };
const _hoisted_7 = { class: "ml-2 font-weight-bold text-primary" };
const _hoisted_8 = { class: "ml-2 font-weight-bold text-warning" };
const _hoisted_9 = { key: 0 };
const _hoisted_10 = { class: "d-flex justify-space-between align-center" };
const _hoisted_11 = { class: "text-caption" };
const _hoisted_12 = {
  key: 1,
  class: "text-center text-grey text-caption py-4"
};
const _hoisted_13 = { class: "text-body-2 font-weight-bold" };
const _hoisted_14 = { class: "text-caption text-grey" };
const _hoisted_15 = { class: "text-body-2 font-weight-bold" };
const _hoisted_16 = { class: "text-body-2 font-weight-bold" };
const _hoisted_17 = { class: "text-body-2" };
const _hoisted_18 = { class: "text-body-2" };
const _hoisted_19 = { class: "text-body-2" };
const _hoisted_20 = { class: "text-body-2" };
const _hoisted_21 = { class: "text-body-2" };

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

// 清空队列
const clearAllTasks = async () => {
  if (!confirm('确定要清空所有待处理任务吗?')) {
    return
  }

  try {
    // 删除所有待处理任务
    for (const task of tasks.value) {
      if (task.status !== 'processing') {
        await props.api.post('delete_task', { task_id: task.task_id });
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
                                                       
                                                                   
                                                             
                                                       
                                                                 
                                                       
                                                     
                                                     
                                                           
                                                         
                                                                             
                                                                                   
                                                     
                                                                 
                                                       
                                                                 

  return (_openBlock(), _createBlock(VContainer, { fluid: "" }, {
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
                class: "rounded border"
              }, {
                default: _withCtx(() => [
                  _createVNode(VCardTitle, { class: "text-subtitle-1 d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
                    default: _withCtx(() => [
                      _createVNode(VIcon, {
                        icon: "mdi-information-outline",
                        color: "primary",
                        size: "small",
                        class: "mr-2"
                      }),
                      _cache[0] || (_cache[0] = _createTextVNode(" 当前状态 ", -1))
                    ]),
                    _: 1
                  }),
                  _createVNode(VDivider),
                  _createVNode(VCardText, { class: "px-3 py-2" }, {
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
              _createVNode(VCard, {
                flat: "",
                class: "rounded border"
              }, {
                default: _withCtx(() => [
                  _createVNode(VCardTitle, { class: "text-subtitle-1 d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
                    default: _withCtx(() => [
                      _createVNode(VIcon, {
                        icon: "mdi-history",
                        color: "primary",
                        size: "small",
                        class: "mr-2"
                      }),
                      _cache[6] || (_cache[6] = _createTextVNode(" 处理历史 ", -1))
                    ]),
                    _: 1
                  }),
                  _createVNode(VDivider),
                  _createVNode(VCardText, { class: "px-3 py-2" }, {
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
              _createVNode(VCard, {
                flat: "",
                class: "rounded border"
              }, {
                default: _withCtx(() => [
                  _createVNode(VCardTitle, { class: "text-subtitle-1 d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
                    default: _withCtx(() => [
                      _createVNode(VIcon, {
                        icon: "mdi-speedometer",
                        color: "primary",
                        size: "small",
                        class: "mr-2"
                      }),
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
                    ? (_openBlock(), _createBlock(VCardText, {
                        key: 0,
                        class: "px-3 py-2"
                      }, {
                        default: _withCtx(() => [
                          _createVNode(VRow, { class: "mb-2" }, {
                            default: _withCtx(() => [
                              _createVNode(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: _withCtx(() => [
                                  _cache[8] || (_cache[8] = _createElementVNode("div", { class: "text-caption text-grey mb-1" }, "全局流控", -1)),
                                  _createElementVNode("div", _hoisted_13, _toDisplayString(rateLimitData.value.globalRequestCount) + " / " + _toDisplayString(rateLimitData.value.globalLimit), 1),
                                  _createElementVNode("div", _hoisted_14, "重置: " + _toDisplayString(rateLimitData.value.secondsUntilReset) + "秒", 1)
                                ]),
                                _: 1
                              }),
                              _createVNode(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: _withCtx(() => [
                                  _cache[9] || (_cache[9] = _createElementVNode("div", { class: "text-caption text-grey mb-1" }, "后备流控", -1)),
                                  _createElementVNode("div", _hoisted_15, _toDisplayString(rateLimitData.value.fallback.totalCount) + " / " + _toDisplayString(rateLimitData.value.fallback.totalLimit), 1)
                                ]),
                                _: 1
                              }),
                              _createVNode(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: _withCtx(() => [
                                  _cache[10] || (_cache[10] = _createElementVNode("div", { class: "text-caption text-grey mb-1" }, "数据源", -1)),
                                  _createElementVNode("div", _hoisted_16, _toDisplayString(rateLimitData.value.providers.length) + " 个", 1)
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          _createVNode(VDivider, { class: "my-2" }),
                          _createVNode(VTable, {
                            density: "compact",
                            hover: ""
                          }, {
                            default: _withCtx(() => [
                              _cache[11] || (_cache[11] = _createElementVNode("thead", null, [
                                _createElementVNode("tr", null, [
                                  _createElementVNode("th", { class: "text-caption" }, "数据源"),
                                  _createElementVNode("th", { class: "text-caption" }, "直接调用"),
                                  _createElementVNode("th", { class: "text-caption" }, "后备调用"),
                                  _createElementVNode("th", { class: "text-caption" }, "总调用"),
                                  _createElementVNode("th", { class: "text-caption" }, "配额")
                                ])
                              ], -1)),
                              _createElementVNode("tbody", null, [
                                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(rateLimitData.value.providers, (provider) => {
                                  return (_openBlock(), _createElementBlock("tr", {
                                    key: provider.providerName
                                  }, [
                                    _createElementVNode("td", _hoisted_17, _toDisplayString(provider.providerName), 1),
                                    _createElementVNode("td", _hoisted_18, _toDisplayString(provider.directCount), 1),
                                    _createElementVNode("td", _hoisted_19, _toDisplayString(provider.fallbackCount), 1),
                                    _createElementVNode("td", _hoisted_20, _toDisplayString(provider.requestCount), 1),
                                    _createElementVNode("td", _hoisted_21, _toDisplayString(provider.quota === '∞' ? '无限' : provider.quota), 1)
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
                        class: "text-center text-grey text-caption py-4"
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
              _createVNode(VCard, {
                flat: "",
                class: "rounded border"
              }, {
                default: _withCtx(() => [
                  _createVNode(VCardTitle, { class: "text-subtitle-1 d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
                    default: _withCtx(() => [
                      _createVNode(VIcon, {
                        icon: "mdi-format-list-bulleted",
                        color: "primary",
                        size: "small",
                        class: "mr-2"
                      }),
                      _cache[13] || (_cache[13] = _createTextVNode(" 待处理任务 ", -1)),
                      _createVNode(VSpacer),
                      _createVNode(VChip, {
                        size: "small",
                        variant: "outlined"
                      }, {
                        default: _withCtx(() => [
                          _createTextVNode(_toDisplayString(tasks.value.length) + " 个任务 ", 1)
                        ]),
                        _: 1
                      })
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
                          _createVNode(VList, { density: "compact" }, {
                            default: _withCtx(() => [
                              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(tasks.value, (task, index) => {
                                return (_openBlock(), _createElementBlock(_Fragment, {
                                  key: task.task_id
                                }, [
                                  _createVNode(VListItem, { class: "px-3" }, {
                                    prepend: _withCtx(() => [
                                      _createVNode(VChip, {
                                        size: "small",
                                        variant: "outlined",
                                        color: task.media_type === 'tv' ? 'primary' : 'secondary'
                                      }, {
                                        default: _withCtx(() => [
                                          _createTextVNode(_toDisplayString(task.media_type === 'tv' ? '电视剧' : '电影'), 1)
                                        ]),
                                        _: 2
                                      }, 1032, ["color"])
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
                                      _createVNode(VListItemTitle, { class: "text-body-2" }, {
                                        default: _withCtx(() => [
                                          _createTextVNode(_toDisplayString(task.title), 1)
                                        ]),
                                        _: 2
                                      }, 1024),
                                      (task.episode_info !== '-')
                                        ? (_openBlock(), _createBlock(VListItemSubtitle, {
                                            key: 0,
                                            class: "text-caption"
                                          }, {
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
                        class: "text-center text-grey text-caption py-4"
                      }, {
                        default: _withCtx(() => [...(_cache[14] || (_cache[14] = [
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
      }),
      _createVNode(VRow, { class: "mt-4" }, {
        default: _withCtx(() => [
          _createVNode(VCol, {
            cols: "12",
            class: "d-flex justify-end"
          }, {
            default: _withCtx(() => [
              _createVNode(VBtn, {
                variant: "outlined",
                class: "mr-2",
                onClick: refreshTasks,
                loading: loading.value
              }, {
                default: _withCtx(() => [...(_cache[15] || (_cache[15] = [
                  _createTextVNode(" 刷新状态 ", -1)
                ]))]),
                _: 1
              }, 8, ["loading"]),
              _createVNode(VBtn, {
                color: "primary",
                onClick: clearAllTasks
              }, {
                default: _withCtx(() => [...(_cache[16] || (_cache[16] = [
                  _createTextVNode(" 清空队列 ", -1)
                ]))]),
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
const Page = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-07563e59"]]);

export { Page as default };
