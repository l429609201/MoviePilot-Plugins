import { importShared } from './__federation_fn_import-Dd9Y27se.js';
import { u as useRender, f as forwardRefs, m as makeComponentProps, a as animate, g as getTargetBox, n as nullifyTransforms, b as makeDensityProps, d as deepEqual, R as Ripple, V as VIcon, c as useDensity, e as useTextColor, h as useBackgroundColor, M as MaybeTransition, i as makeTransitionProps, j as VSlideYTransition, k as makeDimensionProps, l as useDimension, o as useScopeId, p as VMenuSymbol, q as VOverlay, r as VDefaultsProvider, s as makeVOverlayProps, t as makeRoundedProps, v as makeLoaderProps, w as useLoader, x as useRounded, L as LoaderSlot, y as VExpandXTransition, I as Intersect, z as useResizeObserver, A as getScrollParent, B as useItems, C as makeItemsProps, D as VList, E as VListItem, F as VDivider, G as VListSubheader, H as VAvatar, J as VChip, K as VScaleTransition, N as VProgressCircular, _ as _export_sfc, O as VCard, P as VCardTitle, Q as VCardText, S as VRow, T as VCol, U as VCardActions, W as VBtn, X as VSpacer } from './VOverlay-IPlmzrQ8.js';
import { t as propsFactory, v as useProxiedModel, c as consoleWarn, w as genericComponent, P as PREFERS_REDUCED_MOTION, x as acceleratedEasing, y as deceleratedEasing, z as standardEasing, A as makeThemeProps, E as EventProp, B as IconValue, C as provideDefaults, F as filterInputAttrs, H as wrapInArray, J as matchesSelector, K as omit, u as useLocale, M as callEvent, N as getCurrentInstanceName, O as getCurrentInstance, Q as useToggleScope, R as pick, S as provideTheme, r as useRtl, U as isClickInsideElement, V as focusableChildren, I as IN_BROWSER, W as focusChild, X as getNextElement, Y as convertToUnit, o as useDisplay, Z as debounce, _ as clamp, $ as getPropertyFromItem, a0 as camelizeProps, a1 as ensureValidVNode, a2 as checkPrintable, a3 as SUPPORTS_MATCH_MEDIA } from './theme-DPL3T32x.js';

const {computed: computed$b,inject: inject$3,markRaw,provide: provide$2,ref: ref$a,shallowRef: shallowRef$7,toRef: toRef$d,watch: watch$7} = await importShared('vue');
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
  const isDisabled = toRef$d(() => props.disabled);
  const isReadonly = toRef$d(() => props.readonly);
  const isValidating = shallowRef$7(false);
  const items = ref$a([]);
  const errors = ref$a([]);
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
  watch$7(items, () => {
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
  provide$2(FormKey, {
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
    validateOn: toRef$d(() => props.validateOn)
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
  const form = inject$3(FormKey, null);
  return {
    ...form,
    isReadonly: computed$b(() => !!(props?.readonly ?? form?.isReadonly.value)),
    isDisabled: computed$b(() => !!(props?.disabled ?? form?.isDisabled.value))
  };
}

const {normalizeClass:_normalizeClass$b,normalizeStyle:_normalizeStyle$a,createElementVNode:_createElementVNode$d} = await importShared('vue');
const {ref: ref$9} = await importShared('vue');
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
    const formRef = ref$9();
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
    useRender(() => _createElementVNode$d("form", {
      "ref": formRef,
      "class": _normalizeClass$b(['v-form', props.class]),
      "style": _normalizeStyle$a(props.style),
      "novalidate": true,
      "onReset": onReset,
      "onSubmit": onSubmit
    }, [slots.default?.(form)]));
    return forwardRefs(form, formRef);
  }
});

// Utilities
const {Transition,mergeProps:_mergeProps$9,createVNode:_createVNode$e} = await importShared('vue');
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
      return props.target ? _createVNode$e(Transition, _mergeProps$9({
        "name": "dialog-transition"
      }, functions, {
        "css": false
      }), slots) : _createVNode$e(Transition, {
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

const {normalizeClass:_normalizeClass$a,normalizeStyle:_normalizeStyle$9,createElementVNode:_createElementVNode$c} = await importShared('vue');
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
    useRender(() => _createElementVNode$c("label", {
      "class": _normalizeClass$a(['v-label', {
        'v-label--clickable': !!props.onClick
      }, props.class]),
      "style": _normalizeStyle$9(props.style),
      "onClick": props.onClick
    }, [props.text, slots.default?.()]));
    return {};
  }
});

const {normalizeClass:_normalizeClass$9,normalizeStyle:_normalizeStyle$8,createElementVNode:_createElementVNode$b} = await importShared('vue');
const {onScopeDispose: onScopeDispose$2,provide: provide$1,toRef: toRef$c,useId: useId$8} = await importShared('vue');
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
    const uid = useId$8();
    const id = toRef$c(() => props.id || `v-selection-control-group-${uid}`);
    const name = toRef$c(() => props.name || id.value);
    const updateHandlers = new Set();
    provide$1(VSelectionControlGroupSymbol, {
      modelValue,
      forceUpdate: () => {
        updateHandlers.forEach(fn => fn());
      },
      onForceUpdate: cb => {
        updateHandlers.add(cb);
        onScopeDispose$2(() => {
          updateHandlers.delete(cb);
        });
      }
    });
    provideDefaults({
      [props.defaultsTarget]: {
        color: toRef$c(() => props.color),
        disabled: toRef$c(() => props.disabled),
        density: toRef$c(() => props.density),
        error: toRef$c(() => props.error),
        inline: toRef$c(() => props.inline),
        modelValue,
        multiple: toRef$c(() => !!props.multiple || props.multiple == null && Array.isArray(modelValue.value)),
        name,
        falseIcon: toRef$c(() => props.falseIcon),
        trueIcon: toRef$c(() => props.trueIcon),
        readonly: toRef$c(() => props.readonly),
        ripple: toRef$c(() => props.ripple),
        type: toRef$c(() => props.type),
        valueComparator: toRef$c(() => props.valueComparator)
      }
    });
    useRender(() => _createElementVNode$b("div", {
      "class": _normalizeClass$9(['v-selection-control-group', {
        'v-selection-control-group--inline': props.inline
      }, props.class]),
      "style": _normalizeStyle$8(props.style),
      "role": props.type === 'radio' ? 'radiogroup' : undefined
    }, [slots.default?.()]));
    return {};
  }
});

const {mergeProps:_mergeProps$8,createElementVNode:_createElementVNode$a,Fragment:_Fragment$6,createVNode:_createVNode$d,normalizeClass:_normalizeClass$8,withDirectives:_withDirectives$3,normalizeStyle:_normalizeStyle$7} = await importShared('vue');
const {computed: computed$a,inject: inject$2,nextTick: nextTick$5,ref: ref$8,shallowRef: shallowRef$6,toRef: toRef$b,useId: useId$7} = await importShared('vue');
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
  const group = inject$2(VSelectionControlGroupSymbol, undefined);
  const {
    densityClasses
  } = useDensity(props);
  const modelValue = useProxiedModel(props, 'modelValue');
  const trueValue = computed$a(() => props.trueValue !== undefined ? props.trueValue : props.value !== undefined ? props.value : true);
  const falseValue = computed$a(() => props.falseValue !== undefined ? props.falseValue : false);
  const isMultiple = computed$a(() => !!props.multiple || props.multiple == null && Array.isArray(modelValue.value));
  const model = computed$a({
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
  const icon = computed$a(() => model.value ? props.trueIcon : props.falseIcon);
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
    const uid = useId$7();
    const isFocused = shallowRef$6(false);
    const isFocusVisible = shallowRef$6(false);
    const input = ref$8();
    const id = toRef$b(() => props.id || `input-${uid}`);
    const isInteractive = toRef$b(() => !props.disabled && !props.readonly);
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
        nextTick$5(() => group.forceUpdate());
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
      const inputNode = _createElementVNode$a("input", _mergeProps$8({
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
      return _createElementVNode$a("div", _mergeProps$8({
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
      }), [_createElementVNode$a("div", {
        "class": _normalizeClass$8(['v-selection-control__wrapper', textColorClasses.value]),
        "style": _normalizeStyle$7(textColorStyles.value)
      }, [slots.default?.({
        backgroundColorClasses,
        backgroundColorStyles
      }), _withDirectives$3(_createElementVNode$a("div", {
        "class": _normalizeClass$8(['v-selection-control__input'])
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
      }) ?? _createElementVNode$a(_Fragment$6, null, [icon.value && _createVNode$d(VIcon, {
        "key": "icon",
        "icon": icon.value
      }, null), inputNode])]), [[Ripple, !props.disabled && !props.readonly && props.ripple, null, {
        center: true,
        circle: true
      }]])]), label && _createVNode$d(VLabel, {
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

const {mergeProps:_mergeProps$7,createVNode:_createVNode$c} = await importShared('vue');
const {toRef: toRef$a} = await importShared('vue');
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
    const falseIcon = toRef$a(() => {
      return indeterminate.value ? props.indeterminateIcon : props.falseIcon;
    });
    const trueIcon = toRef$a(() => {
      return indeterminate.value ? props.indeterminateIcon : props.trueIcon;
    });
    useRender(() => {
      const controlProps = omit(VSelectionControl.filterProps(props), ['modelValue']);
      return _createVNode$c(VSelectionControl, _mergeProps$7(controlProps, {
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

const {mergeProps:_mergeProps$6,createVNode:_createVNode$b} = await importShared('vue');
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
    return _createVNode$b(VIcon, _mergeProps$6({
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

const {createElementVNode:_createElementVNode$9,normalizeClass:_normalizeClass$7,normalizeStyle:_normalizeStyle$6,createVNode:_createVNode$a} = await importShared('vue');
const {computed: computed$9} = await importShared('vue');
const makeVMessagesProps = propsFactory({
  active: Boolean,
  color: String,
  messages: {
    type: [Array, String],
    default: () => []
  },
  ...makeComponentProps(),
  ...makeTransitionProps({
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
    const messages = computed$9(() => wrapInArray(props.messages));
    const {
      textColorClasses,
      textColorStyles
    } = useTextColor(() => props.color);
    useRender(() => _createVNode$a(MaybeTransition, {
      "transition": props.transition,
      "tag": "div",
      "class": _normalizeClass$7(['v-messages', textColorClasses.value, props.class]),
      "style": _normalizeStyle$6([textColorStyles.value, props.style])
    }, {
      default: () => [props.active && messages.value.map((message, i) => _createElementVNode$9("div", {
        "class": "v-messages__message",
        "key": `${i}-${messages.value}`
      }, [slots.message ? slots.message({
        message
      }) : message]))]
    }));
    return {};
  }
});

const {toRef: toRef$9} = await importShared('vue');
// Composables
const makeFocusProps = propsFactory({
  focused: Boolean,
  'onUpdate:focused': EventProp()
}, 'focus');
function useFocus(props) {
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getCurrentInstanceName();
  const isFocused = useProxiedModel(props, 'focused');
  const focusClasses = toRef$9(() => {
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
const {computed: computed$8,inject: inject$1,toRef: toRef$8} = await importShared('vue');
const RulesSymbol = Symbol.for('vuetify:rules');
function useRules(fn) {
  const rules = inject$1(RulesSymbol, null);
  if (!fn) {
    if (!rules) {
      throw new Error('Could not find Vuetify rules injection');
    }
    return rules.aliases;
  }
  return rules?.resolve(fn) ?? toRef$8(fn);
}

const {computed: computed$7,nextTick: nextTick$4,onBeforeMount,onBeforeUnmount: onBeforeUnmount$1,onMounted: onMounted$1,ref: ref$7,shallowRef: shallowRef$5,unref,useId: useId$6,watch: watch$6} = await importShared('vue');
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
  let id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : useId$6();
  const model = useProxiedModel(props, 'modelValue');
  const validationModel = computed$7(() => props.validationValue === undefined ? model.value : props.validationValue);
  const form = useForm(props);
  const rules = useRules(() => props.rules);
  const internalErrorMessages = ref$7([]);
  const isPristine = shallowRef$5(true);
  const isDirty = computed$7(() => !!(wrapInArray(model.value === '' ? null : model.value).length || wrapInArray(validationModel.value === '' ? null : validationModel.value).length));
  const errorMessages = computed$7(() => {
    return props.errorMessages?.length ? wrapInArray(props.errorMessages).concat(internalErrorMessages.value).slice(0, Math.max(0, Number(props.maxErrors))) : internalErrorMessages.value;
  });
  const validateOn = computed$7(() => {
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
  const isValid = computed$7(() => {
    if (props.error || props.errorMessages?.length) return false;
    if (!props.rules.length) return true;
    if (isPristine.value) {
      return internalErrorMessages.value.length || validateOn.value.lazy ? null : true;
    } else {
      return !internalErrorMessages.value.length;
    }
  });
  const isValidating = shallowRef$5(false);
  const validationClasses = computed$7(() => {
    return {
      [`${name}--error`]: isValid.value === false,
      [`${name}--dirty`]: isDirty.value,
      [`${name}--disabled`]: form.isDisabled.value,
      [`${name}--readonly`]: form.isReadonly.value
    };
  });
  const vm = getCurrentInstance('validation');
  const uid = computed$7(() => props.name ?? unref(id));
  onBeforeMount(() => {
    form.register?.({
      id: uid.value,
      vm,
      validate,
      reset,
      resetValidation
    });
  });
  onBeforeUnmount$1(() => {
    form.unregister?.(uid.value);
  });
  onMounted$1(async () => {
    if (!validateOn.value.lazy) {
      await validate(!validateOn.value.eager);
    }
    form.update?.(uid.value, isValid.value, errorMessages.value);
  });
  useToggleScope(() => validateOn.value.input || validateOn.value.invalidInput && isValid.value === false, () => {
    watch$6(validationModel, () => {
      if (validationModel.value != null) {
        validate();
      } else if (props.focused) {
        const unwatch = watch$6(() => props.focused, val => {
          if (!val) validate();
          unwatch();
        });
      }
    });
  });
  useToggleScope(() => validateOn.value.blur, () => {
    watch$6(() => props.focused, val => {
      if (!val) validate();
    });
  });
  watch$6([isValid, errorMessages], () => {
    form.update?.(uid.value, isValid.value, errorMessages.value);
  });
  async function reset() {
    model.value = null;
    await nextTick$4();
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

const {createVNode:_createVNode$9,createElementVNode:_createElementVNode$8,normalizeClass:_normalizeClass$6,normalizeStyle:_normalizeStyle$5} = await importShared('vue');
const {computed: computed$6,toRef: toRef$7,useId: useId$5} = await importShared('vue');
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
    const uid = useId$5();
    const id = computed$6(() => props.id || `input-${uid}`);
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
    const messages = computed$6(() => {
      if (props.errorMessages?.length || !isPristine.value && errorMessages.value.length) {
        return errorMessages.value;
      } else if (props.hint && (props.persistentHint || props.focused)) {
        return props.hint;
      } else {
        return props.messages;
      }
    });
    const hasMessages = toRef$7(() => messages.value.length > 0);
    const hasDetails = toRef$7(() => !props.hideDetails || props.hideDetails === 'auto' && (hasMessages.value || !!slots.details));
    const messagesId = computed$6(() => hasDetails.value ? `${id.value}-messages` : undefined);
    const slotProps = computed$6(() => ({
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
    const color = toRef$7(() => {
      return props.error || props.disabled ? undefined : props.focused ? props.color : props.baseColor;
    });
    const iconColor = toRef$7(() => {
      if (!props.iconColor) return undefined;
      return props.iconColor === true ? color.value : props.iconColor;
    });
    useRender(() => {
      const hasPrepend = !!(slots.prepend || props.prependIcon);
      const hasAppend = !!(slots.append || props.appendIcon);
      return _createElementVNode$8("div", {
        "class": _normalizeClass$6(['v-input', `v-input--${props.direction}`, {
          'v-input--center-affix': props.centerAffix,
          'v-input--focused': props.focused,
          'v-input--glow': props.glow,
          'v-input--hide-spin-buttons': props.hideSpinButtons
        }, densityClasses.value, themeClasses.value, rtlClasses.value, validationClasses.value, props.class]),
        "style": _normalizeStyle$5([dimensionStyles.value, props.style])
      }, [hasPrepend && _createElementVNode$8("div", {
        "key": "prepend",
        "class": "v-input__prepend"
      }, [slots.prepend?.(slotProps.value), props.prependIcon && _createVNode$9(InputIcon, {
        "key": "prepend-icon",
        "name": "prepend",
        "color": iconColor.value
      }, null)]), slots.default && _createElementVNode$8("div", {
        "class": "v-input__control"
      }, [slots.default?.(slotProps.value)]), hasAppend && _createElementVNode$8("div", {
        "key": "append",
        "class": "v-input__append"
      }, [props.appendIcon && _createVNode$9(InputIcon, {
        "key": "append-icon",
        "name": "append",
        "color": iconColor.value
      }, null), slots.append?.(slotProps.value)]), hasDetails.value && _createElementVNode$8("div", {
        "id": messagesId.value,
        "class": "v-input__details",
        "role": "alert",
        "aria-live": "polite"
      }, [_createVNode$9(VMessages, {
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

const {createVNode:_createVNode$8,mergeProps:_mergeProps$5} = await importShared('vue');
const {computed: computed$5,inject,mergeProps: mergeProps$1,nextTick: nextTick$3,onBeforeUnmount,onDeactivated,provide,ref: ref$6,shallowRef: shallowRef$4,toRef: toRef$6,useId: useId$4,watch: watch$5} = await importShared('vue');
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
    const uid = useId$4();
    const id = toRef$6(() => props.id || `v-menu-${uid}`);
    const overlay = ref$6();
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
      return _createVNode$8(VOverlay, _mergeProps$5({
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
          return _createVNode$8(VDefaultsProvider, {
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

const {vShow:_vShow$1,normalizeClass:_normalizeClass$5,normalizeStyle:_normalizeStyle$4,createElementVNode:_createElementVNode$7,withDirectives:_withDirectives$2,createVNode:_createVNode$7} = await importShared('vue');
const {toRef: toRef$5} = await importShared('vue');
const makeVCounterProps = propsFactory({
  active: Boolean,
  disabled: Boolean,
  max: [Number, String],
  value: {
    type: [Number, String],
    default: 0
  },
  ...makeComponentProps(),
  ...makeTransitionProps({
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
    const counter = toRef$5(() => {
      return props.max ? `${props.value} / ${props.max}` : String(props.value);
    });
    useRender(() => _createVNode$7(MaybeTransition, {
      "transition": props.transition
    }, {
      default: () => [_withDirectives$2(_createElementVNode$7("div", {
        "class": _normalizeClass$5(['v-counter', {
          'text-error': props.max && !props.disabled && parseFloat(props.value) > parseFloat(props.max)
        }, props.class]),
        "style": _normalizeStyle$4(props.style)
      }, [slots.default ? slots.default({
        counter: counter.value,
        max: props.max,
        value: props.value
      }) : counter.value]), [[_vShow$1, props.active]])]
    }));
    return {};
  }
});

const {normalizeClass:_normalizeClass$4,normalizeStyle:_normalizeStyle$3,createVNode:_createVNode$6} = await importShared('vue');
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
    useRender(() => _createVNode$6(VLabel, {
      "class": _normalizeClass$4(['v-field-label', {
        'v-field-label--floating': props.floating
      }, props.class]),
      "style": _normalizeStyle$3(props.style)
    }, slots));
    return {};
  }
});

const {createElementVNode:_createElementVNode$6,createVNode:_createVNode$5,normalizeClass:_normalizeClass$3,normalizeStyle:_normalizeStyle$2,vShow:_vShow,withDirectives:_withDirectives$1,Fragment:_Fragment$5,mergeProps:_mergeProps$4} = await importShared('vue');
const {computed: computed$4,ref: ref$5,toRef: toRef$4,useId: useId$3,watch: watch$4} = await importShared('vue');
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
    const isActive = toRef$4(() => props.dirty || props.active);
    const hasLabel = toRef$4(() => !!(props.label || slots.label));
    const hasFloatingLabel = toRef$4(() => !props.singleLine && hasLabel.value);
    const uid = useId$3();
    const id = computed$4(() => props.id || `input-${uid}`);
    const messagesId = toRef$4(() => !props.details ? undefined : `${id.value}-messages`);
    const labelRef = ref$5();
    const floatingLabelRef = ref$5();
    const controlRef = ref$5();
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
      return _createElementVNode$6("div", _mergeProps$4({
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
      }, attrs), [_createElementVNode$6("div", {
        "class": "v-field__overlay"
      }, null), _createVNode$5(LoaderSlot, {
        "name": "v-field",
        "active": !!props.loading,
        "color": props.error ? 'error' : typeof props.loading === 'string' ? props.loading : props.color
      }, {
        default: slots.loader
      }), hasPrepend && _createElementVNode$6("div", {
        "key": "prepend",
        "class": "v-field__prepend-inner"
      }, [props.prependInnerIcon && _createVNode$5(InputIcon, {
        "key": "prepend-icon",
        "name": "prependInner",
        "color": iconColor.value
      }, null), slots['prepend-inner']?.(slotProps.value)]), _createElementVNode$6("div", {
        "class": "v-field__field",
        "data-no-activator": ""
      }, [['filled', 'solo', 'solo-inverted', 'solo-filled'].includes(props.variant) && hasFloatingLabel.value && _createVNode$5(VFieldLabel, {
        "key": "floating-label",
        "ref": floatingLabelRef,
        "class": _normalizeClass$3([textColorClasses.value]),
        "floating": true,
        "for": id.value,
        "aria-hidden": !isActive.value,
        "style": _normalizeStyle$2(textColorStyles.value)
      }, {
        default: () => [label()]
      }), hasLabel.value && _createVNode$5(VFieldLabel, {
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
      }) ?? _createElementVNode$6("div", {
        "id": id.value,
        "class": "v-field__input",
        "aria-describedby": messagesId.value
      }, null)]), hasClear && _createVNode$5(VExpandXTransition, {
        "key": "clear"
      }, {
        default: () => [_withDirectives$1(_createElementVNode$6("div", {
          "class": "v-field__clearable",
          "onMousedown": e => {
            e.preventDefault();
            e.stopPropagation();
          }
        }, [_createVNode$5(VDefaultsProvider, {
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
          }) : _createVNode$5(InputIcon, {
            "name": "clear",
            "onFocus": focus,
            "onBlur": blur,
            "tabindex": -1
          }, null)]
        })]), [[_vShow, props.dirty]])]
      }), hasAppend && _createElementVNode$6("div", {
        "key": "append",
        "class": "v-field__append-inner"
      }, [slots['append-inner']?.(slotProps.value), props.appendInnerIcon && _createVNode$5(InputIcon, {
        "key": "append-icon",
        "name": "appendInner",
        "color": iconColor.value
      }, null)]), _createElementVNode$6("div", {
        "class": _normalizeClass$3(['v-field__outline', textColorClasses.value]),
        "style": _normalizeStyle$2(textColorStyles.value)
      }, [isOutlined && _createElementVNode$6(_Fragment$5, null, [_createElementVNode$6("div", {
        "class": "v-field__outline__start"
      }, null), hasFloatingLabel.value && _createElementVNode$6("div", {
        "class": "v-field__outline__notch"
      }, [_createVNode$5(VFieldLabel, {
        "ref": floatingLabelRef,
        "floating": true,
        "for": id.value,
        "aria-hidden": !isActive.value
      }, {
        default: () => [label()]
      })]), _createElementVNode$6("div", {
        "class": "v-field__outline__end"
      }, null)]), isPlainOrUnderlined.value && hasFloatingLabel.value && _createVNode$5(VFieldLabel, {
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
const {shallowRef: shallowRef$3,toRef: toRef$3,useId: useId$2} = await importShared('vue');
// Types
// Composables
const makeAutocompleteProps = propsFactory({
  autocomplete: String
}, 'autocomplete');
function useAutocomplete(props) {
  const uniqueId = useId$2();
  const reloadTrigger = shallowRef$3(0);
  const isSuppressing = toRef$3(() => props.autocomplete === 'suppress');
  const fieldName = toRef$3(() => {
    return isSuppressing.value ? `${props.name}-${uniqueId}-${reloadTrigger.value}` : props.name;
  });
  const fieldAutocomplete = toRef$3(() => {
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

const {mergeProps:_mergeProps$3,createElementVNode:_createElementVNode$5,withDirectives:_withDirectives,Fragment:_Fragment$4,normalizeClass:_normalizeClass$2,createVNode:_createVNode$4} = await importShared('vue');
const {cloneVNode,computed: computed$3,nextTick: nextTick$2,ref: ref$4} = await importShared('vue');
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
    const vInputRef = ref$4();
    const vFieldRef = ref$4();
    const inputRef = ref$4();
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
      return _createVNode$4(VInput, _mergeProps$3({
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
          return _createVNode$4(VField, _mergeProps$3({
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
              const inputNode = _withDirectives(_createElementVNode$5("input", _mergeProps$3({
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
              return _createElementVNode$5(_Fragment$4, null, [props.prefix && _createElementVNode$5("span", {
                "class": "v-text-field__prefix"
              }, [_createElementVNode$5("span", {
                "class": "v-text-field__prefix__text"
              }, [props.prefix])]), slots.default ? _createElementVNode$5("div", {
                "class": _normalizeClass$2(fieldClass),
                "data-no-activator": ""
              }, [slots.default(), inputNode]) : cloneVNode(inputNode, {
                class: fieldClass
              }), props.suffix && _createElementVNode$5("span", {
                "class": "v-text-field__suffix"
              }, [_createElementVNode$5("span", {
                "class": "v-text-field__suffix__text"
              }, [props.suffix])])]);
            }
          });
        },
        details: hasDetails ? slotProps => _createElementVNode$5(_Fragment$4, null, [slots.details?.(slotProps), hasCounter && _createElementVNode$5(_Fragment$4, null, [_createElementVNode$5("span", null, null), _createVNode$4(VCounter, {
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
  setup(__props) {

const props = __props;

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
    alert('请检查表单中的错误');
    return
  }

  saving.value = true;
  try {
    const response = await props.api.post('plugin/DanmakuAutoImport/config', localConfig);
    if (response.success) {
      alert('配置保存成功');
      // 更新备份
      Object.assign(initialConfigBackup, localConfig);
    } else {
      alert('配置保存失败: ' + (response.message || '未知错误'));
    }
  } catch (error) {
    console.error('保存配置失败:', error);
    alert('保存配置失败: ' + error.message);
  } finally {
    saving.value = false;
  }
};

const testConnection = async () => {
  if (!localConfig.danmu_server_url || !localConfig.external_api_key) {
    alert('请先填写弹幕库服务器地址和API密钥');
    return
  }

  testing.value = true;
  try {
    const response = await props.api.get('plugin/DanmakuAutoImport/rate_limit_status');
    if (response.success) {
      alert('连接测试成功!\n弹幕库服务器连接正常');
    } else {
      alert('连接测试失败: ' + (response.message || '未知错误'));
    }
  } catch (error) {
    console.error('测试连接失败:', error);
    alert('测试连接失败: ' + error.message);
  } finally {
    testing.value = false;
  }
};

const resetConfig = () => {
  Object.assign(localConfig, initialConfigBackup);
  if (form.value) form.value.resetValidation();
  alert('配置已重置');
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
            _cache[12] || (_cache[12] = _createElementVNode("span", null, "弹幕库自动导入配置", -1))
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
                        _cache[13] || (_cache[13] = _createElementVNode("span", null, "基本设置", -1))
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
                                      _cache[14] || (_cache[14] = _createElementVNode("div", null, [
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
                                      _cache[15] || (_cache[15] = _createElementVNode("div", null, [
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
                                      _cache[16] || (_cache[16] = _createElementVNode("div", null, [
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
                        _cache[17] || (_cache[17] = _createElementVNode("span", null, "服务器设置", -1))
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
                        _cache[18] || (_cache[18] = _createElementVNode("span", null, "任务设置", -1))
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
                                  modelValue: localConfig.delay_seconds,
                                  "onUpdate:modelValue": _cache[6] || (_cache[6] = $event => ((localConfig.delay_seconds) = $event)),
                                  modelModifiers: { number: true },
                                  label: "延时导入(秒)",
                                  type: "number",
                                  placeholder: "0",
                                  hint: "媒体下载完成后延时秒数",
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
                        _cache[19] || (_cache[19] = _createElementVNode("span", null, "高级设置", -1))
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
                                      _cache[20] || (_cache[20] = _createElementVNode("div", null, [
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
                        _cache[21] || (_cache[21] = _createElementVNode("span", { class: "text-caption" }, " 插件会在媒体下载完成后自动将任务添加到队列,由定时任务处理。支持延时导入、失败重试等功能。 ", -1))
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
              "prepend-icon": "mdi-test-tube",
              size: "small",
              onClick: testConnection,
              loading: testing.value
            }, {
              default: _withCtx(() => [...(_cache[22] || (_cache[22] = [
                _createTextVNode(" 测试连接 ", -1)
              ]))]),
              _: 1
            }, 8, ["loading"]),
            _createVNode(VSpacer),
            _createVNode(VBtn, {
              color: "secondary",
              variant: "text",
              "prepend-icon": "mdi-restore",
              size: "small",
              onClick: resetConfig
            }, {
              default: _withCtx(() => [...(_cache[23] || (_cache[23] = [
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
              default: _withCtx(() => [...(_cache[24] || (_cache[24] = [
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
const Config = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-5fb73a39"]]);

export { Config as default };
