import { importShared } from './__federation_fn_import-DglrmYpL.js';
import { B as useFocus, u as useRender, f as forwardRefs, D as makeVInputProps, R as makeVCheckboxBtnProps, E as VInput, w as VCheckboxBtn, S as useBackgroundColor, d as useDimension, T as useElevation, U as makeElevationProps, e as makeDimensionProps, W as useDensity, X as makeTagProps, Y as makeDensityProps, a as makeComponentProps, Z as useScopeId, $ as makeVOverlayProps, a0 as VOverlay, _ as _export_sfc, I as VCard, J as VCardTitle, p as VIcon, K as VCardText, M as VRow, N as VCol, r as VList, s as VListItem, a1 as VListItemTitle, Q as VSpacer, y as VChip, a2 as VProgressLinear, t as VDivider, P as VBtn, q as VMenu, o as VTextField, O as VCardActions } from './VTextField-C0l1vibv.js';
import { t as genericComponent, v as propsFactory, C as useProxiedModel, E as omit, O as filterInputAttrs, P as provideTheme, u as useLocale, F as wrapInArray, Q as makeThemeProps, B as convertToUnit } from './theme-DITlnZcp.js';

const {mergeProps:_mergeProps$2,createVNode:_createVNode$3} = await importShared('vue');
const {ref: ref$2,useId: useId$1} = await importShared('vue');
const makeVCheckboxProps = propsFactory({
  ...makeVInputProps(),
  ...omit(makeVCheckboxBtnProps(), ['inline'])
}, 'VCheckbox');
const VCheckbox = genericComponent()({
  name: 'VCheckbox',
  inheritAttrs: false,
  props: makeVCheckboxProps(),
  emits: {
    'update:modelValue': value => true,
    'update:focused': focused => true
  },
  setup(props, _ref) {
    let {
      attrs,
      slots
    } = _ref;
    const model = useProxiedModel(props, 'modelValue');
    const {
      isFocused,
      focus,
      blur
    } = useFocus(props);
    const inputRef = ref$2();
    const uid = useId$1();
    useRender(() => {
      const [rootAttrs, controlAttrs] = filterInputAttrs(attrs);
      const inputProps = VInput.filterProps(props);
      const checkboxProps = VCheckboxBtn.filterProps(props);
      return _createVNode$3(VInput, _mergeProps$2({
        "ref": inputRef,
        "class": ['v-checkbox', props.class]
      }, rootAttrs, inputProps, {
        "modelValue": model.value,
        "onUpdate:modelValue": $event => model.value = $event,
        "id": props.id || `checkbox-${uid}`,
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
          return _createVNode$3(VCheckboxBtn, _mergeProps$2(checkboxProps, {
            "id": id.value,
            "aria-describedby": messagesId.value,
            "disabled": isDisabled.value,
            "readonly": isReadonly.value
          }, controlAttrs, {
            "error": isValid.value === false,
            "modelValue": model.value,
            "onUpdate:modelValue": $event => model.value = $event,
            "onFocus": focus,
            "onBlur": blur
          }), slots);
        }
      });
    });
    return forwardRefs({}, inputRef);
  }
});

const {normalizeClass:_normalizeClass$2,createElementVNode:_createElementVNode$2,mergeProps:_mergeProps$1,Fragment:_Fragment$1} = await importShared('vue');
const {computed: computed$2} = await importShared('vue');
const rootTypes = {
  actions: 'button@2',
  article: 'heading, paragraph',
  avatar: 'avatar',
  button: 'button',
  card: 'image, heading',
  'card-avatar': 'image, list-item-avatar',
  chip: 'chip',
  'date-picker': 'list-item, heading, divider, date-picker-options, date-picker-days, actions',
  'date-picker-options': 'text, avatar@2',
  'date-picker-days': 'avatar@28',
  divider: 'divider',
  heading: 'heading',
  image: 'image',
  'list-item': 'text',
  'list-item-avatar': 'avatar, text',
  'list-item-two-line': 'sentences',
  'list-item-avatar-two-line': 'avatar, sentences',
  'list-item-three-line': 'paragraph',
  'list-item-avatar-three-line': 'avatar, paragraph',
  ossein: 'ossein',
  paragraph: 'text@3',
  sentences: 'text@2',
  subtitle: 'text',
  table: 'table-heading, table-thead, table-tbody, table-tfoot',
  'table-heading': 'chip, text',
  'table-thead': 'heading@6',
  'table-tbody': 'table-row-divider@6',
  'table-row-divider': 'table-row, divider',
  'table-row': 'text@6',
  'table-tfoot': 'text@2, avatar@2',
  text: 'text'
};
function genBone(type) {
  let children = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return _createElementVNode$2("div", {
    "class": _normalizeClass$2(['v-skeleton-loader__bone', `v-skeleton-loader__${type}`])
  }, [children]);
}
function genBones(bone) {
  // e.g. 'text@3'
  const [type, length] = bone.split('@');

  // Generate a length array based upon
  // value after @ in the bone string
  return Array.from({
    length
  }).map(() => genStructure(type));
}
function genStructure(type) {
  let children = [];
  if (!type) return children;

  // TODO: figure out a better way to type this
  const bone = rootTypes[type];

  // End of recursion, do nothing
  /* eslint-disable-next-line no-empty, brace-style */
  if (type === bone) ;
  // Array of values - e.g. 'heading, paragraph, text@2'
  else if (type.includes(',')) return mapBones(type);
  // Array of values - e.g. 'paragraph@4'
  else if (type.includes('@')) return genBones(type);
  // Array of values - e.g. 'card@2'
  else if (bone.includes(',')) children = mapBones(bone);
  // Array of values - e.g. 'list-item@2'
  else if (bone.includes('@')) children = genBones(bone);
  // Single value - e.g. 'card-heading'
  else if (bone) children.push(genStructure(bone));
  return [genBone(type, children)];
}
function mapBones(bones) {
  // Remove spaces and return array of structures
  return bones.replace(/\s/g, '').split(',').map(genStructure);
}
const makeVSkeletonLoaderProps = propsFactory({
  boilerplate: Boolean,
  color: String,
  loading: Boolean,
  loadingText: {
    type: String,
    default: '$vuetify.loading'
  },
  type: {
    type: [String, Array],
    default: 'ossein'
  },
  ...makeDimensionProps(),
  ...makeElevationProps(),
  ...makeThemeProps()
}, 'VSkeletonLoader');
const VSkeletonLoader = genericComponent()({
  name: 'VSkeletonLoader',
  inheritAttrs: false,
  props: makeVSkeletonLoaderProps(),
  setup(props, _ref) {
    let {
      attrs,
      slots
    } = _ref;
    const {
      backgroundColorClasses,
      backgroundColorStyles
    } = useBackgroundColor(() => props.color);
    const {
      dimensionStyles
    } = useDimension(props);
    const {
      elevationClasses
    } = useElevation(props);
    const {
      themeClasses
    } = provideTheme(props);
    const {
      t
    } = useLocale();
    const items = computed$2(() => genStructure(wrapInArray(props.type).join(',')));
    useRender(() => {
      const isLoading = !slots.default || props.loading;
      const loadingProps = props.boilerplate || !isLoading ? {} : {
        ariaLive: 'polite',
        ariaLabel: t(props.loadingText),
        role: 'alert'
      };
      return isLoading ? _createElementVNode$2("div", _mergeProps$1({
        "class": ['v-skeleton-loader', {
          'v-skeleton-loader--boilerplate': props.boilerplate
        }, themeClasses.value, backgroundColorClasses.value, elevationClasses.value],
        "style": [backgroundColorStyles.value, dimensionStyles.value]
      }, loadingProps, attrs), [items.value]) : _createElementVNode$2(_Fragment$1, null, [slots.default?.()]);
    });
    return {};
  }
});

const {createElementVNode:_createElementVNode$1,normalizeClass:_normalizeClass$1,normalizeStyle:_normalizeStyle,createVNode:_createVNode$2} = await importShared('vue');
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
const {computed: computed$1,mergeProps,ref: ref$1,toRef,useId} = await importShared('vue');
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
    const location = computed$1(() => {
      return props.location.split(' ').length > 1 ? props.location : props.location + ' center';
    });
    const origin = computed$1(() => {
      return props.origin === 'auto' || props.origin === 'overlap' || props.origin.split(' ').length > 1 || props.location.split(' ').length > 1 ? props.origin : props.origin + ' center';
    });
    const transition = toRef(() => {
      if (props.transition != null) return props.transition;
      return isActive.value ? 'scale-transition' : 'fade-transition';
    });
    const activatorProps = computed$1(() => mergeProps({
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

const {createVNode:_createVNode,createElementVNode:_createElementVNode,withCtx:_withCtx,openBlock:_openBlock,createBlock:_createBlock,createCommentVNode:_createCommentVNode,toDisplayString:_toDisplayString,createTextVNode:_createTextVNode,renderList:_renderList,Fragment:_Fragment,createElementBlock:_createElementBlock,normalizeClass:_normalizeClass} = await importShared('vue');


const _hoisted_1 = { class: "plugin-page" };
const _hoisted_2 = {
  key: 1,
  class: "text-center text-grey pa-2"
};
const _hoisted_3 = { key: 1 };
const _hoisted_4 = { class: "text-caption mb-2" };
const _hoisted_5 = { class: "d-flex justify-space-between mb-1" };
const _hoisted_6 = { class: "font-weight-bold" };
const _hoisted_7 = { class: "text-caption mb-1" };
const _hoisted_8 = { class: "ml-2 font-weight-bold" };
const _hoisted_9 = { class: "text-caption" };
const _hoisted_10 = { class: "ml-2 font-weight-bold" };
const _hoisted_11 = { class: "text-caption mb-2" };
const _hoisted_12 = { class: "d-flex justify-space-between mb-1" };
const _hoisted_13 = { class: "font-weight-bold" };
const _hoisted_14 = { class: "text-caption mb-1" };
const _hoisted_15 = { class: "ml-2 font-weight-bold" };
const _hoisted_16 = { class: "text-caption" };
const _hoisted_17 = { class: "ml-2 font-weight-bold" };
const _hoisted_18 = { class: "text-caption" };
const _hoisted_19 = { class: "text-caption text-center" };
const _hoisted_20 = { class: "text-caption text-center" };
const _hoisted_21 = {
  key: 2,
  class: "text-center text-grey pa-2"
};
const _hoisted_22 = { class: "d-flex align-center ml-2" };
const _hoisted_23 = { class: "text-caption" };
const _hoisted_24 = { class: "text-caption font-weight-bold" };
const _hoisted_25 = {
  class: "text-body-2 font-weight-bold",
  style: {"width":"50px"}
};
const _hoisted_26 = { class: "text-center" };
const _hoisted_27 = { class: "text-center" };
const _hoisted_28 = { class: "text-caption" };
const _hoisted_29 = { class: "text-caption" };
const _hoisted_30 = { class: "text-caption" };
const _hoisted_31 = { class: "text-center" };
const _hoisted_32 = { class: "text-center" };
const _hoisted_33 = {
  key: 0,
  class: "px-2"
};
const _hoisted_34 = { class: "text-caption" };
const _hoisted_35 = {
  key: 1,
  class: "text-caption text-grey"
};
const _hoisted_36 = { class: "text-right" };
const _hoisted_37 = { class: "d-flex justify-end" };
const _hoisted_38 = {
  key: 0,
  class: "bg-grey-lighten-5"
};
const _hoisted_39 = {
  colspan: "9",
  class: "pa-3"
};
const _hoisted_40 = { class: "text-caption font-weight-bold mb-2" };
const _hoisted_41 = { class: "d-flex flex-wrap align-center mb-3" };
const _hoisted_42 = { class: "d-flex justify-end" };
const _hoisted_43 = {
  key: 2,
  class: "text-center text-grey pa-2"
};
const _hoisted_44 = {
  key: 3,
  class: "text-center text-grey pa-2"
};

const {ref,computed,watch,onMounted,onUnmounted} = await importShared('vue');



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

// ✅ 参考logsclean: 使用函数获取插件ID
const getPluginId = () => {
  return "DanmakuAutoImport"
};

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
const loadingStats = ref(false);
const loadingRateLimit = ref(false);
const loadingBuffer = ref(false);
const loadingTasks = ref(false);
const autoRefreshTimer = ref(null);
const rateLimitData = ref(null);
const countdown = ref(0);
const countdownTimer = ref(null);

// 缓冲区和整合相关
const bufferCount = ref(0);
const consolidateCountdown = ref(0);
const consolidateTimer = ref(null);
const consolidating = ref(false);

// 计算整合进度百分比
const consolidateProgress = computed(() => {
  return (consolidateCountdown.value / 30) * 100
});

// 搜索和批量操作相关
const searchQuery = ref('');
const selectedTasks = ref([]);

// 展开折叠相关
const expandedTasks = ref([]);
const selectAll = ref(false);

// 剧集选择相关
const selectedEpisodes = ref({});

// 过滤后的任务列表
const filteredTasks = computed(() => {
  if (!searchQuery.value) {
    return tasks.value
  }

  const query = searchQuery.value.toLowerCase();
  return tasks.value.filter(task => {
    return (
      task.title?.toLowerCase().includes(query) ||
      task.tmdb_id?.toString().includes(query) ||
      task.episode_info?.toLowerCase().includes(query)
    )
  })
});

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

// 格式化倒计时
const formatCountdown = (seconds) => {
  if (seconds <= 0) return '00:00:00'
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
};

// 启动流控倒计时
const startCountdown = (initialSeconds) => {
  countdown.value = initialSeconds;

  // 清除旧的定时器
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }

  // 启动新的定时器
  countdownTimer.value = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      // 倒计时结束,刷新数据
      refreshTasks();
    }
  }, 1000);
};

// 启动整合倒计时
const startConsolidateCountdown = (initialSeconds) => {
  consolidateCountdown.value = initialSeconds;

  // 清除旧的定时器
  if (consolidateTimer.value) {
    clearInterval(consolidateTimer.value);
  }

  // 启动新的定时器 - 总是运行,即使初始值为0
  consolidateTimer.value = setInterval(() => {
    if (consolidateCountdown.value > 0) {
      consolidateCountdown.value--;
    } else if (consolidateCountdown.value === 0 && bufferCount.value > 0) {
      // 倒计时结束且缓冲区有内容,3秒后刷新一次(给后端时间完成整合)
      setTimeout(() => {
        refreshTasks();
      }, 3000);
      // 重置倒计时为-1,避免重复刷新
      consolidateCountdown.value = -1;
    }
  }, 1000);
};

// 展开/折叠任务
const toggleExpand = (taskId) => {
  const index = expandedTasks.value.indexOf(taskId);
  if (index > -1) {
    expandedTasks.value.splice(index, 1);
  } else {
    expandedTasks.value.push(taskId);
    // 初始化剧集选择(默认全选)
    const task = tasks.value.find(t => t.task_id === taskId);
    if (task && task.episodes) {
      selectedEpisodes.value[taskId] = task.episodes.map(ep => ep.episode);
    }
  }
};

// 剧集排序(从小到大)
const getSortedEpisodes = (episodes) => {
  if (!episodes || !Array.isArray(episodes)) {
    return []
  }
  return [...episodes].sort((a, b) => {
    // 先按季排序,再按集排序
    if (a.season !== b.season) {
      return a.season - b.season
    }
    return a.episode - b.episode
  })
};

// 将选中的集数转换为范围字符串 (如 "1,3,5,9-11")
const episodesToRangeString = (episodes) => {
  if (!episodes || episodes.length === 0) {
    return ''
  }

  // 排序
  const sorted = [...episodes].sort((a, b) => a - b);

  const ranges = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      // 连续
      end = sorted[i];
    } else {
      // 不连续,保存当前范围
      if (start === end) {
        ranges.push(String(start));
      } else {
        ranges.push(`${start}-${end}`);
      }
      start = sorted[i];
      end = sorted[i];
    }
  }

  // 保存最后一个范围
  if (start === end) {
    ranges.push(String(start));
  } else {
    ranges.push(`${start}-${end}`);
  }

  return ranges.join(',')
};

// 导入选中的剧集
const importSelectedEpisodes = async (task) => {
  const selected = selectedEpisodes.value[task.task_id];
  if (!selected || selected.length === 0) {
    alert('请先选择要导入的剧集');
    return
  }

  const rangeString = episodesToRangeString(selected);

  if (!confirm(`确定要导入选中的剧集吗?\n剧集范围: ${rangeString}`)) {
    return
  }

  try {
    const pluginId = getPluginId();
    const response = await props.api.post(`plugin/${pluginId}/import_task`, {
      task_id: task.task_id,
      episodes: rangeString
    });

    if (response && response.success) {
      // 导入成功,刷新任务列表
      await refreshTasks();
      // 清空选择
      delete selectedEpisodes.value[task.task_id];
    } else {
      alert(response?.message || '导入失败');
    }
  } catch (error) {
    console.error('导入剧集失败:', error);
    alert('导入剧集失败: ' + error.message);
  }
};

// 删除选中的剧集
const deleteSelectedEpisodes = async (task) => {
  const selected = selectedEpisodes.value[task.task_id];
  if (!selected || selected.length === 0) {
    alert('请先选择要删除的剧集');
    return
  }

  const rangeString = episodesToRangeString(selected);

  if (!confirm(`确定要删除选中的剧集吗?\n剧集范围: ${rangeString}`)) {
    return
  }

  try {
    const pluginId = getPluginId();
    const response = await props.api.post(`plugin/${pluginId}/delete_task`, {
      task_id: task.task_id,
      episodes: rangeString
    });

    if (response && response.success) {
      // 删除成功,刷新任务列表
      await refreshTasks();
      // 清空选择
      delete selectedEpisodes.value[task.task_id];
    } else {
      alert(response?.message || '删除失败');
    }
  } catch (error) {
    console.error('删除剧集失败:', error);
    alert('删除剧集失败: ' + error.message);
  }
};

const refreshTasks = async () => {
  loading.value = true;
  loadingStats.value = true;
  loadingRateLimit.value = true;
  loadingBuffer.value = true;
  loadingTasks.value = true;

  try {
    const pluginId = getPluginId();

    // 调用插件API获取队列统计
    const statsResponse = await props.api.get(`plugin/${pluginId}/queue_stats`);
    if (statsResponse) {
      Object.assign(stats.value, statsResponse);
    }
    loadingStats.value = false;

    // 调用插件API获取待处理任务和缓冲区状态
    const tasksResponse = await props.api.get(`plugin/${pluginId}/pending_tasks`);
    if (tasksResponse) {
      // 新格式: { buffer_count, consolidate_countdown, tasks }
      if (tasksResponse.tasks && Array.isArray(tasksResponse.tasks)) {
        tasks.value = tasksResponse.tasks;
        bufferCount.value = tasksResponse.buffer_count || 0;

        // 更新倒计时值
        const newCountdown = tasksResponse.consolidate_countdown || 0;

        // 如果倒计时值变化了,重新启动定时器
        if (newCountdown !== consolidateCountdown.value) {
          consolidateCountdown.value = newCountdown;
          // 总是启动倒计时(即使缓冲区为空)
          if (!consolidateTimer.value || newCountdown > 0) {
            startConsolidateCountdown(newCountdown);
          }
        }
      } else if (Array.isArray(tasksResponse)) {
        // 兼容旧格式
        tasks.value = tasksResponse;
      }
    }
    loadingBuffer.value = false;
    loadingTasks.value = false;

    // 调用插件API获取流控状态
    const rateLimitResponse = await props.api.get(`plugin/${pluginId}/rate_limit_status`);
    if (rateLimitResponse && !rateLimitResponse.error && rateLimitResponse.globalEnabled !== undefined) {
      rateLimitData.value = rateLimitResponse;
      // 启动倒计时
      if (rateLimitResponse.secondsUntilReset) {
        startCountdown(rateLimitResponse.secondsUntilReset);
      }
    } else {
      rateLimitData.value = null;
    }
    loadingRateLimit.value = false;
  } catch (error) {
    console.error('获取数据失败:', error);
    loadingStats.value = false;
    loadingRateLimit.value = false;
    loadingBuffer.value = false;
    loadingTasks.value = false;
  } finally {
    loading.value = false;
  }
};

// 导入任务
const importTask = async (task) => {
  try {
    const pluginId = getPluginId();
    const response = await props.api.post(`plugin/${pluginId}/import_task`, { task_id: task.task_id });

    if (response && response.success) {
      // 导入成功,刷新任务列表
      await refreshTasks();
    } else {
      alert(response?.message || '导入失败');
    }
  } catch (error) {
    console.error('导入任务失败:', error);
    alert('导入任务失败: ' + error.message);
  }
};

const deleteTask = async (task) => {
  if (!confirm(`确定要删除任务"${task.title}"吗?`)) {
    return
  }

  try {
    // ✅ 参考logsclean: 使用getPluginId()函数
    const pluginId = getPluginId();
    const response = await props.api.post(`plugin/${pluginId}/delete_task`, { task_id: task.task_id });
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

// 批量导入任务
const batchImportTasks = async () => {
  if (selectedTasks.value.length === 0) {
    return
  }

  if (!confirm(`确定要导入选中的 ${selectedTasks.value.length} 个任务吗?`)) {
    return
  }

  try {
    loading.value = true;
    let successCount = 0;
    let failCount = 0;
    const pluginId = getPluginId();

    for (const taskId of selectedTasks.value) {
      try {
        const response = await props.api.post(`plugin/${pluginId}/import_task`, { task_id: taskId });
        if (response && response.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`导入任务 ${taskId} 失败:`, error);
        failCount++;
      }
    }

    // 清空选择
    selectedTasks.value = [];
    selectAll.value = false;

    // 刷新任务列表
    await refreshTasks();

    // 显示结果
    if (failCount > 0) {
      alert(`批量导入完成: 成功 ${successCount} 个, 失败 ${failCount} 个`);
    }
  } catch (error) {
    console.error('批量导入任务失败:', error);
    alert('批量导入任务失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// 批量删除任务
const batchDeleteTasks = async () => {
  if (selectedTasks.value.length === 0) {
    return
  }

  if (!confirm(`确定要删除选中的 ${selectedTasks.value.length} 个任务吗?`)) {
    return
  }

  try {
    loading.value = true;
    let successCount = 0;
    let failCount = 0;

    // ✅ 参考logsclean: 使用getPluginId()函数
    const pluginId = getPluginId();

    for (const taskId of selectedTasks.value) {
      try {
        const response = await props.api.post(`plugin/${pluginId}/delete_task`, { task_id: taskId });
        if (response.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`删除任务 ${taskId} 失败:`, error);
        failCount++;
      }
    }

    // 清空选择
    selectedTasks.value = [];
    selectAll.value = false;

    // 刷新任务列表
    await refreshTasks();

    // 显示结果
    if (failCount > 0) {
      alert(`批量删除完成: 成功 ${successCount} 个, 失败 ${failCount} 个`);
    }
  } catch (error) {
    console.error('批量删除任务失败:', error);
    alert('批量删除任务失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// 全选/反选
const toggleSelectAll = () => {
  if (selectAll.value) {
    // 全选: 选择所有非processing状态的任务
    selectedTasks.value = filteredTasks.value
      .filter(task => task.status !== 'processing')
      .map(task => task.task_id);
  } else {
    // 反选: 清空选择
    selectedTasks.value = [];
  }
};

// 手动整合
const manualConsolidate = async () => {
  if (consolidating.value) {
    return
  }

  try {
    consolidating.value = true;
    const pluginId = getPluginId();

    const response = await props.api.post(`plugin/${pluginId}/consolidate`);

    if (response && response.success) {
      // 整合成功,刷新任务列表
      await refreshTasks();
      // 重置倒计时
      consolidateCountdown.value = 30;
      startConsolidateCountdown(30);
    } else {
      alert(response?.message || '整合失败');
    }
  } catch (error) {
    console.error('手动整合失败:', error);
    alert('手动整合失败: ' + error.message);
  } finally {
    consolidating.value = false;
  }
};

// 清空队列
const clearAllTasks = async () => {
  if (!confirm('确定要清空所有待处理任务吗?')) {
    return
  }

  try {
    // ✅ 参考logsclean: 使用getPluginId()函数
    const pluginId = getPluginId();

    // 删除所有待处理任务
    for (const task of tasks.value) {
      if (task.status !== 'processing') {
        await props.api.post(`plugin/${pluginId}/delete_task`, { task_id: task.task_id });
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

const stopCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
    countdownTimer.value = null;
  }
};

const stopConsolidateCountdown = () => {
  if (consolidateTimer.value) {
    clearInterval(consolidateTimer.value);
    consolidateTimer.value = null;
  }
};

// 监听选择变化,自动更新全选状态
watch(selectedTasks, (newVal) => {
  const selectableTasksCount = filteredTasks.value.filter(task => task.status !== 'processing').length;
  selectAll.value = selectableTasksCount > 0 && newVal.length === selectableTasksCount;
}, { deep: true });

// 监听搜索变化,清空选择
watch(searchQuery, () => {
  selectedTasks.value = [];
  selectAll.value = false;
});

onMounted(() => {
  refreshTasks();
  startAutoRefresh();
  // 启动整合倒计时(初始值为30秒)
  startConsolidateCountdown(30);
});

onUnmounted(() => {
  stopAutoRefresh();
  stopCountdown();
  stopConsolidateCountdown();
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
            _cache[5] || (_cache[5] = _createElementVNode("span", null, "弹幕库自动导入", -1))
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
                      class: "rounded mb-3 border config-card",
                      style: {"height":"100%"}
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
                            _cache[6] || (_cache[6] = _createElementVNode("span", null, "当前状态", -1))
                          ]),
                          _: 1
                        }),
                        _createVNode(VCardText, { class: "px-3 py-2" }, {
                          default: _withCtx(() => [
                            (loadingStats.value)
                              ? (_openBlock(), _createBlock(VSkeletonLoader, {
                                  key: 0,
                                  type: "list-item@3"
                                }))
                              : (_openBlock(), _createBlock(VList, {
                                  key: 1,
                                  density: "compact"
                                }, {
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
                _createVNode(VCol, {
                  cols: "12",
                  md: "6"
                }, {
                  default: _withCtx(() => [
                    _createVNode(VCard, {
                      flat: "",
                      class: "rounded mb-3 border config-card",
                      style: {"height":"100%"}
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
                            _cache[7] || (_cache[7] = _createElementVNode("span", null, "处理历史", -1))
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
                                  _cache[8] || (_cache[8] = _createElementVNode("div", { class: "text-caption" }, "暂无处理历史", -1))
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
                    _cache[9] || (_cache[9] = _createElementVNode("span", null, "流控状态", -1)),
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
                _createVNode(VCardText, { class: "pa-3" }, {
                  default: _withCtx(() => [
                    (loadingRateLimit.value)
                      ? (_openBlock(), _createBlock(VSkeletonLoader, {
                          key: 0,
                          type: "article"
                        }))
                      : (rateLimitData.value)
                        ? (_openBlock(), _createElementBlock("div", _hoisted_3, [
                            _createVNode(VRow, { dense: "" }, {
                              default: _withCtx(() => [
                                _createVNode(VCol, {
                                  cols: "12",
                                  md: "6"
                                }, {
                                  default: _withCtx(() => [
                                    _createVNode(VCard, {
                                      flat: "",
                                      class: "rounded mb-2 border",
                                      variant: "outlined"
                                    }, {
                                      default: _withCtx(() => [
                                        _createVNode(VCardTitle, { class: "text-caption d-flex align-center px-3 py-2 bg-grey-lighten-4" }, {
                                          default: _withCtx(() => [
                                            _createVNode(VIcon, {
                                              icon: "mdi-timer-outline",
                                              color: "primary",
                                              size: "small",
                                              class: "mr-2"
                                            }),
                                            _cache[10] || (_cache[10] = _createElementVNode("span", null, "流控重置倒计时", -1))
                                          ]),
                                          _: 1
                                        }),
                                        _createVNode(VCardText, { class: "pa-3 text-center" }, {
                                          default: _withCtx(() => [
                                            _createElementVNode("div", {
                                              class: _normalizeClass(["text-h6 font-weight-bold", countdown.value <= 60 ? 'text-error' : 'text-primary'])
                                            }, _toDisplayString(formatCountdown(countdown.value)), 3)
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    }),
                                    _createVNode(VCard, {
                                      flat: "",
                                      class: "rounded mb-2 border",
                                      variant: "outlined"
                                    }, {
                                      default: _withCtx(() => [
                                        _createVNode(VCardTitle, { class: "text-caption d-flex align-center px-3 py-2 bg-grey-lighten-4" }, {
                                          default: _withCtx(() => [
                                            _createVNode(VIcon, {
                                              icon: "mdi-earth",
                                              color: "primary",
                                              size: "small",
                                              class: "mr-2"
                                            }),
                                            _cache[11] || (_cache[11] = _createElementVNode("span", null, "下载流控", -1))
                                          ]),
                                          _: 1
                                        }),
                                        _createVNode(VCardText, { class: "pa-3" }, {
                                          default: _withCtx(() => [
                                            _createElementVNode("div", _hoisted_4, [
                                              _createElementVNode("div", _hoisted_5, [
                                                _cache[12] || (_cache[12] = _createElementVNode("span", { class: "text-grey" }, "当前次数 / 总次数", -1)),
                                                _createElementVNode("span", _hoisted_6, _toDisplayString(rateLimitData.value.globalRequestCount) + " / " + _toDisplayString(rateLimitData.value.globalLimit === 0 ? '∞' : rateLimitData.value.globalLimit), 1)
                                              ]),
                                              _createVNode(VProgressLinear, {
                                                "model-value": rateLimitData.value.globalLimit === 0 ? 0 : (rateLimitData.value.globalRequestCount / rateLimitData.value.globalLimit * 100),
                                                color: rateLimitData.value.globalLimit === 0 ? 'grey' : (rateLimitData.value.globalRequestCount / rateLimitData.value.globalLimit > 0.8 ? 'error' : 'success'),
                                                height: "6",
                                                rounded: ""
                                              }, null, 8, ["model-value", "color"])
                                            ]),
                                            _createElementVNode("div", _hoisted_7, [
                                              _cache[13] || (_cache[13] = _createElementVNode("span", { class: "text-grey" }, "周期:", -1)),
                                              _createElementVNode("span", _hoisted_8, _toDisplayString(rateLimitData.value.globalPeriod || 'N/A'), 1)
                                            ]),
                                            _createElementVNode("div", _hoisted_9, [
                                              _cache[14] || (_cache[14] = _createElementVNode("span", { class: "text-grey" }, "重置倒计时:", -1)),
                                              _createElementVNode("span", _hoisted_10, _toDisplayString(rateLimitData.value.secondsUntilReset) + "秒", 1)
                                            ])
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    }),
                                    _createVNode(VCard, {
                                      flat: "",
                                      class: "rounded border",
                                      variant: "outlined"
                                    }, {
                                      default: _withCtx(() => [
                                        _createVNode(VCardTitle, { class: "text-caption d-flex align-center px-3 py-2 bg-grey-lighten-4" }, {
                                          default: _withCtx(() => [
                                            _createVNode(VIcon, {
                                              icon: "mdi-backup-restore",
                                              color: "primary",
                                              size: "small",
                                              class: "mr-2"
                                            }),
                                            _cache[15] || (_cache[15] = _createElementVNode("span", null, "后备流控", -1))
                                          ]),
                                          _: 1
                                        }),
                                        _createVNode(VCardText, { class: "pa-3" }, {
                                          default: _withCtx(() => [
                                            _createElementVNode("div", _hoisted_11, [
                                              _createElementVNode("div", _hoisted_12, [
                                                _cache[16] || (_cache[16] = _createElementVNode("span", { class: "text-grey" }, "当前次数 / 总次数", -1)),
                                                _createElementVNode("span", _hoisted_13, _toDisplayString(rateLimitData.value.fallbackTotalCount) + " / " + _toDisplayString(rateLimitData.value.fallbackTotalLimit), 1)
                                              ]),
                                              _createVNode(VProgressLinear, {
                                                "model-value": rateLimitData.value.fallbackTotalLimit === 0 ? 0 : (rateLimitData.value.fallbackTotalCount / rateLimitData.value.fallbackTotalLimit * 100),
                                                color: rateLimitData.value.fallbackTotalCount / rateLimitData.value.fallbackTotalLimit > 0.8 ? 'error' : 'success',
                                                height: "6",
                                                rounded: ""
                                              }, null, 8, ["model-value", "color"])
                                            ]),
                                            _createElementVNode("div", _hoisted_14, [
                                              _cache[17] || (_cache[17] = _createElementVNode("span", { class: "text-grey" }, "匹配调用:", -1)),
                                              _createElementVNode("span", _hoisted_15, _toDisplayString(rateLimitData.value.fallbackMatchCount), 1)
                                            ]),
                                            _createElementVNode("div", _hoisted_16, [
                                              _cache[18] || (_cache[18] = _createElementVNode("span", { class: "text-grey" }, "搜索调用:", -1)),
                                              _createElementVNode("span", _hoisted_17, _toDisplayString(rateLimitData.value.fallbackSearchCount), 1)
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
                                      class: "rounded border",
                                      variant: "outlined",
                                      style: {"height":"100%"}
                                    }, {
                                      default: _withCtx(() => [
                                        _createVNode(VCardTitle, { class: "text-caption d-flex align-center px-3 py-2 bg-grey-lighten-4" }, {
                                          default: _withCtx(() => [
                                            _createVNode(VIcon, {
                                              icon: "mdi-database",
                                              color: "primary",
                                              size: "small",
                                              class: "mr-2"
                                            }),
                                            _cache[19] || (_cache[19] = _createElementVNode("span", null, "各源情况", -1))
                                          ]),
                                          _: 1
                                        }),
                                        (rateLimitData.value.providers && rateLimitData.value.providers.length > 0)
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
                                                    _cache[20] || (_cache[20] = _createElementVNode("thead", null, [
                                                      _createElementVNode("tr", null, [
                                                        _createElementVNode("th", { class: "text-caption font-weight-bold" }, "数据源"),
                                                        _createElementVNode("th", { class: "text-caption font-weight-bold text-center" }, "当前次数"),
                                                        _createElementVNode("th", { class: "text-caption font-weight-bold text-center" }, "配额")
                                                      ])
                                                    ], -1)),
                                                    _createElementVNode("tbody", null, [
                                                      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(rateLimitData.value.providers, (provider) => {
                                                        return (_openBlock(), _createElementBlock("tr", {
                                                          key: provider.providerName
                                                        }, [
                                                          _createElementVNode("td", _hoisted_18, _toDisplayString(provider.providerName), 1),
                                                          _createElementVNode("td", _hoisted_19, _toDisplayString(provider.requestCount), 1),
                                                          _createElementVNode("td", _hoisted_20, _toDisplayString(provider.quota === '∞' ? '无限' : provider.quota), 1)
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
                                                _cache[21] || (_cache[21] = _createElementVNode("div", { class: "text-caption" }, "无单源数据", -1))
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
                          ]))
                        : (_openBlock(), _createElementBlock("div", _hoisted_21, [
                            _createVNode(VIcon, {
                              icon: "mdi-information-outline",
                              size: "small",
                              class: "mb-1"
                            }),
                            _cache[22] || (_cache[22] = _createElementVNode("div", { class: "text-caption" }, "无法获取流控状态", -1))
                          ]))
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
                      icon: "mdi-format-list-bulleted",
                      color: "primary",
                      size: "small",
                      class: "mr-2"
                    }),
                    _cache[26] || (_cache[26] = _createElementVNode("span", null, "待处理任务", -1)),
                    _createVNode(VChip, {
                      size: "x-small",
                      color: "info",
                      variant: "flat",
                      class: "ml-1"
                    }, {
                      default: _withCtx(() => [
                        _createTextVNode(_toDisplayString(filteredTasks.value.length) + " / " + _toDisplayString(tasks.value.length) + " 个任务 ", 1)
                      ]),
                      _: 1
                    }),
                    _createElementVNode("div", _hoisted_22, [
                      _createVNode(VChip, {
                        size: "small",
                        color: bufferCount.value > 0 ? 'primary' : 'grey',
                        variant: "flat",
                        style: {"border-radius":"16px"}
                      }, {
                        default: _withCtx(() => [
                          _createElementVNode("span", _hoisted_23, "缓冲: " + _toDisplayString(bufferCount.value), 1),
                          _createVNode(VDivider, {
                            vertical: "",
                            class: "mx-2"
                          }),
                          _createVNode(VProgressLinear, {
                            "model-value": consolidateProgress.value,
                            color: "white",
                            height: "4",
                            rounded: "",
                            class: "mx-2",
                            style: {"width":"60px"}
                          }, null, 8, ["model-value"]),
                          _createElementVNode("span", _hoisted_24, _toDisplayString(consolidateCountdown.value) + "/30秒", 1)
                        ]),
                        _: 1
                      }, 8, ["color"]),
                      _createVNode(VBtn, {
                        icon: "",
                        size: "small",
                        variant: "text",
                        color: "primary",
                        class: "ml-1",
                        onClick: manualConsolidate,
                        loading: consolidating.value,
                        disabled: bufferCount.value === 0
                      }, {
                        default: _withCtx(() => [
                          _createVNode(VIcon, { size: "small" }, {
                            default: _withCtx(() => [...(_cache[23] || (_cache[23] = [
                              _createTextVNode("mdi-merge", -1)
                            ]))]),
                            _: 1
                          }),
                          _createVNode(VTooltip, {
                            activator: "parent",
                            location: "bottom"
                          }, {
                            default: _withCtx(() => [
                              _createTextVNode("立即整合 (" + _toDisplayString(bufferCount.value) + "个缓冲任务)", 1)
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }, 8, ["loading", "disabled"])
                    ]),
                    _createVNode(VSpacer),
                    (selectedTasks.value.length > 0)
                      ? (_openBlock(), _createBlock(VBtn, {
                          key: 0,
                          size: "small",
                          variant: "outlined",
                          color: "primary",
                          "prepend-icon": "mdi-menu",
                          class: "mr-2"
                        }, {
                          default: _withCtx(() => [
                            _createTextVNode(" 批量操作 (" + _toDisplayString(selectedTasks.value.length) + ") ", 1),
                            _createVNode(VMenu, { activator: "parent" }, {
                              default: _withCtx(() => [
                                _createVNode(VList, { density: "compact" }, {
                                  default: _withCtx(() => [
                                    _createVNode(VListItem, { onClick: batchImportTasks }, {
                                      prepend: _withCtx(() => [
                                        _createVNode(VIcon, {
                                          icon: "mdi-download",
                                          size: "small"
                                        })
                                      ]),
                                      default: _withCtx(() => [
                                        _createVNode(VListItemTitle, null, {
                                          default: _withCtx(() => [...(_cache[24] || (_cache[24] = [
                                            _createTextVNode("批量导入", -1)
                                          ]))]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    }),
                                    _createVNode(VListItem, { onClick: batchDeleteTasks }, {
                                      prepend: _withCtx(() => [
                                        _createVNode(VIcon, {
                                          icon: "mdi-delete",
                                          size: "small",
                                          color: "error"
                                        })
                                      ]),
                                      default: _withCtx(() => [
                                        _createVNode(VListItemTitle, { class: "text-error" }, {
                                          default: _withCtx(() => [...(_cache[25] || (_cache[25] = [
                                            _createTextVNode("批量删除", -1)
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
                            })
                          ]),
                          _: 1
                        }))
                      : _createCommentVNode("", true),
                    _createVNode(VTextField, {
                      modelValue: searchQuery.value,
                      "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((searchQuery).value = $event)),
                      density: "compact",
                      variant: "outlined",
                      placeholder: "搜索标题/TMDB ID/季集信息...",
                      "prepend-inner-icon": "mdi-magnify",
                      clearable: "",
                      "hide-details": "",
                      class: "search-field",
                      style: {"max-width":"300px"}
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                }),
                _createVNode(VCardText, { class: "pa-0" }, {
                  default: _withCtx(() => [
                    (loadingTasks.value)
                      ? (_openBlock(), _createBlock(VSkeletonLoader, {
                          key: 0,
                          type: "table-tbody"
                        }))
                      : (filteredTasks.value.length > 0)
                        ? (_openBlock(), _createBlock(VTable, {
                            key: 1,
                            density: "compact",
                            hover: "",
                            class: "text-body-2"
                          }, {
                            default: _withCtx(() => [
                              _createElementVNode("thead", null, [
                                _createElementVNode("tr", null, [
                                  _cache[27] || (_cache[27] = _createElementVNode("th", {
                                    class: "text-body-2 font-weight-bold",
                                    style: {"width":"40px"}
                                  }, null, -1)),
                                  _createElementVNode("th", _hoisted_25, [
                                    _createVNode(VCheckbox, {
                                      modelValue: selectAll.value,
                                      "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => ((selectAll).value = $event)),
                                      density: "compact",
                                      "hide-details": "",
                                      onChange: toggleSelectAll
                                    }, null, 8, ["modelValue"])
                                  ]),
                                  _cache[28] || (_cache[28] = _createElementVNode("th", {
                                    class: "text-body-2 font-weight-bold text-center",
                                    style: {"width":"60px"}
                                  }, "类型", -1)),
                                  _cache[29] || (_cache[29] = _createElementVNode("th", { class: "text-body-2 font-weight-bold" }, "标题", -1)),
                                  _cache[30] || (_cache[30] = _createElementVNode("th", { class: "text-body-2 font-weight-bold" }, "剧集信息", -1)),
                                  _cache[31] || (_cache[31] = _createElementVNode("th", { class: "text-body-2 font-weight-bold" }, "添加时间", -1)),
                                  _cache[32] || (_cache[32] = _createElementVNode("th", { class: "text-body-2 font-weight-bold text-center" }, "状态", -1)),
                                  _cache[33] || (_cache[33] = _createElementVNode("th", {
                                    class: "text-body-2 font-weight-bold text-center",
                                    style: {"width":"150px"}
                                  }, "进度", -1)),
                                  _cache[34] || (_cache[34] = _createElementVNode("th", { class: "text-body-2 font-weight-bold text-right" }, "操作", -1))
                                ])
                              ]),
                              _createElementVNode("tbody", null, [
                                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(filteredTasks.value, (task) => {
                                  return (_openBlock(), _createElementBlock(_Fragment, {
                                    key: task.task_id
                                  }, [
                                    _createElementVNode("tr", null, [
                                      _createElementVNode("td", _hoisted_26, [
                                        (task.is_consolidated && task.episode_count > 0)
                                          ? (_openBlock(), _createBlock(VBtn, {
                                              key: 0,
                                              icon: "",
                                              size: "x-small",
                                              variant: "text",
                                              onClick: $event => (toggleExpand(task.task_id))
                                            }, {
                                              default: _withCtx(() => [
                                                _createVNode(VIcon, {
                                                  icon: expandedTasks.value.includes(task.task_id) ? 'mdi-chevron-down' : 'mdi-chevron-right',
                                                  size: "small"
                                                }, null, 8, ["icon"])
                                              ]),
                                              _: 2
                                            }, 1032, ["onClick"]))
                                          : _createCommentVNode("", true)
                                      ]),
                                      _createElementVNode("td", null, [
                                        _createVNode(VCheckbox, {
                                          modelValue: selectedTasks.value,
                                          "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => ((selectedTasks).value = $event)),
                                          value: task.task_id,
                                          density: "compact",
                                          "hide-details": "",
                                          disabled: task.status === 'processing'
                                        }, null, 8, ["modelValue", "value", "disabled"])
                                      ]),
                                      _createElementVNode("td", _hoisted_27, [
                                        _createVNode(VIcon, {
                                          icon: task.media_type === 'tv' ? 'mdi-television-classic' : 'mdi-filmstrip',
                                          color: task.media_type === 'tv' ? 'primary' : 'secondary',
                                          size: "small"
                                        }, null, 8, ["icon", "color"])
                                      ]),
                                      _createElementVNode("td", _hoisted_28, _toDisplayString(task.title), 1),
                                      _createElementVNode("td", _hoisted_29, _toDisplayString(task.episode_info || '-'), 1),
                                      _createElementVNode("td", _hoisted_30, _toDisplayString(task.add_time || '-'), 1),
                                      _createElementVNode("td", _hoisted_31, [
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
                                      _createElementVNode("td", _hoisted_32, [
                                        (task.status === 'processing' && task.progress !== undefined)
                                          ? (_openBlock(), _createElementBlock("div", _hoisted_33, [
                                              _createVNode(VProgressLinear, {
                                                "model-value": task.progress,
                                                color: task.progress < 0 ? 'error' : 'info',
                                                height: "6",
                                                rounded: ""
                                              }, {
                                                default: _withCtx(({ value }) => [
                                                  _createElementVNode("span", _hoisted_34, _toDisplayString(Math.ceil(value)) + "%", 1)
                                                ]),
                                                _: 1
                                              }, 8, ["model-value", "color"])
                                            ]))
                                          : (_openBlock(), _createElementBlock("span", _hoisted_35, "-"))
                                      ]),
                                      _createElementVNode("td", _hoisted_36, [
                                        _createElementVNode("div", _hoisted_37, [
                                          _createVNode(VBtn, {
                                            density: "comfortable",
                                            icon: "",
                                            variant: "text",
                                            color: "primary",
                                            size: "small",
                                            disabled: task.status === 'processing',
                                            onClick: $event => (importTask(task))
                                          }, {
                                            default: _withCtx(() => [
                                              _createVNode(VIcon, {
                                                icon: "mdi-download",
                                                size: "small"
                                              }),
                                              _createVNode(VTooltip, {
                                                activator: "parent",
                                                location: "top"
                                              }, {
                                                default: _withCtx(() => [...(_cache[35] || (_cache[35] = [
                                                  _createTextVNode("立即导入", -1)
                                                ]))]),
                                                _: 1
                                              })
                                            ]),
                                            _: 1
                                          }, 8, ["disabled", "onClick"]),
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
                                                default: _withCtx(() => [...(_cache[36] || (_cache[36] = [
                                                  _createTextVNode("删除此任务", -1)
                                                ]))]),
                                                _: 1
                                              })
                                            ]),
                                            _: 1
                                          }, 8, ["disabled", "onClick"])
                                        ])
                                      ])
                                    ]),
                                    (task.is_consolidated && expandedTasks.value.includes(task.task_id))
                                      ? (_openBlock(), _createElementBlock("tr", _hoisted_38, [
                                          _createElementVNode("td", _hoisted_39, [
                                            _createElementVNode("div", _hoisted_40, "集数列表 (共" + _toDisplayString(task.episode_count) + "集):", 1),
                                            _createElementVNode("div", _hoisted_41, [
                                              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(getSortedEpisodes(task.episodes), (ep, index) => {
                                                return (_openBlock(), _createBlock(VCheckbox, {
                                                  key: index,
                                                  modelValue: selectedEpisodes.value[task.task_id],
                                                  "onUpdate:modelValue": $event => ((selectedEpisodes.value[task.task_id]) = $event),
                                                  value: ep.episode,
                                                  density: "compact",
                                                  "hide-details": "",
                                                  class: "mr-2 mb-1"
                                                }, {
                                                  label: _withCtx(() => [
                                                    _createVNode(VChip, {
                                                      size: "small",
                                                      color: selectedEpisodes.value[task.task_id]?.includes(ep.episode) ? 'primary' : 'grey',
                                                      variant: "flat"
                                                    }, {
                                                      default: _withCtx(() => [
                                                        _createTextVNode(" S" + _toDisplayString(String(ep.season).padStart(2, '0')) + "E" + _toDisplayString(String(ep.episode).padStart(2, '0')), 1)
                                                      ]),
                                                      _: 2
                                                    }, 1032, ["color"])
                                                  ]),
                                                  _: 2
                                                }, 1032, ["modelValue", "onUpdate:modelValue", "value"]))
                                              }), 128))
                                            ]),
                                            _createElementVNode("div", _hoisted_42, [
                                              _createVNode(VBtn, {
                                                size: "small",
                                                color: "primary",
                                                variant: "outlined",
                                                "prepend-icon": "mdi-download",
                                                class: "mr-2",
                                                disabled: !selectedEpisodes.value[task.task_id] || selectedEpisodes.value[task.task_id].length === 0,
                                                onClick: $event => (importSelectedEpisodes(task))
                                              }, {
                                                default: _withCtx(() => [
                                                  _createTextVNode(" 导入选中 (" + _toDisplayString(selectedEpisodes.value[task.task_id]?.length || 0) + ") ", 1)
                                                ]),
                                                _: 2
                                              }, 1032, ["disabled", "onClick"]),
                                              _createVNode(VBtn, {
                                                size: "small",
                                                color: "error",
                                                variant: "outlined",
                                                "prepend-icon": "mdi-delete",
                                                disabled: !selectedEpisodes.value[task.task_id] || selectedEpisodes.value[task.task_id].length === 0,
                                                onClick: $event => (deleteSelectedEpisodes(task))
                                              }, {
                                                default: _withCtx(() => [
                                                  _createTextVNode(" 删除选中 (" + _toDisplayString(selectedEpisodes.value[task.task_id]?.length || 0) + ") ", 1)
                                                ]),
                                                _: 2
                                              }, 1032, ["disabled", "onClick"])
                                            ])
                                          ])
                                        ]))
                                      : _createCommentVNode("", true)
                                  ], 64))
                                }), 128))
                              ])
                            ]),
                            _: 1
                          }))
                        : (tasks.value.length > 0 && filteredTasks.value.length === 0)
                          ? (_openBlock(), _createElementBlock("div", _hoisted_43, [
                              _createVNode(VIcon, {
                                icon: "mdi-magnify-close",
                                size: "small",
                                class: "mb-1"
                              }),
                              _cache[37] || (_cache[37] = _createElementVNode("div", { class: "text-caption" }, "没有匹配的任务", -1))
                            ]))
                          : (_openBlock(), _createElementBlock("div", _hoisted_44, [
                              _createVNode(VIcon, {
                                icon: "mdi-information-outline",
                                size: "small",
                                class: "mb-1"
                              }),
                              _cache[38] || (_cache[38] = _createElementVNode("div", { class: "text-caption" }, "暂无待处理任务", -1))
                            ]))
                  ]),
                  _: 1
                })
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
              onClick: _cache[3] || (_cache[3] = $event => (emit('switch'))),
              "prepend-icon": "mdi-cog",
              variant: "text",
              size: "small"
            }, {
              default: _withCtx(() => [...(_cache[39] || (_cache[39] = [
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
              default: _withCtx(() => [...(_cache[40] || (_cache[40] = [
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
              default: _withCtx(() => [...(_cache[41] || (_cache[41] = [
                _createTextVNode(" 清空队列 ", -1)
              ]))]),
              _: 1
            }),
            _createVNode(VBtn, {
              color: "grey",
              onClick: _cache[4] || (_cache[4] = $event => (emit('close'))),
              "prepend-icon": "mdi-close",
              variant: "text",
              size: "small"
            }, {
              default: _withCtx(() => [...(_cache[42] || (_cache[42] = [
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
const Page = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-2750ca63"]]);

export { Page as default };
