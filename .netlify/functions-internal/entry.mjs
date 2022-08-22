import * as adapter from '@astrojs/netlify/netlify-functions.js';
import React, { createElement } from 'react';
import ReactDOM from 'react-dom/server';
import { escape } from 'html-escaper';
import etag from 'etag';
import { lookup } from 'mrmime';
import sharp$1 from 'sharp';
import fs from 'node:fs/promises';
/* empty css                                                                      */import { optimize } from 'svgo';
import * as Image from '@11ty/eleventy-img';
import Image__default from '@11ty/eleventy-img';
import { createRequire } from 'module';
import { createHash } from 'crypto';
import { readFileSync, mkdir, writeFile } from 'fs';
/* empty css                          */import 'mime';
import 'kleur/colors';
import 'string-width';
import 'path-browserify';
import { compile } from 'path-to-regexp';

/**
 * Astro passes `children` as a string of HTML, so we need
 * a wrapper `div` to render that content as VNodes.
 *
 * As a bonus, we can signal to React that this subtree is
 * entirely static and will never change via `shouldComponentUpdate`.
 */
const StaticHtml = ({ value, name }) => {
	if (!value) return null;
	return createElement('astro-slot', {
		name,
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: value },
	});
};

/**
 * This tells React to opt-out of re-rendering this subtree,
 * In addition to being a performance optimization,
 * this also allows other frameworks to attach to `children`.
 *
 * See https://preactjs.com/guide/v8/external-dom-mutations
 */
StaticHtml.shouldComponentUpdate = () => false;

const slotName$1 = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
const reactTypeof = Symbol.for('react.element');

function errorIsComingFromPreactComponent(err) {
	return (
		err.message &&
		(err.message.startsWith("Cannot read property '__H'") ||
			err.message.includes("(reading '__H')"))
	);
}

async function check$1(Component, props, children) {
	// Note: there are packages that do some unholy things to create "components".
	// Checking the $$typeof property catches most of these patterns.
	if (typeof Component === 'object') {
		const $$typeof = Component['$$typeof'];
		return $$typeof && $$typeof.toString().slice('Symbol('.length).startsWith('react');
	}
	if (typeof Component !== 'function') return false;

	if (Component.prototype != null && typeof Component.prototype.render === 'function') {
		return React.Component.isPrototypeOf(Component) || React.PureComponent.isPrototypeOf(Component);
	}

	let error = null;
	let isReactComponent = false;
	function Tester(...args) {
		try {
			const vnode = Component(...args);
			if (vnode && vnode['$$typeof'] === reactTypeof) {
				isReactComponent = true;
			}
		} catch (err) {
			if (!errorIsComingFromPreactComponent(err)) {
				error = err;
			}
		}

		return React.createElement('div');
	}

	await renderToStaticMarkup$1(Tester, props, children, {});

	if (error) {
		throw error;
	}
	return isReactComponent;
}

async function getNodeWritable() {
	let nodeStreamBuiltinModuleName = 'stream';
	let { Writable } = await import(nodeStreamBuiltinModuleName);
	return Writable;
}

async function renderToStaticMarkup$1(Component, props, { default: children, ...slotted }, metadata) {
	delete props['class'];
	const slots = {};
	for (const [key, value] of Object.entries(slotted)) {
		const name = slotName$1(key);
		slots[name] = React.createElement(StaticHtml, { value, name });
	}
	// Note: create newProps to avoid mutating `props` before they are serialized
	const newProps = {
		...props,
		...slots,
		children: children != null ? React.createElement(StaticHtml, { value: children }) : undefined,
	};
	const vnode = React.createElement(Component, newProps);
	let html;
	if (metadata && metadata.hydrate) {
		html = ReactDOM.renderToString(vnode);
		if ('renderToReadableStream' in ReactDOM) {
			html = await renderToReadableStreamAsync(vnode);
		} else {
			html = await renderToPipeableStreamAsync(vnode);
		}
	} else {
		if ('renderToReadableStream' in ReactDOM) {
			html = await renderToReadableStreamAsync(vnode);
		} else {
			html = await renderToStaticNodeStreamAsync(vnode);
		}
	}
	return { html };
}

async function renderToPipeableStreamAsync(vnode) {
	const Writable = await getNodeWritable();
	let html = '';
	return new Promise((resolve, reject) => {
		let error = undefined;
		let stream = ReactDOM.renderToPipeableStream(vnode, {
			onError(err) {
				error = err;
				reject(error);
			},
			onAllReady() {
				stream.pipe(
					new Writable({
						write(chunk, _encoding, callback) {
							html += chunk.toString('utf-8');
							callback();
						},
						destroy() {
							resolve(html);
						},
					})
				);
			},
		});
	});
}

async function renderToStaticNodeStreamAsync(vnode) {
	const Writable = await getNodeWritable();
	let html = '';
	return new Promise((resolve) => {
		let stream = ReactDOM.renderToStaticNodeStream(vnode);
		stream.pipe(
			new Writable({
				write(chunk, _encoding, callback) {
					html += chunk.toString('utf-8');
					callback();
				},
				destroy() {
					resolve(html);
				},
			})
		);
	});
}

async function renderToReadableStreamAsync(vnode) {
	const decoder = new TextDecoder();
	const stream = await ReactDOM.renderToReadableStream(vnode);
	let html = '';
	for await (const chunk of stream) {
		html += decoder.decode(chunk);
	}
	return html;
}

const _renderer1 = {
	check: check$1,
	renderToStaticMarkup: renderToStaticMarkup$1,
};

const ASTRO_VERSION = "1.0.5";
function createDeprecatedFetchContentFn() {
  return () => {
    throw new Error("Deprecated: Astro.fetchContent() has been replaced with Astro.glob().");
  };
}
function createAstroGlobFn() {
  const globHandler = (importMetaGlobResult, globValue) => {
    let allEntries = [...Object.values(importMetaGlobResult)];
    if (allEntries.length === 0) {
      throw new Error(`Astro.glob(${JSON.stringify(globValue())}) - no matches found.`);
    }
    return Promise.all(allEntries.map((fn) => fn()));
  };
  return globHandler;
}
function createAstro(filePathname, _site, projectRootStr) {
  const site = _site ? new URL(_site) : void 0;
  const referenceURL = new URL(filePathname, `http://localhost`);
  const projectRoot = new URL(projectRootStr);
  return {
    site,
    generator: `Astro v${ASTRO_VERSION}`,
    fetchContent: createDeprecatedFetchContentFn(),
    glob: createAstroGlobFn(),
    resolve(...segments) {
      let resolved = segments.reduce((u, segment) => new URL(segment, u), referenceURL).pathname;
      if (resolved.startsWith(projectRoot.pathname)) {
        resolved = "/" + resolved.slice(projectRoot.pathname.length);
      }
      return resolved;
    }
  };
}

const escapeHTML = escape;
class HTMLString extends String {
}
const markHTMLString = (value) => {
  if (value instanceof HTMLString) {
    return value;
  }
  if (typeof value === "string") {
    return new HTMLString(value);
  }
  return value;
};

class Metadata {
  constructor(filePathname, opts) {
    this.modules = opts.modules;
    this.hoisted = opts.hoisted;
    this.hydratedComponents = opts.hydratedComponents;
    this.clientOnlyComponents = opts.clientOnlyComponents;
    this.hydrationDirectives = opts.hydrationDirectives;
    this.mockURL = new URL(filePathname, "http://example.com");
    this.metadataCache = /* @__PURE__ */ new Map();
  }
  resolvePath(specifier) {
    if (specifier.startsWith(".")) {
      const resolved = new URL(specifier, this.mockURL).pathname;
      if (resolved.startsWith("/@fs") && resolved.endsWith(".jsx")) {
        return resolved.slice(0, resolved.length - 4);
      }
      return resolved;
    }
    return specifier;
  }
  getPath(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentUrl) || null;
  }
  getExport(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentExport) || null;
  }
  getComponentMetadata(Component) {
    if (this.metadataCache.has(Component)) {
      return this.metadataCache.get(Component);
    }
    const metadata = this.findComponentMetadata(Component);
    this.metadataCache.set(Component, metadata);
    return metadata;
  }
  findComponentMetadata(Component) {
    const isCustomElement = typeof Component === "string";
    for (const { module, specifier } of this.modules) {
      const id = this.resolvePath(specifier);
      for (const [key, value] of Object.entries(module)) {
        if (isCustomElement) {
          if (key === "tagName" && Component === value) {
            return {
              componentExport: key,
              componentUrl: id
            };
          }
        } else if (Component === value) {
          return {
            componentExport: key,
            componentUrl: id
          };
        }
      }
    }
    return null;
  }
}
function createMetadata(filePathname, options) {
  return new Metadata(filePathname, options);
}

const PROP_TYPE = {
  Value: 0,
  JSON: 1,
  RegExp: 2,
  Date: 3,
  Map: 4,
  Set: 5,
  BigInt: 6,
  URL: 7
};
function serializeArray(value) {
  return value.map((v) => convertToSerializedForm(v));
}
function serializeObject(value) {
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => {
      return [k, convertToSerializedForm(v)];
    })
  );
}
function convertToSerializedForm(value) {
  const tag = Object.prototype.toString.call(value);
  switch (tag) {
    case "[object Date]": {
      return [PROP_TYPE.Date, value.toISOString()];
    }
    case "[object RegExp]": {
      return [PROP_TYPE.RegExp, value.source];
    }
    case "[object Map]": {
      return [PROP_TYPE.Map, JSON.stringify(serializeArray(Array.from(value)))];
    }
    case "[object Set]": {
      return [PROP_TYPE.Set, JSON.stringify(serializeArray(Array.from(value)))];
    }
    case "[object BigInt]": {
      return [PROP_TYPE.BigInt, value.toString()];
    }
    case "[object URL]": {
      return [PROP_TYPE.URL, value.toString()];
    }
    case "[object Array]": {
      return [PROP_TYPE.JSON, JSON.stringify(serializeArray(value))];
    }
    default: {
      if (value !== null && typeof value === "object") {
        return [PROP_TYPE.Value, serializeObject(value)];
      } else {
        return [PROP_TYPE.Value, value];
      }
    }
  }
}
function serializeProps(props) {
  return JSON.stringify(serializeObject(props));
}

function serializeListValue(value) {
  const hash = {};
  push(value);
  return Object.keys(hash).join(" ");
  function push(item) {
    if (item && typeof item.forEach === "function")
      item.forEach(push);
    else if (item === Object(item))
      Object.keys(item).forEach((name) => {
        if (item[name])
          push(name);
      });
    else {
      item = item === false || item == null ? "" : String(item).trim();
      if (item) {
        item.split(/\s+/).forEach((name) => {
          hash[name] = true;
        });
      }
    }
  }
}

const HydrationDirectivesRaw = ["load", "idle", "media", "visible", "only"];
const HydrationDirectives = new Set(HydrationDirectivesRaw);
const HydrationDirectiveProps = new Set(HydrationDirectivesRaw.map((n) => `client:${n}`));
function extractDirectives(inputProps) {
  let extracted = {
    isPage: false,
    hydration: null,
    props: {}
  };
  for (const [key, value] of Object.entries(inputProps)) {
    if (key.startsWith("server:")) {
      if (key === "server:root") {
        extracted.isPage = true;
      }
    }
    if (key.startsWith("client:")) {
      if (!extracted.hydration) {
        extracted.hydration = {
          directive: "",
          value: "",
          componentUrl: "",
          componentExport: { value: "" }
        };
      }
      switch (key) {
        case "client:component-path": {
          extracted.hydration.componentUrl = value;
          break;
        }
        case "client:component-export": {
          extracted.hydration.componentExport.value = value;
          break;
        }
        case "client:component-hydration": {
          break;
        }
        case "client:display-name": {
          break;
        }
        default: {
          extracted.hydration.directive = key.split(":")[1];
          extracted.hydration.value = value;
          if (!HydrationDirectives.has(extracted.hydration.directive)) {
            throw new Error(
              `Error: invalid hydration directive "${key}". Supported hydration methods: ${Array.from(
                HydrationDirectiveProps
              ).join(", ")}`
            );
          }
          if (extracted.hydration.directive === "media" && typeof extracted.hydration.value !== "string") {
            throw new Error(
              'Error: Media query must be provided for "client:media", similar to client:media="(max-width: 600px)"'
            );
          }
          break;
        }
      }
    } else if (key === "class:list") {
      extracted.props[key.slice(0, -5)] = serializeListValue(value);
    } else {
      extracted.props[key] = value;
    }
  }
  return extracted;
}
async function generateHydrateScript(scriptOptions, metadata) {
  const { renderer, result, astroId, props, attrs } = scriptOptions;
  const { hydrate, componentUrl, componentExport } = metadata;
  if (!componentExport.value) {
    throw new Error(
      `Unable to resolve a valid export for "${metadata.displayName}"! Please open an issue at https://astro.build/issues!`
    );
  }
  const island = {
    children: "",
    props: {
      uid: astroId
    }
  };
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      island.props[key] = value;
    }
  }
  island.props["component-url"] = await result.resolve(componentUrl);
  if (renderer.clientEntrypoint) {
    island.props["component-export"] = componentExport.value;
    island.props["renderer-url"] = await result.resolve(renderer.clientEntrypoint);
    island.props["props"] = escapeHTML(serializeProps(props));
  }
  island.props["ssr"] = "";
  island.props["client"] = hydrate;
  island.props["before-hydration-url"] = await result.resolve("astro:scripts/before-hydration.js");
  island.props["opts"] = escapeHTML(
    JSON.stringify({
      name: metadata.displayName,
      value: metadata.hydrateArgs || ""
    })
  );
  return island;
}

var idle_prebuilt_default = `(self.Astro=self.Astro||{}).idle=a=>{const e=async()=>{await(await a())()};"requestIdleCallback"in window?window.requestIdleCallback(e):setTimeout(e,200)};`;

var load_prebuilt_default = `(self.Astro=self.Astro||{}).load=a=>{(async()=>await(await a())())()};`;

var media_prebuilt_default = `(self.Astro=self.Astro||{}).media=(s,a)=>{const t=async()=>{await(await s())()};if(a.value){const e=matchMedia(a.value);e.matches?t():e.addEventListener("change",t,{once:!0})}};`;

var only_prebuilt_default = `(self.Astro=self.Astro||{}).only=a=>{(async()=>await(await a())())()};`;

var visible_prebuilt_default = `(self.Astro=self.Astro||{}).visible=(i,c,n)=>{const r=async()=>{await(await i())()};let s=new IntersectionObserver(e=>{for(const t of e)if(!!t.isIntersecting){s.disconnect(),r();break}});for(let e=0;e<n.children.length;e++){const t=n.children[e];s.observe(t)}};`;

var astro_island_prebuilt_default = `var a;{const l={0:t=>t,1:t=>JSON.parse(t,n),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(JSON.parse(t,n)),5:t=>new Set(JSON.parse(t,n)),6:t=>BigInt(t),7:t=>new URL(t)},n=(t,r)=>{if(t===""||!Array.isArray(r))return r;const[s,i]=r;return s in l?l[s](i):void 0};customElements.get("astro-island")||customElements.define("astro-island",(a=class extends HTMLElement{constructor(){super(...arguments);this.hydrate=()=>{if(!this.hydrator||this.parentElement?.closest("astro-island[ssr]"))return;const r=this.querySelectorAll("astro-slot"),s={},i=this.querySelectorAll("template[data-astro-template]");for(const e of i)!e.closest(this.tagName)?.isSameNode(this)||(s[e.getAttribute("data-astro-template")||"default"]=e.innerHTML,e.remove());for(const e of r)!e.closest(this.tagName)?.isSameNode(this)||(s[e.getAttribute("name")||"default"]=e.innerHTML);const o=this.hasAttribute("props")?JSON.parse(this.getAttribute("props"),n):{};this.hydrator(this)(this.Component,o,s,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),window.removeEventListener("astro:hydrate",this.hydrate),window.dispatchEvent(new CustomEvent("astro:hydrate"))}}connectedCallback(){!this.hasAttribute("await-children")||this.firstChild?this.childrenConnectedCallback():new MutationObserver((r,s)=>{s.disconnect(),this.childrenConnectedCallback()}).observe(this,{childList:!0})}async childrenConnectedCallback(){window.addEventListener("astro:hydrate",this.hydrate),await import(this.getAttribute("before-hydration-url"));const r=JSON.parse(this.getAttribute("opts"));Astro[this.getAttribute("client")](async()=>{const s=this.getAttribute("renderer-url"),[i,{default:o}]=await Promise.all([import(this.getAttribute("component-url")),s?import(s):()=>()=>{}]),e=this.getAttribute("component-export")||"default";if(!e.includes("."))this.Component=i[e];else{this.Component=i;for(const c of e.split("."))this.Component=this.Component[c]}return this.hydrator=o,this.hydrate},r,this)}attributeChangedCallback(){this.hydrator&&this.hydrate()}},a.observedAttributes=["props"],a))}`;

function determineIfNeedsHydrationScript(result) {
  if (result._metadata.hasHydrationScript) {
    return false;
  }
  return result._metadata.hasHydrationScript = true;
}
const hydrationScripts = {
  idle: idle_prebuilt_default,
  load: load_prebuilt_default,
  only: only_prebuilt_default,
  media: media_prebuilt_default,
  visible: visible_prebuilt_default
};
function determinesIfNeedsDirectiveScript(result, directive) {
  if (result._metadata.hasDirectives.has(directive)) {
    return false;
  }
  result._metadata.hasDirectives.add(directive);
  return true;
}
function getDirectiveScriptText(directive) {
  if (!(directive in hydrationScripts)) {
    throw new Error(`Unknown directive: ${directive}`);
  }
  const directiveScriptText = hydrationScripts[directive];
  return directiveScriptText;
}
function getPrescripts(type, directive) {
  switch (type) {
    case "both":
      return `<style>astro-island,astro-slot{display:contents}</style><script>${getDirectiveScriptText(directive) + astro_island_prebuilt_default}<\/script>`;
    case "directive":
      return `<script>${getDirectiveScriptText(directive)}<\/script>`;
  }
  return "";
}

const Fragment = Symbol.for("astro:fragment");
const Renderer = Symbol.for("astro:renderer");
function stringifyChunk(result, chunk) {
  switch (chunk.type) {
    case "directive": {
      const { hydration } = chunk;
      let needsHydrationScript = hydration && determineIfNeedsHydrationScript(result);
      let needsDirectiveScript = hydration && determinesIfNeedsDirectiveScript(result, hydration.directive);
      let prescriptType = needsHydrationScript ? "both" : needsDirectiveScript ? "directive" : null;
      if (prescriptType) {
        let prescripts = getPrescripts(prescriptType, hydration.directive);
        return markHTMLString(prescripts);
      } else {
        return "";
      }
    }
    default: {
      return chunk.toString();
    }
  }
}

function validateComponentProps(props, displayName) {
  var _a;
  if (((_a = (Object.assign({"BASE_URL":"/","MODE":"production","DEV":false,"PROD":true},{_:process.env._,}))) == null ? void 0 : _a.DEV) && props != null) {
    for (const prop of Object.keys(props)) {
      if (HydrationDirectiveProps.has(prop)) {
        console.warn(
          `You are attempting to render <${displayName} ${prop} />, but ${displayName} is an Astro component. Astro components do not render in the client and should not have a hydration directive. Please use a framework component for client rendering.`
        );
      }
    }
  }
}
class AstroComponent {
  constructor(htmlParts, expressions) {
    this.htmlParts = htmlParts;
    this.expressions = expressions;
  }
  get [Symbol.toStringTag]() {
    return "AstroComponent";
  }
  async *[Symbol.asyncIterator]() {
    const { htmlParts, expressions } = this;
    for (let i = 0; i < htmlParts.length; i++) {
      const html = htmlParts[i];
      const expression = expressions[i];
      yield markHTMLString(html);
      yield* renderChild(expression);
    }
  }
}
function isAstroComponent(obj) {
  return typeof obj === "object" && Object.prototype.toString.call(obj) === "[object AstroComponent]";
}
async function* renderAstroComponent(component) {
  for await (const value of component) {
    if (value || value === 0) {
      for await (const chunk of renderChild(value)) {
        switch (chunk.type) {
          case "directive": {
            yield chunk;
            break;
          }
          default: {
            yield markHTMLString(chunk);
            break;
          }
        }
      }
    }
  }
}
async function renderToString(result, componentFactory, props, children) {
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    const response = Component;
    throw response;
  }
  let html = "";
  for await (const chunk of renderAstroComponent(Component)) {
    html += stringifyChunk(result, chunk);
  }
  return html;
}
async function renderToIterable(result, componentFactory, displayName, props, children) {
  validateComponentProps(props, displayName);
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    console.warn(
      `Returning a Response is only supported inside of page components. Consider refactoring this logic into something like a function that can be used in the page.`
    );
    const response = Component;
    throw response;
  }
  return renderAstroComponent(Component);
}
async function renderTemplate(htmlParts, ...expressions) {
  return new AstroComponent(htmlParts, expressions);
}

async function* renderChild(child) {
  child = await child;
  if (child instanceof HTMLString) {
    yield child;
  } else if (Array.isArray(child)) {
    for (const value of child) {
      yield markHTMLString(await renderChild(value));
    }
  } else if (typeof child === "function") {
    yield* renderChild(child());
  } else if (typeof child === "string") {
    yield markHTMLString(escapeHTML(child));
  } else if (!child && child !== 0) ; else if (child instanceof AstroComponent || Object.prototype.toString.call(child) === "[object AstroComponent]") {
    yield* renderAstroComponent(child);
  } else if (typeof child === "object" && Symbol.asyncIterator in child) {
    yield* child;
  } else {
    yield child;
  }
}
async function renderSlot(result, slotted, fallback) {
  if (slotted) {
    let iterator = renderChild(slotted);
    let content = "";
    for await (const chunk of iterator) {
      if (chunk.type === "directive") {
        content += stringifyChunk(result, chunk);
      } else {
        content += chunk;
      }
    }
    return markHTMLString(content);
  }
  return fallback;
}

/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
const dictionary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
const binary = dictionary.length;
function bitwise(str) {
  let hash = 0;
  if (str.length === 0)
    return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash(text) {
  let num;
  let result = "";
  let integer = bitwise(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary) {
    num = integer % binary;
    integer = Math.floor(integer / binary);
    result = dictionary[num] + result;
  }
  if (integer > 0) {
    result = dictionary[integer] + result;
  }
  return sign + result;
}

const voidElementNames = /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
const htmlBooleanAttributes = /^(allowfullscreen|async|autofocus|autoplay|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|hidden|loop|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|itemscope)$/i;
const htmlEnumAttributes = /^(contenteditable|draggable|spellcheck|value)$/i;
const svgEnumAttributes = /^(autoReverse|externalResourcesRequired|focusable|preserveAlpha)$/i;
const STATIC_DIRECTIVES = /* @__PURE__ */ new Set(["set:html", "set:text"]);
const toIdent = (k) => k.trim().replace(/(?:(?<!^)\b\w|\s+|[^\w]+)/g, (match, index) => {
  if (/[^\w]|\s/.test(match))
    return "";
  return index === 0 ? match : match.toUpperCase();
});
const toAttributeString = (value, shouldEscape = true) => shouldEscape ? String(value).replace(/&/g, "&#38;").replace(/"/g, "&#34;") : value;
const kebab = (k) => k.toLowerCase() === k ? k : k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
const toStyleString = (obj) => Object.entries(obj).map(([k, v]) => `${kebab(k)}:${v}`).join(";");
function defineScriptVars(vars) {
  let output = "";
  for (const [key, value] of Object.entries(vars)) {
    output += `let ${toIdent(key)} = ${JSON.stringify(value)};
`;
  }
  return markHTMLString(output);
}
function formatList(values) {
  if (values.length === 1) {
    return values[0];
  }
  return `${values.slice(0, -1).join(", ")} or ${values[values.length - 1]}`;
}
function addAttribute(value, key, shouldEscape = true) {
  if (value == null) {
    return "";
  }
  if (value === false) {
    if (htmlEnumAttributes.test(key) || svgEnumAttributes.test(key)) {
      return markHTMLString(` ${key}="false"`);
    }
    return "";
  }
  if (STATIC_DIRECTIVES.has(key)) {
    console.warn(`[astro] The "${key}" directive cannot be applied dynamically at runtime. It will not be rendered as an attribute.

Make sure to use the static attribute syntax (\`${key}={value}\`) instead of the dynamic spread syntax (\`{...{ "${key}": value }}\`).`);
    return "";
  }
  if (key === "class:list") {
    const listValue = toAttributeString(serializeListValue(value));
    if (listValue === "") {
      return "";
    }
    return markHTMLString(` ${key.slice(0, -5)}="${listValue}"`);
  }
  if (key === "style" && !(value instanceof HTMLString) && typeof value === "object") {
    return markHTMLString(` ${key}="${toStyleString(value)}"`);
  }
  if (key === "className") {
    return markHTMLString(` class="${toAttributeString(value, shouldEscape)}"`);
  }
  if (value === true && (key.startsWith("data-") || htmlBooleanAttributes.test(key))) {
    return markHTMLString(` ${key}`);
  } else {
    return markHTMLString(` ${key}="${toAttributeString(value, shouldEscape)}"`);
  }
}
function internalSpreadAttributes(values, shouldEscape = true) {
  let output = "";
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, shouldEscape);
  }
  return markHTMLString(output);
}
function renderElement$1(name, { props: _props, children = "" }, shouldEscape = true) {
  const { lang: _, "data-astro-id": astroId, "define:vars": defineVars, ...props } = _props;
  if (defineVars) {
    if (name === "style") {
      delete props["is:global"];
      delete props["is:scoped"];
    }
    if (name === "script") {
      delete props.hoist;
      children = defineScriptVars(defineVars) + "\n" + children;
    }
  }
  if ((children == null || children == "") && voidElementNames.test(name)) {
    return `<${name}${internalSpreadAttributes(props, shouldEscape)} />`;
  }
  return `<${name}${internalSpreadAttributes(props, shouldEscape)}>${children}</${name}>`;
}

function componentIsHTMLElement(Component) {
  return typeof HTMLElement !== "undefined" && HTMLElement.isPrototypeOf(Component);
}
async function renderHTMLElement(result, constructor, props, slots) {
  const name = getHTMLElementName(constructor);
  let attrHTML = "";
  for (const attr in props) {
    attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
  }
  return markHTMLString(
    `<${name}${attrHTML}>${await renderSlot(result, slots == null ? void 0 : slots.default)}</${name}>`
  );
}
function getHTMLElementName(constructor) {
  const definedName = customElements.getName(constructor);
  if (definedName)
    return definedName;
  const assignedName = constructor.name.replace(/^HTML|Element$/g, "").replace(/[A-Z]/g, "-$&").toLowerCase().replace(/^-/, "html-");
  return assignedName;
}

const rendererAliases = /* @__PURE__ */ new Map([["solid", "solid-js"]]);
function guessRenderers(componentUrl) {
  const extname = componentUrl == null ? void 0 : componentUrl.split(".").pop();
  switch (extname) {
    case "svelte":
      return ["@astrojs/svelte"];
    case "vue":
      return ["@astrojs/vue"];
    case "jsx":
    case "tsx":
      return ["@astrojs/react", "@astrojs/preact"];
    default:
      return ["@astrojs/react", "@astrojs/preact", "@astrojs/vue", "@astrojs/svelte"];
  }
}
function getComponentType(Component) {
  if (Component === Fragment) {
    return "fragment";
  }
  if (Component && typeof Component === "object" && Component["astro:html"]) {
    return "html";
  }
  if (Component && Component.isAstroComponentFactory) {
    return "astro-factory";
  }
  return "unknown";
}
async function renderComponent(result, displayName, Component, _props, slots = {}) {
  var _a;
  Component = await Component;
  switch (getComponentType(Component)) {
    case "fragment": {
      const children2 = await renderSlot(result, slots == null ? void 0 : slots.default);
      if (children2 == null) {
        return children2;
      }
      return markHTMLString(children2);
    }
    case "html": {
      const children2 = {};
      if (slots) {
        await Promise.all(
          Object.entries(slots).map(
            ([key, value]) => renderSlot(result, value).then((output) => {
              children2[key] = output;
            })
          )
        );
      }
      const html2 = Component.render({ slots: children2 });
      return markHTMLString(html2);
    }
    case "astro-factory": {
      async function* renderAstroComponentInline() {
        let iterable = await renderToIterable(result, Component, displayName, _props, slots);
        yield* iterable;
      }
      return renderAstroComponentInline();
    }
  }
  if (!Component && !_props["client:only"]) {
    throw new Error(
      `Unable to render ${displayName} because it is ${Component}!
Did you forget to import the component or is it possible there is a typo?`
    );
  }
  const { renderers } = result._metadata;
  const metadata = { displayName };
  const { hydration, isPage, props } = extractDirectives(_props);
  let html = "";
  let attrs = void 0;
  if (hydration) {
    metadata.hydrate = hydration.directive;
    metadata.hydrateArgs = hydration.value;
    metadata.componentExport = hydration.componentExport;
    metadata.componentUrl = hydration.componentUrl;
  }
  const probableRendererNames = guessRenderers(metadata.componentUrl);
  if (Array.isArray(renderers) && renderers.length === 0 && typeof Component !== "string" && !componentIsHTMLElement(Component)) {
    const message = `Unable to render ${metadata.displayName}!

There are no \`integrations\` set in your \`astro.config.mjs\` file.
Did you mean to add ${formatList(probableRendererNames.map((r) => "`" + r + "`"))}?`;
    throw new Error(message);
  }
  const children = {};
  if (slots) {
    await Promise.all(
      Object.entries(slots).map(
        ([key, value]) => renderSlot(result, value).then((output) => {
          children[key] = output;
        })
      )
    );
  }
  let renderer;
  if (metadata.hydrate !== "only") {
    if (Component && Component[Renderer]) {
      const rendererName = Component[Renderer];
      renderer = renderers.find(({ name }) => name === rendererName);
    }
    if (!renderer) {
      let error;
      for (const r of renderers) {
        try {
          if (await r.ssr.check.call({ result }, Component, props, children)) {
            renderer = r;
            break;
          }
        } catch (e) {
          error ?? (error = e);
        }
      }
      if (!renderer && error) {
        throw error;
      }
    }
    if (!renderer && typeof HTMLElement === "function" && componentIsHTMLElement(Component)) {
      const output = renderHTMLElement(result, Component, _props, slots);
      return output;
    }
  } else {
    if (metadata.hydrateArgs) {
      const passedName = metadata.hydrateArgs;
      const rendererName = rendererAliases.has(passedName) ? rendererAliases.get(passedName) : passedName;
      renderer = renderers.find(
        ({ name }) => name === `@astrojs/${rendererName}` || name === rendererName
      );
    }
    if (!renderer && renderers.length === 1) {
      renderer = renderers[0];
    }
    if (!renderer) {
      const extname = (_a = metadata.componentUrl) == null ? void 0 : _a.split(".").pop();
      renderer = renderers.filter(
        ({ name }) => name === `@astrojs/${extname}` || name === extname
      )[0];
    }
  }
  if (!renderer) {
    if (metadata.hydrate === "only") {
      throw new Error(`Unable to render ${metadata.displayName}!

Using the \`client:only\` hydration strategy, Astro needs a hint to use the correct renderer.
Did you mean to pass <${metadata.displayName} client:only="${probableRendererNames.map((r) => r.replace("@astrojs/", "")).join("|")}" />
`);
    } else if (typeof Component !== "string") {
      const matchingRenderers = renderers.filter((r) => probableRendererNames.includes(r.name));
      const plural = renderers.length > 1;
      if (matchingRenderers.length === 0) {
        throw new Error(`Unable to render ${metadata.displayName}!

There ${plural ? "are" : "is"} ${renderers.length} renderer${plural ? "s" : ""} configured in your \`astro.config.mjs\` file,
but ${plural ? "none were" : "it was not"} able to server-side render ${metadata.displayName}.

Did you mean to enable ${formatList(probableRendererNames.map((r) => "`" + r + "`"))}?`);
      } else if (matchingRenderers.length === 1) {
        renderer = matchingRenderers[0];
        ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
          { result },
          Component,
          props,
          children,
          metadata
        ));
      } else {
        throw new Error(`Unable to render ${metadata.displayName}!

This component likely uses ${formatList(probableRendererNames)},
but Astro encountered an error during server-side rendering.

Please ensure that ${metadata.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`);
      }
    }
  } else {
    if (metadata.hydrate === "only") {
      html = await renderSlot(result, slots == null ? void 0 : slots.fallback);
    } else {
      ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
        { result },
        Component,
        props,
        children,
        metadata
      ));
    }
  }
  if (renderer && !renderer.clientEntrypoint && renderer.name !== "@astrojs/lit" && metadata.hydrate) {
    throw new Error(
      `${metadata.displayName} component has a \`client:${metadata.hydrate}\` directive, but no client entrypoint was provided by ${renderer.name}!`
    );
  }
  if (!html && typeof Component === "string") {
    const childSlots = Object.values(children).join("");
    const iterable = renderAstroComponent(
      await renderTemplate`<${Component}${internalSpreadAttributes(props)}${markHTMLString(
        childSlots === "" && voidElementNames.test(Component) ? `/>` : `>${childSlots}</${Component}>`
      )}`
    );
    html = "";
    for await (const chunk of iterable) {
      html += chunk;
    }
  }
  if (!hydration) {
    if (isPage || (renderer == null ? void 0 : renderer.name) === "astro:jsx") {
      return html;
    }
    return markHTMLString(html.replace(/\<\/?astro-slot\>/g, ""));
  }
  const astroId = shorthash(
    `<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(
      props
    )}`
  );
  const island = await generateHydrateScript(
    { renderer, result, astroId, props, attrs },
    metadata
  );
  let unrenderedSlots = [];
  if (html) {
    if (Object.keys(children).length > 0) {
      for (const key of Object.keys(children)) {
        if (!html.includes(key === "default" ? `<astro-slot>` : `<astro-slot name="${key}">`)) {
          unrenderedSlots.push(key);
        }
      }
    }
  } else {
    unrenderedSlots = Object.keys(children);
  }
  const template = unrenderedSlots.length > 0 ? unrenderedSlots.map(
    (key) => `<template data-astro-template${key !== "default" ? `="${key}"` : ""}>${children[key]}</template>`
  ).join("") : "";
  island.children = `${html ?? ""}${template}`;
  if (island.children) {
    island.props["await-children"] = "";
  }
  async function* renderAll() {
    yield { type: "directive", hydration, result };
    yield markHTMLString(renderElement$1("astro-island", island, false));
  }
  return renderAll();
}

const uniqueElements = (item, index, all) => {
  const props = JSON.stringify(item.props);
  const children = item.children;
  return index === all.findIndex((i) => JSON.stringify(i.props) === props && i.children == children);
};
const alreadyHeadRenderedResults = /* @__PURE__ */ new WeakSet();
function renderHead(result) {
  alreadyHeadRenderedResults.add(result);
  const styles = Array.from(result.styles).filter(uniqueElements).map((style) => renderElement$1("style", style));
  result.styles.clear();
  const scripts = Array.from(result.scripts).filter(uniqueElements).map((script, i) => {
    return renderElement$1("script", script, false);
  });
  const links = Array.from(result.links).filter(uniqueElements).map((link) => renderElement$1("link", link, false));
  return markHTMLString(links.join("\n") + styles.join("\n") + scripts.join("\n"));
}
async function* maybeRenderHead(result) {
  if (alreadyHeadRenderedResults.has(result)) {
    return;
  }
  yield renderHead(result);
}

typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";

new TextEncoder();

function createComponent(cb) {
  cb.isAstroComponentFactory = true;
  return cb;
}
function spreadAttributes(values, _name, { class: scopedClassName } = {}) {
  let output = "";
  if (scopedClassName) {
    if (typeof values.class !== "undefined") {
      values.class += ` ${scopedClassName}`;
    } else if (typeof values["class:list"] !== "undefined") {
      values["class:list"] = [values["class:list"], scopedClassName];
    } else {
      values.class = scopedClassName;
    }
  }
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, true);
  }
  return markHTMLString(output);
}

const AstroJSX = "astro:jsx";
const Empty = Symbol("empty");
const toSlotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
function isVNode(vnode) {
  return vnode && typeof vnode === "object" && vnode[AstroJSX];
}
function transformSlots(vnode) {
  if (typeof vnode.type === "string")
    return vnode;
  const slots = {};
  if (isVNode(vnode.props.children)) {
    const child = vnode.props.children;
    if (!isVNode(child))
      return;
    if (!("slot" in child.props))
      return;
    const name = toSlotName(child.props.slot);
    slots[name] = [child];
    slots[name]["$$slot"] = true;
    delete child.props.slot;
    delete vnode.props.children;
  }
  if (Array.isArray(vnode.props.children)) {
    vnode.props.children = vnode.props.children.map((child) => {
      if (!isVNode(child))
        return child;
      if (!("slot" in child.props))
        return child;
      const name = toSlotName(child.props.slot);
      if (Array.isArray(slots[name])) {
        slots[name].push(child);
      } else {
        slots[name] = [child];
        slots[name]["$$slot"] = true;
      }
      delete child.props.slot;
      return Empty;
    }).filter((v) => v !== Empty);
  }
  Object.assign(vnode.props, slots);
}
function markRawChildren(child) {
  if (typeof child === "string")
    return markHTMLString(child);
  if (Array.isArray(child))
    return child.map((c) => markRawChildren(c));
  return child;
}
function transformSetDirectives(vnode) {
  if (!("set:html" in vnode.props || "set:text" in vnode.props))
    return;
  if ("set:html" in vnode.props) {
    const children = markRawChildren(vnode.props["set:html"]);
    delete vnode.props["set:html"];
    Object.assign(vnode.props, { children });
    return;
  }
  if ("set:text" in vnode.props) {
    const children = vnode.props["set:text"];
    delete vnode.props["set:text"];
    Object.assign(vnode.props, { children });
    return;
  }
}
function createVNode(type, props) {
  const vnode = {
    [AstroJSX]: true,
    type,
    props: props ?? {}
  };
  transformSetDirectives(vnode);
  transformSlots(vnode);
  return vnode;
}

const ClientOnlyPlaceholder = "astro-client-only";
const skipAstroJSXCheck = /* @__PURE__ */ new WeakSet();
let originalConsoleError;
let consoleFilterRefs = 0;
async function renderJSX(result, vnode) {
  switch (true) {
    case vnode instanceof HTMLString:
      if (vnode.toString().trim() === "") {
        return "";
      }
      return vnode;
    case typeof vnode === "string":
      return markHTMLString(escapeHTML(vnode));
    case (!vnode && vnode !== 0):
      return "";
    case Array.isArray(vnode):
      return markHTMLString(
        (await Promise.all(vnode.map((v) => renderJSX(result, v)))).join("")
      );
  }
  if (isVNode(vnode)) {
    switch (true) {
      case vnode.type === Symbol.for("astro:fragment"):
        return renderJSX(result, vnode.props.children);
      case vnode.type.isAstroComponentFactory: {
        let props = {};
        let slots = {};
        for (const [key, value] of Object.entries(vnode.props ?? {})) {
          if (key === "children" || value && typeof value === "object" && value["$$slot"]) {
            slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
          } else {
            props[key] = value;
          }
        }
        return markHTMLString(await renderToString(result, vnode.type, props, slots));
      }
      case (!vnode.type && vnode.type !== 0):
        return "";
      case (typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder):
        return markHTMLString(await renderElement(result, vnode.type, vnode.props ?? {}));
    }
    if (vnode.type) {
      let extractSlots2 = function(child) {
        if (Array.isArray(child)) {
          return child.map((c) => extractSlots2(c));
        }
        if (!isVNode(child)) {
          _slots.default.push(child);
          return;
        }
        if ("slot" in child.props) {
          _slots[child.props.slot] = [..._slots[child.props.slot] ?? [], child];
          delete child.props.slot;
          return;
        }
        _slots.default.push(child);
      };
      if (typeof vnode.type === "function" && vnode.type["astro:renderer"]) {
        skipAstroJSXCheck.add(vnode.type);
      }
      if (typeof vnode.type === "function" && vnode.props["server:root"]) {
        const output2 = await vnode.type(vnode.props ?? {});
        return await renderJSX(result, output2);
      }
      if (typeof vnode.type === "function" && !skipAstroJSXCheck.has(vnode.type)) {
        useConsoleFilter();
        try {
          const output2 = await vnode.type(vnode.props ?? {});
          if (output2 && output2[AstroJSX]) {
            return await renderJSX(result, output2);
          } else if (!output2) {
            return await renderJSX(result, output2);
          }
        } catch (e) {
          skipAstroJSXCheck.add(vnode.type);
        } finally {
          finishUsingConsoleFilter();
        }
      }
      const { children = null, ...props } = vnode.props ?? {};
      const _slots = {
        default: []
      };
      extractSlots2(children);
      for (const [key, value] of Object.entries(props)) {
        if (value["$$slot"]) {
          _slots[key] = value;
          delete props[key];
        }
      }
      const slotPromises = [];
      const slots = {};
      for (const [key, value] of Object.entries(_slots)) {
        slotPromises.push(
          renderJSX(result, value).then((output2) => {
            if (output2.toString().trim().length === 0)
              return;
            slots[key] = () => output2;
          })
        );
      }
      await Promise.all(slotPromises);
      let output;
      if (vnode.type === ClientOnlyPlaceholder && vnode.props["client:only"]) {
        output = await renderComponent(
          result,
          vnode.props["client:display-name"] ?? "",
          null,
          props,
          slots
        );
      } else {
        output = await renderComponent(
          result,
          typeof vnode.type === "function" ? vnode.type.name : vnode.type,
          vnode.type,
          props,
          slots
        );
      }
      if (typeof output !== "string" && Symbol.asyncIterator in output) {
        let body = "";
        for await (const chunk of output) {
          let html = stringifyChunk(result, chunk);
          body += html;
        }
        return markHTMLString(body);
      } else {
        return markHTMLString(output);
      }
    }
  }
  return markHTMLString(`${vnode}`);
}
async function renderElement(result, tag, { children, ...props }) {
  return markHTMLString(
    `<${tag}${spreadAttributes(props)}${markHTMLString(
      (children == null || children == "") && voidElementNames.test(tag) ? `/>` : `>${children == null ? "" : await renderJSX(result, children)}</${tag}>`
    )}`
  );
}
function useConsoleFilter() {
  consoleFilterRefs++;
  if (!originalConsoleError) {
    originalConsoleError = console.error;
    try {
      console.error = filteredConsoleError;
    } catch (error) {
    }
  }
}
function finishUsingConsoleFilter() {
  consoleFilterRefs--;
}
function filteredConsoleError(msg, ...rest) {
  if (consoleFilterRefs > 0 && typeof msg === "string") {
    const isKnownReactHookError = msg.includes("Warning: Invalid hook call.") && msg.includes("https://reactjs.org/link/invalid-hook-call");
    if (isKnownReactHookError)
      return;
  }
}

const slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
async function check(Component, props, { default: children = null, ...slotted } = {}) {
  if (typeof Component !== "function")
    return false;
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  try {
    const result = await Component({ ...props, ...slots, children });
    return result[AstroJSX];
  } catch (e) {
  }
  return false;
}
async function renderToStaticMarkup(Component, props = {}, { default: children = null, ...slotted } = {}) {
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  const { result } = this;
  const html = await renderJSX(result, createVNode(Component, { ...props, ...slots, children }));
  return { html };
}
var server_default = {
  check,
  renderToStaticMarkup
};

function isOutputFormat(value) {
  return ["avif", "jpeg", "png", "webp"].includes(value);
}
function isAspectRatioString(value) {
  return /^\d*:\d*$/.test(value);
}
function isRemoteImage(src) {
  return /^http(s?):\/\//.test(src);
}
async function loadLocalImage(src) {
  try {
    return await fs.readFile(src);
  } catch {
    return void 0;
  }
}
async function loadRemoteImage(src) {
  try {
    const res = await fetch(src);
    if (!res.ok) {
      return void 0;
    }
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return void 0;
  }
}

class SharpService {
  async getImageAttributes(transform) {
    const { width, height, src, format, quality, aspectRatio, ...rest } = transform;
    return {
      ...rest,
      width,
      height
    };
  }
  serializeTransform(transform) {
    const searchParams = new URLSearchParams();
    if (transform.quality) {
      searchParams.append("q", transform.quality.toString());
    }
    if (transform.format) {
      searchParams.append("f", transform.format);
    }
    if (transform.width) {
      searchParams.append("w", transform.width.toString());
    }
    if (transform.height) {
      searchParams.append("h", transform.height.toString());
    }
    if (transform.aspectRatio) {
      searchParams.append("ar", transform.aspectRatio.toString());
    }
    searchParams.append("href", transform.src);
    return { searchParams };
  }
  parseTransform(searchParams) {
    if (!searchParams.has("href")) {
      return void 0;
    }
    let transform = { src: searchParams.get("href") };
    if (searchParams.has("q")) {
      transform.quality = parseInt(searchParams.get("q"));
    }
    if (searchParams.has("f")) {
      const format = searchParams.get("f");
      if (isOutputFormat(format)) {
        transform.format = format;
      }
    }
    if (searchParams.has("w")) {
      transform.width = parseInt(searchParams.get("w"));
    }
    if (searchParams.has("h")) {
      transform.height = parseInt(searchParams.get("h"));
    }
    if (searchParams.has("ar")) {
      const ratio = searchParams.get("ar");
      if (isAspectRatioString(ratio)) {
        transform.aspectRatio = ratio;
      } else {
        transform.aspectRatio = parseFloat(ratio);
      }
    }
    return transform;
  }
  async transform(inputBuffer, transform) {
    const sharpImage = sharp$1(inputBuffer, { failOnError: false, pages: -1 });
    sharpImage.rotate();
    if (transform.width || transform.height) {
      const width = transform.width && Math.round(transform.width);
      const height = transform.height && Math.round(transform.height);
      sharpImage.resize(width, height);
    }
    if (transform.format) {
      sharpImage.toFormat(transform.format, { quality: transform.quality });
    }
    const { data, info } = await sharpImage.toBuffer({ resolveWithObject: true });
    return {
      data,
      format: info.format
    };
  }
}
const service = new SharpService();
var sharp_default = service;

const get$1 = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const transform = sharp_default.parseTransform(url.searchParams);
    if (!transform) {
      return new Response("Bad Request", { status: 400 });
    }
    let inputBuffer = void 0;
    if (isRemoteImage(transform.src)) {
      inputBuffer = await loadRemoteImage(transform.src);
    } else {
      const clientRoot = new URL("../client/", import.meta.url);
      const localPath = new URL("." + transform.src, clientRoot);
      inputBuffer = await loadLocalImage(localPath);
    }
    if (!inputBuffer) {
      return new Response(`"${transform.src} not found`, { status: 404 });
    }
    const { data, format } = await sharp_default.transform(inputBuffer, transform);
    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": lookup(format) || "",
        "Cache-Control": "public, max-age=31536000",
        ETag: etag(inputBuffer),
        Date: new Date().toUTCString()
      }
    });
  } catch (err) {
    return new Response(`Server Error: ${err}`, { status: 500 });
  }
};

const _page0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	get: get$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$k = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/components/content-section.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$o = createAstro("/@fs/Users/ian2/paigepotterdesign/src/components/content-section.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$ContentSection = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$o, $$props, $$slots);
  Astro2.self = $$ContentSection;
  const { title, id } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<section${addAttribute(id, "id")} class="flex flex-col items-center gap-4 space-y-8 scroll-mt-24">
  <div class="flex flex-col items-center gap-4">
    ${renderSlot($$result, $$slots["eyebrow"])}
  </div>
  ${renderSlot($$result, $$slots["default"])}
</section>`;
});

const $$file$k = "/Users/ian2/paigepotterdesign/src/components/content-section.astro";
const $$url$k = undefined;

const $$module1$a = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$k,
	default: $$ContentSection,
	file: $$file$k,
	url: $$url$k
}, Symbol.toStringTag, { value: 'Module' }));

const __vite_glob_1_0 = "<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 190 190\">\n  <path\n    fill=\"currentColor\"\n    d=\"M95 143V79l33-33v65l-33 32Zm-65 0 32 33v-65H46\"\n  />\n  <path\n    fill=\"currentColor\"\n    d=\"M62 111V46l33-32v65l-33 32Zm66 65v-65l32-32v64l-32 33Zm-98-33V79l32 32\"\n  />\n</svg>\n";

const __vite_glob_1_1 = "<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 190 190\">\n  <path\n    fill=\"currentColor\"\n    d=\"m101 61 24-10c6-2 12-3 17-2 4 0 7 1 9 4 1 2 2 5 1 9l-6 16-10 13a181 181 0 0 0-35-30ZM54 91l-9-13c-4-6-6-11-7-16 0-4 0-7 2-9 2-3 4-4 9-4 4-1 10 0 17 2l24 10a190 190 0 0 0-36 30Z\"\n  />\n  <path\n    fill=\"currentColor\"\n    fill-rule=\"evenodd\"\n    d=\"M58 95a174 174 0 0 1 37-30 182 182 0 0 1 37 30 174 174 0 0 1-37 30 182 182 0 0 1-37-30Zm37 13a13 13 0 1 0 0-26 13 13 0 0 0 0 26Z\"\n    clip-rule=\"evenodd\"\n  />\n  <path\n    fill=\"currentColor\"\n    d=\"m54 99-9 13c-4 6-6 11-7 16 0 4 0 7 2 9 2 3 4 4 9 4 4 1 10 0 17-2l24-10a191 191 0 0 1-36-30Zm47 30 24 10c6 2 12 3 17 2 4 0 7-1 9-4 1-2 2-5 1-9l-6-16-10-13a181 181 0 0 1-35 30Z\"\n  />\n  <path\n    fill=\"currentColor\"\n    fill-rule=\"evenodd\"\n    d=\"M178 48 95 0 13 48v95l82 47 83-47V48ZM95 58c10-6 20-10 28-13 7-2 14-3 19-2 6 0 10 2 13 6s4 9 3 14c-1 6-4 12-7 18l-11 14 11 14c3 6 6 12 7 18 1 5 0 10-3 14s-7 6-13 6c-5 1-12 0-19-2-8-3-18-7-28-13-10 6-19 10-28 13-7 2-13 3-19 2-5 0-10-2-13-6s-3-9-2-14c1-6 3-12 7-18l10-14-10-14c-4-6-6-12-7-18-1-5-1-10 2-14s8-6 13-6c6-1 12 0 19 2 9 3 18 7 28 13Z\"\n    clip-rule=\"evenodd\"\n  />\n</svg>\n";

const __vite_glob_1_2 = "<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 190 190\">\n  <path\n    fill=\"currentColor\"\n    d=\"M190 95c0-13-16-25-40-32 6-25 3-45-8-51l-8-2v9l4 1c5 3 8 14 6 29l-2 11-25-4c-5-7-10-14-16-19 13-12 25-18 33-18v-9c-11 0-25 8-39 21-14-13-28-21-39-21v9c8 0 20 6 33 18L73 56l-25 4-2-11c-2-15 1-26 6-29l4-1v-9l-9 2c-10 7-13 26-7 51C16 70 0 82 0 95c0 12 16 24 40 32-6 24-3 44 8 50 2 2 5 2 8 2 11 0 25-7 39-21 14 14 28 21 39 21l9-2c10-6 13-26 7-51 24-7 40-19 40-31Zm-50-26-6 15a184 184 0 0 0-10-18l16 3Zm-18 41-9 15a202 202 0 0 1-35 0 213 213 0 0 1-18-30 202 202 0 0 1 17-31 202 202 0 0 1 35 0 213 213 0 0 1 18 31l-8 15Zm12-5 6 15-16 4a212 212 0 0 0 10-19Zm-39 41-11-12a240 240 0 0 0 22 0l-11 12Zm-29-22-16-4 6-15a183 183 0 0 0 10 19Zm29-81 11 12a240 240 0 0 0-22 0l11-12ZM66 66a214 214 0 0 0-10 18l-6-15 16-3Zm-35 48c-14-6-22-13-22-19s8-14 22-20l11-4 9 24-9 23-11-4Zm21 56c-5-3-8-15-6-30l2-11 25 4c5 7 10 14 16 19-13 12-25 19-33 19l-4-1Zm92-30c2 15-1 26-6 29l-4 1c-8 0-20-6-33-18 6-5 11-12 16-19l25-4 2 11Zm15-26-11 4-9-23 9-24 11 4c14 6 22 14 22 20s-9 13-22 19Z\"\n  />\n  <path fill=\"currentColor\" d=\"M95 112a18 18 0 1 0 0-35 18 18 0 0 0 0 35Z\" />\n</svg>\n";

const __vite_glob_1_3 = "<svg viewBox=\"0 0 190 190\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path\n    d=\"M127.61 135.052C121.624 127.573 113.542 122.052 104.399 119.195C95.2561 116.338 85.4683 116.275 76.2893 119.014L10 140.398C10 140.398 66.6667 183.165 110.503 172.473L113.711 171.404C131.887 166.058 138.302 148.951 127.61 135.052Z\"\n    fill=\"currentColor\"\n    fill-opacity=\"0.85\"\n  />\n  <path\n    d=\"M125.783 81.7735C134.926 84.6307 143.008 90.152 148.994 97.6304C154.34 106.184 155.409 114.737 151.132 122.222L129.748 160.712L129.314 160.639C134.288 153.175 134.123 143.518 127.61 135.052C121.624 127.573 113.542 122.052 104.399 119.195C95.2561 116.338 85.4683 116.275 76.2893 119.014L10 140.398L31.3836 102.976L97.673 81.5926C106.852 78.8533 116.64 78.9163 125.783 81.7735Z\"\n    fill=\"currentColor\"\n    fill-opacity=\"0.65\"\n  />\n  <path\n    d=\"M57.0441 50.5863L61.3208 49.5171C104.088 39.8945 160.755 81.5926 160.755 81.5926L139.663 88.7366C135.466 85.6958 130.783 83.3362 125.783 81.7735C116.64 78.9163 106.852 78.8533 97.673 81.5926L51.96 96.3387C48.5484 93.9348 45.5491 91.1335 43.1447 88.0077C33.5221 73.0392 38.868 55.9322 57.0441 50.5863Z\"\n    fill=\"currentColor\"\n    fill-opacity=\"0.45\"\n  />\n  <path\n    d=\"M79.4969 17.4417C123.333 7.81904 180 49.5172 180 49.5172L160.755 81.5926C160.755 81.5926 104.088 39.8945 61.3208 49.5172L57.0441 50.5863C51.0678 52.344 46.4787 55.3732 43.3525 59.1798C43.2832 59.1664 43.2139 59.1531 43.1447 59.1398L59.1824 31.3411L61.3208 28.1335C64.5283 23.8568 69.8742 20.6492 76.2893 18.5109L79.4969 17.4417Z\"\n    fill=\"currentColor\"\n    fill-opacity=\"0.3\"\n  />\n</svg>\n";

const __vite_glob_1_4 = "<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 190 190\">\n  <path\n    fill=\"currentColor\"\n    fill-rule=\"evenodd\"\n    d=\"M87 14c23-15 56-8 72 15v1a50 50 0 0 1 9 38c-1 6-4 12-7 17a50 50 0 0 1-3 51c-4 5-8 10-14 13l-41 26a54 54 0 0 1-81-33v-20c1-7 3-13 7-18a50 50 0 0 1 2-50c4-6 9-10 14-14l42-26ZM63 161c6 2 13 3 20 1l8-4 41-26a28 28 0 0 0 13-31l-5-11a33 33 0 0 0-35-13l-9 4-15 10a9 9 0 0 1-9 0 10 10 0 0 1-6-6v-4a9 9 0 0 1 4-6l41-26 3-1a10 10 0 0 1 10 4l2 6v1l1 1c6 2 12 4 16 8l3 1v-2l1-4a30 30 0 0 0-5-23 33 33 0 0 0-35-13l-8 4-42 26a28 28 0 0 0-13 19 30 30 0 0 0 6 23 33 33 0 0 0 35 13c3 0 5-2 8-3l16-10 2-2a10 10 0 0 1 12 8l1 3a9 9 0 0 1-4 6l-42 26-2 1a10 10 0 0 1-12-10v-1l-2-1c-6-1-11-4-16-8l-2-1-1 2-1 4a30 30 0 0 0 5 23c4 5 10 10 16 12Z\"\n    clip-rule=\"evenodd\"\n  />\n</svg>\n";

const __vite_glob_1_5 = "<svg viewBox=\"0 0 190 190\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path\n    d=\"M149.4 17.0008H185.426L95.3608 172.999L5.2959 17.0008H41.3223L95.3611 110.598L149.4 17.0008Z\"\n    fill=\"currentColor\"\n  />\n  <path\n    d=\"M116.16 17.0007L95.3604 53.0268L74.5613 17.0007H41.3223L95.3611 110.598L149.4 17.0007H116.16Z\"\n    fill=\"currentColor\"\n    fill-opacity=\"0.45\"\n  />\n</svg>\n";

const __vite_glob_1_6 = "<svg viewBox=\"0 0 627 894\" fill=\"none\">\n  <path\n    fill-rule=\"evenodd\"\n    clip-rule=\"evenodd\"\n    d=\"M445.433 22.9832C452.722 32.0324 456.439 44.2432 463.873 68.6647L626.281 602.176C566.234 571.026 500.957 548.56 432.115 536.439L326.371 179.099C324.641 173.252 319.27 169.241 313.173 169.241C307.06 169.241 301.68 173.273 299.963 179.14L195.5 536.259C126.338 548.325 60.7632 570.832 0.459473 602.095L163.664 68.5412C171.121 44.1617 174.85 31.9718 182.14 22.9393C188.575 14.9651 196.946 8.77213 206.454 4.95048C217.224 0.621582 229.971 0.621582 255.466 0.621582H372.034C397.562 0.621582 410.326 0.621582 421.106 4.95951C430.622 8.78908 438.998 14.9946 445.433 22.9832Z\"\n    fill=\"currentColor\"\n  />\n  <path\n    fill-rule=\"evenodd\"\n    clip-rule=\"evenodd\"\n    d=\"M464.867 627.566C438.094 650.46 384.655 666.073 323.101 666.073C247.551 666.073 184.229 642.553 167.426 610.921C161.419 629.05 160.072 649.798 160.072 663.052C160.072 663.052 156.114 728.134 201.38 773.401C201.38 749.896 220.435 730.842 243.939 730.842C284.226 730.842 284.181 765.99 284.144 794.506C284.143 795.36 284.142 796.209 284.142 797.051C284.142 840.333 310.595 877.436 348.215 893.075C342.596 881.518 339.444 868.54 339.444 854.825C339.444 813.545 363.679 798.175 391.845 780.311C414.255 766.098 439.155 750.307 456.315 718.629C465.268 702.101 470.352 683.17 470.352 663.052C470.352 650.68 468.43 638.757 464.867 627.566Z\"\n    fill=\"#FF5D01\"\n  />\n</svg>\n";

const __vite_glob_1_7 = "<svg viewBox=\"0 0 190 190\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path\n    d=\"M137.548 65.935L137.479 65.9052C137.439 65.8904 137.399 65.8755 137.365 65.8408C137.308 65.7797 137.266 65.7064 137.242 65.6265C137.218 65.5466 137.212 65.4623 137.226 65.38L141.056 41.9614L159.019 59.9292L140.338 67.8774C140.286 67.8984 140.23 67.9085 140.174 67.9071H140.1C140.075 67.8923 140.05 67.8725 140.001 67.8229C139.306 67.0488 138.474 66.4089 137.548 65.935V65.935ZM163.603 64.5078L182.809 83.7144C186.798 87.7083 188.795 89.7004 189.524 92.0095C189.633 92.3514 189.722 92.6933 189.791 93.0452L143.891 73.6057C143.866 73.5955 143.841 73.5856 143.816 73.576C143.633 73.5016 143.42 73.4174 143.42 73.2291C143.42 73.0408 143.638 72.9516 143.821 72.8773L143.881 72.8525L163.603 64.5078ZM189.008 99.2095C188.017 101.073 186.085 103.005 182.814 106.281L161.16 127.93L133.153 122.098L133.004 122.068C132.756 122.028 132.494 121.984 132.494 121.761C132.387 120.606 132.044 119.484 131.486 118.467C130.927 117.45 130.166 116.559 129.248 115.849C129.134 115.735 129.164 115.557 129.198 115.393C129.198 115.369 129.198 115.344 129.208 115.324L134.476 82.986L134.496 82.877C134.525 82.6292 134.57 82.3418 134.793 82.3418C135.922 82.2014 137.011 81.8377 137.998 81.272C138.985 80.7062 139.849 79.9497 140.541 79.0466C140.586 78.997 140.615 78.9425 140.675 78.9128C140.833 78.8384 141.022 78.9128 141.185 78.9821L189.003 99.2095H189.008ZM156.18 132.91L120.571 168.519L126.666 131.057L126.676 131.007C126.681 130.958 126.691 130.908 126.706 130.864C126.755 130.745 126.884 130.695 127.008 130.646L127.068 130.621C128.402 130.051 129.582 129.173 130.512 128.059C130.63 127.92 130.774 127.786 130.957 127.762C131.005 127.754 131.054 127.754 131.101 127.762L156.175 132.915L156.18 132.91ZM113.034 176.056L109.021 180.069L64.6463 115.938C64.6302 115.915 64.6137 115.892 64.5967 115.869C64.5273 115.775 64.453 115.681 64.4679 115.572C64.4679 115.492 64.5224 115.423 64.5769 115.364L64.6264 115.299C64.7602 115.101 64.8742 114.903 64.9981 114.69L65.0972 114.516L65.112 114.501C65.1814 114.382 65.2458 114.269 65.3648 114.204C65.4688 114.155 65.6125 114.174 65.7265 114.199L114.888 124.338C115.025 124.359 115.155 124.415 115.264 124.501C115.329 124.566 115.343 124.635 115.358 124.714C115.701 126.012 116.339 127.212 117.223 128.222C118.107 129.232 119.212 130.024 120.452 130.537C120.591 130.606 120.532 130.76 120.467 130.923C120.435 130.995 120.41 131.069 120.393 131.146C119.773 134.912 114.461 167.31 113.034 176.056ZM104.65 184.435C101.692 187.363 99.9475 188.914 97.9753 189.539C96.0307 190.154 93.9438 190.154 91.9993 189.539C89.6901 188.805 87.6931 186.813 83.7042 182.82L39.1416 138.257L50.7815 120.205C50.836 120.116 50.8905 120.036 50.9797 119.972C51.1035 119.883 51.2819 119.922 51.4306 119.972C54.1023 120.778 56.9708 120.633 59.5473 119.561C59.6811 119.511 59.8149 119.476 59.9189 119.571C59.971 119.618 60.0175 119.671 60.0577 119.729L104.65 184.44V184.435ZM34.8454 133.961L24.6227 123.738L44.8104 115.126C44.862 115.103 44.9176 115.091 44.9739 115.091C45.1424 115.091 45.2415 115.26 45.3307 115.413C45.5335 115.725 45.7484 116.029 45.9749 116.325L46.0393 116.404C46.0987 116.488 46.0591 116.573 45.9996 116.652L34.8503 133.961H34.8454ZM20.0985 119.214L7.1653 106.281C4.96517 104.081 3.36957 102.485 2.2596 101.112L41.5845 109.269C41.6339 109.278 41.6835 109.286 41.7332 109.293C41.976 109.333 42.2435 109.378 42.2435 109.606C42.2435 109.853 41.9512 109.967 41.7034 110.062L41.5895 110.111L20.0985 119.214ZM0 94.4624C0.0448161 93.6292 0.194659 92.8051 0.445973 92.0095C1.17935 89.7004 3.17136 87.7083 7.1653 83.7144L23.7159 67.1639C31.3362 78.2234 38.9772 89.2687 46.6389 100.3C46.7727 100.478 46.9213 100.676 46.7677 100.825C46.0442 101.623 45.3208 102.495 44.8104 103.441C44.755 103.563 44.6698 103.669 44.5626 103.749C44.4982 103.788 44.4288 103.773 44.3545 103.758H44.3446L0 94.4574V94.4624ZM28.1459 62.7339L50.39 40.4798C52.4861 41.3965 60.1023 44.6125 66.9059 47.4865C72.0593 49.6669 76.7569 51.649 78.2336 52.2931C78.3822 52.3526 78.516 52.4121 78.5804 52.5607C78.6201 52.6499 78.6002 52.7639 78.5804 52.858C78.2282 54.4644 78.2806 56.1331 78.7329 57.7142C79.1853 59.2953 80.0234 60.7393 81.172 61.9162C81.3207 62.0649 81.172 62.278 81.0432 62.4613L80.9738 62.5654L58.3779 97.5644C58.3184 97.6635 58.2639 97.7477 58.1648 97.8121C58.0459 97.8864 57.8774 97.8518 57.7386 97.8171C56.8598 97.5868 55.9563 97.4637 55.0479 97.4504C54.2353 97.4504 53.3532 97.599 52.4613 97.7626H52.4563C52.3572 97.7774 52.268 97.7972 52.1887 97.7378C52.1012 97.6662 52.0259 97.5809 51.9658 97.4851L28.1409 62.7339H28.1459ZM54.8943 35.9854L83.7042 7.17554C87.6931 3.18656 89.6901 1.1896 91.9993 0.461174C93.9438 -0.153725 96.0307 -0.153725 97.9753 0.461174C100.284 1.1896 102.281 3.18656 106.27 7.17554L112.514 13.4192L92.024 45.1526C91.9734 45.245 91.9042 45.326 91.8209 45.3905C91.697 45.4747 91.5236 45.44 91.3749 45.3905C89.7594 44.9002 88.0488 44.811 86.3911 45.1304C84.7334 45.4499 83.1784 46.1684 81.8608 47.2239C81.727 47.3627 81.5288 47.2834 81.3603 47.209C78.6845 46.0446 57.8724 37.249 54.8943 35.9854V35.9854ZM116.865 17.7699L135.784 36.689L131.225 64.9241V64.9984C131.221 65.0628 131.208 65.1262 131.185 65.1867C131.136 65.2858 131.037 65.3056 130.938 65.3354C129.963 65.6306 129.045 66.0879 128.222 66.6882C128.187 66.7134 128.154 66.7415 128.123 66.7724C128.069 66.8319 128.014 66.8864 127.925 66.8963C127.852 66.8985 127.78 66.8867 127.712 66.8616L98.8821 54.6122L98.8276 54.5874C98.6443 54.5131 98.4262 54.4239 98.4262 54.2356C98.2568 52.629 97.7321 51.0803 96.8901 49.7015C96.7514 49.4736 96.5977 49.2357 96.7167 49.0029L116.865 17.7699ZM97.3807 60.4148L124.407 71.8614C124.555 71.9308 124.719 71.9952 124.783 72.1488C124.809 72.2412 124.809 72.3389 124.783 72.4313C124.704 72.8277 124.635 73.2786 124.635 73.7345V74.4927C124.635 74.681 124.441 74.7603 124.263 74.8346L124.208 74.8544C119.927 76.6829 64.1012 100.488 64.0169 100.488C63.9327 100.488 63.8435 100.488 63.7593 100.404C63.6106 100.255 63.7593 100.047 63.8931 99.8586C63.9167 99.826 63.9398 99.7929 63.9624 99.7595L86.1719 65.3701L86.2115 65.3106C86.3404 65.1025 86.489 64.8696 86.7269 64.8696L86.9499 64.9043C87.4553 64.9736 87.9013 65.0381 88.3522 65.0381C91.7218 65.0381 94.8436 63.3979 96.7266 60.5932C96.7714 60.5183 96.8284 60.4513 96.8951 60.395C97.0289 60.2959 97.2271 60.3454 97.3807 60.4148V60.4148ZM66.4301 105.929L127.281 79.9782C127.281 79.9782 127.37 79.9782 127.454 80.0624C127.786 80.3944 128.069 80.6174 128.341 80.8255L128.475 80.9097C128.599 80.9791 128.723 81.0584 128.733 81.1872C128.733 81.2368 128.733 81.2665 128.723 81.3111L123.51 113.332L123.49 113.461C123.455 113.709 123.421 113.991 123.188 113.991C121.798 114.085 120.452 114.516 119.266 115.247C118.081 115.979 117.091 116.988 116.384 118.188L116.359 118.228C116.29 118.342 116.226 118.451 116.112 118.51C116.007 118.56 115.874 118.54 115.765 118.515L67.2379 108.506C67.1883 108.496 66.4847 105.934 66.4301 105.929V105.929Z\"\n    fill=\"currentColor\"\n  />\n</svg>\n";

const __vite_glob_1_8 = "<svg viewBox=\"0 0 190 190\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path\n    d=\"M113.3 0H111.3V2V20.5996V22.5996H113.3H131.9H133.9V20.5996V2V0H131.9H113.3Z\"\n    fill=\"currentColor\"\n  />\n  <path\n    d=\"M53.5 0C46.3 0 39.3002 1.4002 32.7002 4.2002C26.3002 6.9002 20.6002 10.8002 15.7002 15.7002C10.8002 20.6002 6.9002 26.3002 4.2002 32.7002C1.4002 39.3002 0 46.3 0 53.5V131.9V133.9H2H20.5996H22.5996V131.9V53.2002C22.9996 45.1002 26.3996 37.5004 32.0996 31.9004C37.8996 26.2004 45.4996 22.8996 53.5996 22.5996H94.7998H96.7998V20.5996V2V0H94.7998H53.5Z\"\n    fill=\"currentColor\"\n  />\n  <path\n    d=\"M150.4 74.2002H148.4V76.2002V94.7998V96.7998H150.4H169H171V94.7998V76.2002V74.2002H169H150.4Z\"\n    fill=\"currentColor\"\n  />\n  <path\n    d=\"M150.4 37.0996H148.4V39.0996V57.7002V59.7002H150.4H169H171V57.7002V39.0996V37.0996H169H150.4Z\"\n    fill=\"currentColor\"\n  />\n  <path\n    d=\"M169 0H150.4H148.4V2V20.5996V22.5996H150.4H169H171V20.5996V2V0H169Z\"\n    fill=\"currentColor\"\n  />\n  <path\n    d=\"M150.4 111.3H148.4V113.3V131.9V133.9H150.4H169H171V131.9V113.3V111.3H169H150.4Z\"\n    fill=\"currentColor\"\n  />\n  <path\n    d=\"M150.4 148.4H148.4V150.4V169V171H150.4H169H171V169V150.4V148.4H169H150.4Z\"\n    fill=\"currentColor\"\n  />\n  <path\n    d=\"M113.3 148.4H111.3V150.4V169V171H113.3H131.9H133.9V169V150.4V148.4H131.9H113.3Z\"\n    fill=\"currentColor\"\n  />\n  <path\n    d=\"M76.2002 148.4H74.2002V150.4V169V171H76.2002H94.7998H96.7998V169V150.4V148.4H94.7998H76.2002Z\"\n    fill=\"currentColor\"\n  />\n  <path\n    d=\"M39.0996 148.4H37.0996V150.4V169V171H39.0996H57.7002H59.7002V169V150.4V148.4H57.7002H39.0996Z\"\n    fill=\"currentColor\"\n  />\n  <path\n    d=\"M2 148.4H0V150.4V169V171H2H20.5996H22.5996V169V150.4V148.4H20.5996H2Z\"\n    fill=\"currentColor\"\n  />\n</svg>\n";

const __vite_glob_1_9 = "<svg viewBox=\"0 0 190 190\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M94.9998 13L190 177.546H0L94.9998 13Z\" fill=\"currentColor\" />\n</svg>\n";

const __vite_glob_1_10 = "<!-- source: https://github.com/basmilius/weather-icons -->\n<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n  viewBox=\"0 0 512 512\"\n>\n  <defs>\n    <linearGradient\n      id=\"a\"\n      x1=\"54.33\"\n      y1=\"29.03\"\n      x2=\"187.18\"\n      y2=\"259.13\"\n      gradientUnits=\"userSpaceOnUse\"\n    >\n      <stop offset=\"0\" stop-color=\"currentColor\" />\n      <stop offset=\"0.45\" stop-color=\"currentColor\" />\n      <stop offset=\"1\" stop-color=\"currentColor\" />\n    </linearGradient>\n    <linearGradient\n      id=\"b\"\n      x1=\"294\"\n      y1=\"112.82\"\n      x2=\"330\"\n      y2=\"175.18\"\n      gradientUnits=\"userSpaceOnUse\"\n    >\n      <stop offset=\"0\" stop-color=\"currentColor\" />\n      <stop offset=\"0.45\" stop-color=\"currentColor\" />\n      <stop offset=\"1\" stop-color=\"currentColor\" />\n    </linearGradient>\n    <linearGradient\n      id=\"c\"\n      x1=\"295.52\"\n      y1=\"185.86\"\n      x2=\"316.48\"\n      y2=\"222.14\"\n      xlink:href=\"#b\"\n    />\n    <linearGradient\n      id=\"d\"\n      x1=\"356.29\"\n      y1=\"194.78\"\n      x2=\"387.71\"\n      y2=\"249.22\"\n      xlink:href=\"#b\"\n    />\n    <symbol id=\"e\" viewBox=\"0 0 270 270\" overflow=\"visible\">\n      <!-- moon -->\n      <path\n        d=\"M252.25,168.63C178.13,168.63,118,109.35,118,36.21A130.48,130.48,0,0,1,122.47,3C55.29,10.25,3,66.37,3,134.58,3,207.71,63.09,267,137.21,267,199.69,267,252,224.82,267,167.79A135.56,135.56,0,0,1,252.25,168.63Z\"\n        stroke=\"currentColor\"\n        stroke-linecap=\"round\"\n        stroke-linejoin=\"round\"\n        stroke-width=\"6\"\n        fill=\"url(#a)\"\n      >\n        <animateTransform\n          attributeName=\"transform\"\n          additive=\"sum\"\n          type=\"rotate\"\n          values=\"-15 135 135; 9 135 135; -15 135 135\"\n          dur=\"6s\"\n          repeatCount=\"indefinite\"\n        />\n      </path>\n    </symbol>\n  </defs>\n\n  <!-- star-1 -->\n  <path\n    d=\"M282.83,162.84l24.93-6.42a1.78,1.78,0,0,1,1.71.46l18.37,18a1.8,1.8,0,0,0,3-1.73l-6.42-24.93a1.78,1.78,0,0,1,.46-1.71l18-18.37a1.8,1.8,0,0,0-1.73-3l-24.93,6.42a1.78,1.78,0,0,1-1.71-.46l-18.37-18a1.8,1.8,0,0,0-3,1.73l6.42,24.93a1.78,1.78,0,0,1-.46,1.71l-18,18.37A1.8,1.8,0,0,0,282.83,162.84Z\"\n    stroke=\"currentColor\"\n    stroke-linecap=\"round\"\n    stroke-linejoin=\"round\"\n    stroke-width=\"2\"\n    fill=\"url(#b)\"\n  >\n    <animateTransform\n      attributeName=\"transform\"\n      additive=\"sum\"\n      type=\"rotate\"\n      values=\"-15 312 144; 15 312 144; -15 312 144\"\n      dur=\"6s\"\n      calcMode=\"spline\"\n      keySplines=\".42, 0, .58, 1; .42, 0, .58, 1\"\n      repeatCount=\"indefinite\"\n    />\n\n    <animate\n      attributeName=\"opacity\"\n      values=\"1; .75; 1; .75; 1; .75; 1\"\n      dur=\"6s\"\n    />\n  </path>\n\n  <!-- star-2 -->\n  <path\n    d=\"M285.4,193.44l12,12.25a1.19,1.19,0,0,1,.3,1.14l-4.28,16.62a1.2,1.2,0,0,0,2,1.15l12.25-12a1.19,1.19,0,0,1,1.14-.3l16.62,4.28a1.2,1.2,0,0,0,1.15-2l-12-12.25a1.19,1.19,0,0,1-.3-1.14l4.28-16.62a1.2,1.2,0,0,0-2-1.15l-12.25,12a1.19,1.19,0,0,1-1.14.3l-16.62-4.28A1.2,1.2,0,0,0,285.4,193.44Z\"\n    stroke=\"currentColor\"\n    stroke-linecap=\"round\"\n    stroke-linejoin=\"round\"\n    stroke-width=\"2\"\n    fill=\"url(#c)\"\n  >\n    <animateTransform\n      attributeName=\"transform\"\n      additive=\"sum\"\n      type=\"rotate\"\n      values=\"-15 306 204; 15 306 204; -15 306 204\"\n      begin=\"-.33s\"\n      dur=\"6s\"\n      calcMode=\"spline\"\n      keySplines=\".42, 0, .58, 1; .42, 0, .58, 1\"\n      repeatCount=\"indefinite\"\n    />\n\n    <animate\n      attributeName=\"opacity\"\n      values=\"1; .75; 1; .75; 1; .75; 1\"\n      begin=\"-.33s\"\n      dur=\"6s\"\n    />\n  </path>\n\n  <!-- star-3 -->\n  <path\n    d=\"M337.32,223.73l24.8,6.9a1.83,1.83,0,0,1,1.25,1.25l6.9,24.8a1.79,1.79,0,0,0,3.46,0l6.9-24.8a1.83,1.83,0,0,1,1.25-1.25l24.8-6.9a1.79,1.79,0,0,0,0-3.46l-24.8-6.9a1.83,1.83,0,0,1-1.25-1.25l-6.9-24.8a1.79,1.79,0,0,0-3.46,0l-6.9,24.8a1.83,1.83,0,0,1-1.25,1.25l-24.8,6.9A1.79,1.79,0,0,0,337.32,223.73Z\"\n    stroke=\"currentColor\"\n    stroke-linecap=\"round\"\n    stroke-linejoin=\"round\"\n    stroke-width=\"2\"\n    fill=\"url(#d)\"\n  >\n    <animateTransform\n      attributeName=\"transform\"\n      additive=\"sum\"\n      type=\"rotate\"\n      values=\"-15 372 222; 15 372 222; -15 372 222\"\n      begin=\"-.67s\"\n      dur=\"6s\"\n      calcMode=\"spline\"\n      keySplines=\".42, 0, .58, 1; .42, 0, .58, 1\"\n      repeatCount=\"indefinite\"\n    />\n\n    <animate\n      attributeName=\"opacity\"\n      values=\"1; .75; 1; .75; 1; .75; 1\"\n      begin=\"-.67s\"\n      dur=\"6s\"\n    />\n  </path>\n\n  <use\n    width=\"270\"\n    height=\"270\"\n    transform=\"translate(121 121)\"\n    xlink:href=\"#e\"\n  />\n</svg>\n";

const __vite_glob_1_11 = "<!-- source: https://github.com/basmilius/weather-icons -->\n<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n  viewBox=\"0 0 512 512\"\n>\n  <defs>\n    <linearGradient\n      id=\"a\"\n      x1=\"149.99\"\n      y1=\"119.24\"\n      x2=\"234.01\"\n      y2=\"264.76\"\n      gradientUnits=\"userSpaceOnUse\"\n    >\n      <stop offset=\"0\" stop-color=\"currentColor\" />\n      <stop offset=\"0.45\" stop-color=\"currentColor\" />\n      <stop offset=\"1\" stop-color=\"currentColor\" />\n    </linearGradient>\n    <symbol id=\"b\" viewBox=\"0 0 384 384\">\n      <!-- core -->\n      <circle\n        cx=\"192\"\n        cy=\"192\"\n        r=\"84\"\n        stroke=\"currentColor\"\n        stroke-miterlimit=\"10\"\n        stroke-width=\"6\"\n        fill=\"url(#a)\"\n      />\n\n      <!-- rays -->\n      <path\n        d=\"M192,61.66V12m0,360V322.34M284.17,99.83l35.11-35.11M64.72,319.28l35.11-35.11m0-184.34L64.72,64.72M319.28,319.28l-35.11-35.11M61.66,192H12m360,0H322.34\"\n        fill=\"none\"\n        stroke=\"currentColor\"\n        stroke-linecap=\"round\"\n        stroke-miterlimit=\"10\"\n        stroke-width=\"24\"\n      >\n        <animateTransform\n          attributeName=\"transform\"\n          additive=\"sum\"\n          type=\"rotate\"\n          values=\"0 192 192; 45 192 192\"\n          dur=\"6s\"\n          repeatCount=\"indefinite\"\n        />\n      </path>\n    </symbol>\n  </defs>\n  <use width=\"384\" height=\"384\" transform=\"translate(64 64)\" xlink:href=\"#b\" />\n</svg>\n";

const __vite_glob_1_12 = "<svg viewBox=\"0 0 1847 457\" fill=\"none\">\n  <path\n    d=\"M134.148 456.833C202.08 456.833 253.03 432.665 273.93 391.516C273.93 411.111 275.23 431.36 278.5 447.036H390.19C384.97 424.173 382.36 392.82 382.36 351.671V251.081C382.36 155.717 326.18 110.648 201.43 110.648C92.3441 110.648 19.188 155.717 10.697 229.527H126.963C130.882 197.521 157.66 179.885 201.43 179.885C244.53 179.885 268.7 197.521 268.7 234.1V243.896L150.48 254.347C92.997 260.227 60.338 270.023 37.477 285.7C13.31 302.028 0.898987 326.851 0.898987 357.549C0.898987 418.948 51.847 456.833 134.148 456.833ZM177.26 388.902C139.37 388.902 116.512 373.88 116.512 349.712C116.512 324.892 135.45 311.827 183.14 305.949L270.66 296.805V316.4C270.66 360.163 232.78 388.902 177.26 388.902Z\"\n    fill=\"currentColor\"\n  />\n  <path\n    d=\"M625.77 456.833C739.43 456.833 797.56 414.377 797.56 345.793C797.56 288.966 764.9 257.613 685.87 247.162L587.23 236.059C559.15 232.138 547.39 224.953 547.39 209.277C547.39 190.336 566.33 181.844 609.44 181.844C668.88 181.844 710.03 195.561 743.35 222.342L796.25 169.434C759.67 131.55 696.32 110.648 617.94 110.648C507.55 110.648 446.15 149.838 446.15 215.809C446.15 273.289 484.03 305.295 562.41 315.745L651.25 326.196C686.52 330.769 696.97 337.302 696.97 354.283C696.97 373.88 677.37 384.331 631.65 384.331C563.72 384.331 518 366.041 487.3 332.076L427.21 381.717C467.05 431.36 534.98 456.833 625.77 456.833Z\"\n    fill=\"currentColor\"\n  />\n  <path\n    d=\"M889.78 194.255V332.076C889.78 413.07 935.5 454.221 1033.48 454.221C1063.53 454.221 1087.04 450.955 1109.25 444.423V359.508C1097.49 362.122 1083.12 364.734 1064.18 364.734C1023.03 364.734 1002.78 346.446 1002.78 307.908V194.255H1109.9V120.445H1002.78V0.914001L889.78 42.717V120.445H816.62V194.255H889.78Z\"\n    fill=\"currentColor\"\n  />\n  <path\n    d=\"M1272.13 120.445H1168.93V447.036H1281.93V324.892C1281.93 289.618 1289.77 257.613 1311.33 237.364C1328.31 221.687 1352.48 213.198 1386.44 213.198C1398.85 213.198 1408.65 214.502 1419.75 215.809V113.26C1412.57 111.954 1407.34 111.954 1398.2 111.954C1333.53 111.954 1289.77 149.185 1272.13 209.932V120.445Z\"\n    fill=\"currentColor\"\n  />\n  <path\n    d=\"M1643.05 456.833C1762.59 456.833 1846.85 393.475 1846.85 283.088C1846.85 173.353 1762.59 110.648 1643.05 110.648C1522.87 110.648 1438.61 173.353 1438.61 283.088C1438.61 393.475 1522.87 456.833 1643.05 456.833ZM1643.05 381.717C1588.19 381.717 1553.57 346.446 1553.57 283.088C1553.57 219.728 1588.19 185.763 1643.05 185.763C1697.27 185.763 1731.89 219.728 1731.89 283.088C1731.89 346.446 1697.27 381.717 1643.05 381.717Z\"\n    fill=\"currentColor\"\n  />\n</svg>\n";

const SPRITESHEET_NAMESPACE = `astroicon`;

const $$module1$9 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	SPRITESHEET_NAMESPACE
}, Symbol.toStringTag, { value: 'Module' }));

const baseURL = "https://api.astroicon.dev/v1/";
const requests = /* @__PURE__ */ new Map();
const fetchCache = /* @__PURE__ */ new Map();
async function get(pack, name) {
  const url = new URL(`./${pack}/${name}`, baseURL).toString();
  if (requests.has(url)) {
    return await requests.get(url);
  }
  if (fetchCache.has(url)) {
    return fetchCache.get(url);
  }
  let request = async () => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(await res.text());
    }
    const contentType = res.headers.get("Content-Type");
    if (!contentType.includes("svg")) {
      throw new Error(`[astro-icon] Unable to load "${name}" because it did not resolve to an SVG!

Recieved the following "Content-Type":
${contentType}`);
    }
    const svg = await res.text();
    fetchCache.set(url, svg);
    requests.delete(url);
    return svg;
  };
  let promise = request();
  requests.set(url, promise);
  return await promise;
}

const splitAttrsTokenizer = /([a-z0-9_\:\-]*)\s*?=\s*?(['"]?)(.*?)\2\s+/gim;
const domParserTokenizer = /(?:<(\/?)([a-zA-Z][a-zA-Z0-9\:]*)(?:\s([^>]*?))?((?:\s*\/)?)>|(<\!\-\-)([\s\S]*?)(\-\->)|(<\!\[CDATA\[)([\s\S]*?)(\]\]>))/gm;
const splitAttrs = (str) => {
  let res = {};
  let token;
  if (str) {
    splitAttrsTokenizer.lastIndex = 0;
    str = " " + (str || "") + " ";
    while (token = splitAttrsTokenizer.exec(str)) {
      res[token[1]] = token[3];
    }
  }
  return res;
};
function optimizeSvg(contents, name, options) {
  return optimize(contents, {
    plugins: [
      "removeDoctype",
      "removeXMLProcInst",
      "removeComments",
      "removeMetadata",
      "removeXMLNS",
      "removeEditorsNSData",
      "cleanupAttrs",
      "minifyStyles",
      "convertStyleToAttrs",
      {
        name: "cleanupIDs",
        params: { prefix: `${SPRITESHEET_NAMESPACE}:${name}` }
      },
      "removeRasterImages",
      "removeUselessDefs",
      "cleanupNumericValues",
      "cleanupListOfValues",
      "convertColors",
      "removeUnknownsAndDefaults",
      "removeNonInheritableGroupAttrs",
      "removeUselessStrokeAndFill",
      "removeViewBox",
      "cleanupEnableBackground",
      "removeHiddenElems",
      "removeEmptyText",
      "convertShapeToPath",
      "moveElemsAttrsToGroup",
      "moveGroupAttrsToElems",
      "collapseGroups",
      "convertPathData",
      "convertTransform",
      "removeEmptyAttrs",
      "removeEmptyContainers",
      "mergePaths",
      "removeUnusedNS",
      "sortAttrs",
      "removeTitle",
      "removeDesc",
      "removeDimensions",
      "removeStyleElement",
      "removeScriptElement"
    ]
  }).data;
}
const preprocessCache = /* @__PURE__ */ new Map();
function preprocess(contents, name, { optimize }) {
  if (preprocessCache.has(contents)) {
    return preprocessCache.get(contents);
  }
  if (optimize) {
    contents = optimizeSvg(contents, name);
  }
  domParserTokenizer.lastIndex = 0;
  let result = contents;
  let token;
  if (contents) {
    while (token = domParserTokenizer.exec(contents)) {
      const tag = token[2];
      if (tag === "svg") {
        const attrs = splitAttrs(token[3]);
        result = contents.slice(domParserTokenizer.lastIndex).replace(/<\/svg>/gim, "").trim();
        const value = { innerHTML: result, defaultProps: attrs };
        preprocessCache.set(contents, value);
        return value;
      }
    }
  }
}
function normalizeProps(inputProps) {
  const size = inputProps.size;
  delete inputProps.size;
  const w = inputProps.width ?? size;
  const h = inputProps.height ?? size;
  const width = w ? toAttributeSize(w) : void 0;
  const height = h ? toAttributeSize(h) : void 0;
  return { ...inputProps, width, height };
}
const toAttributeSize = (size) => String(size).replace(/(?<=[0-9])x$/, "em");
const fallback = {
  innerHTML: '<rect width="24" height="24" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />',
  props: {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    "aria-hidden": "true"
  }
};
async function load(name, inputProps, optimize) {
  const key = name;
  if (!name) {
    throw new Error("<Icon> requires a name!");
  }
  let svg = "";
  let filepath = "";
  if (name.includes(":")) {
    const [pack, ..._name] = name.split(":");
    name = _name.join(":");
    filepath = `/src/icons/${pack}`;
    let get$1;
    try {
      const files = /* #__PURE__ */ Object.assign({});
      const keys = Object.fromEntries(
        Object.keys(files).map((key2) => [key2.replace(/\.[cm]?[jt]s$/, ""), key2])
      );
      if (!(filepath in keys)) {
        throw new Error(`Could not find the file "${filepath}"`);
      }
      const mod = files[keys[filepath]];
      if (typeof mod.default !== "function") {
        throw new Error(
          `[astro-icon] "${filepath}" did not export a default function!`
        );
      }
      get$1 = mod.default;
    } catch (e) {
    }
    if (typeof get$1 === "undefined") {
      get$1 = get.bind(null, pack);
    }
    const contents = await get$1(name);
    if (!contents) {
      throw new Error(
        `<Icon pack="${pack}" name="${name}" /> did not return an icon!`
      );
    }
    if (!/<svg/gim.test(contents)) {
      throw new Error(
        `Unable to process "<Icon pack="${pack}" name="${name}" />" because an SVG string was not returned!

Recieved the following content:
${contents}`
      );
    }
    svg = contents;
  } else {
    filepath = `/src/icons/${name}.svg`;
    try {
      const files = /* #__PURE__ */ Object.assign({"/src/icons/frameworks/lit.svg": __vite_glob_1_0,"/src/icons/frameworks/preact.svg": __vite_glob_1_1,"/src/icons/frameworks/react.svg": __vite_glob_1_2,"/src/icons/frameworks/solid.svg": __vite_glob_1_3,"/src/icons/frameworks/svelte.svg": __vite_glob_1_4,"/src/icons/frameworks/vue.svg": __vite_glob_1_5,"/src/icons/logomark.svg": __vite_glob_1_6,"/src/icons/platforms/netlify.svg": __vite_glob_1_7,"/src/icons/platforms/render.svg": __vite_glob_1_8,"/src/icons/platforms/vercel.svg": __vite_glob_1_9,"/src/icons/theme/dark.svg": __vite_glob_1_10,"/src/icons/theme/light.svg": __vite_glob_1_11,"/src/icons/wordmark.svg": __vite_glob_1_12});
      if (!(filepath in files)) {
        throw new Error(`Could not find the file "${filepath}"`);
      }
      const contents = files[filepath];
      if (!/<svg/gim.test(contents)) {
        throw new Error(
          `Unable to process "${filepath}" because it is not an SVG!

Recieved the following content:
${contents}`
        );
      }
      svg = contents;
    } catch (e) {
      throw new Error(
        `[astro-icon] Unable to load "${filepath}". Does the file exist?`
      );
    }
  }
  const { innerHTML, defaultProps } = preprocess(svg, key, { optimize });
  if (!innerHTML.trim()) {
    throw new Error(`Unable to parse "${filepath}"!`);
  }
  return {
    innerHTML,
    props: { ...defaultProps, ...normalizeProps(inputProps) }
  };
}

const $$module2$7 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	preprocess,
	normalizeProps,
	fallback,
	default: load
}, Symbol.toStringTag, { value: 'Module' }));

const $$module4$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null
}, Symbol.toStringTag, { value: 'Module' }));

createMetadata("/@fs/Users/ian2/paigepotterdesign/node_modules/astro-icon/lib/Icon.astro", { modules: [{ module: $$module2$7, specifier: "./utils.ts", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$n = createAstro("/@fs/Users/ian2/paigepotterdesign/node_modules/astro-icon/lib/Icon.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$Icon = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$n, $$props, $$slots);
  Astro2.self = $$Icon;
  let { name, pack, title, optimize = true, class: className, ...inputProps } = Astro2.props;
  let props = {};
  if (pack) {
    name = `${pack}:${name}`;
  }
  let innerHTML = "";
  try {
    const svg = await load(name, { ...inputProps, class: className }, optimize);
    innerHTML = svg.innerHTML;
    props = svg.props;
  } catch (e) {
    if ((Object.assign({"BASE_URL":"/","MODE":"production","DEV":false,"PROD":true},{_:process.env._,})).MODE === "production") {
      throw new Error(`[astro-icon] Unable to load icon "${name}"!
${e}`);
    }
    innerHTML = fallback.innerHTML;
    props = { ...fallback.props, ...normalizeProps(inputProps) };
    title = `Failed to load "${name}"!`;
    console.error(e);
  }
  return renderTemplate`${maybeRenderHead($$result)}<svg${spreadAttributes(props)}${addAttribute(name, "astro-icon")}>${markHTMLString((title ? `<title>${title}</title>` : "") + innerHTML)}</svg>`;
});

const AstroIcon = Symbol("AstroIcon");
function trackSprite(result, name) {
  if (typeof result[AstroIcon] !== "undefined") {
    result[AstroIcon]["sprites"].add(name);
  } else {
    result[AstroIcon] = {
      sprites: /* @__PURE__ */ new Set([name])
    };
  }
}
const warned = /* @__PURE__ */ new Set();
async function getUsedSprites(result) {
  if (typeof result[AstroIcon] !== "undefined") {
    return Array.from(result[AstroIcon]["sprites"]);
  }
  const pathname = result._metadata.pathname;
  if (!warned.has(pathname)) {
    console.log(`[astro-icon] No sprites found while rendering "${pathname}"`);
    warned.add(pathname);
  }
  return [];
}

const $$module3$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	trackSprite,
	getUsedSprites
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$j = createMetadata("/@fs/Users/ian2/paigepotterdesign/node_modules/astro-icon/lib/Spritesheet.astro", { modules: [{ module: $$module1$9, specifier: "./constants", assert: {} }, { module: $$module2$7, specifier: "./utils.ts", assert: {} }, { module: $$module3$3, specifier: "./context.ts", assert: {} }, { module: $$module4$1, specifier: "./Props.ts", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$m = createAstro("/@fs/Users/ian2/paigepotterdesign/node_modules/astro-icon/lib/Spritesheet.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$Spritesheet = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$m, $$props, $$slots);
  Astro2.self = $$Spritesheet;
  const { optimize = true, style, ...props } = Astro2.props;
  const names = await getUsedSprites($$result);
  const icons = await Promise.all(names.map((name) => {
    return load(name, {}, optimize).then((res) => ({ ...res, name })).catch((e) => {
      if ((Object.assign({"BASE_URL":"/","MODE":"production","DEV":false,"PROD":true},{_:process.env._,})).MODE === "production") {
        throw new Error(`[astro-icon] Unable to load icon "${name}"!
${e}`);
      }
      return { ...fallback, name };
    });
  }));
  return renderTemplate`${maybeRenderHead($$result)}<svg${addAttribute(`display: none; ${style ?? ""}`.trim(), "style")}${spreadAttributes({ "aria-hidden": true, ...props })} astro-icon-spritesheet>
    ${icons.map((icon) => renderTemplate`<symbol${spreadAttributes(icon.props)}${addAttribute(`${SPRITESHEET_NAMESPACE}:${icon.name}`, "id")}>${markHTMLString(icon.innerHTML)}</symbol>`)}
</svg>`;
});

const $$file$j = "/Users/ian2/paigepotterdesign/node_modules/astro-icon/lib/Spritesheet.astro";
const $$url$j = undefined;

const $$module1$8 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$j,
	default: $$Spritesheet,
	file: $$file$j,
	url: $$url$j
}, Symbol.toStringTag, { value: 'Module' }));

createMetadata("/@fs/Users/ian2/paigepotterdesign/node_modules/astro-icon/lib/SpriteProvider.astro", { modules: [{ module: $$module1$8, specifier: "./Spritesheet.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$l = createAstro("/@fs/Users/ian2/paigepotterdesign/node_modules/astro-icon/lib/SpriteProvider.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$SpriteProvider = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$l, $$props, $$slots);
  Astro2.self = $$SpriteProvider;
  const content = await Astro2.slots.render("default");
  return renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": () => renderTemplate`${markHTMLString(content)}` })}
${renderComponent($$result, "Spritesheet", $$Spritesheet, {})}
`;
});

createMetadata("/@fs/Users/ian2/paigepotterdesign/node_modules/astro-icon/lib/Sprite.astro", { modules: [{ module: $$module1$9, specifier: "./constants", assert: {} }, { module: $$module2$7, specifier: "./utils.ts", assert: {} }, { module: $$module3$3, specifier: "./context.ts", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$k = createAstro("/@fs/Users/ian2/paigepotterdesign/node_modules/astro-icon/lib/Sprite.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$Sprite = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$k, $$props, $$slots);
  Astro2.self = $$Sprite;
  let { name, pack, title, class: className, x, y, ...inputProps } = Astro2.props;
  const props = normalizeProps(inputProps);
  if (pack) {
    name = `${pack}:${name}`;
  }
  const href = `#${SPRITESHEET_NAMESPACE}:${name}`;
  trackSprite($$result, name);
  return renderTemplate`${maybeRenderHead($$result)}<svg${spreadAttributes(props)}${addAttribute(className, "class")}${addAttribute(name, "astro-icon")}>
    ${title ? renderTemplate`<title>${title}</title>` : ""}
    <use${spreadAttributes({ "xlink:href": href, width: props.width, height: props.height, x, y })}></use>
</svg>`;
});

const deprecate = (component, message) => {
  return (...args) => {
    console.warn(message);
    return component(...args);
  };
};
const Spritesheet = deprecate(
  $$Spritesheet,
  `Direct access to <Spritesheet /> has been deprecated! Please wrap your contents in <Sprite.Provider> instead!`
);
const SpriteSheet = deprecate(
  $$Spritesheet,
  `Direct access to <SpriteSheet /> has been deprecated! Please wrap your contents in <Sprite.Provider> instead!`
);
const Sprite = Object.assign($$Sprite, { Provider: $$SpriteProvider });

const $$module1$7 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Icon,
	Icon: $$Icon,
	Spritesheet,
	SpriteSheet,
	SpriteProvider: $$SpriteProvider,
	Sprite
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$i = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/components/compatibility-list.astro", { modules: [{ module: $$module1$7, specifier: "astro-icon", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$j = createAstro("/@fs/Users/ian2/paigepotterdesign/src/components/compatibility-list.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$CompatibilityList = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$j, $$props, $$slots);
  Astro2.self = $$CompatibilityList;
  const { title, data, url } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<div class="w-full max-w-6xl space-y-2">
  <div class="relative px-6 pt-8 pb-4 border bg-offset border-default">
    <h3 class="absolute top-0 px-4 py-1 text-xs tracking-tight uppercase -translate-y-1/2 border border-current rounded-full right-4 bg-default">
      ${title}
    </h3>
    <ul class="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-6">
      ${data.map(({ title: title2, icon, url: url2 }) => renderTemplate`<li>
            <a class="flex flex-col items-center gap-2"${addAttribute(url2, "href")}>
              ${renderComponent($$result, "Icon", $$Icon, { "class": "h-12", "name": icon })}
              <span>${title2}</span>
            </a>
          </li>`)}
    </ul>
  </div>
  <p class="text-sm text-right">
    <a class="text-primary"${addAttribute(url, "href")}> ...and more &rarr;</a>
  </p>
</div>`;
});

const $$file$i = "/Users/ian2/paigepotterdesign/src/components/compatibility-list.astro";
const $$url$i = undefined;

const $$module2$6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$i,
	default: $$CompatibilityList,
	file: $$file$i,
	url: $$url$i
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$h = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/components/compatibility.astro", { modules: [{ module: $$module1$a, specifier: "~/components/content-section.astro", assert: {} }, { module: $$module2$6, specifier: "~/components/compatibility-list.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$i = createAstro("/@fs/Users/ian2/paigepotterdesign/src/components/compatibility.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$Compatibility = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$i, $$props, $$slots);
  Astro2.self = $$Compatibility;
  const frameworks = [
    {
      title: "React",
      icon: "frameworks/react",
      url: "https://reactjs.org/"
    },
    {
      title: "Preact",
      icon: "frameworks/preact",
      url: "https://preactjs.com/"
    },
    {
      title: "Svelte",
      icon: "frameworks/svelte",
      url: "https://svelte.dev/"
    },
    {
      title: "Vue",
      icon: "frameworks/vue",
      url: "https://vuejs.org/"
    },
    {
      title: "Solid",
      icon: "frameworks/solid",
      url: "https://www.solidjs.com/"
    },
    {
      title: "Lit",
      icon: "frameworks/lit",
      url: "https://lit.dev/"
    }
  ];
  const platforms = [
    {
      title: "Netlify",
      icon: "platforms/netlify",
      url: "https://www.netlify.com/"
    },
    {
      title: "Vercel",
      icon: "platforms/vercel",
      url: "https://vercel.com/"
    },
    {
      title: "Cloudflare",
      icon: "fa-brands:cloudflare",
      url: "https://pages.cloudflare.com/"
    },
    {
      title: "Render",
      icon: "platforms/render",
      url: "https://render.com/"
    },
    {
      title: "GitHub",
      icon: "fa-brands:github",
      url: "https://pages.github.com/"
    },
    {
      title: "GitLab",
      icon: "fa-brands:gitlab",
      url: "https://docs.gitlab.com/ee/user/project/pages/"
    }
  ];
  return renderTemplate`${renderComponent($$result, "ContentSection", $$ContentSection, { "title": "Compatibility", "id": "compatibility" }, { "default": () => renderTemplate`${renderComponent($$result, "CompatibilityList", $$CompatibilityList, { "title": "Frameworks", "data": frameworks, "url": "https://docs.astro.build/core-concepts/framework-components/" })}${renderComponent($$result, "CompatibilityList", $$CompatibilityList, { "title": "Platforms", "data": platforms, "url": "https://docs.astro.build/guides/deploy/" })}`, "lead": () => renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "slot": "lead" }, { "default": () => renderTemplate`
    Astro ${maybeRenderHead($$result)}<span class="text-primary">plays nice</span>. Bring your own UI${" "}<span class="text-primary">framework</span>
    and deploy to your favorite <span class="text-primary">platform</span>.
  ` })}` })}`;
});

const $$file$h = "/Users/ian2/paigepotterdesign/src/components/compatibility.astro";
const $$url$h = undefined;

const $$module1$6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$h,
	default: $$Compatibility,
	file: $$file$h,
	url: $$url$h
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$g = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/components/features.astro", { modules: [{ module: $$module1$a, specifier: "~/components/content-section.astro", assert: {} }, { module: $$module1$7, specifier: "astro-icon", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$h = createAstro("/@fs/Users/ian2/paigepotterdesign/src/components/features.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$Features = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$h, $$props, $$slots);
  Astro2.self = $$Features;
  const features = [
    {
      title: "Bring Your Own Framework",
      description: "Build your site using React, Svelte, Vue, Preact, web components, or just plain ol' HTML + JavaScript.",
      icon: "mdi:handshake"
    },
    {
      title: "100% Static HTML, No JS",
      description: "Astro renders your entire page to static HTML, removing all JavaScript from your final build by default.",
      icon: "mdi:feather"
    },
    {
      title: "On-Demand Components",
      description: "Need some JS? Astro can automatically hydrate interactive components when they become visible on the page. If the user never sees it, they never load it.",
      icon: "mdi:directions-fork"
    },
    {
      title: "Broad Integration",
      description: "Astro supports TypeScript, Scoped CSS, CSS Modules, Sass, Tailwind, Markdown, MDX, and any of your favorite npm packages.",
      icon: "mdi:graph"
    },
    {
      title: "SEO Enabled",
      description: "Automatic sitemaps, RSS feeds, pagination and collections take the pain out of SEO and syndication.",
      icon: "mdi:search-web"
    },
    {
      title: "Community",
      description: "Astro is an open source project powered by hundreds of contributors making thousands of individual contributions.",
      icon: "mdi:account-group"
    }
  ];
  return renderTemplate`${renderComponent($$result, "ContentSection", $$ContentSection, { "title": "Features", "id": "features" }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<ul class="grid max-w-6xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    ${features.map(({ title, description, icon }) => renderTemplate`<li class="flex flex-col items-center gap-4 p-6 border border-default bg-offset">
          <div class="w-16 h-16 p-3 border-2 border-current rounded-full">
            ${renderComponent($$result, "Icon", $$Icon, { "name": icon })}
          </div>
          <p class="text-xl font-extrabold text-center">${title}</p>
          <p class="text-sm text-center text-offset">${description}</p>
        </li>`)}
  </ul>`, "lead": () => renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "slot": "lead" }, { "default": () => renderTemplate`
    Astro comes <span class="text-primary">batteries included</span>. It takes
    the best parts of
    <span class="text-primary">state-of-the-art</span>
    tools and adds its own <span class="text-primary">innovations</span>.
  ` })}` })}`;
});

const $$file$g = "/Users/ian2/paigepotterdesign/src/components/features.astro";
const $$url$g = undefined;

const $$module2$5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$g,
	default: $$Features,
	file: $$file$g,
	url: $$url$g
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$f = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/components/intro.astro", { modules: [{ module: $$module1$7, specifier: "astro-icon", assert: {} }, { module: $$module1$a, specifier: "~/components/content-section.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$g = createAstro("/@fs/Users/ian2/paigepotterdesign/src/components/intro.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$Intro = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$g, $$props, $$slots);
  Astro2.self = $$Intro;
  return renderTemplate`${renderComponent($$result, "ContentSection", $$ContentSection, { "title": "Just ship less", "id": "intro" }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
    <a href="https://docs.astro.build/" class="flex items-center justify-center gap-3 px-6 py-4 border-2 border-current">
      ${renderComponent($$result, "Icon", $$Icon, { "pack": "mdi", "name": "telescope", "class": "h-8" })}
      <span>Read the docs</span>
    </a>
    <a href="https://astro.new/" class="flex items-center justify-center gap-3 px-6 py-4 border-2 border-current">
      ${renderComponent($$result, "Icon", $$Icon, { "pack": "mdi", "name": "rocket", "class": "h-8" })}
      <span>Try it out</span>
    </a>
  </div>`, "eyebrow": () => renderTemplate`${renderComponent($$result, "Icon", $$Icon, { "slot": "eyebrow", "name": "logomark", "class": "h-32" })}`, "lead": () => renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "slot": "lead" }, { "default": () => renderTemplate`
    Astro is a new kind of site builder for the
    <span class="text-primary">modern</span> web.
    <span class="text-primary">Lightning-fast</span>
    performance meets <span class="text-primary">powerful</span> developer experience.
  ` })}` })}`;
});

const $$file$f = "/Users/ian2/paigepotterdesign/src/components/intro.astro";
const $$url$f = undefined;

const $$module3$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$f,
	default: $$Intro,
	file: $$file$f,
	url: $$url$f
}, Symbol.toStringTag, { value: 'Module' }));

const defaultOptions$1 = {
  outputDir: "public/assets/images",
  urlPath: "/assets/images"
};
function generateImage(src, options) {
  const settings = Object.assign(defaultOptions$1, options);
  (async () => {
    await Image__default(src, settings);
  })();
  return Image__default.statsSync(src, settings);
}

const $$module2$4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	generateImage
}, Symbol.toStringTag, { value: 'Module' }));

const cjs = createRequire(import.meta.url);
const sharp = cjs("sharp");
const DataURIParser = cjs("datauri/parser");
const cache = {};
const defaultOptions = {
  quality: 60,
  outputDir: "src/assets/placeholders"
};
async function generatePlaceholder(src, options = defaultOptions) {
  options = Object.assign({}, defaultOptions, options);
  options.outputDir = options.outputDir.endsWith("/") ? options.outputDir : options.outputDir + "/";
  const hash = getHash({ path: src, options });
  try {
    const existingFile = readFileSync(options.outputDir + hash + ".placeholder", {
      encoding: "utf-8"
    });
    return JSON.parse(existingFile);
  } catch (err) {
    if (err.code === "ENOENT") {
      return await getDataURI(src, hash, options);
    }
  }
}
function getHash(options) {
  const hash = createHash("sha256");
  hash.update(JSON.stringify(options));
  return hash.digest("base64url").substring(0, 5);
}
async function getDataURI(src, hash, options) {
  if (cache[src] && cache[src].quality === options.quality) {
    return cache[src];
  }
  const image = await sharp(src);
  const imageMetadata = await image.metadata();
  const placeholderDimension = getBitmapDimensions(imageMetadata.width, imageMetadata.height, options.quality);
  const buffer = await image.rotate().resize(placeholderDimension.width, placeholderDimension.height).png().toBuffer();
  const parser = new DataURIParser();
  const data = {
    dataURI: parser.format(".png", buffer).content,
    width: imageMetadata.width,
    height: imageMetadata.height,
    quality: options.quality
  };
  cache[src] = data;
  mkdir(options.outputDir, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
    }
    writeFile(options.outputDir + hash + ".placeholder", JSON.stringify(data), (err2) => {
      if (err2) {
        console.error(err2);
      }
    });
  });
  return data;
}
function getBitmapDimensions(imgWidth, imgHeight, pixelTarget) {
  const ratioWH = imgWidth / imgHeight;
  let bitmapHeight = pixelTarget / ratioWH;
  bitmapHeight = Math.sqrt(bitmapHeight);
  const bitmapWidth = pixelTarget / bitmapHeight;
  return { width: Math.round(bitmapWidth), height: Math.round(bitmapHeight) };
}

const $$module3$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	generatePlaceholder
}, Symbol.toStringTag, { value: 'Module' }));

createMetadata("/@fs/Users/ian2/paigepotterdesign/node_modules/astro-eleventy-img/src/Image.astro", { modules: [{ module: Image, specifier: "@11ty/eleventy-img", assert: {} }, { module: $$module2$4, specifier: "./main", assert: {} }, { module: $$module3$1, specifier: "./placeholder", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$f = createAstro("/@fs/Users/ian2/paigepotterdesign/node_modules/astro-eleventy-img/src/Image.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$Image = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$f, $$props, $$slots);
  Astro2.self = $$Image;
  const { src, alt, caption, options = {}, sizes = "", classes = void 0, quality = 90, placeholderOptions = {} } = Astro2.props;
  const image = generateImage(
    src,
    Object.assign(options, {
      widths: [null],
      formats: ["avif", "webp", "png"],
      sharpWebpOptions: {
        quality
      },
      sharpAvifOptions: {
        quality
      }
    })
  );
  const placeHolder = await generatePlaceholder(src, placeholderOptions);
  const imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
    style: `background-size: cover;background-image:url(${placeHolder?.dataURI})`,
    onload: `this.style.backgroundImage='none'`
  };
  const html = Image__default.generateHTML(image, imageAttributes);
  const props = {
    class: classes
  };
  return renderTemplate`${maybeRenderHead($$result)}<figure${spreadAttributes(props)}>
	${renderComponent($$result, "Fragment", Fragment, {}, { "default": () => renderTemplate`${markHTMLString(html)}` })}
	${caption && renderTemplate`<figcaption>${caption}</figcaption>`}
</figure>`;
});

const $$module1$5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	generateImage,
	generatePlaceholder,
	Image: $$Image
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$e = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/components/starfield.astro", { modules: [{ module: $$module1$5, specifier: "astro-eleventy-img", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$e = createAstro("/@fs/Users/ian2/paigepotterdesign/src/components/starfield.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$Starfield = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$e, $$props, $$slots);
  Astro2.self = $$Starfield;
  const widths = [450, 800, 1200, 1920];
  const sizes = "100vw";
  const { webp, avif, png } = generateImage("src/assets/render.png", {
    widths,
    formats: ["webp", "avif", "png"],
    outputDir: "public/assets/images/render",
    urlPath: "/assets/images/render"
  });
  const avifSrcset = avif.map(({ srcset }) => srcset).join(",");
  const webpSrcset = webp.map(({ srcset }) => srcset).join(",");
  const pngSrcset = png.map(({ srcset }) => srcset).join(",");
  return renderTemplate`${maybeRenderHead($$result)}<div>
  <picture>
    <source type="image/avif"${addAttribute(avifSrcset, "srcset")}${addAttribute(sizes, "sizes")}>
    <source type="image/webp"${addAttribute(webpSrcset, "srcset")}${addAttribute(sizes, "sizes")}>
    <source type="image/jpeg"${addAttribute(pngSrcset, "srcset")}${addAttribute(sizes, "sizes")}>
    <img${addAttribute(png[3].url, "src")}${addAttribute(png[3].width, "width")}${addAttribute(png[3].height, "height")} alt="Render" class="object-cover w-full h-screen lg:h-full">
  </picture>
</div>`;
});

const $$file$e = "/Users/ian2/paigepotterdesign/src/components/starfield.astro";
const $$url$e = undefined;

const $$module1$4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$e,
	default: $$Starfield,
	file: $$file$e,
	url: $$url$e
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$d = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/components/splash.astro", { modules: [{ module: $$module1$4, specifier: "~/components/starfield.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$d = createAstro("/@fs/Users/ian2/paigepotterdesign/src/components/splash.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$Splash = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$d, $$props, $$slots);
  Astro2.self = $$Splash;
  return renderTemplate`${maybeRenderHead($$result)}<section class="bg-black">
  ${renderComponent($$result, "Starfield", $$Starfield, {})}
</section>`;
});

const $$file$d = "/Users/ian2/paigepotterdesign/src/components/splash.astro";
const $$url$d = undefined;

const $$module4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$d,
	default: $$Splash,
	file: $$file$d,
	url: $$url$d
}, Symbol.toStringTag, { value: 'Module' }));

const sites = [
	{
		title: "PoliNations",
		image: "src/data/showcase/images/polinations.png",
		url: "https://polinations.com/"
	},
	{
		title: "Astro Docs",
		image: "src/data/showcase/images/astro-docs.png",
		url: "https://docs.astro.build/"
	},
	{
		title: "<div>RIOTS",
		image: "src/data/showcase/images/divriots.png",
		url: "https://divriots.com/"
	},
	{
		title: "Designcember",
		image: "src/data/showcase/images/designcember.png",
		url: "https://designcember.com/"
	},
	{
		title: "The Firebase Blog",
		image: "src/data/showcase/images/firebase-blog.png",
		url: "https://firebase.blog/"
	},
	{
		title: "Corset",
		image: "src/data/showcase/images/corset.png",
		url: "https://corset.dev/"
	}
];

const $$module2$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: sites
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$c = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/components/work-card.astro", { modules: [{ module: $$module1$5, specifier: "astro-eleventy-img", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$c = createAstro("/@fs/Users/ian2/paigepotterdesign/src/components/work-card.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$WorkCard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$c, $$props, $$slots);
  Astro2.self = $$WorkCard;
  const { title, url, image, index } = Astro2.props;
  const widths = [450, 800];
  const sizes = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw";
  const { webp, avif, png } = generateImage(image, {
    widths,
    formats: ["webp", "avif", "png"],
    outputDir: "public/assets/images/work",
    urlPath: "/assets/images/work"
  });
  const avifSrcset = avif.map(({ srcset }) => srcset).join(",");
  const webpSrcset = webp.map(({ srcset }) => srcset).join(",");
  const pngSrcset = png.map(({ srcset }) => srcset).join(",");
  return renderTemplate`${maybeRenderHead($$result)}<div${addAttribute(`flex ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"} border-2 border-white rounded-md hover:border-orange-400`, "class")}>
  <div class="w-full p-2">
    <h1 class="text-2xl font-bold">${title}</h1>
    <p class="text-lg">description</p>
    <a${addAttribute(url, "href")} class="btn btn-primary"> text</a>
  </div>
  <div class="w-full p-2">
    <a href="#">
      <picture>
        <source type="image/avif"${addAttribute(avifSrcset, "srcset")}${addAttribute(sizes, "sizes")}>
        <source type="image/webp"${addAttribute(webpSrcset, "srcset")}${addAttribute(sizes, "sizes")}>
        <source type="image/jpeg"${addAttribute(pngSrcset, "srcset")}${addAttribute(sizes, "sizes")}>
        <img${addAttribute(png[1].url, "src")}${addAttribute(png[1].width, "width")}${addAttribute(png[1].height, "height")} loading="lazy" decoding="async" onload="this.style.backgroundImage='none'"${addAttribute(`A screenshot of ${url}`, "alt")}>
      </picture>
    </a>
  </div>
</div>`;
});

const $$file$c = "/Users/ian2/paigepotterdesign/src/components/work-card.astro";
const $$url$c = undefined;

const $$module3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$c,
	default: $$WorkCard,
	file: $$file$c,
	url: $$url$c
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$b = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/components/work-showcase.astro", { modules: [{ module: $$module1$a, specifier: "~/components/content-section.astro", assert: {} }, { module: $$module2$3, specifier: "~/data/showcase/sites.json", assert: {} }, { module: $$module3, specifier: "./work-card.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$b = createAstro("/@fs/Users/ian2/paigepotterdesign/src/components/work-showcase.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$WorkShowcase = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$WorkShowcase;
  return renderTemplate`${renderComponent($$result, "ContentSection", $$ContentSection, { "title": "Showcase", "id": "showcase" }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<div class="max-w-6xl space-y-2">
    <div class="grid grid-cols-1 gap-4">
      ${sites.map(({ title, image, url }, index) => {
    return renderTemplate`${renderComponent($$result, "WorkCard", $$WorkCard, { "title": title, "image": image, "url": url, "index": index })}`;
  })}
    </div>
  </div>` })}`;
});

const $$file$b = "/Users/ian2/paigepotterdesign/src/components/work-showcase.astro";
const $$url$b = undefined;

const $$module1$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$b,
	default: $$WorkShowcase,
	file: $$file$b,
	url: $$url$b
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$a = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/components/header.astro", { modules: [{ module: $$module1$7, specifier: "astro-icon", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [{ type: "inline", value: `
  import MicroModal from "micromodal";

  const menuModalId = "menu-modal";

  const menu = document.querySelector(\`#\${menuModalId} ul\`);
  const openNavButton = document.querySelector("#open-nav-button");
  const closeNavButton = document.querySelector("#close-nav-button");

  const openMenu = () => {
    MicroModal.show(menuModalId, { disableScroll: true });
  };

  const closeMenu = () => {
    setTimeout(() => {
      MicroModal.close(menuModalId);
    }, 300);
  };

  openNavButton.addEventListener("click", openMenu);
  closeNavButton.addEventListener("click", closeMenu);

  menu.addEventListener("click", (event) => {
    if ((event.target as HTMLElement).tagName === "A") {
      // closeMenu();
    }
  });
` }] });
const $$Astro$a = createAstro("/@fs/Users/ian2/paigepotterdesign/src/components/header.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$Header = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$Header;
  const navItems = [
    { title: "ABOUT ME", url: "/about-me", color: "text-orange-400" },
    { title: "WORK", url: "/work", color: "text-red-400" },
    { title: "SERVICES", url: "/services", color: "text-blue-400" },
    { title: "DESIGN PROCESS", url: "/design-process", color: "text-green-400" },
    { title: "CONTACT", url: "/contact", color: "text-orange-400" }
  ];
  const {
    url: { pathname }
  } = Astro2;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<header id="page-header" class="z-10 flex items-center justify-between w-full pl-8 py-4 text-white border-b border-transparent absolute top-0 bottom-auto astro-ZJPJLUKE">
  <a class="flex items-center gap-3 hover:!text-default astro-ZJPJLUKE" href="/">
    <h1 class="astro-ZJPJLUKE">PAIGE POTTER</h1>
  </a>
  <div class="bg-default px-8 py-2 astro-ZJPJLUKE">
    <div class="flex items-center gap-6 astro-ZJPJLUKE">
      <nav class="hidden sm:block astro-ZJPJLUKE">
        <ul class="flex items-center gap-6 astro-ZJPJLUKE">
          ${navItems.map(({ title, url, color }) => {
    const selected = url === pathname;
    return renderTemplate`<li class="inline-block astro-ZJPJLUKE">
                  <a${addAttribute(`text-sm ${selected && `font-bold ${color}`} hover:font-bold astro-ZJPJLUKE`, "class")}${addAttribute(url, "href")}${addAttribute(title, "title")}>
                    ${title}
                  </a>
                </li>`;
  })}
        </ul>
      </nav>
      <button id="open-nav-button" type="button" class="btn sm:hidden astro-ZJPJLUKE" aria-label="Navigation">
        ${renderComponent($$result, "Icon", $$Icon, { "pack": "mdi", "name": "menu", "class": "h-8 astro-ZJPJLUKE" })}
      </button>
    </div>
    <div id="menu-modal" class="hidden modal astro-ZJPJLUKE" aria-hidden="true">
      <div class="fixed inset-0 px-8 py-6 bg-default astro-ZJPJLUKE">
        <div role="dialog" aria-modal="true" class="astro-ZJPJLUKE">
          <header class="text-right astro-ZJPJLUKE">
            <button id="close-nav-button" type="button" class="btn astro-ZJPJLUKE" aria-label="Close navigation">
              ${renderComponent($$result, "Icon", $$Icon, { "pack": "mdi", "name": "close", "class": "h-8 astro-ZJPJLUKE" })}
            </button>
          </header>
          <nav class="astro-ZJPJLUKE">
            <ul class="flex flex-col astro-ZJPJLUKE">
              ${navItems.map(({ title, url }) => renderTemplate`<li class="astro-ZJPJLUKE">
                    <a class="block py-4 text-xl text-center astro-ZJPJLUKE"${addAttribute(url, "href")}>
                      ${title}
                    </a>
                  </li>`)}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</header>



`;
});

const $$file$a = "/Users/ian2/paigepotterdesign/src/components/header.astro";
const $$url$a = undefined;

const $$module1$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$a,
	default: $$Header,
	file: $$file$a,
	url: $$url$a
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$9 = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/components/footer.astro", { modules: [{ module: $$module1$7, specifier: "astro-icon", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$9 = createAstro("/@fs/Users/ian2/paigepotterdesign/src/components/footer.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$Footer;
  const links = [
    {
      url: "https://astro.build/",
      description: "Contact Me",
      icon: "mdi:email"
    },
    {
      url: "https://github.com/withastro/astro",
      description: "My LinkedIn Profile",
      icon: "fa-brands:linkedin"
    },
    {
      url: "https://astro.build/chat",
      description: "My Instagram Profile",
      icon: "fa-brands:instagram"
    },
    {
      url: "/assets/paigePotterResume.pdf",
      description: "My Resume",
      icon: "mdi:file-account-outline"
    }
  ];
  return renderTemplate`${maybeRenderHead($$result)}<footer class="relative w-full flex items-center justify-center h-36">
  <ul class="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
    ${links.map((link) => renderTemplate`<li>
          <a class="flex items-center justify-center w-16 h-16 p-4 border-2 border-current rounded-full"${addAttribute(link.url, "href")} target="_blank" rel="noopener noreferrer">
            <span class="sr-only">${link.description}</span>
            ${renderComponent($$result, "Icon", $$Icon, { "class": "h-full", "name": link.icon })}
          </a>
        </li>`)}
  </ul>
</footer>`;
});

const $$file$9 = "/Users/ian2/paigepotterdesign/src/components/footer.astro";
const $$url$9 = undefined;

const $$module2$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$9,
	default: $$Footer,
	file: $$file$9,
	url: $$url$9
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$8 = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/layouts/BaseLayout.astro", { modules: [{ module: $$module1$2, specifier: "../components/header.astro", assert: {} }, { module: $$module2$2, specifier: "../components/footer.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$8 = createAstro("/@fs/Users/ian2/paigepotterdesign/src/layouts/BaseLayout.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$BaseLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { site } = Astro2;
  const image = new URL("social.jpg", site);
  const { title, description } = Astro2.props;
  return renderTemplate`<html lang="en" class="h-full motion-safe:scroll-smooth" data-theme="dark">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">

    <title>${title}</title>
    <meta name="description"${addAttribute(description, "content")}>

    <!-- fonts -->
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;800&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;800&display=swap" media="print" onload="this.media='all'">
    ${maybeRenderHead($$result)}<noscript>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;800&display=swap">
    </noscript>

    <!-- social media -->
    <meta property="og:title" content="Astro">
    <meta property="og:type" content="website">
    <meta property="og:description"${addAttribute(description, "content")}>
    <meta property="og:image"${addAttribute(image, "content")}>
    <meta property="og:url"${addAttribute(site, "content")}>
    <meta name="twitter:card" content="summary_large_image">
  ${renderHead($$result)}</head>
  <body class="h-full overflow-x-hidden text-base bg-default text-default selection:bg-secondary selection:text-white">
    ${renderComponent($$result, "Header", $$Header, {})}
    ${renderSlot($$result, $$slots["splash"])}
    <main class="px-8 py-32 space-y-24">
      ${renderSlot($$result, $$slots["default"])}
    </main>
    ${renderComponent($$result, "Footer", $$Footer, {})}
  </body></html>`;
});

const $$file$8 = "/Users/ian2/paigepotterdesign/src/layouts/BaseLayout.astro";
const $$url$8 = undefined;

const $$module2$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$8,
	default: $$BaseLayout,
	file: $$file$8,
	url: $$url$8
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$7 = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/pages/index.astro", { modules: [{ module: $$module1$6, specifier: "~/components/compatibility.astro", assert: {} }, { module: $$module2$5, specifier: "~/components/features.astro", assert: {} }, { module: $$module3$2, specifier: "~/components/intro.astro", assert: {} }, { module: $$module4, specifier: "../components/splash.astro", assert: {} }, { module: $$module1$3, specifier: "../components/work-showcase.astro", assert: {} }, { module: $$module2$1, specifier: "../layouts/BaseLayout.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$7 = createAstro("/@fs/Users/ian2/paigepotterdesign/src/pages/index.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$Index;
  const description = "Build fast websites, faster. Astro is a new kind of site builder for the modern web. Lightning-fast performance meets powerful developer experience.";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Landing Page", "description": description }, { "default": () => renderTemplate`${renderComponent($$result, "Intro", $$Intro, {})}${renderComponent($$result, "Features", $$Features, {})}${renderComponent($$result, "Compatibility", $$Compatibility, {})}${renderComponent($$result, "WorkShowcase", $$WorkShowcase, {})}`, "splash": () => renderTemplate`${renderComponent($$result, "Splash", $$Splash, { "slot": "splash" })}` })}`;
});

const $$file$7 = "/Users/ian2/paigepotterdesign/src/pages/index.astro";
const $$url$7 = "";

const _page1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$7,
	default: $$Index,
	file: $$file$7,
	url: $$url$7
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$6 = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/pages/design-process.astro", { modules: [{ module: $$module2$1, specifier: "../layouts/BaseLayout.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$6 = createAstro("/@fs/Users/ian2/paigepotterdesign/src/pages/design-process.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$DesignProcess = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$DesignProcess;
  const description = "Design Process";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Design Process", "description": description }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<div>Design Process</div>` })}`;
});

const $$file$6 = "/Users/ian2/paigepotterdesign/src/pages/design-process.astro";
const $$url$6 = "/design-process";

const _page2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$6,
	default: $$DesignProcess,
	file: $$file$6,
	url: $$url$6
}, Symbol.toStringTag, { value: 'Module' }));

const html = "<p>Lorem <em>ipsum</em> <code>dolor</code> sit amet, consectetur adipiscing elit. Aliquam scelerisque erat risus, non pellentesque felis auctor vitae. Suspendisse in magna at mauris ornare semper. Integer tempus risus eu felis gravida volutpat. Integer condimentum orci diam, eu consequat neque dignissim sit amet. In tempor ac urna sit amet varius. Cras vitae faucibus libero, non ultricies ipsum. Ut blandit nisl ac viverra ultricies. Mauris odio felis, feugiat in lectus a, vestibulum faucibus justo. Integer facilisis quam in quam venenatis, in pulvinar mauris blandit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Mauris non consectetur turpis. Curabitur non diam sit amet est auctor suscipit id nec diam.</p>\n<p>Nulla tellus magna, lacinia et quam ut, mattis convallis nisi. Ut cursus tincidunt risus scelerisque vulputate. Aenean condimentum vestibulum felis at tincidunt. Integer cursus ipsum libero, in mattis quam facilisis ac. Vestibulum non tortor leo. Donec elit odio, sodales nec porttitor non, bibendum vitae urna. Sed at hendrerit neque. Aenean blandit eleifend hendrerit. Morbi feugiat risus ac erat congue condimentum. Phasellus consectetur purus imperdiet eros semper venenatis. Integer imperdiet id purus rutrum facilisis. Vestibulum maximus mattis leo, vitae congue justo volutpat quis.</p>\n<p>Aliquam euismod lobortis sollicitudin. Curabitur scelerisque porttitor dolor eu ullamcorper. Etiam sem justo, suscipit non nibh non, lobortis congue mi. Sed cursus, turpis vel egestas tempus, ex leo ultrices erat, sit amet aliquet lacus ex ac metus. Cras vitae nulla urna. Quisque interdum, elit posuere pretium semper, augue dui consectetur massa, tincidunt lobortis mauris erat non nunc. Proin condimentum ante nec ligula porta rutrum nec vel tortor. Vestibulum sit amet felis nec purus ultricies consectetur nec at enim. Morbi nisi ligula, laoreet eget lorem ac, ornare dignissim diam. Quisque sem erat, consequat vitae aliquam et, convallis in nisi. Maecenas eget porttitor nisi. Pellentesque libero mi, finibus in varius vitae, ultricies at eros. Curabitur sit amet interdum sapien, non lobortis nisl. Donec ante purus, condimentum sed elit sed, accumsan semper est.</p>";

				const frontmatter = {"title":"About Me","layout":"../layouts/BaseLayout.astro"};
				const file = "/Users/ian2/paigepotterdesign/src/pages/about-me.md";
				const url = "/about-me";
				function rawContent() {
					return "\nLorem _ipsum_ `dolor` sit amet, consectetur adipiscing elit. Aliquam scelerisque erat risus, non pellentesque felis auctor vitae. Suspendisse in magna at mauris ornare semper. Integer tempus risus eu felis gravida volutpat. Integer condimentum orci diam, eu consequat neque dignissim sit amet. In tempor ac urna sit amet varius. Cras vitae faucibus libero, non ultricies ipsum. Ut blandit nisl ac viverra ultricies. Mauris odio felis, feugiat in lectus a, vestibulum faucibus justo. Integer facilisis quam in quam venenatis, in pulvinar mauris blandit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Mauris non consectetur turpis. Curabitur non diam sit amet est auctor suscipit id nec diam.\n\nNulla tellus magna, lacinia et quam ut, mattis convallis nisi. Ut cursus tincidunt risus scelerisque vulputate. Aenean condimentum vestibulum felis at tincidunt. Integer cursus ipsum libero, in mattis quam facilisis ac. Vestibulum non tortor leo. Donec elit odio, sodales nec porttitor non, bibendum vitae urna. Sed at hendrerit neque. Aenean blandit eleifend hendrerit. Morbi feugiat risus ac erat congue condimentum. Phasellus consectetur purus imperdiet eros semper venenatis. Integer imperdiet id purus rutrum facilisis. Vestibulum maximus mattis leo, vitae congue justo volutpat quis.\n\nAliquam euismod lobortis sollicitudin. Curabitur scelerisque porttitor dolor eu ullamcorper. Etiam sem justo, suscipit non nibh non, lobortis congue mi. Sed cursus, turpis vel egestas tempus, ex leo ultrices erat, sit amet aliquet lacus ex ac metus. Cras vitae nulla urna. Quisque interdum, elit posuere pretium semper, augue dui consectetur massa, tincidunt lobortis mauris erat non nunc. Proin condimentum ante nec ligula porta rutrum nec vel tortor. Vestibulum sit amet felis nec purus ultricies consectetur nec at enim. Morbi nisi ligula, laoreet eget lorem ac, ornare dignissim diam. Quisque sem erat, consequat vitae aliquam et, convallis in nisi. Maecenas eget porttitor nisi. Pellentesque libero mi, finibus in varius vitae, ultricies at eros. Curabitur sit amet interdum sapien, non lobortis nisl. Donec ante purus, condimentum sed elit sed, accumsan semper est.\n";
				}
				function compiledContent() {
					return html;
				}
				function getHeadings() {
					return [];
				}
				function getHeaders() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings();
				}				async function Content() {
					const { layout, ...content } = frontmatter;
					content.file = file;
					content.url = url;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					const contentFragment = createVNode(Fragment, { 'set:html': html });
					return createVNode($$BaseLayout, {
									content,
									frontmatter: content,
									headings: getHeadings(),
									rawContent,
									compiledContent,
									'server:root': true,
									children: contentFragment
								});
				}

const _page3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	frontmatter,
	file,
	url,
	rawContent,
	compiledContent,
	getHeadings,
	getHeaders,
	Content,
	default: Content
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$5 = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/pages/services.astro", { modules: [{ module: $$module2$1, specifier: "../layouts/BaseLayout.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$5 = createAstro("/@fs/Users/ian2/paigepotterdesign/src/pages/services.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$Services = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Services;
  const description = "Services";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Services", "description": description }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<div>services</div>` })}`;
});

const $$file$5 = "/Users/ian2/paigepotterdesign/src/pages/services.astro";
const $$url$5 = "/services";

const _page4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$5,
	default: $$Services,
	file: $$file$5,
	url: $$url$5
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$4 = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/components/contact-information.astro", { modules: [{ module: $$module1$7, specifier: "astro-icon", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$4 = createAstro("/@fs/Users/ian2/paigepotterdesign/src/components/contact-information.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$ContactInformation = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$ContactInformation;
  const email = "paigep222@gmail.com";
  const phone = "440-867-3615";
  const contacts = [
    {
      icon: "mdi:email",
      value: email
    },
    {
      icon: "mdi:phone",
      value: phone
    },
    {
      icon: "mdi:map-marker",
      value: "Columbus, OH"
    },
    {
      icon: "fa-brands:linkedin",
      value: "LinkedIn link"
    },
    {
      icon: "fa-brands:instagram",
      value: "Instagram link"
    }
  ];
  return renderTemplate`${maybeRenderHead($$result)}<div class="w-full bg-zinc-200 bg-opacity-10 p-2 rounded-md">
  <h2 class="text-lg pb-5">Contact Information</h2>
  <ul class="grid gap-4">
    ${contacts.map((contact) => renderTemplate`<li class="flex items-center flex-wrap">
          ${renderComponent($$result, "Icon", $$Icon, { "name": contact.icon, "class": "w-4 h-4 mr-2 text-orange-400" })}
          <span class="text-sm">${contact.value}</span>
        </li>`)}
  </ul>
</div>`;
});

const $$file$4 = "/Users/ian2/paigepotterdesign/src/components/contact-information.astro";
const $$url$4 = undefined;

const $$module1$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$4,
	default: $$ContactInformation,
	file: $$file$4,
	url: $$url$4
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$3 = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/components/form-checkbox.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$3 = createAstro("/@fs/Users/ian2/paigepotterdesign/src/components/form-checkbox.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$FormCheckbox = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$FormCheckbox;
  const services = [
    "Interior Design",
    "Set Design",
    "Production Assistant",
    "Decorator"
  ];
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<div class="astro-RB6QD4HO">
  <fieldset class="astro-RB6QD4HO">
    <legend class="text-sm astro-RB6QD4HO"> What are you interested in?</legend>
    <div class="flex flex-wrap mb-3 astro-RB6QD4HO">
      ${services.map((service, index) => {
    return renderTemplate`<div class="flex items-center mr-3 py-2 last:mr-0 astro-RB6QD4HO">
              <input class="mr-2 accent-orange-400 rounded-full service-checkbox astro-RB6QD4HO" type="checkbox"${addAttribute(service, "id")} name="interests"${addAttribute(service, "value")}>
              <label class="service-label border-b-2 border-solid border-zinc-800 astro-RB6QD4HO"${addAttribute(service, "for")}>
                ${service}
              </label>
            </div>`;
  })}
    </div>
  </fieldset>
</div>

`;
});

const $$file$3 = "/Users/ian2/paigepotterdesign/src/components/form-checkbox.astro";
const $$url$3 = undefined;

const $$module2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$3,
	default: $$FormCheckbox,
	file: $$file$3,
	url: $$url$3
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$2 = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/components/contact-form.astro", { modules: [{ module: $$module1$1, specifier: "./contact-information.astro", assert: {} }, { module: $$module2, specifier: "./form-checkbox.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$2 = createAstro("/@fs/Users/ian2/paigepotterdesign/src/components/contact-form.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$ContactForm = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$ContactForm;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<section class="astro-AXYADK5M">
  <div class="rounded-md bg-zinc-800 p-4 w-full astro-AXYADK5M">
    <div class="grid grid-cols-1 md:grid-cols-[1fr_2fr] astro-AXYADK5M">
      ${renderComponent($$result, "ContactInformation", $$ContactInformation, { "class": "astro-AXYADK5M" })}
      <div class="p-4 pr-0 w-full astro-AXYADK5M">
        <form autocomplete="off" data-netlify="true" name="contact" class="astro-AXYADK5M">
          <div class="mb-2 astro-AXYADK5M">
            <label class="block text-sm astro-AXYADK5M" for="name">Name</label>
            <input class="focus:outline-none py-2 w-full bg-transparent border-b-2 border-solid border-zinc-800 focus:border-orange-400 astro-AXYADK5M" type="text" id="name" name="name" placeholder="Your name">
          </div>
          <div class="mb-2 astro-AXYADK5M">
            <label class="block text-sm astro-AXYADK5M" for="email">Email</label>
            <input class="focus:outline-none py-2 w-full bg-transparent border-b-2 border-solid border-zinc-800 focus:border-orange-400 astro-AXYADK5M" type="email" id="email" name="email" placeholder="Your email">
          </div>
          ${renderComponent($$result, "FormCheckbox", $$FormCheckbox, { "class": "astro-AXYADK5M" })}
          <div class="mb-2 astro-AXYADK5M">
            <label class="block text-sm astro-AXYADK5M" for="message">Message</label>
            <textarea class="focus:outline-none py-2 w-full resize-none bg-transparent border-b-2 border-solid border-zinc-800 focus:border-orange-400 astro-AXYADK5M" id="message" name="message" placeholder="Your message" rows="3"></textarea>
          </div>
          <div class="flex justify-center astro-AXYADK5M">
            <button class="py-1 px-4 w-full border-b-2 border-solid border-zinc-800 hover:bg-orange-400 rounded-md ease-in-out duration-150 astro-AXYADK5M" type="submit">Send
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>

`;
});

const $$file$2 = "/Users/ian2/paigepotterdesign/src/components/contact-form.astro";
const $$url$2 = undefined;

const $$module1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$2,
	default: $$ContactForm,
	file: $$file$2,
	url: $$url$2
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$1 = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/pages/contact.astro", { modules: [{ module: $$module1, specifier: "../components/contact-form.astro", assert: {} }, { module: $$module2$1, specifier: "../layouts/BaseLayout.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$1 = createAstro("/@fs/Users/ian2/paigepotterdesign/src/pages/contact.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$Contact = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Contact;
  const description = "Contact";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Contact Me", "description": description }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<h1 class="text-center text-3xl">Contact Me</h1>${renderComponent($$result, "ContactForm", $$ContactForm, {})}` })}`;
});

const $$file$1 = "/Users/ian2/paigepotterdesign/src/pages/contact.astro";
const $$url$1 = "/contact";

const _page5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$1,
	default: $$Contact,
	file: $$file$1,
	url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata = createMetadata("/@fs/Users/ian2/paigepotterdesign/src/pages/work.astro", { modules: [{ module: $$module1$3, specifier: "../components/work-showcase.astro", assert: {} }, { module: $$module2$1, specifier: "../layouts/BaseLayout.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro = createAstro("/@fs/Users/ian2/paigepotterdesign/src/pages/work.astro", "https://astro-moon-landing.netlify.app/", "file:///Users/ian2/paigepotterdesign/");
const $$Work = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Work;
  const description = "Work";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Work", "description": description }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<h1 class="text-center text-3xl">Work</h1>${renderComponent($$result, "WorkShowcase", $$WorkShowcase, {})}` })}`;
});

const $$file = "/Users/ian2/paigepotterdesign/src/pages/work.astro";
const $$url = "/work";

const _page6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata,
	default: $$Work,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const pageMap = new Map([['node_modules/@astrojs/image/dist/endpoints/prod.js', _page0],['src/pages/index.astro', _page1],['src/pages/design-process.astro', _page2],['src/pages/about-me.md', _page3],['src/pages/services.astro', _page4],['src/pages/contact.astro', _page5],['src/pages/work.astro', _page6],]);
const renderers = [Object.assign({"name":"astro:jsx","serverEntrypoint":"astro/jsx/server.js","jsxImportSource":"astro"}, { ssr: server_default }),Object.assign({"name":"@astrojs/react","clientEntrypoint":"@astrojs/react/client.js","serverEntrypoint":"@astrojs/react/server.js","jsxImportSource":"react"}, { ssr: _renderer1 }),];

if (typeof process !== "undefined") {
  if (process.argv.includes("--verbose")) ; else if (process.argv.includes("--silent")) ; else ;
}

const SCRIPT_EXTENSIONS = /* @__PURE__ */ new Set([".js", ".ts"]);
new RegExp(
  `\\.(${Array.from(SCRIPT_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

const STYLE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".css",
  ".pcss",
  ".postcss",
  ".scss",
  ".sass",
  ".styl",
  ".stylus",
  ".less"
]);
new RegExp(
  `\\.(${Array.from(STYLE_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return segment[0].spread ? `/:${segment[0].content.slice(3)}(.*)?` : "/" + segment.map((part) => {
      if (part)
        return part.dynamic ? `:${part.content}` : part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return toPath;
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  return {
    ...serializedManifest,
    assets,
    routes
  };
}

const _manifest = Object.assign(deserializeManifest({"adapterName":"@astrojs/netlify/functions","routes":[{"file":"","links":[],"scripts":[],"routeData":{"type":"endpoint","route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/@astrojs/image/dist/endpoints/prod.js","pathname":"/_image","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/about-me-contact-design-process-index-services-work.1686106c.css"],"scripts":[{"type":"external","value":"hoisted.3c0ea6f2.js"}],"routeData":{"route":"/","type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/about-me-contact-design-process-index-services-work.1686106c.css"],"scripts":[{"type":"external","value":"hoisted.3c0ea6f2.js"}],"routeData":{"route":"/design-process","type":"page","pattern":"^\\/design-process\\/?$","segments":[[{"content":"design-process","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/design-process.astro","pathname":"/design-process","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/about-me-contact-design-process-index-services-work.1686106c.css"],"scripts":[{"type":"external","value":"hoisted.3c0ea6f2.js"}],"routeData":{"route":"/about-me","type":"page","pattern":"^\\/about-me\\/?$","segments":[[{"content":"about-me","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about-me.md","pathname":"/about-me","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/about-me-contact-design-process-index-services-work.1686106c.css"],"scripts":[{"type":"external","value":"hoisted.3c0ea6f2.js"}],"routeData":{"route":"/services","type":"page","pattern":"^\\/services\\/?$","segments":[[{"content":"services","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/services.astro","pathname":"/services","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/contact.e32b8d7d.css","assets/about-me-contact-design-process-index-services-work.1686106c.css"],"scripts":[{"type":"external","value":"hoisted.3c0ea6f2.js"}],"routeData":{"route":"/contact","type":"page","pattern":"^\\/contact\\/?$","segments":[[{"content":"contact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contact.astro","pathname":"/contact","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/about-me-contact-design-process-index-services-work.1686106c.css"],"scripts":[{"type":"external","value":"hoisted.3c0ea6f2.js"}],"routeData":{"route":"/work","type":"page","pattern":"^\\/work\\/?$","segments":[[{"content":"work","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/work.astro","pathname":"/work","_meta":{"trailingSlash":"ignore"}}}],"site":"https://astro-moon-landing.netlify.app/","base":"/","markdown":{"drafts":false,"syntaxHighlight":"shiki","shikiConfig":{"langs":[],"theme":"github-dark","wrap":false},"remarkPlugins":[],"rehypePlugins":[],"isAstroFlavoredMd":false},"pageMap":null,"renderers":[],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.mjs","@astrojs/react/client.js":"client.4573567e.js","/astro/hoisted.js?q=0":"hoisted.3c0ea6f2.js","astro:scripts/before-hydration.js":"data:text/javascript;charset=utf-8,//[no before-hydration script]"},"assets":["/assets/about-me-contact-design-process-index-services-work.1686106c.css","/assets/contact.e32b8d7d.css","/client.4573567e.js","/favicon.svg","/hoisted.3c0ea6f2.js","/social.jpg","/assets/paigePotterResume.pdf","/assets/images/astronaut/tA0n6iDWGQ-450.png","/assets/images/astronaut/tA0n6iDWGQ-800.png","/assets/images/render/tA0n6iDWGQ-1200.avif","/assets/images/render/tA0n6iDWGQ-1200.png","/assets/images/render/tA0n6iDWGQ-1200.webp","/assets/images/render/tA0n6iDWGQ-1920.avif","/assets/images/render/tA0n6iDWGQ-1920.png","/assets/images/render/tA0n6iDWGQ-1920.webp","/assets/images/render/tA0n6iDWGQ-450.avif","/assets/images/render/tA0n6iDWGQ-450.png","/assets/images/render/tA0n6iDWGQ-450.webp","/assets/images/render/tA0n6iDWGQ-800.avif","/assets/images/render/tA0n6iDWGQ-800.png","/assets/images/render/tA0n6iDWGQ-800.webp","/assets/images/work/VBzvsHZFNn-450.avif","/assets/images/work/VBzvsHZFNn-450.png","/assets/images/work/VBzvsHZFNn-450.webp","/assets/images/work/VBzvsHZFNn-800.avif","/assets/images/work/VBzvsHZFNn-800.png","/assets/images/work/VBzvsHZFNn-800.webp","/assets/images/work/XL4LjefiVn-450.avif","/assets/images/work/XL4LjefiVn-450.png","/assets/images/work/XL4LjefiVn-450.webp","/assets/images/work/XL4LjefiVn-800.avif","/assets/images/work/XL4LjefiVn-800.png","/assets/images/work/XL4LjefiVn-800.webp","/assets/images/work/_IPbM6qIYI-450.avif","/assets/images/work/_IPbM6qIYI-450.png","/assets/images/work/_IPbM6qIYI-450.webp","/assets/images/work/_IPbM6qIYI-800.avif","/assets/images/work/_IPbM6qIYI-800.png","/assets/images/work/_IPbM6qIYI-800.webp","/assets/images/work/g9vYzfI0uj-450.avif","/assets/images/work/g9vYzfI0uj-450.png","/assets/images/work/g9vYzfI0uj-450.webp","/assets/images/work/g9vYzfI0uj-800.avif","/assets/images/work/g9vYzfI0uj-800.png","/assets/images/work/g9vYzfI0uj-800.webp","/assets/images/work/kZtoOWPTn5-450.avif","/assets/images/work/kZtoOWPTn5-450.png","/assets/images/work/kZtoOWPTn5-450.webp","/assets/images/work/kZtoOWPTn5-800.avif","/assets/images/work/kZtoOWPTn5-800.png","/assets/images/work/kZtoOWPTn5-800.webp","/assets/images/work/yA2q_yIsp6-450.avif","/assets/images/work/yA2q_yIsp6-450.png","/assets/images/work/yA2q_yIsp6-450.webp","/assets/images/work/yA2q_yIsp6-800.avif","/assets/images/work/yA2q_yIsp6-800.png","/assets/images/work/yA2q_yIsp6-800.webp","/assets/images/showcase/VBzvsHZFNn-450.avif","/assets/images/showcase/VBzvsHZFNn-450.png","/assets/images/showcase/VBzvsHZFNn-450.webp","/assets/images/showcase/VBzvsHZFNn-800.avif","/assets/images/showcase/VBzvsHZFNn-800.png","/assets/images/showcase/VBzvsHZFNn-800.webp","/assets/images/showcase/XL4LjefiVn-450.avif","/assets/images/showcase/XL4LjefiVn-450.png","/assets/images/showcase/XL4LjefiVn-450.webp","/assets/images/showcase/XL4LjefiVn-800.avif","/assets/images/showcase/XL4LjefiVn-800.png","/assets/images/showcase/XL4LjefiVn-800.webp","/assets/images/showcase/_IPbM6qIYI-450.avif","/assets/images/showcase/_IPbM6qIYI-450.png","/assets/images/showcase/_IPbM6qIYI-450.webp","/assets/images/showcase/_IPbM6qIYI-800.avif","/assets/images/showcase/_IPbM6qIYI-800.png","/assets/images/showcase/_IPbM6qIYI-800.webp","/assets/images/showcase/g9vYzfI0uj-450.avif","/assets/images/showcase/g9vYzfI0uj-450.png","/assets/images/showcase/g9vYzfI0uj-450.webp","/assets/images/showcase/g9vYzfI0uj-800.avif","/assets/images/showcase/g9vYzfI0uj-800.png","/assets/images/showcase/g9vYzfI0uj-800.webp","/assets/images/showcase/kZtoOWPTn5-450.avif","/assets/images/showcase/kZtoOWPTn5-450.png","/assets/images/showcase/kZtoOWPTn5-450.webp","/assets/images/showcase/kZtoOWPTn5-800.avif","/assets/images/showcase/kZtoOWPTn5-800.png","/assets/images/showcase/kZtoOWPTn5-800.webp","/assets/images/showcase/yA2q_yIsp6-450.avif","/assets/images/showcase/yA2q_yIsp6-450.png","/assets/images/showcase/yA2q_yIsp6-450.webp","/assets/images/showcase/yA2q_yIsp6-800.avif","/assets/images/showcase/yA2q_yIsp6-800.png","/assets/images/showcase/yA2q_yIsp6-800.webp"]}), {
	pageMap: pageMap,
	renderers: renderers
});
const _args = {};

const _exports = adapter.createExports(_manifest, _args);
const handler = _exports['handler'];

const _start = 'start';
if(_start in adapter) {
	adapter[_start](_manifest, _args);
}

export { handler };
