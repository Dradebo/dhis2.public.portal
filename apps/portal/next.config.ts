import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	reactStrictMode: false,
	basePath: process.env.CONTEXT_PATH ?? "",

	images: {
		dangerouslyAllowSVG: true,
		contentDispositionType: "inline",
		remotePatterns: [
			{
				hostname: "*",
			},
		],
	},
	output: "standalone",
	outputFileTracingRoot: path.join(path.resolve(), "../../"),
	turbopack: {
		rules: {
			"*.svg": {
				loaders: ["@svgr/webpack"],
				as: "*.js",
			},
		},
	},
	experimental: {},
	serverExternalPackages: ["canvas", "@google/earthengine"],
	webpack(config) {
		// Grab the existing rule that handles SVG imports
		const fileLoaderRule = config.module.rules.find((rule: any) =>
			rule.test?.test?.(".svg"),
		);
		config.module.rules.push(
			// Reapply the existing rule, but only for svg imports ending in ?url
			{
				...fileLoaderRule,
				test: /\.svg$/i,
				resourceQuery: /url/, // *.svg?url
			},
			// Convert all other *.svg imports to React components
			{
				test: /\.svg$/i,
				issuer: fileLoaderRule.issuer,
				resourceQuery: {
					not: [...fileLoaderRule.resourceQuery.not, /url/],
				}, // exclude if *.svg?url
				use: ["@svgr/webpack"],
			},
		);

		// Modify the file loader rule to ignore *.svg, since we have it handled now.
		fileLoaderRule.exclude = /\.svg$/i;
		config.externals.push({ canvas: "commonjs canvas" });
		return config;
	},
	transpilePackages: ["@packages/shared"],
};

export default nextConfig;
