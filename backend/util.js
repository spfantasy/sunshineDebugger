import JSON5 from "json5";
export function formatString(template, obj, nullElement) {
    if (template == null) {return template;}
    return template.replace(/{([^}]+)}/g, (match, path) => {
        const keys = path.split('.');
        let value = obj;
        for (let key of keys) {
            value = value[key];
            if (value === undefined) {
                return nullElement; // 如果路径不存在，替换为nullElement
            }
        }
        return value;
    });
}

export function evalString(template, ctx) {
    const safeEval = new Function('ctx', `return ${template}`);
    return safeEval(ctx);
}