import { DEVTOOLS_ELEMENT_ID, DEVTOOLS_ELEMENT_TOGGLE_ID, DEVTOOLS_ELEMENT_WINDOW_ID, ViteDevtools, ViteDevtoolsToggle } from "@vite-libs/devtools";

const devtoolsOptions = 'virtual:vite-devtools-options' as any;
// @ts-ignore
const devtoolsDir = `${devtoolsOptions.base || '/'}@id/virtual:vite-devtools-path:index`;
(window as any).__VITE_DEVTOOLS_PLUGIN_DETECTED__ = true;

const devtools = document.createElement(DEVTOOLS_ELEMENT_ID) as ViteDevtools;

devtools.insertApp({
    id: 'vite-tunnel',
    name: 'Vite Tunnel',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><defs><mask id="ipTDatabaseNetworkPoint0"><g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"><path d="M24 36v-6m-4 10H6m22 0h14"/><path fill="#555" d="M28 40a4 4 0 1 1-8 0a4 4 0 0 1 8 0"/><path d="M37 17c0 7.18-5.82 13-13 13s-13-5.82-13-13m26 0c0-7.18-5.82-13-13-13S11 9.82 11 17m26 0H11"/><path fill="#555" d="M29 17c0 7.18-2.239 13-5 13s-5-5.82-5-13s2.239-13 5-13s5 5.82 5 13"/><path d="M37 17H11"/></g></mask></defs><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipTDatabaseNetworkPoint0)"/></svg>',
    async init(shadowRoot, eventTarget) {
        const modal = document.createElement(DEVTOOLS_ELEMENT_WINDOW_ID);

        const style = document.createElement("style");
        style.textContent = `
            header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 24px;
                margin: 0px;        
            }
            hr {
                margin: 0px;
            }
            main {
                padding: 24px;
            }
            h1 {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                color: rgb(255, 255, 255);
                margin: 0px;
                font-size: 22px;
            }

            h3 {
                font-size: 16px;
                font-weight: 400;
                color: white;
                margin: 0px 0px 4px;
            }

            label {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 14px;
                line-height: 1.5rem;
            }

            p {
                margin: 0px;
            }

            a, a:visited {
                color: rgb(9, 105, 218);
            }
        `;
        modal.appendChild(style);

        const header = document.createElement("header");
        const title = document.createElement("h1");
        title.textContent = "Vite Tunnel";
        header.appendChild(title);
        modal.appendChild(header);

        const hr = document.createElement("hr");
        modal.appendChild(hr);

        const main = document.createElement("main");
        const field = document.createElement("label");
        const section = document.createElement("section");
        const fieldTitle = document.createElement("h3");
        fieldTitle.textContent = "Expose your local Vite server to the internet";
        const fieldDescription = document.createElement("p");
        fieldDescription.textContent = "Tunneling is not ready yet";
        section.appendChild(fieldTitle);
        section.appendChild(fieldDescription);

        const toggle = document.createElement(DEVTOOLS_ELEMENT_TOGGLE_ID) as ViteDevtoolsToggle;
        toggle.input.addEventListener("change", (e) => {
            (import.meta as any).hot?.send("vite-tunnel:toggled", {
                // @ts-ignore
                checked: e.currentTarget?.checked,
            });
        });

        (import.meta as any).hot?.on("vite-tunnel:tunnel-url", (data) => {
            // Got the tunnel URL from the server
            if (data.url) {
                toggle.input.checked = true;
                fieldDescription.textContent = "Tunneling is ready at ";
                const a = document.createElement("a");
                a.href = data.url;
                a.textContent = data.url;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                fieldDescription.appendChild(a);
                eventTarget.dispatchEvent(
                    new CustomEvent("toggle-notification", {
                        detail: {
                            state: true,
                        },
                    }),
                );
            } else {
                toggle.input.checked = false;
                fieldDescription.textContent = "Tunneling is not ready yet";
                eventTarget.dispatchEvent(
                    new CustomEvent("toggle-notification", {
                        detail: {
                            state: false,
                        },
                    }),
                );
            }
        });
        field.appendChild(section);
        field.appendChild(toggle);

        main.appendChild(field);
        modal.appendChild(main);

        shadowRoot.appendChild(modal);
    },
})


document.body.appendChild(devtools);