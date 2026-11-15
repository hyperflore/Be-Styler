BThemer.definePlugin({
    id: "compactServers",
    name: "Compact Server List",
    description: "Shrinks the server column so it takes less room.",
    author: "Be Themer",
    version: "1.1.0",

    settings: {
        scale: { type: "range", label: "Size", min: 55, max: 100, unit: "%", default: 80 },
    },

    css: s => `nav[class*="guilds_"] { zoom: ${s.scale / 100}; }`,
});
