import { importShared } from './__federation_fn_import-oc7trqad.js';
import { c as createForm, u as useRender, f as forwardRefs, m as makeFormProps, a as makeComponentProps, b as useLoader, d as useFocus, e as makeVSelectionControlProps, g as makeVInputProps, V as VInput, h as VSelectionControl, i as VDefaultsProvider, j as VScaleTransition, k as VIcon, L as LoaderSlot, l as VProgressCircular, n as VCard, o as VCardTitle, p as VCardText, q as VRow, r as VCol, s as VTextField, t as VSelect, v as VAlert } from './VSelect-Cj1toXI0.js';
import { t as genericComponent, v as propsFactory, w as useProxiedModel, S as SUPPORTS_MATCH_MEDIA, x as filterInputAttrs } from './theme-BAWxfzBN.js';

const {normalizeClass:_normalizeClass$1,normalizeStyle:_normalizeStyle$1,createElementVNode:_createElementVNode$2} = await importShared('vue');
const {ref: ref$2} = await importShared('vue');
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
    const formRef = ref$2();
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
    useRender(() => _createElementVNode$2("form", {
      "ref": formRef,
      "class": _normalizeClass$1(['v-form', props.class]),
      "style": _normalizeStyle$1(props.style),
      "novalidate": true,
      "onReset": onReset,
      "onSubmit": onSubmit
    }, [slots.default?.(form)]));
    return forwardRefs(form, formRef);
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

const {createTextVNode:_createTextVNode,withCtx:_withCtx,createVNode:_createVNode,createElementVNode:_createElementVNode,openBlock:_openBlock,createBlock:_createBlock} = await importShared('vue');


const {ref,watch} = await importShared('vue');



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
  setup(__props) {

const props = __props;

const localConfig = ref({
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

const searchTypeItems = [
  { title: 'TMDB ID', value: 'tmdb' },
  { title: 'TVDB ID', value: 'tvdb' },
  { title: 'Douban ID', value: 'douban' },
  { title: 'IMDB ID', value: 'imdb' },
  { title: 'Bangumi ID', value: 'bangumi' },
  { title: '关键词', value: 'keyword' }
];

const saveConfig = async () => {
  try {
    const response = await props.api.post('config', localConfig.value);
    if (response.success) {
      console.log('配置保存成功');
    }
  } catch (error) {
    console.error('保存配置失败:', error);
  }
};

return (_ctx, _cache) => {
                                                       
                                                                   
                                                           
                                                     
                                                     
                                                                 
                                                       
                                                                   
                                                           
                                                         
                                                       

  return (_openBlock(), _createBlock(VForm, null, {
    default: _withCtx(() => [
      _createVNode(VCard, {
        class: "mb-4",
        variant: "tonal"
      }, {
        default: _withCtx(() => [
          _createVNode(VCardTitle, { class: "d-flex align-center" }, {
            default: _withCtx(() => [
              _createVNode(VIcon, { class: "mr-2" }, {
                default: _withCtx(() => [...(_cache[11] || (_cache[11] = [
                  _createTextVNode("mdi-cog", -1)
                ]))]),
                _: 1
              }),
              _cache[12] || (_cache[12] = _createTextVNode(" 基础设置 ", -1))
            ]),
            _: 1
          }),
          _createVNode(VCardText, null, {
            default: _withCtx(() => [
              _createVNode(VRow, null, {
                default: _withCtx(() => [
                  _createVNode(VCol, {
                    cols: "12",
                    md: "4"
                  }, {
                    default: _withCtx(() => [
                      _createVNode(VSwitch, {
                        modelValue: localConfig.value.enable,
                        "onUpdate:modelValue": [
                          _cache[0] || (_cache[0] = $event => ((localConfig.value.enable) = $event)),
                          saveConfig
                        ],
                        label: "启用插件",
                        color: "primary",
                        "hide-details": ""
                      }, null, 8, ["modelValue"])
                    ]),
                    _: 1
                  }),
                  _createVNode(VCol, {
                    cols: "12",
                    md: "4"
                  }, {
                    default: _withCtx(() => [
                      _createVNode(VSwitch, {
                        modelValue: localConfig.value.notify,
                        "onUpdate:modelValue": [
                          _cache[1] || (_cache[1] = $event => ((localConfig.value.notify) = $event)),
                          saveConfig
                        ],
                        label: "发送通知",
                        color: "primary",
                        "hide-details": ""
                      }, null, 8, ["modelValue"])
                    ]),
                    _: 1
                  }),
                  _createVNode(VCol, {
                    cols: "12",
                    md: "4"
                  }, {
                    default: _withCtx(() => [
                      _createVNode(VSwitch, {
                        modelValue: localConfig.value.only_anime,
                        "onUpdate:modelValue": [
                          _cache[2] || (_cache[2] = $event => ((localConfig.value.only_anime) = $event)),
                          saveConfig
                        ],
                        label: "仅处理动漫",
                        color: "primary",
                        "hide-details": ""
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
        class: "mb-4",
        variant: "tonal"
      }, {
        default: _withCtx(() => [
          _createVNode(VCardTitle, { class: "d-flex align-center" }, {
            default: _withCtx(() => [
              _createVNode(VIcon, { class: "mr-2" }, {
                default: _withCtx(() => [...(_cache[13] || (_cache[13] = [
                  _createTextVNode("mdi-server", -1)
                ]))]),
                _: 1
              }),
              _cache[14] || (_cache[14] = _createTextVNode(" 弹幕库设置 ", -1))
            ]),
            _: 1
          }),
          _createVNode(VCardText, null, {
            default: _withCtx(() => [
              _createVNode(VRow, null, {
                default: _withCtx(() => [
                  _createVNode(VCol, {
                    cols: "12",
                    md: "6"
                  }, {
                    default: _withCtx(() => [
                      _createVNode(VTextField, {
                        modelValue: localConfig.value.danmu_server_url,
                        "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => ((localConfig.value.danmu_server_url) = $event)),
                        label: "弹幕库服务器地址",
                        placeholder: "http://localhost:3000",
                        "prepend-inner-icon": "mdi-web",
                        variant: "outlined",
                        density: "comfortable",
                        hint: "弹幕库服务器的完整URL地址",
                        "persistent-hint": "",
                        onBlur: saveConfig
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
                        modelValue: localConfig.value.external_api_key,
                        "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => ((localConfig.value.external_api_key) = $event)),
                        label: "外部控制API密钥",
                        placeholder: "请输入API Key",
                        "prepend-inner-icon": "mdi-key",
                        variant: "outlined",
                        density: "comfortable",
                        type: "password",
                        hint: "在弹幕库设置中获取外部控制API密钥",
                        "persistent-hint": "",
                        onBlur: saveConfig
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
        class: "mb-4",
        variant: "tonal"
      }, {
        default: _withCtx(() => [
          _createVNode(VCardTitle, { class: "d-flex align-center" }, {
            default: _withCtx(() => [
              _createVNode(VIcon, { class: "mr-2" }, {
                default: _withCtx(() => [...(_cache[15] || (_cache[15] = [
                  _createTextVNode("mdi-format-list-bulleted", -1)
                ]))]),
                _: 1
              }),
              _cache[16] || (_cache[16] = _createTextVNode(" 任务队列设置 ", -1))
            ]),
            _: 1
          }),
          _createVNode(VCardText, null, {
            default: _withCtx(() => [
              _createVNode(VRow, null, {
                default: _withCtx(() => [
                  _createVNode(VCol, {
                    cols: "12",
                    md: "4"
                  }, {
                    default: _withCtx(() => [
                      _createVNode(VTextField, {
                        modelValue: localConfig.value.cron,
                        "onUpdate:modelValue": _cache[5] || (_cache[5] = $event => ((localConfig.value.cron) = $event)),
                        label: "定时任务Cron表达式",
                        placeholder: "*/5 * * * *",
                        "prepend-inner-icon": "mdi-timer-outline",
                        variant: "outlined",
                        density: "comfortable",
                        hint: "定时处理队列的Cron表达式,默认每5分钟",
                        "persistent-hint": "",
                        onBlur: saveConfig
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
                        modelValue: localConfig.value.delay_seconds,
                        "onUpdate:modelValue": _cache[6] || (_cache[6] = $event => ((localConfig.value.delay_seconds) = $event)),
                        modelModifiers: { number: true },
                        label: "延时导入(秒)",
                        type: "number",
                        placeholder: "0",
                        "prepend-inner-icon": "mdi-clock-outline",
                        variant: "outlined",
                        density: "comfortable",
                        hint: "媒体下载完成后延时多少秒再导入,默认0秒",
                        "persistent-hint": "",
                        onBlur: saveConfig
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
                        modelValue: localConfig.value.max_queue_size,
                        "onUpdate:modelValue": _cache[7] || (_cache[7] = $event => ((localConfig.value.max_queue_size) = $event)),
                        modelModifiers: { number: true },
                        label: "最大队列长度",
                        type: "number",
                        placeholder: "100",
                        "prepend-inner-icon": "mdi-format-list-numbered",
                        variant: "outlined",
                        density: "comfortable",
                        hint: "任务队列最大长度,超过将拒绝新任务",
                        "persistent-hint": "",
                        onBlur: saveConfig
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
        class: "mb-4",
        variant: "tonal"
      }, {
        default: _withCtx(() => [
          _createVNode(VCardTitle, { class: "d-flex align-center" }, {
            default: _withCtx(() => [
              _createVNode(VIcon, { class: "mr-2" }, {
                default: _withCtx(() => [...(_cache[17] || (_cache[17] = [
                  _createTextVNode("mdi-tune", -1)
                ]))]),
                _: 1
              }),
              _cache[18] || (_cache[18] = _createTextVNode(" 高级设置 ", -1))
            ]),
            _: 1
          }),
          _createVNode(VCardText, null, {
            default: _withCtx(() => [
              _createVNode(VRow, null, {
                default: _withCtx(() => [
                  _createVNode(VCol, {
                    cols: "12",
                    md: "4"
                  }, {
                    default: _withCtx(() => [
                      _createVNode(VSelect, {
                        modelValue: localConfig.value.search_type,
                        "onUpdate:modelValue": [
                          _cache[8] || (_cache[8] = $event => ((localConfig.value.search_type) = $event)),
                          saveConfig
                        ],
                        label: "搜索类型",
                        items: searchTypeItems,
                        "prepend-inner-icon": "mdi-magnify",
                        variant: "outlined",
                        density: "comfortable",
                        hint: "推送到弹幕库时使用的搜索类型",
                        "persistent-hint": ""
                      }, null, 8, ["modelValue"])
                    ]),
                    _: 1
                  }),
                  _createVNode(VCol, {
                    cols: "12",
                    md: "4"
                  }, {
                    default: _withCtx(() => [
                      _createVNode(VSwitch, {
                        modelValue: localConfig.value.auto_retry,
                        "onUpdate:modelValue": [
                          _cache[9] || (_cache[9] = $event => ((localConfig.value.auto_retry) = $event)),
                          saveConfig
                        ],
                        label: "失败自动重试",
                        color: "primary",
                        "hide-details": ""
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
                        modelValue: localConfig.value.retry_count,
                        "onUpdate:modelValue": _cache[10] || (_cache[10] = $event => ((localConfig.value.retry_count) = $event)),
                        modelModifiers: { number: true },
                        label: "重试次数",
                        type: "number",
                        placeholder: "3",
                        "prepend-inner-icon": "mdi-refresh",
                        variant: "outlined",
                        density: "comfortable",
                        hint: "失败后最多重试次数",
                        "persistent-hint": "",
                        disabled: !localConfig.value.auto_retry,
                        onBlur: saveConfig
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
      _createVNode(VAlert, {
        type: "info",
        variant: "tonal",
        prominent: ""
      }, {
        default: _withCtx(() => [
          _createVNode(VIcon, { class: "mr-2" }, {
            default: _withCtx(() => [...(_cache[19] || (_cache[19] = [
              _createTextVNode("mdi-information", -1)
            ]))]),
            _: 1
          }),
          _cache[20] || (_cache[20] = _createElementVNode("strong", null, "使用说明:", -1)),
          _cache[21] || (_cache[21] = _createTextVNode(" 插件会在媒体下载完成后自动将任务添加到队列,由定时任务处理。支持延时导入、失败重试等功能。 ", -1))
        ]),
        _: 1
      })
    ]),
    _: 1
  }))
}
}

};

export { _sfc_main as default };
