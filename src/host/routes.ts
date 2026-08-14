/**
 * /activity-heatmap/* HTTP layer: one GET stats endpoint served on the shared
 * webserver (same-origin with the GUI). The route layer owns HTTP shape only;
 * the StatsService owns scanning and caching.
 * @module dsh-activity-heatmap/host/routes
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type { HeatmapPayload, StatsEnvelope } from '../core/types.ts'
import type { StatsService } from './stats-service.ts'

/** Error when the stats service itself fails. */
const SCAN_ERROR: { code: string; message: string } = { code: 'internal', message: 'stats scan failed' }

/**
 * Register the stats route (GET /activity-heatmap/stats).
 * @param ctx - context carrying the webServer service.
 * @param stats - the stats service backing the endpoint.
 * @returns route disposers.
 */
export function registerStatsRoutes(ctx: Context, stats: StatsService): () => void {
  const handler = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const url = new URL(req.url ?? '/', 'http://x')
    if (req.method !== 'GET' || url.pathname !== '/activity-heatmap/stats') {
      res.writeHead(405)
      res.end()
      return
    }
    try {
      const payload = await stats.snapshot()
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
      res.end(JSON.stringify({ ok: true, value: payload } satisfies StatsEnvelope<HeatmapPayload>))
    } catch (error) {
      ctx.logger.warn('[dsh-activity-heatmap] stats snapshot failed: ' + String(error))
      res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({ ok: false, error: SCAN_ERROR } satisfies StatsEnvelope<never>))
    }
  }

  const dispose = ctx.webServer.register({ kind: 'exact', path: '/activity-heatmap/stats', handler })
  return () => { dispose() }
}