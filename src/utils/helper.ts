export { formatQuery, questionOptionString, sortTag, tagTitle };

const formatQuery = <T = Primitive>(
    url: string,
    params: T | undefined,
): string => {
    if (!params) return encodeURI(url);
    let query = "";
    for (const k in params) {
        if (typeof params[k] === "undefined" || params[k] == null) continue;
        if (typeof params[k] === "object") {
            for (const v of Object.values(params[k]!)) {
                query += `&${k}=${v}`;
            }
        } else {
            query += `&${k}=${
                typeof params[k] === "boolean" ? (params[k] ? 1 : 0) : params[k]
            }`;
        }
    }
    query = encodeURI(`${url}?${query}`);
    return query;
};

const sortTag = (a: Tag, b: Tag): number => {
    const tag_weight: Record<Tag, number> = {
        J: 1,
        W: 2,
        JW: 3,
    };
    return tag_weight[a] - tag_weight[b];
};

const tagTitle = (a: Tag): string => {
    const tag_weight: Record<Tag, string> = {
        J: "Jamb",
        W: "Waec",
        JW: "Jamb & Waec",
    };
    return tag_weight[a];
};

const questionOptionString = (a: QuestionOption): string => {
    const tag_weight: Record<QuestionOption, string> = {
        option_1: "Option A",
        option_2: "Option B",
        option_3: "Option C",
        option_4: "Option D",
    };

    return tag_weight[a];
};
