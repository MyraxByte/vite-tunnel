import { startTunnel } from "untun";
import type { Tunnel, TunnelOptions } from "untun";
import { fileURLToPath } from "node:url";
import { PluginOption, ResolvedConfig, normalizePath } from "vite"
import path from "node:path";

type ViteTunnelOptions = TunnelOptions;

function getDevtoolsPath() {
	const pluginPath = normalizePath(path.dirname(fileURLToPath(import.meta.url)))
	return pluginPath.replace(/\/dist$/, '/\/src')
}

const defaultOptions: ViteTunnelOptions = {
	port: 5521,
	hostname: 'localhost',
	protocol: 'http',
	verifyTLS: false,
	acceptCloudflareNotice: false,
};


export default function ViteTunnelPlugin(options: ViteTunnelOptions = defaultOptions) {
	const devtoolsPath = getDevtoolsPath();
	console.log(devtoolsPath)
	let config: ResolvedConfig
	let tunnel: Tunnel | undefined;


	const plugin = <PluginOption>{
		name: 'vite-tunnel',
		enforce: 'pre',
		apply: 'serve',
		configResolved(resolvedConfig) {
			config = resolvedConfig
		},
		configureServer(server) {
			server.ws.on("vite-tunnel-devtools:vite-tunnel:initialized", async () => {
				server.ws.send("vite-tunnel:tunnel-url", {
					url: await tunnel?.getURL(),
				});
			});

			server.ws.on("vite-tunnel-devtools:vite-tunnel:toggled", async () => {
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
		async resolveId(importer: string) {
			if (importer.startsWith('virtual:vite-tunnel-devtools-options')) {
				return importer
			}
			else if (importer.startsWith('virtual:vite-tunnel-devtools-path:')) {
				const resolved = importer.replace('virtual:vite-tunnel-devtools-path:', `${devtoolsPath}/`)
				return resolved
			}
		},
		async load(id: string) {
			if (id === 'virtual:vite-tunnel-devtools-options')
				return `export default ${JSON.stringify({ base: config.base })}`
		},
		transform(code, id) {
			const { root, base } = config
	  
			const projectPath = `${root}${base}`
	  
			if (!id.startsWith(projectPath)) return
			return code
		},
		transformIndexHtml(html) {
			return {
				html,
				tags: [
					{
						tag: "script",
						injectTo: "head",
						attrs: {
							type: "module",
							src: `${config.base || '/'}@id/virtual:vite-tunnel-devtools-path:devtools.js`,
						},
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