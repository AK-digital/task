const config = {
    plugins: {
        "@tailwindcss/postcss": {},
        "postcss-remove-rules": {
            rulesToRemove: {
                "img, video": "height",
            },
        },
    },
};
export default config;
