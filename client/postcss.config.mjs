const config = {
    plugins: {
        "@tailwindcss/postcss": {},
        "postcss-remove-rules": {
            rulesToRemove: {
                "img, video": "height",
                "html, :host": "line-height",
            },
        },
    },
};
export default config;
