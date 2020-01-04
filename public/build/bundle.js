
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
(function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/Header.svelte generated by Svelte v3.16.5 */

    const file = "src/Header.svelte";

    function create_fragment(ctx) {
    	let header;
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let h1;
    	let t2;
    	let h2;

    	const block = {
    		c: function create() {
    			header = element("header");
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Tempomat";
    			t2 = space();
    			h2 = element("h2");
    			h2.textContent = "Easily convert BeatsPerMinute to MilliSeconds";
    			if (img.src !== (img_src_value = "./assets/metronome.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Colourfull metronome graphic");
    			attr_dev(img, "class", "svelte-1l9qw3n");
    			add_location(img, file, 2, 3, 53);
    			attr_dev(h1, "class", "svelte-1l9qw3n");
    			add_location(h1, file, 3, 3, 127);
    			attr_dev(div, "class", "main-heading svelte-1l9qw3n");
    			add_location(div, file, 1, 2, 23);
    			attr_dev(h2, "class", "svelte-1l9qw3n");
    			add_location(h2, file, 5, 1, 155);
    			attr_dev(header, "class", "box svelte-1l9qw3n");
    			add_location(header, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, h1);
    			append_dev(header, t2);
    			append_dev(header, h2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/ValueBox.svelte generated by Svelte v3.16.5 */
    const file$1 = "src/ValueBox.svelte";

    function create_fragment$1(ctx) {
    	let section;
    	let label;
    	let input;
    	let t0;
    	let h3;
    	let t1;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			h3 = element("h3");
    			t1 = text(/*valueName*/ ctx[0]);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "1");
    			input.value = /*value*/ ctx[1];
    			attr_dev(input, "class", "svelte-3zjt3g");
    			add_location(input, file$1, 14, 4, 281);
    			add_location(h3, file$1, 20, 4, 378);
    			add_location(label, file$1, 13, 2, 269);
    			attr_dev(section, "class", "box");
    			add_location(section, file$1, 12, 0, 245);
    			dispose = listen_dev(input, "input", /*handleInput*/ ctx[2], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, label);
    			append_dev(label, input);
    			append_dev(label, t0);
    			append_dev(label, h3);
    			append_dev(h3, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 2) {
    				prop_dev(input, "value", /*value*/ ctx[1]);
    			}

    			if (dirty & /*valueName*/ 1) set_data_dev(t1, /*valueName*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { valueName } = $$props;
    	let { value } = $$props;
    	const dispatch = createEventDispatcher();

    	function handleInput() {
    		dispatch("input", { value: event.target.value });
    	}

    	const writable_props = ["valueName", "value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ValueBox> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("valueName" in $$props) $$invalidate(0, valueName = $$props.valueName);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    	};

    	$$self.$capture_state = () => {
    		return { valueName, value };
    	};

    	$$self.$inject_state = $$props => {
    		if ("valueName" in $$props) $$invalidate(0, valueName = $$props.valueName);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    	};

    	return [valueName, value, handleInput];
    }

    class ValueBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, { valueName: 0, value: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ValueBox",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*valueName*/ ctx[0] === undefined && !("valueName" in props)) {
    			console.warn("<ValueBox> was created without expected prop 'valueName'");
    		}

    		if (/*value*/ ctx[1] === undefined && !("value" in props)) {
    			console.warn("<ValueBox> was created without expected prop 'value'");
    		}
    	}

    	get valueName() {
    		throw new Error("<ValueBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valueName(value) {
    		throw new Error("<ValueBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ValueBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ValueBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/SubdivisionPicker.svelte generated by Svelte v3.16.5 */
    const file$2 = "src/SubdivisionPicker.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (17:4) {#each notes as note}
    function create_each_block(ctx) {
    	let option;
    	let t0_value = /*note*/ ctx[6] + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*note*/ ctx[6];
    			option.value = option.__value;
    			add_location(option, file$2, 17, 6, 486);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(17:4) {#each notes as note}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let section;
    	let h3;
    	let t1;
    	let select;
    	let t2;
    	let t3;
    	let t4;
    	let dispose;
    	let each_value = /*notes*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			h3 = element("h3");
    			h3.textContent = "Choose other subdivision:";
    			t1 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			t3 = text(/*ms*/ ctx[1]);
    			t4 = text("ms");
    			add_location(h3, file$2, 14, 2, 355);
    			attr_dev(select, "class", "svelte-1kyj8lg");
    			if (/*subdivision*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			add_location(select, file$2, 15, 2, 392);
    			attr_dev(section, "class", "box");
    			add_location(section, file$2, 13, 0, 331);

    			dispose = [
    				listen_dev(select, "change", /*select_change_handler*/ ctx[5]),
    				listen_dev(select, "input", /*handleSelect*/ ctx[3], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h3);
    			append_dev(section, t1);
    			append_dev(section, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*subdivision*/ ctx[0]);
    			append_dev(section, t2);
    			append_dev(section, t3);
    			append_dev(section, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*notes*/ 4) {
    				each_value = /*notes*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*subdivision*/ 1) {
    				select_option(select, /*subdivision*/ ctx[0]);
    			}

    			if (dirty & /*ms*/ 2) set_data_dev(t3, /*ms*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { ms } = $$props;
    	let { subdivision } = $$props;
    	const notes = ["whole", "half", "quarter", "eight", "sixteenth", "thirty-second"];
    	const dispatch = createEventDispatcher();

    	function handleSelect() {
    		dispatch("input", { value: event.target.value });
    	}

    	
    	const writable_props = ["ms", "subdivision"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SubdivisionPicker> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		subdivision = select_value(this);
    		$$invalidate(0, subdivision);
    		$$invalidate(2, notes);
    	}

    	$$self.$set = $$props => {
    		if ("ms" in $$props) $$invalidate(1, ms = $$props.ms);
    		if ("subdivision" in $$props) $$invalidate(0, subdivision = $$props.subdivision);
    	};

    	$$self.$capture_state = () => {
    		return { ms, subdivision };
    	};

    	$$self.$inject_state = $$props => {
    		if ("ms" in $$props) $$invalidate(1, ms = $$props.ms);
    		if ("subdivision" in $$props) $$invalidate(0, subdivision = $$props.subdivision);
    	};

    	return [subdivision, ms, notes, handleSelect, dispatch, select_change_handler];
    }

    class SubdivisionPicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, { ms: 1, subdivision: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SubdivisionPicker",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*ms*/ ctx[1] === undefined && !("ms" in props)) {
    			console.warn("<SubdivisionPicker> was created without expected prop 'ms'");
    		}

    		if (/*subdivision*/ ctx[0] === undefined && !("subdivision" in props)) {
    			console.warn("<SubdivisionPicker> was created without expected prop 'subdivision'");
    		}
    	}

    	get ms() {
    		throw new Error("<SubdivisionPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ms(value) {
    		throw new Error("<SubdivisionPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subdivision() {
    		throw new Error("<SubdivisionPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subdivision(value) {
    		throw new Error("<SubdivisionPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/TempoMarkings.svelte generated by Svelte v3.16.5 */

    const file$3 = "src/TempoMarkings.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let h3;
    	let t1;
    	let p;
    	let t2;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h3 = element("h3");
    			h3.textContent = "Current Tempo Marking";
    			t1 = space();
    			p = element("p");
    			t2 = text(/*tempo*/ ctx[0]);
    			add_location(h3, file$3, 22, 2, 609);
    			attr_dev(p, "class", "svelte-hlw1vl");
    			add_location(p, file$3, 23, 2, 642);
    			attr_dev(section, "class", "box");
    			add_location(section, file$3, 21, 0, 585);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h3);
    			append_dev(section, t1);
    			append_dev(section, p);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tempo*/ 1) set_data_dev(t2, /*tempo*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function defineTempo(bpm) {
    	if (bpm < 25) return "Larghissimo";
    	if (bpm < 45) return "Grave";
    	if (bpm < 60) return "Largo / Lento";
    	if (bpm < 66) return "Larghetto";
    	if (bpm < 76) return "Adagio";
    	if (bpm < 108) return "Andante";
    	if (bpm < 120) return "Moderato";
    	if (bpm < 156) return "Allegro";
    	if (bpm < 176) return "Vivace";
    	if (bpm < 200) return "Presto";
    	if (bpm <= 200) return "Prestissimo"; else return "choose your tempo";
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { bpm } = $$props;
    	const writable_props = ["bpm"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TempoMarkings> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("bpm" in $$props) $$invalidate(1, bpm = $$props.bpm);
    	};

    	$$self.$capture_state = () => {
    		return { bpm, tempo };
    	};

    	$$self.$inject_state = $$props => {
    		if ("bpm" in $$props) $$invalidate(1, bpm = $$props.bpm);
    		if ("tempo" in $$props) $$invalidate(0, tempo = $$props.tempo);
    	};

    	let tempo;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*bpm*/ 2) {
    			 $$invalidate(0, tempo = defineTempo(bpm));
    		}
    	};

    	return [tempo, bpm];
    }

    class TempoMarkings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, { bpm: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TempoMarkings",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*bpm*/ ctx[1] === undefined && !("bpm" in props)) {
    			console.warn("<TempoMarkings> was created without expected prop 'bpm'");
    		}
    	}

    	get bpm() {
    		throw new Error("<TempoMarkings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bpm(value) {
    		throw new Error("<TempoMarkings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Main.svelte generated by Svelte v3.16.5 */
    const file$4 = "src/Main.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const valuebox0 = new ValueBox({
    			props: {
    				valueName: "Beats Per Minute",
    				value: /*bpm*/ ctx[0]
    			},
    			$$inline: true
    		});

    	valuebox0.$on("input", /*setBothFromBPM*/ ctx[4]);

    	const valuebox1 = new ValueBox({
    			props: {
    				valueName: "Milliseconds (at quarter note subdivision)",
    				value: /*ms*/ ctx[1]
    			},
    			$$inline: true
    		});

    	valuebox1.$on("input", /*setBothFromMs*/ ctx[5]);

    	const subdivisionpicker = new SubdivisionPicker({
    			props: {
    				subdivision: /*subdivision*/ ctx[2],
    				ms: /*msTable*/ ctx[3][/*subdivision*/ ctx[2]]
    			},
    			$$inline: true
    		});

    	subdivisionpicker.$on("input", /*setSubdivision*/ ctx[6]);

    	const tempomarkings = new TempoMarkings({
    			props: { bpm: /*bpm*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(valuebox0.$$.fragment);
    			t0 = space();
    			create_component(valuebox1.$$.fragment);
    			t1 = space();
    			create_component(subdivisionpicker.$$.fragment);
    			t2 = space();
    			create_component(tempomarkings.$$.fragment);
    			attr_dev(main, "class", "svelte-nobnhr");
    			add_location(main, file$4, 32, 0, 659);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(valuebox0, main, null);
    			append_dev(main, t0);
    			mount_component(valuebox1, main, null);
    			append_dev(main, t1);
    			mount_component(subdivisionpicker, main, null);
    			append_dev(main, t2);
    			mount_component(tempomarkings, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const valuebox0_changes = {};
    			if (dirty & /*bpm*/ 1) valuebox0_changes.value = /*bpm*/ ctx[0];
    			valuebox0.$set(valuebox0_changes);
    			const valuebox1_changes = {};
    			if (dirty & /*ms*/ 2) valuebox1_changes.value = /*ms*/ ctx[1];
    			valuebox1.$set(valuebox1_changes);
    			const subdivisionpicker_changes = {};
    			if (dirty & /*subdivision*/ 4) subdivisionpicker_changes.subdivision = /*subdivision*/ ctx[2];
    			if (dirty & /*msTable, subdivision*/ 12) subdivisionpicker_changes.ms = /*msTable*/ ctx[3][/*subdivision*/ ctx[2]];
    			subdivisionpicker.$set(subdivisionpicker_changes);
    			const tempomarkings_changes = {};
    			if (dirty & /*bpm*/ 1) tempomarkings_changes.bpm = /*bpm*/ ctx[0];
    			tempomarkings.$set(tempomarkings_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(valuebox0.$$.fragment, local);
    			transition_in(valuebox1.$$.fragment, local);
    			transition_in(subdivisionpicker.$$.fragment, local);
    			transition_in(tempomarkings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(valuebox0.$$.fragment, local);
    			transition_out(valuebox1.$$.fragment, local);
    			transition_out(subdivisionpicker.$$.fragment, local);
    			transition_out(tempomarkings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(valuebox0);
    			destroy_component(valuebox1);
    			destroy_component(subdivisionpicker);
    			destroy_component(tempomarkings);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let bpm = 120;
    	let ms = 500;
    	let subdivision = "quarter";

    	function setBothFromBPM(event) {
    		$$invalidate(0, bpm = +event.detail.value);
    		$$invalidate(1, ms = Math.round(60000 / bpm));
    	}

    	

    	function setBothFromMs(event) {
    		$$invalidate(1, ms = +event.detail.value);
    		$$invalidate(0, bpm = Math.round(60 / ms * 1000));
    	}

    	

    	function setSubdivision(event) {
    		$$invalidate(2, subdivision = event.detail.value);
    	}

    	

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("bpm" in $$props) $$invalidate(0, bpm = $$props.bpm);
    		if ("ms" in $$props) $$invalidate(1, ms = $$props.ms);
    		if ("subdivision" in $$props) $$invalidate(2, subdivision = $$props.subdivision);
    		if ("msTable" in $$props) $$invalidate(3, msTable = $$props.msTable);
    	};

    	let msTable;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*ms*/ 2) {
    			 $$invalidate(3, msTable = {
    				"whole": ms * 4,
    				"half": ms * 2,
    				"quarter": ms,
    				"eight": ms / 2,
    				"sixteenth": ms / 4,
    				"thirty-second": ms / 8
    			});
    		}
    	};

    	return [bpm, ms, subdivision, msTable, setBothFromBPM, setBothFromMs, setSubdivision];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.16.5 */

    function create_fragment$5(ctx) {
    	let t;
    	let current;
    	const header = new Header({ $$inline: true });
    	const main = new Main({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t = space();
    			create_component(main.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(main, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(main, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    new App({ target: document.body });

}());
//# sourceMappingURL=bundle.js.map
