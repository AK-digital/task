const config = {
    plugins: {
        "@tailwindcss/postcss": {},
        "postcss-remove-rules": {
            rulesToRemove: {
                "img, video": "height",
                "img, video": "max-width",
                "html, :host": "line-height",
            },
        },
    },
};
export default config;
