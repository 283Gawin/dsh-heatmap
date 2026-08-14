window.__ModuleLoader__.load({
	id: "@linxin666/dsh-client-ui-activity-heatmap",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		//#region \0dsh-css:C:\Users\28344\.dsh\external\dsh-heatmap\src\client\styles.module.css.mjs
		const css$1 = ".DzO7jq_panel{box-sizing:border-box;border-top:1px solid var(--dsw-alias-border-l1,var(--panel-border,#8080802e));color:var(--dsw-alias-label-primary,var(--text-color,#333));user-select:none;padding:10px 12px 8px;font-size:11px;line-height:1.4;display:block}.DzO7jq_header{cursor:pointer;align-items:center;gap:6px;display:flex}.DzO7jq_chevron{opacity:.5;border-bottom:1.5px solid;border-right:1.5px solid;flex:none;width:7px;height:7px;margin-top:-2px;transition:transform .15s;display:inline-block;transform:rotate(45deg)}.DzO7jq_chevronOpen{transform:rotate(-135deg)}.DzO7jq_title{letter-spacing:.01em;white-space:nowrap;font-size:13px;font-weight:700}.DzO7jq_viewTabs{gap:0;margin-left:auto;display:flex}.DzO7jq_viewBtn{color:inherit;opacity:.45;cursor:pointer;background:0 0;border:none;padding:2px 6px;font-size:11px}.DzO7jq_viewBtn:hover{opacity:.7}.DzO7jq_viewBtn.DzO7jq_active{opacity:1;font-weight:600}.DzO7jq_toolbar{align-items:center;gap:8px;margin:6px 0 8px;display:flex}.DzO7jq_metricGroup{gap:4px;display:flex}.DzO7jq_metricBtn{border:1px solid var(--dsw-alias-border-l2,#80808040);color:inherit;opacity:.55;cursor:pointer;background:0 0;border-radius:4px;padding:2px 8px;font-size:10px}.DzO7jq_metricBtn:hover{opacity:.8}.DzO7jq_metricBtn.DzO7jq_active{opacity:1;border-color:var(--dsw-alias-label-secondary,#80808080);font-weight:600}.DzO7jq_grid{grid-template-rows:repeat(7,auto);grid-auto-flow:column;gap:2px;margin-bottom:2px;display:grid}.DzO7jq_cell{background:var(--dsw-alias-bg-layer-3,var(--hm-0,#ebedf0));border-radius:2px;width:8px;height:8px}.DzO7jq_panel[data-theme=blue] .DzO7jq_l1{background:#9ecae1}.DzO7jq_panel[data-theme=blue] .DzO7jq_l2{background:#6baed6}.DzO7jq_panel[data-theme=blue] .DzO7jq_l3{background:#3182bd}.DzO7jq_panel[data-theme=blue] .DzO7jq_l4{background:#08519c}.DzO7jq_panel[data-theme=green] .DzO7jq_l1{background:#9be9a8}.DzO7jq_panel[data-theme=green] .DzO7jq_l2{background:#40c463}.DzO7jq_panel[data-theme=green] .DzO7jq_l3{background:#30a14e}.DzO7jq_panel[data-theme=green] .DzO7jq_l4{background:#216e39}.DzO7jq_labels{height:14px;margin:0 0 6px;position:relative;overflow:hidden}.DzO7jq_monthLabel{opacity:.55;white-space:nowrap;font-size:10px;position:absolute;top:0}.DzO7jq_stats{border-top:1px solid var(--dsw-alias-border-l1,var(--panel-border,#8080802e));flex-direction:column;gap:6px;padding-top:6px;display:flex}.DzO7jq_statsRow{gap:4px;display:flex}.DzO7jq_statItem{text-align:center;background:var(--dsw-alias-bg-layer-1,#8080800f);border-radius:6px;flex:1;min-width:0;padding:4px 2px}.DzO7jq_statLabel{opacity:.55;white-space:nowrap;text-overflow:ellipsis;font-size:9px;overflow:hidden}.DzO7jq_statValue{white-space:nowrap;text-overflow:ellipsis;margin-top:1px;font-size:11px;font-weight:600;overflow:hidden}.DzO7jq_modelLine{opacity:.65;word-break:break-all;text-align:center;margin-top:2px;font-size:10px}.DzO7jq_status{opacity:.55;margin:6px 0 0;font-size:10px;font-style:italic}body[data-ds-dark-theme] .DzO7jq_panel[data-theme=blue] .DzO7jq_l1{background:#1d4b63}body[data-ds-dark-theme] .DzO7jq_panel[data-theme=blue] .DzO7jq_l2{background:#1a6a92}body[data-ds-dark-theme] .DzO7jq_panel[data-theme=blue] .DzO7jq_l3{background:#2a86c2}body[data-ds-dark-theme] .DzO7jq_panel[data-theme=blue] .DzO7jq_l4{background:#58b2e6}body[data-ds-dark-theme] .DzO7jq_panel[data-theme=green] .DzO7jq_l1{background:#1d5230}body[data-ds-dark-theme] .DzO7jq_panel[data-theme=green] .DzO7jq_l2{background:#1f7a3f}body[data-ds-dark-theme] .DzO7jq_panel[data-theme=green] .DzO7jq_l3{background:#2ea45a}body[data-ds-dark-theme] .DzO7jq_panel[data-theme=green] .DzO7jq_l4{background:#63d68a}body[data-ds-dark-theme] .DzO7jq_monthLabel,body[data-ds-dark-theme] .DzO7jq_status{opacity:.6}";
		const tagId$1 = "@linxin666/dsh-client-ui-activity-heatmap/styles.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@linxin666/dsh-client-ui-activity-heatmap";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var styles_module_css_default = {
			"active": "DzO7jq_active",
			"cell": "DzO7jq_cell",
			"chevron": "DzO7jq_chevron",
			"chevronOpen": "DzO7jq_chevronOpen",
			"grid": "DzO7jq_grid",
			"header": "DzO7jq_header",
			"l1": "DzO7jq_l1",
			"l2": "DzO7jq_l2",
			"l3": "DzO7jq_l3",
			"l4": "DzO7jq_l4",
			"labels": "DzO7jq_labels",
			"metricBtn": "DzO7jq_metricBtn",
			"metricGroup": "DzO7jq_metricGroup",
			"modelLine": "DzO7jq_modelLine",
			"monthLabel": "DzO7jq_monthLabel",
			"panel": "DzO7jq_panel",
			"statItem": "DzO7jq_statItem",
			"statLabel": "DzO7jq_statLabel",
			"statValue": "DzO7jq_statValue",
			"stats": "DzO7jq_stats",
			"statsRow": "DzO7jq_statsRow",
			"status": "DzO7jq_status",
			"title": "DzO7jq_title",
			"toolbar": "DzO7jq_toolbar",
			"viewBtn": "DzO7jq_viewBtn",
			"viewTabs": "DzO7jq_viewTabs"
		};
		//#endregion
		//#region src/client/heatmap.ts
		/**
		* The sidebar heatmap panel — Codex Token Activity style.
		*
		* Renders a ~91-day GitHub-style grid that can switch between commit counts,
		* billed token totals, and estimated USD spend, plus a stats block with
		* today's totals, cache hit rate, per-model cost breakdown, and the trailing
		* window sums. All data comes from GET /activity-heatmap/stats served by the
		* host half; the panel polls every POLL_MS and on visibility change.
		*
		* The panel is plain DOM (no React tree) so it can never disturb the shell's
		* reconciliation; it is mounted by sidebar.ts into the sidebar column.
		*
		* @module dsh-activity-heatmap/client/heatmap
		*/
		/** Poll interval for the stats endpoint. */
		const POLL_MS = 6e4;
		const METRIC_KEY = "dsh.activityHeatmap.metric";
		const VIEW_KEY = "dsh.activityHeatmap.view";
		const THEME_KEY = "dsh.activityHeatmap.theme";
		const COLLAPSED_KEY = "dsh.activityHeatmap.collapsed";
		function formatTokens(n) {
			if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
			if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
			return String(Math.round(n));
		}
		function formatUsd(n) {
			if (n < .001) return "$0";
			if (n < .01) return "$" + n.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
			if (n < 100) return "$" + n.toFixed(2);
			return "$" + n.toFixed(1);
		}
		function billed(day) {
			return day.inputTokens + day.cacheReadTokens + day.cacheWriteTokens + day.outputTokens;
		}
		function dayCost(day) {
			return Object.values(day.modelCostUsd).reduce((s, u) => s + u, 0);
		}
		function dayValue(day, m) {
			switch (m) {
				case "commits": return day.commits;
				case "tokens": return billed(day);
				case "cost": return dayCost(day);
			}
		}
		function parseDate(key) {
			const [y, mo, d] = key.split("-").map(Number);
			return new Date(y, mo - 1, d);
		}
		/** Slice the payload to the trailing window. */
		function windowDays(payload) {
			return payload.days.slice(Math.max(0, payload.days.length - 91));
		}
		/** Grid cell levels per view mode; one number per day cell (0 = empty). */
		function computeValues(days, metric, view) {
			if (view === "cumulative") {
				let sum = 0;
				return days.map((d) => {
					sum += dayValue(d, metric);
					return sum;
				});
			}
			if (view === "weekly") {
				const weekTotals = /* @__PURE__ */ new Map();
				for (let i = 0; i < days.length; i++) {
					const week = Math.floor(i / 7);
					weekTotals.set(week, (weekTotals.get(week) ?? 0) + dayValue(days[i], metric));
				}
				return days.map((_, i) => weekTotals.get(Math.floor(i / 7)) ?? 0);
			}
			return days.map((d) => dayValue(d, metric));
		}
		/** Level0..4 for a value on a log scale. */
		function level(value, maxLog) {
			if (value <= 0 || maxLog <= 0) return 0;
			return 1 + Math.floor(Math.min(1, Math.log10(value) / maxLog) * 3.999);
		}
		function tooltip(day, metric, value) {
			const lines = [day.date];
			lines.push("commits: " + day.commits);
			lines.push("tokens: " + billed(day).toLocaleString("en-US"));
			const cost = dayCost(day);
			if (cost > 0) lines.push("cost: " + formatUsd(cost));
			if (metric !== "tokens") lines.push(metric + ": " + value);
			return lines.join("\n");
		}
		/** The sidebar heatmap panel. Owns its DOM, poll timer, and render state. */
		var HeatmapPanel = class {
			element;
			metricBtns = /* @__PURE__ */ new Map();
			viewBtns = /* @__PURE__ */ new Map();
			toolbar;
			gridEl;
			labelsEl;
			todayEl;
			windowEl;
			modelEl;
			statsBlock;
			statusEl;
			metric;
			view;
			theme;
			collapsed;
			payload;
			timer;
			disposed = false;
			constructor(initialTheme = "blue") {
				this.metric = readLS(METRIC_KEY, "commits", (v) => v === "commits" || v === "tokens" || v === "cost");
				this.view = readLS(VIEW_KEY, "daily", (v) => v === "daily" || v === "weekly" || v === "cumulative");
				this.theme = readLS(THEME_KEY, initialTheme, (v) => v === "blue" || v === "green");
				this.collapsed = localStorage.getItem(COLLAPSED_KEY) === "1";
				this.element = document.createElement("div");
				this.element.dataset.dshHeatmapPanel = "2";
				this.element.dataset.metric = this.metric;
				this.element.dataset.theme = this.theme;
				this.element.className = styles_module_css_default.panel;
				const header = document.createElement("div");
				header.className = styles_module_css_default.header;
				header.title = "Click to collapse/expand";
				const chevron = document.createElement("span");
				chevron.className = styles_module_css_default.chevron;
				const title = document.createElement("span");
				title.className = styles_module_css_default.title;
				title.textContent = "Token 活动";
				header.append(chevron, title);
				const viewGroup = document.createElement("span");
				viewGroup.className = styles_module_css_default.viewTabs;
				for (const [key, label] of [
					["daily", "每日"],
					["weekly", "每周"],
					["cumulative", "累计"]
				]) {
					const btn = document.createElement("button");
					btn.type = "button";
					btn.className = styles_module_css_default.viewBtn;
					btn.textContent = label;
					btn.addEventListener("click", () => this.setView(key));
					this.viewBtns.set(key, btn);
					viewGroup.appendChild(btn);
				}
				header.append(viewGroup);
				header.addEventListener("click", (e) => {
					if (e.target === header || e.target === title || e.target === chevron) {
						this.collapsed = !this.collapsed;
						localStorage.setItem(COLLAPSED_KEY, this.collapsed ? "1" : "0");
						this.applyCollapsed();
					}
				});
				const toolbar = document.createElement("div");
				toolbar.className = styles_module_css_default.toolbar;
				const metricGroup = document.createElement("span");
				metricGroup.className = styles_module_css_default.metricGroup;
				for (const [key, label] of [
					["commits", "提交"],
					["tokens", "Token"],
					["cost", "花费"]
				]) {
					const btn = document.createElement("button");
					btn.type = "button";
					btn.className = styles_module_css_default.metricBtn;
					btn.textContent = label;
					btn.addEventListener("click", () => this.setMetric(key));
					this.metricBtns.set(key, btn);
					metricGroup.appendChild(btn);
				}
				toolbar.append(metricGroup);
				this.toolbar = toolbar;
				this.gridEl = document.createElement("div");
				this.gridEl.className = styles_module_css_default.grid;
				this.labelsEl = document.createElement("div");
				this.labelsEl.className = styles_module_css_default.labels;
				const stats = document.createElement("div");
				stats.className = styles_module_css_default.stats;
				this.todayEl = document.createElement("div");
				this.todayEl.className = styles_module_css_default.statsRow;
				this.windowEl = document.createElement("div");
				this.windowEl.className = styles_module_css_default.statsRow;
				this.modelEl = document.createElement("div");
				this.modelEl.className = styles_module_css_default.modelLine;
				stats.append(this.todayEl, this.windowEl, this.modelEl);
				this.statsBlock = stats;
				this.statusEl = document.createElement("div");
				this.statusEl.className = styles_module_css_default.status;
				this.statusEl.textContent = "统计中…";
				this.element.append(header, toolbar, this.gridEl, this.labelsEl, stats, this.statusEl);
				this.applyCollapsed();
				this.applyButtons();
			}
			/** Begin polling and attach the visibility listener. */
			start() {
				this.refresh();
				this.timer = window.setInterval(() => {
					this.refresh();
				}, POLL_MS);
				document.addEventListener("visibilitychange", this.onVis);
			}
			dispose() {
				this.disposed = true;
				if (this.timer !== void 0) clearInterval(this.timer);
				document.removeEventListener("visibilitychange", this.onVis);
				this.element.remove();
			}
			onVis = () => {
				if (document.visibilityState === "visible") this.refresh();
			};
			setMetric(m) {
				if (m === this.metric) return;
				this.metric = m;
				localStorage.setItem(METRIC_KEY, m);
				this.element.dataset.metric = m;
				this.applyButtons();
				this.render();
			}
			setView(v) {
				if (v === this.view) return;
				this.view = v;
				localStorage.setItem(VIEW_KEY, v);
				this.applyButtons();
				this.render();
			}
			setTheme(t) {
				if (t === this.theme) return;
				this.theme = t;
				localStorage.setItem(THEME_KEY, t);
				this.element.dataset.theme = t;
				this.applyButtons();
			}
			applyButtons() {
				for (const [k, b] of this.metricBtns) b.classList.toggle(styles_module_css_default.active, k === this.metric);
				for (const [k, b] of this.viewBtns) b.classList.toggle(styles_module_css_default.active, k === this.view);
			}
			applyCollapsed() {
				const hide = this.collapsed;
				for (const el of [
					this.toolbar,
					this.gridEl,
					this.labelsEl,
					this.statsBlock,
					this.statusEl
				]) el.style.display = hide ? "none" : "";
				this.element.querySelector("." + styles_module_css_default.chevron)?.classList.toggle(styles_module_css_default.chevronOpen, hide);
			}
			async refresh() {
				if (this.disposed) return;
				try {
					const r = await fetch("/activity-heatmap/stats", {
						headers: { accept: "application/json" },
						cache: "no-store"
					});
					if (!r.ok) throw new Error("HTTP " + r.status);
					const env = await r.json();
					if (!env.ok || !env.value) throw new Error("bad");
					this.payload = env.value;
					this.statusEl.textContent = "";
					this.render();
				} catch {
					if (!this.disposed) this.statusEl.textContent = "数据不可用";
				}
			}
			render() {
				this.gridEl.replaceChildren();
				this.labelsEl.replaceChildren();
				const p = this.payload;
				if (!p) return;
				const days = windowDays(p);
				const vals = computeValues(days, this.metric, this.view);
				const maxLog = Math.max(...vals.filter((v) => v > 1).map((v) => Math.log10(v)), 0);
				if (days.length > 0) {
					const pad = (parseDate(days[0].date).getDay() + 6) % 7;
					for (let i = 0; i < pad; i++) {
						const cell = document.createElement("div");
						cell.className = styles_module_css_default.cell;
						this.gridEl.appendChild(cell);
					}
				}
				for (let i = 0; i < days.length; i++) {
					const cell = document.createElement("div");
					cell.className = styles_module_css_default.cell;
					const lv = level(vals[i], maxLog);
					if (lv > 0) cell.classList.add(styles_module_css_default["l" + lv]);
					cell.title = tooltip(days[i], this.metric, vals[i]);
					this.gridEl.appendChild(cell);
				}
				this.renderLabels(days);
				const today = p.today;
				const hitRate = Math.round(today.cacheHitRate * 1e3) / 10;
				const cny = today.costUsd >= .001 && p.cnyRate > 0 ? " · ¥" + (today.costUsd * p.cnyRate).toFixed(2) : "";
				this.todayEl.replaceChildren(statItem("今日 Token", formatTokens(today.tokens)), statItem("缓存命中", hitRate + "%"), statItem("今日花费", formatUsd(today.costUsd) + cny));
				let tokens = 0, commits = 0, cost = 0;
				for (const d of days) {
					tokens += billed(d);
					commits += d.commits;
					cost += dayCost(d);
				}
				this.windowEl.replaceChildren(statItem("Token 合计", formatTokens(tokens)), statItem("提交数", String(commits)), statItem("花费合计", formatUsd(cost)));
				if (today.models.length > 0) this.modelEl.textContent = today.models.map((r) => r.model + " " + formatUsd(r.usd)).join(" · ");
				else this.modelEl.textContent = "";
			}
			renderLabels(days) {
				if (days.length === 0) return;
				const gridLeft = this.gridEl.getBoundingClientRect().left;
				const cells = Array.from(this.gridEl.children);
				const labels = [];
				let lastMonth = "";
				for (let i = 0; i < days.length; i++) {
					const mo = days[i].date.slice(0, 7);
					if (mo !== lastMonth) {
						lastMonth = mo;
						const cell = cells[i + (parseDate(days[0].date).getDay() + 6) % 7];
						if (cell) {
							const rect = cell.getBoundingClientRect();
							const [y, m] = mo.split("-");
							labels.push({
								text: parseInt(m) + "月",
								x: rect.left - gridLeft
							});
						}
					}
				}
				for (const lbl of labels) {
					const span = document.createElement("span");
					span.className = styles_module_css_default.monthLabel;
					span.textContent = lbl.text;
					span.style.marginLeft = lbl.x + "px";
					this.labelsEl.appendChild(span);
				}
			}
		};
		function statItem(label, value) {
			const wrap = document.createElement("div");
			wrap.className = styles_module_css_default.statItem;
			const l = document.createElement("div");
			l.className = styles_module_css_default.statLabel;
			l.textContent = label;
			const v = document.createElement("div");
			v.className = styles_module_css_default.statValue;
			v.textContent = value;
			wrap.append(l, v);
			return wrap;
		}
		function readLS(key, fallback, guard) {
			try {
				const v = localStorage.getItem(key);
				if (v !== null && guard(v)) return v;
			} catch {}
			return fallback;
		}
		//#endregion
		//#region src/client/sidebar.ts
		/** Candidate selectors for the sidebar column, most specific first. */
		const COLUMN_SELECTORS = [
			"[data-pane=\"sidebar\"]",
			"[class*=\"sidebarCol\"]",
			"[class*=\"sidebar-column\"]"
		];
		/** Find the sidebar shell root element, or undefined while not yet mounted. */
		function sidebarRoot() {
			let column = null;
			for (const selector of COLUMN_SELECTORS) {
				column = document.querySelector(selector);
				if (column !== null) break;
			}
			if (column === null) return void 0;
			return column.querySelector("[class*=\"logoRow\"]")?.parentElement ?? column.firstElementChild;
		}
		/**
		* Mount the heatmap panel at the bottom of the sidebar, waiting for the
		* shell to render and self-healing on later React re-renders.
		* @param panel - the panel to mount (already built).
		* @returns disposer removing the panel and its observers.
		*/
		function mountSidebarPanel(panel) {
			let root;
			let placed = false;
			let rootObserver;
			const place = () => {
				if (root === void 0) return false;
				if (panel.element.parentElement === root) return true;
				root.appendChild(panel.element);
				return true;
			};
			const tryPlace = () => {
				if (root !== void 0 && !root.isConnected) {
					rootObserver?.disconnect();
					root = void 0;
					placed = false;
				}
				if (placed) {
					if (document.body.contains(panel.element)) return;
					rootObserver?.disconnect();
					root = void 0;
					placed = false;
				}
				root ??= sidebarRoot();
				if (root === void 0) return;
				placed = place();
				if (placed) {
					rootObserver ??= new MutationObserver(() => {
						if (root === void 0 || !root.isConnected) {
							placed = false;
							tryPlace();
							return;
						}
						if (!root.contains(panel.element)) place();
					});
					rootObserver.observe(root, {
						childList: true,
						subtree: true
					});
				}
			};
			const waitObserver = new MutationObserver(() => {
				tryPlace();
			});
			waitObserver.observe(document.body, {
				childList: true,
				subtree: true
			});
			tryPlace();
			return () => {
				waitObserver.disconnect();
				rootObserver?.disconnect();
				panel.element.remove();
			};
		}
		//#endregion
		//#region \0dsh-css:C:\Users\28344\.dsh\external\dsh-heatmap\src\client\settings-card.module.css.mjs
		const css = ".ZloSUq_card{border:1px solid var(--dsw-alias-border-l1,var(--panel-border,#80808040));background:var(--dsw-alias-bg-layer-1,transparent);border-radius:8px;list-style:none;overflow:hidden}.ZloSUq_header{cursor:pointer;text-align:left;width:100%;color:var(--dsw-alias-label-primary,var(--text-color,#333));background:0 0;border:none;align-items:center;gap:8px;padding:8px 10px;display:flex}.ZloSUq_headText{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}.ZloSUq_name{font-size:12px;font-weight:600}.ZloSUq_desc{opacity:.65;font-size:11px}.ZloSUq_chev{opacity:.55;font-size:10px;transition:transform .15s}.ZloSUq_chevOpen{transform:rotate(180deg)}.ZloSUq_body{border-top:1px solid var(--dsw-alias-border-l1,var(--panel-border,#80808033));color:var(--dsw-alias-label-primary,var(--text-color,#333));padding:10px}.ZloSUq_actions{justify-content:flex-end;gap:8px;margin-top:8px;display:flex}.ZloSUq_save{background:var(--dsw-alias-brand-primary,#2f6fe4);color:#fff;cursor:pointer;border:none;border-radius:5px;padding:4px 14px;font-size:11px}.ZloSUq_save:disabled{opacity:.45;cursor:default}.ZloSUq_discard{border:1px solid var(--dsw-alias-border-l2,#80808059);color:inherit;cursor:pointer;background:0 0;border-radius:5px;padding:4px 10px;font-size:11px}.ZloSUq_discard:disabled{opacity:.45;cursor:default}.ZloSUq_failed{color:var(--dsw-alias-state-error-primary,#e5484d);margin:0;font-size:10px}.ZloSUq_note{opacity:.7;margin:0;font-size:11px}";
		const tagId = "@linxin666/dsh-client-ui-activity-heatmap/settings-card.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@linxin666/dsh-client-ui-activity-heatmap";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var settings_card_module_css_default = {
			"actions": "ZloSUq_actions",
			"body": "ZloSUq_body",
			"card": "ZloSUq_card",
			"chev": "ZloSUq_chev",
			"chevOpen": "ZloSUq_chevOpen",
			"desc": "ZloSUq_desc",
			"discard": "ZloSUq_discard",
			"failed": "ZloSUq_failed",
			"headText": "ZloSUq_headText",
			"header": "ZloSUq_header",
			"name": "ZloSUq_name",
			"note": "ZloSUq_note",
			"save": "ZloSUq_save"
		};
		//#endregion
		//#region src/client/PluginSettingsCard.tsx
		function PluginSettingsCard(props) {
			const [open, setOpen] = (0, react.useState)(false);
			const { state } = props;
			if (!state.available) return null;
			if (!state.exposed) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: settings_card_module_css_default.card,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: settings_card_module_css_default.header,
					onClick: () => setOpen(!open),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: settings_card_module_css_default.headText,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: settings_card_module_css_default.name,
							children: props.title
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: settings_card_module_css_default.desc,
							children: props.description
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: open ? settings_card_module_css_default.chevOpen : settings_card_module_css_default.chev,
						children: "▾"
					})]
				}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: settings_card_module_css_default.body,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: settings_card_module_css_default.note,
						children: "当前 DSH 版本未向设置页暴露本插件的配置命名空间，表单不可用。可编辑 ~/.dsh/settings.yaml 直接配置。"
					})
				}) : null]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: settings_card_module_css_default.card,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: settings_card_module_css_default.header,
					onClick: () => setOpen(!open),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: settings_card_module_css_default.headText,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: settings_card_module_css_default.name,
							children: props.title
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: settings_card_module_css_default.desc,
							children: props.description
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: open ? settings_card_module_css_default.chevOpen : settings_card_module_css_default.chev,
						children: "▾"
					})]
				}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: settings_card_module_css_default.body,
					children: [
						props.children,
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: settings_card_module_css_default.actions,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: settings_card_module_css_default.save,
								disabled: !state.dirty || state.invalid || state.saving,
								onClick: props.onSave,
								children: state.saving ? "..." : "保存"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: settings_card_module_css_default.discard,
								disabled: !state.dirty || state.saving,
								onClick: props.onDiscard,
								children: "放弃修改"
							})]
						}),
						state.failed ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: settings_card_module_css_default.failed,
							children: "保存失败。"
						}) : null
					]
				}) : null]
			});
		}
		//#endregion
		//#region src/client/settings-form.ts
		function booleanField(field) {
			return {
				field,
				format: (v) => typeof v === "boolean" ? String(v) : "",
				parse: (t) => t === "true" ? {
					kind: "set",
					value: true
				} : t === "false" ? {
					kind: "set",
					value: false
				} : void 0
			};
		}
		function stringField(field, valid) {
			return {
				field,
				format: (v) => typeof v === "string" ? v : "",
				parse: (t) => {
					const s = t.trim();
					if (s === "") return { kind: "clear" };
					if (valid && !valid(s)) return void 0;
					return {
						kind: "set",
						value: s
					};
				}
			};
		}
		function numberField(field) {
			return {
				field,
				format: (v) => typeof v === "number" ? String(v) : "",
				parse: (t) => {
					const s = t.trim();
					if (s === "") return { kind: "clear" };
					const n = Number(s);
					return Number.isFinite(n) ? {
						kind: "set",
						value: n
					} : void 0;
				}
			};
		}
		var CardForm = class {
			scope;
			specs;
			staged = /* @__PURE__ */ new Map();
			listeners = /* @__PURE__ */ new Set();
			saving = false;
			failed = false;
			constructor(scope, specs) {
				this.scope = scope;
				this.specs = new Map(specs.map((s) => [s.field, s]));
				scope.subscribe(() => this.publish());
			}
			bind(project) {
				const store = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(project());
				this.listeners.add(() => store.set(project()));
				return store;
			}
			shell() {
				const snap = this.scope.getSnapshot();
				const plan = this.plan();
				return {
					available: snap.status !== "loading",
					exposed: snap.status === "ready",
					writable: snap.writable,
					dirty: plan.length > 0,
					invalid: plan.some((p) => p.run === void 0),
					saving: this.saving,
					failed: this.failed
				};
			}
			field(field) {
				const spec = this.specs.get(field);
				const staged = this.staged.get(field);
				if (!staged) return {
					text: spec.format(this.scope.getSnapshot().value?.[field]),
					overridden: !!(this.scope.getSnapshot().user && Object.hasOwn(this.scope.getSnapshot().user, field)),
					invalid: false
				};
				const write = staged.clear ? { kind: "clear" } : spec.parse(staged.text);
				return {
					text: staged.text,
					overridden: write?.kind === "set",
					invalid: write === void 0
				};
			}
			actions() {
				return {
					edit: (f, t) => {
						this.staged.set(f, {
							text: t,
							clear: false
						});
						this.failed = false;
						this.publish();
					},
					resetField: (f) => {
						const spec = this.specs.get(f);
						const base = this.scope.getSnapshot().base?.[f];
						this.staged.set(f, {
							text: spec.format(base),
							clear: true
						});
						this.failed = false;
						this.publish();
					},
					save: () => {
						this.save();
					},
					discard: () => {
						this.staged.clear();
						this.failed = false;
						this.publish();
					}
				};
			}
			async save() {
				const plan = this.plan();
				const writes = plan.flatMap((p) => p.run ? [p.run] : []);
				if (plan.length === 0 || this.saving || writes.length !== plan.length) return;
				this.saving = true;
				this.failed = false;
				this.publish();
				let ok = true;
				for (const w of writes) ok = await w() && ok;
				if (ok) this.staged.clear();
				this.saving = false;
				this.failed = !ok;
				this.publish();
			}
			plan() {
				const plan = [];
				const snap = this.scope.getSnapshot();
				const val = snap.value;
				const user = snap.user;
				for (const [field, staged] of this.staged) {
					const spec = this.specs.get(field);
					if (staged.clear) {
						if (user && Object.hasOwn(user, field)) plan.push({
							field,
							run: async () => {
								await this.scope.unset(field);
								return !this.scope.getSnapshot().user?.[field];
							}
						});
						continue;
					}
					if (staged.text === spec.format(val?.[field])) continue;
					const write = spec.parse(staged.text);
					if (!write) plan.push({
						field,
						run: void 0
					});
					else if (write.kind === "clear") plan.push({
						field,
						run: async () => {
							await this.scope.unset(field);
							return !this.scope.getSnapshot().user?.[field];
						}
					});
					else plan.push({
						field,
						run: async () => {
							await this.scope.set(field, write.value);
							return this.scope.getSnapshot().user?.[field] === write.value;
						}
					});
				}
				return plan;
			}
			publish() {
				for (const l of this.listeners) l();
			}
		};
		//#endregion
		//#region src/client/HeatmapSettingsCard.tsx
		var HeatmapSettingsCardController = class {
			form;
			store;
			constructor(scope) {
				this.form = new CardForm(scope, [
					stringField("theme", (v) => v === "blue" || v === "green"),
					booleanField("enabled"),
					booleanField("includeMerges"),
					numberField("usdCnyRate")
				]);
				this.store = this.form.bind(() => ({
					...this.form.shell(),
					theme: this.form.field("theme"),
					enabled: this.form.field("enabled"),
					includeMerges: this.form.field("includeMerges"),
					usdCnyRate: this.form.field("usdCnyRate")
				}));
			}
			inject() {
				return {
					hooks: { heatmapSettingsCard: this.store },
					...this.form.actions()
				};
			}
		};
		function HeatmapSettingsCard(props) {
			const state = props.useHeatmapSettingsCard((s) => s);
			const d = !state.writable;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(PluginSettingsCard, {
				title: "活动热力图",
				description: "侧边栏热力图：主题、显示开关与数据选项",
				state,
				onSave: props.save,
				onDiscard: props.discard,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: 12,
							alignItems: "center",
							fontSize: 12,
							marginBottom: 8
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: {
								opacity: .7,
								minWidth: 50
							},
							children: "主题"
						}), ["blue", "green"].map((t) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 4,
								cursor: "pointer",
								opacity: state.theme.text === t || !state.theme.text && t === "blue" ? 1 : .5
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "radio",
									name: "heatmap-theme",
									value: t,
									checked: state.theme.text === t || !state.theme.text && t === "blue",
									disabled: d,
									onChange: () => props.edit("theme", t)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: {
									width: 12,
									height: 12,
									borderRadius: "50%",
									background: t === "blue" ? "#3182bd" : "#40c463",
									display: "inline-block"
								} }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t === "blue" ? "蓝色" : "绿色" })
							]
						}, t))]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: 8,
							fontSize: 12,
							marginBottom: 8
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 4,
								cursor: "pointer"
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: state.enabled.text === "true" || !state.enabled.text,
								disabled: d,
								onChange: () => props.edit("enabled", state.enabled.text === "true" ? "false" : "true")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "启用" })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 4,
								cursor: "pointer",
								marginLeft: 12
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: state.includeMerges.text === "true",
								disabled: d,
								onChange: () => props.edit("includeMerges", state.includeMerges.text === "true" ? "false" : "true")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "计入合并提交" })]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: 8,
							fontSize: 12,
							alignItems: "center"
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: { opacity: .7 },
							children: "USD→CNY 汇率（0=关闭）"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "number",
							style: {
								width: 60,
								padding: "2px 6px",
								fontSize: 11,
								border: "1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.3))",
								borderRadius: 4,
								background: "var(--dsw-alias-bg-layer-2, transparent)",
								color: "var(--dsw-alias-label-primary, inherit)"
							},
							value: state.usdCnyRate.text,
							disabled: d,
							onChange: (e) => props.edit("usdCnyRate", e.target.value),
							placeholder: "0"
						})]
					})
				]
			});
		}
		//#endregion
		//#region src/client/index.ts
		const HEATMAP_NS = "activity-heatmap";
		const inject = ["slots", "settingsScope"];
		function apply(ctx) {
			const scope = ctx.settingsScope.bind({ namespace: HEATMAP_NS });
			const ctrl = new HeatmapSettingsCardController(scope);
			ctx.slots.inject("settings.plugin.item", () => ctx.slots.register({
				name: "settings.plugin.item",
				id: "activity-heatmap",
				order: 120,
				inject: () => ctrl.inject()
			}, HeatmapSettingsCard));
			ctx.effect(() => {
				const snap = scope.getSnapshot();
				const panel = new HeatmapPanel(snap.status === "ready" && snap.value?.theme || "blue");
				let disposer;
				try {
					disposer = mountSidebarPanel(panel);
					panel.start();
					const unsub = scope.subscribe(() => {
						const s = scope.getSnapshot();
						panel.setTheme(s.status === "ready" && s.value?.theme || "blue");
					});
					return () => {
						unsub();
						disposer?.();
						panel.dispose();
					};
				} catch (error) {
					ctx.logger.warn("[dsh-activity-heatmap] " + String(error));
					panel.dispose();
					return () => {
						disposer?.();
					};
				}
			}, "activity-heatmap: sidebar panel");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map