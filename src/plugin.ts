import { startTunnel } from "untun";
import type { Tunnel, TunnelOptions } from "untun";
import { PluginOption, ResolvedConfig } from "vite"
import { CLIENT_RUNTIME_ENTRY_PATH, CLIENT_RUNTIME_PATH, composePreambleCode, runtimeCode, wrapVirtualPrefix } from "./client";

type ViteTunnelOptions = TunnelOptions;

const defaultOptions: ViteTunnelOptions = {
	port: 5521,
	hostname: 'localhost',
	protocol: 'http',
	verifyTLS: false,
	acceptCloudflareNotice: false,
};


export default function ViteTunnelPlugin(options: ViteTunnelOptions = defaultOptions) {
	let config: ResolvedConfig
	let tunnel: Tunnel | undefined;
	let baseWithOrigin: string = "/";

	const plugin = <PluginOption>{
		name: 'vite-tunnel',
		enforce: 'pre',
		apply: 'serve',
		configResolved(resolvedConfig) {
			config = resolvedConfig
			baseWithOrigin = config.server.origin ? config.server.origin + config.base : config.base
		},
		configureServer(server) {
			server.ws.on("vite-devtools:vite-tunnel:initialized", async () => {
				server.ws.send("vite-tunnel:tunnel-url", {
					url: await tunnel?.getURL(),
				});
			});

			server.ws.on("vite-devtools:vite-tunnel:toggled", async () => {
				// Send the tunnel URL to the client when the user clicks on the app icon
				server.ws.send("vite-tunnel:tunnel-url", {
					url: await tunnel?.getURL(),
				});
			});

			server.ws.on("vite-tunnel:toggled",
				async (data: { checked: boolean }) => {
					if (data.checked) {
						tunnel = await startTunnel(options);
						server.ws.send("vite-tunnel:tunnel-url", {
							url: await tunnel?.getURL(),
						});
					} else {
						await tunnel?.close();
						server.ws.send("vite-tunnel:tunnel-url", {
							url: undefined,
						});
						tunnel = undefined;
					}
				},
			);
		},
		async resolveId(id: string) {
			if (id === CLIENT_RUNTIME_PATH || id === CLIENT_RUNTIME_ENTRY_PATH) {
				return wrapVirtualPrefix(id)
			}

			return
		},
		async load(id) {
			if (id === wrapVirtualPrefix(CLIENT_RUNTIME_PATH)) {
				return runtimeCode
			}

			if (id === wrapVirtualPrefix(CLIENT_RUNTIME_ENTRY_PATH)) {
				return composePreambleCode({ baseWithOrigin })
			}

			return
		},
		transformIndexHtml(html) {
			return {
				html,
				tags: [
					{
						tag: "script",
						attrs: {
							type: "module",
						},
						children: composePreambleCode({ baseWithOrigin }),
					},
				],
			};
		},

		closeBundle() {
			tunnel?.close();
		},
	}

	return [
		plugin
	]
}