import { installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "@deepseek-ai/schemastery";
import { stat } from "node:fs/promises";
//#region src/host/routes.ts
/** Error when the stats service itself fails. */
const SCAN_ERROR = {
	code: "internal",
	message: "stats scan failed"
};
/**
* Register the stats route (GET /activity-heatmap/stats).
* @param ctx - context carrying the webServer service.
* @param stats - the stats service backing the endpoint.
* @returns route disposers.
*/
function registerStatsRoutes(ctx, stats) {
	const handler = async (req, res) => {
		const url = new URL(req.url ?? "/", "http://x");
		if (req.method !== "GET" || url.pathname !== "/activity-heatmap/stats") {
			res.writeHead(405);
			res.end();
			return;
		}
		try {
			const payload = await stats.snapshot();
			res.writeHead(200, {
				"content-type": "application/json; charset=utf-8",
				"cache-control": "no-store"
			});
			res.end(JSON.stringify({
				ok: true,
				value: payload
			}));
		} catch (error) {
			ctx.logger.warn("[dsh-activity-heatmap] stats snapshot failed: " + String(error));
			res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
			res.end(JSON.stringify({
				ok: false,
				error: SCAN_ERROR
			}));
		}
	};
	const dispose = ctx.webServer.register({
		kind: "exact",
		path: "/activity-heatmap/stats",
		handler
	});
	return () => {
		dispose();
	};
}
//#endregion
//#region src/core/pricing.ts
/** Fallback price applied to models absent from the table. */
const DEFAULT_PRICE = {
	inputPerM: .27,
	cacheReadPerM: .07,
	cacheWritePerM: 0,
	outputPerM: 1.1
};
/** Built-in price rows for the models DSH commonly routes to.
* Rates follow the xiufengsun/TokenTracker curated price overrides
* (verified against vendor pages 2026-06/07) plus vendor list pages.
* Units: USD per 1M tokens. */
const DEFAULT_MODEL_PRICES = {
	"deepseek-v4-flash": {
		inputPerM: .14,
		cacheReadPerM: .0028,
		cacheWritePerM: .14,
		outputPerM: .28
	},
	"deepseek-v4-pro": {
		inputPerM: .435,
		cacheReadPerM: .003625,
		cacheWritePerM: .435,
		outputPerM: .87
	},
	"deepseek-chat": {
		inputPerM: .14,
		cacheReadPerM: .0028,
		cacheWritePerM: .14,
		outputPerM: .28
	},
	"deepseek-v3": {
		inputPerM: .27,
		cacheReadPerM: .07,
		cacheWritePerM: 0,
		outputPerM: 1.1
	},
	"deepseek-v3.1": {
		inputPerM: .56,
		cacheReadPerM: .056,
		cacheWritePerM: 0,
		outputPerM: 1.68
	},
	"deepseek-v3.2": {
		inputPerM: .28,
		cacheReadPerM: .028,
		cacheWritePerM: 0,
		outputPerM: .42
	},
	"deepseek-v3.2-expensive": {
		inputPerM: .56,
		cacheReadPerM: .056,
		cacheWritePerM: 0,
		outputPerM: 1.68
	},
	"deepseek-reasoner": {
		inputPerM: .14,
		cacheReadPerM: .0028,
		cacheWritePerM: .14,
		outputPerM: .28
	},
	"deepseek-r1": {
		inputPerM: .55,
		cacheReadPerM: .14,
		cacheWritePerM: 0,
		outputPerM: 2.19
	},
	"claude-3-haiku": {
		inputPerM: .25,
		cacheReadPerM: .025,
		cacheWritePerM: .3,
		outputPerM: 1.25
	},
	"claude-3-5-haiku": {
		inputPerM: .8,
		cacheReadPerM: .08,
		cacheWritePerM: 1,
		outputPerM: 4
	},
	"claude-3-5-sonnet": {
		inputPerM: 3,
		cacheReadPerM: .3,
		cacheWritePerM: 3.75,
		outputPerM: 15
	},
	"claude-3-7-sonnet": {
		inputPerM: 3,
		cacheReadPerM: .3,
		cacheWritePerM: 3.75,
		outputPerM: 15
	},
	"claude-3-opus": {
		inputPerM: 15,
		cacheReadPerM: 1.5,
		cacheWritePerM: 18.75,
		outputPerM: 75
	},
	"claude-sonnet-4": {
		inputPerM: 3,
		cacheReadPerM: .3,
		cacheWritePerM: 3.75,
		outputPerM: 15
	},
	"claude-sonnet-4-5": {
		inputPerM: 3,
		cacheReadPerM: .3,
		cacheWritePerM: 3.75,
		outputPerM: 15
	},
	"claude-opus-4": {
		inputPerM: 15,
		cacheReadPerM: 1.5,
		cacheWritePerM: 18.75,
		outputPerM: 75
	},
	"claude-opus-4-1": {
		inputPerM: 15,
		cacheReadPerM: 1.5,
		cacheWritePerM: 18.75,
		outputPerM: 75
	},
	"claude-opus-4-8": {
		inputPerM: 5,
		cacheReadPerM: .5,
		cacheWritePerM: 6.25,
		outputPerM: 25
	},
	"claude-opus-5": {
		inputPerM: 5,
		cacheReadPerM: .5,
		cacheWritePerM: 6.25,
		outputPerM: 25
	},
	"claude-opus-5-fast": {
		inputPerM: 10,
		cacheReadPerM: 1,
		cacheWritePerM: 12.5,
		outputPerM: 50
	},
	"claude-sonnet-5": {
		inputPerM: 3,
		cacheReadPerM: .3,
		cacheWritePerM: 3.75,
		outputPerM: 15
	},
	"claude-fable-5": {
		inputPerM: 10,
		cacheReadPerM: 1,
		cacheWritePerM: 12.5,
		outputPerM: 50
	},
	"claude-haiku-4-5": {
		inputPerM: 1,
		cacheReadPerM: .1,
		cacheWritePerM: 1.25,
		outputPerM: 5
	},
	"gpt-4o": {
		inputPerM: 2.5,
		cacheReadPerM: 1.25,
		cacheWritePerM: 0,
		outputPerM: 10
	},
	"gpt-4o-mini": {
		inputPerM: .15,
		cacheReadPerM: .075,
		cacheWritePerM: 0,
		outputPerM: .6
	},
	"gpt-4.1": {
		inputPerM: 2,
		cacheReadPerM: .5,
		cacheWritePerM: 0,
		outputPerM: 8
	},
	"gpt-4.1-mini": {
		inputPerM: .4,
		cacheReadPerM: .1,
		cacheWritePerM: 0,
		outputPerM: 1.6
	},
	"gpt-4.1-nano": {
		inputPerM: .1,
		cacheReadPerM: .025,
		cacheWritePerM: 0,
		outputPerM: .4
	},
	"gpt-4.5": {
		inputPerM: 75,
		cacheReadPerM: 37.5,
		cacheWritePerM: 0,
		outputPerM: 150
	},
	"o3": {
		inputPerM: 2,
		cacheReadPerM: .5,
		cacheWritePerM: 0,
		outputPerM: 8
	},
	"o3-mini": {
		inputPerM: 1.1,
		cacheReadPerM: .275,
		cacheWritePerM: 0,
		outputPerM: 4.4
	},
	"o4-mini": {
		inputPerM: 1.1,
		cacheReadPerM: .275,
		cacheWritePerM: 0,
		outputPerM: 4.4
	},
	"gpt-5": {
		inputPerM: 1.25,
		cacheReadPerM: .125,
		cacheWritePerM: 0,
		outputPerM: 10
	},
	"gpt-5-mini": {
		inputPerM: .25,
		cacheReadPerM: .025,
		cacheWritePerM: 0,
		outputPerM: 2
	},
	"gpt-5-nano": {
		inputPerM: .05,
		cacheReadPerM: .005,
		cacheWritePerM: 0,
		outputPerM: .4
	},
	"gpt-5.1": {
		inputPerM: 1.25,
		cacheReadPerM: .125,
		cacheWritePerM: 0,
		outputPerM: 10
	},
	"gpt-5.1-mini": {
		inputPerM: .25,
		cacheReadPerM: .025,
		cacheWritePerM: 0,
		outputPerM: 2
	},
	"gpt-5.1-nano": {
		inputPerM: .05,
		cacheReadPerM: .005,
		cacheWritePerM: 0,
		outputPerM: .4
	},
	"gpt-5.6-sol": {
		inputPerM: 5,
		cacheReadPerM: .5,
		cacheWritePerM: 6.25,
		outputPerM: 30
	},
	"gpt-5.6-terra": {
		inputPerM: 2,
		cacheReadPerM: .2,
		cacheWritePerM: 2.5,
		outputPerM: 12
	},
	"gpt-5.6-luna": {
		inputPerM: .2,
		cacheReadPerM: .02,
		cacheWritePerM: .25,
		outputPerM: 1.2
	},
	"gemini-2.0-flash": {
		inputPerM: .1,
		cacheReadPerM: .025,
		cacheWritePerM: 0,
		outputPerM: .4
	},
	"gemini-2.0-flash-lite": {
		inputPerM: .075,
		cacheReadPerM: .01875,
		cacheWritePerM: 0,
		outputPerM: .3
	},
	"gemini-2.5-flash": {
		inputPerM: .3,
		cacheReadPerM: .075,
		cacheWritePerM: 0,
		outputPerM: 2.5
	},
	"gemini-2.5-flash-lite": {
		inputPerM: .1,
		cacheReadPerM: .025,
		cacheWritePerM: 0,
		outputPerM: .4
	},
	"gemini-2.5-pro": {
		inputPerM: 1.25,
		cacheReadPerM: .3125,
		cacheWritePerM: 0,
		outputPerM: 10
	},
	"gemini-3-pro-preview": {
		inputPerM: 2,
		cacheReadPerM: .5,
		cacheWritePerM: 0,
		outputPerM: 12
	},
	"gemini-3-flash-preview": {
		inputPerM: .3,
		cacheReadPerM: .075,
		cacheWritePerM: 0,
		outputPerM: 2.5
	},
	"gemini-3-flash-lite-preview": {
		inputPerM: .1,
		cacheReadPerM: .025,
		cacheWritePerM: 0,
		outputPerM: .4
	},
	"grok-3": {
		inputPerM: 3,
		cacheReadPerM: .3,
		cacheWritePerM: 0,
		outputPerM: 15
	},
	"grok-3-mini": {
		inputPerM: .3,
		cacheReadPerM: .03,
		cacheWritePerM: 0,
		outputPerM: .5
	},
	"grok-4": {
		inputPerM: 3,
		cacheReadPerM: .75,
		cacheWritePerM: 0,
		outputPerM: 15
	},
	"grok-4-latest": {
		inputPerM: 3,
		cacheReadPerM: .75,
		cacheWritePerM: 0,
		outputPerM: 15
	},
	"grok-4-0709": {
		inputPerM: 3,
		cacheReadPerM: .75,
		cacheWritePerM: 0,
		outputPerM: 15
	},
	"grok-4-fast": {
		inputPerM: .2,
		cacheReadPerM: .05,
		cacheWritePerM: 0,
		outputPerM: .5
	},
	"grok-4-fast-reasoning": {
		inputPerM: .2,
		cacheReadPerM: .05,
		cacheWritePerM: 0,
		outputPerM: .5
	},
	"grok-4-fast-non-reasoning": {
		inputPerM: .2,
		cacheReadPerM: .05,
		cacheWritePerM: 0,
		outputPerM: .5
	},
	"grok-4-1-fast-non-reasoning": {
		inputPerM: .2,
		cacheReadPerM: .05,
		cacheWritePerM: 0,
		outputPerM: .5
	},
	"grok-4.5": {
		inputPerM: 2,
		cacheReadPerM: .5,
		cacheWritePerM: 0,
		outputPerM: 6
	},
	"grok-4.5-fast": {
		inputPerM: 4,
		cacheReadPerM: 1,
		cacheWritePerM: 0,
		outputPerM: 18
	},
	"grok-build": {
		inputPerM: 1.25,
		cacheReadPerM: .2,
		cacheWritePerM: 0,
		outputPerM: 2.5
	},
	"grok-4.5-build": {
		inputPerM: 2,
		cacheReadPerM: .5,
		cacheWritePerM: 0,
		outputPerM: 6
	},
	"grok-build-free": {
		inputPerM: 0,
		cacheReadPerM: 0,
		cacheWritePerM: 0,
		outputPerM: 0
	},
	"grok-4.5-build-free": {
		inputPerM: 0,
		cacheReadPerM: 0,
		cacheWritePerM: 0,
		outputPerM: 0
	},
	"grok-code-fast": {
		inputPerM: .2,
		cacheReadPerM: .05,
		cacheWritePerM: 0,
		outputPerM: .5
	},
	"grok-code-reasoner": {
		inputPerM: 3,
		cacheReadPerM: .75,
		cacheWritePerM: 0,
		outputPerM: 15
	},
	"kiro-agent": {
		inputPerM: 3,
		cacheReadPerM: .3,
		cacheWritePerM: 3.75,
		outputPerM: 15
	},
	"kiro-cli-agent": {
		inputPerM: 3,
		cacheReadPerM: .3,
		cacheWritePerM: 3.75,
		outputPerM: 15
	},
	"qwen3-max": {
		inputPerM: 1.28,
		cacheReadPerM: .16,
		cacheWritePerM: 0,
		outputPerM: 6.4
	},
	"qwen3-coder": {
		inputPerM: .22,
		cacheReadPerM: .0275,
		cacheWritePerM: 0,
		outputPerM: .88
	},
	"qwen3-235b-a22b": {
		inputPerM: .9,
		cacheReadPerM: .1125,
		cacheWritePerM: 0,
		outputPerM: 3.6
	},
	"qwen3-32b": {
		inputPerM: .14,
		cacheReadPerM: .0175,
		cacheWritePerM: 0,
		outputPerM: .56
	},
	"glm-4.5": {
		inputPerM: .6,
		cacheReadPerM: .11,
		cacheWritePerM: 0,
		outputPerM: 2.2
	},
	"glm-4.5-air": {
		inputPerM: .2,
		cacheReadPerM: .03,
		cacheWritePerM: 0,
		outputPerM: 1.1
	},
	"glm-4.5-airx": {
		inputPerM: 1.1,
		cacheReadPerM: .22,
		cacheWritePerM: 0,
		outputPerM: 4.5
	},
	"glm-4.5-x": {
		inputPerM: 2.2,
		cacheReadPerM: .45,
		cacheWritePerM: 0,
		outputPerM: 8.9
	},
	"glm-4.6": {
		inputPerM: .6,
		cacheReadPerM: .11,
		cacheWritePerM: 0,
		outputPerM: 2.2
	},
	"glm-4.6-air": {
		inputPerM: .2,
		cacheReadPerM: .025,
		cacheWritePerM: 0,
		outputPerM: .6
	},
	"glm-4.7": {
		inputPerM: .6,
		cacheReadPerM: .11,
		cacheWritePerM: 0,
		outputPerM: 2.2
	},
	"glm-4.7-flash": {
		inputPerM: 0,
		cacheReadPerM: 0,
		cacheWritePerM: 0,
		outputPerM: 0
	},
	"glm-4.7-flashx": {
		inputPerM: .07,
		cacheReadPerM: .01,
		cacheWritePerM: 0,
		outputPerM: .4
	},
	"glm-4.7-free": {
		inputPerM: 0,
		cacheReadPerM: 0,
		cacheWritePerM: 0,
		outputPerM: 0
	},
	"glm-4.5-flash": {
		inputPerM: 0,
		cacheReadPerM: 0,
		cacheWritePerM: 0,
		outputPerM: 0
	},
	"glm-5": {
		inputPerM: 1,
		cacheReadPerM: .2,
		cacheWritePerM: 0,
		outputPerM: 3.2
	},
	"glm-5-turbo": {
		inputPerM: 1.2,
		cacheReadPerM: .24,
		cacheWritePerM: 0,
		outputPerM: 4
	},
	"glm-5.1": {
		inputPerM: 1.4,
		cacheReadPerM: .26,
		cacheWritePerM: 0,
		outputPerM: 4.4
	},
	"glm-5.2": {
		inputPerM: 1.4,
		cacheReadPerM: .26,
		cacheWritePerM: 0,
		outputPerM: 4.4
	},
	"kimi-k2": {
		inputPerM: .6,
		cacheReadPerM: .15,
		cacheWritePerM: 0,
		outputPerM: 2
	},
	"kimi-k2-thinking": {
		inputPerM: .6,
		cacheReadPerM: .15,
		cacheWritePerM: 0,
		outputPerM: 2
	},
	"kimi-k2.5": {
		inputPerM: .6,
		cacheReadPerM: .15,
		cacheWritePerM: 0,
		outputPerM: 2
	},
	"kimi-k2.5-free": {
		inputPerM: 0,
		cacheReadPerM: 0,
		cacheWritePerM: 0,
		outputPerM: 0
	},
	"kimi-k2.6": {
		inputPerM: .95,
		cacheReadPerM: .16,
		cacheWritePerM: 0,
		outputPerM: 4
	},
	"kimi-k2.7-code": {
		inputPerM: .95,
		cacheReadPerM: .19,
		cacheWritePerM: 0,
		outputPerM: 4
	},
	"kimi-k3": {
		inputPerM: 3,
		cacheReadPerM: .3,
		cacheWritePerM: 0,
		outputPerM: 15
	},
	"k3": {
		inputPerM: 3,
		cacheReadPerM: .3,
		cacheWritePerM: 0,
		outputPerM: 15
	},
	"kimi-for-coding": {
		inputPerM: .6,
		cacheReadPerM: .15,
		cacheWritePerM: 0,
		outputPerM: 2
	},
	"minimax-m1": {
		inputPerM: .2,
		cacheReadPerM: .025,
		cacheWritePerM: 0,
		outputPerM: 1.1
	},
	"minimax-m2": {
		inputPerM: .3,
		cacheReadPerM: .0375,
		cacheWritePerM: 0,
		outputPerM: 1.2
	},
	"minimax-m2.1": {
		inputPerM: .5,
		cacheReadPerM: .05,
		cacheWritePerM: 0,
		outputPerM: 3
	},
	"minimax-m2.1-free": {
		inputPerM: 0,
		cacheReadPerM: 0,
		cacheWritePerM: 0,
		outputPerM: 0
	},
	"minimax-m2.7": {
		inputPerM: .3,
		cacheReadPerM: .06,
		cacheWritePerM: .375,
		outputPerM: 1.2
	},
	"minimax-m2.7-highspeed": {
		inputPerM: .6,
		cacheReadPerM: .06,
		cacheWritePerM: .375,
		outputPerM: 2.4
	},
	"minimax-m3": {
		inputPerM: .3,
		cacheReadPerM: .06,
		cacheWritePerM: 0,
		outputPerM: 1.2
	},
	"mimo-v2-pro-free": {
		inputPerM: 0,
		cacheReadPerM: 0,
		cacheWritePerM: 0,
		outputPerM: 0
	},
	"nemotron-3-super-free": {
		inputPerM: 0,
		cacheReadPerM: 0,
		cacheWritePerM: 0,
		outputPerM: 0
	},
	"hy3": {
		inputPerM: .167,
		cacheReadPerM: .056,
		cacheWritePerM: .167,
		outputPerM: .556
	},
	"hy3-preview": {
		inputPerM: .167,
		cacheReadPerM: .056,
		cacheWritePerM: .167,
		outputPerM: .556
	},
	"hy3-preview-agent": {
		inputPerM: .167,
		cacheReadPerM: .056,
		cacheWritePerM: .167,
		outputPerM: .556
	},
	"composer-1": {
		inputPerM: 1.25,
		cacheReadPerM: .125,
		cacheWritePerM: 0,
		outputPerM: 10
	},
	"composer-1.5": {
		inputPerM: 3.5,
		cacheReadPerM: .35,
		cacheWritePerM: 0,
		outputPerM: 17.5
	},
	"composer-2": {
		inputPerM: .5,
		cacheReadPerM: .2,
		cacheWritePerM: 0,
		outputPerM: 2.5
	},
	"composer-2-fast": {
		inputPerM: 1.5,
		cacheReadPerM: .15,
		cacheWritePerM: 0,
		outputPerM: 7.5
	},
	"antigravity-gpt-oss-120b": {
		inputPerM: 2.5,
		cacheReadPerM: 0,
		cacheWritePerM: 0,
		outputPerM: 10
	},
	"sakana/fugu-ultra": {
		inputPerM: 5,
		cacheReadPerM: .5,
		cacheWritePerM: 5,
		outputPerM: 30
	},
	"longcat-2.0": {
		inputPerM: .278,
		cacheReadPerM: .00556,
		cacheWritePerM: .278,
		outputPerM: 1.111
	},
	"step-3.5-flash": {
		inputPerM: .1,
		cacheReadPerM: .02,
		cacheWritePerM: .1,
		outputPerM: .3
	},
	"step-3.7-flash": {
		inputPerM: .2,
		cacheReadPerM: .04,
		cacheWritePerM: .2,
		outputPerM: 1.15
	}
};
/**
* Resolve a table row for a model id: exact match first, then the longest
* built-in key that is a `-`-delimited prefix of the id (dated snapshots),
* then the default row. Overrides win over built-ins at every stage.
* @param model - the model id from a request header.
* @param overrides - user price overrides (may be partial rows).
* @param table - the built-in table to search.
*/
function priceFor(model, overrides, table = DEFAULT_MODEL_PRICES) {
	const resolved = resolveRow(model, overrides, table);
	return {
		inputPerM: resolved.inputPerM,
		cacheReadPerM: resolved.cacheReadPerM,
		cacheWritePerM: resolved.cacheWritePerM,
		outputPerM: resolved.outputPerM
	};
}
/** Locate the effective (override-merged) row for a model id. */
function resolveRow(model, overrides, table) {
	const exactOverride = overrides?.[model];
	if (exactOverride !== void 0) return mergeOverride(model, exactOverride, table);
	if (table[model] !== void 0) return table[model];
	const best = {
		key: "",
		len: -1,
		override: false
	};
	for (const key of Object.keys(overrides ?? {})) if (key.length > best.len && isPrefix(key, model)) {
		best.key = key;
		best.len = key.length;
		best.override = true;
	}
	if (best.override) return mergeOverride(best.key, overrides[best.key], table);
	for (const key of Object.keys(table)) if (key.length > best.len && isPrefix(key, model)) {
		best.key = key;
		best.len = key.length;
		best.override = false;
	}
	if (best.len >= 0) return table[best.key];
	return DEFAULT_PRICE;
}
/** Whether `prefix` is a `-`-delimited prefix of `model`. */
function isPrefix(prefix, model) {
	return model.length > prefix.length && model.startsWith(prefix) && model[prefix.length] === "-";
}
/** Merge a (possibly partial) override row over the built-in/default row. */
function mergeOverride(key, override, table) {
	const base = table[key] ?? DEFAULT_PRICE;
	return {
		inputPerM: override.inputPerM ?? base.inputPerM,
		cacheReadPerM: override.cacheReadPerM ?? base.cacheReadPerM,
		cacheWritePerM: override.cacheWritePerM ?? base.cacheWritePerM,
		outputPerM: override.outputPerM ?? base.outputPerM
	};
}
/** Compute the USD cost of one usage observation under one price row. */
function costUsd(usage, price) {
	return (usage.inputTokens * price.inputPerM + usage.cacheReadTokens * price.cacheReadPerM + usage.cacheWriteTokens * price.cacheWritePerM + usage.outputTokens * price.outputPerM) / 1e6;
}
/** Billed token total for one observation (all four components). */
function billedTokens(usage) {
	return usage.inputTokens + usage.cacheReadTokens + usage.cacheWriteTokens + usage.outputTokens;
}
/**
* Merge user price overrides into a complete table. Overrides may be partial
* ({@link HeatmapConfig.priceOverrides} shape); missing fields fall through to
* the built-in row or the default row. Unknown override keys are added as
* full rows.
*/
function resolvePriceTable(overrides) {
	const table = {};
	const keys = /* @__PURE__ */ new Set([...Object.keys(DEFAULT_MODEL_PRICES), ...Object.keys(overrides ?? {})]);
	for (const model of keys) table[model] = resolveRow(model, overrides, DEFAULT_MODEL_PRICES);
	return table;
}
//#endregion
//#region src/core/aggregate.ts
const UNKNOWN_MODEL = "unknown";
/** Local calendar-day key for an epoch-ms timestamp ('YYYY-MM-DD'). */
function dateKey(time) {
	const d = new Date(time);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
/**
* Fold one session's durable events into usage samples.
*
* Provider usage rides `assistant/message` events; the model for each sample
* is the nearest preceding `request/header` (every step logs one) or
* `request/context`. A repeated usage for the same turn/step replaces the
* earlier sample (retry semantics) instead of double counting.
* @param events - the session's durable events in seq order.
* @returns usage samples in first-seen turn/step order.
*/
function foldSessionUsages(events) {
	let model = UNKNOWN_MODEL;
	const latest = /* @__PURE__ */ new Map();
	for (const event of events) switch (event.type) {
		case "request/header": {
			const config = event.data.header?.config;
			if (config !== void 0 && typeof config.model === "string" && config.model !== "") model = config.model;
			break;
		}
		case "request/context":
			if (typeof event.data.model === "string" && event.data.model !== "") model = event.data.model;
			break;
		case "assistant/message": {
			const usage = event.data.usage;
			if (usage === void 0) break;
			const key = `${event.data.turn}:${event.data.step}`;
			latest.set(key, {
				time: event.time,
				inputTokens: usage.inputTokens ?? 0,
				cacheReadTokens: usage.cacheReadTokens ?? 0,
				cacheWriteTokens: usage.cacheWriteTokens ?? 0,
				outputTokens: usage.outputTokens ?? 0,
				model
			});
			break;
		}
		default: break;
	}
	return [...latest.values()];
}
/** Merge one usage sample into a day bucket. */
function mergeSample(day, sample, price) {
	day.inputTokens += sample.inputTokens;
	day.cacheReadTokens += sample.cacheReadTokens;
	day.cacheWriteTokens += sample.cacheWriteTokens;
	day.outputTokens += sample.outputTokens;
	const usd = costUsd(sample, price);
	day.modelCostUsd[sample.model] = (day.modelCostUsd[sample.model] ?? 0) + usd;
}
/**
* Build a 365-day (or custom-length) bucket array aligned to the local
* calendar, oldest first, ending today. Buckets are fresh zeroed rows; the
* caller folds samples and commits into them.
* @param dayCount - number of days to cover (default 365).
* @param now - anchor timestamp (defaults to Date.now()).
*/
function emptyBuckets(dayCount, now = Date.now()) {
	const today = new Date(now);
	today.setHours(0, 0, 0, 0);
	const days = [];
	for (let i = dayCount - 1; i >= 0; i -= 1) {
		const d = new Date(today);
		d.setDate(today.getDate() - i);
		days.push({
			date: dateKey(d.getTime()),
			inputTokens: 0,
			cacheReadTokens: 0,
			cacheWriteTokens: 0,
			outputTokens: 0,
			commits: 0,
			modelCostUsd: {}
		});
	}
	return days;
}
/** Index a bucket array by its date key. */
function indexBuckets(days) {
	return new Map(days.map((day) => [day.date, day]));
}
/** Fold all usage samples into the aligned buckets (in place). */
function foldSamplesInto(days, samples, table) {
	const index = indexBuckets(days);
	for (const sample of samples) {
		const day = index.get(dateKey(sample.time));
		if (day === void 0) continue;
		mergeSample(day, sample, table[sample.model] ?? priceFor(sample.model, void 0));
	}
}
/**
* Parse `git log --date=short --pretty=format:%ad` output into date keys.
* Non-date lines (warnings, empty lines) are ignored.
*/
function parseGitLogDates(output) {
	const dates = [];
	for (const line of output.split(/\r?\n/)) if (/^\d{4}-\d{2}-\d{2}$/.test(line)) dates.push(line);
	return dates;
}
/** Fold parsed commit dates into the aligned buckets (in place). */
function foldCommitsInto(days, dates) {
	const index = indexBuckets(days);
	for (const date of dates) {
		const day = index.get(date);
		if (day !== void 0) day.commits += 1;
	}
}
/**
* Build the today summary directly from today's usage samples, keeping the
* per-model token split accurate.
* @param samples - usage samples whose dateKey equals today.
* @param table - resolved price table.
* @param now - anchor timestamp.
*/
function buildTodayFromSamples(samples, table, now = Date.now()) {
	const today = dateKey(now);
	const perModel = /* @__PURE__ */ new Map();
	let input = 0;
	let output = 0;
	let cacheRead = 0;
	let cacheWrite = 0;
	for (const sample of samples) {
		if (dateKey(sample.time) !== today) continue;
		input += sample.inputTokens;
		output += sample.outputTokens;
		cacheRead += sample.cacheReadTokens;
		cacheWrite += sample.cacheWriteTokens;
		const row = perModel.get(sample.model) ?? {
			tokens: 0,
			usd: 0,
			input: 0,
			cacheRead: 0,
			cacheWrite: 0,
			output: 0
		};
		row.tokens += billedTokens(sample);
		row.usd += costUsd(sample, table[sample.model] ?? priceFor(sample.model, void 0));
		row.input += sample.inputTokens;
		row.cacheRead += sample.cacheReadTokens;
		row.cacheWrite += sample.cacheWriteTokens;
		row.output += sample.outputTokens;
		perModel.set(sample.model, row);
	}
	const prompt = input + cacheRead + cacheWrite;
	const models = [...perModel.entries()].map(([model, row]) => ({
		model,
		tokens: row.tokens,
		usd: row.usd
	})).sort((a, b) => b.usd - a.usd);
	return {
		tokens: input + output + cacheRead + cacheWrite,
		inputTokens: input,
		outputTokens: output,
		cacheReadTokens: cacheRead,
		cacheWriteTokens: cacheWrite,
		cacheHitRate: prompt > 0 ? cacheRead / prompt : 0,
		costUsd: models.reduce((sum, row) => sum + row.usd, 0),
		models
	};
}
/** Assemble the complete payload from folded buckets and today samples. */
function assemblePayload(days, todaySamples, table, now = Date.now(), cnyRate = 0) {
	return {
		days: days.map((day) => ({
			date: day.date,
			inputTokens: day.inputTokens,
			cacheReadTokens: day.cacheReadTokens,
			cacheWriteTokens: day.cacheWriteTokens,
			outputTokens: day.outputTokens,
			commits: day.commits,
			modelCostUsd: day.modelCostUsd
		})),
		today: buildTodayFromSamples(todaySamples, table, now),
		generatedAt: now,
		dayCount: days.length,
		cnyRate
	};
}
//#endregion
//#region src/host/stats-service.ts
/**
* Host stats service: scans every stored session's durable log for provider
* token usage (assistant/message events with usage, model attribution from
* request/header / request/context), scans the workspaces' git repositories
* for daily commit counts, folds everything into aligned day buckets, and
* serves a TTL-cached snapshot to the browser half.
*
* Reads go through the official `sessionPersistence` service (zstd decoding
* included), git through the managed `subprocess` seam — no direct file
* parsing, no source changes.
* @module dsh-activity-heatmap/host/stats-service
*/
/** Snapshot freshness window; a scan runs at most once per window. */
const TTL_MS = 6e4;
/** Concurrency cap while scanning session logs. */
const SESSION_CONCURRENCY = 4;
/** Days the heatmap covers. */
const WINDOW_DAYS = 365;
/** Git log output cap (a year of short dates is tiny; 1 MiB is generous). */
const GIT_OUTPUT_CAP = 1 << 20;
/** Production git runner over ctx.subprocess. */
function subprocessGitRunner(ctx) {
	return { async run(argv, cwd) {
		const handle = ctx.subprocess.spawn({
			argv: ["git", ...argv],
			cwd,
			stdio: {
				stdin: "ignore",
				stdout: { maxBytes: GIT_OUTPUT_CAP },
				stderr: { maxBytes: GIT_OUTPUT_CAP }
			},
			graceMs: 15e3
		});
		return {
			exitCode: (await handle.done).exitCode,
			stdout: handle.collected.stdout?.readFrom(0).text ?? "",
			stderr: handle.collected.stderr?.readFrom(0).text ?? ""
		};
	} };
}
/**
* The stats service. One instance per plugin application; owns the snapshot
* cache and the incremental scan state.
*/
var StatsService = class {
	persistence;
	git;
	config;
	table;
	cache;
	inflight;
	sessionStates = /* @__PURE__ */ new Map();
	/** Workspace roots discovered from session headers (cwd) plus config extras. */
	repoRoots = /* @__PURE__ */ new Set();
	constructor(ctx, config, git = subprocessGitRunner(ctx)) {
		this.persistence = ctx.sessionPersistence;
		this.config = config;
		this.git = git;
		this.table = () => resolvePriceTable(config().priceOverrides);
	}
	/** Snapshot with TTL caching; concurrent callers share one scan. */
	async snapshot() {
		const cached = this.cache;
		if (cached !== void 0 && Date.now() - cached.at < TTL_MS) return cached.payload;
		if (this.inflight !== void 0) return this.inflight;
		this.inflight = this.scan().then((payload) => {
			this.cache = {
				payload,
				at: Date.now()
			};
			return payload;
		}).finally(() => {
			this.inflight = void 0;
		});
		return this.inflight;
	}
	/** Drop the cache (settings changed); the next snapshot rescans. */
	invalidate() {
		this.cache = void 0;
	}
	/** Full incremental scan: changed sessions re-read, new sessions added, git rescanned. */
	async scan() {
		const now = Date.now();
		const days = emptyBuckets(WINDOW_DAYS, now);
		const samples = await this.scanSessions();
		const table = this.table();
		foldSamplesInto(days, samples, table);
		const roots = await this.collectRepos();
		const commitDates = [];
		const since = dateKey(now - (WINDOW_DAYS - 1) * 864e5);
		for (const root of roots) {
			const argv = [
				"log",
				"--since=" + since + " 00:00:00",
				"--date=short",
				"--pretty=format:%ad"
			];
			if (!(this.config().includeMerges ?? false)) argv.push("--no-merges");
			try {
				const result = await this.git.run(argv, root);
				if (result.exitCode === 0) commitDates.push(...parseGitLogDates(result.stdout));
			} catch {}
		}
		foldCommitsInto(days, commitDates);
		return assemblePayload(days, samples.filter((sample) => dateKey(sample.time) === dateKey(now)), table, now, this.config().usdCnyRate ?? 0);
	}
	/** Re-read only sessions whose durable log changed since the last scan. */
	async scanSessions() {
		const headers = await this.persistence.list();
		const all = [];
		const pending = [];
		for (const header of headers) {
			if (typeof header.cwd === "string" && header.cwd !== "") this.repoRoots.add(header.cwd);
			let signature = "";
			const location = this.persistence.locate(header);
			if (location !== void 0) try {
				const info = await stat(location.path);
				signature = info.size + ":" + info.mtimeMs;
			} catch {}
			const state = this.sessionStates.get(header.id);
			if (state !== void 0 && state.signature === signature) {
				all.push(...state.samples);
				continue;
			}
			pending.push({
				id: header.id,
				signature
			});
		}
		let cursor = 0;
		const workers = Array.from({ length: Math.min(SESSION_CONCURRENCY, Math.max(1, pending.length)) }, async () => {
			while (cursor < pending.length) {
				const item = pending[cursor];
				cursor += 1;
				try {
					const { events } = await this.persistence.readFrom(item.id, 0);
					const samples = foldSessionUsages(events);
					this.sessionStates.set(item.id, {
						signature: item.signature,
						samples
					});
					all.push(...samples);
				} catch (error) {
					logError("session scan failed for " + item.id + ": " + String(error));
				}
			}
		});
		await Promise.all(workers);
		const live = new Set(headers.map((header) => String(header.id)));
		for (const id of [...this.sessionStates.keys()]) if (!live.has(id)) this.sessionStates.delete(id);
		return all;
	}
	/** Repo roots: session cwds (deduped, up to a sane cap) plus configured extras. */
	async collectRepos() {
		const roots = [...this.repoRoots];
		for (const extra of this.config().extraRepos ?? []) if (extra !== "" && !roots.includes(extra)) roots.push(extra);
		return roots.slice(0, 64);
	}
};
/** Log sink (swappable for tests). */
let logError = (message) => console.error("[dsh-activity-heatmap] " + message);
//#endregion
//#region src/index.ts
/** Order of the announcement section within the tool-guidance band. */
const SECTION_ORDER = 215;
/** Model-facing announcement: plugin presence, capabilities, and limits. */
const ACTIVITY_HEATMAP_GUIDANCE = "本机已安装 dsh-activity-heatmap 插件（DSH Web GUI 的左侧栏活动热力图）：常驻面板按日显示近 90 天活动（可切换提交次数 / Token 用量 / 估算花费），面板下方统计块显示今日所有会话的 Token 总量、缓存命中率、按模型自动计算的花费，以及近 90 天汇总。数据来自本机会话日志（provider usage）与工作区 git 日志，宿主进程经 /activity-heatmap/* 路由提供。用户提到「热力图 / 活动统计 / Token 用量 / 缓存命中率 / 花费」时即指本插件，请据此协作。";
const HEATMAP_NS = settingsNamespace("activity-heatmap");
/** Plugin config schema (mirrors HeatmapConfig). */
const Config = z.object({
	enabled: z.boolean().default(true),
	includeMerges: z.boolean().default(false),
	extraRepos: z.array(z.string()).default([]),
	usdCnyRate: z.number().default(0),
	priceOverrides: z.dict(z.any()).default({})
});
const inject = [
	"sessionPersistence",
	"webServer",
	"subprocess",
	"systemPrompt"
];
/**
* Apply the host half.
* @param ctx - context carrying sessionPersistence, webServer, subprocess, systemPrompt.
* @param config - resolved plugin config (schema defaults applied by the loader).
*/
function apply(ctx, config) {
	let current = () => config ?? {};
	const stats = new StatsService(ctx, current);
	registerStatsRoutes(ctx, stats);
	let disposeSection;
	const sync = () => {
		if (disposeSection !== void 0) {
			disposeSection();
			disposeSection = void 0;
		}
		if ((current().enabled ?? true) === false) return;
		disposeSection = ctx.systemPrompt.section({
			name: "plugin:activity-heatmap",
			order: SECTION_ORDER,
			text: ACTIVITY_HEATMAP_GUIDANCE
		});
		stats.invalidate();
	};
	installSettingsSection(ctx, HEATMAP_NS, Config, config ?? {}, {
		setSource: (source) => {
			current = source;
		},
		onChange: sync
	});
	sync();
}
//#endregion
export { ACTIVITY_HEATMAP_GUIDANCE, Config, apply, inject };
